# verify — demostrar los criterios de aceptación

Para cada criterio de `spec.md`, ejecuta algo que demuestre que se cumple.
Obligatorio en todo cambio:

1. **`export_image`** de cada dashboard afectado. Míralo y describe en una
   frase lo que se ve. Si no está en pantalla, usa
   `workbook_operations ShowSheet` con `confirm=true` y vuelve a exportar. Pide
   permiso antes, porque reabre Desktop.
2. **`desktop_operations Warnings`** y **`desktop_operations ErrorDialogs`**
   vacíos con el libro abierto.
3. **`workbook_operations Lint`**: la puntuación, comparada con la del
   levantamiento si lo hay.

Según el criterio:

| El criterio trata de | Compruébalo con |
|---|---|
| Un número | `workbook_operations SummaryData` de la hoja que lo muestra |
| Estructura (hojas, campos, acciones) | `workbook_operations Info`, `field_operations List`, `action_operations List` |
| Calidad | `workbook_operations Lint` |
| Aspecto | `export_image` |

Escribe `verification.md`:

```markdown
# Verificación: <cambio>

Spec: [spec.md](spec.md) · Tareas: [tasks.md](tasks.md) · Verificado el <fecha>

| # | Criterio | Resultado | Evidencia |
|---|---|---|---|
| 1 | … | ✅ / ❌ | <herramienta y la línea de salida que lo decide> |

## Imágenes
<Ruta de cada export_image y una frase de lo que muestra.>

## Avisos de Desktop
<Salida de Warnings y ErrorDialogs (vacía = ninguno).>
```

Un criterio sin evidencia es un fallo, no un acierto.

Al terminar:
- marca el cambio como *hecho* (o *falló: criterio N*) en `sdd/README.md`;
- sugiere un mensaje de commit que nombre la carpeta del cambio.
