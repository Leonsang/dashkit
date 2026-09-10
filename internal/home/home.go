// Package home resolves the directories fabkit owns. Every path fabkit reads or
// writes for its own bookkeeping goes through here so tests (and the --home
// flag) can redirect the whole tree somewhere disposable.
package home

import (
	"os"
	"path/filepath"
	"sync"
)

var (
	mu       sync.RWMutex
	override string
)

// SetRoot overrides the fabkit home for this process. Empty restores the default.
func SetRoot(dir string) {
	mu.Lock()
	defer mu.Unlock()
	override = dir
}

// Root is ~/.fabkit, or $FABKIT_HOME, or whatever SetRoot was given.
func Root() string {
	mu.RLock()
	o := override
	mu.RUnlock()
	if o != "" {
		return o
	}
	if env := os.Getenv("FABKIT_HOME"); env != "" {
		return env
	}
	h, err := os.UserHomeDir()
	if err != nil {
		// Nowhere better to go; a relative dir still keeps fabkit self-contained.
		return ".fabkit"
	}
	return filepath.Join(h, ".fabkit")
}

// User is the user's home directory, or the fabkit root's parent when a test
// home is in effect, so target paths like ~/.claude stay inside the sandbox.
func User() string {
	mu.RLock()
	o := override
	mu.RUnlock()
	if o == "" && os.Getenv("FABKIT_HOME") == "" {
		h, err := os.UserHomeDir()
		if err == nil {
			return h
		}
	}
	return Root()
}

// Sandboxed reports whether fabkit is running against a redirected home. Targets
// use it to decide whether a host's own environment override (CODEX_HOME and
// friends) should be honoured: inside a sandbox it must not be, or a test would
// write into the developer's real config.
func Sandboxed() bool {
	mu.RLock()
	defer mu.RUnlock()
	return override != "" || os.Getenv("FABKIT_HOME") != ""
}

func Cache() string   { return filepath.Join(Root(), "cache") }
func Backups() string { return filepath.Join(Root(), "backups") }
func StateFile() string {
	return filepath.Join(Root(), "state.json")
}

// Skills is where fabkit vendors bundle content that hosts read by path rather
// than by their own skill loader.
func Skills() string { return filepath.Join(Root(), "skills") }
