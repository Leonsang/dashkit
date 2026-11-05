# tasks — de un spec aprobado a tareas

Niégate a empezar si `spec.md` no tiene `Aprobado por`.

Ordena las tareas así:

1. copia del informe (`copy_report`), si aún no existe;
2. campos calculados de origen (`add_source_field`), sobre todo los
   booleanos que necesitan casillas y botones de filtro;
3. páginas (`add_page`, `rename_page`) y tema (`use_theme` / `apply_theme`);
4. componentes del `.spec.json`, página por página: cada página es una tarea
   que aplica el spec;
5. filtros de página e informe (`add_filter`) y ajustes (`report_settings`);
6. documentación (levantamiento actualizado).

```markdown
- [ ] **T1 — <objetivo>**
  - Herramienta: `apply_report_spec` (páginas 2-3 del spec) | `add_source_field` | …
  - Comprobación: <p. ej. diagnose_report sin issues en la página tras reload; en modo vista, la casilla filtra la tabla>
  - Criterio: <criterio del spec>
```

Cada criterio debe quedar cubierto por al menos una tarea. Una tarea sin
comprobación escribible está mal definida.

Siguiente paso: `ls-sdd build`.
