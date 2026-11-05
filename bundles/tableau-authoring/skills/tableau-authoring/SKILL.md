---
name: tableau-authoring
description: >-
  Crear y modificar libros de Tableau Desktop 2026.3 con el servidor MCP `tableu`
  (External Client API, flag ProjectAthena) o su CLI: fuentes de datos, campos,
  calculados, parámetros, conjuntos, hojas, filtros, formato, dashboards,
  acciones, historias y extracts, validados por el propio Tableau y revisados
  con el linter de buenas prácticas. Úsala para cualquier tarea sobre un .twb,
  un .twbx o el libro abierto en Tableau Desktop. Triggers: "Tableau",
  "dashboard de Tableau", ".twb", "Tableau Desktop", "workbook de Tableau",
  "calculated field Tableau", "parameter action", "extract hyper".
---

# Tableau con `tableu`

El servidor MCP `tableu` tiene una herramienta por tipo de objeto
(`<objeto>_operations`). Cada herramienta recibe `operation`, `params` (una
llamada) o `definitions` (en bloque), `target`, `dry_run` y `out`. Con
`operation="Help"` lista sus operaciones y parámetros. Lee
`tableu://best-practices` y `tableu://coverage` antes de diseñar.

## Antes de empezar

1. `desktop_operations Status`. Si la API está apagada, ejecuta `/setup` o
   `desktop_operations EnableApi` y después `Launch`. Nunca abras una segunda
   instancia de Desktop.
2. `target`:
   - `live` es el libro abierto en Desktop: se valida y se respalda antes de
     cada cambio.
   - Una ruta a `.twb` o `.twbx` funciona sin Desktop.
   - Con Desktop abierto, los archivos también se validan con su esquema.
3. `workbook_operations Info` y `field_operations List`: trabaja con los
   nombres reales, no con los que supones.

## Flujo de construcción

1. `transaction_operations Begin`: agrupa los cambios, que se validan y se
   aplican una sola vez. Es más rápido y más estable que aplicar cada cambio
   por separado.
2. En este orden, cada paso sobre lo anterior: datasource → calculation /
   parameter / set / group / bin → worksheet (con filtros, orden y etiquetas
   en la misma llamada) → format → dashboard (+ `AddZone`) → action → story.
3. `transaction_operations Commit`.
4. `export_image` del dashboard: **mira** el resultado, no lo supongas.
5. `workbook_operations Lint`. Corrige los avisos hasta llegar a 90 o más.
6. Si algo se rompe, `workbook_operations ListBackups` y `Restore`.

## Especificaciones de campo

`Region` · `SUM(Sales)` · `AVG|MIN|MAX|COUNT|COUNTD|MEDIAN|ATTR(...)` ·
`YEAR|QUARTER|MONTH|WEEK|DAY(Fecha)` (partes discretas) · `MONTH_TRUNC(Fecha)`
(fecha continua, para tendencias) · el caption de un calculado ·
`IN_OUT(Conjunto)` · table calcs sobre un agregado:
`RUNNING_SUM|PCT_TOTAL|RANK|DIFF|PCT_DIFF|MOVING_AVG(SUM(Sales))`, con la
dirección orientada automáticamente.

## Reglas de diseño (resumen de `tableu://best-practices`)

- **Una vista, una pregunta:**
  - comparación: barras ordenadas;
  - tiempo: línea con `MONTH_TRUNC`;
  - parte del todo: barras apiladas (pastel solo con 2 o 3 partes);
  - correlación: dispersión;
  - geografía: mapa de símbolos para totales y relleno para tasas.
- **Dashboards:** dos o tres vistas, tamaño **fijo**, la vista clave arriba a
  la izquierda, título y subtítulo que explique la interacción.
- **Títulos:** descriptivos, nunca de una palabra ni en MAYÚSCULAS. Renombra
  "Sheet 1".
- **Color:** no confíes solo en él (formas o etiquetas en líneas); paleta apta
  para daltonismo y pocos acentos.
- **Rendimiento:**
  - extract antes que conexión en vivo (`datasource CreateExtract`);
  - relaciones antes que blending;
  - pocos filtros y sin "Only Relevant Values";
  - COUNTD y LOD con moderación.

## Qué hace cada operación que no es obvia

| Necesidad | Operación | Nota |
|---|---|---|
| Extract `.hyper` | `datasource CreateExtract` | Orígenes CSV/Excel de una tabla. Usa la Hyper API de Tableau y deja la conexión viva para refrescar después. Si hay varias tablas: Data > Extract en Desktop |
| Acción de parámetro | `action Create kind=parameter` (`parameter`, `source_field`, `aggregation`) | Añade `ParameterAction` al manifiesto del libro; sin eso el esquema la rechaza |
| Acción de conjunto | `action Create kind=set` (`set_name`, `set_mode` assign/add/remove) | Igual, con `GroupAction` |
| Botón de navegación | `dashboard AddZone kind=navigation` (`target_sheet`, `text`) | Necesita que la hoja destino tenga ventana (que se haya abierto alguna vez en Desktop) |
| Exportar otra hoja | `workbook ShowSheet` (`confirm=true`) y después `export_image` | La API solo renderiza lo que está en pantalla. ShowSheet reabre Desktop en esa hoja |

## Límite de la API en vivo y cómo se resuelve

En `target=live`, Desktop aplica los cambios dentro de hojas, dashboards y
campos, pero **descarta en silencio los parámetros, acciones y botones
nuevos**, aunque responde SUCCEEDED. `tableu` lo detecta y contesta
`applied: "partial"` con `dropped` y un `pending`. Para cargarlo:

1. Di al usuario qué se perdió (`dropped`) y que el siguiente paso **cierra
   Desktop y lo reabre**.
2. Con su visto bueno: `workbook_operations Reopen` con `pending=<ruta>` y
   `confirm=true`. Respalda el archivo del libro, escribe en él el XML y
   reabre Desktop sobre él.
3. Comprueba con `desktop_operations ErrorDialogs` y `Warnings`.

Si el libro nunca se guardó, Reopen no tiene ruta: pide que lo guarden en
Desktop primero, o trabaja sobre un archivo.

## Errores

- **Una llamada en vivo que se cuelga** suele ser un diálogo modal:
  `desktop_operations ErrorDialogs` lo lee y lo cierra.
- **Problemas de carga o de consulta** que no muestran diálogo:
  `desktop_operations Warnings`.
- **El código `8F2A4D91`** aparece al exportar una hoja que no está en
  pantalla; usa `workbook ShowSheet`.

## CLI equivalente

```
tableu ops [objeto]
tableu op <objeto> <operación> -t live|archivo.twb --params '{...}'
tableu lint -t archivo.twb
```
