"""Offline checks over the full coverage build (scripts/coverage_check.py STEPS).

Desktop's validator is the real authority (scripts/verify_all.py); these tests catch the structural mistakes
it reported before, without opening Tableau.
"""

import collections
import sys
from pathlib import Path

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "scripts"))
import coverage_check as cc  # noqa: E402

from tableu_mcp import authoring as A  # noqa: E402
from tableu_mcp import registry, twb  # noqa: E402

needs_tds = pytest.mark.skipif(not Path(cc.SUPERSTORE).exists(), reason="Tableau sample datasource not installed")
ZONE_CHILD_ORDER = ("formatted-text", "layout-cache", "zone", "flipboard", "zone-style")


@pytest.fixture(scope="module")
def built():
    root = twb.new_workbook()
    errors = []
    for label, fn in cc.STEPS:
        try:
            fn(root)
        except Exception as e:  # noqa: BLE001
            errors.append((label, repr(e)))
    return root, errors


@needs_tds
def test_every_step_builds(built):
    _, errors = built
    assert errors == []


@needs_tds
def test_zone_children_follow_schema_order(built):
    root, _ = built
    for z in root.iter("zone"):
        tags = [c.tag for c in z]
        idx = [ZONE_CHILD_ORDER.index(t) for t in tags if t in ZONE_CHILD_ORDER]
        assert idx == sorted(idx), (z.get("id"), tags)


@needs_tds
def test_zone_ids_unique_per_dashboard(built):
    root, _ = built
    for d in root.iter("dashboard"):
        main_ids = [z.get("id") for z in d.find("zones").iter("zone")]
        dup = [i for i, c in collections.Counter(main_ids).items() if c > 1]
        assert not dup, (d.get("name"), dup)


@needs_tds
def test_tiled_layout_fills_dashboard_without_overlap(built):
    root, _ = built
    zones = A.list_zones(root, "Overview")
    sheets = [z for z in zones if z["type"] == "sheet"]
    assert all(int(z["h"]) >= 20000 for z in sheets), sheets  # charts keep real height
    panel = [z for z in zones if z["type"] in ("filter", "color", "paramctrl", "highlighter")]
    assert panel and all(int(z["x"]) > 80000 for z in panel)  # interactive objects in the right panel


@needs_tds
def test_view_children_order(built):
    root, _ = built
    for v in root.iter("view"):
        if v.getparent().tag != "table":
            continue
        idx = [A.VIEW_ORDER.index(c.tag) for c in v if c.tag in A.VIEW_ORDER]
        assert idx == sorted(idx), [c.tag for c in v]


@needs_tds
def test_table_calc_direction_follows_dimension(built):
    root, _ = built
    share = A.Sheet(root, "Share")  # Category on rows -> compute down
    assert {tc.get("ordering-type") for tc in share.deps.iter("table-calc")} == {"Columns"}
    running = A.Sheet(root, "Running")  # dates on columns -> compute across
    assert {tc.get("ordering-type") for tc in running.deps.iter("table-calc")} == {"Rows"}


def test_registry_is_consistent():
    d = registry.describe()
    assert len(d) == 20 and sum(len(v["operations"]) for v in d.values()) > 100
    for obj, ops in registry.REGISTRY.items():
        for name, op in ops.items():
            assert op.kind in ("edit", "read", "plain", "target"), (obj, name)


def test_transaction_on_file(tmp_path):
    from tableu_mcp import ops

    f = str(tmp_path / "t.twb")
    ops.new_file(f)
    ops.tx_begin(f)
    registry.run("parameter", "Create", {"name": "N", "datatype": "integer", "value": 3, "domain": "range",
                                         "min": 1, "max": 9}, target=f)
    assert "Parameters" not in twb.read_workbook_file(f)  # not applied yet
    assert ops.tx_status(f)["active"]
    ops.tx_commit(f)
    assert "[Parameters]" in twb.read_workbook_file(f) or "name='Parameters'" in twb.read_workbook_file(f) \
        or 'name="Parameters"' in twb.read_workbook_file(f)
    assert not ops.tx_status(f)["active"]


@needs_tds
def test_format_check_builds_with_expected_styles(tmp_path):
    import runpy

    out = tmp_path / "fmt.twb"
    sys.argv = ["format_check.py", str(out)]
    runpy.run_path(str(Path(__file__).resolve().parents[1] / "scripts" / "format_check.py"), run_name="__main__")
    root = twb.parse(twb.read_workbook_file(out))
    fmts = {(r.get("element"), f.get("attr")) for r in root.iter("style-rule") for f in r}
    for need in [("table", "background-color"), ("pane", "background-color"), ("header", "background-color"),
                 ("title", "background-color"), ("pane", "band-color"), ("cell", "border-style"),
                 ("gridline", "stroke-color"), ("datalabel", "color"), ("refline", "fill-above"),
                 ("legend", "background-color"), ("quick-filter", "background-color"),
                 ("dash-container", "background-color"), ("story-point-caption", "background-color"),
                 ("all", "font-family")]:
        assert need in fmts, need
