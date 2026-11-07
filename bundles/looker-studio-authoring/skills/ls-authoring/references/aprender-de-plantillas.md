# Aprender de cualquier plantilla y rehacerla con dashkit

Sirve para cualquier informe de Looker Studio, propio o ajeno (una plantilla de la galería, un informe
compartido): se lee en modo vista, sin copiarlo ni tocarlo, y lo bueno se rehace con las herramientas de
dashkit en el informe del usuario. No se copian marcas, logos, textos ni iconos de otros: se copian los
**patrones** (estructura, medidas, interacciones) y se usan los iconos de `assets/icons` o los del usuario.

## 1. Leer el diseño

1. `open_report url=<informe>`: se abre en la misma pestaña; en modo vista basta.
2. `analyze_report_design pageId?` (CLI `design`): perfil de la página y del marco común:
   - `canvas` y `theme`: tamaño, fuente, relleno (el fondo de página sale del `fill` del tema), acento, series;
   - `shell`: barra lateral (caja, color, radio), barra superior, enlaces a páginas (`navItems`) y controles
     comunes (`globalControls`), todos a nivel de informe;
   - `page.cards`: formas que contienen datos, con color, radio y título (cuadro de texto encima o título propio);
   - `page.kpis`: cuadro de icono, comparación (`previous_period`, `previous_year`), tamaño del valor;
   - `page.interactions`: métricas opcionales, niveles de desglose, filtro cruzado;
   - `page.texts`, `shapeColors`, `spacing`: tipografía, paleta de las formas y separaciones;
   - `mapping`: qué clave del spec reproduce cada patrón.
3. `screenshot_report view=true` (CLI `shot --view`): mira la página como el lector. Con `componentId`, solo esa
   pieza. El perfil dice qué hay; la captura, cómo se ve.
4. Para una pieza concreta: `get_component_config` (incluye `behavior`), `get_chart_style` y
   `list_style_keys componentId filter=...` (todas las claves de estilo que acepta, con su valor). Una clave sin
   herramienta propia se pone con `patch_component style`.

## 2. Rehacerlo con dashkit

Escribe un spec (`informe-como-codigo.md`) con lo que el perfil propone:

| Patrón en el perfil | En el spec |
|---|---|
| Barra lateral, barra superior, controles comunes | `reportLevel: true` en la forma, los controles y las entradas |
| Enlaces a páginas | `linkPage` en un botón (con el nombre como texto del botón) o en una imagen |
| Tarjetas con datos | `card: {title}` (forma detrás, título dentro) |
| Scorecard con cuadro de icono | `card: {icon, iconBackground}` |
| Comparación | `comparison` |
| Métricas opcionales, desglose, filtro cruzado | `interactions` |
| Fondo de página de color | `fill` del tema (`themes/library/panel-lateral.json` como base) |
| Navegación de Looker Studio | `settings.viewModeNav` |

Adapta las medidas al lienzo del usuario (el perfil da las de la plantilla) y a sus datos; el arquetipo
«panel con barra lateral» de `ls-diseno-layout` es un ejemplo completo.

## 3. Comprobarlo como el lector

1. `apply_report_spec` (primero `dryRun`). Se encarga de las capas: las formas que contienen otros componentes
   van al fondo y los iconos o textos dentro de un botón, al frente.
2. `screenshot_report view=true`: ¿se ve todo? Un fondo puede tapar un control; un texto puede salirse.
3. `check_view clickLinks=true`: por componente, los controles que aparecen al pasar el ratón («Métricas
   opcionales», «Desglosar información») y adónde lleva cada enlace de verdad.
4. `diagnose_report` y `audit_ux`.

## Cuidado

- Si la pestaña queda oculta (ventana tapada o minimizada), el editor no pinta: las herramientas la traen al
  frente, pero si el usuario está usando el navegador, espera.
- Un periodo fijo no se puede fijar todavía (solo móviles con `dateRangeDays`); con datos antiguos la
  comparación con el periodo anterior sale vacía.
