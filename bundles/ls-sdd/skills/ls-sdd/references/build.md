# build — una tarea cada vez, con dry-run antes de aplicar

Para cada tarea sin marcar:

1. **Di qué vas a hacer**, en una frase.
2. **Si la tarea aplica el spec**, en este orden obligatorio:
   1. `lint_report_spec` sobre el `.spec.json`: 0 errores. Si no, corrige el
      spec, no el informe.
   2. `apply_report_spec` con `dryRun=true` (CLI: `node <plugin>/looker-studio-mcp/dist/cli.js apply <spec> --dry-run`).
      Lee el plan: qué crea, qué actualiza y qué se queda igual. Si el plan
      toca algo que el spec no menciona, detente y pregunta.
   3. Solo entonces `apply_report_spec` sin dryRun. Es idempotente:
      `<spec>.state.json` recuerda qué componente es cada `key`.
3. **Si la tarea es otra herramienta** (`add_source_field`, `add_page`,
   `add_filter`…), ejecútala sola y pega su salida.
4. **Recarga y diagnostica** (`reload_report` y `diagnose_report`). El editor
   conserva el error anterior de un componente hasta recargar, así que no
   juzgues antes.
5. **Ejecuta la comprobación de la tarea.** Si trata de comportamiento (un
   control que filtra, un botón), compruébalo en modo vista: que los datos
   cambien. "Sin errores" no basta.
6. **Márcala** con una línea de evidencia.

Si una comprobación falla y arreglarla cambia el spec, detente y pregunta.

Si el hook de `looker-studio-guardrails` informa de errores de lint al editar
el `.spec.json`, corrígelos antes de aplicar.

Al terminar: `ls-sdd verify`.
