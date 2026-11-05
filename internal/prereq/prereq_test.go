package prereq

import (
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestTableauVersionsCompareNumerically(t *testing.T) {
	for _, c := range []struct {
		a, b string
		less bool
	}{
		{"2026.2", "2026.3", true},
		{"2026.3", "2026.3", false},
		{"2026.10", "2026.3", false}, // numeric, not lexical
		{"2025.4", "2026.1", true},
	} {
		if got := versionLess(c.a, c.b); got != c.less {
			t.Errorf("versionLess(%s, %s) = %v, want %v", c.a, c.b, got, c.less)
		}
	}
}

func TestCDPProbeTellsABrowserFromAnythingElse(t *testing.T) {
	real := cdpURL
	t.Cleanup(func() { cdpURL = real })

	browser := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
		_, _ = w.Write([]byte(`{"Browser":"Edg/156.0"}`))
	}))
	defer browser.Close()
	cdpURL = browser.URL
	if s, detail := cdpProbe(); s != OK || detail != "Edg/156.0" {
		t.Errorf("a DevTools browser should be OK, got %v %q", s, detail)
	}

	other := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
		_, _ = w.Write([]byte(`hello`))
	}))
	defer other.Close()
	cdpURL = other.URL
	if s, _ := cdpProbe(); s != Unknown {
		t.Errorf("a non-DevTools answer should be Unknown, got %v", s)
	}

	cdpURL = "http://127.0.0.1:1/json/version"
	if s, _ := cdpProbe(); s != Missing {
		t.Errorf("nothing listening should be Missing, got %v", s)
	}
}

func TestEveryPrereqTheCatalogNamesHasACheck(t *testing.T) {
	reg := Registry()
	for _, id := range []string{"uv", "tableau-desktop", "tableau-api-flag", "cdp-9222", "node20"} {
		if _, ok := reg[id]; !ok {
			t.Errorf("no check for %q", id)
		}
	}
}
