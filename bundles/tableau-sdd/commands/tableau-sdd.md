---
description: Flujo guiado por especificación para Tableau — survey | new | spec | tasks | build | verify (sin argumento, estado).
argument-hint: "[survey|new|spec|tasks|build|verify] [detalle]"
---

Usa la skill `tableau-sdd` con la fase `$ARGUMENTS`.

- Sin argumento: informa del estado de `sdd/` (qué cambio está abierto, en qué
  fase y qué comando sigue).
- Con una fase: lee `references/<fase>.md` de esa skill y síguelo al pie de la
  letra, incluidas sus herramientas obligatorias:
  - `survey`: `workbook_operations Info` y `Lint`;
  - `build`: cada tarea entre `transaction_operations Begin` y `Commit`;
  - `verify`: `export_image` más `desktop_operations Warnings` y
    `ErrorDialogs`.
- Detente en cada puerta. No apruebes nada en nombre del usuario.

Si las herramientas del MCP `tableu` no están disponibles, dilo y sugiere
`/setup` del plugin `tableau-authoring`. No improvises su trabajo.
