---
name: tableau-data-model
description: >-
  Modelo de datos de un libro de Tableau con el MCP `tableu`: conexiones (CSV,
  Excel, .tds, bases de datos), relaciones frente a joins, filtros de fuente,
  extracts .hyper, propiedades de campo (rol, tipo, formato por defecto, rol
  geográfico, alias), calculados, LOD, cálculos de tabla, parámetros, conjuntos,
  grupos, bins, jerarquías y carpetas, y su rendimiento. Úsala antes de crear o
  cambiar una fuente de datos o un campo, y junto a `tableau-authoring` para las
  hojas. Triggers: "fuente de datos de Tableau", "relación o join en Tableau",
  "calculated field", "LOD", "FIXED", "extract hyper", "parámetro de Tableau",
  "modelo de datos Tableau", "por qué el total sale duplicado".
---

# Modelo de datos en Tableau con `tableu`

Las hojas solo son tan buenas como el modelo que tienen debajo. Antes de construir vistas, deja claro:

1. **Una fila es...**: el nivel de detalle de cada tabla (una venta, un cliente, un día).
2. **Cómo se unen las tablas:** relación (por defecto) o join, y por qué columnas.
3. **Qué campos ve el usuario:** con su nombre de negocio, su rol, su formato y los técnicos ocultos.

Después: `field List` y trabaja con los nombres reales.

## 1. Conexiones

| Origen | Operación | Notas |
|---|---|---|
| CSV, TXT o Excel | `datasource CreateFromFiles sources=["Ventas=ventas.csv", "Clientes=clientes.xlsx#Hoja1"]` | La primera es la tabla raíz. `datasource PreviewFile` muestra columnas y tipos antes |
| Fuente publicada o archivo `.tds` | `datasource CreateFromTds path=` | Se incrusta |
| Base de datos | `datasource CreateDatabase kind=postgres|sqlserver|mysql|oracle|redshift|snowflake|databricks|teradata|bigquery server database table|custom_sql` | **Nunca** se guardan contraseñas: Desktop las pide al conectar. `columns={...}` opcional |

- **Otras operaciones de fuente:** `Rename`, `Delete` (se niega si una hoja la usa, salvo `force`),
  `Get` (conexiones, tablas lógicas, relaciones, número de campos) y `ListRelationships`.
- **Custom SQL:** evítalo (`PERF-CUSTOMSQL`). Impide que Tableau optimice la consulta. Usa tablas y
  relaciones.

## 2. Relaciones, joins y blending

| | Relación | Join | Blending |
|---|---|---|---|
| Qué hace | Une tablas **lógicas**; cada una conserva su nivel de detalle y Tableau elige el join según la vista | Funde tablas **físicas** en una sola tabla lógica | Une dos fuentes distintas en la hoja, agregando antes |
| Cuándo | Tablas con distinto nivel de detalle (ventas y metas mensuales; pedidos y clientes) | Búsquedas al mismo nivel (código → nombre) | Solo si las fuentes no pueden estar en un modelo (orígenes distintos que no se relacionan) |
| tableu | `relationships=["Ventas.ClienteID = Clientes.ID"]` | `joins=["left: Ventas.Region = Regiones.Region"]` (`inner|left|right|full`) | No lo crea (está en `tableu://coverage-gaps`) |
| Riesgo | Pocos: es lo recomendado | Duplicar filas si la clave no es única en la tabla de la derecha: los SUM salen inflados | Lento y con restricciones (`WBO-BLENDING`) |

Las dos se combinan: un join dentro de una tabla lógica, y relaciones entre tablas lógicas.

**Diagnóstico de totales duplicados:** si `SUM(Importe)` sale mayor que en el origen después de añadir una
tabla, hay un join con clave repetida. Pásalo a relación o agrega antes. Compruébalo con
`workbook SummaryData`.

## 3. Filtros de fuente y extracts

- **`datasource AddFilter datasource field values|min|max exclude`:** filtra para todas las hojas de esa
  fuente. Es lo primero que aplica Tableau después del extract.
- **`datasource CreateExtract datasource hyper_path?`:**
  - Pasa una fuente de archivo (CSV o Excel de una tabla lógica) a `.hyper` con la Hyper API, y deja
    la conexión viva debajo para refrescar.
  - Si el `.hyper` está bloqueado porque Desktop lo tiene abierto, escribe `<nombre>-2.hyper` y lo
    dice en `notes`.
  - Con varias tablas: Data > Extract en Desktop.
- **Extract antes que conexión viva** para archivos (`WBO-LIVE`). Si es grande, filtra y oculta los
  campos que no se usan antes de extraer.

## 4. Campos

`field Update datasource field`:

| Parámetro | Valores | Equivale en Desktop (medido) |
|---|---|---|
| `caption` | nombre de negocio | Rename |
| `role` | `dimension | measure` | Convert to Dimension/Measure (`column@role`; Desktop añade `default-role`) |
| `type` | `nominal | ordinal | quantitative` | Convert to Discrete/Continuous |
| `datatype` | `string | integer | real | date | datetime | boolean` | Change Data Type (`column@datatype`) |
| `aggregation` | `Sum | Avg | Min | Max | Count | CountD | Median | None` | Default Properties > Aggregation |
| `default_format` | `n#,##0`, `p0.0%`, `c"€"#,##0`... | Default Properties > Number Format |
| `geo_role` | `country | state | county | city | zip | airport | cbsa | congress | areacode | nuts | latitude | longitude` | Geographic Role (`semantic-role`) |
| `hidden` | `true` | Hide |
| `description` | texto | Default Properties > Comment |

- **`field SetAliases aliases={"E": "Este"}`:** alias de miembros (Edit Aliases). Un valor vacío quita el
  alias.
- **`field Delete`:** borra un calculado, grupo, conjunto o bin. Se niega si una hoja lo usa.
- **Formato por defecto en la medida, no en cada hoja:** así sale igual en todas.
- **Change Data Type sobre una fecha:** desde la interfaz deja a Desktop sin poder aplicar documentos
  (medido). Cambia el tipo con `field Update datatype=` sobre el archivo, no en vivo a mitad de una
  sesión.

## 5. Calculados

`calculation Create datasource name formula datatype role default_format description`:

| Tipo | Ejemplo | Cuándo |
|---|---|---|
| De fila | `[Importe] - [Coste]` | Una columna nueva por fila |
| Agregado | `SUM([Margen]) / SUM([Importe])` | Ratios: **siempre** agregados arriba y abajo, no `AVG([Margen %])` |
| Lógico | `IF [Importe] > 1000 THEN "Grande" ELSEIF ... END` / `CASE [Canal] WHEN ... END` | Clasificar; prueba antes el caso más frecuente |
| LOD FIXED | `{FIXED [Cliente]: MIN([Fecha])}` | Valor a un nivel fijo, independiente de la vista (primera compra, cohortes) |
| LOD INCLUDE / EXCLUDE | `{INCLUDE [Pedido]: SUM([Importe])}` | Más fino o más grueso que la vista |
| Cálculo de tabla | `RUNNING_SUM(SUM([Importe]))`, `WINDOW_AVG(SUM([Importe]), -2, 0)` | Sobre lo que ya está en la vista: acumulados, rankings, medias móviles |
| Con parámetro | `IF [Parameters].[Métrica] = "Ventas" THEN SUM([Importe]) ELSE SUM([Margen]) END` | Elegir la métrica |

Reglas:
- **Referencias:** a otro calculado se refiere por su caption entre corchetes.
- **Rendimiento:** un FIXED se calcula antes que los filtros de dimensión. Si debe respetar un filtro, ese
  filtro va en contexto (`filter Add context=true`).
- **`calculation Update`:** cambia fórmula, caption, tipo o formato. **`calculation List`:** los calculados
  de una fuente.
- **Rendimiento (Workbook Optimizer):**
  - Fórmulas de menos de 500 caracteres (`WBO-CALC-LENGTH`).
  - Pocos anidados (`WBO-NESTED-CALC`).
  - Pocos LOD (`WBO-NUM-LOD`).
  - COUNTD con moderación (`PERF-COUNTD`).
  - Enteros y booleanos antes que textos.
  - `DATEPARSE`, `MAKEDATE` y `DATEDIFF` para las fechas.

## 6. Parámetros, conjuntos, grupos, bins, jerarquías y carpetas

Las operaciones están en `tableau-authoring/references/filtros-y-parametros.md`. En el modelo:

- **Grupos nativos:** cargan todo el dominio del campo (`WBO-GROUPS`). Con muchos miembros, mejor un
  `CASE` o un conjunto.
- **Funciones nativas antes que calculados:** grupos, conjuntos, bins, partes de fecha y alias, cuando
  hacen el trabajo (PERF).
- **Jerarquías** (`hierarchy Create`): permiten bajar de nivel en las hojas (país → región → ciudad).
- **Carpetas** (`folder Create`): ordenan el panel de datos para quien edite el libro.

## 7. Checklist del modelo

1. Cada tabla tiene clara su "una fila es...". Las relaciones usan claves únicas en el lado "uno".
2. Ningún total cambia al añadir una tabla (contrasta con `workbook SummaryData`).
3. Campos con caption de negocio, rol y formato por defecto. Los técnicos (IDs, claves), ocultos.
4. Ratios como agregado / agregado. LOD solo donde no basta la vista.
5. Extract para archivos, filtros de fuente para lo que nadie va a ver, sin Custom SQL.
6. `workbook Lint`: sin avisos `WBO-*` de rendimiento sin justificar.
