package targets

import "os/exec"

// lookPath is a variable so tests can pretend a tool is (or is not) installed.
var lookPath = exec.LookPath
