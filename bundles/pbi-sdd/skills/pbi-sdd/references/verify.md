# verify — prove the acceptance criteria

For every acceptance criterion in `spec.md`, run something that shows it holds.
Choose the strongest check available:

| Criterion is about | Check with |
|---|---|
| A number | A DAX query through the Power BI modeling MCP (`dax_query_operations`) or `semantic-model-authoring`, against the model open in Desktop |
| Model hygiene (descriptions, formats, folders) | The survey script again: `node <this skill's folder>/scripts/survey.mjs <pbip>` — compare with the survey's evidence |
| The report opens and is valid | The PBIP validators available (data-goblin's `pbip`, `powerbi-report-authoring`'s validate), and a Desktop reload if `powerbi-desktop` is available |
| A page or visual exists and binds | The PBIR files, and the survey script's "Broken references" section |

Write `verification.md`:

```markdown
# Verification: <change>

Spec: [spec.md](spec.md) · Tasks: [tasks.md](tasks.md) · Verified <date>

| # | Criterion | Result | Evidence |
|---|---|---|---|
| 1 | … | ✅ pass / ❌ fail | <command and the line of output that decides it> |

## Before and after
<For a change built on a survey: re-run the survey script and show which
findings are gone and whether any new ones appeared.>
```

A criterion without evidence is a fail, not a pass.

Finally set the change to *done* (or *failed: criterion N*) in `sdd/README.md`,
and suggest a commit message that names the change folder.
