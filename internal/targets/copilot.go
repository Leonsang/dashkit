package targets

import (
	"fmt"
	"path/filepath"

	"github.com/ericksang/fabkit/internal/catalog"
	"github.com/ericksang/fabkit/internal/plan"
)

func init() {
	register(copilotCLI{})
	register(copilotVSCode{})
}

// --- GitHub Copilot CLI ------------------------------------------------------

// copilotCLI is the upstream project's own recommended host: it has a plugin
// marketplace that installs these bundles natively.
type copilotCLI struct{}

func (copilotCLI) ID() string               { return "copilot-cli" }
func (copilotCLI) Title() string            { return "GitHub Copilot CLI" }
func (copilotCLI) Experimental() bool       { return false }
func (copilotCLI) SupportsScope(Scope) bool { return true }

func (copilotCLI) Detect() Detection {
	if bin := binaryOnPath("copilot"); bin != "" {
		return Detection{Found: true, Where: bin}
	}
	if dir := userPath(".copilot"); exists(dir) {
		return Detection{Found: true, Where: dir, Note: "config found, CLI not on PATH"}
	}
	return Detection{}
}

func (copilotCLI) Hint(Options) string {
	return "open `copilot` and ask for a Fabric task; run `/plugin` to confirm the bundle"
}

func (copilotCLI) Plan(b catalog.Bundle, opts Options) (plan.Plan, error) {
	if bin := binaryOnPath("copilot"); bin != "" && opts.PreferHostPlugin {
		return plan.Plan{
			plan.Run{
				Name: bin, Args: []string{"plugin", "marketplace", "add", "microsoft/skills-for-fabric"},
				Why: "register the upstream marketplace",
			},
			plan.Run{
				Name: bin, Args: []string{"plugin", "install", b.ID + "@fabric-collection"},
				Why: "install " + b.Title + " as a Copilot CLI plugin",
			},
		}, nil
	}

	// Without the CLI (or with the plugin path declined) fall back to vendored
	// files plus a user-level instructions router.
	p, entries, err := vendorBundle(b, opts)
	if err != nil {
		return nil, err
	}
	router := filepath.Join(userPath(".copilot", "instructions"), "fabkit-"+b.ID+".md")
	if opts.Scope == Project {
		router = filepath.Join(opts.ProjectDir, ".github", "instructions", "fabkit-"+b.ID+".instructions.md")
	}
	p = append(p, plan.WriteFile{
		Path: router,
		Data: []byte(instructionsFrontMatter(opts) + routerBody(b, entries, opts)),
		What: "Copilot instructions router",
	})
	return p, nil
}

// --- GitHub Copilot in VS Code ----------------------------------------------

// copilotVSCode writes the workspace customisation files VS Code reads:
// .github/instructions/*.instructions.md, and .vscode/mcp.json, whose MCP key is
// "servers" rather than the "mcpServers" every other host uses.
type copilotVSCode struct{}

func (copilotVSCode) ID() string         { return "vscode-copilot" }
func (copilotVSCode) Title() string      { return "GitHub Copilot (VS Code)" }
func (copilotVSCode) Experimental() bool { return false }

// VS Code customisation is per-workspace; a global install has nowhere sensible
// to go, so fabkit keeps this target project-scoped.
func (copilotVSCode) SupportsScope(s Scope) bool { return s == Project }

func (copilotVSCode) Detect() Detection {
	for _, dir := range []string{
		userPath(".vscode"),
		userPath("AppData", "Roaming", "Code", "User"),
		userPath("Library", "Application Support", "Code", "User"),
		userPath(".config", "Code", "User"),
	} {
		if exists(dir) {
			return Detection{Found: true, Where: dir}
		}
	}
	if bin := binaryOnPath("code"); bin != "" {
		return Detection{Found: true, Where: bin}
	}
	return Detection{}
}

func (copilotVSCode) Hint(opts Options) string {
	return fmt.Sprintf("open %s in VS Code; the instructions apply to every Copilot chat request", opts.ProjectDir)
}

func (copilotVSCode) Plan(b catalog.Bundle, opts Options) (plan.Plan, error) {
	p, entries, err := vendorBundle(b, opts)
	if err != nil {
		return nil, err
	}
	p = append(p, plan.WriteFile{
		Path: filepath.Join(opts.ProjectDir, ".github", "instructions", "fabkit-"+b.ID+".instructions.md"),
		Data: []byte(instructionsFrontMatter(opts) + routerBody(b, entries, opts)),
		What: "VS Code Copilot instructions",
	})

	for _, agent := range b.Agents {
		src, err := opts.Tree.AgentFile(b, agent)
		if err != nil {
			return nil, err
		}
		data, err := readFile(src)
		if err != nil {
			return nil, err
		}
		name := agentName(agent)
		p = append(p, plan.WriteFile{
			Path: filepath.Join(opts.ProjectDir, ".github", "chatmodes", name+".chatmode.md"),
			Data: data,
			What: "chat mode " + name,
		})
	}

	if opts.MCP && len(b.MCPServers) > 0 {
		p = append(p, mcpActions(b,
			filepath.Join(opts.ProjectDir, ".vscode", "mcp.json"),
			[]string{"servers"},
			"VS Code MCP servers")...)
	}
	return p, nil
}

// instructionsFrontMatter makes an instructions file apply to every request;
// without applyTo, VS Code never loads it automatically.
func instructionsFrontMatter(opts Options) string {
	if opts.Scope != Project {
		return ""
	}
	return "---\napplyTo: '**'\n---\n\n"
}
