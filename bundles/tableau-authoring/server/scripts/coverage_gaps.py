"""What Tableau writes that tableu cannot write yet: the pool of missing tools.

    uv run python scripts/coverage_gaps.py

Compares docs/xml-catalog.json (what Tableau's own documents contain) with the string literals in
tableu's source (what it can emit) and writes src/tableu_mcp/docs/coverage-gaps.md: missing elements and
missing values of the attributes that select a feature (zone type, mark class, style element, format
attribute, filter function, action type...), ranked by how many Tableau documents use them.
"""

from __future__ import annotations

import ast
import json
import sys
from collections import defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "src" / "tableu_mcp"
CAT = json.loads((SRC / "docs" / "xml-catalog.json").read_text(encoding="utf-8"))["elements"]
OUT = SRC / "docs" / "coverage-gaps.md"

# Attributes whose value picks a feature: a missing value is a missing capability.
FEATURE_ATTRS = {
    "zone": ["type-v2"], "mark": ["class"], "style-rule": ["element"],
    "groupfilter": ["function"], "filter": ["class", "kind"], "action": ["type", "name"], "card": ["type"],
    "column-instance": ["derivation"], "connection": ["class"], "relation": ["type"], "table-calc": ["ordering-type", "type"],
    "reference-line": ["formula", "label-type", "scope", "value-column"], "encoding": ["attr", "type"],
    "trend-line": ["model-type"], "command": ["command"], "sort": ["class"], "pane": ["selection-relaxation-option"],
    "layout-cache": ["type-h", "type-w"], "bin": ["size-type"], "group": ["name-style"], "button": ["button-type"],
    "parameter": ["param-domain-type"], "column": ["param-domain-type", "role", "type", "datatype"],
}
AREA = [("dashboard", ("zone", "zones", "dashboard", "size", "devicelayout", "button", "zone-style", "flipboard")),
        ("worksheet", ("worksheet", "table", "pane", "panes", "encodings", "mark", "rows", "cols", "view")),
        ("formato", ("style", "style-rule", "format", "formatted-text", "run", "tooltip-style", "customized-label",
                     "customized-tooltip", "encoding")),
        ("filtros", ("filter", "groupfilter", "slices", "card", "cards")),
        ("acciones", ("action", "actions", "command", "param", "activation", "source", "link")),
        ("datos", ("datasource", "connection", "relation", "column", "metadata-record", "extract", "object-graph",
                   "named-connection", "refresh", "aliases", "alias", "calculation", "group", "bin", "folder",
                   "drill-path", "semantic-values", "layout", "date-options")),
        ("analítica", ("reference-line", "trend-line", "forecast", "table-calc", "distribution", "annotation",
                       "annotations", "reference-band"))]


# Modules that describe or check XML instead of writing it: their strings are not capabilities.
NOT_EMITTERS = {"components.py", "structure.py", "xsd.py", "lint.py", "server.py", "cli.py"}


def literals() -> set[str]:
    out: set[str] = set()
    for f in SRC.glob("*.py"):
        if f.name in NOT_EMITTERS:
            continue
        for node in ast.walk(ast.parse(f.read_text(encoding="utf-8"))):
            if isinstance(node, ast.Constant) and isinstance(node.value, str):
                out.add(node.value)
                out.update(node.value.replace("'", " ").replace('"', " ").replace("=", " ").replace("<", " ")
                           .replace(">", " ").replace("/", " ").replace("[", " ").replace("]", " ").replace(".", " ").split())
    return out


# Written and refreshed by Desktop itself (caches, thumbnails, UI state): not authoring features.
INTERNAL = {"thumbnail", "thumbnails", "approx-count", "precision", "scale", "semantic-value", "semantic-values",
            "explain-data", "explanation-types", "explanation-type", "device-preview", "geo-search-visibility",
            "floating-toolbar-visibility", "default-map-tool-selection", "map-navigation", "server-captions",
            "refresh", "refresh-event", "color-one-way", "bucket-selection", "mark-sizing"}
# Values Desktop writes itself when a filter action runs: the hidden "Action (Region)" groups (crossjoin of the
# action's fields, user:auto-column='sheet_link') and the state of the target's filter after a click
# (crossjoin of the clicked members, or empty-level when "exclude all values" is cleared).
INTERNAL_VALUES = {("groupfilter", "function", "crossjoin"), ("groupfilter", "function", "empty-level")}


def area(tag: str) -> str:
    if tag in INTERNAL:
        return "internos"
    return next((a for a, tags in AREA if tag in tags), "otros")


# Enumerated attributes whose values each select a feature (Tableau's XSD names them).
XSD_FEATURE_ENUMS = {("mark", "class"), ("zone", "type"), ("groupfilter", "function"), ("filter", "class"),
                     ("reference-line", "scope"), ("reference-line", "formula"), ("reference-line", "label-type"),
                     ("style-rule", "element"), ("format", "attr"), ("encoding", "type"), ("encoding", "attr"),
                     ("trendline", "fit"), ("relation", "type"), ("relation", "join"), ("column-instance", "derivation"),
                     ("table-calc", "type"), ("card", "type"), ("zone", "layout-strategy-id"), ("command", "command")}


def xsd_section(lit: set[str]) -> list[str]:
    """Gaps against Tableau's full workbook schema (needs Tableau Desktop installed)."""
    try:
        sys.path.insert(0, str(SRC.parent))
        from tableu_mcp import xsd  # noqa: PLC0415

        vocab = xsd.vocabulary()
    except Exception as e:  # noqa: BLE001
        return ["## Contra el esquema completo (XSD)", "", f"No disponible aquí: {e}", ""]
    groups: dict[str, list[str]] = defaultdict(list)
    for name, v in vocab.items():
        if name not in lit:
            ctx = ", ".join(v["contexts"][:3])
            flag = f" · requiere `{'`, `'.join(v['flags'])}`" if v["flags"] else ""
            groups[area(name)].append(f"- `<{name}>` en {ctx}{flag}")
    out = ["## Contra el esquema completo de Tableau (XSD de la instalación local)", "",
           f"El esquema define {len(vocab)} elementos. Estos son los que tableu todavía no escribe, por área, "
           "con el contexto donde van y la marca de funcionalidad que los activa. Consulta la definición completa "
           "de cualquiera con `workbook Schema element=<nombre>`.", ""]
    for a in [x for x, _ in AREA] + ["otros", "internos"]:
        if groups.get(a):
            out += [f"### {a.capitalize()} ({len(groups[a])})", ""] + sorted(groups[a]) + [""]
    vals = []
    for (el, attr) in sorted(XSD_FEATURE_ENUMS):
        spec = vocab.get(el, {}).get("attributes", {}).get(attr, {})
        missing = [x for x in spec.get("values", []) if x and x not in lit]
        if missing:
            vals.append(f"- `<{el} {attr}>`: {', '.join('`' + x + '`' for x in missing)}")
    if vals:
        out += ["### Valores que activan una función y tableu no escribe", ""] + vals + [""]
    return out


def main() -> None:
    lit = literals()
    files = defaultdict(int)
    missing_el: dict[str, list] = defaultdict(list)
    missing_val: dict[str, list] = defaultdict(list)
    for sig, e in CAT.items():
        parent, tag = sig.rsplit("/", 1)
        if "tableau" not in e["sources"]:
            continue
        if tag not in lit:
            missing_el[area(tag)].append((e["files"], sig, e["count"]))
        for a in FEATURE_ATTRS.get(tag, []):
            spec = e["attrs"].get(a)
            if not spec or not spec["values"]:
                continue
            for v in spec["values"]:
                if v not in lit:
                    where = "internos" if (tag, a, v) in INTERNAL_VALUES else area(tag)
                    missing_val[where].append((e["files"], f"{sig} @{a}={v}"))
    lines = ["# Pool de funciones que faltan en tableu",
             "",
             "Generado por `scripts/coverage_gaps.py` a partir de `xml-catalog.json`, que es la estructura de "
             "los documentos que instala Tableau Desktop 2026.3. Contiene lo que Tableau escribe y `tableu` todavía "
             "no sabe escribir, ordenado por el número de documentos de Tableau que lo usan. Cada línea es una "
             "herramienta o un parámetro candidato. Mira cómo lo escribe Tableau en `xml-catalog.json` antes de "
             "implementarlo, y valida el resultado con Desktop.",
             ""]
    for a in [x for x, _ in AREA] + ["otros", "internos"]:
        els, vals = sorted(missing_el.get(a, []), reverse=True), sorted(set(missing_val.get(a, [])), reverse=True)
        if not els and not vals:
            continue
        lines += [f"## {a.capitalize()}", ""]
        if a == "internos":
            lines += ["Desktop los escribe y los regenera al guardar (cachés, miniaturas, estado de la interfaz). "
                      "No hace falta una herramienta para ellos.", ""]
        if els:
            lines += ["Elementos:", ""] + [f"- `{s}` ({f} documentos, {c} veces)" for f, s, c in els] + [""]
        if vals:
            lines += ["Valores de atributos que activan una función:", ""] + [f"- `{s}` ({f} documentos)" for f, s in vals] + [""]
    lines += xsd_section(lit)
    OUT.write_text("\n".join(lines), encoding="utf-8")
    n = sum(len(v) for v in missing_el.values()) + sum(len(set(v)) for v in missing_val.values())
    print(f"{OUT.name}: {n} gaps")


if __name__ == "__main__":
    main()
