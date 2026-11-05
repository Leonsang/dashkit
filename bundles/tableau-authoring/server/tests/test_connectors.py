import csv

from openpyxl import Workbook

from tableu_mcp import connectors, twb


def _files(tmp_path):
    with (tmp_path / "f.csv").open("w", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        w.writerow(["ID", "Fecha", "StoreID", "ProdID", "Monto"])
        w.writerow([1, "2025-01-02", 1, 10, 3.5])
    with (tmp_path / "s.csv").open("w", newline="", encoding="utf-8") as f:
        w = csv.writer(f, delimiter=";")
        w.writerows([["StoreID", "Name"], [1, "A"]])
    wb = Workbook()
    wb.active.title = "Prod"
    wb.active.append(["ProdID", "Cat"])
    wb.active.append([10, "X"])
    wb.save(tmp_path / "c.xlsx")


def test_types_order_and_collisions(tmp_path):
    _files(tmp_path)
    root = twb.new_workbook()
    info = connectors.add_file_datasource(
        root, [f"Fact={tmp_path / 'f.csv'}", f"Stores={tmp_path / 's.csv'}", f"{tmp_path / 'c.xlsx'}#Prod"],
        ["Fact.StoreID = Stores.StoreID", "Fact.ProdID = Prod.ProdID"], "D")
    assert info["fields"]["Fecha"] == "date" and info["fields"]["Monto"] == "real"
    assert "StoreID (Stores)" in info["fields"] and "ProdID (Prod)" in info["fields"]
    ds = twb.find_datasource(root, "D")
    objs = [o.get("caption") for o in ds.iter("object")]
    assert objs == ["Fact", "Prod", "Stores"]  # root first, then alphabetical (Tableau re-pairs in this order)
    for mr in ds.iter("metadata-record"):
        if mr.get("class") == "column":
            oid = mr.findtext("_.fcp.ObjectModelEncapsulateLegacy.true...object-id")
            assert oid.strip("[]").startswith(mr.findtext("parent-name").strip("[]") + "_")
    assert twb.make_ref(ds, "SUM(Monto)").instance_name == "[sum:Monto:qk]"
