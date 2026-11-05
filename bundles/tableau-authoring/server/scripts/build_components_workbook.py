"""Build one workbook with every component of the reference (tableu_mcp.components), to validate them in Desktop.

    uv run python scripts/build_components_workbook.py <out.twb>

Then, with Tableau Desktop open: `tableu op workbook Preflight -t <out.twb>` (Desktop's validator) and
`tableu launch <out.twb>` + `desktop ErrorDialogs` (Desktop's loader). A workbook that passes both goes into
the catalog as "validated":  uv run python scripts/catalog_samples.py "<Tableau dir>" <out.twb>
"""

from __future__ import annotations

import sys
from pathlib import Path

from tableu_mcp import authoring as A
from tableu_mcp import components, connectors, registry, twb


def build(out: Path, base_only: bool = False) -> list[str]:
    csv = out.with_suffix(".csv")
    csv.write_text("Region,Canal,Fecha,Importe,Coste,Nota\nNorte,Online,2025-01-01,10.5,4,4\n"
                   "Sur,Tienda,2025-02-01,20,9,5\nNorte,Tienda,2025-03-01,7.25,3,3\n", encoding="utf-8")
    root = twb.new_workbook()
    connectors.add_file_datasource(root, [f"Ventas={csv}"])
    A.create_worksheet(root, "Barras", "Ventas", rows=["Region"], cols=["SUM(Importe)"], mark="bar")
    A.create_worksheet(root, "Linea", "Ventas", cols=["MONTH_TRUNC(Fecha)"], rows=["SUM(Importe)"], mark="line")
    registry._db_create(root, "Tablero", rows=[["Barras", "Linea"]])
    built = []
    for c in [] if base_only else components.COMPONENTS:
        for obj, op, params in c["example"] or []:
            registry.REGISTRY[obj][op].fn(root, **params)
        if c["example"]:
            built.append(c["id"])
    out.write_text(twb.serialize(root), encoding="utf-8")
    return built


if __name__ == "__main__":
    target = Path(sys.argv[1]).resolve()
    ids = build(target, base_only="--base" in sys.argv)
    print(f"{target}: {len(ids)} components")
