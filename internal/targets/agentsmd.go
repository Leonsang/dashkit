package targets

import (
	"fmt"
	"path/filepath"

	"github.com/ericksang/fabkit/internal/catalog"
	"github.com/ericksang/fabkit/internal/plan"
)

func init() {
	register(codex{})
	register(gemini{})
	register(opencode{})
}

// These hosts read a single shared instructions file. fabkit owns one delimited
// block inside it and leaves the rest of the user's text alone.

// --- Codex CLI ---------------------------------------------------------------

type codex struct{}

func (codex) ID() string               { return "codex" }
func (codex) Title() string            { return "Codex CLI" }
func (codex) Experimental() bool       { return true }
func (codex) SupportsScope(Scope) bool { return true }

func (codex) Detect() Detection {
	if dir := userPath(".codex"); exists(dir) {
		return Detection{Found: true, Where: dir}
	}
	if bin := binaryOnPath("codex"); bin != "" {
		return Detection{Found: true, Where: bin}
	}
	return Detection{}
}

func (codex) Hint(Options) string {
	return "start `codex`; the fabkit block in AGENTS.md is read at session start"
}

func (codex) Plan(b catalog.Bundle, opts Options) (plan.Plan, error) {
	p, entries, err := vendorBundle(b, opts)
	if err != nil {
		return nil, err
	}

	agentsFile := userPath(".codex", "AGENTS.md")
	if opts.Scope == Project {
		agentsFile = filepath.Join(opts.ProjectDir, "AGENTS.md")
	}
	p = append(p, plan.MarkdownBlock{
		Path:    agentsFile,
		ID:      b.ID,
		Content: routerBody(b, entries, opts),
		What:    "Codex instructions",
	})

	if opts.MCP {
		for name, server := range b.MCPServers {
			// Codex only speaks stdio; remote servers are skipped rather than
			// written in a shape it cannot launch.
			if server.Command == "" {
				continue
			}
			values := map[string]any{"command": server.Command}
			if len(server.Args) > 0 {
				values["args"] = server.Args
			}
			if len(server.Env) > 0 {
				values["env"] = server.Env
			}
			p = append(p, plan.MergeTOML{
				Path:   userPath(".codex", "config.toml"),
				Table:  "mcp_servers." + name,
				Values: values,
				What:   "Codex MCP server",
			})
		}
	}
	return p, nil
}

// --- Gemini CLI --------------------------------------------------------------

type gemini struct{}

func (gemini) ID() string               { return "gemini" }
func (gemini) Title() string            { return "Gemini CLI" }
func (gemini) Experimental() bool       { return true }
func (gemini) SupportsScope(Scope) bool { return true }

func (gemini) Detect() Detection {
	if dir := userPath(".gemini"); exists(dir) {
		return Detection{Found: true, Where: dir}
	}
	if bin := binaryOnPath("gemini"); bin != "" {
		return Detection{Found: true, Where: bin}
	}
	return Detection{}
}

func (gemini) Hint(Options) string { return "run `gemini` and ask for a Fabric task" }

func (gemini) Plan(b catalog.Bundle, opts Options) (plan.Plan, error) {
	p, entries, err := vendorBundle(b, opts)
	if err != nil {
		return nil, err
	}

	contextFile := userPath(".gemini", "GEMINI.md")
	if opts.Scope == Project {
		contextFile = filepath.Join(opts.ProjectDir, "GEMINI.md")
	}
	p = append(p, plan.MarkdownBlock{
		Path:    contextFile,
		ID:      b.ID,
		Content: routerBody(b, entries, opts),
		What:    "Gemini CLI context",
	})

	if opts.MCP && len(b.MCPServers) > 0 {
		p = append(p, mcpActions(b,
			userPath(".gemini", "settings.json"),
			[]string{"mcpServers"},
			"Gemini CLI MCP servers")...)
	}
	return p, nil
}

// --- OpenCode ----------------------------------------------------------------

// opencode has its own skill loader, so skills go in whole. Its MCP config uses
// a different shape from every other host, so fabkit leaves that to the user
// rather than guessing.
type opencode struct{}

func (opencode) ID() string               { return "opencode" }
func (opencode) Title() string            { return "OpenCode" }
func (opencode) Experimental() bool       { return true }
func (opencode) SupportsScope(Scope) bool { return true }

func (opencode) Detect() Detection {
	for _, dir := range []string{
		userPath(".config", "opencode"),
		userPath("AppData", "Roaming", "opencode"),
	} {
		if exists(dir) {
			return Detection{Found: true, Where: dir}
		}
	}
	if bin := binaryOnPath("opencode"); bin != "" {
		return Detection{Found: true, Where: bin}
	}
	return Detection{}
}

func (opencode) Hint(Options) string {
	return "restart OpenCode; MCP servers for this bundle still need adding by hand"
}

func (opencode) Plan(b catalog.Bundle, opts Options) (plan.Plan, error) {
	dir := userPath(".config", "opencode", "skill")
	if opts.Scope == Project {
		dir = filepath.Join(opts.ProjectDir, ".opencode", "skill")
	}
	p, err := skillsIntoDir(b, opts, dir)
	if err != nil {
		return nil, err
	}
	if len(b.MCPServers) > 0 && opts.MCP {
		p = append(p, plan.WriteFile{
			Path: filepath.Join(vendorRoot(b, opts), "MCP-SERVERS.md"),
			Data: []byte(mcpNotes(b)),
			What: "MCP servers to add by hand",
		})
	}
	return p, nil
}

// mcpNotes writes down the servers a host could not be configured for, so the
// information is not simply lost.
func mcpNotes(b catalog.Bundle) string {
	out := fmt.Sprintf("# MCP servers for %s\n\nfabkit could not write these into this host's config automatically.\n\n", b.Title)
	for name, s := range b.MCPServers {
		out += fmt.Sprintf("## %s\n\n", name)
		if s.Command != "" {
			out += fmt.Sprintf("- transport: stdio\n- command: `%s %v`\n\n", s.Command, s.Args)
			continue
		}
		out += fmt.Sprintf("- transport: %s\n- url: %s\n\n", s.Type, s.URL)
	}
	return out
}
