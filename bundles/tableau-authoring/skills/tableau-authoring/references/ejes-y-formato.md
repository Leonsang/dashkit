# Ejes y formato

Todo el formato de Tableau vive en `<style><style-rule element="..."><format attr value/>` (de la hoja,
del dashboard o del libro). Las operaciones de `format` escriben esas reglas como lo hace el panel
Format de Desktop. `format Elements` lista los elementos y `format Style` es el setter genérico.

## Ejes: format Field

Lo que hace el diálogo **Edit Axis**, medido control a control (`ui_reverse --dialogs`). Todo va en una
sola `<encoding attr="space">` por eje, dentro de `style-rule element="axis"`:

| Diálogo Edit Axis | Parámetro de `format Field` | XML |
|---|---|---|
| Range: Automatic | `axis_range="automatic"` | sin `range-type` |
| Uniform axis range for all rows or columns | `axis_range="uniform"` | `range-type=uniform` |
| Independent axis ranges for each row or column | `axis_range="independent"` | `range-type=independent` |
| Custom, Start / End | `axis_min=0 axis_max=1000` | `range-type=fixed min=0.0 max=1000.0` |
| Include zero (desmarcado) | `include_zero=false` | `domain-expand=false` |
| Reversed | `reverse=true` | `reverse=true` |
| Logarithmic | `log_scale=true` | `scale=log` |
| Tick Marks > Fixed (major) | `tick_spacing=250 tick_origin=0` | `major-spacing=250.0 major-origin=0.0` |
| Tick Marks > None | `show_ticks=false` | `major-show=false` |
| Title | `axis_title="Importe (€)"` | `format attr=title` |

Otros parámetros de `format Field`:
- `number_format`: formato de números en celdas, etiquetas y eje (ver `tablas-y-kpis.md`).
- `show_header=false`: oculta la cabecera, igual que el clic derecho > Show Header.
- `legend_title`: título de la leyenda.

**Clear Axis Range** (clic derecho en el eje) equivale a `axis_range="automatic"`. Los ejes de un
doble eje se sincronizan con `worksheet SetDualAxis synchronize=true`.

## Toda la hoja

- **`format Worksheet`:** fuente, tamaño, color, fondo, `gridlines`, `zero_lines`, `row_dividers` y
  `field_labels`.
- **`format Font element=worksheet|cell|header|label|axis|axis-title|legend|title|quick-filter|...`:**
  fuente por elemento (`family`, `size`, `color`, `bold`, `italic`, `align`, y `field` para un solo
  campo).
- **`format Lines kind=gridline|zeroline|table-div|header-div|trendline`:** `visible`, `color`, `width` y
  `pattern=solid|dashed|dotted`.
- **`format Borders area=cell|pane|header`:** estilo, color y ancho.
- **`format Backgrounds`:** fondo de la hoja, del panel, de las cabeceras, del título, de las leyendas y de
  las tarjetas.
- **`format Banding`:** filas o columnas en cebra.

## Marcas, color, etiquetas y tooltips

- **`format Marks`:** color fijo, tamaño, opacidad y etiquetas. **`format MarkBorder`:** borde de las
  marcas.
- **`format ColorPalette`:**
  - Para una dimensión: `colors={"Norte": "#4e79a7"}` o `palette="color_blind_10"`.
  - Para una medida: `gradient=["#bajo", "#alto"]`, o tres colores con `center` para una paleta
    divergente. `min`/`max` fijan el rango y `steps` la escalona.

  Así lo escribe Edit Colors (`custom-interpolated`).
- **`format Label text="<SUM(Importe)> €"`:** etiqueta con texto libre y campos.
- **`format Tooltip text=...`:** tooltip propio; `viz_sheet="Detalle"` mete una vista dentro del tooltip.
- **Medido en Edit Tooltip:**
  - "Include command buttons" escribe `customized-tooltip@show-buttons`.
  - El modo "Show tooltips" escribe `tooltip-style@tooltip-mode`.

  tableu no expone ninguno de los dos.
- **Clic derecho en una marca > Mark Label > Always Show:** `mark-label@label-state`. tableu no lo
  expone.

## Títulos y texto enriquecido

- **`format Title text="Ventas por región — <Parameters.Año>"`:** `font_size`, `bold` y `color`.
  `text=None` oculta la tarjeta del título, igual que Hide Title.
- **`format TextRuns kind=title|zone|dashboard-title`:** tramos de texto con formato propio.
- **Edit Title:** su editor de texto enriquecido no expone controles a UI Automation, así que el barrido
  no lo midió. tableu escribe el mismo `formatted-text`.

## Libro, dashboard e historia

- **`workbook Format`** (o su alias **`format Workbook`**): fuente, tamaño y color por defecto, tamaño de los títulos y
  `locale=es_ES|es_MX|en_US` (separadores, moneda y meses).
- **`format Dashboard`, `format Zone`, `format Container` y `format Story`:** fondos, bordes, márgenes y
  pies de los puntos de historia.
- **Color de pestaña** (clic derecho en la pestaña > Color): `window@tab-color`. tableu no lo expone.

## Líneas de referencia

`format ReferenceLine line_id=refline0 color width pattern fill_above fill_below label_color` estiliza una
línea creada con `analytics AddReferenceLine` (ver `analitica.md`).

## Paletas propias para todos los libros

`settings CreatePalette name colors type=regular|ordered-sequential|ordered-diverging` escribe
`Preferences.tps` y hay que reiniciar Desktop. Así una paleta corporativa aparece en Edit Colors.
