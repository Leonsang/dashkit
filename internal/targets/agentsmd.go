package targets

import (
	"fmt"
	"os"
	"path/filepath"
	"sort"
	"strings"

	"github.com/leonsang/dashkit/internal/catalog"
	"github.com/leonsang/dashkit/internal/home"
	"github.com/leonsang/dashkit/internal/plan"
)

func init() {
	register(codex{})
	register(gemini{})
	register(opencode{})
}

// These hosts read a single shared instructions file. dashkit owns one delimited
// block inside it and leaves the rest of the user's text alone.

// --- Codex CLI ---------------------------------------------------------------

// codex writes the two files Codex reads: AGENTS.md — globally from its home
// directory, per project from the repository root — and config.toml, whose MCP
// servers are [mcp_servers.<name>] tables with an [.env] sub-table.
type codex struct{}

func (codex) ID() string               { return "codex" }
func (codex) Title() string            { return "Codex CLI" }
func (codex) Experimental() bool       { return false }
func (codex) SupportsScope(Scope) bool { return true }

// codexHome honours CODEX_HOME, which moves Codex's whole config directory.
// A redirected dashkit home wins, so tests and --home never escape their sandbox.
func codexHome() string {
	if !home.Sandboxed() {
		if dir := os.Getenv("CODEX_HOME"); dir != "" {
			return dir
		}
	}
	return userPath(".codex")
}

func (codex) Detect() Detection {
	if dir := codexHome(); exists(dir) {
		return Detection{Found: true, Where: dir}
	}
	if bin := binaryOnPath("codex"); bin != "" {
		return Detection{Found: true, Where: bin}
	}
	return Detection{}
}

func (codex) Hint(opts Options) string {
	if opts.Scope == Project {
		return "start `codex` in the project; project-scoped MCP servers only load once you trust the directory"
	}
	return "start `codex`; the dashkit block in ~/.codex/AGENTS.md is read at session start"
}

func (codex) Plan(b catalog.Bundle, opts Options) (plan.Plan, error) {
	p, entries, err := vendorBundle(b, opts)
	if err != nil {
		return nil, err
	}

	agentsFile := filepath.Join(codexHome(), "AGENTS.md")
	configFile := filepath.Join(codexHome(), "config.toml")
	if opts.Scope == Project {
		agentsFile = filepath.Join(opts.ProjectDir, "AGENTS.md")
		// Codex reads a project's own .codex/config.toml (for trusted projects),
		// so a project install has no business editing the global one.
		configFile = filepath.Join(opts.ProjectDir, ".codex", "config.toml")
	}

	p = append(p, plan.MarkdownBlock{
		Path:    agentsFile,
		ID:      b.ID,
		Content: routerBody(b, entries, opts),
		What:    "Codex instructions",
	})

	if opts.MCP {
		names := make([]string, 0, len(b.MCPServers))
		for name := range b.MCPServers {
			names = append(names, name)
		}
		sort.Strings(names)
		for _, name := range names {
			server := b.MCPServers[name]
			// Codex launches stdio servers; a remote one is written down for the
			// user rather than expressed in a shape Codex cannot start.
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
				Path:   configFile,
				Table:  "mcp_servers." + name,
				Values: values,
				What:   "Codex MCP server",
			})
		}
		if hasRemoteServer(b) {
			p = append(p, plan.WriteFile{
				Path: filepath.Join(vendorRoot(b, opts), "MCP-SERVERS.md"),
				Data: []byte(mcpNotes(b, remote)),
				What: "remote MCP servers to add by hand",
			})
		}
	}
	return p, nil
}

// --- Gemini CLI --------------------------------------------------------------

// gemini writes GEMINI.md, which the CLI loads hierarchically (~/.gemini/GEMINI.md
// for every project, then the ones it finds walking down to the working
// directory), and settings.json, whose MCP servers live under a top-level
// "mcpServers" key in either the user or the project file.
type gemini struct{}

func (gemini) ID() string               { return "gemini" }
func (gemini) Title() string            { return "Gemini CLI" }
func (gemini) Experimental() bool       { return false }
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
	settings := userPath(".gemini", "settings.json")
	if opts.Scope == Project {
		contextFile = filepath.Join(opts.ProjectDir, "GEMINI.md")
		settings = filepath.Join(opts.ProjectDir, ".gemini", "settings.json")
	}

	p = append(p, plan.MarkdownBlock{
		Path:    contextFile,
		ID:      b.ID,
		Content: routerBody(b, entries, opts),
		What:    "Gemini CLI context",
	})

	if opts.MCP && len(b.MCPServers) > 0 {
		p = append(p, mcpActions(b, settings, []string{"mcpServers"}, "Gemini CLI MCP servers")...)
	}
	return p, nil
}

// --- OpenCode ----------------------------------------------------------------

// opencode has its own skill loader, so skills go in whole. Its MCP config uses
// a different shape from every other host, so dashkit leaves that to the user
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
			Data: []byte(mcpNotes(b, nil)),
			What: "MCP servers to add by hand",
		})
	}
	return p, nil
}

// hasRemoteServer reports whether the bundle ships an HTTP MCP server, which not
// every host can be configured for automatically.
func hasRemoteServer(b catalog.Bundle) bool {
	for _, s := range b.MCPServers {
		if s.Command == "" {
			return true
		}
	}
	return false
}

// mcpNotes writes down the servers a host could not be configured for, so the
// information is not simply lost. include selects which ones to write.
func mcpNotes(b catalog.Bundle, include func(catalog.MCPServer) bool) string {
	out := fmt.Sprintf("# MCP servers for %s\n\ndashkit could not write these into this host's config automatically.\n\n", b.Title)

	names := make([]string, 0, len(b.MCPServers))
	for name := range b.MCPServers {
		names = append(names, name)
	}
	sort.Strings(names)

	for _, name := range names {
		s := b.MCPServers[name]
		if include != nil && !include(s) {
			continue
		}
		out += fmt.Sprintf("## %s\n\n", name)
		if s.Command != "" {
			out += fmt.Sprintf("- transport: stdio\n- command: `%s %s`\n\n", s.Command, strings.Join(s.Args, " "))
			continue
		}
		out += fmt.Sprintf("- transport: %s\n- url: %s\n", s.Type, s.URL)
		for header, value := range s.Headers {
			out += fmt.Sprintf("- header: `%s: %s`\n", header, value)
		}
		out += "\n"
	}
	return out
}

func remote(s catalog.MCPServer) bool { return s.Command == "" }
