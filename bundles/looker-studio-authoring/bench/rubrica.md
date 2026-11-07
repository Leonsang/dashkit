# Rúbrica (100 puntos) y métricas

| Criterio | Puntos | Cómo se mide |
|---|---|---|
| Informe nuevo con el CSV como origen | 10 | `sources`: un origen con los campos del CSV |
| Mock antes de construir, con arquetipo y tema justificados y cajas | 15 | `mock.md` existe, nombra arquetipo y tema, tiene cajas `[x, y, w, h]` (revisión manual: 5 por cada parte) |
| Dos páginas con los nombres pedidos | 10 | `pages` |
| Spec con lint sin errores y apply sin errores | 10 | salida de `lint` y `apply` |
| Diagnóstico limpio | 15 | `diagnose`: 0 incidencias = 15; 1–2 = 8; más = 0 |
| Auditoría UX | 15 | `ux`: ≥ 90 → 15, ≥ 75 → 10, ≥ 50 → 5 |
| Cobertura del enunciado | 20 | ≥ 4 KPIs con comparación (5), gráfico temporal (5), desglose por local o turno (5), espera y valoración (5) |
| Verificación como el lector | 5 | el agente usó `shot --view` y `check-view` |

Métricas de uso (del propio arnés): tokens, llamadas a herramientas, duración, intervenciones humanas y
fricciones anotadas por el agente. El puntuador automático (`bench/puntuar.mjs`) calcula lo medible; el mock
se revisa a mano.
