"""Best-practice linter for Tableau workbook XML.

Rules are derived from official Tableau guidance (see docs/best-practices.md for the full text):
  WBO  = Workbook Optimizer           https://help.tableau.com/current/pro/desktop/en-us/wbo_overview.htm
  PERF = Performance checklist        https://help.tableau.com/current/pro/desktop/en-us/perf_checklist.htm
  DASH = Effective dashboards         https://help.tableau.com/current/pro/desktop/en-us/dashboards_best_practices.htm
  A11Y = Accessible views (WCAG 2.2)  https://help.tableau.com/current/pro/desktop/en-us/accessibility_best_practice.htm
  VIS  = Blueprint visual practices   https://help.tableau.com/current/blueprint/en-us/bp_visual_best_practices.htm

Tableau publishes no numeric limits for most "Number of ..." guidelines; the defaults below are
conservative and configurable through ``Thresholds``.
"""

from __future__ import annotations

import re
from dataclasses import asdict, dataclass, field

from lxml import etree

from . import twb

SOURCES = {
    "WBO": "https://help.tableau.com/current/pro/desktop/en-us/wbo_overview.htm",
    "PERF": "https://help.tableau.com/current/pro/desktop/en-us/perf_checklist.htm",
    "DASH": "https://help.tableau.com/current/pro/desktop/en-us/dashboards_best_practices.htm",
    "A11Y": "https://help.tableau.com/current/pro/desktop/en-us/accessibility_best_practice.htm",
    "VIS": "https://help.tableau.com/current/blueprint/en-us/bp_visual_best_practices.htm",
}
SEVERITY_ORDER = {"error": 0, "warning": 1, "info": 2}


@dataclass
class Thresholds:
    views_per_dashboard: int = 3  # DASH: "limit the number of views ... to two or three"
    filters_per_sheet: int = 5
    visible_sheets: int = 20
    datasources: int = 5
    layout_containers: int = 20
    lod_calcs: int = 10
    calc_length: int = 500
    date_calcs: int = 10
    fonts: int = 3
    colors_in_palette: int = 10


@dataclass
class Finding:
    rule: str
    severity: str
    message: str
    location: str
    source: str
    fix: str = ""

    def as_dict(self) -> dict:
        return asdict(self)


@dataclass
class Report:
    findings: list[Finding] = field(default_factory=list)
    stats: dict = field(default_factory=dict)

    @property
    def score(self) -> int:
        penalty = sum({"error": 15, "warning": 5, "info": 1}[f.severity] for f in self.findings)
        return max(0, 100 - penalty)

    def as_dict(self) -> dict:
        return {
            "score": self.score,
            "counts": {s: sum(f.severity == s for f in self.findings) for s in SEVERITY_ORDER},
            "stats": self.stats,
            "findings": [f.as_dict() for f in sorted(self.findings, key=lambda f: (SEVERITY_ORDER[f.severity], f.rule))],
        }


LOD_RE = re.compile(r"\{\s*(FIXED|INCLUDE|EXCLUDE)\b", re.I)
DATE_FN_RE = re.compile(r"\b(DATEADD|DATEDIFF|DATENAME|DATEPART|DATETRUNC|DATE|DATETIME|MAKEDATE|DATEPARSE|YEAR|MONTH|DAY|QUARTER|WEEK|ISODATE\w*)\s*\(", re.I)
COUNTD_RE = re.compile(r"\bCOUNTD\s*\(", re.I)
CROSS_DS_RE = re.compile(r"\[(federated\.[^\]]+|sqlproxy\.[^\]]+|[a-z\-]+\.[0-9a-z]+)\]\.\[", re.I)
DEFAULT_NAME_RE = re.compile(r"^(Sheet|Dashboard|Story|Hoja|Dashboard|Historia)\s*\d+$", re.I)
COMMENT_RE = re.compile(r"//[^\n]*")


def _calc_columns(ds: etree._Element):
    for col in ds.findall("column"):
        calc = col.find("calculation")
        if calc is not None and calc.get("class", "tableau") == "tableau" and calc.get("formula") is not None:
            yield col, calc.get("formula")


def _title_text(el: etree._Element) -> str | None:
    runs = el.xpath("./layout-options/title/formatted-text/run")
    if not runs:
        return None
    return "".join(r.text or "" for r in runs).strip()


def lint(xml: str | etree._Element, th: Thresholds | None = None) -> Report:
    th = th or Thresholds()
    root = twb.parse(xml) if not isinstance(xml, etree._Element) else xml
    rep = Report()
    add = lambda *a, **k: rep.findings.append(Finding(*a, **k))  # noqa: E731

    dss = twb.datasources(root)
    worksheets = root.findall("./worksheets/worksheet")
    dashboards = [d for d in root.findall("./dashboards/dashboard") if d.get("type") != "storyboard"]
    windows = {w.get("name"): w for w in root.findall("./windows/window")}

    # ---------------------------------------------------------------- datasources
    used_ds: set[str] = set()
    for ws in worksheets:
        for d in ws.findall("./table/view/datasources/datasource"):
            used_ds.add(d.get("name"))
    n_calcs = n_lod = n_date = 0
    for ds in dss:
        cap = ds.get("caption") or ds.get("name")
        loc = f"datasource:{cap}"
        has_extract = ds.find("extract[@enabled='true']") is not None or ds.xpath(".//connection[@class='hyper']")
        is_published = bool(ds.xpath("./repository-location")) or bool(ds.xpath(".//connection[@class='sqlproxy']"))
        if not has_extract and not is_published:
            add("WBO-LIVE", "info", f"'{cap}' is a live connection, not an extract.", loc, SOURCES["WBO"],
                "Consider extracting the data source (aggregated + filtered extract, hide unused fields first).")
        if ds.xpath(".//relation[@type='text']"):
            add("PERF-CUSTOMSQL", "warning", f"'{cap}' uses Custom SQL.", loc, SOURCES["PERF"],
                "Avoid custom SQL; use relationships/joins or a database view so Tableau can optimize queries.")
        named = ds.xpath("./connection/named-connections/named-connection")
        if len(named) > 1:
            add("WBO-MULTICONN", "info", f"'{cap}' combines {len(named)} connections (cross-database).", loc, SOURCES["WBO"],
                "Cross-database joins can't be computed locally; consider an extract or Tableau Prep.")
        if ds.get("name") not in used_ds:
            add("WBO-UNUSED-DS", "warning", f"'{cap}' isn't used by any worksheet.", loc, SOURCES["WBO"],
                "Close data sources that aren't in use.")
        groups = [c for c in ds.findall("column") if c.find("calculation[@class='categorical-bin']") is not None]
        if groups:
            add("WBO-GROUPS", "info", f"'{cap}' uses {len(groups)} grouped field(s).", loc, SOURCES["WBO"],
                "Groups load the entire domain of the field; prefer CASE calculations or sets.")
        calc_names = {c.get("name") for c, _ in _calc_columns(ds)}
        for col, formula in _calc_columns(ds):
            n_calcs += 1
            cname = col.get("caption") or col.get("name")
            cloc = f"{loc}/calc:{cname}"
            if len(formula) > th.calc_length:
                add("WBO-CALC-LENGTH", "info", f"Calculation '{cname}' is {len(formula)} characters long.", cloc, SOURCES["WBO"],
                    "Simplify or materialize it in the extract / Tableau Prep (comments count toward length).")
            if LOD_RE.search(formula):
                n_lod += 1
            if DATE_FN_RE.search(formula):
                n_date += 1
            code = COMMENT_RE.sub("", formula)
            if COUNTD_RE.search(code):
                add("PERF-COUNTD", "info", f"Calculation '{cname}' uses COUNTD (one of the slowest functions).", cloc, SOURCES["PERF"],
                    "Avoid COUNTD when possible, or materialize the distinct count upstream.")
            if CROSS_DS_RE.search(code) and "[Parameters]." not in code:
                add("WBO-CALC-MULTI-DS", "warning", f"Calculation '{cname}' references fields from another data source.", cloc, SOURCES["WBO"],
                    "Calculations across data sources are computed locally; combine the data with relationships or Tableau Prep.")
            refs = set(re.findall(r"\[[^\]]+\]", code))
            if refs & (calc_names - {col.get("name")}):
                add("WBO-NESTED-CALC", "info", f"Calculation '{cname}' references another calculation.", cloc, SOURCES["WBO"],
                    "Nested calculations add query complexity; flatten or materialize where possible.")
    if len(dss) > th.datasources:
        add("WBO-NUM-DS", "warning", f"Workbook has {len(dss)} data sources.", "workbook", SOURCES["WBO"],
            "Each data source adds load time; consolidate where possible.")
    if n_lod > th.lod_calcs:
        add("WBO-NUM-LOD", "warning", f"Workbook has {n_lod} LOD calculations.", "workbook", SOURCES["WBO"],
            "LOD expressions are expensive; consider table calcs or pre-aggregation.")
    if n_date > th.date_calcs:
        add("WBO-DATE-CALCS", "info", f"Workbook has {n_date} date calculations.", "workbook", SOURCES["WBO"],
            "Minimize date calculations; prefer DATEPARSE / MAKEDATE / DATEDIFF and native date parts.")

    # ---------------------------------------------------------------- worksheets
    for ws in worksheets:
        name = ws.get("name")
        loc = f"worksheet:{name}"
        if DEFAULT_NAME_RE.match(name or ""):
            add("NAME-DEFAULT", "warning", f"Worksheet keeps the default name '{name}'.", loc, SOURCES["A11Y"],
                "Give every sheet a descriptive name; it becomes the default title and the tab/alt text.")
        view_ds = [d.get("name") for d in ws.findall("./table/view/datasources/datasource") if d.get("name") != "Parameters"]
        if len(view_ds) > 1:
            add("WBO-BLENDING", "warning", f"Worksheet uses data blending ({len(view_ds)} data sources).", loc, SOURCES["WBO"],
                "Use relationships instead of blending when possible; aggregate before blending.")
        filters = [f for f in ws.findall("./table/view/filter") if f.get("column", "").find(":Measure Names") < 0]
        if len(filters) > th.filters_per_sheet:
            add("WBO-NUM-FILTERS", "warning", f"Worksheet has {len(filters)} filters.", loc, SOURCES["WBO"],
                "Excessive filters create complex queries; reduce them or use filter actions.")
        for f in filters:
            for gf in f.iter("groupfilter"):
                if gf.get("function") == "except" or gf.get("{http://www.tableausoftware.com/xml/user}ui-marker") == "exclude":
                    add("PERF-EXCLUDE-FILTER", "info", "Filter uses Exclude on discrete items.", loc, SOURCES["PERF"],
                        "Keep only / Exclude on discrete lists is heavy; prefer ranges or a boolean calc.")
                    break
        win = windows.get(name)
        if win is not None:
            for card in win.xpath(".//card[@type='filter']"):
                if card.get("values") == "relevant":
                    add("WBO-RELEVANT-VALUES", "warning", "Quick filter uses 'Only Relevant Values'.", loc, SOURCES["WBO"],
                        "Each change re-queries the domain; use dashboard filter actions instead.")
        title = _title_text(ws)
        if title is not None:
            if len(title) > 3 and title.isupper():
                add("A11Y-CAPS-TITLE", "info", f"Title is ALL CAPS: '{title}'.", loc, SOURCES["A11Y"], "Avoid all capital letters in titles.")
            if len(title.split()) == 1 and not title.startswith("<"):
                add("A11Y-ONE-WORD-TITLE", "info", f"One-word title '{title}' isn't descriptive.", loc, SOURCES["A11Y"],
                    "Describe what the view shows, e.g. 'Sales by Region, 2024'.")
        pane_marks = ws.xpath("./table/panes/pane/mark/@class")
        encs = ws.xpath("./table/panes/pane/encodings/color/@column")
        if "Line" in pane_marks and encs and not ws.xpath("./table/panes/pane/encodings/shape | ./table/panes/pane/encodings/text"):
            add("A11Y-LINE-COLOR-ONLY", "info", "Line chart distinguishes series by color only.", loc, SOURCES["A11Y"],
                "Add shapes, labels or direct labeling so the view works for color-blind users.")

    # ---------------------------------------------------------------- dashboards
    for db in dashboards:
        name = db.get("name")
        loc = f"dashboard:{name}"
        if DEFAULT_NAME_RE.match(name or ""):
            add("NAME-DEFAULT", "warning", f"Dashboard keeps the default name '{name}'.", loc, SOURCES["A11Y"], "Use a descriptive name.")
        size = db.find("size")
        if size is None:
            add("WBO-DASH-SIZE", "warning", "Dashboard size is Automatic.", loc, SOURCES["WBO"],
                "Use a fixed size (cacheable, predictable) or a range.")
        elif size.get("minwidth") != size.get("maxwidth") or size.get("minheight") != size.get("maxheight"):
            add("WBO-DASH-SIZE", "info", "Dashboard uses Range sizing (not fixed).", loc, SOURCES["WBO"],
                "Fixed-size dashboards can be cached; range sizing is acceptable when layouts must flex.")
        sheet_zones = {z.get("name") for z in db.iter("zone") if z.get("name") and not z.get("type-v2") and not z.get("type")}
        views = [s for s in sheet_zones if s in {w.get("name") for w in worksheets}]
        if len(views) > th.views_per_dashboard:
            sev = "warning" if len(views) > th.views_per_dashboard * 2 else "info"
            add("DASH-NUM-VIEWS", sev, f"Dashboard contains {len(views)} views.", loc, SOURCES["DASH"],
                "Limit dashboards to two or three views; split into more dashboards or use navigation.")
        containers = [z for z in db.iter("zone") if (z.get("type-v2") or z.get("type")) in ("layout-flow", "layout-basic")]
        if len(containers) > th.layout_containers:
            add("WBO-LAYOUT-CONTAINERS", "warning", f"Dashboard has {len(containers)} layout containers.", loc, SOURCES["WBO"],
                "Layout containers complicate rendering; flatten the layout.")
        rel_filters = [z for z in db.iter("zone") if (z.get("type-v2") or z.get("type")) == "filter" and z.get("values") == "relevant"]
        if rel_filters:
            add("WBO-RELEVANT-VALUES", "warning", f"{len(rel_filters)} dashboard filter(s) use 'Only Relevant Values'.", loc, SOURCES["WBO"],
                "Use dashboard filter actions instead.")
        if not any((z.get("type-v2") or z.get("type")) == "title" for z in db.iter("zone")) and not db.xpath(".//zone[@type-v2='text']"):
            add("A11Y-DASH-TITLE", "info", "Dashboard has no title or text object.", loc, SOURCES["A11Y"],
                "Add a descriptive title and a subtitle explaining how to interact with it.")

    # ---------------------------------------------------------------- workbook-wide
    visible = [w for w in root.findall("./windows/window") if w.get("hidden") != "true"]
    if len(visible) > th.visible_sheets:
        add("WBO-NUM-SHEETS", "warning", f"Workbook has {len(visible)} visible sheets.", "workbook", SOURCES["WBO"],
            "Hide worksheets used only in dashboards; split very large workbooks.")
    fonts = {v for v in root.xpath(".//format[@attr='font-family']/@value | .//run/@fontname")}
    if len(fonts) > th.fonts:
        add("VIS-FONTS", "info", f"Workbook uses {len(fonts)} font families: {sorted(fonts)}.", "workbook", SOURCES["VIS"],
            "Use a small, consistent font hierarchy.")
    for pal in root.xpath("./preferences/color-palette"):
        n = len(pal.findall("color"))
        if pal.get("type") == "regular" and n > th.colors_in_palette:
            add("VIS-PALETTE", "info", f"Categorical palette '{pal.get('name')}' has {n} colors.", "workbook", SOURCES["VIS"],
                "Use neutral primaries and few accent colors; account for color blindness.")
    rep.stats = {
        "datasources": len(dss),
        "worksheets": len(worksheets),
        "dashboards": len(dashboards),
        "calculations": n_calcs,
        "lodCalculations": n_lod,
        "visibleSheets": len(visible),
    }
    return rep
