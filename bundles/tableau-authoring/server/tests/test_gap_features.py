"""Features from the coverage-gap pool, written as Tableau's own Superstore writes them — no Tableau needed.

- custom continuous color: <encoding type='custom-interpolated' center= min= max= num-steps=><color-palette
  custom='true' type='ordered-diverging'><color>...</color></color-palette></encoding>
- actions from a whole dashboard but some sheets: <source dashboard='Overview' type='sheet'><exclude-sheet .../>
"""

from __future__ import annotations

from pathlib import Path

import pytest

from tableu_mcp import authoring as A
from tableu_mcp import connectors, registry, structure, twb, xsd


@pytest.fixture()
def root(tmp_path: Path):
    csv = tmp_path / "v.csv"
    csv.write_text("Region,Canal,Importe,Margen\nN,Online,10,-2\nS,Tienda,20,5\n", encoding="utf-8")
    r = twb.new_workbook()
    connectors.add_file_datasource(r, [f"Ventas={csv}"])
    A.create_worksheet(r, "Mapa", "Ventas", rows=["Region"], cols=["SUM(Importe)"], mark="bar", color="SUM(Margen)")
    A.create_worksheet(r, "Canal", "Ventas", rows=["Canal"], cols=["SUM(Importe)"], mark="bar")
    A.create_worksheet(r, "Detalle", "Ventas", rows=["Region", "Canal"], cols=["SUM(Importe)"], mark="bar")
    registry._db_create(r, "Resumen", rows=[["Mapa", "Canal"], ["Detalle"]])
    return r


def _enc(root):
    return next(e for e in root.iter("encoding") if e.get("type") == "custom-interpolated")


def test_diverging_gradient_like_superstore(root):
    A.set_color_palette(root, "Mapa", "SUM(Margen)", gradient=["#9c0824", "#cacaca", "#00557f"], steps=5)
    e = _enc(root)
    assert (e.get("center"), e.get("num-steps")) == ("0.0", "5")
    cp = e.find("color-palette")
    assert (cp.get("custom"), cp.get("type")) == ("true", "ordered-diverging")
    assert [c.text for c in cp] == ["#9c0824", "#cacaca", "#00557f"]
    assert e.getparent().getparent().getparent().tag == "datasource"  # kept with the data source, like palettes


def test_sequential_gradient_with_fixed_range(root):
    A.set_color_palette(root, "Mapa", "SUM(Margen)", gradient=["#eeeeee", "#1c688d"], min=0, max=100)
    e = _enc(root)
    assert (e.get("min"), e.get("max"), e.get("center")) == ("0.0", "100.0", None)
    assert e.find("color-palette").get("type") == "ordered-sequential"


def test_gradient_is_for_measures(root):
    with pytest.raises(ValueError, match="measures"):
        A.set_color_palette(root, "Canal", "Canal", gradient=["#000000", "#ffffff"])
    with pytest.raises(ValueError, match="2 colors"):
        A.set_color_palette(root, "Mapa", "SUM(Margen)", gradient=["#000000"])


def test_action_from_a_dashboard_except_some_sheets(root):
    A.create_action(root, "filter", "Filtrar detalle", "*", target="Resumen", source_dashboard="Resumen",
                    exclude_sheets=["Detalle"], fields=["Region"])
    src = root.find(".//actions/action/source")
    assert src.get("dashboard") == "Resumen" and src.get("worksheet") is None
    assert [e.get("name") for e in src.findall("exclude-sheet")] == ["Detalle"]
    assert not [f for f in structure.check(root) if f["level"] == "error"]
    with pytest.raises(ValueError, match="source_dashboard"):
        A.create_action(root, "filter", "x", "*", target="Resumen")


def test_reference_line_scope_is_validated(root):
    A.add_reference_line(root, "Canal", "SUM(Importe)", scope="per-cell")
    with pytest.raises(ValueError, match="scope"):
        A.add_reference_line(root, "Canal", "SUM(Importe)", scope="per-row")


@pytest.mark.skipif(not xsd.find_rcc(), reason="needs Tableau Desktop's schema")
def test_gap_features_pass_tableau_schema(root):
    A.set_color_palette(root, "Mapa", "SUM(Margen)", gradient=["#9c0824", "#cacaca", "#00557f"], steps=5)
    A.create_action(root, "filter", "Filtrar detalle", "*", target="Resumen", source_dashboard="Resumen",
                    exclude_sheets=["Detalle"])
    assert xsd.validate(root)["valid"], xsd.validate(root)["issues"][:3]


def test_hiding_a_title_removes_its_card_like_show_title(root):
    """Worksheet > Show Title (tabui:view-title-card) removes <card type='title'/> from the window."""
    cards = lambda: [c.get("type") for c in root.find("windows/window[@name='Canal']/cards").iter("card")]  # noqa: E731
    assert "title" in cards()
    A.set_title(root, "Canal", None)
    assert "title" not in cards()
    A.set_title(root, "Canal", "Ventas por canal")
    assert cards().count("title") == 1
    assert root.find("worksheets/worksheet[@name='Canal']/layout-options/title") is not None


def test_view_options_write_what_desktop_menus_write(root):
    """Shapes measured on Desktop's menus with scripts/ui_reverse.py (tableu://ui-commands)."""
    A.set_view_options(root, "Canal", caption=True, summary=True, sort_controls=False, toolbar="hide",
                       empty_rows=True, row_totals_left=True, aggregate=False, special_values="hide", title=False)
    win = root.find("windows/window[@name='Canal']")
    edges = {e.get("name"): [c.get("type") for c in e.iter("card")] for e in win.find("cards")}
    assert edges["bottom"] == ["caption"] and edges["right"] == ["summary"] and "title" not in edges["top"]
    summary = win.find("cards/edge[@name='right']/strip/card")
    assert (summary.get("AVG"), summary.get("KURTOSIS")) == ("true", "false")
    assert win.find("viewpoint/floating-toolbar-visibility").get("value") == "2"
    ws = root.find("worksheets/worksheet[@name='Canal']")
    view = ws.find("table/view")
    assert view.find("hide-sort-controls") is not None and view.find("aggregation").get("value") == "false"
    assert root.find("document-format-change-manifest/HideSortControls") is not None
    assert ws.find("table/rows").get("include-empty") == "true" and ws.find("table/cols").get("onLeft") == "true"
    fmts = {f.get("attr"): f.get("value") for f in ws.iterfind("table/style/style-rule[@element='table']/format")}
    assert fmts == {"omit-on-special": "true", "break-on-special": "true", "show-null-value-warning": "false"}
    assert not [f for f in structure.check(root) if f["level"] == "error"]
    if xsd.find_rcc():
        assert xsd.validate(root)["valid"], xsd.validate(root)["issues"][:3]
    # and back
    A.set_view_options(root, "Canal", caption=False, summary=False, sort_controls=True, toolbar="auto", title=True)
    edges = {e.get("name"): [c.get("type") for c in e.iter("card")] for e in win.find("cards")}
    assert "bottom" not in edges and "right" not in edges and "title" in edges["top"]
    assert view.find("hide-sort-controls") is None and win.find("viewpoint") is None
