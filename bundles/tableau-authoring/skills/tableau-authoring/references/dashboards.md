# Dashboards

## Empieza por una maquetación de Tableau

`dashboard CreateFromLayout` reparte el espacio como los dashboards que trae Desktop 2026.3. Las medidas
salen de esos libros (`tableu://layouts`):

| layout | Sale de | Forma | Úsalo para |
|---|---|---|---|
| `overview` | Superstore · Overview | Tira de KPIs fija de 117 px arriba, la vista principal (55 %) y una fila de vistas de detalle. Controles junto al título | Página resumen |
| `sidebar` | Superstore · Customers, Shipping; World Indicators · Tourism | Vistas a la izquierda y columna de filtros y leyendas fija (160-192 px) a la derecha | Exploración con muchos filtros a la vista |
| `filterbar` | Superstore · Order Details | Fila de filtros fija de 62 px bajo el título y una vista grande debajo | Una tabla o un mapa de detalle |
| `header` | World Indicators · Business | Barra de cabecera de 71 px (título, filtros, resaltador, leyenda), luego las vistas | Una vista protagonista, todo el ancho para ella |

```json
{"name": "Resumen de ventas", "layout": "overview",
 "kpis": ["KPIs"], "main": ["Ventas por mes"], "details": ["Por región", "Por canal"],
 "filters": [{"sheet": "Ventas por mes", "field": "Region", "mode": "checkdropdown", "title": "Elige una región"}],
 "legends": [{"sheet": "Por canal", "field": "Canal", "kind": "color"}],
 "width": 1200, "height": 800}
```

Las tarjetas de `filters` y `legends` deben salir de una hoja que esté en el dashboard (`kpis`, `main` o
`details`). Si no, tableu falla con un mensaje claro: Desktop dibujaría una tarjeta con título y sin
control.

## Crear a mano

- **`dashboard Create`:**
  - `sheets=[...]` con `layout=grid|vertical|horizontal`;
  - o por filas: `rows=[["KPIs"], ["A", "B"], ["C"]]` con `heights=[15, 45, 40]` (porcentajes).
- **`dashboard SetSize`:** `mode=fixed` (recomendado), `range` o `automatic`. Un tamaño fijo se ve igual
  en Desktop y en Server.
- **`dashboard AddZone kind=`:**
  - `sheet`, `text`, `image` (image=ruta), `web` (url), `blank` y `title`;
  - `container` (`mode=horizontal|vertical`);
  - `filter` (sheet + field, `mode=checkdropdown|dropdown|slider|...`);
  - `legend-color`, `legend-size` y `legend-shape` (sheet + field);
  - `parameter` (`mode=slider|type_in|compact|radiolist`);
  - `highlighter` (sheet + field);
  - `navigation` (`target_sheet`, `text`): botón de ir a otra hoja, que debe tener ventana.
- **Dónde va una zona:**
  - `container=<id>|title|row:N` y `position=N`. `title` pone la zona en la fila del título, para
    controles al lado. `row:N` es la fila N, empezando en 1.
  - `fixed_width` / `fixed_height` fijan el tamaño en píxeles. El ancho necesita un contenedor
    horizontal y el alto uno vertical.
  - `floating=true x y w h` flota encima. Úsalo poco: rompe al cambiar de tamaño.
- **`title`:** título propio de una tarjeta de filtro, parámetro o leyenda ("Elige un canal").
- **Otras operaciones:** `ListZones` (ids y geometría), `RemoveZone` y `AddDeviceLayout device=phone`
  (apila las hojas para móvil).
- **Formato:** `format Dashboard`, `format Zone` (fondo, borde, margen, padding, `show_title`) y
  `format Container`.

## Lint del espacio

`workbook Lint` revisa la geometría que calcula Desktop:

| Regla | Qué detecta | Cómo se arregla |
|---|---|---|
| `DASH-SMALL-VIEW` | Una vista de menos de 220x140 px, o una tira de KPIs de menos de 50 px | Menos vistas, o `fixed_height` en la tira |
| `DASH-FIXED-OVERFLOW` (error) | Los tamaños fijos suman más que el dashboard | Bajar `fixed_width`/`fixed_height` o agrandar con `SetSize` |
| `DASH-NARROW-TABLE` | Una tabla de texto estrecha | Layout `filterbar` |
| `DASH-NUM-VIEWS` | Más de 3 vistas (info); más de 6, aviso | Partir en dos dashboards o en una historia |
| `DASH-ORPHAN-CARD` (error) | Una tarjeta de una hoja que no está en el dashboard | Tarjeta de una hoja del dashboard |

## Medido en Desktop

- **Clic derecho en la pestaña > New Dashboard:** Desktop añade
  `dashboard@enable-sort-zone-taborder` y un `devicelayout auto-generated`. Son opcionales.
- **Dashboard > Show Grid:** `window/grid@grid-overlay-mode`. Es de la interfaz, no del diseño.
- **Dashboard > Auto Update:** `dashboard@lock-updates`. No lo uses salvo en dashboards muy lentos.

## Después de construir

Exporta la imagen (`workbook ExportImage sheet=<dashboard>`) y **mírala**. La API solo dibuja lo que
está en pantalla; para otro dashboard, `workbook ShowSheet` primero (cierra y reabre Desktop: pide
permiso).
