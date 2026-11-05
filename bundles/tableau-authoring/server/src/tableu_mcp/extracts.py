"""Extracts (.hyper) for file data sources, built with Tableau's own Hyper API.

Desktop has no API call to extract a data source, so tableu writes the .hyper itself and points the
data source at it, in the shape Desktop writes:

    <extract count='-1' enabled='true' units='records'>
      <connection class='hyper' dbname='...hyper' schema='Extract' tablename='Extract' ...>
        <relation name='Extract' table='[Extract].[Extract]' type='table' />
        <metadata-records> one per column, parent-name [Extract], family = the source table </metadata-records>

The live connection stays in place, as in Desktop's own documents, so the extract can be refreshed or
removed later. Only data sources with one logical table: a multi-table extract's on-disk layout is not
something tableu has a verified sample of, and a wrong one fails to load.
"""

from __future__ import annotations

import csv
import datetime as dt
import uuid
from pathlib import Path

from lxml import etree

from . import twb

EXTRACT_DIR = Path.home() / ".tableu" / "extracts"
HYPER_REMOTE_TYPE = {"string": 129, "integer": 20, "real": 5, "boolean": 11, "date": 133, "datetime": 135}


def _sql_type(local_type: str):
    from tableauhyperapi import SqlType  # noqa: PLC0415

    return {
        "string": SqlType.text(), "integer": SqlType.big_int(), "real": SqlType.double(),
        "boolean": SqlType.bool(), "date": SqlType.date(), "datetime": SqlType.timestamp(),
    }[local_type]


def _convert(value, local_type: str):
    if value is None or (isinstance(value, str) and value.strip() == ""):
        return None
    try:
        if local_type == "integer":
            return int(float(value))
        if local_type == "real":
            return float(value)
        if local_type == "boolean":
            return str(value).strip().lower() in ("true", "1", "yes", "si", "sí", "verdadero")
        if local_type == "date":
            return value.date() if isinstance(value, dt.datetime) else (
                value if isinstance(value, dt.date) else dt.date.fromisoformat(str(value)[:10]))
        if local_type == "datetime":
            return value if isinstance(value, dt.datetime) else dt.datetime.fromisoformat(str(value).replace("T", " "))
    except (TypeError, ValueError):
        return None
    return str(value)


def _source_rows(conn: etree._Element, relation: etree._Element, names: list[str]) -> list[list]:
    """Rows of one file table, as values keyed by the source's column order."""
    named = conn.find(".//named-connection/connection")
    if named is None:
        raise ValueError("not a file data source (no named connection)")
    cls = named.get("class")
    if cls == "textscan":
        path = Path(named.get("directory")) / named.get("filename")
        raw = path.read_text(encoding="utf-8-sig")
        try:
            sep = csv.Sniffer().sniff(raw[:20000], delimiters=",;|\t").delimiter
        except csv.Error:
            sep = ","
        rows = list(csv.reader(raw.splitlines(), delimiter=sep))
        header = [h.strip() for h in rows[0]]
        idx = [header.index(n) for n in names]
        return [[r[i] if i < len(r) else None for i in idx] for r in rows[1:]]
    if cls == "excel-direct":
        from openpyxl import load_workbook  # noqa: PLC0415

        sheet = (relation.get("table") or "").strip("[]").rstrip("$")
        wb = load_workbook(named.get("filename"), read_only=True, data_only=True)
        ws = wb[sheet] if sheet in wb.sheetnames else wb.worksheets[0]
        it = ws.iter_rows(values_only=True)
        header = [str(h).strip() if h is not None else "" for h in next(it)]
        idx = [header.index(n) for n in names]
        out = [[r[i] if i < len(r) else None for i in idx] for r in it if any(v is not None for v in r)]
        wb.close()
        return out
    raise ValueError(f"extracts are supported for CSV/Excel sources, not {cls!r}")


def create_extract(root, datasource: str, hyper_path: str | None = None) -> dict:
    """Extract a file data source (CSV/Excel, one logical table) to a .hyper and switch it to the extract."""
    try:
        from tableauhyperapi import (  # noqa: PLC0415
            Connection, CreateMode, HyperProcess, Inserter, TableDefinition, TableName, Telemetry,
        )
    except ImportError as e:  # pragma: no cover - dependency of the package
        raise RuntimeError("tableauhyperapi is required for extracts (it ships with tableu-mcp)") from e

    ds = twb.find_datasource(root, datasource)
    if ds.find("extract[@enabled='true']") is not None:
        raise ValueError(f"{datasource!r} is already an extract")
    conn = ds.find("connection")
    records = conn.findall("metadata-records/metadata-record[@class='column']") if conn is not None else []
    if not records:
        raise ValueError(f"{datasource!r} has no column metadata to extract")
    objects = {r.findtext("{*}object-id") or r.findtext("_.fcp.ObjectModelEncapsulateLegacy.true...object-id")
               for r in records}
    # One logical table = one object-id. (The relation also appears again under object-graph, so counting
    # <relation> elements over the whole tree would double it.)
    relation = next((r for r in (conn.find("_.fcp.ObjectModelEncapsulateLegacy.true...relation"),
                                 conn.find("relation"),
                                 conn.find("_.fcp.ObjectModelEncapsulateLegacy.false...relation")) if r is not None), None)
    if len(objects - {None}) > 1 or relation is None or relation.get("type") != "table":
        raise ValueError(f"{datasource!r} has {len(objects - {None})} logical tables; tableu only extracts "
                         "single-table sources. Use Data > Extract Data in Desktop for this one.")
    relations = [relation]

    cols = []
    for r in records:
        local = r.findtext("local-name")
        cols.append({
            "remote": r.findtext("remote-name"), "local": local, "name": local.strip("[]"),
            "type": r.findtext("local-type") or "string", "agg": r.findtext("aggregation") or "Count",
            "ordinal": r.findtext("ordinal") or "0", "family": (r.findtext("parent-name") or "").strip("[]"),
            "object": r.findtext("_.fcp.ObjectModelEncapsulateLegacy.true...object-id") or r.findtext("object-id"),
        })
    rows = _source_rows(conn, relations[0], [c["remote"] for c in cols])

    target = Path(hyper_path) if hyper_path else EXTRACT_DIR / f"{(ds.get('caption') or 'extract').replace(' ', '_')}_{uuid.uuid4().hex[:8]}.hyper"
    target.parent.mkdir(parents=True, exist_ok=True)
    # Tableau Desktop keeps the .hyper of an open workbook locked. Never fail on that: write a new file
    # beside it and point this workbook there; the locked one is left for Desktop.
    notes = []
    if _locked(target):
        locked, target = target, _free_name(target)
        notes.append(f"{locked.name} is in use (open in Tableau Desktop?); wrote {target.name} instead. "
                     f"Delete {locked.name} once Desktop has released it.")
    table = TableDefinition(TableName("Extract", "Extract"),
                            [TableDefinition.Column(c["name"], _sql_type(c["type"])) for c in cols])
    # hyperd writes its log to the working directory unless told otherwise: keep it out of the user's project.
    EXTRACT_DIR.mkdir(parents=True, exist_ok=True)
    with HyperProcess(Telemetry.DO_NOT_SEND_USAGE_DATA_TO_TABLEAU,
                      parameters={"log_dir": str(EXTRACT_DIR), "log_file_max_count": "2"}) as hp:
        with Connection(hp.endpoint, str(target), CreateMode.CREATE_AND_REPLACE) as hc:
            hc.catalog.create_schema("Extract")
            hc.catalog.create_table(table)
            with Inserter(hc, table) as ins:
                ins.add_rows([_convert(v, c["type"]) for v, c in zip(row, cols)] for row in rows)
                ins.execute()

    # No object-id attribute: the 2026.3 schema does not declare it (2024.3 documents carry it).
    ex = etree.Element("extract", {"count": "-1", "enabled": "true", "units": "records"})
    hconn = etree.SubElement(ex, "connection", {
        "access_mode": "readonly", "author-locale": "en_US", "class": "hyper",
        "dbname": str(target).replace("\\", "/"), "default-settings": "hyper", "schema": "Extract",
        "sslmode": "", "tablename": "Extract", "update-time": dt.datetime.now().strftime("%m/%d/%Y %I:%M:%S %p"),
        "username": "tableau_internal_user",
    })
    etree.SubElement(hconn, "relation", name="Extract", table="[Extract].[Extract]", type="table")
    mrs = etree.SubElement(hconn, "metadata-records")
    for c in cols:
        mr = etree.SubElement(mrs, "metadata-record", {"class": "column"})
        for tag, text in (("remote-name", c["name"]), ("remote-type", str(HYPER_REMOTE_TYPE.get(c["type"], 129))),
                          ("local-name", c["local"]), ("parent-name", "[Extract]"), ("remote-alias", c["name"]),
                          ("ordinal", c["ordinal"]), ("family", c["family"]), ("local-type", c["type"]),
                          ("aggregation", c["agg"]), ("contains-null", "true")):
            etree.SubElement(mr, tag).text = text
        if c["object"]:
            etree.SubElement(mr, "object-id").text = c["object"]

    from .authoring import DATASOURCE_ORDER, _insert_ordered  # noqa: PLC0415

    _insert_ordered(ds, ex, DATASOURCE_ORDER)
    # The logical table also has to know where its rows live when extracted; without this the
    # workbook fails to load (checked against Desktop 2026.3, 2026-11-04).
    for graph in (ds.find("object-graph"), ds.find("_.fcp.ObjectModelEncapsulateLegacy.true...object-graph")):
        if graph is None:
            continue
        for obj in graph.iter("object"):
            if obj.find("properties[@context='extract']") is None:
                props = etree.SubElement(obj, "properties", context="extract")
                etree.SubElement(props, "relation", name="Extract", table="[Extract].[Extract]", type="table")
    out = {"datasource": ds.get("caption") or ds.get("name"), "hyper": str(target), "rows": len(rows),
           "columns": len(cols)}
    return {**out, "notes": notes} if notes else out


def _locked(path: Path) -> bool:
    """True when another process holds the file: renaming it onto itself fails on Windows then."""
    if not path.exists():
        return False
    try:
        path.replace(path)
        with open(path, "r+b"):
            pass
    except PermissionError:
        return True
    except OSError:
        return True
    return False


def _free_name(path: Path) -> Path:
    for i in range(2, 1000):
        candidate = path.with_name(f"{path.stem}-{i}{path.suffix}")
        if not candidate.exists() or not _locked(candidate):
            return candidate
    return path.with_name(f"{path.stem}-{uuid.uuid4().hex[:8]}{path.suffix}")
