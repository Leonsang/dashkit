package install

import (
	"context"
	"crypto/sha256"
	"encoding/hex"
	"io"
	"io/fs"
	"os"
	"path/filepath"
	"sort"
	"strings"
	"testing"

	"github.com/leonsang/dashkit/internal/catalog"
	"github.com/leonsang/dashkit/internal/home"
	"github.com/leonsang/dashkit/internal/targets"
)

// These tests run identically on Windows, macOS and Linux: everything happens
// inside t.TempDir(), the upstream tree is a fixture rather than a download, and
// no host tool has to be installed. That is what makes the macOS CI job
// meaningful rather than a compile check.

// fakeUpstream writes a miniature skills-for-fabric tree containing the real
// skill names of a bundle, so path handling is exercised for real.
func fakeUpstream(t *testing.T, b catalog.Bundle) string {
	t.Helper()
	root := t.TempDir()
	bundleDir := filepath.Join(root, filepath.FromSlash(b.Dir))

	for _, skill := range b.Skills {
		dir := filepath.Join(bundleDir, "skills", skill)
		mustMkdir(t, dir)
		body := "---\nname: " + skill + "\ndescription: >-\n  Does " + skill + " things.\n---\n\n" +
			"See ../../common/COMMON-CLI.md for the shared CLI notes.\n"
		mustWrite(t, filepath.Join(dir, "SKILL.md"), body)
		mustMkdir(t, filepath.Join(dir, "references"))
		mustWrite(t, filepath.Join(dir, "references", "notes.md"), "reference for "+skill+"\n")
	}
	for _, doc := range b.Common {
		mustMkdir(t, filepath.Join(bundleDir, "common"))
		mustWrite(t, filepath.Join(bundleDir, "common", doc), "shared: "+doc+"\n")
	}
	for _, agent := range b.Agents {
		mustMkdir(t, filepath.Join(bundleDir, "agents"))
		mustWrite(t, filepath.Join(bundleDir, "agents", agent),
			"---\nname: "+strings.TrimSuffix(agent, ".agent.md")+"\ndescription: an agent\n---\n\nbody\n")
	}
	// source.Local checks for a plugins/ directory at the root.
	mustMkdir(t, filepath.Join(root, "plugins"))
	return root
}

func mustMkdir(t *testing.T, dir string) {
	t.Helper()
	if err := os.MkdirAll(dir, 0o755); err != nil {
		t.Fatal(err)
	}
}

func mustWrite(t *testing.T, path, content string) {
	t.Helper()
	mustMkdir(t, filepath.Dir(path))
	if err := os.WriteFile(path, []byte(content), 0o644); err != nil {
		t.Fatal(err)
	}
}

func read(t *testing.T, path string) string {
	t.Helper()
	data, err := os.ReadFile(path)
	if err != nil {
		t.Fatalf("reading %s: %v", path, err)
	}
	return string(data)
}

func request(t *testing.T, b catalog.Bundle, upstream, project string, ids ...string) Request {
	t.Helper()
	chosen, err := targets.Resolve(ids)
	if err != nil {
		t.Fatal(err)
	}
	return Request{
		Bundles:         []catalog.Bundle{b},
		Targets:         chosen,
		Scope:           targets.Project,
		ProjectDir:      project,
		MCP:             true,
		SourceDir:       upstream,
		SkipPrereqCheck: true,
	}
}

func apply(t *testing.T, req Request) *Report {
	t.Helper()
	built, err := Build(context.Background(), req)
	if err != nil {
		t.Fatal(err)
	}
	report, err := Apply(req, built, io.Discard, func(string) bool { return false })
	if err != nil {
		t.Fatal(err)
	}
	return report
}

func TestInstallProjectScopeWritesEveryHostFormat(t *testing.T) {
	home.SetRoot(t.TempDir())
	t.Cleanup(func() { home.SetRoot("") })

	bundle, err := catalog.Find("powerbi-authoring")
	if err != nil {
		t.Fatal(err)
	}
	upstream := fakeUpstream(t, bundle)
	project := t.TempDir()

	// A file the user already owns: dashkit must add to it, not replace it.
	agentsFile := filepath.Join(project, "AGENTS.md")
	mustWrite(t, agentsFile, "# My project\n\nMy own notes.\n")

	apply(t, request(t, bundle, upstream, project, "cursor", "vscode-copilot", "codex", "gemini"))

	rule := read(t, filepath.Join(project, ".cursor", "rules", "dashkit-powerbi-authoring.mdc"))
	if !strings.HasPrefix(rule, "---\ndescription: ") || !strings.Contains(rule, "alwaysApply: true") {
		t.Errorf("cursor rule is missing its front matter:\n%s", rule[:min(200, len(rule))])
	}
	if !strings.Contains(rule, ".dashkit/powerbi-authoring/skills/powerbi-report-design/SKILL.md") {
		t.Errorf("cursor rule does not point at the vendored skill:\n%s", rule)
	}

	instructions := read(t, filepath.Join(project, ".github", "instructions", "dashkit-powerbi-authoring.instructions.md"))
	if !strings.Contains(instructions, "applyTo: '**'") {
		t.Errorf("VS Code instructions need applyTo or they are never loaded:\n%s", instructions)
	}

	agents := read(t, agentsFile)
	if !strings.Contains(agents, "My own notes.") {
		t.Error("the user's own AGENTS.md content was lost")
	}
	if !strings.Contains(agents, "<!-- dashkit:start:powerbi-authoring -->") {
		t.Error("no managed block was added to AGENTS.md")
	}

	// Relative links inside the skills must be repointed at the vendored copy.
	skill := read(t, filepath.Join(project, ".dashkit", "powerbi-authoring", "skills", "powerbi-report-authoring", "SKILL.md"))
	if strings.Contains(skill, "../../common/") {
		t.Errorf("common links were not rewritten:\n%s", skill)
	}
	if !strings.Contains(skill, "../_dashkit-common/COMMON-CLI.md") {
		t.Errorf("common links point somewhere unexpected:\n%s", skill)
	}
	commonDoc := filepath.Join(project, ".dashkit", "powerbi-authoring", "skills", "_dashkit-common", "COMMON-CLI.md")
	if _, err := os.Stat(commonDoc); err != nil {
		t.Errorf("shared docs missing where the rewritten link points: %v", err)
	}

	mcp := read(t, filepath.Join(project, ".cursor", "mcp.json"))
	if !strings.Contains(mcp, "powerbi-modeling-mcp") {
		t.Errorf("MCP server not registered for Cursor:\n%s", mcp)
	}
	vsMCP := read(t, filepath.Join(project, ".vscode", "mcp.json"))
	if !strings.Contains(vsMCP, `"servers"`) {
		t.Errorf("VS Code MCP config must use the servers key:\n%s", vsMCP)
	}

	// A project install must stay inside the project: Codex reads its own
	// .codex/config.toml, Gemini its own .gemini/settings.json.
	codexConf := read(t, filepath.Join(project, ".codex", "config.toml"))
	if !strings.Contains(codexConf, "[mcp_servers.powerbi-modeling-mcp]") {
		t.Errorf("Codex MCP table missing:\n%s", codexConf)
	}
	if !strings.Contains(codexConf, `args = ["-y", "@microsoft/powerbi-modeling-mcp@latest", "--start"]`) {
		t.Errorf("Codex args are not TOML arrays:\n%s", codexConf)
	}
	if _, err := os.Stat(filepath.Join(home.Root(), ".codex", "config.toml")); err == nil {
		t.Error("a project-scoped install wrote to the global Codex config")
	}

	geminiSettings := read(t, filepath.Join(project, ".gemini", "settings.json"))
	if !strings.Contains(geminiSettings, `"mcpServers"`) {
		t.Errorf("Gemini settings must declare mcpServers:\n%s", geminiSettings)
	}
	geminiContext := read(t, filepath.Join(project, "GEMINI.md"))
	if !strings.Contains(geminiContext, "<!-- dashkit:start:powerbi-authoring -->") {
		t.Errorf("GEMINI.md has no managed block:\n%s", geminiContext)
	}
}

func TestInstallIsIdempotent(t *testing.T) {
	home.SetRoot(t.TempDir())
	t.Cleanup(func() { home.SetRoot("") })

	bundle, _ := catalog.Find("powerbi-authoring")
	upstream := fakeUpstream(t, bundle)
	project := t.TempDir()
	mustWrite(t, filepath.Join(project, "AGENTS.md"), "# Mine\n\nText.\n")

	req := request(t, bundle, upstream, project, "cursor", "codex", "gemini", "claude")
	apply(t, req)
	first := hashTree(t, project)
	apply(t, req)
	second := hashTree(t, project)

	if first != second {
		t.Errorf("re-running the install changed the project tree\nfirst:  %s\nsecond: %s", first, second)
	}
}

func TestUninstallRestoresTheProject(t *testing.T) {
	home.SetRoot(t.TempDir())
	t.Cleanup(func() { home.SetRoot("") })

	bundle, _ := catalog.Find("powerbi-authoring")
	upstream := fakeUpstream(t, bundle)
	project := t.TempDir()

	mustWrite(t, filepath.Join(project, "AGENTS.md"), "# My project\n\nMy own notes.\n")
	mustWrite(t, filepath.Join(project, ".cursor", "mcp.json"), "{\n  \"mcpServers\": {\n    \"mine\": {\n      \"command\": \"x\"\n    }\n  }\n}\n")
	before := hashTree(t, project)

	apply(t, request(t, bundle, upstream, project, "cursor", "codex", "gemini"))
	if hashTree(t, project) == before {
		t.Fatal("install changed nothing")
	}

	if err := Uninstall("", "", false, io.Discard, func(string) bool { return false }); err != nil {
		t.Fatal(err)
	}
	if got := hashTree(t, project); got != before {
		t.Errorf("uninstall did not restore the project\nbefore: %s\nafter:  %s\n%s", before, got, treeListing(t, project))
	}
}

// hashTree fingerprints a directory: relative paths plus content, so the
// comparison is stable across platforms.
func hashTree(t *testing.T, root string) string {
	t.Helper()
	var entries []string
	err := filepath.WalkDir(root, func(path string, d fs.DirEntry, err error) error {
		if err != nil {
			return err
		}
		if d.IsDir() {
			return nil
		}
		rel, err := filepath.Rel(root, path)
		if err != nil {
			return err
		}
		data, err := os.ReadFile(path)
		if err != nil {
			return err
		}
		sum := sha256.Sum256([]byte(strings.ReplaceAll(string(data), "\r\n", "\n")))
		entries = append(entries, filepath.ToSlash(rel)+":"+hex.EncodeToString(sum[:8]))
		return nil
	})
	if err != nil {
		t.Fatal(err)
	}
	sort.Strings(entries)
	sum := sha256.Sum256([]byte(strings.Join(entries, "\n")))
	return hex.EncodeToString(sum[:])
}

func treeListing(t *testing.T, root string) string {
	t.Helper()
	var out []string
	filepath.WalkDir(root, func(path string, d fs.DirEntry, err error) error {
		if err == nil && !d.IsDir() {
			rel, _ := filepath.Rel(root, path)
			out = append(out, filepath.ToSlash(rel))
		}
		return nil
	})
	sort.Strings(out)
	return strings.Join(out, "\n")
}

func min(a, b int) int {
	if a < b {
		return a
	}
	return b
}

// A server that authenticates through headersHelper is registered only where
// the host runs that command; anywhere else it is written down, not registered
// half-working without its credentials.
func TestHeadersHelperServersOnlyGoWhereTheyCanAuthenticate(t *testing.T) {
	home.SetRoot(t.TempDir())
	t.Cleanup(func() { home.SetRoot("") })

	bundle, err := catalog.Find("fabric-skills")
	if err != nil {
		t.Fatal(err)
	}
	helped := 0
	for _, s := range bundle.MCPServers {
		if s.NeedsHeadersHelper() {
			helped++
		}
	}
	if helped == 0 {
		t.Skip("the pinned fabric-skills has no headersHelper servers")
	}

	upstream := fakeUpstream(t, bundle)
	project := t.TempDir()
	apply(t, request(t, bundle, upstream, project, "claude", "cursor"))

	claudeMCP := read(t, filepath.Join(project, ".mcp.json"))
	if !strings.Contains(claudeMCP, `"headersHelper"`) {
		t.Errorf("Claude Code runs headersHelper, so the servers belong in .mcp.json with it:\n%s", claudeMCP)
	}

	if data, err := os.ReadFile(filepath.Join(project, ".cursor", "mcp.json")); err == nil && strings.Contains(string(data), "fabric.microsoft.com") {
		t.Errorf("Cursor cannot run headersHelper; its config must not carry servers it cannot authenticate:\n%s", data)
	}
	notes := read(t, filepath.Join(project, ".dashkit", "fabric-skills", "MCP-SERVERS.md"))
	if !strings.Contains(notes, "az account get-access-token") {
		t.Errorf("the note should say how to authenticate:\n%s", notes)
	}
}
