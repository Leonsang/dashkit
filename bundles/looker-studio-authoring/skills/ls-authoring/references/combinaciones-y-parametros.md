# Combinaciones (blends) y parámetros

Las reglas de cuándo combinar y cuándo usar un parámetro están en `ls-modelo-datos` (§6 y §7). Aquí, cómo se
hacen con las herramientas. Todo lo de esta página se verificó en un informe de prueba el 2026-11-06.

## Combinar orígenes: create_blend

```json
{"tables": [
   {"dataset": "@ingresos", "dimensions": ["anio_mes", "pais"], "metrics": ["SUM(ingresos)"]},
   {"dataset": "@objetivo_ingresos", "dimensions": ["anio_mes", "pais"], "metrics": ["SUM(objetivo_ingresos)"]}],
 "box": {"x": 20, "y": 100, "width": 740, "height": 300},
 "name": "Ventas frente a objetivo", "joinType": "left", "type": "simple-combochart",
 "dimensions": ["anio_mes"], "metrics": ["SUM(ingresos)", "SUM(objetivo_ingresos)"]}
```

CLI: `blends create blend.json` (el mismo objeto, en un archivo o en línea).

Hace lo mismo que una persona en el editor: crea un gráfico temporal por tabla con sus campos, los
selecciona, pulsa **Combinar datos** en el menú contextual, borra los temporales, nombra la combinación,
fija el tipo de unión y coloca y vincula el gráfico nuevo. Tarda unos 20 segundos.

- **Tablas:** de 2 a 5. `dataset` es un id de origen o `"@campo"`.
- **Claves de unión:** las dimensiones que se llaman igual en todas las tablas. Sin ninguna en común, el
  editor no puede unirlas y la herramienta da error. Para unir por campos de nombre distinto, crea antes un
  campo calculado de origen con el mismo nombre (`add_source_field`).
- **`joinType`:** `left` (el del editor), `inner`, `right`, `full` o `cross`. Se aplica a todas las uniones.
- **`type`:** el tipo del gráfico combinado (por defecto `simple-table`). Los temporales se crean de ese
  tipo, y el editor da al combinado el mismo.
- **`dimensions` y `metrics`:** campos de la combinación, por su nombre (`ingresos`, `objetivo_ingresos`).
  Si no se indican, el editor deja una vinculación propia que casi nunca sirve: indícalos siempre. El editor
  termina de configurar el gráfico combinado después de crearlo y puede pisar una vinculación hecha
  demasiado pronto; la herramienta espera, vincula, recarga y vuelve a vincular si hace falta.
- **Calculados sobre la combinación:** las fórmulas de gráfico funcionan:
  `"=SUM(ingresos) / SUM(objetivo_ingresos)::PERCENT as Cumplimiento"`.
- **Métricas de un origen:** en la combinación pasan a ser dimensiones numéricas. Agrégalas otra vez en el
  gráfico (`SUM(...)`).

### Ver y cambiar: list_blends, update_blend

- **`list_blends`** (CLI `blends`): cada combinación con su id (`dataViewResource...`), nombre, orígenes,
  uniones (tipo y claves por nombre), campos y los gráficos que la usan.
- **`update_blend blendId name joinType`** (CLI `blends update <id> --name N --join inner`): renombra y cambia
  el tipo de unión. Con `inner` se quedan solo las filas que existen en todas las tablas.

- **`delete_blend blendId`** (CLI `blends delete <id>`): borra una combinación que ningún gráfico usa. Pide
  `LS_ALLOW_DELETE=1` y confirmación del usuario.

**No se puede (todavía):** añadir o quitar tablas de una combinación existente, ni cambiar sus claves. Crea
otra con `create_blend`.

## Parámetros: add_parameter

```json
{"name": "Métrica", "values": [{"value": "Ingresos"}, {"value": "Margen"}, {"value": "Unidades"}], "source": "@ingresos"}
{"name": "Meta de crecimiento", "type": "decimal", "min": 0, "max": 1, "default": 0.1, "source": "@ingresos"}
```

CLI: `params add --name "Métrica" --values Ingresos,Margen,Unidades --source @ingresos` y
`params add --name "Meta de crecimiento" --type decimal --min 0 --max 1 --default 0.1 --source @ingresos`.

- **Dónde vive:** en el origen (es lo que hace *Añadir un parámetro* del panel Datos), así que necesita en la
  página actual un gráfico de ese origen. En un origen reutilizable afectaría a todos sus informes.
- **`type`:** `text` (por defecto), `integer`, `decimal` o `boolean`.
- **Valores permitidos:** con `values` es una lista (`label` opcional: sin ella, la etiqueta es el valor); con
  `min`/`max`, un rango; sin nada, cualquier valor. `default` fija el valor por defecto (no en listas: allí es
  el primero).
- **`id`:** el editor lo deriva del nombre y rechaza tildes y espacios. La herramienta lo genera sin ellos
  (`Métrica` → `metrica`); `id` lo fija a mano.

### Usarlo en una fórmula

En las fórmulas, el parámetro se escribe por su **nombre visible**, no por su id:

```
fields add --name "Métrica elegida" --formula 'CASE Métrica WHEN "Ingresos" THEN ingresos WHEN "Margen" THEN ingresos - coste ELSE unidades END'
fields add --name "Supera umbral de margen" --formula '(ingresos - coste) / ingresos >= Umbral de margen'
```

Con el id (`umbral_de_margen`) el editor responde "ID de dimensión o de métrica desconocido". Usa campos de
**origen** (`add_source_field`): en un calculado de gráfico (`bind "=..."`) el parámetro no se resolvió en
las pruebas, ni por id ni con `t0.`, y el gráfico dio "Error del sistema".

### Que el lector lo cambie: un control

Crea un control y apúntalo al parámetro con `patch_component componentId parameter=<id>` (CLI
`patch cd-... --parameter metrica`):

| Parámetro | Control |
|---|---|
| Lista de valores | `dimension-filter@lista-desplegable` o `@lista-de-tamano-fijo` |
| Rango numérico | `dimension-filter@control-deslizante` |
| Cualquier valor | `dimension-filter@cuadro-de-entrada` |

Es lo que hace *Campo de control > Parámetros* en el panel: guarda `controlParameter {parameterKey}`, vacía
la dimensión del control y quita su orden. Recarga para ver el control con los valores del parámetro.

### Cambiar o borrar: update_parameter, delete_parameter

```json
{"name": "Métrica", "values": [{"value": "Ingresos"}, {"value": "Margen"}], "source": "@ingresos"}
{"name": "Umbral de margen", "newName": "Margen mínimo", "min": 0, "max": 0.6, "default": 0.25}
```

CLI: `params update "Métrica" --values Ingresos,Margen --source @ingresos`, `params update "Umbral de
margen" --name "Margen mínimo" --max 0.6`, `params delete "Prueba" --source @ingresos`.

- **`update_parameter`** abre el formulario del parámetro (el icono `fx` de su fila en el panel Datos) y
  cambia nombre visible (`newName`), valores de la lista (`values` sustituye todas las filas: reutiliza las
  que hay, añade o quita el resto), rango y valor por defecto. El id y el tipo no cambian.
- **Renombrar:** las fórmulas lo nombran por su nombre visible. Revisa los campos que lo usan
  (`inspect_data_sources`) y vuelve a escribirlos con `add_source_field` si hace falta.
- **`delete_parameter`** lo quita del origen (*Quitar* en su fila de la lista de campos del origen). Los
  campos y controles que lo usaban quedan en error. Pide `LS_ALLOW_DELETE=1` y confirmación del usuario.
- Verificado el 2026-11-06: crear una lista de tres valores, renombrarla y dejarla en dos, y borrarla.

**No se puede (todavía):** crear parámetros de informe (los de los textos dinámicos): manual.

## Errores que se ven

- **Reason 67, "Los parámetros que estaban disponibles en este informe han cambiado":** el gráfico guarda un
  valor de parámetro que ya no es válido (`datasourceParameter`). Pasa si se escribe en el cuadro del
  parámetro del panel Propiedades. Bórralo y créalo de nuevo, o corrige el valor en *Propiedades >
  Parámetros*.
- **El editor de combinaciones se abre solo:** las tablas no comparten dimensiones. La herramienta lo cierra y
  da error.
