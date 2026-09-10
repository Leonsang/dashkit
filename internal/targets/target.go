// Package targets translates a bundle into whatever shape each AI coding tool
// expects: real skill directories where the host has a skill loader, and a
// vendored copy plus a router rules file where it does not.
package targets

import (
	"fmt"
	"os"
	"path/filepath"
	"sort"
	"strings"

	"github.com/ericksang/fabkit/internal/catalog"
	"github.com/ericksang/fabkit/internal/home"
	"github.com/ericksang/fabkit/internal/plan"
	"github.com/ericksang/fabkit/internal/skillmeta"
	"github.com/ericksang/fabkit/internal/source"
)

// Scope decides whether an install lands in the user's global tool config or in
// one project directory.
type Scope string

const (
	Global  Scope = "global"
	Project Scope = "project"
)

// Options are the user's choices, the same for every target in one run.
type Options struct {
	Scope      Scope
	ProjectDir string
	Tree       *source.Tree
	// MCP registers the bundle's MCP servers in the host's config.
	MCP bool
	// PreferHostPlugin lets a host that ships its own plugin manager install the
	// upstream bundle natively instead of fabkit copying files around.
	PreferHostPlugin bool
}

// Detection is what fabkit could learn about a tool on this machine.
type Detection struct {
	Found bool
	// Where is the config directory or binary that proved it.
	Where string
	// Note explains a caveat, e.g. that only the CLI half was found.
	Note string
}

// Target is one AI coding tool fabkit can install into.
type Target interface {
	ID() string
	Title() string
	// Experimental marks targets whose config layout fabkit has not verified
	// against that tool's current documentation.
	Experimental() bool
	Detect() Detection
	SupportsScope(Scope) bool
	Plan(b catalog.Bundle, opts Options) (plan.Plan, error)
	// Hint is the one-line "what to do next" shown after a successful install.
	Hint(opts Options) string
}

var registry []Target

func register(t Target) { registry = append(registry, t) }

// All returns every known target, stable order, verified ones first.
func All() []Target {
	out := append([]Target(nil), registry...)
	sort.SliceStable(out, func(i, j int) bool {
		if out[i].Experimental() != out[j].Experimental() {
			return !out[i].Experimental()
		}
		return false
	})
	return out
}

// Find returns a target by id.
func Find(id string) (Target, error) {
	for _, t := range registry {
		if t.ID() == id {
			return t, nil
		}
	}
	return nil, fmt.Errorf("unknown target %q (try `fabkit list --targets`)", id)
}

// Resolve expands user input: "all" means every non-experimental target,
// "detected" means the ones found on this machine.
func Resolve(ids []string) ([]Target, error) {
	if len(ids) == 1 {
		switch ids[0] {
		case "all":
			var out []Target
			for _, t := range All() {
				if !t.Experimental() {
					out = append(out, t)
				}
			}
			return out, nil
		case "detected":
			var out []Target
			for _, t := range All() {
				if t.Detect().Found {
					out = append(out, t)
				}
			}
			if len(out) == 0 {
				return nil, fmt.Errorf("no supported AI tools detected; name one explicitly with --agents")
			}
			return out, nil
		}
	}
	out := make([]Target, 0, len(ids))
	seen := map[string]bool{}
	for _, id := range ids {
		if seen[id] {
			continue
		}
		t, err := Find(id)
		if err != nil {
			return nil, err
		}
		seen[id] = true
		out = append(out, t)
	}
	return out, nil
}

// --- shared helpers ----------------------------------------------------------

// commonDirName is the sibling directory holding a bundle's shared reference
// docs when skills are installed into a host's own skills folder.
const commonDirName = "_fabkit-common"

// userPath builds a path under the user's home (redirected by FABKIT_HOME in tests).
func userPath(parts ...string) string {
	return filepath.Join(append([]string{home.User()}, parts...)...)
}

// exists reports whether a path is present.
func exists(path string) bool {
	_, err := os.Stat(path)
	return err == nil
}

// rewriteCommon repoints the upstream `../../common/X.md` links (relative to
// skills/<name>/SKILL.md) at wherever fabkit actually put the common docs.
func rewriteCommon(prefix string) func(rel string, data []byte) []byte {
	return func(_ string, data []byte) []byte {
		return []byte(strings.ReplaceAll(string(data), "../../common/", prefix))
	}
}

// skillsIntoDir copies each of the bundle's skills into dir/<skill>/ and the
// shared docs into dir/_fabkit-common/, which is the layout every host with a
// real skill loader expects.
func skillsIntoDir(b catalog.Bundle, opts Options, dir string) (plan.Plan, error) {
	var p plan.Plan
	for _, skill := range b.Skills {
		src, err := opts.Tree.SkillDir(b, skill)
		if err != nil {
			return nil, err
		}
		p = append(p, plan.CopyTree{
			Src:     src,
			Dst:     filepath.Join(dir, skill),
			Rewrite: rewriteCommon("../" + commonDirName + "/"),
			What:    "skill " + skill,
		})
	}
	if common := opts.Tree.CommonDir(b); common != "" {
		p = append(p, plan.CopyTree{
			Src:  common,
			Dst:  filepath.Join(dir, commonDirName),
			What: b.ID + " shared reference docs",
		})
	}
	return p, nil
}

// vendorRoot is where fabkit keeps a full bundle copy for hosts that read files
// by path rather than loading skills themselves.
func vendorRoot(b catalog.Bundle, opts Options) string {
	if opts.Scope == Project {
		return filepath.Join(opts.ProjectDir, ".fabkit", b.ID)
	}
	return filepath.Join(home.Skills(), b.ID)
}

// vendorBundle copies skills + common into the vendor root and returns the plan
// plus the entries a router file should list.
func vendorBundle(b catalog.Bundle, opts Options) (plan.Plan, []entry, error) {
	root := vendorRoot(b, opts)
	p, err := skillsIntoDir(b, opts, filepath.Join(root, "skills"))
	if err != nil {
		return nil, nil, err
	}

	entries := make([]entry, 0, len(b.Skills))
	for _, skill := range b.Skills {
		src, err := opts.Tree.SkillDir(b, skill)
		if err != nil {
			return nil, nil, err
		}
		meta, err := skillmeta.ReadSkill(src)
		if err != nil {
			return nil, nil, err
		}
		abs := filepath.Join(root, "skills", skill, "SKILL.md")
		entries = append(entries, entry{
			Name:        meta.Name,
			Description: meta.Description,
			Path:        referencePath(abs, opts),
		})
	}
	return p, entries, nil
}

// referencePath renders a path the way the host should see it: relative inside a
// project (so it survives being committed and cloned), absolute when the install
// is global.
func referencePath(abs string, opts Options) string {
	if opts.Scope == Project {
		if rel, err := filepath.Rel(opts.ProjectDir, abs); err == nil {
			return filepath.ToSlash(rel)
		}
	}
	return filepath.ToSlash(abs)
}

type entry struct {
	Name        string
	Description string
	Path        string
}

// routerBody is the shared text of every router file: a compact index that tells
// the agent which skills exist and where to read the full instructions.
func routerBody(b catalog.Bundle, entries []entry, opts Options) string {
	var sb strings.Builder
	fmt.Fprintf(&sb, "# %s (installed by fabkit)\n\n", b.Title)
	fmt.Fprintf(&sb, "%s\n\n", b.Description)
	sb.WriteString("These skills are reference instructions on disk. When a request matches one of\n")
	sb.WriteString("the descriptions below, read that file in full before answering, and follow it.\n\n")

	for _, e := range entries {
		fmt.Fprintf(&sb, "## %s\n\n", e.Name)
		if e.Description != "" {
			fmt.Fprintf(&sb, "%s\n\n", collapse(e.Description))
		}
		fmt.Fprintf(&sb, "Read: `%s`\n\n", e.Path)
	}

	if len(b.MCPServers) > 0 && opts.MCP {
		sb.WriteString("## MCP servers\n\n")
		names := make([]string, 0, len(b.MCPServers))
		for name := range b.MCPServers {
			names = append(names, name)
		}
		sort.Strings(names)
		for _, name := range names {
			fmt.Fprintf(&sb, "- `%s`\n", name)
		}
		sb.WriteString("\n")
	}
	return strings.TrimRight(sb.String(), "\n") + "\n"
}

// collapse turns a folded description into one paragraph.
func collapse(s string) string { return strings.Join(strings.Fields(s), " ") }

// mcpActions registers the bundle's MCP servers in a JSON config under key.
func mcpActions(b catalog.Bundle, path string, key []string, what string) plan.Plan {
	var p plan.Plan
	names := make([]string, 0, len(b.MCPServers))
	for name := range b.MCPServers {
		names = append(names, name)
	}
	sort.Strings(names)
	for _, name := range names {
		p = append(p, plan.MergeJSON{
			Path:  path,
			Key:   append(append([]string{}, key...), name),
			Value: b.MCPServers[name],
			What:  what,
		})
	}
	return p
}

// binaryOnPath reports the resolved location of a command, or "".
func binaryOnPath(name string) string {
	if p, err := lookPath(name); err == nil {
		return p
	}
	return ""
}
