// Package install turns a user's choices into a concrete plan and applies it.
// The wizard and the flag-driven CLI both go through here, so `--dry-run`,
// `--yes` and the TUI can never drift apart in behaviour.
package install

import (
	"context"
	"errors"
	"fmt"
	"io"
	"os"
	"strings"
	"time"

	"github.com/leonsang/dashkit/internal/backup"
	"github.com/leonsang/dashkit/internal/catalog"
	"github.com/leonsang/dashkit/internal/pathenv"
	"github.com/leonsang/dashkit/internal/plan"
	"github.com/leonsang/dashkit/internal/prereq"
	"github.com/leonsang/dashkit/internal/source"
	"github.com/leonsang/dashkit/internal/state"
	"github.com/leonsang/dashkit/internal/targets"
)

// Request is one invocation's worth of choices.
type Request struct {
	Bundles          []catalog.Bundle
	Targets          []targets.Target
	Scope            targets.Scope
	ProjectDir       string
	MCP              bool
	PreferHostPlugin bool
	WithPrereqs      bool
	DryRun           bool
	// SourceDir uses a local checkout instead of downloading the pinned tree.
	SourceDir string
	// Refresh forces a re-download even when the cache is warm.
	Refresh bool
	// SkipPrereqCheck omits the prerequisite probes, which shell out and are the
	// slowest part of planning.
	SkipPrereqCheck bool
}

// Step is one bundle applied to one target.
type Step struct {
	Bundle catalog.Bundle
	Target targets.Target
	Plan   plan.Plan
	// Skipped explains why a combination produced no work.
	Skipped string
}

// Built is a plan ready to show or apply.
type Built struct {
	Steps   []Step
	Prereqs []prereq.Result
	Tree    *source.Tree
}

// Build resolves the source tree, checks prerequisites and plans every
// bundle/target pair without touching the disk.
func Build(ctx context.Context, req Request) (*Built, error) {
	// Only vendored bundles need the upstream tree; a run that only hands
	// plugins to host plugin managers should not download anything.
	var tree *source.Tree
	if needsTree(req.Bundles) {
		var err error
		if req.SourceDir != "" {
			tree, err = source.Local(req.SourceDir)
		} else {
			tree, err = source.Get(ctx, catalog.Load().Source, req.Refresh)
		}
		if err != nil {
			return nil, err
		}
	}

	built := &Built{Tree: tree}
	if !req.SkipPrereqCheck {
		built.Prereqs = prereq.ForBundles(req.Bundles)
	}

	opts := targets.Options{
		Scope:            req.Scope,
		ProjectDir:       req.ProjectDir,
		Tree:             tree,
		MCP:              req.MCP,
		PreferHostPlugin: req.PreferHostPlugin,
	}

	for _, b := range req.Bundles {
		for _, t := range req.Targets {
			if b.IsMarketplace() {
				built.Steps = append(built.Steps, planMarketplace(b, t, opts))
				continue
			}
			if !t.SupportsScope(req.Scope) {
				built.Steps = append(built.Steps, Step{
					Bundle: b, Target: t,
					Skipped: fmt.Sprintf("%s has no %s-scope install; re-run with --scope %s",
						t.Title(), req.Scope, otherScope(req.Scope)),
				})
				continue
			}
			p, err := t.Plan(b, opts)
			if err != nil {
				return nil, fmt.Errorf("plan %s for %s: %w", b.ID, t.ID(), err)
			}
			built.Steps = append(built.Steps, Step{Bundle: b, Target: t, Plan: p})
		}
	}
	return built, nil
}

// planMarketplace routes a marketplace bundle to the host's plugin manager. A
// host that cannot take it is a skip with a reason, never an error: the other
// tools in the same run should still get their install.
func planMarketplace(b catalog.Bundle, t targets.Target, opts targets.Options) Step {
	mp, ok := t.(targets.MarketplacePlanner)
	if !ok {
		return Step{Bundle: b, Target: t, Skipped: fmt.Sprintf(
			"%s has no plugin manager, and %s is licensed %s by %s, which does not allow copying its skills into another tool; install it from Claude Code or Copilot CLI",
			t.Title(), b.Title, b.Credit.License, b.Credit.Author)}
	}
	p, err := mp.PlanMarketplace(b, opts)
	if err != nil {
		return Step{Bundle: b, Target: t, Skipped: err.Error()}
	}
	return Step{Bundle: b, Target: t, Plan: p}
}

func needsTree(bundles []catalog.Bundle) bool {
	for _, b := range bundles {
		if !b.IsMarketplace() {
			return true
		}
	}
	return false
}

func otherScope(s targets.Scope) targets.Scope {
	if s == targets.Project {
		return targets.Global
	}
	return targets.Project
}

// Report summarises an applied install.
type Report struct {
	Installed []state.Install
	Skipped   []Step
	BackupDir string
	Hints     []string
	// Notices are things the person has to act on for the install to work,
	// shown before the hints — above all, restarting tools that were already
	// running when a prerequisite was installed.
	Notices []string
}

// Apply executes the plan, recording what was written so uninstall can undo it.
// confirm is asked before any command runs; pass nil to decline everything.
func Apply(req Request, built *Built, out io.Writer, confirm func(string) bool) (*Report, error) {
	session := backup.NewSession()
	st, err := state.Load()
	if err != nil {
		return nil, err
	}

	report := &Report{}
	log := func(line string) { fmt.Fprintf(out, "  %s\n", line) }

	if req.WithPrereqs && !req.DryRun {
		report.Notices = append(report.Notices, installPrereqs(built.Prereqs, out, confirm)...)
	}

	seenHint := map[string]bool{}
	for _, step := range built.Steps {
		if step.Skipped != "" {
			report.Skipped = append(report.Skipped, step)
			continue
		}
		fmt.Fprintf(out, "\n%s -> %s\n", step.Bundle.Title, step.Target.Title())

		record := state.Install{
			Bundle:  step.Bundle.ID,
			Target:  step.Target.ID(),
			Scope:   string(req.Scope),
			Ref:     recordRef(step.Bundle, built.Tree),
			Version: catalog.Load().Source.UpstreamVersion,
			At:      time.Now().UTC(),
		}
		if req.Scope == targets.Project {
			record.ProjectAt = req.ProjectDir
		}

		env := &plan.Env{
			DryRun:  req.DryRun,
			Backup:  session,
			Record:  &record,
			Log:     log,
			Confirm: confirm,
			Out:     out,
		}
		if err := step.Plan.Apply(env); err != nil {
			// Saying no to a step skips that step; it does not abort the run.
			if errors.Is(err, plan.ErrDeclined) {
				step.Skipped = "you declined it"
				report.Skipped = append(report.Skipped, step)
				fmt.Fprintf(out, "  - skipped: you declined\n")
				continue
			}
			return report, err
		}
		if !req.DryRun {
			record.BackupDir = session.Dir()
			st.Record(record)
			report.Installed = append(report.Installed, record)
		}

		key := step.Target.ID()
		if !seenHint[key] {
			seenHint[key] = true
			report.Hints = append(report.Hints, fmt.Sprintf("%s: %s", step.Target.Title(), step.Target.Hint(targets.Options{
				Scope: req.Scope, ProjectDir: req.ProjectDir,
			})))
		}
	}

	if !req.DryRun {
		if err := st.Save(); err != nil {
			return report, err
		}
	}
	report.BackupDir = session.Dir()
	return report, nil
}

// installPrereqs runs the fix command for anything missing, one at a time, with
// the exact command shown first, and returns notices the person must act on.
func installPrereqs(results []prereq.Result, out io.Writer, confirm func(string) bool) []string {
	var installed []prereq.Result
	for _, r := range prereq.Unmet(results) {
		if len(r.Fix) == 0 {
			fmt.Fprintf(out, "  - %s is %s; dashkit does not install it automatically\n", r.Title, r.Status)
			if r.Manual != "" {
				fmt.Fprintf(out, "    %s\n", r.Manual)
			}
			continue
		}
		action := plan.Run{Name: r.Fix[0], Args: r.Fix[1:], Why: "install " + shortName(r)}
		env := &plan.Env{
			Log:     func(line string) { fmt.Fprintf(out, "  %s\n", line) },
			Backup:  backup.NewSession(),
			Confirm: confirm,
			Out:     out,
		}
		err := action.Apply(env)
		switch {
		case errors.Is(err, plan.ErrDeclined):
			fmt.Fprintf(out, "  - skipped %s: you declined\n", shortName(r))
		case err != nil:
			// A failed prerequisite is worth reporting but should not abort the
			// skills install: the skills are still useful, just not everything
			// they describe will run yet.
			fmt.Fprintf(out, "  ! could not install %s: %v\n", shortName(r), err)
		default:
			installed = append(installed, r)
		}
	}
	return afterPrereqs(installed, out)
}

// afterPrereqs re-checks what was just installed with a freshly loaded PATH,
// and explains the one thing that trips everyone up: programs that were
// already running keep their old PATH, so an open Claude Code would not see a
// new jq and its hooks would silently do nothing until it is restarted.
func afterPrereqs(installed []prereq.Result, out io.Writer) []string {
	if len(installed) == 0 {
		return nil
	}
	if err := pathenv.Refresh(); err != nil {
		fmt.Fprintf(out, "  ! could not reload PATH: %v\n", err)
	}
	ids := make([]string, len(installed))
	names := make([]string, len(installed))
	for i, r := range installed {
		ids[i], names[i] = r.ID, shortName(r)
	}
	var notices, stillMissing []string
	for _, r := range prereq.Run(ids, nil) {
		if r.Status != prereq.OK {
			stillMissing = append(stillMissing, shortName(r))
		}
	}
	notices = append(notices, fmt.Sprintf(
		"Installed %s. Restart any AI tool or terminal that was already open — it keeps the old PATH and won't see %s until it restarts.",
		strings.Join(names, ", "), plural(len(names), "it", "them")))
	if len(stillMissing) > 0 {
		notices = append(notices, fmt.Sprintf(
			"%s installed but still not found on PATH; open a new terminal and run `dashkit doctor`.",
			strings.Join(stillMissing, ", ")))
	}
	return notices
}

// shortName is a prerequisite's bare name, for sentences: "jq", not "jq
// (guardrail hooks depend on it)"; npm packages lose their "npm:" prefix.
func shortName(r prereq.Result) string {
	return strings.TrimPrefix(r.ID, "npm:")
}

func plural(n int, one, many string) string {
	if n == 1 {
		return one
	}
	return many
}

// releaseMarketplace removes a marketplace declaration once nothing dashkit
// installed needs it any more — but only one dashkit itself added. If another
// recorded plugin still uses it, the duty to remove it passes to that record,
// so whichever plugin goes last cleans up.
func releaseMarketplace(st *state.State, in state.Install, pl state.Plugin, env *plan.Env) {
	if !pl.OwnsMarketplace || pl.Marketplace == "" {
		return
	}
	for i := range st.Installs {
		if st.Installs[i].Key() == in.Key() {
			continue
		}
		for j := range st.Installs[i].Plugins {
			if st.Installs[i].Plugins[j].SameMarketplace(pl) {
				st.Installs[i].Plugins[j].OwnsMarketplace = true
				return
			}
		}
	}
	args := []string{"plugin", "marketplace", "remove", pl.Marketplace}
	if pl.Scope != "" {
		args = append(args, "--scope", pl.Scope)
	}
	action := plan.Run{Name: pl.Bin, Args: args, Dir: pl.Dir, Why: "remove the marketplace declaration dashkit added"}
	if err := action.Apply(env); err != nil {
		env.Log("! " + err.Error())
	}
}

// recordRef names what an install came from: the pinned upstream tree for a
// vendored bundle, the plugin reference for a marketplace one.
func recordRef(b catalog.Bundle, tree *source.Tree) string {
	if b.IsMarketplace() {
		return b.Marketplace.Plugin + "@" + b.Marketplace.Name
	}
	if tree == nil {
		return ""
	}
	return tree.Ref
}

// Uninstall removes what the recorded installs created: files dashkit wrote are
// deleted, surgical edits to other files are reverted in place, and plugins that
// a host's plugin manager installed are handed back to that host to remove.
func Uninstall(bundleID, targetID string, dryRun bool, out io.Writer, confirm func(string) bool) error {
	st, err := state.Load()
	if err != nil {
		return err
	}
	matches := st.Matching(bundleID, targetID)
	if len(matches) == 0 {
		fmt.Fprintln(out, "nothing recorded to uninstall")
		return nil
	}

	for _, in := range matches {
		fmt.Fprintf(out, "\n%s -> %s (%s)\n", in.Bundle, in.Target, in.Scope)
		for _, p := range in.Owned {
			fmt.Fprintf(out, "  remove %s\n", p)
			if dryRun {
				continue
			}
			if err := os.RemoveAll(p); err != nil {
				fmt.Fprintf(out, "  ! %v\n", err)
			}
		}
		for _, e := range in.Edits {
			fmt.Fprintf(out, "  revert %s in %s\n", e.Locator, e.Path)
			if dryRun {
				continue
			}
			if err := revert(e); err != nil {
				fmt.Fprintf(out, "  ! %v\n", err)
			}
		}
		// A plugin the host did not remove — declined, or the command failed —
		// stays on record, or dashkit would lose the only note that it exists.
		var remaining []state.Plugin
		for _, pl := range in.Plugins {
			args := []string{"plugin", "uninstall", pl.Ref}
			if pl.Scope != "" {
				args = append(args, "--scope", pl.Scope)
			}
			action := plan.Run{Name: pl.Bin, Args: args, Dir: pl.Dir, Why: "ask " + pl.Host + " to remove the plugin it installed"}
			env := &plan.Env{
				DryRun:  dryRun,
				Log:     func(line string) { fmt.Fprintf(out, "  %s\n", line) },
				Confirm: confirm,
				Out:     out,
			}
			if err := action.Apply(env); err != nil {
				if errors.Is(err, plan.ErrDeclined) {
					fmt.Fprintf(out, "  - left %s installed: you declined\n", pl.Ref)
				} else {
					fmt.Fprintf(out, "  ! %v\n", err)
				}
				remaining = append(remaining, pl)
				continue
			}
			if !dryRun {
				releaseMarketplace(st, in, pl, env)
			}
		}
		if dryRun {
			continue
		}
		if len(remaining) > 0 {
			in.Owned, in.Edits, in.Plugins = nil, nil, remaining
			st.Record(in)
			fmt.Fprintf(out, "  %d plugin(s) still installed; kept on record so `dashkit uninstall` can try again\n", len(remaining))
			continue
		}
		st.Remove(in.Key())
	}
	if dryRun {
		return nil
	}
	return st.Save()
}
