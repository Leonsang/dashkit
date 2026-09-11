package pathenv

import (
	"os"
	"strings"
	"testing"
)

// Refresh must rebuild PATH from the registry the way a new terminal would.
// The machine PATH always carries System32, so its presence shows the machine
// half was read and expanded (it is stored as %SystemRoot%\system32).
func TestRefreshReadsMachineAndUserPath(t *testing.T) {
	t.Setenv("PATH", `C:\nowhere`)
	if err := Refresh(); err != nil {
		t.Fatal(err)
	}
	got := strings.ToLower(os.Getenv("PATH"))
	if strings.Contains(got, `c:\nowhere`) {
		t.Error("the stale process PATH should be replaced, not kept")
	}
	if !strings.Contains(got, `\system32`) {
		t.Errorf("expected the machine PATH (with System32) after refresh, got %q", got)
	}
	if strings.Contains(got, "%systemroot%") {
		t.Errorf("REG_EXPAND_SZ entries should be expanded, got %q", got)
	}
}
