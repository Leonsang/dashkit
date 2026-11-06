# Vistas: hojas, marcas y codificaciones

Una hoja (worksheet) responde una sola pregunta. Créala entera en **una** llamada a
`worksheet Create`, con estantes, marca, codificaciones, orden, filtros y totales. Así se valida y se
aplica una vez y no quedan estados intermedios.

## La llamada

```json
{"name": "Ventas por región", "datasource": "Ventas",
 "rows": ["Region"], "cols": ["SUM(Importe)"], "mark": "bar",
 "color": "Canal", "label": "SUM(Importe)", "tooltip": ["SUM(Margen)"],
 "sort": {"field": "Region", "by": "SUM(Importe)", "direction": "DESC"},
 "filters": [{"field": "YEAR(Fecha)", "values": [2025]}], "title": "Ventas por región, 2025"}
```

- **Estantes:** `rows`, `cols` y `pages` reciben especificaciones de campo (ver SKILL.md): `Region`,
  `SUM(Importe)`, `MONTH_TRUNC(Fecha)`, el caption de un calculado, `IN_OUT(Conjunto)`, `RUNNING_SUM(...)`.
- **Marca:** `mark` puede ser `automatic | bar | line | area | circle | square | shape | text | pie | map |
  polygon | gantt`. Si el estante tiene dos medidas, `SetMark(pane=1)` cambia la marca del segundo panel.
- **Codificaciones (tarjeta Marcas):** `color`, `size`, `label` (Texto), `detail[]`, `tooltip[]`,
  `shape`, `path` y `angle` (porciones de pastel). Para cambiarlas después: `worksheet SetEncoding`; con
  `field=None` se vacía.
- **Color fijo de marca y etiquetas:** `mark_color="#4e79a7"` y `show_labels=true`. Después:
  `format Marks color= size= opacity= show_labels=`.

## Recetas por pregunta

| Pregunta | Receta | Notas |
|---|---|---|
| Comparar categorías | `rows=[Dim] cols=[SUM(m)] mark=bar sort=desc by SUM(m)` | Barras horizontales ordenadas. Etiqueta al final de la barra |
| Evolución | `cols=[MONTH_TRUNC(Fecha)] rows=[SUM(m)] mark=line` | Fecha **continua** (`MONTH_TRUNC`, `WEEK_TRUNC`...). `MONTH(Fecha)` es discreta: crea cabeceras, no un eje |
| Parte del todo | `rows=[Dim] cols=[SUM(m)] color=Subdim mark=bar` | Apiladas. Pastel solo con 2 o 3 partes: `mark=pie angle=SUM(m) color=Dim` |
| Correlación | `cols=[SUM(x)] rows=[SUM(y)] detail=[Dim] mark=circle` | Sin `detail` sale un solo punto. Añade `analytics AddTrendLine` |
| Distribución | `bin Create field=Importe size=50` → `cols=[Importe (bin)] rows=[COUNT(...)]` | Histograma |
| Dos medidas, escalas distintas | `worksheet SetDualAxis measures=[a, b] marks=[bar, line]` | Cada eje con su color. `synchronize=true` si comparten unidad |
| Varias medidas, misma escala | `worksheet SetSharedAxis measures=[a, b]` o la fórmula `'SUM(a) + SUM(b)'` en un estante | Measure Names en Color |
| Ranking | `RANK(SUM(m))` en Texto o un conjunto `top` | `worksheet OrientTableCalcs` orienta el cálculo |

## Cálculos de tabla rápidos

`RUNNING_SUM | PCT_TOTAL | RANK | DIFF | PCT_DIFF | MOVING_AVG(SUM(m))` en cualquier estante o
codificación. tableu escribe `column-instance/table-calc` y orienta la dirección según la vista. Si el
resultado sale "por celda" o en la dirección equivocada, usa `worksheet OrientTableCalcs direction=down|across`.

Lo que hace Desktop (medido en el clic derecho de una píldora, `tableu://ui-commands`):
- **Quick Table Calculation > Running Total / Percent of Total / Rank...:** `column-instance/table-calc`
  con `ordering-type`.
- **Moving Average:** además `window-options`, que tableu no escribe; si necesitas otra ventana usa
  `calculation Create` con `WINDOW_AVG(SUM([m]), -2, 0)`.

## Opciones de la hoja

`worksheet ViewOptions` agrupa los interruptores de los menús Worksheet y Analysis, tal como los escribe
Desktop:

- `title`, `caption` y `summary`: muestran u ocultan esas tarjetas.
- `sort_controls=false`: oculta los botones de orden de los ejes.
- `toolbar='hide'`: oculta la barra de herramientas de la vista.
- `empty_rows` y `empty_cols`: muestran filas y columnas vacías.
- `row_totals_left` y `col_totals_top`: colocan los totales a la izquierda y arriba.
- `aggregate=false`: marcas desagregadas.
- `special_values='hide'|'show'`: nulos y valores no representables.

## Otras operaciones de hoja

- `SetShelf`, `SetMark`, `SetEncoding`, `SetSort` (`by`, `direction` y `order=[...]` manual) y
  `SetTotals`: cambian una parte sin recrear la hoja.
- `Duplicate`, `Rename` (las zonas, viewpoints y puntos de historia se actualizan), `Delete` y
  `SetVisibility hidden=true`: ocultan una hoja usada en un dashboard, que sigue funcionando.
- `MakeMap`: convierte la hoja en un mapa (ver `mapas.md`). `AddMeasureValues`: varias medidas en una
  vista con Measure Names / Measure Values (ver `tablas-y-kpis.md`).
- `AddCard`: tarjetas en la ventana de la hoja (filtro, parámetro, leyendas, caption, summary,
  highlighter).

## Errores típicos

- **Una fecha discreta para una tendencia:** sale una línea partida por cabeceras. Usa `MONTH_TRUNC`.
- **Ordenar sin `by`:** queda en orden alfabético. Para ordenar por valor indica `by="SUM(m)"`.
- **Color por una medida continua en barras apiladas:** no apila. El color de un apilado debe ser una
  dimensión.
- **`detail` olvidado en una dispersión:** sale un único punto agregado.
