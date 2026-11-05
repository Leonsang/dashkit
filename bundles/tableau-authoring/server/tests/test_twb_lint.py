from pathlib import Path

import pytest

from tableu_mcp import twb
from tableu_mcp.lint import lint

SUPERSTORE = Path(r"C:\Program Files\Tableau\Tableau 2026.3\defaults\Datasources\Sample - Superstore.tds")
needs_tds = pytest.mark.skipif(not SUPERSTORE.exists(), reason="Tableau sample datasource not installed")


@pytest.fixture
def wb():
    root = twb.new_workbook()
    twb.add_datasource_from_tds(root, SUPERSTORE)
    return root


@needs_tds
def test_datasource_embedding_merges_manifest_and_absolutizes_paths(wb):
    ds = twb.find_datasource(wb, "Sample - Superstore")
    assert ds.find("document-format-change-manifest") is None
    assert len(wb.find("document-format-change-manifest")) > 4
    fn = ds.xpath(".//connection[@class='excel-direct']/@filename")[0]
    assert Path(fn).is_absolute()


@needs_tds
def test_field_specs(wb):
    ds = twb.find_datasource(wb, "Sample - Superstore")
    assert twb.make_ref(ds, "Category").instance_name == "[none:Category:nk]"
    assert twb.make_ref(ds, "SUM(Sales)").instance_name == "[sum:Sales:qk]"
    assert twb.make_ref(ds, "Sales").instance_name == "[sum:Sales:qk]"
    assert twb.make_ref(ds, "YEAR(Order Date)").instance_name == "[yr:Order Date:ok]"
    assert twb.make_ref(ds, "MONTH_TRUNC(Order Date)").instance_name == "[tmn:Order Date:qk]"
    with pytest.raises(KeyError):
        twb.make_ref(ds, "Nope")


@needs_tds
def test_build_sheet_dashboard_and_lint(wb):
    twb.add_calculated_field(wb, "Sample - Superstore", "Orders", "COUNTD([Order ID])", "integer")
    twb.add_worksheet(wb, "Sales by Category", "Sample - Superstore", rows=["Category"], cols=["SUM(Sales)"],
                      mark="bar", sort_desc_by="SUM(Sales)", title="Sales by Category")
    twb.add_worksheet(wb, "Sheet 2", "Sample - Superstore", cols=["MONTH_TRUNC(Order Date)"], rows=["Orders"], mark="line")
    twb.add_dashboard(wb, "Overview", ["Sales by Category", "Sheet 2"])
    ws = wb.xpath("./worksheets/worksheet[@name='Sheet 2']")[0]
    assert "[usr:" in ws.findtext("./table/rows")  # aggregated calc -> derivation User
    rules = {f.rule for f in lint(wb).findings}
    assert {"NAME-DEFAULT", "PERF-COUNTD", "WBO-LIVE"} <= rules
    assert "WBO-DASH-SIZE" not in rules  # builder uses fixed size
    twb.set_dashboard_size(wb, "Overview", None, None, mode="automatic")
    assert "WBO-DASH-SIZE" in {f.rule for f in lint(wb).findings}


@needs_tds
def test_rename_and_remove_keep_document_consistent(wb):
    twb.add_worksheet(wb, "A", "Sample - Superstore", rows=["Region"], cols=["SUM(Profit)"])
    twb.add_dashboard(wb, "D", ["A"])
    twb.rename_sheet(wb, "A", "Profit by Region")
    assert wb.xpath(".//zone[@name='Profit by Region']")
    twb.remove_sheet(wb, "D")
    twb.remove_sheet(wb, "Profit by Region")
    assert wb.find("worksheets") is None and wb.find("windows") is None


def test_twbx_roundtrip(tmp_path):
    xml = twb.serialize(twb.new_workbook())
    p = twb.write_workbook_file(tmp_path / "x.twbx", xml)
    assert twb.read_workbook_file(p) == xml


def test_lint_flags_custom_sql_blending_and_relevant_values():
    xml = """<workbook><datasources>
      <datasource name='federated.a' caption='A'><connection class='federated'><relation type='text' name='q'>select 1</relation></connection></datasource>
      <datasource name='federated.b' caption='B'><connection class='federated'/></datasource></datasources>
      <worksheets><worksheet name='Blend'><table><view><datasources><datasource name='federated.a'/><datasource name='federated.b'/></datasources></view></table></worksheet></worksheets>
      <windows><window class='worksheet' name='Blend'><cards><edge name='right'><strip><card type='filter' values='relevant'/></strip></edge></cards></window></windows>
    </workbook>"""
    rules = {f.rule for f in lint(xml).findings}
    assert {"PERF-CUSTOMSQL", "WBO-BLENDING", "WBO-RELEVANT-VALUES"} <= rules
