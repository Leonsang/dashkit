// Package backup keeps a timestamped copy of every file fabkit is about to
// overwrite, so a bad install is always recoverable.
package backup

import (
	"fmt"
	"io"
	"os"
	"path/filepath"
	"strings"
	"sync"
	"time"

	"github.com/ericksang/fabkit/internal/home"
)

// Session is one install's worth of backups. Created lazily: if nothing needs
// backing up, no directory appears on disk.
type Session struct {
	mu    sync.Mutex
	stamp string
	dir   string
	saved map[string]string // original path -> backup path
}

func NewSession() *Session {
	return &Session{stamp: time.Now().UTC().Format("20060102-150405"), saved: map[string]string{}}
}

// Dir is the backup directory for this session, or "" if nothing was saved.
func (s *Session) Dir() string {
	s.mu.Lock()
	defer s.mu.Unlock()
	return s.dir
}

// Saved reports how many files were copied.
func (s *Session) Saved() int {
	s.mu.Lock()
	defer s.mu.Unlock()
	return len(s.saved)
}

// Save copies path into the session directory if it exists and has not been
// saved already. Missing files are not an error: creating a new file needs no
// backup, and Save is called unconditionally before every write.
func (s *Session) Save(path string) error {
	info, err := os.Stat(path)
	if os.IsNotExist(err) {
		return nil
	}
	if err != nil {
		return err
	}
	if info.IsDir() {
		return nil
	}

	s.mu.Lock()
	defer s.mu.Unlock()
	if _, done := s.saved[path]; done {
		return nil
	}
	if s.dir == "" {
		s.dir = filepath.Join(home.Backups(), s.stamp)
		if err := os.MkdirAll(s.dir, 0o755); err != nil {
			return fmt.Errorf("create backup dir: %w", err)
		}
	}

	dst := filepath.Join(s.dir, flatten(path))
	if err := copyFile(path, dst); err != nil {
		return fmt.Errorf("back up %s: %w", path, err)
	}
	s.saved[path] = dst
	return nil
}

// flatten turns an absolute path into a single readable filename, so the backup
// directory stays browsable and never collides across drives or roots.
func flatten(path string) string {
	p := filepath.ToSlash(path)
	p = strings.ReplaceAll(p, ":", "")
	p = strings.TrimPrefix(p, "/")
	return strings.ReplaceAll(p, "/", "__")
}

func copyFile(src, dst string) error {
	in, err := os.Open(src)
	if err != nil {
		return err
	}
	defer in.Close()
	out, err := os.Create(dst)
	if err != nil {
		return err
	}
	defer out.Close()
	if _, err := io.Copy(out, in); err != nil {
		return err
	}
	return out.Close()
}
