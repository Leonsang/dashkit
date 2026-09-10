// Command fabkit installs the Microsoft Skills for Fabric bundles — Power BI
// included — into whichever AI coding tools you actually use, on Windows, macOS
// and Linux, from one command.
package main

import (
	"fmt"
	"os"

	"github.com/leonsang/fabkit/internal/cli"
)

// version is stamped by the release build (-ldflags "-X main.version=...").
var version = "dev"

func main() {
	if err := cli.Execute(version); err != nil {
		fmt.Fprintln(os.Stderr, "fabkit:", err)
		os.Exit(1)
	}
}
