// Package catalog describes which skills, agents and MCP servers make up each
// upstream bundle. The manifest is generated from the upstream marketplace file
// by tools/gen-manifest.mjs and embedded in the binary, so `fabkit` can show the
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

// Bundle is one installable set of skills, matching an upstream plugin.
type Bundle struct {
	ID          string               `json:"id"`
	Title       string               `json:"title"`
	Description string               `json:"description"`
	Dir         string               `json:"dir"` // path inside the upstream tree, e.g. plugins/powerbi-authoring
	Skills      []string             `json:"skills"`
	Agents      []string             `json:"agents"`
	Common      []string             `json:"common"`
	MCPServers  map[string]MCPServer `json:"mcpServers"`
	Prereqs     Prereqs              `json:"prereqs"`
}

// Source pins which upstream revision this fabkit build installs.
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
	return Bundle{}, fmt.Errorf("unknown bundle %q (try `fabkit list`)", id)
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
