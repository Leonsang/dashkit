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

---

# Ronda 2 (2026-11-07, tras arreglar los fallos de la ronda 1)

Mismo escenario y mismo prompt. Arreglos entre rondas: commits `7044527`, `0582eb8`, `3b02233`, `66e032d`
(esquema de orígenes tras un cambio interno del editor, tablas que no se guardaban, guardados aplazados en
ventanas tapadas, dimensión de periodo y comparación, área de dibujo fija, tabla dinámica de una dimensión,
página vacía inicial, cambio de informe silencioso, ámbito del origen en `add_source_field`, cabeceras de
tabla, falsos positivos de `audit_ux`).

| | Haiku (ronda 2) | Sonnet (ronda 2) |
|---|---|---|
| Rúbrica automática | 83 | 85 → **100** con `audit_ux` y el puntuador corregidos |
| Visual (manual, 0–10) | 7 | 8,5 |
| Comparación con el periodo anterior visible | No (falló el campo de fecha) | Sí (+47 % vs. año anterior) |
| Tokens / llamadas / duración | 204k / 66 / 20,5 min | 137k / 32 / 16,5 min |
| Intervenciones humanas | 0 | 0 |

Haiku perdió la fecha por el fallo de `add_source_field` (ámbito ilegible) y trabajó un rato sobre otro informe
abierto; los dos se arreglaron después. Una tercera ejecución de Haiku se paró en el mismo campo (antes del
arreglo con el elemento `<datasource-scope>`).

# Escenario 2: replicar un diseño de marca (`escenario-diseno.md`)

Diseño de referencia hecho en Claude Design (lienzo «Café Brisa · tableros»: marca, resumen y operación),
exportado a `bench/diseno/`. Puntuación base (rúbrica) y fidelidad al diseño (`puntuar.mjs --diseno`).

| | Haiku | Sonnet |
|---|---|---|
| Rúbrica base | 95 | 95 |
| Fidelidad automática | 90 (fondo blanco) | 85 (+10 a mano: fondo crema con una forma a nivel de informe que el puntuador no ve; fuente Roboto) |
| Visual (manual, 0–10) | 7: marco, banner, KPI con icono y comparación, mapa de calor y burbujas; página blanca, tarjetas invisibles, texto en serif, comparación cortada, barras por hora ordenadas por valor | 8,5: casi igual al diseño (crema, tarjetas blancas, línea por hora, burbujas con nombre, banner, KPI); faltan la línea de objetivo, el centro del donut y las barras de la tabla |
| Tokens / llamadas / duración | 199k / 57 / 18,5 min | 219k / 77 / 29,3 min |
| Intervenciones humanas | 0 | 0 |

## Lo que el escenario 2 enseña de dashkit (por arreglar)

1. Las fuentes de Looker Studio no están documentadas: `Inter` se acepta y se pinta en serif.
2. `fill` es el color de la página (ya documentado tras esta ronda); `background` no la pinta.
3. `card.icon` pinta el icono sobre un disco blanco del tema que lo tapa.
4. No hay líneas ni bandas de referencia, ni orden de un gráfico de barras por su dimensión.
5. Un KPI de 250 px corta la frase de comparación: falta un ancho mínimo o un texto de comparación corto
   (`compareLabel`) en la documentación.
6. La navegación propia de Looker sigue visible con `nav-top`.
7. Un botón con fondo de opacidad 0 se pinta blanco.
8. `theme set` parcial no se fusiona como dice la documentación.
9. La salida JSON de la CLI se mezcla con las líneas de registro en stdout.

## Escenario 2, ronda 2 (tras el commit `7acd882`)

| | Haiku | Sonnet |
|---|---|---|
| Rúbrica base | 95 | 90 |
| Fidelidad automática | 85 (fondo blanco, Roboto) | 85 (Roboto; el puntuador no ve sus tarjetas de KPI hechas a mano, que sí llevan icono) |
| Visual (manual, 0–10) | 7,5 (antes 7): comparación cabe, iconos limpios, sans; fondo blanco, iconos de navegación sobre el texto, falta la serie del año anterior, barras por hora por valor | 9 (antes 8,5): crema, tarjetas blancas con icono, Playfair en títulos, barras horizontales, serie del año anterior |
| Tokens / llamadas / duración | 205k / 58 / 24,6 min | 218k / 74 / 36,2 min |
| Intervenciones humanas | 0 | 0 |

Fallos de dashkit de esta ronda: `apply` fundía dos páginas cuando la primera tenía nombre y `page: "active"`
(corregido); Haiku no encontró `sort` porque «Series temporales» no lo nombraba (documentado). Siguen
abiertos: líneas de referencia, ocultar la navegación de Looker, texto en el centro del donut, barras en
tablas, botón transparente pintado de blanco, alineación del texto de los botones.
