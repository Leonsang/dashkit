package catalog

import (
	"encoding/json"
	"os"
	"path/filepath"
	"testing"
)

// The catalog, the marketplace file and each plugin's own manifest describe
// the same plugins; a rename in one place must not silently break another.
func TestBuiltinPluginsMatchTheMarketplace(t *testing.T) {
	root := filepath.Join("..", "..")
	var market struct {
		Name    string `json:"name"`
		Plugins []struct {
			Name   string `json:"name"`
			Source string `json:"source"`
		} `json:"plugins"`
	}
	data, err := os.ReadFile(filepath.Join(root, ".claude-plugin", "marketplace.json"))
	if err != nil {
		t.Fatal(err)
	}
	if err := json.Unmarshal(data, &market); err != nil {
		t.Fatal(err)
	}
	listed := map[string]string{}
	for _, p := range market.Plugins {
		listed[p.Name] = p.Source
		var own struct {
			Name string `json:"name"`
		}
		raw, err := os.ReadFile(filepath.Join(root, filepath.FromSlash(p.Source), ".claude-plugin", "plugin.json"))
		if err != nil {
			t.Errorf("%s: %v", p.Name, err)
			continue
		}
		if err := json.Unmarshal(raw, &own); err != nil || own.Name != p.Name {
			t.Errorf("%s: plugin.json names %q", p.Name, own.Name)
		}
	}
	for _, b := range Bundles() {
		if b.Kind != Builtin {
			continue
		}
		if src, ok := listed[b.ID]; !ok || src != "./bundles/"+b.Dir {
			t.Errorf("builtin bundle %s is not in marketplace.json as ./bundles/%s (got %q)", b.ID, b.Dir, src)
		}
		if b.HasPlugin() && (b.Marketplace.Name != market.Name || b.Marketplace.Plugin != b.ID) {
			t.Errorf("%s: catalog points at %+v, marketplace is %q", b.ID, b.Marketplace, market.Name)
		}
	}
}
