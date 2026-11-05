# build — una tarea cada vez, dentro de una transacción

Recorre `tasks.md` desde la primera tarea sin marcar:

1. **Di qué vas a hacer** en una frase, nombrando la tarea.
2. **Transacción obligatoria:**
   - `transaction_operations Begin` sobre el target;
   - las operaciones de la tarea (con `dry_run=true` primero si dudas);
   - `transaction_operations Commit`.

   Si el Commit no valida: `Rollback`, corrige y repite. No apliques a medias.
3. **Si el Commit vuelve con `applied: "partial"`** (el libro está abierto en
   Desktop y la tarea añade parámetros, acciones o botones):
   - enumera `dropped`;
   - pide permiso;
   - ejecuta `workbook_operations Reopen` con el `pending` y `confirm=true`.

   Sin permiso, la tarea no está hecha.
4. **Guardarraíles:** si el hook de `tableau-guardrails` informa de problemas
   de lint después de editar el archivo, la tarea no está hecha: corrígelos.
5. **Ejecuta la comprobación de la tarea** tal como está escrita y pega la
   salida relevante.
6. **Márcala** con una línea de evidencia:
   `- [x] **T1 — …** — comprobado: field List muestra Fecha (date)`.
7. **Detente tras cada tarea** si el usuario pidió ir paso a paso. Si no,
   continúa, pero nunca empieces una tarea con la comprobación anterior
   fallando.

Si una comprobación falla y arreglarla cambiaría el spec (una medida, un
dashboard, una línea de alcance), detente y pregunta. El spec es el contrato.

Cuando todas estén marcadas, di que el siguiente paso es
`tableau-sdd verify`.
