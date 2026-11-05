"""Full verification with ONE Desktop instance: schema-check every coverage step, then render everything.

    uv run python scripts/verify_all.py                  # renders the QA dashboard with every worksheet
    uv run python scripts/verify_all.py --show Overview  # renders another dashboard of the build instead

1. Builds the kitchen-sink workbook offline (scripts/coverage_check.py steps).
2. Opens one Desktop with a QA dashboard holding every worksheet as the start sheet.
3. With that same instance: validates each step's document, exports the QA dashboard until it has drawn,
   collects Desktop dialogs (closing them) and log warnings.
4. Closes only the instance it opened.
"""

import copy
import json
import subprocess
import sys
import time
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
import coverage_check as cc  # noqa: E402
import render_check as rc  # noqa: E402

from tableu_mcp import authoring, desktop_setup, twb  # noqa: E402
from tableu_mcp.client import DesktopClient, list_instances  # noqa: E402

OUT = Path("out/verify")
OUT.mkdir(parents=True, exist_ok=True)

# 1. build offline, keeping each step's document for validation
root = twb.new_workbook()
docs, errors = [], []
for label, fn in cc.STEPS:
    snap = copy.deepcopy(root)
    try:
        fn(root)
        docs.append((label, twb.serialize(root)))
    except Exception as e:  # noqa: BLE001
        root = snap
        errors.append((label, f"{type(e).__name__}: {e}"))
twb.write_workbook_file(OUT / "kitchen_sink.twb", twb.serialize(root))

# 2. QA copy: no database sources (no server to log into), one dashboard with every worksheet
qa = twb.parse(twb.serialize(root))
for ds in list(qa.findall("./datasources/datasource")):
    if {c.get("class") for c in ds.iter("connection")} & rc.DB:
        ds.getparent().remove(ds)
sheets = [w.get("name") for w in qa.findall("./worksheets/worksheet")]
SHOW = sys.argv[sys.argv.index("--show") + 1] if "--show" in sys.argv else "QA all"
twb.add_dashboard(qa, "QA all", sheets, layout="grid", width=2400, height=2600, title=False)
authoring.set_start_sheet(qa, SHOW)
if desktop_setup.tableau_running():
    sys.exit("Tableau Desktop is already running: close it first (this script opens exactly one instance).")
qa_file = OUT / "qa_all.twb"
twb.write_workbook_file(qa_file, twb.serialize(qa))

before = {i.pid for i in list_instances()}
started = time.strftime("%Y-%m-%dT%H:%M")
proc = subprocess.Popen([str(desktop_setup.find_tableau_exe()), str(qa_file.resolve())])  # noqa: S603
client = None
report = {"buildErrors": errors}
try:
    for _ in range(90):
        time.sleep(2)
        new = [i for i in list_instances() if i.pid not in before]
        if new:
            try:
                client = DesktopClient(new[0])
                if client.workbook().get("dashboards"):
                    break
            except Exception:  # noqa: BLE001
                pass
    if client is None:
        sys.exit("Desktop did not start")
    pid = client.instance.pid
    time.sleep(5)
    report["loadDialogs"] = desktop_setup.error_dialogs(dismiss=True, pids=[pid])
    # 3a. schema validation of each step (skip steps before the first worksheet exists)
    steps = []
    for label, xml in docs:
        if "<worksheet " not in xml:
            steps.append((label, "ok*"))
            continue
        v = client.validate_document(xml)
        steps.append((label, "ok" if v["ok"] else "INVALID " + json.dumps(v.get("validationIssues"))[:300]))
    report["steps"] = steps
    # 3b. render
    png = b""
    for _ in range(40):
        png = client.sheet_image("dashboards", SHOW)
        if rc.ink(png) > 0.03:
            break
        time.sleep(5)
    (OUT / f"{SHOW.replace(' ', '_')}.png").write_bytes(png)
    report["ink"] = round(rc.ink(png), 4)
    report["dialogs"] = desktop_setup.error_dialogs(dismiss=True, pids=[pid])
    report["warnings"] = sorted({w["message"] for w in desktop_setup.desktop_warnings(pid, since=started)})
finally:
    if client is not None:
        subprocess.run(["taskkill", "/PID", str(client.instance.pid), "/T", "/F"], capture_output=True, check=False)

(OUT / "report.json").write_text(json.dumps(report, ensure_ascii=False, indent=1), encoding="utf-8")
bad = [s for s in report["steps"] if not s[1].startswith("ok")]
print(f"steps valid: {len(report['steps']) - len(bad)}/{len(report['steps'])}; build errors: {errors}")
for s in bad:
    print("  ", s)
print("ink:", report["ink"], "| load dialogs:", [d.get("message") for d in report["loadDialogs"]],
      "| dialogs:", [d.get("message") for d in report["dialogs"]])
print("warnings:", report["warnings"])
