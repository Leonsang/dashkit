"""Build tableu's XML catalog from the workbooks and data sources Tableau Desktop ships.

    uv run python scripts/catalog_samples.py ["C:/Program Files/Tableau/Tableau 2026.3"] [extra.twb ...]

Writes src/tableu_mcp/docs/xml-catalog.json: for every element (keyed by parent/tag) how often Tableau
writes it, its attributes (enumerated values when the attribute is a closed vocabulary, else only its kind)
and the order its children appear in. Only structure is kept: no captions, formulas, member values or data.
Extra files (workbooks tableu wrote that Desktop 2026.3 validated and loaded) are recorded as source
"validated" so the structure check accepts them too.

The catalog feeds `structure.check` (Preflight / workbook CheckStructure) and docs/coverage-gaps.md.
"""

from __future__ import annotations

import json
import re
import sys
import zipfile
from collections import defaultdict
from pathlib import Path

from lxml import etree

FCP = re.compile(r"^_\.fcp\.[^.]+\.(?:true|false)\.\.\.")
USER_NS = "{http://www.tableausoftware.com/xml/user}"
# Attributes whose values are names, captions, formulas or data: only their kind is recorded.
FREE = {"name", "caption", "formula", "value", "member", "key", "alias", "column", "param", "level", "id",
        "uuid", "datasource", "dbname", "server", "filename", "directory", "table", "text", "title", "url",
        "source", "target", "parent-name", "remote-name", "remote-alias", "local-name", "object-id", "using",
        "field", "pane-specification-id", "path", "default-format", "fixed-size", "min", "max", "from", "to",
        "x", "y", "w", "h", "size", "fontsize", "fontcolor", "fontname", "color", "maxwidth", "maxheight",
        "minwidth", "minheight", "custom-color", "aggregate-role-from", "semantic-role", "description",
        "original-version", "source-build", "version", "ordinal", "contains-null", "precision", "scale",
        "width", "height", "font-size", "background-color", "selection-relaxation-option", "user:ui-builder"}
MAX_ENUM = 30
ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "src" / "tableu_mcp" / "docs" / "xml-catalog.json"


def norm(tag: str) -> str:
    if not isinstance(tag, str):
        return ""
    tag = tag.replace(USER_NS, "user:")
    return FCP.sub("", tag)


def kind(v: str) -> str:
    if v in ("true", "false"):
        return "bool"
    if re.fullmatch(r"-?\d+(\.\d+)?", v):
        return "number"
    if v.startswith("[") or v.startswith('"[') or v.startswith("("):
        return "ref"
    if v.startswith("#") and len(v) in (4, 7, 9):
        return "color"
    return "text"


def documents(paths: list[Path]):
    for p in paths:
        suf = p.suffix.lower()
        try:
            if suf in (".twb", ".tds"):
                yield p, etree.parse(str(p)).getroot()
            elif suf in (".twbx", ".tdsx"):
                with zipfile.ZipFile(p) as z:
                    for n in z.namelist():
                        if n.lower().endswith((".twb", ".tds")) and "/" not in n.strip("/"):
                            yield p, etree.fromstring(z.read(n))
        except (etree.XMLSyntaxError, zipfile.BadZipFile, OSError) as e:
            print(f"skip {p}: {e}", file=sys.stderr)


def collect(roots, source: str, cat: dict) -> int:
    n = 0
    for path, root in roots:
        n += 1
        seen_in_file = set()
        for el in root.iter():
            if not isinstance(el.tag, str):
                continue
            parent = el.getparent()
            sig = f"{norm(parent.tag) if parent is not None else ''}/{norm(el.tag)}"
            e = cat.setdefault(sig, {"count": 0, "files": 0, "sources": [], "attrs": {}, "children": {}, "after": {}})
            e["count"] += 1
            if source not in e["sources"]:
                e["sources"].append(source)
            if sig not in seen_in_file:
                seen_in_file.add(sig)
                e["files"] += 1
            for a, v in el.attrib.items():
                a = norm(a)
                spec = e["attrs"].setdefault(a, {"count": 0, "kinds": [], "values": []})
                spec["count"] += 1
                k = kind(v)
                if k not in spec["kinds"]:
                    spec["kinds"].append(k)
                if a not in FREE and k in ("text", "bool", "number") and spec["values"] is not None:
                    if v not in spec["values"]:
                        spec["values"].append(v)
                    if len(spec["values"]) > MAX_ENUM:
                        spec["values"] = None  # open vocabulary
            kids = [norm(c.tag) for c in el if isinstance(c.tag, str)]
            for i, c in enumerate(kids):
                e["children"][c] = e["children"].get(c, 0) + 1
                for prev in set(kids[:i]):
                    if prev != c:
                        e["after"].setdefault(c, {}).setdefault(prev, 0)
                        e["after"][c][prev] += 1
    return n


def finish(cat: dict) -> dict:
    for e in cat.values():
        # order: children sorted so that a child observed after another (and never before it) comes later
        kids = list(e["children"])
        before = {c: {p for p, _ in e["after"].get(c, {}).items() if c not in e["after"].get(p, {})} for c in kids}
        order, placed = [], set()
        while len(order) < len(kids):
            ready = [c for c in kids if c not in placed and before[c] <= placed]
            if not ready:  # cycle: keep the rest by frequency
                ready = [c for c in kids if c not in placed]
            nxt = max(ready, key=lambda c: e["children"][c])
            order.append(nxt)
            placed.add(nxt)
        e["order"] = order
        e["strictly_after"] = {c: sorted(before[c]) for c in kids if before[c]}
        del e["after"]
        for spec in e["attrs"].values():
            if spec["values"] is not None:
                spec["values"].sort()
    return dict(sorted(cat.items()))


def main(argv: list[str]) -> None:
    base = Path(argv[0]) if argv and Path(argv[0]).is_dir() else Path("C:/Program Files/Tableau/Tableau 2026.3")
    extras = [Path(a) for a in argv if Path(a).is_file()]
    samples = sorted(p for p in base.rglob("*") if p.suffix.lower() in (".twb", ".twbx", ".tds", ".tdsx"))
    cat: dict = {}
    n_s = collect(documents(samples), "tableau", cat)
    n_v = collect(documents(extras), "validated", cat) if extras else 0
    out = {"generatedFrom": {"tableau": f"{n_s} documents shipped with {base.name}", "validated": n_v},
           "elements": finish(cat)}
    OUT.write_text(json.dumps(out, ensure_ascii=False, indent=0, sort_keys=False), encoding="utf-8")
    print(f"{OUT.name}: {len(out['elements'])} element signatures from {n_s} Tableau documents + {n_v} validated")


if __name__ == "__main__":
    main(sys.argv[1:])
