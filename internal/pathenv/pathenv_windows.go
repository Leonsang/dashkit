// Package pathenv reloads PATH after a package manager has changed it, so a
// prerequisite installed a moment ago can be found without restarting.
package pathenv

import (
	"os"
	"strings"

	"golang.org/x/sys/windows/registry"
)

// Refresh rebuilds this process's PATH from the registry, the way a newly
// opened terminal would: the machine PATH, then the user's. winget often adds a
// package's folder to the user PATH instead of linking the binary somewhere
// already on it, and a running process never sees that change on its own.
func Refresh() error {
	machine, err := read(registry.LOCAL_MACHINE, `SYSTEM\CurrentControlSet\Control\Session Manager\Environment`)
	if err != nil {
		return err
	}
	user, err := read(registry.CURRENT_USER, `Environment`)
	if err != nil {
		return err
	}
	var parts []string
	for _, p := range []string{machine, user} {
		if p != "" {
			parts = append(parts, p)
		}
	}
	return os.Setenv("PATH", strings.Join(parts, string(os.PathListSeparator)))
}

func read(root registry.Key, path string) (string, error) {
	k, err := registry.OpenKey(root, path, registry.QUERY_VALUE)
	if err != nil {
		return "", err
	}
	defer k.Close()
	v, _, err := k.GetStringValue("Path")
	if err == registry.ErrNotExist {
		return "", nil
	}
	if err != nil {
		return "", err
	}
	// REG_EXPAND_SZ values such as %USERPROFILE%\bin are expanded by the shell
	// for a new terminal; do the same.
	return registry.ExpandString(v)
}
