package install

import (
	"errors"
	"os"
	"path/filepath"
	"strings"
	"testing"

	"github.com/leonsang/dashkit/internal/catalog"
	"github.com/leonsang/dashkit/internal/home"
	"github.com/leonsang/dashkit/internal/plan"
	"github.com/leonsang/dashkit/internal/targets"
)

// Hosts without a plugin manager get the authoring bundles as files: skills,
// the MCP server's code copied next to them, and an MCP entry pointing at
// that copy by absolute path — never the raw placeholder.
func TestAuthoringBundlesInstallTheirServerWhereThereIsNoPluginManager(t *testing.T) {
	cases := []struct {
		bundle string
		files  []string // relative to the project, all must exist
		server string   // a path fragment every MCP config must contain
	}{
		{
			bundle: "tableau-authoring",
			files: []string{
				".dashkit/tableau-authoring/skills/tableau-authoring/SKILL.md",
				".dashkit/tableau-authoring/server/pyproject.toml",
				".dashkit/tableau-authoring/server/uv.lock",
				".dashkit/tableau-authoring/server/src/tableu_mcp/server.py",
				".dashkit/tableau-authoring/server/src/tableu_mcp/__init__.py",
				".dashkit/tableau-authoring/server/src/tableu_mcp/docs/coverage.md",
				".github/chatmodes/tableau-author.chatmode.md",
			},
			server: ".dashkit/tableau-authoring/server",
		},
		{
			bundle: "looker-studio-authoring",
			files: []string{
				".dashkit/looker-studio-authoring/skills/ls-kpi-scorecards/SKILL.md",
				".dashkit/looker-studio-authoring/looker-studio-mcp/dist/index.js",
				".dashkit/looker-studio-authoring/looker-studio-mcp/package.json",
				".dashkit/looker-studio-authoring/looker-studio-mcp/themes/base-theme.json",
				".github/chatmodes/looker-studio-author.chatmode.md",
			},
			server: ".dashkit/looker-studio-authoring/looker-studio-mcp/dist/index.js",
		},
	}
	for _, c := range cases {
		t.Run(c.bundle, func(t *testing.T) {
			home.SetRoot(t.TempDir())
			t.Cleanup(func() { home.SetRoot("") })
			b, err := catalog.Find(c.bundle)
			if err != nil {
				t.Fatal(err)
			}
			project := t.TempDir()
			req := request(t, b, "", project, "cursor", "vscode-copilot", "codex", "gemini")
			req.PreferHostPlugin = true // none of these hosts has a plugin manager
			apply(t, req)

			for _, rel := range c.files {
				if _, err := os.Stat(filepath.Join(project, filepath.FromSlash(rel))); err != nil {
					t.Errorf("missing %s: %v", rel, err)
				}
			}
			for _, cfg := range []string{".cursor/mcp.json", ".vscode/mcp.json", ".codex/config.toml", ".gemini/settings.json"} {
				text := read(t, filepath.Join(project, filepath.FromSlash(cfg)))
				if strings.Contains(text, catalog.BundlePlaceholder) {
					t.Errorf("%s still holds the %s placeholder:\n%s", cfg, catalog.BundlePlaceholder, text)
				}
				abs := filepath.ToSlash(project)
				if !strings.Contains(text, abs) || !strings.Contains(text, c.server) {
					t.Errorf("%s should point at %s under %s:\n%s", cfg, c.server, abs, text)
				}
			}
		})
	}
}

// Guardrails are hooks only: a host without a plugin manager gets a reason,
// not an empty install.
func TestGuardrailsAreSkippedWithAReasonWhereHooksCannotRun(t *testing.T) {
	home.SetRoot(t.TempDir())
	t.Cleanup(func() { home.SetRoot("") })
	for _, id := range []string{"tableau-guardrails", "looker-studio-guardrails"} {
		b, err := catalog.Find(id)
		if err != nil {
			t.Fatal(err)
		}
		if !b.HooksOnly() || !b.HasPlugin() {
			t.Fatalf("%s should be a hooks-only bundle published as a plugin", id)
		}
		req := request(t, b, "", t.TempDir(), "cursor", "codex")
		req.PreferHostPlugin = true
		report := apply(t, req)
		if len(report.Installed) != 0 || len(report.Skipped) != 2 {
			t.Fatalf("%s: expected two skips and nothing installed, got %+v", id, report)
		}
		for _, s := range report.Skipped {
			if !strings.Contains(s.Skipped, "plugin") {
				t.Errorf("%s on %s: the skip should explain hooks need a plugin, got %q", id, s.Target.ID(), s.Skipped)
			}
		}
	}
}

// fakePluginHost is a target with a plugin manager that records what it was asked for.
type fakePluginHost struct {
	targets.Target
	refuse error
	got    *catalog.MarketplaceRef
}

func (f *fakePluginHost) PlanMarketplace(b catalog.Bundle, _ targets.Options) (plan.Plan, error) {
	if f.refuse != nil {
		return nil, f.refuse
	}
	f.got = b.Marketplace
	return plan.Plan{plan.PluginInstall{Plugin: b.Marketplace.Plugin, MarketplaceRepo: b.Marketplace.Repo}}, nil
}

// Hosts with a plugin manager install dashkit's own bundles from dashkit's
// marketplace, so commands, subagents and hooks come along; when the manager
// refuses, skills fall back to files and hooks-only bundles are skipped.
func TestBuiltinPluginsGoThroughTheHostPluginManager(t *testing.T) {
	cursor, err := targets.Find("cursor")
	if err != nil {
		t.Fatal(err)
	}
	opts := targets.Options{Scope: targets.Project, ProjectDir: t.TempDir(), PreferHostPlugin: true}
	for _, id := range []string{"tableau-authoring", "tableau-sdd", "tableau-guardrails", "looker-studio-authoring", "ls-sdd", "looker-studio-guardrails"} {
		b, err := catalog.Find(id)
		if err != nil {
			t.Fatal(err)
		}
		host := &fakePluginHost{Target: cursor}
		step, done := planBuiltinPlugin(b, host, opts)
		if !done || step.Skipped != "" || host.got == nil {
			t.Fatalf("%s: expected a plugin install, got done=%v skipped=%q", id, done, step.Skipped)
		}
		if host.got.Repo != "leonsang/dashkit" || host.got.Name != "dashkit" || host.got.Plugin != id {
			t.Errorf("%s: wrong marketplace reference %+v", id, host.got)
		}

		refusing := &fakePluginHost{Target: cursor, refuse: errors.New("per user only")}
		step, done = planBuiltinPlugin(b, refusing, opts)
		if b.HooksOnly() {
			if !done || step.Skipped != "per user only" {
				t.Errorf("%s: a refused hooks-only bundle should be skipped with the host's reason, got done=%v %q", id, done, step.Skipped)
			}
		} else if done {
			t.Errorf("%s: a refused bundle with skills should fall back to files", id)
		}
	}
	if pbi, _ := catalog.Find("pbi-sdd"); pbi.HasPlugin() {
		t.Error("pbi-sdd keeps its file install: it is in the marketplace for manual installs only")
	}
}

// Claude Code without its plugin manager: skills in .claude/skills for the
// agent, and a copy beside the server, which reads its guides from there.
func TestClaudeFileInstallGivesTheServerItsSkills(t *testing.T) {
	home.SetRoot(t.TempDir())
	t.Cleanup(func() { home.SetRoot("") })
	b, err := catalog.Find("looker-studio-authoring")
	if err != nil {
		t.Fatal(err)
	}
	project := t.TempDir()
	req := request(t, b, "", project, "claude")
	req.PreferHostPlugin = false
	apply(t, req)
	for _, rel := range []string{
		".claude/skills/ls-kpi-scorecards/SKILL.md",
		".claude/agents/looker-studio-author.md",
		".dashkit/looker-studio-authoring/skills/ls-kpi-scorecards/SKILL.md",
		".dashkit/looker-studio-authoring/looker-studio-mcp/dist/index.js",
	} {
		if _, err := os.Stat(filepath.Join(project, filepath.FromSlash(rel))); err != nil {
			t.Errorf("missing %s: %v", rel, err)
		}
	}
	if mcp := read(t, filepath.Join(project, ".mcp.json")); !strings.Contains(mcp, "looker-studio-authoring/skills") {
		t.Errorf("LS_SKILLS_DIR should point beside the server:\n%s", mcp)
	}
}
