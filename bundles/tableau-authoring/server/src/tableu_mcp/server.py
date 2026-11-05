"""MCP server (stdio): full Tableau Desktop authoring through ``<object>_operations`` tools.

Modeled on microsoft/powerbi-modeling-mcp: one tool per object type, an ``operation`` name, ``params`` for one
call or ``definitions`` for bulk, and ``transaction_operations`` to batch edits into one validated apply.

Target convention: "live" (workbook open in Tableau Desktop), "live:<pid>", or a path to a .twb/.twbx file.
"""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any

from mcp.server.fastmcp import FastMCP, Image

from . import registry
from .client import DesktopClient

DOCS = Path(__file__).resolve().parent / "docs"

mcp = FastMCP(
    "tableu",
    instructions=(
        "Author and manage Tableau Desktop workbooks. Every object type has a <object>_operations tool: call it "
        "with operation='Help' to list its operations and parameters. Workflow: desktop_operations Status (Launch "
        "if needed) -> workbook_operations Info -> field_operations List -> transaction_operations Begin -> "
        "datasource/calculation/parameter/worksheet/filter/format/dashboard/action/story operations -> "
        "transaction_operations Commit (one validation + one apply) -> export_image to SEE the result -> "
        "workbook_operations Lint and fix findings. target='live' edits the open workbook (validated, backed up); "
        "a .twb path works without Desktop. If a live call hangs, desktop_operations ErrorDialogs reads and closes "
        "Desktop's modal dialogs; desktop_operations Warnings shows load/query problems from Desktop's log. "
        "Never open several Desktop instances: Launch refuses when one is running. Read tableu://best-practices "
        "and tableu://coverage before designing."
    ),
)


class ModalWatch:
    """While a tool runs, watch Tableau Desktop for modal windows (they block the External Client API and the
    UI). Error/warning messages are closed so the call can finish; anything else (File Recovery, Save
    changes?...) is left for the user. Every modal seen is reported to the agent in desktopModals."""

    def __init__(self, active: bool = True, every: float = 2.0):
        import threading  # noqa: PLC0415

        self.seen: dict = {}
        self.every = every
        self._stop = threading.Event()
        self._thread = threading.Thread(target=self._run, daemon=True) if active else None

    def _run(self):
        from . import desktop_setup  # noqa: PLC0415

        while True:
            try:
                for m in desktop_setup.modals(close_safe=True):
                    self.seen.setdefault((m.get("pid"), m.get("title")), m)
            except Exception:  # noqa: BLE001,S110 - watching must never break the call
                pass
            if self._stop.wait(self.every):
                break

    def __enter__(self):
        if self._thread:
            self._thread.start()
        return self

    def __exit__(self, *exc):
        if self._thread:
            self._stop.set()
            self._thread.join(timeout=30)
        return False

    def attach(self, res):
        if not self.seen:
            return res
        note = {"desktopModals": list(self.seen.values()),
                "modalNote": "Tableau Desktop showed these modal windows during the call. Closed ones were error "
                             "messages; tell the user about any other one and what it asks before continuing."}
        return {**res, **note} if isinstance(res, dict) else {"result": res, **note}


def _make_tool(obj: str):
    ops_desc = registry.describe(obj)[obj]
    lines = [registry.OBJECT_HELP.get(obj, ""), "", "Operations (params):"]
    lines += [f"- {name}{desc.split(')')[0]})" for name, desc in ops_desc["operations"].items()]
    lines += ["", "Use operation='Help' for full descriptions. params: dict for one call; definitions: list of "
              "params dicts for bulk (one load/validate/apply). dry_run validates without applying."]

    def tool(operation: str, params: dict[str, Any] | None = None, definitions: list[dict[str, Any]] | None = None,
             target: str = "live", dry_run: bool = False, out: str | None = None) -> Any:
        if operation.lower() == "help":
            return registry.describe(obj)
        with ModalWatch(active=obj != "desktop" or operation.lower() == "launch") as watch:
            try:
                res = registry.run(obj, operation, params, target=target, definitions=definitions,
                                   dry_run=dry_run, out=out)
            except Exception as e:  # noqa: BLE001 - return the error to the agent instead of failing the call
                res = {"error": f"{type(e).__name__}: {e}", "hint": f"{obj}_operations operation='Help' lists operations"}
        return watch.attach(res)

    tool.__name__ = f"{obj}_operations"
    tool.__doc__ = "\n".join(lines)
    return tool


for _obj in registry.REGISTRY:
    _t = _make_tool(_obj)
    mcp.add_tool(_t, name=_t.__name__, description=_t.__doc__)


@mcp.tool()
def export_image(sheet: str, kind: str = "dashboards", allow_worksheet: bool = False, target: str = "live") -> Image:
    """PNG of the dashboard shown in Tableau, returned as an image so you can look at your work. API 0.1.1 only
    renders what is on screen; a worksheet that is not visible would pop a blocking dialog, so worksheets need
    allow_worksheet=True. For another sheet, workbook_operations ShowSheet (confirm=true) reopens Desktop on it."""
    pid = int(target.split(":", 1)[1]) if target.startswith("live:") else None
    return Image(data=DesktopClient.connect(pid=pid).sheet_image(kind, sheet, allow_worksheet), format="png")


@mcp.resource("tableu://best-practices")
def best_practices() -> str:
    """Tableau best practices (official sources) used by workbook_operations Lint."""
    return (DOCS / "best-practices.md").read_text(encoding="utf-8")


@mcp.resource("tableu://coverage")
def coverage() -> str:
    """Which Tableau features each operation covers, how it was verified, and known limits."""
    return (DOCS / "coverage.md").read_text(encoding="utf-8")


@mcp.resource("tableu://behavior")
def behavior() -> str:
    """How Tableau Desktop 2026.3 really behaves (live API, file loading, layout, formatting) and tableu's protocol for each."""
    return (DOCS / "desktop-behavior.md").read_text(encoding="utf-8")


@mcp.resource("tableu://coverage-gaps")
def coverage_gaps() -> str:
    """What Tableau writes in its own documents that tableu cannot write yet (pool of missing tools)."""
    return (DOCS / "coverage-gaps.md").read_text(encoding="utf-8")


@mcp.resource("tableu://components")
def components_reference() -> str:
    """Every Tableau component: definition, when to use it, official recommendation, the XML Tableau writes
    for it, the tableu operation that builds it, and whether it reaches Desktop through the live API or a file."""
    from . import components  # noqa: PLC0415

    paths = DOCS / "component-paths.json"
    md = components.markdown()
    if paths.exists():
        p = json.loads(paths.read_text(encoding="utf-8"))
        rows = [f"| {cid} | {'sí' if p.get('live', {}).get(cid) else 'no'} | {'sí' if p.get('file', {}).get(cid) else 'no'} |"
                for cid in p.get("file", {})]
        md += ("\n## Por qué vía llega cada componente a Desktop\n\n"
               f"Medido con {p.get('checked', '')}: se conserva tras `POST /v0/workbook/document` (API en vivo) "
               "y tras abrir el archivo.\n\n| componente | API en vivo | archivo |\n|---|---|---|\n" + "\n".join(rows) + "\n")
    return md


@mcp.resource("tableu://layouts")
def layouts_reference() -> str:
    """Dashboard layouts measured on Tableau's own dashboards (overview, sidebar, filterbar, header): where each
    comes from, when to use it, the sizes it pins. Build one with dashboard_operations CreateFromLayout."""
    from . import layouts  # noqa: PLC0415

    return json.dumps({"doc": layouts.__doc__, "layouts": layouts.describe()}, ensure_ascii=False, indent=1)


@mcp.resource("tableu://ui-commands")
def ui_commands() -> str:
    """Desktop's menu commands reverse-engineered: for each sheet kind, every menu item, the internal command
    Desktop logs for it (tabdoc:/tabui:), the dialog it opens, and what it changes in the workbook XML."""
    p = DOCS / "ui-commands.md"
    return p.read_text(encoding="utf-8") if p.exists() else "Not measured yet: run scripts/ui_reverse.py."


@mcp.resource("tableu://operations")
def operations() -> str:
    """Every object type and operation with its parameters."""
    return json.dumps(registry.describe(), ensure_ascii=False, indent=1)


@mcp.prompt()
def build_dashboard(goal: str, datasource: str = "Sample - Superstore") -> str:
    """Guided prompt: design and build a best-practice dashboard for a goal."""
    return (
        f"Goal: {goal}\nDatasource: {datasource}\n\n"
        "1. Read tableu://best-practices. 2. workbook_operations Info and field_operations List. "
        "3. Propose 2-3 views (bar for comparison, line for trends, map only for geographic questions), "
        "descriptive titles, no ALL CAPS, number formats on measures. "
        "4. transaction_operations Begin; worksheet_operations Create (filters/sort/labels in the same call); "
        "format_operations as needed; dashboard_operations CreateFromLayout with one of tableu://layouts "
        "(overview, sidebar, filterbar, header: measured on Tableau's own dashboards), or Create + AddZone for a "
        "custom layout; transaction_operations Commit. "
        "5. workbook_operations Lint: fix DASH-SMALL-VIEW / DASH-FIXED-OVERFLOW first (space), then the rest. "
        "6. export_image the dashboard and inspect it. "
        "Report the final score."
    )


def main() -> None:
    mcp.run()


if __name__ == "__main__":
    main()
