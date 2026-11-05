"""Authoring operations over the Tableau workbook XML: the full object model.

Every function takes the lxml ``<workbook>`` root first, mutates it and returns a small result
(name/id). They are exposed as ``<object>_operations`` MCP tools and ``tableu op`` CLI commands
through ``registry.py``. XML shapes follow the documents Tableau 2026.3 itself writes (the
shipped Superstore / World Indicators samples) and are checked with Desktop's schema validator.

Field specs used throughout (see ``twb.make_ref``)::

    Region · SUM(Sales) · AVG|MIN|MAX|COUNT|COUNTD|MEDIAN|ATTR(...) · YEAR|QUARTER|MONTH|WEEK|DAY(Order Date)
    MONTH_TRUNC(Order Date) · <calculated field caption>
    Table calcs wrap an aggregate: RUNNING_SUM(SUM(Sales)) · PCT_TOTAL(...) · RANK(...) · DIFF(...)
    PCT_DIFF(...) · MOVING_AVG(...)
"""

from __future__ import annotations

import copy
import random
import re
import uuid
from pathlib import Path

from lxml import etree

from . import twb
from .twb import Ref, _ensure, _uuid, find_datasource, make_ref, resolve_field

USER_NS = "http://www.tableausoftware.com/xml/user"
U = "{%s}" % USER_NS
WORKBOOK_ORDER = ("document-format-change-manifest", "repository-location", "preferences", "style", "datasources",
                  "datasource-relationships", "mapsources", "actions", "worksheets", "dashboards", "windows", "thumbnails")
VIEW_ORDER = ("datasources", "mapsources", "datasource-dependencies", "filter", "manual-sort", "computed-sort", "sort", "slices",
              "aggregation")
DATASOURCE_ORDER = ("repository-location", "connection", "utility-dimensions", "dimension", "overridable-settings",
                    "aliases", "column", "column-instance", "group", "mapped-images", "drill-paths",
                    "unlinked-server-hierarchies", "folders-common", "folders-parameters", "actions",
                    "calculated-members", "extract", "layout", "style", "semantic-values", "date-options",
                    "default-date-format", "default-sorts", "field-sort-info", "datasource-dependencies",
                    "explainability", "filter", "object-graph")
TABLE_ORDER = ("view", "style", "panes", "mark-layout", "rows", "cols", "table-calc-densification", "pages",
               "join-lod-include-overrides", "join-lod-exclude-overrides", "subtotals", "table-calculations",
               "show-full-range", "consider-zeros-empty", "percentages", "mark-labels", "annotations",
               "page-trail-options", "trail-overrides", "tooltip-style", "forecast-specification")
FULL = 100000


# ============================================================================================
# helpers
# ============================================================================================
def _base_tag(tag) -> str:
    # Feature-prefixed tags ("_.fcp.ObjectModelTableType.true...column") sort like their base tag.
    return tag.split("...")[-1] if isinstance(tag, str) else ""


def _insert_ordered(parent: etree._Element, el: etree._Element, order: tuple[str, ...]) -> etree._Element:
    """Insert ``el`` after every sibling of the same or an earlier kind in Tableau's element order."""
    tag = _base_tag(el.tag)
    idx = order.index(tag) if tag in order else len(order)
    for i, child in enumerate(parent):
        ctag = _base_tag(child.tag)
        cidx = order.index(ctag) if ctag in order else -1
        if cidx > idx:
            parent.insert(i, el)
            return el
    parent.append(el)
    return el


def _ds_insert(ds: etree._Element, el: etree._Element) -> etree._Element:
    return _insert_ordered(ds, el, DATASOURCE_ORDER)


def _wb_child(root: etree._Element, tag: str) -> etree._Element:
    el = root.find(tag)
    if el is None:
        el = _insert_ordered(root, etree.Element(tag), WORKBOOK_ORDER)
    return el


def _q(s: str) -> str:
    """Quote a member value the way Tableau stores it in groupfilters/aliases."""
    if s.startswith('"') or re.match(r"^-?\d+(\.\d+)?$", s) or s.startswith("#"):
        return s
    return '"' + s.replace('"', '""') + '"'


def _bracket(name: str) -> str:
    return name if name.startswith("[") else f"[{name}]"


def _worksheet(root: etree._Element, name: str) -> etree._Element:
    hits = root.xpath("./worksheets/worksheet[@name=$n]", n=name)
    if not hits:
        raise KeyError(f"Worksheet {name!r} not found. Available: {twb.sheet_names(root)['worksheets']}")
    return hits[0]


def _dashboard(root: etree._Element, name: str, storyboard: bool = False) -> etree._Element:
    hits = root.xpath("./dashboards/dashboard[@name=$n]", n=name)
    if not hits or (storyboard and hits[0].get("type") != "storyboard"):
        raise KeyError(f"{'Story' if storyboard else 'Dashboard'} {name!r} not found")
    return hits[0]


def _window(root: etree._Element, name: str) -> etree._Element:
    hits = root.xpath("./windows/window[@name=$n]", n=name)
    if not hits:
        raise KeyError(f"Window for {name!r} not found")
    return hits[0]


def _ds_column(ds: etree._Element, field_name: str, create: bool = True) -> etree._Element | None:
    """The datasource-level ``<column>`` for a field, created from its metadata if missing."""
    name = _bracket(field_name)
    for c in ds.findall("column"):
        if c.get("name") == name:
            return c
    if not create:
        return None
    f = resolve_field(ds, name)
    col = etree.Element("column", datatype=f.datatype, name=f.name, role=f.role, type=f.type)
    return _ds_insert(ds, col)


# ----- worksheet dependency registration (used by filters, encodings, sorts, analytics)
class Sheet:
    """A worksheet plus its primary datasource; registers fields in datasource-dependencies."""

    def __init__(self, root: etree._Element, name: str):
        self.root = root
        self.ws = _worksheet(root, name)
        self.view = self.ws.find("./table/view")
        dsn = self.view.find("./datasources/datasource").get("name")
        self.ds = find_datasource(root, dsn)
        self.dsn = dsn
        self.deps = self.view.find(f"./datasource-dependencies[@datasource='{dsn}']")
        if self.deps is None:
            self.deps = _insert_ordered(self.view, etree.Element("datasource-dependencies", datasource=dsn), VIEW_ORDER)

    def ref(self, spec: str) -> Ref:
        r = make_ref(self.ds, spec)
        self.register(r)
        return r

    def qname(self, r: Ref) -> str:
        return f"[{self.dsn}].{r.instance_name}"

    def register(self, r: Ref) -> None:
        if r.field.datatype == "set":
            if r.prefix == "io" and r.instance_name not in {c.get("name") for c in self.deps.findall("column-instance")}:
                etree.SubElement(self.deps, "column-instance", column=r.field.name, derivation="InOut",
                                 name=r.instance_name, pivot="key", type="nominal")
            return  # set members are referenced as [ds].[Set] and need no dependency entry
        names = {c.get("name") for c in self.deps.findall("column")}
        if r.field.name not in names:
            attrs = {"datatype": r.field.datatype, "name": r.field.name, "role": r.field.role, "type": r.field.type}
            if r.field.caption != r.field.name.strip("[]"):
                attrs = {"caption": r.field.caption, **attrs}
            src = _ds_column(self.ds, r.field.name, create=False)
            if src is not None and src.get("default-format"):
                attrs["default-format"] = src.get("default-format")
            c = etree.Element("column", attrs)
            if r.field.is_calc and r.field.formula is not None:
                etree.SubElement(c, "calculation", {"class": "tableau", "formula": r.field.formula})
            first_ci = self.deps.find("column-instance")
            (first_ci.addprevious(c) if first_ci is not None else self.deps.append(c))
        if r.instance_name not in {c.get("name") for c in self.deps.findall("column-instance")}:
            ci = etree.SubElement(self.deps, "column-instance", column=r.field.name, derivation=r.derivation,
                                  name=r.instance_name, pivot="key", type=r.ci_type)
            if r.table_calc is not None:
                ci.append(copy.deepcopy(r.table_calc))

    def pane(self, index: int = 0) -> etree._Element:
        panes = self.ws.findall("./table/panes/pane")
        if not panes:
            raise ValueError(f"Worksheet {self.ws.get('name')!r} has no panes")
        return panes[min(index, len(panes) - 1)]

    def style(self, element: str, scope: str = "table") -> etree._Element:
        """The ``<style-rule element=...>`` of the table (or of pane 0), created when missing."""
        holder = self.ws.find("./table") if scope == "table" else self.pane()
        style = holder.find("style")
        if style is None:
            style = etree.Element("style")
            if scope == "table":
                panes = holder.find("panes")
                (panes.addprevious(style) if panes is not None else holder.append(style))
            else:
                pv = holder.find("mark")
                (pv.addnext(style) if pv is not None else holder.append(style))
        rule = style.find(f"style-rule[@element='{element}']")
        if rule is None:
            rule = etree.SubElement(style, "style-rule", element=element)
        return rule


def _set_format(rule: etree._Element, attr: str, value: str, **extra: str) -> None:
    for f in rule.findall("format"):
        if f.get("attr") == attr and all(f.get(k) == v for k, v in extra.items()):
            f.set("value", value)
            return
    etree.SubElement(rule, "format", {"attr": attr, **extra, "value": value})


# ============================================================================================
# fields
# ============================================================================================
GEO_ROLES = {
    "country": "[Country].[Name]", "state": "[State].[Name]", "county": "[County].[Name]", "city": "[City].[Name]",
    "zip": "[ZipCode].[Name]", "latitude": "[Geographical].[Latitude]", "longitude": "[Geographical].[Longitude]",
    "airport": "[Airport].[Name]", "cbsa": "[CBSA].[Name]", "congress": "[CongressionalDistrict].[Name]",
}


def list_fields(root, datasource: str) -> list[dict]:
    ds = find_datasource(root, datasource)
    out = []
    for f in twb.fields(ds):
        d = f.as_dict()
        col = _ds_column(ds, f.name, create=False)
        if col is not None:
            for k in ("hidden", "default-format", "semantic-role", "aggregation"):
                if col.get(k):
                    d[k] = col.get(k)
            desc = col.find("desc")
            if desc is not None:
                d["description"] = "".join(desc.itertext()).strip()
        out.append(d)
    return out


def update_field(root, datasource: str, field: str, caption: str | None = None, role: str | None = None,
                 type: str | None = None, datatype: str | None = None, hidden: bool | None = None,  # noqa: A002
                 default_format: str | None = None, description: str | None = None,
                 aggregation: str | None = None, geo_role: str | None = None) -> dict:
    """Update a field's properties. role: dimension|measure · type: nominal|ordinal|quantitative ·
    aggregation: Sum|Avg|Min|Max|Count|CountD|Median|None · geo_role: country|state|city|zip|latitude|longitude|..."""
    ds = find_datasource(root, datasource)
    f = resolve_field(ds, field)
    col = _ds_column(ds, f.name)
    for attr, val in (("caption", caption), ("role", role), ("type", type), ("datatype", datatype),
                      ("default-format", default_format), ("aggregation", aggregation)):
        if val is not None:
            col.set(attr, val) if val != "" else col.attrib.pop(attr, None)
    if role and not type:
        col.set("type", "quantitative" if role == "measure" else ("ordinal" if f.datatype in ("date", "datetime") else "nominal"))
    if hidden is not None:
        col.set("hidden", "true") if hidden else col.attrib.pop("hidden", None)
    if geo_role is not None:
        if geo_role == "":
            col.attrib.pop("semantic-role", None)
        else:
            col.set("semantic-role", GEO_ROLES.get(geo_role.lower(), geo_role))
    if description is not None:
        old = col.find("desc")
        if old is not None:
            col.remove(old)
        if description:
            desc = etree.Element("desc")
            run = etree.SubElement(etree.SubElement(desc, "formatted-text"), "run")
            run.text = description
            calc = col.find("calculation")
            (calc.addprevious(desc) if calc is not None else col.insert(0, desc))
    return {"field": f.name, "attributes": dict(col.attrib)}


def set_aliases(root, datasource: str, field: str, aliases: dict[str, str]) -> dict:
    """Display aliases for dimension members: {"East": "Este", ...}. Empty value removes the alias."""
    ds = find_datasource(root, datasource)
    f = resolve_field(ds, field)
    col = _ds_column(ds, f.name)
    al = col.find("aliases")
    if al is None:
        al = etree.Element("aliases")
        calc = col.find("calculation")
        (calc.addnext(al) if calc is not None else col.append(al))
    for member, alias in aliases.items():
        key = _q(member)
        for a in al.findall("alias"):
            if a.get("key") == key:
                al.remove(a)
        if alias:
            etree.SubElement(al, "alias", key=key, value=alias)
    if ds.find("aliases") is None:
        _ds_aliases_flag(ds)
    return {"field": f.name, "aliases": {a.get("key"): a.get("value") for a in al.findall("alias")}}


def _ds_aliases_flag(ds):
    _ds_insert(ds, etree.Element("aliases", enabled="yes"))


# ============================================================================================
# calculations
# ============================================================================================
def list_calculations(root, datasource: str) -> list[dict]:
    ds = find_datasource(root, datasource)
    return [f.as_dict() for f in twb.fields(ds) if f.is_calc]


def update_calculation(root, datasource: str, field: str, formula: str | None = None, caption: str | None = None,
                       datatype: str | None = None, default_format: str | None = None) -> dict:
    ds = find_datasource(root, datasource)
    f = resolve_field(ds, field)
    if not f.is_calc:
        raise ValueError(f"{field!r} is not a calculated field")
    col = _ds_column(ds, f.name, create=False)
    if formula is not None:
        col.find("calculation").set("formula", formula)
    for attr, val in (("caption", caption), ("datatype", datatype), ("default-format", default_format)):
        if val:
            col.set(attr, val)
    # Keep worksheet copies in sync.
    for dep in root.iter("datasource-dependencies"):
        if dep.get("datasource") != ds.get("name"):
            continue
        for c in dep.findall("column"):
            if c.get("name") == f.name:
                if formula is not None and c.find("calculation") is not None:
                    c.find("calculation").set("formula", formula)
                if caption:
                    c.set("caption", caption)
    return {"field": f.name, "formula": col.find("calculation").get("formula")}


def delete_field(root, datasource: str, field: str, force: bool = False) -> dict:
    """Delete a calculated field / group / set / bin. Refuses when worksheets still use it."""
    ds = find_datasource(root, datasource)
    f = resolve_field(ds, field)
    users = sorted({ws.get("name") for ws in root.iter("worksheet")
                    for c in ws.iter("column") if c.get("name") == f.name})
    if users and not force:
        raise ValueError(f"{f.caption!r} is used by worksheets {users}; remove it there first or pass force=True")
    removed = 0
    for el in list(ds.findall("column")) + list(ds.findall("group")):
        if el.get("name") == f.name:
            ds.remove(el)
            removed += 1
    return {"field": f.name, "removed": removed, "usedBy": users}


# ============================================================================================
# parameters
# ============================================================================================
def _params_ds(root) -> etree._Element:
    dss = _wb_child(root, "datasources")
    p = dss.find("datasource[@name='Parameters']")
    if p is None:
        p = etree.Element("datasource", hasconnection="false", inline="true", name="Parameters", version="18.1")
        etree.SubElement(p, "aliases", enabled="yes")
        dss.insert(0, p)
    return p


def _literal(value, datatype: str) -> str:
    if datatype == "string":
        return _q(str(value))
    if datatype in ("date", "datetime"):
        v = str(value).strip("#")
        return f"#{v}#"
    if datatype == "boolean":
        return "true" if str(value).lower() in ("true", "1") else "false"
    return str(value)


def list_parameters(root) -> list[dict]:
    p = root.find("./datasources/datasource[@name='Parameters']")
    if p is None:
        return []
    out = []
    for c in p.findall("column"):
        d = {"name": c.get("name"), "caption": c.get("caption"), "datatype": c.get("datatype"),
             "value": c.get("value"), "domain": c.get("param-domain-type")}
        rng = c.find("range")
        if rng is not None:
            d["range"] = dict(rng.attrib)
        mem = c.find("members")
        if mem is not None:
            d["values"] = [m.get("value") for m in mem]
        out.append(d)
    return out


def create_parameter(root, name: str, datatype: str = "integer", value=0, domain: str = "any",
                     min=None, max=None, step=None, values: list | None = None,  # noqa: A002
                     aliases: dict | None = None, default_format: str | None = None) -> dict:
    """Create a parameter. domain: any | range (min/max/step) | list (values). Reference it in formulas as
    [Parameters].[<name>]."""
    p = _params_ds(root)
    pname = _bracket(name)
    if any(c.get("name") == pname for c in p.findall("column")):
        raise ValueError(f"Parameter {name!r} already exists")
    lit = _literal(value, datatype)
    role, typ = ("measure", "quantitative") if datatype in ("integer", "real") else ("dimension", "nominal")
    col = etree.SubElement(p, "column", caption=name, datatype=datatype, name=pname, **{"param-domain-type": domain},
                           role=role, type=typ, value=lit)
    if default_format:
        col.set("default-format", default_format)
    etree.SubElement(col, "calculation", {"class": "tableau", "formula": lit})
    if domain == "range":
        attrs = {}
        if step is not None:
            attrs["granularity"] = str(step)
        if max is not None:
            attrs["max"] = _literal(max, datatype) if datatype in ("date", "datetime") else str(max)
        if min is not None:
            attrs["min"] = _literal(min, datatype) if datatype in ("date", "datetime") else str(min)
        etree.SubElement(col, "range", attrs)
    elif domain == "list":
        if aliases:
            al = etree.SubElement(col, "aliases")
            for k, v in aliases.items():
                etree.SubElement(al, "alias", key=_literal(k, datatype), value=v)
        mem = etree.SubElement(col, "members")
        for v in values or []:
            etree.SubElement(mem, "member", value=_literal(v, datatype))
    return {"parameter": pname, "reference": f"[Parameters].{pname}"}


def update_parameter(root, name: str, value=None, min=None, max=None, step=None, values: list | None = None) -> dict:  # noqa: A002
    p = _params_ds(root)
    col = next((c for c in p.findall("column") if c.get("name") == _bracket(name) or c.get("caption") == name), None)
    if col is None:
        raise KeyError(f"Parameter {name!r} not found")
    dt = col.get("datatype")
    if value is not None:
        lit = _literal(value, dt)
        col.set("value", lit)
        col.find("calculation").set("formula", lit)
    rng = col.find("range")
    for attr, v in (("min", min), ("max", max), ("granularity", step)):
        if v is not None and rng is not None:
            rng.set(attr, str(v))
    if values is not None:
        mem = col.find("members")
        if mem is None:
            mem = etree.SubElement(col, "members")
        for m in list(mem):
            mem.remove(m)
        for v in values:
            etree.SubElement(mem, "member", value=_literal(v, dt))
    return {"parameter": col.get("name"), "value": col.get("value")}


def delete_parameter(root, name: str) -> dict:
    p = _params_ds(root)
    for c in p.findall("column"):
        if c.get("name") == _bracket(name) or c.get("caption") == name:
            p.remove(c)
            return {"deleted": c.get("name")}
    raise KeyError(f"Parameter {name!r} not found")


# ============================================================================================
# groups, sets, bins, hierarchies, folders
# ============================================================================================
def _calc_name() -> str:
    return f"[Calculation_{random.randint(10**17, 10**18 - 1)}]"  # noqa: S311


def create_group(root, datasource: str, field: str, name: str, groups: dict[str, list[str]],
                 include_other: bool = False) -> dict:
    """Group dimension members: {"Bebidas": ["Cold brew", "Frappé"], ...}. Ungrouped members keep their own
    value. (include_other is accepted but ignored: this Desktop schema has no "Other" bucket.)"""
    ds = find_datasource(root, datasource)
    f = resolve_field(ds, field)
    gname = f"[{name}]"
    col = etree.Element("column", caption=name, datatype="string", name=gname, role="dimension", type="nominal")
    calc = etree.SubElement(col, "calculation", {"class": "categorical-bin", "column": f.name, "new-bin": "true"})
    for label, members in groups.items():
        b = etree.SubElement(calc, "bin", value=_q(label))
        for m in members:
            etree.SubElement(b, "value").text = _literal(m, f.datatype)
    _append_column(ds, col)
    return {"field": gname}


def create_set(root, datasource: str, field: str, name: str, members: list[str] | None = None,
               condition: str | None = None, top: int | None = None, by: str | None = None,
               direction: str = "top") -> dict:
    """A set on a dimension, defined by explicit members, a condition formula (e.g. 'SUM([Sales]) > 1000'),
    or top/bottom N by an aggregate formula (top=10, by='SUM([Sales])', direction top|bottom)."""
    ds = find_datasource(root, datasource)
    f = resolve_field(ds, field)
    g = etree.Element("group", name=f"[{name}]", **{"name-style": "unqualified"})
    level = f.name
    if members is not None:
        g.set(U + "ui-builder", "identifier-list")
        u = etree.SubElement(g, "groupfilter", function="union")
        u.set(U + "ui-enumeration", "inclusive")
        for m in members:
            etree.SubElement(u, "groupfilter", function="member", level=level, member=_literal(m, f.datatype))
    elif top is not None:
        if not by:
            raise ValueError("top N sets need by='SUM([Measure])'")
        g.set(U + "ui-builder", "filter-group")
        e = etree.SubElement(g, "groupfilter", count=str(top), end=direction, function="end", units="records")
        e.set(U + "ui-marker", "end")
        o = etree.SubElement(e, "groupfilter", direction="DESC" if direction == "top" else "ASC", expression=by,
                             function="order")
        lm = etree.SubElement(o, "groupfilter", function="level-members", level=level)
        lm.set(U + "ui-enumeration", "all")
        lm.set(U + "ui-marker", "enumerate")
    elif condition:
        g.set(U + "ui-builder", "filter-group")
        c = etree.SubElement(g, "groupfilter", expression=condition, function="filter")
        c.set(U + "ui-marker", "filter")
        lm = etree.SubElement(c, "groupfilter", function="level-members", level=level)
        lm.set(U + "ui-enumeration", "all")
        lm.set(U + "ui-marker", "enumerate")
    else:
        raise ValueError("Give members, condition, or top+by")
    _ds_insert(ds, g)
    return {"set": g.get("name")}


def create_bin(root, datasource: str, field: str, size: float | None = None, name: str | None = None,
               size_parameter: str | None = None) -> dict:
    """Bins over a measure (histograms). size fixed, or size_parameter=<parameter name>."""
    ds = find_datasource(root, datasource)
    f = resolve_field(ds, field)
    bname = f"[{name or f.caption + ' (bin)'}]"
    if any(c.get("name") == bname for c in ds.findall("column")):
        raise ValueError(f"{bname} already exists in {datasource}; pass another name")
    col = etree.Element("column", caption=bname.strip("[]"), datatype="integer", name=bname, role="dimension",
                        type="ordinal")
    attrs = {"class": "bin", "decimals": "0", "formula": f.name, "peg": "0"}
    if size_parameter:
        attrs["size-parameter"] = f"[Parameters].{_bracket(size_parameter)}"
    else:
        attrs["size"] = str(size or 10)
    etree.SubElement(col, "calculation", attrs)
    _append_column(ds, col)
    return {"field": bname}


def _append_column(ds, col):
    _ds_insert(ds, col)


def create_hierarchy(root, datasource: str, name: str, fields: list[str]) -> dict:
    """Drill-down hierarchy, top level first: ['Category', 'Sub-Category', 'Product Name']."""
    ds = find_datasource(root, datasource)
    dp = ds.find("drill-paths")
    if dp is None:
        dp = _ds_insert(ds, etree.Element("drill-paths"))
    for old in dp.findall("drill-path"):
        if old.get("name") == name:
            dp.remove(old)
    path = etree.SubElement(dp, "drill-path", name=name)
    for fl in fields:
        etree.SubElement(path, "field").text = resolve_field(ds, fl).name
    return {"hierarchy": name, "levels": [e.text for e in path]}


def create_folder(root, datasource: str, name: str, fields: list[str]) -> dict:
    """Organize fields in a Data-pane folder."""
    ds = find_datasource(root, datasource)
    fc = ds.find("folders-common")
    if fc is None:
        fc = _ds_insert(ds, etree.Element("folders-common"))
    for old in fc.findall("folder"):
        if old.get("name") == name:
            fc.remove(old)
    folder = etree.SubElement(fc, "folder", name=name)
    for fl in fields:
        etree.SubElement(folder, "folder-item", name=resolve_field(ds, fl).name, type="field")
    return {"folder": name, "items": [i.get("name") for i in folder]}


def delete_structure(root, datasource: str, kind: str, name: str) -> dict:
    """Delete a hierarchy (kind=hierarchy), folder (kind=folder) or set (kind=set)."""
    ds = find_datasource(root, datasource)
    xp = {"hierarchy": "./drill-paths/drill-path", "folder": "./folders-common/folder", "set": "./group"}[kind]
    for el in ds.xpath(xp):
        if el.get("name") in (name, f"[{name}]"):
            el.getparent().remove(el)
            return {"deleted": name}
    raise KeyError(f"{kind} {name!r} not found")


# ============================================================================================
# datasources: database connections, relationships, datasource filters, rename/delete
# ============================================================================================
DB_DEFAULT_PORTS = {"postgres": 5432, "sqlserver": 1433, "mysql": 3306, "oracle": 1521, "redshift": 5439,
                    "teradata": 1025, "snowflake": 443, "databricks": 443, "bigquery": None, "sqlite": None}


def create_database_datasource(root, kind: str, server: str, database: str, table: str | None = None,
                               schema: str | None = None, custom_sql: str | None = None, caption: str | None = None,
                               username: str = "", port: int | None = None, warehouse: str | None = None,
                               http_path: str | None = None, authentication: str = "username-password",
                               columns: dict[str, str] | None = None) -> dict:
    """Live connection to a database. kind: postgres|sqlserver|mysql|oracle|redshift|snowflake|databricks|
    teradata|bigquery (Tableau connection class). Give table (+schema) or custom_sql. Passwords are never
    stored: Desktop asks for them when it connects. columns {name: datatype} is optional; without it Desktop
    reads the schema on first connection."""
    cls = kind.lower()
    nc_name = f"{cls}.{''.join(random.choice('0123456789abcdefghijklmnopqrstuvwxyz') for _ in range(28))}"  # noqa: S311
    attrs = {"class": cls, "dbname": database, "server": server, "username": username,
             "authentication": authentication}
    p = port or DB_DEFAULT_PORTS.get(cls)
    if p:
        attrs["port"] = str(p)
    if schema:
        attrs["schema"] = schema
    if warehouse:
        attrs["warehouse"] = warehouse
    if http_path:
        attrs["v-http-path"] = http_path
    if cls == "sqlserver":
        attrs.setdefault("authentication", "sqlserver")
    ds = etree.Element("datasource", inline="true", version="18.1")
    fed = etree.SubElement(ds, "connection", {"class": "federated"})
    named = etree.SubElement(etree.SubElement(fed, "named-connections"), "named-connection",
                             caption=server, name=nc_name)
    etree.SubElement(named, "connection", attrs)
    if custom_sql:
        rel = etree.SubElement(fed, "relation", connection=nc_name, name="Custom SQL Query", type="text")
        rel.text = custom_sql
        rel_name = "Custom SQL Query"
    else:
        if not table:
            raise ValueError("Give table or custom_sql")
        full = f"[{schema}].[{table}]" if schema else f"[{table}]"
        rel = etree.SubElement(fed, "relation", connection=nc_name, name=table, table=full, type="table")
        rel_name = table
    if columns:
        rel_cols = etree.SubElement(rel, "columns") if not custom_sql else None
        mrs = etree.SubElement(fed, "metadata-records")
        for i, (cname, dt) in enumerate(columns.items()):
            if rel_cols is not None:
                etree.SubElement(rel_cols, "column", datatype=dt, name=cname, ordinal=str(i))
            mr = etree.SubElement(mrs, "metadata-record", {"class": "column"})
            for tag, text in (("remote-name", cname), ("remote-type", "129"), ("local-name", f"[{cname}]"),
                              ("parent-name", f"[{rel_name}]"), ("remote-alias", cname), ("ordinal", str(i)),
                              ("local-type", dt), ("aggregation", "Sum" if dt in ("integer", "real") else "Count"),
                              ("contains-null", "true")):
                etree.SubElement(mr, tag).text = text
    etree.SubElement(ds, "aliases", enabled="yes")
    name = twb.embed_datasource(root, ds, caption or f"{rel_name} ({cls})")
    return {"name": name, "caption": caption or f"{rel_name} ({cls})", "connectionClass": cls}


def rename_datasource(root, datasource: str, caption: str) -> dict:
    ds = find_datasource(root, datasource)
    ds.set("caption", caption)
    for el in root.iter("datasource"):
        if el.get("name") == ds.get("name") and el is not ds:
            el.set("caption", caption)
    return {"name": ds.get("name"), "caption": caption}


def delete_datasource(root, datasource: str, force: bool = False) -> dict:
    ds = find_datasource(root, datasource)
    users = sorted({ws.get("name") for ws in root.iter("worksheet")
                    for d in ws.iter("datasource") if d.get("name") == ds.get("name")})
    if users and not force:
        raise ValueError(f"Datasource used by worksheets {users}; delete them first or pass force=True")
    ds.getparent().remove(ds)
    return {"deleted": ds.get("name"), "usedBy": users}


def list_relationships(root, datasource: str) -> list[dict]:
    ds = find_datasource(root, datasource)
    objs = {o.get("id"): o.get("caption") for o in ds.iter("object")}
    out = []
    for r in ds.iter("relationship"):
        ex = [e.get("op") for e in r.find("expression")]
        out.append({"from": objs.get(r.find("first-end-point").get("object-id")),
                    "to": objs.get(r.find("second-end-point").get("object-id")), "on": ex})
    return out


def add_datasource_filter(root, datasource: str, field: str, values: list[str] | None = None,
                          exclude: bool = False, min=None, max=None) -> dict:  # noqa: A002
    """Data-source filter (applies to every sheet using it): categorical values, or a min/max range."""
    ds = find_datasource(root, datasource)
    f = resolve_field(ds, field)
    flt = _build_filter(f.name, f.name, f.datatype, values=values, exclude=exclude, min=min, max=max)
    _ds_insert(ds, flt)
    return {"datasource": ds.get("caption"), "filter": f.name}


# ============================================================================================
# worksheet filters
# ============================================================================================
def _build_filter(column: str, level: str, datatype: str, values=None, exclude=False, min=None, max=None,  # noqa: A002
                  relative: dict | None = None, top: dict | None = None, condition: str | None = None,
                  wildcard: str | None = None) -> etree._Element:
    if relative:
        flt = etree.Element("filter", {"class": "relative-date", "column": column})
        flt.set("first-period", str(relative.get("from", -1)))
        flt.set("include-future", "true")
        flt.set("include-null", "false")
        flt.set("last-period", str(relative.get("to", 0)))
        flt.set("period-type", relative.get("period", "year"))
        return flt
    if min is not None or max is not None:
        flt = etree.Element("filter", {"class": "quantitative", "column": column,
                                       "included-values": "in-range" if (min is not None and max is not None)
                                       else ("in-range-or-null" if False else ("at-least" if min is not None else "at-most"))})
        if min is not None:
            etree.SubElement(flt, "min").text = _literal(min, datatype) if datatype in ("date", "datetime") else str(min)
        if max is not None:
            etree.SubElement(flt, "max").text = _literal(max, datatype) if datatype in ("date", "datetime") else str(max)
        return flt
    flt = etree.Element("filter", {"class": "categorical", "column": column})
    if top:
        e = etree.SubElement(flt, "groupfilter", count=str(top.get("n", 10)), end=top.get("direction", "top"),
                             function="end", units="records")
        e.set(U + "ui-marker", "end")
        e.set(U + "ui-top-by-field", "true")
        o = etree.SubElement(e, "groupfilter", direction="DESC" if top.get("direction", "top") == "top" else "ASC",
                             expression=top["by"], function="order")
        lm = etree.SubElement(o, "groupfilter", function="level-members", level=level)
        lm.set(U + "ui-enumeration", "all")
        lm.set(U + "ui-marker", "enumerate")
        return flt
    if condition or wildcard:
        expr = condition or f'CONTAINS({level.split(":")[1] if ":" in level else level}, "{wildcard}")'
        if wildcard:
            fname = level.split(":")[1] if ":" in level else level.strip("[]")
            expr = f'CONTAINS([{fname}], "{wildcard}")'
        c = etree.SubElement(flt, "groupfilter", expression=expr, function="filter")
        c.set(U + "ui-marker", "filter")
        lm = etree.SubElement(c, "groupfilter", function="level-members", level=level)
        lm.set(U + "ui-enumeration", "all")
        lm.set(U + "ui-marker", "enumerate")
        return flt
    members = [etree.Element("groupfilter", function="member", level=level, member=_literal(v, datatype))
               for v in values or []]
    if exclude:
        ex = etree.SubElement(flt, "groupfilter", function="except")
        ex.set(U + "ui-domain", "database")
        ex.set(U + "ui-enumeration", "exclusive")
        etree.SubElement(ex, "groupfilter", function="level-members", level=level)
        if len(members) == 1:
            ex.append(members[0])
        else:
            u = etree.SubElement(ex, "groupfilter", function="union")
            for m in members:
                u.append(m)
    elif len(members) == 1:
        m = members[0]
        m.set(U + "ui-domain", "database")
        m.set(U + "ui-enumeration", "inclusive")
        m.set(U + "ui-marker", "enumerate")
        flt.append(m)
    else:
        u = etree.SubElement(flt, "groupfilter", function="union")
        u.set(U + "ui-domain", "database")
        u.set(U + "ui-enumeration", "inclusive")
        u.set(U + "ui-marker", "enumerate")
        for m in members:
            u.append(m)
    return flt


def add_filter(root, worksheet: str, field: str, values: list[str] | None = None, exclude: bool = False,
               min=None, max=None, relative: dict | None = None, top: dict | None = None,  # noqa: A002
               condition: str | None = None, wildcard: str | None = None, context: bool = False,
               show_card: bool = False, card_mode: str | None = None, group: int | None = None) -> dict:
    """Filter a worksheet. One of: values (+exclude) · min/max (measures 'SUM(Sales)' or dates) ·
    relative={'period': 'month', 'from': -11, 'to': 0} · top={'n': 10, 'by': 'SUM([Sales])', 'direction': 'top'} ·
    condition='SUM([Sales]) > 1000' · wildcard='abc'. context=True makes it a context filter.
    show_card adds the interactive filter card (card_mode: checkdropdown|dropdown|radiolist|checklist|slider|
    typein|pattern)."""
    sh = Sheet(root, worksheet)
    if relative and not re.match(r"^\s*[A-Z_]+\(", field):
        field = f"DAY_TRUNC({field})"
    if (min is not None or max is not None) and not re.match(r"^\s*[A-Z_]+\(", field):
        f = resolve_field(sh.ds, field)
        if f.datatype in ("date", "datetime"):
            field = f"DAY_TRUNC({field})"
    r = sh.ref(field)
    if relative:  # relative-date filters sit on the continuous (none:...:qk) date
        r = Ref(r.field, "None", "none", "qk", "quantitative")
        sh.register(r)
    col = sh.qname(r)
    member_type = "integer" if r.prefix in ("yr", "qr", "mn", "wk", "dy", "wd") else r.field.datatype
    flt = _build_filter(col, r.instance_name, member_type, values=values, exclude=exclude, min=min, max=max,
                        relative=relative, top=top, condition=condition, wildcard=wildcard)
    if context:
        flt.set("context", "true")
    if group is not None:  # shared with every sheet whose filter carries the same group (see add_shared_filter)
        flt.set("filter-group", str(group))
    for old in sh.view.findall("filter"):
        if old.get("column") == col:
            sh.view.remove(old)
    _insert_ordered(sh.view, flt, VIEW_ORDER)
    if flt.get("class") != "quantitative" or r.ci_type != "quantitative":
        slices = sh.view.find("slices")
        if slices is None:
            slices = _insert_ordered(sh.view, etree.Element("slices"), VIEW_ORDER)
        if col not in [c.text for c in slices]:
            etree.SubElement(slices, "column").text = col
    if show_card:
        add_card(root, worksheet, "filter", field_qname=col, mode=card_mode)
    return {"worksheet": worksheet, "filter": col, "class": flt.get("class")}


def add_shared_filter(root, worksheets: list[str], field: str, card_on: str | None = None, **kwargs) -> dict:
    """One filter shared by several worksheets ("Apply to worksheets > selected"): the same filter on each,
    tied together by a filter-group number, as Tableau writes it. Changing it on one sheet, or through its
    card on a dashboard, changes it on all. card_on names the sheet that gets the filter card (default the
    first); other arguments as for Add (values, exclude, min/max, relative, ...)."""
    if not worksheets:
        raise ValueError("worksheets must name at least one sheet")
    used = [int(g) for g in root.xpath("//filter/@filter-group") if str(g).isdigit()]
    group = max([1, *used]) + 1
    card_on = card_on or worksheets[0]
    want_card = kwargs.pop("show_card", True)
    out = [add_filter(root, ws, field, group=group, show_card=want_card and ws == card_on, **kwargs) for ws in worksheets]
    return {"group": group, "field": field, "worksheets": worksheets, "card": card_on, "filters": out}


def remove_filter(root, worksheet: str, field: str) -> dict:
    sh = Sheet(root, worksheet)
    removed = []
    target = field.strip("[]").lower()
    for flt in sh.view.findall("filter"):
        col = flt.get("column")
        if target in col.lower():
            sh.view.remove(flt)
            removed.append(col)
            slices = sh.view.find("slices")
            if slices is not None:
                for c in list(slices):
                    if c.text == col:
                        slices.remove(c)
                if len(slices) == 0:
                    sh.view.remove(slices)
    win = _window(root, worksheet)
    for card in win.iter("card"):
        if card.get("param") in removed:
            card.getparent().remove(card)
    return {"removed": removed}


def list_filters(root, worksheet: str) -> list[dict]:
    sh = Sheet(root, worksheet)
    return [{"column": f.get("column"), "class": f.get("class"), "context": f.get("context") == "true",
             "xml": etree.tostring(f, encoding="unicode")[:400]} for f in sh.view.findall("filter")]


def add_card(root, worksheet: str, card_type: str, field_qname: str | None = None, mode: str | None = None,
             parameter: str | None = None) -> dict:
    """Show a card in the worksheet window: filter (field) · parameter · color/size/shape legend · caption ·
    summary · highlighter."""
    win = _window(root, worksheet)
    cards = win.find("cards")
    right = cards.find("edge[@name='right']")
    if right is None:
        right = etree.SubElement(cards, "edge", name="right")
        etree.SubElement(right, "strip", size="160")
    strip = right.find("strip")
    attrs = {"type": card_type}
    if card_type == "parameter":
        attrs["param"] = f"[Parameters].{_bracket(parameter)}"
    elif field_qname:
        attrs["param"] = field_qname
    if card_type in ("color", "size", "shape"):
        attrs["pane-specification-id"] = "0"
    if mode:
        attrs["mode"] = mode
    for c in strip.findall("card"):
        if c.get("type") == card_type and c.get("param") == attrs.get("param"):
            return {"card": attrs, "existing": True}
    etree.SubElement(strip, "card", attrs)
    return {"card": attrs}


# ============================================================================================
# worksheets: create/update/duplicate, encodings, sorting, totals, analytics, formatting
# ============================================================================================
def create_worksheet(root, name: str, datasource: str, rows=None, cols=None, mark="automatic", color=None,
                     size=None, label=None, detail=None, tooltip=None, shape=None, path=None, angle=None,
                     pages=None, title=None, sort_desc_by=None, sort: dict | None = None, filters: list | None = None,
                     totals: dict | None = None, mark_color: str | None = None, show_labels: bool = False) -> dict:
    """Create a worksheet in one call. Shelves take field specs; encodings: color size label detail[] tooltip[]
    shape path angle; pages; sort={'field': 'Category', 'by': 'SUM(Sales)', 'direction': 'DESC'};
    filters=[{...add_filter args}]; totals={'rows': True, 'cols': True}."""
    twb.add_worksheet(root, name, datasource, rows=rows, cols=cols, mark=mark, color=color, size=size, label=label,
                      detail=detail, tooltip=tooltip, title=title, sort_desc_by=sort_desc_by)
    sh = Sheet(root, name)
    if mark.lower() == "map" and not rows and not cols:
        make_map(root, name)
    orient_table_calcs(root, name)
    for kind, spec in (("shape", shape), ("path", path), ("wedge-size", angle)):
        if spec:
            set_encoding(root, name, kind, spec)
    if pages:
        set_shelf(root, name, "pages", [pages])
    if sort:
        set_sort(root, name, **sort)
    for flt in filters or []:
        add_filter(root, name, **flt)
    if totals:
        set_totals(root, name, **totals)
    if mark_color or show_labels:
        format_marks(root, name, color=mark_color, show_labels=show_labels or None)
    return {"worksheet": name}


def make_map(root, worksheet: str, filled: bool = True) -> dict:
    """Turn a worksheet with a geographic dimension (geo role) on Detail into a map: generated
    latitude/longitude on the shelves, the Tableau basemap, and filled polygons (or symbols)."""
    sh = Sheet(root, worksheet)
    table = sh.ws.find("table")
    table.find("rows").text = f"[{sh.dsn}].[Latitude (generated)]"
    table.find("cols").text = f"[{sh.dsn}].[Longitude (generated)]"
    if root.find("mapsources") is None:
        ms = _insert_ordered(root, etree.Element("mapsources"), WORKBOOK_ORDER)
        etree.SubElement(ms, "mapsource", name="Tableau")
    if sh.view.find("mapsources") is None:
        vms = _insert_ordered(sh.view, etree.Element("mapsources"), VIEW_ORDER)
        etree.SubElement(vms, "mapsource", name="Tableau")
    p = sh.pane()
    p.find("mark").set("class", "Multipolygon" if filled else "Automatic")
    if filled:
        encs = p.find("encodings")
        if encs is None:
            encs = etree.Element("encodings")
            p.find("mark").addnext(encs)
        if encs.find("geometry") is None:
            etree.SubElement(encs, "geometry", column=f"[{sh.dsn}].[Geometry (generated)]")
    return {"worksheet": worksheet, "map": "filled" if filled else "symbol"}


def describe_worksheet(root, worksheet: str) -> dict:
    sh = Sheet(root, worksheet)
    table = sh.ws.find("table")
    panes = []
    for p in table.findall("./panes/pane"):
        encs = p.find("encodings")
        panes.append({"mark": p.find("mark").get("class") if p.find("mark") is not None else None,
                      "encodings": [{e.tag: e.get("column")} for e in (encs if encs is not None else [])],
                      "analytics": [e.tag for e in p if e.tag in ("reference-line", "trendline")]})
    title = sh.ws.find("./layout-options/title")
    return {"name": worksheet, "datasource": sh.ds.get("caption"),
            "rows": table.findtext("rows"), "cols": table.findtext("cols"), "pages": table.findtext("pages"),
            "title": "".join(title.itertext()).strip() if title is not None else None,
            "panes": panes, "filters": [f.get("column") for f in sh.view.findall("filter")],
            "sorts": [dict(s.attrib) for s in sh.view if s.tag in ("sort", "computed-sort", "manual-sort")],
            "totals": {"rows": table.find("rows").get("total") == "true", "cols": table.find("cols").get("total") == "true"}}


def set_shelf(root, worksheet: str, shelf: str, fields: list[str]) -> dict:
    """Replace a shelf: rows | cols | pages. '+' joins measures on one shared axis: ['SUM(Sales) + SUM(Profit)']."""
    sh = Sheet(root, worksheet)
    table = sh.ws.find("table")
    parts = []
    for spec in fields:
        if "+" in spec and "(" in spec:
            refs = [sh.ref(s.strip()) for s in spec.split("+")]
            parts.append("(" + " + ".join(sh.qname(r) for r in refs) + ")")
        else:
            parts.append(sh.qname(sh.ref(spec)))
    el = table.find(shelf)
    if shelf == "pages":
        if el is not None:
            table.remove(el)
        if parts:
            el = _insert_ordered(table, etree.Element("pages"), TABLE_ORDER)
            for q in parts:
                etree.SubElement(el, "column").text = q
        return {"worksheet": worksheet, "pages": parts}
    if el is None:
        el = _insert_ordered(table, etree.Element(shelf), TABLE_ORDER)
    el.text = " / ".join(parts) or None
    orient_table_calcs(root, worksheet)
    return {"worksheet": worksheet, shelf: el.text}


def orient_table_calcs(root, worksheet: str, direction: str | None = None) -> dict:
    """Point quick table calcs along the view's dimension: 'down' (dimension on rows) or 'across'
    (dimension/date on columns). Auto-detected unless direction is given."""
    sh = Sheet(root, worksheet)
    table = sh.ws.find("table")
    rows, cols = table.findtext("rows") or "", table.findtext("cols") or ""
    if direction is None:
        dim = re.compile(r":(nk|ok)\]|\[t(yr|qr|mn|wk|dy):")
        direction = "across" if dim.search(cols) else ("down" if dim.search(rows) else "across")
    ordering = "Columns" if direction == "down" else "Rows"
    n = 0
    for tc in sh.deps.iter("table-calc"):
        if tc.get("ordering-type") in ("Rows", "Columns"):
            tc.set("ordering-type", ordering)
            n += 1
    return {"worksheet": worksheet, "direction": direction, "tableCalcs": n}


def set_mark(root, worksheet: str, mark: str, pane: int = 0) -> dict:
    sh = Sheet(root, worksheet)
    p = sh.pane(pane)
    p.find("mark").set("class", twb.MARKS.get(mark.lower(), mark))
    return {"worksheet": worksheet, "mark": p.find("mark").get("class")}


def set_encoding(root, worksheet: str, encoding: str, field: str | None, pane: int = 0) -> dict:
    """Put a field on a Marks card: color | size | text(label) | lod(detail) | tooltip | shape | path |
    wedge-size(angle). field=None clears that encoding (detail/tooltip clear all)."""
    enc_tag = {"label": "text", "detail": "lod", "angle": "wedge-size"}.get(encoding, encoding)
    sh = Sheet(root, worksheet)
    p = sh.pane(pane)
    encs = p.find("encodings")
    if encs is None:
        encs = etree.Element("encodings")
        anchor = p.find("style")
        (anchor.addprevious(encs) if anchor is not None else p.find("mark").addnext(encs))
    multi = enc_tag in ("lod", "tooltip")
    if not multi or field is None:
        for e in encs.findall(enc_tag):
            encs.remove(e)
    if field:
        r = sh.ref(field)
        etree.SubElement(encs, enc_tag, column=sh.qname(r))
    if len(encs) == 0:
        p.remove(encs)
    return {"worksheet": worksheet, "encoding": enc_tag, "field": field}


def set_sort(root, worksheet: str, field: str, by: str | None = None, direction: str = "DESC",
             order: list[str] | None = None) -> dict:
    """Sort a dimension by a measure (by='SUM(Sales)'), alphabetically (by=None), or manually (order=[...])."""
    sh = Sheet(root, worksheet)
    dim = sh.ref(field)
    col = sh.qname(dim)
    for s in list(sh.view):
        if s.tag in ("sort", "computed-sort", "manual-sort") and s.get("column") == col:
            sh.view.remove(s)
    if order:
        s = etree.Element("sort", {"class": "manual", "column": col, "direction": "ASC"})
        dic = etree.SubElement(s, "dictionary")
        for v in order:
            etree.SubElement(dic, "bucket").text = _literal(v, dim.field.datatype)
    elif by:
        m = sh.ref(by)
        s = etree.Element("sort", {"class": "computed", "column": col, "direction": direction.upper(),
                                   "using": sh.qname(m)})
    else:
        s = etree.Element("sort", {"class": "alphabetic", "column": col, "direction": direction.upper()})
    _insert_ordered(sh.view, s, VIEW_ORDER)
    return {"worksheet": worksheet, "sort": dict(s.attrib)}


def set_totals(root, worksheet: str, rows: bool | None = None, cols: bool | None = None,
               subtotals: list[str] | None = None) -> dict:
    """Grand totals (rows/cols) and subtotals for the given dimensions."""
    sh = Sheet(root, worksheet)
    table = sh.ws.find("table")
    for shelf, val in (("rows", rows), ("cols", cols)):
        if val is not None:
            el = table.find(shelf)
            el.set("total", "true") if val else el.attrib.pop("total", None)
    if subtotals is not None:
        old = table.find("subtotals")
        if old is not None:
            table.remove(old)
        if subtotals:
            st = etree.Element("subtotals")
            for spec in subtotals:
                etree.SubElement(st, "column").text = sh.qname(sh.ref(spec))
            _insert_ordered(table, st, TABLE_ORDER)
    return describe_worksheet(root, worksheet)["totals"]


def set_dual_axis(root, worksheet: str, measures: list[str], shelf: str = "rows", marks: list[str] | None = None,
                  synchronize: bool = True) -> dict:
    """Dual axis: two measures overlaid on one shelf, each with its own mark type (e.g. bar + line)."""
    if len(measures) != 2:
        raise ValueError("A dual axis needs exactly two measures")
    sh = Sheet(root, worksheet)
    refs = [sh.ref(m) for m in measures]
    q = [sh.qname(r) for r in refs]
    table = sh.ws.find("table")
    table.find(shelf).text = f"({q[0]} + {q[1]})"
    panes = table.find("panes")
    base = panes.find("pane")
    for p in list(panes)[1:]:
        panes.remove(p)
    marks = marks or ["bar", "line"]
    axis_attr = "y-axis-name" if shelf == "rows" else "x-axis-name"
    for i, (qn, mk) in enumerate(zip(q, marks, strict=True), 1):
        p = copy.deepcopy(base)
        p.set("id", str(i))
        p.set(axis_attr, qn)
        p.find("mark").set("class", twb.MARKS.get(mk.lower(), mk))
        panes.append(p)
    rule = sh.style("axis")
    for e in list(rule.findall("encoding")):
        if e.get("field") == q[1] and e.get("attr") == "space":
            rule.remove(e)
    attrs = {"attr": "space", "class": "0", "field": q[1], "field-type": "quantitative", "fold": "true",
             "scope": shelf, "type": "space"}
    if synchronize:
        attrs["synchronized"] = "true"
    etree.SubElement(rule, "encoding", attrs)
    return {"worksheet": worksheet, shelf: table.find(shelf).text, "panes": len(panes)}


def set_shared_axis(root, worksheet: str, measures: list[str], shelf: str = "rows") -> dict:
    """Several measures on one shared axis (Measure Names / Measure Values), colored by measure."""
    sh = Sheet(root, worksheet)
    refs = [sh.ref(m) for m in measures]
    table = sh.ws.find("table")
    table.find(shelf).text = f"[{sh.dsn}].[Multiple Values]"
    mn = f"[{sh.dsn}].[:Measure Names]"
    for old in sh.view.findall("filter"):
        if old.get("column") == mn:
            sh.view.remove(old)
    flt = etree.Element("filter", {"class": "categorical", "column": mn})
    u = etree.SubElement(flt, "groupfilter", function="union")
    u.set(U + "op", "manual")
    for r in refs:
        etree.SubElement(u, "groupfilter", function="member", level="[:Measure Names]", member=f'"{sh.qname(r)}"')
    _insert_ordered(sh.view, flt, VIEW_ORDER)
    set_encoding(root, worksheet, "color", None)
    p = sh.pane()
    encs = p.find("encodings")
    if encs is None:
        encs = etree.Element("encodings")
        p.find("mark").addnext(encs)
    etree.SubElement(encs, "color", column=mn)
    return {"worksheet": worksheet, shelf: table.find(shelf).text, "measures": [sh.qname(r) for r in refs]}


TREND_FITS = {"linear": "linear", "log": "log", "logarithmic": "log", "exp": "exp", "exponential": "exp",
              "poly": "polynomial", "polynomial": "polynomial", "power": "power"}


def add_reference_line(root, worksheet: str, measure: str, formula: str = "average", scope: str = "per-table",
                       value: float | None = None, label: str | None = None, color: str | None = None,
                       band_to: str | None = None) -> dict:
    """Reference line on a measure's axis. formula: average|median|sum|min|max|constant (value=...).
    scope: per-table|per-pane|per-cell. label: text with <Value>, '' to hide. band_to: a second formula for a band."""
    sh = Sheet(root, worksheet)
    r = sh.ref(measure)
    pane = sh.pane()
    n = len(sh.ws.findall(".//reference-line"))
    rid = f"refline{n}"
    attrs = {"axis-column": sh.qname(r), "enable-instant-analytics": "false", "formula": formula, "id": rid,
             "label-type": "automatic" if label is None else ("none" if label == "" else "custom"),
             "scope": scope, "value-column": sh.qname(r), "z-order": str(n + 1)}
    if label:
        attrs["label"] = label
    if formula == "constant":
        if value is None:
            raise ValueError("constant reference lines need value=")
        attrs["value"] = str(value)
    if band_to:
        attrs["formula"] = formula
        attrs["band-formula"] = band_to
    rl = etree.Element("reference-line", attrs)
    anchor = pane.find("style")
    (anchor.addprevious(rl) if anchor is not None else pane.append(rl))
    if color:
        _set_format(sh.style("refline"), "stroke-color", color, id=rid)
    return {"worksheet": worksheet, "referenceLine": rid}


def add_trend_line(root, worksheet: str, fit: str = "linear", degree: int = 2, confidence_bands: bool = False) -> dict:
    """Trend line on every pane: fit linear|log|exp|polynomial|power."""
    sh = Sheet(root, worksheet)
    for pane in sh.ws.findall("./table/panes/pane"):
        for old in pane.findall("trendline"):
            pane.remove(old)
        attrs = {"enable-confidence-bands": str(confidence_bands).lower(), "enable-instant-analytics": "false",
                 "enabled": "true", "exclude-color": "false", "exclude-intercept": "false",
                 "fit": TREND_FITS.get(fit, fit)}
        if attrs["fit"] == "polynomial":
            attrs["degree"] = str(degree)
        tl = etree.Element("trendline", attrs)
        anchor = pane.find("style")
        (anchor.addprevious(tl) if anchor is not None else pane.append(tl))
    return {"worksheet": worksheet, "trendline": TREND_FITS.get(fit, fit)}


def add_forecast(root, worksheet: str, periods: int | None = None, confidence: float = 95.0) -> dict:
    """Exponential-smoothing forecast on a sheet with a continuous date axis. Length is automatic (this schema
    has no fixed-length attribute); ``periods`` is accepted and ignored."""
    sh = Sheet(root, worksheet)
    table = sh.ws.find("table")
    old = table.find("forecast-specification")
    if old is not None:
        table.remove(old)
    attrs = {"auto-forecast-agg": "true", "band-confidence-level": f"{confidence:.6f}", "enabled": "true",
             "fill-type": "fill-zero", "ignore-last": "1", "model-type": "auto", "range-type": "auto",
             "show-prediction-bands": "true"}
    fs = etree.Element("forecast-specification", attrs)
    _insert_ordered(table, fs, TABLE_ORDER)
    return {"worksheet": worksheet, "forecast": attrs}


def _insert_after_view(table, el):
    view = table.find("view")
    nxt = view.getnext()
    while nxt is not None and nxt.tag in ("subtotals",):
        nxt = nxt.getnext()
    (nxt.addprevious(el) if nxt is not None else table.append(el))


def remove_analytics(root, worksheet: str, kind: str = "all") -> dict:
    """Remove reference-line | trendline | forecast | all."""
    sh = Sheet(root, worksheet)
    n = 0
    tags = {"reference-line": ("reference-line",), "trendline": ("trendline",),
            "forecast": ("forecast-specification",), "all": ("reference-line", "trendline", "forecast-specification")}[kind]
    for el in list(sh.ws.iter(*tags)):
        el.getparent().remove(el)
        n += 1
    return {"removed": n}


def format_marks(root, worksheet: str, color: str | None = None, size: float | None = None,
                 show_labels: bool | None = None, opacity: float | None = None, pane: int = 0) -> dict:
    """Mark color (hex), size, labels on/off, opacity 0..1."""
    sh = Sheet(root, worksheet)
    p = sh.pane(pane)
    style = p.find("style")
    if style is None:
        style = etree.Element("style")
        p.append(style)
    rule = style.find("style-rule[@element='mark']")
    if rule is None:
        rule = etree.SubElement(style, "style-rule", element="mark")
    if color:
        _set_format(rule, "mark-color", color)
    if size is not None:
        _set_format(rule, "size", str(size))
    if show_labels is not None:
        _set_format(rule, "mark-labels-show", str(show_labels).lower())
        _set_format(rule, "mark-labels-cull", "true")
    if opacity is not None:
        _set_format(rule, "mark-transparency", str(int(255 * opacity)))
    return {"worksheet": worksheet, "mark-style": {f.get("attr"): f.get("value") for f in rule}}


def set_color_palette(root, worksheet: str, field: str, colors: dict[str, str] | None = None,
                      palette: str | None = None) -> dict:
    """Assign colors on the Color card: explicit {member: '#hex'} for a dimension, or a named palette
    (e.g. 'tableau10', 'color_blind_10', 'tableau-blue-green' for measures)."""
    sh = Sheet(root, worksheet)
    r = sh.ref(field)
    rule = sh.style("mark")
    for e in rule.findall("encoding"):
        if e.get("field") == r.instance_name:
            rule.remove(e)
    if colors:
        enc = etree.SubElement(rule, "encoding", attr="color", field=r.instance_name, type="palette")
        for member, hexcolor in colors.items():
            m = etree.SubElement(enc, "map", to=hexcolor)
            etree.SubElement(m, "bucket").text = _literal(member, r.field.datatype)
    elif palette:
        etree.SubElement(rule, "encoding", attr="color", field=r.instance_name, palette=palette,
                         type="interpolated" if r.ci_type == "quantitative" else "palette")
    return {"worksheet": worksheet, "field": r.instance_name}


def format_worksheet(root, worksheet: str, font: str | None = None, font_size: int | None = None,
                     font_color: str | None = None, background: str | None = None, gridlines: bool | None = None,
                     zero_lines: bool | None = None, row_dividers: bool | None = None,
                     field_labels: bool | None = None) -> dict:
    """Worksheet-wide formatting: fonts, background, gridlines, zero lines, row dividers, field labels."""
    sh = Sheet(root, worksheet)
    ws_rule = sh.style("worksheet")
    for attr, val in (("font-family", font), ("font-size", font_size), ("color", font_color)):
        if val is not None:
            _set_format(ws_rule, attr, str(val))
    if background:
        _set_format(sh.style("table"), "background-color", background)
    if gridlines is not None:
        g = sh.style("gridline")
        for scope in ("rows", "cols"):
            _set_format(g, "line-visibility", "on" if gridlines else "off", scope=scope)
    if zero_lines is not None:
        z = sh.style("zeroline")
        for scope in ("rows", "cols"):
            _set_format(z, "line-visibility", "on" if zero_lines else "off", scope=scope)
    if row_dividers is not None:
        d = sh.style("table-div")
        _set_format(d, "line-visibility", "on" if row_dividers else "off", scope="rows")
    if field_labels is not None:
        for scope in ("rows", "cols"):
            _set_format(ws_rule, "display-field-labels", str(field_labels).lower(), scope=scope)
    return {"worksheet": worksheet}


def format_field(root, worksheet: str, field: str, number_format: str | None = None, axis_title: str | None = None,
                 axis_min: float | None = None, axis_max: float | None = None, show_header: bool | None = None,
                 legend_title: str | None = None) -> dict:
    """Per-field formatting inside a worksheet: number format (cells/labels/axis), axis title and fixed range,
    hide header, legend title."""
    sh = Sheet(root, worksheet)
    r = sh.ref(field)
    q = sh.qname(r)
    if number_format:
        _set_format(sh.style("cell"), "text-format", number_format, field=q)
        _set_format(sh.style("axis"), "text-format", number_format, field=q)
        _set_format(sh.style("label"), "text-format", number_format, field=q)
    scope = "rows" if q in (sh.ws.findtext("./table/rows") or "") else "cols"
    if axis_title is not None:
        _set_format(sh.style("axis"), "title", axis_title, **{"class": "0", "field": q, "scope": scope})
    if axis_min is not None or axis_max is not None:
        enc = sh.style("axis")
        for e in enc.findall("encoding"):
            if e.get("field") == q:
                enc.remove(e)
        attrs = {"attr": "space", "class": "0", "field": q, "field-type": "quantitative", "fold": "true",
                 "scope": scope, "type": "space"}
        if axis_min is not None:
            attrs["min"] = str(axis_min)
            attrs["range-type"] = "fixed"
        if axis_max is not None:
            attrs["max"] = str(axis_max)
            attrs["range-type"] = "fixed"
        etree.SubElement(enc, "encoding", attrs)
    if show_header is not None:
        _set_format(sh.style("header"), "display", str(show_header).lower(), field=q)
    if legend_title is not None:
        _set_format(sh.style("legend-title-text"), "color", legend_title, field=q)
    return {"worksheet": worksheet, "field": q}


def set_title(root, sheet: str, text: str | None, font_size: int | None = None, bold: bool = False,
              color: str | None = None) -> dict:
    """Worksheet title (text=None hides the title card). Use <Sheet Name> / <Parameters.X> tokens if desired."""
    ws = _worksheet(root, sheet)
    lo = ws.find("layout-options")
    if lo is not None:
        ws.remove(lo)
    if text:
        lo = etree.Element("layout-options")
        run = etree.SubElement(etree.SubElement(etree.SubElement(lo, "title"), "formatted-text"), "run")
        run.text = text
        if font_size:
            run.set("fontsize", str(font_size))
        if bold:
            run.set("bold", "true")
        if color:
            run.set("fontcolor", color)
        ws.insert(0, lo)
    return {"worksheet": sheet, "title": text}


def set_tooltip(root, worksheet: str, text: str, pane: int = 0) -> dict:
    """Custom tooltip. Reference fields as <SUM(Sales)> / <Region> (Tableau tooltip tokens)."""
    sh = Sheet(root, worksheet)
    p = sh.pane(pane)
    old = p.find("customized-tooltip")
    if old is not None:
        p.remove(old)
    ct = etree.Element("customized-tooltip")
    ft = etree.SubElement(ct, "formatted-text")
    for i, line in enumerate(text.split("\n")):
        run = etree.SubElement(ft, "run")
        run.text = (line + ("\n" if i < len(text.split("\n")) - 1 else ""))
    anchor = p.find("style")
    (anchor.addprevious(ct) if anchor is not None else p.append(ct))
    return {"worksheet": worksheet}


def duplicate_sheet(root, sheet: str, new_name: str) -> dict:
    import copy  # noqa: PLC0415

    for kind in ("worksheet", "dashboard"):
        hits = root.xpath(f"./{kind}s/{kind}[@name=$n]", n=sheet)
        if hits:
            el = copy.deepcopy(hits[0])
            el.set("name", new_name)
            sid = el.find("simple-id")
            if sid is not None:
                sid.set("uuid", _uuid())
            hits[0].addnext(el)
            win = copy.deepcopy(_window(root, sheet))
            win.set("name", new_name)
            win.attrib.pop("maximized", None)
            wsid = win.find("simple-id")
            if wsid is not None:
                wsid.set("uuid", _uuid())
            _window(root, sheet).addnext(win)
            return {"duplicate": new_name}
    raise KeyError(f"Sheet {sheet!r} not found")


def set_sheet_visibility(root, sheet: str, hidden: bool) -> dict:
    """Hide/unhide a worksheet used in a dashboard (hidden sheets keep working inside dashboards)."""
    win = _window(root, sheet)
    win.set("hidden", "true") if hidden else win.attrib.pop("hidden", None)
    return {"sheet": sheet, "hidden": hidden}


def reorder_sheets(root, order: list[str]) -> dict:
    """Order of sheet tabs (windows); unlisted sheets keep their relative order after the listed ones."""
    wins = root.find("windows")
    by_name = {w.get("name"): w for w in wins.findall("window")}
    for w in list(wins.findall("window")):
        wins.remove(w)
    rest = [n for n in by_name if n not in order]
    for n in [*order, *rest]:
        if n in by_name:
            wins.append(by_name[n])
    return {"order": [w.get("name") for w in wins.findall("window")]}


# ============================================================================================
# dashboards
# ============================================================================================
def _zone_style(zone, margin: int = 4, border: str | None = None, background: str | None = None, padding: int | None = None):
    zs = zone.find("zone-style")
    if zs is None:
        zs = etree.SubElement(zone, "zone-style")
    vals = {"border-color": border or "#000000", "border-style": "solid" if border else "none",
            "border-width": "1" if border else "0", "margin": str(margin)}
    if background:
        vals["background-color"] = background
    if padding is not None:
        vals["padding"] = str(padding)
    for k, v in vals.items():
        _set_format(zs, k, v)
    return zs


def _next_zone_id(db) -> int:
    ids = [int(z.get("id")) for z in db.iter("zone") if (z.get("id") or "").isdigit()]
    return max(ids, default=0) + 1


def _dash_size(db) -> tuple[int, int]:
    s = db.find("size")
    if s is not None and s.get("maxwidth"):
        return int(s.get("maxwidth")), int(s.get("maxheight"))
    return 1200, 800


def list_zones(root, dashboard: str) -> list[dict]:
    db = _dashboard(root, dashboard)
    out = []

    def walk(z, depth):
        out.append({"id": z.get("id"), "type": z.get("type-v2") or ("sheet" if z.get("name") else None),
                    "name": z.get("name"), "param": z.get("param"), "floating": z.get("is-floating") == "true"
                    or z.getparent().tag == "zones" and depth > 0,
                    "x": z.get("x"), "y": z.get("y"), "w": z.get("w"), "h": z.get("h"), "depth": depth})
        for c in z.findall("zone"):
            walk(c, depth + 1)

    for z in db.find("zones").findall("zone"):
        walk(z, 0)
    return out


def add_zone(root, dashboard: str, kind: str, sheet: str | None = None, text: str | None = None,
             field: str | None = None, parameter: str | None = None, url: str | None = None,
             image: str | None = None, container: str | None = None, mode: str | None = None,
             floating: bool = False, x: int = 0, y: int = 0, w: int = 300, h: int = 200,
             font_size: int | None = None, bold: bool = False, font_color: str | None = None,
             background: str | None = None, border: str | None = None, target_sheet: str | None = None,
             italic: bool = False, font: str | None = None, align: str | None = None) -> dict:
    """Add an object to a dashboard.
    kind: sheet · text · image (image=path) · web (url) · blank · title · container (horizontal|vertical via
    mode) · filter (sheet+field, mode=checkdropdown|dropdown|slider|...) · legend-color|legend-size|legend-shape
    (sheet+field) · parameter (parameter name, mode=slider|type_in|compact|radiolist) · highlighter
    (sheet+field) · navigation (target_sheet, text=label).
    Tiled objects go into ``container`` (zone id) or the main layout; floating=True places them at
    x/y/w/h pixels."""
    db = _dashboard(root, dashboard)
    zid = str(_next_zone_id(db))
    attrs: dict[str, str] = {"id": zid}
    dsz = _dash_size(db)
    to_units = lambda v, total: str(int(v * FULL / total))  # noqa: E731
    attrs.update({"x": to_units(x, dsz[0]), "y": to_units(y, dsz[1]), "w": to_units(w, dsz[0]),
                  "h": to_units(h, dsz[1])})

    def _field_q(sheet_name, spec):
        sh = Sheet(root, sheet_name)
        return sh.qname(sh.ref(spec))

    k = kind.lower()
    z = etree.Element("zone")
    if k == "sheet":
        if sheet not in twb.sheet_names(root)["worksheets"]:
            raise KeyError(f"Worksheet {sheet!r} not found")
        attrs["name"] = sheet
    elif k == "text":
        attrs["type-v2"] = "text"
        ft = etree.SubElement(z, "formatted-text")
        run = etree.SubElement(ft, "run")
        run.text = text or ""
        if font_size:
            run.set("fontsize", str(font_size))
        if bold:
            run.set("bold", "true")
        if font_color:
            run.set("fontcolor", font_color)
        if italic:
            run.set("italic", "true")
        if font:
            run.set("fontname", font)
        if align:
            run.set("fontalignment", {"left": "0", "center": "1", "right": "2"}[align])
    elif k == "title":
        attrs["type-v2"] = "title"
    elif k == "blank":
        attrs["type-v2"] = "empty"
    elif k == "web":
        attrs["type-v2"] = "web"
        attrs["param"] = url or ""
    elif k == "image":
        attrs["type-v2"] = "bitmap"
        attrs["param"] = str(Path(image).resolve()).replace("\\", "/") if image else ""
        attrs["is-scaled"] = "1"
    elif k == "container":
        attrs["type-v2"] = "layout-flow"
        attrs["param"] = "horz" if (mode or "horizontal").startswith("h") else "vert"
    elif k == "filter":
        attrs.update({"type-v2": "filter", "name": sheet, "param": _field_q(sheet, field)})
        if mode:
            attrs["mode"] = mode
        add_card(root, sheet, "filter", field_qname=attrs["param"], mode=mode)
    elif k.startswith("legend"):
        sub = k.split("-", 1)[1] if "-" in k else "color"
        attrs.update({"type-v2": sub, "name": sheet, "param": _field_q(sheet, field), "pane-specification-id": "0"})
    elif k == "parameter":
        attrs.update({"type-v2": "paramctrl", "param": f"[Parameters].{_bracket(parameter)}",
                      "mode": mode or "slider"})
    elif k == "highlighter":
        attrs.update({"type-v2": "highlighter", "name": sheet, "param": _field_q(sheet, field)})
    elif k == "navigation":
        # A text button that goes to another sheet or dashboard, addressed by its window's simple-id
        # (shape and manifest as Tableau writes them; checked against Desktop 2026.3, 2026-11-04).
        if not target_sheet:
            raise ValueError("navigation buttons need target_sheet=<sheet or dashboard>")
        win = next((w for w in root.findall("windows/window") if w.get("name") == target_sheet), None)
        sid = win.find("simple-id") if win is not None else None
        if sid is None or not sid.get("uuid"):
            raise KeyError(f"No window id for {target_sheet!r}: open that sheet once in Desktop (or save the "
                           "workbook from Desktop) so it gets one, then retry.")
        _ensure_features(root, "BasicButtonObject", "BasicButtonObjectTextSupport", "NavigationAction")
        attrs["type-v2"] = "dashboard-object"
        nav = (sid.get("uuid"), text or target_sheet, font_color or "#ffffff", background or "#333333")
    else:
        raise ValueError(f"Unknown zone kind {kind!r}")
    for kk, vv in attrs.items():
        z.set(kk, vv)
    if k == "navigation":
        uuid_, label, fg, bg = nav
        b = etree.SubElement(z, "button", action=f'tabdoc:goto-sheet window-id="{uuid_}"', **{"button-type": "text"})
        vs = etree.SubElement(b, "button-visual-state")
        etree.SubElement(vs, "caption").text = label
        etree.SubElement(vs, "button-caption-font-style", fontcolor=fg, fontname=font or "Tableau Bold",
                         fontsize=str(font_size or 12))
        etree.SubElement(vs, "format", attr="background-color", value=bg)
        background = None  # the button carries its own colour
    _zone_style(z, background=background, border=border)
    if floating:  # floating objects are siblings of the root layout zone, positioned in dashboard units
        db.find("zones").append(z)
    elif container:
        parent = next((c for c in db.iter("zone") if c.get("id") == str(container)), None)
        if parent is None:
            raise KeyError(f"Container zone {container!r} not found")
        _append_zone(parent, z)
        _relayout(db)
    else:
        _place_tiled(db, z)
    if k in ("sheet",) or (sheet and k in ("filter", "highlighter") or k.startswith("legend")):
        _register_viewpoint(root, dashboard, sheet)
    return {"dashboard": dashboard, "zone": zid, "kind": k}


def _window_uuid(root, sheet):
    if not sheet:
        raise ValueError("navigation needs target_sheet")
    sid = _window(root, sheet).find("simple-id")
    return sid.get("uuid") if sid is not None else ""


PANEL_TYPES = {"filter", "color", "size", "shape", "paramctrl", "highlighter"}
FIXED_PX = {"title": 44, "text": 40, "filter": 72, "paramctrl": 64, "highlighter": 64, "color": 140,
            "size": 110, "shape": 140, "empty": 24}
PANEL_WIDTH_PX = 200


def _kids(z):
    return [c for c in z.findall("zone")]


def _append_zone(parent, z):
    """Add a child zone respecting the zone content model (formatted-text, layout-cache, zone*, flipboard,
    zone-style): before any flipboard/zone-style child."""
    tail = next((c for c in parent if c.tag in ("flipboard", "zone-style")), None)
    (tail.addprevious(z) if tail is not None else parent.append(z))


def _is_panel(z) -> bool:
    kids = _kids(z)
    return (z.get("type-v2") == "layout-flow" and z.get("param") == "vert" and bool(kids)
            and all(c.get("type-v2") in PANEL_TYPES for c in kids))


def _main_parts(db):
    """(main vertical flow, side panel or None) of a dashboard built by tableu (or any flow-based one)."""
    outer = db.find("zones/zone")
    flows = [c for c in outer.iter("zone") if c.get("type-v2") == "layout-flow"]
    panel = next((f for f in flows if _is_panel(f)), None)
    main = next((f for f in flows if f.get("param") == "vert" and f is not panel), None)
    if main is None:
        main = etree.SubElement(outer, "zone", {"id": str(_next_zone_id(db)), "param": "vert", "type-v2": "layout-flow",
                                                "x": "0", "y": "0", "w": str(FULL), "h": str(FULL)})
    return main, panel


def _ensure_panel(db):
    main, panel = _main_parts(db)
    if panel is not None:
        return panel
    outer = main.getparent()
    row = etree.Element("zone", {"id": str(_next_zone_id(db)), "param": "horz", "type-v2": "layout-flow"})
    outer.replace(main, row)
    row.append(main)
    panel = etree.SubElement(row, "zone", {"id": str(_next_zone_id(db)), "param": "vert", "type-v2": "layout-flow"})
    return panel


def _place_tiled(db, z):
    """Put a new tiled zone where Tableau authors usually put it: interactive objects in a right-hand panel,
    text under the title, sheets into the chart grid, containers as new rows."""
    kind = z.get("type-v2")
    db.find("zones").append(z)  # reserve its id while containers are created; moved below
    if kind in PANEL_TYPES:
        _append_zone(_ensure_panel(db), z)
    else:
        main, _ = _main_parts(db)
        kids = _kids(main)
        if kind in ("text", "title"):
            after = [c for c in kids if c.get("type-v2") in ("title", "text")]
            (after[-1].addnext(z) if after else main.insert(0, z))
        elif kind is None or kind == "visual":  # a sheet: last grid row if it has room, else a new row
            rows = [c for c in kids if c.get("type-v2") == "layout-flow" and c.get("param") == "horz"]
            if rows and len(_kids(rows[-1])) < 2:
                _append_zone(rows[-1], z)
            else:
                row = etree.SubElement(main, "zone", {"id": str(_next_zone_id(db)), "param": "horz",
                                                      "type-v2": "layout-flow"})
                row.append(z)
        else:
            _append_zone(main, z)
    _relayout(db)


def _relayout(db):
    """Recompute x/y/w/h of every tiled zone: fixed-height text and panel items, flexible charts."""
    dw, dh = _dash_size(db)
    outer = db.find("zones/zone")

    def fixed_h(z):
        t = z.get("type-v2")
        return FIXED_PX.get(t) * FULL // dh if t in FIXED_PX else None

    def lay(z, x, y, w, h):
        z.set("x", str(x)); z.set("y", str(y)); z.set("w", str(w)); z.set("h", str(h))  # noqa: E702
        kids = _kids(z)
        if not kids or z.get("type-v2") not in ("layout-flow", "layout-basic"):
            return
        if z.get("type-v2") == "layout-basic":
            for k in kids:
                lay(k, x, y, w, h)
            return
        if z.get("param") == "horz":
            panel_w = PANEL_WIDTH_PX * FULL // dw
            fixed = [k for k in kids if _is_panel(k)]
            flex = [k for k in kids if k not in fixed]
            each = (w - panel_w * len(fixed)) // max(len(flex), 1)
            pos = x
            for k in kids:
                kw = panel_w if k in fixed else each
                lay(k, pos, y, kw, h)
                pos += kw
        else:
            fixed_total = sum(fixed_h(k) or 0 for k in kids)
            flex = [k for k in kids if fixed_h(k) is None]
            each = max(h - fixed_total, 0) // max(len(flex), 1) if flex else 0
            pos = y
            for k in kids:
                kh = fixed_h(k) if fixed_h(k) is not None else each
                lay(k, x, pos, w, kh)
                pos += kh

    lay(outer, 0, 0, FULL, FULL)


def _register_viewpoint(root, dashboard, sheet):
    win = _window(root, dashboard)
    vps = win.find("viewpoints")
    if vps is None:
        vps = etree.Element("viewpoints")
        win.insert(0, vps)
    if sheet and not any(v.get("name") == sheet for v in vps):
        etree.SubElement(vps, "viewpoint", name=sheet)


def remove_zone(root, dashboard: str, zone_id: str) -> dict:
    db = _dashboard(root, dashboard)
    for z in db.iter("zone"):
        if z.get("id") == str(zone_id):
            parent = z.getparent()
            parent.remove(z)
            if parent.tag == "zone" and parent.get("type-v2") == "layout-flow" and not _kids(parent) \
                    and parent.getparent().tag == "zone":
                parent.getparent().remove(parent)
            _relayout(db)
            return {"removed": zone_id}
    raise KeyError(f"Zone {zone_id!r} not found")


def format_zone(root, dashboard: str, zone_id: str, background: str | None = None, border: str | None = None,
                margin: int = 4, padding: int | None = None, show_title: bool | None = None) -> dict:
    db = _dashboard(root, dashboard)
    for z in db.iter("zone"):
        if z.get("id") == str(zone_id):
            _zone_style(z, margin=margin, border=border, background=background, padding=padding)
            if show_title is not None:
                z.set("show-title", str(show_title).lower())
            return {"zone": zone_id}
    raise KeyError(f"Zone {zone_id!r} not found")


def format_dashboard(root, dashboard: str, background: str | None = None, title_font_size: int | None = None,
                     font: str | None = None) -> dict:
    db = _dashboard(root, dashboard)
    style = db.find("style")
    if style is None:
        style = etree.Element("style")
        db.insert(0, style)
    if background:
        rule = style.find("style-rule[@element='table']")
        if rule is None:
            rule = etree.SubElement(style, "style-rule", element="table")
        _set_format(rule, "background-color", background)
    if title_font_size or font:
        rule = style.find("style-rule[@element='dash-title']")
        if rule is None:
            rule = etree.SubElement(style, "style-rule", element="dash-title")
        if title_font_size:
            _set_format(rule, "font-size", str(title_font_size))
        if font:
            _set_format(rule, "font-family", font)
    return {"dashboard": dashboard}


def add_device_layout(root, dashboard: str, device: str = "phone", sheets: list[str] | None = None,
                      height_per_sheet: int = 300) -> dict:
    """Phone/tablet layout: stacks the given sheets (default: every sheet zone) vertically."""
    db = _dashboard(root, dashboard)
    names = sheets or [z.get("name") for z in db.iter("zone") if z.get("name") and not z.get("type-v2")]
    dls = db.find("devicelayouts")
    if dls is None:
        dls = etree.Element("devicelayouts")
        sid = db.find("simple-id")
        (sid.addprevious(dls) if sid is not None else db.append(dls))
    dev_name = device.capitalize()
    for old in dls.findall("devicelayout"):
        if old.get("name") == dev_name:
            dls.remove(old)
    dl = etree.SubElement(dls, "devicelayout", {"name": dev_name})
    total_h = height_per_sheet * max(len(names), 1)
    etree.SubElement(dl, "size", maxheight=str(total_h), minheight=str(total_h), **{"sizing-mode": "vscroll"})
    zones = etree.SubElement(dl, "zones")
    outer = etree.SubElement(zones, "zone", {"h": str(FULL), "id": str(_next_zone_id(db) + 500), "type-v2": "layout-basic",
                                             "w": str(FULL), "x": "0", "y": "0"})
    flow = etree.SubElement(outer, "zone", {"h": str(FULL), "id": str(_next_zone_id(db) + 501), "param": "vert",
                                            "type-v2": "layout-flow", "w": str(FULL), "x": "0", "y": "0"})
    each = FULL // max(len(names), 1)
    for i, n in enumerate(names):
        z = etree.SubElement(flow, "zone", {"h": str(each), "id": str(_next_zone_id(db) + 502 + i), "name": n,
                                            "w": str(FULL), "x": "0", "y": str(i * each)})
        _zone_style(z)
    return {"dashboard": dashboard, "device": dev_name, "sheets": names}


# ============================================================================================
# actions
# ============================================================================================
def _ensure_features(root, *names: str) -> None:
    """Declare format features in <document-format-change-manifest>. Tableau gates newer elements on
    them: without <ParameterAction /> the schema has no edit-parameter-action at all (verified against
    Desktop 2026.3's validator and loader, 2026-11-04)."""
    m = _wb_child(root, "document-format-change-manifest")
    have = {e.tag for e in m}
    for n in names:
        if n not in have:
            etree.SubElement(m, n)


# <actions> is a sequence, not a bag: plain actions first, then the datasources they reference, then set
# actions, then parameter actions. Appending after <datasources> fails validation ("element 'action' is
# not allowed for content model '(action,datasources,datasource-dependencies*,...)'").
ACTIONS_ORDER = ("action", "datasources", "datasource-dependencies", "edit-group-action", "edit-parameter-action")


def _order_actions(root) -> None:
    acts = root.find("actions")
    if acts is None:
        return
    rank = {t: i for i, t in enumerate(ACTIONS_ORDER)}
    kids = sorted(list(acts), key=lambda e: rank.get(e.tag, len(rank)))
    for k in kids:
        acts.remove(k)
    acts.extend(kids)


def _action_name() -> str:
    return f"[Action_{uuid.uuid4().hex.upper()}]"


def _actions(root):
    return _wb_child(root, "actions")


def create_action(root, kind: str, name: str, source: str, target: str | None = None,
                  fields: list[str] | None = None, activation: str = "on-select", clear: str = "show-all",
                  url: str | None = None, parameter: str | None = None, source_field: str | None = None,
                  set_name: str | None = None, set_mode: str = "assign", source_dashboard: str | None = None,
                  aggregation: str = "attr", set_clear: str = "exclude-all") -> dict:
    """Dashboard/worksheet actions.
    kind: filter (source sheet -> target sheet/dashboard; fields=[...] or all) · highlight · url (url with
    <Field> tokens) · parameter (parameter + source_field; aggregation attr|sum|avg|...; clearing keeps the
    current value) · set (set_name; set_mode assign|add|remove; set_clear exclude-all) · goto (navigate to
    target sheet). activation: on-select | on-hover | on-menu.
    clear (filter): show-all | keep | exclude."""
    acts = _actions(root)
    an = _action_name()
    act_attr = {"caption": name, "name": an}

    def activation_el(auto_clear=False):
        a = etree.Element("activation")
        if auto_clear:
            a.set("auto-clear", "true")
        if activation != "on-menu":
            a.set("type", activation)
        return a

    def source_el():
        s = etree.Element("source", type="sheet", worksheet=source)
        if source_dashboard:
            s.set("dashboard", source_dashboard)
        return s

    k = kind.lower()
    if k in ("filter", "goto"):
        a = etree.SubElement(acts, "action", act_attr)
        a.append(activation_el(auto_clear=(k == "filter" and clear == "show-all")))
        a.append(source_el())
        tgt = target or source
        if k == "filter" and fields:
            # Specific fields: tsl link with field locators.
            ws_names = twb.sheet_names(root)["worksheets"]
            src_sheet = Sheet(root, source) if source in ws_names else None
            clauses = []
            for i, fl in enumerate(fields):
                ds = src_sheet.ds if src_sheet else twb.datasources(root)[0]
                f = resolve_field(ds, fl)
                clauses.append(f"%5B{ds.get('name')}%5D.%5B{_urlq(f.name.strip('[]'))}%5D~s0=<{f.name}~na>")
            expr = f"tsl:{_urlq(tgt)}?" + "&".join(clauses)
            etree.SubElement(a, "link", caption=name, delimiter=",", escape="\\", expression=expr,
                             **{"include-null": "true", "multi-select": "true", "url-escape": "true"})
        cmd = etree.SubElement(a, "command", command="tsc:tsl-filter")
        if k == "goto":
            etree.SubElement(cmd, "param", name="special-fields", value="none")
        elif not fields:
            etree.SubElement(cmd, "param", name="special-fields", value="all")
        if clear == "exclude":
            etree.SubElement(cmd, "param", name="on-empty", value="none")
        etree.SubElement(cmd, "param", name="target", value=tgt)
    elif k == "highlight":
        a = etree.SubElement(acts, "action", act_attr)
        a.append(activation_el(auto_clear=True))
        a.append(source_el())
        cmd = etree.SubElement(a, "command", command="tsc:brush")
        if fields:
            etree.SubElement(cmd, "param", name="field-captions", value=",".join(fields))
        else:
            etree.SubElement(cmd, "param", name="special-fields", value="all")
        etree.SubElement(cmd, "param", name="target", value=target or source)
    elif k == "url":
        a = etree.SubElement(acts, "action", act_attr)
        a.append(activation_el())
        a.append(source_el())
        etree.SubElement(a, "link", caption="", expression=url or "", **{"url-escape": "true"})
    elif k == "parameter":
        # Shape and manifest entries as Tableau writes them (checked against Desktop 2026.3, 2026-11-04).
        if not parameter or not source_field:
            raise ValueError("parameter actions need parameter=<name> and source_field=<field spec>")
        _ensure_features(root, "ParameterAction", "ParameterActionClearSelection")
        sh = Sheet(root, source)
        a = etree.SubElement(acts, "edit-parameter-action", act_attr)
        a.append(activation_el())
        a.append(source_el())
        etree.SubElement(a, "agg-type", type=aggregation)
        # value='r:::1' is what Desktop writes for "keep the current value"; the loader requires it.
        etree.SubElement(a, "clear-option", type="do-nothing", value="r:::1")
        ps = etree.SubElement(a, "params")
        etree.SubElement(ps, "param", name="source-field", value=sh.qname(sh.ref(source_field)))
        etree.SubElement(ps, "param", name="target-parameter", value=f"[Parameters].{_bracket(parameter)}")
    elif k == "set":
        if not set_name:
            raise ValueError("set actions need set_name=<set>")
        if set_mode not in ("assign", "add", "remove"):
            raise ValueError("set_mode must be assign, add or remove")
        _ensure_features(root, "GroupAction", "GroupActionAddRemove")
        sh = Sheet(root, source)
        a = etree.SubElement(acts, "edit-group-action", act_attr)
        a.append(activation_el())
        a.append(source_el())
        etree.SubElement(a, "add-or-remove-marks", value=set_mode)
        ps = etree.SubElement(a, "params")
        etree.SubElement(ps, "param", name="selection-clear-set-option", value=set_clear)
        etree.SubElement(ps, "param", name="target-group", value=f"[{sh.ds.get('name')}].{_bracket(set_name)}")
    else:
        raise ValueError(f"Unknown action kind {kind!r}")
    _order_actions(root)
    return {"action": an, "caption": name, "kind": k}


def _urlq(s: str) -> str:
    from urllib.parse import quote  # noqa: PLC0415

    return quote(s, safe="")


def list_actions(root) -> list[dict]:
    acts = root.find("actions")
    if acts is None:
        return []
    out = []
    for a in acts:
        cmd = a.find("command")
        src = a.find("source")
        out.append({"name": a.get("name"), "caption": a.get("caption"), "tag": a.tag,
                    "command": cmd.get("command") if cmd is not None else ("url" if a.find("link") is not None else None),
                    "source": dict(src.attrib) if src is not None else None})
    return out


def delete_action(root, name: str) -> dict:
    acts = root.find("actions")
    for a in list(acts if acts is not None else []):
        if name in (a.get("name"), a.get("caption")):
            acts.remove(a)
            if len(acts) == 0:
                root.remove(acts)
            return {"deleted": a.get("caption")}
    raise KeyError(f"Action {name!r} not found")


# ============================================================================================
# stories
# ============================================================================================
def create_story(root, name: str, points: list[dict], width: int = 1016, height: int = 964,
                 title: str | None = None) -> dict:
    """A story: points=[{'sheet': 'Overview', 'caption': 'Sales grew 20%'}, ...] (sheets or dashboards)."""
    existing = twb.sheet_names(root)
    allowed = existing["worksheets"] + existing["dashboards"]
    for p in points:
        if p["sheet"] not in allowed:
            raise KeyError(f"Story point sheet {p['sheet']!r} not found")
    db = etree.Element("dashboard", name=name, type="storyboard")
    if title:
        lo = etree.SubElement(db, "layout-options")
        run = etree.SubElement(etree.SubElement(etree.SubElement(lo, "title"), "formatted-text"), "run")
        run.text = title
    etree.SubElement(db, "style")
    etree.SubElement(db, "size", maxheight=str(height), maxwidth=str(width), minheight=str(height),
                     minwidth=str(width))
    zones = etree.SubElement(db, "zones")
    outer = etree.SubElement(zones, "zone", {"h": str(FULL), "id": "2", "type-v2": "layout-basic", "w": str(FULL),
                                             "x": "0", "y": "0"})
    flow = etree.SubElement(outer, "zone", {"h": str(FULL), "id": "1", "param": "vert", "removable": "false",
                                            "type-v2": "layout-flow", "w": str(FULL), "x": "0", "y": "0"})
    etree.SubElement(flow, "zone", {"h": "4453", "id": "3", "type-v2": "title", "w": str(FULL), "x": "0", "y": "0"})
    etree.SubElement(flow, "zone", {"fixed-size": "125", "h": "12000", "id": "4", "is-fixed": "true",
                                    "paired-zone-id": "5", "removable": "false", "type-v2": "flipboard-nav",
                                    "w": str(FULL), "x": "0", "y": "4453"})
    fb_zone = etree.SubElement(flow, "zone", {"h": str(FULL - 16453), "id": "5", "paired-zone-id": "4",
                                              "removable": "false", "type-v2": "flipboard", "w": str(FULL),
                                              "x": "0", "y": "16453"})
    fb = etree.SubElement(fb_zone, "flipboard", {"active-id": "1", "nav-type": "caption", "show-nav-arrows": "true"})
    sps = etree.SubElement(fb, "story-points")
    for i, p in enumerate(points, 1):
        etree.SubElement(sps, "story-point", caption=p.get("caption", p["sheet"]), **{"captured-sheet": p["sheet"]},
                         id=str(i))
    etree.SubElement(db, "simple-id", uuid=_uuid())
    _wb_child(root, "dashboards").append(db)
    win = etree.SubElement(_wb_child(root, "windows"), "window", {"class": "dashboard", "name": name})
    etree.SubElement(win, "viewpoints")
    etree.SubElement(win, "active", id="-1")
    etree.SubElement(win, "simple-id", uuid=_uuid())
    return {"story": name, "points": len(points)}


def add_story_point(root, story: str, sheet: str, caption: str) -> dict:
    db = _dashboard(root, story, storyboard=True)
    sps = db.find(".//story-points")
    nid = max((int(s.get("id")) for s in sps), default=0) + 1
    etree.SubElement(sps, "story-point", caption=caption, **{"captured-sheet": sheet}, id=str(nid))
    return {"story": story, "point": nid}


# ============================================================================================
# workbook-level
# ============================================================================================
def format_workbook(root, font: str | None = None, font_size: int | None = None, color: str | None = None,
                    title_font_size: int | None = None) -> dict:
    """Workbook-wide default formatting (Format > Workbook)."""
    style = _wb_child(root, "style")
    rule = style.find("style-rule[@element='all']")
    if rule is None:
        rule = etree.SubElement(style, "style-rule", element="all")
    for attr, val in (("font-family", font), ("font-size", font_size), ("color", color)):
        if val is not None:
            _set_format(rule, attr, str(val))
    if title_font_size:
        tr = style.find("style-rule[@element='worksheet-title']")
        if tr is None:
            tr = etree.SubElement(style, "style-rule", element="worksheet-title")
        _set_format(tr, "font-size", str(title_font_size))
    return {"style": [dict(f.attrib) for f in rule]}


def set_start_sheet(root, sheet: str) -> dict:
    """Make ``sheet`` the first tab and the one shown when the workbook opens."""
    for w in root.iter("window"):
        w.attrib.pop("maximized", None)
    _window(root, sheet).set("maximized", "true")
    order = [sheet] + [w.get("name") for w in root.find("windows") if w.get("name") != sheet]
    return reorder_sheets(root, order)


# ============================================================================================
# formatting: backgrounds, shading/banding, borders, lines, fonts per element, marks, stories
# ============================================================================================
# Style vocabulary seen in documents Tableau writes (element -> what it formats). Desktop's validator enforces
# the element/attribute enumerations.
STYLE_ELEMENTS = {
    "table": "worksheet area: background-color, band-size/band-level (scope), show-null-value-warning",
    "pane": "pane (marks area): background-color, band-color (scope), border-style/width/color (scope, data-class)",
    "header": "row/column headers: background-color, band-color, border-*, height/width (field)",
    "cell": "text cells: font-*, text-align, text-format (field), border-*",
    "title": "worksheet title card: background-color",
    "label": "mark labels: color, font-family/size/weight/style, text-align, text-format, display (field)",
    "datalabel": "mark labels (pane): color-mode, font-family, font-weight",
    "field-labels": "row/column field labels: font-family, font-weight, color",
    "axis": "axes: title/subtitle (field, scope, class), tick-color, line-visibility, text-format, display",
    "axis-title": "axis titles: font-size, font-family, color",
    "gridline": "gridlines: line-visibility, stroke-color, stroke-size, line-pattern-only (scope)",
    "zeroline": "zero lines: same as gridline",
    "table-div": "row/column dividers: line-visibility, stroke-color, stroke-size, div-level (scope)",
    "header-div": "header dividers: line-visibility, stroke-size (scope)",
    "mark": "marks: mark-color, size, mark-transparency, has-stroke, stroke-color, mark-labels-*, shape",
    "refline": "reference lines (id): stroke-color, stroke-size, fill-above, fill-below, color",
    "refband": "reference bands (id): fill-color, palette",
    "trendline": "trend lines: stroke-color, stroke-size, line-pattern-only",
    "legend": "legend cards: background-color, font-family, col-width",
    "legend-title-text": "legend title (field)",
    "quick-filter": "filter cards: background-color, border-*, title (field)",
    "parameter-ctrl": "parameter cards: title (field), background-color",
    "data-highlighter": "highlighter cards: background-color, border-*",
    "worksheet": "worksheet text defaults: font-family, font-size, color, display-field-labels (scope)",
    "map": "maps: map-style, washout",
    "dash-title": "dashboard title: font-*, background-color",
    "dash-subtitle": "dashboard subtitle: font-size",
    "dash-container": "dashboard containers (id='dash-zone_<id>'): background-color, border-*",
    "story-point-caption": "story captions: background-color, font-*",
    "all": "workbook-wide defaults (Format > Workbook): font-family, font-size, color",
}


def _style_holder(root, sheet, pane):
    """(element whose <style> to use, Sheet or None) for a worksheet/dashboard/story, or the workbook ('*')."""
    if sheet in ("", "*", None):
        return root, None
    if root.xpath("./worksheets/worksheet[@name=$n]", n=sheet):
        sh = Sheet(root, sheet)
        return (sh.pane(pane) if pane is not None else sh.ws.find("table")), sh
    return _dashboard(root, sheet), None


def _rule(holder, element):
    style = holder.find("style")
    if style is None:
        style = etree.Element("style")
        if holder.tag == "workbook":
            _insert_ordered(holder, style, WORKBOOK_ORDER)
        elif holder.tag == "table":
            holder.find("panes").addprevious(style)
        elif holder.tag == "pane":
            anchor = next((c for c in holder if c.tag in ("customized-tooltip", "reference-line", "trendline")), None)
            (anchor.addprevious(style) if anchor is not None else holder.append(style))
        elif holder.tag == "dashboard":
            lo = holder.find("layout-options")
            (lo.addnext(style) if lo is not None else holder.insert(0, style))
        else:
            holder.append(style)
    rule = style.find(f"style-rule[@element='{element}']")
    if rule is None:
        rule = etree.SubElement(style, "style-rule", element=element)
    return rule


def set_style(root, sheet: str, element: str, attr: str, value: str, field: str | None = None,
              scope: str | None = None, data_class: str | None = None, id: str | None = None,  # noqa: A002
              pane: int | None = None) -> dict:
    """Generic Format-pane setting: <style-rule element><format attr value>. sheet: worksheet, dashboard, story,
    or '*' for the whole workbook. field takes a field spec on worksheets ('SUM(Sales)'). scope rows|cols;
    data_class total|subtotal; id for reference lines / containers. format Elements lists the elements."""
    holder, sh = _style_holder(root, sheet, pane)
    extra = {}
    if field:
        extra["field"] = sh.qname(sh.ref(field)) if sh else field
    if scope:
        extra["scope"] = scope
    if data_class:
        extra["data-class"] = data_class
    if id:
        extra["id"] = id
    _set_format(_rule(holder, element), attr, str(value), **extra)
    return {"sheet": sheet or "*", "element": element, "attr": attr, "value": value, **extra}


def set_backgrounds(root, sheet: str, worksheet: str | None = None, pane: str | None = None,
                    header: str | None = None, title: str | None = None, legend: str | None = None,
                    filter_card: str | None = None, parameter_card: str | None = None,
                    highlighter: str | None = None) -> dict:
    """Background colors of a worksheet's areas (Format > Shading): worksheet, pane (marks area), headers,
    title, and its legend / filter / parameter / highlighter cards (also used on dashboards). '#rrggbb', or
    '#rrggbbaa' with 00 alpha for transparent."""
    done = {}
    for element, color in (("table", worksheet), ("pane", pane), ("header", header), ("title", title),
                           ("legend", legend), ("quick-filter", filter_card), ("parameter-ctrl", parameter_card),
                           ("data-highlighter", highlighter)):
        if color:
            set_style(root, sheet, element, "background-color", color)
            done[element] = color
    return {"sheet": sheet, "backgrounds": done}


def set_banding(root, sheet: str, rows: bool = True, color: str = "#f0f0f0", size: int = 1, level: int = 0,
                header: bool = True) -> dict:
    """Row (rows=True) or column banding (zebra stripes) in panes and headers (Format > Shading > Banding)."""
    scope = "rows" if rows else "cols"
    set_style(root, sheet, "table", "band-size", size, scope=scope)
    set_style(root, sheet, "table", "band-level", level, scope=scope)
    set_style(root, sheet, "pane", "band-color", color, scope=scope)
    if header:
        set_style(root, sheet, "header", "band-color", color, scope=scope)
    return {"sheet": sheet, "banding": scope, "color": color}


def set_borders(root, sheet: str, area: str = "cell", style: str = "solid", color: str = "#d4d4d4", width: int = 1,
                scope: str | None = None, data_class: str | None = None) -> dict:
    """Borders (Format > Borders). area: cell (default) | pane | header. style solid|dashed|dotted|none.
    Color and width apply to rows and cols unless scope is given; data_class total|subtotal targets totals."""
    if data_class:
        for attr, val in (("border-style", style), ("border-width", width)):
            set_style(root, sheet, area, attr, val, scope=scope, data_class=data_class)
        return {"sheet": sheet, "area": area, "style": style, "dataClass": data_class}
    set_style(root, sheet, area, "border-style", style)
    for sc in ([scope] if scope else ["rows", "cols"]):
        set_style(root, sheet, area, "border-color", color, scope=sc)
        set_style(root, sheet, area, "border-width", width, scope=sc)
    return {"sheet": sheet, "area": area, "style": style}


def set_lines(root, sheet: str, kind: str = "gridline", visible: bool = True, color: str | None = None,
              width: int | None = None, pattern: str | None = None, scope: str | None = None) -> dict:
    """Lines (Format > Lines): kind gridline | zeroline | table-div (row/col dividers) | header-div | trendline.
    pattern solid|dashed|dotted; scope rows|cols (both when omitted)."""
    multi = kind in ("gridline", "zeroline", "table-div", "header-div")
    for sc in ([scope] if scope else (["rows", "cols"] if multi else [None])):
        set_style(root, sheet, kind, "line-visibility", "on" if visible else "off", scope=sc)
        if color:
            set_style(root, sheet, kind, "stroke-color", color, scope=sc)
        if width:
            set_style(root, sheet, kind, "stroke-size", width, scope=sc)
        if pattern:
            set_style(root, sheet, kind, "line-pattern-only", pattern, scope=sc)
    return {"sheet": sheet, "lines": kind, "visible": visible}


def set_font(root, sheet: str, element: str = "worksheet", family: str | None = None, size: int | None = None,
             color: str | None = None, bold: bool | None = None, italic: bool | None = None,
             align: str | None = None, field: str | None = None) -> dict:
    """Font of a text element (Format > Font): worksheet | cell | header | label | field-labels | axis |
    axis-title | legend | title | quick-filter | dash-title | dash-subtitle | story-point-caption, or element
    'all' with sheet='*' for the workbook. align left|center|right."""
    targets = [field]
    if element == "label" and field is None and root.xpath("./worksheets/worksheet[@name=$n]", n=sheet):
        # Tableau stores label formatting per field: apply it to every field shown on the sheet.
        sh = Sheet(root, sheet)
        targets = [None]
        holder, _ = _style_holder(root, sheet, None)
        rule = _rule(holder, "label")
        names = [f"[{sh.dsn}].{ci.get('name')}" for ci in sh.deps.findall("column-instance")]
        # The Marks card label font also lives in each pane's datalabel rule.
        for i in range(len(sh.ws.findall("./table/panes/pane"))):
            dl = _rule(sh.pane(i), "datalabel")
            for attr, val in (("font-family", family), ("font-size", size),
                              ("font-weight", None if bold is None else ("bold" if bold else "normal")),
                              ("font-style", None if italic is None else ("italic" if italic else "normal"))):
                if val is not None:
                    _set_format(dl, attr, str(val))
            if color:
                _set_format(dl, "color-mode", "user")
                _set_format(dl, "color", color)
        for attr, val in (("font-family", family), ("font-size", size), ("color", color),
                          ("font-weight", None if bold is None else ("bold" if bold else "normal")),
                          ("font-style", None if italic is None else ("italic" if italic else "normal")),
                          ("text-align", align)):
            if val is not None:
                for q in names:
                    _set_format(rule, attr, str(val), field=q)
        return {"sheet": sheet, "element": element, "fields": names}
    for attr, val in (("font-family", family), ("font-size", size), ("color", color),
                      ("font-weight", None if bold is None else ("bold" if bold else "normal")),
                      ("font-style", None if italic is None else ("italic" if italic else "normal")),
                      ("text-align", align)):
        if val is not None:
            for t in targets:
                set_style(root, sheet, element, attr, val, field=t)
    return {"sheet": sheet, "element": element}


def format_mark_border(root, worksheet: str, color: str = "#ffffff", pane: int = 0) -> dict:
    """Mark borders (Marks card > Color > Border)."""
    set_style(root, worksheet, "mark", "has-stroke", "true", pane=pane)
    set_style(root, worksheet, "mark", "stroke-color", color, pane=pane)
    return {"worksheet": worksheet, "markBorder": color}


def format_reference_line(root, worksheet: str, line_id: str = "refline0", color: str | None = None,
                          width: int | None = None, pattern: str | None = None, fill_above: str | None = None,
                          fill_below: str | None = None, label_color: str | None = None) -> dict:
    """Style a reference line (id from analytics AddReferenceLine): stroke, dash pattern, shading above/below."""
    for attr, val in (("stroke-color", color), ("stroke-size", width), ("line-pattern-only", pattern),
                      ("fill-above", fill_above), ("fill-below", fill_below), ("color", label_color)):
        if val is not None:
            set_style(root, worksheet, "refline", attr, val, id=line_id)
    return {"worksheet": worksheet, "line": line_id}


def format_container(root, dashboard: str, zone_id: str, background: str | None = None,
                     border_color: str | None = None, border_style: str = "solid") -> dict:
    """Background/border of a dashboard container (layout zone id from dashboard ListZones)."""
    zid = f"dash-zone_{zone_id}"
    if background:
        set_style(root, dashboard, "dash-container", "background-color", background, id=zid)
        format_zone(root, dashboard, zone_id, background=background, margin=0, padding=8)
    if border_color:
        set_style(root, dashboard, "dash-container", "border-color", border_color, id=zid)
        set_style(root, dashboard, "dash-container", "border-style", border_style, id=zid)
    return {"dashboard": dashboard, "container": zone_id}


def format_story(root, story: str, caption_background: str | None = None, caption_font: str | None = None,
                 caption_size: int | None = None, caption_color: str | None = None,
                 background: str | None = None) -> dict:
    """Story formatting: story-point caption boxes and the story background."""
    _dashboard(root, story, storyboard=True)
    for attr, val in (("background-color", caption_background), ("font-family", caption_font),
                      ("font-size", caption_size), ("color", caption_color)):
        if val is not None:
            set_style(root, story, "story-point-caption", attr, val)
    if background:
        set_style(root, story, "table", "background-color", background)
    return {"story": story}


def style_text_runs(root, sheet: str, kind: str = "title", font: str | None = None, size: int | None = None,
                    color: str | None = None, bold: bool | None = None, italic: bool | None = None,
                    align: str | None = None, zone_id: str | None = None) -> dict:
    """Rich text: worksheet title (kind=title), dashboard text zone (kind=zone + zone_id), dashboard title
    (kind=dashboard-title). align left|center|right."""
    if kind == "title":
        holders = _worksheet(root, sheet).findall("./layout-options/title")
    elif kind == "dashboard-title":
        db = _dashboard(root, sheet)
        holders = db.findall("./layout-options/title")
        if not holders:
            lo = db.find("layout-options")
            if lo is None:
                lo = etree.Element("layout-options")
                db.insert(0, lo)
            t = etree.SubElement(lo, "title")
            etree.SubElement(etree.SubElement(t, "formatted-text"), "run").text = "<Sheet Name>"
            holders = [t]
    else:
        holders = [z for z in _dashboard(root, sheet).iter("zone") if z.get("id") == str(zone_id)]
    if not holders:
        raise KeyError(f"No {kind} text found on {sheet!r}")
    n = 0
    for h in holders:
        for run in h.iter("run"):
            for attr, val in (("fontname", font), ("fontsize", size), ("fontcolor", color),
                              ("bold", None if bold is None else str(bold).lower()),
                              ("italic", None if italic is None else str(italic).lower()),
                              ("fontalignment", {"left": "0", "center": "1", "right": "2"}.get(align or ""))):
                if val is not None:
                    run.set(attr, str(val))
            n += 1
    return {"sheet": sheet, "kind": kind, "runs": n}
