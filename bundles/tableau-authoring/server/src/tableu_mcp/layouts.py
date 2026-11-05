"""Dashboard layouts taken from Tableau's own dashboards, so an agent does not have to invent the space split.

Measured on the dashboards Tableau Desktop 2026.3 ships (help/Workbooks: Superstore, World Indicators), at
their 1000x620 design size; the pixel sizes below are those dashboards' fixed sizes:

- overview   Superstore "Overview": a KPI strip fixed at 117 px on top, the main view below, a row of detail
             views at the bottom sharing the width evenly. Controls sit beside the title.
- sidebar    Superstore "Customers" / "Shipping", World Indicators "Tourism": the views on the left and a filter
             and legend column pinned at 160-192 px on the right.
- filterbar  Superstore "Order Details": a row of filters fixed at 62 px under the title, one large view below.
- header     World Indicators "Business": a header bar (title, filters, highlighter, legend in one row,
             fixed 71 px), then the views. No side panel: all the width goes to the views.

`create` builds the dashboard with tableu's own primitives (twb.add_dashboard + authoring.add_zone), so every
rule they follow (fixed sizes, titled cards, KPI strips without a title) applies here too.
"""

from __future__ import annotations

from . import authoring as A
from . import twb

HEADER_PX = 71  # World Indicators · Business: title, filters and legend in one 71 px row

PRESETS = {
    "overview": {"source": "Superstore · Overview", "kpi_px": 117, "main": 55, "controls": "title",
                 "use": "A summary page: KPIs, one main view, a few supporting views."},
    "sidebar": {"source": "Superstore · Customers, Shipping; World Indicators · Tourism", "kpi_px": 60, "main": 60,
                "controls": "panel", "panel_px": 180,
                "use": "Exploration with several filters and legends that must stay visible."},
    "filterbar": {"source": "Superstore · Order Details", "kpi_px": 60, "main": 100, "controls": "bar", "bar_px": 62,
                  "use": "One large detail view (table, map) with many filters across the top."},
    "header": {"source": "World Indicators · Business", "kpi_px": 80, "main": 65, "controls": "title",
               "use": "A hero view with its filters and legend in the header bar; all the width for the views."},
}


def describe() -> list[dict]:
    return [{"layout": k, **v} for k, v in PRESETS.items()]


def create(root, name: str, layout: str = "overview", kpis: list[str] | None = None, main: list[str] | None = None,
           details: list[str] | None = None, filters: list[dict] | None = None, legends: list[dict] | None = None,
           width: int = 1200, height: int = 800, title: bool = True) -> dict:
    """Dashboard laid out like one of Tableau's own (see PRESETS / tableu://layouts).
    kpis: KPI-strip sheets (top row) · main: the main view(s) · details: supporting views (bottom row) ·
    filters=[{'sheet','field','mode'?,'title'?}] · legends=[{'sheet','field','kind'?: color|size|shape}]."""
    if layout not in PRESETS:
        raise ValueError(f"Unknown layout {layout!r}; one of {list(PRESETS)}")
    p = PRESETS[layout]
    main, kpis, details = list(main or []), list(kpis or []), list(details or [])
    if not main:
        raise ValueError("main needs at least one view")
    filters, legends = list(filters or []), list(legends or [])

    rows, heights = [], []
    body_px = height * (1 - (0.06 if title else 0))  # twb.add_dashboard's title takes 6% of the height
    if kpis:
        rows.append(kpis)
        heights.append(round(p["kpi_px"] * 100 / body_px, 1))
    rows.append(main)
    if details:
        rows.append(details)
    rest = 100 - sum(heights)
    if details:
        share = p["main"] if p["main"] < 100 else 65
        heights += [round(rest * share / 100, 1), round(rest * (100 - share) / 100, 1)]
    else:
        heights.append(round(rest, 1))
    out = twb.add_dashboard(root, name, [], "grid", width, height, title, rows, heights)

    placed = []
    controls = p["controls"]
    if controls == "bar" and filters:
        db = A._dashboard(root, name)
        main_flow, _ = A._main_parts(db)
        bar = A.add_zone(root, name, "container", mode="horizontal", container=main_flow.get("id"),
                         position=1 if title else 0, fixed_height=p["bar_px"])  # right under the title
        container = bar["zone"]
    elif controls == "title":
        container = "title" if title else None
    else:
        container = None  # the side panel, pinned by authoring.add_zone
    in_row = bool(container) and controls != "panel"
    for f in filters:
        # In a header or filter bar only a dropdown fits (a checkbox list is clipped: seen in Desktop 2026.3);
        # Superstore's Order Details bar and World Indicators' header use dropdowns too.
        mode = f.get("mode") or ("checkdropdown" if in_row else None)
        r = A.add_zone(root, name, "filter", sheet=f["sheet"], field=f["field"], mode=mode,
                       title=f.get("title"), container=container, fixed_width=(160 if in_row else None))
        placed.append({"filter": f["field"], "zone": r["zone"]})
    for lg in legends:
        kind = "legend-" + lg.get("kind", "color")
        lc = container if controls == "title" else None  # legends: header row or the side panel
        r = A.add_zone(root, name, kind, sheet=lg["sheet"], field=lg["field"], container=lc,
                       fixed_width=(180 if lc else None))
        placed.append({"legend": lg["field"], "zone": r["zone"]})
    if controls == "title" and placed and title:
        # the header holding controls is as tall as World Indicators' (71 px), else the cards are clipped
        db = A._dashboard(root, name)
        row = A._resolve_container(db, "title")
        row.set("fixed-size", str(HEADER_PX))
        A._fit_fixed(db, row.getparent(), row)
        A._relayout(db)
    return {"dashboard": out, "layout": layout, "source": p["source"], "rows": rows, "heights": heights, "controls": placed}
