# Performance y Renderizado

**Principio fundamental**: El gráfico debe renderizar al volumen REAL de datos de producción, no al de la demo. Smooth en desarrollo y congelado en producción = fallo.

## Presupuesto de Rendering

### Objetivos de Performance

**60 FPS = 16.67ms por frame**
```
Frame budget:
  < 16ms   ✅ Smooth (60 FPS)
  16-33ms  ⚠️  Laggy (30-60 FPS)
  > 33ms   ❌ Frozen (<30 FPS)
```

**Breakdown típico**:
```
JavaScript:  ~3-5ms   (cálculos, hit-testing)
Layout:      ~2-3ms   (posicionar elementos)
Paint:       ~5-7ms   (dibujar píxeles)
Composite:   ~1-2ms   (capas finales)
─────────────────────
Total:       ~13ms    (presupuesto usado)
Margen:      ~3ms     (para picos)
```

---

## Tecnologías de Rendering: Cuándo Usar Cada Una

### SVG (Scalable Vector Graphics)

**Rango ideal**: 1 - 1,000 elementos

**Ventajas**:
- ✅ Nítido a cualquier zoom
- ✅ DOM accesible (hover, click, ARIA)
- ✅ CSS y transiciones suaves
- ✅ Inspect en DevTools
- ✅ Accesibilidad built-in

**Desventajas**:
- ❌ Cada elemento es un nodo DOM
- ❌ Re-paint costoso con muchos elementos
- ❌ Muere en 10k+ elementos

**Cuándo usar**:
```javascript
if (dataPoints < 1000 && needsInteraction) {
  use('SVG');
}
```

**Ejemplo típico**:
- Barras: <50 barras
- Líneas: <10 series, <500 puntos por serie
- Scatter: <1,000 puntos
- Network: <100 nodos

**Optimizaciones**:
```javascript
// 1. Agrupa elementos estáticos
<g class="static-layer">
  {/* Elementos que no cambian */}
</g>

// 2. Usa `will-change` para animaciones
.animated-bar {
  will-change: transform;
}

// 3. Evita re-render completo, muta atributos
d3.select('.bar')
  .attr('height', newHeight); // Mejor que recrear
```

---

### Canvas 2D

**Rango ideal**: 1,000 - 50,000 elementos

**Ventajas**:
- ✅ Un solo nodo DOM
- ✅ Dibuja miles de formas rápidamente
- ✅ Control completo de píxeles
- ✅ Frame rate consistente

**Desventajas**:
- ❌ No accesible por defecto (no DOM)
- ❌ Hit-testing manual (quadtree)
- ❌ No auto-scaling (gestión manual de DPI)
- ❌ Debugging más difícil

**Cuándo usar**:
```javascript
if (dataPoints > 1000 && dataPoints < 50000) {
  use('Canvas');
}
```

**Ejemplo típico**:
- Scatter: 1k - 50k puntos
- Líneas: Series con 1k+ puntos
- Heatmaps: 100x100+ celdas
- Brushing/zooming sobre datos grandes

**Técnicas de optimización**:

#### 1. Doble Buffering (Off-screen Canvas)
```javascript
// Pre-renderiza elementos estáticos en off-screen canvas
const offscreenCanvas = new OffscreenCanvas(width, height);
const offscreenCtx = offscreenCanvas.getContext('2d');

// Dibuja elementos estáticos una vez
offscreenCtx.fillRect(0, 0, width, height);
drawAxes(offscreenCtx);

// En cada frame, copia desde offscreen + dibuja dinámico
function render() {
  ctx.drawImage(offscreenCanvas, 0, 0);
  drawDynamicElements(ctx); // Solo lo que cambió
}
```

#### 2. Quadtree para Hit-Testing
```javascript
import { quadtree } from 'd3-quadtree';

// Construir quadtree una vez
const tree = quadtree()
  .x(d => d.x)
  .y(d => d.y)
  .addAll(data);

// Buscar punto más cercano en O(log n)
canvas.addEventListener('mousemove', (event) => {
  const [mx, my] = getMouseCoords(event);
  const closest = tree.find(mx, my, searchRadius);
  if (closest) showTooltip(closest);
});
```

#### 3. Renderizado Parcial (Clipping)
```javascript
// Solo dibuja lo visible en viewport
function drawVisiblePoints(ctx, data, viewport) {
  const visible = data.filter(d =>
    d.x >= viewport.xMin && d.x <= viewport.xMax &&
    d.y >= viewport.yMin && d.y <= viewport.yMax
  );
  
  visible.forEach(d => {
    ctx.beginPath();
    ctx.arc(d.x, d.y, radius, 0, 2 * Math.PI);
    ctx.fill();
  });
}
```

#### 4. Decimación / Downsampling
```javascript
// Renderizar cada N puntos cuando estás zoom-out
function getDecimatedData(data, zoomLevel) {
  const step = Math.ceil(1 / zoomLevel);
  return data.filter((_, i) => i % step === 0);
}
```

#### 5. Gestión de HiDPI
```javascript
function setupHiDPI(canvas) {
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  
  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);
  
  canvas.style.width = rect.width + 'px';
  canvas.style.height = rect.height + 'px';
  
  return ctx;
}
```

---

### WebGL

**Rango ideal**: 50,000 - 10,000,000+ elementos

**Ventajas**:
- ✅ GPU-accelerated (paralelo masivo)
- ✅ Millones de puntos a 60 FPS
- ✅ Shaders personalizados

**Desventajas**:
- ❌ Curva de aprendizaje empinada
- ❌ Debugging complejo
- ❌ Diferentes GPUs = diferentes resultados
- ❌ Más código boilerplate

**Cuándo usar**:
```javascript
if (dataPoints > 50000 || needs3D || needsGPUShaders) {
  use('WebGL');
}
```

**Librerías recomendadas**:

#### deck.gl (Mapas y Visualizaciones Geoespaciales)
```javascript
import { ScatterplotLayer } from '@deck.gl/layers';

new ScatterplotLayer({
  data: millionPoints,
  getPosition: d => [d.lon, d.lat],
  getRadius: 100,
  getFillColor: [255, 0, 0],
  opacity: 0.3
});
// ✅ Renderiza 1M+ puntos suavemente
```

#### regl (WebGL Declarativo)
```javascript
const drawPoints = regl({
  vert: `
    attribute vec2 position;
    void main() {
      gl_Position = vec4(position, 0, 1);
      gl_PointSize = 4.0;
    }
  `,
  frag: `
    void main() {
      gl_FragColor = vec4(1, 0, 0, 1);
    }
  `,
  attributes: {
    position: points // Array de [x, y]
  },
  count: points.length,
  primitive: 'points'
});

regl.frame(() => {
  regl.clear({ color: [0, 0, 0, 1] });
  drawPoints();
});
```

#### Three.js (3D y Scenes Complejas)
```javascript
import * as THREE from 'three';

const geometry = new THREE.BufferGeometry();
geometry.setAttribute('position', 
  new THREE.Float32BufferAttribute(positions, 3)
);

const material = new THREE.PointsMaterial({ size: 0.01 });
const points = new THREE.Points(geometry, material);
scene.add(points);
```

---

## Estrategias de Agregación

### Cuándo Agregar

**Pregunta clave**: ¿Puede el ojo distinguir todos los puntos?

```
Resolución de pantalla: ~1920x1080 = 2M píxeles
Scatter con 10M puntos: ~5 puntos por píxel

→ Los puntos se superponen indistinguiblemente
→ Agregar primero, renderizar después
```

**Regla práctica**:
```javascript
const pixelsPerPoint = (width * height) / dataPoints;
if (pixelsPerPoint < 4) {
  // Puntos muy densos, agregar primero
  aggregateData();
}
```

---

### Técnica 1: Hexbinning

**Para**: Scatter plots densos

**Cómo funciona**: Agrupa puntos en hexágonos, color por densidad

```javascript
import { hexbin } from 'd3-hexbin';

const hexbinGen = hexbin()
  .radius(20)
  .extent([[0, 0], [width, height]]);

const bins = hexbinGen(points);
// Cada bin: { x, y, length (count) }

// Renderizar hexágonos, color por count
bins.forEach(bin => {
  const color = colorScale(bin.length);
  drawHexagon(bin.x, bin.y, 20, color);
});
```

**Ventaja**: 2M puntos → ~1k hexágonos (2000x reducción)

---

### Técnica 2: Heatmap / Density Plot

**Para**: Scatter con 100k+ puntos

**Cómo funciona**: Divide en grilla, cuenta puntos por celda, colorea por densidad

```javascript
const gridSize = 50; // 50x50 = 2,500 celdas
const grid = Array(gridSize).fill().map(() => Array(gridSize).fill(0));

points.forEach(p => {
  const i = Math.floor((p.x - xMin) / (xMax - xMin) * gridSize);
  const j = Math.floor((p.y - yMin) / (yMax - yMin) * gridSize);
  grid[j][i]++;
});

// Renderizar como heatmap
grid.forEach((row, j) => {
  row.forEach((count, i) => {
    const color = colorScale(count);
    ctx.fillStyle = color;
    ctx.fillRect(i * cellSize, j * cellSize, cellSize, cellSize);
  });
});
```

---

### Técnica 3: LTTB (Largest-Triangle-Three-Buckets)

**Para**: Series temporales largas (líneas con 100k+ puntos)

**Cómo funciona**: Preserva la forma visual eligiendo puntos que forman triángulos grandes

```javascript
function largestTriangleThreeBuckets(data, threshold) {
  if (data.length <= threshold) return data;
  
  const sampled = [data[0]]; // Siempre incluye primero
  const bucketSize = (data.length - 2) / (threshold - 2);
  
  let a = 0;
  for (let i = 0; i < threshold - 2; i++) {
    const bucketStart = Math.floor((i + 1) * bucketSize) + 1;
    const bucketEnd = Math.floor((i + 2) * bucketSize) + 1;
    
    // Calcular punto promedio del siguiente bucket
    const nextBucket = data.slice(bucketEnd, 
      Math.floor((i + 3) * bucketSize) + 1);
    const avgX = nextBucket.reduce((s, d) => s + d.x, 0) / nextBucket.length;
    const avgY = nextBucket.reduce((s, d) => s + d.y, 0) / nextBucket.length;
    
    // Encontrar punto que forma triángulo más grande
    let maxArea = -1;
    let maxIndex = bucketStart;
    
    for (let j = bucketStart; j < bucketEnd; j++) {
      const area = Math.abs(
        (data[a].x - avgX) * (data[j].y - data[a].y) -
        (data[a].x - data[j].x) * (avgY - data[a].y)
      ) * 0.5;
      
      if (area > maxArea) {
        maxArea = area;
        maxIndex = j;
      }
    }
    
    sampled.push(data[maxIndex]);
    a = maxIndex;
  }
  
  sampled.push(data[data.length - 1]); // Siempre incluye último
  return sampled;
}

// Uso:
const original = 100000 puntos;
const downsampled = largestTriangleThreeBuckets(original, 1000);
// ✅ Reduce 100x, preserva forma visual
```

---

### Técnica 4: Adaptive Sampling (LOD)

**Para**: Visualización interactiva con zoom/pan

**Cómo funciona**: Diferentes niveles de detalle según zoom

```javascript
const lodLevels = {
  level0: downsample(data, 100),    // Zoom muy out
  level1: downsample(data, 1000),   // Zoom medio
  level2: downsample(data, 10000),  // Zoom in
  level3: data                       // Full resolution
};

function render(zoomLevel) {
  let dataToRender;
  if (zoomLevel < 0.1) dataToRender = lodLevels.level0;
  else if (zoomLevel < 1) dataToRender = lodLevels.level1;
  else if (zoomLevel < 10) dataToRender = lodLevels.level2;
  else dataToRender = lodLevels.level3;
  
  drawPoints(dataToRender);
}
```

---

## Progressive / Streaming Rendering

**Para**: Datasets que no caben en memoria o cargan lentamente

### Técnica 1: Chunked Loading + Progressive Render

```javascript
async function renderLargeDataset(dataUrl) {
  const chunkSize = 10000;
  let offset = 0;
  
  while (true) {
    const chunk = await fetch(
      `${dataUrl}?limit=${chunkSize}&offset=${offset}`
    ).then(r => r.json());
    
    if (chunk.length === 0) break;
    
    renderChunk(chunk); // Renderiza incrementalmente
    offset += chunkSize;
    
    await new Promise(resolve => requestAnimationFrame(resolve));
  }
}
```

### Técnica 2: Web Workers

**Para**: Cálculos pesados sin bloquear UI

```javascript
// main.js
const worker = new Worker('compute-worker.js');

worker.postMessage({ data: largeDataset, operation: 'aggregate' });

worker.onmessage = (e) => {
  const aggregated = e.data;
  renderChart(aggregated);
};

// compute-worker.js
self.onmessage = (e) => {
  const { data, operation } = e.data;
  
  const result = operation === 'aggregate'
    ? aggregateData(data)
    : processData(data);
  
  self.postMessage(result);
};
```

---

## Medición de Performance

### Chrome DevTools Performance Tab

**Workflow**:
1. Abrir DevTools → Performance
2. Grabar (⏺) → Interactuar con gráfico → Stop
3. Analizar:
   - **FPS bars**: Verde = 60 FPS, Rojo = drops
   - **Main thread**: Buscar bloques largos (>50ms)
   - **GPU**: Buscar overhead de rendering

**Qué buscar**:
```
🔴 Señales de problema:
  - FPS < 30 consistente
  - Bloques de scripting >100ms
  - Layout thrashing (reflows múltiples)
  - Paint excesivo

🟢 Buen performance:
  - FPS estable ~60
  - Frame time < 16ms
  - Pocos reflows
  - GPU utilizado eficientemente
```

---

### Benchmarking Manual

```javascript
function benchmark(fn, iterations = 100) {
  const times = [];
  
  for (let i = 0; i < iterations; i++) {
    const start = performance.now();
    fn();
    const end = performance.now();
    times.push(end - start);
  }
  
  const avg = times.reduce((a, b) => a + b) / times.length;
  const p95 = times.sort()[Math.floor(times.length * 0.95)];
  
  console.log(`Avg: ${avg.toFixed(2)}ms, P95: ${p95.toFixed(2)}ms`);
}

// Uso:
benchmark(() => renderChart(data));
```

---

### Performance Budgets

Define límites antes de implementar:

```javascript
const budgets = {
  initialLoad: 3000,   // 3s hasta first paint
  interaction: 100,    // 100ms respuesta a interacción
  frameTime: 16,       // 16ms por frame (60 FPS)
  memoryUsage: 100     // 100 MB máximo
};

// Test contra budgets
if (actualLoad > budgets.initialLoad) {
  console.warn(`⚠️ Load time exceeded budget: ${actualLoad}ms > ${budgets.initialLoad}ms`);
}
```

---

## Tabla de Decisión Rápida

```
Elementos | Interacción | Tecnología | Optimización clave
───────────────────────────────────────────────────────────
< 100     | Alta        | SVG        | Transiciones CSS
100-1k    | Alta        | SVG        | Agrupar elementos estáticos
1k-10k    | Media       | Canvas     | Offscreen canvas
10k-50k   | Media       | Canvas     | Quadtree + clipping
50k-500k  | Baja        | Canvas     | Hexbin / heatmap
500k-5M   | Baja        | WebGL      | GPU shaders + LOD
> 5M      | Baja        | WebGL      | Agregación server-side
```

---

## Checklist de Performance

Antes de enviar a producción:

```
□ Probado con volumen REAL de datos (no muestra de 200 filas)
□ Frame rate medido: >30 FPS mínimo, objetivo 60 FPS
□ Interacción (hover, click) responde en <100ms
□ Tiempo de carga inicial <3s
□ Memoria estable (no leaks)
□ Funciona en dispositivos móviles (CPU/GPU más lentos)
□ Degradación graceful si datos exceden capacidad
□ Loading state mientras carga datos
□ Error handling si fetch falla
□ Accesibilidad preservada (teclado, screen reader)
```

---

## Recursos

**Librerías**:
- D3 (SVG + Canvas): https://d3js.org/
- deck.gl (WebGL geoespacial): https://deck.gl/
- regl (WebGL declarativo): https://github.com/regl-project/regl
- Plotly (canvas-backed): https://plotly.com/javascript/
- ECharts (canvas-first): https://echarts.apache.org/

**Papers**:
- "Nanocubes" (aggregación interactiva)
- "imMens" (million+ puntos interactivos)
- "Gaussian Splatting" (técnicas de agregación)

**Benchmarks**:
- https://observablehq.com/@d3/render-performance
- https://vega.github.io/vega/usage/embed/#performance
