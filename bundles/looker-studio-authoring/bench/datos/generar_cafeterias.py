"""Dataset ficticio del benchmark: "Café Brisa", una red de cafeterías inventada.

Una sola tabla (un CSV): cada fila es una línea de ticket. Datos inventados, sin personas reales.
Uso: python -I generar_cafeterias.py <salida.csv> [tickets]
"""
import csv
import datetime as dt
import random
import sys

random.seed(2026)
OUT = sys.argv[1]
N = int(sys.argv[2]) if len(sys.argv) > 2 else 4000

LOCALES = [  # local, ciudad, país, región, apertura
    ("Brisa Centro", "Madrid", "España", "Centro", "2023-03-01"),
    ("Brisa Retiro", "Madrid", "España", "Centro", "2024-09-15"),
    ("Brisa Gràcia", "Barcelona", "España", "Este", "2023-06-01"),
    ("Brisa Puerto", "Valencia", "España", "Este", "2025-02-01"),
    ("Brisa Alameda", "Sevilla", "España", "Sur", "2024-04-01"),
    ("Brisa Baixa", "Lisboa", "Portugal", "Oeste", "2025-05-10"),
]
LW = [9, 5, 7, 4, 4, 3]
PRODUCTOS = {  # categoría: [(producto, precio, coste)]
    "Café": [("Espresso", 1.6, 0.35), ("Cortado", 1.8, 0.4), ("Capuchino", 2.6, 0.6), ("Latte avena", 3.1, 0.8), ("Cold brew", 3.4, 0.7)],
    "Té e infusiones": [("Té verde", 2.2, 0.4), ("Chai latte", 3.2, 0.8), ("Rooibos", 2.2, 0.4)],
    "Bollería": [("Croissant", 1.9, 0.6), ("Napolitana", 2.1, 0.7), ("Magdalena", 1.5, 0.4)],
    "Comida": [("Tostada tomate", 3.5, 1.1), ("Bagel salmón", 6.9, 2.8), ("Bowl açaí", 7.5, 3.0), ("Sándwich vegetal", 5.9, 2.2)],
    "Para llevar": [("Café en grano 250g", 9.5, 4.2), ("Taza Brisa", 12.0, 5.0)],
}
CW = {"Café": 10, "Té e infusiones": 3, "Bollería": 5, "Comida": 4, "Para llevar": 1}
CANALES = [("Mostrador", 7), ("App", 3), ("Delivery", 2)]
TURNOS = [("Mañana", 6, 11, 6), ("Mediodía", 12, 16, 3), ("Tarde", 17, 21, 3)]
START, END = dt.date(2025, 1, 1), dt.date(2026, 10, 31)
DAYS = (END - START).days

def pick(pairs):
    return random.choices([p[0] for p in pairs], [p[1] for p in pairs])[0]

rows = []
for t in range(N):
    d = START + dt.timedelta(days=int(random.random() ** 0.85 * DAYS))  # algo de crecimiento
    loc = random.choices(LOCALES, LW)[0]
    if d < dt.date.fromisoformat(loc[4]):
        loc = LOCALES[0]
    turno = random.choices(TURNOS, [x[3] for x in TURNOS])[0]
    hora = random.randint(turno[1], turno[2])
    canal = pick(CANALES)
    fidel = random.random() < (0.55 if canal == "App" else 0.25)
    espera = max(1, round(random.gauss(4 if turno[0] != "Mañana" else 6, 2) + (3 if canal == "Delivery" else 0)))
    val = min(5, max(1, round(random.gauss(4.6 - 0.12 * max(0, espera - 5), 0.6)))) if random.random() < 0.35 else ""
    for _ in range(random.choices([1, 2, 3], [5, 3, 1])[0]):
        cat = random.choices(list(CW), list(CW.values()))[0]
        prod, precio, coste = random.choice(PRODUCTOS[cat])
        uds = random.choices([1, 2, 3], [8, 2, 1])[0]
        verano = d.month in (6, 7, 8)
        if prod == "Cold brew" and verano:
            uds += 1
        desc = 0.1 if fidel and random.random() < 0.3 else 0.0
        ingresos = round(uds * precio * (1 - desc), 2)
        rows.append({
            "ticket_id": f"T{t + 1:06d}", "fecha": d.isoformat(), "hora": hora, "turno": turno[0],
            "local": loc[0], "ciudad": loc[1], "pais": loc[2], "region": loc[3],
            "canal": canal, "cliente_fidelizado": "Sí" if fidel else "No",
            "categoria": cat, "producto": prod, "unidades": uds, "precio_unitario": precio,
            "descuento_pct": desc, "ingresos": ingresos, "coste": round(uds * coste, 2),
            "tiempo_espera_min": espera, "valoracion": val,
        })

with open(OUT, "w", newline="", encoding="utf-8") as f:
    w = csv.DictWriter(f, fieldnames=list(rows[0]))
    w.writeheader()
    w.writerows(rows)
print(f"{len(rows)} filas en {OUT}")
