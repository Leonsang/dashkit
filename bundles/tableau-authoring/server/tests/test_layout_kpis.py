"""KPI strips (Measure Names/Values), card titles, zone placement, workbook locale — no Tableau needed.

Shapes checked against Tableau Desktop 2026.3 (schema + render) on 2026-11-05; Measure Names/Values and
custom-title follow Tableau's own Superstore sample, with <sort class="manual"> instead of the older
<manual-sort> that 2026.3's schema rejects.
"""

from __future__ import annotations

from pathlib import Path

import pytest

from tableu_mcp import authoring as A
from tableu_mcp import connectors, twb


@pytest.fixture()
def root(tmp_path: Path):
    csv = tmp_path / "ventas.csv"
    csv.write_text("Canal,Importe,Nota\nOnline,10.5,4\nTienda,20,5\n", encoding="utf-8")
    r = twb.new_workbook()
    connectors.add_file_datasource(r, [f"Ventas={csv}"])
    A.create_worksheet(r, "Por canal", "Ventas", rows=["Canal"], cols=["SUM(Importe)"], mark="bar")
    return r


def test_kpi_strip_uses_measure_names_and_values(root):
    A.create_worksheet(root, "KPIs", "Ventas", measures=["SUM(Importe)", "AVG(Nota)"],
                       measure_labels={"SUM(Importe)": "Ingresos"}, value_font={"size": 26, "bold": True})
    ws = root.find("worksheets/worksheet[@name='KPIs']")
    dsn = ws.find("table/view/datasources/datasource").get("name")
    assert ws.findtext("table/cols") == f"[{dsn}].[:Measure Names]"
    assert ws.find("table/panes/pane/encodings/text").get("column") == f"[{dsn}].[Multiple Values]"
    view = ws.find("table/view")
    assert view.find("manual-sort") is None
    sort = view.find("sort[@class='manual']")
    assert [b.text for b in sort.iter("bucket")] == [f'"[{dsn}].[sum:Importe:qk]"', f'"[{dsn}].[avg:Nota:qk]"']
    tags = [c.tag for c in view]
    assert tags.index("filter") < tags.index("sort") < tags.index("slices") < tags.index("aggregation")
    alias = root.find(f".//datasource[@name='{dsn}']/column[@name='[:Measure Names]']/aliases/alias")
    assert alias.get("value") == "Ingresos"
    cell = {f.get("attr"): f.get("value") for f in ws.find("table/style/style-rule[@element='cell']")}
    assert cell["font-size"] == "26" and cell["font-weight"] == "bold" and cell["text-align"] == "center"


def test_label_font_on_text_marks_also_styles_cells(root):
    A.create_worksheet(root, "Total", "Ventas", mark="text", label="SUM(Importe)")
    out = A.set_font(root, "Total", "label", size=20, bold=True)
    assert out["alsoApplied"] == "cell"
    rule = root.find("worksheets/worksheet[@name='Total']/table/style/style-rule[@element='cell']")
    assert {f.get("attr") for f in rule} >= {"font-size", "font-weight"}


def test_workbook_locale(root):
    A.format_workbook(root, locale="es_ES")
    assert root.get("locale") == "es_ES"
    A.format_workbook(root, locale="")
    assert root.get("locale") is None
    with pytest.raises(ValueError):
        A.format_workbook(root, locale="spanish")


def _dash(root):
    A.create_worksheet(root, "Total", "Ventas", mark="text", label="SUM(Importe)")
    twb.add_dashboard(root, "D", [], width=1200, height=800, rows=[["Total"], ["Por canal"]], heights=[30, 70])
    return root.find("dashboards/dashboard[@name='D']")


def test_filter_title_is_a_text_zone_over_a_card_without_title(root):
    db = _dash(root)
    out = A.add_zone(root, "D", "filter", sheet="Por canal", field="Canal", mode="dropdown",
                     container="title", fixed_width=220, title="Elige un canal")
    box = next(z for z in db.iter("zone") if z.get("id") == out["zone"])
    txt, card = box.findall("zone")
    assert txt.get("type-v2") == "text" and txt.findtext("formatted-text/run") == "Elige un canal"
    assert card.get("type-v2") == "filter" and card.get("show-title") == "false"
    row = box.getparent()
    assert row.get("param") == "horz" and row.find("zone").get("type-v2") == "title"
    assert box.get("is-fixed") == "true" and box.get("fixed-size") == "220"
    assert len({z.get("id") for z in db.iter("zone")}) == len(list(db.iter("zone")))


def test_zone_into_row_at_position_and_side_panel_is_pinned(root):
    db = _dash(root)
    out = A.add_zone(root, "D", "text", text="Nota", container="row:2", position=0, fixed_width=150)
    row2 = [z for z in db.iter("zone") if z.get("param") == "horz"][-1]
    assert row2.findall("zone")[0].get("id") == out["zone"]
    with pytest.raises(ValueError):
        A.add_zone(root, "D", "text", text="x", container="row:2", fixed_height=40)
    A.add_zone(root, "D", "filter", sheet="Por canal", field="Canal", title="Canal")
    panel = next(z for z in db.iter("zone") if A._is_panel(z))
    assert panel.get("is-fixed") == "true" and panel.get("fixed-size") == str(A.PANEL_WIDTH_PX)


def test_structure_check_accepts_tableu_output_and_flags_breakage(root):
    from lxml import etree

    from tableu_mcp import structure

    A.create_worksheet(root, "KPIs", "Ventas", measures=["SUM(Importe)", "AVG(Nota)"])
    assert structure.summary(structure.check(root))["error"] == 0
    view = root.find("worksheets/worksheet[@name='KPIs']/table/view")
    view.find("sort").tag = "manual-sort"
    ds = view.find("datasources")
    view.remove(ds)
    view.append(ds)
    root.find("worksheets/worksheet/table/panes/pane/mark").set("class", "Barra")
    rules = {f["rule"] for f in structure.check(root) if f["level"] == "error"}
    assert rules == {"STRUCT-REJECTED", "STRUCT-ORDER", "STRUCT-VALUE"}
    etree.SubElement(view, "inventado")
    assert any(f["rule"] == "STRUCT-UNKNOWN-ELEMENT" for f in structure.check(root))


def test_sorts_follow_the_workbook_format(root):
    """A workbook that declares SortTagCleanup (Tableau's modern samples) takes <computed-sort>; others <sort>."""
    from lxml import etree

    A.create_worksheet(root, "Orden", "Ventas", rows=["Canal"], cols=["SUM(Importe)"], mark="bar",
                       sort={"field": "Canal", "by": "SUM(Importe)"})
    old = twb.parse(twb.serialize(root))
    assert old.find(".//worksheet[@name='Orden']/table/view/sort[@class='computed']") is not None
    etree.SubElement(root.find("document-format-change-manifest"), "SortTagCleanup")
    new = twb.parse(twb.serialize(root))
    v = new.find(".//worksheet[@name='Orden']/table/view")
    assert v.find("sort") is None and v.find("computed-sort").get("using")


def test_fixed_item_in_an_evenly_shared_row_keeps_its_width(root):
    """Desktop ignores fixed sizes inside a distribute-evenly flow: the sheets move to an inner even flow."""
    A.create_worksheet(root, "Total", "Ventas", mark="text", label="SUM(Importe)")
    A.create_worksheet(root, "Otra", "Ventas", rows=["Canal"], cols=["SUM(Importe)"], mark="bar")
    twb.add_dashboard(root, "D", [], rows=[["Total"], ["Por canal", "Otra"]], heights=[30, 70])
    A.add_zone(root, "D", "filter", sheet="Por canal", field="Canal", container="title", fixed_width=200)
    out = A.add_zone(root, "D", "parameter", parameter="P", container="row:2", fixed_width=180) \
        if root.find(".//column[@name='[P]']") is not None else \
        A.add_zone(root, "D", "text", text="nota", container="row:2", fixed_width=180)
    db = root.find("dashboards/dashboard[@name='D']")
    z = next(x for x in db.iter("zone") if x.get("id") == out["zone"])
    row = z.getparent()
    assert row.get("layout-strategy-id") is None and z.get("fixed-size") == "180"
    inner = row.find("zone")
    assert inner.get("layout-strategy-id") == "distribute-evenly"
    assert {x.get("name") for x in inner.findall("zone")} == {"Por canal", "Otra"}
