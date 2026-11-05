# survey — levantamiento de un informe existente

1. **Abre el informe:**
   - con `open_report` y su URL `/edit`, si el usuario es dueño y lo pide;
   - si no, primero `copy_report` y después la copia.

   Anota la URL usada.
2. **Evidencia (obligatoria).** Crea `sdd/NNN-survey-<slug>/` y ejecuta:
   - `diagnose_report` (CLI: `node <plugin>/looker-studio-mcp/dist/cli.js
     diagnose`): problemas con su reason y la solución conocida;
   - `audit_ux`: contraste WCAG, tema, paleta, tipografía, layout (0-100);
   - `list_pages`, y `get_report_layout` por página;
   - `inspect_data_sources`: fuentes, campos y tipos (los booleanos y fechas
     importan para controles);
   - `export_report`: el informe completo como JSON, guardado junto al
     levantamiento.

   Pega las salidas en `evidence.md`, sin editar, con un encabezado por
   herramienta.
3. **Escribe `survey.md`** con estas secciones:
   - para qué sirve, con las inferencias marcadas;
   - páginas y qué responde cada una;
   - fuentes de datos;
   - tabla de hallazgos (#, severidad, hallazgo, evidencia, arreglo), usando
     las skills `ls-*` como criterio;
   - preguntas para el dueño;
   - spec del estado actual.
4. **Puerta:** muestra los hallazgos y las preguntas. Ofrece dejarlo como
   documentación o pasar a `ls-sdd spec`.
