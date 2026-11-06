# Data Visualization Engineering Bundle

<p align="center">
  <strong>Ingeniero experto en visualización de datos para cualquier plataforma</strong><br>
  Selección perceptual de gráficos · Encodings honestos · Paletas seguras para daltonismo · Performance en datasets grandes
</p>

---

## ¿Qué Es Esto?

Un bundle transversal que aplica principios de ingeniería de visualización de datos a cualquier plataforma — Power BI, Tableau, Looker Studio, web (D3/Vega), o custom. No es específico a una herramienta: son los principios universales de cómo el ojo humano decodifica visualizaciones, y cómo aplicarlos correctamente.

**Para quién**:
- Analistas que crean dashboards en Power BI / Tableau / Looker Studio
- Desarrolladores que implementan visualizaciones web con D3, Vega, Plotly, ECharts
- Diseñadores de productos que especifican gráficos en aplicaciones
- Cualquiera que necesite que sus visualizaciones digan la verdad, no mentiras bonitas

**No reemplaza** los bundles específicos de plataforma (`tableau-authoring`, `looker-studio-authoring`, etc.) — los **complementa** con expertise en percepción visual, color, accesibilidad y performance.

---

## ¿Qué Aporta?

### 1. Selección Perceptual de Gráficos

**La pregunta elige el gráfico, no la estética.**

Mapeo sistemático desde la pregunta de negocio y la estructura de datos hasta el tipo de gráfico que el ojo decodifica más precisamente:

- **Comparación** → Barras ordenadas (posición/longitud, no ángulo)
- **Tendencia temporal** → Línea conectada (pendiente comunica cambio)
- **Distribución** → Histograma/Box/Violin (no solo la media)
- **Correlación** → Scatter (posición×posición, no doble eje)
- **Parte-del-todo** → Barras apiladas (pie solo con 2-3 porciones)

**Elimina anti-patrones**: pie de 11 porciones, doble eje para fabricar correlación, 3D que distorsiona, rainbow scale que inventa límites.

---

### 2. Honestidad Perceptual

**Cada píxel debe decir la verdad.**

Checklist de validación antes de enviar cualquier gráfico:

- ✅ **Línea base**: barras empiezan en cero; líneas con base no-cero están etiquetadas y justificadas
- ✅ **Encoding**: cantidades en posición/longitud, no área/ángulo; no 3D en datos 2D
- ✅ **Doble eje**: ninguno (usa indexación o small multiples), o explícitamente justificado
- ✅ **Agregación**: la media no oculta distribución bimodal o outliers
- ✅ **Incertidumbre**: mostrada donde los datos la tienen (bandas de error, IC 95%)
- ✅ **Etiquetas**: título = conclusión, ejes + unidades, fuente de datos

**Atrapa mentiras comunes**: eje truncado que exagera diferencias, cherry-picking de rango temporal, área no-proporcional en burbujas.

---

### 3. Color Como Dato (CVD-Safe)

**~8% de hombres tienen daltonismo. Tu paleta debe funcionar para ellos.**

Principios de color:

1. **Tipo de escala = estructura de datos**:
   - Categórica (nominal) → matices distintos, máximo 7
   - Secuencial (magnitud) → un matiz claro→oscuro (viridis, no rainbow)
   - Divergente (desviación desde centro) → dos matices (azul-naranja, no rojo-verde)

2. **Nunca solo color**: agrega forma, etiqueta, o posición
3. **Contraste WCAG AA**: mínimo 3:1 para elementos gráficos, 4.5:1 para texto
4. **Prueba en simulador CVD** (deuteranomalía, protanomalía) antes de enviar

**Paletas recomendadas**: Tableau 10, Okabe-Ito (oro estándar CVD), ColorBrewer, viridis/plasma/inferno.

**Anti-patrones**: rainbow en datos continuos, rojo-verde para binario, más de 7 colores categóricos sin etiquetado directo.

---

### 4. Performance y Renderizado

**Smooth en demo, congelado en producción = fallo.**

Presupuesto de rendering por tecnología:

```
Elementos    Tecnología    Optimización Clave
─────────────────────────────────────────────────
< 1,000      SVG           Agrupa estáticos, transiciones CSS
1k-10k       Canvas        Offscreen canvas, quadtree hit-test
10k-50k      Canvas        Hexbin/heatmap, clipping, decimación
50k-500k     WebGL         GPU shaders, LOD
> 500k       WebGL         Agregación server-side
```

**Técnicas de agregación**:
- **Hexbinning**: scatter denso → hexágonos coloreados por densidad
- **LTTB**: series temporales largas → downsampling que preserva forma
- **Density plot**: millones de puntos → heatmap de 50×50 celdas

**Objetivo**: 60 FPS (< 16ms por frame) al volumen real de producción, no al de la muestra de 200 filas.

---

### 5. Accesibilidad (WCAG 2.1 AA)

**Una visualización accesible comunica el mismo insight a todos.**

Requisitos implementados:

- ✅ **Navegación por teclado**: Tab alcanza todos los elementos, Enter/Space activa, focus visible
- ✅ **ARIA roles**: `role="img"`, `aria-labelledby`, `aria-describedby`, live regions
- ✅ **Alternativas no-visuales**: tabla de datos, resumen textual, sonificación
- ✅ **Contraste**: WCAG AA (3:1 para gráficos, 4.5:1 para texto)
- ✅ **Reduced motion**: respeta `prefers-reduced-motion`, animaciones < 500ms

**Testing**: axe DevTools, Lighthouse, screen reader (NVDA/JAWS/VoiceOver), navegación solo-teclado.

---

## Estructura del Bundle

```
bundles/dataviz-engineering/
├── skills/
│   └── dataviz-engineering/
│       ├── SKILL.md                        # Skill principal (agente completo)
│       └── references/
│           ├── chart-selection.md          # Pregunta → tipo de gráfico
│           ├── perceptual-honesty.md       # Checklist de honestidad
│           ├── color-for-data.md           # Paletas CVD-safe, escalas
│           ├── performance-rendering.md    # SVG/Canvas/WebGL, agregación
│           └── accessibility.md            # WCAG, ARIA, alternativas
├── agents/
│   └── dataviz-engineer.agent.json         # Config del subagente
├── commands/
│   ├── chart-audit.sh                      # Auditoría automatizada
│   └── cvd-check.sh                        # Validación de daltonismo
└── README.md                               # Este archivo
```

---

## Cómo Usarlo

### Opción 1: Con un Bundle de Plataforma

Instala junto con el bundle específico:

```bash
dashkit install --bundle tableau-authoring,dataviz-engineering --agents cursor
```

El bundle de plataforma (`tableau-authoring`) te da las herramientas (MCP server, skills de creación), y `dataviz-engineering` te da los principios de qué crear (selección de gráfico, color, honestidad).

### Opción 2: Standalone (Web / Custom)

Si trabajas con D3, Vega, Plotly, ECharts, o visualización custom en web:

```bash
dashkit install --bundle dataviz-engineering --agents cursor,codex
```

Sin dependencias de plataforma — todos los principios aplican igual.

### Opción 3: Auditoría de Visualizaciones Existentes

Usa el subagente para auditar dashboards o gráficos ya creados:

```bash
# En tu herramienta AI
/dataviz audit mi-dashboard.pbix
/dataviz audit https://app.tableau.com/...
/dataviz audit visualizacion.html
```

Recibes un reporte con:
- Problemas de honestidad perceptual (ejes truncados, doble eje, etc.)
- Fallos de accesibilidad (contraste, navegación por teclado)
- Problemas de color (daltonismo, contraste)
- Performance (volumen real vs capacidad de rendering)
- Sugerencias concretas de mejora

---

## Comandos del Subagente

### `/dataviz audit <archivo_o_url>`

Auditoría completa de una visualización existente:

```
/dataviz audit mi-dashboard.pbix
```

**Qué verifica**:
- Tipo de gráfico vs pregunta que responde
- Encoding (posición/longitud vs ángulo/área)
- Línea base y ejes (truncados, doble eje)
- Paleta de colores (CVD-safe, contraste)
- Accesibilidad (navegación, ARIA, alternativas)
- Performance (volumen de datos, frame rate)

**Output**: Reporte markdown con problemas encontrados y recomendaciones específicas.

---

### `/dataviz recommend --question "<pregunta>" --data <archivo>`

Recomendar tipo de gráfico óptimo:

```
/dataviz recommend --question "¿Qué región vende más?" --data ventas.csv
```

**Proceso**:
1. Analiza estructura de datos (tipos, cardinalidad, volumen)
2. Mapea pregunta → tipo de comparación
3. Selecciona encoding por jerarquía perceptual
4. Propone 2-3 opciones con pros/contras
5. Genera prototipo de la recomendada

---

### `/dataviz palette <colores_hex>`

Validar paleta de colores:

```
/dataviz palette #E15759,#59A14F,#4E79A7
```

**Qué verifica**:
- Distinguibilidad en deuteranomalía (rojo-verde)
- Distinguibilidad en protanomalía
- Contraste WCAG AA en fondo blanco y oscuro
- Luminancia uniforme (categórica) o progresiva (secuencial)

**Output**: Aprobado/Rechazado + simulación CVD + alternativas sugeridas si falla.

---

### `/dataviz optimize <archivo>`

Optimizar performance de visualización:

```
/dataviz optimize grafico-scatter.html
```

**Proceso**:
1. Mide frame time actual (objetivo < 16ms)
2. Identifica bottleneck (scripting, layout, paint)
3. Determina tecnología óptima (SVG/Canvas/WebGL)
4. Aplica agregación si corresponde (hexbin, LTTB)
5. Re-implementa y valida 60 FPS

---

## Integración por Plataforma

### Con Power BI

```
Aplica:
  - Seleccionar visuals built-in cuando sean suficientes (barra > custom complejo)
  - Definir paletas en tema JSON para consistencia
  - DAX para percentiles, distribuciones, bandas de error
  - Importar vs DirectQuery según volumen
  
Audita:
  - Gráficos de pie con >3 porciones → barras ordenadas
  - Ejes truncados en barras
  - Rainbow scales en heatmaps → secuencial uniforme
```

### Con Tableau

```
Aplica:
  - Encoding por Rows/Columns (posición), Color, Size, Shape
  - Parámetros para alternar entre vistas
  - Extracts para volumen grande
  - Valida con `tableau_operations Lint`
  
Audita:
  - Doble eje sin justificación → indexar o small multiples
  - Barras con línea base no-cero
  - Paletas no CVD-safe → Tableau 10 o Color Blind
```

### Con Looker Studio

```
Aplica:
  - Controles de filtro vs filtros implícitos
  - Campos calculados de fuente para agregaciones costosas
  - Temas personalizados para paletas consistentes
  - Auditoría UX con `diagnose`
  
Audita:
  - Muchas métricas en un gráfico → small multiples
  - Color sin etiquetas → agregar data labels
  - Performance con grandes datasets → filtros de fecha
```

### Con D3/Vega (Web)

```
Aplica:
  - D3 para control total, Observable Plot para exploración
  - Vega-Lite para specs declarativas
  - Canvas para 1k+, WebGL (deck.gl) para 50k+
  - ARIA roles, tabla alternativa, navegación por teclado
  
Audita:
  - SVG con 10k+ elementos → migrar a canvas
  - Hover sin focus equivalente → agregar tabindex y keydown
  - Sin alternativa para screen readers → tabla + ARIA
```

---

## Principios Fundamentales

### 1. La pregunta elige el gráfico

```
Pregunta: "¿Cómo se comparan las ventas por región?"
→ Barras horizontales ordenadas (longitud = precisión)

Pregunta: "¿Cómo han cambiado las ventas en el tiempo?"
→ Línea conectada (pendiente = tendencia)

NO: "Hagamos un donut porque luce moderno"
```

### 2. Jerarquía de precisión perceptual

```
Posición en escala común     ~3% error   ← MEJOR
Longitud                     ~5% error
Ángulo / Pendiente           ~15% error
Área                         ~20% error
Volumen / 3D                 ~40% error
Color (cuantitativo)         impreciso   ← PEOR
```

### 3. Las barras siempre empiezan en cero

```
❌ Barras de 98, 99, 100 con eje 95-100
   → Barra de 100 se ve 5x más grande que la de 98
   → Mentira visual

✅ Barras de 98, 99, 100 con eje 0-100
   → Diferencia real (2%) es visualmente honesta
```

### 4. Color nunca solo

```
❌ Rojo = negativo, Verde = positivo (solo color)
   → Falla para daltonismo rojo-verde (8% de hombres)

✅ Rojo + ▼ + "−$500" = negativo
   Verde + ▲ + "+$300" = positivo
   → Color + forma + etiqueta = redundancia segura
```

### 5. Renderizar al volumen real

```
❌ Smooth con 200 filas de muestra
   Congelado con 80k filas de producción

✅ Prueba con volumen real desde el inicio
   SVG < 1k elementos
   Canvas 1k-50k
   WebGL > 50k
   O agregar primero (hexbin, LTTB)
```

---

## Métricas de Éxito

Un gráfico bien diseñado cumple:

- ✅ **Insight en 3 segundos**: un lector fresco obtiene la conclusión sin explicación
- ✅ **Honestidad perceptual**: líneas base, ejes, agregación pasan el checklist
- ✅ **CVD-safe**: sobrevive simulador de daltonismo y escala de grises
- ✅ **Performance**: 60 FPS al volumen real de producción
- ✅ **Accesible**: navegable por teclado, con alternativas no-visuales, contraste WCAG AA
- ✅ **Guía atención**: jerarquía de información diseñada, no accidental

Si un gráfico falla cualquiera, no está listo.

---

## Anti-Patrones Comunes (y Cómo Arreglarlos)

### ❌ Pie de 11 porciones
**Problema**: El ojo no puede comparar ángulos
**Fix**: Barras horizontales ordenadas (de mayor a menor)

### ❌ Doble eje Y para "mostrar correlación"
**Problema**: Deslizar escalas fabrica cualquier correlación
**Fix**: Indexar ambas a 100 en el punto inicial, o small multiples

### ❌ Barras con eje truncado
**Problema**: Exagera diferencias (98 vs 100 se ve como 5x)
**Fix**: Eje de 0-100, o cambiar a línea si quieres mostrar cambio relativo

### ❌ Rojo-Verde para Pasa/Falla
**Problema**: Daltonismo rojo-verde (8% de hombres)
**Fix**: Azul-Naranja + iconos (✓ / ✗)

### ❌ Rainbow scale en heatmap
**Problema**: Crea bandas falsas de luminancia, inventa límites
**Fix**: Viridis (secuencial uniforme) o azul-naranja (divergente)

### ❌ SVG con 50k puntos
**Problema**: Frame rate < 1 FPS, browser congelado
**Fix**: Canvas + hexbin (50k → 1k hexágonos), o WebGL

### ❌ Gráfico sin alternativa textual
**Problema**: Inaccesible para screen readers
**Fix**: Tabla de datos + ARIA, o resumen textual con hallazgos clave

---

## Recursos y Referencias

**Dentro del bundle**:
- `dataviz://chart-selection` — Pregunta → tipo de gráfico
- `dataviz://perceptual-honesty` — Checklist completo
- `dataviz://color-for-data` — Paletas CVD-safe
- `dataviz://performance-rendering` — SVG/Canvas/WebGL
- `dataviz://accessibility` — WCAG, ARIA, alternativas

**Papers y libros**:
- "The Visual Display of Quantitative Information" (Edward Tufte)
- "Show Me the Numbers" (Stephen Few)
- "Visualization Analysis and Design" (Tamara Munzner)
- "Grammar of Graphics" (Leland Wilkinson)

**Herramientas**:
- Simuladores CVD: Coblis, Chrome DevTools, Stark
- Contraste: WebAIM, Colour Contrast Analyser
- Accesibilidad: axe DevTools, Lighthouse, Pa11y
- Paletas: ColorBrewer, Viz Palette, Adobe Color (modo accessible)

**Librerías**:
- D3: https://d3js.org/ (SVG + Canvas, control total)
- Vega/Vega-Lite: https://vega.github.io/ (declarativo)
- Observable Plot: https://observablehq.com/plot/ (exploración rápida)
- deck.gl: https://deck.gl/ (WebGL geoespacial)
- ECharts: https://echarts.apache.org/ (canvas-first, alto nivel)

---

## Licencia

MIT — igual que dashkit.

---

## Créditos

Principios derivados de:
- Jacques Bertin ("Semiology of Graphics", 1967)
- William S. Cleveland & Robert McGill (estudios de percepción gráfica, 1984)
- Edward Tufte (data-ink ratio, chartjunk)
- Stephen Few (perceptual edge)
- WCAG / W3C (accesibilidad web)
- Investigación contemporánea en visualización (IEEE VIS, EuroVis)

Implementado por el proyecto dashkit como bundle transversal aplicable a cualquier plataforma de dashboards o visualización web.
