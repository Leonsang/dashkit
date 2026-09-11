// Package sddscript tests the survey script that ships inside the pbi-sdd
// bundle. The script is JavaScript, run by Node; these tests run it against a
// small PBIP fixture that contains one of every problem it should report.
package sddscript

import (
	"encoding/json"
	"os/exec"
	"path/filepath"
	"reflect"
	"sort"
	"testing"
)

type findings struct {
	BrokenReferences []struct {
		Table, Name, Kind string
	} `json:"brokenReferences"`
	UnusedMeasures             []string `json:"unusedMeasures"`
	MeasuresWithoutDescription []string `json:"measuresWithoutDescription"`
	MeasuresWithoutFormat      []string `json:"measuresWithoutFormat"`
	LocalFileSources           []struct {
		Table, File string
	} `json:"localFileSources"`
	BrokenNavigation []struct {
		From, Button, GoesTo, Target string
	} `json:"brokenNavigation"`
	OrphanBookmarks      []string `json:"orphanBookmarks"`
	PagesNoButtonLeadsTo []string `json:"pagesNoButtonLeadsTo"`
}

func survey(t *testing.T) findings {
	t.Helper()
	node, err := exec.LookPath("node")
	if err != nil {
		t.Skip("node is not installed")
	}
	script := filepath.Join("..", "..", "bundles", "pbi-sdd", "skills", "pbi-sdd", "scripts", "survey.mjs")
	out, err := exec.Command(node, script, filepath.Join("testdata", "demo"), "--json").Output()
	if err != nil {
		t.Fatalf("survey failed: %v\n%s", err, out)
	}
	var report struct {
		Findings findings `json:"findings"`
	}
	if err := json.Unmarshal(out, &report); err != nil {
		t.Fatalf("survey output is not JSON: %v\n%s", err, out)
	}
	return report.Findings
}

func sorted(s []string) []string {
	out := append([]string(nil), s...)
	sort.Strings(out)
	return out
}

func TestSurveyFindsEveryPlantedProblem(t *testing.T) {
	f := survey(t)

	if len(f.BrokenReferences) != 1 || f.BrokenReferences[0].Name != "Ghost" || f.BrokenReferences[0].Kind != "Measure" {
		t.Errorf("expected the visual's reference to the missing measure Ghost, got %+v", f.BrokenReferences)
	}
	// Revenue is on a visual and inside another measure; the other two are
	// used by nothing.
	if got, want := sorted(f.UnusedMeasures), []string{"Sales[Revenue %]", "Sales[Unused]"}; !reflect.DeepEqual(got, want) {
		t.Errorf("unused measures: got %v, want %v", got, want)
	}
	if got, want := sorted(f.MeasuresWithoutDescription), []string{"Sales[Revenue]", "Sales[Unused]"}; !reflect.DeepEqual(got, want) {
		t.Errorf("undocumented measures: got %v, want %v", got, want)
	}
	if got, want := f.MeasuresWithoutFormat, []string{"Sales[Unused]"}; !reflect.DeepEqual(got, want) {
		t.Errorf("unformatted measures: got %v, want %v", got, want)
	}
	if len(f.LocalFileSources) != 1 || f.LocalFileSources[0].File != `C:\Users\someone\sales.csv` {
		t.Errorf("expected the local CSV path, got %+v", f.LocalFileSources)
	}
}

// Found during the first real survey: the agent had to check bookmarks and
// buttons by hand because the script did not, and 15 of 17 bookmarks pointed
// at deleted pages.
func TestSurveyFindsNavigationThatLeadsNowhere(t *testing.T) {
	f := survey(t)

	if len(f.BrokenNavigation) != 1 || f.BrokenNavigation[0].Target != "gone" || f.BrokenNavigation[0].Button != "Go to Home" {
		t.Errorf("expected the Go to Home button to a deleted page, got %+v", f.BrokenNavigation)
	}
	if got, want := f.OrphanBookmarks, []string{"Old view"}; !reflect.DeepEqual(got, want) {
		t.Errorf("orphan bookmarks: got %v, want %v", got, want)
	}
	if got, want := sorted(f.PagesNoButtonLeadsTo), []string{"Archive", "Sales"}; !reflect.DeepEqual(got, want) {
		t.Errorf("pages no button leads to: got %v, want %v", got, want)
	}
}
