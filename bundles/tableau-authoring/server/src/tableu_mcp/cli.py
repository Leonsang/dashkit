"""`tableu` command line. Every command prints JSON so agents can parse it.

Targets: `live` (default; the workbook open in Tableau Desktop), `live:<pid>`, or a .twb/.twbx path.
"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

from . import connectors, desktop_setup, ops, twb
from .client import DesktopClient, list_instances


def _out(obj) -> None:
    sys.stdout.write(json.dumps(obj, indent=2, ensure_ascii=False, default=str) + "\n")


def _csv(v: str | None) -> list[str]:
    return [s.strip() for s in v.split(",") if s.strip()] if v else []


def main(argv: list[str] | None = None) -> int:
    p = argparse.ArgumentParser(prog="tableu", description="Drive Tableau Desktop and lint workbooks.")
    sub = p.add_subparsers(dest="cmd", required=True)

    def cmd(name, help_, target=False, write=False):
        sp = sub.add_parser(name, help=help_)
        if target:
            sp.add_argument("-t", "--target", default="live", help="live | live:<pid> | path/to/file.twb[x]")
        if write:
            sp.add_argument("-o", "--out", help="write the result to this file instead of the target")
            sp.add_argument("--dry-run", action="store_true", help="validate only, don't apply")
            sp.add_argument("--force", action="store_true", help="apply even if validation fails")
        return sp

    # generic object operations (same registry as the MCP <object>_operations tools)
    sp = cmd("ops", "List object types and their operations")
    sp.add_argument("object", nargs="?")
    sp = cmd("op", "Run an operation: tableu op <object> <operation> --params '{...}'", target=True, write=True)
    sp.add_argument("object")
    sp.add_argument("operation")
    sp.add_argument("--params", default="{}", help="JSON object, or @file.json")
    sp.add_argument("--defs", help="JSON list of params objects for a bulk run, or @file.json")

    # setup / instances
    cmd("status", "External Client API status (registry flag, running instances)").add_argument("--version")
    cmd("enable", "Enable the External Client API (restart Tableau afterwards)").add_argument("--version")
    cmd("disable", "Disable the External Client API").add_argument("--version")
    sp = cmd("launch", "Start Tableau Desktop (optionally opening a workbook)")
    sp.add_argument("workbook", nargs="?")
    sp.add_argument("--wait", type=int, default=90, help="seconds to wait for the API")
    sp.add_argument("--force", action="store_true", help="open the workbook even if Preflight finds load errors")
    cmd("instances", "List running Desktop instances exposing the API")
    sp = cmd("api", "Raw GET against the External Client API")
    sp.add_argument("path", help="e.g. /v0/app or /openapi.json")

    # read
    cmd("info", "Sheets and datasources", target=True)
    sp = cmd("fields", "Fields of a datasource", target=True)
    sp.add_argument("datasource")
    sp = cmd("xml", "Print / save the workbook XML (or one sheet's XML for live)", target=True)
    sp.add_argument("--sheet")
    sp.add_argument("--kind", default="worksheets", choices=["worksheets", "dashboards", "storyboards"])
    sp.add_argument("--save")
    sp = cmd("lint", "Best-practice report", target=True)
    sp.add_argument("--fail-under", type=int, default=0, help="exit 1 if score is below this")
    sp = cmd("image", "Export a sheet/dashboard PNG (live)")
    sp.add_argument("sheet")
    sp.add_argument("--kind", default="dashboards", choices=["worksheets", "dashboards"])
    sp.add_argument("-o", "--out", required=True)
    sp.add_argument("--allow-worksheet", action="store_true",
                    help="export a worksheet (only if it is the sheet visible in Tableau)")
    sp = cmd("data", "Summary data of a worksheet (live)")
    sp.add_argument("sheet")
    sp.add_argument("--max-rows", type=int, default=100)

    # write
    sp = cmd("validate", "Validate an XML file with Desktop's schema validator")
    sp.add_argument("file")
    sp = cmd("apply", "Apply a .twb/.twbx file's XML to the live workbook (backs up first)", write=False)
    sp.add_argument("file")
    sp.add_argument("--force", action="store_true")
    sp = cmd("restore", "Restore a backup to the live workbook")
    sp.add_argument("backup", nargs="?", help="backup path (default: latest)")
    cmd("backups", "List backups of the live workbook")
    sp = cmd("new", "Create an empty .twb file")
    sp.add_argument("path")
    sp = cmd("add-datasource", "Embed a .tds data source", target=True, write=True)
    sp.add_argument("tds")
    sp.add_argument("--caption")
    sp = cmd("add-files", "Datasource from CSV/Excel files (first = fact table)", target=True, write=True)
    sp.add_argument("sources", nargs="+", help='"Caption=path.csv" or "path.xlsx#Sheet"')
    sp.add_argument("--rel", action="append", default=[], help='"Fact.Col = Dim.Col" (repeat)')
    sp.add_argument("--join", action="append", default=[], help='"[inner|left|right|full:] Fact.Col = Dim.Col" (repeat)')
    sp.add_argument("--caption")
    sp = cmd("preview-file", "Inferred schema of a CSV/Excel source")
    sp.add_argument("source")
    sp = cmd("dialogs", "Read Tableau's modal error dialogs")
    sp.add_argument("--dismiss", action="store_true")
    sp = cmd("add-calc", "Add a calculated field", target=True, write=True)
    sp.add_argument("datasource")
    sp.add_argument("name")
    sp.add_argument("formula")
    sp.add_argument("--datatype", default="real", choices=["real", "integer", "string", "boolean", "date", "datetime"])
    sp.add_argument("--role", choices=["measure", "dimension"])
    sp.add_argument("--format", help="default format, e.g. p0.0%% or 'c\"$\"#,##0'")
    sp = cmd("add-sheet", "Add a worksheet. Specs: 'Category', 'SUM(Sales)', 'YEAR(Order Date)', 'MONTH_TRUNC(Order Date)'", target=True, write=True)
    sp.add_argument("name")
    sp.add_argument("--datasource", required=True)
    sp.add_argument("--rows")
    sp.add_argument("--cols")
    sp.add_argument("--mark", default="automatic")
    sp.add_argument("--color")
    sp.add_argument("--size")
    sp.add_argument("--label")
    sp.add_argument("--detail")
    sp.add_argument("--tooltip")
    sp.add_argument("--title")
    sp.add_argument("--sort-desc-by")
    sp = cmd("add-dashboard", "Add a fixed-size tiled dashboard", target=True, write=True)
    sp.add_argument("name")
    sp.add_argument("--sheets", required=True)
    sp.add_argument("--layout", default="grid", choices=["grid", "vertical", "horizontal"])
    sp.add_argument("--width", type=int, default=1200)
    sp.add_argument("--height", type=int, default=800)
    sp.add_argument("--no-title", action="store_true")
    sp = cmd("dashboard-size", "Set dashboard sizing", target=True, write=True)
    sp.add_argument("name")
    sp.add_argument("--mode", default="fixed", choices=["fixed", "range", "automatic"])
    sp.add_argument("--width", type=int, default=1200)
    sp.add_argument("--height", type=int, default=800)
    sp = cmd("rename-sheet", "Rename a sheet", target=True, write=True)
    sp.add_argument("old")
    sp.add_argument("new")
    sp = cmd("remove-sheet", "Remove a sheet", target=True, write=True)
    sp.add_argument("name")

    a = p.parse_args(argv)
    try:
        return _run(a)
    except Exception as e:  # noqa: BLE001
        _out({"error": type(e).__name__, "message": str(e)})
        return 1


def _edit(a, fn):
    return ops.edit(a.target, fn, out=a.out, dry_run=a.dry_run, force=a.force)


def _run(a) -> int:
    c = a.cmd
    if c in ("ops", "op"):
        from . import registry  # noqa: PLC0415

        def _json_arg(v):
            if v is None:
                return None
            return json.loads(Path(v[1:]).read_text(encoding="utf-8") if v.startswith("@") else v)

        if c == "ops":
            _out(registry.describe(a.object))
            return 0
        try:
            _out(registry.run(a.object, a.operation, _json_arg(a.params), target=a.target,
                              definitions=_json_arg(a.defs), dry_run=a.dry_run, out=a.out, force=a.force))
        except Exception as e:  # noqa: BLE001
            _out({"error": f"{type(e).__name__}: {e}"})
            return 1
        return 0
    if c == "status":
        _out({**desktop_setup.status(a.version).as_dict(), "instances": [i.public() for i in list_instances()]})
    elif c == "enable":
        st = desktop_setup.enable(a.version)
        _out({**st.as_dict(), "next": "Restart Tableau Desktop (`tableu launch`) for the change to take effect." if st.running_pids else "Run `tableu launch`."})
    elif c == "disable":
        _out({**desktop_setup.disable(a.version).as_dict(), "next": "Restart Tableau Desktop."})
    elif c == "launch":
        if a.workbook and not a.force:
            check = ops.preflight(a.workbook)
            if not check["ok"]:
                _out({"refused": "workbook Preflight found what would stop Desktop loading it",
                      "issues": [i for i in check["issues"] if i["severity"] == "error"],
                      "hint": "fix those, or pass --force to open it anyway"})
                return 1
        running = desktop_setup.tableau_running()
        if running:
            _out({"refused": "Tableau Desktop is already running", "runningPids": running})
            return 1
        pid = desktop_setup.launch(workbook=a.workbook)
        try:
            inst = DesktopClient.connect(wait_seconds=a.wait).instance.public()
        except RuntimeError as e:
            inst = {"warning": str(e)}
        _out({"launchedPid": pid, "instance": inst})
    elif c == "instances":
        _out([i.public() for i in list_instances()])
    elif c == "api":
        _out(DesktopClient.connect().get_json(a.path))
    elif c == "info":
        _out(ops.inventory(a.target))
    elif c == "fields":
        _out(ops.list_fields(a.target, a.datasource))
    elif c == "xml":
        if a.sheet:
            xml = DesktopClient.connect().sheet_document(a.kind, a.sheet)
        else:
            xml = ops.load(a.target)
        if a.save:
            Path(a.save).write_text(xml, encoding="utf-8")
            _out({"saved": a.save, "bytes": len(xml)})
        else:
            sys.stdout.write(xml)
    elif c == "lint":
        rep = ops.lint_target(a.target)
        _out(rep)
        return 1 if rep["score"] < a.fail_under else 0
    elif c == "image":
        data = DesktopClient.connect().sheet_image(a.kind, a.sheet, allow_worksheet=a.allow_worksheet)
        Path(a.out).write_bytes(data)
        _out({"saved": a.out, "bytes": len(data)})
    elif c == "data":
        _out(DesktopClient.connect().summary_data(a.sheet, max_rows=a.max_rows))
    elif c == "validate":
        _out(ops.validate(twb.read_workbook_file(a.file)))
    elif c == "apply":
        _out(ops.save("live", twb.read_workbook_file(a.file), force=a.force))
    elif c == "restore":
        path = a.backup or (ops.list_backups(1) or [None])[0]
        if not path:
            raise RuntimeError("No backups found.")
        _out({"restored": path, **ops.restore(path)})
    elif c == "backups":
        _out(ops.list_backups())
    elif c == "new":
        _out(ops.new_file(a.path))
    elif c == "add-files":
        _out(_edit(a, lambda r: connectors.add_file_datasource(r, a.sources, a.rel, a.caption, a.join)))
    elif c == "preview-file":
        _out(connectors.read_source(a.source).as_dict())
    elif c == "dialogs":
        _out(desktop_setup.error_dialogs(dismiss=a.dismiss))
    elif c == "add-datasource":
        _out(_edit(a, lambda r: twb.add_datasource_from_tds(r, a.tds, a.caption)))
    elif c == "add-calc":
        _out(_edit(a, lambda r: twb.add_calculated_field(r, a.datasource, a.name, a.formula, a.datatype, a.role, a.format)))
    elif c == "add-sheet":
        _out(_edit(a, lambda r: twb.add_worksheet(
            r, a.name, a.datasource, rows=_csv(a.rows), cols=_csv(a.cols), mark=a.mark, color=a.color, size=a.size,
            label=a.label, detail=_csv(a.detail), tooltip=_csv(a.tooltip), title=a.title, sort_desc_by=a.sort_desc_by)))
    elif c == "add-dashboard":
        _out(_edit(a, lambda r: twb.add_dashboard(r, a.name, _csv(a.sheets), a.layout, a.width, a.height, not a.no_title)))
    elif c == "dashboard-size":
        _out(_edit(a, lambda r: twb.set_dashboard_size(r, a.name, a.width, a.height, a.mode)))
    elif c == "rename-sheet":
        _out(_edit(a, lambda r: twb.rename_sheet(r, a.old, a.new)))
    elif c == "remove-sheet":
        _out(_edit(a, lambda r: twb.remove_sheet(r, a.name)))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
