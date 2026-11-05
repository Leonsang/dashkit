"""Structural check of a workbook against what Tableau itself writes (docs/xml-catalog.json).

Runs without Tableau Desktop, so a workbook can be checked before it is opened (Preflight) or when Desktop
is not running. It catches what breaks a load or a validation:

- elements Tableau never writes under that parent (typos, wrong nesting, invented tags);
- forms that Desktop 2026.3 rejects although older documents use them (KNOWN_REJECTED);
- children out of the order Tableau always writes them in (schema sequences);
- attribute values outside a closed vocabulary (mark class, zone type, filter function...).

Findings: {"level": error|warning|info, "rule", "path", "message", "fix"}. Errors break loading or Desktop's
validator; warnings are unknown to the catalog (validate with Desktop before trusting them).
"""

from __future__ import annotations

import json
import re
from functools import lru_cache
from pathlib import Path

from lxml import etree

FCP = re.compile(r"^_\.fcp\.[^.]+\.(?:true|false)\.\.\.")
USER_NS = "{http://www.tableausoftware.com/xml/user}"
CATALOG = Path(__file__).parent / "docs" / "xml-catalog.json"

# Seen in Tableau's (older) documents but refused by Desktop 2026.3's validator, with the form it takes.
KNOWN_REJECTED = {
    "view/manual-sort": "Desktop 2026.3 validates <sort class='manual' column=... direction=...><dictionary>"
                        "<bucket>... instead of <manual-sort>",
}
# Attribute values whose vocabulary is closed: an unknown value is an error, not just unseen.
CLOSED = {("pane/mark", "class"), ("zone/zone", "type-v2"), ("zones/zone", "type-v2"), ("style/style-rule", "element"),
          ("filter/groupfilter", "function"), ("view/filter", "class"), ("table/rows", None)}


# Sets, not sequences: Desktop accepts these children in any order.
UNORDERED = {"document-format-change-manifest"}


def _known_good() -> dict:
    """Closed vocabularies extended with what tableu writes and Desktop 2026.3 accepted."""
    from . import twb  # noqa: PLC0415

    zones = {"text", "title", "empty", "web", "bitmap", "layout-flow", "layout-basic", "filter", "color", "size",
             "shape", "paramctrl", "highlighter", "dashboard-object"}
    marks = set(twb.MARKS.values()) | {"Automatic", "Text", "Multipolygon"}
    return {("pane/mark", "class"): marks, ("zone/zone", "type-v2"): zones, ("zones/zone", "type-v2"): zones}


def _norm(tag: str) -> str:
    return FCP.sub("", tag.replace(USER_NS, "user:")) if isinstance(tag, str) else ""


@lru_cache(maxsize=1)
def catalog() -> dict:
    return json.loads(CATALOG.read_text(encoding="utf-8"))["elements"]


def _path(el) -> str:
    parts = []
    while el is not None:
        name = el.get("name")
        parts.append(_norm(el.tag) + (f"[{name}]" if name and len(name) < 60 else ""))
        el = el.getparent()
    return "/".join(reversed(parts))


def check(root: etree._Element) -> list[dict]:
    cat = catalog()
    good = _known_good()
    out: list[dict] = []

    def add(level, rule, el, msg, fix=""):
        out.append({"level": level, "rule": rule, "path": _path(el), "message": msg, "fix": fix})

    for el in root.iter():
        if not isinstance(el.tag, str):
            continue
        parent = el.getparent()
        tag = _norm(el.tag)
        sig = f"{_norm(parent.tag) if parent is not None else ''}/{tag}"
        if sig in KNOWN_REJECTED:
            add("error", "STRUCT-REJECTED", el, f"<{tag}> under <{sig.split('/')[0]}> is rejected by Desktop 2026.3",
                KNOWN_REJECTED[sig])
            continue
        spec = cat.get(sig)
        if spec is None:
            if tag.startswith(("_.fcp", "fcp")) or parent is not None and _norm(parent.tag) == "document-format-change-manifest":
                continue
            add("warning", "STRUCT-UNKNOWN-ELEMENT", el,
                f"Tableau never writes <{tag}> inside <{sig.split('/')[0]}> in its own documents",
                "Check the nesting against xml-catalog.json, or validate with Desktop (workbook Preflight with "
                "Desktop open) before trusting it")
            continue
        for a, v in el.attrib.items():
            a = _norm(a)
            aspec = spec["attrs"].get(a)
            if aspec is None:
                add("info", "STRUCT-UNSEEN-ATTRIBUTE", el, f"attribute {a!r} is not in Tableau's documents for <{tag}>")
            elif (aspec["values"] and v not in aspec["values"] and v not in good.get((sig, a), ())
                    and not re.fullmatch(r"-?\d+(\.\d+)?", v)):
                closed = (sig, a) in CLOSED
                add("error" if closed else "info", "STRUCT-VALUE", el,
                    f"{a}={v!r} is not a value Tableau writes for <{tag}>",
                    f"Known values: {', '.join(aspec['values'][:20])}")
        # child order: a child that Tableau always writes before another must not come after it
        must_before = {} if tag in UNORDERED else spec.get("strictly_after", {})
        kids = [_norm(c.tag) for c in el if isinstance(c.tag, str)]
        reported = set()
        for i, c in enumerate(kids):
            for later in kids[i + 1:]:
                if later in must_before.get(c, []) and (later, c) not in reported:
                    reported.add((later, c))
                    add("error", "STRUCT-ORDER", el, f"<{later}> must come before <{c}> inside <{tag}>",
                        f"Tableau's order here: {', '.join(spec.get('order', []))}")
    return out


def summary(findings: list[dict]) -> dict:
    lv = {k: sum(1 for f in findings if f["level"] == k) for k in ("error", "warning", "info")}
    return {"ok": lv["error"] == 0, **lv}
