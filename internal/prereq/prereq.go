// Package prereq knows what the Fabric and Power BI skills need on the machine
// to actually work — Node, the Power BI CLIs, Azure CLI — how to detect each one
// and the exact command that installs it on this OS.
package prereq

import (
	"encoding/json"
	"fmt"
	"os/exec"
	"runtime"
	"strconv"
	"strings"
)

// Status is the outcome of one check.
type Status int

const (
	OK Status = iota
	Missing
	Outdated
	Unknown
)

func (s Status) String() string {
	switch s {
	case OK:
		return "ok"
	case Missing:
		return "missing"
	case Outdated:
		return "outdated"
	default:
		return "unknown"
	}
}

// Result is what doctor reports for one prerequisite.
type Result struct {
	ID     string
	Title  string
	Status Status
	Detail string
	// Fix is the command that would install or upgrade it on this OS, empty when
	// fabkit has no safe automated answer.
	Fix []string
	// Manual is guidance shown when Fix is empty.
	Manual string
}

// Check is one prerequisite fabkit knows how to look for.
type Check struct {
	ID    string
	Title string
	// Probe reports the current state.
	Probe func() (Status, string)
	// Install returns the command for the current OS, or nil.
	Install func() []string
	// Manual is the fallback instruction when no install command exists.
	Manual string
}

// Registry is every prerequisite, keyed by the ids used in the catalog manifest.
func Registry() map[string]Check {
	checks := map[string]Check{
		"git": {
			ID: "git", Title: "Git",
			Probe:   versionProbe("git", "--version"),
			Install: pkg("Git.Git", "git", "git"),
		},
		"node20": {
			ID: "node20", Title: "Node.js 20+",
			Probe:   nodeProbe,
			Install: pkg("OpenJS.NodeJS.LTS", "node", "nodejs"),
		},
		"az": {
			ID: "az", Title: "Azure CLI",
			Probe:   versionProbe("az", "version"),
			Install: pkg("Microsoft.AzureCLI", "azure-cli", ""),
			Manual:  "install from https://learn.microsoft.com/cli/azure/install-azure-cli",
		},
		"sqlcmd": {
			ID: "sqlcmd", Title: "sqlcmd (Fabric SQL endpoints)",
			Probe:   versionProbe("sqlcmd", "--version"),
			Install: pkg("sqlcmd", "sqlcmd", ""),
			Manual:  "install from https://github.com/microsoft/go-sqlcmd",
		},
		"powerbi-desktop": {
			ID: "powerbi-desktop", Title: "Power BI Desktop (Windows only)",
			Probe: powerBIDesktopProbe,
			Install: func() []string {
				if runtime.GOOS != "windows" {
					return nil
				}
				return []string{"winget", "install", "--id", "Microsoft.PowerBI", "--accept-package-agreements", "--accept-source-agreements"}
			},
			Manual: "Power BI Desktop only runs on Windows; on macOS and Linux the report skills work against PBIP files without the Desktop bridge",
		},
	}

	for _, p := range []string{
		"@microsoft/powerbi-report-authoring-cli",
		"@microsoft/powerbi-desktop-bridge-cli",
		"@microsoft/powerbi-modeling-mcp",
	} {
		pkgName := p
		checks["npm:"+pkgName] = Check{
			ID: "npm:" + pkgName, Title: pkgName,
			Probe:   func() (Status, string) { return npmGlobalProbe(pkgName) },
			Install: func() []string { return []string{"npm", "install", "-g", pkgName + "@latest"} },
		}
	}
	return checks
}

// Run evaluates the named prerequisites, in the order given.
func Run(ids []string) []Result {
	reg := Registry()
	out := make([]Result, 0, len(ids))
	for _, id := range ids {
		check, ok := reg[id]
		if !ok {
			out = append(out, Result{ID: id, Title: id, Status: Unknown, Detail: "no check defined"})
			continue
		}
		status, detail := check.Probe()
		r := Result{ID: id, Title: check.Title, Status: status, Detail: detail, Manual: check.Manual}
		if status != OK && check.Install != nil {
			r.Fix = check.Install()
		}
		out = append(out, r)
	}
	return out
}

// --- probes ------------------------------------------------------------------

func run(name string, args ...string) (string, error) {
	bin, err := exec.LookPath(name)
	if err != nil {
		return "", err
	}
	out, err := exec.Command(bin, args...).CombinedOutput()
	return strings.TrimSpace(string(out)), err
}

func versionProbe(name string, args ...string) func() (Status, string) {
	return func() (Status, string) {
		out, err := run(name, args...)
		if err != nil {
			if _, lookErr := exec.LookPath(name); lookErr != nil {
				return Missing, "not on PATH"
			}
			return Unknown, firstLine(out)
		}
		return OK, firstLine(out)
	}
}

func nodeProbe() (Status, string) {
	out, err := run("node", "--version")
	if err != nil {
		return Missing, "not on PATH"
	}
	major := 0
	if v := strings.TrimPrefix(firstLine(out), "v"); v != "" {
		if n, err := strconv.Atoi(strings.SplitN(v, ".", 2)[0]); err == nil {
			major = n
		}
	}
	if major < 20 {
		return Outdated, fmt.Sprintf("%s (need 20+)", firstLine(out))
	}
	return OK, firstLine(out)
}

// npmGlobalProbe asks npm what is installed globally. It shells out, which is
// the slowest check fabkit runs — hence --skip-prereq-check.
func npmGlobalProbe(pkg string) (Status, string) {
	out, err := run("npm", "ls", "-g", "--depth", "0", "--json", pkg)
	if err != nil && out == "" {
		return Unknown, "npm not available"
	}
	var parsed struct {
		Dependencies map[string]struct {
			Version string `json:"version"`
		} `json:"dependencies"`
	}
	if jsonErr := json.Unmarshal([]byte(out), &parsed); jsonErr != nil {
		return Unknown, firstLine(out)
	}
	if dep, ok := parsed.Dependencies[pkg]; ok && dep.Version != "" {
		return OK, "v" + dep.Version
	}
	return Missing, "not installed globally"
}

func powerBIDesktopProbe() (Status, string) {
	if runtime.GOOS != "windows" {
		return OK, "not applicable on " + runtime.GOOS
	}
	out, err := run("winget", "list", "--id", "Microsoft.PowerBI", "--exact")
	if err != nil || !strings.Contains(out, "Microsoft.PowerBI") {
		return Missing, "not installed"
	}
	return OK, "installed"
}

// pkg picks the right package manager invocation for this OS.
func pkg(wingetID, brewFormula, aptPackage string) func() []string {
	return func() []string {
		switch runtime.GOOS {
		case "windows":
			if wingetID == "" {
				return nil
			}
			if _, err := exec.LookPath("winget"); err != nil {
				return nil
			}
			return []string{"winget", "install", "--id", wingetID, "--accept-package-agreements", "--accept-source-agreements"}
		case "darwin":
			if brewFormula == "" {
				return nil
			}
			if _, err := exec.LookPath("brew"); err != nil {
				return nil
			}
			return []string{"brew", "install", brewFormula}
		default:
			if aptPackage == "" {
				return nil
			}
			if _, err := exec.LookPath("apt-get"); err == nil {
				return []string{"sudo", "apt-get", "install", "-y", aptPackage}
			}
			if _, err := exec.LookPath("dnf"); err == nil {
				return []string{"sudo", "dnf", "install", "-y", aptPackage}
			}
			return nil
		}
	}
}

func firstLine(s string) string {
	if i := strings.IndexAny(s, "\r\n"); i >= 0 {
		return s[:i]
	}
	return s
}

// Blocking returns the results that should stop an install.
func Blocking(results []Result) []Result {
	var out []Result
	for _, r := range results {
		if r.Status == Missing || r.Status == Outdated {
			out = append(out, r)
		}
	}
	return out
}
