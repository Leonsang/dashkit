"""Every component in the reference (tableu_mcp.components) is grounded and buildable.

1. Grounded: each XML element it names exists in xml-catalog.json (what Tableau writes in its own documents,
   or a tableu workbook Desktop 2026.3 validated), with that attribute value.
2. Buildable: its example, run through the tableu operations, produces that XML and passes the structure
   check with no error.
3. Honest: a component tableu cannot build (op None) is listed in coverage-gaps.md; one it can build names a
   real operation.
"""

from __future__ import annotations

import copy
import json
from pathlib import Path

import pytest

from tableu_mcp import authoring as A
from tableu_mcp import components, connectors, registry, structure, twb

DOCS = Path(registry.__file__).parent / "docs"
CATALOG = json.loads((DOCS / "xml-catalog.json").read_text(encoding="utf-8"))["elements"]
GAPS = (DOCS / "coverage-gaps.md").read_text(encoding="utf-8").replace(" ", "")
WITH_EXAMPLE = [c for c in components.COMPONENTS if c["example"]]


def _parse(sig: str):
    path, _, cond = sig.partition("@")
    parent, tag = path.rsplit("/", 1)
    attr, _, value = cond.partition("=")
    return parent, tag, attr or None, value or None


@pytest.fixture(scope="module")
def base(tmp_path_factory):
    d = tmp_path_factory.mktemp("comp")
    csv = d / "ventas.csv"
    csv.write_text("Region,Canal,Fecha,Importe,Coste,Nota\nNorte,Online,2025-01-01,10.5,4,4\n"
                   "Sur,Tienda,2025-02-01,20,9,5\nNorte,Tienda,2025-03-01,7.25,3,3\n", encoding="utf-8")
    root = twb.new_workbook()
    connectors.add_file_datasource(root, [f"Ventas={csv}"])
    A.create_worksheet(root, "Barras", "Ventas", rows=["Region"], cols=["SUM(Importe)"], mark="bar")
    A.create_worksheet(root, "Linea", "Ventas", cols=["MONTH_TRUNC(Fecha)"], rows=["SUM(Importe)"], mark="line")
    registry._db_create(root, "Tablero", rows=[["Barras", "Linea"]])
    return root


def _present(root, sig: str) -> bool:
    parent, tag, attr, value = _parse(sig)
    for el in root.iter():
        if not isinstance(el.tag, str) or el.tag != tag:
            continue
        p = el.getparent()
        if (p.tag if p is not None else "") != parent:
            continue
        if attr is None or (el.get(attr) is not None and (value is None or el.get(attr) == value)):
            return True
    return False


@pytest.mark.parametrize("comp", components.COMPONENTS, ids=lambda c: c["id"])
def test_component_is_grounded_in_tableau_documents(comp):
    for sig in comp["xml"]:
        parent, tag, attr, value = _parse(sig)
        spec = CATALOG.get(f"{parent}/{tag}")
        assert spec is not None, f"{sig}: Tableau never writes <{tag}> under <{parent}>"
        if attr:
            a = spec["attrs"].get(attr)
            assert a is not None, f"{sig}: Tableau never writes {attr!r} on <{tag}>"
            if value:
                assert a["values"] is None or value in a["values"], f"{sig}: value not in Tableau's documents"
    for key in ("definition", "use", "recommendation", "source"):
        assert comp[key], f"{comp['id']} has no {key}"


@pytest.mark.parametrize("comp", WITH_EXAMPLE, ids=lambda c: c["id"])
def test_component_is_built_by_tableu_with_tableau_structure(base, comp):
    root = copy.deepcopy(base)
    for obj, op, params in comp["example"]:
        registry.REGISTRY[obj][op].fn(root, **params)
    for sig in comp["xml"]:
        assert _present(root, sig), f"{comp['id']}: {obj} {op} did not write {sig}"
    errors = [f for f in structure.check(root) if f["level"] == "error"]
    assert not errors, errors


@pytest.mark.parametrize("comp", components.COMPONENTS, ids=lambda c: c["id"])
def test_component_status_is_honest(comp):
    if comp["op"] is None:
        assert any(s.replace("@", "@").replace(" ", "") in GAPS or s.split("@")[0] in GAPS for s in comp["xml"]), \
            f"{comp['id']} has no op but is not in coverage-gaps.md"
    else:
        obj, op = comp["op"].split()[:2]
        assert obj in registry.REGISTRY and op in registry.REGISTRY[obj], f"{comp['op']} is not a tableu operation"


def test_reference_renders():
    md = components.markdown()
    assert md.count("### ") == len(components.COMPONENTS)


def _xsd_vocab():
    try:
        from tableu_mcp import xsd

        return xsd.vocabulary()
    except Exception:  # noqa: BLE001 - no Tableau Desktop installed (CI)
        return None


@pytest.mark.parametrize("comp", components.COMPONENTS, ids=lambda c: c["id"])
def test_component_is_allowed_by_tableau_schema(comp):
    """Against Tableau's own XSD from the local install (skipped where Tableau Desktop is not installed)."""
    vocab = _xsd_vocab()
    if vocab is None:
        pytest.skip("Tableau Desktop not installed: no local schema")
    for sig in comp["xml"]:
        parent, tag, attr, value = _parse(sig)
        assert tag in vocab, f"{sig}: <{tag}> is not in Tableau's schema"
        if attr and not attr.startswith("user:"):
            a = vocab[tag]["attributes"].get(attr)
            assert a is not None, f"{sig}: Tableau's schema has no {attr!r} on <{tag}>"
            if value and a.get("values"):
                assert value in a["values"], f"{sig}: {value!r} not allowed; schema allows {a['values']}"


def test_components_workbook_validates_against_tableau_schema(base, tmp_path):
    """All components together in one workbook pass Tableau's XSD (the same check Desktop runs)."""
    if _xsd_vocab() is None:
        pytest.skip("Tableau Desktop not installed: no local schema")
    from tableu_mcp import xsd

    root = copy.deepcopy(base)
    for c in WITH_EXAMPLE:
        for obj, op, params in c["example"]:
            registry.REGISTRY[obj][op].fn(root, **params)
    r = xsd.validate(root)
    assert r["valid"], r["issues"][:5]
