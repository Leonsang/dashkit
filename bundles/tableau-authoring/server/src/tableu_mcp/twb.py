"""Tableau workbook XML helpers: read/write .twb/.twbx, add datasources, calcs, worksheets, dashboards.

All builders operate on an lxml root ``<workbook>`` element and return names you can feed into the
next builder. Push the result to a live Desktop with ``DesktopClient.validate_document`` /
``apply_document``, or save it with ``write_workbook_file``.
"""

from __future__ import annotations

import copy
import io
import random
import re
import uuid
import zipfile
from dataclasses import dataclass
from pathlib import Path

from lxml import etree

PARSER = etree.XMLParser(remove_blank_text=False, huge_tree=True, resolve_entities=False, no_network=True)

EMPTY_WORKBOOK = """<?xml version='1.0' encoding='utf-8' ?>
<workbook original-version='18.1' source-build='2026.3.0 (20263.26.1022.1645)' source-platform='win' version='18.1' xmlns:user='http://www.tableausoftware.com/xml/user'>
  <document-format-change-manifest>
    <AnimationOnByDefault />
    <MarkAnimation />
    <SheetIdentifierTracking />
    <WindowsPersistSimpleIdentifiers />
  </document-format-change-manifest>
  <preferences>
    <preference name='ui.encoding.shelf.height' value='24' />
    <preference name='ui.shelf.height' value='26' />
  </preferences>
  <datasources />
</workbook>
"""


# --------------------------------------------------------------------------------------------
# parse / serialize / files
# --------------------------------------------------------------------------------------------
def parse(xml: str | bytes) -> etree._Element:
    if isinstance(xml, str):
        xml = xml.encode("utf-8")
    return etree.fromstring(xml, PARSER)


def _declares(root: etree._Element, feature: str) -> bool:
    m = root.find("document-format-change-manifest")
    return m is not None and any(isinstance(c.tag, str) and c.tag.split("...")[-1] == feature for c in m)


_NEW_SORT = {"computed": "computed-sort", "manual": "manual-sort", "alphabetic": "alphabetic-sort",
             "natural": "natural-sort"}


def normalize_format(root: etree._Element) -> etree._Element:
    """Write what this workbook's format declares. Tableau's schema switches markup on manifest features
    (found in its XSD): with SortTagCleanup, sorts are <computed-sort>/<manual-sort>/<alphabetic-sort>;
    without it, <sort class=...>. tableu builds the old form and converts here, so every operation works on
    both new workbooks and modern ones such as Tableau's own samples."""
    new = _declares(root, "SortTagCleanup")
    for view in root.iter("view"):
        for el in list(view):
            if not isinstance(el.tag, str):
                continue
            if new and el.tag == "sort" and el.get("class") in _NEW_SORT:
                el.tag = _NEW_SORT[el.attrib.pop("class")]
            elif not new and el.tag in _NEW_SORT.values():
                cls = next(k for k, v in _NEW_SORT.items() if v == el.tag)
                el.tag = "sort"
                el.set("class", cls)
    return root


def serialize(root: etree._Element) -> str:
    normalize_format(root)
    body = etree.tostring(root, encoding="unicode")
    return "<?xml version='1.0' encoding='utf-8' ?>\n\n" + body + "\n"


def new_workbook() -> etree._Element:
    return parse(EMPTY_WORKBOOK)


def read_workbook_file(path: str | Path) -> str:
    p = Path(path)
    if p.suffix.lower() == ".twbx":
        with zipfile.ZipFile(p) as z:
            twbs = [n for n in z.namelist() if n.lower().endswith(".twb") and "/" not in n.strip("/")]
            twbs = twbs or [n for n in z.namelist() if n.lower().endswith(".twb")]
            if not twbs:
                raise ValueError(f"No .twb inside {p}")
            return z.read(twbs[0]).decode("utf-8")
    return p.read_text(encoding="utf-8")


def write_workbook_file(path: str | Path, xml: str, base_twbx: str | Path | None = None) -> Path:
    """Write .twb, or .twbx (repacking every other entry of ``base_twbx`` / the existing file)."""
    p = Path(path)
    p.parent.mkdir(parents=True, exist_ok=True)
    if p.suffix.lower() != ".twbx":
        p.write_text(xml, encoding="utf-8")
        return p
    source = Path(base_twbx) if base_twbx else (p if p.exists() else None)
    buf = io.BytesIO()
    with zipfile.ZipFile(buf, "w", zipfile.ZIP_DEFLATED) as out:
        twb_name = p.with_suffix(".twb").name
        if source and source.exists():
            with zipfile.ZipFile(source) as src:
                for item in src.infolist():
                    if item.filename.lower().endswith(".twb") and "/" not in item.filename:
                        twb_name = item.filename
                        continue
                    out.writestr(item, src.read(item.filename))
        out.writestr(twb_name, xml.encode("utf-8"))
    p.write_bytes(buf.getvalue())
    return p


# --------------------------------------------------------------------------------------------
# inventory
# --------------------------------------------------------------------------------------------
def _ensure(parent: etree._Element, tag: str, before: tuple[str, ...] = ()) -> etree._Element:
    el = parent.find(tag)
    if el is not None:
        return el
    el = etree.Element(tag)
    for b in before:
        anchor = parent.find(b)
        if anchor is not None:
            anchor.addprevious(el)
            return el
    parent.append(el)
    return el


def datasources(root: etree._Element) -> list[etree._Element]:
    return [d for d in root.findall("./datasources/datasource") if d.get("name") != "Parameters"]


def find_datasource(root: etree._Element, name_or_caption: str) -> etree._Element:
    for d in root.findall("./datasources/datasource"):
        if name_or_caption in (d.get("name"), d.get("caption"), d.get("formatted-name")):
            return d
    avail = [d.get("caption") or d.get("name") for d in datasources(root)]
    raise KeyError(f"Datasource {name_or_caption!r} not found. Available: {avail}")


def sheet_names(root: etree._Element) -> dict[str, list[str]]:
    return {
        "worksheets": [w.get("name") for w in root.findall("./worksheets/worksheet")],
        "dashboards": [d.get("name") for d in root.findall("./dashboards/dashboard") if d.get("type") != "storyboard"],
        "stories": [d.get("name") for d in root.findall("./dashboards/dashboard[@type='storyboard']")],
    }


@dataclass
class FieldInfo:
    name: str  # internal, bracketed e.g. [Sales] or [Calculation_123]
    caption: str
    datatype: str
    role: str
    type: str
    is_calc: bool
    formula: str | None = None

    def as_dict(self) -> dict:
        return {k: v for k, v in self.__dict__.items() if v is not None}


def _default_role(datatype: str) -> tuple[str, str]:
    if datatype in ("real", "integer"):
        return "measure", "quantitative"
    if datatype in ("date", "datetime"):
        return "dimension", "ordinal"
    return "dimension", "nominal"


def fields(ds: etree._Element) -> list[FieldInfo]:
    """All fields of a datasource: explicit <column>s plus metadata-records not otherwise declared."""
    out: dict[str, FieldInfo] = {}
    for mr in ds.iter("metadata-record"):
        if mr.get("class") != "column":
            continue
        local = mr.findtext("local-name")
        dtype = mr.findtext("local-type") or "string"
        if not local:
            continue
        role, typ = _default_role(dtype)
        out[local] = FieldInfo(local, local.strip("[]"), dtype, role, typ, False)
    for g in ds.findall("group"):  # sets
        gname = g.get("name")
        if gname and g.get("hidden") != "true":
            out[gname] = FieldInfo(gname, gname.strip("[]"), "set", "dimension", "nominal", False)
    for col in ds.findall("column"):
        name = col.get("name")
        if not name or name.startswith("[:"):
            continue
        calc = col.find("calculation")
        dtype = col.get("datatype") or (out[name].datatype if name in out else "string")
        role, typ = _default_role(dtype)
        out[name] = FieldInfo(
            name=name,
            caption=col.get("caption") or name.strip("[]"),
            datatype=dtype,
            role=col.get("role") or role,
            type=col.get("type") or typ,
            is_calc=calc is not None and calc.get("class", "tableau") == "tableau",
            formula=calc.get("formula") if calc is not None else None,
        )
    return list(out.values())


def resolve_field(ds: etree._Element, ref: str) -> FieldInfo:
    ref_b = ref if ref.startswith("[") else f"[{ref}]"
    all_fields = fields(ds)
    for f in all_fields:
        if f.name == ref_b or f.caption == ref.strip("[]"):
            return f
    for f in all_fields:
        if f.caption.lower() == ref.strip("[]").lower():
            return f
    raise KeyError(f"Field {ref!r} not in datasource {ds.get('caption') or ds.get('name')}")


# --------------------------------------------------------------------------------------------
# datasources
# --------------------------------------------------------------------------------------------
def _random_ds_name() -> str:
    alphabet = "0123456789abcdefghijklmnopqrstuvwxyz"
    return "federated." + "".join(random.choice(alphabet) for _ in range(28))  # noqa: S311


def add_datasource_from_tds(root: etree._Element, tds_path: str | Path, caption: str | None = None) -> str:
    """Embed a .tds into the workbook. Relative file connections are made absolute. Returns its name."""
    tds_path = Path(tds_path).resolve()
    tds = parse(tds_path.read_bytes())
    if tds.tag != "datasource":
        raise ValueError(f"{tds_path} is not a Tableau datasource (.tds)")
    return embed_datasource(root, tds, caption or tds.get("formatted-name") or tds_path.stem, tds_path.parent)


def embed_datasource(root: etree._Element, tds: etree._Element, caption: str, base_dir: Path | None = None) -> str:
    """Embed a ``<datasource>`` element (from a .tds or built by ``connectors``). Returns its name."""
    name = _random_ds_name()
    cap = caption
    tds.set("name", name)
    tds.set("caption", cap)
    tds.set("inline", "true")
    tds.set("version", tds.get("version", "18.1"))
    for attr in ("formatted-name", "source-platform"):
        tds.attrib.pop(attr, None)
    # Embedded datasources share the workbook's format manifest: merge and drop the .tds one.
    ds_manifest = tds.find("document-format-change-manifest")
    if ds_manifest is not None:
        wb_manifest = _ensure(root, "document-format-change-manifest", before=("preferences", "datasources"))
        if wb_manifest.getparent().index(wb_manifest) != 0:
            root.insert(0, wb_manifest)
        have = {c.tag for c in wb_manifest}
        for child in list(ds_manifest):
            if child.tag not in have:
                wb_manifest.append(etree.Element(child.tag))
                have.add(child.tag)
        tds.remove(ds_manifest)
    for conn in tds.iter("connection"):
        fn = conn.get("filename")
        if conn.get("class") == "textscan" and conn.get("directory"):
            continue  # text files are addressed as directory + file name
        if fn and not Path(fn).is_absolute():
            base = Path(conn.get("directory") or base_dir or Path.cwd())
            conn.set("filename", str((base / fn).resolve()).replace("\\", "/"))
            conn.attrib.pop("directory", None)
    ds_root = _ensure(root, "datasources", before=("worksheets", "dashboards", "windows"))
    if any(d.get("caption") == cap for d in ds_root.findall("datasource")):
        raise ValueError(f"A datasource captioned {cap!r} already exists; pass caption=... to rename")
    ds_root.append(tds)
    return name


def add_calculated_field(
    root: etree._Element,
    datasource: str,
    caption: str,
    formula: str,
    datatype: str = "real",
    role: str | None = None,
    default_format: str | None = None,
) -> str:
    """Add a calculated field. ``default_format`` uses Tableau codes, e.g. 'p0.0%' (percent), 'n#,##0' (number),
    'c"$"#,##0' (currency)."""
    ds = find_datasource(root, datasource)
    for f in fields(ds):
        if f.caption == caption:
            raise ValueError(f"Field {caption!r} already exists in {datasource}")
    internal = f"[Calculation_{random.randint(10**17, 10**18 - 1)}]"  # noqa: S311
    r, t = _default_role(datatype)
    col = etree.Element(
        "column",
        caption=caption,
        datatype=datatype,
        name=internal,
        role=role or r,
        type="quantitative" if (role or r) == "measure" else t,
    )
    if default_format:
        col.set("default-format", default_format)
    etree.SubElement(col, "calculation", {"class": "tableau", "formula": formula})
    # After the last sibling the schema allows before a column, feature-prefixed ones included
    # (a file data source's only column is `_.fcp...column`, and its <aliases> must still come first).
    before = ("connection", "utility-dimensions", "dimension", "overridable-settings", "aliases", "column")
    anchors = [c for c in ds if isinstance(c.tag, str) and c.tag.split("...")[-1] in before]
    if anchors:
        anchors[-1].addnext(col)
    else:
        ds.insert(0, col)
    return internal


# --------------------------------------------------------------------------------------------
# field specs -> column-instances
# --------------------------------------------------------------------------------------------
AGG = {
    "SUM": ("Sum", "sum"), "AVG": ("Avg", "avg"), "MIN": ("Min", "min"), "MAX": ("Max", "max"),
    "COUNT": ("Count", "cnt"), "COUNTD": ("CountD", "ctd"), "MEDIAN": ("Median", "med"),
    "ATTR": ("Attribute", "attr"), "STDEV": ("Stdev", "stdev"), "VAR": ("Var", "var"),
}
DATE_PART = {  # discrete date parts
    "YEAR": ("Year", "yr"), "QUARTER": ("Quarter", "qr"), "MONTH": ("Month", "mn"),
    "WEEK": ("Week", "wk"), "DAY": ("Day", "dy"), "WEEKDAY": ("Weekday", "wd"),
}
DATE_TRUNC = {  # continuous truncations
    "YEAR_TRUNC": ("Year-Trunc", "tyr"), "QUARTER_TRUNC": ("Quarter-Trunc", "tqr"),
    "MONTH_TRUNC": ("Month-Trunc", "tmn"), "WEEK_TRUNC": ("Week-Trunc", "twk"), "DAY_TRUNC": ("Day-Trunc", "tdy"),
}
SPEC_RE = re.compile(r"^\s*([A-Za-z_]+)\s*\(\s*(.+?)\s*\)\s*$")


@dataclass
class Ref:
    field: FieldInfo
    derivation: str
    prefix: str
    suffix: str  # nk / ok / qk
    ci_type: str
    table_calc: etree._Element | None = None
    tc_prefix: str | None = None

    @property
    def instance_name(self) -> str:
        if self.field.datatype == "set" and self.prefix != "io":  # set members: [ds].[Set name]
            return self.field.name
        pre = f"{self.tc_prefix}:" if self.tc_prefix else ""
        return f"[{pre}{self.prefix}:{self.field.name.strip('[]')}:{self.suffix}]"


# Quick table calculations: spec function -> (instance prefix, <table-calc> attributes)
TABLE_CALCS = {
    "RUNNING_SUM": ("cum", {"aggregation": "Sum", "ordering-type": "Rows", "type": "CumTotal"}),
    "RUNNING_AVG": ("cum", {"aggregation": "Avg", "ordering-type": "Rows", "type": "CumTotal"}),
    "PCT_TOTAL": ("pcto", {"ordering-type": "Rows", "type": "PctTotal"}),
    "RANK": ("rank", {"ordering-type": "Rows", "rank-options": "Competition,Descending", "type": "Rank"}),
    "DIFF": ("diff", {"ordering-type": "Rows", "type": "Diff"}),
    "PCT_DIFF": ("pcdf", {"diff-options": "Relative", "ordering-type": "Rows", "type": "PctDiff"}),
    "MOVING_AVG": ("win", {"aggregation": "Avg", "from": "-2", "ordering-type": "Rows", "to": "0",
                           "type": "WindowTotal"}),
}


def make_ref(ds: etree._Element, spec: str) -> Ref:
    """'Category' | 'SUM(Sales)' | 'YEAR(Order Date)' | 'MONTH_TRUNC(Order Date)' | 'Profit Ratio'."""
    m = SPEC_RE.match(spec)
    func, name = (m.group(1).upper(), m.group(2)) if m else (None, spec.strip())
    if func and func not in AGG and func not in DATE_PART and func not in DATE_TRUNC and func not in TABLE_CALCS \
            and func != "IN_OUT":
        func, name = None, spec.strip()  # a field whose name has parentheses, e.g. "Profit (bin)"
    if func == "IN_OUT":  # In/Out of a set as a dimension
        f = resolve_field(ds, name)
        if f.datatype != "set":
            raise ValueError(f"IN_OUT needs a set; {name!r} is not one")
        return Ref(f, "InOut", "io", "nk", "nominal")
    if func in TABLE_CALCS:
        inner = make_ref(ds, name)
        pre, attrs = TABLE_CALCS[func]
        tc = etree.Element("table-calc", attrs)
        if func in ("DIFF", "PCT_DIFF"):
            etree.SubElement(etree.SubElement(tc, "address"), "value").text = "-1"
        return Ref(inner.field, inner.derivation, inner.prefix, inner.suffix, inner.ci_type, tc, pre)
    f = resolve_field(ds, name)
    if func in AGG:
        d, p = AGG[func]
        return Ref(f, d, p, "qk", "quantitative")
    if func in DATE_PART:
        d, p = DATE_PART[func]
        return Ref(f, d, p, "ok", "ordinal")
    if func in DATE_TRUNC:
        d, p = DATE_TRUNC[func]
        return Ref(f, d, p, "qk", "quantitative")
    if func:
        raise ValueError(f"Unknown function {func} in {spec!r}")
    if f.role == "measure":
        # Calculated fields that already aggregate must use derivation 'User'.
        if f.is_calc and f.formula and re.search(r"\b(SUM|AVG|MIN|MAX|COUNTD?|MEDIAN|ATTR|WINDOW_\w+|RUNNING_\w+)\s*\(", f.formula, re.I):
            return Ref(f, "User", "usr", "qk", "quantitative")
        return Ref(f, "Sum", "sum", "qk", "quantitative")
    if f.datatype in ("date", "datetime"):
        return Ref(f, "Year", "yr", "ok", "ordinal")
    return Ref(f, "None", "none", "nk", "nominal")


# --------------------------------------------------------------------------------------------
# worksheets
# --------------------------------------------------------------------------------------------
MARKS = {"automatic": "Automatic", "bar": "Bar", "line": "Line", "area": "Area", "square": "Square",
         "circle": "Circle", "shape": "Shape", "text": "Text", "map": "Multipolygon", "pie": "Pie",
         "gantt": "GanttBar", "polygon": "Polygon", "density": "Density"}
ENCODINGS = ("color", "size", "text", "detail", "tooltip", "shape")


def _uuid() -> str:
    return "{" + str(uuid.uuid4()).upper() + "}"


def _title_el(text: str) -> etree._Element:
    lo = etree.Element("layout-options")
    t = etree.SubElement(lo, "title")
    ft = etree.SubElement(t, "formatted-text")
    run = etree.SubElement(ft, "run")
    run.text = text
    return lo


def add_worksheet(
    root: etree._Element,
    name: str,
    datasource: str,
    rows: list[str] | None = None,
    cols: list[str] | None = None,
    mark: str = "automatic",
    color: str | None = None,
    size: str | None = None,
    label: str | None = None,
    detail: list[str] | None = None,
    tooltip: list[str] | None = None,
    title: str | None = None,
    sort_desc_by: str | None = None,
) -> str:
    """Add a worksheet. Field specs: 'Category', 'SUM(Sales)', 'YEAR(Order Date)', 'MONTH_TRUNC(Order Date)'."""
    if name in sheet_names(root)["worksheets"] + sheet_names(root)["dashboards"]:
        raise ValueError(f"Sheet {name!r} already exists")
    ds = find_datasource(root, datasource)
    dsn = ds.get("name")
    q = lambda r: f"[{dsn}].{r.instance_name}"  # noqa: E731

    rows_r = [make_ref(ds, s) for s in rows or []]
    cols_r = [make_ref(ds, s) for s in cols or []]
    enc: list[tuple[str, Ref]] = []
    for kind, spec in (("color", color), ("size", size), ("text", label)):
        if spec:
            enc.append((kind, make_ref(ds, spec)))
    enc += [("lod", make_ref(ds, s)) for s in detail or []]
    enc += [("tooltip", make_ref(ds, s)) for s in tooltip or []]
    all_refs = rows_r + cols_r + [r for _, r in enc]

    ws = etree.Element("worksheet", name=name)
    if title:
        ws.append(_title_el(title))
    table = etree.SubElement(ws, "table")
    view = etree.SubElement(table, "view")
    dss = etree.SubElement(view, "datasources")
    etree.SubElement(dss, "datasource", caption=ds.get("caption") or dsn, name=dsn)
    deps = etree.SubElement(view, "datasource-dependencies", datasource=dsn)
    seen_cols, seen_ci = set(), set()
    for r in all_refs:
        if r.field.datatype == "set":
            continue
        if r.field.name not in seen_cols:
            seen_cols.add(r.field.name)
            attrs = {"datatype": r.field.datatype, "name": r.field.name, "role": r.field.role, "type": r.field.type}
            if r.field.caption != r.field.name.strip("[]"):
                attrs = {"caption": r.field.caption, **attrs}
            src_col = next((x for x in ds.findall("column") if x.get("name") == r.field.name), None)
            if src_col is not None and src_col.get("default-format"):
                attrs["default-format"] = src_col.get("default-format")
            c = etree.SubElement(deps, "column", attrs)
            if r.field.is_calc and r.field.formula is not None:
                etree.SubElement(c, "calculation", {"class": "tableau", "formula": r.field.formula})
    for r in all_refs:
        if r.field.datatype == "set" and r.prefix != "io":
            continue
        if r.instance_name not in seen_ci:
            seen_ci.add(r.instance_name)
            ci = etree.SubElement(deps, "column-instance", column=r.field.name, derivation=r.derivation,
                                  name=r.instance_name, pivot="key", type=r.ci_type)
            if r.table_calc is not None:
                ci.append(copy.deepcopy(r.table_calc))
    if sort_desc_by:
        dim = next((r for r in rows_r + cols_r if r.ci_type == "nominal"), None)
        meas = make_ref(ds, sort_desc_by)
        if dim is not None:
            etree.SubElement(view, "sort", {"class": "computed", "column": q(dim), "direction": "DESC", "using": q(meas)})
            if meas.instance_name not in seen_ci:
                etree.SubElement(deps, "column-instance", column=meas.field.name, derivation=meas.derivation,
                                 name=meas.instance_name, pivot="key", type=meas.ci_type)
    etree.SubElement(view, "aggregation", value="true")
    etree.SubElement(table, "style")
    panes = etree.SubElement(table, "panes")
    pane = etree.SubElement(panes, "pane", {"selection-relaxation-option": "selection-relaxation-allow"})
    pv = etree.SubElement(pane, "view")
    etree.SubElement(pv, "breakdown", value="auto")
    etree.SubElement(pane, "mark", {"class": MARKS.get(mark.lower(), mark)})
    if enc:
        encs = etree.SubElement(pane, "encodings")
        for kind, r in enc:
            etree.SubElement(encs, kind, column=q(r))
    etree.SubElement(table, "rows").text = " / ".join(q(r) for r in rows_r) or None
    etree.SubElement(table, "cols").text = " / ".join(q(r) for r in cols_r) or None
    etree.SubElement(ws, "simple-id", uuid=_uuid())

    wss = _ensure(root, "worksheets", before=("dashboards", "windows"))
    wss.append(ws)
    windows = _ensure(root, "windows")
    win = etree.SubElement(windows, "window", {"class": "worksheet", "name": name})
    cards = etree.SubElement(win, "cards")
    left = etree.SubElement(cards, "edge", name="left")
    strip = etree.SubElement(left, "strip", size="160")
    for c in ("pages", "filters", "marks"):
        etree.SubElement(strip, "card", type=c)
    top = etree.SubElement(cards, "edge", name="top")
    for c in ("columns", "rows", "title"):
        s = etree.SubElement(top, "strip", size="2147483647")
        etree.SubElement(s, "card", type=c)
    etree.SubElement(win, "simple-id", uuid=_uuid())
    return name


def remove_sheet(root: etree._Element, name: str) -> None:
    removed = False
    for xp in ("./worksheets/worksheet[@name=$n]", "./dashboards/dashboard[@name=$n]", "./windows/window[@name=$n]"):
        for el in root.xpath(xp, n=name):
            el.getparent().remove(el)
            removed = True
    for tag in ("worksheets", "dashboards", "windows"):  # Tableau rejects empty containers
        el = root.find(tag)
        if el is not None and len(el) == 0:
            root.remove(el)
    if not removed:
        raise KeyError(f"Sheet {name!r} not found")


def rename_sheet(root: etree._Element, old: str, new: str) -> None:
    hits = root.xpath("./worksheets/worksheet[@name=$n] | ./dashboards/dashboard[@name=$n] | ./windows/window[@name=$n]", n=old)
    if not hits:
        raise KeyError(f"Sheet {old!r} not found")
    for el in hits:
        el.set("name", new)
    for z in root.xpath(".//zone[@name=$n] | .//viewpoint[@name=$n] | .//story-point[@captured-sheet=$n]", n=old):
        z.set("name" if z.tag != "story-point" else "captured-sheet", new)


# --------------------------------------------------------------------------------------------
# dashboards
# --------------------------------------------------------------------------------------------
def set_dashboard_size(root: etree._Element, dashboard: str, width: int | None, height: int | None, mode: str = "fixed") -> None:
    dbs = root.xpath("./dashboards/dashboard[@name=$n]", n=dashboard)
    if not dbs:
        raise KeyError(f"Dashboard {dashboard!r} not found")
    db = dbs[0]
    old = db.find("size")
    if old is not None:
        db.remove(old)
    if mode == "automatic":
        return
    attrs = {}
    if mode == "fixed":
        attrs = {"maxheight": str(height), "maxwidth": str(width), "minheight": str(height), "minwidth": str(width)}
    elif mode == "range":
        attrs = {"maxheight": str(height), "maxwidth": str(width), "minheight": str(int(height * 0.75)), "minwidth": str(int(width * 0.75))}
    size = etree.Element("size", attrs)
    style = db.find("style")
    (style.addnext(size) if style is not None else db.insert(0, size))


def _is_kpi_strip(root: etree._Element, sheet: str) -> bool:
    ws = next((w for w in root.iter("worksheet") if w.get("name") == sheet), None)
    t = ws.find("table") if ws is not None else None
    shelves = (t.findtext("rows") or "") + (t.findtext("cols") or "") if t is not None else ""
    return shelves.strip().endswith("[:Measure Names]") and "/" not in shelves and "*" not in shelves


def add_dashboard(
    root: etree._Element,
    name: str,
    sheets: list[str],
    layout: str = "grid",
    width: int = 1200,
    height: int = 800,
    title: bool = True,
    rows: list[list[str]] | None = None,
    heights: list[float] | None = None,
) -> str:
    """Tiled dashboard with the given worksheets. layout: grid | vertical | horizontal. Fixed size.
    rows gives the layout explicitly, one list of sheets per row (e.g. a KPI row on top), and heights
    their share of the height in percent; sheets may then be empty."""
    if rows:
        sheets = [s for r in rows for s in r]
    existing = sheet_names(root)
    if name in existing["worksheets"] + existing["dashboards"]:
        raise ValueError(f"Sheet {name!r} already exists")
    missing = [s for s in sheets if s not in existing["worksheets"]]
    if missing:
        raise KeyError(f"Worksheets not found: {missing}")

    ids = iter(range(3, 10_000))
    full = 100000
    db = etree.Element("dashboard", name=name)
    etree.SubElement(db, "style")
    etree.SubElement(db, "size", maxheight=str(height), maxwidth=str(width), minheight=str(height), minwidth=str(width))
    zones = etree.SubElement(db, "zones")
    outer = etree.SubElement(zones, "zone", {"h": str(full), "id": "1", "type-v2": "layout-basic", "w": str(full), "x": "0", "y": "0"})
    body = etree.SubElement(outer, "zone", {"h": str(full), "id": "2", "param": "vert", "type-v2": "layout-flow", "w": str(full), "x": "0", "y": "0"})
    top = 0
    if title:
        th = 6000
        etree.SubElement(body, "zone", {"h": str(th), "id": str(next(ids)), "type-v2": "title", "w": str(full), "x": "0", "y": "0"})
        top = th

    def grid_shape(n: int) -> list[int]:
        if layout == "vertical":
            return [1] * n
        if layout == "horizontal":
            return [n]
        per_row = 2 if n <= 4 else 3
        rows_, left = [], n
        while left > 0:
            rows_.append(min(per_row, left))
            left -= per_row
        return rows_

    shape = [len(r) for r in rows] if rows else grid_shape(len(sheets))
    avail_h = full - top
    if heights and len(heights) != len(shape):
        raise ValueError(f"heights has {len(heights)} values for {len(shape)} rows")
    total = sum(heights) if heights else len(shape)
    row_hs = [int(avail_h * (heights[i] if heights else 1) / total) for i in range(len(shape))]
    it = iter(sheets)
    y = top
    for ri, count in enumerate(shape):
        row_h = row_hs[ri]
        row_attrs = {"h": str(row_h), "id": str(next(ids)), "param": "horz", "type-v2": "layout-flow", "w": str(full), "x": "0", "y": str(y)}
        if rows:
            # Desktop sizes flow containers by content unless told otherwise: pin the row's height in pixels
            # and share its width evenly, as Tableau's own dashboards do (Superstore: is-fixed/fixed-size,
            # layout-strategy-id="distribute-evenly").
            row_attrs.update({"is-fixed": "true", "fixed-size": str(max(1, round(height * row_h / full)))})
        if count > 1:
            row_attrs["layout-strategy-id"] = "distribute-evenly"
        row = etree.SubElement(body, "zone", row_attrs)
        col_w = full // count
        for ci in range(count):
            sheet = next(it)
            z = etree.SubElement(row, "zone", {"h": str(row_h), "id": str(next(ids)), "name": sheet, "w": str(col_w), "x": str(ci * col_w), "y": str(y)})
            if _is_kpi_strip(root, sheet):
                z.set("show-title", "false")  # each KPI already carries its label
            etree.SubElement(z, "layout-cache", {"type-h": "scalable", "type-w": "scalable"})
        y += row_h
    etree.SubElement(db, "simple-id", uuid=_uuid())

    dbs = _ensure(root, "dashboards", before=("windows",))
    dbs.append(db)
    windows = _ensure(root, "windows")
    win = etree.SubElement(windows, "window", {"class": "dashboard", "maximized": "true", "name": name})
    vps = etree.SubElement(win, "viewpoints")
    for s in sheets:
        # "Fit: Entire View", as in Tableau's own dashboards: without it text tables and discrete axes keep
        # their standard width, so KPI titles wrap letter by letter and bar charts use a third of the cell.
        vp = etree.SubElement(vps, "viewpoint", name=s)
        etree.SubElement(vp, "zoom", type="entire-view")
    etree.SubElement(win, "active", id="-1")
    etree.SubElement(win, "simple-id", uuid=_uuid())
    # Dashboards are normally the active/first window; keep worksheets hidden-able but present.
    return name
