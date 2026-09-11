// Package state records what dashkit wrote and where, so `dashkit uninstall`
// removes exactly what it created and nothing else, and `dashkit update` knows
// which bundle/target pairs to refresh.
package state

import (
	"encoding/json"
	"errors"
	"io/fs"
	"os"
	"path/filepath"
	"sort"
	"time"

	"github.com/leonsang/dashkit/internal/home"
)

const schemaVersion = 1

// EditKind names the kind of surgical change made to a file dashkit does not own.
type EditKind string

const (
	EditJSONKey  EditKind = "json-key" // a key added under a JSON path
	EditTOMLKey  EditKind = "toml-key" // a table added to a TOML file
	EditMarkdown EditKind = "md-block" // a managed <!-- dashkit:... --> block
)

// Edit is a reversible change inside a file owned by someone else.
type Edit struct {
	Kind EditKind `json:"kind"`
	Path string   `json:"path"`
	// Locator is the JSON path ("mcpServers.powerbi-modeling-mcp"), TOML table
	// ("mcp_servers.FabricIQ") or markdown block id that dashkit added.
	Locator string `json:"locator"`
}

// Install is one (bundle, target, scope) application.
type Install struct {
	Bundle    string    `json:"bundle"`
	Target    string    `json:"target"`
	Scope     string    `json:"scope"`
	ProjectAt string    `json:"projectAt,omitempty"`
	Ref       string    `json:"ref"`
	Version   string    `json:"version"`
	At        time.Time `json:"at"`
	// Owned paths were created wholly by dashkit and are safe to delete.
	Owned []string `json:"owned"`
	// Edits are changes inside pre-existing files.
	Edits []Edit `json:"edits"`
	// Plugins were installed through a host's own plugin manager; uninstall asks
	// that host to remove them rather than deleting files it does not own.
	Plugins []Plugin `json:"plugins,omitempty"`
	// BackupDir is where the pre-install copies of edited files live.
	BackupDir string `json:"backupDir,omitempty"`
}

// Plugin is one plugin handed to a host's plugin manager.
type Plugin struct {
	Host        string `json:"host"`
	Bin         string `json:"bin"`
	Ref         string `json:"ref"` // plugin@marketplace
	Marketplace string `json:"marketplace,omitempty"`
	Scope       string `json:"scope,omitempty"`
	Dir         string `json:"dir,omitempty"`
	// OwnsMarketplace is true when dashkit declared the marketplace itself: it
	// was not declared in this scope before. Only then may uninstall remove it.
	OwnsMarketplace bool `json:"ownsMarketplace,omitempty"`
}

// SameMarketplace reports whether two plugins rely on one declaration.
func (p Plugin) SameMarketplace(o Plugin) bool {
	return p.Host == o.Host && p.Marketplace == o.Marketplace && p.Scope == o.Scope && p.Dir == o.Dir
}

// Key identifies an install slot: re-running the same bundle/target/scope
// replaces the previous record rather than stacking up duplicates.
func (i Install) Key() string { return i.Bundle + "|" + i.Target + "|" + i.Scope + "|" + i.ProjectAt }

type State struct {
	SchemaVersion int       `json:"schemaVersion"`
	Installs      []Install `json:"installs"`
}

// Load reads the state file, returning an empty state when none exists yet.
func Load() (*State, error) {
	data, err := os.ReadFile(home.StateFile())
	if errors.Is(err, fs.ErrNotExist) {
		return &State{SchemaVersion: schemaVersion}, nil
	}
	if err != nil {
		return nil, err
	}
	var s State
	if err := json.Unmarshal(data, &s); err != nil {
		return nil, err
	}
	if s.SchemaVersion == 0 {
		s.SchemaVersion = schemaVersion
	}
	return &s, nil
}

// Save writes the state file atomically.
func (s *State) Save() error {
	s.SchemaVersion = schemaVersion
	sort.SliceStable(s.Installs, func(a, b int) bool { return s.Installs[a].Key() < s.Installs[b].Key() })
	data, err := json.MarshalIndent(s, "", "  ")
	if err != nil {
		return err
	}
	if err := os.MkdirAll(filepath.Dir(home.StateFile()), 0o755); err != nil {
		return err
	}
	tmp := home.StateFile() + ".tmp"
	if err := os.WriteFile(tmp, append(data, '\n'), 0o644); err != nil {
		return err
	}
	return os.Rename(tmp, home.StateFile())
}

// Record adds or replaces an install entry.
func (s *State) Record(in Install) {
	for i, existing := range s.Installs {
		if existing.Key() == in.Key() {
			s.Installs[i] = in
			return
		}
	}
	s.Installs = append(s.Installs, in)
}

// Remove drops the entry with the given key and reports whether it existed.
func (s *State) Remove(key string) bool {
	for i, existing := range s.Installs {
		if existing.Key() == key {
			s.Installs = append(s.Installs[:i], s.Installs[i+1:]...)
			return true
		}
	}
	return false
}

// Matching returns installs filtered by bundle and target ("" matches any).
func (s *State) Matching(bundle, target string) []Install {
	var out []Install
	for _, in := range s.Installs {
		if bundle != "" && in.Bundle != bundle {
			continue
		}
		if target != "" && in.Target != target {
			continue
		}
		out = append(out, in)
	}
	return out
}
