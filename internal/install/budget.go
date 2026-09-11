package install

import (
	"fmt"

	"github.com/leonsang/dashkit/internal/catalog"
	"github.com/leonsang/dashkit/internal/targets"
)

// Every installed skill puts its description in front of the agent in every
// session its scope covers, where it competes for attention with the task at
// hand and with every other skill. Past a handful, the agent starts picking the
// wrong skill or none. These limits are where dashkit starts saying so.
const (
	// globalSkillBudget is low because a global install loads in every project
	// on the machine, including the ones that have nothing to do with Power BI.
	globalSkillBudget = 6
	// projectSkillBudget is higher: the project chose these skills on purpose.
	projectSkillBudget = 12
)

// SkillCount is the number of distinct skills the bundles add.
func SkillCount(bundles []catalog.Bundle) int {
	seen := map[string]bool{}
	for _, b := range bundles {
		for _, s := range b.Skills {
			seen[s] = true
		}
	}
	return len(seen)
}

// ContextWarning explains when a selection is likely to crowd the agent's
// context, or returns "" when it is a reasonable size for its scope.
func ContextWarning(bundles []catalog.Bundle, scope targets.Scope) string {
	n := SkillCount(bundles)
	if scope == targets.Global && n > globalSkillBudget {
		return fmt.Sprintf(
			"%d skills installed globally will load in every session on this machine, Power BI or not; "+
				"each one competes for the agent's attention. Prefer --scope project, or fewer bundles.", n)
	}
	if n > projectSkillBudget {
		return fmt.Sprintf(
			"%d skills is a lot for one project: each one competes for the agent's attention and context window. "+
				"Install what this project uses now and add more when it needs them.", n)
	}
	return ""
}
