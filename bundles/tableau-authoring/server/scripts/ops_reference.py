"""Write skills/tableau-authoring/references/operaciones.md: every tableu tool and operation, with the reference
that explains it. tests/test_skill_references.py fails when the file is out of date or an operation is not
explained anywhere, so the skills cannot drift from the server.

    uv run python scripts/ops_reference.py
"""

from __future__ import annotations

from pathlib import Path

from tableu_mcp import registry

SKILLS = Path(__file__).resolve().parents[2] / "skills"
OUT = SKILLS / "tableau-authoring" / "references" / "operaciones.md"

# Where each tool is explained (paths relative to skills/).
GUIDE = {
    "desktop": ["tableau-authoring/SKILL.md", "tableau-authoring/references/revision.md"],
    "settings": ["tableau-authoring/references/comandos-de-desktop.md",
                 "tableau-authoring/references/ejes-y-formato.md"],
    "transaction": ["tableau-authoring/SKILL.md"],
    "workbook": ["tableau-authoring/references/revision.md", "tableau-authoring/SKILL.md"],
    "datasource": ["tableau-data-model/SKILL.md"],
    "field": ["tableau-data-model/SKILL.md"],
    "calculation": ["tableau-data-model/SKILL.md"],
    "parameter": ["tableau-authoring/references/filtros-y-parametros.md"],
    "group": ["tableau-authoring/references/filtros-y-parametros.md"],
    "set": ["tableau-authoring/references/filtros-y-parametros.md"],
    "bin": ["tableau-authoring/references/filtros-y-parametros.md"],
    "hierarchy": ["tableau-data-model/SKILL.md"],
    "folder": ["tableau-data-model/SKILL.md"],
    "worksheet": ["tableau-authoring/references/vistas.md", "tableau-authoring/references/tablas-y-kpis.md",
                  "tableau-authoring/references/mapas.md"],
    "filter": ["tableau-authoring/references/filtros-y-parametros.md"],
    "analytics": ["tableau-authoring/references/analitica.md"],
    "format": ["tableau-authoring/references/ejes-y-formato.md", "tableau-authoring/references/analitica.md"],
    "dashboard": ["tableau-authoring/references/dashboards.md"],
    "action": ["tableau-authoring/references/acciones-e-historias.md"],
    "story": ["tableau-authoring/references/acciones-e-historias.md"],
}

# Housekeeping operations: listed here, but they need no guidance of their own.
HOUSEKEEPING = {"List", "Get", "Delete", "Rename", "Status", "Remove", "RemoveZone", "ListZones", "ListInstances",
                "ListGroups", "ListPalettes", "DeletePalette", "ListRelationships", "ListBackups", "Rollback",
                "DisableApi", "Info", "GetXml", "New", "Layouts", "Elements", "RepositoryPath"}


def render() -> str:
    tools = registry.describe()
    lines = ["# Operaciones de tableu", "",
             "Índice generado desde el servidor (`scripts/ops_reference.py`); no lo edites a mano. Cada "
             "herramienta MCP es `<objeto>_operations` y en la CLI `tableu op <objeto> <operación>`. Con "
             "`operation=\"Help\"` cada herramienta da sus parámetros.", ""]
    for tool, info in tools.items():
        guide = ", ".join(f"`{g.removeprefix('tableau-authoring/')}`" for g in GUIDE.get(tool, []))
        lines += [f"## {tool}", "", info.get("help", ""), "", f"Guía: {guide or '—'}", "",
                  "| Operación | Parámetros |", "|---|---|"]
        for op, sig in info["operations"].items():
            params = sig.split(")")[0] + ")" if sig.startswith("(") else ""
            lines.append(f"| `{op}` | `{params}` |")
        lines.append("")
    return "\n".join(lines)


def main() -> None:
    OUT.write_text(render(), encoding="utf-8", newline="\n")
    print("wrote", OUT)


if __name__ == "__main__":
    main()
