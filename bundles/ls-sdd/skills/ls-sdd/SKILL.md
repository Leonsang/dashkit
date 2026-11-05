---
name: ls-sdd
description: >-
  Flujo guiado por especificación para informes de Looker Studio / Data Studio.
  Úsalo para crear un informe nuevo o levantar uno existente antes de
  cambiarlo: diagnóstico, auditoría UX, spec escrito más spec declarativo
  (.spec.json), tareas, construcción con dry-run previo y verificación en modo
  vista. Se invoca con una fase: `survey`, `new`, `spec`, `tasks`, `build`,
  `verify`, o sin argumento para ver el estado. Triggers: "nuevo informe de
  Looker Studio", "levantamiento de este informe", "auditar informe Data
  Studio", "planear cambios en Looker Studio", "ls sdd".
---

# ls-sdd — Looker Studio guiado por especificación

Un flujo delgado sobre el MCP `looker-studio` y sus skills `ls-*`. Decide
**cuándo** se usa cada herramienta y **qué** queda escrito. Su particularidad:
el spec aprobado se materializa en un `.spec.json` declarativo, que se aplica
de forma idempotente, así que el informe queda como código.

**Escribe cada artefacto en el idioma en que te escribe el usuario.**

```
informe nuevo      new ─▶ spec ─▶ tasks ─▶ build ─▶ verify
                            ▲
informe existente  survey ──┘
```

| Fase | Escribe | Puerta |
|---|---|---|
| `survey` | `survey.md`, `evidence.md` | El dueño revisa los hallazgos |
| `new` / `spec` | `spec.md` y `<informe>.spec.json` | **El usuario aprueba el spec** |
| `tasks` | `tasks.md` | — |
| `build` | cambios en el informe + marcas en `tasks.md` | dry-run limpio antes de cada aplicación real |
| `verify` | `verification.md` | Cada criterio tiene evidencia, comprobada en modo vista cuando trata de comportamiento |

Para ejecutar una fase, lee `references/<fase>.md` de la carpeta de esta skill
y síguelo al pie de la letra. Sin argumento, informa del estado de `sdd/`.

## Reglas en todas las fases

1. **Un cambio, una carpeta** `sdd/NNN-<slug>/`. `sdd/README.md` es el índice.
2. **Siempre sobre una copia** del informe (`copy_report`), salvo que el
   usuario diga explícitamente que edites el original. Anota la URL de la
   copia en el spec.
3. **Nunca pases una puerta por tu cuenta.** El spec se aprueba con
   `Aprobado por <nombre> el <fecha>`.
4. **Evidencia, no afirmaciones:** pega lo que dijeron `diagnose_report`,
   `audit_ux`, `lint_report_spec` y `apply_report_spec`.
5. **El editor conserva errores viejos** hasta recargar. Antes de juzgar un
   componente: `reload_report` y `diagnose_report`.

## Herramientas obligatorias por fase

| Fase | Obligatorio |
|---|---|
| `survey` | `diagnose_report` (CLI: `node dist/cli.js diagnose`) sobre el informe abierto, más `audit_ux` y `export_report` |
| `build` | `lint_report_spec` sin errores → `apply_report_spec` con `dryRun=true` (CLI: `apply <spec> --dry-run`) revisado → solo entonces `apply_report_spec` real |

Si hay un subagente `looker-studio-author`, delégale la construcción.
