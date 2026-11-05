"""Build Tableau datasources from source files (CSV / Excel), with one or more logical tables.

Each source becomes a logical table in Tableau's relationship (object) model. Different files and
formats can be mixed in one datasource (a CSV fact table related to an Excel dimension, etc.).

Source specs::

    data/ventas.csv                 -> CSV file (separator auto-detected: , ; | tab)
    data/catalogo.xlsx              -> first sheet of the workbook
    data/catalogo.xlsx#Productos    -> a named sheet
    Optionally prefix a caption:  "Ventas=data/ventas.csv"

Relationship specs (table captions and source column names)::

    "Ventas.ProductoID = Productos.ProductoID"

New connector kinds are added by implementing ``read_<kind>`` (returning a ``Table``) and a
``_connection_<kind>`` / ``_relation_attrs_<kind>`` pair; see CSV and Excel below.
"""

from __future__ import annotations

import csv
import datetime as dt
import random
import re
import uuid
from dataclasses import dataclass, field
from pathlib import Path

from lxml import etree

from . import twb

SAMPLE_ROWS = 2000
REMOTE_TYPE = {  # (csv, excel) remote-type codes as Tableau writes them
    "integer": (20, 20), "real": (5, 5), "string": (129, 130), "boolean": (11, 11),
    "date": (133, 7), "datetime": (135, 7),
}
DEFAULT_AGG = {"integer": "Sum", "real": "Sum", "string": "Count", "boolean": "Count", "date": "Year", "datetime": "Year"}
ID_RE = re.compile(r"(^id$|_id$|\bid$|ID$|codigo|code$)", re.IGNORECASE)


@dataclass
class Column:
    name: str
    datatype: str
    ordinal: int
    local: str = ""  # bracketed local field name, set when building (collisions get " (Table)")


@dataclass
class Table:
    kind: str  # csv | excel
    path: Path
    caption: str
    columns: list[Column]
    rows: int
    sheet: str | None = None
    separator: str = ","
    object_id: str = field(default_factory=lambda: "")

    @property
    def relation_table(self) -> str:
        if self.kind == "csv":
            return f"[{self.path.stem}#{self.path.suffix.lstrip('.')}]"
        return f"[{self.sheet}$]"

    def as_dict(self) -> dict:
        return {
            "caption": self.caption, "kind": self.kind, "path": str(self.path), "sheet": self.sheet,
            "rows": self.rows, "columns": [{"name": c.name, "datatype": c.datatype} for c in self.columns],
        }


# --------------------------------------------------------------------------------------------
# type inference
# --------------------------------------------------------------------------------------------
_INT = re.compile(r"^[+-]?\d+$")
_REAL = re.compile(r"^[+-]?(\d+\.\d*|\.\d+|\d+)([eE][+-]?\d+)?$")
_DATE = re.compile(r"^\d{4}-\d{2}-\d{2}$")
_DATETIME = re.compile(r"^\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}(:\d{2}(\.\d+)?)?$")


def _infer_text(values: list[str]) -> str:
    vals = [v.strip() for v in values if v is not None and v.strip() != ""]
    if not vals:
        return "string"
    for dtype, test in (
        ("integer", _INT.match), ("real", _REAL.match), ("date", _DATE.match), ("datetime", _DATETIME.match),
        ("boolean", lambda v: v.lower() in ("true", "false")),
    ):
        if all(test(v) for v in vals):
            return dtype
    return "string"


def _infer_py(values: list) -> str:
    vals = [v for v in values if v is not None and v != ""]
    if not vals:
        return "string"
    if all(isinstance(v, bool) for v in vals):
        return "boolean"
    if all(isinstance(v, int) and not isinstance(v, bool) for v in vals):
        return "integer"
    if all(isinstance(v, (int, float)) and not isinstance(v, bool) for v in vals):
        return "real"
    if all(isinstance(v, dt.datetime) for v in vals):
        return "date" if all(v.time() == dt.time() for v in vals) else "datetime"
    if all(isinstance(v, dt.date) for v in vals):
        return "date"
    return "string"


# --------------------------------------------------------------------------------------------
# readers
# --------------------------------------------------------------------------------------------
def parse_spec(spec: str) -> tuple[str | None, Path, str | None]:
    caption = None
    if "=" in spec and not re.match(r"^[A-Za-z]:[\\/]", spec.split("=", 1)[0]):
        caption, spec = (s.strip() for s in spec.split("=", 1))
    sheet = None
    if "#" in spec:
        spec, sheet = spec.rsplit("#", 1)
    return caption, Path(spec).expanduser().resolve(), sheet


def read_csv(path: Path, caption: str | None = None) -> Table:
    raw = path.read_text(encoding="utf-8-sig")
    try:
        sep = csv.Sniffer().sniff(raw[:20000], delimiters=",;|\t").delimiter
    except csv.Error:
        sep = ","
    rows = list(csv.reader(raw.splitlines(), delimiter=sep))
    if not rows:
        raise ValueError(f"{path} is empty")
    header, body = rows[0], rows[1:]
    cols = [
        Column(h.strip(), _infer_text([r[i] if i < len(r) else "" for r in body[:SAMPLE_ROWS]]), i)
        for i, h in enumerate(header)
    ]
    return Table("csv", path, caption or path.stem.replace("_", " ").title(), cols, len(body), separator=sep)


def read_excel(path: Path, sheet: str | None = None, caption: str | None = None) -> Table:
    from openpyxl import load_workbook  # noqa: PLC0415

    wb = load_workbook(path, read_only=True, data_only=True)
    ws = wb[sheet] if sheet else wb.worksheets[0]
    it = ws.iter_rows(values_only=True)
    header = [str(h).strip() for h in next(it) if h is not None]
    body = [r for r in it if any(v is not None for v in r)]
    cols = [Column(h, _infer_py([r[i] if i < len(r) else None for r in body[:SAMPLE_ROWS]]), i) for i, h in enumerate(header)]
    t = Table("excel", path, caption or ws.title, cols, len(body), sheet=ws.title)
    wb.close()
    return t


def read_source(spec: str) -> Table:
    caption, path, sheet = parse_spec(spec)
    if not path.exists():
        raise FileNotFoundError(path)
    ext = path.suffix.lower()
    if ext in (".csv", ".txt", ".tsv", ".tab"):
        return read_csv(path, caption)
    if ext in (".xlsx", ".xlsm", ".xls"):
        return read_excel(path, sheet, caption)
    raise ValueError(f"No connector for {ext!r} yet (supported: csv/txt/tsv, xlsx). Use a .tds for other sources.")


# --------------------------------------------------------------------------------------------
# XML builders per connector kind
# --------------------------------------------------------------------------------------------
def _rand(n: int = 28) -> str:
    return "".join(random.choice("0123456789abcdefghijklmnopqrstuvwxyz") for _ in range(n))  # noqa: S311


def _connection_csv(t: Table) -> etree._Element:
    return etree.Element("connection", {
        "class": "textscan", "directory": str(t.path.parent).replace("\\", "/"), "filename": t.path.name,
        "password": "", "server": "",
    })


def _connection_excel(t: Table) -> etree._Element:
    return etree.Element("connection", {
        "class": "excel-direct", "cleaning": "no", "compat": "no", "dataRefreshTime": "",
        "filename": str(t.path).replace("\\", "/"), "interpretationMode": "0", "password": "", "server": "",
        "validate": "no",
    })


def _excel_grid(t: Table) -> str:
    def col_letter(n: int) -> str:
        s = ""
        while n:
            n, r = divmod(n - 1, 26)
            s = chr(65 + r) + s
        return s
    last = f"{col_letter(len(t.columns))}{t.rows + 1}"
    return f"A1:{last}:no:A1:{last}:0"


def _columns_el(t: Table) -> etree._Element:
    if t.kind == "csv":
        el = etree.Element("columns", {"character-set": "UTF-8", "header": "yes", "locale": "en_US", "separator": t.separator})
    else:
        el = etree.Element("columns", {"gridOrigin": _excel_grid(t), "header": "yes", "outcome": "6"})
    for c in t.columns:
        etree.SubElement(el, "column", datatype=c.datatype, name=c.name, ordinal=str(c.ordinal))
    return el


def _relation(t: Table, conn_name: str, tag: str = "relation") -> etree._Element:
    rel = etree.Element(tag, connection=conn_name, name=t.caption, table=t.relation_table, type="table")
    rel.append(_columns_el(t))
    return rel


def _capability(t: Table) -> etree._Element:
    mr = etree.Element("metadata-record", {"class": "capability"})
    for tag, text in (("remote-name", None), ("remote-type", "0"), ("parent-name", f"[{t.caption}]"),
                      ("remote-alias", None), ("aggregation", "Count"), ("contains-null", "true")):
        etree.SubElement(mr, tag).text = text
    attrs = etree.SubElement(mr, "attributes")
    if t.kind == "csv":
        items = [("string", "character-set", '"UTF-8"'), ("string", "collation", '"en_US"'),
                 ("string", "field-delimiter", f'"{t.separator}"'), ("string", "header-row", '"true"'),
                 ("string", "locale", '"en_US"'), ("string", "single-char", '""')]
    else:
        items = [("integer", "context", "0"), ("string", "gridOrigin", f'"{_excel_grid(t)}"'),
                 ("boolean", "header", "true"), ("integer", "outcome", "6")]
    for datatype, name, val in items:
        etree.SubElement(attrs, "attribute", datatype=datatype, name=name).text = val
    return mr


def _column_record(t: Table, c: Column) -> etree._Element:
    mr = etree.Element("metadata-record", {"class": "column"})
    rt = REMOTE_TYPE[c.datatype][0 if t.kind == "csv" else 1]
    for tag, text in (
        ("remote-name", c.name), ("remote-type", str(rt)), ("local-name", c.local),
        ("parent-name", f"[{t.caption}]"), ("remote-alias", c.name), ("ordinal", str(c.ordinal)),
        ("local-type", c.datatype), ("aggregation", DEFAULT_AGG[c.datatype]), ("contains-null", "true"),
    ):
        etree.SubElement(mr, tag).text = text
    etree.SubElement(mr, "_.fcp.ObjectModelEncapsulateLegacy.true...object-id").text = f"[{t.object_id}]"
    return mr


def _relationship_el(rel: str, by_caption: dict[str, Table]) -> etree._Element:
    m = re.match(r"^\s*(.+?)\.(.+?)\s*=\s*(.+?)\.(.+?)\s*$", rel)
    if not m:
        raise ValueError(f"Bad relationship {rel!r}; expected 'TableA.Col = TableB.Col'")
    ta, ca, tb, cb = m.groups()
    ends = []
    for tcap, cname in ((ta, ca), (tb, cb)):
        t = by_caption.get(tcap)
        if t is None:
            raise KeyError(f"Relationship table {tcap!r} not among {list(by_caption)}")
        col = next((c for c in t.columns if c.name == cname), None)
        if col is None:
            raise KeyError(f"Column {cname!r} not in table {tcap!r}")
        ends.append((t, col))
    r = etree.Element("relationship")
    expr = etree.SubElement(r, "expression", op="=")
    for _, col in ends:
        etree.SubElement(expr, "expression", op=col.local)
    etree.SubElement(r, "first-end-point", {"object-id": ends[0][0].object_id})
    etree.SubElement(r, "second-end-point", {"object-id": ends[1][0].object_id})
    return r


JOIN_TYPES = ("inner", "left", "right", "full")
_JOIN_RE = re.compile(r"^\s*(?:(inner|left|right|full)\s*:\s*)?(.+?)\.(.+?)\s*=\s*(.+?)\.(.+?)\s*$", re.I)


@dataclass
class _Join:
    kind: str
    left: Table
    lcol: Column
    right: Table
    rcol: Column


def _parse_joins(joins: list[str], by_caption: dict[str, Table]) -> list[_Join]:
    """'left: Ventas.Region = Regiones.Region' (default inner). The right table joins the left one's logical
    table: joined tables merge into one logical table (Tableau's physical layer)."""
    out = []
    for j in joins:
        m = _JOIN_RE.match(j)
        if not m:
            raise ValueError(f"Bad join {j!r}; expected '[inner|left|right|full:] TableA.Col = TableB.Col'")
        kind, ta, ca, tb, cb = m.groups()
        ends = []
        for tcap, cname in ((ta, ca), (tb, cb)):
            t = by_caption.get(tcap)
            if t is None:
                raise KeyError(f"Join table {tcap!r} not among {list(by_caption)}")
            col = next((c for c in t.columns if c.name == cname), None)
            if col is None:
                raise KeyError(f"Column {cname!r} not in table {tcap!r}")
            ends.append((t, col))
        out.append(_Join((kind or "inner").lower(), ends[0][0], ends[0][1], ends[1][0], ends[1][1]))
    return out


def _join_relation(root_t: Table, joins: list[_Join], cname_of, tag: str = "relation") -> etree._Element:
    """Left-deep join tree, as Tableau writes it: <relation type='join' join='inner'><clause type='join'>
    <expression op='='>[A].[col] [B].[col]</expression></clause> left right</relation>."""
    rel = _relation(root_t, cname_of(root_t))
    for j in joins:
        jr = etree.Element("relation", join=j.kind, type="join")
        clause = etree.SubElement(jr, "clause", type="join")
        eq = etree.SubElement(clause, "expression", op="=")
        etree.SubElement(eq, "expression", op=f"[{j.left.caption}].[{j.lcol.name}]")
        etree.SubElement(eq, "expression", op=f"[{j.right.caption}].[{j.rcol.name}]")
        jr.append(rel)
        jr.append(_relation(j.right, cname_of(j.right)))
        rel = jr
    rel.tag = tag
    return rel


def build_datasource(tables: list[Table], relationships: list[str] | None = None,
                     joins: list[str] | None = None) -> etree._Element:
    """A ``<datasource>`` element (tds-shaped) for one or more logical tables. `joins` merge physical tables
    into the logical table of their left side; `relationships` relate logical tables."""
    if not tables:
        raise ValueError("At least one source table is required")
    relationships = relationships or []
    captions = [t.caption for t in tables]
    if len(set(captions)) != len(captions):
        raise ValueError(f"Table captions must be unique: {captions}")
    parsed = _parse_joins(joins or [], {t.caption: t for t in tables})
    group: dict[str, Table] = {t.caption: t for t in tables}  # the logical table each table belongs to
    members: dict[str, list[_Join]] = {}
    for j in parsed:
        if group[j.right.caption] is not j.right or j.right is tables[0] or j.right.caption in members:
            raise ValueError(f"Table {j.right.caption!r} is already joined or is a join root: join each table once")
        g = group[j.left.caption]
        group[j.right.caption] = g
        members.setdefault(g.caption, []).append(j)
    logical = [t for t in tables if group[t.caption] is t]
    if len(logical) > 1 and len(relationships) < len(logical) - 1:
        raise ValueError(f"{len(logical)} logical tables need at least {len(logical) - 1} relationships ('A.col = B.col')")
    # Tableau re-pairs logical tables with their objects in its own order: the root (first) table,
    # then the rest alphabetically by caption, as in the documents it writes. Building in any other
    # order makes it bind columns to the wrong table ("Logical Query missing field ... from relationOp").
    logical = [logical[0], *sorted(logical[1:], key=lambda t: t.caption.casefold())]
    tables = [t for lt in logical for t in [lt, *(j.right for j in members.get(lt.caption, []))]]

    used: set[str] = set()
    for t in logical:
        t.object_id = f"{re.sub(r'[^A-Za-z0-9]', '_', t.caption)}_{uuid.uuid4().hex.upper()}"
    for t in tables:
        t.object_id = group[t.caption].object_id
        for c in t.columns:
            local = f"[{c.name}]"
            if local.lower() in used:
                local = f"[{c.name} ({t.caption})]"
            used.add(local.lower())
            c.local = local

    ds = etree.Element("datasource", inline="true", version="18.1")
    manifest = etree.SubElement(ds, "document-format-change-manifest")
    for tag in ("_.fcp.ObjectModelEncapsulateLegacy.true...ObjectModelEncapsulateLegacy",
                "_.fcp.ObjectModelTableType.true...ObjectModelTableType",
                "_.fcp.SchemaViewerObjectModel.true...SchemaViewerObjectModel"):
        etree.SubElement(manifest, tag)
    fed = etree.SubElement(ds, "connection", {"class": "federated"})
    named = etree.SubElement(fed, "named-connections")
    conn_names: dict[tuple, str] = {}
    for t in tables:
        key = (t.kind, str(t.path))
        if key in conn_names:
            continue
        cname = f"{'textscan' if t.kind == 'csv' else 'excel-direct'}.{_rand()}"
        conn_names[key] = cname
        nc = etree.SubElement(named, "named-connection", caption=t.path.stem, name=cname)
        nc.append(_connection_csv(t) if t.kind == "csv" else _connection_excel(t))

    def cname_of(t: Table) -> str:
        return conn_names[(t.kind, str(t.path))]

    def physical(lt: Table, tag: str = "relation") -> etree._Element:
        return _join_relation(lt, members.get(lt.caption, []), cname_of, tag)

    # Legacy (pre-object-model) view of the first logical table, and the object-model collection.
    fed.append(physical(logical[0], "_.fcp.ObjectModelEncapsulateLegacy.false...relation"))
    if len(logical) == 1:
        fed.append(physical(logical[0], "_.fcp.ObjectModelEncapsulateLegacy.true...relation"))
    else:
        coll = etree.SubElement(fed, "_.fcp.ObjectModelEncapsulateLegacy.true...relation", type="collection")
        for lt in logical:
            coll.append(physical(lt))
    cols = etree.SubElement(fed, "cols")
    for t in tables:
        for c in t.columns:
            etree.SubElement(cols, "map", key=c.local, value=f"[{t.caption}].[{c.name}]")
    mrs = etree.SubElement(fed, "metadata-records")
    for t in tables:
        mrs.append(_capability(t))
    for t in tables:
        for c in t.columns:
            mrs.append(_column_record(t, c))

    etree.SubElement(ds, "aliases", enabled="yes")
    for t in tables:  # ID-like integers are dimensions, not measures to be summed.
        for c in t.columns:
            if c.datatype == "integer" and ID_RE.search(c.name):
                etree.SubElement(ds, "column", datatype="integer", name=c.local, role="dimension", type="ordinal")
    for t in logical:
        etree.SubElement(ds, "_.fcp.ObjectModelTableType.true...column", caption=t.caption, datatype="table",
                         name=f"[__tableau_internal_object_id__].[{t.object_id}]", role="measure", type="quantitative")
    etree.SubElement(ds, "layout", {"dim-ordering": "alphabetic", "measure-ordering": "alphabetic", "show-structure": "true"})

    graph = etree.SubElement(ds, "_.fcp.ObjectModelEncapsulateLegacy.true...object-graph")
    objs = etree.SubElement(graph, "objects")
    for t in logical:
        o = etree.SubElement(objs, "object", caption=t.caption, id=t.object_id)
        props = etree.SubElement(o, "properties", context="")
        props.append(physical(t))
    if relationships:
        rels = etree.SubElement(graph, "relationships")
        by_caption = {t.caption: t for t in tables}
        for r in relationships:
            rels.append(_relationship_el(r, by_caption))
    return ds


def add_file_datasource(
    root: etree._Element, sources: list[str], relationships: list[str] | None = None, caption: str | None = None,
    joins: list[str] | None = None,
) -> dict:
    """Read the sources, build the datasource and embed it. Returns its name, caption and tables."""
    tables = [read_source(s) for s in sources]
    ds = build_datasource(tables, relationships, joins)
    cap = caption or (tables[0].caption if len(tables) == 1 else " + ".join(t.caption for t in tables))
    name = twb.embed_datasource(root, ds, cap)
    return {"name": name, "caption": cap, "tables": [t.as_dict() for t in tables],
            "fields": {c.local.strip("[]"): c.datatype for t in tables for c in t.columns}}
