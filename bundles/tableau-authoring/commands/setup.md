---
description: Prepara Tableau Desktop para el MCP tableu — activa la External Client API (flag ProjectAthena), abre Desktop y comprueba el estado.
argument-hint: "[ruta a un .twb/.twbx para abrir]"
---

# /setup — Tableau Desktop listo para `tableu`

Haz estos pasos en orden y muestra al usuario el resultado de cada uno. Usa las
herramientas del servidor MCP `tableu`; si no están cargadas, usa la CLI
equivalente que aparece entre paréntesis.

1. **Estado.** `desktop_operations` con `operation="Status"`
   (`tableu status`). Anota la versión de Desktop, si la API está activa y qué
   instancias corren.
   - Si no hay ninguna versión instalada, para: hace falta Tableau Desktop
     2026.3 o posterior.
2. **Activar la API.** Si la API no está activa, `desktop_operations`
   `operation="EnableApi"` (`tableu enable`). Esto escribe `ProjectAthena` en
   `HKCU\Software\Tableau\Tableau <versión>\Debug\FeatureOverrideOn`; es la
   única escritura en el registro y se deshace con `DisableApi`
   (`tableu disable`). Si Desktop ya estaba abierto, avisa de que hay que
   cerrarlo y volver a abrirlo para que el flag surta efecto, y **pide
   confirmación antes de cerrarlo**: puede tener trabajo sin guardar.
3. **Abrir Desktop.** Si no hay ninguna instancia, `desktop_operations`
   `operation="Launch"` (`tableu launch $ARGUMENTS`), con el archivo que pasó el
   usuario si dio uno. Launch se niega a abrir una segunda instancia; no lo
   fuerces.
4. **Comprobar.** Repite `Status` y confirma que la API responde y que la
   instancia aparece. Muestra el resultado tal cual.

Si las herramientas MCP no aparecen, el servidor no arrancó: necesita
[uv](https://docs.astral.sh/uv/) en el PATH. Sugiere `dashkit doctor -b
tableau-authoring`, que revisa uv, Tableau Desktop 2026.3 y el flag.

Para que los hooks de `tableau-guardrails` sean instantáneos, ofrece instalar
la CLI `tableu` en el PATH (sin ella funcionan igual, pero la primera vez la
descargan):

```
uv tool install "git+https://github.com/leonsang/dashkit#subdirectory=bundles/tableau-authoring/server"
```

Termina diciendo qué sigue: describir el dashboard que quiere, o
`/tableau-sdd` para un flujo con especificación aprobada.
