"""Invented data for "Café Montaña", a fictional coffee-shop chain. Deterministic (seed 7).

data/demo/ventas.csv     fact table, comma separated  (VentaID, Fecha, TiendaID, ProductoID, Cantidad, ...)
data/demo/tiendas.csv    dimension, semicolon separated (to exercise separator detection)
data/demo/catalogo.xlsx  dimension, Excel sheet "Productos"
"""

import csv
import datetime as dt
import random
from pathlib import Path

from openpyxl import Workbook

OUT = Path(__file__).resolve().parents[1] / "data" / "demo"
rng = random.Random(7)

TIENDAS = [  # id, nombre, ciudad, region, peso de tráfico
    (1, "Montaña Centro", "Bogotá", "Andina", 1.6), (2, "Montaña Chapinero", "Bogotá", "Andina", 1.3),
    (3, "Montaña El Poblado", "Medellín", "Andina", 1.4), (4, "Montaña Laureles", "Medellín", "Andina", 0.9),
    (5, "Montaña Granada", "Cali", "Pacífica", 1.0), (6, "Montaña Bocagrande", "Cartagena", "Caribe", 1.1),
    (7, "Montaña El Prado", "Barranquilla", "Caribe", 0.8), (8, "Montaña Cabecera", "Bucaramanga", "Andina", 0.7),
]
PRODUCTOS = [  # id, nombre, categoria, precio, costo unitario, popularidad
    (101, "Espresso", "Café caliente", 4500, 1100, 1.4), (102, "Capuchino", "Café caliente", 7500, 2100, 1.6),
    (103, "Latte", "Café caliente", 8000, 2300, 1.5), (104, "Tinto campesino", "Café caliente", 3000, 600, 1.2),
    (201, "Frappé de café", "Bebidas frías", 11000, 3600, 1.0), (202, "Cold brew", "Bebidas frías", 9500, 2600, 0.8),
    (203, "Limonada de coco", "Bebidas frías", 9000, 3100, 0.7),
    (301, "Pandebono", "Panadería", 3500, 1200, 1.3), (302, "Croissant", "Panadería", 6000, 2400, 0.9),
    (303, "Torta de zanahoria", "Panadería", 8500, 3300, 0.6),
    (401, "Café en grano 500 g", "Café para llevar", 38000, 19000, 0.35), (402, "Café molido 250 g", "Café para llevar", 21000, 10500, 0.4),
]


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    with (OUT / "tiendas.csv").open("w", newline="", encoding="utf-8") as f:
        w = csv.writer(f, delimiter=";")
        w.writerow(["TiendaID", "Tienda", "Ciudad", "Region"])
        w.writerows(t[:4] for t in TIENDAS)

    wb = Workbook()
    ws = wb.active
    ws.title = "Productos"
    ws.append(["ProductoID", "Producto", "Categoria", "PrecioLista"])
    for p in PRODUCTOS:
        ws.append([p[0], p[1], p[2], p[3]])
    wb.save(OUT / "catalogo.xlsx")

    rows, vid = [], 1
    day = dt.date(2025, 1, 1)
    while day <= dt.date(2026, 10, 31):
        season = 1.25 if day.month in (11, 12) else (0.85 if day.month in (1, 2) else 1.0)
        growth = 1 + (day - dt.date(2025, 1, 1)).days / 1500
        weekend = 1.3 if day.weekday() >= 5 else 1.0
        for t in TIENDAS:
            n = int(rng.gauss(9, 2) * t[4] * season * growth * weekend)
            for _ in range(max(n, 1)):
                p = rng.choices(PRODUCTOS, weights=[x[5] for x in PRODUCTOS])[0]
                qty = rng.choices([1, 2, 3, 4], weights=[60, 25, 10, 5])[0]
                desc = rng.choices([0, 0.1, 0.2], weights=[80, 15, 5])[0]
                rows.append([vid, day.isoformat(), t[0], p[0], qty, p[3], desc, p[4] * qty])
                vid += 1
        day += dt.timedelta(days=1)
    with (OUT / "ventas.csv").open("w", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        w.writerow(["VentaID", "Fecha", "TiendaID", "ProductoID", "Cantidad", "PrecioUnitario", "Descuento", "CostoTotal"])
        w.writerows(rows)
    print(f"{len(rows)} ventas, {len(TIENDAS)} tiendas, {len(PRODUCTOS)} productos -> {OUT}")


if __name__ == "__main__":
    main()
