"""Build tableu-mcp-<version>.mcpb: the server compiled to a native binary with
Nuitka, packed for Claude Desktop (what a Claude Enterprise admin distributes).

    uv run --python 3.12 --with nuitka python scripts/build_mcpb.py

Run it from the server folder. Windows only, like Tableau Desktop's External
Client API. Nuitka needs a C compiler; without MSVC it downloads its own
MinGW-w64 the first time (``--assume-yes-for-downloads``).

Steps:
1. Nuitka compiles ``tableu_mcp.server`` in standalone mode into build/nuitka/,
   with the docs/ that back the ``tableu://`` resources.
2. The binary is asked over MCP for its tools and prompts, so the manifest
   lists exactly what the built server offers.
3. ``mcpb validate`` and ``mcpb pack`` (via npx, pinned) write build/*.mcpb.

Only the package itself is compiled — tests, scripts and anything that is not
``src/tableu_mcp`` never reach the bundle, and a final check refuses to pack
research notes or reverse-engineering findings if one ever appears.
"""

from __future__ import annotations

import asyncio
import json
import os
import re
import shutil
import subprocess
import sys
import tomllib
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
BUILD = ROOT / "build"
STAGE = BUILD / "mcpb"
NUITKA_OUT = BUILD / "nuitka"
MCPB = "@anthropic-ai/mcpb@2.1.2"
FORBIDDEN = [re.compile(p, re.I) for p in (r"rea-findings", r"(^|[\\/])research[\\/]", r"\.pdb$", r"(^|[\\/])tests?[\\/]")]


def step(msg: str) -> None:
    print(f"- {msg}", flush=True)


def run(*cmd: str, **kw) -> None:
    subprocess.run(cmd, check=True, **kw)


def _hyper_bin() -> Path:
    import importlib.util  # noqa: PLC0415

    spec = importlib.util.find_spec("tableauhyperapi")
    if spec is None or not spec.origin:
        raise SystemExit("tableauhyperapi is not installed in this environment (uv sync first)")
    return Path(spec.origin).parent / "bin"


def compile_server() -> Path:
    step("compiling with Nuitka (first run downloads a C compiler if none is installed)")
    entry = BUILD / "tableu-mcp.py"
    entry.write_text("from tableu_mcp.server import main\n\nmain()\n", encoding="utf-8")
    run(
        sys.executable, "-m", "nuitka",
        "--standalone",
        "--assume-yes-for-downloads",
        "--output-dir=" + str(NUITKA_OUT),
        "--output-filename=tableu-mcp.exe",
        "--include-package=tableu_mcp",
        "--include-data-dir=" + str(ROOT / "src" / "tableu_mcp" / "docs") + "=tableu_mcp/docs",
        # Extracts: the Hyper API runs its own hyperd executable from its package folder.
        "--include-package=tableauhyperapi",
        "--include-package-data=tableauhyperapi",
        # raw: hyperd.exe and its DLLs are not "data", so --include-data-dir would drop them.
        "--include-raw-dir=" + str(_hyper_bin()) + "=tableauhyperapi/bin",
        # stdio is the MCP transport: no console window tricks, no stdout noise.
        "--python-flag=-u",
        "--no-pyi-file",
        "--remove-output",
        str(entry),
        env={**os.environ, "PYTHONPATH": str(ROOT / "src")},
    )
    dist = NUITKA_OUT / "tableu-mcp.dist"
    if not (dist / "tableu-mcp.exe").exists():
        raise SystemExit(f"Nuitka did not produce {dist / 'tableu-mcp.exe'}")
    if not list(dist.glob("tableauhyperapi/bin/hyper/hyperd*")):
        raise SystemExit("hyperd is missing from the build: extracts would fail at run time")
    return dist


async def list_capabilities(exe: Path) -> tuple[list[dict], list[dict]]:
    from mcp import ClientSession, StdioServerParameters  # noqa: PLC0415
    from mcp.client.stdio import stdio_client  # noqa: PLC0415

    async with stdio_client(StdioServerParameters(command=str(exe), args=[])) as (r, w):
        async with ClientSession(r, w) as s:
            await s.initialize()
            tools = (await s.list_tools()).tools
            prompts = (await s.list_prompts()).prompts
    return (
        [{"name": t.name, "description": (t.description or "").strip().splitlines()[0][:300]} for t in tools],
        [{"name": p.name, "description": p.description or "", "text": p.description or p.name} for p in prompts],
    )


def main() -> int:
    if sys.platform != "win32":
        raise SystemExit("tableu-mcp talks to Tableau Desktop through the Windows registry and local API: build it on Windows")
    version = tomllib.loads((ROOT / "pyproject.toml").read_text(encoding="utf-8"))["project"]["version"]

    shutil.rmtree(BUILD, ignore_errors=True)
    BUILD.mkdir(parents=True)
    dist = compile_server()

    step("staging")
    shutil.copytree(dist, STAGE / "server")

    step("reading the tool list from the built binary")
    tools, prompts = asyncio.run(list_capabilities(STAGE / "server" / "tableu-mcp.exe"))
    if not tools:
        raise SystemExit("the built server lists no tools")

    manifest = json.loads((ROOT / "manifest.json").read_text(encoding="utf-8"))
    manifest.update(version=version, tools=tools, prompts=prompts)
    (STAGE / "manifest.json").write_text(json.dumps(manifest, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")

    files = [p.relative_to(STAGE).as_posix() for p in STAGE.rglob("*") if p.is_file()]
    leaked = [f for f in files if any(rx.search(f) for rx in FORBIDDEN)]
    if leaked:
        raise SystemExit(f"refusing to pack internal files: {', '.join(leaked)}")

    step("validating and packing")
    npx = shutil.which("npx") or shutil.which("npx.cmd")
    if not npx:
        raise SystemExit("npx (Node.js) is needed to run mcpb")
    out = BUILD / f"tableu-mcp-{version}.mcpb"
    run(npx, "-y", MCPB, "validate", str(STAGE / "manifest.json"))
    run(npx, "-y", MCPB, "pack", str(STAGE), str(out))
    if not out.exists():
        raise SystemExit(f"mcpb pack did not write {out}")
    print(f"\n{out.relative_to(ROOT)}: {len(tools)} tools, {len(prompts)} prompts, {len(files)} files")
    return 0


if __name__ == "__main__":
    sys.exit(main())
