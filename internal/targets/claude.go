package targets

import (
	"fmt"
	"os"
	"path/filepath"

	"github.com/leonsang/fabkit/internal/catalog"
	"github.com/leonsang/fabkit/internal/plan"
	"github.com/leonsang/fabkit/internal/skillmeta"
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

func (claudeCode) Plan(b catalog.Bundle, opts Options) (plan.Plan, error) {
	// Claude Code can install the upstream bundle through its own plugin
	// marketplace. Where that is available it beats copying files, because
	// updates then flow through `claude plugin update`.
	if opts.PreferHostPlugin {
		if bin := binaryOnPath("claude"); bin != "" {
			return plan.Plan{
				plan.Run{
					Name: bin, Args: []string{"plugin", "marketplace", "add", "microsoft/skills-for-fabric"},
					Why: "register the upstream marketplace",
				},
				plan.Run{
					Name: bin, Args: []string{"plugin", "install", b.ID + "@fabric-collection"},
					Why: "install " + b.Title + " as a Claude Code plugin",
				},
			}, nil
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
