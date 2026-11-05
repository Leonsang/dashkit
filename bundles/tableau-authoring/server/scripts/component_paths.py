"""Measure, per component, how it reaches Tableau Desktop: through the live API or only through a file.

    uv run python scripts/component_paths.py file <components.twb>   # Desktop has <components.twb> open
    uv run python scripts/component_paths.py live <components.twb>   # Desktop has a base workbook open

`file`: reads the workbook Desktop loaded from the file and records which components' XML it kept.
`live`: applies <components.twb>'s XML to the open workbook with POST /v0/workbook/document (what
target=live does) and records which components' XML Desktop kept.
Results go to src/tableu_mcp/docs/component-paths.json, shown in tableu://components.
"""

from __future__ import annotations

import json
import sys
from pathlib import Path

from lxml import etree

from tableu_mcp import components, ops, twb
from tableu_mcp.client import DesktopClient

OUT = Path(__file__).resolve().parents[1] / "src" / "tableu_mcp" / "docs" / "component-paths.json"


# Forms Desktop rewrites on load: the same component, written the way its current format names it.
EQUIVALENT = {"view/sort@class=computed": "view/computed-sort"}


def present(root, sig: str) -> bool:
    if sig in EQUIVALENT and present(root, EQUIVALENT[sig]):
        return True
    path, _, cond = sig.partition("@")
    parent, tag = path.rsplit("/", 1)
    attr, _, value = cond.partition("=")
    for el in root.iter(tag):
        p = el.getparent()
        if (p.tag if p is not None else "") != parent:
            continue
        if not attr or (el.get(attr) is not None and (not value or el.get(attr) == value)):
            return True
    return False


def kept(root) -> dict[str, bool]:
    return {c["id"]: all(present(root, s) for s in c["xml"]) for c in components.COMPONENTS if c["example"]}


def main(mode: str, wb: str) -> None:
    client = DesktopClient.connect()
    if mode == "live":
        import threading  # noqa: PLC0415

        from tableu_mcp import desktop_setup  # noqa: PLC0415

        seen: list = []
        done = threading.Event()

        def watch():  # a modal dialog blocks the apply call; close it and record it
            while not done.is_set():
                seen.extend(d["title"] for d in desktop_setup.error_dialogs(dismiss=True))
                done.wait(2)

        t = threading.Thread(target=watch, daemon=True)
        t.start()
        xml = Path(wb).read_text(encoding="utf-8")
        try:
            print("apply:", str(client.apply_document(xml))[:200])
        finally:
            done.set()
            t.join()
        print("dialogs during apply:", seen)
    root = twb.parse(ops.load("live"))
    res = kept(root)
    data = json.loads(OUT.read_text(encoding="utf-8")) if OUT.exists() else {}
    data[mode] = res
    data["checked"] = "Tableau Desktop 2026.3, External Client API 0.1.1"
    OUT.write_text(json.dumps(data, ensure_ascii=False, indent=1), encoding="utf-8")
    lost = [k for k, v in res.items() if not v]
    print(f"{mode}: {sum(res.values())}/{len(res)} kept; lost: {lost}")


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
