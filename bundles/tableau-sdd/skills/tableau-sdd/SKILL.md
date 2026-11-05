---
name: tableau-sdd
description: >-
  Flujo guiado por especificación para trabajo en Tableau Desktop. Úsalo para
  empezar un libro o dashboard nuevo (brief, spec, tareas, construcción,
  verificación) o para levantar uno existente antes de cambiarlo: inventario,
  auditoría y documentación del estado actual. Se invoca con una fase:
  `survey`, `new`, `spec`, `tasks`, `build`, `verify`, o sin argumento para ver
  el estado. Triggers: "nuevo dashboard de Tableau", "levantamiento de este
  libro", "auditar workbook de Tableau", "documentar este .twb", "planear
  cambios en Tableau", "tableau sdd".
---

# tableau-sdd — trabajo en Tableau guiado por especificación

Un flujo delgado que convierte el trabajo en pasos escritos y revisables. No
reemplaza a la skill `tableau-authoring`: decide **cuándo** se usa cada
herramienta y **qué** queda escrito. El trabajo vive en el proyecto, junto al
`.twb`/`.twbx`, y se versiona con él.

**Escribe cada artefacto en el idioma en que te escribe el usuario.**

## Las dos entradas

```
proyecto nuevo   new ─▶ spec ─▶ tasks ─▶ build ─▶ verify
                          ▲
libro existente  survey ──┘   (spec del estado actual y el mismo camino para cualquier cambio)
```

| Fase | Cuándo | Escribe | Puerta |
|---|---|---|---|
| `survey` | Existe un libro y nadie ha escrito qué hace | `survey.md`, `evidence.md` | El dueño revisa los hallazgos |
| `new` | Libro desde cero | `spec.md` | **El usuario aprueba el spec** |
| `spec` | Hallazgos o un pedido que cambian un libro existente | `spec.md` | **El usuario aprueba el spec** |
| `tasks` | Hay un spec aprobado | `tasks.md` | — |
| `build` | Hay tareas: se implementan una a una | cambios + marcas en `tasks.md` | La comprobación de cada tarea pasa |
| `verify` | Todas las tareas hechas | `verification.md` | Cada criterio de aceptación tiene evidencia |

Para ejecutar una fase, lee `references/<fase>.md` de la carpeta de esta skill
y síguelo al pie de la letra. Sin argumento, informa del estado: lista `sdd/`,
qué cambio está abierto, en qué fase y cuál es el siguiente comando.

## Reglas en todas las fases

1. **Un cambio, una carpeta:** `sdd/NNN-<slug>/`, numeradas en orden.
   `sdd/README.md` es el índice: una línea por cambio con su estado. Crea los
   dos si faltan.
2. **Nunca pases una puerta por tu cuenta.** No hay tareas sin que el usuario
   apruebe el spec con esas palabras; anótalo en el spec como
   `Aprobado por <nombre> el <fecha>`.
3. **Evidencia, no afirmaciones.** Los inventarios salen de
   `workbook_operations Info` y `Lint`, las comprobaciones de las
   herramientas. Pega lo que la herramienta dijo; nunca describas lo que
   "diría".
4. **Pasos pequeños.** Una tarea toca un área (una fuente, una hoja, un
   dashboard) y lleva su propia comprobación.
5. **Detente en cada puerta** y di exactamente qué revisar y qué comando
   sigue.

## Herramientas obligatorias por fase

| Fase | Obligatorio |
|---|---|
| `survey` | `workbook_operations Info` y `workbook_operations Lint` sobre el libro, pegados en `evidence.md` |
| `build` | Cada tarea dentro de `transaction_operations Begin` → cambios → `Commit` |
| `verify` | `export_image` de cada dashboard afectado y `desktop_operations Warnings` (y `ErrorDialogs`) vacíos |

Si hay un subagente `tableau-author`, delégale la construcción de cada tarea.
