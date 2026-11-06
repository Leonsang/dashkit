---
name: ls-authoring
description: "Construir y modificar informes de Looker Studio / Data Studio con el MCP looker-studio (editor real por CDP): copia segura, componentes y plantillas, campos y calculados, controles y filtros, páginas, temas, ajustes, informe como código (spec) y verificación. Úsala antes de tocar un informe con las herramientas del MCP o la CLI ls-studio. Triggers: \"crear informe Looker Studio\", \"añadir gráfico\", \"vincular campos\", \"spec de informe\", \"apply spec\", \"tema del informe\", \"control de filtro\"."
---

# Skill: autoría de informes con el MCP looker-studio

Esta skill dice **cómo** se construye con las herramientas. Las demás `ls-*` dicen **qué** está bien:
diseño (`ls-diseno-layout`), KPIs (`ls-kpi-scorecards`), modelo (`ls-modelo-datos`), rendimiento
(`ls-rendimiento`), migración (`ls-migracion`) y errores (`ls-depuracion-errores`).

El servidor maneja el editor real del navegador del usuario: los cambios son los mismos que haría a mano y
se guardan con el servicio de guardado de la interfaz. No hay API pública detrás.

## Antes de empezar

1. **Navegador con CDP** (`/setup`): un perfil dedicado con `--remote-debugging-port=9222` y la sesión de
   Google iniciada por el usuario. Tú no escribes credenciales.
2. **`attach_to_report`**: devuelve el informe, la página y el `mode` (`edit`, `view` o `preview`).
   `open_report url=...` abre otro informe; solo acepta URLs de informes de Looker Studio o Data Studio.
3. **Trabaja sobre una copia**: `copy_report report=<url|id>` crea una copia del usuario y la abre en
   `/edit`. Edita el original solo si el usuario lo pide explícitamente.
4. **Diagnostica lo que hay**: `diagnose_report` y `get_report_layout`.

Permisos del servidor (variables de entorno):
- `LS_ALLOW_WRITE=1`: sin ella, toda herramienta que escribe devuelve error. El instalador de dashkit la
  activa.
- `LS_ALLOW_DELETE=1`: además, para `delete_component`. Borra solo si el usuario lo pide.
- `LS_WORKSPACE`: las rutas de spec y export deben ser `.json` dentro de esa carpeta.

## Método

1. **Planifica.** Para más de dos o tres cambios, escribe un spec (`informe-como-codigo.md`) y pasa el
   flujo de `/ls-sdd` si el usuario quiere aprobarlo antes.
2. **Construye en pasos pequeños**, de uno en uno, y verifica cada uno con `get_report_layout`.
3. **Recarga y diagnostica** (`reload_report`, luego `diagnose_report`) antes de dar algo por bueno o por
   malo: el editor conserva errores viejos hasta recargar.
4. **Comprueba el comportamiento en modo vista** cuando importa (un control que filtra, un periodo). "Sin
   errores" no prueba que funcione.
5. **Informa:** URL de la copia, qué cambió, qué verificaste y cómo, y lo que no se pudo.

Confirma con el usuario antes de cambiar más de diez componentes, de cambiar el origen de datos o de crear
campos en un origen reutilizable.

## Referencias

| Tema | Archivo |
|---|---|
| Crear, colocar y vincular componentes; plantillas y variantes | [componentes.md](references/componentes.md) |
| Orígenes, ids de campo, agregaciones y campos calculados (de gráfico y de origen) | [campos.md](references/campos.md) |
| Controles del menú "Añadir un control", filtros de página y de componente, barra de filtros | [controles-y-filtros.md](references/controles-y-filtros.md) |
| Combinar orígenes (blends) y parámetros, con controles que los mueven | [combinaciones-y-parametros.md](references/combinaciones-y-parametros.md) |
| Páginas (crear, mover, duplicar, ocultar, borrar), temas, auditoría UX y ajustes del informe | [paginas-temas-y-ajustes.md](references/paginas-temas-y-ajustes.md) |
| Informe como código: spec, `lint`, `apply`, `orphans` | [informe-como-codigo.md](references/informe-como-codigo.md) |
| Verificar, depurar, exportar y aprender entre sesiones | [revision.md](references/revision.md) |
| Cómo se comporta el editor (errores pegados, modos, guardados rechazados) | [comportamiento-del-editor.md](references/comportamiento-del-editor.md) |
| Todas las herramientas y comandos, generado desde el servidor | [operaciones.md](references/operaciones.md) |

## MCP y CLI

Cada herramienta MCP tiene su comando en la CLI `ls-studio` (`node dist/cli.js <comando>`) y al revés: el
mismo motor, las mismas operaciones. La tabla de equivalencias y lo que cambia (nombres de parámetros,
archivos frente a objetos) está en `operaciones.md`, y un test falla si aparece una herramienta o un comando
sin pareja. La CLI no lleva el control de `LS_ALLOW_WRITE`, porque la ejecuta una persona. Úsala cuando el
usuario trabaje desde la terminal o en scripts.

## Límites conocidos

- **Combinaciones:** se crean, renombran, cambian de unión, de tablas y de claves, y se borran.
- **Parámetros:** se crean, cambian, borran y enlazan a controles; los de informe (textos dinámicos) son
  manuales.
- **Interfaz no oficial:** una actualización de Looker Studio puede romper los scripts. Si
  `get_learnings` muestra `method_missing`, avisa al usuario.
- **Padding:** algunos tipos no tienen `paddingBottom` (p. ej. `kpi-metric`) y `generic-shape` no tiene
  padding; la herramienta lo avisa en `warnings`.
- **Sin herramienta:** agrupar y alinear componentes, estilo fino de un gráfico (series, ejes, etiquetas,
  formato condicional) y secciones de la navegación.
