package confmerge

import (
	"strings"
	"testing"
)

func TestJSONMergeKeepsForeignKeysAndOrder(t *testing.T) {
	original := []byte(`{
  "numStartups": 7,
  "mcpServers": {
    "mine": {"command": "x"}
  },
  "theme": "dark"
}`)

	obj, err := ParseJSONObject(original)
	if err != nil {
		t.Fatal(err)
	}
	locator, err := SetPath(obj, []string{"mcpServers", "fabkit-added"}, map[string]string{"command": "npx"})
	if err != nil {
		t.Fatal(err)
	}
	if locator != "mcpServers.fabkit-added" {
		t.Fatalf("locator = %q", locator)
	}

	out, err := RenderJSON(obj, original)
	if err != nil {
		t.Fatal(err)
	}
	got := string(out)

	for _, want := range []string{`"numStartups": 7`, `"mine"`, `"theme": "dark"`, `"fabkit-added"`} {
		if !strings.Contains(got, want) {
			t.Errorf("output lost %s:\n%s", want, got)
		}
	}
	if strings.Index(got, "numStartups") > strings.Index(got, "mcpServers") {
		t.Errorf("key order changed:\n%s", got)
	}
}

func TestJSONMergeIsIdempotent(t *testing.T) {
	original := []byte("{\n  \"a\": 1\n}\n")

	apply := func(in []byte) []byte {
		obj, err := ParseJSONObject(in)
		if err != nil {
			t.Fatal(err)
		}
		if _, err := SetPath(obj, []string{"mcpServers", "s"}, map[string]any{"type": "stdio"}); err != nil {
			t.Fatal(err)
		}
		out, err := RenderJSON(obj, in)
		if err != nil {
			t.Fatal(err)
		}
		return out
	}

	once := apply(original)
	twice := apply(once)
	if string(once) != string(twice) {
		t.Errorf("second apply changed the file:\nfirst:\n%s\nsecond:\n%s", once, twice)
	}
}

func TestJSONDeletePathPrunesOnlyEmptyParents(t *testing.T) {
	original := []byte(`{"mcpServers":{"mine":{"command":"x"},"fabkit":{"command":"y"}},"keep":1}`)
	obj, err := ParseJSONObject(original)
	if err != nil {
		t.Fatal(err)
	}
	if err := DeletePath(obj, []string{"mcpServers", "fabkit"}, true); err != nil {
		t.Fatal(err)
	}
	out, _ := RenderJSON(obj, original)
	if !strings.Contains(string(out), `"mine"`) || strings.Contains(string(out), `"fabkit"`) {
		t.Fatalf("unexpected result:\n%s", out)
	}

	// Removing the last child should take the now-empty parent with it.
	obj, _ = ParseJSONObject([]byte(`{"mcpServers":{"fabkit":{}},"keep":1}`))
	if err := DeletePath(obj, []string{"mcpServers", "fabkit"}, true); err != nil {
		t.Fatal(err)
	}
	out, _ = RenderJSON(obj, original)
	if strings.Contains(string(out), "mcpServers") {
		t.Fatalf("empty parent survived:\n%s", out)
	}
	if !strings.Contains(string(out), `"keep"`) {
		t.Fatalf("pruning removed an unrelated key:\n%s", out)
	}
}

func TestMarkdownBlockRoundTrip(t *testing.T) {
	original := []byte("# My notes\n\nSomething I wrote.\n")

	once := SetBlock(original, "powerbi", "Fabkit says hello.")
	if !HasBlock(once, "powerbi") {
		t.Fatal("block not written")
	}
	twice := SetBlock(once, "powerbi", "Fabkit says hello.")
	if string(once) != string(twice) {
		t.Errorf("not idempotent:\nfirst:\n%q\nsecond:\n%q", once, twice)
	}

	updated := SetBlock(twice, "powerbi", "Fabkit says something else.")
	if strings.Contains(string(updated), "hello") {
		t.Errorf("old content survived:\n%s", updated)
	}

	restored, remaining := RemoveBlock(updated, "powerbi")
	if !remaining {
		t.Fatal("user content was dropped")
	}
	if string(restored) != string(original) {
		t.Errorf("removal did not restore the original:\nwant %q\ngot  %q", original, restored)
	}
}

func TestMarkdownBlockInEmptyFileIsRemovedEntirely(t *testing.T) {
	out := SetBlock(nil, "b", "content")
	if _, remaining := RemoveBlock(out, "b"); remaining {
		t.Error("expected the file to be reported as empty after removal")
	}
}

func TestTOMLTableAddReplaceRemove(t *testing.T) {
	original := []byte("# my codex config\nmodel = \"gpt-5\"\n\n[mcp_servers.mine]\ncommand = \"x\"\n")

	added, err := SetTable(original, "mcp_servers.fabkit", map[string]any{
		"command": "npx",
		"args":    []string{"-y", "pkg@latest"},
		"env":     map[string]string{"TOKEN": "abc"},
	})
	if err != nil {
		t.Fatal(err)
	}
	got := string(added)
	for _, want := range []string{"# my codex config", `model = "gpt-5"`, "[mcp_servers.mine]", "[mcp_servers.fabkit]", `args = ["-y", "pkg@latest"]`, "[mcp_servers.fabkit.env]"} {
		if !strings.Contains(got, want) {
			t.Errorf("missing %q in:\n%s", want, got)
		}
	}

	twice, err := SetTable(added, "mcp_servers.fabkit", map[string]any{"command": "npx"})
	if err != nil {
		t.Fatal(err)
	}
	if strings.Count(string(twice), "[mcp_servers.fabkit]") != 1 {
		t.Errorf("table duplicated:\n%s", twice)
	}

	removed := string(RemoveTable(twice, "mcp_servers.fabkit"))
	if strings.Contains(removed, "fabkit") {
		t.Errorf("table survived removal:\n%s", removed)
	}
	if !strings.Contains(removed, "[mcp_servers.mine]") || !strings.Contains(removed, "# my codex config") {
		t.Errorf("removal damaged the rest of the file:\n%s", removed)
	}
}
