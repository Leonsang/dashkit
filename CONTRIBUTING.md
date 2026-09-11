# Contributing

Thanks for helping. A few things make a contribution easy to accept.

## Where the issue belongs

- **A skill says something wrong, or is missing something** → that skill's project:
  [microsoft/skills-for-fabric](https://github.com/microsoft/skills-for-fabric/issues) or
  [data-goblin/power-bi-agentic-development](https://github.com/data-goblin/power-bi-agentic-development/issues).
  dashkit doesn't author skills.
- **dashkit installed something in the wrong place, broke a config, or didn't detect a tool** → here.

## Adding an AI tool

1. Add a file under `internal/targets/` implementing `Target`. Look at `cursor.go` for a tool that
   reads rules files, or `claude.go` for one with its own skill loader and plugin manager.
2. Start it as **experimental** (`Experimental() bool { return true }`). It becomes verified when its
   paths and formats are confirmed against the tool's *current* documentation and the source is
   linked in [docs/targets.md](docs/targets.md). dashkit does not write to someone's config on a guess.
3. If the tool has a plugin manager, implement `MarketplacePlanner` so it can take marketplace bundles
   — and respect scopes: never widen a project install into a user-wide one.
4. Extend `TestInstallProjectScopeWritesEveryHostFormat` and the idempotency and uninstall tests.

## Rules every change keeps

- Back up before writing; never rewrite a file dashkit doesn't own — merge into it.
- Every change must be idempotent and reversible by `dashkit uninstall`.
- Every command is shown and confirmed unless `--yes`.
- Never copy or redistribute a bundle whose licence doesn't allow it; route it through the host's
  plugin manager or skip it with a reason.

## Updating the upstream pins

```bash
node tools/gen-manifest.mjs <skills-for-fabric clone> <tag> --goblin <power-bi-agentic-development clone>
node tools/gen-docs.mjs <skills-for-fabric clone>
go test ./...
```

## Before opening a pull request

```bash
gofmt -l .      # should print nothing
go vet ./...
go test ./...
```

CI runs the same on Ubuntu, macOS and Windows, plus a real install/uninstall against the upstream tree.
