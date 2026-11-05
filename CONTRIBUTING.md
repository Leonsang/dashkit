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

## dashkit's own bundles

`bundles/<id>/skills/<skill>/` holds skills dashkit authors (today, `pbi-sdd`). They are embedded in
the binary by `bundles/embed.go` and installed like any vendored bundle. Keep them thin: a workflow
that calls the Microsoft and data-goblin skills, never a second copy of what those skills teach.
Register a new one in `BUILTIN` in `tools/gen-manifest.mjs` and in the `go:embed` line.

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

## Searching the repo and the upstream trees

The repo is small enough that `grep -r` is fine. [tgrep](https://github.com/microsoft/tgrep)
(MIT, Microsoft) earns its place on the trees this project *reads*: the pinned
skills-for-fabric checkout in `~/.dashkit/cache/<ref>/` and the plugin caches under
`~/.claude/plugins/`, which you grep repeatedly when moving a pin.

```bash
tgrep serve .          # once per session: builds the index if absent, then watches for edits
tgrep -F -- "OwnsMarketplace" .          # literal; -- before the pattern, path after it
tgrep -t go -l -- "MarketplacePlanner" . # scope by type, file names only
tgrep --json -F -- ErrDeclined internal/ # ripgrep's --json format
```

Flags follow ripgrep. `.claude/hooks/tgrep.sh` starts the server at session start for
agents working in a checkout, and does nothing when tgrep is not installed. `.tgrep/` is
the index; it is git-ignored, never committed.

Two things to know before trusting a result:

- **Freshness.** A search answers from the index. The watcher applies edits within a
  second or two, but a search issued immediately after a write can still miss it — pass
  `--no-index` when a search has to see the edit you just made.
- **`--index-path` is broken in v1.0.8 on Windows.** `index` writes the index where you
  point it, but a search with the same value errors (`IO error for operation on
  --index-path`) and silently scans every file instead. Keep the index at its default
  location, `<root>/.tgrep`, where it works.

Measured here on a 16.9k-file tree (the Go module cache), warm, median of three:
ripgrep 15.2 ~270 ms per query, tgrep 1.0.8 with a server 49–65 ms. On this repo's own
79 files both answer in well under a tenth of a second and the index buys nothing.
