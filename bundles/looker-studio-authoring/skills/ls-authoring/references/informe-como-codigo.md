# Informe como código: el spec

Para más de dos o tres cambios, describe el informe en un JSON y deja que `apply_report_spec` lo construya.
El spec se puede revisar antes de tocar nada, se vuelve a aplicar sin duplicar y queda como documentación.
`/ls-sdd` es el flujo completo con aprobación del usuario.

## Flujo

1. **Parte de lo que hay:** `export_report file="informe.json"` (CLI `export -o informe.json`) da páginas,
   componentes, orígenes y campos. Usa sus ids para adoptar componentes existentes.
2. **Escribe el spec** (abajo).
3. **`lint_report_spec spec=...`** (CLI `lint spec.json`) hasta 0 errores. No toca el informe.
4. **`apply_report_spec spec=... dryRun=true`** (CLI `apply spec.json --dry-run`): el plan, componente a
   componente (`create`, `update` o `skip`).
5. **`apply_report_spec spec=...`** sin `dryRun`.
6. **Restos:** `list_orphan_components specs=[...]` (CLI `orphans spec1.json spec2.json`) lista los
   componentes que ningún spec referencia: pruebas viejas o añadidos a mano. No borra nada.

Las rutas de spec y export son `.json` dentro de `LS_WORKSPACE`. Al MCP también se le puede pasar el objeto
spec en lugar de la ruta; entonces no hay `.state.json` y cada aplicación vuelve a crear.

## Formato

```json
{
  "grid": 10, "canvasWidth": 1200, "canvasHeight": 900,
  "defaults": {"dataset": "@ingresos", "padding": 12},
  "themePreset": "marca-azul",
  "pages": [{
    "name": "Resumen",
    "filters": [{"name": "Sin pruebas", "field": "entorno", "op": "EQ", "values": ["test"], "include": false}],
    "components": [
      {"key": "periodo", "type": "simple-daterangepicker", "x": 880, "y": 20, "w": 280, "h": 60, "dateRangeDays": 365},
      {"row": {"y": 100, "h": 120, "margin": 20, "gap": 20},
       "items": [{"key": "kpi_ingresos", "type": "kpi-metric", "metrics": ["SUM(ingresos)"]},
                 {"key": "kpi_pedidos", "type": "kpi-metric", "metrics": ["COUNT_DISTINCT(id_pedido)"]},
                 {"key": "kpi_unidades", "type": "kpi-metric", "metrics": ["SUM(unidades)"]},
                 {"key": "kpi_valoracion", "type": "kpi-metric", "metrics": ["AVG(valoracion)"]}]},
      {"key": "tendencia", "type": "simple-areachart", "x": 20, "y": 240, "w": 740, "h": 300,
       "dimensions": ["fecha"], "metrics": ["SUM(ingresos)"], "slots": {"breakdown": ["canal"]}, "stripStyles": true},
      {"key": "tabla", "id": "cd-j2uffxuy8d", "type": "simple-table", "x": 780, "y": 240, "w": 380, "h": 300,
       "dimensions": ["pais"], "metrics": ["SUM(ingresos)"]}
    ]
  }]
}
```

| Campo | Nivel | Uso |
|---|---|---|
| `grid`, `canvasWidth`, `canvasHeight` | informe | Retícula y lienzo para el lint (por defecto 10, 1200 y 10 000) |
| `defaults.dataset`, `defaults.padding` | informe | Valores para los componentes que no los indican |
| `theme` / `themePreset` | informe | Tema propio, o predefinido o de la biblioteca (`paginas-temas-y-ajustes.md`) |
| `pages[].page` | página | Id de página, o `"active"` |
| `pages[].name` | página | Busca la página por nombre y la crea si no existe |
| `pages[].filters[]` | página | Filtros de página `{name, field, op, values, include, dataset}` (`controles-y-filtros.md`) |
| `key` | componente | Identificador estable del spec. Obligatorio y único |
| `type`, `variant` | componente | Tipo interno y, para controles y opciones del menú, la variante sembrada |
| `x`, `y`, `w`, `h` | componente | Caja en píxeles |
| `id` | componente | Adopta un componente que ya existe en lugar de crear uno |
| `dataset`, `dimensions`, `metrics`, `slots` | componente | Como en `create_component` (`campos.md`) |
| `filters[]` | componente | Filtros del componente |
| `dateRangeDays`, `stripStyles` | componente | Como `patch_component` |
| `text` | componente | Texto de un cuadro de texto: una cadena, o `{text, size, bold, color}` |
| `parameter` | componente | El control fija ese parámetro (id) en vez de filtrar |
| `row` + `items` | macro | Reparte una fila: `w = (ancho − (n−1)·gap) / n`, redondeado a la retícula. `margin`, `gap`, `width`, `x` opcionales |

Ejemplos completos en `looker-studio-mcp/examples/`:
- `resumen.spec.json`: una página;
- `paginas-2-3.spec.json`: dos páginas, 14 componentes, filtros de página y tema;
- `pagina-4-controles.spec.json`: todos los controles;
- `showcase.spec.json`: seis páginas y 49 componentes con títulos, filas de KPIs, variantes, huecos, casilla y
  botón de filtro, y tres orígenes. Es la base del informe de demostración; las combinaciones y los
  parámetros se añaden después con sus herramientas.

**Lo que el spec no hace:** combinaciones (`create_blend`), parámetros (`add_parameter`), campos de origen
(`add_source_field`), mover u ocultar páginas y pasar componentes a nivel de informe. Van después del
`apply`.

## Qué hace apply

- **Copia de seguridad:** antes de tocar nada, exporta el informe completo a `backups/` (o `LS_BACKUP_DIR`).
- **No aplica si el lint tiene errores:** todo sale como `skip`.
- **Tema y páginas primero:** aplica el tema y crea las páginas que faltan por nombre.
- **Informe vacío:** `"@campo"` funciona aunque ningún gráfico use todavía el origen: lo sondea con un
  componente temporal hecho de la plantilla `kpi-metric`.
- **Idempotente:** guarda la relación `key` → `cd-...` en `<spec>.state.json`. Si el componente existe, lo
  actualiza (caja, campos, filtros, ajustes); si no, lo crea. Si el state es de otro informe, lo ignora.
- **Al final:** recarga y diagnostica, y devuelve los problemas con su `fix`.

## Reglas del lint

Vienen de las skills de diseño, KPIs y rendimiento:

| Regla | Severidad | Cuándo |
|---|---|---|
| `key` | error | Falta o se repite |
| `type` | error | Tipo desconocido |
| `canvas` | error | El componente se sale del lienzo |
| `density` | aviso / error | Más de 15 / 25 componentes con datos en una página |
| `grid` | aviso | x, y, w o h no son múltiplos de la retícula |
| `overlap` | aviso | Dos componentes se solapan |
| `kpi` | aviso | Un scorecard con más o menos de una métrica |
| `kpi-row` | aviso | Fila de KPIs con alturas distintas o separaciones irregulares (> 2 px) |
| `dataset` | aviso | Componente con datos sin `dataset` |
| `margin` | nota | Margen exterior < 20 px |
| `padding` | nota | Padding fuera de 10–16 px |
| `kpi` | nota | Scorecard de menos de 100 o más de 140 px de alto |
| `kpi-row` | nota | Fila con menos de 4 o más de 6 tarjetas |
| `date-range` | nota | Control de periodo sin `dateRangeDays` |

El hook de `looker-studio-guardrails` pasa el mismo lint cuando se escribe un `*.spec.json`.
