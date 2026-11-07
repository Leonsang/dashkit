# Campos: orígenes, vinculación y calculados

Las reglas del modelo (embebido o reutilizable, credenciales, ids, blends, parámetros) están en
`ls-modelo-datos`. Aquí, cómo se usan con las herramientas.


**Nombres de los campos:** `inspect_data_sources` (CLI `sources`) devuelve cada campo con su `name` (el nombre
visible, el que se usa en `bind`, el spec y las fórmulas) y su `id` interno (`_n900455703_`). En un origen recién
conectado ningún gráfico usa aún sus campos; la herramienta lo sondea con un componente temporal para leer los
nombres.

## Informe nuevo desde un CSV: create_report_from_csv

`create_report_from_csv files=["datos.csv"] dataset?` (CLI `new-from-csv datos.csv --dataset nombre`) crea un
informe con el conector «Subida de archivos CSV» de Looker Studio: nuevo informe, «Crear conjunto de datos»,
subida y «Añadir al informe». Devuelve `reportId`, `url`, `dataSourceId` y los campos con nombre y tipo.

- **Tarda de 2 a 4 minutos.** Desde la CLI, dale margen al comando (`timeout 600 node dist/cli.js new-from-csv ...`
  y un tiempo de espera de la herramienta de 10 minutos); si tu shell corta a los 2, el informe se crea igual
  pero no ves la respuesta: búscalo con `attach`.
- **Autorización:** la primera vez en una cuenta, el conector pide autorizar Google Cloud Storage. Es del
  usuario: la herramienta para y lo dice.
- **Tipos:** el CSV llega como texto en las columnas de fecha y en las numéricas con celdas vacías. Crea campos
  de origen con `add_source_field` (el origen subido es incrustado en el informe, no reutilizable):
  `PARSE_DATE("%Y-%m-%d", fecha)` para la fecha, `CAST(valoracion AS NUMBER)` para un número con huecos.
- **Varios CSV** con las mismas columnas forman un solo origen; con columnas distintas, crea un informe y añade
  los demás orígenes después (aún sin herramienta), o únelos antes en un solo CSV.
- Un informe con un solo origen: `create_component` y `bind` lo usan sin indicar `dataset`.
- El informe se queda como «Informe sin título»: renombrarlo aún no tiene herramienta.
- Verificado el 2026-11-07 con `bench/datos/cafe_brisa.csv` (6.182 filas, 19 columnas).
## Ver los orígenes: inspect_data_sources

Devuelve cada origen con `dataSourceId`, los límites de dimensiones y métricas, qué componentes lo usan
(`usedBy`) y sus campos (`id`, `qualifiedId`, nombre, `DIMENSION|METRIC` y tipo de dato). CLI: `sources`.

Llámala antes de vincular: los campos se escriben por su id, no por lo que crees que se llaman.

## Vincular: bind_fields_to_component

```json
{"componentId": "cd-xxx", "dimensions": ["pais"], "metrics": ["SUM(ingresos)", "AVG(valoracion)"]}
```

CLI: `bind cd-xxx --dims pais --metrics "SUM(ingresos),AVG(valoracion)" [--append]`.

- **Cómo se nombra un campo:** el id del origen (`unique_users`), el id con namespace (`t0.unique_users`)
  o el nombre visible (`Unique Users`).
- **Agregación:** `SUM`, `AVG`, `COUNT`, `COUNT_DISTINCT`, `MAX`, `MIN` o `NONE`, como `SUM(ingresos)`.
- **Sheets y CSV:** todas las columnas llegan como dimensiones. Sin agregación, se usa `SUM` para números y
  `COUNT_DISTINCT` para texto, y lo avisa en `warnings`. Con una métrica sin agregar saldrían filas sueltas
  (`RAW_ROWS`).
- **Métricas nativas (GA4, Ads):** no les pongas agregación. Una distinta de la del origen cuenta como
  personalizada y falla con reason 93 si el origen no deja editar campos.
- **Nombre visible:** `"pais as País"` cambia la etiqueta en el gráfico, igual que *Nombre visible* en el
  panel.
- **`mode`:** `replace` (por defecto) sustituye el hueco primario; `append` añade. Una lista vacía deja ese
  hueco como estaba.
- **Orden:** si el orden apuntaba a un campo que ya no está (reason 268), lo reasigna a la primera métrica
  descendente, o a la fecha ascendente en series temporales.

## Calculados de gráfico

Una fórmula que empieza por `=` crea un campo calculado del gráfico, solo para ese componente:

| Escribe | Sale |
|---|---|
| `"=SUM(ingresos) - SUM(coste) as Margen"` | Número |
| `"=SUM(margen) / SUM(ingresos)::PERCENT as Margen %"` | Número mostrado como porcentaje |
| `"=CONCAT(pais, ' - ', canal)::TEXT as País y canal"` | Texto |
| `"=canal = 'Online' as Es online"` | Booleano: una comparación sin tipo sale booleana |

Los tipos explícitos son `::BOOLEAN`, `::TEXT`, `::NUMBER` y `::PERCENT`. Un `CASE` o `IF` sin tipo sale
número.

Un calculado de gráfico **no sirve para filtrar** otros gráficos con una casilla o un botón: quita el error,
pero no filtra nada (verificado en modo vista). Para eso, un campo del origen.

Tampoco sirve como **fecha**: un `=PARSE_DATE(...)` de gráfico en la dimensión da «La dimensión no es válida»
(reason 266), y ni el control de periodo ni la comparación lo usan. La fecha va en el origen, con
`add_source_field`.

## Calculados de origen: add_source_field

```json
{"name": "es_online", "formula": "canal = \"Online\""}
```

CLI: `fields add --name es_online --formula 'canal = "Online"' [--source "<nombre del origen>"] [--allow-shared]`.

- Usa el editor de campos de la interfaz, como haría una persona. El campo queda en el origen y lo ven
  todos los gráficos del informe que lo usan.
- Es lo que necesitan las **casillas** y los **botones de filtro predefinido**: un campo **booleano del
  origen**. Sin campo da reason 265; con uno que no es booleano, 116.
- **Sheets:** TRUE/FALSE llega como texto. Conviértelo: `UPPER(devuelto) IN ("TRUE","SI")`.
- **`source`:** el nombre del origen en el panel Datos, si hay más de uno (con uno solo no hace falta y se
  ignora). La respuesta trae `dataSourceId`, el origen donde quedó el campo.
- **Orígenes reutilizables:** se niega, porque el cambio llegaría a todos los informes que lo usan. Con
  `allowShared=true` lo hace; úsalo solo si el usuario lo pide.

## Cambiar el origen de un componente

`create_component dataset=...` crea un componente sobre otro origen. Para uno existente, vuelve a vincular
sus campos con los del origen nuevo (`ls-migracion` tiene el flujo y el mapeo UA → GA4). Cambiar el origen
de una página o del informe entero es manual (*Recurso > Administrar fuentes de datos agregadas*).

## Lo que no se puede (todavía)

- **Combinaciones y parámetros:** tienen herramientas propias (`create_blend`, `add_parameter`), en
  `combinaciones-y-parametros.md`. Lo que aún no se puede de ellos está allí.
- **Añadir un origen nuevo al informe:** manual (*Recurso > Administrar fuentes de datos agregadas >
  Añadir*).
