# survey — levantamiento of an existing report

Goal: a document an owner can read in ten minutes that says what the report is
for, how it is built, where its data comes from, and what is wrong with it —
every claim backed by evidence.

## 1. Get the report into the project

- **A `.pbip` is already here:** use it.
- **The report is published and not in the repo:** download its definition as a
  PBIP with `powerbi-report-management` (needs `az login`). If that skill or the
  sign-in is unavailable, stop and ask the user to export it from Power BI
  Desktop as a PBIP (File → Save as → Power BI Project).
- **Thin report** (the survey says the model is remote): the model half of the
  survey is limited to what the report references. If the Power BI modeling MCP
  or `semantic-model-authoring` can reach the model, use them for the rest and
  say which source each fact came from.

## 2. Collect evidence

Create `sdd/NNN-survey-<slug>/` and run the survey script that ships with this
skill:

```
node <this skill's folder>/scripts/survey.mjs <path to the .pbip or its folder>
```

Save its full output as `evidence.md` in the change folder, unedited. Add
`--json` if you need to process the numbers further.

Where available, add deeper checks under a heading of their own in
`evidence.md`:

- data-goblin's `pbip` validator, if installed.
- `pbir validate` — only if the user has confirmed their use is allowed by its
  non-commercial licence. Never install it on your own.

## 3. Read what the numbers cannot tell you

Open only what the evidence points at: the three or four pages that carry data
visuals, the measures behind them, the partitions' M code. Do not read every
file.

## 4. Write `survey.md`

```markdown
# Survey: <report name>

Surveyed <date> from <local PBIP | workspace/report>. Evidence: [evidence.md](evidence.md).

## What it is for
<Inferred purpose, the audience it seems built for, the decisions it supports.
Mark every inference as one; they become questions below.>

## How it is built
<Page by page, one or two sentences each: the question the page answers and
the visuals that answer it.>

## Model
<Shape (star or not), fact and dimension tables, measure families and where
they live, relationships worth knowing about, RLS.>

## Data and refresh
<Sources, connectors, storage mode, and anything that will stop a refresh.>

## Findings
| # | Severity | Finding | Evidence | Suggested fix |
|---|---|---|---|---|
| 1 | Critical | … | evidence.md › Local file sources | … |

Severity: **Critical** breaks refresh, numbers or access. **Should fix** misleads
users or slows maintenance. **Nice to have** is polish.

## Questions for the owner
<Numbered. Everything you inferred but could not confirm.>

## As-is spec
<Pages, their purpose, key measures with their business meaning. This is the
baseline a change's spec is written against.>
```

## 5. Gate

Show the user the findings table and the questions. Then offer, and wait:

- keep the survey as documentation (add it to `sdd/README.md` as *documented*), or
- turn chosen findings into a change: `pbi-sdd spec`.
