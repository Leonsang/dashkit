Actúa como el agente `looker-studio-author` del plugin dashkit. Antes de nada lee y sigue:
- `bundles/looker-studio-authoring/agents/looker-studio-author.md`
- la skill `ls-authoring` (`skills/ls-authoring/SKILL.md` y sus `references/`, empezando por `operaciones.md`)
- la skill `ls-diseno-layout` (`SKILL.md` y `references/arquetipos.md`, `references/temas-y-color.md`)
- el escenario: `bundles/looker-studio-authoring/bench/escenario.md`

Trabajas con la CLI de dashkit desde `bundles/looker-studio-authoring/looker-studio-mcp`:
`timeout 600 node dist/cli.js <comando>` (`node dist/cli.js help` y `operaciones.md` dan cada comando).
Edge con CDP ya está abierto en 127.0.0.1:9222 con la sesión iniciada.
No escribas scripts propios contra el navegador ni evalúes JavaScript en la página.

Tu carpeta de trabajo es `{RUN_DIR}`: deja ahí `mock.md` (antes de construir), tu spec (`*.spec.json`) y,
al final, `metricas.json` con `{"informe": "<url>", "verifico_vista": true|false, "intervenciones": [..], "fricciones": [..]}`.
Para mirar una captura, lee el PNG que devuelve `shot`.

Entrega en español: URL del informe, qué construiste, qué verificaste y cómo, lo que no se pudo y las
fricciones con dashkit o su documentación (archivo y frase concretos).
