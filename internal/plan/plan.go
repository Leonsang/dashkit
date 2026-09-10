// Package plan is the unit of work shared by the wizard and the non-interactive
// CLI: every target turns a bundle into a list of Actions, which are printed for
// --dry-run and executed otherwise. Nothing else in fabkit touches the disk.
package plan

import (
	"fmt"
	"io/fs"
	"os"
	"os/exec"
	"path/filepath"
	"strings"

	"github.com/ericksang/fabkit/internal/backup"
	"github.com/ericksang/fabkit/internal/confmerge"
	"github.com/ericksang/fabkit/internal/state"
)

// Env carries everything an Action needs to apply itself, and collects the
// record of what it did.
type Env struct {
	DryRun bool
	Backup *backup.Session
	// Record accumulates the paths and edits made, for `fabkit uninstall`.
	Record *state.Install
	// Log receives one human-readable line per action.
	Log func(string)
	// Confirm is asked before anything that runs a command. Nil means "no".
	Confirm func(prompt string) bool
}

func (e *Env) logf(format string, args ...any) {
	if e.Log != nil {
		e.Log(fmt.Sprintf(format, args...))
	}
}

func (e *Env) own(path string) {
	if e.Record != nil {
		e.Record.Owned = append(e.Record.Owned, path)
	}
}

func (e *Env) edit(kind state.EditKind, path, locator string) {
	if e.Record != nil {
		e.Record.Edits = append(e.Record.Edits, state.Edit{Kind: kind, Path: path, Locator: locator})
	}
}

// Action is one reversible change.
type Action interface {
	// Describe is the line shown by --dry-run and by the wizard's summary.
	Describe() string
	Apply(*Env) error
}

// Plan is an ordered list of actions, usually one target's worth.
type Plan []Action

func (p Plan) Apply(env *Env) error {
	for _, a := range p {
		if err := a.Apply(env); err != nil {
			return fmt.Errorf("%s: %w", a.Describe(), err)
		}
	}
	return nil
}

// --- WriteFile ---------------------------------------------------------------

// WriteFile creates or replaces a file fabkit owns entirely.
type WriteFile struct {
	Path string
	Data []byte
	// What describes the file's role, e.g. "Cursor rules router".
	What string
}

func (w WriteFile) Describe() string { return fmt.Sprintf("write %s (%s)", w.Path, w.What) }

func (w WriteFile) Apply(env *Env) error {
	env.logf("%s", w.Describe())
	if env.DryRun {
		return nil
	}
	if err := env.Backup.Save(w.Path); err != nil {
		return err
	}
	if err := os.MkdirAll(filepath.Dir(w.Path), 0o755); err != nil {
		return err
	}
	if err := os.WriteFile(w.Path, w.Data, 0o644); err != nil {
		return err
	}
	env.own(w.Path)
	return nil
}

// --- CopyTree ----------------------------------------------------------------

// CopyTree copies a directory from the upstream tree into a destination fabkit
// owns, optionally rewriting text files on the way through.
type CopyTree struct {
	Src string
	Dst string
	// Rewrite adjusts the content of .md files (used to repoint the
	// ../../common/ links at wherever the common docs landed).
	Rewrite func(rel string, data []byte) []byte
	// Skip drops entries by their path relative to Src.
	Skip func(rel string) bool
	What string
}

func (c CopyTree) Describe() string { return fmt.Sprintf("copy %s -> %s", c.What, c.Dst) }

func (c CopyTree) Apply(env *Env) error {
	env.logf("%s", c.Describe())
	if env.DryRun {
		return nil
	}
	if err := os.MkdirAll(c.Dst, 0o755); err != nil {
		return err
	}
	env.own(c.Dst)

	return filepath.WalkDir(c.Src, func(path string, d fs.DirEntry, err error) error {
		if err != nil {
			return err
		}
		rel, err := filepath.Rel(c.Src, path)
		if err != nil {
			return err
		}
		if rel == "." {
			return nil
		}
		rel = filepath.ToSlash(rel)
		if c.Skip != nil && c.Skip(rel) {
			if d.IsDir() {
				return fs.SkipDir
			}
			return nil
		}
		dst := filepath.Join(c.Dst, filepath.FromSlash(rel))
		if d.IsDir() {
			return os.MkdirAll(dst, 0o755)
		}
		data, err := os.ReadFile(path)
		if err != nil {
			return err
		}
		if c.Rewrite != nil && strings.HasSuffix(rel, ".md") {
			data = c.Rewrite(rel, data)
		}
		if err := os.MkdirAll(filepath.Dir(dst), 0o755); err != nil {
			return err
		}
		return os.WriteFile(dst, data, 0o644)
	})
}

// --- MergeJSON ---------------------------------------------------------------

// MergeJSON sets one nested key in a JSON config the host owns, leaving every
// other key — and the key order — untouched.
type MergeJSON struct {
	Path  string
	Key   []string // e.g. ["mcpServers", "powerbi-modeling-mcp"]
	Value any
	What  string
}

func (m MergeJSON) Describe() string {
	return fmt.Sprintf("merge %s into %s (%s)", strings.Join(m.Key, "."), m.Path, m.What)
}

func (m MergeJSON) Apply(env *Env) error {
	env.logf("%s", m.Describe())
	if env.DryRun {
		return nil
	}
	if err := env.Backup.Save(m.Path); err != nil {
		return err
	}
	original, err := os.ReadFile(m.Path)
	if err != nil && !os.IsNotExist(err) {
		return err
	}
	obj, err := confmerge.ParseJSONObject(original)
	if err != nil {
		return fmt.Errorf("%s is not valid JSON: %w", m.Path, err)
	}
	locator, err := confmerge.SetPath(obj, m.Key, m.Value)
	if err != nil {
		return err
	}
	out, err := confmerge.RenderJSON(obj, original)
	if err != nil {
		return err
	}
	if err := os.MkdirAll(filepath.Dir(m.Path), 0o755); err != nil {
		return err
	}
	if err := os.WriteFile(m.Path, out, 0o644); err != nil {
		return err
	}
	if len(original) == 0 {
		env.own(m.Path)
	} else {
		env.edit(state.EditJSONKey, m.Path, locator)
	}
	return nil
}

// --- MergeTOML ---------------------------------------------------------------

// MergeTOML adds or replaces a whole table in a TOML config (Codex).
type MergeTOML struct {
	Path   string
	Table  string // e.g. mcp_servers.FabricIQ
	Values map[string]any
	What   string
}

func (m MergeTOML) Describe() string {
	return fmt.Sprintf("merge [%s] into %s (%s)", m.Table, m.Path, m.What)
}

func (m MergeTOML) Apply(env *Env) error {
	env.logf("%s", m.Describe())
	if env.DryRun {
		return nil
	}
	if err := env.Backup.Save(m.Path); err != nil {
		return err
	}
	original, err := os.ReadFile(m.Path)
	if err != nil && !os.IsNotExist(err) {
		return err
	}
	out, err := confmerge.SetTable(original, m.Table, m.Values)
	if err != nil {
		return err
	}
	if err := os.MkdirAll(filepath.Dir(m.Path), 0o755); err != nil {
		return err
	}
	if err := os.WriteFile(m.Path, out, 0o644); err != nil {
		return err
	}
	if len(original) == 0 {
		env.own(m.Path)
	} else {
		env.edit(state.EditTOMLKey, m.Path, m.Table)
	}
	return nil
}

// --- MarkdownBlock -----------------------------------------------------------

// MarkdownBlock owns a delimited region of a shared instructions file.
type MarkdownBlock struct {
	Path    string
	ID      string
	Content string
	What    string
}

func (m MarkdownBlock) Describe() string {
	return fmt.Sprintf("update fabkit block in %s (%s)", m.Path, m.What)
}

func (m MarkdownBlock) Apply(env *Env) error {
	env.logf("%s", m.Describe())
	if env.DryRun {
		return nil
	}
	if err := env.Backup.Save(m.Path); err != nil {
		return err
	}
	original, err := os.ReadFile(m.Path)
	if err != nil && !os.IsNotExist(err) {
		return err
	}
	out := confmerge.SetBlock(original, m.ID, m.Content)
	if err := os.MkdirAll(filepath.Dir(m.Path), 0o755); err != nil {
		return err
	}
	if err := os.WriteFile(m.Path, out, 0o644); err != nil {
		return err
	}
	if len(original) == 0 {
		env.own(m.Path)
	} else {
		env.edit(state.EditMarkdown, m.Path, m.ID)
	}
	return nil
}

// --- Run ---------------------------------------------------------------------

// Run shells out — installing a prerequisite, or handing a bundle to a host's
// own plugin manager. The exact command is always shown before it runs, and
// confirmed unless the caller pre-approved it.
type Run struct {
	Name string
	Args []string
	Why  string
	// Dir is the working directory; empty means the current one.
	Dir string
}

func (r Run) Describe() string {
	return fmt.Sprintf("run `%s` (%s)", strings.Join(append([]string{r.Name}, r.Args...), " "), r.Why)
}

func (r Run) Apply(env *Env) error {
	env.logf("%s", r.Describe())
	if env.DryRun {
		return nil
	}
	if env.Confirm != nil && !env.Confirm(strings.Join(append([]string{r.Name}, r.Args...), " ")) {
		return fmt.Errorf("declined")
	}
	cmd := exec.Command(r.Name, r.Args...)
	cmd.Dir = r.Dir
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr
	return cmd.Run()
}
