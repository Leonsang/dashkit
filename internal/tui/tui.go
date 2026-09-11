// Package tui is the wizard: the same install core as the flags, driven by
// arrow keys. It holds no logic of its own — every screen just fills in one
// field of an install.Request, and the review screen shows exactly what will
// happen before anything is written.
package tui

import (
	"context"
	"fmt"
	"os"
	"strings"

	tea "github.com/charmbracelet/bubbletea"
	"github.com/charmbracelet/lipgloss"

	"github.com/leonsang/dashkit/internal/catalog"
	"github.com/leonsang/dashkit/internal/install"
	"github.com/leonsang/dashkit/internal/plan"
	"github.com/leonsang/dashkit/internal/prereq"
	"github.com/leonsang/dashkit/internal/targets"
)

// scopes is the order the wizard offers them in: project first, because it is
// the default and the one that keeps skills out of unrelated sessions.
var scopes = []targets.Scope{targets.Project, targets.Global}

type step int

const (
	stepBundles step = iota
	stepTargets
	stepScope
	stepOptions
	stepReview
	stepRunning
	stepDone
)

var (
	titleStyle = lipgloss.NewStyle().Bold(true)
	dimStyle   = lipgloss.NewStyle().Faint(true)
	warnStyle  = lipgloss.NewStyle().Foreground(lipgloss.Color("3"))
	okStyle    = lipgloss.NewStyle().Foreground(lipgloss.Color("2"))
	errStyle   = lipgloss.NewStyle().Foreground(lipgloss.Color("1"))
)

type model struct {
	version string
	ctx     context.Context

	step   step
	cursor int

	bundles     []catalog.Bundle
	bundlePick  map[int]bool
	tools       []targets.Target
	toolFound   []targets.Detection
	toolPick    map[int]bool
	scope       targets.Scope
	mcp         bool
	prereqs     bool
	hostPlugin  bool
	experiments bool

	built  *install.Built
	logs   []string
	report *install.Report
	err    error

	events chan tea.Msg
	quit   bool
}

// Run starts the wizard.
func Run(ctx context.Context, version string) error {
	m := newModel(ctx, version)
	_, err := tea.NewProgram(m, tea.WithContext(ctx)).Run()
	return err
}

func newModel(ctx context.Context, version string) *model {
	m := &model{
		version:    version,
		ctx:        ctx,
		bundles:    catalog.Bundles(),
		bundlePick: map[int]bool{},
		toolPick:   map[int]bool{},
		scope:      targets.Project,
		mcp:        true,
		prereqs:    true,
		hostPlugin: true,
		events:     make(chan tea.Msg, 64),
	}
	// The common case, preselected: Power BI authoring and the workflow that
	// guides its use — six skills between them, well inside the context budget.
	for i, b := range m.bundles {
		if b.ID == "powerbi-authoring" || b.ID == "pbi-sdd" {
			m.bundlePick[i] = true
		}
	}
	for i, t := range targets.All() {
		d := t.Detect()
		m.tools = append(m.tools, t)
		m.toolFound = append(m.toolFound, d)
		if d.Found && !t.Experimental() {
			m.toolPick[i] = true
		}
	}
	return m
}

func (m *model) Init() tea.Cmd { return nil }

func (m *model) Update(msg tea.Msg) (tea.Model, tea.Cmd) {
	switch msg := msg.(type) {
	case tea.KeyMsg:
		return m.key(msg)
	case logMsg:
		m.logs = append(m.logs, string(msg))
		return m, waitFor(m.events)
	case doneMsg:
		m.report, m.err = msg.report, msg.err
		m.step = stepDone
		return m, nil
	}
	return m, nil
}

func (m *model) key(msg tea.KeyMsg) (tea.Model, tea.Cmd) {
	switch msg.String() {
	case "ctrl+c", "q":
		if m.step != stepRunning {
			m.quit = true
			return m, tea.Quit
		}
	case "up", "k":
		if m.cursor > 0 {
			m.cursor--
		}
	case "down", "j":
		if m.cursor < m.itemCount()-1 {
			m.cursor++
		}
	case " ":
		m.toggle()
	case "left", "h", "esc":
		if m.step > stepBundles && m.step < stepRunning {
			m.step--
			m.cursor = 0
		}
	case "enter", "right", "l":
		return m.advance()
	}
	return m, nil
}

func (m *model) itemCount() int {
	switch m.step {
	case stepBundles:
		return len(m.bundles)
	case stepTargets:
		return len(m.tools)
	case stepScope:
		return 2
	case stepOptions:
		return 4
	default:
		return 0
	}
}

func (m *model) toggle() {
	switch m.step {
	case stepBundles:
		m.bundlePick[m.cursor] = !m.bundlePick[m.cursor]
	case stepTargets:
		m.toolPick[m.cursor] = !m.toolPick[m.cursor]
	case stepScope:
		m.scope = scopes[m.cursor]
	case stepOptions:
		switch m.cursor {
		case 0:
			m.mcp = !m.mcp
		case 1:
			m.prereqs = !m.prereqs
		case 2:
			m.hostPlugin = !m.hostPlugin
		case 3:
			m.experiments = !m.experiments
		}
	}
}

func (m *model) advance() (tea.Model, tea.Cmd) {
	switch m.step {
	case stepScope:
		m.scope = scopes[m.cursor]
	case stepReview:
		m.step = stepRunning
		return m, tea.Batch(m.start(), waitFor(m.events))
	case stepDone:
		m.quit = true
		return m, tea.Quit
	}
	if m.step < stepReview {
		m.step++
		m.cursor = 0
		if m.step == stepReview {
			m.build()
		}
	}
	return m, nil
}

func (m *model) request() install.Request {
	var bundles []catalog.Bundle
	for i, b := range m.bundles {
		if m.bundlePick[i] {
			bundles = append(bundles, b)
		}
	}
	var tools []targets.Target
	for i, t := range m.tools {
		if !m.toolPick[i] {
			continue
		}
		if t.Experimental() && !m.experiments {
			continue
		}
		tools = append(tools, t)
	}
	cwd, _ := os.Getwd()
	return install.Request{
		Bundles:          bundles,
		Targets:          tools,
		Scope:            m.scope,
		ProjectDir:       cwd,
		MCP:              m.mcp,
		PreferHostPlugin: m.hostPlugin,
		WithPrereqs:      m.prereqs,
	}
}

// build plans the install so the review screen can show real actions.
func (m *model) build() {
	req := m.request()
	if len(req.Bundles) == 0 || len(req.Targets) == 0 {
		m.err = fmt.Errorf("pick at least one bundle and one tool")
		return
	}
	built, err := install.Build(m.ctx, req)
	m.built, m.err = built, err
}

type logMsg string

type doneMsg struct {
	report *install.Report
	err    error
}

func waitFor(ch chan tea.Msg) tea.Cmd {
	return func() tea.Msg { return <-ch }
}

// start applies the plan on a goroutine, streaming each action into the view.
func (m *model) start() tea.Cmd {
	req := m.request()
	built := m.built
	events := m.events
	return func() tea.Msg {
		go func() {
			w := &channelWriter{ch: events}
			// The review screen listed every command, so approval has already
			// been given explicitly for this run.
			report, err := install.Apply(req, built, w, func(string) bool { return true })
			events <- doneMsg{report: report, err: err}
		}()
		return nil
	}
}

type channelWriter struct{ ch chan tea.Msg }

func (w *channelWriter) Write(p []byte) (int, error) {
	for _, line := range strings.Split(strings.TrimRight(string(p), "\n"), "\n") {
		if strings.TrimSpace(line) != "" {
			w.ch <- logMsg(line)
		}
	}
	return len(p), nil
}

func (m *model) View() string {
	if m.quit {
		return ""
	}
	var b strings.Builder
	fmt.Fprintf(&b, "%s %s\n%s\n\n",
		titleStyle.Render("dashkit"),
		dimStyle.Render(m.version),
		dimStyle.Render("Power BI & Fabric skills, set up right for your AI tools"))

	switch m.step {
	case stepBundles:
		b.WriteString(titleStyle.Render("1/5  Which skills?") + "\n\n")
		for i, bundle := range m.bundles {
			if i == 0 || bundle.Kind != m.bundles[i-1].Kind {
				if header := groupHeader(bundle.Kind); header != "" && i > 0 {
					b.WriteString("\n" + dimStyle.Render("  "+header) + "\n")
				}
			}
			detail := fmt.Sprintf("%d skills", len(bundle.Skills))
			if len(bundle.Skills) == 1 {
				detail = "1 skill"
			}
			if len(bundle.Hooks) > 0 {
				detail += " · guardrails"
			}
			fmt.Fprintf(&b, "%s\n", m.checkbox(i, m.bundlePick[i],
				fmt.Sprintf("%-24s %s", bundle.Title, dimStyle.Render(detail))))
		}
		if warning := install.ContextWarning(m.request().Bundles, m.scope); warning != "" {
			b.WriteString("\n  " + warnStyle.Render(wrap(warning, 76)) + "\n")
		}
	case stepTargets:
		b.WriteString(titleStyle.Render("2/5  Which AI tools?") + "\n\n")
		for i, t := range m.tools {
			label := t.Title()
			switch {
			case m.toolFound[i].Found:
				label += " " + okStyle.Render("(detected)")
			default:
				label += " " + dimStyle.Render("(not detected)")
			}
			if t.Experimental() {
				label += " " + warnStyle.Render("experimental")
			}
			fmt.Fprintf(&b, "%s\n", m.checkbox(i, m.toolPick[i], label))
		}
	case stepScope:
		b.WriteString(titleStyle.Render("3/5  Where?") + "\n\n")
		cwd, _ := os.Getwd()
		labels := []string{
			"This project — " + cwd,
			"Global — your user config, loaded in every session on this machine",
		}
		for i, label := range labels {
			fmt.Fprintf(&b, "%s\n", m.radio(i, m.scope == scopes[i], label))
		}
	case stepOptions:
		b.WriteString(titleStyle.Render("4/5  Options") + "\n\n")
		opts := []struct {
			on    bool
			label string
		}{
			{m.mcp, "Register MCP servers"},
			{m.prereqs, "Install missing prerequisites (Node, Azure CLI, Power BI CLIs)"},
			{m.hostPlugin, "Use the host's own plugin manager when it has one"},
			{m.experiments, "Include experimental targets"},
		}
		for i, o := range opts {
			fmt.Fprintf(&b, "%s\n", m.checkbox(i, o.on, o.label))
		}
	case stepReview:
		b.WriteString(titleStyle.Render("5/5  Review") + "\n\n")
		if m.err != nil {
			b.WriteString(errStyle.Render(m.err.Error()) + "\n")
			break
		}
		b.WriteString(m.reviewBody())
	case stepRunning, stepDone:
		b.WriteString(titleStyle.Render("Installing") + "\n\n")
		start := 0
		if len(m.logs) > 18 {
			start = len(m.logs) - 18
		}
		for _, line := range m.logs[start:] {
			b.WriteString(dimStyle.Render(line) + "\n")
		}
		if m.step == stepDone {
			b.WriteString("\n")
			if m.err != nil {
				b.WriteString(errStyle.Render("failed: "+m.err.Error()) + "\n")
			} else {
				b.WriteString(okStyle.Render("Done.") + "\n")
				for _, n := range m.report.Notices {
					fmt.Fprintf(&b, "  %s\n", warnStyle.Render(wrap("! "+n, 76)))
				}
				for _, h := range m.report.Hints {
					fmt.Fprintf(&b, "  %s %s\n", dimStyle.Render("next:"), h)
				}
			}
		}
	}

	b.WriteString("\n" + dimStyle.Render(m.help()) + "\n")
	return b.String()
}

func (m *model) reviewBody() string {
	var b strings.Builder
	var files, commands int
	for _, s := range m.built.Steps {
		if s.Skipped != "" {
			fmt.Fprintf(&b, "  %s %s -> %s: %s\n", warnStyle.Render("skip"), s.Bundle.ID, s.Target.ID(), s.Skipped)
			continue
		}
		fmt.Fprintf(&b, "  %s -> %s\n", s.Bundle.Title, s.Target.Title())
		// Pressing enter here approves every command at once, so each one is
		// listed in full — not summarised. Everything else writes a file.
		for _, a := range s.Plan {
			c, ok := a.(plan.Commander)
			if !ok {
				files++
				continue
			}
			for _, cmd := range c.Commands() {
				commands++
				fmt.Fprintf(&b, "      %s\n", warnStyle.Render("$ "+cmd))
			}
		}
	}

	if m.prereqs {
		if unmet := prereq.Unmet(m.built.Prereqs); len(unmet) > 0 {
			b.WriteString("\n  Prerequisites to install first:\n")
			for _, r := range unmet {
				if len(r.Fix) > 0 {
					fmt.Fprintf(&b, "      %s\n", warnStyle.Render(strings.Join(r.Fix, " ")))
					continue
				}
				fmt.Fprintf(&b, "      %s %s\n", r.Title, dimStyle.Render("(not installed automatically — "+r.Manual+")"))
			}
		}
	}

	if warning := install.ContextWarning(m.request().Bundles, m.scope); warning != "" {
		fmt.Fprintf(&b, "\n  %s\n", warnStyle.Render(wrap(warning, 74)))
	}

	fmt.Fprintf(&b, "\n  %s\n", dimStyle.Render(fmt.Sprintf(
		"%s, %s. Every file touched is backed up first.",
		count(files, "file change", "file changes"), count(commands, "command", "commands"))))
	return b.String()
}

func count(n int, one, many string) string {
	if n == 1 {
		return "1 " + one
	}
	return fmt.Sprintf("%d %s", n, many)
}

// groupHeader introduces each kind of bundle in the list, so where a bundle
// comes from — and how it gets installed — is visible before it is chosen.
func groupHeader(k catalog.Kind) string {
	switch k {
	case catalog.Builtin:
		return "from dashkit · a workflow over the skills above"
	case catalog.Marketplace:
		return "from data-goblin · installed through your tool's own plugin manager"
	}
	return ""
}

// wrap breaks a long line at word boundaries for the terminal, indenting the
// continuation lines to sit under the first.
func wrap(text string, width int) string {
	var lines []string
	line := ""
	for _, word := range strings.Fields(text) {
		if line != "" && len(line)+1+len(word) > width {
			lines = append(lines, line)
			line = word
			continue
		}
		if line != "" {
			line += " "
		}
		line += word
	}
	if line != "" {
		lines = append(lines, line)
	}
	return strings.Join(lines, "\n  ")
}

func (m *model) checkbox(i int, on bool, label string) string {
	mark := "[ ]"
	if on {
		mark = "[x]"
	}
	return m.line(i, mark+" "+label)
}

func (m *model) radio(i int, on bool, label string) string {
	mark := "( )"
	if on {
		mark = "(*)"
	}
	return m.line(i, mark+" "+label)
}

func (m *model) line(i int, text string) string {
	if m.cursor == i {
		return "> " + text
	}
	return "  " + text
}

func (m *model) help() string {
	switch m.step {
	case stepReview:
		return "enter install · esc back · q quit"
	case stepRunning:
		return "installing…"
	case stepDone:
		return "enter quit"
	default:
		return "↑↓ move · space toggle · enter next · esc back · q quit"
	}
}
