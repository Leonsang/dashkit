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
| **El nombre de la página en la navegación** se guarda aparte del modelo | Renombrar solo en el modelo no cambia lo que ve el lector | `rename_page`, que usa *Gestionar páginas* |
| **Métricas nativas con agregación** distinta de la del origen | Reason 93 si el origen no deja editar campos | No pongas agregación a métricas de GA4 o Ads |
| **En Sheets, todo es dimensión** | Una métrica sin agregar devuelve filas sueltas | `SUM(campo)`, `AVG(campo)` o `COUNT_DISTINCT(campo)` |
| **Orden huérfano** tras cambiar campos (reason 268) | El gráfico no carga | `bind_fields_to_component` reasigna el orden; en series temporales, la fecha ascendente |
| **Plantillas de otros informes** traen sus colores y fuentes | Componentes que no siguen el tema | `patch_component stripThemeStyles=true` |
| **Extensiones del navegador** | "Sorry! We can't save this report right now." | Perfil dedicado sin extensiones |

## Cómo escribe el servidor

Con los servicios del propio editor: `legoUndoRedoService` para cambiar el modelo y `wrapperSaveService`
para guardar (`POST updatePage`), los mismos que usa la interfaz. No replica peticiones REST ni toca el
token XSRF. Algunas cosas (renombrar páginas, campos de origen, sembrar plantillas desde el menú) se hacen
con eventos reales sobre la interfaz, porque no hay otro camino estable.

Si un método interno desaparece tras una actualización de Google, la herramienta lo registra como
`method_missing` y las de lectura usan el DOM como alternativa.
