# Operaciones del MCP looker-studio y de la CLI ls-studio

Índice generado desde el servidor (`node tools/ops-reference.mjs`); no lo edites a mano. Los parámetros en
negrita son obligatorios. La CLI es `node dist/cli.js <comando>` (o `ls-studio` tras `npm link`), usa el mismo
motor y no lleva el control de `LS_ALLOW_WRITE`.

## Herramientas MCP

| Herramienta | Parámetros | Qué hace | Guía |
|---|---|---|---|
| `attach_to_report` | — | Se conecta por CDP al navegador (LS_CDP_URL, por defecto http://127.0.0.1:9222, o LS_CDP_WS) y localiza la pestana con el informe de Looker Studio (lookerstudio.google.com o datastudio.google.com). | `SKILL.md` |
| `get_report_layout` | pageId | Lista los componentes de una pagina del informe con su caja y estilo: [{id, type, x, y, width, height, style:{padding:{top,right,bottom,left}, backgroundColor, borderColor, borderWidth, borderRadius}}], mas el tamano del lienzo. | `componentes.md` |
| `set_component_box_model` | **componentId**, padding, dimensions, position | Cambia padding, tamano y/o posicion de UN componente. | `componentes.md` |
| `inspect_data_sources` | — | Lista las fuentes de datos del informe y sus campos: [{dataSourceId, name, fields:[{id, name, type: DIMENSION\|METRIC, dataType}]}]. | `campos.md` |
| `bind_fields_to_component` | **componentId**, **dimensions**, **metrics**, mode, rows, sort | Asigna dimensiones y metricas a un componente (grafico, tabla, scorecard). | `campos.md` |
| `diagnose_report` | — | Recorre todas las paginas y devuelve problemas detectados: componentes en error, campos que no existen en el esquema del origen (tipico tras migraciones UA->GA4 o cambios de origen), conceptos qt_ huerfanos, graficos sin metricas, componentes fuera del lienzo o de la reticula, paginas con demasiados graficos y mensajes de error visibles en el canvas. | `revision.md` |
| `get_component_config` | **componentId** | Devuelve el JSON interno completo de un componente (attribute, config.display.keys, config.datasource.keys, conceptDefs). | `revision.md` |
| `open_report` | **url** | Navega la pestana del informe (o una nueva) a la URL indicada y espera a que cargue el editor. | `SKILL.md` |
| `copy_report` | **report**, name | Crea una copia del informe (propiedad del usuario con sesion iniciada) y la abre en /edit. | `SKILL.md` |
| `add_source_field` | **name**, **formula**, source, allowShared | Crea un campo calculado en el ORIGEN de datos (no en un grafico), con el editor de campos de Data Studio. | `campos.md` |
| `reload_report` | — | Recarga la pestana: pinta los componentes creados por API y descarta estado local invalido. | `revision.md` |
| `export_report` | file | Devuelve el informe completo como JSON (paginas, configuracion de cada componente, origenes y campos). | `informe-como-codigo.md`, `revision.md` |
| `capture_templates` | — | Guarda en knowledge/templates una plantilla por cada tipo de componente del informe abierto (funciona en view/preview). | `componentes.md` |
| `list_templates` | — | Tipos de componente con plantilla disponible en knowledge/templates. | `componentes.md` |
| `create_component` | **type**, **box**, pageId, dataset, dimensions, metrics, padding, slots | Crea un componente (grafico, tabla, scorecard, control...) en modo edicion clonando uno del mismo tipo del informe o usando una plantilla aprendida. | `componentes.md` |
| `delete_component` | **componentId** | Borra un componente del informe (modo edicion). | `componentes.md` |
| `patch_component` | **componentId**, dateRangeDays, stripThemeStyles, parameter, text, textSize, textBold, textColor, textAlign, style, comparison, dateField, linkPage | dateRangeDays: periodo por defecto de un control de fechas (ultimos N dias, movil). | `componentes.md` |
| `get_theme` | — | Tema del informe (preset o personalizado) en formato amigable. | `paginas-temas-y-ajustes.md` |
| `apply_theme` | **theme** | Crea o actualiza el tema personalizado del informe: tipografia, color de texto, relleno, acento, fondo, rejilla, colores de subida/bajada, bordes y paleta de series. | `paginas-temas-y-ajustes.md` |
| `list_pages` | — | Paginas en el orden y con el nombre que ve el lector (navegacion), con su nombre interno, componentes y si estan ocultas. | `paginas-temas-y-ajustes.md` |
| `add_page` | **name** | Anade una pagina vacia con el nombre indicado (modo edicion). | `paginas-temas-y-ajustes.md` |
| `synthesize_templates` | **types** | Genera plantillas de tipos de componente que no existen en ningun informe disponible (treemap, pivot-table, scatter, bulletchart, gauge-viz, combochart, areachart, sankey, funnel, waterfall, histogram, google-map) creando uno temporal, vinculando campos validos, guardandolo y borrandolo. | `componentes.md` |
| `audit_ux` | — | Puntua (0-100) la UX del informe: contraste WCAG de texto/acento/series, coherencia con el tema (estilos sobrescritos), paleta (series casi iguales), tipografias, y problemas de layout del diagnostico. | `paginas-temas-y-ajustes.md`, `revision.md` |
| `list_theme_presets` | — | Temas predefinidos del editor (Cosecha=t-harvest, Eucalipto=t-eucalyptus, Pop=t-pop, Niebla=t-fog, ...) y biblioteca propia (themes/library). | `paginas-temas-y-ajustes.md` |
| `use_theme` | **theme** | Aplica un tema predefinido (id o nombre) o uno de themes/library. | `paginas-temas-y-ajustes.md` |
| `list_filters` | — | Filtros del informe (resource.filter) con campo, condicion, valores y donde se aplican (paginas/componentes). | `controles-y-filtros.md` |
| `add_filter` | **name**, **field**, op, values, include, dataset, target | Crea un filtro (o reutiliza uno con el mismo nombre) y lo aplica a una pagina (filtro de pagina) o a un componente. | `controles-y-filtros.md` |
| `detach_filter` | **filterId**, **target** | Quita un filtro (id de list_filters) de la pagina o el componente indicado. | `controles-y-filtros.md` |
| `update_filter` | **filterId**, name, op, values, include | Cambia nombre, condicion (op), valores o incluir/excluir de un filtro existente (id de list_filters). | `controles-y-filtros.md` |
| `seed_templates_from_menu` | **labels** | Inserta opciones del menu "Anadir un grafico" (por su nombre visible, p. | `componentes.md` |
| `rename_page` | **pageId**, **name** | Renombra una pagina en el modelo y en la navegacion que ve el lector (accion de navegacion del editor -> /updateReportNavigationInfo). | `paginas-temas-y-ajustes.md` |
| `report_settings` | patch | Lee o cambia ajustes del informe: viewerFilterBar (barra de filtros de lectores), crossFilterByDefault, viewModeNav, viewModeHeader, viewModeScale, viewModeMargin, viewModeMaxWidth, snapMode, showNavigationInEditMode, width, height. | `paginas-temas-y-ajustes.md` |
| `lint_report_spec` | **spec** | Valida un spec contra las skills (reticula, lienzo, solapes, filas de KPIs, densidad por pagina) sin tocar el informe. | `informe-como-codigo.md` |
| `apply_report_spec` | **spec**, dryRun | Crea o actualiza componentes segun el spec (idempotente: recuerda clave->componente en <spec>.state.json). | `informe-como-codigo.md` |
| `list_orphan_components` | **specs** | Componentes del informe que ningun spec referencia (segun cada <spec>.state.json): restos de pruebas o anadidos a mano. | `informe-como-codigo.md` |
| `create_blend` | **tables**, **box**, name, joinType, type, pageId, dimensions, metrics | Crea una combinacion de 2 a 5 origenes y un grafico sobre ella, como "Combinar datos" del editor: crea graficos temporales con los campos de cada tabla, los combina (une por las dimensiones que comparten), los borra, nombra la combinacion, fija el tipo de union y coloca y vincula el grafico nuevo. | `combinaciones-y-parametros.md` |
| `list_blends` | — | Combinaciones (blends) del informe: id, nombre, origenes, uniones con su tipo y claves, campos y graficos que las usan. | `combinaciones-y-parametros.md` |
| `update_blend` | **blendId**, name, joinType, addTable, removeTable, setKeys | Cambia una combinacion existente: nombre, tipo de todas sus uniones (joinType), una tabla mas (addTable: dataset, dimensions, metrics, keys y joinType; por defecto une por las dimensiones que ya tiene la combinacion), quitar una tabla (removeTable: posicion 2..n) y las claves de la union que anade la tabla n (setKeys {table, keys}). | `combinaciones-y-parametros.md` |
| `delete_blend` | **blendId** | Borra una combinacion (blend) que ningun grafico usa. | `combinaciones-y-parametros.md` |
| `add_parameter` | **name**, type, allowed, values, min, max, default, source, id | Crea un parametro en un origen con el formulario del editor (panel Datos > Anadir un parametro). | `combinaciones-y-parametros.md` |
| `align_components` | **componentIds**, align, distribute, gap, matchSize | Alinea componentes entre si (align: left, center, right, top, middle, bottom, respecto a los limites del conjunto), los distribuye (distribute: horizontal o vertical; con gap, separacion fija en px) y/o iguala su tamano al mayor (matchSize: width, height, both). | `componentes.md` |
| `group_components` | **op**, componentIds, groupIds, pageId | op=group agrupa componentes de una pagina (se mueven y seleccionan juntos; Organizar > Agrupar). | `componentes.md` |
| `get_chart_style` | **componentId** | Estilo efectivo de un grafico (lo sobrescrito y lo que pone el tipo por defecto) en los terminos de set_chart_style: cada serie con nombre, color, tipo, eje (left/right) y etiquetas; leyenda, etiquetas de datos, apilado, ejes y su pagina (pageId). | `componentes.md` |
| `set_chart_interactions` | **componentId**, optionalMetrics, dateDrillDown, drillStart, crossFilter, reload | Lo que el lector puede hacer con un grafico: optionalMetrics (metricas opcionales: el lector cambia la metrica del grafico con su selector; misma sintaxis que bind, p. | `componentes.md` |
| `add_image` | **path**, **box**, pageId, altText | Pone una imagen de un archivo local (SVG, PNG, JPG, GIF) en una caja. | `componentes.md` |
| `create_report_from_csv` | **files**, dataset | Crea un informe nuevo con uno o varios CSV (mismas columnas) como origen, con el conector "Subida de archivos CSV" de Looker Studio, y lo deja abierto en /edit. | `campos.md` |
| `analyze_report_design` | pageId | Perfil de diseno de cualquier informe abierto (tambien uno ajeno en modo vista, con open_report): lienzo, tema, marco comun (barra lateral, barra superior, enlaces a paginas, controles comunes), tarjetas, scorecards (cuadro de icono, comparacion), interacciones (metricas opcionales, desglose, filtro cruzado), tipografia, colores y separaciones de una pagina, y en mapping las claves del spec que reproducen cada patron. | `aprender-de-plantillas.md` |
| `screenshot_report` | pageId, view, componentId | PNG de una pagina (la abierta o pageId) tal como la ve el lector (view=true) o en el editor, o de un solo componente (componentId). | `revision.md` |
| `list_style_keys` | **componentId**, filter | Todas las claves de estilo que acepta un componente, con su valor efectivo (lo sobrescrito o lo que pone el tipo), y cuales estan sobrescritas. | `componentes.md` |
| `check_view` | pageId, clickLinks | Abre una pagina en modo vista y dice, por componente, que controles aparecen al pasar el raton (metricas opcionales, desglosar, ordenar...), su titulo y a que pagina enlaza. | `revision.md` |
| `set_chart_style` | **componentId**, series, legend, dataLabels, compactNumbers, stacked, axes, gridColor, title, reload | Estilo fino de un grafico de barras, lineas, combinado o de areas por nombre, sin conocer las claves internas. | `componentes.md` |
| `set_conditional_format` | **componentId**, **rules**, append | Fija las reglas de formato condicional de una tabla, tabla dinamica o scorecard (Estilo > Formato condicional). | `componentes.md` |
| `update_parameter` | **name**, newName, values, min, max, default, source | Cambia un parametro existente en su formulario (icono fx del parametro en el panel Datos): nombre visible (newName), valores de la lista (values, sustituye todas las filas), rango (min, max) y valor por defecto. | `combinaciones-y-parametros.md` |
| `delete_parameter` | **name**, source | Quita un parametro de su origen (Quitar en su fila de la lista de campos del origen). | `combinaciones-y-parametros.md` |
| `move_page` | **pageId**, **index** | Mueve una pagina a la posicion index (0 = primera) en la navegacion del informe. | `paginas-temas-y-ajustes.md` |
| `delete_pages` | **pageIds** | Borra paginas del informe con sus componentes. | `paginas-temas-y-ajustes.md` |
| `set_page_visibility` | **pageId**, hiddenFromNav, hiddenFromViewer | hiddenFromNav: la quita del menu de navegacion (sigue accesible por enlace). | `paginas-temas-y-ajustes.md` |
| `duplicate_page` | **pageId**, name | Duplica una pagina con sus componentes, filtros y ajustes (Pagina > Duplicar pagina) y, si se indica, le pone nombre. | `paginas-temas-y-ajustes.md` |
| `arrange_components` | **componentIds**, **op**, pageId | op: front, back, forward, backward (orden de capas) o report (pasa los componentes a nivel de informe: salen en todas las paginas) / page (los devuelve a pageId). | `componentes.md` |
| `get_learnings` | raw | Resumen de knowledge/: reason codes vistos, soluciones conocidas, plantillas, resultados de creacion, metodos que faltan y notas. | `revision.md` |
| `record_learning` | **kind**, **key**, **text** | Guarda un hallazgo para futuras sesiones: una solucion (kind=fix, key "reason:93" o un codigo de issue) o una nota. | `revision.md` |

## CLI ↔ MCP

Cada comando de la CLI tiene su herramienta MCP. Lo que cambia, en la última columna.

| CLI `ls-studio` | Herramienta MCP | Diferencias |
|---|---|---|
| `open <url>` | `open_report` | — |
| `attach` | `attach_to_report` | — |
| `reload` | `reload_report` | — |
| `copy <url\|id> [--name N]` | `copy_report` | — |
| `layout [--page <id>]` | `get_report_layout` | — |
| `sources` | `inspect_data_sources` | — |
| `fields add --name N --formula F` | `add_source_field` | `--source`, `--allow-shared` = `source`, `allowShared` |
| `config <id>` | `get_component_config` | — |
| `diagnose` | `diagnose_report` | — |
| `export [-o f.json]` | `export_report` | MCP: `file`, dentro de `LS_WORKSPACE` |
| `box <id> --x --y --w --h --padding` | `set_component_box_model` | MCP: `position{x,y}`, `dimensions{width,height}`, `padding` |
| `bind <id> --dims --metrics [--append] [--sort ...] [--rows N]` | `bind_fields_to_component` | MCP: `mode=append`, `sort`, `rows` |
| `create --type t[@variante] --box x,y,w,h` | `create_component` | MCP: `box{x,y,width,height}`; `type` también admite `@variante`; `slots` solo en MCP y spec |
| `delete <id>` | `delete_component` | MCP: además `LS_ALLOW_DELETE=1` |
| `patch <id> --date-days N --strip-styles --parameter P --text T` | `patch_component` | MCP: `parameter`, `text`, `textSize`, `textBold`, `textColor` |
| `pages [list]` | `list_pages` | — |
| `pages add <nombre>` | `add_page` | — |
| `pages rename <id> <nombre>` | `rename_page` | — |
| `pages move <id> <indice>` | `move_page` | — |
| `pages delete <id...>` | `delete_pages` | MCP: además `LS_ALLOW_DELETE=1` |
| `pages duplicate <id> [nombre]` | `duplicate_page` | — |
| `pages hide <id> [--nav on\|off] [--viewer on\|off]` | `set_page_visibility` | MCP: `hiddenFromNav`, `hiddenFromViewer` |
| `arrange <id...> --to front\|back\|forward\|backward\|report\|page` | `arrange_components` | MCP: `op`, `pageId` |
| `format <id> <reglas.json\|json> [--append]` | `set_conditional_format` | — |
| `chart-style <id>` | `get_chart_style` | — |
| `image <archivo> --box x,y,w,h [--page <id>]` | `add_image` | MCP: `altText` |
| `new-from-csv <archivo.csv...> [--dataset N]` | `create_report_from_csv` | — |
| `design [--page <id>]` | `analyze_report_design` | — |
| `shot [--page] [--view] [--component] [--out]` | `screenshot_report` | MCP: devuelve la imagen |
| `style-keys <id> [--filter regex]` | `list_style_keys` | — |
| `check-view [--page <id>] [--click]` | `check_view` | MCP: `clickLinks` |
| `interact <id> [--optional] [--drill] [--cross on\|off]` | `set_chart_interactions` | MCP: `optionalMetrics`, `dateDrillDown`, `crossFilter` |
| `chart-style <id> <json\|archivo> [--no-reload]` | `set_chart_style` | MCP: `reload=false` |
| `align <id...> [--align] [--distribute] [--gap] [--match]` | `align_components` | MCP: `matchSize` |
| `group <id...>` | `group_components` | MCP: `op=group` |
| `ungroup <id\|g-...>` | `group_components` | MCP: `op=ungroup`, `groupIds` |
| `groups [--page <id>]` | `group_components` | MCP: `op=list` |
| `blends [list]` | `list_blends` | — |
| `blends create <spec.json\|json>` | `create_blend` | Mismo objeto que el MCP |
| `blends update <blendId> [--name] [--join] [--add-table] [--remove-table] [--keys]` | `update_blend` | MCP: `joinType`, `addTable`, `removeTable`, `setKeys {table, keys}`; CLI `--keys 2:pais,anio_mes=mes` |
| `blends delete <blendId>` | `delete_blend` | MCP: además `LS_ALLOW_DELETE=1` |
| `params add --name N [--type] [--values a:Etiqueta,b] [--min --max] [--default] [--source]` | `add_parameter` | MCP: `values` [{value,label}], `allowed`, `id` |
| `params update <nombre> [--name] [--values] [--min --max] [--default] [--source]` | `update_parameter` | `--name` es el nombre nuevo (MCP `newName`) |
| `params delete <nombre> [--source]` | `delete_parameter` | Sin el control de escritura del MCP |
| `theme [get]` | `get_theme` | — |
| `theme set <json\|f.json>` | `apply_theme` | — |
| `theme export <f.json>` | `get_theme` | El MCP devuelve el mismo JSON; el agente lo guarda si hace falta |
| `theme import <f.json>` | `apply_theme` | El MCP recibe el objeto del tema en lugar del archivo |
| `theme presets` | `list_theme_presets` | — |
| `theme use <preset\|biblioteca>` | `use_theme` | — |
| `report settings [--viewer-filter-bar] [--cross-filter] [--set k=v]` | `report_settings` | MCP: `patch{viewerFilterBar, crossFilterByDefault, ...}` |
| `filters [list]` | `list_filters` | — |
| `filters add --name --field [--op] [--values] [--exclude] [--to]` | `add_filter` | MCP: `include=false`, `target` |
| `filters detach <filterId> <pageId\|cd-..>` | `detach_filter` | — |
| `filters update <filterId> [--name N] [--op EQ] [--values a,b] [--include\|--exclude]` | `update_filter` | `--numeric` convierte los valores en números |
| `ux` | `audit_ux` | — |
| `orphans <spec.json...>` | `list_orphan_components` | — |
| `lint <spec.json>` | `lint_report_spec` | MCP: ruta o el objeto spec |
| `apply <spec.json> [--dry-run]` | `apply_report_spec` | MCP: `dryRun` |
| `templates capture` | `capture_templates` | — |
| `templates list` | `list_templates` | — |
| `templates synth <tipo...>` | `synthesize_templates` | — |
| `templates seed-ui "<opción>"...` | `seed_templates_from_menu` | — |
| `learnings [--raw]` | `get_learnings` | — |
| `learn <clave> <texto>` | `record_learning` | MCP: `kind=fix|note`, `key`, `text` |
