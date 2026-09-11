package cli

import (
	"fmt"
	"os"
	"strings"
	"text/tabwriter"

	"github.com/leonsang/dashkit/internal/catalog"
	"github.com/leonsang/dashkit/internal/install"
	"github.com/leonsang/dashkit/internal/prereq"
	"github.com/leonsang/dashkit/internal/state"
	"github.com/leonsang/dashkit/internal/targets"
	"github.com/spf13/cobra"
)

func doctorCmd() *cobra.Command {
	var bundles []string

	cmd := &cobra.Command{
		Use:   "doctor",
		Short: "Check prerequisites and detect installed AI tools (read-only)",
		RunE: func(cmd *cobra.Command, _ []string) error {
			resolved, err := catalog.Resolve(bundles)
			if err != nil {
				return err
			}

			fmt.Println("AI tools")
			w := tabwriter.NewWriter(os.Stdout, 0, 0, 2, ' ', 0)
			for _, t := range targets.All() {
				d := t.Detect()
				mark := "-"
				where := "not detected"
				if d.Found {
					mark = "+"
					where = d.Where
				}
				flags := ""
				if t.Experimental() {
					flags = " (experimental)"
				}
				if d.Note != "" {
					where += " — " + d.Note
				}
				fmt.Fprintf(w, "  %s %s%s\t%s\t%s\n", mark, t.Title(), flags, t.ID(), where)
			}
			w.Flush()

			fmt.Println("\nPrerequisites")
			results := prereq.ForBundles(resolved)
			w = tabwriter.NewWriter(os.Stdout, 0, 0, 2, ' ', 0)
			for _, r := range results {
				mark := "+"
				if r.Status != prereq.OK {
					mark = "-"
				}
				need := "optional"
				if r.Required {
					need = "required"
				}
				fmt.Fprintf(w, "  %s %s\t%s\t%s\t%s\n", mark, r.Title, need, r.Status, r.Detail)
			}
			w.Flush()

			if unmet := prereq.Unmet(results); len(unmet) > 0 {
				fmt.Println("\nTo fix:")
				for _, r := range unmet {
					if len(r.Fix) > 0 {
						fmt.Printf("  %s\n", strings.Join(r.Fix, " "))
						continue
					}
					if r.Manual != "" {
						fmt.Printf("  %s: %s\n", r.Title, r.Manual)
					}
				}
				fmt.Println("\nOr let dashkit install what it can: dashkit install --with-prereqs")
			}

			// Only a missing *required* prerequisite is a failure; optional ones
			// are information, and must not break a script that runs doctor.
			if blocking := prereq.Blocking(results); len(blocking) > 0 {
				return fmt.Errorf("%d required prerequisite(s) missing", len(blocking))
			}
			fmt.Println("\nEverything the selected bundles require is present.")
			return nil
		},
	}
	cmd.Flags().StringSliceVarP(&bundles, "bundle", "b", []string{"powerbi-authoring"}, "which bundles' prerequisites to check")
	return cmd
}

func listCmd() *cobra.Command {
	var showTargets bool

	cmd := &cobra.Command{
		Use:   "list",
		Short: "List the bundles (and with --targets, the supported AI tools)",
		RunE: func(*cobra.Command, []string) error {
			if showTargets {
				w := tabwriter.NewWriter(os.Stdout, 0, 0, 2, ' ', 0)
				fmt.Fprintln(w, "ID\tTOOL\tSCOPES\tSTATUS")
				for _, t := range targets.All() {
					scopes := []string{}
					for _, s := range []targets.Scope{targets.Global, targets.Project} {
						if t.SupportsScope(s) {
							scopes = append(scopes, string(s))
						}
					}
					status := "verified"
					if t.Experimental() {
						status = "experimental"
					}
					fmt.Fprintf(w, "%s\t%s\t%s\t%s\n", t.ID(), t.Title(), strings.Join(scopes, ","), status)
				}
				return w.Flush()
			}

			m := catalog.Load()
			fmt.Printf("Microsoft bundles pinned to %s @ %s\n\n", m.Source.Repo, m.Source.Ref)
			w := tabwriter.NewWriter(os.Stdout, 0, 0, 2, ' ', 0)
			fmt.Fprintln(w, "ID\tSKILLS\tHOOKS\tBY\tINSTALLS VIA\tTITLE")
			for _, b := range m.Bundles {
				via := "dashkit"
				if b.IsMarketplace() {
					via = "host plugin manager"
				}
				hooks := "-"
				if len(b.Hooks) > 0 {
					hooks = fmt.Sprint(len(b.Hooks))
				}
				fmt.Fprintf(w, "%s\t%d\t%s\t%s\t%s\t%s\n", b.ID, len(b.Skills), hooks, b.Credit.Author, via, b.Title)
			}
			if err := w.Flush(); err != nil {
				return err
			}
			fmt.Println("\nEvery installed skill competes for the agent's attention: install what a project uses, not everything.")
			return nil
		},
	}
	cmd.Flags().BoolVar(&showTargets, "targets", false, "list supported AI tools instead of bundles")
	return cmd
}

func updateCmd() *cobra.Command {
	var yes bool

	cmd := &cobra.Command{
		Use:   "update",
		Short: "Re-apply every recorded install against a freshly downloaded upstream tree",
		RunE: func(cmd *cobra.Command, _ []string) error {
			st, err := state.Load()
			if err != nil {
				return err
			}
			if len(st.Installs) == 0 {
				fmt.Println("nothing installed yet — run `dashkit` to start the wizard")
				return nil
			}

			for _, in := range st.Installs {
				bundle, err := catalog.Find(in.Bundle)
				if err != nil {
					return err
				}
				target, err := targets.Find(in.Target)
				if err != nil {
					return err
				}
				req := install.Request{
					Bundles:          []catalog.Bundle{bundle},
					Targets:          []targets.Target{target},
					Scope:            targets.Scope(in.Scope),
					ProjectDir:       in.ProjectAt,
					MCP:              true,
					PreferHostPlugin: true,
					Refresh:          true,
				}
				built, err := install.Build(cmd.Context(), req)
				if err != nil {
					return err
				}
				if _, err := install.Apply(req, built, os.Stdout, confirmer(yes)); err != nil {
					return err
				}
			}
			return nil
		},
	}
	cmd.Flags().BoolVarP(&yes, "yes", "y", false, "do not ask before running commands")
	return cmd
}

func uninstallCmd() *cobra.Command {
	var (
		bundle string
		agent  string
		dryRun bool
		yes    bool
	)

	cmd := &cobra.Command{
		Use:   "uninstall",
		Short: "Remove what dashkit installed, and only that",
		RunE: func(*cobra.Command, []string) error {
			return install.Uninstall(bundle, agent, dryRun, os.Stdout, confirmer(yes))
		},
	}
	cmd.Flags().StringVarP(&bundle, "bundle", "b", "", "limit to one bundle id")
	cmd.Flags().StringVarP(&agent, "agents", "a", "", "limit to one target id")
	cmd.Flags().BoolVar(&dryRun, "dry-run", false, "print what would be removed")
	cmd.Flags().BoolVarP(&yes, "yes", "y", false, "do not ask before asking a host to remove its plugins")
	return cmd
}

// --- shared output -----------------------------------------------------------

func printPrereqs(built *install.Built) {
	unmet := prereq.Unmet(built.Prereqs)
	if len(unmet) == 0 {
		return
	}
	fmt.Println("Prerequisites not present:")
	for _, r := range unmet {
		need := "optional"
		if r.Required {
			need = "required"
		}
		fmt.Printf("  - %s, %s (%s)\n", r.Title, need, r.Detail)
	}
	fmt.Println("  the skills install anyway; --with-prereqs installs what dashkit can")
}

func printReport(r *install.Report, dryRun bool) {
	// Skips are shown even on a dry run: that is exactly when someone needs to
	// know a combination will not happen, and why.
	if len(r.Skipped) > 0 {
		fmt.Println()
		for _, s := range r.Skipped {
			fmt.Printf("skipped %s -> %s: %s\n", s.Bundle.ID, s.Target.ID(), s.Skipped)
		}
	}
	if dryRun {
		fmt.Println("\ndry run — nothing was written")
		return
	}
	fmt.Printf("\nInstalled %d bundle/tool combination(s).\n", len(r.Installed))
	if r.BackupDir != "" {
		fmt.Printf("  backups of every file touched: %s\n", r.BackupDir)
	}
	if len(r.Hints) > 0 {
		fmt.Println("\nNext:")
		for _, h := range r.Hints {
			fmt.Printf("  - %s\n", h)
		}
	}
}
