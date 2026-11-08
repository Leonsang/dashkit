# Diseño de referencia: apuntar, pedir o generar

Un tablero se construye contra un diseño, no improvisando en la herramienta. En el benchmark de dashkit
(`bundles/looker-studio-authoring/bench/`), dos agentes que recibieron un diseño completo lo replicaron en
Looker Studio con una nota visual de 7,5 y 9 sobre 10; sin diseño, se quedaban en el arquetipo básico.

## 1. Apuntar a uno que existe

| Lo que da el usuario | Cómo leerlo |
|---|---|
| Enlace de Claude Design (`claude.ai/artifact/...`) | Con las herramientas de artefactos: los archivos `project/*.dc.html` tienen cajas, colores y textos exactos |
| PNG o captura | Mídelo: a tamaño real, sus píxeles son los del lienzo |
| HTML exportado | Lee estilos y cajas directamente |
| Figma | Con la integración de Figma si está; si no, pide un PNG por página |
| Otro tablero (Looker, Tableau, Power BI) | Analiza su estructura (`analyze_report_design` en Looker Studio) y copia patrones, no marcas |

Escribe `mapeo.md` antes de construir:

```
| Elemento del diseño | Caja [x,y,w,h] | Qué es | Herramienta / clave | Igual o aproximado |
| Barra lateral espresso | [0,0,220,1000] | forma a nivel de informe | spec reportLevel + style | igual |
| Objetivo 5 min | — | línea de referencia | (no disponible) | en el título |
```

Lo que no se pueda reproducir va con su alternativa elegida, no se omite en silencio.

## 2. Pedirlo

Si no hay diseño, pregunta una vez: «¿Tienes un diseño, marca o tablero de referencia?». Si no hay a quién
preguntar, sigue con la vía 3 y dilo.

## 3. Generarlo

- **Boceto rápido:** un arquetipo de la plataforma (en Looker Studio, `ls-diseno-layout` > arquetipos) y
  un `mock.md` con cada componente y su caja. Sirve para decidir estructura.
- **Diseño completo en Claude Design:** un lienzo con un tablero por página más un tablero de marca
  (logo, paleta con hex, tipografía, iconos, reglas). Con estas condiciones:
  - Cifras reales, calculadas de los datos; ninguna inventada.
  - Lienzo del tamaño de la plataforma (Looker Studio: el `width`×`height` del informe) para que las cajas
    se copien tal cual.
  - Tipografías que existan en la plataforma de destino (en Looker Studio, Inter no existe; Roboto, Lato,
    Montserrat, Playfair Display sí).
  - Paleta validada: contraste de texto ≥ 4,5:1, series ≥ 3:1 sobre el fondo, distinguible con daltonismo.
  - Solo lo que la plataforma puede dibujar, o marcado como aproximación (texto en el centro de un donut,
    líneas de referencia y barras dentro de tablas no siempre existen).
- **Exportarlo al proyecto:** PNG de cada tablero a tamaño real, su HTML y los recursos (logo, ilustración,
  iconos en PNG) en una carpeta del repositorio. El agente de la plataforma los sube desde ahí.

Ejemplo completo: `bundles/looker-studio-authoring/bench/diseno/` (Café Brisa) y su escenario
`bench/escenario-diseno.md`.
