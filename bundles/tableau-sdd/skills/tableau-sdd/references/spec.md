# spec — un cambio a un libro existente

1. Si el libro no tiene levantamiento, ejecuta antes `tableau-sdd survey`: un
   cambio necesita una base.
2. Crea `sdd/NNN-<slug>/` y enlaza el levantamiento del que parte.
3. Escribe `spec.md`:

```markdown
# Spec: <cambio>

Parte de: [levantamiento](../NNN-survey-<slug>/survey.md)

## Por qué
<Hallazgos (por número) o el pedido que responde.>

## Qué cambia
| Área | Hoy | Después |
|---|---|---|

## Qué no debe cambiar
<Números, dashboards o comportamientos de los que dependen los usuarios.>

## Fuera de alcance

## Riesgos
<Qué puede romperse (calculados que usan otras hojas, acciones, filtros de contexto) y cómo lo
protegen las tareas. Si el cambio añade parámetros, acciones o botones sobre el libro abierto en
Desktop, anota que la API en vivo los descarta y que se cargarán con `workbook Reopen`, que cierra
y reabre Desktop.>

## Criterios de aceptación
- [ ] <Comprobable>
- [ ] Las medidas que usan otras hojas devuelven lo mismo que antes
- [ ] `workbook_operations Lint` no baja respecto al levantamiento
```

4. **Puerta:**
   - aprobación explícita (`Aprobado por <nombre> el <fecha>`);
   - `sdd/README.md` actualizado;
   - siguiente paso: `tableau-sdd tasks`.
