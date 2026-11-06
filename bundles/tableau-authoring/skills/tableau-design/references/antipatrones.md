# Antipatrones (y su arreglo)

| Antipatrón | Por qué es malo | Arreglo |
|---|---|---|
| Más de 3 vistas analíticas en un dashboard | Una consulta por vista y por filtro; el lector no sabe dónde mirar | Otro dashboard, enlazado con `navigation`; o una historia |
| Una hoja por KPI | Cada hoja es una consulta y una zona más que alinear | Una hoja con `measures=[...]` |
| Pastel con 5 o más porciones | Los ángulos no se comparan | Barras ordenadas |
| Barras sin ordenar | Hay que leer cada barra para encontrar la mayor | `sort` por la medida, DESC |
| Fecha discreta en una tendencia | Cabeceras de mes en lugar de un eje continuo | `MONTH_TRUNC(Fecha)` |
| Mapa relleno con totales | Las regiones grandes dominan aunque vendan poco | Mapa de símbolos con `size`, o relleno con una tasa |
| Doble eje con escalas sin relación | Sugiere una correlación que no existe | Dos vistas, o `synchronize=true` si es la misma unidad |
| Eje que no empieza en cero en barras | Exagera las diferencias | Barras con cero; si no, usa puntos o líneas (`format Field include_zero=false` solo en líneas o dispersiones) |
| Arcoíris en una medida continua | Sin orden perceptual | Secuencial (un tono) o divergente (dos) |
| Color para todo | Nada destaca | Neutros y un acento |
| Muchos filtros en tarjeta, con "Only Relevant Values" | Lento: una consulta por tarjeta | Acciones de filtro desde las vistas; tarjetas sin "relevant" |
| Tarjeta de filtro de una hoja que no está en el dashboard | Aparece vacía, con título y sin control | Tarjeta de una hoja del dashboard (`DASH-ORPHAN-CARD`) |
| Dashboard de tamaño automático | Cambia según la pantalla y no se cachea | Tamaño fijo y `AddDeviceLayout` para móvil |
| Flotantes por todas partes | Se descolocan y rompen el orden de lectura | Mosaico con contenedores |
| Títulos como "Ventas" o "SUM(Importe)" | No dicen la pregunta ni la conclusión | "Ventas por región, 2025: el Norte lidera" |
| Tooltip con el volcado de todos los campos | Ruido | Una frase con 2 o 3 cifras |
| COUNTD y LOD en todas las vistas | Consultas pesadas | Extract; precalcular en el origen; LOD solo donde haga falta |
| Blending para unir tablas | Lento y con restricciones | Relaciones (`relationships`) o joins (`tableau-data-model`) |
| Conexión viva a un CSV o Excel | Se relee el archivo en cada consulta | `datasource CreateExtract` |
