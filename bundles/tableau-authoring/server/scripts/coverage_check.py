"""Exercise every authoring operation on Superstore and check each step with Tableau's validator.

    uv run python scripts/coverage_check.py            # needs Tableau Desktop running (validator only, no apply)
    uv run python scripts/coverage_check.py --save out/kitchen_sink.twb

Each step runs on the result of the previous valid steps; an invalid step is reported and rolled back.
"""

import copy
import json
import sys
from pathlib import Path

from tableu_mcp import authoring as A
from tableu_mcp import twb
from tableu_mcp.client import DesktopClient

SUPERSTORE = r"C:\Program Files\Tableau\Tableau 2026.3\defaults\Datasources\Sample - Superstore.tds"
DS = "Sample - Superstore"
LOGO = Path(r"C:\Program Files\Tableau\Tableau 2026.3\bin").glob("*.png")

def _refused(fn):
    try:
        fn()
    except NotImplementedError:
        return
    raise AssertionError("expected NotImplementedError")


STEPS = [
    # ---- data model
    ("datasource.tds", lambda r: twb.add_datasource_from_tds(r, SUPERSTORE)),
    ("worksheet.base (lets every later step be schema-checked)", lambda r: twb.add_worksheet(r, "Base", DS, rows=["Category"], cols=["SUM(Sales)"], mark="bar", title="Base")),
    ("field.update caption/format/description", lambda r: A.update_field(r, DS, "Sales", caption="Ventas", default_format='c"$"#,##0', description="Monto vendido")),
    ("field.update role->dimension", lambda r: A.update_field(r, DS, "Row ID", role="dimension")),
    ("field.hide", lambda r: A.update_field(r, DS, "Customer ID", hidden=True)),
    ("field.geo_role", lambda r: A.update_field(r, DS, "City", geo_role="city")),
    ("field.aliases", lambda r: A.set_aliases(r, DS, "Region", {"East": "Este", "West": "Oeste"})),
    ("calc.create", lambda r: twb.add_calculated_field(r, DS, "Margin", "SUM([Profit])/SUM([Sales])", default_format="p0.0%")),
    ("calc.lod", lambda r: twb.add_calculated_field(r, DS, "Customer Sales", "{FIXED [Customer Name]: SUM([Sales])}")),
    ("calc.update", lambda r: A.update_calculation(r, DS, "Margin", formula="SUM([Profit]) / SUM([Sales])")),
    ("parameter.range", lambda r: A.create_parameter(r, "Top N", "integer", 10, "range", min=1, max=50, step=1)),
    ("parameter.list", lambda r: A.create_parameter(r, "Metric", "string", "Sales", "list", values=["Sales", "Profit"])),
    ("parameter.update", lambda r: A.update_parameter(r, "Top N", value=15)),
    ("calc.uses parameter", lambda r: twb.add_calculated_field(r, DS, "Selected Metric", 'IF [Parameters].[Metric] = "Sales" THEN SUM([Sales]) ELSE SUM([Profit]) END')),
    ("group.create", lambda r: A.create_group(r, DS, "Region", "Region Group", {"Coasts": ["East", "West"]}, include_other=True)),
    ("set.members", lambda r: A.create_set(r, DS, "Category", "Key Categories", members=["Technology", "Furniture"])),
    ("set.condition", lambda r: A.create_set(r, DS, "Customer Name", "Big Customers", condition="SUM([Sales]) > 5000")),
    ("set.top", lambda r: A.create_set(r, DS, "Product Name", "Top Products", top=10, by="SUM([Sales])")),
    ("bin.create", lambda r: A.create_bin(r, DS, "Profit", size=500, name="Profit bins 500")),
    ("hierarchy.create", lambda r: A.create_hierarchy(r, DS, "Product", ["Category", "Sub-Category", "Product Name"])),
    ("folder.create", lambda r: A.create_folder(r, DS, "KPIs", ["Margin", "Customer Sales"])),
    # Multi-table Superstore: data-source filters are refused on purpose (Desktop's loader rejects them there).
    ("datasource.filter", lambda r: _refused(lambda: A.add_datasource_filter(r, DS, "Segment", values=["Consumer"]))),
    ("datasource.rename", lambda r: A.rename_datasource(r, DS, DS)),
    ("datasource.database(postgres)", lambda r: A.create_database_datasource(r, "postgres", "localhost", "analytics", table="orders", schema="public", username="tableau", caption="PG Orders", columns={"id": "integer", "amount": "real"})),
    ("datasource.database(sqlserver custom sql)", lambda r: A.create_database_datasource(r, "sqlserver", "sql01", "dw", custom_sql="SELECT 1 AS x", caption="MSSQL Query")),
    ("datasource.database(snowflake)", lambda r: A.create_database_datasource(r, "snowflake", "acme.snowflakecomputing.com", "DB", table="SALES", schema="PUBLIC", warehouse="WH", caption="Snowflake Sales")),
    # ---- worksheets
    ("worksheet.create bar+sort+labels", lambda r: A.create_worksheet(r, "Sales by Category", DS, rows=["Category"], cols=["SUM(Sales)"], mark="bar", sort={"field": "Category", "by": "SUM(Sales)"}, show_labels=True, title="Sales by Category")),
    ("worksheet.create line", lambda r: A.create_worksheet(r, "Trend", DS, cols=["MONTH_TRUNC(Order Date)"], rows=["SUM(Sales)"], mark="line", title="Monthly sales")),
    ("worksheet.create scatter shape", lambda r: A.create_worksheet(r, "Scatter", DS, cols=["SUM(Sales)"], rows=["SUM(Profit)"], mark="shape", detail=["Customer Name"], shape="Segment", color="Region", title="Customers: sales vs profit")),
    ("worksheet.create pie angle", lambda r: A.create_worksheet(r, "Mix", DS, mark="pie", angle="SUM(Sales)", color="Segment", title="Sales mix by segment")),
    ("worksheet.create map", lambda r: A.create_worksheet(r, "Map", DS, mark="map", detail=["State/Province"], color="SUM(Profit)", title="Profit by state")),
    ("worksheet.create text table+totals", lambda r: A.create_worksheet(r, "Table", DS, rows=["Region", "Segment"], cols=["YEAR(Order Date)"], mark="text", label="SUM(Sales)", totals={"rows": True, "cols": True}, title="Sales by region and year")),
    ("worksheet.pages", lambda r: A.set_shelf(r, "Trend", "pages", ["YEAR(Order Date)"])),
    ("worksheet.table calc running sum", lambda r: A.create_worksheet(r, "Running", DS, cols=["MONTH_TRUNC(Order Date)"], rows=["RUNNING_SUM(SUM(Sales))"], mark="area", title="Cumulative sales")),
    ("worksheet.table calc pct total", lambda r: A.create_worksheet(r, "Share", DS, rows=["Category"], cols=["PCT_TOTAL(SUM(Sales))"], mark="bar", title="Share of sales")),
    ("worksheet.table calc rank", lambda r: A.create_worksheet(r, "Rank", DS, rows=["Sub-Category"], cols=["RANK(SUM(Sales))"], mark="bar", title="Sales rank")),
    ("worksheet.table calc pct diff", lambda r: A.create_worksheet(r, "Growth", DS, cols=["YEAR(Order Date)"], rows=["PCT_DIFF(SUM(Sales))"], mark="bar", title="YoY growth")),
    ("worksheet.table calc moving avg", lambda r: A.create_worksheet(r, "Moving", DS, cols=["MONTH_TRUNC(Order Date)"], rows=["MOVING_AVG(SUM(Sales))"], mark="line", title="3-month moving average")),
    ("worksheet.histogram (bin)", lambda r: A.create_worksheet(r, "Histogram", DS, cols=["Profit bins 500"], rows=["COUNT(Order ID)"], mark="bar", title="Profit distribution")),
    ("worksheet.set on color", lambda r: A.create_worksheet(r, "Set Colors", DS, rows=["Category"], cols=["SUM(Sales)"], color="IN_OUT(Key Categories)", mark="bar", title="Key categories (in/out)")),
    ("worksheet.set members", lambda r: A.create_worksheet(r, "Set Members", DS, rows=["Big Customers"], cols=["SUM(Sales)"], mark="bar", sort={"field": "Big Customers", "by": "SUM(Sales)"}, title="Customers in the Big Customers set")),
    ("worksheet.top set filter", lambda r: A.create_worksheet(r, "Top Products", DS, rows=["Product Name"], cols=["SUM(Sales)"], mark="bar", filters=[{"field": "Product Name", "top": {"n": 5, "by": "SUM([Sales])"}}], sort={"field": "Product Name", "by": "SUM(Sales)"}, title="Top 5 products")),
    ("worksheet.encoding size", lambda r: A.set_encoding(r, "Scatter", "size", "SUM(Quantity)")),
    ("worksheet.encoding tooltip", lambda r: A.set_encoding(r, "Scatter", "tooltip", "Margin")),
    ("worksheet.set_mark", lambda r: A.set_mark(r, "Mix", "pie")),
    ("worksheet.sort manual", lambda r: A.set_sort(r, "Table", "Region", order=["West", "East", "Central", "South"])),
    ("worksheet.sort alpha", lambda r: A.set_sort(r, "Rank", "Sub-Category", by=None, direction="ASC")),
    ("worksheet.dual axis", lambda r: (A.create_worksheet(r, "Dual", DS, cols=["MONTH_TRUNC(Order Date)"], rows=["SUM(Sales)"], mark="bar", title="Sales and profit"), A.set_dual_axis(r, "Dual", ["SUM(Sales)", "SUM(Profit)"], marks=["bar", "line"]))),
    ("worksheet.shared axis", lambda r: (A.create_worksheet(r, "Shared", DS, cols=["MONTH_TRUNC(Order Date)"], rows=["SUM(Sales)"], mark="line", title="Sales and profit, shared axis"), A.set_shared_axis(r, "Shared", ["SUM(Sales)", "SUM(Profit)"]))),
    ("worksheet.subtotals", lambda r: A.set_totals(r, "Table", subtotals=["Region"])),
    ("worksheet.duplicate", lambda r: A.duplicate_sheet(r, "Trend", "Trend copy")),
    ("worksheet.hide", lambda r: A.set_sheet_visibility(r, "Trend copy", True)),
    # ---- filters
    ("filter.categorical include", lambda r: A.add_filter(r, "Sales by Category", "Region", values=["East", "West"], show_card=True, card_mode="checkdropdown")),
    ("filter.categorical exclude", lambda r: A.add_filter(r, "Scatter", "Segment", values=["Home Office"], exclude=True)),
    ("filter.measure range", lambda r: A.add_filter(r, "Scatter", "SUM(Sales)", min=100, max=100000)),
    ("filter.date range", lambda r: A.add_filter(r, "Trend", "Order Date", min="2023-01-01", max="2026-12-31")),
    ("filter.relative date", lambda r: A.add_filter(r, "Running", "Order Date", relative={"period": "year", "from": -2, "to": 0})),
    ("filter.top N", lambda r: A.add_filter(r, "Rank", "Sub-Category", top={"n": 10, "by": "SUM([Sales])"})),
    ("filter.condition", lambda r: A.add_filter(r, "Share", "Category", condition="SUM([Sales]) > 0")),
    ("filter.wildcard", lambda r: A.add_filter(r, "Table", "Segment", wildcard="Co")),
    ("filter.context", lambda r: A.add_filter(r, "Map", "Category", values=["Technology"], context=True)),
    ("filter.discrete year", lambda r: A.add_filter(r, "Mix", "YEAR(Order Date)", values=["2025", "2026"])),
    ("filter.remove", lambda r: A.remove_filter(r, "Share", "Category")),
    ("card.parameter", lambda r: A.add_card(r, "Sales by Category", "parameter", parameter="Top N")),
    ("card.legend", lambda r: A.add_card(r, "Scatter", "color", field_qname=A.Sheet(r, "Scatter").qname(A.Sheet(r, "Scatter").ref("Region")))),
    # ---- analytics
    ("analytics.reference line avg", lambda r: A.add_reference_line(r, "Sales by Category", "SUM(Sales)", "average", color="#888888")),
    ("analytics.reference line constant", lambda r: A.add_reference_line(r, "Trend", "SUM(Sales)", "constant", value=50000, label="Goal")),
    ("analytics.trend line", lambda r: A.add_trend_line(r, "Scatter", "linear")),
    ("analytics.trend poly", lambda r: A.add_trend_line(r, "Moving", "polynomial", degree=3)),
    ("analytics.forecast", lambda r: A.add_forecast(r, "Trend", periods=6)),
    # ---- formatting
    ("format.marks color/size/opacity", lambda r: A.format_marks(r, "Trend", color="#1f77b4", size=2, opacity=0.9)),
    ("format.color palette members", lambda r: A.set_color_palette(r, "Scatter", "Region", colors={"East": "#4e79a7", "West": "#f28e2b", "Central": "#59a14f", "South": "#e15759"})),
    ("format.color palette named", lambda r: A.set_color_palette(r, "Map", "SUM(Profit)", palette="orange_blue_diverging_10_0")),
    ("format.worksheet fonts/grid", lambda r: A.format_worksheet(r, "Sales by Category", font="Tableau Book", font_size=10, gridlines=False, zero_lines=False, row_dividers=False, field_labels=False)),
    ("format.field number/axis", lambda r: A.format_field(r, "Sales by Category", "SUM(Sales)", number_format='c"$"#,##0,K', axis_title="Sales (USD)")),
    ("format.axis range", lambda r: A.format_field(r, "Trend", "SUM(Sales)", axis_min=0, axis_max=120000)),
    ("format.title", lambda r: A.set_title(r, "Mix", "Sales mix by segment", font_size=14, bold=True)),
    ("format.tooltip", lambda r: A.set_tooltip(r, "Sales by Category", "<Category>\nSales: <SUM(Sales)>")),
    ("format.workbook", lambda r: A.format_workbook(r, font="Tableau Book", font_size=10)),
    # ---- dashboards
    ("dashboard.create", lambda r: twb.add_dashboard(r, "Overview", ["Sales by Category", "Trend", "Scatter"], layout="grid", width=1400, height=900)),
    ("dashboard.zone text", lambda r: A.add_zone(r, "Overview", "text", text="Superstore performance review", font_size=12, bold=True)),
    ("dashboard.zone filter card", lambda r: A.add_zone(r, "Overview", "filter", sheet="Sales by Category", field="Region", mode="checkdropdown")),
    ("dashboard.zone color legend", lambda r: A.add_zone(r, "Overview", "legend-color", sheet="Scatter", field="Region")),
    ("dashboard.zone parameter", lambda r: A.add_zone(r, "Overview", "parameter", parameter="Top N", mode="slider")),
    ("dashboard.zone container", lambda r: A.add_zone(r, "Overview", "container", mode="horizontal")),
    ("dashboard.zone blank", lambda r: A.add_zone(r, "Overview", "blank")),
    ("dashboard.zone web", lambda r: A.add_zone(r, "Overview", "web", url="https://help.tableau.com", floating=True, x=900, y=600, w=400, h=250)),
    ("dashboard.zone image", lambda r: A.add_zone(r, "Overview", "image", image=str(next(LOGO, "logo.png")), floating=True, x=1250, y=10, w=120, h=60)),
    ("dashboard.zone floating text", lambda r: A.add_zone(r, "Overview", "text", text="Draft", floating=True, x=10, y=10, w=100, h=30)),
    ("dashboard.zone highlighter", lambda r: A.add_zone(r, "Overview", "highlighter", sheet="Scatter", field="Segment")),
    ("dashboard.zone sheet", lambda r: A.add_zone(r, "Overview", "sheet", sheet="Mix")),
    ("dashboard.zone remove", lambda r: A.remove_zone(r, "Overview", [z["id"] for z in A.list_zones(r, "Overview") if z["type"] == "empty"][0])),
    ("dashboard.format zone", lambda r: A.format_zone(r, "Overview", [z["id"] for z in A.list_zones(r, "Overview") if z["name"] == "Trend"][0], background="#f7f7f7", border="#d0d0d0")),
    ("dashboard.format", lambda r: A.format_dashboard(r, "Overview", background="#ffffff", title_font_size=18)),
    ("dashboard.size range", lambda r: twb.set_dashboard_size(r, "Overview", 1400, 900, "range")),
    ("dashboard.size fixed", lambda r: twb.set_dashboard_size(r, "Overview", 1400, 900, "fixed")),
    ("dashboard.device phone", lambda r: A.add_device_layout(r, "Overview", "phone")),
    ("dashboard.second", lambda r: twb.add_dashboard(r, "Detail", ["Table", "Map"], layout="vertical")),
    # ---- actions
    ("action.filter all fields", lambda r: A.create_action(r, "filter", "Filter from categories", "Sales by Category", target="Overview", source_dashboard="Overview")),
    ("action.filter specific field", lambda r: A.create_action(r, "filter", "Region drill", "Scatter", target="Detail", fields=["Region"])),
    ("action.highlight", lambda r: A.create_action(r, "highlight", "Highlight segment", "Scatter", target="Overview", fields=["Segment"], activation="on-hover")),
    ("action.url", lambda r: A.create_action(r, "url", "Search product", "Sales by Category", url="https://www.google.com/search?q=<Category>", activation="on-menu")),
    ("action.goto", lambda r: A.create_action(r, "goto", "Go to detail", "Map", target="Detail", activation="on-menu")),
    ("action.delete", lambda r: A.delete_action(r, "Go to detail")),
    # ---- stories & workbook
    ("story.create", lambda r: A.create_story(r, "Story", [{"sheet": "Overview", "caption": "Where we sell"}, {"sheet": "Trend", "caption": "How sales evolve"}], title="Superstore story")),
    ("story.add point", lambda r: A.add_story_point(r, "Story", "Detail", "Regional detail")),
    ("workbook.start sheet", lambda r: A.set_start_sheet(r, "Overview")),
    ("sheet.rename", lambda r: twb.rename_sheet(r, "Trend copy", "Trend (hidden copy)")),
    ("field.delete calc", lambda r: (twb.add_calculated_field(r, DS, "Tmp", "1"), A.delete_field(r, DS, "Tmp"))),
]


def main():
    client = DesktopClient.connect()
    root = twb.new_workbook()
    results = []
    for label, fn in STEPS:
        snapshot = copy.deepcopy(root)
        try:
            fn(root)
        except Exception as e:  # noqa: BLE001
            root = snapshot
            results.append((label, "ERROR", f"{type(e).__name__}: {e}"))
            continue
        if not root.findall("./worksheets/worksheet"):
            results.append((label, "ok*", "no sheets yet (schema checked later)"))
            continue
        v = client.validate_document(twb.serialize(root))
        if v["ok"]:
            results.append((label, "ok", ""))
        else:
            issues = v.get("validationIssues") or v
            results.append((label, "INVALID", json.dumps(issues, ensure_ascii=False)[:400]))
            root = snapshot
    width = max(len(r[0]) for r in results)
    for label, status, msg in results:
        print(f"{label:<{width}}  {status:<8} {msg}")
    bad = [r for r in results if r[1] in ("ERROR", "INVALID")]
    print(f"\n{len(results) - len(bad)}/{len(results)} steps valid")
    if "--save" in sys.argv:
        out = sys.argv[sys.argv.index("--save") + 1]
        twb.write_workbook_file(out, twb.serialize(root))
        print("saved", out)
    return 1 if bad else 0


if __name__ == "__main__":
    sys.exit(main())
