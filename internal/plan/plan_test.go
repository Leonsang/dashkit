package plan

import (
	"errors"
	"strings"
	"testing"

	"github.com/leonsang/dashkit/internal/state"
)

func pluginInstall() PluginInstall {
	return PluginInstall{
		Host: "claude", Bin: "dashkit-test-no-such-host",
		MarketplaceRepo: "data-goblin/power-bi-agentic-development",
		Marketplace:     "power-bi-agentic-development", Plugin: "pbip",
		Scope: "project", Dir: ".", AssumeYes: true,
	}
}

func TestDryRunListsEveryPluginCommand(t *testing.T) {
	var logged []string
	env := &Env{DryRun: true, Log: func(l string) { logged = append(logged, l) }}
	if err := pluginInstall().Apply(env); err != nil {
		t.Fatal(err)
	}
	all := strings.Join(logged, "\n")
	for _, want := range []string{
		"$ dashkit-test-no-such-host plugin marketplace add data-goblin/power-bi-agentic-development --scope project",
		"$ dashkit-test-no-such-host plugin install pbip@power-bi-agentic-development --scope project --yes",
	} {
		if !strings.Contains(all, want) {
			t.Errorf("dry run should show %q, got:\n%s", want, all)
		}
	}
}

func TestAPluginIsApprovedOnceForBothCommands(t *testing.T) {
	var asked []string
	rec := &state.Install{}
	env := &Env{
		Log:     func(string) {},
		Record:  rec,
		Confirm: func(q string) bool { asked = append(asked, q); return false },
	}
	err := pluginInstall().Apply(env)
	if !errors.Is(err, ErrDeclined) {
		t.Fatalf("declining should return ErrDeclined, got %v", err)
	}
	if len(asked) != 1 {
		t.Fatalf("expected one question covering both commands, got %d: %q", len(asked), asked)
	}
	if !strings.Contains(asked[0], "marketplace add") || !strings.Contains(asked[0], "plugin install") {
		t.Errorf("the single question should cover both commands, got %q", asked[0])
	}
	if len(rec.Plugins) != 0 {
		t.Error("a declined plugin must not be recorded as installed")
	}
}
