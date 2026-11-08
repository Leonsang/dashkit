# Honestidad Perceptual en Visualización

**Principio fundamental**: Un gráfico honesto muestra los datos como son, sin distorsión visual que exagere, minimice, o invente patrones que no existen.

## Checklist Completo (Pre-Envío)

Corre esta lista antes de que cualquier visualización salga a producción:

### ✓ Línea Base (Baseline)

**Regla de oro**: Las barras siempre empiezan en cero. Las líneas pueden no hacerlo, pero debe ser deliberado y etiquetado.

#### Gráficos de Barras

**Por qué**: Las barras codifican valor mediante **longitud**. Si la base no es cero, la longitud miente.

```
❌ MAL: Barras de 98, 99, 100 con eje de 95-100
   → La barra de 100 se ve 5x más grande que la de 98 (visualmente)
   → Realidad: 100 es solo 2% más que 98

✅ BIEN: Barras de 98, 99, 100 con eje de 0-100
   → Las barras se ven casi iguales (porque lo son)
```

**Excepción rara**: Barras logarítmicas (no pueden empezar en 0 porque log(0) = -∞)
- Usa solo si el rango de datos es exponencial (1 a 1,000,000)
- Etiqueta claramente "Escala Logarítmica"
- Considera si una tabla es más honesta

#### Gráficos de Líneas

**Más flexible**: Las líneas codifican **posición** y **pendiente**, no longitud.

```
✅ Puede usar base no-cero cuando:
   - Quieres mostrar cambio relativo pequeño (temperatura diaria: 20°-25°)
   - El cero no es significativo (temperatura en Celsius)
   - Está claramente etiquetado

❌ Evita base no-cero cuando:
   - El cero es significativo (ventas, población)
   - Puede exagerar cambios (precio de acciones)
   - La audiencia puede malinterpretar
```

**Regla de comunicación**: Si alguien te pregunta "¿por qué no empieza en cero?", debes tener una respuesta clara y honesta.

---

### ✓ Encoding (Mapeo Visual)

**Jerarquía de precisión perceptual**:
1. **Posición en escala común** (más preciso ~3% error)
2. **Longitud** (~5% error)
3. **Ángulo / Pendiente** (~15% error)
4. **Área** (~20% error)
5. **Volumen / Cubos 3D** (~40% error)
6. **Color / Saturación** (categórico: distinguible; cuantitativo: impreciso)

**Aplica esto**:

```
✅ Cantidades → Posición o Longitud
   Comparar ventas por región: barras (longitud)
   Cambio en tiempo: línea (posición en x e y)

❌ Cantidades → Área o Volumen
   Bubble chart donde área = ventas
   → La gente subestima área (~30% error)
   → Si debes usar burbujas, etiqueta los valores

❌ Cantidades → Solo Color
   Mapa de calor donde color = temperatura, sin escala clara
   → Agrega etiquetas de valor en celdas
```

**3D es siempre una mentira**:
- Agrega distorsión de perspectiva
- Oculta valores (barras traseras invisibles)
- Es imposible juzgar con precisión
- **Única excepción**: Visualización de datos 3D reales (anatomía, arquitectura)

---

### ✓ Doble Eje (Dual Y-Axis)

**El problema**: Dos escalas Y independientes permiten manipular para fabricar cualquier correlación.

```
❌ Trampa clásica:
   Serie A: escala 0-100
   Serie B: escala 0-10,000
   → Desliza las escalas hasta que "se correlacionan"
   → Es manufactura visual, no análisis
```

**Alternativas honestas**:

1. **Indexar a 100 en el punto de inicio**:
```javascript
// Ambas series empiezan en 100, cambios son relativos
indexedA = (dataA / dataA[0]) * 100;
indexedB = (dataB / dataB[0]) * 100;
// Ahora comparten eje Y: 0-200%
```

2. **Small multiples** (dos gráficos apilados, mismo eje X):
```
[Gráfico A] 
────────────── eje Y: 0-100
[Gráfico B]
────────────── eje Y: 0-10,000
    eje X compartido: tiempo
```

3. **Connected scatter plot**:
```
eje X: variable A
eje Y: variable B
conectar puntos cronológicamente con línea
```

**Si realmente debes usar doble eje**:
- Hazlo obvio (color distintivo por eje)
- Etiqueta cada eje claramente
- Agrega nota: "Escalas independientes"
- Pregúntate: ¿estoy siendo honesto o conveniente?

---

### ✓ Aspect Ratio (Relación de Aspecto)

**Regla de Banking to 45°**: Las pendientes promedio en un gráfico de líneas deben estar cerca de 45° para máxima legibilidad.

```
❌ Demasiado ancho (aplastado):
   Pendientes se ven planas → minimiza cambios
   
❌ Demasiado alto (estirado):
   Pendientes se ven empinadas → exagera cambios
   
✅ Balanceado:
   Pendientes promedio ~45° → muestra cambio honestamente
```

**Implementación**:
```javascript
// Calcular aspect ratio óptimo
const slopes = calculateSlopes(data);
const medianSlope = median(slopes);
const aspectRatio = Math.abs(medianSlope);
```

**En la práctica**:
- Gráficos de líneas: ancho ≈ 1.5-2x la altura
- Barras horizontales: altura ≈ 1.5x el ancho
- Ajusta según contenido, no según espacio disponible

---

### ✓ Agregación

**El problema**: Resumir datos con una sola estadística (media) puede ocultar la historia real.

#### Caso 1: Distribución Bimodal

```
Datos: [10, 12, 11, 89, 91, 88]
Media: 50

❌ Mostrar solo "50" sugiere que los datos están cerca de 50
✅ Mostrar distribución revela dos clusters: ~11 y ~90
```

**Solución**: Histograma, box plot, o violin plot

#### Caso 2: Outliers Dominantes

```
Datos: [5, 6, 5, 7, 6, 5, 500]
Media: 76.3 (dominada por el 500)
Mediana: 6 (representa mejor a la mayoría)

❌ Gráfico de barras de la media por grupo
✅ Box plot que muestra mediana + outliers
```

#### Caso 3: Varianza Oculta

```
Grupo A: media=50, datos=[49, 50, 51] (muy consistente)
Grupo B: media=50, datos=[10, 50, 90] (muy variable)

❌ Barras de media (ambas iguales)
✅ Barras de media + barras de error (IC 95%)
```

**Regla**: Si la distribución importa, muéstrala. La media es un resumen, no la verdad completa.

---

### ✓ Muestreo / Downsampling

**El problema**: Reducir 1 millón de puntos a 1,000 para renderizar puede distorsionar la forma.

**Muestreo aleatorio simple**:
```javascript
// ❌ MAL: Puede perder picos y valles
const sampled = data.filter(() => Math.random() < 0.001);
```

**Largest-Triangle-Three-Buckets (LTTB)**:
```javascript
// ✅ BIEN: Preserva la forma visual
// Mantiene puntos que forman los triángulos más grandes
const sampled = largestTriangleThreeBucket(data, 1000);
```

**Agregación por bins**:
```javascript
// Para scatter con muchos puntos superpuestos
// ✅ Hexbin: agrupa puntos en hexágonos, color por densidad
const hexbinned = d3.hexbin()
  .radius(20)
  .extent([[0, 0], [width, height]]);
```

**Regla**: El gráfico reducido debe preservar:
- Tendencia general
- Picos y valles importantes
- Outliers significativos
- Densidad relativa

**Prueba**: Superpón el muestreo sobre los datos completos (en transparencia) — deben contar la misma historia.

---

### ✓ Incertidumbre

**El problema**: Mostrar solo puntos estimados sin incertidumbre sugiere certeza falsa.

**Cuándo mostrar incertidumbre**:
- Datos de encuestas (error muestral)
- Proyecciones / forecasts
- Modelos estadísticos (intervalos de confianza)
- Mediciones con error instrumental

**Cómo mostrarla**:

1. **Barras de error** (para puntos discretos):
```
Gráfico de barras o scatter
Agrega IC 95% como líneas verticales
```

2. **Bandas de confianza** (para líneas continuas):
```
Línea central: predicción
Banda sombreada alrededor: IC 95%
```

3. **Gradient de confianza**:
```
Color más oscuro = más confianza
Color más claro = más incertidumbre
```

4. **Líneas múltiples (ensemble)**:
```
10-50 simulaciones en gris claro
Mediana en color oscuro
```

**Ejemplo honesto vs deshonesto**:

```
❌ "Predicción: ventas serán $500k"
   → Sugiere certeza

✅ "Predicción: ventas $500k (IC 95%: $420k-$580k)"
   → Comunica incertidumbre real
```

---

### ✓ Etiquetas

**Requisito mínimo**:
- **Título**: Conclusión o pregunta, no "Gráfico 1"
- **Ejes**: Variable + unidades
- **Leyenda**: Si hay múltiples categorías
- **Fuente**: De dónde vienen los datos
- **Nota**: Aclaraciones de metodología si son críticas

**Títulos efectivos**:

```
❌ MAL: "Ventas por Región"
   → No dice nada

✅ BIEN: "Norte lidera en ventas con 40% del total"
   → Conclusión clara

✅ BIEN: "¿Qué región genera más ventas?"
   → Pregunta que el gráfico responde
```

**Ejes**:
```
❌ "x" y "y"
❌ "Valores"
❌ "2020, 2021, 2022" (sin contexto)

✅ "Mes" y "Ventas (miles de USD)"
✅ "Temperatura (°C)"
✅ "% de Participación de Mercado"
```

**Números directos**:
- Si hay <10 barras/puntos, etiqueta cada valor
- Elimina eje Y si cada barra tiene etiqueta
- Reduce carga cognitiva (no obligar a leer eje)

---

### ✓ Área Proporcional

**El problema**: Cuando el área representa valor, debe ser proporcional linealmente al valor.

#### Círculos / Burbujas

```
❌ MAL: Radio proporcional al valor
   Valor duplica → Radio duplica → Área cuadriplica
   → El ojo ve el área, no el radio

✅ BIEN: Área proporcional al valor
   scale = sqrt(value / maxValue) * maxRadius
```

**Implementación correcta**:
```javascript
const radiusScale = d3.scaleSqrt()
  .domain([0, d3.max(data, d => d.value)])
  .range([0, maxRadius]);
```

#### Pie Charts

```
✅ El ángulo es proporcional al porcentaje (automático)

❌ NO explotes porciones (separar del centro)
   → Distorsiona el área visual

❌ NO uses 3D
   → Porciones frontales se ven más grandes
```

#### Mapas de Símbolos

```
✅ Círculos con área proporcional
✅ Cuadrados con área proporcional

❌ Símbolos complejos (iconos de personas, edificios)
   → El área no es obvia, difícil de comparar
```

---

## Anti-Patrones Comunes

### 1. Eje Y Truncado en Barras

**Caso real**: Gráfico de barras de aprobación presidencial, 40% vs 42%
```
❌ Eje Y: 35%-45%
   → Barra de 42% se ve el doble de la de 40%
   → Exagera diferencia de 2% como si fuera 100%

✅ Eje Y: 0%-100%
   → Ambas barras similar

es, diferencia es visualmente honesta
```

**Cuándo alguien insiste**: "Necesito mostrar la diferencia"
- Respuesta: Usa puntos conectados (gráfico de líneas), no barras
- O etiqueta las barras con los valores exactos

---

### 2. Cherry-Picking de Rango de Fechas

**Trampa**: Elegir el rango temporal que cuenta tu historia favorita

```
❌ "Ventas subieron 50%!" (mostrando solo enero-marzo)
   → Oculta que bajaron 60% el año anterior

✅ Mostrar contexto completo (últimos 2 años)
   → Revela que aún están por debajo del pico
```

**Regla**: Muestra suficiente contexto para que el patrón sea interpretable honestamente.

---

### 3. Manipulación de Bins en Histogramas

**El problema**: Cambiar el ancho de bin cambia la historia

```
Datos: [1, 2, 2, 3, 3, 3, 10, 11]

Con bins de ancho 1: pico en 3, outliers en 10-11
Con bins de ancho 5: todo parece uniforme

✅ Prueba múltiples anchos de bin
✅ Reporta el que mejor muestra la estructura real
```

**Regla de Sturges**: 
```javascript
numBins = Math.ceil(Math.log2(data.length) + 1);
```

---

### 4. Correlación Espuria por Variable Omitida

**Trampa**: Mostrar correlación sin contexto de causalidad

```
Correlación: "Más helado vendido → más ahogamientos"

❌ Implica causalidad
✅ Variable omitida: temperatura (causa ambas)
```

**Regla**: 
- Etiqueta como "correlación", no "efecto"
- Menciona posibles confounders
- Agrega nota: "Correlación no implica causalidad"

---

### 5. Escala de Burbuja No-Lineal

**Problema**: Duplicar el radio (no el área) de una burbuja

```
❌ Valor A=10, Radio=10px
   Valor B=20, Radio=20px
   → Área de B es 4x la de A (no 2x)
   → Exagera visualmente

✅ Usar sqrt: radiusB = radiusA * sqrt(2)
   → Área de B es 2x la de A (correcto)
```

---

## Herramientas de Validación

### Checklist Digital

Corre esto para cada gráfico:

```javascript
function validateChart(chart) {
  const checks = {
    baseline: chart.type === 'bar' && chart.yAxis.min !== 0,
    encoding: chart.usesAreaForQuantity || chart.uses3D,
    dualAxis: chart.axes.filter(a => a.type === 'y').length > 1,
    colorCVD: !testCVDSafe(chart.colorPalette),
    labels: !chart.title || !chart.xAxis.label || !chart.yAxis.label
  };
  
  return Object.entries(checks)
    .filter(([_, failed]) => failed)
    .map(([check]) => `⚠️ ${check} violado`);
}
```

### Prueba del "Lector Fresco"

1. Muestra el gráfico a alguien que no conoce los datos
2. Da 10 segundos para mirar
3. Pregunta: "¿Cuál es la conclusión?"
4. Si respuesta ≠ tu intención → rediseña

### Prueba de Escala de Grises

1. Convierte el gráfico a escala de grises
2. Si el significado se pierde → mal uso de color
3. Agrega forma, etiquetas, o posición

---

## Principio WYSIWYG para Datos

**"What You See Is What the Data Says"**

Si el gráfico comunica X, los datos deben decir X:
- ✅ Gráfico muestra "casi plano" → datos varían <5%
- ✅ Gráfico muestra "correlación fuerte" → r² > 0.7
- ✅ Gráfico muestra "outlier" → estadísticamente significativo (>3σ)

Si el gráfico miente, es culpa del diseñador, no del lector.
