package targets

import (
	"fmt"
	"os"
	"path/filepath"

	"github.com/leonsang/dashkit/internal/catalog"
	"github.com/leonsang/dashkit/internal/confmerge"
	"github.com/leonsang/dashkit/internal/plan"
	"github.com/leonsang/dashkit/internal/skillmeta"
)

func init() { register(claudeCode{}) }

// claudeCode installs into Claude Code, which loads skills from
// ~/.claude/skills (global) or .claude/skills (project) and reads MCP servers
// from ~/.claude.json or the project's .mcp.json.
type claudeCode struct{}

func (claudeCode) ID() string               { return "claude" }
func (claudeCode) Title() string            { return "Claude Code" }
func (claudeCode) Experimental() bool       { return false }
func (claudeCode) SupportsScope(Scope) bool { return true }

func (claudeCode) Detect() Detection {
	if dir := userPath(".claude"); exists(dir) {
		return Detection{Found: true, Where: dir}
	}
	if bin := binaryOnPath("claude"); bin != "" {
		return Detection{Found: true, Where: bin, Note: "CLI found, no ~/.claude yet"}
	}
	return Detection{}
}

func (claudeCode) Hint(opts Options) string {
	if opts.Scope == Project {
		return fmt.Sprintf("open Claude Code in %s and run /skills", opts.ProjectDir)
	}
	return "restart Claude Code, then run /skills"
}

// claudePlugin installs through `claude plugin`, which has user and project
// scopes of its own — so a project install stays in the project's
// .claude/settings.json instead of loading in every session everywhere.
func claudePlugin(bin, repo, marketplace, plugin string, opts Options) plan.PluginInstall {
	scope, dir := "user", ""
	settings := userPath(".claude", "settings.json")
	if opts.Scope == Project {
		scope, dir = "project", opts.ProjectDir
		settings = filepath.Join(opts.ProjectDir, ".claude", "settings.json")
	}
	return plan.PluginInstall{
		Host: "claude", Bin: bin,
		MarketplaceRepo: repo, Marketplace: marketplace, Plugin: plugin,
		Scope: scope, Dir: dir, AssumeYes: true,
		Declared: func() bool { return marketplaceDeclared(settings, marketplace) },
	}
}

// marketplaceDeclared reports whether a Claude Code settings file already
// declares the marketplace. `claude plugin marketplace list` merges every scope
// together, so the settings file of the scope in question is the only place
// that can answer "was this here before?".
func marketplaceDeclared(settings, name string) bool {
	data, err := os.ReadFile(settings)
	if err != nil {
		return false
	}
	obj, err := confmerge.ParseJSONObject(data)
	if err != nil {
		// Unreadable settings: assume it was there, so nothing gets removed.
		return true
	}
	known, err := obj.Child("extraKnownMarketplaces")
	if err != nil {
		return true
	}
	_, ok := known.Get(name)
	return ok
}

// PlanMarketplace installs a third-party plugin through Claude Code itself.
func (claudeCode) PlanMarketplace(b catalog.Bundle, opts Options) (plan.Plan, error) {
	bin := binaryOnPath("claude")
	if bin == "" {
		return nil, fmt.Errorf("%s installs through the claude CLI, which is not on PATH", b.Title)
	}
	m := b.Marketplace
	return plan.Plan{claudePlugin(bin, m.Repo, m.Name, m.Plugin, opts)}, nil
}

func (claudeCode) Plan(b catalog.Bundle, opts Options) (plan.Plan, error) {
	// Claude Code can install the upstream bundle through its own plugin
	// marketplace. Where that is available it beats copying files, because
	// updates then flow through `claude plugin update`.
	if opts.PreferHostPlugin {
		if bin := binaryOnPath("claude"); bin != "" {
			return plan.Plan{claudePlugin(bin, "microsoft/skills-for-fabric", "fabric-collection", b.ID, opts)}, nil
		}
	}

	root := userPath(".claude")
	if opts.Scope == Project {
		root = filepath.Join(opts.ProjectDir, ".claude")
	}

	p, err := skillsIntoDir(b, opts, filepath.Join(root, "skills"))
	if err != nil {
		return nil, err
	}

	// Upstream agent files already carry the name/description front matter a
	// Claude Code subagent needs, so they copy across unchanged.
	for _, agent := range b.Agents {
		src, err := opts.Tree.AgentFile(b, agent)
		if err != nil {
			return nil, err
		}
		data, err := os.ReadFile(src)
		if err != nil {
			return nil, err
		}
		meta, err := skillmeta.ReadAgent(src)
		if err != nil {
			return nil, err
		}
		p = append(p, plan.WriteFile{
			Path: filepath.Join(root, "agents", meta.Name+".md"),
			Data: data,
			What: "subagent " + meta.Name,
		})
	}

	if opts.MCP && len(b.MCPServers) > 0 {
		mcpPath := userPath(".claude.json")
		if opts.Scope == Project {
			mcpPath = filepath.Join(opts.ProjectDir, ".mcp.json")
		}
		p = append(p, mcpActions(b, mcpPath, []string{"mcpServers"}, "Claude Code MCP servers")...)
	}

	return p, nil
}
