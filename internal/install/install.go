// Package install turns a user's choices into a concrete plan and applies it.
// The wizard and the flag-driven CLI both go through here, so `--dry-run`,
// `--yes` and the TUI can never drift apart in behaviour.
package install

import (
	"context"
	"fmt"
	"io"
	"os"
	"sort"
	"time"

	"github.com/leonsang/fabkit/internal/backup"
	"github.com/leonsang/fabkit/internal/catalog"
	"github.com/leonsang/fabkit/internal/plan"
	"github.com/leonsang/fabkit/internal/prereq"
	"github.com/leonsang/fabkit/internal/source"
	"github.com/leonsang/fabkit/internal/state"
	"github.com/leonsang/fabkit/internal/targets"
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
	var (
		tree *source.Tree
		err  error
	)
	if req.SourceDir != "" {
		tree, err = source.Local(req.SourceDir)
	} else {
		tree, err = source.Get(ctx, catalog.Load().Source, req.Refresh)
	}
	if err != nil {
		return nil, err
	}

	built := &Built{Tree: tree}
	if !req.SkipPrereqCheck {
		built.Prereqs = prereq.Run(prereqIDs(req.Bundles))
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

func otherScope(s targets.Scope) targets.Scope {
	if s == targets.Project {
		return targets.Global
	}
	return targets.Project
}

// prereqIDs collects the required and optional prerequisites of every bundle,
// required first, without duplicates.
func prereqIDs(bundles []catalog.Bundle) []string {
	var required, optional []string
	seen := map[string]bool{}
	add := func(dst *[]string, ids []string) {
		for _, id := range ids {
			if seen[id] {
				continue
			}
			seen[id] = true
			*dst = append(*dst, id)
		}
	}
	for _, b := range bundles {
		add(&required, b.Prereqs.Required)
	}
	for _, b := range bundles {
		add(&optional, b.Prereqs.Optional)
	}
	sort.Strings(required)
	sort.Strings(optional)
	return append(required, optional...)
}

// Report summarises an applied install.
type Report struct {
	Installed []state.Install
	Skipped   []Step
	BackupDir string
	Hints     []string
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
		if err := installPrereqs(built.Prereqs, out, confirm); err != nil {
			return nil, err
		}
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
			Ref:     built.Tree.Ref,
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
		}
		if err := step.Plan.Apply(env); err != nil {
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
// the exact command shown first.
func installPrereqs(results []prereq.Result, out io.Writer, confirm func(string) bool) error {
	for _, r := range prereq.Blocking(results) {
		if len(r.Fix) == 0 {
			fmt.Fprintf(out, "  ! %s is %s and fabkit has no installer for this OS\n", r.Title, r.Status)
			if r.Manual != "" {
				fmt.Fprintf(out, "    %s\n", r.Manual)
			}
			continue
		}
		action := plan.Run{Name: r.Fix[0], Args: r.Fix[1:], Why: "install " + r.Title}
		env := &plan.Env{
			Log:     func(line string) { fmt.Fprintf(out, "  %s\n", line) },
			Backup:  backup.NewSession(),
			Confirm: confirm,
		}
		if err := action.Apply(env); err != nil {
			// A failed prerequisite is worth reporting but should not abort the
			// skills install: the skills are still useful, just not everything
			// they describe will run yet.
			fmt.Fprintf(out, "  ! could not install %s: %v\n", r.Title, err)
		}
	}
	return nil
}

// Uninstall removes what the recorded installs created, restoring edited files
// from their backups where fabkit only changed part of a file.
func Uninstall(bundleID, targetID string, dryRun bool, out io.Writer) error {
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
		if !dryRun {
			st.Remove(in.Key())
		}
	}
	if dryRun {
		return nil
	}
	return st.Save()
}
