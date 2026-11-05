# Cobertura de Tableau Desktop en tableu

Cada operación está en `<objeto>_operations` (MCP) y en `tableu op <objeto> <operación>` (CLI). Las listas
completas con sus parámetros están en `tableu ops` y en el recurso `tableu://operations`.

Cómo se verificó (Tableau Desktop 2026.3, API 0.1.1):
- **Esquema**: `scripts/coverage_check.py` construye un libro sobre Superstore. Ejecuta 109 pasos y cada uno pasa el validador de esquema de Desktop.
- **Render**: `scripts/verify_all.py` abre el libro en una sola instancia de Desktop, exporta las imágenes y lee los diálogos de error y las advertencias del log de Desktop.
- **Offline**: `tests/test_authoring.py` comprueba el orden de las zonas, los IDs, el layout y la dirección de las table calcs. No necesita Tableau.

Leyenda (revisada 2026-11-04 con Desktop 2026.3): ✅ validado y revisado en el render · ☑️ validado en esquema y cargado sin advertencias, sin revisión visual · ⚠️ con límites · ❌ no soportado por la API 0.1.1 o el esquema de esta versión

## Desktop y configuración
| Elemento | Operación | Estado |
|---|---|---|
| Activar la API (flag ProjectAthena), estado, instancias | `desktop` EnableApi / Status / ListInstances | ✅ |
| Abrir Desktop (con o sin archivo), sin abrir instancias duplicadas | `desktop` Launch | ✅ |
| Diálogos modales de error ("Unable to complete action", "Warning") | `desktop` ErrorDialogs | ✅ |
| Advertencias de carga y de consulta del log de Desktop | `desktop` Warnings | ✅ |
| Preferencias del registro (Settings, Debug, …) | `settings` ListGroups / List / Get / Set / Delete | ☑️ (solo se escriben con Desktop cerrado) |
| Paletas de color personalizadas (Preferences.tps) | `settings` ListPalettes / CreatePalette / DeletePalette | ☑️ (requieren reiniciar Desktop) |

## Libro, transacciones y calidad
| Elemento | Operación | Estado |
|---|---|---|
| Info, XML completo o parcial, validación, aplicación | `workbook` Info / GetXml / Validate / ApplyXml | ✅ |
| Transacciones (muchos cambios, una validación y una aplicación) | `transaction` Begin / Status / Commit / Rollback | ✅ |
| Nuevo libro, guardar como .twb/.twbx, respaldos, restaurar | `workbook` New / SaveAs / ListBackups / Restore | ✅ |
| Linter de buenas prácticas | `workbook` Lint | ✅ |
| Imagen del dashboard visible; datos resumen | `workbook` ExportImage / SummaryData, `export_image` | ✅ La API 0.1.1 solo renderiza lo que está en pantalla: `workbook ShowSheet` (confirm) reabre Desktop en la hoja o dashboard pedido y luego se exporta |
| Hoja inicial, orden de pestañas, formato del libro | `workbook` SetStartSheet / ReorderSheets / Format | ✅ |

## Datos
| Elemento | Operación | Estado |
|---|---|---|
| CSV/TXT/TSV y Excel, varias tablas con relaciones (mezcla de formatos) | `datasource` CreateFromFiles, PreviewFile | ✅ |
| .tds | `datasource` CreateFromTds | ✅ |
| Bases de datos: Postgres, SQL Server, MySQL, Oracle, Redshift, Snowflake, Databricks, Teradata, BigQuery (tabla o SQL personalizado) | `datasource` CreateDatabase | ☑️ (validado en esquema; sin servidor real para probar la conexión) |
| Filtro de fuente de datos, renombrar, borrar, relaciones | `datasource` AddFilter / Rename / Delete / ListRelationships | ✅ |
| Propiedades de campo: caption, rol, tipo, tipo de dato, oculto, formato por defecto, descripción, agregación, rol geográfico | `field` Update | ✅ |
| Alias de miembros | `field` SetAliases | ✅ |
| Campos calculados, LOD, referencias por caption a otros calculados y a parámetros | `calculation` Create / Update / Delete | ✅ |
| Parámetros: rango, lista o cualquier valor | `parameter` Create / Update / Delete | ✅ |
| Grupos | `group` Create | ☑️ |
| Conjuntos: por miembros, por condición o top N; In/Out con `IN_OUT(Set)` | `set` Create | ✅ |
| Bins (histogramas) | `bin` Create | ✅ |
| Jerarquías | `hierarchy` Create | ☑️ |
| Carpetas | `folder` Create | ☑️ |
| Extracts (.hyper) de orígenes CSV/Excel de una tabla | `datasource` CreateExtract | ✅ Escribe el .hyper con la Hyper API de Tableau y el `<extract>` como lo escribe Desktop; carga sin errores, las consultas van al .hyper y desaparece WBO-LIVE. Orígenes de varias tablas: Data > Extract en Desktop |

## Hojas
| Elemento | Operación | Estado |
|---|---|---|
| Hoja completa en una sola llamada: filas, columnas, páginas, marca, color, tamaño, etiqueta, detalle, tooltip, forma, ruta, ángulo | `worksheet` Create | ✅ |
| Tipos de marca: barra, línea, área, texto, círculo, forma, pastel, Gantt, polígono, densidad, mapa | `worksheet` Create / SetMark | ✅ |
| Mapas rellenos con mapa base (Lat/Long generadas) | `worksheet` MakeMap o `mark="map"` | ✅ |
| Table calcs rápidos: RUNNING_SUM, PCT_TOTAL, RANK, DIFF, PCT_DIFF, MOVING_AVG (dirección automática) | specs de campo + `worksheet` OrientTableCalcs | ✅ |
| Orden calculado, alfabético o manual | `worksheet` SetSort | ✅ |
| Totales generales y subtotales | `worksheet` SetTotals | ✅ |
| Doble eje (p. ej. barra + línea) y eje compartido (Measure Values) | `worksheet` SetDualAxis / SetSharedAxis | ✅ |
| Duplicar, renombrar, borrar, ocultar | `worksheet` Duplicate / Rename / Delete / SetVisibility | ✅ |
| Tarjetas de filtro, parámetro y leyenda | `worksheet` AddCard | ✅ |
| Filtros: valores (incluir/excluir), rango de medida o fecha, fecha relativa, top N, condición, comodín, contexto, partes de fecha discretas | `filter` Add / Remove / List | ✅ |
| Líneas de referencia (promedio, mediana, constante…), líneas de tendencia (lineal, log, exponencial, polinómica, potencia), pronóstico | `analytics` | ✅ (el largo del pronóstico es automático) |
| Formato de marcas: color, tamaño, opacidad, borde, etiquetas (fuente, color, negrita) | `format` Marks / MarkBorder / Font (element=label) | ✅ |
| Colores: paleta por miembro o por nombre; paletas personalizadas | `format` ColorPalette, `settings` CreatePalette | ✅ |
| **Fondos**: hoja, panel, encabezados, título de hoja, tarjetas de leyenda, filtro, parámetro y highlighter | `format` Backgrounds | ✅ |
| **Fondos de dashboard**: dashboard, contenedores, zonas (con borde y padding), texto | `format` Dashboard / Container / Zone | ✅ |
| Fondo y pies de historias | `format` Story | ☑️ (la API 0.1.1 no exporta historias) |
| Bandas de filas y columnas (shading) | `format` Banding | ✅ |
| Bordes de celda, panel y encabezado (también en totales) | `format` Borders | ✅ |
| Líneas: cuadrícula, cero, divisores (color, grosor, patrón, visibilidad) | `format` Lines | ✅ |
| Fuentes por elemento: libro, hoja, celdas, encabezados, etiquetas de campo, ejes, títulos de eje, leyendas, título del dashboard | `format` Font / Workbook | ✅ |
| Texto enriquecido (fuente, tamaño, color, negrita, itálica, alineación) en títulos de hoja y de dashboard y en zonas de texto | `format` TextRuns, `dashboard` AddZone | ✅ |
| Formato numérico, título y rango de eje, ocultar encabezados, título de leyenda | `format` Field | ✅ |
| Estilo de líneas de referencia (color, grosor, patrón, relleno arriba y abajo) | `format` ReferenceLine | ✅ |
| Título y tooltip personalizados | `format` Title / Tooltip | ✅ |
| Cualquier otro ajuste del panel Format | `format` Style (lista de elementos con `format` Elements) | ☑️ (el validador comprueba elementos y atributos) |

## Dashboards, acciones e historias
| Elemento | Operación | Estado |
|---|---|---|
| Dashboard de tamaño fijo, por rango o automático | `dashboard` Create / SetSize | ✅ |
| Zonas: hoja, texto, título, imagen, web, blanco, contenedor, tarjeta de filtro, leyenda (color, tamaño, forma), control de parámetro, highlighter; en mosaico (con panel lateral automático) o flotantes | `dashboard` AddZone / RemoveZone / ListZones | ✅ (la página web no se ve en la imagen exportada) |
| Formato de zona (fondo, borde, márgenes) y del dashboard | `format` Zone / Dashboard | ✅ |
| Layout de teléfono o tablet | `dashboard` AddDeviceLayout | ☑️ |
| Acciones de filtro (todos los campos o campos concretos), highlight, URL e ir a hoja | `action` Create / Delete / List | ☑️ (se cargan sin advertencias; no se probaron con clics) |
| Acciones de parámetro y de conjunto | `action` Create kind=parameter / set | ✅ Necesitan su entrada en `document-format-change-manifest` (`ParameterAction`, `GroupAction`…), que tableu añade; validadas y cargadas en Desktop. En vivo, ver «Límites de la API» |
| Botones de navegación | `dashboard` AddZone kind=navigation (target_sheet, text) | ✅ Zona `dashboard-object` con `tabdoc:goto-sheet` al `simple-id` de la ventana destino; validado, cargado y renderizado |
| Historias y puntos de historia | `story` Create / AddPoint / Delete | ☑️ (la API 0.1.1 no exporta imágenes de historias) |

## Siempre disponible
Lo que un elemento de Tableau guarde en el XML del libro también se puede editar a mano. Se lee con `workbook` GetXml y
se aplica con `workbook` ApplyXml, que valida antes y hace un respaldo.

## Límites de la API 0.1.1 que hay que conocer
- Solo se exporta en imagen la hoja o el dashboard que está en pantalla. Pedir otra hoja abre un diálogo modal (8F2A4D91).
- Al aplicar un documento:
  - debe haber al menos una hoja (A17E0B01);
  - reemplazar un libro grande sobre sí mismo a veces termina en "Internal Error". Para reconstrucciones grandes es mejor abrir el archivo con `desktop` Launch.
- No hay deshacer. tableu guarda un respaldo antes de cada cambio en vivo.
- Hay que abrir una sola instancia de Desktop a la vez. Launch no abre otra si ya hay una corriendo.
- **Lo que la API en vivo no añade.** Un documento aplicado en vivo conserva los cambios dentro de hojas, dashboards y campos, pero Desktop descarta en silencio los **parámetros, acciones y botones nuevos**, aunque responde SUCCEEDED. tableu lo detecta después de aplicar y devuelve `applied: "partial"` con `dropped` y un `pending`. `workbook Reopen` (con confirm=true) respalda el archivo del libro, escribe en él el XML pendiente y reabre Desktop sobre él, igual que cuando Desktop carga sus propios archivos. Sobre un `.twb`/`.twbx` todo se aplica directamente.
- Las acciones van en orden dentro de `<actions>`: primero las acciones normales, después `datasources`, luego las de conjunto y al final las de parámetro. tableu lo mantiene; si no, el validador rechaza incluso una acción de filtro en libros que ya tenían acciones.

