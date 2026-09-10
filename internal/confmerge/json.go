// Package confmerge edits configuration files that belong to someone else:
// JSON host configs, TOML agent configs and shared Markdown instruction files.
// Every operation preserves the surrounding content, keeps key order, and is
// idempotent — applying the same merge twice leaves the file unchanged.
package confmerge

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"strings"
)

// Object is a JSON object that remembers the order its keys appeared in, so
// merging one entry into a user's config does not reshuffle the whole file.
type Object struct {
	keys []string
	vals map[string]json.RawMessage
}

func NewObject() *Object {
	return &Object{vals: map[string]json.RawMessage{}}
}

func (o *Object) Keys() []string { return append([]string(nil), o.keys...) }

func (o *Object) Get(key string) (json.RawMessage, bool) {
	v, ok := o.vals[key]
	return v, ok
}

func (o *Object) Set(key string, raw json.RawMessage) {
	if o.vals == nil {
		o.vals = map[string]json.RawMessage{}
	}
	if _, exists := o.vals[key]; !exists {
		o.keys = append(o.keys, key)
	}
	o.vals[key] = raw
}

// SetValue marshals v and stores it under key.
func (o *Object) SetValue(key string, v any) error {
	raw, err := json.Marshal(v)
	if err != nil {
		return err
	}
	o.Set(key, raw)
	return nil
}

func (o *Object) Delete(key string) {
	if _, exists := o.vals[key]; !exists {
		return
	}
	delete(o.vals, key)
	for i, k := range o.keys {
		if k == key {
			o.keys = append(o.keys[:i], o.keys[i+1:]...)
			break
		}
	}
}

// Child returns the object stored at key, creating an empty one when the key is
// absent. It fails if the key holds something that is not an object.
func (o *Object) Child(key string) (*Object, error) {
	raw, ok := o.Get(key)
	if !ok || len(bytes.TrimSpace(raw)) == 0 || string(bytes.TrimSpace(raw)) == "null" {
		return NewObject(), nil
	}
	child := NewObject()
	if err := json.Unmarshal(raw, child); err != nil {
		return nil, fmt.Errorf("key %q is not a JSON object: %w", key, err)
	}
	return child, nil
}

func (o *Object) UnmarshalJSON(data []byte) error {
	o.keys = nil
	o.vals = map[string]json.RawMessage{}

	dec := json.NewDecoder(bytes.NewReader(data))
	tok, err := dec.Token()
	if err != nil {
		return err
	}
	if delim, ok := tok.(json.Delim); !ok || delim != '{' {
		return fmt.Errorf("expected a JSON object, got %v", tok)
	}
	for dec.More() {
		keyTok, err := dec.Token()
		if err != nil {
			return err
		}
		key, ok := keyTok.(string)
		if !ok {
			return fmt.Errorf("expected an object key, got %v", keyTok)
		}
		var raw json.RawMessage
		if err := dec.Decode(&raw); err != nil {
			return err
		}
		o.Set(key, raw)
	}
	if _, err := dec.Token(); err != nil && err != io.EOF { // closing brace
		return err
	}
	return nil
}

func (o Object) MarshalJSON() ([]byte, error) {
	var buf bytes.Buffer
	buf.WriteByte('{')
	for i, k := range o.keys {
		if i > 0 {
			buf.WriteByte(',')
		}
		key, err := json.Marshal(k)
		if err != nil {
			return nil, err
		}
		buf.Write(key)
		buf.WriteByte(':')
		// Compact first so the final Indent pass produces uniform output even
		// when the original value carried its own formatting.
		var compact bytes.Buffer
		if err := json.Compact(&compact, o.vals[k]); err != nil {
			return nil, err
		}
		buf.Write(compact.Bytes())
	}
	buf.WriteByte('}')
	return buf.Bytes(), nil
}

// ParseJSONObject reads an object from file bytes. Empty or whitespace-only
// input yields an empty object, which is what a missing config should behave like.
func ParseJSONObject(data []byte) (*Object, error) {
	if len(bytes.TrimSpace(data)) == 0 {
		return NewObject(), nil
	}
	o := NewObject()
	if err := json.Unmarshal(data, o); err != nil {
		return nil, err
	}
	return o, nil
}

// RenderJSON serialises the object using the indentation already used by
// original (defaulting to two spaces) and the trailing newline convention of the
// file it came from.
func RenderJSON(o *Object, original []byte) ([]byte, error) {
	compact, err := json.Marshal(o)
	if err != nil {
		return nil, err
	}
	var out bytes.Buffer
	if err := json.Indent(&out, compact, "", detectIndent(original)); err != nil {
		return nil, err
	}
	b := out.Bytes()
	if !bytes.HasSuffix(b, []byte("\n")) {
		b = append(b, '\n')
	}
	return b, nil
}

// detectIndent looks at the first indented line of an existing file.
func detectIndent(original []byte) string {
	const fallback = "  "
	for _, line := range strings.Split(string(original), "\n") {
		trimmed := strings.TrimLeft(line, " \t")
		if trimmed == "" || len(trimmed) == len(line) {
			continue
		}
		return line[:len(line)-len(trimmed)]
	}
	return fallback
}

// SetPath sets value at a nested key path, creating intermediate objects.
// Returns the dotted locator that was written, for the uninstall record.
func SetPath(root *Object, path []string, value any) (string, error) {
	if len(path) == 0 {
		return "", fmt.Errorf("empty key path")
	}
	if len(path) == 1 {
		return path[0], root.SetValue(path[0], value)
	}
	child, err := root.Child(path[0])
	if err != nil {
		return "", err
	}
	locator, err := SetPath(child, path[1:], value)
	if err != nil {
		return "", err
	}
	if err := root.SetValue(path[0], child); err != nil {
		return "", err
	}
	return path[0] + "." + locator, nil
}

// DeletePath removes a nested key, pruning objects that it leaves empty only if
// fabkit created them (signalled by pruneEmpty).
func DeletePath(root *Object, path []string, pruneEmpty bool) error {
	if len(path) == 0 {
		return nil
	}
	if len(path) == 1 {
		root.Delete(path[0])
		return nil
	}
	child, err := root.Child(path[0])
	if err != nil {
		return err
	}
	if err := DeletePath(child, path[1:], pruneEmpty); err != nil {
		return err
	}
	if pruneEmpty && len(child.Keys()) == 0 {
		root.Delete(path[0])
		return nil
	}
	return root.SetValue(path[0], child)
}
