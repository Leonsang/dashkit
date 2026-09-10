package confmerge

import (
	"fmt"
	"regexp"
	"sort"
	"strconv"
	"strings"
)

// fabkit only ever adds whole tables to a TOML file (Codex's config.toml), so it
// edits the text directly instead of round-tripping through a parser. That keeps
// the user's comments, ordering and formatting untouched.

var headerLine = regexp.MustCompile(`^\s*\[\[?([^\]]+)\]\]?\s*$`)

// tableSpan locates a table and every sub-table beneath it: [mcp_servers.x]
// owns [mcp_servers.x.env], and both have to move together.
func tableSpan(lines []string, table string) (start, end int, found bool) {
	start = -1
	for i, line := range lines {
		m := headerLine.FindStringSubmatch(line)
		if m == nil {
			continue
		}
		name := strings.TrimSpace(m[1])
		if start < 0 {
			if name == table {
				start = i
			}
			continue
		}
		if name == table || strings.HasPrefix(name, table+".") {
			continue
		}
		return start, i, true
	}
	if start < 0 {
		return 0, 0, false
	}
	return start, len(lines), true
}

// HasTable reports whether the exact table header is already present.
func HasTable(original []byte, table string) bool {
	_, _, found := tableSpan(splitLines(original), table)
	return found
}

// SetTable replaces the named table with one rendered from values, appending it
// when absent. Values may be string, bool, int, []string or map[string]string.
func SetTable(original []byte, table string, values map[string]any) ([]byte, error) {
	rendered, err := renderTable(table, values)
	if err != nil {
		return nil, err
	}

	lines := splitLines(original)
	start, end, found := tableSpan(lines, table)
	if !found {
		text := strings.TrimRight(string(original), "\n")
		if text == "" {
			return []byte(rendered), nil
		}
		return []byte(text + "\n\n" + rendered), nil
	}

	kept := append(append([]string{}, lines[:start]...), strings.Split(strings.TrimRight(rendered, "\n"), "\n")...)
	kept = append(kept, "")
	kept = append(kept, lines[end:]...)
	return []byte(strings.TrimRight(strings.Join(kept, "\n"), "\n") + "\n"), nil
}

// RemoveTable strips the named table and its sub-tables, returning the rest.
func RemoveTable(original []byte, table string) []byte {
	lines := splitLines(original)
	start, end, found := tableSpan(lines, table)
	if !found {
		return original
	}
	kept := append(append([]string{}, lines[:start]...), lines[end:]...)
	trimmed := strings.TrimSpace(strings.Join(kept, "\n"))
	if trimmed == "" {
		return nil
	}
	return []byte(trimmed + "\n")
}

func splitLines(b []byte) []string {
	return strings.Split(strings.ReplaceAll(string(b), "\r\n", "\n"), "\n")
}

func renderTable(table string, values map[string]any) (string, error) {
	var b strings.Builder
	fmt.Fprintf(&b, "[%s]\n", table)

	keys := make([]string, 0, len(values))
	for k := range values {
		keys = append(keys, k)
	}
	sort.Strings(keys)

	// Sub-tables have to come after this table's own scalar keys, or they would
	// swallow the keys that follow them.
	var subTables []string
	for _, k := range keys {
		v, ok := values[k].(map[string]string)
		if !ok {
			lit, err := tomlValue(values[k])
			if err != nil {
				return "", fmt.Errorf("%s.%s: %w", table, k, err)
			}
			fmt.Fprintf(&b, "%s = %s\n", tomlKey(k), lit)
			continue
		}
		if len(v) == 0 {
			continue
		}
		sub, err := renderStringTable(table+"."+k, v)
		if err != nil {
			return "", err
		}
		subTables = append(subTables, sub)
	}
	for _, sub := range subTables {
		b.WriteString("\n")
		b.WriteString(sub)
	}
	return b.String(), nil
}

func renderStringTable(name string, values map[string]string) (string, error) {
	var b strings.Builder
	fmt.Fprintf(&b, "[%s]\n", name)
	keys := make([]string, 0, len(values))
	for k := range values {
		keys = append(keys, k)
	}
	sort.Strings(keys)
	for _, k := range keys {
		fmt.Fprintf(&b, "%s = %s\n", tomlKey(k), strconv.Quote(values[k]))
	}
	return b.String(), nil
}

var bareKey = regexp.MustCompile(`^[A-Za-z0-9_-]+$`)

func tomlKey(k string) string {
	if bareKey.MatchString(k) {
		return k
	}
	return strconv.Quote(k)
}

func tomlValue(v any) (string, error) {
	switch t := v.(type) {
	case string:
		return strconv.Quote(t), nil
	case bool:
		return strconv.FormatBool(t), nil
	case int:
		return strconv.Itoa(t), nil
	case []string:
		parts := make([]string, len(t))
		for i, s := range t {
			parts[i] = strconv.Quote(s)
		}
		return "[" + strings.Join(parts, ", ") + "]", nil
	default:
		return "", fmt.Errorf("unsupported TOML value of type %T", v)
	}
}
