# tasks — de un spec aprobado a una lista de tareas

Niégate a empezar si `spec.md` no tiene línea `Aprobado por`: dilo y detente.

Escribe `tasks.md` en la carpeta del cambio, en un orden en que nada se
construya sobre algo que aún no existe:

1. fuentes de datos, relaciones y extract;
2. campos, calculados, parámetros, conjuntos y grupos;
3. hojas (con filtros, orden y formato de la propia hoja);
4. dashboards y sus zonas;
5. acciones, botones e historias;
6. formato del libro y documentación (descripciones de campos, levantamiento
   actualizado).

```markdown
# Tareas: <cambio>

Spec: [spec.md](spec.md)

- [ ] **T1 — <objetivo en una línea>**
  - Herramienta: `datasource_operations CreateFromFiles` (o la que sea)
  - Comprobación: <qué ejecutar y qué resultado significa hecho, p. ej. `field_operations List` muestra Fecha como date>
  - Criterio: <qué criterio del spec cubre>
```

Reglas:
- Cada criterio del spec lo cubre al menos una tarea.
- Si no sabes escribir la comprobación de una tarea, es demasiado vaga:
  divídela o concrétala.
- Ninguna tarea dice "y" sobre dos áreas distintas.

Muestra la lista y di que el siguiente paso es `tableau-sdd build`.
