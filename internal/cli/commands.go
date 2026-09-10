package cli

import (
	"fmt"
	"os"
	"strings"
	"text/tabwriter"

	"github.com/ericksang/fabkit/internal/catalog"
	"github.com/ericksang/fabkit/internal/install"
	"github.com/ericksang/fabkit/internal/prereq"
	"github.com/ericksang/fabkit/internal/state"
	"github.com/ericksang/fabkit/internal/targets"
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
			results := prereq.Run(prereqIDsFor(resolved))
			w = tabwriter.NewWriter(os.Stdout, 0, 0, 2, ' ', 0)
			for _, r := range results {
				mark := "+"
				if r.Status != prereq.OK {
					mark = "-"
				}
				fmt.Fprintf(w, "  %s %s\t%s\t%s\n", mark, r.Title, r.Status, r.Detail)
			}
			w.Flush()

			blocking := prereq.Blocking(results)
			if len(blocking) > 0 {
				fmt.Println("\nTo fix:")
				for _, r := range blocking {
					if len(r.Fix) > 0 {
						fmt.Printf("  %s\n", strings.Join(r.Fix, " "))
						continue
					}
					if r.Manual != "" {
						fmt.Printf("  %s: %s\n", r.Title, r.Manual)
					}
				}
				fmt.Println("\nOr let fabkit do it: fabkit install --with-prereqs")
				return fmt.Errorf("%d prerequisite(s) missing", len(blocking))
			}
			fmt.Println("\nEverything the selected bundles need is present.")
			return nil
		},
	}
	cmd.Flags().StringSliceVarP(&bundles, "bundle", "b", []string{"powerbi-authoring"}, "which bundles' prerequisites to check")
	return cmd
}

// prereqIDsFor mirrors install's collection so doctor reports the same set.
func prereqIDsFor(bundles []catalog.Bundle) []string {
	var out []string
	seen := map[string]bool{}
	for _, b := range bundles {
		for _, id := range append(append([]string{}, b.Prereqs.Required...), b.Prereqs.Optional...) {
			if seen[id] {
				continue
			}
			seen[id] = true
			out = append(out, id)
		}
	}
	return out
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
			fmt.Printf("upstream %s @ %s (v%s)\n\n", m.Source.Repo, m.Source.Ref, m.Source.UpstreamVersion)
			w := tabwriter.NewWriter(os.Stdout, 0, 0, 2, ' ', 0)
			fmt.Fprintln(w, "ID\tSKILLS\tTITLE")
			for _, b := range m.Bundles {
				fmt.Fprintf(w, "%s\t%d\t%s\n", b.ID, len(b.Skills), b.Title)
			}
			return w.Flush()
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
				fmt.Println("nothing installed yet — run `fabkit` to start the wizard")
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
	)

	cmd := &cobra.Command{
		Use:   "uninstall",
		Short: "Remove what fabkit installed, and only that",
		RunE: func(*cobra.Command, []string) error {
			return install.Uninstall(bundle, agent, dryRun, os.Stdout)
		},
	}
	cmd.Flags().StringVarP(&bundle, "bundle", "b", "", "limit to one bundle id")
	cmd.Flags().StringVarP(&agent, "agents", "a", "", "limit to one target id")
	cmd.Flags().BoolVar(&dryRun, "dry-run", false, "print what would be removed")
	return cmd
}

// --- shared output -----------------------------------------------------------

func printPrereqs(built *install.Built) {
	blocking := prereq.Blocking(built.Prereqs)
	if len(blocking) == 0 {
		return
	}
	fmt.Println("Prerequisites still missing:")
	for _, r := range blocking {
		fmt.Printf("  - %s (%s)\n", r.Title, r.Detail)
	}
	fmt.Println("  the skills install anyway; add --with-prereqs to have fabkit install these")
}

func printReport(r *install.Report, dryRun bool) {
	if dryRun {
		fmt.Println("\ndry run — nothing was written")
		return
	}
	fmt.Printf("\nInstalled %d bundle/tool combination(s).\n", len(r.Installed))
	for _, s := range r.Skipped {
		fmt.Printf("  skipped %s -> %s: %s\n", s.Bundle.ID, s.Target.ID(), s.Skipped)
	}
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
