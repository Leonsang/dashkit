# build — one task at a time

Loop over `tasks.md` from the first unchecked task:

1. **Say what you are about to do** in one sentence, naming the task.
2. **Load the task's skill** and make the change the way that skill describes.
   Prefer the authoring CLIs and MCP tools the skills name over hand-editing
   JSON; when you do edit TMDL or PBIR by hand, follow `tmdl` / `pbir-format`.
3. **Guardrails.** If a validation hook reports a problem after an edit, the
   task is not done: fix it, and re-run the edit until the hook is quiet.
4. **Run the task's check** exactly as written. Paste the relevant output.
5. **Tick it** in `tasks.md` with one line of evidence:
   `- [x] **T1 — …** — checked: Case Count = 1,204 (dax query)`.
6. **Stop after each task** if the user asked to go step by step; otherwise
   continue, but never start a task while the previous check is failing.

If a check fails and the fix would change the spec — a measure definition, a
page, a scope line — stop and ask. The spec is the contract; build does not
rewrite it.

When every task is ticked, tell the user the next step is `pbi-sdd verify`.
