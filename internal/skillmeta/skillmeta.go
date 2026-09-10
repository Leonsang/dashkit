// Package skillmeta reads the small amount of YAML front matter fabkit needs
// from a SKILL.md: the skill's name and its description. A full YAML parser is
// overkill here — upstream front matter only uses plain scalars and folded
// blocks — and keeping it dependency-free keeps the binary honest.
package skillmeta

import (
	"os"
	"path/filepath"
	"strings"
)

type Meta struct {
	Name        string
	Description string
}

// ReadSkill parses the front matter of dir/SKILL.md, falling back to the
// directory name when the file declares no name.
func ReadSkill(dir string) (Meta, error) {
	data, err := os.ReadFile(filepath.Join(dir, "SKILL.md"))
	if err != nil {
		return Meta{}, err
	}
	m := Parse(string(data))
	if m.Name == "" {
		m.Name = filepath.Base(dir)
	}
	return m, nil
}

// ReadAgent parses the front matter of an agent definition file.
func ReadAgent(path string) (Meta, error) {
	data, err := os.ReadFile(path)
	if err != nil {
		return Meta{}, err
	}
	m := Parse(string(data))
	if m.Name == "" {
		m.Name = strings.TrimSuffix(strings.TrimSuffix(filepath.Base(path), ".md"), ".agent")
	}
	return m, nil
}

// Body returns the markdown after the front matter.
func Body(content string) string {
	_, body := split(content)
	return body
}

// Parse extracts the known keys from a document's front matter.
func Parse(content string) Meta {
	front, _ := split(content)
	fields := parseFields(front)
	return Meta{Name: fields["name"], Description: fields["description"]}
}

func split(content string) (front, body string) {
	text := strings.ReplaceAll(content, "\r\n", "\n")
	if !strings.HasPrefix(text, "---\n") {
		return "", text
	}
	rest := text[len("---\n"):]
	end := strings.Index(rest, "\n---")
	if end < 0 {
		return "", text
	}
	after := rest[end+len("\n---"):]
	return rest[:end], strings.TrimPrefix(after, "\n")
}

// parseFields handles `key: value` and folded/literal blocks (`key: >-`),
// which is everything the upstream skills use.
func parseFields(front string) map[string]string {
	out := map[string]string{}
	lines := strings.Split(front, "\n")
	for i := 0; i < len(lines); i++ {
		line := lines[i]
		if line == "" || strings.HasPrefix(line, " ") || strings.HasPrefix(line, "#") {
			continue
		}
		key, value, ok := strings.Cut(line, ":")
		if !ok {
			continue
		}
		key = strings.TrimSpace(key)
		value = strings.TrimSpace(value)

		if value == "" || value == ">" || value == ">-" || value == "|" || value == "|-" {
			var block []string
			for j := i + 1; j < len(lines); j++ {
				next := lines[j]
				if strings.TrimSpace(next) == "" {
					block = append(block, "")
					continue
				}
				if !strings.HasPrefix(next, " ") && !strings.HasPrefix(next, "\t") {
					break
				}
				block = append(block, strings.TrimSpace(next))
				i = j
			}
			joined := strings.Join(block, " ")
			if strings.HasPrefix(value, "|") {
				joined = strings.Join(block, "\n")
			}
			out[key] = strings.TrimSpace(joined)
			continue
		}
		out[key] = strings.Trim(value, `"'`)
	}
	return out
}
