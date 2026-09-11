package tui

import (
	"context"
	"os"
	"path/filepath"
	"testing"

	tea "github.com/charmbracelet/bubbletea"
	"github.com/charmbracelet/lipgloss"
	"github.com/muesli/termenv"
)

// TestScreens walks the wizard through a real session with the same keys a
// person would press, and writes every screen it draws — the exact View()
// output bubbletea prints to the terminal — as an ANSI file, for documentation
// screenshots. It reads the real machine (detection, prerequisites, the
// upstream tree) but stops at the review screen, so it never installs anything.
//
//	DASHKIT_SCREENS=out/ DASHKIT_SCREENS_PROJECT=path/to/project DASHKIT_SCREENS_VERSION=0.2.1 \n//		go test ./internal/tui -run TestScreens
func TestScreens(t *testing.T) {
	out := os.Getenv("DASHKIT_SCREENS")
	project := os.Getenv("DASHKIT_SCREENS_PROJECT")
	if out == "" || project == "" {
		t.Skip("set DASHKIT_SCREENS and DASHKIT_SCREENS_PROJECT to render wizard screens")
	}
	if err := os.MkdirAll(out, 0o755); err != nil {
		t.Fatal(err)
	}
	// The wizard plans against the working directory, like the real binary.
	here, _ := os.Getwd()
	if err := os.Chdir(project); err != nil {
		t.Fatal(err)
	}
	t.Cleanup(func() { os.Chdir(here) })

	// Not a terminal here, so lipgloss would strip colour; a real terminal keeps it.
	lipgloss.SetColorProfile(termenv.TrueColor)

	version := os.Getenv("DASHKIT_SCREENS_VERSION")
	if version == "" {
		version = "dev"
	}
	m := newModel(context.Background(), version)
	shot := func(name string) {
		t.Helper()
		if err := os.WriteFile(filepath.Join(out, name+".ansi"), []byte(m.View()), 0o644); err != nil {
			t.Fatal(err)
		}
	}
	press := func(keys ...tea.KeyMsg) {
		for _, k := range keys {
			m.Update(k)
		}
	}
	down := tea.KeyMsg{Type: tea.KeyDown}
	space := tea.KeyMsg{Type: tea.KeySpace, Runes: []rune{' '}}
	enter := tea.KeyMsg{Type: tea.KeyEnter}

	shot("01-skills")
	// Add the PBIP guardrails: five rows down from Power BI authoring.
	press(down, down, down, down, down, space)
	shot("02-skills-guardrails")
	press(enter)
	shot("03-tools")
	press(enter)
	shot("04-scope")
	press(enter)
	shot("05-options")
	press(enter) // plans the install against the project; nothing is written
	if m.err != nil {
		t.Fatalf("planning failed: %v", m.err)
	}
	shot("06-review")
}
