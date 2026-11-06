"""The skills must keep up with the server: every operation is indexed and explained in its guide."""

from __future__ import annotations

import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "scripts"))

import ops_reference as R  # noqa: E402

from tableu_mcp import registry  # noqa: E402


def test_operations_index_is_up_to_date():
    assert R.OUT.read_text(encoding="utf-8") == R.render(), "run: uv run python scripts/ops_reference.py"


def test_every_tool_has_a_guide_that_exists():
    tools = registry.describe()
    assert set(tools) == set(R.GUIDE), "add the new tool to GUIDE in scripts/ops_reference.py"
    for guides in R.GUIDE.values():
        for g in guides:
            assert (R.SKILLS / g).exists(), g


def test_every_operation_is_explained_in_its_guide():
    missing = []
    for tool, info in registry.describe().items():
        text = "\n".join((R.SKILLS / g).read_text(encoding="utf-8") for g in R.GUIDE[tool])
        for op in info["operations"]:
            if op in R.HOUSEKEEPING:
                continue
            if not re.search(rf"\b{op}\b", text):
                missing.append(f"{tool} {op} (in {R.GUIDE[tool]})")
    assert not missing, "explain these operations in their guide: " + "; ".join(missing)


def test_skill_references_are_linked_from_their_skill():
    for skill in ("tableau-authoring", "tableau-design"):
        body = (R.SKILLS / skill / "SKILL.md").read_text(encoding="utf-8")
        for ref in (R.SKILLS / skill / "references").glob("*.md"):
            if ref.name == "operaciones.md" and skill == "tableau-authoring":
                assert "operaciones.md" in body
                continue
            assert f"references/{ref.name}" in body, f"{skill}/SKILL.md does not link {ref.name}"
