# Filtros, parámetros, conjuntos y grupos

## Orden en que Tableau aplica los filtros

1. Extract
2. Fuente de datos (`datasource AddFilter`)
3. Contexto (`filter Add context=true`)
4. Conjuntos, top N y condición
5. Dimensiones
6. Medidas
7. Cálculos de tabla

Un top N sin contexto se calcula **antes** que los filtros de dimensión. Si quieres "top 10 de la región
elegida", el filtro de región debe ir en contexto.

## filter Add: una forma por llamada

| Necesidad | Parámetros | XML que escribe |
|---|---|---|
| Miembros | `values=["Norte", "Sur"]` (`exclude=true` para excluirlos) | `filter class=categorical` + `groupfilter function=member|union` (o `except`) |
| Rango de una medida | `min=100 max=5000` | `class=quantitative included-values=in-range` + `<min>`/`<max>` |
| Al menos / como mucho | solo `min` o solo `max` | Igual: `in-range` con un único límite (así lo escribe el diálogo Filter, medido) |
| Incluir nulos | `include_null=true` | `included-values=in-range-or-null` |
| Fecha relativa | `relative={"period": "month", "from": -11, "to": 0}` | `class=relative-date` sobre la fecha continua |
| Top N | `top={"n": 10, "by": "SUM([Importe])", "direction": "top"}` | `groupfilter function=end count=10` |
| Condición | `condition="SUM([Importe]) > 1000"` | `groupfilter function=filter expression=...` |
| Comodín | `wildcard="abc"` | coincidencia de texto |
| Tarjeta interactiva | `show_card=true card_mode=checkdropdown|dropdown|radiolist|checklist|slider|typein|pattern` | `cards/edge/strip/card type=filter` |

Una medida se filtra **agregada** (`SUM(Importe)`). Si filtras `Importe` a secas, se filtra fila a fila.

## Filtros compartidos

`filter AddShared worksheets=["A", "B", "C"] field="Region" values=[...] card_on="A"` pone el mismo
filtro en cada hoja, unidos por un número de `filter-group`. Es lo que Desktop llama "Apply to
Worksheets > Selected Worksheets". La tarjeta en un dashboard cambia todas las hojas.

**Regla de los dashboards:** una tarjeta de filtro o de leyenda debe salir de una hoja que **está en ese
dashboard**. Si no, la tarjeta aparece vacía. `dashboard CreateFromLayout` lo comprueba y `workbook Lint`
lo marca como `DASH-ORPHAN-CARD`.

## Medido en Desktop

En `tableu://ui-commands`:

- **Clic derecho en una marca o cabecera > Keep Only:** `groupfilter function=member` con
  `user:ui-domain=relevant`.
- **Clic derecho > Exclude / Hide:** `function=except`.
- **Píldora > Show Filter:** añade la tarjeta (`cards/edge` con `strip size=160`).
- **Worksheet > Auto Updates > Auto Update Filters (desactivado):** `worksheet@lock-quick-filters=true`.
  tableu no lo escribe.
- **Tarjeta de filtro de medida:** Desktop añade `card@show-domain` y `show-null-ctrls`. Son opcionales.
- **"Only Relevant Values"** (`user:ui-domain=relevant`) obliga a una consulta extra por tarjeta. Evítalo en
  dashboards lentos (`tableu://best-practices`).

## Parámetros

```json
{"name": "Top N", "datatype": "integer", "value": 10, "domain": "range", "min": 5, "max": 50, "step": 5}
```

- `domain`: `any | range (min/max/step) | list (values=[...], aliases={})`.
- En fórmulas se usa como `[Parameters].[Top N]`.
- **Tarjeta en un dashboard:** `dashboard AddZone kind=parameter parameter="Top N" mode=slider|type_in|compact|radiolist`.
- **Acción de parámetro:** `action Create kind=parameter parameter= source_field= aggregation=`. Ver
  `acciones-e-historias.md`.
- **En vivo:** Desktop descarta los parámetros nuevos (ver SKILL.md, "Límite de la API en vivo").

## Conjuntos

- **Miembros:** `set Create datasource field name members=[...]`.
- **Condición:** `set Create ... condition="SUM([Importe]) > 1000"`.
- **Top N:** `set Create ... top=10 by="SUM([Importe])" direction=top`. El diálogo Create Set de
  Desktop añade `groupfilter@units` (medido).
- **En un estante:** `IN_OUT(Conjunto)`.
- **Acción de conjunto:** `action Create kind=set set_name= set_mode=assign|add|remove`.

## Grupos, bins y jerarquías

- **Grupo:** `group Create field="Producto" name="Familia" groups={"Bebidas": ["Café", "Té"]}`. Lo que no
  agrupes conserva su valor. "Include Other" del diálogo escribe `calculation@default`; tableu lo acepta
  pero lo ignora.
- **Bins:** `bin Create field="Importe" size=50` o `size_parameter="Ancho"`.
- **Jerarquía:** `hierarchy Create name="Geografía" fields=["País", "Región", "Ciudad"]`.
- **Carpetas:** `folder Create name="KPIs" fields=[...]` (panel de datos).
