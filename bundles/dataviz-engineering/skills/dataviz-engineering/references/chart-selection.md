# Selección de Tipo de Gráfico

**Regla de oro**: la pregunta que se hace determina el tipo de gráfico, no lo que luce bien.

## Matriz de Pregunta → Gráfico → Encoding

### Comparación entre Categorías

**Pregunta**: ¿Cómo se comparan estos valores entre categorías?

**Gráfico correcto**: Barras horizontales ordenadas (de mayor a menor)

**Por qué funciona**:
- El ojo lee longitud con precisión (~3% error)
- Ordenar por valor es el 50% del insight
- Las etiquetas de categoría son legibles (no rotadas)
- Puede manejar nombres largos

**Trampa a evitar**: Pie chart con más de 3 porciones
- El ojo juzga ángulos con ~20% error
- Imposible comparar porciones no adyacentes
- Etiquetas se superponen o son ilegibles

**Cuándo usar vertical**: Solo si hay muchas categorías (>15) o nombres muy cortos

**Ejemplo de encoding**:
```
x: valor (cuantitativo, escala lineal desde 0)
y: categoría (ordinal, ordenado por x descendente)
color: categórico opcional para agrupar
```

---

### Tendencia en el Tiempo

**Pregunta**: ¿Cómo ha cambiado este valor en el tiempo?

**Gráfico correcto**: Línea conectada

**Por qué funciona**:
- La conexión implica continuidad temporal
- La pendiente comunica tasa de cambio instantáneamente
- Permite comparar múltiples series
- El ojo sigue la forma de la línea naturalmente

**Trampa a evitar**: Barras para muchos puntos temporales
- Crea ruido visual (cientos de rectángulos)
- Dificulta ver la tendencia general
- Ocupa más espacio sin agregar información

**Cuándo usar barras**: Solo para pocos períodos discretos (ej. 4 trimestres)

**Variante para múltiples series**: Small multiples en vez de 10+ líneas en un gráfico

**Ejemplo de encoding**:
```
x: tiempo (temporal, continuo o discreto según granularidad)
y: valor (cuantitativo)
color: serie (si hay múltiples, máximo 5-7)
```

**Aspect ratio**: Banking to 45° — las pendientes promedio deben estar cerca de 45° para máxima legibilidad

---

### Distribución de Valores

**Pregunta**: ¿Cómo se distribuyen estos valores? ¿Cuál es el rango, los outliers, la forma?

**Gráfico correcto**: Histograma, box plot, o violin plot

**Por qué funciona**:
- Histograma: muestra la forma completa (normal, sesgada, bimodal)
- Box plot: resume en 5 números (min, Q1, mediana, Q3, max) + outliers
- Violin plot: combina ambos (forma + resumen)

**Trampa a evitar**: Solo mostrar la media
- Oculta completamente la distribución
- No muestra si es simétrica, sesgada, o bimodal
- Los outliers desaparecen

**Cuándo usar cada uno**:
- Histograma: exploración inicial, quieres ver la forma exacta
- Box plot: comparar distribuciones de múltiples grupos
- Violin plot: cuando la forma es importante y hay suficientes datos

**Ejemplo de encoding**:
```
Histograma:
  x: valor (cuantitativo, binned)
  y: frecuencia o densidad

Box plot:
  x: grupo (categórico)
  y: valor (cuantitativo)
  mediana, Q1, Q3, whiskers, outliers marcados
```

---

### Correlación entre Variables

**Pregunta**: ¿Están relacionadas estas dos variables? ¿Cómo?

**Gráfico correcto**: Scatter plot (dispersión)

**Por qué funciona**:
- Posición × posición es el encoding 2D más preciso
- Permite ver forma de la relación (lineal, no-lineal)
- Muestra outliers y clusters
- Puede agregar línea de tendencia para guiar

**Trampa a evitar**: Doble eje Y con dos líneas temporales
- Permite manipular la escala para inventar correlación
- "Cuando las escalas se deslizan, todo se correlaciona"

**Si realmente necesitas comparar dos series temporales**:
1. Indexar ambas a 100 en el punto de inicio
2. Usar small multiples (mismo eje Y)
3. Scatter conectado (connected scatter plot)

**Encodings adicionales útiles**:
```
x: variable 1 (cuantitativo)
y: variable 2 (cuantitativo)
color: categoría o tercera variable cuantitativa
size: cuarta variable (usar con cuidado, área se juzga mal)
shape: hasta 5-6 categorías
```

---

### Parte del Todo (Composición)

**Pregunta**: ¿Cómo se compone el total? ¿Qué porcentaje es cada parte?

**Gráfico correcto**: Barras apiladas al 100% (primera opción)

**Por qué funciona**:
- El ojo lee longitud con precisión
- Las partes están alineadas, fáciles de comparar
- El 100% es visible y obvio
- Funciona con muchas categorías

**Cuándo usar pie chart**: Solo con 2-3 porciones muy diferentes
- Ejemplo válido: 75% vs 25% (diferencia obvia)
- Nunca para comparar 5+ porciones similares

**Trampa a evitar**: Pie de 8+ porciones
- Imposible comparar porciones del mismo tamaño
- Etiquetas ilegibles
- 3D lo empeora 10x (distorsión de perspectiva)

**Variante para comparar composición entre grupos**: Stacked bars al 100%, un grupo por barra

**Ejemplo de encoding**:
```
Barras apiladas:
  x: grupo (categórico)
  y: porcentaje (0-100%)
  color: categoría de la parte
  ordenar partes por tamaño para facilitar lectura
```

---

### Comparar Grupos en Misma Métrica

**Pregunta**: ¿Cómo varía esta métrica entre muchos grupos?

**Gráfico correcto**: Small multiples (grilla de gráficos pequeños)

**Por qué funciona**:
- Mismo eje Y facilita comparación directa
- Reduce cluttering vs poner todo en un gráfico
- El ojo escanea la grilla naturalmente
- Puede usarse con cualquier tipo de gráfico base

**Trampa a evitar**: 10+ líneas en un solo gráfico
- Se convierte en "spaghetti chart"
- Imposible distinguir series individuales
- Los colores se agotan y se confunden

**Diseño óptimo**:
- Mismo eje Y (crítico para comparación)
- Orden significativo (por media, por alfabeto, por geografía)
- Destacar uno si es necesario (color vs gris)
- Título claro en cada panel

**Ejemplo de encoding**:
```
facet_row: grupo 1 (hasta ~4 filas)
facet_col: grupo 2 (hasta ~4 columnas)
x: variable independiente (compartido)
y: variable dependiente (compartido, misma escala)
```

---

### Flujo o Relaciones entre Nodos

**Pregunta**: ¿Cómo fluyen los valores entre entidades? ¿Qué se conecta con qué?

**Opciones por caso**:

**Sankey diagram**: Flujo direccional con magnitud
- Ejemplo: presupuesto → categorías → subcategorías
- El ancho codifica la magnitud del flujo
- Dirección izquierda → derecha es clara

**Chord diagram**: Relaciones circulares, flujo bidireccional
- Ejemplo: comercio entre países
- Funciona bien con ~10-15 nodos
- Difícil de leer con más de 20

**Network / Node-link**: Conexiones sin magnitud de flujo
- Ejemplo: red social, dependencias de software
- Layout por algoritmo (force-directed, circular, hierarchical)
- Agregar color/tamaño por atributos de nodo

**Matriz de adyacencia**: Cuando hay muchos nodos (50+)
- Más compacta que node-link
- Facilita ver patrones de bloques

**Cuándo usar cada uno**:
- Dirección + magnitud → Sankey
- Bidireccional, pocos nodos → Chord
- Solo conexiones, estructura importa → Network
- Muchos nodos, buscar patrones → Matriz

---

## Resumen de Decisión Rápida

```text
¿Qué quieres saber?              → Usa este gráfico
─────────────────────────────────────────────────────
Comparar categorías              → Barras ordenadas (horizontal)
Cambio en el tiempo              → Línea conectada
Distribución / outliers          → Histograma / Box plot
Correlación entre dos variables  → Scatter plot
Parte del todo (%)               → Barras apiladas 100%
Muchos grupos, misma métrica     → Small multiples
Flujo con magnitud               → Sankey
Jerarquía                        → Treemap / Sunburst
Geográfico                       → Mapa (símbolos o coropleta)
```

## Criterios para Elegir

1. **Empieza con la pregunta**: ¿Qué decisión toma el lector con este gráfico?
2. **Identifica el tipo de comparación**: temporal, categórica, distribución, relación
3. **Elige el encoding más preciso**: posición > longitud > ángulo > área > color
4. **Verifica el volumen**: ¿cuántas categorías/puntos/series? Si es mucho, simplifica o agrega
5. **Diseña para el primer vistazo**: si el insight no es obvio en 3 segundos, el gráfico falló

## Anti-Patrones Comunes

❌ **Pie de 11 porciones**: usa barras ordenadas
❌ **Doble eje Y para "correlación"**: indexa o usa small multiples
❌ **Barras para 100 puntos temporales**: usa línea
❌ **3D en cualquier gráfico**: nunca, la distorsión miente
❌ **Radar chart para comparar**: barras o small multiples son más claros
❌ **Burbuja donde no ayuda**: scatter con punto simple es más honesto
