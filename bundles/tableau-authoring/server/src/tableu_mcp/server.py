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
        try:
            return registry.run(obj, operation, params, target=target, definitions=definitions, dry_run=dry_run, out=out)
        except Exception as e:  # noqa: BLE001 - return the error to the agent instead of failing the call
            return {"error": f"{type(e).__name__}: {e}", "hint": f"{obj}_operations operation='Help' lists operations"}

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
        "format_operations as needed; dashboard_operations Create (fixed size, key view top-left) and AddZone for "
        "legends/filter cards; transaction_operations Commit. "
        "5. export_image the dashboard and inspect it. 6. workbook_operations Lint and fix warnings. "
        "Report the final score."
    )


def main() -> None:
    mcp.run()


if __name__ == "__main__":
    main()
