# Componentes: crear, colocar y vincular

Un componente es cualquier cosa del lienzo: gráfico, tabla, scorecard, control, texto, imagen o forma. Su id
es `cd-...` y sale de `get_report_layout` (CLI: `layout [--page <id>]`).

## Leer lo que hay

`get_report_layout pageId?` devuelve cada componente con `id`, `type`, la caja (`x`, `y`, `width`, `height`
en píxeles del informe, sin zoom, relativos al lienzo), el estilo (padding, fondo, borde, radio) y sus
campos. Si `pageId` no es la página visible, el editor navega a ella.

**Opciones sin herramienta propia:** `list_style_keys componentId filter?` (CLI `style-keys <id> --filter
"title|padding"`) lista todas las claves de estilo que acepta el componente con su valor efectivo y cuáles están
sobrescritas; se cambian con `patch_component style`. Así se encuentran el título propio de un gráfico
(`chartTitle*`), el margen de un scorecard (`paddingLeft`) o si muestra la variación (`hideCompare`).

## Crear: create_component

```json
{"type": "simple-linechart", "box": {"x": 20, "y": 240, "width": 740, "height": 300},
 "dataset": "@ingresos", "dimensions": ["fecha"], "metrics": ["SUM(ingresos)"], "padding": 12}
```

CLI: `create --type simple-linechart --box 20,240,740,300 --dataset @ingresos --dims fecha --metrics "SUM(ingresos)"`.

- **De dónde sale el JSON del componente**, por orden:
  1. **Clon** de uno del mismo tipo que ya está en el informe (`duplicateConfig()`).
  2. **Plantilla aprendida** de `knowledge/templates/<tipo>.json`, si el informe no tiene ninguno.

  Sin clon ni plantilla, la creación falla: consigue la plantilla antes (ver abajo).
- **`dataset`:** el id del origen, o `"@campo"` para el origen que tiene ese campo. Sin él, se queda el del
  clon o el del informe.
- **Campos:** la misma sintaxis que `bind_fields_to_component` (ver `campos.md`). Si se indican, el guardado
  espera a que estén vinculados, porque una plantilla sin campos se rechaza.
- **Variantes:** `type="dimension-filter@casilla"` usa la plantilla de esa variante, sembrada desde el menú
  del editor. Los nombres de variante están en `controles-y-filtros.md`.
  Verificado por el MCP el 2026-11-06: `dimension-filter@casilla` sale con el preset `control-checkbox`.
- **`slots`:** huecos propios de algunos tipos, además de dimensiones y métricas:
  - dispersión: `x_metric`, `y_metric`, `bubble_size`;
  - área y línea: `breakdown`;
  - treemap: `color`.

  `{"slots": {"breakdown": ["canal"]}}`. La CLI no los acepta; usa el MCP o un spec. Verificado el 2026-11-06
  en un gráfico de áreas: el campo queda en `dimensions.breakdown`.
- **Después de crear varios**, `reload_report` para verlos pintados. Los `warnings` de `bound` pueden traer el error
  que el componente tenía en la plantilla (reason 266 o 267): es un error pegado; recarga y diagnostica antes
  de juzgar.
- **Guardados rechazados:** la herramienta los detecta (`updatePage` con error), los registra y devuelve el
  arreglo conocido (`fix`). No cambies `display.type` de un JSON clonado: da `updatePage 400`.

Tipos que conoce el lint: `simple-linechart`, `simple-barchart`, `simple-histogram`, `simple-combochart`,
`simple-piechart`, `simple-table`, `google-map`, `simple-geomap`, `kpi-metric`, `simple-scatterchart`,
`bulletchart`, `simple-areachart`, `pivot-table`, `simple-treemap`, `gauge-viz`, `simple-sankey`,
`simple-waterfall`, `simple-timeline`, `simple-funnel`, controles (`dimension-filter`,
`simple-daterangepicker`, `dataset-picker`, `dimension-control`, `button`, `filter-bar`, `metric-filter`,
`advanced-filter`) y elementos sin datos (`simple-description`, `image-component`, `shape`, `generic-shape`,
`ellipse`, `arrow`, `placeholder`, `framed-external-content`).

## Conseguir plantillas

| Cuándo | MCP | CLI |
|---|---|---|
| Otro informe (aunque sea en `/view` o `/preview`) tiene el tipo | `capture_templates`, una por tipo del informe abierto | `templates capture` |
| La opción está en el menú "Añadir un gráfico" o "Añadir un control" | `seed_templates_from_menu labels=["Tabla dinámica con mapa de calor"]`: la inserta, la guarda como `tipo` y `tipo@variante` y la borra | `templates seed-ui "<opción>"`; controles con `"control:<opción>"` |
| No existe en ningún informe a mano | `synthesize_templates types=[...]`: crea uno temporal, le vincula campos válidos, lo guarda como plantilla y lo borra | `templates synth <tipo...>` |
| Ver cuáles hay | `list_templates` | `templates list` |

`export_report` también aprende los tipos y captura plantillas nuevas. Una plantilla de otro informe trae
sus colores y fuentes: quítalos con `patch_component stripThemeStyles=true` para que mande el tema.

## Mover y redimensionar: set_component_box_model

`componentId` y al menos uno de `position{x,y}`, `dimensions{width,height}` o `padding` (un número o
`{top,right,bottom,left}`). Devuelve el estado antes y después. CLI: `box <id> --x 20 --y 100 --w 270 --h 120
--padding 12`.

- Usa múltiplos de la retícula (10 o 20 px) y gaps iguales (`ls-diseno-layout` §3).
- `kpi-metric` no tiene `paddingBottom` y `generic-shape` no tiene padding: lo avisa en `warnings`.

## Ajustes puntuales: patch_component

- `dateRangeDays=N`: periodo por defecto de un control de fechas, los últimos N días (móvil).
- `stripThemeStyles=true`: quita colores, fuentes y bordes sobrescritos en el componente.
- `text="..."` (con `textSize`, `textBold`, `textColor`, `textAlign`): el texto de un cuadro de texto
  (`simple-description`). `
` separa líneas.
- `parameter=<id>`: un control pasa a fijar ese parámetro en vez de filtrar (ver
  `combinaciones-y-parametros.md`).
- `style={...}`: claves de estilo del componente, las de `get_component_config` > `config.display.keys`,
  como las cambia el panel Estilo. Las más útiles, verificadas:

  | Tipo | Clave | Efecto |
  |---|---|---|
  | `kpi-metric` | `hideMetric: false` | Muestra el nombre de la métrica (la plantilla lo trae oculto) |
  | `kpi-metric` | `hideCompare`, `compactNumbers` | Comparación y números compactos |
  | `simple-linechart` | `missingDataDisplayType: "linearInterpolation"` | Une los puntos; con `lineToZero` (por defecto) una serie mensual sobre un eje diario sale en picos |
  | `button` | `text: "Solo pedidos online"`, `fontSize: "16px"` | Etiqueta del botón (la plantilla dice "Botón nuevo") |
  | `simple-table`, `pivot-table` | `headerColor: {"color":"<acento>","opacity":1}`, `headerFontColor: {"color":"<texto de acento>","opacity":1}` | Cabecera legible con cualquier tema. `stripThemeStyles` ya lo pone |

CLI: `patch <id> --date-days 28 --strip-styles`, `patch <id> --text "Ventas 2025" --size 24 --bold --align center`,
`patch <id> --parameter metrica`, `patch <id> --style '{"hideMetric":false}'`. En el spec, `style`.

**Series temporales:** `simple-linechart` solo acepta una dimensión de fecha (con un número como `anio_mes`
o un texto da reason 266). Para una tendencia mensual usa una fecha de inicio de mes y
`missingDataDisplayType: "linearInterpolation"`. `bind` ordena las tendencias (línea, área, combinado) por
su primera dimensión ascendente, y alinea con ese orden el orden inicial que el editor guarda aparte
(`behavior.onSort`): en un gráfico combinado nuevo el editor lo pone por "Número de registros" y es el que
manda.

**Cabeceras de tabla:** según el informe, el editor pinta la cabecera sobre un tinte claro del acento con el
texto de acento (blanco sobre celeste) o sobre el acento sólido con el texto del tema (oscuro sobre oscuro): en
los dos casos puede no leerse. `stripThemeStyles=true` en tablas fija las dos claves, el acento del tema de
fondo y su texto de acento encima, y `audit_ux` avisa de las tablas que no las tienen.

## Alinear, distribuir y agrupar: align_components, group_components

Lo de *Organizar > Alinear / Distribuir / Agrupar*:

- **`align_components componentIds align`**: `left`, `center`, `right`, `top`, `middle` o `bottom`,
  respecto a los límites del conjunto. CLI `align cd-a cd-b cd-c --align top`.
- **`distribute`** (`horizontal` o `vertical`): reparte el espacio entre el primero y el último; con `gap`,
  separación fija en px desde el primero. CLI `align ... --distribute horizontal --gap 20`.
- **`matchSize`** (`width`, `height`, `both`): iguala al mayor. CLI `--match both`.
- Se pueden combinar en una llamada (primero el tamaño, luego la alineación y por último la distribución).
- **`group_components op=group componentIds`**: agrupa componentes de una página; se mueven y seleccionan
  juntos y siguen accesibles por su id. `op=ungroup` (con `groupIds` o `componentIds`) y `op=list`. CLI
  `group <id...>`, `ungroup <id|g-...>`, `groups [--page <id>]`.
- Verificado el 2026-11-06: alinear arriba y distribuir con separación fija devuelven un control desplazado
  a su sitio; el grupo persiste al recargar.

## Formato condicional: set_conditional_format

Lo que hace *Estilo > Formato condicional* en tablas, tablas dinámicas y scorecards:

```json
{"componentId": "cd-...", "rules": [
  {"field": "Cumplimiento", "op": "LT", "value": 0.8, "color": "#C5221F"},
  {"field": "Cumplimiento", "op": "GE", "value": 1, "color": "#137333", "background": "#E6F4EA"},
  {"field": "Ingresos", "op": "GT", "value": 700, "target": "row", "background": "#FCE8E6"},
  {"field": "Valoración", "scale": ["#DB3737", "#F5B503", "#0E9D58"]}]}
```

CLI: `format <id> reglas.json` (o el JSON en línea), `--append` para añadir. En el spec, `conditional`.

- **`field`:** un campo del gráfico, por su nombre visible (el `as` de la métrica) o su id `qt_`.
- **Regla de color único:** `op` (`EQ`, `NE`, `GT`, `GE`, `LT`, `LE`) y `value`; un porcentaje se compara como
  fracción (`0.8` es 80 %). `background` y/o `color` (texto).
- **Escala:** `scale` con 2 o 3 colores (mínimo, [medio,] máximo) sobre el rango del campo.
- **`target`:** `"row"` (fila completa) o la columna de otro campo; por defecto, la del propio campo.
- **Colores:** `#rrggbb` o `serie:N` (el color N de la paleta del tema, ligado a él).
- Sustituye las reglas del componente; `rules=[]` las quita.
- **Mapas de calor:** con alguna regla, el editor deja de pintar los mapas de calor de las columnas. Usa una
  `scale` donde quieras mantener el degradado.

## Estilo de un gráfico: set_chart_style

Series, leyenda, etiquetas y ejes de un gráfico de barras, líneas, serie temporal o combinado, por nombre:

```json
{"componentId": "cd-...",
 "series": [{"series": "Ingresos", "color": "#1F6FEB"},
            {"series": 2, "type": "line", "lineWeight": 2, "showPoints": true}],
 "legend": "bottom", "dataLabels": false, "axes": {"yMin": 0, "xTitle": false}}
```

CLI: `chart-style <id> estilo.json` (o el JSON en línea), `--no-reload`. En el spec, `chartStyle`.

**Leer antes de cambiar:** `get_chart_style componentId` (CLI `chart-style <id>`) da el estilo **efectivo**:
lo sobrescrito más lo que pone el tipo por defecto, con el nombre de cada serie, su eje y su página
(`pageId`). `get_component_config` solo enseña lo sobrescrito; por ejemplo, un combinado sin eje fijado no
tiene la clave y aun así pinta la serie 2 a la derecha.

- **`series`:** por posición (1, 2...) o por el nombre visible de la métrica. `color` (`#rrggbb`), `type`
  (`bars` o `line`, solo en gráficos combinados y de serie temporal: en uno de barras el editor lo ignora y la
  herramienta lo rechaza), `lineWeight`, `showPoints`, `dataLabels`, `axis` (`left`/`right`), `trendline`,
  `cumulative`, `compact`, `decimals`.
- **Del gráfico:** `legend` (`top`, `bottom`, `right`, `left`, `none`), `dataLabels`, `compactNumbers`,
  `stacked`, `axes` (`show`, `xTitle`, `yTitle`, `rightTitle`, `yMin`, `yMax`, `logScale`) y `gridColor`.
- **Recarga al final:** el editor guarda las claves pero no repinta el gráfico hasta recargar. Recarga la
  página abierta: si el gráfico está en otra, ábrela (`open_report` con su `pageId`) para verlo.
  `reload=false` (o `--no-reload`) lo evita si vas a encadenar varios cambios; recarga tú al acabar.
- Una propiedad que el tipo de gráfico no tiene da error con su nombre, en vez de guardarse sin efecto.
- **Gráfico circular:** `legend` funciona igual; el hueco del anillo es la clave `pieHole` (0 a 1, p. ej. 0,55)
  con `patch_component style`. Otras claves de cualquier tipo: `list_style_keys`.
- **Buenas prácticas (guía dataviz, [CONVENCIÓN]; detalle en `ls-diseno-layout` §7):** un solo eje Y
  (`audit_ux` da error con una serie a la derecha, también la del combinado por defecto);
  leyenda siempre que haya 2 series o más; etiquetas de datos solo en pocas barras, nunca en cada punto de una
  línea; el color sigue a la entidad (una métrica, el mismo color en todo el informe). Con una sola serie,
  ponle título propio (`title`) y quita la leyenda (`legend: "none"`): el título ya la nombra.
- **`title`:** `{text, size?, bold?}` muestra el título propio del componente (claves `chartTitle*`, las tienen
  todos los tipos); `null` lo quita. Se dibuja **encima** de la caja del componente, fuera del borde del tema:
  para una tarjeta cerrada con el título dentro, usa `card` en el spec (más abajo).
- Verificado el 2026-11-07: color, leyenda abajo y etiquetas de datos se ven tras recargar; el eje derecho lo
  detecta `audit_ux`.

## Tarjetas, iconos e interacciones

Patrones tomados de plantillas publicadas (verificado el 2026-11-07); todos se declaran en el spec.

### Tarjeta: `card` en el spec

```json
{ "key": "ventas", "type": "simple-linechart", "x": 170, "y": 310, "w": 740, "h": 300,
  "card": { "title": "Ingresos en el tiempo" }, ... }
{ "key": "kpi_ingresos", "type": "kpi-metric", "card": { "icon": "../assets/icons/ingresos.svg" }, ... }
```

- La caja es la de la tarjeta. `card` crea detrás una forma redondeada (`<key>__card`, blanca, radio 12; o adopta
  una que ya exista con `card.id`) y mete
  el componente dentro con un margen (`inset`, 10 por defecto), sin fondo ni borde propios y con su título.
- **Scorecard con `icon`:** a la izquierda, un cuadro del color de acento (`<key>__tile`, `iconBackground`)
  con el icono encima (`<key>__icon`, sin fondo ni borde propios); el valor pasa a la derecha y baja a 24 px
  para que quepa. Con `comparison`, la frase del editor («en comparación con: año anterior») no cabe en la
  tarjeta: se cambia por `compareLabel` «vs. año anterior» o «vs. periodo anterior» (otra, con `style`).
- Al aplicar, las formas de las tarjetas se mandan al fondo de su página, también cuando envuelven
  componentes que ya existían.
- Con el tema `panel-lateral` (fondo de página gris claro, sin borde por componente) las tarjetas blancas
  destacan solas.

### Imágenes e iconos: add_image

`add_image path box pageId? altText?` (CLI `image <archivo> --box x,y,w,h`; en el spec, un `image-component` con
`"image": "<ruta>"`). Este editor no admite imágenes por URL, solo subir un archivo: la herramienta lo sube con
el selector de archivos del editor, que crea la imagen en la página abierta, y la coloca. Un archivo ya subido
al informe (mismo nombre) se reutiliza sin volver a subirlo. `assets/icons/` trae iconos de línea propios en
blanco (KPIs, navegación, filtros).

### Comparación con el periodo anterior

`patch_component comparison` (`previous_period`, `previous_year`, `none`; CLI `patch <id> --compare ...`; en el
spec, `comparison`). En un scorecard muestra la variación con su flecha y el color de subida o bajada del tema;
en un gráfico de serie temporal añade la serie del periodo anterior.

La comparación necesita la **dimensión de periodo** del gráfico (`dateRangeDimension`), que es también la que
usa el control de periodo para filtrarlo. `bind` la pone sola cuando falta (la primera fecha diaria del
origen: un nombre como `fecha`/`date`/`dia`, si no la primera fecha). Para otra fecha, usa `dateField`
(CLI `--date-field`; en el spec, `dateField`). Si el origen no tiene ninguna fecha (un CSV con la fecha como
texto), la herramienta falla y lo dice: crea antes un campo de fecha con `add_source_field`
(`PARSE_DATE("%Y-%m-%d", fecha)`).

**Texto de la comparación:** la clave de estilo `compareLabel` acepta texto libre (`style: {"compareLabel":
"vs. año anterior"}`); en tarjetas estrechas, úsala.

El periodo anterior es del mismo largo que el del control de periodo: con un control que abarca todos los
datos (p. ej. `dateRangeDays: 1100` en un histórico de dos años), el anterior queda vacío y el scorecard dice
«No hay datos en comparación». Para comparar, deja el periodo en un tramo que tenga otro igual detrás
(90 días, el último año) o usa `previous_year`.

### Interacciones del lector: set_chart_interactions

```json
{"componentId": "cd-...", "optionalMetrics": ["COUNT_DISTINCT(id_pedido) as Pedidos", "SUM(unidades) as Unidades"],
 "dateDrillDown": true, "crossFilter": true}
```

CLI `interact <id> --optional "..." --drill --cross on`; en el spec, `interactions`.

- **`optionalMetrics`:** el lector cambia la métrica del gráfico con su selector (el icono de métricas
  alternativas). Misma sintaxis que `bind`; `[]` las quita.
- **`dateDrillDown`:** la fecha diaria del gráfico se desglosa mes › semana › día. Empieza en mes (`drillStart:
  "day"` para empezar en día). Pide una dimensión de fecha diaria (p. ej. `fecha`, no `mes_inicio`).
- **`crossFilter`:** un clic en el gráfico filtra el resto de la página.
- Recarga al final para que se vea.

### Navegación propia: botones a una página

`patch_component linkPage` (id de página o `"name:<nombre>"`; CLI `patch <id> --link-page <id>`; en el spec,
`linkPage`) hace que un botón o una imagen abra esa página. Un cuadro de texto no admite enlace y, encima de un
botón, se queda con el clic: pon la etiqueta como texto del botón. Con `reportLevel: true` en el spec, el botón, su icono y su
texto salen en todas las páginas: es la barra lateral de navegación (ver el arquetipo «panel con barra
lateral» en `ls-diseno-layout`).

### Orden y número de filas: `sort` y `rows`

Por defecto, las tendencias se ordenan por su fecha ascendente y el resto por la primera métrica
descendente. Para unas barras en su orden natural (horas, días de la semana, tramos), `sort: "dimension"`
(también `dimension_desc`, `metric`, `metric_asc`); las plantillas muestran 10 filas, `rows: 24` muestra más.
En el spec, `sort` y `rows`; en `bind`, los mismos parámetros (CLI `bind <id> --sort dimension --rows 24`).

## Capas y nivel de informe: arrange_components

`arrange_components componentIds op` (CLI `arrange <id...> --to <op>`):

| `op` | Qué hace |
|---|---|
| `front`, `back` | Lo pone delante o detrás de todo (p. ej. una forma de fondo detrás de los KPIs) |
| `forward`, `backward` | Un puesto adelante o atrás |
| `report` | Lo pasa a **nivel de informe**: sale en todas las páginas, en la misma posición. Indica `pageId` de la página donde está |
| `page` | Lo devuelve de nivel de informe a la página `pageId` |

Un control de periodo o un logo a nivel de informe se ponen una vez para todo el informe. Verificado: el
cambio persiste al recargar y el componente conserva su id.

## Borrar: delete_component

Solo si el usuario lo pide. Necesita `LS_ALLOW_DELETE=1` además de `LS_ALLOW_WRITE=1`. CLI: `delete <id>`.

## Lo que no se puede (todavía)

- **Líneas y bandas de referencia** (un objetivo de 5 min): las claves `referenceLine*` existen y se guardan
  (`referenceLineNumberValue`, `referenceLineLabel`, `referenceLineColor`...), pero aún no se sabe qué valor de
  `referenceLineType` las pinta: con `null`, 1 o 2 no aparecen. Alternativa: el objetivo en el título o una
  forma fina encima del gráfico.
- **Texto en el centro de un donut** y **barras dentro de una tabla** (la columna «peso»): no hay clave conocida;
  usa un cuadro de texto encima o el formato condicional.

- **Estilo de tablas, mapas y scorecards por nombre:** solo `set_chart_style` (gráficos) y
  `set_conditional_format`. Lo demás lo manda el tema (`paginas-temas-y-ajustes.md`); una clave suelta del
  panel Estilo se cambia con `style={...}` si se conoce su nombre (`get_component_config` >
  `config.display.keys`).
