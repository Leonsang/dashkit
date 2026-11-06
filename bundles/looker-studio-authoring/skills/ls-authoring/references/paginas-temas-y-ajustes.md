# Páginas, temas y ajustes del informe

## Páginas

| Qué | MCP | CLI |
|---|---|---|
| Listar (id, nombre, número de componentes) | `list_pages` | `pages` |
| Añadir una página vacía | `add_page name="Producto"` | `pages add "Producto"` |
| Renombrar (modelo y navegación visible) | `rename_page pageId name` | `pages rename <id> "Resumen"` |

- `add_page` inserta la página **detrás de la actual**, no al final. Identifícala por el id que devuelve, no
  por su posición. Recarga (`reload_report`) para verla.
- `rename_page` usa el flujo *Gestionar páginas > Cambiar nombre* del editor, porque el nombre de la
  navegación se guarda aparte del modelo.
- En un spec, `pages[].name` busca la página por nombre y la crea si no existe.
- **No hay herramienta** para borrar, duplicar ni reordenar páginas: hazlo a mano en *Gestionar páginas*.

## Temas

El tema manda sobre el estilo de todos los componentes: define colores y fuentes en él y no por componente
(`ls-diseno-layout` §6).

| Qué | MCP | CLI |
|---|---|---|
| Leer el tema actual | `get_theme` | `theme` / `theme export f.json` |
| Tema propio | `apply_theme theme={...}` | `theme set f.json` / `theme import f.json` |
| Predefinidos y biblioteca | `list_theme_presets` | `theme presets` |
| Aplicar uno de ellos | `use_theme theme="Cosecha"` | `theme use Cosecha` |

**Tema propio** (`apply_theme`, o `theme` en el spec). Se fusiona sobre un tema base capturado de un informe
real y se guarda como tema personalizado del informe:

```json
{"font": "Roboto", "text": "#202124", "header": "#202124", "fill": "#ffffff", "accent": "#1a73e8",
 "accentText": "#ffffff", "background": "transparent", "grid": "#e8eaed", "increase": "#188038",
 "decrease": "#d93025", "border": "#dadce0", "borderWeight": 1, "borderRadius": 8,
 "series": ["#0072B2", "#B35900", "#007A5A", "#AD4E8A", "#6B5B00", "#5E5E5E", "#000000", "#C1440E"]}
```

Es `examples/tema-marca.json`. `increase` y `decrease` son los colores de subida y bajada de los scorecards.

**Predefinidos:** los 27 del editor, por id o por nombre (Cosecha = `t-harvest`, Eucalipto =
`t-eucalyptus`, Pop = `t-pop`, Niebla = `t-fog`...). `audit_ux` no puede comprobar sus colores y lo avisa:
para controlar marca y contraste, aplica un tema propio.

**Biblioteca** (`themes/library/`): `marca-azul`, `oscuro-accesible`, `alto-contraste` y
`calido-editorial`. Los cuatro sacan 100 en `audit_ux`. Úsalos como punto de partida.

**Después de crear desde plantillas** de otros informes, los componentes traen estilos propios: quítalos con
`patch_component stripThemeStyles=true` (o `stripStyles` en el spec).

## Auditoría UX: audit_ux

CLI: `ux`. Puntúa de 0 a 100: resta 15 por error, 5 por aviso y 1 por nota.

| Área | Qué mira | Regla |
|---|---|---|
| Contraste | Texto, acento y cabeceras del tema sobre su fondo, y colores de texto sobrescritos en componentes (≥ 4,5:1) | WCAG 1.4.3 |
| Paleta | Cada serie sobre el fondo (≥ 3:1) y series casi iguales | WCAG 1.4.11, `ls-diseno-layout` §7 |
| Tema | Componentes que sobrescriben el tema; tema predefinido sin personalizar | `ls-diseno-layout` §6 |
| Tipografía | Más de dos familias | `ls-diseno-layout` §8 |
| Layout | Los problemas de `diagnose_report` (fuera del lienzo, fuera de la retícula, demasiados gráficos) | `ls-diseno-layout` §2, §3, §5 |

Corrige hasta 90 o más antes de entregar.

## Ajustes del informe: report_settings

Sin `patch` solo lee. CLI: `report settings [--viewer-filter-bar on|off] [--cross-filter on|off] [--set
clave=valor,...]`.

| Clave | Qué es |
|---|---|
| `viewerFilterBar` | Barra de filtros de lectores (`true`/`false`) |
| `crossFilterByDefault` | Filtro cruzado activo en los gráficos nuevos |
| `viewModeNav` | Navegación en modo vista, p. ej. `nav-top` |
| `viewModeHeader` | Cabecera en modo vista |
| `viewModeScale` | Escala en modo vista, p. ej. `scale-fit` |
| `viewModeMargin`, `viewModeMaxWidth` | Margen y ancho máximo en modo vista |
| `snapMode` | Ajuste a la retícula o a las guías |
| `showNavigationInEditMode`, `showNavigationInEmbeddingMode` | Navegación al editar y al incrustar |
| `width`, `height` | Tamaño del lienzo del informe |

Una clave desconocida devuelve error con la lista de válidas. Lee primero para ver los valores actuales:
los valores de `viewModeNav`, `viewModeHeader` y `viewModeScale` son los internos del editor.
