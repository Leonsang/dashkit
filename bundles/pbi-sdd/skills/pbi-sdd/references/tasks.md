# tasks — from an approved spec to a checklist

Refuse to start if `spec.md` has no `Approved by` line: say so and stop.

Write `tasks.md` in the change folder. Order tasks so that nothing is built on
something that does not exist yet:

1. sources and refresh
2. tables, columns and relationships
3. measures
4. pages and visuals
5. formatting and theme
6. documentation (descriptions, the survey's as-is spec updated)

Each task touches one area and says how it will be checked:

```markdown
# Tasks: <change>

Spec: [spec.md](spec.md)

- [ ] **T1 — <goal in one line>**
  - Files: `<Model>.SemanticModel/definition/tables/Cases.tmdl`
  - Skill: `semantic-model-authoring` (or `tmdl`)
  - Check: <command to run or file to read, and the result that means done>
  - Acceptance: <which criterion in the spec this serves>
```

Rules:

- Every acceptance criterion in the spec is served by at least one task. List
  any that are not, and add tasks for them.
- A task whose check you cannot state is too vague: split or sharpen it.
- No task says "and" about two different areas.

Show the list, then tell the user the next step is `pbi-sdd build`.
