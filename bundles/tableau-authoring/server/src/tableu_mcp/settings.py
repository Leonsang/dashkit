"""Tableau Desktop configuration outside workbooks.

* Registry preferences: ``HKCU\\Software\\Tableau\\Tableau <version>\\<group>`` (Settings, Debug, Recent Files,
  Directories, ...). Desktop reads them at startup and rewrites some on exit, so change them with Desktop closed
  (``set_value`` refuses while it runs unless ``force``).
* Custom color palettes: ``My Tableau Repository\\Preferences.tps`` (categorical "regular", "ordered-sequential",
  "ordered-diverging"), available in every workbook after Desktop restarts.
* Repository location.
"""

from __future__ import annotations

import os
from pathlib import Path

from lxml import etree

from . import desktop_setup

PALETTE_TYPES = ("regular", "ordered-sequential", "ordered-diverging")


def _root_key(version: str | None) -> str:
    return rf"{desktop_setup.BASE_KEY}\Tableau {desktop_setup._resolve_version(version)}"


def list_groups(version: str | None = None) -> list[str]:
    winreg = desktop_setup._winreg()
    out = []
    with winreg.OpenKey(winreg.HKEY_CURRENT_USER, _root_key(version)) as k:
        i = 0
        while True:
            try:
                out.append(winreg.EnumKey(k, i))
            except OSError:
                break
            i += 1
    return out


def list_values(group: str = "Settings", version: str | None = None) -> dict:
    winreg = desktop_setup._winreg()
    out = {}
    try:
        with winreg.OpenKey(winreg.HKEY_CURRENT_USER, rf"{_root_key(version)}\{group}") as k:
            i = 0
            while True:
                try:
                    name, value, _ = winreg.EnumValue(k, i)
                except OSError:
                    break
                out[name] = value if not isinstance(value, bytes) else value.hex()
                i += 1
    except FileNotFoundError:
        raise KeyError(f"No settings group {group!r}. Groups: {list_groups(version)}") from None
    return out


def get_value(name: str, group: str = "Settings", version: str | None = None):
    vals = list_values(group, version)
    if name not in vals:
        raise KeyError(f"{group}\\{name} not set")
    return vals[name]


def set_value(name: str, value, group: str = "Settings", version: str | None = None, force: bool = False) -> dict:
    """Write a preference (string or int). Refuses while Desktop runs (it would overwrite it) unless force."""
    if desktop_setup.tableau_running() and not force:
        raise RuntimeError("Tableau Desktop is running and rewrites its settings on exit; close it first or pass force=True")
    winreg = desktop_setup._winreg()
    with winreg.CreateKeyEx(winreg.HKEY_CURRENT_USER, rf"{_root_key(version)}\{group}", 0, winreg.KEY_SET_VALUE) as k:
        if isinstance(value, bool):
            value = int(value)
        if isinstance(value, int):
            winreg.SetValueEx(k, name, 0, winreg.REG_DWORD, value)
        else:
            winreg.SetValueEx(k, name, 0, winreg.REG_SZ, str(value))
    return {"group": group, "name": name, "value": value, "restartNeeded": True}


def delete_value(name: str, group: str = "Settings", version: str | None = None, force: bool = False) -> dict:
    if desktop_setup.tableau_running() and not force:
        raise RuntimeError("Close Tableau Desktop first or pass force=True")
    winreg = desktop_setup._winreg()
    with winreg.OpenKey(winreg.HKEY_CURRENT_USER, rf"{_root_key(version)}\{group}", 0, winreg.KEY_SET_VALUE) as k:
        winreg.DeleteValue(k, name)
    return {"deleted": f"{group}\\{name}"}


# ------------------------------------------------------------------ repository & palettes
def repository_path() -> Path:
    """My Tableau Repository (Settings\\RepositoryLocation overrides the Documents default)."""
    try:
        loc = list_values("Settings").get("RepositoryLocation")
    except Exception:  # noqa: BLE001
        loc = None
    if loc:
        return Path(loc)
    return Path(os.environ.get("USERPROFILE", str(Path.home()))) / "Documents" / "My Tableau Repository"


def _prefs_file() -> Path:
    return repository_path() / "Preferences.tps"


def _load_prefs() -> etree._Element:
    f = _prefs_file()
    if f.exists() and f.read_text(encoding="utf-8", errors="replace").strip():
        return etree.fromstring(f.read_bytes(), etree.XMLParser(remove_blank_text=True, resolve_entities=False))
    root = etree.Element("workbook")
    etree.SubElement(root, "preferences")
    return root


def _save_prefs(root: etree._Element) -> Path:
    f = _prefs_file()
    f.parent.mkdir(parents=True, exist_ok=True)
    if f.exists():
        (f.parent / "Preferences.tps.bak").write_bytes(f.read_bytes())
    f.write_bytes(b"<?xml version='1.0'?>\n" + etree.tostring(root, pretty_print=True))
    return f


def list_palettes() -> list[dict]:
    root = _load_prefs()
    return [{"name": p.get("name"), "type": p.get("type"), "colors": [c.text for c in p.findall("color")]}
            for p in root.iter("color-palette")]


def create_palette(name: str, colors: list[str], type: str = "regular") -> dict:  # noqa: A002
    """Custom color palette for every workbook (Desktop restart needed). type: regular (categorical) |
    ordered-sequential | ordered-diverging."""
    if type not in PALETTE_TYPES:
        raise ValueError(f"type must be one of {PALETTE_TYPES}")
    root = _load_prefs()
    prefs = root.find("preferences")
    if prefs is None:
        prefs = etree.SubElement(root, "preferences")
    for p in prefs.findall("color-palette"):
        if p.get("name") == name:
            prefs.remove(p)
    pal = etree.SubElement(prefs, "color-palette", name=name, type=type)
    for c in colors:
        etree.SubElement(pal, "color").text = c
    return {"palette": name, "file": str(_save_prefs(root)), "restartNeeded": True}


def delete_palette(name: str) -> dict:
    root = _load_prefs()
    for p in root.iter("color-palette"):
        if p.get("name") == name:
            p.getparent().remove(p)
            return {"deleted": name, "file": str(_save_prefs(root))}
    raise KeyError(f"Palette {name!r} not found")
