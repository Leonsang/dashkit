"""Play every tableu operation against a deep, real dashboard: a copy of Tableau's Superstore sample.

    uv run python scripts/exercise_superstore.py <copy of Superstore.twbx>

Each step runs one operation on the copy (cumulatively, as an agent would) and then checks the workbook
against Tableau's own schema (xsd.validate) and the structure lint. Prints a table: operation, result,
schema after the step. Read operations run too. The copy is the only file written.
"""

from __future__ import annotations

import json
import sys
import traceback
from pathlib import Path

from tableu_mcp import ops, registry, structure, xsd

DS = "Sample - Superstore"
DB = "Overview"

STEPS: list[tuple[str, str, dict]] = [
    # ---- read
    ("workbook", "Info", {}), ("workbook", "Lint", {}), ("workbook", "CheckStructure", {}),
    ("workbook", "Preflight", {}), ("workbook", "Schema", {"element": "zone"}),
    ("datasource", "List", {}), ("datasource", "Get", {"datasource": DS}), ("datasource", "ListRelationships", {"datasource": DS}),
    ("field", "List", {"datasource": DS}), ("calculation", "List", {"datasource": DS}), ("parameter", "List", {}),
    ("worksheet", "List", {}), ("worksheet", "Get", {"worksheet": "Sales"}), ("filter", "List", {"worksheet": "Sales"}),
    ("dashboard", "List", {}), ("dashboard", "ListZones", {"dashboard": DB}), ("action", "List", {}),
    # ---- model
    ("field", "Update", {"datasource": DS, "field": "Sales", "caption": "Ventas", "default_format": "c\"$\"#,##0"}),
    ("field", "SetAliases", {"datasource": DS, "field": "Segment", "aliases": {"Consumer": "Consumo"}}),
    ("calculation", "Create", {"datasource": DS, "name": "Margen %", "formula": "SUM([Profit]) / SUM([Sales])",
                               "default_format": "p0.0%"}),
    ("calculation", "Create", {"datasource": DS, "name": "Ventas por cliente",
                               "formula": "{FIXED [Customer Name] : SUM([Sales])}"}),
    ("calculation", "Update", {"datasource": DS, "field": "Margen %", "formula": "SUM([Profit]) / SUM([Sales])"}),
    ("parameter", "Create", {"name": "Top clientes", "datatype": "integer", "value": 10, "domain": "range",
                             "min": 5, "max": 50, "step": 5}),
    ("parameter", "Update", {"name": "Top clientes", "value": 15}),
    ("group", "Create", {"datasource": DS, "field": "Region", "name": "Costa", "groups": {"Costa": ["East", "West"]},
                         "include_other": True}),
    ("set", "Create", {"datasource": DS, "field": "Customer Name", "name": "Top clientes set", "top": 20,
                       "by": "SUM(Sales)"}),
    ("bin", "Create", {"datasource": DS, "field": "Discount", "size": 0.1}),
    ("hierarchy", "Create", {"datasource": DS, "name": "Producto", "fields": ["Category", "Sub-Category"]}),
    ("folder", "Create", {"datasource": DS, "name": "Importes", "fields": ["Sales", "Profit"]}),
    # ---- sheets
    ("worksheet", "Create", {"name": "KPIs nuevos", "datasource": DS,
                             "measures": ["SUM(Sales)", "SUM(Profit)", "Margen %", "COUNTD(Order ID)"],
                             "measure_labels": {"SUM(Sales)": "Ventas", "SUM(Profit)": "Beneficio",
                                                "COUNTD(Order ID)": "Pedidos"},
                             "label_font": {"size": 10, "color": "#666666"},
                             "value_font": {"size": 22, "bold": True, "color": "#333333"}}),
    ("worksheet", "Create", {"name": "Tendencia mensual", "datasource": DS, "cols": ["MONTH_TRUNC(Order Date)"],
                             "rows": ["SUM(Sales)"], "mark": "line"}),
    ("worksheet", "Create", {"name": "Subcategorias", "datasource": DS, "rows": ["Sub-Category"],
                             "cols": ["SUM(Sales)"], "mark": "bar", "color": "Margen %", "show_labels": True,
                             "sort": {"field": "Sub-Category", "by": "SUM(Sales)", "direction": "DESC"}}),
    ("worksheet", "Create", {"name": "Dispersion", "datasource": DS, "cols": ["SUM(Sales)"], "rows": ["SUM(Profit)"],
                             "mark": "circle", "detail": ["Customer Name"]}),
    ("worksheet", "Duplicate", {"sheet": "Subcategorias", "new_name": "Subcategorias (copia)"}),
    ("worksheet", "Rename", {"name": "Subcategorias (copia)", "new_name": "Subcategorias 2"}),
    ("worksheet", "SetMark", {"worksheet": "Subcategorias 2", "mark": "square"}),
    ("worksheet", "SetShelf", {"worksheet": "Subcategorias 2", "shelf": "cols", "fields": ["Region"]}),
    ("worksheet", "SetEncoding", {"worksheet": "Subcategorias 2", "encoding": "label", "field": "SUM(Sales)"}),
    ("worksheet", "SetSort", {"worksheet": "Subcategorias 2", "field": "Sub-Category", "by": "SUM(Profit)"}),
    ("worksheet", "SetTotals", {"worksheet": "Subcategorias 2", "rows": True}),
    ("worksheet", "SetDualAxis", {"worksheet": "Tendencia mensual", "measures": ["SUM(Sales)", "SUM(Profit)"],
                                  "marks": ["bar", "line"], "synchronize": False}),
    ("worksheet", "OrientTableCalcs", {"worksheet": "Tendencia mensual"}),
    ("worksheet", "AddCard", {"worksheet": "Subcategorias", "card_type": "parameter", "parameter": "Top clientes"}),
    ("worksheet", "SetVisibility", {"sheet": "Subcategorias 2", "hidden": True}),
    # ---- filters
    ("filter", "Add", {"worksheet": "Dispersion", "field": "Customer Name", "top": {"n": 20, "by": "SUM(Sales)"}}),
    ("filter", "Add", {"worksheet": "Tendencia mensual", "field": "Order Date",
                       "relative": {"period": "year", "last": 2}}),
    ("filter", "Add", {"worksheet": "Subcategorias", "field": "Profit", "min": -10000, "max": 100000}),
    ("filter", "AddShared", {"worksheets": ["KPIs nuevos", "Tendencia mensual", "Subcategorias"], "field": "Segment",
                             "card_on": "Subcategorias", "card_mode": "dropdown"}),
    ("filter", "Remove", {"worksheet": "Subcategorias", "field": "Profit"}),
    # ---- analytics
    ("analytics", "AddReferenceLine", {"worksheet": "Subcategorias", "measure": "SUM(Sales)", "label": "Media"}),
    ("analytics", "AddTrendLine", {"worksheet": "Dispersion"}),
    ("analytics", "AddForecast", {"worksheet": "Tendencia mensual", "periods": 6}),
    # ---- format
    ("format", "Title", {"sheet": "Subcategorias", "text": "Ventas por subcategoría (color = margen)"}),
    ("format", "Tooltip", {"worksheet": "Subcategorias", "text": "<Sub-Category>: <SUM(Sales)>",
                           "viz_sheet": "Tendencia mensual"}),
    ("format", "Label", {"worksheet": "Subcategorias", "text": "<SUM(Sales)>"}),
    ("format", "Font", {"sheet": "KPIs nuevos", "element": "label", "size": 22, "bold": True}),
    ("format", "Field", {"worksheet": "Tendencia mensual", "field": "MONTH_TRUNC(Order Date)", "axis_title": ""}),
    ("format", "Worksheet", {"worksheet": "Subcategorias", "gridlines": False, "field_labels": False}),
    ("format", "Lines", {"sheet": "Dispersion", "kind": "gridline", "visible": False}),
    ("format", "Borders", {"sheet": "Subcategorias 2", "area": "cell"}),
    ("format", "Banding", {"sheet": "Subcategorias 2"}),
    ("format", "Backgrounds", {"sheet": "Dispersion", "worksheet": "#fafafa"}),
    ("format", "Marks", {"worksheet": "Dispersion", "opacity": 0.6}),
    ("format", "MarkBorder", {"worksheet": "Dispersion"}),
    ("format", "ColorPalette", {"worksheet": "Subcategorias 2", "field": "Region", "palette": "tableau10"}),
    ("format", "Workbook", {"locale": "es_ES"}),
    # ---- dashboards
    ("dashboard", "Create", {"name": "Panel nuevo", "width": 1366, "height": 900,
                             "rows": [["KPIs nuevos"], ["Tendencia mensual", "Subcategorias"], ["Dispersion"]],
                             "heights": [14, 50, 36]}),
    ("dashboard", "AddZone", {"dashboard": "Panel nuevo", "kind": "filter", "sheet": "Subcategorias",
                              "field": "Segment", "mode": "dropdown", "container": "title", "fixed_width": 220,
                              "title": "Elige un segmento"}),
    ("dashboard", "AddZone", {"dashboard": "Panel nuevo", "kind": "parameter", "parameter": "Top clientes",
                              "container": "row:3", "fixed_width": 200, "title": "¿Cuántos clientes?"}),
    ("dashboard", "AddZone", {"dashboard": "Panel nuevo", "kind": "text", "container": "title", "position": 1,
                              "text": "Haz clic en una subcategoría para filtrar"}),
    ("dashboard", "AddZone", {"dashboard": "Panel nuevo", "kind": "legend-color", "sheet": "Subcategorias",
                              "field": "Margen %", "container": "row:2", "fixed_width": 160}),
    ("dashboard", "SetSize", {"name": "Panel nuevo", "width": 1366, "height": 900}),
    ("dashboard", "AddDeviceLayout", {"dashboard": "Panel nuevo", "device": "phone"}),
    ("format", "Dashboard", {"dashboard": "Panel nuevo", "background": "#ffffff"}),
    ("dashboard", "AddZone", {"dashboard": DB, "kind": "text", "text": "Editado por tableu", "floating": True,
                              "x": 10, "y": 10, "w": 200, "h": 30}),
    # ---- actions
    ("action", "Create", {"kind": "filter", "name": "Filtrar por subcategoria", "source": "Panel nuevo",
                          "target": "Panel nuevo", "fields": ["Sub-Category"]}),
    ("action", "Create", {"kind": "highlight", "name": "Resaltar segmento", "source": "Panel nuevo",
                          "fields": ["Segment"]}),
    ("action", "Create", {"kind": "parameter", "name": "Elegir top", "source": "Subcategorias",
                          "parameter": "Top clientes", "source_field": "SUM(Quantity)", "aggregation": "sum"}),
    ("action", "Create", {"kind": "set", "name": "Marcar clientes", "source": "Dispersion",
                          "set_name": "Top clientes set"}),
    ("action", "Create", {"kind": "url", "name": "Buscar", "source": "Subcategorias",
                          "url": "https://www.google.com/search?q=<Sub-Category>"}),
    ("action", "Create", {"kind": "goto", "name": "Ir a Overview", "source": "Panel nuevo", "target": DB}),
    ("dashboard", "AddZone", {"dashboard": "Panel nuevo", "kind": "navigation", "target_sheet": DB,
                              "text": "Volver a Overview", "container": "title", "fixed_width": 180}),
    # ---- story
    ("story", "Create", {"name": "Historia de ventas", "points": [
        {"sheet": "Panel nuevo", "caption": "Visión general"},
        {"sheet": "Subcategorias", "caption": "Dónde está el margen"}]}),
    ("story", "AddPoint", {"story": "Historia de ventas", "sheet": "Dispersion", "caption": "Clientes"}),
    ("format", "Story", {"story": "Historia de ventas", "caption_background": "#f5f5f5"}),
    # ---- workbook
    ("workbook", "SetStartSheet", {"sheet": "Panel nuevo"}),
    ("workbook", "ListBackups", {}),
]


def main(target: str) -> None:
    rows = []
    for obj, op, params in STEPS:
        try:
            res = registry.run(obj, op, params, target=target)
            err = res.get("error") if isinstance(res, dict) else None
            v = (res.get("validation") or {}) if isinstance(res, dict) else {}
            issues = v.get("validationIssues") or []
            status = "ERROR " + str(err)[:160] if err else ("SCHEMA " + str(issues[0])[:160] if issues else "ok")
        except Exception as e:  # noqa: BLE001
            status = f"EXC {type(e).__name__}: {str(e)[:160]}"
            if "--trace" in sys.argv:
                traceback.print_exc()
        rows.append((f"{obj} {op}", status))
        print(f"{obj:11} {op:20} {status}", flush=True)
    root = ops.read_root(target)
    x = xsd.validate(root)
    st = structure.summary(structure.check(root))
    print("\nFINAL schema:", "valid" if x["valid"] else x["issues"][:5], "| structure:", st)
    ok = sum(1 for _, s in rows if s == "ok")
    print(f"{ok}/{len(rows)} operations ok")
    Path(target).with_suffix(".results.json").write_text(json.dumps(rows, ensure_ascii=False, indent=1), encoding="utf-8")


if __name__ == "__main__":
    main(sys.argv[1])
