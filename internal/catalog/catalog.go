// Package catalog describes which skills, agents and MCP servers make up each
// upstream bundle. The manifest is generated from the upstream marketplace file
// by tools/gen-manifest.mjs and embedded in the binary, so `dashkit` can show the
// bundle list and plan an install before any network call happens.
package catalog

import (
	_ "embed"
	"encoding/json"
	"fmt"
)

//go:embed manifest.json
var manifestJSON []byte

// MCPServer mirrors the shape hosts use in their MCP config files. Fields are
// omitempty so a stdio server never grows a null "url" on the way out.
type MCPServer struct {
	Type    string            `json:"type,omitempty"`
	Command string            `json:"command,omitempty"`
	Args    []string          `json:"args,omitempty"`
	URL     string            `json:"url,omitempty"`
	Headers map[string]string `json:"headers,omitempty"`
	Env     map[string]string `json:"env,omitempty"`
}

// Prereqs lists prerequisite ids (see internal/prereq). Required ones block an
// install unless the user overrides; optional ones are only reported.
type Prereqs struct {
	Required []string `json:"required"`
	Optional []string `json:"optional"`
}

// Kind says how a bundle reaches the user's tools.
type Kind string

const (
	// Vendored bundles are downloaded from the pinned upstream tree and written
	// into each host's native format. Only possible when the licence allows it.
	Vendored Kind = "vendored"
	// Marketplace bundles are never copied: dashkit asks the host's own plugin
	// manager to install them, so the author's licence, updates and hooks all
	// stay theirs. Hosts without a plugin manager are skipped with an explanation.
	Marketplace Kind = "marketplace"
)

// MarketplaceRef points at a plugin in a third-party marketplace.
type MarketplaceRef struct {
	Repo   string `json:"repo"`   // GitHub owner/repo the marketplace lives in
	Name   string `json:"name"`   // the name it registers under
	Plugin string `json:"plugin"` // plugin id inside it
}

// Credit names who made a bundle, for the docs and ATTRIBUTIONS.md.
type Credit struct {
	Author   string `json:"author"`
	License  string `json:"license"`
	Homepage string `json:"homepage"`
}

// Bundle is one installable set of skills, matching an upstream plugin.
type Bundle struct {
	ID          string               `json:"id"`
	Kind        Kind                 `json:"kind"`
	Title       string               `json:"title"`
	Description string               `json:"description"`
	Dir         string               `json:"dir,omitempty"` // path inside the upstream tree, e.g. plugins/powerbi-authoring
	Skills      []string             `json:"skills"`
	Agents      []string             `json:"agents,omitempty"`
	Common      []string             `json:"common,omitempty"`
	MCPServers  map[string]MCPServer `json:"mcpServers,omitempty"`
	Prereqs     Prereqs              `json:"prereqs"`
	// Hooks lists what a marketplace bundle enforces automatically, for display.
	Hooks       []string        `json:"hooks,omitempty"`
	Marketplace *MarketplaceRef `json:"marketplace,omitempty"`
	Credit      Credit          `json:"credit"`
}

// IsMarketplace reports whether the bundle is installed by a host plugin manager.
func (b Bundle) IsMarketplace() bool { return b.Kind == Marketplace }

// Source pins which upstream revision this dashkit build installs.
type Source struct {
	Repo            string `json:"repo"`
	Ref             string `json:"ref"`
	UpstreamVersion string `json:"upstreamVersion"`
}

type Manifest struct {
	SchemaVersion int      `json:"schemaVersion"`
	Source        Source   `json:"source"`
	Bundles       []Bundle `json:"bundles"`
}

var loaded Manifest

func init() {
	if err := json.Unmarshal(manifestJSON, &loaded); err != nil {
		panic(fmt.Sprintf("catalog: embedded manifest is invalid: %v", err))
	}
}

// Load returns the embedded manifest.
func Load() Manifest { return loaded }

// Bundles returns every bundle, Power BI first.
func Bundles() []Bundle { return loaded.Bundles }

// Find returns the bundle with the given id.
func Find(id string) (Bundle, error) {
	for _, b := range loaded.Bundles {
		if b.ID == id {
			return b, nil
		}
	}
	return Bundle{}, fmt.Errorf("unknown bundle %q (try `dashkit list`)", id)
}

// Resolve turns user-supplied bundle ids into bundles, accepting "all".
func Resolve(ids []string) ([]Bundle, error) {
	if len(ids) == 1 && ids[0] == "all" {
		return Bundles(), nil
	}
	out := make([]Bundle, 0, len(ids))
	seen := map[string]bool{}
	for _, id := range ids {
		if seen[id] {
			continue
		}
		b, err := Find(id)
		if err != nil {
			return nil, err
		}
		seen[id] = true
		out = append(out, b)
	}
	return out, nil
}
