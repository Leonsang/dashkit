# Targets

What dashkit writes for each AI tool, where, and what that layout was checked against. A target is
*verified* when its paths and formats were confirmed in that tool's current documentation; the rest
are *experimental* and only run with `--experimental`.

`~` is your home directory. Project paths are relative to the project folder. Everything here is
recorded in `~/.dashkit/state.json` and reversed by `dashkit uninstall`.

## Claude Code — verified

| | Project | Global |
|---|---|---|
| Microsoft skills | `claude plugin install <bundle>@fabric-collection --scope project` (default), or `.claude/skills/<skill>/` with `--host-plugin=false` | same, `--scope user`, or `~/.claude/skills/` |
| Subagents | `.claude/agents/<name>.md` | `~/.claude/agents/` |
| MCP servers | `.mcp.json` → `mcpServers` | `~/.claude.json` → `mcpServers` |
| data-goblin | `claude plugin install <plugin>@power-bi-agentic-development --scope project` | `--scope user` |

When skills are copied rather than installed as a plugin, the upstream links to `../../common/*.md`
are rewritten to a sibling `_dashkit-common/` directory so every reference still resolves.

## GitHub Copilot CLI — verified

| | Project | Global |
|---|---|---|
| Microsoft skills | vendored to `.dashkit/<bundle>/` + `.github/instructions/dashkit-<bundle>.instructions.md` | `copilot plugin install <bundle>@fabric-collection` |
| data-goblin | not possible: Copilot CLI plugins are per user | `copilot plugin install <plugin>@power-bi-agentic-development` |

A project install is never silently widened into a user-wide one.

## GitHub Copilot in VS Code — verified, project only

| | |
|---|---|
| Skills | vendored to `.dashkit/<bundle>/`, indexed by `.github/instructions/dashkit-<bundle>.instructions.md` with `applyTo: '**'` (without `applyTo` VS Code never loads the file) |
| Agents | `.github/chatmodes/<name>.chatmode.md` |
| MCP servers | `.vscode/mcp.json` → **`servers`** (not `mcpServers`, unlike every other host) |

Source: [VS Code — custom instructions](https://code.visualstudio.com/docs/copilot/customization/custom-instructions).

## Cursor — verified, project only

| | |
|---|---|
| Skills | vendored to `.dashkit/<bundle>/`, indexed by `.cursor/rules/dashkit-<bundle>.mdc` (`alwaysApply: true`) |
| MCP servers | `.cursor/mcp.json` → `mcpServers` |

Cursor's global rules are free text in its settings UI, which dashkit will not edit on your behalf.

## Codex CLI — verified

| | Project | Global |
|---|---|---|
| Skills | vendored to `.dashkit/<bundle>/`, indexed by a managed block in `AGENTS.md` | `~/.codex/AGENTS.md` |
| MCP servers | `.codex/config.toml` → `[mcp_servers.<name>]` (+ `[mcp_servers.<name>.env]`) | `~/.codex/config.toml` |

`CODEX_HOME` is honoured. Codex only loads a project's `.codex/config.toml` once you trust that
directory. Remote (HTTP) MCP servers are written to `.dashkit/<bundle>/MCP-SERVERS.md` instead,
because Codex launches stdio servers.

Sources: [Codex MCP](https://learn.chatgpt.com/docs/extend/mcp?surface=cli),
[AGENTS.md](https://developers.openai.com/codex/guides/agents-md).

## Gemini CLI — verified

| | Project | Global |
|---|---|---|
| Skills | vendored to `.dashkit/<bundle>/`, indexed by a managed block in `GEMINI.md` | `~/.gemini/GEMINI.md` |
| MCP servers | `.gemini/settings.json` → `mcpServers` | `~/.gemini/settings.json` |

Gemini loads `GEMINI.md` files hierarchically: the global one, then every one from the project root
down to the working directory.

Sources: [MCP servers](https://github.com/google-gemini/gemini-cli/blob/main/docs/tools/mcp-server.md),
[GEMINI.md](https://github.com/google-gemini/gemini-cli/blob/main/docs/cli/gemini-md.md).

## Windsurf — experimental, project only

`.windsurf/rules/dashkit-<bundle>.md` (`trigger: always_on`) and `~/.codeium/windsurf/mcp_config.json`.
Its rule front matter changes more often than other hosts', so it has not been re-verified.

## OpenCode — experimental

Skills are copied to `.opencode/skill/` (project) or `~/.config/opencode/skill/` (global). OpenCode's
MCP configuration has a different shape from every other host, so instead of guessing, dashkit writes
the servers to `MCP-SERVERS.md` for you to add.

## Adding a target

See [CONTRIBUTING.md](../CONTRIBUTING.md). A new target starts experimental and becomes verified
once its paths are checked against that tool's documentation and the source is linked here.
