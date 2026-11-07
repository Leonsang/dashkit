# Escenario del benchmark: dos tableros para «Café Brisa»

Mismo enunciado para todos los modelos. El agente solo recibe el archivo de datos y dashkit.

## Entrada

- `bench/datos/cafe_brisa.csv`: una red de cafeterías inventada (6 locales en España y Portugal, enero de
  2025 a octubre de 2026). Cada fila es una línea de ticket: `ticket_id, fecha, hora, turno, local, ciudad,
  pais, region, canal, cliente_fidelizado, categoria, producto, unidades, precio_unitario, descuento_pct,
  ingresos, coste, tiempo_espera_min, valoracion` (valoración vacía si el cliente no valoró).

## Tarea

1. **Crear el informe** en Looker Studio con ese archivo como origen de datos, usando dashkit.
2. **Elegir la plantilla**: un arquetipo de `ls-diseno-layout` (o el marco «panel con barra lateral») y un tema
   de la biblioteca de dashkit. Justificarlo en dos o tres frases.
3. **Proponer el mock de diseño** antes de construir: `mock.md` con el arquetipo y el tema, y por página las
   preguntas de negocio, cada componente con su caja `[x, y, w, h]`, tipo, campos y controles.
4. **Construir los dos tableros** (dos páginas) con un spec: lint, dry-run y apply.
   - «Resumen ejecutivo»: ¿cómo va el negocio? Ingresos, tickets, ticket medio, margen, con comparación frente
     al periodo anterior; evolución en el tiempo; reparto por canal y por local.
   - «Operación de locales»: turnos, tiempo de espera y valoración por local; dónde y cuándo se espera más;
     relación entre espera y valoración.
5. **Verificar como el lector**: captura en modo vista de cada página, `check_view`, `diagnose_report`, `audit_ux`.
6. **Informar**: URL del informe, qué se construyó, qué se verificó y lo que no se pudo.

## Reglas

- Solo dashkit (CLI o MCP). Nada de scripts propios contra el navegador.
- No borrar nada fuera del informe nuevo. No escribir datos personales.
- Si algo falla dos veces igual, parar y anotarlo.
