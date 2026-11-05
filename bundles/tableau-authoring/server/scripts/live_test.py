import json, sys
from tableu_mcp.client import DesktopClient
from tableu_mcp import twb
c = DesktopClient.connect()
root = twb.parse(c.get_document())
ds = twb.add_datasource_from_tds(root, r"C:\Program Files\Tableau\Tableau 2026.3\defaults\Datasources\Sample - Superstore.tds")
twb.add_calculated_field(root, "Sample - Superstore", "Profit per Order", "SUM([Profit])/COUNTD([Order ID])", "real")
twb.add_worksheet(root, "Sales by Category", "Sample - Superstore", rows=["Category"], cols=["SUM(Sales)"], mark="bar", color="Profit Ratio", sort_desc_by="SUM(Sales)", title="Sales by Category, colored by Profit Ratio")
twb.add_worksheet(root, "Sales Trend", "Sample - Superstore", cols=["MONTH_TRUNC(Order Date)"], rows=["SUM(Sales)"], mark="line", title="Monthly Sales Trend")
twb.add_dashboard(root, "Sales Overview", ["Sales by Category", "Sales Trend"], layout="vertical", width=1200, height=800)
xml = twb.serialize(root)
v = c.validate_document(xml); print("VALIDATE", json.dumps(v)[:1500])
if v["ok"] and "--apply" in sys.argv:
    print("APPLY", json.dumps(c.apply_document(xml))[:800])
    print(json.dumps(c.workbook())[:800])
