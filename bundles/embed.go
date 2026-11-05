// Package bundles holds the skills dashkit itself authors. Unlike the
// Microsoft and data-goblin bundles, these ship inside the binary: they are
// small, MIT-licensed, and versioned with dashkit.
//
// Each directory is also a Claude Code plugin listed in
// ../.claude-plugin/marketplace.json; hosts with a plugin manager install it
// from there. Only what the file-based install needs is embedded: skills,
// subagents and each MCP server's runnable code — not tests, TypeScript
// sources or the guardrail plugins, whose hooks only run as plugins.
package bundles

import "embed"

// FS contains one directory per builtin bundle, laid out like an upstream
// plugin: <bundle>/skills/<skill>/SKILL.md plus its references and scripts.
//
//go:embed all:pbi-sdd
//go:embed tableau-authoring/skills tableau-authoring/agents
//go:embed tableau-authoring/server/pyproject.toml tableau-authoring/server/uv.lock tableau-authoring/server/README.md
//go:embed tableau-authoring/server/src/tableu_mcp/*.py tableau-authoring/server/src/tableu_mcp/docs
//go:embed tableau-sdd/skills
//go:embed looker-studio-authoring/skills looker-studio-authoring/agents
//go:embed looker-studio-authoring/looker-studio-mcp/package.json looker-studio-authoring/looker-studio-mcp/themes
//go:embed looker-studio-authoring/looker-studio-mcp/dist/index.js looker-studio-authoring/looker-studio-mcp/dist/cli.js
//go:embed looker-studio-authoring/looker-studio-mcp/dist/THIRD_PARTY_NOTICES.txt
//go:embed looker-studio-authoring/looker-studio-mcp/dist/chunks
//go:embed ls-sdd/skills
var FS embed.FS
