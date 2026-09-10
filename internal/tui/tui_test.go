package tui

import (
	"context"
	"strings"
	"testing"

	"github.com/leonsang/fabkit/internal/home"
)

// The wizard needs a TTY to run, but its screens are pure functions of the
// model, so they can be rendered and driven headlessly. This catches the class
// of bug that only shows up when someone actually opens the wizard.
func TestEveryScreenRenders(t *testing.T) {
	home.SetRoot(t.TempDir())
	t.Cleanup(func() { home.SetRoot("") })

	m := newModel(context.Background(), "test")
	for s := stepBundles; s <= stepOptions; s++ {
		m.step = s
		m.cursor = 0
		view := m.View()
		if !strings.Contains(view, "fabkit") {
			t.Errorf("step %d rendered without a header:\n%s", s, view)
		}
		if strings.TrimSpace(view) == "" {
			t.Errorf("step %d rendered nothing", s)
		}
		// Moving the cursor to the last item must stay in range.
		for i := 0; i < m.itemCount()+2; i++ {
			m.cursor = min(m.cursor+1, m.itemCount()-1)
			m.toggle()
		}
		if m.cursor >= m.itemCount() && m.itemCount() > 0 {
			t.Errorf("step %d: cursor escaped the list", s)
		}
	}
}

func TestReviewReportsWhenNothingIsSelected(t *testing.T) {
	home.SetRoot(t.TempDir())
	t.Cleanup(func() { home.SetRoot("") })

	m := newModel(context.Background(), "test")
	m.bundlePick = map[int]bool{}
	m.toolPick = map[int]bool{}
	m.build()
	if m.err == nil {
		t.Fatal("expected an error when no bundle or tool is picked")
	}

	m.step = stepReview
	if view := m.View(); !strings.Contains(view, "pick at least one") {
		t.Errorf("review screen hides the error:\n%s", view)
	}
}

func min(a, b int) int {
	if a < b {
		return a
	}
	return b
}
