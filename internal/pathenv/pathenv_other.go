//go:build !windows

// Package pathenv reloads PATH after a package manager has changed it, so a
// prerequisite installed a moment ago can be found without restarting.
package pathenv

// Refresh is a no-op off Windows: Homebrew, apt and dnf install into
// directories that are already on PATH, so there is nothing to reload.
func Refresh() error { return nil }
