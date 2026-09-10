# fabkit

One command that puts the Microsoft **Skills for Fabric** bundles — Power BI included — into
whichever AI coding tools you actually use, on **Windows, macOS and Linux**.

Upstream ships these skills as a GitHub Copilot CLI plugin marketplace. If you use anything
else, the documented path is "clone the repo and hope the root config files apply". fabkit
closes that gap: it detects your tools, installs the skills in each one's native format,
registers the MCP servers, and installs the prerequisites the Power BI skills actually need
(Node 20+, the Power BI CLIs, Azure CLI).

```
                    ┌──────────────┐
  microsoft/        │              │──▶ Claude Code      ~/.claude/skills + .mcp.json
  skills-for-fabric │    fabkit    │──▶ Copilot CLI      native plugin install
  (pinned tag)      │   (wizard)   │──▶ Copilot / VS Code .github/instructions + .vscode/mcp.json
                    │              │──▶ Cursor           .cursor/rules/*.mdc + mcp.json
                    └──────────────┘──▶ Codex · Gemini · Windsurf · OpenCode
```

## Install

**macOS / Linux**

```bash
curl -fsSL https://raw.githubusercontent.com/ericksang/fabkit/main/install.sh | bash
```

**Windows (PowerShell)**

```powershell
irm https://raw.githubusercontent.com/ericksang/fabkit/main/install.ps1 | iex
```

**From source** (any OS, needs Go 1.24+)

```bash
go install github.com/ericksang/fabkit/cmd/fabkit@latest
```

## Use

```bash
fabkit           # the wizard: pick skills, pick tools, review, install
fabkit doctor    # read-only: what is detected, what is missing, how to fix it
fabkit update    # re-apply every recorded install from a fresh upstream copy
fabkit uninstall # remove exactly what fabkit installed, and nothing else
```

The wizard is a thin layer over the flags, so anything it does you can script:

```bash
fabkit install --bundle powerbi-authoring --agents detected --with-prereqs
fabkit install --bundle all --agents claude,cursor --scope project --yes
fabkit install --bundle fabric-skills --agents all --dry-run
```

## What gets installed

| Bundle | Skills | For |
|---|---|---|
| `powerbi-authoring` | 6 | Semantic models, PBIP/PBIR report planning, design, authoring, publishing |
| `fabric-skills` | 27 | Everything: authoring, consumption, operations, migrations, medallion |
| `fabric-authoring` | 12 | Creating Fabric items through APIs, CLI, notebooks, T-SQL, KQL |
| `fabric-consumption` | 12 | Read-only querying and exploration |
| `fabric-operations` | 7 | Performance and health diagnostics |

`fabkit list` prints the current set; `fabkit list --targets` prints the supported tools.

### How each tool is handled

Hosts with a real skill loader get real skills. Hosts that only read instruction files get a
**router**: the full skill tree is vendored into `.fabkit/` and a single always-on rules file
indexes it, so the skills' own `references/` files stay reachable instead of being flattened
away.

| Target | Skills land in | MCP config |
|---|---|---|
| `claude` | its own plugin manager, else `~/.claude/skills` or `.claude/skills` | `~/.claude.json` / `.mcp.json` |
| `copilot-cli` | its own plugin manager, else `~/.copilot/instructions` | host config |
| `vscode-copilot` | `.github/instructions/*.instructions.md` (+ chat modes) | `.vscode/mcp.json` (`servers`) |
| `cursor` | `.cursor/rules/*.mdc` | `.cursor/mcp.json` |
| `codex` ⚠ | managed block in `AGENTS.md` | `~/.codex/config.toml` |
| `gemini` ⚠ | managed block in `GEMINI.md` | `~/.gemini/settings.json` |
| `windsurf` ⚠ | `.windsurf/rules/*.md` | `~/.codeium/windsurf/mcp_config.json` |
| `opencode` ⚠ | `~/.config/opencode/skill/` | written down for you to add by hand |

⚠ = experimental: the layout has not been re-verified against that tool's current docs, so it
is only installed when you pass `--experimental` (or tick the box in the wizard).

## Safety

fabkit edits files you own, so it is deliberately conservative:

- **Nothing is clobbered.** Every file it touches is copied to `~/.fabkit/backups/<timestamp>/` first.
- **Foreign keys survive.** JSON configs are merged key by key, preserving order; TOML tables are
  added as text; shared Markdown files get a `<!-- fabkit:start:… -->` block and nothing else changes.
- **Running twice changes nothing.** Every write is idempotent — this is enforced by a test.
- **`--dry-run`** prints the exact plan, including every command, before anything happens.
- **Commands are confirmed.** Prerequisite installs and host plugin commands are printed and
  confirmed unless you pass `--yes`.
- **Uninstall is precise.** `~/.fabkit/state.json` records every path created and every key added,
  and `fabkit uninstall` reverses only those.

## Where the skills come from

The bundle list is generated from upstream's own marketplace file and embedded in the binary; the
skill content is downloaded from `microsoft/skills-for-fabric` at the tag this release pins, and
cached in `~/.fabkit/cache`. Use a local checkout instead with `--source /path/to/skills-for-fabric`.

Regenerate the embedded manifest after an upstream bump:

```bash
node tools/gen-manifest.mjs /path/to/skills-for-fabric v0.3.11
```

## Development

```bash
go test ./...     # unit tests + a full install/uninstall round trip
go vet ./...
go run ./cmd/fabkit --home /tmp/fabkit-sandbox doctor
```

`--home` (or `FABKIT_HOME`) redirects both fabkit's own state *and* the `~/…` paths targets write
to, so you can exercise a complete global install without touching your real config.

CI runs the whole suite plus a real install/uninstall against the upstream tree on Ubuntu, macOS
and Windows.

## License

MIT. The skills themselves are Microsoft's, under their own MIT license.
