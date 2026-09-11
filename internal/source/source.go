// Package source obtains the upstream skills tree. Content is fetched from
// GitHub at the ref pinned in the catalog and cached under the dashkit home, so
// repeat installs and `dashkit update` are offline-fast, and a local checkout can
// be substituted with --source for air-gapped use or upstream development.
package source

import (
	"archive/tar"
	"compress/gzip"
	"context"
	"errors"
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/leonsang/dashkit/internal/catalog"
	"github.com/leonsang/dashkit/internal/home"
)

// Tree is an extracted (or checked out) copy of the upstream repository.
type Tree struct {
	Root  string
	Ref   string
	Local bool
}

// marker is written once an extraction completed, so an interrupted download is
// never mistaken for a usable cache entry.
const marker = ".dashkit-complete"

// Local validates a user-supplied checkout of skills-for-fabric.
func Local(dir string) (*Tree, error) {
	abs, err := filepath.Abs(dir)
	if err != nil {
		return nil, err
	}
	if _, err := os.Stat(filepath.Join(abs, "plugins")); err != nil {
		return nil, fmt.Errorf("%s does not look like a skills-for-fabric checkout (no plugins/ directory)", abs)
	}
	return &Tree{Root: abs, Ref: "local:" + abs, Local: true}, nil
}

// Get returns the tree for the manifest's pinned source, downloading it if the
// cache is cold. Pass refresh to force a re-download.
func Get(ctx context.Context, src catalog.Source, refresh bool) (*Tree, error) {
	dir := filepath.Join(home.Cache(), cacheKey(src))
	if !refresh {
		if _, err := os.Stat(filepath.Join(dir, marker)); err == nil {
			return &Tree{Root: dir, Ref: src.Ref}, nil
		}
	}
	if err := os.RemoveAll(dir); err != nil {
		return nil, err
	}
	if err := download(ctx, src, dir); err != nil {
		return nil, err
	}
	if err := os.WriteFile(filepath.Join(dir, marker), []byte(time.Now().UTC().Format(time.RFC3339)+"\n"), 0o644); err != nil {
		return nil, err
	}
	return &Tree{Root: dir, Ref: src.Ref}, nil
}

func cacheKey(src catalog.Source) string {
	return strings.ReplaceAll(src.Repo, "/", "_") + "@" + strings.ReplaceAll(src.Ref, "/", "_")
}

// TarballURL is the codeload archive for a ref. Tags and branches live under
// different prefixes; a ref that already names one is used as-is.
func TarballURL(src catalog.Source) string {
	ref := src.Ref
	switch {
	case strings.HasPrefix(ref, "refs/"):
	case strings.HasPrefix(ref, "v") || strings.Count(ref, ".") >= 2:
		ref = "refs/tags/" + ref
	default:
		ref = "refs/heads/" + ref
	}
	return fmt.Sprintf("https://codeload.github.com/%s/tar.gz/%s", src.Repo, ref)
}

func download(ctx context.Context, src catalog.Source, dst string) error {
	url := TarballURL(src)
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, url, nil)
	if err != nil {
		return err
	}
	req.Header.Set("User-Agent", "dashkit")
	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return fmt.Errorf("download %s: %w", url, err)
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("download %s: %s", url, resp.Status)
	}
	return extract(resp.Body, dst)
}

// extract unpacks a GitHub tarball, dropping the repo-name-and-sha top level
// directory that codeload wraps everything in.
func extract(r io.Reader, dst string) error {
	gz, err := gzip.NewReader(r)
	if err != nil {
		return err
	}
	defer gz.Close()

	if err := os.MkdirAll(dst, 0o755); err != nil {
		return err
	}
	tr := tar.NewReader(gz)
	for {
		hdr, err := tr.Next()
		if errors.Is(err, io.EOF) {
			return nil
		}
		if err != nil {
			return err
		}
		rel := strings.TrimPrefix(hdr.Name, "./")
		if i := strings.Index(rel, "/"); i >= 0 {
			rel = rel[i+1:]
		} else {
			continue // the wrapper directory itself
		}
		if rel == "" {
			continue
		}
		target, err := safeJoin(dst, rel)
		if err != nil {
			return err
		}
		switch hdr.Typeflag {
		case tar.TypeDir:
			if err := os.MkdirAll(target, 0o755); err != nil {
				return err
			}
		case tar.TypeReg:
			if err := os.MkdirAll(filepath.Dir(target), 0o755); err != nil {
				return err
			}
			f, err := os.OpenFile(target, os.O_CREATE|os.O_TRUNC|os.O_WRONLY, 0o644)
			if err != nil {
				return err
			}
			// Cap each entry: the upstream repo is a few MB, anything wilder is
			// not a skills tarball.
			if _, err := io.Copy(f, io.LimitReader(tr, 64<<20)); err != nil {
				f.Close()
				return err
			}
			if err := f.Close(); err != nil {
				return err
			}
		default:
			// Symlinks and devices have no place in a skills bundle.
		}
	}
}

// safeJoin refuses entries that would escape the destination directory.
func safeJoin(root, rel string) (string, error) {
	target := filepath.Join(root, filepath.FromSlash(rel))
	if !strings.HasPrefix(target, filepath.Clean(root)+string(os.PathSeparator)) {
		return "", fmt.Errorf("tar entry escapes destination: %q", rel)
	}
	return target, nil
}

// BundleDir is the directory holding a bundle's skills/, common/ and agents/.
func (t *Tree) BundleDir(b catalog.Bundle) (string, error) {
	dir := filepath.Join(t.Root, filepath.FromSlash(b.Dir))
	if _, err := os.Stat(dir); err != nil {
		return "", fmt.Errorf("bundle %s missing from source tree at %s", b.ID, dir)
	}
	return dir, nil
}

// SkillDir is the directory of one skill inside a bundle.
func (t *Tree) SkillDir(b catalog.Bundle, skill string) (string, error) {
	root, err := t.BundleDir(b)
	if err != nil {
		return "", err
	}
	dir := filepath.Join(root, "skills", skill)
	if _, err := os.Stat(filepath.Join(dir, "SKILL.md")); err != nil {
		return "", fmt.Errorf("skill %s has no SKILL.md in %s", skill, dir)
	}
	return dir, nil
}

// CommonDir is the bundle's shared reference docs, or "" when it has none.
func (t *Tree) CommonDir(b catalog.Bundle) string {
	root := filepath.Join(t.Root, filepath.FromSlash(b.Dir), "common")
	if _, err := os.Stat(root); err != nil {
		return ""
	}
	return root
}

// AgentFile is the path to one bundle agent definition.
func (t *Tree) AgentFile(b catalog.Bundle, agent string) (string, error) {
	root, err := t.BundleDir(b)
	if err != nil {
		return "", err
	}
	p := filepath.Join(root, "agents", agent)
	if _, err := os.Stat(p); err != nil {
		return "", fmt.Errorf("agent %s missing in %s", agent, root)
	}
	return p, nil
}
