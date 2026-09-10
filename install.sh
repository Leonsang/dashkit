#!/usr/bin/env bash
# fabkit installer for macOS and Linux.
#
#   curl -fsSL https://raw.githubusercontent.com/leonsang/fabkit/main/install.sh | bash
#
# Environment:
#   FABKIT_VERSION  release tag to install (default: latest)
#   FABKIT_BIN_DIR  install directory (default: ~/.local/bin)
set -euo pipefail

REPO="${FABKIT_REPO:-leonsang/fabkit}"
VERSION="${FABKIT_VERSION:-latest}"
BIN_DIR="${FABKIT_BIN_DIR:-$HOME/.local/bin}"

say() { printf '\033[1mfabkit\033[0m %s\n' "$1"; }
die() { printf '\033[31mfabkit: %s\033[0m\n' "$1" >&2; exit 1; }

need() { command -v "$1" >/dev/null 2>&1 || die "$1 is required but not installed"; }
need uname
need mktemp
if command -v curl >/dev/null 2>&1; then
  fetch() { curl -fsSL "$1" -o "$2"; }
  fetch_stdout() { curl -fsSL "$1"; }
elif command -v wget >/dev/null 2>&1; then
  fetch() { wget -qO "$2" "$1"; }
  fetch_stdout() { wget -qO- "$1"; }
else
  die "curl or wget is required"
fi

case "$(uname -s)" in
  Darwin) os=darwin ;;
  Linux)  os=linux ;;
  *)      die "unsupported OS: $(uname -s). On Windows run the PowerShell installer instead." ;;
esac

case "$(uname -m)" in
  x86_64|amd64)  arch=amd64 ;;
  arm64|aarch64) arch=arm64 ;;
  *)             die "unsupported architecture: $(uname -m)" ;;
esac

if [ "$VERSION" = "latest" ]; then
  say "looking up the latest release"
  VERSION="$(fetch_stdout "https://api.github.com/repos/${REPO}/releases/latest" \
    | sed -n 's/.*"tag_name": *"\([^"]*\)".*/\1/p' | head -n1)"
  [ -n "$VERSION" ] || die "could not determine the latest release; set FABKIT_VERSION"
fi

asset="fabkit_${VERSION#v}_${os}_${arch}.tar.gz"
url="https://github.com/${REPO}/releases/download/${VERSION}/${asset}"

tmp="$(mktemp -d)"
trap 'rm -rf "$tmp"' EXIT

say "downloading ${VERSION} for ${os}/${arch}"
fetch "$url" "$tmp/fabkit.tar.gz" || die "download failed: $url"

# Verify against the release checksums when they are published.
if fetch "https://github.com/${REPO}/releases/download/${VERSION}/checksums.txt" "$tmp/checksums.txt" 2>/dev/null; then
  if command -v shasum >/dev/null 2>&1; then
    expected="$(grep " ${asset}\$" "$tmp/checksums.txt" | awk '{print $1}')"
    actual="$(shasum -a 256 "$tmp/fabkit.tar.gz" | awk '{print $1}')"
    [ -n "$expected" ] && [ "$expected" != "$actual" ] && die "checksum mismatch for ${asset}"
  fi
fi

tar -xzf "$tmp/fabkit.tar.gz" -C "$tmp"
mkdir -p "$BIN_DIR"
install -m 0755 "$tmp/fabkit" "$BIN_DIR/fabkit" 2>/dev/null || {
  cp "$tmp/fabkit" "$BIN_DIR/fabkit"
  chmod 0755 "$BIN_DIR/fabkit"
}

say "installed to $BIN_DIR/fabkit"

case ":$PATH:" in
  *":$BIN_DIR:"*) ;;
  *)
    say "add it to your PATH:"
    printf '\n  export PATH="%s:$PATH"\n\n' "$BIN_DIR"
    ;;
esac

say "run 'fabkit' to start the wizard, or 'fabkit doctor' to check prerequisites"
