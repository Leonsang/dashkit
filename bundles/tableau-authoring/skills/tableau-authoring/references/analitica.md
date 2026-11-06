# Analítica: referencias, tendencias y pronósticos

## Líneas, bandas y distribuciones de referencia

`analytics AddReferenceLine` hace lo mismo que el diálogo **Add Reference Line, Band, or Box**, medido
control a control:

| Diálogo | Parámetros | XML (`pane/reference-line`) |
|---|---|---|
| Line, Entire Table | `formula=average scope=per-table` | `formula=average scope=per-table` |
| Per Pane / Per Cell | `scope=per-pane` / `per-cell` | `scope=per-pane|per-cell` |
| Value: Sum, Minimum, Maximum, Median, Constant | `formula=sum|min|max|median|constant value=1000` | `formula=...` (`value` en las constantes) |
| Band (desde / hasta) | `formula=min band_to=max` | dos líneas unidas por `paired-id` |
| Distribution | `percentages=[60, 80, 100]` | `percentage-bands=true` + `<reference-line-value percentage>` |
| Calcular sobre otra medida (objetivo) | `value_of="SUM(Objetivo)"` | `value-column`; la medida va a Detalle si no está |
| Label | `label="Media: <Value>"` (`""` lo oculta) | `label-type` / `label` |
| Show recalculated line for highlighted or selected data points | — | Desktop lo activa por defecto (`enable-instant-analytics=true`); tableu escribe `false`, la línea no se recalcula al seleccionar |

**Gráfico de bala (real frente a objetivo), como Superstore:** barra de `SUM(Real)` y
`AddReferenceLine measure="SUM(Real)" value_of="SUM(Objetivo)" percentages=[60, 80] scope="per-cell"`.
La línea del objetivo, una segunda `AddReferenceLine formula=constant` o `value_of`, se estiliza con
`format ReferenceLine`.

**Estilo:** `format ReferenceLine line_id=refline0 color width pattern fill_above fill_below label_color`.
El id lo devuelve `AddReferenceLine`.

**Box plot:** el diálogo escribe `boxplot-whisker-type=standard`, `boxplot-mark-exclusion=false` y
`probability` (medido). tableu todavía no crea box plots: está en `tableu://coverage-gaps`.

## Tendencias

- **Crear:** `analytics AddTrendLine fit=linear|log|exp|polynomial|power degree=2 confidence_bands=true`.
- **Requisito:** las dos medidas deben ser continuas (dispersión), o la fecha continua (línea). Con una
  fecha discreta Desktop no la dibuja.
- **Medido:** Analysis > Trend Lines > Show Trend Lines sobre una hoja de barras abre un aviso
  ("Warning"); sobre una dispersión escribe `pane/trendline`.
- **Estilo:** `format Lines kind=trendline`.

## Pronóstico

- **Crear:** `analytics AddForecast confidence=95` sobre una hoja con una fecha **continua** en un eje.
- **Duración:** es automática. El esquema 2026.3 no guarda una duración fija, así que `periods` se ignora.
- **Medido:** Desktop marca las instancias pronosticadas con `forecast-column-type` /
  `forecast-column-base`.

## Líneas de caída

Clic derecho en la vista > Drop Lines > Show Drop Lines: `pane/dropline` con `x-axis`, `y-axis`,
`drop-when` y `haslabel` (medido). tableu no las crea.

## Quitar

`analytics Remove kind=reference-line|trendline|forecast|all`.
