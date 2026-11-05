"""Parameter/set actions, navigation buttons, extracts and live-apply drop detection — no Tableau needed.

The shapes asserted here were checked against Tableau Desktop 2026.3 (validator and file loader) on
2026-11-04; these tests keep them from drifting.
"""

from __future__ import annotations

from pathlib import Path

import pytest
from lxml import etree

from tableu_mcp import authoring as A
from tableu_mcp import connectors, ops, registry, twb


@pytest.fixture()
def wb(tmp_path: Path):
    csv = tmp_path / "ventas.csv"
    csv.write_text(
        "Region,Fecha,Importe,Devuelto\nNorte,2025-01-01,10.5,TRUE\nSur,2025-02-01,20,FALSE\n"
        "Norte,2025-03-01,7.25,FALSE\n",
        encoding="utf-8",
    )
    root = twb.new_workbook()
    connectors.add_file_datasource(root, [f"Ventas={csv}"])
    A.create_worksheet(root, "Por region", "Ventas", rows=["Region"], cols=["SUM(Importe)"], mark="bar")
    A.create_worksheet(root, "Por mes", "Ventas", rows=["SUM(Importe)"], cols=["MONTH_TRUNC(Fecha)"], mark="line")
    return root, tmp_path


def _manifest(root) -> set[str]:
    return {e.tag for e in root.find("document-format-change-manifest")}


def test_parameter_action_has_manifest_and_tableau_shape(wb):
    root, _ = wb
    A.create_parameter(root, "Region elegida", datatype="string", value="", domain="any")
    A.create_action(root, "parameter", "Elegir", "Por region", parameter="Region elegida", source_field="Region")
    assert {"ParameterAction", "ParameterActionClearSelection"} <= _manifest(root)
    a = root.find("actions/edit-parameter-action")
    assert [c.tag for c in a] == ["activation", "source", "agg-type", "clear-option", "params"]
    assert a.find("clear-option").get("value") == "r:::1"  # the loader rejects it without a value
    params = {p.get("name"): p.get("value") for p in a.find("params")}
    assert params["target-parameter"] == "[Parameters].[Region elegida]"
    assert params["source-field"].endswith(":Region:nk]")


def test_set_action_has_manifest_and_tableau_shape(wb):
    root, _ = wb
    A.create_set(root, "Ventas", "Region", "Regiones", members=["Norte"])
    A.create_action(root, "set", "Marcar", "Por region", set_name="Regiones", set_mode="add")
    assert {"GroupAction", "GroupActionAddRemove"} <= _manifest(root)
    a = root.find("actions/edit-group-action")
    assert a.find("add-or-remove-marks").get("value") == "add"
    params = {p.get("name"): p.get("value") for p in a.find("params")}
    assert params["target-group"].endswith(".[Regiones]")
    with pytest.raises(ValueError):
        A.create_action(root, "set", "Mal", "Por region", set_name="Regiones", set_mode="toggle")


def test_actions_keep_the_schema_sequence(wb):
    root, _ = wb
    A.create_parameter(root, "P", datatype="string", value="", domain="any")
    A.create_set(root, "Ventas", "Region", "S", members=["Norte"])
    A.create_action(root, "parameter", "pa", "Por region", parameter="P", source_field="Region")
    A.create_action(root, "set", "sa", "Por region", set_name="S")
    A.create_action(root, "filter", "fa", "Por region", target="Por mes")
    # a stray <datasources> block, as Tableau writes after plain actions, must stay between them
    etree.SubElement(root.find("actions"), "datasources")
    A._order_actions(root)
    tags = [c.tag for c in root.find("actions")]
    order = [A.ACTIONS_ORDER.index(t) for t in tags]
    assert order == sorted(order), tags


def test_navigation_button_points_at_the_window_id(wb):
    root, _ = wb
    registry._db_create(root, "Inicio", sheets=["Por region"])
    win = next(w for w in root.findall("windows/window") if w.get("name") == "Por mes")
    sid = win.find("simple-id")
    if sid is None:
        sid = etree.SubElement(win, "simple-id", uuid="{00000000-0000-0000-0000-000000000001}")
    A.add_zone(root, "Inicio", "navigation", target_sheet="Por mes", text="Ver mes", floating=True)
    z = next(z for z in root.iter("zone") if z.get("type-v2") == "dashboard-object")
    b = z.find("button")
    assert sid.get("uuid") in b.get("action") and b.get("action").startswith("tabdoc:goto-sheet")
    assert b.find("button-visual-state/caption").text == "Ver mes"
    assert {"BasicButtonObject", "NavigationAction"} <= _manifest(root)


def test_navigation_button_explains_a_missing_window(wb):
    root, _ = wb
    registry._db_create(root, "Inicio", sheets=["Por region"])
    with pytest.raises(KeyError, match="No window id"):
        A.add_zone(root, "Inicio", "navigation", target_sheet="No existe", floating=True)


def test_extract_writes_hyper_and_tableau_shape(wb):
    pytest.importorskip("tableauhyperapi")
    from tableu_mcp import extracts  # noqa: PLC0415

    root, tmp = wb
    r = extracts.create_extract(root, "Ventas", str(tmp / "v.hyper"))
    assert r["rows"] == 3 and Path(r["hyper"]).stat().st_size > 0
    ds = twb.find_datasource(root, "Ventas")
    ex = ds.find("extract")
    assert ex.get("enabled") == "true" and "object-id" not in ex.attrib  # 2026.3 schema
    assert ex.find("connection").get("class") == "hyper"
    obj_props = [p.get("context") for p in ds.iter("properties")]
    assert "extract" in obj_props  # without it Desktop fails to load the workbook
    with pytest.raises(ValueError, match="already an extract"):
        extracts.create_extract(root, "Ventas", str(tmp / "v2.hyper"))


def test_drop_detection_names_what_live_apply_lost(wb):
    root, _ = wb
    before = twb.serialize(root)
    A.create_parameter(root, "Nuevo", datatype="integer", value=1, domain="any")
    A.create_action(root, "filter", "fa", "Por region", target="Por mes")
    dropped = ops._dropped(twb.serialize(root), before)
    assert dropped["parameters"] == ["[Nuevo]"]
    assert len(dropped["actions"]) == 1
    assert ops._dropped(before, before) == {}


def test_shared_filter_ties_sheets_with_one_group(wb):
    root, _ = wb
    r = A.add_shared_filter(root, ["Por region", "Por mes"], "Region", card_mode="dropdown")
    groups = {f.get("filter-group") for f in root.iter("filter") if f.get("column", "").endswith(":Region:nk]")}
    assert groups == {str(r["group"])}, groups
    per_sheet = [ws.get("name") for ws in root.iter("worksheet") for f in ws.iter("filter") if f.get("filter-group")]
    assert sorted(per_sheet) == ["Por mes", "Por region"]
    r2 = A.add_shared_filter(root, ["Por mes"], "Region")
    assert r2["group"] == r["group"] + 1  # a new group never reuses one in use
