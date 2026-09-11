package targets

import (
	"fmt"
	"path/filepath"
	"strings"

	"github.com/leonsang/dashkit/internal/catalog"
	"github.com/leonsang/dashkit/internal/plan"
)

func init() {
	register(cursor{})
	register(windsurf{})
}

// --- Cursor ------------------------------------------------------------------

// cursor writes a project rule (.cursor/rules/*.mdc) that indexes the vendored
// skills, and registers MCP servers in .cursor/mcp.json.
type cursor struct{}

func (cursor) ID() string         { return "cursor" }
func (cursor) Title() string      { return "Cursor" }
func (cursor) Experimental() bool { return false }

// Cursor's rules live per project; the global equivalent is free-text user rules
// in the UI, which dashkit will not edit on someone's behalf.
func (cursor) SupportsScope(s Scope) bool { return s == Project }

func (cursor) Detect() Detection {
	for _, dir := range []string{userPath(".cursor"), userPath("AppData", "Roaming", "Cursor")} {
		if exists(dir) {
			return Detection{Found: true, Where: dir}
		}
	}
	if bin := binaryOnPath("cursor"); bin != "" {
		return Detection{Found: true, Where: bin}
	}
	return Detection{}
}

func (cursor) Hint(opts Options) string {
	return fmt.Sprintf("open %s in Cursor; the rule is always applied", opts.ProjectDir)
}

func (cursor) Plan(b catalog.Bundle, opts Options) (plan.Plan, error) {
	p, entries, err := vendorBundle(b, opts)
	if err != nil {
		return nil, err
	}

	front := "---\n" +
		"description: " + oneLine(b.Title+" — "+b.Description) + "\n" +
		"alwaysApply: true\n" +
		"---\n\n"

	p = append(p, plan.WriteFile{
		Path: filepath.Join(opts.ProjectDir, ".cursor", "rules", "dashkit-"+b.ID+".mdc"),
		Data: []byte(front + routerBody(b, entries, opts)),
		What: "Cursor rule",
	})

	if opts.MCP && len(b.MCPServers) > 0 {
		p = append(p, mcpActions(b,
			filepath.Join(opts.ProjectDir, ".cursor", "mcp.json"),
			[]string{"mcpServers"},
			"Cursor MCP servers")...)
	}
	return p, nil
}

// --- Windsurf ----------------------------------------------------------------

// windsurf writes .windsurf/rules/*.md. Its rule front matter and MCP config
// path move more often than the other hosts', so this target stays experimental
// until the layout is re-verified.
type windsurf struct{}

func (windsurf) ID() string                 { return "windsurf" }
func (windsurf) Title() string              { return "Windsurf" }
func (windsurf) Experimental() bool         { return true }
func (windsurf) SupportsScope(s Scope) bool { return s == Project }

func (windsurf) Detect() Detection {
	for _, dir := range []string{userPath(".codeium", "windsurf"), userPath(".windsurf")} {
		if exists(dir) {
			return Detection{Found: true, Where: dir}
		}
	}
	return Detection{}
}

func (windsurf) Hint(opts Options) string {
	return fmt.Sprintf("open %s in Windsurf and check Settings → Rules", opts.ProjectDir)
}

func (windsurf) Plan(b catalog.Bundle, opts Options) (plan.Plan, error) {
	p, entries, err := vendorBundle(b, opts)
	if err != nil {
		return nil, err
	}
	front := "---\ntrigger: always_on\n---\n\n"
	p = append(p, plan.WriteFile{
		Path: filepath.Join(opts.ProjectDir, ".windsurf", "rules", "dashkit-"+b.ID+".md"),
		Data: []byte(front + routerBody(b, entries, opts)),
		What: "Windsurf rule",
	})

	if opts.MCP && len(b.MCPServers) > 0 {
		p = append(p, mcpActions(b,
			userPath(".codeium", "windsurf", "mcp_config.json"),
			[]string{"mcpServers"},
			"Windsurf MCP servers")...)
	}
	return p, nil
}

// oneLine flattens a description into a single front-matter-safe line.
func oneLine(s string) string {
	s = strings.Join(strings.Fields(s), " ")
	return strings.ReplaceAll(s, "\"", "'")
}
