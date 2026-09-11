# new — start a report from scratch

Goal: an approved `spec.md` that says who the report is for, what it must answer,
and how anyone will know it is done.

## 1. Open the change

Create `sdd/NNN-<slug>/` and add a line for it to `sdd/README.md`
(status: *spec in progress*).

## 2. Requirements and spec

**If `powerbi-report-planning` is installed, use it.** Run its rounds as it
describes (setup and dependencies, audience and job, model inventory and scope,
narrative and page plan, design identity). When it produces its locked report
spec, save that as `spec.md` in the change folder and add the sections below
that it does not already have.

**If it is not installed**, run the same conversation yourself — one round at a
time, never all questions at once — and write `spec.md` from this template:

```markdown
# Spec: <report name>

## Audience and job
<Who opens this, how often, and the decision they make with it.>

## Questions it must answer
1. <A question in the audience's words> → <page that answers it>

## Measures
| Measure | Business definition | Format | Source columns |
|---|---|---|---|

## Pages
| Page | Archetype | Visuals | Answers question(s) |
|---|---|---|---|

## Data, refresh and access
<Sources, storage mode, refresh cadence, RLS needs.>

## Out of scope
<What was asked for and deliberately left out.>

## Acceptance criteria
- [ ] <Checkable statement, e.g. "Win Rate on page 1 equals 32.4% for FY25 Q1">
- [ ] Every new measure has a description, a format string and a display folder
- [ ] The PBIP opens and validates without errors
```

Acceptance criteria are the contract `verify` checks. Each one must be
checkable by running something or reading a specific file — rewrite any that
are not.

## 3. Gate

Present the spec and ask for explicit approval. When it comes, add
`Approved by <name> on <date>` under the title, set the change to *approved* in
`sdd/README.md`, and tell the user the next step is `pbi-sdd tasks`.
