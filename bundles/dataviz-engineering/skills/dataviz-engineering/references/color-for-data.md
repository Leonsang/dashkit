# Color Como Dato

**Principio fundamental**: El color debe sobrevivir daltonismo, escala de grises, y proyectores malos. El significado nunca debe estar codificado solo en matiz (hue).

## Tipos de Escalas de Color

La estructura de tus **datos** determina la escala de **color**, no tu gusto personal.

### 1. Categórica (Datos Nominales)

**Cuándo**: Categorías sin orden (país, producto, departamento)

**Cómo**:
- Matices distintos, diferenciables
- Luminancia similar para igualdad perceptual
- Máximo 7 categorías (el ojo no retiene más)
- Si tienes 12+ categorías, agrupa o usa etiquetado directo

**Paleta segura para CVD**:
```
Tableau 10 (segura):
['#4E79A7', '#F28E2B', '#59A14F', '#E15759', 
 '#B07AA1', '#76B7B2', '#EDC948', '#FF9DA7',
 '#9C755F', '#BAB0AC']

IBM Carbon (6 colores):
['#0F62FE', '#24A148', '#DA1E28', '#8A3FFC',
 '#FA4D56', '#198038']

Okabe-Ito (8 colores, oro estándar CVD):
['#E69F00', '#56B4E9', '#009E73', '#F0E442',
 '#0072B2', '#D55E00', '#CC79A7', '#999999']
```

**Reglas**:
- ✅ Agrega forma, icono o etiqueta además del color
- ✅ Usa posición para las categorías más importantes
- ❌ No uses rojo-verde para binario (usa azul-naranja)
- ❌ No uses arcoíris para categorías (crea jerarquía falsa)

**Prueba**: Convierte a escala de grises — ¿aún se distinguen?

---

### 2. Secuencial (Datos Ordenados, Una Dirección)

**Cuándo**: Magnitud que va de baja a alta (ventas, población, temperatura)

**Cómo**:
- Un solo matiz, de claro a oscuro
- Perceptualmente uniforme (cada paso = mismo cambio percibido)
- El más oscuro es el valor máximo

**Paletas recomendadas**:

**Viridis** (oro estándar, perceptualmente uniforme + CVD-safe):
```
Amarillo-verde-azul-morado
#FDE724 → #7AD151 → #22A884 → #2A788E → #414487 → #440154
```

**Blues / Greys** (un solo matiz, conservador):
```
Blues: #F7FBFF → #DEEBF7 → #C6DBEF → #9ECAE1 → #4292C6 → #08519C
Greys: #FFFFFF → #F0F0F0 → #D9D9D9 → #969696 → #525252 → #000000
```

**Reglas**:
- ✅ Usa para mapas de calor (heatmaps)
- ✅ El valor cero o mínimo debe ser el color más claro
- ❌ No uses arcoíris (crea bandas falsas de luminancia)
- ❌ No uses rojo para "mucho" si puede interpretarse como "malo"

**Test de escala de grises**: La escala debe seguir siendo legible — viridis sí, arcoíris no.

---

### 3. Divergente (Datos con Punto Medio Significativo)

**Cuándo**: Desviación desde un punto medio significativo (ganancia/pérdida, arriba/abajo de promedio, antes/después)

**Cómo**:
- Dos matices desde un punto medio neutral
- El punto medio es blanco, gris claro, o color neutro
- Simétrico: misma intensidad en ambos extremos

**Paletas recomendadas**:

**Azul-Naranja** (seguro para daltonismo):
```
#0571B0 → #92C5DE → #F7F7F7 → #F4A582 → #CA0020
(frío)     (neutral)    (cálido)
```

**Púrpura-Verde** (alternativa CVD-safe):
```
#762A83 → #C2A5CF → #F7F7F7 → #A6DBA0 → #1B7837
```

**Rojo-Azul** (tradicional, usar con cuidado en CVD):
```
#B2182B → #F7F7F7 → #2166AC
Solo si agregas etiquetas +/-
```

**Reglas**:
- ✅ El punto medio debe ser **significativo** (cero, promedio, presupuesto)
- ✅ Asegura que el punto medio del color coincide con el punto medio de los datos
- ❌ No uses rojo-verde (daltonismo)
- ❌ No uses divergente si no hay punto medio real (usa secuencial)

**Ejemplo correcto**: Ganancia/pérdida financiera con 0 en el centro
**Ejemplo incorrecto**: Edad (0-100 años) — no hay punto medio significativo, usa secuencial

---

## Daltonismo y Accesibilidad

### Estadísticas
- **8% de hombres** (~4% de la población general) tienen deficiencia de visión de color (CVD)
- Deuteranomalía (rojo-verde) es la más común (~5% de hombres)
- Protanomalía (rojo-verde) ~2% de hombres
- Tritanomalía (azul-amarillo) <1%

### Simuladores CVD (úsalos siempre)

**Herramientas**:
- **Coblis**: https://www.color-blindness.com/coblis-color-blindness-simulator/
- **Chrome DevTools**: Rendering → Emulate vision deficiencies
- **Stark** (plugin Figma/Sketch)
- **Sim Daltonism** (macOS app)

**Workflow**:
1. Diseña el gráfico
2. Toma screenshot
3. Pasa por simulador de deuteranomalía Y protanomalía
4. Si el significado se pierde, rediseña

### Estrategias Multi-Canal

**Nunca codifiques significado solo en color. Siempre agrega:**

1. **Forma/Símbolo**:
   ```
   Categoría A: círculo azul
   Categoría B: cuadrado naranja
   Categoría C: triángulo verde
   → Color + forma = redundancia segura
   ```

2. **Etiquetado directo**:
   ```
   En vez de leyenda de color separada,
   etiqueta cada línea directamente en el gráfico
   ```

3. **Posición**:
   ```
   Ordena barras o series por importancia
   La posición (arriba/izquierda = importante) refuerza el mensaje
   ```

4. **Textura/Patrón**:
   ```
   En barras apiladas: rayado, puntos, sólido
   Funciona en blanco y negro
   ```

5. **Anotaciones**:
   ```
   Agrega flechas, cajas, o texto explicativo
   para lo más importante
   ```

---

## Anti-Patrones de Color

### ❌ Arcoíris (Rainbow Scale)

**Por qué está mal**:
- Crea bandas de luminancia falsas (el amarillo es más brillante que el azul)
- El ojo ve límites donde no existen en los datos
- No es perceptualmente uniforme (verde→amarillo se ve como cambio grande, azul→violeta como pequeño)
- Falla completamente en escala de grises

**Qué usar en su lugar**: Viridis, Cividis, o cualquier escala secuencial de un solo matiz

**Única excepción válida**: Temperatura (físicamente arraigado: azul=frío, rojo=caliente), pero aún así usa divergente azul-blanco-rojo, no arcoíris.

---

### ❌ Rojo-Verde para Binario

**Por qué está mal**:
- Daltonismo rojo-verde es el más común
- Las dos opciones se ven casi iguales para 8% de hombres

**Qué usar en su lugar**:
- **Azul-Naranja**: altamente distinguible
- **Morado-Verde**: funciona bien
- **Azul-Marrón**: conservador
- Siempre agrega ícono (✓ / ✗) o etiqueta (Sí / No)

**Caso de uso**: Pasa/Falla, Activo/Inactivo, Arriba/Abajo

---

### ❌ Demasiados Colores Categóricos

**Problema**: Más de 7 colores categóricos y el ojo no puede retenerlos

**Solución**:
1. **Agrupar**: Reduce categorías (Otros para las menos importantes)
2. **Destacar**: Colorea solo 2-3 importantes, el resto en gris
3. **Small multiples**: Un panel por categoría, mismo color
4. **Etiquetado directo**: Elimina la leyenda, etiqueta en el gráfico

**Ejemplo**:
```
Malo: 15 líneas, 15 colores, leyenda de 15 ítems
Bueno: 3 líneas destacadas en color, 12 en gris claro, etiquetas directas
```

---

### ❌ Color sin Significado

**Problema**: Agregar color "porque luce mejor" crea carga cognitiva sin valor

**Regla**: Cada color debe mapear a una variable o categoría

**Ejemplo malo**:
```
Gráfico de barras, todas las barras de diferente color,
pero solo hay una variable → confunde al lector
```

**Ejemplo bueno**:
```
Barras del mismo color, o coloreadas por categoría secundaria
si eso agrega información
```

---

## Paletas por Contexto

### Negocios / Corporativo
- Conservador, profesional
- Azules, grises, un acento (naranja o verde)
- Evita colores brillantes o saturados
```
Primario: #003f5c (azul oscuro)
Secundario: #7a5195 (morado)
Acento: #ef5675 (rosa-rojo suave)
```

### Científico / Técnico
- Perceptualmente uniforme
- Viridis, Plasma, Inferno
- Funciona en presentaciones y papers
```
Viridis: amarillo-verde-azul-morado
Plasma: amarillo-naranja-morado
Inferno: amarillo-rojo-negro
```

### Editorial / Periodismo
- Llamativo pero honesto
- Financial Times: salmón (#FFF1E0 fondo) + azul oscuro
- The Economist: rojo (#E3120B) + grises
```
FT: #0F5499, #CC0000, #FFF1E0
Economist: #E3120B, #00B8E6, #4E5B6A
```

### Mapas
- **Coropletas** (áreas coloreadas): secuencial o divergente, nunca arcoíris
- **Símbolos**: categórico, máximo 5-6 tipos
- Fondo neutro (gris claro), agua en azul muy suave
```
Mapa base: #F5F5F5 (tierra), #D4E6F1 (agua)
Datos: viridis o azul-naranja divergente
```

---

## Implementación por Plataforma

### Power BI
```json
// Tema JSON: data colors array
"dataColors": [
  "#4E79A7", "#F28E2B", "#59A14F", "#E15759",
  "#B07AA1", "#76B7B2", "#EDC948"
]

// Escala condicional en visual:
// Visual → Format → Data colors → Conditional formatting
// Elige escala divergente o secuencial según datos
```

### Tableau
```
// Palette personalizada en preferences.tps:
<preference name='CustomPalette' value='[Blue-Orange]
  #0571B0|#92C5DE|#F7F7F7|#F4A582|#CA0020' />

// O en sesión:
Color → Edit Colors → New Color Palette
```

### Looker Studio
```
// Editor de tema → Colores de datos:
// Define hasta 20 colores categóricos

// Reglas de color condicional:
// Style → Color → Add rule
// Elige escala de color secuencial o divergente
```

### D3.js
```javascript
import { scaleOrdinal, scaleSequential, scaleDiverging } from 'd3-scale';
import { interpolateViridis, interpolateRdBu, schemeTableau10 } from 'd3-scale-chromatic';

// Categórica
const colorCat = scaleOrdinal(schemeTableau10);

// Secuencial
const colorSeq = scaleSequential(interpolateViridis)
  .domain([0, maxValue]);

// Divergente
const colorDiv = scaleDiverging(interpolateRdBu)
  .domain([-maxAbs, 0, maxAbs]);
```

---

## Checklist de Color

Antes de enviar cualquier gráfico:

```
□ El tipo de escala coincide con la estructura de datos
  (categórica / secuencial / divergente)

□ Paleta elegida es segura para daltonismo
  (probada en simulador CVD)

□ Significado no está codificado SOLO en color
  (agregada forma, etiqueta, o posición)

□ Gráfico sobrevive conversión a escala de grises
  (contraste suficiente)

□ Número de colores categóricos ≤ 7
  (o usas destacado / agrupamiento)

□ Punto medio de escala divergente coincide con punto medio de datos
  (0, promedio, presupuesto, etc.)

□ No usas arcoíris en datos continuos
  (secuencial uniforme en su lugar)

□ No usas rojo-verde para binario
  (azul-naranja + iconos)

□ Cada color tiene un propósito
  (mapea a variable o categoría, no es decorativo)

□ Contraste con fondo es suficiente
  (WCAG AA: mínimo 4.5:1 para texto, 3:1 para gráficos)
```

---

## Recursos

**Generadores de paletas CVD-safe**:
- Colorbrewer2: https://colorbrewer2.org/
- Viz Palette: https://projects.susielu.com/viz-palette
- Adobe Color (modo accesibilidad): https://color.adobe.com/create/color-accessibility

**Papers y referencias**:
- "A Rule-based Tool for Assisting Colormap Selection" (Gramazio et al.)
- "The Viridis Color Palettes" (matplotlib docs)
- "Color Usage in Data Visualization" (Lisa Charlotte Muth, Datawrapper)

**Librerías**:
- D3 scale-chromatic: https://github.com/d3/d3-scale-chromatic
- ColorBrewer: http://colorbrewer2.org/
- Seaborn (Python): paletas built-in CVD-safe
