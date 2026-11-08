# Arquetipos de página

Cuatro formas de página que cubren casi todos los informes. Cada una con su retícula sobre un lienzo de
1200 × 900 px, retícula de 10 px, margen de 20 px y separación de 20 px (§2 y §3 de la skill). Las cajas
están en `[x, y, w, h]` y son las de los specs de ejemplo de `looker-studio-mcp/examples/`, probados en un
informe de prueba.

Elige el arquetipo por la pregunta de la página, no por los gráficos disponibles. Un informe suele tener
un **Resumen** y una o dos páginas de **Desglose**; la de **Detalle** va al final.

## 1. Resumen ejecutivo

*¿Cómo vamos?* Para dirección, en un pantallazo.

```
┌──────────────────────────────────────── cabecera: título · controles · periodo [880,20,280,60] ┐
│ KPI      │ KPI      │ KPI      │ KPI           fila de 4 a 6 scorecards, y=100 h=120         │
├──────────────────────────────────┬────────────────────────────────────────────────────────────┤
│ Tendencia de la métrica principal │ Reparto (barras o circular, 2 o 3 partes)                 │
│ [20,240,740,300]                  │ [780,240,380,300]                                         │
├──────────────────────────────┬───┴──────────────────────────────────────────────────────────────┤
│ Mapa o desglose [20,560,560,320] │ Tabla corta, top 10 [600,560,560,320]                      │
└──────────────────────────────┴───────────────────────────────────────────────────────────────┘
```

- La fila de KPIs con la macro `row` del spec; todas con la misma comparación (`ls-kpi-scorecards`).
- La tendencia con fecha continua (`simple-linechart` o `simple-timeline`).
- Ejemplo: `resumen.spec.json`.

## 2. Desglose

*¿Dónde está la diferencia?* Por producto, región, canal o geografía.

```
┌ control [20,20,280,60] │ control [320,20,280,60] │            │ periodo [880,20,280,60] ┐
├─────────────────────────────────────────┬────────────────────────────────────────────────┤
│ Jerarquía: treemap [20,100,560,360]     │ Cruce: tabla dinámica con mapa de calor        │
│                                         │ [600,100,560,360]                              │
├─────────────────────────────────────────┼────────────────────────────────────────────────┤
│ Relación: burbujas [20,480,560,400]     │ Ranking: tabla con mapa de calor               │
│ x_metric · y_metric · bubble_size       │ [600,480,560,400]                              │
└─────────────────────────────────────────┴────────────────────────────────────────────────┘
```

- Dos columnas de 560 px. Los controles arriba a la izquierda y el periodo a la derecha.
- Un filtro de página para lo que el lector no debe cambiar (p. ej. excluir devoluciones).
- Ejemplo: página "Producto y geografía" de `paginas-2-3.spec.json`.

## 3. Objetivos y embudo

*¿Llegamos?* Seguimiento contra un objetivo y por etapas.

```
┌──────────────────────────────────────────────────────────── periodo [880,20,280,60] ┐
├──────────────────────────────────────────────┬──────────────────────────────────────┤
│ Dos medidas en el tiempo: combinado          │ Indicador (gauge) contra objetivo    │
│ [20,100,740,300]                             │ [780,100,380,300]                    │
├──────────────────────────────────────┬───────┴──────────────────────────────────────┤
│ Área apilada con breakdown           │ Flujo: sankey fuente → medio                 │
│ [20,420,560,300]                     │ [600,420,560,300]                            │
├──────────────────────────────────────┼──────────────────────────────────────────────┤
│ Bala: real frente a objetivo         │ Embudo [600,740,560,140]                     │
│ [20,740,560,140]                     │                                              │
└──────────────────────────────────────┴──────────────────────────────────────────────┘
```

- El objetivo tiene que estar en los datos (una columna o un campo calculado); el gráfico de bala y el
  indicador lo comparan.
- Ejemplo: página "Objetivos y tráfico" de `paginas-2-3.spec.json`.

## 4. Exploración y detalle

*Quiero buscar.* Para analistas: muchos controles y una tabla larga.

```
┌ lista desplegable  ┐ ┌ control de dimensiones [320,20,400,60] ┐
│ cuadro de entrada  │ ├──────────────────────────────────────────────────────────────────┐
│ filtro avanzado    │ │ Barras por la dimensión elegida [320,100,840,360]                │
│ control deslizante │ │                                                                  │
│ periodo            │ ├──────────────────────────────────────────────────────────────────┤
│ botón              │ │ Tabla de detalle, paginada [320,480,840,400]                     │
│ lista fija         │ │                                                                  │
└ columna de 280 px  ┘ └──────────────────────────────────────────────────────────────────┘
```

- Columna de controles de 280 px a la izquierda, uno cada 80 px.
- El **control de dimensiones** deja al lector cambiar la dimensión de los gráficos.
- Tabla paginada de 10 a 25 filas por página (`ls-rendimiento` §8).
- Ejemplo: `pagina-4-controles.spec.json`.

## 5. Panel con barra lateral (envoltorio para todo el informe)

No es una página sino el **marco común** de todas: navegación propia a la izquierda y una barra de filtros
arriba, los dos a nivel de informe. Patrón de plantillas comerciales publicadas, rehecho con dashkit
(`showcase.spec.json`; verificado el 2026-11-07). Lienzo de 1330 × 980 px.

```
┌──────┬─────────────────────────────────────────── título de la página [170,20,840,60] ───────┐
│marca │ ┌ filtros [170,90,1140,60]: ▣ Filtros · canal · región · categoría · periodo ────────┐ │
│      │ └─────────────────────────────────────────────────────────────────────────────────────┘ │
│ ▣    │ ┌▣ KPI ┐┌▣ KPI ┐┌▣ KPI ┐┌▣ KPI ┐┌▣ KPI ┐   tarjetas con icono, y=170 h=120            │
│Resum.│ ┌ Tarjeta con título ────────────────┐┌ Tarjeta con título ────┐                       │
│ ▣    │ │ [170,310,740,300]                  ││ [930,310,380,300]       │                       │
│Impul.│ └────────────────────────────────────┘└─────────────────────────┘                       │
│ ...  │ ┌ Tarjeta ─────────────────┐┌ Tarjeta ──────────────────┐                               │
│[10,10│ │ [170,630,560,320]        ││ [750,630,560,320]          │                               │
│140,  │ └──────────────────────────┘└────────────────────────────┘                               │
│960]  │                                                                                          │
└──────┴──────────────────────────────────────────────────────────────────────────────────────────┘
```

- **Barra lateral** (`reportLevel: true`): forma de 140 px de ancho en el color oscuro de la marca, con radio
  16; la marca arriba; una entrada por página cada 100 px: icono blanco de 40 px con `linkPage` y debajo un
  botón del color de la barra con el nombre de la página como texto (12 px, blanco) y `linkPage`. Un cuadro de
  texto encima de un botón se queda con el clic y no navega (los cuadros de texto no tienen enlace); por eso
  el nombre es el texto del botón. Una franja blanca de 6 px por página marca la activa. La navegación de
  Looker Studio (`settings.viewModeNav`: `nav-left` o `nav-tab`) sigue visible fuera del lienzo en modo
  vista: aún no hay forma conocida de ocultarla.
  Verificado en modo vista el 2026-11-07: icono y texto abren su página.
- **Barra de filtros** (`reportLevel: true`): forma blanca de 60 px de alto con un cuadro de icono, la
  palabra «Filtros» y los controles de lista desplegable más el periodo, todos de 230 px. Los mismos filtros
  valen para todas las páginas; los propios de una página van en su cuerpo.
- **Tarjetas** (`card`): cada gráfico en una forma blanca de radio 12 con su título dentro; los KPIs con un
  cuadro de color con icono a la izquierda y la variación frente al periodo anterior (`comparison`).
- **Tema** `panel-lateral`: fondo de página gris claro (#F4F6F9) y sin borde por componente, para que las
  tarjetas blancas hagan de borde.
- **Gráfico principal vivo**: métricas opcionales y desglose mes › semana › día (`interactions`).
- Cuidado con el contraste del texto de la barra lateral: blanco sobre el color oscuro, ≥ 4,5:1.

## Reglas comunes

- **Cabecera de 60 a 100 px** con los controles; el periodo siempre arriba a la derecha.
- **Como mucho 10–15 componentes con datos** por página; el lint avisa a partir de 15.
- **Mismo ancho de lienzo** en todas las páginas.
- **Un tema** para todo el informe y `stripStyles` en lo creado desde plantillas
  ([temas-y-color.md](temas-y-color.md)).
