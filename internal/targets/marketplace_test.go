package targets

import (
	"errors"
	"testing"

	"github.com/leonsang/dashkit/internal/catalog"
	"github.com/leonsang/dashkit/internal/plan"
)

// pretend makes exactly the named host CLIs look installed.
func pretend(t *testing.T, installed ...string) {
	t.Helper()
	have := map[string]bool{}
	for _, name := range installed {
		have[name] = true
	}
	real := lookPath
	lookPath = func(name string) (string, error) {
		if have[name] {
			return "/fake/bin/" + name, nil
		}
		return "", errors.New("not found")
	}
	t.Cleanup(func() { lookPath = real })
}

func goblin(t *testing.T) catalog.Bundle {
	t.Helper()
	b, err := catalog.Find("goblin-pbip")
	if err != nil {
		t.Fatal(err)
	}
	if !b.IsMarketplace() || b.Marketplace == nil {
		t.Fatal("goblin-pbip should be a marketplace bundle")
	}
	return b
}

func TestClaudeInstallsMarketplacePluginsInTheRequestedScope(t *testing.T) {
	pretend(t, "claude")
	b := goblin(t)

	p, err := claudeCode{}.PlanMarketplace(b, Options{Scope: Project, ProjectDir: "/work/report"})
	if err != nil {
		t.Fatal(err)
	}
	install, ok := p[0].(plan.PluginInstall)
	if !ok || len(p) != 1 {
		t.Fatalf("want one PluginInstall, got %#v", p)
	}
	if install.Scope != "project" || install.Dir != "/work/report" {
		t.Errorf("a project install must stay in the project, got scope=%q dir=%q", install.Scope, install.Dir)
	}
	if install.Plugin != "pbip" || install.MarketplaceRepo != "data-goblin/power-bi-agentic-development" {
		t.Errorf("wrong plugin reference: %+v", install)
	}

	p, err = claudeCode{}.PlanMarketplace(b, Options{Scope: Global})
	if err != nil {
		t.Fatal(err)
	}
	if got := p[0].(plan.PluginInstall); got.Scope != "user" || got.Dir != "" {
		t.Errorf("a global install belongs to the user scope, got %+v", got)
	}
}

func TestClaudeWithoutItsCLICannotTakeAMarketplaceBundle(t *testing.T) {
	pretend(t)
	if _, err := (claudeCode{}).PlanMarketplace(goblin(t), Options{Scope: Project}); err == nil {
		t.Error("expected an error when the claude CLI is missing")
	}
}

func TestCopilotNeverTurnsAProjectInstallIntoAUserOne(t *testing.T) {
	pretend(t, "copilot")
	if _, err := (copilotCLI{}).PlanMarketplace(goblin(t), Options{Scope: Project}); err == nil {
		t.Error("Copilot CLI plugins are per user; a project request must be refused, not widened")
	}
	if _, err := (copilotCLI{}).PlanMarketplace(goblin(t), Options{Scope: Global}); err != nil {
		t.Errorf("a global request should be fine: %v", err)
	}
}

func TestOnlyHostsWithAPluginManagerTakeMarketplaceBundles(t *testing.T) {
	for _, target := range All() {
		_, ok := target.(MarketplacePlanner)
		want := target.ID() == "claude" || target.ID() == "copilot-cli"
		if ok != want {
			t.Errorf("%s: MarketplacePlanner = %v, want %v", target.ID(), ok, want)
		}
	}
}
