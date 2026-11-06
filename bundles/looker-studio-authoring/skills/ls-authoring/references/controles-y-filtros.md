# Controles y filtros

Hay tres formas de restringir datos, y no son intercambiables:

| Qué | Quién lo cambia | Herramienta |
|---|---|---|
| **Control** (lista, casilla, periodo...) | El lector, en el informe | `create_component` con el tipo del control |
| **Filtro** de página o de componente | Solo el editor; el lector no lo ve | `add_filter` |
| **Barra de filtros de lectores** | El lector, sobre cualquier gráfico | `report_settings patch={"viewerFilterBar": true}` |

## Controles: el menú "Añadir un control"

Cada opción es un `tipo@variante`. Siembra la plantilla una vez (`seed_templates_from_menu
labels=["control:<opción>"]`, CLI `templates seed-ui "control:<opción>"`) y después créalo con
`create_component type="<tipo@variante>"`. Todos verificados en un informe de prueba
(`examples/pagina-4-controles.spec.json`):

| Opción del menú | `type` | Notas |
|---|---|---|
| Lista desplegable | `dimension-filter@lista-desplegable` | |
| Lista de tamaño fijo | `dimension-filter@lista-de-tamano-fijo` | |
| Cuadro de entrada | `dimension-filter@cuadro-de-entrada` | |
| Filtro avanzado | `dimension-filter@filtro-avanzado` | |
| Control deslizante | `dimension-filter@control-deslizante` | Campo numérico |
| Casilla | `dimension-filter@casilla` | Campo **booleano del origen**; si no, reason 116. Verificado en modo vista: filtra |
| Filtro predefinido | `button@filtro-predefinido` | La condición es su campo de control: un **booleano del origen**. Sin campo, reason 265; no booleano, 116. Verificado: filtra. Etiqueta con `style={"text":"..."}` |
| Filtro por periodo | `simple-daterangepicker@filtro-por-periodo` | Fija el periodo con `dateRangeDays` |
| Control de datos | `dataset-picker@control-de-datos` | Solo tiene sentido con conectores como GA o Ads |
| Control de dimensiones | `dimension-control@control-de-dimensiones` | |
| Botón | `button@boton` | Etiqueta con `style={"text":"..."}` |

El campo del control se vincula como en un gráfico, con `dimensions=[campo]`. El booleano se crea con
`add_source_field` (ver `campos.md`).

**Periodo por defecto:** un `simple-daterangepicker` sin `dateRangeDays` hereda el del informe (a menudo
los últimos 28 días) y puede dejar la página sin datos si son históricos. `patch_component
dateRangeDays=365`, o `dateRangeDays` en el spec.

**Comprueba que filtra:** abre el informe en `/view`, cambia el control y mira que las cifras cambian. Un
control sin errores no prueba que filtre.

## Filtros: add_filter, list_filters, detach_filter

```json
{"name": "Sin tablet", "field": "dispositivo", "op": "EQ", "values": ["Tablet"], "include": false,
 "target": "<pageId o cd-...>"}
```

CLI: `filters add --name "Sin tablet" --field dispositivo --op EQ --values Tablet --exclude --to <pageId|cd-...>`.

- **`op`:** `EQ` (por defecto), `CONTAINS`, `STARTS_WITH`, `RM` (regex completa), `RP` (regex parcial),
  `IN`, `NU` (nulo), `GT`, `GE`, `LT`, `LE` y `BETWEEN`.
- **`include=false`:** excluye en lugar de incluir.
- **`target`:** un `pageId` (filtro de página: se aplica a todos sus componentes) o un `cd-...` (solo ese
  componente). Sin `target`, el filtro se crea en el informe pero no se aplica a nada.
- **Se reutiliza por nombre:** si ya hay un filtro con ese `name`, se aplica el existente y no se crea otro.
  Para cambiar su condición, usa otro nombre.
- **`dataset`:** por defecto, el origen que tiene `field`.
- **`list_filters`** (CLI `filters`): cada filtro con campo, condición, valores y dónde se aplica.
- **`detach_filter filterId target`** (CLI `filters detach <filterId> <destino>`): lo quita de esa página o
  componente. El filtro sigue en el informe.

Los filtros por id de campo solo afectan a gráficos del mismo origen (ver `ls-modelo-datos` §4).

## Ajustes de interacción del informe

Con `report_settings` (ver `paginas-temas-y-ajustes.md`):
- `viewerFilterBar`: la barra de filtros de lectores (*Añadir barra de filtros de lectores*).
- `crossFilterByDefault`: que los gráficos nuevos filtren a los demás al hacer clic.

## Controles que fijan un parámetro

Un control también puede mover un parámetro en vez de filtrar: `patch_component parameter=<id>` (o
`parameter` en el spec). Está en `combinaciones-y-parametros.md`.

## Lo que no se puede (todavía)

- Editar la condición de un filtro existente: crea uno con otro nombre y quita el viejo con `detach_filter`.
- Controles a nivel de informe (en todas las páginas): manual, como cualquier componente de informe.
- Filtros de origen de datos (en la configuración del origen): manuales.
