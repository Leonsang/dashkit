# tableu-mcp

Con `tableu-mcp`, un agente de código (o una persona desde la terminal) puede gestionar **Tableau Desktop** de punta a punta:
- conexiones (archivos, `.tds`, bases de datos);
- el modelo de datos: campos, calculados, parámetros, conjuntos, grupos, bins, jerarquías y carpetas;
- hojas, filtros, analítica y formato;
- dashboards, acciones e historias;
- la configuración de Desktop.

Todo se valida con el propio Tableau y se revisa contra las buenas prácticas oficiales.

Funciona sobre la **External Client API** de Tableau Desktop 2026.3. Es una API local que viene oculta detrás del flag `ProjectAthena`. El diseño de las herramientas sigue el de [microsoft/powerbi-modeling-mcp](https://github.com/microsoft/powerbi-modeling-mcp): una herramienta por tipo de objeto, operaciones por nombre, ejecución en bloque y transacciones.

## Herramientas MCP (21)
| Herramienta | Qué cubre |
|---|---|
| `desktop_operations` | Activar la API, abrir Desktop (nunca dos instancias), leer y cerrar diálogos de error, advertencias del log |
| `settings_operations` | Preferencias del registro, paletas de color personalizadas, carpeta del repositorio |
| `transaction_operations` | Begin / Status / Commit / Rollback: muchos cambios con una sola validación y una sola aplicación |
| `workbook_operations` | Info, XML, validar y aplicar, guardar como, linter, imagen, datos, respaldos, hoja inicial, formato |
| `datasource_operations` | CSV/Excel con relaciones, `.tds`, bases de datos (Postgres, SQL Server, Snowflake…), filtros de fuente, extracts `.hyper` |
| `field_` · `calculation_` · `parameter_` · `group_` · `set_` · `bin_` · `hierarchy_` · `folder_operations` | Modelo de datos |
| `worksheet_operations` | Hojas: estantes, marcas, codificaciones, orden, totales, doble eje, eje compartido, mapas, páginas, table calcs |
| `filter_operations` | Valores, rangos, fechas relativas, top N, condición, comodín, contexto, tarjetas |
| `analytics_operations` | Líneas de referencia, de tendencia y pronósticos |
| `format_operations` | Marcas, colores y paletas, fuentes, cuadrícula, formatos numéricos, ejes, títulos, tooltips, zonas |
| `dashboard_operations` | Dashboards, zonas (en mosaico con panel lateral automático, o flotantes), botones de navegación, layouts de dispositivo |
| `action_operations` · `story_operations` | Acciones de filtro, highlight, URL, ir a hoja, parámetro y conjunto; historias |
| `export_image` | Devuelve la imagen del dashboard para que el agente la vea |

Cada herramienta recibe `operation`, `params` (una llamada) o `definitions` (en bloque), `target`, `dry_run` y `out`. Con `operation="Help"` lista sus operaciones. Recursos: `tableu://best-practices`, `tableu://coverage` (qué está cubierto y cómo se verificó) y `tableu://operations`. Prompt: `build_dashboard`.

## Instalación
```powershell
uv sync
uv run tableu enable      # activa el flag ProjectAthena (HKCU\...\Debug\FeatureOverrideOn)
uv run tableu launch      # abre Tableau (se niega si ya hay uno abierto)
uv run tableu status
```
El plugin de Claude Code `tableau-authoring` registra el servidor `tableu` en `../.mcp.json`; `/setup` hace estos tres pasos.

## CLI
```powershell
tableu ops                 # todos los objetos y operaciones
tableu ops filter          # operaciones de un objeto, con sus parámetros
tableu op transaction Begin -t out/x.twb
tableu op datasource CreateFromFiles -t out/x.twb --params '{"sources": ["Ventas=data/demo/ventas.csv", "data/demo/catalogo.xlsx#Productos"], "relationships": ["Ventas.ProductoID = Productos.ProductoID"]}'
tableu op worksheet Create -t out/x.twb --params '{"name": "Ventas por categoría", "datasource": "Ventas + Productos", "rows": ["Categoria"], "cols": ["SUM(PrecioUnitario)"], "mark": "bar"}'
tableu op transaction Commit -t out/x.twb
tableu op workbook Lint -t out/x.twb
```
`-t` acepta `live` (el libro abierto en Tableau), `live:<pid>` o la ruta de un `.twb`/`.twbx`. `--defs '[{...}, {...}]'` ejecuta en bloque. `--params @archivo.json` lee los parámetros de un archivo. Los comandos anteriores (`info`, `add-sheet`, `lint`, `image`, …) siguen funcionando.

Especificaciones de campo: `Region`, `SUM(Sales)`, `AVG|MIN|MAX|COUNT|COUNTD|MEDIAN|ATTR(...)`, `YEAR|QUARTER|MONTH|WEEK|DAY(Fecha)`, `MONTH_TRUNC(Fecha)`, el caption de un calculado, `IN_OUT(Conjunto)`, y table calcs sobre un agregado: `RUNNING_SUM|PCT_TOTAL|RANK|DIFF|PCT_DIFF|MOVING_AVG(SUM(Sales))`.

## Seguridad del flujo
- **Antes de cada cambio en vivo:** se valida con el validador de esquema de Desktop y se respalda en `~/.tableu/backups`.
- **Transacciones:** juntan todos los cambios y los aplican una sola vez, lo que hace el proceso más rápido y estable.
- **Errores de Tableau:** cuando Desktop muestra un diálogo modal de error, tableu lo lee, lo cierra y devuelve el mensaje. Las advertencias que solo quedan en el log de Desktop salen con `desktop_operations Warnings`.
- **Instancias:** `Launch` no abre una segunda instancia de Desktop.
- **Lo que la API en vivo descarta** (parámetros, acciones y botones nuevos): tableu lo detecta y devuelve `applied: "partial"` con un XML `pending`; `workbook Reopen` lo carga desde el archivo, después de respaldarlo.

## Verificación
```powershell
uv run pytest                                   # 23 pruebas sin Tableau
uv run python scripts/probe_mcp.py              # flujo completo por MCP sobre un .twb (sin Tableau)
uv run python scripts/verify_all.py             # una sola instancia de Desktop: valida 109 pasos y renderiza todas las hojas
uv run python scripts/verify_all.py --show Overview
uv run python scripts/format_check.py           # libro de formato: fondos, bandas, bordes, líneas, fuentes
uv run python scripts/check_workbook.py out/format_check.twb Formato   # una instancia: valida, renderiza y cierra
```
Datos de ejemplo inventados: `uv run python scripts/make_demo_data.py` (Café Montaña: 2 CSV y 1 Excel); dashboard de punta a punta: `uv run python scripts/demo_cafe.py`.

La cobertura completa, con cómo se verificó cada cosa y los límites de la API en vivo, está en [src/tableu_mcp/docs/coverage.md](src/tableu_mcp/docs/coverage.md).
