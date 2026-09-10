package install

import (
	"fmt"
	"os"
	"strings"

	"github.com/leonsang/fabkit/internal/confmerge"
	"github.com/leonsang/fabkit/internal/state"
)

// revert undoes one surgical edit inside a file fabkit does not own, leaving
// every other part of that file exactly as the user has it now — which matters
// more than restoring the whole backup, since the file may have changed since.
func revert(e state.Edit) error {
	original, err := os.ReadFile(e.Path)
	if os.IsNotExist(err) {
		return nil
	}
	if err != nil {
		return err
	}

	switch e.Kind {
	case state.EditJSONKey:
		obj, err := confmerge.ParseJSONObject(original)
		if err != nil {
			return fmt.Errorf("%s is no longer valid JSON: %w", e.Path, err)
		}
		if err := confmerge.DeletePath(obj, strings.Split(e.Locator, "."), true); err != nil {
			return err
		}
		if len(obj.Keys()) == 0 {
			// fabkit's key was the only thing in there; leaving an empty {} file
			// behind would be litter.
			return os.Remove(e.Path)
		}
		out, err := confmerge.RenderJSON(obj, original)
		if err != nil {
			return err
		}
		return os.WriteFile(e.Path, out, 0o644)

	case state.EditTOMLKey:
		out := confmerge.RemoveTable(original, e.Locator)
		if out == nil {
			return os.Remove(e.Path)
		}
		return os.WriteFile(e.Path, out, 0o644)

	case state.EditMarkdown:
		out, remaining := confmerge.RemoveBlock(original, e.Locator)
		if !remaining {
			return os.Remove(e.Path)
		}
		return os.WriteFile(e.Path, out, 0o644)
	}
	return fmt.Errorf("unknown edit kind %q", e.Kind)
}
