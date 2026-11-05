"""Find the first coverage step after which the Base sheet stops rendering (binary search over steps).

    uv run python scripts/bisect_render.py [first] [last]
"""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
import coverage_check as cc  # noqa: E402
import render_check as rc  # noqa: E402

from tableu_mcp import twb  # noqa: E402


def renders(n: int) -> bool:
    root = twb.new_workbook()
    for _, fn in cc.STEPS[:n]:
        try:
            fn(root)
        except Exception:  # noqa: BLE001,S112
            continue
    if "--isolate" in sys.argv:  # keep only Base so the QA dashboard shows just it
        for name in [w.get("name") for w in root.findall("./worksheets/worksheet")]:
            if name != "Base":
                twb.remove_sheet(root, name)
        for d in [d.get("name") for d in root.findall("./dashboards/dashboard")]:
            twb.remove_sheet(root, d)
        if root.find("actions") is not None:
            root.remove(root.find("actions"))
    out = Path("out/bisect")
    out.mkdir(parents=True, exist_ok=True)
    f = out / f"n{n}.twb"
    twb.write_workbook_file(f, twb.serialize(root))
    r2, targets = rc.build_qa(f)
    res = rc.render_one(r2, targets[0][0], out)
    ok = res.get("bytes", 0) > 40_000
    print(f"steps[:{n}] last={cc.STEPS[n - 1][0]!r} -> {res.get('bytes')} bytes {'OK' if ok else 'BLANK'}", flush=True)
    return ok


args = [a for a in sys.argv[1:] if not a.startswith("--")]
lo = int(args[0]) if args else 2
hi = int(args[1]) if len(args) > 1 else len(cc.STEPS)
assert renders(lo), "baseline does not render"
if renders(hi):
    print("everything renders")
    sys.exit(0)
while hi - lo > 1:
    mid = (lo + hi) // 2
    if renders(mid):
        lo = mid
    else:
        hi = mid
print(f"FIRST BREAKING STEP: #{hi - 1} {cc.STEPS[hi - 1][0]!r}")
