# Resultados del benchmark (2026-11-07)

Escenario `escenario.md` (CSV ficticio «Café Brisa» → informe, mock y dos tableros), misma versión de dashkit
para los dos modelos salvo el arreglo de `create_report_from_csv` que necesitó Sonnet para arrancar (Haiku ya
había pasado ese paso sin incidencias).

| | Haiku | Sonnet |
|---|---|---|
| Rúbrica automática (`puntuar.mjs`) | **97** / 100 | **90** / 100 |
| Origen CSV · mock · páginas · spec · diagnóstico | 10 · 15 · 10 · 10 · 15 | 10 · 15 · 10 · 10 · 15 |
| UX (`audit_ux`) | 100 → 15 pts | 68 → 5 pts (cabecera del pivote) |
| Cobertura del enunciado | 17 / 20 (falta espera × valoración) | 20 / 20 |
| Componentes del plan que quedaron | 15 de 19 | 18 de 18 (cambió una tabla por un pivote) |
| Calidad visual (revisión manual, 0–10) | 5: huecos donde se perdieron 4 componentes, sin títulos, leyendas que repiten la métrica, ejes cortados | 7: páginas completas, controles, tema coherente, burbujas; sin título de página ni de gráfico, leyendas redundantes |
| Tokens | 165.562 | 131.893 (+ 197.478 en dos intentos fallidos por la herramienta) |
| Llamadas a herramientas | 51 | 56 |
| Duración | 15,7 min | 21,5 min |
| Intervenciones humanas | 0 | 0 |
| Comparación con el periodo anterior visible | No | No |

## Conclusión

- **Un modelo pequeño sí puede**: Haiku creó el informe desde el CSV, corrigió los tipos con campos de origen,
  escribió un mock justificado y construyó las dos páginas sin ayuda, con diagnóstico limpio.
- **La diferencia está en la recuperación**: ante el mismo fallo de dashkit (tablas que no persisten), Haiku paró
  y dejó huecos; Sonnet lo rodeó con otro tipo de gráfico y además corrigió el tamaño del área del gráfico.
- **Ninguno usó lo más avanzado** (tarjetas con título, iconos, marco con barra lateral) aunque está
  documentado: el diseño se queda en el arquetipo básico.

## Fallos de dashkit que encontró el benchmark (por arreglar)

1. `simple-table` creada en un informe nuevo desde CSV desaparece al recargar; `apply` y `diagnose` no avisan
   (los dos modelos).
2. La comparación con el periodo anterior no se pinta en los scorecards: el origen CSV no tiene dimensión de
   periodo (la fecha llega como texto) y no hay herramienta para fijar `dateRangeDimension`.
3. Las plantillas de barras traen `chartAreaWidth/Height` fijos: el gráfico ocupa un tercio de la caja.
4. `pivot-table` con una sola dimensión da reason 9; los ejes del gráfico de burbujas no usan el alias `as`.
5. `new-from-csv` deja una página vacía delante y el informe sin nombre; `add_source_field` devuelve un
   `source` equivocado; tras `reload`, el esquema del origen puede llegar vacío.
