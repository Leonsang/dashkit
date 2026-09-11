# spec — a change to an existing report

Goal: an approved `spec.md` for a change, written against the report as it is
today (its survey's *As-is spec*).

1. If the report has no survey yet, run `pbi-sdd survey` first: a change spec
   needs a baseline.
2. Create `sdd/NNN-<slug>/` for the change and link the survey it builds on.
3. Write `spec.md`:

```markdown
# Spec: <change>

Builds on: [survey](../NNN-survey-<slug>/survey.md)

## Why
<The findings (by number) or the request this change answers.>

## What changes
| Area | Today | After |
|---|---|---|

## What must not change
<Numbers, pages or behaviour users rely on that this change must leave alone.>

## Out of scope

## Risks
<What could break — refresh, measures other pages use, bookmarks — and how the
tasks guard against it.>

## Acceptance criteria
- [ ] <Checkable statement>
- [ ] Measures that other pages use return the same values as before
- [ ] The PBIP opens and validates without errors
```

4. Gate: explicit approval, recorded as `Approved by <name> on <date>`; update
   `sdd/README.md`; next step `pbi-sdd tasks`.
