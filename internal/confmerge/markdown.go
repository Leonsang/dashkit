package confmerge

import (
	"fmt"
	"regexp"
	"strings"
)

// Managed blocks let dashkit own a region of a file the user also writes in
// (AGENTS.md, GEMINI.md, CLAUDE.md). Everything outside the markers is left
// exactly as it was.
func blockStart(id string) string { return fmt.Sprintf("<!-- dashkit:start:%s -->", id) }
func blockEnd(id string) string   { return fmt.Sprintf("<!-- dashkit:end:%s -->", id) }

func blockRe(id string) *regexp.Regexp {
	return regexp.MustCompile(`(?s)\n*` + regexp.QuoteMeta(blockStart(id)) + `.*?` + regexp.QuoteMeta(blockEnd(id)) + `\n*`)
}

// SetBlock replaces the managed block with the given id, appending it when the
// file has none. Running it twice with the same content is a no-op.
func SetBlock(original []byte, id, content string) []byte {
	block := blockStart(id) + "\n" + strings.TrimRight(content, "\n") + "\n" + blockEnd(id) + "\n"

	if re := blockRe(id); re.Match(original) {
		// Keep exactly one blank line between the user's text and the block, so
		// re-running an install leaves the file byte-identical.
		if loc := re.FindIndex(original); loc[0] == 0 {
			return append([]byte(block), original[loc[1]:]...)
		}
		return re.ReplaceAll(original, []byte("\n\n"+block))
	}

	text := string(original)
	if strings.TrimSpace(text) == "" {
		return []byte(block)
	}
	return []byte(strings.TrimRight(text, "\n") + "\n\n" + block)
}

// RemoveBlock strips the managed block with the given id and reports whether
// anything is left in the file besides whitespace.
func RemoveBlock(original []byte, id string) (out []byte, remaining bool) {
	stripped := blockRe(id).ReplaceAll(original, []byte("\n"))
	trimmed := strings.TrimSpace(string(stripped))
	if trimmed == "" {
		return nil, false
	}
	return []byte(trimmed + "\n"), true
}

// HasBlock reports whether the file already carries the managed block.
func HasBlock(original []byte, id string) bool { return blockRe(id).Match(original) }
