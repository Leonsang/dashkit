# Tablas de texto y tiras de KPIs

## Tira de KPIs en una sola hoja

Tableau hace así sus tiras de KPIs (Superstore "Total Sales"): Measure Names en Columnas y Measure Values
en Texto, en **una** hoja. Es más ligero que una hoja por KPI y alinea los números solo.

```json
{"name": "KPIs", "datasource": "Ventas",
 "measures": ["SUM(Importe)", "SUM(Margen)", "Margen %", "COUNTD(Cliente)"],
 "measure_labels": {"SUM(Importe)": "Ventas", "COUNTD(Cliente)": "Clientes"},
 "label_font": {"size": 10, "color": "#666666"}, "value_font": {"size": 22, "bold": true}}
```

Se pasa a `worksheet Create` (o `worksheet AddMeasureValues` en una hoja existente). tableu escribe:

- un filtro manual de Measure Names con exactamente esas medidas, en ese orden;
- los alias de las cabeceras a nivel de fuente (`[:Measure Names]`);
- el formato de cabecera y de celda.

En el dashboard, la tira mide unos **117 px de alto** (lo medido en Superstore Overview);
`dashboard CreateFromLayout layout=overview kpis=["KPIs"]` lo hace solo. `workbook Lint` avisa
(`DASH-SMALL-VIEW`) si baja de 50 px.

**Formato de número:** `field Update default_format=` en la fuente de datos (sirve en todas las hojas)
o `format Field number_format=` en una sola hoja. Los códigos llevan el prefijo que usa Tableau en sus
propios libros (Superstore, World Indicators):

| Código | Qué es |
|---|---|
| `n#,##0` / `n#,##0;-#,##0` | número con separador de miles |
| `p0%` / `p0.0%` | porcentaje (el valor 0.25 se muestra 25%) |
| `c"$"#,##0;("$"#,##0)` | moneda, negativos entre paréntesis |
| `c#,##0,,.0M` | millones con una cifra decimal y sufijo M (cada `,` divide por mil) |
| `C2058%` | moneda del locale con ese LCID (2058 = es_MX; 1033 = en_US) |
| `*00000` | personalizado (Number Format > Custom; lo escribe el diálogo medido) |

En el XML, las comillas dobles del código se escriben `&quot;`.

## Tabla de texto

```json
{"name": "Detalle", "datasource": "Ventas", "rows": ["Region", "Canal"], "cols": ["YEAR(Fecha)"],
 "label": "SUM(Importe)", "mark": "text", "totals": {"rows": true, "cols": true}}
```

- **Totales y subtotales:** `worksheet SetTotals rows= cols= subtotals=[Dim]`; con
  `ViewOptions row_totals_left / col_totals_top` se cambian de lado.
- **Bandas (cebra):** `format Banding rows=true color="#f5f5f5"`.
- **Bordes y divisores:** `format Borders area=cell|pane|header`, `format Lines kind=table-div`.
- **Varias medidas en columnas:** `measures=[...] measures_on="cols"`, como la tira de KPIs pero con
  dimensiones en Filas.
- **Tabla de calor:** `mark=square` y `color=SUM(m)`. Con `format ColorPalette gradient=[...]` la paleta
  pasa a ser continua.

## Medido en Desktop

En `tableu://ui-commands`:

- **Analysis > Table Layout > Advanced... (Table Options):** el modo manual escribe
  `panes/pane@decimalplaces`. tableu no lo expone; usa `format Field number_format=`.
- **Clic derecho en una cabecera > Show Header:** `style-rule element=label` / `format attr=display
  value=false` (en tableu, `format Field show_header=false`).
- **Clic derecho en una cabecera > Rotate Label:** `format attr=text-orientation value=-90`
  (`format Style element=label attr=text-orientation value=-90 field=Region`).
- **Clic derecho > Hide en un miembro:** `groupfilter function=except`, que es un filtro de exclusión
  (`filter Add values=[...] exclude=true`).

## Tablas largas

Una tabla de muchas filas no cabe en un dashboard de tamaño fijo. Usa el layout `filterbar`, que deja la
tabla a todo el ancho con filtros arriba. `workbook Lint` marca `DASH-NARROW-TABLE` si queda estrecha.
