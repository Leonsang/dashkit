# Arquetipos de dashboard

Elige el arquetipo por **lo que hará el lector** con la página, no por las vistas que tengas. Cada uno
corresponde a una maquetación medida en los dashboards de Tableau (`tableu://layouts`, `dashboard
CreateFromLayout`).

| Arquetipo | El lector... | Layout | Modelo en Tableau |
|---|---|---|---|
| Resumen ejecutivo | Mira en 5 segundos si algo va mal | `overview` | Superstore · Overview |
| Exploración analítica | Cruza filtros y busca la causa | `sidebar` | Superstore · Customers / Shipping |
| Consulta de detalle | Busca un registro o una lista | `filterbar` | Superstore · Order Details |
| Vista protagonista | Lee una sola vista grande (mapa, tendencia) | `header` | World Indicators · Business |
| Relato | Sigue una conclusión paso a paso | historia (`story Create`) | World Indicators (historia) |

## Resumen ejecutivo (`overview`)

- **Arriba:** una tira de 3 a 5 KPIs en una sola hoja (`measures=[...]`), 117 px. Cada KPI con su
  comparación (frente a meta o al periodo anterior) en un calculado o en el tooltip.
- **Centro:** la vista principal, normalmente la tendencia (`MONTH_TRUNC`), con una línea de referencia de
  la meta.
- **Abajo:** 2 vistas de apoyo (ranking por región, por canal) que **filtran** la principal
  (`action Create kind=filter source="*" source_dashboard=...`).
- **Controles:** 1 o 2 filtros junto al título. Nada más.
- **Tamaño:** 1200x800 fijo.

## Exploración analítica (`sidebar`)

- Vistas a la izquierda (2 o 3). A la derecha, una columna de 160-192 px con los filtros (con
  instrucción en el título de la tarjeta) y las leyendas.
- Las acciones de filtro y de resaltado entre vistas son el centro de la página: explícalas en el
  subtítulo.
- Aquí sí caben parámetros (top N, métrica a mostrar) con tarjeta `slider` o `radiolist`.

## Consulta de detalle (`filterbar`)

- **Una tabla de texto o un mapa** a todo el ancho. Encima, una fila de filtros de 62 px.
- Ordena la tabla por la columna que más se consulta; usa totales y bandas.
- Suele ser el destino de una acción `goto` o de un botón `navigation` desde el resumen.

## Vista protagonista (`header`)

- **Cabecera de 71 px:** título, filtros, resaltador y leyenda en una fila. Debajo, la vista que lleva el
  mensaje, a todo el ancho.
- Las vistas de apoyo, si las hay, son pequeñas y van debajo.

## Relato (historia)

- **Abre con la conclusión** si la audiencia tiene poco tiempo.
- **Un punto por idea**, y el pie dice la idea.
- Los puntos cambian un filtro de la misma hoja (`filters` en el punto) en vez de duplicar hojas.
- Tipos de historia: cambio en el tiempo, drill-down, zoom-out, contraste, intersección, factores o
  atípicos (Tableau, "Best Practices for Telling Great Stories").

## Combinaciones

Un libro suele tener un **resumen** (hoja inicial, `workbook SetStartSheet`) y una o dos páginas de
**exploración** o de **detalle**, enlazadas con botones `navigation`. Si el público recorre varios
libros, se ordenan en una colección del sitio (ver SKILL.md, §1).
