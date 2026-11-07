# Cómo se comporta el editor

Lo que se ha observado manejando el editor por CDP y que cambia cómo se trabaja. Cada punto se comprobó en
un informe de prueba.

| Comportamiento | Consecuencia | Qué hacer |
|---|---|---|
| **Errores pegados:** el editor conserva el error anterior de un componente hasta recargar | Un componente ya arreglado sigue saliendo en error, o uno roto parece bien | `reload_report` y `diagnose_report` antes de juzgar |
| **Componentes creados por API** no se pintan hasta recargar | Tras varios `create_component` la página parece igual | `reload_report` al terminar el lote |
| **`/view` y `/preview` rechazan consultas nuevas** (`PREFETCH_VALIDATION`, ACCESS) | Un cambio de campos parece fallar aunque esté bien | Edita siempre en `/edit`. `LS_ALLOW_NON_EDIT=1` solo para probar en una copia |
| **Cambiar `display.type` de un JSON clonado** | `updatePage 400`, y el estado local queda inválido | Crea un componente del tipo correcto; la herramienta recarga para descartar el estado |
| **Vaciar campos de una plantilla antes de guardar** | El guardado se rechaza | Cambia el origen y vincula los campos antes del primer guardado (`create_component` lo hace así) |
| **"Sin errores" no es "funciona"** | Un calculado de gráfico booleano quita el reason 116 de una casilla, pero no filtra | Comprueba en `/view` que las cifras cambian |
| **Casillas y filtros predefinidos** solo filtran con un booleano **del origen** | Con un calculado de gráfico no se lanza ninguna consulta al hacer clic | `add_source_field` |
| **`add_page` inserta tras la página actual** | La página nueva no queda al final | Identifícala por el id devuelto |
| **Métricas nativas con agregación** distinta de la del origen | Reason 93 si el origen no deja editar campos | No pongas agregación a métricas de GA4 o Ads |
| **En Sheets, todo es dimensión** | Una métrica sin agregar devuelve filas sueltas | `SUM(campo)`, `AVG(campo)` o `COUNT_DISTINCT(campo)` |
| **Orden huérfano** tras cambiar campos (reason 268) | El gráfico no carga | `bind_fields_to_component` reasigna el orden; en series temporales, la fecha ascendente |
| **Plantillas de otros informes** traen sus colores y fuentes | Componentes que no siguen el tema | `patch_component stripThemeStyles=true` |
| **Informe vacío** | No hay componente del que clonar ni del que sacar ids, y los orígenes no tienen esquema cargado | `create_component` crea una semilla con la fábrica del editor y la borra; `"@campo"` sondea el origen con una plantilla |
| **El clic derecho reduce una selección múltiple** al gráfico pulsado (y con Mayús lo quita) | El menú contextual sale sin "Combinar datos" activo | `create_blend` abre el menú con el evento `contextmenu` solo, sin el `mousedown` |
| **Pestaña oculta** (ventana tapada o minimizada) | El navegador no pinta el lienzo: capturas en blanco, y los clics reales no hacen nada | Las herramientas que hacen clics traen la ventana al frente (la minimizan y la restauran) |
| **Un viewport emulado más alto que la ventana** | Lo que queda por debajo de la ventana real (el final del panel Datos) recibe el ratón encima pero no el clic | Las herramientas solo emulan un viewport grande si la ventana es pequeña |
| **La lista del panel Datos es virtual** | Solo las filas visibles están en el DOM; los parámetros van al final | Las herramientas filtran la lista con su buscador antes de buscar un campo o parámetro |
| **Un clic en un control desplegable lo abre** | El clic siguiente solo lo cierra | Para elegir un origen, las herramientas seleccionan un gráfico antes que un control |
| **Extensiones del navegador** | "Sorry! We can't save this report right now." | Perfil dedicado sin extensiones |
| **Dos órdenes y dos nombres de página:** el modelo del editor y la navegación que ve el lector | Reordenar o renombrar solo el modelo no cambia lo que se ve, y no persiste | `move_page`, `rename_page`: usan las acciones de navegación del editor |
| **Seleccionar por el modelo no actualiza los paneles** | El panel Datos no ofrece "Añadir un campo" o "Añadir un parámetro" | Las herramientas que usan paneles seleccionan con clics reales |
| **Campos de una combinación** listados tabla a tabla | Un campo de la tabla 1 añadido al final de la lista dio "Error del sistema" | `update_blend` mantiene los campos en el orden de sus tablas |
| **Dos órdenes por gráfico:** `sortData` y el orden inicial de `behavior.onSort` | Manda el segundo; un combinado creado al combinar datos quedó ordenado por "Número de registros" y su eje de meses, desordenado | `bind_fields_to_component` alinea los dos |
| **Un guardado pendiente se pierde** si se recarga o se escribe en otra página antes de que salga | El último componente creado en una página desaparecía al recargar (tres tablas en el showcase) | Las herramientas esperan a que no quede ningún guardado en curso antes de recargar, abrir o cambiar de página |
| **Cabecera de tabla** en texto de acento sobre un tinte del acento | Blanco sobre azul pálido (1,1:1) | `stripThemeStyles` en tablas usa el texto del tema; `audit_ux` lo detecta |
| **Lo creado después queda encima** | Una forma de fondo nueva (tarjeta, barra de filtros) tapó un control de periodo que ya existía | `apply_report_spec` manda al fondo las formas que contienen otros componentes y trae al frente iconos y textos dentro de un botón |
| **Un cuadro de texto encima de un botón se queda con el clic** | Pulsar la etiqueta no navegaba | Pon la etiqueta como texto del propio botón; una imagen sí admite `linkPage` |
| **Un componente a nivel de informe no está en ninguna página** | `delete_component` no lo encontraba | Lo baja a una página y lo borra |
| **Periodo fijo** | Fechas `YYYYMMDD` en el control de periodo dan «hoy – hoy» | Solo periodos móviles (`dateRangeDays`); con datos antiguos, la comparación con el periodo anterior sale vacía |
| **Cambiar una clave de estilo de un gráfico no lo repinta** | El color o la leyenda nuevos se guardan, pero el lienzo sigue igual hasta recargar | `set_chart_style` recarga al final |
| **Un parámetro del origen aparece como campo de texto en Propiedades** | Escribir ahí cambia el valor del parámetro en ese gráfico (reason 67) | `add_source_field` solo escribe en el editor de campos |

## Cómo escribe el servidor

Con los servicios del propio editor: `legoUndoRedoService` para cambiar el modelo y `wrapperSaveService`
para guardar (`POST updatePage`), los mismos que usa la interfaz. No replica peticiones REST ni toca el
token XSRF. La navegación (orden, nombres, ocultar y borrar páginas) se cambia despachando las acciones
`[ReportNavigation]` del propio editor, que la guardan. Algunas cosas (combinar datos, campos y parámetros
de origen, duplicar páginas, sembrar plantillas desde el menú) se hacen con eventos reales sobre la
interfaz, porque no hay otro camino estable.

Si un método interno desaparece tras una actualización de Google, la herramienta lo registra como
`method_missing` y las de lectura usan el DOM como alternativa.
