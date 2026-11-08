---
name: tableau-design
description: >-
  Cómo se estructura un trabajo de Tableau según la práctica oficial de Tableau:
  la jerarquía sitio → proyecto → colección → libro → hojas (worksheets),
  dashboards e historias; qué visualización elegir para cada pregunta; cómo
  maquetar un dashboard (contenedores en mosaico, tamaño fijo, 2-3 vistas, KPIs
  arriba a la izquierda) y cómo dejar el libro listo para publicar. Úsala antes
  de diseñar o revisar un libro de Tableau, y junto a `tableau-authoring`
  para construirlo con `tableu`. Triggers: "estructura del dashboard de
  Tableau", "buenas prácticas de Tableau", "qué gráfico uso en Tableau",
  "organizar hojas", "colecciones de Tableau", "historia de Tableau", "revisar
  diseño Tableau".
---

# Diseño y estructura en Tableau

Esta skill dice **qué** construir y **cómo se organiza**. `tableau-authoring`
dice **cómo** construirlo con `tableu`. Cada regla cita su fuente oficial en
[references/fuentes.md](references/fuentes.md).

## Referencias

| Archivo | Cuándo |
|---|---|
| `references/brief.md` | Antes de diseñar: audiencia, decisión, preguntas, KPIs, estilo; y qué decide cada punto |
| `references/arquetipos.md` | Elegir la forma de la página: resumen, exploración, detalle, protagonista o relato |
| `references/color.md` | Paleta, acento, secuencial y divergente, paletas de Tableau con sus hex |
| `references/tipografia.md` | Fuentes y tamaños, medidos en los libros de Tableau |
| `references/accesibilidad.md` | WCAG 2.2 AA: títulos, contraste, no solo color, orden de lectura |
| `references/antipatrones.md` | Revisar un diseño propio o ajeno: qué falla y cómo se arregla |
| `references/fuentes.md` | La documentación oficial de cada regla |
| Skill `dataviz-engineering` (otro bundle) | Elección de gráfico por pregunta, paletas validadas para daltonismo, y trabajar contra un diseño de referencia: apuntar, pedir o generar |

## 1. La jerarquía del contenido

| Nivel | Qué es | Regla práctica |
|---|---|---|
| Sitio (Cloud/Server) | El espacio de la organización | Fuera del alcance de `tableu` |
| **Proyecto** | La carpeta del sitio y la unidad de permisos; admite proyectos anidados | Un proyecto por área o audiencia. Publica allí el libro y su fuente de datos |
| **Colección** | Una "lista de reproducción" de contenidos de varios proyectos, privada o pública; quitar un elemento no lo borra | Para curar el recorrido de una audiencia (p. ej. "Ventas – semanal") sin mover nada de proyecto. Las crea cualquier rol en la web; no se migran de Server a Cloud |
| Favoritos | Accesos personales | No forman parte del diseño |
| **Libro** (.twb/.twbx) | Fuentes de datos + hojas | **Un libro, un propósito.** Si cubre análisis no relacionados, divídelo |
| **Hoja (worksheet)** | Una vista: una pregunta | La pieza de la que se construye todo lo demás |
| **Dashboard** | Varias hojas en una página | La "página" que lee el usuario: 2-3 vistas más KPIs y filtros |
| **Historia** | Secuencia de puntos (hojas o dashboards), como diapositivas | Para presentar una conclusión paso a paso |

`tableu` no gestiona proyectos ni colecciones porque viven en el sitio. Cuando
entregues un libro, **recomienda** dónde publicarlo: el proyecto y, si la
audiencia recorre varios libros, una colección con el orden de lectura.

## 2. Hojas (worksheets): una vista, una pregunta

- **Nombre descriptivo**, que es también el título: «Ingresos por mes», nunca
  «Sheet 1» ni una sola palabra en MAYÚSCULAS. Se renombra con `worksheet
  Rename` y el título se ajusta con `format Title`.
- **Elige el gráfico por la pregunta:**

  | Pregunta | Visualización | `tableu` (`worksheet Create`) |
  |---|---|---|
  | ¿Cuánto en total? (KPI) | Número grande (BAN) | `mark: text`, `label: <medida>` |
  | Comparar categorías | Barras ordenadas | `rows: [dim]`, `cols: [medida]`, `sort` DESC |
  | Evolución en el tiempo | Línea continua | `cols: ["MONTH_TRUNC(fecha)"]`, `mark: line` |
  | Parte de un todo | Barra apilada o 100 %; pastel solo con 2-3 partes | `color: dim` |
  | Valores exactos de comparación | Tabla resaltada | `mark: square`, `color: medida`, `label` |
  | Relación entre dos medidas | Dispersión | `cols/rows: medidas`, `detail: dim` |
  | Geografía | Símbolos para totales, relleno para tasas | `worksheet MakeMap` |
  | Distribución | Histograma | `bin Create` |

- **Etiquetas mínimas necesarias:** quita gridlines y bordes que no aportan
  (`format Lines` y `Borders`), pero que cada número se entienda. Pon títulos de
  eje con nombre de negocio («Ingresos (€)», no «SUM(ingresos)» ni «Month of
  fecha»), con el caption del campo (`field Update`) o con `format Field`.
- **Formato de número por defecto** en la medida (`default_format`:
  `n#,##0`, `p0.0%`, `c"€"#,##0`): así sale bien en todas las hojas.
- **Tooltip útil** (`format Tooltip`): la frase que respondería la pregunta, no
  el volcado de campos.
- **Color con intención:** neutros para la base y un color de acento para el
  mensaje. Paleta apta para daltonismo (`format ColorPalette`). No codifiques
  solo con color: añade etiquetas o formas.
- **Rendimiento:** pocas marcas, extract (`datasource CreateExtract`), COUNTD y
  LOD con moderación, filtros sin «Only Relevant Values».

## 3. Dashboards: la página

**Estructura (lectura en Z, de arriba-izquierda a abajo-derecha):**

```
┌──────────────────────────────────────────────────────────┐
│ Título · subtítulo que explica cómo filtrar              │  texto
├──────────┬──────────┬──────────┬──────────┬──────────────┤
│  KPI 1   │  KPI 2   │  KPI 3   │  KPI 4   │ Filtro: «Elige│  fila 1: BANs + controles
│          │          │          │          │ un canal»     │
├──────────┴──────────┴──────────┼──────────┴──────────────┤
│  Vista principal (pregunta 1)  │  Vista 2 (pregunta 2)   │  fila 2: la vista clave a la izquierda
│  p. ej. tendencia mensual      │  p. ej. ranking         │
├────────────────────────────────┴─────────────────────────┤
│  Vista 3 opcional / detalle                              │  fila 3
└──────────────────────────────────────────────────────────┘
```

- **2-3 vistas analíticas.** Más vistas hacen el dashboard más lento (una
  consulta por hoja y por filtro compartido) y más difícil de leer. Si la
  historia no cabe, haz otro dashboard y enlázalo con un botón `navigation`.
- **KPIs (BANs):** van en la primera fila, más grandes y en **negrita** que el
  resto (`format Font`/`TextRuns`); el texto, en gris o negro. Varios KPIs como
  hojas sueltas cuentan como vistas y consultas. Prefiere **una hoja de KPIs**
  (Measure Names/Values en columnas, `mark: text`) cuando compartan la fuente de
  datos y el filtro.
- **Tamaño fijo, al tamaño final de visualización** (`dashboard Create`
  `width`/`height`). Es la regla del Workbook Optimizer. Para móvil, añade
  `dashboard AddDeviceLayout` en lugar de usar tamaño automático.
- **Mosaico con contenedores, no flotante:** filas con `dashboard Create
  rows`/`heights`. El flotante, solo para superposiciones (leyendas o ayudas)
  con tamaño y posición fijos.
- **Espacio en blanco en lugar de líneas** para separar bloques
  (`format Container`/`Zone`, márgenes).
- **Interactividad explicada:**
  - la tarjeta de filtro tiene un título-instrucción («Elige un canal»);
  - el subtítulo dice qué se puede hacer («Haz clic en una categoría para
    filtrar»);
  - prefiere **acciones de filtro** (`action Create kind=filter`) a muchas
    tarjetas;
  - un filtro compartido entre hojas: `filter AddShared`.
- **Oculta las hojas** que solo viven dentro del dashboard
  (`worksheet SetVisibility`) y fija el dashboard como hoja inicial
  (`workbook SetStartSheet`). Ocultar no es seguridad: quien puede descargar el
  libro ve todas las hojas.

## 4. Historias

- Empieza con una pregunta clara. Para una audiencia ocupada, **abre con la
  conclusión** y después muestra el soporte; si no, construye hasta ella.
- Elige el tipo: cambio en el tiempo, drill-down, zoom-out, contraste,
  intersecciones, factores o atípicos.
- El primer punto da la visión más amplia. Cada punto siguiente cambia un
  filtro o un resaltado: `story Create`, `story AddPoint`.
- Pocos puntos y sin elementos que sobren.

## 5. Antes de entregar (checklist)

1. Un propósito por libro. Nombres y títulos descriptivos. Ninguna «Sheet N».
2. Cada dashboard tiene 2-3 vistas más KPIs, la vista clave arriba a la
   izquierda, tamaño fijo, mosaico y filtros con instrucción.
3. Formatos de número de negocio, ejes y tooltips con lenguaje de negocio, y un
   color de acento.
4. Hojas internas ocultas; el dashboard es la hoja inicial.
5. Extract en lugar de conexión viva para archivos. Ninguna regla del Workbook
   Optimizer en «Take action».
6. Verificación de la entrega:
   - `workbook Lint` da 90 o más;
   - `export_image` revisada con tus ojos;
   - `desktop_operations Warnings` y `ErrorDialogs` vacíos.
7. Recomendación de publicación: proyecto destino y, si aplica, colección y
   orden de lectura.

Si `tableu` no puede aplicar una regla, no la sustituyas por XML a mano.
**Dilo** al usuario: qué regla es y qué operación faltó.
