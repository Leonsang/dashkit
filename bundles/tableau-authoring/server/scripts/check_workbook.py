"""Open ONE Desktop with a workbook, validate it, render a dashboard, report dialogs/warnings, close it.

    uv run python scripts/check_workbook.py out/format_check.twb "Formato" [out/format_check.png]

Refuses to run when a Desktop is already open (never two instances). Database datasources are dropped from the
copy that is opened, so Desktop doesn't prompt for logins.
"""

import json
import subprocess
import sys
import time
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
import render_check as rc  # noqa: E402

from tableu_mcp import authoring, desktop_setup, twb  # noqa: E402
from tableu_mcp.client import DesktopClient, list_instances  # noqa: E402


def check(src: str, dashboard: str, png_out: str | None = None) -> dict:
    if desktop_setup.tableau_running():
        sys.exit("Tableau Desktop is already running: close it first (this opens exactly one instance).")
    xml = twb.read_workbook_file(src)
    root = twb.parse(xml)
    for ds in list(root.findall("./datasources/datasource")):
        if {c.get("class") for c in ds.iter("connection")} & rc.DB:
            ds.getparent().remove(ds)
    authoring.set_start_sheet(root, dashboard)
    opened = Path(src).with_name("_open_" + Path(src).stem + ".twb")
    twb.write_workbook_file(opened, twb.serialize(root))
    started = time.strftime("%Y-%m-%dT%H:%M")
    subprocess.Popen([str(desktop_setup.find_tableau_exe()), str(opened.resolve())])  # noqa: S603
    client, report = None, {}
    try:
        for _ in range(90):
            time.sleep(2)
            inst = list_instances()
            if inst:
                try:
                    client = DesktopClient(inst[0])
                    if client.workbook().get("dashboards"):
                        break
                except Exception:  # noqa: BLE001
                    pass
        if client is None:
            return {"error": "Desktop did not start"}
        time.sleep(5)
        report["loadDialogs"] = desktop_setup.error_dialogs(dismiss=True, pids=[client.instance.pid])
        v = client.validate_document(xml)
        report["valid"], report["issues"] = v["ok"], v.get("validationIssues")
        png = b""
        for _ in range(40):
            png = client.sheet_image("dashboards", dashboard)
            if rc.ink(png) > 0.05:
                break
            time.sleep(5)
        out = Path(png_out or Path(src).with_suffix(".png"))
        out.write_bytes(png)
        report["png"], report["ink"] = str(out), round(rc.ink(png), 3)
        report["dialogs"] = desktop_setup.error_dialogs(dismiss=True, pids=[client.instance.pid])
        report["warnings"] = sorted({w["message"][:200] for w in desktop_setup.desktop_warnings(client.instance.pid, since=started)
                                     if "Cache" not in w["message"]})
        return report
    finally:
        if client is not None:
            subprocess.run(["taskkill", "/PID", str(client.instance.pid), "/T", "/F"], capture_output=True, check=False)
        opened.unlink(missing_ok=True)


if __name__ == "__main__":
    print(json.dumps(check(sys.argv[1], sys.argv[2], sys.argv[3] if len(sys.argv) > 3 else None),
                     ensure_ascii=False, indent=1))
