"""Joins (physical layer of a logical table) and dual-axis colors — no Tableau needed.

Join shape: Tableau's own documents (Local/data/*.tds): <relation type='join' join='left'><clause type='join'>
<expression op='='>[A].[col] [B].[col]</expression></clause> left right</relation>, here inside the logical
table's <object><properties>; checked against Desktop 2026.3 (schema, load and values) on 2026-11-05.
"""

from __future__ import annotations

from pathlib import Path

import pytest

from tableu_mcp import authoring as A
from tableu_mcp import connectors, structure, twb, xsd


@pytest.fixture()
def files(tmp_path: Path) -> list[str]:
    (tmp_path / "ventas.csv").write_text("Region,Canal,Importe\nN,Online,10\nS,Tienda,20\n", encoding="utf-8")
    (tmp_path / "regiones.csv").write_text("Region,Nombre\nN,Norte\nS,Sur\n", encoding="utf-8")
    (tmp_path / "canales.csv").write_text("Canal,Tipo\nOnline,Digital\nTienda,Fisico\n", encoding="utf-8")
    return [f"Ventas={tmp_path / 'ventas.csv'}", f"Regiones={tmp_path / 'regiones.csv'}",
            f"Canales={tmp_path / 'canales.csv'}"]


def test_joins_make_one_logical_table(files):
    root = twb.new_workbook()
    r = connectors.add_file_datasource(root, files, caption="J",
                                       joins=["left: Ventas.Region = Regiones.Region", "Ventas.Canal = Canales.Canal"])
    ds = twb.find_datasource(root, "J")
    objects = list(ds.iter("object"))
    assert len(objects) == 1 and objects[0].get("caption") == "Ventas"
    top = objects[0].find("properties/relation")
    assert (top.get("type"), top.get("join")) == ("join", "inner")  # the last join is the outermost
    inner = top.find("relation[@type='join']")
    assert inner.get("join") == "left"
    ops = [e.get("op") for e in inner.find("clause").iter("expression")]
    assert ops == ["=", "[Ventas].[Region]", "[Regiones].[Region]"]
    assert [t.get("name") for t in top.iter("relation") if t.get("type") == "table"] == ["Ventas", "Regiones", "Canales"]
    # every column belongs to the one logical table; the repeated key gets its table's name
    ids = {e.text for e in ds.iter() if isinstance(e.tag, str) and e.tag.endswith("object-id")}
    assert ids == {f"[{objects[0].get('id')}]"}
    assert "Region (Regiones)" in r["fields"] and "Tipo" in r["fields"]
    A.create_worksheet(root, "PorTipo", "J", rows=["Tipo"], cols=["SUM(Importe)"], mark="bar")
    assert not [f for f in structure.check(root) if f["level"] == "error"]


def test_joins_and_relationships_together(files):
    root = twb.new_workbook()
    connectors.add_file_datasource(root, files, caption="J", joins=["Ventas.Region = Regiones.Region"],
                                   relationships=["Ventas.Canal = Canales.Canal"])
    ds = twb.find_datasource(root, "J")
    assert [o.get("caption") for o in ds.iter("object")] == ["Ventas", "Canales"]
    assert ds.find(".//relationships/relationship") is not None


def test_bad_joins_are_refused(files):
    root = twb.new_workbook()
    with pytest.raises(ValueError, match="relationships"):
        connectors.add_file_datasource(root, files, joins=["Ventas.Region = Regiones.Region"])
    with pytest.raises(ValueError, match="join each table once"):
        connectors.add_file_datasource(root, files, joins=["Ventas.Region = Regiones.Region",
                                                           "Ventas.Region = Regiones.Region", "Ventas.Canal = Canales.Canal"])
    with pytest.raises(KeyError):
        connectors.add_file_datasource(root, files, joins=["Ventas.Nope = Regiones.Region"])


@pytest.mark.skipif(not xsd.find_rcc(), reason="needs Tableau Desktop's schema")
def test_joined_workbook_passes_tableau_schema(files):
    root = twb.new_workbook()
    connectors.add_file_datasource(root, files, caption="J",
                                   joins=["left: Ventas.Region = Regiones.Region", "Ventas.Canal = Canales.Canal"])
    A.create_worksheet(root, "PorTipo", "J", rows=["Tipo"], cols=["SUM(Importe)"], mark="bar")
    assert xsd.validate(root)["valid"]


def test_dual_axis_colors_each_axis(files):
    root = twb.new_workbook()
    connectors.add_file_datasource(root, files[:1], caption="V")
    A.create_worksheet(root, "Combo", "V", cols=["Canal"], rows=["SUM(Importe)"], mark="bar")
    A.set_dual_axis(root, "Combo", ["SUM(Importe)", "AVG(Importe)"])
    panes = root.findall("worksheets/worksheet[@name='Combo']/table/panes/pane")
    colors = [p.find("style/style-rule[@element='mark']/format[@attr='mark-color']").get("value") for p in panes[1:]]
    assert colors == list(A.DUAL_AXIS_COLORS)
    for p in panes[1:]:  # style stays the last child of the pane, as Desktop requires
        assert [c.tag for c in p][-1] == "style"
    A.set_dual_axis(root, "Combo", ["SUM(Importe)", "AVG(Importe)"], colors=[])
    panes = root.findall("worksheets/worksheet[@name='Combo']/table/panes/pane")
    assert all(p.find("style/style-rule/format[@attr='mark-color']") is None for p in panes[1:])
