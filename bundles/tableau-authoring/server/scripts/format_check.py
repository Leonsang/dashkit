"""Formatting QA workbook with loud colors, so each setting is visible in one render.

    uv run python scripts/format_check.py           # builds out/format_check.twb
    uv run python scripts/check_workbook.py out/format_check.twb Formato out/format_check.png
"""

import sys
from pathlib import Path

from tableu_mcp import authoring as A
from tableu_mcp import twb

SUPERSTORE = r"C:\Program Files\Tableau\Tableau 2026.3\defaults\Datasources\Sample - Superstore.tds"
DS = "Sample - Superstore"
out = Path(sys.argv[1] if len(sys.argv) > 1 else "out/format_check.twb")

r = twb.new_workbook()
twb.add_datasource_from_tds(r, SUPERSTORE)

# 1. Backgrounds of every worksheet area + rich title
A.create_worksheet(r, "Fondos", DS, rows=["Category"], cols=["SUM(Sales)"], mark="bar", title="Fondos de hoja")
A.set_backgrounds(r, "Fondos", worksheet="#fff3c4", pane="#d6ecff", header="#ffd6e7", title="#c8f7c5")
A.style_text_runs(r, "Fondos", "title", font="Georgia", size=16, color="#b00020", italic=True, align="center")

# 2. Banding, borders, header/cell fonts on a text table
A.create_worksheet(r, "Bandas", DS, rows=["Sub-Category"], cols=["Region"], mark="text", label="SUM(Sales)",
                   title="Bandas y bordes")
A.set_banding(r, "Bandas", rows=True, color="#e0e0ff")
A.set_borders(r, "Bandas", area="cell", style="solid", color="#ff0000", width=1)
A.set_font(r, "Bandas", "header", color="#c62828", bold=True)
A.set_font(r, "Bandas", "cell", size=9, align="right", color="#1b5e20")

# 3. Lines + axis title font + mark labels
A.create_worksheet(r, "Lineas", DS, cols=["MONTH_TRUNC(Order Date)"], rows=["SUM(Profit)"], mark="line",
                   title="Lineas y ejes")
A.set_lines(r, "Lineas", "gridline", visible=True, color="#ff0000", width=2, pattern="dashed")
A.set_lines(r, "Lineas", "zeroline", visible=True, color="#000000", width=3)
A.set_font(r, "Lineas", "axis-title", size=14, color="#0d47a1")
A.set_font(r, "Lineas", "axis", color="#6a1b9a")

# 4. Marks: borders, labels font, reference line fill, legend + filter card backgrounds
A.create_worksheet(r, "Marcas", DS, cols=["SUM(Sales)"], rows=["SUM(Profit)"], detail=["State/Province"],
                   color="Region", mark="circle", title="Marcas, etiquetas y referencia")
A.format_marks(r, "Marcas", size=3, show_labels=True)
A.format_mark_border(r, "Marcas", color="#000000")
A.set_font(r, "Marcas", "label", color="#8e24aa", bold=True, size=8)
ref = A.add_reference_line(r, "Marcas", "SUM(Profit)", "average", label="Promedio")
A.format_reference_line(r, "Marcas", ref["referenceLine"], color="#2e7d32", width=3, pattern="dashed",
                        fill_above="#c8e6c955", fill_below="#ffcdd255")
A.add_filter(r, "Marcas", "Region", values=["Central", "East", "South", "West"], show_card=True)
A.set_backgrounds(r, "Marcas", legend="#ffe0b2", filter_card="#e0f7fa")

# 5. Workbook font
A.format_workbook(r, font="Courier New")

# Dashboard: dark background, styled title, container background, zone padding/border, cards in the panel
twb.add_dashboard(r, "Formato", ["Fondos", "Bandas", "Lineas", "Marcas"], layout="grid", width=1400, height=900)
A.format_dashboard(r, "Formato", background="#263238")
A.style_text_runs(r, "Formato", "dashboard-title", size=24, color="#ffffff", bold=True)
A.add_zone(r, "Formato", "text", text="Texto en itálica sobre fondo", font_size=12, font_color="#ffeb3b",
           background="#37474f", italic=True, font="Georgia")
A.add_zone(r, "Formato", "filter", sheet="Marcas", field="Region")
A.add_zone(r, "Formato", "legend-color", sheet="Marcas", field="Region")
zones = A.list_zones(r, "Formato")
row = next(z for z in zones if z["type"] == "layout-flow" and z["depth"] == 3)
A.format_container(r, "Formato", row["id"], background="#ff8a65", border_color="#ffffff")
fondos = next(z for z in zones if z["name"] == "Fondos" and z["type"] == "sheet")
A.format_zone(r, "Formato", fondos["id"], background="#ffffff", border="#00e676", padding=12)

# Story formatting (validated; API 0.1.1 can't export story images)
A.create_story(r, "Historia", [{"sheet": "Formato", "caption": "Formato completo"}])
A.format_story(r, "Historia", caption_background="#ffcc80", caption_font="Georgia", caption_size=14)

twb.write_workbook_file(out, twb.serialize(r))
print("saved", out)
