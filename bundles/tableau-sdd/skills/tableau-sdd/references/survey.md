# survey — levantamiento de un libro existente

Objetivo: un documento que el dueño lea en diez minutos y que diga para qué es
el libro, cómo está construido, de dónde salen sus datos y qué falla en él,
con cada afirmación respaldada.

## 1. Tener el libro

- **Hay un `.twb`/`.twbx` en el proyecto:** úsalo como `target`.
- **Está abierto en Desktop pero no guardado en el proyecto:** pide que lo
  guarden con *Guardar como*, o usa `target=live` solo para leer.
- **Está publicado en Tableau Server/Cloud:** pide que lo descarguen. Este
  flujo no descarga de servidores.

## 2. Reunir evidencia (obligatorio)

Crea `sdd/NNN-survey-<slug>/` y ejecuta, sobre el libro:

1. `workbook_operations Info`: hojas, dashboards, fuentes, parámetros y
   acciones.
2. `workbook_operations Lint`: la puntuación y cada hallazgo, con su regla.
3. `datasource_operations List` y, por cada fuente, `field_operations List`
   (calculados y su fórmula).
4. Si el libro está abierto en Desktop: `desktop_operations Warnings`.

Pega la salida completa en `evidence.md`, sin editar, con un encabezado por
herramienta.

## 3. Leer lo que los números no dicen

Abre solo lo que la evidencia señala:
- los dos o tres dashboards principales (`export_image` si están en
  pantalla);
- los calculados que alimentan sus KPI;
- las conexiones (archivo, base de datos o extract).

## 4. Escribir `survey.md`

```markdown
# Levantamiento: <libro>

Levantado el <fecha> desde <ruta>. Evidencia: [evidence.md](evidence.md).

## Para qué sirve
<Propósito inferido, audiencia y decisiones que apoya. Marca cada inferencia; se convierten en preguntas.>

## Cómo está construido
<Dashboard por dashboard: la pregunta que responde y las vistas que la responden.>

## Datos
<Fuentes, conexión viva o extract, relaciones/joins/blends, parámetros y para qué se usan.>

## Hallazgos
| # | Severidad | Hallazgo | Evidencia | Arreglo sugerido |
|---|---|---|---|---|
| 1 | Crítico | … | evidence.md › Lint › WBO-LIVE | … |

Severidad: **Crítico** rompe datos, refresco o acceso. **Conviene arreglar** engaña o frena el
mantenimiento. **Mejora** es pulido.

## Preguntas para el dueño
<Numeradas: todo lo inferido que no pudiste confirmar.>

## Spec del estado actual
<Dashboards, su propósito, medidas clave y su significado de negocio. Es la base para el spec de un cambio.>
```

## 5. Puerta

Muestra la tabla de hallazgos y las preguntas. Ofrece estas dos opciones y
espera la respuesta:

- dejar el levantamiento como documentación (en `sdd/README.md`:
  *documentado*);
- convertir los hallazgos elegidos en un cambio: `tableau-sdd spec`.
