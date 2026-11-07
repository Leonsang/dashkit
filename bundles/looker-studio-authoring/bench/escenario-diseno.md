# Escenario 2 del benchmark: replicar un diseño de marca

El agente recibe el CSV de «Café Brisa», un diseño de referencia completo (marca y dos tableros) y dashkit.
Tiene que construir en Looker Studio los dos tableros lo más parecidos posible al diseño.

## Entrada

- `bench/datos/cafe_brisa.csv`: los mismos datos del escenario 1.
- `bench/diseno/`: el diseño de referencia, hecho en Claude Design (lienzo «Café Brisa · tableros»).
  - `resumen-ejecutivo.png` y `operacion-de-locales.png`: los dos tableros, a tamaño real (lienzo de
    1330 × 1000 px: las medidas de la imagen son las del informe).
  - `marca.png`: logo, paleta con sus hex, tipografía, iconos y reglas de los tableros.
  - `Main.html`, `Operacion.html`, `Marca.html`: el código de cada tablero (cajas, colores y textos exactos).
  - `assets/`: `logo-mark.png`, `ilustracion-banner.png` y los iconos en caramelo y en blanco
    (`icono-<nombre>-caramelo.png`, `icono-<nombre>-blanco.png`).

## Tarea

1. **Crear el informe** con el CSV como origen, usando dashkit. Preparar los campos que haga falta (fecha
   como fecha, valoración como número).
2. **Leer el diseño** y escribir `mapeo.md` antes de construir: cada elemento del diseño con la herramienta o
   clave de dashkit que lo reproduce, su caja `[x, y, w, h]` y lo que no se pueda reproducir tal cual (y la
   alternativa elegida).
3. **Tema de la marca**: fondo crema, texto espresso, acento caramelo, series caramelo, salvia y arena,
   tipografía del diseño (o la más cercana que ofrezca Looker Studio).
4. **Construir los dos tableros** con un spec (lint, dry-run, apply):
   - **Marco común a nivel de informe**: barra lateral espresso con el logo, el nombre y los botones de las
     dos páginas; los controles de local, canal y periodo arriba.
   - **Resumen ejecutivo**: banner con la ilustración y el mensaje principal; 4 KPI en tarjeta con icono y
     comparación con el año anterior; ingresos por mes de este año frente al anterior con métricas
     intercambiables (ingresos, tickets, ticket medio); donut por canal; barras por local; tabla de
     categorías.
   - **Operación de locales**: 4 KPI con icono y comparación; mapa de calor de espera por local y turno;
     espera por hora del día; burbujas de espera frente a valoración; ranking de locales.
5. **Verificar como el lector**: captura en modo vista de cada página comparada con el PNG del diseño,
   `check_view` (los botones llevan a su página), `diagnose_report`, `audit_ux`.
6. **Informar**: URL, qué quedó igual, qué se aproximó y por qué, qué no se pudo.

## Reglas

- Solo dashkit (CLI o MCP). Nada de scripts propios contra el navegador.
- No borrar nada fuera del informe nuevo. No escribir datos personales.
- Si algo falla dos veces igual, parar y anotarlo.
