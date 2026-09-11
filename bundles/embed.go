// Package bundles holds the skills dashkit itself authors. Unlike the
// Microsoft and data-goblin bundles, these ship inside the binary: they are
// small, MIT-licensed, and versioned with dashkit.
package bundles

import "embed"

// FS contains one directory per builtin bundle, laid out like an upstream
// plugin: <bundle>/skills/<skill>/SKILL.md plus its references and scripts.
//
//go:embed all:pbi-sdd
var FS embed.FS
