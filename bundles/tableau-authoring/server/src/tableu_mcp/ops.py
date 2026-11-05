"""Shared operations for the CLI and the MCP server.

A *target* is either ``"live"`` (the workbook open in a running Tableau Desktop, optionally
``"live:<pid>"``) or a path to a .twb/.twbx file. Every edit:
  1. loads the XML from the target,
  2. applies a builder function,
  3. validates (Desktop's schema validator when a live instance is available),
  4. backs up the previous XML (live targets) and applies / saves.
"""

from __future__ import annotations

import os
import time
from collections.abc import Callable
from pathlib import Path

from lxml import etree

from . import desktop_setup, twb
from .client import DesktopClient
from .lint import Thresholds, lint

BACKUP_DIR = Path(os.environ.get("TABLEU_BACKUP_DIR") or Path.home() / ".tableu" / "backups")


def _is_live(target: str) -> bool:
    return target == "live" or target.startswith("live:")


def _client(target: str) -> DesktopClient:
    pid = int(target.split(":", 1)[1]) if ":" in target and target.startswith("live:") else None
    return DesktopClient.connect(pid=pid)


def load(target: str) -> str:
    if _is_live(target):
        return _client(target).get_document()
    return twb.read_workbook_file(target)


def backup(xml: str, label: str = "live") -> Path:
    BACKUP_DIR.mkdir(parents=True, exist_ok=True)
    p = BACKUP_DIR / f"{time.strftime('%Y%m%d-%H%M%S')}-{label}.twb"
    p.write_text(xml, encoding="utf-8")
    return p


def list_backups(limit: int = 20) -> list[str]:
    if not BACKUP_DIR.exists():
        return []
    return [str(p) for p in sorted(BACKUP_DIR.glob("*.twb"), reverse=True)[:limit]]


def validate(xml: str, target: str = "live") -> dict:
    """Validate with Desktop when possible, otherwise just check well-formedness."""
    try:
        twb.parse(xml)
    except etree.XMLSyntaxError as e:
        return {"ok": False, "isValid": False, "validationIssues": [f"XML syntax: {e}"], "validator": "lxml"}
    try:
        c = _client(target if _is_live(target) else "live")
    except RuntimeError:
        return {"ok": True, "isValid": None, "validationIssues": [], "validator": "lxml (no Desktop running: schema not checked)"}
    return {**c.validate_document(xml), "validator": "tableau-desktop"}


# What the External Client API 0.1.1 keeps from an applied document is narrower than what Desktop loads from
# a file: changes inside sheets, dashboards and datasource fields apply, but NEW parameters, actions and
# button objects are silently dropped, although the call answers SUCCEEDED (verified on 2026.3, 2026-11-04).
# Loading the same XML from a file keeps them, so a live edit that adds them is checked after the apply
# and, if anything was dropped, kept as a pending file that `workbook Reopen` loads.
PENDING_DIR = BACKUP_DIR.parent / "pending"


def _workbook_objects(xml: str) -> dict[str, set[str]]:
    root = twb.parse(xml)
    params = root.find("datasources/datasource[@name='Parameters']")
    return {
        "parameters": {c.get("name") for c in (params.findall("column") if params is not None else [])},
        "actions": {a.get("name") for a in (root.find("actions") if root.find("actions") is not None else [])
                    if a.get("name")},
        "buttons": {f"{d.get('name')}#{z.get('id')}" for d in root.iter("dashboard")
                    for z in d.iter("zone") if z.get("type-v2") == "dashboard-object"},
    }


def _dropped(intended: str, actual: str) -> dict[str, list[str]]:
    want, got = _workbook_objects(intended), _workbook_objects(actual)
    return {k: sorted(want[k] - got[k]) for k in want if want[k] - got[k]}


def save(target: str, xml: str, out: str | None = None, force: bool = False) -> dict:
    """Write XML to the target (or ``out``). Validates first unless ``force``."""
    v = validate(xml, target)
    if not v["ok"] and not force:
        return {"applied": False, "validation": v}
    if _is_live(target) and not out:
        c = _client(target)
        root = twb.parse(xml)
        if not root.findall("./worksheets/worksheet"):
            return {"applied": False, "validation": v,
                    "error": "Tableau refuses to apply a workbook with no worksheets; add at least one sheet."}
        bk = backup(c.get_document())
        try:
            result = c.apply_document(xml)
        except Exception as e:  # noqa: BLE001 - a modal dialog can block Desktop and time the call out
            result = {"state": "UNKNOWN", "error": f"{type(e).__name__}: {e}"}
        out_ = {"applied": result.get("state") == "SUCCEEDED", "operation": result, "backup": str(bk), "validation": v}
        if out_["applied"]:
            try:
                dropped = _dropped(xml, c.get_document())
            except Exception:  # noqa: BLE001 - the check is advisory; the apply itself succeeded
                dropped = {}
            if dropped:
                PENDING_DIR.mkdir(parents=True, exist_ok=True)
                pending = PENDING_DIR / f"{time.strftime('%Y%m%d-%H%M%S')}-pending.twb"
                pending.write_text(xml, encoding="utf-8")
                out_.update({
                    "applied": "partial",
                    "dropped": dropped,
                    "pending": str(pending),
                    "next": "The live API does not add these; loading the workbook from a file does. Run "
                            f"workbook Reopen with pending='{pending}' and confirm=true: it backs up the "
                            "workbook file, writes this XML to it and reopens Desktop on it.",
                })
        # Failures (and failing queries after a successful apply) surface as modal dialogs: report and close them.
        dialogs = desktop_setup.error_dialogs(dismiss=True, pids=[c.instance.pid])
        if dialogs:
            out_["applied"] = False if result.get("state") != "SUCCEEDED" else out_["applied"]
            out_["desktopErrors"] = dialogs
        return out_
    dest = out or target
    path = twb.write_workbook_file(dest, xml, base_twbx=target if (not _is_live(target) and str(target).lower().endswith(".twbx")) else None)
    return {"applied": True, "path": str(path), "validation": v}


def edit(target: str, fn: Callable[[etree._Element], object], out: str | None = None, dry_run: bool = False, force: bool = False) -> dict:
    root = twb.parse(load(target))
    result = fn(root)
    xml = twb.serialize(root)
    if dry_run:
        return {"result": result, "validation": validate(xml, target), "dryRun": True, "bytes": len(xml)}
    return {"result": result, **save(target, xml, out=out, force=force)}


def reopen(pending: str, confirm: bool = False, wait: int = 180) -> dict:
    """Load a full workbook XML into Desktop through its file: back up the open workbook's file, write the
    XML there, close Desktop and reopen it on that file. Needed for what the live API drops (new parameters,
    actions, buttons). Closing Desktop discards anything not in ``pending``, hence confirm=True."""
    import subprocess  # noqa: PLC0415

    xml = Path(pending).read_text(encoding="utf-8")
    c = _client("live")
    info = c.get_json("/v0/workbook")
    location = info.get("location")
    if not location:
        return {"reopened": False, "error": "the open workbook has never been saved: save it in Desktop first"}
    plan = {"file": location, "pid": c.instance.pid, "unsavedChangesInDesktop": info.get("unsavedChanges")}
    if not confirm:
        return {"reopened": False, "wouldDo": plan,
                "hint": "this closes Desktop; anything changed since the pending XML was written is lost. "
                        "Repeat with confirm=true."}
    if Path(location).exists():
        bk = BACKUP_DIR / f"{time.strftime('%Y%m%d-%H%M%S')}-file-{Path(location).name}"
        BACKUP_DIR.mkdir(parents=True, exist_ok=True)
        bk.write_bytes(Path(location).read_bytes())
        plan["fileBackup"] = str(bk)
    twb.write_workbook_file(location, xml, base_twbx=location if location.lower().endswith(".twbx") else None)
    subprocess.run(["taskkill", "/PID", str(c.instance.pid), "/F"], capture_output=True, check=False)
    time.sleep(3)
    before = set()
    desktop_setup.launch(workbook=location)
    from .client import list_instances  # noqa: PLC0415

    for _ in range(wait // 2):
        time.sleep(2)
        new = [i for i in list_instances() if i.pid not in before]
        if new:
            dialogs = desktop_setup.error_dialogs(dismiss=False, pids=[new[0].pid])
            return {"reopened": not dialogs, **plan, "instance": new[0].public(), "desktopErrors": dialogs}
    return {"reopened": "unknown", **plan, "api": "not yet available"}


def show_sheet(sheet: str, confirm: bool = False) -> dict:
    """Bring a sheet or dashboard on screen so the API can render it: API 0.1.1 only exports what Desktop
    shows, and has no call to switch sheets. Makes ``sheet`` the start sheet of the live workbook and
    reopens Desktop on it (see reopen) - verified on 2026.3, 2026-11-04."""
    from . import authoring  # noqa: PLC0415

    root = twb.parse(_client("live").get_document())
    authoring.set_start_sheet(root, sheet)
    PENDING_DIR.mkdir(parents=True, exist_ok=True)
    pending = PENDING_DIR / f"{time.strftime('%Y%m%d-%H%M%S')}-show-{''.join(ch if ch.isalnum() else '_' for ch in sheet)}.twb"
    pending.write_text(twb.serialize(root), encoding="utf-8")
    return {"sheet": sheet, **reopen(str(pending), confirm=confirm)}


def restore(backup_path: str, target: str = "live") -> dict:
    xml = Path(backup_path).read_text(encoding="utf-8")
    return save(target, xml)


def inventory(target: str) -> dict:
    root = twb.parse(load(target))
    return {
        **twb.sheet_names(root),
        "datasources": [
            {"name": d.get("name"), "caption": d.get("caption"), "fields": len(twb.fields(d))} for d in twb.datasources(root)
        ],
    }


def list_fields(target: str, datasource: str) -> list[dict]:
    root = twb.parse(load(target))
    return [f.as_dict() for f in twb.fields(twb.find_datasource(root, datasource))]


def lint_target(target: str, thresholds: dict | None = None) -> dict:
    th = Thresholds(**(thresholds or {}))
    return lint(load(target), th).as_dict()


def new_file(path: str) -> dict:
    root = twb.new_workbook()
    p = twb.write_workbook_file(path, twb.serialize(root))
    return {"path": str(p)}


# --------------------------------------------------------------------------------------------
# transactions: batch many edits into one validated apply
# --------------------------------------------------------------------------------------------
TX_DIR = BACKUP_DIR.parent / "tx"


def _tx_key(target: str) -> str:
    if _is_live(target):
        return "live" if target == "live" else target.replace(":", "_")
    return "file_" + "".join(ch if ch.isalnum() else "_" for ch in str(Path(target).resolve()))[-120:]


def _tx_path(target: str) -> Path:
    return TX_DIR / f"{_tx_key(target)}.twb"


def tx_active(target: str) -> bool:
    return _tx_path(target).exists()


def tx_begin(target: str = "live") -> dict:
    """Start a transaction: later edits on this target go to a working copy until commit/rollback."""
    TX_DIR.mkdir(parents=True, exist_ok=True)
    p = _tx_path(target)
    if p.exists():
        return {"transaction": "already active", "workingCopy": str(p)}
    p.write_text(load(target), encoding="utf-8")
    return {"transaction": "begun", "target": target, "workingCopy": str(p)}


def tx_status(target: str = "live") -> dict:
    p = _tx_path(target)
    if not p.exists():
        return {"active": False}
    root = twb.parse(p.read_text(encoding="utf-8"))
    return {"active": True, "workingCopy": str(p), **twb.sheet_names(root),
            "modified": time.strftime("%Y-%m-%d %H:%M:%S", time.localtime(p.stat().st_mtime))}


def tx_commit(target: str = "live", force: bool = False) -> dict:
    """Validate the working copy once and apply/save it; the transaction ends only if that succeeds."""
    p = _tx_path(target)
    if not p.exists():
        raise RuntimeError("No active transaction for this target")
    res = save(target, p.read_text(encoding="utf-8"), force=force)
    if res.get("applied"):
        p.unlink()
    return {"committed": bool(res.get("applied")), **res}


def tx_rollback(target: str = "live") -> dict:
    p = _tx_path(target)
    if p.exists():
        p.unlink()
        return {"rolledBack": True}
    return {"rolledBack": False, "reason": "no active transaction"}


def edit_tx(target: str, fn: Callable[[etree._Element], object], out: str | None = None, dry_run: bool = False,
            force: bool = False) -> dict:
    """``edit`` that writes into the active transaction's working copy when there is one."""
    p = _tx_path(target)
    if not p.exists() or out:
        return edit(target, fn, out=out, dry_run=dry_run, force=force)
    root = twb.parse(p.read_text(encoding="utf-8"))
    result = fn(root)
    if not dry_run:
        p.write_text(twb.serialize(root), encoding="utf-8")
    return {"result": result, "transaction": "pending (commit to apply)", "dryRun": dry_run}


def read_root(target: str) -> etree._Element:
    """The document an edit would see: the transaction working copy if active, else the target."""
    p = _tx_path(target)
    return twb.parse(p.read_text(encoding="utf-8") if p.exists() else load(target))
