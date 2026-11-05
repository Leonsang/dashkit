# new — un libro desde cero

Objetivo: un `spec.md` aprobado que diga para quién es el libro, qué debe
responder y cómo se sabrá que está terminado.

1. Crea `sdd/NNN-<slug>/` y añade su línea a `sdd/README.md`
   (*spec en curso*).
2. Conversa por rondas, nunca con todas las preguntas a la vez:
   - audiencia y decisión;
   - datos disponibles (`datasource_operations PreviewFile` para ver un
     CSV/Excel antes de conectarlo);
   - preguntas que debe responder;
   - dashboards y su arquetipo.
3. Escribe `spec.md`:

```markdown
# Spec: <libro>

## Audiencia y decisión
## Preguntas que debe responder
1. <Pregunta en palabras de la audiencia> → <dashboard que la responde>

## Datos
| Fuente | Tipo (CSV, Excel, base, .tds) | Tablas y relaciones | Conexión viva o extract |
|---|---|---|---|

## Medidas y calculados
| Nombre | Definición de negocio | Fórmula Tableau | Formato |
|---|---|---|---|

## Dashboards
| Dashboard | Vistas (tipo de gráfico) | Interacción (filtros, acciones, parámetros) | Responde |
|---|---|---|---|

## Fuera de alcance

## Criterios de aceptación
- [ ] <Comprobable: "El KPI Ventas del dashboard Resumen vale 1.204.330 para 2025">
- [ ] `workbook_operations Lint` ≥ 90
- [ ] `desktop_operations Warnings` y `ErrorDialogs` vacíos al abrir el libro
```

   Cada criterio tiene que poder comprobarse ejecutando algo o leyendo un
   archivo concreto. Reescribe los que no cumplan eso.

4. **Puerta:**
   - aprobación explícita, anotada en el spec como
     `Aprobado por <nombre> el <fecha>`;
   - `sdd/README.md` a *aprobado*;
   - siguiente paso: `tableau-sdd tasks`.
