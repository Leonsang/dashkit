"""One registry of every operation, by object type (the powerbi-modeling-mcp ``*_operations`` pattern).

``run(object, operation, params, target, definitions, dry_run)`` dispatches:

* ``edit``  operations mutate the workbook: fn(root, **params). They go through ``ops.edit_tx`` (validate ->
  backup -> apply/save, or into the active transaction's working copy).
* ``read``  operations inspect the workbook: fn(root, **params).
* ``plain`` operations need no workbook (Desktop process, settings, files): fn(**params).
* ``target`` operations take the target itself: fn(target, **params).

``definitions`` runs the same operation for many param sets in ONE load/validate/apply (bulk).
"""

from __future__ import annotations

import inspect
from collections.abc import Callable
from dataclasses import dataclass

from . import authoring as A
from . import extracts
from . import connectors, desktop_setup, ops, settings, twb
from .client import DesktopClient, list_instances


@dataclass
class Op:
    fn: Callable
    kind: str  # edit | read | plain | target

    @property
    def doc(self) -> str:
        return inspect.cleandoc(self.fn.__doc__ or "").replace("\n", " ")

    @property
    def params(self) -> str:
        sig = inspect.signature(self.fn)
        ps = list(sig.parameters.values())
        if self.kind in ("edit", "read", "target") and ps:
            ps = ps[1:]
        out = []
        for p in ps:
            if p.kind in (p.VAR_KEYWORD, p.VAR_POSITIONAL):
                continue
            out.append(p.name if p.default is inspect.Parameter.empty else f"{p.name}={p.default!r}")
        return ", ".join(out)


def _client_for(target: str) -> DesktopClient:
    pid = int(target.split(":", 1)[1]) if target.startswith("live:") else None
    return DesktopClient.connect(pid=pid)


# ---- small adapters ----------------------------------------------------------------------------
def _ds_list(root):
    return [{"name": d.get("name"), "caption": d.get("caption"), "fields": len(twb.fields(d)),
             "connections": sorted({c.get("class") for c in d.iter("connection")} - {"federated"})}
            for d in twb.datasources(root)]


def _ds_get(root, datasource: str):
    """Datasource details: connections, logical tables, relationships, field count."""
    d = twb.find_datasource(root, datasource)
    return {"name": d.get("name"), "caption": d.get("caption"),
            "connections": [dict(c.attrib) for c in d.iter("connection") if c.get("class") != "federated"],
            "tables": [o.get("caption") for o in d.iter("object")],
            "relationships": A.list_relationships(root, datasource), "fields": len(twb.fields(d))}


def _from_files(root, sources: list, relationships: list | None = None, caption: str | None = None):
    """CSV/TXT/Excel sources ("Caption=path.csv", "path.xlsx#Sheet"); first = root table; relationships
    "Fact.Col = Dim.Col"."""
    return connectors.add_file_datasource(root, sources, relationships, caption)


def _from_tds(root, path: str, caption: str | None = None):
    """Embed a .tds data source file."""
    return twb.add_datasource_from_tds(root, path, caption)


def _ws_list(root):
    return twb.sheet_names(root)


def _ws_delete(root, name: str):
    """Delete a worksheet, dashboard or story."""
    twb.remove_sheet(root, name)
    return {"deleted": name}


def _ws_rename(root, name: str, new_name: str):
    """Rename a sheet (zones, viewpoints and story points follow)."""
    twb.rename_sheet(root, name, new_name)
    return {"renamed": name, "to": new_name}


def _db_create(root, name: str, sheets: list, layout: str = "grid", width: int = 1200, height: int = 800,
               title: bool = True):
    """Tiled, fixed-size dashboard with the given worksheets. layout: grid | vertical | horizontal."""
    return twb.add_dashboard(root, name, sheets, layout, width, height, title)


def _db_size(root, name: str, width: int | None = None, height: int | None = None, mode: str = "fixed"):
    """Dashboard size: fixed | range | automatic."""
    twb.set_dashboard_size(root, name, width, height, mode)
    return {"dashboard": name, "mode": mode}


def _calc_create(root, datasource: str, name: str, formula: str, datatype: str = "real", role: str | None = None,
                 default_format: str | None = None, description: str | None = None):
    """Calculated field (also LOD: '{FIXED [Customer]: SUM([Sales])}', table calcs: 'RUNNING_SUM(SUM([Sales]))').
    Reference another calc by its caption in brackets."""
    import re  # noqa: PLC0415

    ds = twb.find_datasource(root, datasource)
    # Let agents reference calcs and parameters by caption: rewrite [Caption] -> internal name.
    for f in twb.fields(ds):
        if f.is_calc and f.caption != f.name.strip("[]"):
            formula = re.sub(r"(?<![\.\w])\[" + re.escape(f.caption) + r"\]", f.name, formula)
    internal = twb.add_calculated_field(root, datasource, name, formula, datatype, role, default_format)
    if description:
        A.update_field(root, datasource, internal, description=description)
    return {"field": internal, "formula": formula}


def _desktop_status():
    """Registry flag, running Desktop processes and API instances."""
    return {**desktop_setup.status().as_dict(), "instances": [i.public() for i in list_instances()]}


def _desktop_launch(workbook: str | None = None, wait: int = 120, allow_second_instance: bool = False):
    """Start Desktop (optionally opening a .twb/.twbx) and wait for its API. Refuses while another Desktop is
    running (several instances compete for memory and the API) unless allow_second_instance=True."""
    import time  # noqa: PLC0415

    running = desktop_setup.tableau_running()
    if running and not allow_second_instance:
        return {"refused": "Tableau Desktop is already running", "runningPids": running,
                "hint": "close it first, or work on it with target='live'"}
    before = {i.pid for i in list_instances()}
    desktop_setup.launch(workbook=workbook)
    for _ in range(wait // 2):
        time.sleep(2)
        new = [i for i in list_instances() if i.pid not in before]
        if new:
            return {"instance": new[0].public()}
    return {"started": True, "api": "not yet available"}


def _workbook_info(root):
    return {**twb.sheet_names(root), "datasources": _ds_list(root), "parameters": A.list_parameters(root),
            "actions": A.list_actions(root)}


def _workbook_xml(root, part: str | None = None):
    """Full workbook XML, or one part: a sheet/dashboard/datasource name."""
    if not part:
        return twb.serialize(root)
    from lxml import etree  # noqa: PLC0415

    for el in root.iter("worksheet", "dashboard", "datasource"):
        if part in (el.get("name"), el.get("caption")):
            return etree.tostring(el, encoding="unicode")
    raise KeyError(part)


def _apply_xml(target: str, xml: str, force: bool = False):
    """Validate and apply/save a complete workbook XML."""
    return ops.save(target, xml, force=force)


def _validate_xml(target: str, xml: str):
    """Validate workbook XML with Desktop's schema validator (no changes)."""
    return ops.validate(xml, target)


def _image(target: str, sheet: str, kind: str = "dashboards", path: str | None = None,
           allow_worksheet: bool = False):
    """PNG of the dashboard on screen (API 0.1.1 only renders the visible one; workbook ShowSheet brings
    another one on screen first). Saves to path if given."""
    data = _client_for(target).sheet_image(kind, sheet, allow_worksheet)
    if path:
        from pathlib import Path  # noqa: PLC0415

        Path(path).write_bytes(data)
        return {"saved": path, "bytes": len(data)}
    return {"bytes": len(data), "hint": "pass path=... to save, or use the export_image MCP tool to see it"}


def _summary(target: str, sheet: str, max_rows: int = 100):
    """Aggregated data behind a rendered worksheet."""
    return _client_for(target).summary_data(sheet, max_rows=max_rows)


def _lint(target: str):
    """Best-practice report (score 0-100, findings with fixes and sources)."""
    return ops.lint_target(target)


def _save_as(target: str, path: str):
    """Save the target's current XML (live workbook or transaction copy) to a .twb/.twbx file."""
    from pathlib import Path  # noqa: PLC0415

    root = ops.read_root(target)
    p = twb.write_workbook_file(path, twb.serialize(root),
                                base_twbx=target if str(target).lower().endswith(".twbx") and Path(target).exists() else None)
    return {"saved": str(p)}


REGISTRY: dict[str, dict[str, Op]] = {
    "desktop": {
        "Status": Op(_desktop_status, "plain"),
        "EnableApi": Op(lambda version=None: desktop_setup.enable(version).as_dict(), "plain"),
        "DisableApi": Op(lambda version=None: desktop_setup.disable(version).as_dict(), "plain"),
        "Launch": Op(_desktop_launch, "plain"),
        "ListInstances": Op(lambda: [i.public() for i in list_instances()], "plain"),
        "ErrorDialogs": Op(lambda dismiss=True: desktop_setup.error_dialogs(dismiss=dismiss), "plain"),
        "Warnings": Op(lambda pid=None, since=None, limit=50: desktop_setup.desktop_warnings(pid, since, limit), "plain"),
    },
    "settings": {
        "ListGroups": Op(settings.list_groups, "plain"),
        "List": Op(settings.list_values, "plain"),
        "Get": Op(settings.get_value, "plain"),
        "Set": Op(settings.set_value, "plain"),
        "Delete": Op(settings.delete_value, "plain"),
        "ListPalettes": Op(settings.list_palettes, "plain"),
        "CreatePalette": Op(settings.create_palette, "plain"),
        "DeletePalette": Op(settings.delete_palette, "plain"),
        "RepositoryPath": Op(lambda: str(settings.repository_path()), "plain"),
    },
    "transaction": {
        "Begin": Op(ops.tx_begin, "target"),
        "Status": Op(ops.tx_status, "target"),
        "Commit": Op(ops.tx_commit, "target"),
        "Rollback": Op(ops.tx_rollback, "target"),
    },
    "workbook": {
        "Info": Op(_workbook_info, "read"),
        "GetXml": Op(_workbook_xml, "read"),
        "ApplyXml": Op(_apply_xml, "target"),
        "Validate": Op(_validate_xml, "target"),
        "New": Op(lambda path: ops.new_file(path), "plain"),
        "SaveAs": Op(_save_as, "target"),
        "Lint": Op(_lint, "target"),
        "ExportImage": Op(_image, "target"),
        "SummaryData": Op(_summary, "target"),
        "ListBackups": Op(lambda limit=20: ops.list_backups(limit), "plain"),
        "Restore": Op(lambda target, backup: ops.restore(backup, target), "target"),
        "Reopen": Op(lambda pending, confirm=False, wait=180: ops.reopen(pending, confirm, wait), "plain"),
        "ShowSheet": Op(lambda sheet, confirm=False: ops.show_sheet(sheet, confirm), "plain"),
        "SetStartSheet": Op(A.set_start_sheet, "edit"),
        "ReorderSheets": Op(A.reorder_sheets, "edit"),
        "Format": Op(A.format_workbook, "edit"),
    },
    "datasource": {
        "List": Op(_ds_list, "read"),
        "Get": Op(_ds_get, "read"),
        "PreviewFile": Op(lambda source: connectors.read_source(source).as_dict(), "plain"),
        "CreateFromFiles": Op(_from_files, "edit"),
        "CreateFromTds": Op(_from_tds, "edit"),
        "CreateDatabase": Op(A.create_database_datasource, "edit"),
        "Rename": Op(A.rename_datasource, "edit"),
        "Delete": Op(A.delete_datasource, "edit"),
        "AddFilter": Op(A.add_datasource_filter, "edit"),
        "CreateExtract": Op(extracts.create_extract, "edit"),
        "ListRelationships": Op(A.list_relationships, "read"),
    },
    "field": {
        "List": Op(A.list_fields, "read"),
        "Update": Op(A.update_field, "edit"),
        "SetAliases": Op(A.set_aliases, "edit"),
        "Delete": Op(A.delete_field, "edit"),
    },
    "calculation": {
        "List": Op(A.list_calculations, "read"),
        "Create": Op(_calc_create, "edit"),
        "Update": Op(A.update_calculation, "edit"),
        "Delete": Op(A.delete_field, "edit"),
    },
    "parameter": {
        "List": Op(A.list_parameters, "read"),
        "Create": Op(A.create_parameter, "edit"),
        "Update": Op(A.update_parameter, "edit"),
        "Delete": Op(A.delete_parameter, "edit"),
    },
    "group": {"Create": Op(A.create_group, "edit"), "Delete": Op(A.delete_field, "edit")},
    "set": {"Create": Op(A.create_set, "edit"),
            "Delete": Op(lambda root, datasource, name: A.delete_structure(root, datasource, "set", name), "edit")},
    "bin": {"Create": Op(A.create_bin, "edit"), "Delete": Op(A.delete_field, "edit")},
    "hierarchy": {"Create": Op(A.create_hierarchy, "edit"),
                  "Delete": Op(lambda root, datasource, name: A.delete_structure(root, datasource, "hierarchy", name), "edit")},
    "folder": {"Create": Op(A.create_folder, "edit"),
               "Delete": Op(lambda root, datasource, name: A.delete_structure(root, datasource, "folder", name), "edit")},
    "worksheet": {
        "List": Op(_ws_list, "read"),
        "Get": Op(A.describe_worksheet, "read"),
        "Create": Op(A.create_worksheet, "edit"),
        "Delete": Op(_ws_delete, "edit"),
        "Rename": Op(_ws_rename, "edit"),
        "Duplicate": Op(A.duplicate_sheet, "edit"),
        "SetShelf": Op(A.set_shelf, "edit"),
        "SetMark": Op(A.set_mark, "edit"),
        "SetEncoding": Op(A.set_encoding, "edit"),
        "SetSort": Op(A.set_sort, "edit"),
        "SetTotals": Op(A.set_totals, "edit"),
        "SetDualAxis": Op(A.set_dual_axis, "edit"),
        "SetSharedAxis": Op(A.set_shared_axis, "edit"),
        "MakeMap": Op(A.make_map, "edit"),
        "OrientTableCalcs": Op(A.orient_table_calcs, "edit"),
        "SetVisibility": Op(A.set_sheet_visibility, "edit"),
        "AddCard": Op(A.add_card, "edit"),
    },
    "filter": {
        "List": Op(A.list_filters, "read"),
        "Add": Op(A.add_filter, "edit"),
        "AddShared": Op(A.add_shared_filter, "edit"),
        "Remove": Op(A.remove_filter, "edit"),
    },
    "analytics": {
        "AddReferenceLine": Op(A.add_reference_line, "edit"),
        "AddTrendLine": Op(A.add_trend_line, "edit"),
        "AddForecast": Op(A.add_forecast, "edit"),
        "Remove": Op(A.remove_analytics, "edit"),
    },
    "format": {
        "Marks": Op(A.format_marks, "edit"),
        "ColorPalette": Op(A.set_color_palette, "edit"),
        "Worksheet": Op(A.format_worksheet, "edit"),
        "Field": Op(A.format_field, "edit"),
        "Title": Op(A.set_title, "edit"),
        "Tooltip": Op(A.set_tooltip, "edit"),
        "Workbook": Op(A.format_workbook, "edit"),
        "Dashboard": Op(A.format_dashboard, "edit"),
        "Zone": Op(A.format_zone, "edit"),
        "Backgrounds": Op(A.set_backgrounds, "edit"),
        "Banding": Op(A.set_banding, "edit"),
        "Borders": Op(A.set_borders, "edit"),
        "Lines": Op(A.set_lines, "edit"),
        "Font": Op(A.set_font, "edit"),
        "TextRuns": Op(A.style_text_runs, "edit"),
        "MarkBorder": Op(A.format_mark_border, "edit"),
        "ReferenceLine": Op(A.format_reference_line, "edit"),
        "Container": Op(A.format_container, "edit"),
        "Story": Op(A.format_story, "edit"),
        "Style": Op(A.set_style, "edit"),
        "Elements": Op(lambda: A.STYLE_ELEMENTS, "plain"),
    },
    "dashboard": {
        "List": Op(lambda root: twb.sheet_names(root)["dashboards"], "read"),
        "ListZones": Op(A.list_zones, "read"),
        "Create": Op(_db_create, "edit"),
        "Delete": Op(_ws_delete, "edit"),
        "Rename": Op(_ws_rename, "edit"),
        "SetSize": Op(_db_size, "edit"),
        "AddZone": Op(A.add_zone, "edit"),
        "RemoveZone": Op(A.remove_zone, "edit"),
        "AddDeviceLayout": Op(A.add_device_layout, "edit"),
    },
    "action": {
        "List": Op(A.list_actions, "read"),
        "Create": Op(A.create_action, "edit"),
        "Delete": Op(A.delete_action, "edit"),
    },
    "story": {
        "Create": Op(A.create_story, "edit"),
        "AddPoint": Op(A.add_story_point, "edit"),
        "Delete": Op(_ws_delete, "edit"),
    },
}

OBJECT_HELP = {
    "desktop": "Tableau Desktop process: API flag, launch, instances, modal error dialogs, log warnings.",
    "settings": "Desktop preferences (registry groups), custom color palettes (Preferences.tps), repository path.",
    "transaction": "Batch edits: Begin, run any edits, Commit (one validate + one apply) or Rollback.",
    "workbook": "Whole workbook: info, XML, validate/apply, save as, lint, image export, backups, start sheet, format.",
    "datasource": "Connections: files (CSV/Excel, multi-table relationships), .tds, databases, filters, rename/delete.",
    "field": "Field properties: caption, role/type, datatype, hidden, default format, description, geo role, aliases.",
    "calculation": "Calculated fields, LOD expressions, table-calc formulas.",
    "parameter": "Parameters: range, list or any value; reference as [Parameters].[Name].",
    "group": "Groups of dimension members.",
    "set": "Sets by members, condition or top N. Use IN_OUT(Set) on shelves for In/Out.",
    "bin": "Bins over a measure (histograms).",
    "hierarchy": "Drill-down hierarchies.",
    "folder": "Data-pane folders.",
    "worksheet": "Sheets: create in one call, shelves, marks, encodings, sort, totals, dual/shared axis, maps, pages.",
    "filter": "Worksheet filters: values, ranges, relative dates, top N, conditions, wildcard, context, filter cards.",
    "analytics": "Reference lines/bands, trend lines, forecasts.",
    "format": "Formatting: backgrounds (worksheet, pane, header, title, cards, dashboard, containers, zones, "
              "story), banding, borders, lines, fonts per element, rich text, mark borders, palettes, number formats, "
              "axes, reference-line styling, tooltips. Style is the generic setter; Elements lists style elements.",
    "dashboard": "Dashboards: create, size, zones (sheet, text, image, web, blank, legend, filter, parameter, "
                 "container, highlighter; tiled or floating), device layouts.",
    "action": "Dashboard actions: filter, highlight, URL, go to sheet.",
    "story": "Stories and story points.",
}


def describe(obj: str | None = None) -> dict:
    objs = [obj] if obj else list(REGISTRY)
    return {o: {"help": OBJECT_HELP.get(o, ""),
                "operations": {name: f"({op.params}) {op.doc}".strip() for name, op in REGISTRY[o].items()}}
            for o in objs}


def run(obj: str, operation: str, params: dict | None = None, target: str = "live",
        definitions: list[dict] | None = None, dry_run: bool = False, out: str | None = None,
        force: bool = False):
    if obj not in REGISTRY:
        raise KeyError(f"Unknown object {obj!r}. Objects: {list(REGISTRY)}")
    ops_ = REGISTRY[obj]
    match = next((k for k in ops_ if k.lower() == operation.lower()), None)
    if match is None:
        raise KeyError(f"Unknown {obj} operation {operation!r}. Operations: {list(ops_)}")
    op = ops_[match]
    batch = definitions if definitions else [params or {}]
    if op.kind == "plain":
        res = [op.fn(**p) for p in batch]
    elif op.kind == "target":
        res = [op.fn(target, **p) for p in batch]
    elif op.kind == "read":
        root = ops.read_root(target)
        res = [op.fn(root, **p) for p in batch]
    else:
        return ops.edit_tx(target, lambda root: [op.fn(root, **p) for p in batch] if definitions
                           else op.fn(root, **batch[0]), out=out, dry_run=dry_run, force=force)
    return res if definitions else res[0]
