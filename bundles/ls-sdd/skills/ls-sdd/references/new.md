# new — un informe desde cero

1. Crea `sdd/NNN-<slug>/` y su línea en `sdd/README.md` (*spec en curso*).
2. Conversa por rondas, nunca todo a la vez:
   - audiencia y decisión;
   - fuentes de datos (`inspect_data_sources` si ya están en un informe base);
   - preguntas que debe responder;
   - páginas;
   - tema (`list_theme_presets`).

   Usa como criterio las skills `ls-diseno-layout` y `ls-kpi-scorecards`.
3. Escribe dos archivos.

   **`spec.md`:**
   - audiencia;
   - preguntas → página;
   - KPIs (nombre, métrica, comparación);
   - páginas con sus componentes;
   - controles y filtros (los controles que filtran por un booleano necesitan
     un campo booleano **del origen**: anótalo como tarea de `fields add`);
   - tema;
   - fuera de alcance;
   - criterios de aceptación comprobables.

   **`<informe>.spec.json`:** el spec declarativo que aplicará `build`
   (`grid`, `canvasWidth`, `defaults`, `pages[]` con `components[]` y filas
   de KPIs). Toma como modelo `looker-studio-mcp/examples/*.spec.json` del
   plugin.
4. Ejecuta `lint_report_spec` sobre el `.spec.json` y deja la salida en el
   spec; corrige hasta 0 errores.
5. **Puerta:**
   - aprobación explícita (`Aprobado por <nombre> el <fecha>`);
   - siguiente paso: `ls-sdd tasks`.
