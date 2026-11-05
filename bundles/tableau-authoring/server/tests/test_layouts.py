"""Dashboard layouts measured on Tableau's own dashboards, and the lint's space checks — no Tableau needed."""

from __future__ import annotations

from pathlib import Path

import pytest

from tableu_mcp import authoring as A
from tableu_mcp import connectors, layouts, lint, structure, twb


@pytest.fixture()
def root(tmp_path: Path):
    csv = tmp_path / "v.csv"
    csv.write_text("Region,Canal,Segmento,Fecha,Importe,Coste\nN,Online,A,2025-01-01,10,4\n"
                   "S,Tienda,B,2025-02-01,20,9\n", encoding="utf-8")
    r = twb.new_workbook()
    connectors.add_file_datasource(r, [f"Ventas={csv}"])
    A.create_worksheet(r, "KPIs", "Ventas", measures=["SUM(Importe)", "SUM(Coste)"])
    A.create_worksheet(r, "Tendencia", "Ventas", cols=["MONTH_TRUNC(Fecha)"], rows=["SUM(Importe)"], mark="line",
                       color="Canal")
    A.create_worksheet(r, "PorRegion", "Ventas", rows=["Region"], cols=["SUM(Importe)"], mark="bar")
    A.create_worksheet(r, "Detalle", "Ventas", rows=["Region"], cols=["Canal"], mark="text", label="SUM(Importe)")
    return r


def _dash_findings(r, name):
    return [f for f in lint.lint(r).findings if f.location == f"dashboard:{name}" and f.rule.startswith("DASH-")
            and f.rule != "DASH-NUM-VIEWS"]


def _fixed_ok(r, name):
    db = r.find(f"dashboards/dashboard[@name='{name}']")
    for flow in db.iter("zone"):
        if flow.get("type-v2") == "layout-flow":
            fixed = sum(int(k.get("fixed-size")) for k in flow.findall("zone") if k.get("is-fixed") == "true")
            assert fixed <= A._flow_px(db, flow), (name, flow.get("id"), fixed)


@pytest.mark.parametrize("layout", list(layouts.PRESETS))
def test_every_layout_builds_clean(root, layout):
    out = layouts.create(root, f"D_{layout}", layout, kpis=["KPIs"], main=["Tendencia"], details=["PorRegion"],
                         filters=[{"sheet": "Tendencia", "field": "Region"}, {"sheet": "Tendencia", "field": "Segmento"}],
                         legends=[{"sheet": "Tendencia", "field": "Canal"}])
    assert out["layout"] == layout and len(out["controls"]) == 3
    assert not [f for f in structure.check(root) if f["level"] == "error"]
    assert not _dash_findings(root, f"D_{layout}")
    _fixed_ok(root, f"D_{layout}")


def test_overview_kpi_strip_matches_superstore(root):
    out = layouts.create(root, "O", "overview", kpis=["KPIs"], main=["Tendencia"], details=["PorRegion"])
    db = root.find("dashboards/dashboard[@name='O']")
    kpi_row = next(z for z in db.iter("zone") if z.find("zone[@name='KPIs']") is not None)
    assert abs(int(kpi_row.get("fixed-size")) - 117) <= 2  # Superstore's Overview: 117 px
    assert out["heights"][0] == pytest.approx(117 * 100 / (800 * 0.94), abs=0.1)


def test_sidebar_puts_controls_in_a_pinned_panel(root):
    layouts.create(root, "S", "sidebar", main=["Tendencia"], filters=[{"sheet": "Tendencia", "field": "Region"}],
                   legends=[{"sheet": "Tendencia", "field": "Canal"}])
    db = root.find("dashboards/dashboard[@name='S']")
    _, panel = A._main_parts(db)
    assert panel is not None and panel.get("is-fixed") == "true"
    assert {z.get("type-v2") for z in panel.iter("zone")} >= {"filter", "color"}


def test_filterbar_row_under_the_title(root):
    layouts.create(root, "F", "filterbar", main=["Detalle"],
                   filters=[{"sheet": "Detalle", "field": "Region"}, {"sheet": "Detalle", "field": "Canal"}])
    db = root.find("dashboards/dashboard[@name='F']")
    main, _ = A._main_parts(db)
    kids = A._kids(main)
    assert kids[0].get("type-v2") == "title"
    bar = kids[1]
    assert (bar.get("param"), bar.get("fixed-size")) == ("horz", "62")  # Superstore's Order Details: 62 px
    assert [z.get("type-v2") for z in A._kids(bar)] == ["filter", "filter"]
    _fixed_ok(root, "F")


def test_unknown_layout_and_missing_main(root):
    with pytest.raises(ValueError, match="Unknown layout"):
        layouts.create(root, "X", "bento", main=["Tendencia"])
    with pytest.raises(ValueError, match="main"):
        layouts.create(root, "X", "overview")


def test_lint_flags_small_views_and_fixed_overflow(root):
    twb.add_dashboard(root, "Apretado", [], "grid", 600, 300, True,
                      [["Tendencia", "PorRegion", "Detalle", "KPIs"]], None)
    rules = {f.rule for f in _dash_findings(root, "Apretado")}
    assert "DASH-SMALL-VIEW" in rules
    db = root.find("dashboards/dashboard[@name='Apretado']")
    main, _ = A._main_parts(db)
    A._kids(main)[-1].set("fixed-size", "900")
    assert "DASH-FIXED-OVERFLOW" in {f.rule for f in _dash_findings(root, "Apretado")}


def test_adding_a_title_row_keeps_rows_inside_the_page(root):
    twb.add_dashboard(root, "T", [], "grid", 1200, 800, True, [["KPIs"], ["Tendencia"]], [20, 80])
    A.add_zone(root, "T", "filter", sheet="Tendencia", field="Region", container="title", fixed_width=160)
    _fixed_ok(root, "T")
