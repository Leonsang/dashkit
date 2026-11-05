"""Render every worksheet/dashboard/story of a workbook and collect Desktop's warnings.

    uv run python scripts/render_check.py out/kitchen_sink.twb out/qa

API 0.1.1 can only export the dashboard on screen, so for each dashboard a copy of the workbook is opened in
its own Desktop process with that dashboard as the start sheet, exported to PNG, and the process is closed.
Worksheets are rendered through QA dashboards (4 per dashboard). Database datasources are dropped so Desktop
doesn't prompt for logins. Prints a JSON report with PNG paths, error dialogs and log warnings per sheet.
"""

import json
import subprocess
import sys
import time
from pathlib import Path

from tableu_mcp import authoring, desktop_setup, twb
from tableu_mcp.client import DesktopClient, list_instances

def ink(png: bytes) -> float:
    """Share of non-white pixels: Desktop sometimes answers before it has drawn the views."""
    import io  # noqa: PLC0415

    from PIL import Image  # noqa: PLC0415

    im = Image.open(io.BytesIO(png)).convert("L")
    im.thumbnail((400, 400))
    px = list(im.getdata())
    return sum(1 for v in px if v < 235) / max(len(px), 1)


DB = {"postgres", "sqlserver", "snowflake", "mysql", "oracle", "redshift", "databricks", "teradata", "bigquery"}


def build_qa(src: Path) -> tuple:
    root = twb.parse(twb.read_workbook_file(src))
    for ds in list(root.findall("./datasources/datasource")):
        if {c.get("class") for c in ds.iter("connection")} & DB:
            ds.getparent().remove(ds)
    sheets = [w.get("name") for w in root.findall("./worksheets/worksheet")]
    targets = []
    for i in range(0, len(sheets), 4):
        name = f"QA {i // 4 + 1}"
        twb.add_dashboard(root, name, sheets[i:i + 4], layout="grid", width=1400, height=900)
        targets.append((name, sheets[i:i + 4]))
    targets += [(d.get("name"), []) for d in root.findall("./dashboards/dashboard") if not d.get("name").startswith("QA ")]
    return root, targets


def render_one(root, target: str, out_dir: Path) -> dict:
    authoring.set_start_sheet(root, target)
    f = out_dir / f"_open_{target.replace(' ', '_')}.twb"
    twb.write_workbook_file(f, twb.serialize(root))
    before = {i.pid for i in list_instances()}
    started = time.strftime("%Y-%m-%dT%H:%M")
    proc = subprocess.Popen([str(desktop_setup.find_tableau_exe()), str(f.resolve())])  # noqa: S603
    client, res = None, {}
    try:
        for _ in range(90):
            time.sleep(2)
            new = [i for i in list_instances() if i.pid not in before]
            if not new:
                continue
            try:
                client = DesktopClient(new[0])
                if client.workbook().get("dashboards"):
                    break
            except Exception:  # noqa: BLE001 - still loading
                pass
        if client is None:
            return {"error": "Desktop did not start"}
        time.sleep(6)
        res["loadDialogs"] = desktop_setup.error_dialogs(dismiss=True, pids=[client.instance.pid])
        kind = "storyboards" if any(s.get("name") == target for s in client.workbook().get("storyboards", [])) else "dashboards"
        try:
            # Desktop answers before the views finish querying: re-export until the image stops growing.
            png = b""
            for _ in range(36):  # up to ~3 minutes on the same instance
                png = client.sheet_image(kind, target)
                if ink(png) > 0.02:
                    break
                time.sleep(5)
            res["ink"] = round(ink(png), 4)
            path = out_dir / f"{target.replace(' ', '_')}.png"
            path.write_bytes(png)
            res["png"], res["bytes"] = str(path), len(png)
        except Exception as e:  # noqa: BLE001
            res["error"] = f"{type(e).__name__}: {e}"[:300]
        res["dialogs"] = desktop_setup.error_dialogs(dismiss=True, pids=[client.instance.pid])
        res["warnings"] = [w["message"] for w in desktop_setup.desktop_warnings(client.instance.pid, since=started)]
        return res
    finally:
        pid = client.instance.pid if client else proc.pid
        subprocess.run(["taskkill", "/PID", str(pid), "/T", "/F"], capture_output=True, check=False)
        time.sleep(3)


def main():
    src, out_dir = Path(sys.argv[1]), Path(sys.argv[2])
    out_dir.mkdir(parents=True, exist_ok=True)
    only = sys.argv[3].split(",") if len(sys.argv) > 3 else None
    root, targets = build_qa(src)
    report = {}
    for name, sheets in targets:
        if only and name not in only:
            continue
        r = render_one(twb.parse(twb.serialize(root)), name, out_dir)
        r["sheets"] = sheets
        report[name] = r
        print(name, "->", r.get("png") or r.get("error"), "| dialogs:", [d.get("message") for d in r.get("loadDialogs", []) + r.get("dialogs", [])], flush=True)
    (out_dir / "report.json").write_text(json.dumps(report, ensure_ascii=False, indent=1), encoding="utf-8")
    print(json.dumps({k: v.get("warnings") for k, v in report.items()}, ensure_ascii=False, indent=1))


if __name__ == "__main__":
    main()
