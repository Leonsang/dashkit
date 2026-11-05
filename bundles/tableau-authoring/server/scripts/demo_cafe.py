"""End-to-end demo: files (2 CSV + 1 Excel) -> related datasource -> calcs -> 3 views -> dashboard.

    uv run python scripts/make_demo_data.py
    uv run python scripts/demo_cafe.py            # builds out/cafe_montana.twb, lints, applies live, exports PNG
"""

import json
import sys
from pathlib import Path

from tableu_mcp import connectors, ops, twb
from tableu_mcp.client import DesktopClient
from tableu_mcp.lint import lint

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "data" / "demo"
OUT = ROOT / "out"
DS = "Café Montaña"

root = twb.new_workbook()
info = connectors.add_file_datasource(
    root,
    [f"Ventas={DATA / 'ventas.csv'}", f"Tiendas={DATA / 'tiendas.csv'}", f"{DATA / 'catalogo.xlsx'}#Productos"],
    ["Ventas.TiendaID = Tiendas.TiendaID", "Ventas.ProductoID = Productos.ProductoID"],
    caption=DS,
)
ingresos = twb.add_calculated_field(root, DS, "Ingresos", "[Cantidad] * [PrecioUnitario] * (1 - [Descuento])",
                                    default_format='c"$"#,##0')
twb.add_calculated_field(root, DS, "Margen %", f"(SUM({ingresos}) - SUM([CostoTotal])) / SUM({ingresos})",
                          default_format="p0.0%")

twb.add_worksheet(root, "Ingresos mensuales", DS, cols=["MONTH_TRUNC(Fecha)"], rows=["SUM(Ingresos)"],
                  mark="line", title="Ingresos mensuales (COP)")
twb.add_worksheet(root, "Ingresos por categoría", DS, rows=["Categoria"], cols=["SUM(Ingresos)"], mark="bar",
                  sort_desc_by="SUM(Ingresos)", label="SUM(Ingresos)", title="Ingresos por categoría")
twb.add_worksheet(root, "Margen por tienda", DS, rows=["Tienda"], cols=["Margen %"], mark="bar", color="Region",
                  sort_desc_by="Margen %", title="Margen bruto por tienda")
twb.add_dashboard(root, "Resumen Café Montaña", ["Ingresos mensuales", "Ingresos por categoría", "Margen por tienda"],
                  layout="grid", width=1200, height=800)

xml = twb.serialize(root)
twb_path = twb.write_workbook_file(OUT / "cafe_montana.twb", xml)
report = lint(root).as_dict()
print(json.dumps({"datasource": info["caption"], "tables": [t["caption"] for t in info["tables"]],
                  "file": str(twb_path), "lint_score": report["score"],
                  "findings": [f"{f['severity']} {f['rule']}: {f['message']}" for f in report["findings"]]},
                 ensure_ascii=False, indent=1))

if "--offline" in sys.argv:
    sys.exit(0)
res = ops.save("live", xml)
print(json.dumps({"applied": res["applied"], "validation": res["validation"]}, ensure_ascii=False, indent=1))
if res["applied"]:
    png = DesktopClient.connect().sheet_image("dashboards", "Resumen Café Montaña")
    (OUT / "cafe_montana.png").write_bytes(png)
    print(f"PNG -> {OUT / 'cafe_montana.png'} ({len(png)} bytes)")
