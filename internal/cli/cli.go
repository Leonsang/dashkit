// Package cli wires the commands. Every command is a thin shell over
// internal/install; the wizard is just the default one.
package cli

import (
	"bufio"
	"context"
	"fmt"
	"os"
	"strings"

	"github.com/leonsang/dashkit/internal/catalog"
	"github.com/leonsang/dashkit/internal/home"
	"github.com/leonsang/dashkit/internal/install"
	"github.com/leonsang/dashkit/internal/targets"
	"github.com/leonsang/dashkit/internal/tui"
	"github.com/spf13/cobra"
)

type globalFlags struct {
	home string
}

// Execute runs the CLI.
func Execute(version string) error {
	var g globalFlags

	root := &cobra.Command{
		Use:           "dashkit",
		Short:         "Install Microsoft Fabric and Power BI skills into your AI coding tools",
		SilenceUsage:  true,
		SilenceErrors: true,
		Version:       version,
		PersistentPreRun: func(*cobra.Command, []string) {
			if g.home != "" {
				home.SetRoot(g.home)
			}
		},
		RunE: func(cmd *cobra.Command, _ []string) error {
			return tui.Run(cmd.Context(), version)
		},
	}
	root.PersistentFlags().StringVar(&g.home, "home", "", "override the dashkit home directory (default ~/.dashkit, or $DASHKIT_HOME)")

	root.AddCommand(installCmd(), doctorCmd(), listCmd(), updateCmd(), uninstallCmd())
	return root.ExecuteContext(context.Background())
}

type installFlags struct {
	bundles      []string
	agents       []string
	scope        string
	project      string
	mcp          bool
	prereqs      bool
	hostPlugin   bool
	dryRun       bool
	yes          bool
	sourceDir    string
	refresh      bool
	experimental bool
	skipPrereq   bool
}

func installCmd() *cobra.Command {
	var f installFlags

	cmd := &cobra.Command{
		Use:   "install",
		Short: "Install one or more bundles into one or more AI tools",
		Example: strings.TrimSpace(`
  dashkit install --bundle powerbi-authoring,goblin-pbip --agents detected
  dashkit install --bundle powerbi-authoring --agents claude,cursor --with-prereqs
  dashkit install --bundle fabric-consumption --agents claude --scope global --dry-run`),
		RunE: func(cmd *cobra.Command, _ []string) error {
			req, err := buildRequest(f)
			if err != nil {
				return err
			}

			// Every installed skill competes for the agent's attention in every
			// session its scope covers. "all" is the one choice that almost always
			// overdoes it, so it has to be asked for twice.
			if warning := install.ContextWarning(req.Bundles, req.Scope); warning != "" {
				fmt.Fprintf(os.Stderr, "warning: %s\n", warning)
			}
			if isAll(f.bundles) && !f.yes && !f.dryRun {
				question := fmt.Sprintf("install all %d bundles (%d skills)", len(req.Bundles), install.SkillCount(req.Bundles))
				if !ask(question) {
					return fmt.Errorf("cancelled; pick bundles with --bundle, or pass --yes to install everything")
				}
			}

			built, err := install.Build(cmd.Context(), req)
			if err != nil {
				return err
			}
			printPrereqs(built)
			report, err := install.Apply(req, built, os.Stdout, confirmer(f.yes))
			if err != nil {
				return err
			}
			printReport(report, req.DryRun)
			return nil
		},
	}

	cmd.Flags().StringSliceVarP(&f.bundles, "bundle", "b", []string{"powerbi-authoring"}, "bundle ids, or \"all\"")
	cmd.Flags().StringSliceVarP(&f.agents, "agents", "a", []string{"detected"}, "target ids, \"detected\", or \"all\"")
	cmd.Flags().StringVar(&f.scope, "scope", "project", "install into this project (project) or your user config, loaded in every session (global)")
	cmd.Flags().StringVar(&f.project, "project", ".", "project directory when --scope project")
	cmd.Flags().BoolVar(&f.mcp, "mcp", true, "register the bundle's MCP servers")
	cmd.Flags().BoolVar(&f.prereqs, "with-prereqs", false, "install missing prerequisites (Node, Azure CLI, Power BI CLIs)")
	cmd.Flags().BoolVar(&f.hostPlugin, "host-plugin", true, "let hosts with their own plugin manager install the bundle natively")
	cmd.Flags().BoolVar(&f.dryRun, "dry-run", false, "print the plan without writing anything")
	cmd.Flags().BoolVarP(&f.yes, "yes", "y", false, "do not ask before running commands")
	cmd.Flags().StringVar(&f.sourceDir, "source", "", "use a local skills-for-fabric checkout instead of downloading")
	cmd.Flags().BoolVar(&f.refresh, "refresh", false, "re-download the upstream tree even if cached")
	cmd.Flags().BoolVar(&f.experimental, "experimental", false, "allow targets whose config layout is not verified")
	cmd.Flags().BoolVar(&f.skipPrereq, "skip-prereq-check", false, "do not probe for Node, Azure CLI and the Power BI CLIs")
	return cmd
}

func buildRequest(f installFlags) (install.Request, error) {
	bundles, err := catalog.Resolve(f.bundles)
	if err != nil {
		return install.Request{}, err
	}
	chosen, err := targets.Resolve(f.agents)
	if err != nil {
		return install.Request{}, err
	}
	if !f.experimental {
		var kept []targets.Target
		for _, t := range chosen {
			if t.Experimental() {
				fmt.Fprintf(os.Stderr, "skipping %s: layout unverified, pass --experimental to include it\n", t.Title())
				continue
			}
			kept = append(kept, t)
		}
		chosen = kept
	}
	if len(chosen) == 0 {
		return install.Request{}, fmt.Errorf("no targets selected")
	}

	scope := targets.Scope(f.scope)
	if scope != targets.Global && scope != targets.Project {
		return install.Request{}, fmt.Errorf("--scope must be global or project")
	}
	projectDir, err := os.Getwd()
	if err != nil {
		return install.Request{}, err
	}
	if f.project != "" && f.project != "." {
		projectDir = f.project
	}

	return install.Request{
		Bundles:          bundles,
		Targets:          chosen,
		Scope:            scope,
		ProjectDir:       projectDir,
		MCP:              f.mcp,
		PreferHostPlugin: f.hostPlugin,
		WithPrereqs:      f.prereqs,
		DryRun:           f.dryRun,
		SourceDir:        f.sourceDir,
		Refresh:          f.refresh,
		SkipPrereqCheck:  f.skipPrereq,
	}, nil
}

func isAll(ids []string) bool { return len(ids) == 1 && ids[0] == "all" }

var stdin = bufio.NewReader(os.Stdin)

// ask puts a yes/no question on the terminal. Anything but yes is no, including
// a closed stdin, so an unattended run never agrees to something by accident.
func ask(question string) bool {
	fmt.Printf("    %s? [y/N] ", question)
	line, err := stdin.ReadString('\n')
	if err != nil {
		return false
	}
	answer := strings.ToLower(strings.TrimSpace(line))
	return answer == "y" || answer == "yes"
}

// confirmer asks on the terminal before a command runs, unless --yes.
func confirmer(assumeYes bool) func(string) bool {
	if assumeYes {
		return func(string) bool { return true }
	}
	return func(command string) bool { return ask(fmt.Sprintf("run `%s`", command)) }
}
