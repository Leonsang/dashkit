# Safety

dashkit edits configuration that belongs to you and to your tools. These are the rules it keeps,
and what we checked about the things it installs.

## What it does to your files

**It backs up before it touches.** The first time an install is about to change a file, the original
is copied to `~/.dashkit/backups/<timestamp>/`, named after its full path. A run that changes nothing
leaves no backup directory behind.

**It edits surgically.** It never rewrites a file it doesn't own:

- **JSON** (`.mcp.json`, `settings.json`, `mcp.json`) is parsed into an order-preserving object; one
  key is set, and the file is written back with its own indentation. Your other keys, and their
  order, don't move.
- **TOML** (Codex's `config.toml`) is edited as text: dashkit adds or replaces one whole table and its
  sub-tables. Comments and formatting elsewhere are untouched.
- **Shared Markdown** (`AGENTS.md`, `GEMINI.md`) gets one delimited block,
  `<!-- dashkit:start:<bundle> -->` … `<!-- dashkit:end:<bundle> -->`. Everything outside it is yours.

**It is idempotent.** Running the same install twice leaves every file byte-identical — enforced by
`TestInstallIsIdempotent`.

**It shows its work.** `--dry-run` prints the complete plan: every file, every key, every command.
The wizard's review screen shows the same plan before anything happens.

**It asks before running anything.** Package-manager installs and host plugin commands are printed in
full and confirmed, unless you pass `--yes`. A closed or non-interactive stdin counts as *no*.

**It uninstalls exactly what it installed.** `~/.dashkit/state.json` records every file dashkit
created, every key or block it added to someone else's file, and every plugin it asked a host to
install. `dashkit uninstall` deletes the files it created, removes only its own keys and blocks, and
asks each host to uninstall its plugins. If a host declines or fails, that plugin stays on record so a
later uninstall can finish the job.

## What it reaches out to

- **The network**: `codeload.github.com`, to download Microsoft's skills at the pinned tag (cached in
  `~/.dashkit/cache`), and GitHub releases for the installer. Use `--source <checkout>` to work offline.
- **Commands**: your package manager (`winget`, `brew`, `apt-get`, `dnf`, `npm`) for prerequisites you
  approve, and `claude plugin` / `copilot plugin` for plugins you choose. Nothing else. A plugin's
  two commands (declare the marketplace, install the plugin) are approved together, so saying no
  leaves nothing half-installed.
- **Commands your tool will run later**: the `fabric-skills` MCP servers authenticate through a
  `headersHelper`, a command Claude Code runs to fetch an Azure token
  (`az account get-access-token …`). dashkit registers it exactly as Microsoft ships it, and only in
  Claude Code; see [targets](targets.md).

After installing a prerequisite, dashkit reloads PATH and checks it again. Programs that were
already open — your AI tool, VS Code, terminals — keep their old PATH until restarted; dashkit
says so, because an open Claude Code would otherwise run data-goblin's hooks without `jq`, and
they would silently do nothing.

## The dashkit binary

- Built by [GoReleaser](../.goreleaser.yaml) in this repository's own GitHub Actions, from the tagged
  source, with `CGO_ENABLED=0`. Every release publishes `checksums.txt`; `install.sh` and
  `install.ps1` verify the archive against it before installing.
- **It is not code-signed.** Windows SmartScreen or macOS Gatekeeper may warn the first time.
- If you would rather not trust a prebuilt binary, build it yourself from the same source:
  `go install github.com/leonsang/dashkit/cmd/dashkit@latest`.

## Third-party code dashkit installs

dashkit installs other people's work. Here is what it is and what we checked.

### data-goblin plugins

Installed through Claude Code's or Copilot CLI's plugin manager, from
[data-goblin/power-bi-agentic-development](https://github.com/data-goblin/power-bi-agentic-development)
(GPL-3.0, by Kurt Buhler). dashkit never downloads or copies these files itself.

The `goblin-pbip` plugin's hooks run a **prebuilt, closed-source binary**, `tmdl-validate`, after
every `.tmdl` edit. We inspected the Windows build (v26.30): its import table contains only
`KERNEL32`, `ntdll`, `msvcrt` and a core synchronisation API — no networking library (WinSock,
WinHTTP, WinINet) — no URLs, no process creation, and file access limited to reading. That matches
its authors' own description: a small Rust TMDL linter with no network access and no file writes.
Static inspection cannot prove the absence of behaviour, so if you need more than that, run it under
a firewall and a process monitor. The binary is unsigned and some antivirus products flag it; its
authors document how to disable the hook (`tmdl_syntax: false` in the plugin's `config.yaml`) and
plan to replace it with the Tabular Editor 3 CLI.

### pbir-cli — reported, never installed

`pbir-cli` gives the deepest PBIR validation we have seen, and several bundles mention it. **Its
licence is proprietary and non-commercial**: commercial use — which explicitly includes paid
consulting or development — needs the authors' permission, and it may not be used inside other
software without their consent. So `dashkit doctor` reports whether you have it, and says so, but no
dashkit command will install it. If your use qualifies, `uv tool install pbir-cli`
([project](https://github.com/data-goblin/pbir-cli)).

### Microsoft skills-for-fabric

Markdown instructions and reference files (MIT), downloaded at a pinned tag. The bundles' MCP
server, `@microsoft/powerbi-modeling-mcp`, is started by your tool through `npx`.

## Reporting a vulnerability

Please don't open a public issue. Use GitHub's
[private vulnerability reporting](https://github.com/leonsang/dashkit/security/advisories/new) for this
repository. Problems in a skill or plugin itself belong to its own project.
