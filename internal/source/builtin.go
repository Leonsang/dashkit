package source

import (
	"crypto/sha256"
	"encoding/hex"
	"io/fs"
	"os"
	"path/filepath"
	"sort"

	"github.com/leonsang/dashkit/bundles"
	"github.com/leonsang/dashkit/internal/home"
)

// Builtin returns the tree of dashkit's own bundles, written out of the binary
// into the cache so the same copy machinery as upstream bundles can use it.
// The cache key is a hash of the content, so a new dashkit version with
// changed skills never reuses a stale copy.
func Builtin() (*Tree, error) {
	sum, err := contentHash(bundles.FS)
	if err != nil {
		return nil, err
	}
	dir := filepath.Join(home.Cache(), "builtin@"+sum[:12])
	if _, err := os.Stat(filepath.Join(dir, marker)); err == nil {
		return &Tree{Root: dir, Ref: "builtin@" + sum[:12]}, nil
	}
	if err := os.RemoveAll(dir); err != nil {
		return nil, err
	}
	err = fs.WalkDir(bundles.FS, ".", func(path string, d fs.DirEntry, err error) error {
		if err != nil {
			return err
		}
		dst := filepath.Join(dir, filepath.FromSlash(path))
		if d.IsDir() {
			return os.MkdirAll(dst, 0o755)
		}
		data, err := fs.ReadFile(bundles.FS, path)
		if err != nil {
			return err
		}
		return os.WriteFile(dst, data, 0o644)
	})
	if err != nil {
		return nil, err
	}
	if err := os.WriteFile(filepath.Join(dir, marker), []byte(sum+"\n"), 0o644); err != nil {
		return nil, err
	}
	return &Tree{Root: dir, Ref: "builtin@" + sum[:12]}, nil
}

func contentHash(fsys fs.FS) (string, error) {
	var paths []string
	err := fs.WalkDir(fsys, ".", func(path string, d fs.DirEntry, err error) error {
		if err == nil && !d.IsDir() {
			paths = append(paths, path)
		}
		return err
	})
	if err != nil {
		return "", err
	}
	sort.Strings(paths)
	h := sha256.New()
	for _, p := range paths {
		data, err := fs.ReadFile(fsys, p)
		if err != nil {
			return "", err
		}
		h.Write([]byte(p))
		h.Write([]byte{0})
		h.Write(data)
	}
	return hex.EncodeToString(h.Sum(nil)), nil
}
