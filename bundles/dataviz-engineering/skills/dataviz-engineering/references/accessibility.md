# Accesibilidad en Visualización de Datos

**Principio fundamental**: Una visualización accesible comunica el mismo insight a todos los usuarios, independientemente de su capacidad visual, motora o cognitiva.

## Por Qué Importa

### Estadísticas de Discapacidad
- **~15% de la población mundial** tiene alguna discapacidad
- **8% de hombres**: daltonismo (deficiencia visión color)
- **2.2 mil millones**: problemas de visión (OMS)
- **Usuarios de lectores de pantalla**: ~2-3% del tráfico web
- **Usuarios solo-teclado**: 10-20% (disability, preference, power users)

### Requisitos Legales
- **ADA** (EE.UU.): Americans with Disabilities Act
- **Section 508** (EE.UU.): Ley de accesibilidad tecnológica federal
- **WCAG 2.1/2.2**: Estándares internacionales (A, AA, AAA)
- **EAA** (Europa): European Accessibility Act

**WCAG AA** es el objetivo mínimo para sitios públicos.

---

## Principios POUR

### 1. Perceptible
El usuario puede percibir la información

### 2. Operable
El usuario puede interactuar con la interfaz

### 3. Comprensible
El usuario puede entender la información

### 4. Robusto
El contenido funciona con tecnologías asistivas

---

## Color y Contraste

### WCAG Niveles de Contraste

**Texto normal** (< 18pt):
- **AA**: 4.5:1 mínimo
- **AAA**: 7:1 mínimo

**Texto grande** (≥ 18pt o 14pt bold):
- **AA**: 3:1 mínimo
- **AAA**: 4.5:1 mínimo

**Elementos gráficos** (barras, líneas, iconos):
- **AA**: 3:1 mínimo contra fondo

### Herramientas de Verificación

```
WebAIM Contrast Checker: https://webaim.org/resources/contrastchecker/
Colour Contrast Analyser (app): https://www.tpgi.com/color-contrast-checker/
Chrome DevTools: Inspect → Contrast ratio
```

### Ejemplo de Contraste

```css
/* ❌ MAL: Gris claro sobre blanco */
color: #CCCCCC;
background: #FFFFFF;
/* Ratio: 1.6:1 (falla AA) */

/* ✅ BIEN: Gris oscuro sobre blanco */
color: #595959;
background: #FFFFFF;
/* Ratio: 7:1 (pasa AAA) */

/* ✅ BIEN: Azul oscuro sobre blanco */
color: #0056B3;
background: #FFFFFF;
/* Ratio: 8.2:1 (pasa AAA) */
```

### Color Nunca Solo

**Regla de oro**: Nunca codifiques información solo en color.

```
❌ MAL: Rojo = negativo, Verde = positivo (solo color)

✅ BIEN: Rojo + ▼ = negativo, Verde + ▲ = positivo
         (color + forma)

✅ BIEN: Rojo + "−$500" = negativo, Verde + "+$300" = positivo
         (color + etiqueta con signo)
```

**Aplica a**:
- Mapas de calor: agrega etiquetas de valor
- Series de líneas: usa shape markers (círculo, cuadrado, triángulo)
- Barras apiladas: usa patrones/texturas además de color
- Estados (activo/inactivo): agrega iconos o etiquetas

---

## Navegación por Teclado

### Requisitos Básicos

Todos los elementos interactivos deben ser:
1. **Alcanzables** por Tab
2. **Activables** por Enter/Space
3. **Visualmente indicados** cuando tienen focus

### Focus Visible

```css
/* ❌ Nunca hacer esto */
*:focus {
  outline: none; /* Mata accesibilidad */
}

/* ✅ Focus visible claro */
.chart-element:focus {
  outline: 2px solid #0056B3;
  outline-offset: 2px;
}

/* ✅ O usar focus-visible (solo teclado) */
.chart-element:focus-visible {
  outline: 3px solid #FF6B00;
  outline-offset: 3px;
}
```

### Orden de Tabulación Lógico

**Regla**: `tabindex` debe seguir orden visual y lógico

```html
<!-- ✅ Orden lógico (gráfico → leyenda → controles) -->
<svg tabindex="0" role="img" aria-labelledby="chart-title">
  <!-- Chart content -->
</svg>
<div class="legend" tabindex="0" role="region" aria-label="Leyenda">
  <!-- Legend items -->
</div>
<div class="controls">
  <button>Filtrar por Región</button>
  <button>Exportar</button>
</div>

<!-- ❌ NO usar tabindex > 0 (crea orden impredecible) -->
<div tabindex="100">...</div>
```

### Atajos de Teclado

```javascript
// Navegación común
chart.addEventListener('keydown', (e) => {
  switch(e.key) {
    case 'ArrowRight':
      focusNextDataPoint();
      break;
    case 'ArrowLeft':
      focusPreviousDataPoint();
      break;
    case 'Home':
      focusFirstDataPoint();
      break;
    case 'End':
      focusLastDataPoint();
      break;
    case 'Enter':
    case ' ':
      selectFocusedDataPoint();
      break;
  }
});
```

---

## ARIA (Accessible Rich Internet Applications)

### Roles Semánticos

```html
<!-- ✅ Gráfico como imagen con descripción -->
<svg role="img" aria-labelledby="chart-title chart-desc">
  <title id="chart-title">Ventas Trimestrales 2023</title>
  <desc id="chart-desc">
    Gráfico de barras mostrando ventas por trimestre.
    Q1: $450k, Q2: $520k, Q3: $480k, Q4: $610k.
    Tendencia creciente, con pico en Q4.
  </desc>
  <!-- Chart elements -->
</svg>

<!-- ✅ Región interactiva -->
<div role="region" aria-label="Filtros de gráfico">
  <button aria-pressed="false">Región Norte</button>
  <button aria-pressed="true">Región Sur</button>
</div>

<!-- ✅ Live region para updates dinámicos -->
<div aria-live="polite" aria-atomic="true" class="sr-only">
  <!-- Anuncia cambios sin interrumpir -->
  Gráfico actualizado: 150 puntos visibles
</div>
```

### Atributos ARIA Útiles

```html
<!-- Label vs LabelledBy vs DescribedBy -->
<button aria-label="Cerrar">X</button>

<div id="chart-label">Ventas Anuales</div>
<svg aria-labelledby="chart-label">...</svg>

<button aria-describedby="help-text">Filtrar</button>
<span id="help-text" class="sr-only">
  Filtra datos por categoría seleccionada
</span>

<!-- Estados -->
<button aria-expanded="false">Ver Detalles</button>
<button aria-pressed="true">Activo</button>
<input aria-invalid="true" aria-errormessage="error-msg" />

<!-- Valores -->
<div role="progressbar" 
     aria-valuenow="60" 
     aria-valuemin="0" 
     aria-valuemax="100">
  60% completado
</div>
```

### Texto Solo para Screen Readers

```css
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
```

```html
<svg role="img" aria-labelledby="chart-title">
  <title id="chart-title">Distribución de Edades</title>
  <!-- Visual chart -->
</svg>

<!-- Tabla alternativa para screen readers -->
<table class="sr-only">
  <caption>Distribución de Edades (Datos)</caption>
  <thead>
    <tr><th>Rango de Edad</th><th>Cantidad</th><th>Porcentaje</th></tr>
  </thead>
  <tbody>
    <tr><td>18-25</td><td>150</td><td>30%</td></tr>
    <tr><td>26-35</td><td>200</td><td>40%</td></tr>
    <tr><td>36-45</td><td>100</td><td>20%</td></tr>
    <tr><td>46+</td><td>50</td><td>10%</td></tr>
  </tbody>
</table>
```

---

## Alternativas No-Visuales

### 1. Tabla de Datos

**Cuándo**: Siempre como fallback

```html
<!-- Toggle entre vista gráfica y tabla -->
<button onclick="toggleView()">
  <span aria-hidden="true">📊</span>
  Ver como Tabla
</button>

<div id="chart-view" aria-hidden="false">
  <svg><!-- Chart --></svg>
</div>

<div id="table-view" aria-hidden="true" hidden>
  <table>
    <!-- Datos en formato tabular -->
  </table>
</div>
```

### 2. Resumen Textual

**Cuándo**: Gráficos complejos

```html
<details>
  <summary>Descripción Detallada del Gráfico</summary>
  <div>
    <h3>Hallazgos Clave</h3>
    <ul>
      <li><strong>Tendencia general</strong>: Crecimiento del 25% año tras año</li>
      <li><strong>Valor máximo</strong>: Diciembre 2023 con $1.2M</li>
      <li><strong>Valor mínimo</strong>: Marzo 2023 con $450k</li>
      <li><strong>Outlier</strong>: Spike en julio por campaña especial</li>
      <li><strong>Patrón estacional</strong>: Picos en Q4 cada año</li>
    </ul>
    
    <h3>Datos Completos</h3>
    <table><!-- Todos los datos --></table>
  </div>
</details>
```

### 3. Sonificación

**Cuándo**: Series temporales, tendencias

```javascript
// Web Audio API para sonificar datos
function sonifyData(data) {
  const audioContext = new AudioContext();
  const duration = 0.1; // segundos por punto
  
  data.forEach((d, i) => {
    const osc = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    // Frecuencia proporcional al valor
    osc.frequency.value = scaleLinear()
      .domain([minValue, maxValue])
      .range([200, 800])(d.value); // 200-800 Hz
    
    osc.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    const startTime = i * duration;
    osc.start(startTime);
    osc.stop(startTime + duration * 0.8);
  });
}

// Activar con botón
<button onclick="sonifyData(chartData)">
  <span aria-hidden="true">🔊</span>
  Reproducir Datos como Audio
</button>
```

---

## Interacción Accesible

### Tooltips / Hover States

**Problema**: Tooltips activados solo por mouse excluyen usuarios de teclado

**Solución**: Activar por focus también

```javascript
// ✅ Tooltip activado por hover Y focus
const point = svg.append('circle')
  .attr('tabindex', 0)
  .attr('role', 'button')
  .attr('aria-label', d => `${d.label}: ${d.value}`)
  .on('mouseenter focus', showTooltip)
  .on('mouseleave blur', hideTooltip);

function showTooltip(event, d) {
  const tooltip = d3.select('#tooltip');
  tooltip
    .style('display', 'block')
    .style('left', event.pageX + 'px')
    .style('top', event.pageY + 'px')
    .html(`
      <strong>${d.label}</strong><br>
      Valor: ${d.value}<br>
      ${d.additionalInfo}
    `);
  
  // Anunciar a screen readers
  liveRegion.textContent = `${d.label}: ${d.value}`;
}
```

### Zoom y Pan

**Hacer accesible con teclado**:

```javascript
const zoom = d3.zoom()
  .on('zoom', (event) => {
    svg.attr('transform', event.transform);
  });

svg.call(zoom);

// Agregar controles de teclado
document.addEventListener('keydown', (e) => {
  const panAmount = 20;
  const zoomFactor = 0.1;
  
  if (e.ctrlKey || e.metaKey) {
    switch(e.key) {
      case '+':
      case '=':
        zoom.scaleBy(svg.transition(), 1 + zoomFactor);
        e.preventDefault();
        break;
      case '-':
      case '_':
        zoom.scaleBy(svg.transition(), 1 - zoomFactor);
        e.preventDefault();
        break;
      case '0':
        zoom.transform(svg.transition(), d3.zoomIdentity);
        e.preventDefault();
        break;
    }
  } else {
    switch(e.key) {
      case 'ArrowUp':
        zoom.translateBy(svg.transition(), 0, panAmount);
        break;
      case 'ArrowDown':
        zoom.translateBy(svg.transition(), 0, -panAmount);
        break;
      case 'ArrowLeft':
        zoom.translateBy(svg.transition(), panAmount, 0);
        break;
      case 'ArrowRight':
        zoom.translateBy(svg.transition(), -panAmount, 0);
        break;
    }
  }
});
```

### Filtros y Controles

```html
<!-- ✅ Controles accesibles -->
<fieldset>
  <legend>Filtrar por Región</legend>
  <label>
    <input type="checkbox" checked 
           aria-describedby="region-north-count">
    Norte
    <span id="region-north-count" class="sr-only">
      45 puntos de datos
    </span>
  </label>
  <label>
    <input type="checkbox" checked>
    Sur
    <span class="sr-only">32 puntos de datos</span>
  </label>
</fieldset>

<!-- Anunciar cuando filtros cambian -->
<div aria-live="polite" aria-atomic="true" class="sr-only" id="filter-status">
  <!-- JavaScript actualiza esto -->
</div>

<script>
function updateFilters(selectedRegions) {
  filterData(selectedRegions);
  renderChart();
  
  // Anunciar a screen readers
  const count = getVisiblePointsCount();
  document.getElementById('filter-status').textContent = 
    `Filtros aplicados. ${count} puntos visibles.`;
}
</script>
```

---

## Motion y Animación

### Reduced Motion

**Requisito WCAG 2.1**: Respetar preferencia `prefers-reduced-motion`

```css
/* Animaciones por defecto */
.bar {
  transition: height 0.3s ease-out;
}

/* Deshabilitar si usuario lo prefiere */
@media (prefers-reduced-motion: reduce) {
  .bar {
    transition: none;
  }
  
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

```javascript
// Detectar en JavaScript
const prefersReducedMotion = window.matchMedia(
  '(prefers-reduced-motion: reduce)'
).matches;

if (!prefersReducedMotion) {
  // Aplicar animaciones suaves
  chart.transition().duration(500);
} else {
  // Sin animación
  chart.transition().duration(0);
}
```

### Límites de Animación

```
❌ Evitar:
  - Parpadeo > 3 veces por segundo (riesgo epilepsia)
  - Animaciones que no se pueden pausar
  - Auto-play sin control de usuario
  - Parallax intenso (vértigo)

✅ Hacer:
  - Animaciones < 500ms (se sienten instantáneas)
  - Botón de Pause/Play para animaciones largas
  - Avisar antes de cambios bruscos
```

---

## Testing de Accesibilidad

### Herramientas Automatizadas

**axe DevTools** (Chrome extension):
```bash
npm install --save-dev @axe-core/cli
npx axe https://your-chart-page.com
```

**Lighthouse** (Chrome DevTools):
- Auditoría → Accessibility
- Revisa contraste, ARIA, navegación por teclado

**Pa11y**:
```bash
npm install -g pa11y
pa11y https://your-chart-page.com
```

### Testing Manual

**Checklist básico**:

```
□ Desconectar mouse, navegar solo con teclado (Tab, Enter, flechas)
  - ¿Puedes alcanzar todos los elementos interactivos?
  - ¿El focus es visible?
  - ¿El orden de tabulación es lógico?

□ Activar screen reader (NVDA, JAWS, VoiceOver)
  - ¿Se anuncia el propósito del gráfico?
  - ¿Los valores son legibles?
  - ¿Los tooltips se anuncian?

□ Zoom a 200% (WCAG 1.4.4)
  - ¿El contenido sigue legible?
  - ¿Sin scroll horizontal?

□ Conversión a escala de grises
  - ¿El significado se preserva?

□ Simulador de daltonismo
  - ¿Los colores críticos son distinguibles?

□ Modo alto contraste (Windows High Contrast Mode)
  - ¿Bordes y formas visibles?

□ Modo oscuro
  - ¿Contraste adecuado?
```

### Usuarios Reales

**Lo mejor**: Testing con usuarios con discapacidades reales

```
- Usuarios de screen readers
- Usuarios con daltonismo
- Usuarios solo-teclado
- Usuarios con baja visión
- Usuarios con limitaciones motoras
```

---

## Patrones por Tipo de Gráfico

### Gráfico de Barras

```html
<svg role="img" aria-labelledby="bar-title bar-desc">
  <title id="bar-title">Ventas por Región 2023</title>
  <desc id="bar-desc">
    Gráfico de barras horizontales comparando ventas por región.
    Norte lidera con $1.2M, seguido de Sur con $980k,
    Este con $750k, y Oeste con $650k.
  </desc>
  
  <g role="list" aria-label="Barras de datos">
    <g role="listitem">
      <rect class="bar" tabindex="0"
            role="button"
            aria-label="Norte: $1.2 millones, 35% del total"
            .../>
    </g>
    <!-- Más barras... -->
  </g>
</svg>

<!-- Tabla alternativa -->
<table class="sr-only">
  <caption>Ventas por Región 2023 (Datos)</caption>
  <thead>
    <tr><th>Región</th><th>Ventas</th><th>% Total</th></tr>
  </thead>
  <tbody>
    <tr><td>Norte</td><td>$1,200,000</td><td>35%</td></tr>
    <tr><td>Sur</td><td>$980,000</td><td>28%</td></tr>
    <tr><td>Este</td><td>$750,000</td><td>22%</td></tr>
    <tr><td>Oeste</td><td>$650,000</td><td>15%</td></tr>
  </tbody>
</table>
```

### Gráfico de Líneas

```html
<svg role="img" aria-labelledby="line-title">
  <title id="line-title">
    Temperatura Diaria - Enero 2024:
    Rango de 18°C a 25°C, promedio 21.5°C, tendencia creciente
  </title>
  
  <!-- Línea como grupo navegable -->
  <g role="list" aria-label="Serie temporal de temperatura">
    <path class="line" aria-hidden="true" d="..."/>
    
    <!-- Puntos interactivos (cada 2-3 días para no saturar) -->
    <circle role="listitem" tabindex="0"
            aria-label="1 de enero: 20 grados Celsius"
            cx="..." cy="..."/>
    <circle role="listitem" tabindex="0"
            aria-label="4 de enero: 21 grados Celsius"
            cx="..." cy="..."/>
    <!-- etc. -->
  </g>
</svg>
```

### Scatter Plot

```html
<!-- Con muchos puntos, no hacer todos focusables -->
<svg role="img" aria-labelledby="scatter-title">
  <title id="scatter-title">
    Relación entre Inversión en Marketing y Ventas:
    Correlación positiva fuerte (r = 0.85).
    Rango: $10k-$500k inversión, $50k-$2M ventas.
    Outlier: Punto con $200k inversión y $1.8M ventas.
  </title>
  
  <!-- Región interactiva para exploración -->
  <g tabindex="0" role="button" 
     aria-label="Explorar puntos de datos. Use flechas para navegar.">
    <!-- Puntos rendered -->
  </g>
</svg>

<!-- Estadísticas clave accesibles -->
<dl class="sr-only">
  <dt>Correlación</dt>
  <dd>0.85 (fuerte positiva)</dd>
  <dt>Número de puntos</dt>
  <dd>150</dd>
  <dt>Outliers detectados</dt>
  <dd>3 puntos</dd>
</dl>
```

---

## Recursos y Referencias

**Estándares**:
- WCAG 2.2: https://www.w3.org/WAI/WCAG22/quickref/
- ARIA Authoring Practices: https://www.w3.org/WAI/ARIA/apg/
- Section 508: https://www.section508.gov/

**Guías específicas de visualización**:
- "Chartability" (Fizz Studio): https://chartability.fizz.studio/
- "Data Visualization Accessibility" (Lisa Charlotte Muth)
- "Accessible SVG Charts" (CSS-Tricks)

**Herramientas**:
- axe DevTools: https://www.deque.com/axe/devtools/
- WAVE: https://wave.webaim.org/
- Colour Contrast Analyser: https://www.tpgi.com/color-contrast-checker/
- Screen readers: NVDA (free), JAWS, VoiceOver

**Testing**:
- Pa11y: https://pa11y.org/
- Playwright (a11y testing): https://playwright.dev/
- Jest-axe: https://github.com/nickcolley/jest-axe
