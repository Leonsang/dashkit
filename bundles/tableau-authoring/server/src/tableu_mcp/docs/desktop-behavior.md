# Comportamiento de Tableau Desktop 2026.3 observado por tableu

Este documento recoge lo que Desktop hace realmente, observado en vivo (con API 0.1.1 y el flag ProjectAthena)
y en los documentos que instala, aunque la documentación no lo diga. Cada punto indica cómo lo resuelve tableu.
Fechas de verificación: 2026-11-04 y 2026-11-05.

## La API en vivo (External Client API 0.1.1)

| Comportamiento | Qué hace tableu |
|---|---|
| `POST /v0/workbook/document` responde SUCCEEDED, pero descarta en silencio los parámetros, acciones y botones nuevos | Compara antes y después y responde `applied: "partial"` con `dropped` y `pending`. `workbook Reopen` lo carga desde el archivo |
| Justo después de abrir un libro, las lecturas devuelven `500 operation-failed` durante unos segundos | Repite automáticamente los GET que fallan así, nunca las escrituras |
| Exportar una hoja que no está en pantalla abre un diálogo modal bloqueante (8F2A4D91) | Se niega a exportarla. Usa `workbook ShowSheet` |
| Un diálogo modal deja colgadas las llamadas | `desktop ErrorDialogs` lo lee y lo cierra |
| Hay modales que no son errores: "File Recovery" tras un cierre forzado, "Save changes?", avisos de conexión. También bloquean la API | Mientras dura cada llamada del MCP, un vigilante busca modales en las ventanas de `tableau.exe`, excepto el contenido web de las zonas. Cierra los mensajes de error y avisos, y reporta todo en `desktopModals` para que el agente se lo diga al usuario. Nunca pulsa botones de decisión como Delete u Open. A demanda: `desktop Modals` |
| Ante un 500 de `/image` o `/summaryData` Desktop abre un modal; reintentar abre otro | Esas rutas no se reintentan |
| La API no aplica `<workbook locale>` (los atributos de la raíz) | El idioma se fija en el archivo y se carga con `launch`/`Reopen` |
| El validador de la API es más estricto que el cargador de archivos: rechaza `<manual-sort>`, que los libros de muestra todavía usan, y pide `<sort class="manual">` | `structure.KNOWN_REJECTED`; tableu escribe la forma nueva |
| Las funciones nuevas necesitan su marca en `<document-format-change-manifest>` (ParameterAction, GroupAction, BasicButtonObject…); sin ella el esquema rechaza el elemento | `_ensure_features` |
| Desktop recuerda durante la sesión el nombre interno de las fuentes de datos que dejó de usar (p. ej. tras *Data > Duplicate*, que pasa las hojas a la copia). Un documento que vuelve a traer una fuente con ese nombre falla al aplicarse (`operation-failed`, modal 7195FDCA u 8EAB519C), y cada intento repite el modal. Con un nombre interno nuevo se aplica | `tableu` crea siempre fuentes con nombre aleatorio. Si un apply falla así, no lo reintentes: carga el libro desde archivo con `workbook Reopen` |

## El esquema de Tableau (obtenido por ingeniería inversa)

| Hallazgo | Qué hace tableu |
|---|---|
| Desktop trae sus esquemas dentro de `bin/res/tablangres.rcc`, un recurso Qt: `TQRC_FILEFORMAT_TWB_XSD` (382 KB, 504 elementos), `..._TDS_XSD`, `..._TBM_XSD`, y los de las versiones 10.2 a 10.5 | `xsd.py` los extrae de la instalación local a `~/.tableu/xsd/` sin redistribuirlos. Valida offline cuando Desktop no está abierto. `workbook Schema element=…` da la definición de cualquier componente |
| El XSD es condicional: `<!--?IF Flag -->…<!--?ELSE -->…<!--?END -->` para 91 marcas de funcionalidad. Una marca del `document-format-change-manifest` activa su rama del esquema | Por eso un elemento nuevo necesita su marca en el manifiesto |
| Desktop valida con las marcas aditivas activadas (las de su build) y con las de cambio de formato (`SortTagCleanup`, `MarkTypeAttribute`, `SheetNumTstAddOnly`, `ObjectModelExtractV2`, `ISO8601PeriodTypes`, `ExplainData_AuthorControls`) solo si el libro las declara | `xsd.UPGRADE_FLAGS`. Con esa regla, todos los libros que Desktop acepta validan offline y los que rechaza fallan con el mismo mensaje |
| Con `SortTagCleanup`, Desktop reescribe `<sort class="computed">` como `<computed-sort>` al cargar | Las dos formas valen |

## Qué conserva la API en vivo (medido el 2026-11-05 con 53 componentes)

| Comportamiento | Qué hace tableu |
|---|---|
| Con las marcas del manifiesto declaradas, `POST /v0/workbook/document` conserva los parámetros, las acciones de parámetro y de conjunto, y los botones de navegación | `_ensure_features`. La detección de `applied: "partial"` sigue activa por si acaso |
| El filtro de fuente de datos (`datasource/filter`) se descarta en silencio por la API; desde el archivo se conserva | Hay que cargarlo con `Reopen` o desde el archivo |
| Aplicar por la API un documento que cambia la fuente de datos (filtro de fuente, paleta) puede abrir "Errors occurred while reloading the data source." y bloquear la llamada | `desktop ErrorDialogs` lo cierra; preferible el archivo para cambios de fuente |
| La paleta de colores se guarda en la fuente de datos (`datasource/style/style-rule[@element='mark']/encoding`), no en la hoja. Dentro de la hoja, Desktop la descarta | `format ColorPalette` la escribe en la fuente |

## Carga de archivos

| Comportamiento | Qué hace tableu |
|---|---|
| Un libro sin hojas da "Internal Error 501CF476" | `Preflight` lo detecta antes de abrirlo; `launch` no abre un libro que no cargaría |
| Un filtro categórico `union` vacío da "The filter on X is invalid" | `Preflight`. Un filtro sin valores se escribe como `level-members` (todos) |
| Desktop bloquea el `.hyper` del libro abierto | `CreateExtract` escribe `-2.hyper` |
| Los hijos de `<datasource>`, `<view>`, `<actions>` y `<table>` siguen una secuencia de esquema | `*_ORDER` y el check estructural `STRUCT-ORDER` |

## Maquetación de dashboards

| Comportamiento | Qué hace tableu |
|---|---|
| Desktop recalcula los contenedores de flujo según el contenido e ignora x/y/w/h guardados. Un panel lateral sin fijar ocupa media página | Las filas y los paneles llevan `is-fixed` + `fixed-size`; `AddZone fixed_width/fixed_height` |
| `fixed-size` es el ancho dentro de un flujo horizontal y el alto dentro de uno vertical | `AddZone` valida la dirección |
| Sin `distribute-evenly`, las hojas de una fila no se reparten el ancho | `dashboard Create rows` |
| Sin "Fit: Entire View" (`<zoom type='entire-view'/>`), las tablas de texto y las barras usan un tercio de su celda | Se escribe en cada viewpoint |
| Las tarjetas de filtro conservan `custom-title` + `formatted-text`, pero siguen mostrando el nombre del campo; `show-title='false'` sí oculta el título | `AddZone title=` oculta el título de la tarjeta y pone un texto encima dentro de un contenedor vertical |
| Si los tamaños fijos de un flujo suman más que el flujo, Desktop recorta la última fila | Al meter un elemento fijo (fila del título, barra de filtros), `tableu` recorta la fila fija más alta; `Lint` avisa con `DASH-FIXED-OVERFLOW` |
| Una tarjeta de filtro o leyenda de una hoja que no está en el dashboard se dibuja con su título y sin control (no hay hoja de la que tomar los datos) | `CreateFromLayout` lo rechaza; `Lint` da `DASH-ORPHAN-CARD` |
| Los dashboards de Tableau repiten cuatro distribuciones: KPIs de 117 px + vista + detalle (Superstore Overview), panel derecho de 160 a 192 px (Customers, Shipping, Tourism), barra de filtros de 62 px (Order Details) y cabecera de 71 px con filtros y leyenda (World Indicators Business) | `dashboard CreateFromLayout` (`tableu://layouts`) |

## Joins

| Comportamiento | Qué hace tableu |
|---|---|
| Tableau escribe un join como `<relation type='join' join='left'>` con `<clause type='join'><expression op='='>[A].[col] [B].[col]`, seguido de las dos relaciones; varios joins se anidan por la izquierda (`Local/data/*.tds`) | `datasource CreateFromFiles joins=[...]`; las tablas unidas forman una sola tabla lógica (un `object`) y las columnas repetidas se renombran `Col (Tabla)` |

## La interfaz de Desktop (ingeniería inversa dinámica)

| Comportamiento | Qué hace tableu |
|---|---|
| Los menús de Desktop son accesibles por UI Automation (`MenuBar` > `MenuItem`, Expand/Invoke); un menú abierto y sus submenús cuelgan de la barra de menús en el árbol, no de la raíz del escritorio | `uia.menu_items` / `uia.invoke` |
| Los diálogos de Qt cuelgan de la ventana principal; si no se cierran, los comandos siguientes caen dentro del diálogo | `uia.close_windows` los busca bajo cada ventana y los cierra con la X (cancela) |
| Las pestañas de hoja no tienen nombre para UI Automation y no responden a Invoke ni a Select; un clic enviado como mensaje a la ventana sí las selecciona, sin mover el ratón | `uia.goto_sheet(nombre, índice)`, con el índice en el orden de `<windows>` |
| En la página de fuente de datos el menú Window no lista las hojas | `goto_sheet` vuelve por la pestaña |
| Desktop anota en su log cada comando que ejecuta (`commands-controller.invoke-command`, `args: "tabdoc:…"` / `"tabui:…"`): es el comando interno detrás de cada menú | `scripts/ui_reverse.py` lo registra junto al diff del XML (`tableu://ui-commands`) |
| Tras ciertos fallos (un diálogo de error durante un apply), la instancia deja de aplicar cualquier documento (`operation-failed`, 7195FDCA / E71AE512) hasta reiniciarla | El arnés trabaja en una instancia propia (`--launch`) y se detiene si Desktop deja de aplicar o se cierra |
| Invoke sobre un ítem de la barra de menús deja ese menú expandido; el siguiente clic en el lienzo solo lo cierra | `uia.invoke` pliega los menús al terminar |
| El menú contextual (clic derecho) es una ventana de nivel superior de clase `TableauMenu`; sus submenús son `Menu` bajo el ítem que los abre (Expand). Se cierra con `WindowPattern.Close`, sin teclas | `uia.context_items` / `uia.context_invoke` / `uia.context_close` |
| Invoke sobre un ítem del primer nivel de un menú contextual responde sin ejecutar nada (no aparece comando en el log); un clic enviado a la ventana del menú sobre el ítem sí lo ejecuta. En un submenú es al revés: el clic enviado se ignora e Invoke sí lo ejecuta (Measure > Average escribe `derivation=Avg`) | `context_invoke` hace el clic en el primer nivel e Invoke en los submenús |
| Los diálogos editores de Desktop (Edit Axis, Add Reference Line, Filter...) son páginas web (QtWebEngine): UI Automation lista sus controles y su estado, pero Toggle, Select, Invoke y SetValue no hacen nada. Muchos no tienen OK: aplican cada cambio en el acto y se cierran con la X | `uia.dialog_act` hace un clic enviado a la ventana bajo el control, con el cursor sobre él un instante, y escribe tecla a tecla en los campos; `ui_reverse --dialogs` mide cada control así |
| Un clic enviado a un ítem de menú se pierde si el ratón real está en otro sitio cuando se suelta el botón | `ClickItem` deja el cursor sobre el ítem durante el clic y lo devuelve a su sitio |
| Algunos comandos dejan a Desktop recalculando más tiempo del que espera la API (Change Data Type sobre una fecha): la siguiente llamada da `ReadTimeout`, pero Desktop vuelve a responder solo | `ui_reverse.py` marca el comando como `slow`, espera a que Desktop conteste y sigue; `--redo` no lo repite |
| El panel de datos abre su menú con el botón derecho enviado como mensaje. Los estantes, cabeceras, ejes y la vista eligen el objeto con la posición real del cursor, no con la del mensaje, y necesitan `WM_CONTEXTMENU` | `uia` pone el cursor en el punto durante el clic (~0,3 s) y lo devuelve a su sitio; los clics van solo a la ventana de Desktop |
| Las píldoras y las marcas no existen para UI Automation (se dibujan): la primera píldora está en el borde izquierdo del estante; una marca se encuentra probando puntos de la vista hasta que el menú trae *Keep Only* | `uia.context_targets`, `uia.find_marks`; `scripts/ui_reverse.py --context` |

## Formato

| Comportamiento | Qué hace tableu |
|---|---|
| Los números de las marcas de texto (KPIs, tablas de texto) se pintan con la regla `cell`, no con `label` | `format Font element=label` también aplica `cell` en esas hojas |
| El idioma de los números, la moneda y los meses sale del atributo `<workbook locale='es_ES'>` (así lo traen los libros de muestra localizados); sin él, se usa el idioma del sistema | `workbook Format locale=` |
| Varias medidas en una vista: Measure Names en Columnas, Measure Values en Texto, y un filtro manual más un orden manual sobre `[:Measure Names]`; los alias van en la columna `[:Measure Names]` de la fuente | `worksheet Create measures=` / `worksheet AddMeasureValues` |

## Cómo se mantiene

- `scripts/catalog_samples.py` regenera `xml-catalog.json` con los documentos que instala Desktop y con los
  libros que tableu escribió y Desktop validó y abrió.
- `scripts/coverage_gaps.py` regenera `coverage-gaps.md`, el pool de funciones que faltan.
- `scripts/ui_reverse.py <probe.twb> --build --launch` vuelve a medir los comandos de menú en una instancia
  propia de Desktop y regenera `ui-commands.json` / `ui-commands.md`; con `--context` mide también los menús
  contextuales (mueve el cursor un instante en cada clic derecho).
- Cada comportamiento nuevo que se observe se añade aquí, con su protocolo en tableu y su test.
