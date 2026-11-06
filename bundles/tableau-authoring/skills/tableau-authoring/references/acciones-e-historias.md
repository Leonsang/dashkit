# Acciones e historias

## Acciones (action Create)

| kind | Para qué | Parámetros clave |
|---|---|---|
| `filter` | Al seleccionar en una hoja se filtran otras | `source`, `target` (hoja o dashboard), `fields=[...]` (todos si se omite), `clear=show-all|keep|exclude` |
| `highlight` | Resalta lo mismo en las demás vistas | `source`, `target`, `fields` |
| `url` | Abre una web con valores de la marca | `url="https://.../?r=<Region>"` |
| `parameter` | La selección cambia un parámetro | `parameter`, `source_field`, `aggregation=attr|sum|avg|...` (al deseleccionar se mantiene el valor) |
| `set` | La selección cambia un conjunto | `set_name`, `set_mode=assign|add|remove`, `set_clear=exclude-all` |
| `goto` | Ir a otra hoja | `target` |

- **`activation`:** `on-select` (por defecto), `on-hover` o `on-menu`.
- **`source="*"` con `source_dashboard="Resumen"`:** la acción sale de todas las hojas del dashboard,
  menos las de `exclude_sheets=[...]`. Así lo hace Superstore Overview
  (`<source dashboard=...><exclude-sheet/>`).
- **Grupo oculto de las acciones de filtro:** al ejecutarse, Desktop genera un grupo `[Action (Region)]`
  (`groupfilter function=crossjoin`, `user:auto-column=sheet_link`). No lo escribas tú: es interno.
- **Acciones de parámetro y de conjunto:** necesitan su característica en el manifiesto del libro
  (`ParameterAction`, `GroupAction`). tableu la añade.
- **En vivo:** Desktop descarta las acciones nuevas aunque responde SUCCEEDED. Ver SKILL.md, "Límite de la
  API en vivo".

## Historias

```json
{"name": "Recorrido 2025", "width": 1016, "height": 964, "title": "Cómo cerró 2025",
 "points": [
   {"sheet": "Resumen de ventas", "caption": "Las ventas crecieron un 12 %"},
   {"sheet": "Por región", "caption": "El Norte explica la mitad",
    "filters": [{"field": "Region", "values": ["Norte"]}]},
   {"sheet": "Resumen de ventas", "caption": "Sin el Norte, plano",
    "filters": [{"field": "Region", "values": ["Norte"], "worksheet": "Ventas por mes"}]}]}
```

- **Un punto por idea**, con un pie que diga la conclusión, no el nombre de la hoja.
- **`filters` en un punto:** captura el estado de filtro de ese punto sin duplicar la hoja, como la
  historia de World Indicators (`story-point/capturedDeltas/worksheet/filter`). Si el punto es un
  dashboard, indica `worksheet`.
- **`story AddPoint`:** añade un punto a una historia que ya existe.
- **`format Story`:** fondo y estilo de los pies.
