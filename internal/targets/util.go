package targets

import (
	"os"
	"strings"
)

func readFile(path string) ([]byte, error) { return os.ReadFile(path) }

// agentName turns "FabricAdmin.agent.md" into "FabricAdmin".
func agentName(file string) string {
	return strings.TrimSuffix(strings.TrimSuffix(file, ".md"), ".agent")
}
