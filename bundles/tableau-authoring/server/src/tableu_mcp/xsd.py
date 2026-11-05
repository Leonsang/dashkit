"""Tableau's own workbook schema, read from the local Tableau Desktop install (offline validation).

Tableau Desktop ships its file-format schemas inside ``bin/res/tablangres.rcc`` (a Qt resource file):
``TQRC_FILEFORMAT_TWB_XSD`` (workbooks), ``..._TDS_XSD`` (data sources), plus the ``user`` and ``xml``
namespace schemas they import. The TWB schema is conditional: blocks between ``<!--?IF Flag -->``,
``<!--?ELSE -->`` and ``<!--?END -->`` (``!Flag`` negates) apply only when the workbook's
``<document-format-change-manifest>`` lists that feature. That is why a new feature (ParameterAction,
NavigationAction...) needs its manifest entry: without it the schema branch that allows the element is off.

Nothing of Tableau's is redistributed: the schema is extracted on each machine from its own install, into
~/.tableu/xsd/<build>/, and compiled per set of features.
"""

from __future__ import annotations

import re
import struct
import zlib
from functools import lru_cache
from pathlib import Path

from lxml import etree

USER_NS = "http://www.tableausoftware.com/xml/user"
FCP = re.compile(r"^_\.fcp\.([^.]+)\.(true|false)\.\.\.(.*)$")
DIRECTIVE = re.compile(r"<!--\?(IF|ELSE|END)\s*([^>]*?)\s*-->")
CACHE = Path.home() / ".tableu" / "xsd"
WANTED = {"TQRC_FILEFORMAT_TWB_XSD": "twb.raw.xsd", "TQRC_FILEFORMAT_TDS_XSD": "tds.raw.xsd",
          "TQRC_FILEFORMAT_USER_XSD": "user.xsd", "TQRC_FILEFORMAT_XML_XSD": "xml.xsd"}


def _install_dirs() -> list[Path]:
    roots = [Path("C:/Program Files/Tableau"), Path("/Applications")]
    out = []
    for r in roots:
        if r.exists():
            out += sorted(r.glob("Tableau 20*"), reverse=True)
    return out


def find_rcc(install: str | Path | None = None) -> Path:
    cands = [Path(install)] if install else _install_dirs()
    for d in cands:
        for p in (d / "bin" / "res" / "tablangres.rcc", d / "Contents" / "Resources" / "tablangres.rcc"):
            if p.exists():
                return p
    raise FileNotFoundError("Tableau Desktop's tablangres.rcc not found (is Tableau Desktop installed?)")


def _read_rcc(path: Path, wanted: set[str]) -> dict[str, bytes]:
    """Read the named entries of a Qt .rcc (format versions 1-3, zlib or uncompressed)."""
    b = path.read_bytes()
    if b[:4] != b"qres":
        raise ValueError(f"{path} is not a Qt resource file")
    version, tree, data, names = struct.unpack(">IIII", b[4:20])
    entry = 14 if version == 1 else 22
    out: dict[str, bytes] = {}

    def name(off):
        n = struct.unpack(">H", b[names + off:names + off + 2])[0]
        return b[names + off + 6:names + off + 6 + 2 * n].decode("utf-16-be")

    def walk(i):
        e = tree + i * entry
        noff, flags = struct.unpack(">IH", b[e:e + 6])
        if flags & 2:
            count, first = struct.unpack(">II", b[e + 6:e + 14])
            for k in range(count):
                walk(first + k)
            return
        nm = name(noff)
        if nm not in wanted:
            return
        doff = struct.unpack(">I", b[e + 10:e + 14])[0]
        size = struct.unpack(">I", b[data + doff:data + doff + 4])[0]
        raw = b[data + doff + 4:data + doff + 4 + size]
        out[nm] = zlib.decompress(raw[4:]) if flags & 1 else raw

    walk(0)
    return out


@lru_cache(maxsize=1)
def schema_dir(install: str | None = None) -> Path:
    rcc = find_rcc(install)
    build = rcc.parents[2].name.replace(" ", "_")
    d = CACHE / build
    if not all((d / f).exists() for f in WANTED.values()):
        d.mkdir(parents=True, exist_ok=True)
        for res, data in _read_rcc(rcc, set(WANTED)).items():
            (d / WANTED[res]).write_bytes(data)
    return d


def features_in(xsd_text: str) -> list[str]:
    return sorted({m.group(2).lstrip("!") for m in DIRECTIVE.finditer(xsd_text) if m.group(1) == "IF"})


def resolve(xsd_text: str, features: set[str]) -> str:
    """Apply the ?IF/?ELSE/?END blocks for the given features (nested blocks supported)."""
    out, stack, pos = [], [], 0  # stack of (active_before, branch_taken, cond)
    active = True
    for m in DIRECTIVE.finditer(xsd_text):
        if active:
            out.append(xsd_text[pos:m.start()])
        pos = m.end()
        kind, arg = m.group(1), m.group(2)
        if kind == "IF":
            neg = arg.startswith("!")
            cond = (arg.lstrip("!") in features) != neg
            stack.append((active, cond))
            active = active and cond
        elif kind == "ELSE":
            outer, cond = stack[-1]
            active = outer and not cond
        else:
            outer, _ = stack.pop()
            active = outer
    out.append(xsd_text[pos:])
    return "".join(out)


@lru_cache(maxsize=16)
def schema(features: frozenset[str], kind: str = "twb") -> etree.XMLSchema:
    d = schema_dir()
    text = (d / f"{kind}.raw.xsd").read_text(encoding="utf-8")
    text = resolve(text, set(features))
    text = text.replace(f'<xs:import namespace="{USER_NS}"/>',
                        f'<xs:import namespace="{USER_NS}" schemaLocation="user.xsd"/>')
    text = text.replace('<xs:import namespace="http://www.w3.org/XML/1998/namespace"/>',
                        '<xs:import namespace="http://www.w3.org/XML/1998/namespace" schemaLocation="xml.xsd"/>')
    doc = etree.fromstring(text.encode("utf-8"), base_url=(d / f"{kind}.xsd").as_uri())
    return etree.XMLSchema(doc)


# Format-upgrade flags: they change existing markup (sort -> computed-sort, mark class -> type, required
# worksheet number...), so they apply only when the workbook declares them. Every other flag only adds
# optional markup and is on in Desktop 2026.3's build: validating with those on and these off accepts every
# workbook Desktop accepts (its samples and tableu's validated ones) and rejects what its validator rejects.
# Derived on 2026-11-05 by scripts/xsd_baseline.py.
UPGRADE_FLAGS = {"ExplainData_AuthorControls", "ISO8601PeriodTypes", "MarkTypeAttribute", "ObjectModelExtractV2",
                 "SheetNumTstAddOnly", "SortTagCleanup", "DashboardAddInsAsExtensions"}


def baseline(xsd_text: str) -> set[str]:
    return set(features_in(xsd_text)) - UPGRADE_FLAGS


def manifest_features(root: etree._Element) -> set[str]:
    m = root.find("document-format-change-manifest")
    feats = set()
    for c in (m if m is not None else []):
        if isinstance(c.tag, str):
            f = FCP.match(c.tag)
            if f is None:
                feats.add(c.tag)
            elif f.group(2) == "true":
                feats.add(f.group(3))
    return feats


def prepare(root: etree._Element) -> etree._Element:
    """Resolve feature-flagged names as Desktop does before validating: _.fcp.Flag.true...name -> name;
    the .false... variants are dropped."""
    import copy  # noqa: PLC0415

    root = copy.deepcopy(root)
    for el in list(root.iter()):
        if not isinstance(el.tag, str):
            continue
        m = FCP.match(el.tag)
        if m:
            if m.group(2) == "true":
                el.tag = m.group(3)
            else:
                el.getparent().remove(el)
                continue
        for a in list(el.attrib):
            m = FCP.match(a)
            if m:
                v = el.attrib.pop(a)
                if m.group(2) == "true":
                    el.set(m.group(3), v)
    return root


def validate(root: etree._Element, kind: str = "twb") -> dict:
    """Validate against Tableau's schema for the features this workbook declares. Offline."""
    feats = manifest_features(root)
    raw = (schema_dir() / f"{kind}.raw.xsd").read_text(encoding="utf-8")
    s = schema(frozenset(feats | baseline(raw)), kind)
    ok = s.validate(prepare(root))
    issues = [f"{e.path}: {e.message}" for e in s.error_log]
    return {"valid": ok, "issues": issues, "features": sorted(feats), "schema": "tableau-xsd-offline"}


XS = "{http://www.w3.org/2001/XMLSchema}"


def vocabulary(kind: str = "twb") -> dict:
    """Every element the schema defines: its attributes (type, required, enumerated values), the elements
    it can contain, the contexts (parent element or named group) it appears in, and the feature flags that
    gate it. Built from the local Tableau install's XSD."""
    raw = (schema_dir() / f"{kind}.raw.xsd").read_text(encoding="utf-8")
    # feature-flag stack per line of the raw schema
    flags_at: list[tuple[str, ...]] = []
    stack: list[str] = []
    for line in raw.splitlines():
        flags_at.append(tuple(stack))
        for m in DIRECTIVE.finditer(line):
            if m.group(1) == "IF":
                stack.append(m.group(2))
            elif m.group(1) == "ELSE" and stack:
                stack[-1] = "NOT " + stack[-1]
            elif stack:
                stack.pop()
    doc = etree.fromstring(raw.encode("utf-8"))
    simple = {}
    for st in doc.iter(XS + "simpleType"):
        if st.get("name"):
            simple[st.get("name")] = [e.get("value") for e in st.iter(XS + "enumeration")]
    agroups = {g.get("name"): g for g in doc.iter(XS + "attributeGroup") if g.get("name")}
    ctypes = {c.get("name"): c for c in doc.iter(XS + "complexType") if c.get("name")}

    def attrs_of(ct, seen=None):
        seen = seen or set()
        out = {}
        if ct is None:
            return out
        for a in ct.iter(XS + "attribute"):
            if a.get("name"):
                t = a.get("type") or ""
                enum = simple.get(t) or [e.get("value") for e in a.iter(XS + "enumeration")]
                out[a.get("name")] = {"type": t or "inline", "required": a.get("use") == "required",
                                      **({"values": enum} if enum else {})}
        for ag in ct.iter(XS + "attributeGroup"):
            ref = ag.get("ref")
            if ref and ref not in seen and ref in agroups:
                seen.add(ref)
                out.update(attrs_of(agroups[ref], seen))
        for ext in ct.iter(XS + "extension"):
            base = ext.get("base")
            if base in ctypes and base not in seen:
                seen.add(base)
                out.update(attrs_of(ctypes[base], seen))
        return out

    def context(el):
        p = el.getparent()
        while p is not None:
            if p.tag == XS + "element" and p.get("name"):
                return p.get("name")
            if p.tag in (XS + "group", XS + "complexType") and p.get("name"):
                return p.get("name")
            p = p.getparent()
        return "(root)"

    vocab: dict[str, dict] = {}
    for el in doc.iter(XS + "element"):
        name = el.get("name")
        if not name:
            continue
        ct = el.find(XS + "complexType")
        if ct is None and el.get("type") in ctypes:
            ct = ctypes[el.get("type")]
        v = vocab.setdefault(name, {"attributes": {}, "children": set(), "contexts": set(), "flags": set()})
        v["attributes"].update(attrs_of(ct))
        v["contexts"].add(context(el))
        v["flags"].update(flags_at[el.sourceline - 1] if el.sourceline else ())
        if ct is not None:
            for c in ct.iter(XS + "element"):
                if c.get("name") and c is not el:
                    v["children"].add(c.get("name"))
            for g in ct.iter(XS + "group"):
                if g.get("ref"):
                    v["children"].add("group:" + g.get("ref"))
    return {k: {**v, "children": sorted(v["children"]), "contexts": sorted(v["contexts"]),
                "flags": sorted(v["flags"])} for k, v in sorted(vocab.items())}
