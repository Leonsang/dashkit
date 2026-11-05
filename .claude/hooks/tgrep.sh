#!/bin/sh
# SessionStart: keep a tgrep search server warm for this checkout, and tell the
# agent it is there. A no-op when tgrep is not installed, so the hook is safe
# for contributors who do not use it.
command -v tgrep >/dev/null 2>&1 || exit 0

# `serve` builds the index if none exists and answers queries while it builds.
tgrep status . >/dev/null 2>&1 || { nohup tgrep serve . >/dev/null 2>&1 & }

echo "tgrep is serving this repo. For repo-wide searches prefer:"
echo "  tgrep -F -- \"literal\" .     (ripgrep flags: -t go, -g, -l, -C 2, --json)"
echo "Put -- before the pattern. Add --no-index when a search must see an edit made seconds ago."
