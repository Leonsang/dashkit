"""PostToolUse hook for tableau-guardrails: lint a .twb/.twbx after Claude edits it.

Runs `tableu lint -t <file>` and answers in Claude Code's hook JSON:
- {"decision": "block", "reason": ...} when the linter reports an error, so it is fixed now;
- {"hookSpecificOutput": {"additionalContext": ...}} with the score and warnings otherwise.

Where `tableu` comes from, first match wins:
1. `tableu` on PATH (`/setup` in tableau-authoring offers `uv tool install`);
2. the tableau-authoring plugin's server in Claude Code's plugin cache (`uv --directory ... run`);
3. `uvx` straight from the dashkit repository (slow the first time, cached afterwards).
A guardrail that cannot run says so in the context; it never blocks for its own problems.
Standard library only: it runs before any project environment exists.
"""

from __future__ import annotations

import json
import shutil
import subprocess
import sys
from pathlib import Path

REPO = "git+https://github.com/leonsang/dashkit#subdirectory=bundles/tableau-authoring/server"


def emit(obj: dict) -> None:
    # ASCII-escaped JSON: the console code page on Windows would mangle accents otherwise.
    sys.stdout.write(json.dumps(obj, ensure_ascii=True))
    sys.exit(0)


def context(text: str) -> None:
    emit({"hookSpecificOutput": {"hookEventName": "PostToolUse", "additionalContext": text}})


def tableu_command() -> list[str] | None:
    exe = shutil.which("tableu")
    if exe:
        return [exe]
    uv = shutil.which("uv")
    if not uv:
        return None
    cache = Path.home() / ".claude" / "plugins" / "cache"
    if cache.exists():
        for server in sorted(cache.glob("*/tableau-authoring/*/server"), reverse=True):
            if (server / "pyproject.toml").exists():
                return [uv, "--directory", str(server), "run", "--quiet", "tableu"]
    uvx = shutil.which("uvx")
    return [uvx, "--quiet", "--from", REPO, "tableu"] if uvx else None


def main() -> None:
    try:
        data = json.loads(sys.stdin.read() or "{}")
    except json.JSONDecodeError:
        sys.exit(0)
    tool_input = data.get("tool_input") or {}
    path = tool_input.get("file_path") or tool_input.get("path") or ""
    if not path.lower().endswith((".twb", ".twbx")) or not Path(path).exists():
        sys.exit(0)

    cmd = tableu_command()
    if not cmd:
        context("tableau-guardrails: no se pudo revisar el libro: falta uv (o tableu en el PATH). "
                "Instala uv o ejecuta /setup de tableau-authoring.")
    try:
        run = subprocess.run([*cmd, "lint", "-t", str(Path(path).resolve())], capture_output=True, text=True,
                             timeout=180, encoding="utf-8", errors="replace")
        report = json.loads(run.stdout)
    except (subprocess.TimeoutExpired, json.JSONDecodeError, OSError) as e:
        context(f"tableau-guardrails: el linter no pudo ejecutarse ({type(e).__name__}); revisa el libro con "
                "workbook_operations Lint.")

    findings = report.get("findings", [])
    fmt = lambda f: f"- [{f.get('rule')}] {f.get('message')} ({f.get('location', '')})"  # noqa: E731
    errors = [f for f in findings if f.get("severity") == "error"]
    if errors:
        emit({"decision": "block",
              "reason": f"tableau-guardrails: {len(errors)} error(es) de lint en {path} (puntuación "
                        f"{report.get('score')}). Corrígelos:\n" + "\n".join(map(fmt, errors))})
    warnings = [f for f in findings if f.get("severity") == "warning"]
    text = f"tableau-guardrails: {path} — puntuación de lint {report.get('score')}, {len(warnings)} aviso(s)."
    if warnings:
        text += "\n" + "\n".join(map(fmt, warnings[:15]))
    context(text)


if __name__ == "__main__":
    main()
