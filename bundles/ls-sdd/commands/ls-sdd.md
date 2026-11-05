---
description: Flujo guiado por especificación para Looker Studio — survey | new | spec | tasks | build | verify (sin argumento, estado).
argument-hint: "[survey|new|spec|tasks|build|verify] [detalle]"
---

Usa la skill `ls-sdd` con la fase `$ARGUMENTS`.

- Sin argumento: informa del estado de `sdd/`.
- Con una fase: lee `references/<fase>.md` de esa skill y síguelo, incluidas
  sus herramientas obligatorias:
  - `survey`: `diagnose_report` (CLI `diagnose`) sobre el informe abierto;
  - `build`: `lint_report_spec`, después `apply_report_spec` con
    `dryRun=true` revisado (CLI `apply <spec> --dry-run`), y solo entonces la
    aplicación real.
- Trabaja sobre una copia del informe salvo que el usuario diga lo
  contrario. Detente en cada puerta.

Si las herramientas del MCP `looker-studio` no están disponibles, dilo y
sugiere `/setup` del plugin `looker-studio-authoring`.
