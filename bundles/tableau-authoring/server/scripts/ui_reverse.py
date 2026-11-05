"""Dynamic reverse engineering of Tableau Desktop's interface: run each menu command and diff the workbook.

    uv run python scripts/ui_reverse.py <probe.twb> [--build] [--sheets Barras,Tabla] [--only "Analysis > Show Mark Labels"]

--build writes the probe first: bars, a coloured line over time, a text table, a scatter, a dashboard, a story.

--launch starts a separate Desktop with the probe and works only on that process (recommended: a command can leave
an instance unable to apply documents). Otherwise Desktop must be running with a TEST workbook open: the probe
is applied over it (POST /v0/workbook/document).
For every sheet of the probe and every enabled command of its menus the harness
  1. re-applies the probe (so each command starts from the same document) and opens the sheet (Window > sheet),
  2. reads the document, runs the command through UI Automation (tableu_mcp.uia),
  3. records the dialogs it opened (then closes them with the title-bar X, which cancels them),
  4. reads the document again and records what the command changed in the XML.
Results go to src/tableu_mcp/docs/ui-commands.json, shown in tableu://ui-commands.
Commands that leave the workbook (files, server, printing, export, clipboard) are never run.
"""

from __future__ import annotations

import argparse
import collections
import difflib
import json
import re
import threading
import time
from pathlib import Path

from lxml import etree

from tableu_mcp import desktop_setup, twb, uia
from tableu_mcp.client import DesktopClient

OUT = Path(__file__).resolve().parents[1] / "src" / "tableu_mcp" / "docs" / "ui-commands.json"

MENUS = ("Data", "Worksheet", "Dashboard", "Story", "Analysis", "Map", "Format")
# Never run: they leave the workbook (files, clipboard, printing, server) or only change the window.
SKIP = re.compile(r"^(Export|Copy|Paste|Print|Save|Publish|Open|Close|Exit|Presentation Mode|Run Update|"
                  r"Add to Saved Data Sources|Export Data|Duplicate$|Image\.\.\.|Crosstab|Edit Data Source\.\.\.|Extract Data|"
                  r"Manage Workbook Extensions|Analytics Extension|New Data Source|Replace Data Source|"
                  r"Export Image|Copy Image|Describe Sheet|View Data Model|Explain Data Settings|Bookmark)", re.I)
# Volatile parts of a document that change without the command doing anything.
LOCAL = re.compile(r'(directory|filename|dbname)="[^"]*"')  # no local paths in the published diffs
VOLATILE = {"simple-id", "thumbnails", "repository-location"}


def lines(xml: str) -> list[str]:
    root = etree.fromstring(xml.encode("utf-8"), etree.XMLParser(remove_blank_text=True, huge_tree=True))
    for el in list(root.iter()):
        if isinstance(el.tag, str) and el.tag in VOLATILE and el.getparent() is not None:
            el.getparent().remove(el)
    return etree.tostring(root, pretty_print=True, encoding="unicode").splitlines()


def signatures(xml_lines: list[str]) -> collections.Counter:
    """parent/tag@attr=value for every element: comparable across sheets, unlike a line diff."""
    root = etree.fromstring("\n".join(xml_lines).encode("utf-8"), etree.XMLParser(huge_tree=True))
    out: collections.Counter = collections.Counter()
    for el in root.iter():
        if not isinstance(el.tag, str):
            continue
        p = el.getparent()
        base = f"{p.tag if p is not None else ''}/{el.tag}"
        out[base] += 1
        for k, v in el.attrib.items():
            if k in ("name", "caption", "id", "uuid", "x", "y", "w", "h") or len(v) > 60:
                out[f"{base}@{k}"] += 1
            else:
                out[f"{base}@{k}={v}"] += 1
    return out


def diff(before: str, after: str) -> dict:
    a, b = lines(before), lines(after)
    if a == b:
        return {"changed": False}
    sa, sb = signatures(a), signatures(b)
    udiff = [LOCAL.sub(r'\1="<local>"', ln) for ln in difflib.unified_diff(a, b, lineterm="", n=1)][2:]
    return {"changed": True,
            "added": sorted((sb - sa).keys()), "removed": sorted((sa - sb).keys()),
            "diff": udiff[:120], "diffLines": len(udiff)}


class LogTail:
    """Desktop logs every command it runs (commands-controller.invoke-command, args 'tabdoc:...'/'tabui:...'):
    the internal command behind a menu item. Reads what the log gained since the last call, for one process."""

    NOISE = re.compile(r"^(tabui:goto |tabdoc:get-|tabdoc:simple-command-list|tabdoc:set-workbook-xml|"
                       r"tabdoc:highlight-selected|tabdoc:release-|tabdoc:clear-alias-cache|tabui:get-|"
                       r"tabdoc:schedule-data-source-data-rebuild|tabdoc:view-data-dialog-cleanup|tabdoc:refresh-)")

    def __init__(self, pid: int):
        self.pid = pid
        self.pos = {f: f.stat().st_size for f in desktop_setup.log_dir().glob("log*.txt")}

    def read(self) -> list[str]:
        out = []
        for f in desktop_setup.log_dir().glob("log*.txt"):
            start = self.pos.get(f, 0)
            size = f.stat().st_size
            if size < start:
                start = 0
            with f.open("rb") as fh:
                fh.seek(start)
                chunk = fh.read(size - start).decode("utf-8", "replace")
            self.pos[f] = size
            for line in chunk.splitlines():
                if f'"pid":{self.pid},' not in line or "begin-commands-controller.invoke-command" not in line:
                    continue
                try:
                    args = json.loads(line).get("v", {}).get("args", "")
                except ValueError:
                    continue
                if args and not self.NOISE.match(args):
                    out.append(args[:400])
        return out


class Watch:
    """A modal blocks the API; record every window Desktop opens while a command runs."""

    pids: list[int] | None = None

    def __init__(self):
        self.seen: list[dict] = []
        self._stop = threading.Event()
        self._t = threading.Thread(target=self._run, daemon=True)

    def _run(self):
        while not self._stop.is_set():
            for m in desktop_setup.modals(pids=self.pids):
                if m.get("title") and not any(s.get("title") == m["title"] for s in self.seen):
                    self.seen.append({k: m.get(k) for k in ("title", "texts", "buttons")})
            self._stop.wait(1.0)

    def __enter__(self):
        self._t.start()
        return self

    def __exit__(self, *exc):
        self._stop.set()
        self._t.join()


def build_probe(out: Path) -> None:
    from tableu_mcp import authoring as A  # noqa: PLC0415
    from tableu_mcp import connectors, registry  # noqa: PLC0415

    csv = out.with_suffix(".csv")
    rows = ["Region,Canal,Fecha,Importe,Coste,Unidades"]
    for i in range(48):
        rows.append(f"{['Norte', 'Sur', 'Este', 'Oeste'][i % 4]},{['Online', 'Tienda'][i % 2]},"
                    f"2025-{i % 12 + 1:02d}-{i % 27 + 1:02d},{10 + i * 3.5:.2f},{5 + i * 1.5:.2f},{i % 7 + 1}")
    csv.write_text("\n".join(rows) + "\n", encoding="utf-8")
    root = twb.new_workbook()
    connectors.add_file_datasource(root, [f"Ventas={csv}"])
    A.create_worksheet(root, "Barras", "Ventas", rows=["Region"], cols=["SUM(Importe)"], mark="bar")
    A.create_worksheet(root, "Linea", "Ventas", cols=["MONTH_TRUNC(Fecha)"], rows=["SUM(Importe)"], mark="line",
                       color="Canal")
    A.create_worksheet(root, "Tabla", "Ventas", rows=["Region"], cols=["Canal"], mark="text", label="SUM(Importe)")
    A.create_worksheet(root, "Dispersion", "Ventas", cols=["SUM(Coste)"], rows=["SUM(Importe)"], mark="circle",
                       detail=["Region"])
    registry._db_create(root, "Tablero", rows=[["Barras", "Linea"], ["Tabla"]])
    A.create_story(root, "Historia", [{"sheet": "Tablero", "caption": "Resumen"}, {"sheet": "Barras", "caption": "Regiones"}])
    out.write_text(twb.serialize(root), encoding="utf-8")


class ApplyFailed(RuntimeError):
    pass


def fresh_names(probe: str) -> str:
    """The probe with new internal data source names. Desktop remembers, for the session, the names of data
    sources it dropped (e.g. after Data > Duplicate re-binds the sheets to the copy): a document that brings one
    back fails to apply (7195FDCA / 8EAB519C, measured 2026-11-05). A fresh name applies."""
    import random  # noqa: PLC0415
    import string  # noqa: PLC0415

    for name in set(re.findall(r'name="(federated\.[0-9a-z]{28})"', probe)):
        new = "federated." + "".join(random.choices(string.ascii_lowercase + string.digits, k=28))
        probe = probe.replace(name, new)
    return probe


def reset(client: DesktopClient, probe: str, sheet: str) -> None:
    uia.close_windows()
    r = client.apply_document(fresh_names(probe))
    if r.get("state") != "SUCCEEDED":
        dialogs = desktop_setup.error_dialogs(dismiss=True, pids=Watch.pids)
        raise ApplyFailed(f"Desktop no longer applies the probe: {r.get('error')} {[d.get('code') for d in dialogs]}")
    order = [w.get("name") for w in twb.parse(probe).iter("window")]
    for _ in range(5):  # right after an apply Desktop may still be rebuilding its window
        time.sleep(1.0)
        r = uia.invoke(f"Window > {sheet}")
        if not r.get("invoked"):  # e.g. on the Data Source page the Window menu lists no sheets
            r = uia.goto_sheet(sheet, order.index(sheet) if sheet in order else -1)
        if r.get("invoked"):
            break
    if not r.get("invoked"):
        raise RuntimeError(f"cannot open sheet {sheet}: {r}")
    time.sleep(1.0)


def commands_for(sheet: str) -> list[dict]:
    items = uia.menu_items(MENUS, depth=3)
    errs = [i for i in items if "error" in i]
    if errs:
        raise RuntimeError(errs)
    return items


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("probe")
    ap.add_argument("--sheets", default="")
    ap.add_argument("--only", action="append", default=[])
    ap.add_argument("--build", action="store_true")
    ap.add_argument("--launch", action="store_true")
    ap.add_argument("--pid", type=int)
    ap.add_argument("--resume", action="store_true", help="skip commands already measured")
    ap.add_argument("--all", action="store_true", help="measure every command on every sheet")
    args = ap.parse_args()
    if args.build:
        build_probe(Path(args.probe).resolve())
    if args.launch:
        before = set(desktop_setup.tableau_running())
        desktop_setup.launch(workbook=str(Path(args.probe).resolve()))
        for _ in range(120):
            time.sleep(2)
            new = [p for p in desktop_setup.tableau_running() if p not in before]
            if new:
                try:
                    DesktopClient.connect(pid=new[0]).workbook()
                    args.pid = new[0]
                    break
                except Exception:  # noqa: BLE001  still starting
                    pass
        if not args.pid:
            raise RuntimeError("the launched Desktop did not answer")
        time.sleep(5)
    if args.pid:
        uia.PID = args.pid
        desktop_setup_pids = [args.pid]
        Watch.pids = desktop_setup_pids

    probe = twb.serialize(twb.parse(Path(args.probe).read_text(encoding="utf-8")))
    client = DesktopClient.connect(pid=args.pid)
    print("Desktop pid", client.instance.pid if hasattr(client, "instance") else args.pid, flush=True)
    sheets = [s for s in args.sheets.split(",") if s] or [
        n for kind in ("worksheets", "dashboards", "stories") for n in twb.sheet_names(twb.parse(probe)).get(kind, [])]
    data = json.loads(OUT.read_text(encoding="utf-8")) if OUT.exists() else {}
    data["checked"] = f"Tableau Desktop {client.app().get('applicationVersion')}, menus through UI Automation"
    data.setdefault("sheets", {})
    tail = LogTail(args.pid or desktop_setup.tableau_running()[0])
    for sheet in sheets:
        reset(client, probe, sheet)
        kind = next(k for k, v in twb.sheet_names(twb.parse(probe)).items() if sheet in v)
        items = commands_for(sheet)
        menu = [{k: i[k] for k in ("path", "enabled", "checked", "submenu")} for i in items]
        rec = data["sheets"].setdefault(sheet, {})
        rec.update({"kind": kind, "menu": menu})
        results = rec.setdefault("commands", {})
        # A command measured on an earlier sheet of the same kind is not measured again (the Data menu is the
        # same everywhere): later sheets add what only they enable (Totals on a table, trend lines on a line).
        seen_paths = {p for s, r in data["sheets"].items() if s != sheet and r.get("kind") == kind
                      for p in r.get("commands", {})} if not args.all else set()
        # the Data menu is the same on every sheet: measured once
        data_done = not args.all and any(p.startswith("Data > ") for s, r in data["sheets"].items() if s != sheet
                                         for p in r.get("commands", {}))
        todo = [i for i in items if i["enabled"] and not i["submenu"]
                and not any(SKIP.match(seg) for seg in i["path"].split(" > "))  # e.g. Worksheet > Copy > Data
                and i["path"] not in seen_paths and not (data_done and i["path"].startswith("Data > "))
                and (not args.only or i["path"] in args.only)]
        print(f"== {sheet} ({kind}): {len(items)} items, {len(todo)} to run", flush=True)
        prev, dirty = None, True
        for i in todo:
            if args.resume and results.get(i["path"], {}).get("invoked"):
                continue
            if dirty:  # only re-apply the probe when the last command changed something
                try:
                    reset(client, probe, sheet)
                except ApplyFailed as e:
                    if prev:  # the previous command left Desktop unable to apply documents
                        results[prev]["breaksDesktop"] = str(e)
                    OUT.write_text(json.dumps(data, ensure_ascii=False, indent=1), encoding="utf-8")
                    raise SystemExit(f"stopped after {prev!r}: {e}") from e
            prev = i["path"]
            before = client.get_document()
            tail.read()
            r = uia.invoke(i["path"])
            if not r.get("invoked") and "disabled" not in str(r.get("error")):
                # a side pane left open by the previous command can keep a menu from opening: start clean, retry
                reset(client, probe, sheet)
                before = client.get_document()
                tail.read()
                r = uia.invoke(i["path"])
            time.sleep(1.5)
            commands = tail.read()
            if args.pid and args.pid not in desktop_setup.tableau_running():
                results[i["path"]] = {"commands": commands, "crashesDesktop": True}
                OUT.write_text(json.dumps(data, ensure_ascii=False, indent=1), encoding="utf-8")
                raise SystemExit(f"Desktop exited after {i['path']!r}")
            seen = [{k: m.get(k) for k in ("title", "texts", "buttons")}
                    for m in desktop_setup.modals(pids=Watch.pids) if m.get("title")]
            closed = []
            if seen:
                closed = uia.close_windows()
                time.sleep(0.5)
                left = [m.get("title") for m in desktop_setup.modals(pids=Watch.pids)]
                if left:  # a window that stays open would swallow the next commands
                    results[i["path"]] = {"dialogs": seen, "commands": commands, "error": f"could not close {left}"}
                    OUT.write_text(json.dumps(data, ensure_ascii=False, indent=1), encoding="utf-8")
                    raise SystemExit(f"stopped: {i['path']!r} left {left} open")
            try:
                after = client.get_document()
                d = diff(before, after)
            except Exception as e:  # noqa: BLE001
                d = {"changed": None, "error": str(e)[:300]}
            dirty = bool(seen) or d.get("changed") is not False or not r.get("invoked")
            w = type("W", (), {"seen": seen})
            res = {"checkedBefore": i["checked"], "invoked": r.get("invoked"), "error": r.get("error"),
                   "commands": commands, "dialogs": w.seen, "closed": closed, **d}
            results[i["path"]] = res
            tag = "dialog" if w.seen else ("changed" if d.get("changed") else "no change")
            print(f"  {i['path']}: {tag} {res.get('added', [])[:4]}", flush=True)
            OUT.write_text(json.dumps(data, ensure_ascii=False, indent=1), encoding="utf-8")
    reset(client, probe, sheets[0])
    OUT.write_text(json.dumps(data, ensure_ascii=False, indent=1), encoding="utf-8")
    report(data)
    print("wrote", OUT)


def _effect(r: dict) -> str:
    if r.get("crashesDesktop"):
        return "**cierra Desktop**"
    if r.get("breaksDesktop"):
        return "**deja Desktop sin poder aplicar documentos**"
    parts = []
    if r.get("dialogs"):
        parts.append("abre " + ", ".join(f"«{d['title']}»" for d in r["dialogs"]))
    if r.get("changed"):
        sig = [s for s in r.get("added", []) if "@" in s][:4] or r.get("added", [])[:4]
        rem = [s for s in r.get("removed", []) if "@" in s][:3] or r.get("removed", [])[:3]
        parts.append("XML: " + ("+ " + ", ".join(f"`{s}`" for s in sig) if sig else "")
                     + (" − " + ", ".join(f"`{s}`" for s in rem) if rem else ""))
    elif r.get("changed") is False and not r.get("dialogs"):
        parts.append("sin cambio en el documento")
    if r.get("error"):
        parts.append(f"error: {r['error'][:80]}")
    return "; ".join(parts)


def report(data: dict) -> Path:
    """docs/ui-commands.md (tableu://ui-commands) from ui-commands.json."""
    lines = ["# Comandos de la interfaz de Tableau Desktop", "",
             f"Generado por `scripts/ui_reverse.py` ({data.get('checked', '')}). Cada comando se ejecutó por UI "
             "Automation sobre un libro de prueba recién aplicado; se registró el comando interno que Desktop anota en "
             "su log, el diálogo que abre (cerrado con la X, que cancela) y lo que cambia en el XML del libro. Lo que "
             "cambia el XML es lo que `tableu` puede escribir directamente; el detalle completo de cada diff está en "
             "`ui-commands.json`.", ""]
    for sheet, rec in data.get("sheets", {}).items():
        cmds = rec.get("commands", {})
        lines += [f"## Hoja `{sheet}` ({rec.get('kind')})", "",
                  "| menú | comando interno | efecto |", "|---|---|---|"]
        for path, r in cmds.items():
            cmd = "<br>".join(f"`{c[:90]}`" for c in r.get("commands", [])[:2]) or "—"
            lines.append(f"| {path} | {cmd} | {_effect(r)} |")
        off = [m["path"] for m in rec.get("menu", []) if not m["enabled"] and not m["submenu"]]
        if off:
            lines += ["", f"Desactivados en esta hoja (necesitan una selección o no aplican): {len(off)}. "
                      + ", ".join(off[:40]) + ("…" if len(off) > 40 else ""), ""]
    md = OUT.with_suffix(".md")
    md.write_text("\n".join(lines) + "\n", encoding="utf-8")
    return md


if __name__ == "__main__":
    main()
