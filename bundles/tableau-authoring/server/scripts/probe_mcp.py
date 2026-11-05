"""End-to-end over the MCP protocol, as an agent would do it (no Desktop needed: target is a .twb file).

    uv run python scripts/probe_mcp.py
"""

import asyncio
import json
from pathlib import Path

from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "data" / "demo"
TARGET = str(ROOT / "out" / "mcp_e2e.twb")


async def call(s, tool, **args):
    res = await s.call_tool(tool, args)
    text = res.content[0].text if res.content else ""
    try:
        data = json.loads(text)
    except ValueError:
        data = text
    if isinstance(data, dict) and "error" in data:
        raise RuntimeError(f"{tool} {args.get('operation')}: {data['error']}")
    return data


async def main():
    Path(TARGET).unlink(missing_ok=True)
    async with stdio_client(StdioServerParameters(command="uv", args=["run", "tableu-mcp"], cwd=str(ROOT))) as (r, w):
        async with ClientSession(r, w) as s:
            await s.initialize()
            tools = (await s.list_tools()).tools
            print(len(tools), "tools")
            print("resources:", [str(x.uri) for x in (await s.list_resources()).resources])
            await call(s, "workbook_operations", operation="New", params={"path": TARGET})
            await call(s, "transaction_operations", operation="Begin", target=TARGET)
            await call(s, "datasource_operations", operation="CreateFromFiles", target=TARGET, params={
                "sources": [f"Ventas={DATA / 'ventas.csv'}", f"Tiendas={DATA / 'tiendas.csv'}",
                            f"{DATA / 'catalogo.xlsx'}#Productos"],
                "relationships": ["Ventas.TiendaID = Tiendas.TiendaID", "Ventas.ProductoID = Productos.ProductoID"],
                "caption": "Café Montaña"})
            ds = "Café Montaña"
            await call(s, "calculation_operations", operation="Create", target=TARGET, definitions=[
                {"datasource": ds, "name": "Ingresos", "formula": "[Cantidad] * [PrecioUnitario] * (1 - [Descuento])",
                 "default_format": 'c"$"#,##0'},
                {"datasource": ds, "name": "Margen %", "formula": "(SUM([Ingresos]) - SUM([CostoTotal])) / SUM([Ingresos])",
                 "default_format": "p0.0%"}])
            await call(s, "field_operations", operation="Update", target=TARGET,
                       params={"datasource": ds, "field": "Ciudad", "geo_role": "city"})
            await call(s, "parameter_operations", operation="Create", target=TARGET,
                       params={"name": "Meta margen", "datatype": "real", "value": 0.6, "domain": "range",
                               "min": 0.3, "max": 0.9, "step": 0.05, "default_format": "p0%"})
            await call(s, "worksheet_operations", operation="Create", target=TARGET, definitions=[
                {"name": "Ingresos mensuales", "datasource": ds, "cols": ["MONTH_TRUNC(Fecha)"],
                 "rows": ["SUM(Ingresos)"], "mark": "line", "title": "Ingresos mensuales"},
                {"name": "Ingresos por categoría", "datasource": ds, "rows": ["Categoria"], "cols": ["SUM(Ingresos)"],
                 "mark": "bar", "sort": {"field": "Categoria", "by": "SUM(Ingresos)"}, "show_labels": True,
                 "title": "Ingresos por categoría"},
                {"name": "Margen por tienda", "datasource": ds, "rows": ["Tienda"], "cols": ["Margen %"], "mark": "bar",
                 "color": "Region", "sort": {"field": "Tienda", "by": "Margen %"}, "title": "Margen bruto por tienda"}])
            await call(s, "analytics_operations", operation="AddReferenceLine", target=TARGET,
                       params={"worksheet": "Margen por tienda", "measure": "Margen %", "formula": "average"})
            await call(s, "filter_operations", operation="Add", target=TARGET,
                       params={"worksheet": "Ingresos mensuales", "field": "Region", "values": ["Andina", "Caribe", "Pacífica"],
                               "show_card": True})
            await call(s, "dashboard_operations", operation="Create", target=TARGET,
                       params={"name": "Resumen", "sheets": ["Ingresos mensuales", "Ingresos por categoría", "Margen por tienda"],
                               "width": 1200, "height": 800})
            await call(s, "dashboard_operations", operation="AddZone", target=TARGET, definitions=[
                {"dashboard": "Resumen", "kind": "legend-color", "sheet": "Margen por tienda", "field": "Region"},
                {"dashboard": "Resumen", "kind": "filter", "sheet": "Ingresos mensuales", "field": "Region"}])
            await call(s, "action_operations", operation="Create", target=TARGET,
                       params={"kind": "filter", "name": "Filtrar por categoría", "source": "Ingresos por categoría",
                               "target": "Resumen", "source_dashboard": "Resumen"})
            status = await call(s, "transaction_operations", operation="Status", target=TARGET)
            print("tx:", {k: status[k] for k in ("active", "worksheets", "dashboards")})
            commit = await call(s, "transaction_operations", operation="Commit", target=TARGET)
            print("commit:", commit["committed"], "| validator:", commit["validation"]["validator"])
            info = await call(s, "workbook_operations", operation="Info", target=TARGET)
            print("sheets:", info["worksheets"], info["dashboards"], "| actions:", [a["caption"] for a in info["actions"]])
            lint = await call(s, "workbook_operations", operation="Lint", target=TARGET)
            print("lint score:", lint["score"], [f["rule"] for f in lint["findings"]])
            helptext = await call(s, "story_operations", operation="Help")
            print("help ok:", list(helptext["story"]["operations"]))


asyncio.run(main())
