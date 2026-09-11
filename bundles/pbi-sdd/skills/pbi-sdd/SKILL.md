---
name: pbi-sdd
description: >-
  Spec-driven workflow for Power BI work. Use it to start a new report or
  dashboard project (brief, spec, tasks, build, verify) or to survey an existing
  or already-published report before changing it — a "levantamiento": inventory,
  audit, as-is documentation. Invoke with a phase: `survey`, `new`, `spec`,
  `tasks`, `build`, `verify`, or no argument for status. Triggers: "new Power BI
  project", "survey this report", "levantamiento", "audit/document this report",
  "what does this report do", "plan changes to this report", "sdd".
---

# pbi-sdd — spec-driven Power BI work

A thin workflow that turns report work into written, reviewable steps. It does
not replace the craft skills — it decides *when* each one is used and *what gets
written down*. Work lives in the project, next to the `.pbip`, so it is reviewed
and versioned with the report itself.

**Write every artifact in the language the user writes to you in.**

## The two ways in

```
new project   new ─▶ spec ─▶ tasks ─▶ build ─▶ verify
                        ▲
existing      survey ───┘   (as-is spec, then the same path for any change)
```

| Phase | Use when | Writes | Gate |
|---|---|---|---|
| `survey` | A report exists (local PBIP or published) and nobody has written down what it does | `survey.md`, `evidence.md` | Owner reviews findings |
| `new` | Starting a report from scratch | `spec.md` | **User approves the spec** |
| `spec` | Turning survey findings or a request into a change to an existing report | `spec.md` | **User approves the spec** |
| `tasks` | An approved spec exists | `tasks.md` | — |
| `build` | Tasks exist; implement them one at a time | edits + `tasks.md` ticks | Each task's check passes |
| `verify` | Tasks are done | `verification.md` | Every acceptance criterion has evidence |

To run a phase, read `references/<phase>.md` from this skill's folder and follow
it exactly. With no argument, report status: list `sdd/`, say which change is
open, which phase it is in, and what the next command is.

## Rules that hold in every phase

1. **One change, one folder:** `sdd/NNN-<slug>/`, numbered in order
   (`001-survey-sales-report`, `002-add-service-kpis`). `sdd/README.md` is the
   index: one line per change with its status. Create both if missing.
2. **Never pass a gate on your own.** No tasks before the user approves the
   spec in so many words; record it in the spec as
   `Approved by <name> on <date>`.
3. **Evidence over assertion.** Inventories come from the survey script, checks
   from tools. Paste what a tool said; never describe what it "would" say.
4. **Small steps.** A task touches one area (a table, a page, a theme) and
   carries its own check. Build never batches tasks without running checks.
5. **Stop at every gate** and tell the user exactly what to review and which
   command comes next.

## Skills this workflow leans on

Use them when installed; say so when one is missing instead of improvising its
job.

| Need | Skill |
|---|---|
| Requirements rounds, locked report spec | `powerbi-report-planning` |
| Page archetypes, charts, colour, layout | `powerbi-report-design` |
| Writing pages and visuals (PBIR) | `powerbi-report-authoring` |
| Measures, tables, relationships | `semantic-model-authoring`, `tmdl` |
| Downloading a published report | `powerbi-report-management` |
| PBIR/TMDL format questions | `pbir-format`, `pbip` |

If data-goblin's `pbip` plugin is installed, its hooks validate every TMDL and
PBIR edit automatically. When a hook reports a problem, fixing it is part of the
current task.
