package install

import (
	"context"
	"os"
	"strings"
	"testing"

	"github.com/leonsang/dashkit/internal/catalog"
	"github.com/leonsang/dashkit/internal/home"
	"github.com/leonsang/dashkit/internal/plan"
	"github.com/leonsang/dashkit/internal/state"
	"github.com/leonsang/dashkit/internal/targets"
)

func TestMarketplaceBundlesAreSkippedWithAReasonWhereTheyCannotGo(t *testing.T) {
	home.SetRoot(t.TempDir())
	t.Cleanup(func() { home.SetRoot("") })

	b, err := catalog.Find("goblin-pbip")
	if err != nil {
		t.Fatal(err)
	}
	// No SourceDir and no network: a marketplace-only run must not need the
	// upstream tree at all.
	req := request(t, b, "", t.TempDir(), "cursor", "copilot-cli")
	built, err := Build(context.Background(), req)
	if err != nil {
		t.Fatal(err)
	}
	if built.Tree != nil {
		t.Error("a marketplace-only run downloaded the upstream tree")
	}

	reasons := map[string]string{}
	for _, s := range built.Steps {
		if s.Skipped == "" {
			t.Errorf("%s should have been skipped, got a plan of %d actions", s.Target.ID(), len(s.Plan))
		}
		reasons[s.Target.ID()] = s.Skipped
	}
	if !strings.Contains(reasons["cursor"], "GPL-3.0") {
		t.Errorf("cursor's skip should explain the licence, got %q", reasons["cursor"])
	}
	if !strings.Contains(reasons["copilot-cli"], "per user") {
		t.Errorf("copilot-cli's skip should explain it has no project scope, got %q", reasons["copilot-cli"])
	}
}

func TestContextWarningFollowsTheScope(t *testing.T) {
	pbi, _ := catalog.Find("powerbi-authoring") // 6 skills
	all, _ := catalog.Find("fabric-skills")     // 27 skills

	if w := ContextWarning([]catalog.Bundle{pbi}, targets.Global); w != "" {
		t.Errorf("the Power BI bundle alone is a sensible global install, got %q", w)
	}
	if w := ContextWarning([]catalog.Bundle{all}, targets.Global); !strings.Contains(w, "every session") {
		t.Errorf("27 global skills should warn about every session, got %q", w)
	}
	if w := ContextWarning([]catalog.Bundle{pbi}, targets.Project); w != "" {
		t.Errorf("unexpected warning for a small project install: %q", w)
	}
	if w := ContextWarning([]catalog.Bundle{all}, targets.Project); w == "" {
		t.Error("27 skills in one project should still warn")
	}
}

func TestUninstallHandsPluginsBackToTheirHost(t *testing.T) {
	home.SetRoot(t.TempDir())
	t.Cleanup(func() { home.SetRoot("") })

	st, err := state.Load()
	if err != nil {
		t.Fatal(err)
	}
	st.Record(state.Install{
		Bundle: "goblin-pbip", Target: "claude", Scope: "project", ProjectAt: "/work",
		Plugins: []state.Plugin{{Host: "claude", Bin: "dashkit-test-no-such-host", Ref: "pbip@power-bi-agentic-development", Scope: "project", Dir: "/work"}},
	})
	if err := st.Save(); err != nil {
		t.Fatal(err)
	}

	var asked []string
	var out strings.Builder
	// Decline, so nothing actually runs; what matters is what would have.
	err = Uninstall("", "", false, &out, func(cmd string) bool { asked = append(asked, cmd); return false })
	if err != nil {
		t.Fatal(err)
	}
	if len(asked) != 1 || !strings.Contains(asked[0], "plugin uninstall pbip@power-bi-agentic-development --scope project") {
		t.Errorf("expected the host to be asked to uninstall the plugin in its scope, got %q", asked)
	}
	// Declined means the plugin is still there, so the record must survive —
	// otherwise dashkit could never remove it later.
	left, _ := state.Load()
	if len(left.Installs) != 1 || len(left.Installs[0].Plugins) != 1 {
		t.Fatalf("a declined plugin removal must stay on record, got %+v", left.Installs)
	}

	// Approving on the next run clears it, even though the fake host fails:
	// only a successful removal may drop the record.
	if err := Uninstall("", "", false, &out, func(string) bool { return true }); err != nil {
		t.Fatal(err)
	}
	if left, _ := state.Load(); len(left.Installs) != 1 {
		t.Errorf("a failed removal must also stay on record, got %d records", len(left.Installs))
	}
}

// TestMain lets this test binary stand in for a host CLI that always
// succeeds: re-executed with DASHKIT_FAKE_HOST=1, it exits before any test runs.
func TestMain(m *testing.M) {
	if os.Getenv("DASHKIT_FAKE_HOST") == "1" {
		os.Exit(0)
	}
	os.Exit(m.Run())
}

func TestTheLastPluginOutCleansUpTheMarketplace(t *testing.T) {
	home.SetRoot(t.TempDir())
	t.Cleanup(func() { home.SetRoot("") })
	t.Setenv("DASHKIT_FAKE_HOST", "1")

	dir := t.TempDir()
	plugin := func(name string, owns bool) state.Plugin {
		return state.Plugin{
			Host: "claude", Bin: os.Args[0], Ref: name + "@power-bi-agentic-development",
			Marketplace: "power-bi-agentic-development", Scope: "project", Dir: dir, OwnsMarketplace: owns,
		}
	}
	st, _ := state.Load()
	st.Record(state.Install{Bundle: "goblin-pbip", Target: "claude", Scope: "project", ProjectAt: dir,
		Plugins: []state.Plugin{plugin("pbip", true)}})
	st.Record(state.Install{Bundle: "goblin-reports", Target: "claude", Scope: "project", ProjectAt: dir,
		Plugins: []state.Plugin{plugin("reports", false)}})
	if err := st.Save(); err != nil {
		t.Fatal(err)
	}

	var asked []string
	approve := func(cmd string) bool { asked = append(asked, cmd); return true }
	var out strings.Builder

	// The owner leaves first while reports still needs the marketplace.
	if err := Uninstall("goblin-pbip", "", false, &out, approve); err != nil {
		t.Fatal(err)
	}
	for _, cmd := range asked {
		if strings.Contains(cmd, "marketplace remove") {
			t.Fatalf("removed a marketplace another plugin still uses: %q", cmd)
		}
	}
	left, _ := state.Load()
	if len(left.Installs) != 1 || !left.Installs[0].Plugins[0].OwnsMarketplace {
		t.Fatalf("ownership should pass to the remaining plugin, got %+v", left.Installs)
	}

	// Now the last one goes, and takes the declaration with it.
	asked = nil
	if err := Uninstall("goblin-reports", "", false, &out, approve); err != nil {
		t.Fatal(err)
	}
	removed := false
	for _, cmd := range asked {
		if strings.Contains(cmd, "plugin marketplace remove power-bi-agentic-development --scope project") {
			removed = true
		}
	}
	if !removed {
		t.Errorf("the last plugin out should remove the marketplace dashkit added; asked %q", asked)
	}
}

func TestAMarketplaceTheUserDeclaredIsNeverRemoved(t *testing.T) {
	home.SetRoot(t.TempDir())
	t.Cleanup(func() { home.SetRoot("") })
	t.Setenv("DASHKIT_FAKE_HOST", "1")

	dir := t.TempDir()
	st, _ := state.Load()
	st.Record(state.Install{Bundle: "goblin-pbip", Target: "claude", Scope: "project", ProjectAt: dir,
		Plugins: []state.Plugin{{Host: "claude", Bin: os.Args[0], Ref: "pbip@power-bi-agentic-development",
			Marketplace: "power-bi-agentic-development", Scope: "project", Dir: dir, OwnsMarketplace: false}}})
	_ = st.Save()

	var asked []string
	var out strings.Builder
	_ = Uninstall("", "", false, &out, func(cmd string) bool { asked = append(asked, cmd); return true })
	for _, cmd := range asked {
		if strings.Contains(cmd, "marketplace remove") {
			t.Errorf("removed a marketplace the user had declared: %q", cmd)
		}
	}
}

// data-goblin's hooks exit 0 when jq is missing, so a bundle that ships hooks
// without requiring jq would install guardrails that silently never run.
func TestEveryBundleWithHooksRequiresJq(t *testing.T) {
	for _, b := range catalog.Bundles() {
		if len(b.Hooks) == 0 {
			continue
		}
		found := false
		for _, id := range b.Prereqs.Required {
			if id == "jq" {
				found = true
			}
		}
		if !found {
			t.Errorf("%s ships hooks but does not require jq; its guardrails would silently do nothing", b.ID)
		}
	}
}

// Saying no to one step skips it; the rest of the run carries on.
func TestADeclinedStepIsSkippedNotFatal(t *testing.T) {
	home.SetRoot(t.TempDir())
	t.Cleanup(func() { home.SetRoot("") })

	claude, err := targets.Find("claude")
	if err != nil {
		t.Fatal(err)
	}
	b, _ := catalog.Find("goblin-pbip")
	built := &Built{Steps: []Step{{Bundle: b, Target: claude, Plan: plan.Plan{plan.PluginInstall{
		Host: "claude", Bin: "dashkit-test-no-such-host", MarketplaceRepo: "data-goblin/power-bi-agentic-development",
		Marketplace: "power-bi-agentic-development", Plugin: "pbip", Scope: "project", Dir: t.TempDir(),
	}}}}}
	req := Request{Bundles: []catalog.Bundle{b}, Targets: []targets.Target{claude}, Scope: targets.Project, ProjectDir: t.TempDir()}

	var out strings.Builder
	report, err := Apply(req, built, &out, func(string) bool { return false })
	if err != nil {
		t.Fatalf("declining should not fail the run: %v", err)
	}
	if len(report.Skipped) != 1 || report.Skipped[0].Skipped != "you declined it" {
		t.Errorf("expected the step to be reported as declined, got %+v", report.Skipped)
	}
	if strings.Contains(out.String(), "!") {
		t.Errorf("a decision should not be printed as an error:\n%s", out.String())
	}
	if len(report.Installed) != 0 {
		t.Error("nothing should be recorded as installed")
	}
}
