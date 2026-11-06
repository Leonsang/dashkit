# Componentes: crear, colocar y vincular

Un componente es cualquier cosa del lienzo: gráfico, tabla, scorecard, control, texto, imagen o forma. Su id
es `cd-...` y sale de `get_report_layout` (CLI: `layout [--page <id>]`).

## Leer lo que hay

`get_report_layout pageId?` devuelve cada componente con `id`, `type`, la caja (`x`, `y`, `width`, `height`
en píxeles del informe, sin zoom, relativos al lienzo), el estilo (padding, fondo, borde, radio) y sus
campos. Si `pageId` no es la página visible, el editor navega a ella.

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

CLI: `patch <id> --date-days 28 --strip-styles`.

## Borrar: delete_component

Solo si el usuario lo pide. Necesita `LS_ALLOW_DELETE=1` además de `LS_ALLOW_WRITE=1`. CLI: `delete <id>`.

## Lo que no se puede (todavía)

- **Agrupar, alinear, traer al frente y enviar atrás:** no hay herramienta. Calcula las cajas y aplícalas
  con `set_component_box_model`.
- **Componentes a nivel de informe** (presentes en todas las páginas): se crean en la página actual; pasarlos
  a nivel de informe es manual (clic derecho > *Hacer que sea a nivel de informe*).
- **Estilo por serie, ejes, etiquetas de datos o formato condicional:** no hay herramienta propia. Lo que
  manda es el tema (`paginas-temas-y-ajustes.md`); un ajuste fino de un gráfico se hace a mano en el panel
  Estilo.
