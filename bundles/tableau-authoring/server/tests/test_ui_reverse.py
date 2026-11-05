"""The dynamic reverse-engineering harness: XML diff, skip rules and report — no Tableau needed."""

from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "scripts"))

import ui_reverse  # noqa: E402

BEFORE = ("<workbook><worksheets><worksheet name='B'><table><panes><pane><mark class='Bar'/></pane></panes>"
          "</table><simple-id uuid='{1}'/></worksheet></worksheets></workbook>")
AFTER = ("<workbook><worksheets><worksheet name='B'><table><panes><pane><mark class='Bar'/><style>"
         "<style-rule element='mark'><format attr='mark-labels-show' value='true'/></style-rule></style></pane>"
         "</panes></table><simple-id uuid='{2}'/></worksheet></worksheets></workbook>")


def test_diff_reports_what_a_command_wrote():
    d = ui_reverse.diff(BEFORE, AFTER)
    assert d["changed"] is True
    assert "style-rule/format@attr=mark-labels-show" in d["added"]
    assert "format@value=true" not in str(d["removed"])
    assert any("mark-labels-show" in ln for ln in d["diff"])


def test_volatile_ids_are_not_a_change():
    assert ui_reverse.diff(BEFORE, BEFORE.replace("{1}", "{9}")) == {"changed": False}


def test_commands_that_leave_the_workbook_are_skipped():
    skip = lambda p: any(ui_reverse.SKIP.match(s) for s in p.split(" > "))  # noqa: E731
    for path in ("Worksheet > Copy > Data", "Worksheet > Export > Image...", "Data > Ventas > Export Data to CSV > Ventas...",
                 "Data > Ventas > Add to Saved Data Sources...", "Data > Ventas > Edit Data Source...", "Server > Publish Workbook..."):
        assert skip(path), path
    for path in ("Analysis > Show Mark Labels", "Worksheet > Show Caption", "Analysis > Totals > Show Row Grand Totals"):
        assert not skip(path), path


def test_report_lists_command_effects(tmp_path, monkeypatch):
    monkeypatch.setattr(ui_reverse, "OUT", tmp_path / "ui-commands.json")
    data = {"checked": "test", "sheets": {"B": {"kind": "worksheets", "menu": [
        {"path": "Analysis > Totals > Show Row Grand Totals", "enabled": False, "checked": None, "submenu": False}],
        "commands": {"Analysis > Show Mark Labels": {
            "commands": ['tabdoc:toggle-mark-labels'], "dialogs": [], **ui_reverse.diff(BEFORE, AFTER)}}}}}
    md = ui_reverse.report(data).read_text(encoding="utf-8")
    assert "tabdoc:toggle-mark-labels" in md and "mark-labels-show" in md
    assert "Show Row Grand Totals" in md  # disabled items are listed


def test_diffs_carry_no_local_paths():
    a = BEFORE.replace("<table>", "<connection class='textscan' directory='C:/x' filename='a.csv'/><table>")
    b = AFTER.replace("<table>", "<connection class='textscan' directory='C:/y' filename='a.csv'/><table>")
    d = ui_reverse.diff(a, b)
    assert "C:/" not in "\n".join(d["diff"]) and 'directory="<local>"' in "\n".join(d["diff"])


def test_context_items_that_open_an_editor_in_place_are_skipped():
    skip = lambda p: any(ui_reverse.SKIP.match(s) or ui_reverse.CTX_SKIP.match(s) for s in p.split(" > "))  # noqa: E731
    for path in ("Rename", "Edit in Shelf", "View Data...", "Describe...", "Copy > Data", "Find in Data pane"):
        assert skip(path), path
    for path in ("Show Header", "Keep Only", "Hide Title", "Sort...", "Mark Label > Always Show"):
        assert not skip(path), path
    assert ui_reverse.CTX_ONCE.match("field:Region") and not ui_reverse.CTX_ONCE.match("shelf:rows")


def test_report_lists_context_menus(tmp_path, monkeypatch):
    monkeypatch.setattr(ui_reverse, "OUT", tmp_path / "ui-commands.json")
    data = {"checked": "test", "sheets": {}, "context": {"B": {
        "axis:left": {"menu": [{"path": "Split", "enabled": False, "checked": None, "submenu": False}],
                      "commands": {"Show Header": {"commands": ['tabdoc:toggle-header'], "dialogs": [],
                                                   **ui_reverse.diff(BEFORE, AFTER)}}},
        "shelf:filters": {"error": "no context menu"}}}}
    md = ui_reverse.report(data).read_text(encoding="utf-8")
    assert "Menús contextuales" in md and "cabecera / eje" in md and "tabdoc:toggle-header" in md
    assert "Desactivados: Split" in md and "No se abrió" in md


def test_prune_drops_results_of_another_menu_and_skipped_errors():
    import ui_reverse as u

    results = {"Sort Ascending": {"changed": True}, "Keep Only": {"error": "no item 'Keep Only'"},
               "Change Data Type > Date": {"error": "timeout"}, "Format...": {"slow": True, "error": "x"}}
    menu = [{"path": p} for p in ("Sort Ascending", "Change Data Type > Date", "Format...")]
    assert sorted(u.prune(results, menu)) == ["Format...", "Sort Ascending"]
