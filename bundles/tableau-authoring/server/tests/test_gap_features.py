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


def test_reference_distribution_like_superstore(root):
    """Superstore's bullet bars: a reference line on a target with percentage bands, shaded below."""
    out = A.add_reference_line(root, "Canal", "SUM(Importe)", scope="per-cell", value_of="SUM(Margen)",
                               percentages=[60, 80], label="")
    rl = next(root.iter("reference-line"))
    assert out["percentages"] == [60, 80]
    assert (rl.get("percentage-bands"), rl.get("fill-below"), rl.get("fill-above")) == ("true", "true", "false")
    assert rl.get("value-column").endswith("[sum:Margen:qk]") and rl.get("axis-column").endswith("[sum:Importe:qk]")
    assert [v.get("percentage") for v in rl.findall("reference-line-value")] == ["60", "80"]
    ws = next(w for w in root.iter("worksheet") if w.get("name") == "Canal")
    assert any(e.get("column", "").endswith("[sum:Margen:qk]") for e in ws.iter("lod"))  # the target is in the view
    assert not [f for f in structure.check(root) if f["level"] == "error"]
    if xsd.find_rcc():
        assert xsd.validate(root)["valid"], xsd.validate(root)["issues"][:3]
    with pytest.raises(ValueError):
        A.add_reference_line(root, "Canal", "SUM(Importe)", band_to="max", percentages=[50])


def test_story_point_captures_a_filter_like_world_indicators(root):
    A.create_story(root, "Historia", [
        {"sheet": "Mapa", "caption": "Todo"},
        {"sheet": "Mapa", "caption": "Solo el norte", "filters": [{"field": "Region", "values": ["N"]}]},
        {"sheet": "Resumen", "caption": "Canal online", "filters": [{"field": "Canal", "values": ["Online"],
                                                                     "worksheet": "Canal"}]}])
    sps = list(root.iter("story-point"))
    assert sps[0].find("capturedDeltas") is None
    w = sps[1].find("capturedDeltas/worksheet")
    assert w.get("name") == "Mapa"
    g = w.find("filter/groupfilter")
    assert (g.get("function"), g.get("member"), g.get(A.U + "ui-domain")) == ("member", '"N"', "relevant")
    assert sps[2].find("capturedDeltas/worksheet").get("name") == "Canal"
    with pytest.raises(ValueError):
        A.add_story_point(root, "Historia", "Resumen", "x", filters=[{"field": "Canal", "values": ["Online"]}])
    A.add_story_point(root, "Historia", "Canal", "Tienda", filters=[{"field": "Canal", "values": ["Tienda"]}])
    assert not [f for f in structure.check(root) if f["level"] == "error"]
    if xsd.find_rcc():
        assert xsd.validate(root)["valid"], xsd.validate(root)["issues"][:3]


def _axis(root, sheet="Canal"):
    ws = root.find(f".//worksheet[@name='{sheet}']")
    return [e for e in ws.iter("encoding") if e.get("attr") == "space"]


def test_axis_options_as_desktops_edit_axis_dialog_writes_them(root):
    # measured with ui_reverse --dialogs on Edit Axis: one <encoding attr='space'> per axis holds every option
    A.format_field(root, "Canal", "SUM(Importe)", axis_min=0, axis_max=1000, include_zero=False, reverse=True,
                   log_scale=True, tick_spacing=250)
    (e,) = _axis(root)
    assert {k: e.get(k) for k in ("range-type", "min", "max", "domain-expand", "reverse", "scale",
                                  "major-spacing", "major-origin")} == {
        "range-type": "fixed", "min": "0.0", "max": "1000.0", "domain-expand": "false", "reverse": "true",
        "scale": "log", "major-spacing": "250.0", "major-origin": "0.0"}
    A.format_field(root, "Canal", "SUM(Importe)", axis_range="independent", reverse=False, show_ticks=False)
    (e,) = _axis(root)
    assert e.get("range-type") == "independent" and e.get("min") is None and e.get("reverse") is None
    assert e.get("major-show") == "false" and e.get("scale") == "log"
    with pytest.raises(ValueError):
        A.format_field(root, "Canal", "SUM(Importe)", axis_range="sideways")
    assert not [f for f in structure.check(root) if f.get("level") == "error"]


def test_measure_filters_as_desktops_filter_dialog_writes_them(root):
    # Range, At least and At most are all in-range with the bounds given; Include Null Values: in-range-or-null
    A.add_filter(root, "Canal", "SUM(Importe)", min=5)
    f = next(x for x in root.find(".//worksheet[@name='Canal']").iter("filter") if x.get("class") == "quantitative")
    assert f.get("included-values") == "in-range" and f.find("min").text == "5" and f.find("max") is None
    A.add_filter(root, "Canal", "SUM(Importe)", min=5, max=50, include_null=True)
    f = next(x for x in root.find(".//worksheet[@name='Canal']").iter("filter") if x.get("class") == "quantitative")
    assert f.get("included-values") == "in-range-or-null"


def test_band_is_two_paired_lines_like_desktop(root):
    # Add Reference Line, Band, or Box > Band: two <reference-line> naming each other in paired-id
    res = A.add_reference_line(root, "Canal", "SUM(Importe)", formula="min", band_to="max", scope="per-pane")
    lines = list(root.find(".//worksheet[@name='Canal']").iter("reference-line"))
    assert [(rl.get("id"), rl.get("formula"), rl.get("paired-id")) for rl in lines] == [
        ("refline0", "min", "refline1"), ("refline1", "max", "refline0")]
    assert res["pairedWith"] == "refline1" and all(rl.get("band-formula") is None for rl in lines)
    from tableu_mcp import xsd
    assert xsd.validate(root)["valid"]
