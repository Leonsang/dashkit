// Package prereq knows what the Fabric and Power BI skills need on the machine
// to actually work — Node, the Power BI CLIs, Azure CLI — how to detect each one
// and the exact command that installs it on this OS.
package prereq

import (
	"encoding/json"
	"fmt"
	"os/exec"
	"runtime"
	"sort"
	"strconv"
	"strings"

	"github.com/leonsang/dashkit/internal/catalog"
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
	// Required is true when a selected bundle cannot work without it; optional
	// prerequisites are reported but never fail doctor or block an install.
	Required bool
	// Fix is the command that would install or upgrade it on this OS, empty when
	// dashkit has no safe automated answer.
	Fix []string
	// Manual is guidance shown when Fix is empty.
	Manual string
}

func (r Result) missing() bool { return r.Status == Missing || r.Status == Outdated }

// Check is one prerequisite dashkit knows how to look for.
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
		// Unlike powerbi-desktop above, which is optional and not applicable off
		// Windows, this one is a hard requirement: the bundle connects to a live
		// Desktop model and simply cannot work on macOS or Linux.
		"windows-desktop": {
			ID: "windows-desktop", Title: "Power BI Desktop running on Windows",
			Probe: func() (Status, string) {
				if runtime.GOOS != "windows" {
					return Missing, "needs Windows; not available on " + runtime.GOOS
				}
				return powerBIDesktopProbe()
			},
			Install: func() []string {
				if runtime.GOOS != "windows" {
					return nil
				}
				return []string{"winget", "install", "--id", "Microsoft.PowerBI", "--accept-package-agreements", "--accept-source-agreements"}
			},
			Manual: "this bundle connects to a live Power BI Desktop model, which only exists on Windows",
		},
		"python3": {
			ID: "python3", Title: "Python 3",
			Probe:   pythonProbe,
			Install: pkg("Python.Python.3.12", "python", "python3"),
		},
		// pbir-cli is proprietary: its licence allows non-commercial use only
		// (commercial explicitly includes paid consulting and development) and
		// forbids use inside other software without the authors' consent. So
		// dashkit reports it and explains, but never installs it: whether a
		// person's use qualifies is theirs to decide, not an installer's.
		"pbir-cli": {
			ID: "pbir-cli", Title: "pbir-cli (deep PBIR validation)",
			Probe: versionProbe("pbir", "--version"),
			Manual: "proprietary, non-commercial licence — commercial use, including paid consulting or " +
				"development, needs the authors' permission. If your use qualifies: `uv tool install pbir-cli` " +
				"(see https://github.com/data-goblin/pbir-cli)",
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

// ForBundles checks every prerequisite the bundles declare, required ones
// first. Something one bundle requires and another only suggests is required.
func ForBundles(bundles []catalog.Bundle) []Result {
	var required, optional []string
	isRequired := map[string]bool{}
	for _, b := range bundles {
		for _, id := range b.Prereqs.Required {
			if !isRequired[id] {
				isRequired[id] = true
				required = append(required, id)
			}
		}
	}
	seen := map[string]bool{}
	for _, b := range bundles {
		for _, id := range b.Prereqs.Optional {
			if !isRequired[id] && !seen[id] {
				seen[id] = true
				optional = append(optional, id)
			}
		}
	}
	sort.Strings(required)
	sort.Strings(optional)
	return Run(required, optional)
}

// Run evaluates the named prerequisites, in the order given.
func Run(required, optional []string) []Result {
	reg := Registry()
	out := make([]Result, 0, len(required)+len(optional))
	check := func(id string, req bool) {
		c, ok := reg[id]
		if !ok {
			out = append(out, Result{ID: id, Title: id, Status: Unknown, Detail: "no check defined", Required: req})
			return
		}
		status, detail := c.Probe()
		r := Result{ID: id, Title: c.Title, Status: status, Detail: detail, Manual: c.Manual, Required: req}
		if status != OK && c.Install != nil {
			r.Fix = c.Install()
		}
		out = append(out, r)
	}
	for _, id := range required {
		check(id, true)
	}
	for _, id := range optional {
		check(id, false)
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
// the slowest check dashkit runs — hence --skip-prereq-check.
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

// pythonProbe accepts the first interpreter that actually answers as Python 3.
// Being on PATH is not enough: on Windows, `python3` usually resolves to the
// Microsoft Store alias, a stub that offers to install Python instead of running
// it. macOS and Linux usually only guarantee `python3`, Windows `python`.
func pythonProbe() (Status, string) {
	names := []string{"python3", "python"}
	if runtime.GOOS == "windows" {
		names = []string{"python", "py", "python3"}
	}
	found := false
	for _, name := range names {
		if _, err := exec.LookPath(name); err != nil {
			continue
		}
		found = true
		out, err := run(name, "--version")
		if err == nil && strings.HasPrefix(out, "Python 3") {
			return OK, firstLine(out)
		}
	}
	if found {
		return Missing, "only a stub or an old Python is on PATH"
	}
	return Missing, "not on PATH"
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

// Blocking returns the required prerequisites that are missing: the only ones
// that should fail doctor.
func Blocking(results []Result) []Result {
	var out []Result
	for _, r := range results {
		if r.Required && r.missing() {
			out = append(out, r)
		}
	}
	return out
}

// Unmet returns everything missing or outdated, required or not: what
// --with-prereqs offers to install and what doctor lists under "to fix".
func Unmet(results []Result) []Result {
	var out []Result
	for _, r := range results {
		if r.missing() {
			out = append(out, r)
		}
	}
	return out
}
