# De un comando de Desktop a tableu

Cuando el usuario describe algo en términos de la interfaz de Desktop ("clic derecho en el eje > Edit
Axis > Logarithmic", "Analysis > Totals > Show Row Grand Totals"), busca qué escribe en el libro y usa la
operación de tableu que escribe lo mismo.

## Dónde mirar

`tableu://ui-commands` está medido en Tableau Desktop 2026.3. Cada comando se ejecuta sobre un libro de
prueba recién cargado y se compara el documento antes y después. Tiene tres partes:

1. **Barra de menús:** cada ítem de File, Data, Worksheet, Dashboard, Story, Analysis, Map y Format, con
   su comando interno (`tabdoc:` / `tabui:`), si abre un diálogo y qué cambia en el XML.
2. **Menús contextuales:** 527 ítems del clic derecho sobre campos del panel de datos, píldoras de los
   estantes y de la tarjeta Marcas, cabeceras, ejes, marcas, el fondo de la vista, el título y la pestaña
   de la hoja.
3. **Diálogos:** cada control de 22 diálogos editores (Edit Axis, Add Reference Line, Filter, Sort, Table
   Options, Date Properties, alias, colores, formas, formatos...), cambiado uno a uno.

El nombre interno del comando ayuda a reconocerlo. Por ejemplo, `tabdoc:set-axis-scale-type` es Edit
Axis > Logarithmic y `tabdoc:keep-only-or-exclude exclude="true"` es Exclude.

## Tabla de equivalencias frecuentes

| En Desktop | XML | tableu |
|---|---|---|
| Clic derecho > Sort Ascending/Descending (cabecera) | `computed-sort` / `natural-sort direction=DESC` | `worksheet SetSort` |
| Clic derecho > Keep Only / Exclude | `groupfilter function=member` / `except` | `filter Add values= exclude=` |
| Píldora > Show Filter | `cards/edge/strip/card type=filter` | `filter Add show_card=true` o `worksheet AddCard` |
| Píldora > Discrete / Continuous | `column-instance type=ordinal` / `quantitative` | especificación de campo (`MONTH(Fecha)` / `MONTH_TRUNC(Fecha)`) |
| Píldora > Measure > Average, Count, Median... | `column-instance derivation=Avg|Count|Median|...` | `AVG(...)`, `COUNT(...)`, `MEDIAN(...)` en el estante |
| Píldora > Quick Table Calculation | `column-instance/table-calc` | `RUNNING_SUM(...)`, `PCT_TOTAL(...)`... |
| Campo > Convert to Dimension/Measure | `column@role` (Desktop además `default-role`) | `field Update role=` |
| Campo > Geographic Role | `column@semantic-role=[State].[Name]` | `field Update geo_role=state` |
| Campo > Default Properties > Number Format | `column@default-format` | `field Update default_format=` |
| Campo > Default Properties > Aggregation | `column@aggregation=Avg` | `field Update aggregation=` |
| Campo > Create > Group / Set / Bins / Parameter | `column/calculation`, `group`, `bin`, `column param-domain-type` | `group`, `set`, `bin` y `parameter Create` |
| Cabecera > Show Header | `format attr=display value=false` | `format Field show_header=false` |
| Cabecera > Rotate Label | `format attr=text-orientation value=-90` | `format Style element=label attr=text-orientation` |
| Eje > Edit Axis... | `encoding attr=space range-type min max reverse scale ...` | `format Field axis_*`, `include_zero`, `reverse`, `log_scale`, `tick_*` |
| Eje > Add Reference Line | `pane/reference-line` | `analytics AddReferenceLine` |
| Título > Hide Title | quita `strip/card type=title` | `format Title text=None` o `worksheet ViewOptions title=false` |
| Worksheet > Show Caption / Summary | `strip/card type=caption|summary` | `worksheet ViewOptions caption= summary=` |
| Analysis > Totals | `table/rows@total=true` (y `cols`) / `table/subtotals` | `worksheet SetTotals` |
| Analysis > Aggregate Measures (off) | `view/aggregation value=false` | `worksheet ViewOptions aggregate=false` |
| Analysis > Trend Lines / Forecast | `pane/trendline` / `forecast` | `analytics AddTrendLine` / `AddForecast` |
| Format > Workbook Theme / Fonts | `style-rule` del libro | `workbook Format` / `format Font` |
| File > Workbook Locale | `workbook@locale` | `workbook Format locale=` |

## Medido pero sin operación en tableu (todavía)

| Comando de Desktop | XML |
|---|---|
| Add Reference Line > Box Plot | `reference-line boxplot-whisker-type boxplot-mark-exclusion probability` |
| Drop Lines > Show Drop Lines | `pane/dropline x-axis y-axis drop-when haslabel` |
| Mark Label > Always Show (en una marca) | `mark-labels/mark-label label-state` |
| Extend Date Range | `extend-time-series/extended-column num-periods` |
| Pestaña > Color | `window@tab-color` |
| Auto Update Filters / Auto Update (desactivados) | `worksheet@lock-quick-filters`, `lock-updates` |
| Edit Tooltip > Include command buttons / Show tooltips | `customized-tooltip@show-buttons`, `tooltip-style@tooltip-mode` |
| Accessibility > Use mark tooltip for alt text | `layout-options@tooltip-mark-announcement` |
| Table Options > decimales manuales | `pane@decimalplaces` |
| Data > Assume Referential Integrity | `connection@tableau-ri` |
| Quick Table Calculation > Moving Average (ventana) | `table-calc@window-options` |

Para cualquiera de estos, el camino es `format Style` (si es un `<format>` de una `style-rule`) o
`workbook GetXml` + `workbook ApplyXml` con el elemento escrito exactamente como en la tabla.
`workbook Schema element=<elemento>` da sus atributos válidos. Después, `workbook Validate`. La lista
completa de lo que falta está en `tableu://coverage-gaps`.

## Preferencias de Desktop (settings)

Lo que Desktop guarda fuera del libro, en el registro de Windows y en `Preferences.tps`:

- **`settings ListGroups` / `List` / `Get` / `Set` / `Delete`:** las preferencias por grupos. `Set` se
  niega con Desktop abierto, porque lo sobrescribiría al cerrar, salvo con `force`.
- **`settings CreatePalette name colors type`:** una paleta de color para todos los libros.
  `ListPalettes` / `DeletePalette`. Hay que reiniciar Desktop.
- **`settings RepositoryPath`:** la carpeta "My Tableau Repository".

No cambies preferencias del usuario sin pedírselo.

## Lo que no se debe escribir

Desktop deja en el libro estados de la interfaz que no son diseño:

- la selección (`selection-collection`, `node-selection`);
- la cuadrícula del dashboard (`grid-overlay-mode`);
- la herramienta del mapa (`default-map-tool-selection`);
- los grupos ocultos de las acciones (`[Action (...)]`);
- los metadatos de colación.

No los copies a un libro nuevo.

## Para medir un comando nuevo (mantenimiento)

`server/scripts/ui_reverse.py` vuelve a medir sobre una instancia de Desktop de prueba, nunca sobre la del
usuario:

| Opción | Qué mide |
|---|---|
| sin flags | la barra de menús |
| `--context` | los menús contextuales |
| `--dialogs` | los controles de los diálogos editores |

Mueve el cursor un instante en cada comando. Se para solo si la RAM libre baja de 1,5 GB, y se retoma con
`--redo`. El método y sus límites están en `tableu://behavior`.
