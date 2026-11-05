"""Modal windows are reported to the agent with every tool result (no Tableau needed: the probe is faked)."""

from __future__ import annotations

from tableu_mcp import desktop_setup, server


def test_modal_watch_reports_what_desktop_showed(monkeypatch):
    shown = [{"pid": 1, "title": "File Recovery", "texts": ["We recovered copies"], "buttons": ["Delete", "Open"],
              "closed": False, "action": "needs the user: tell them what it asks and wait"}]
    monkeypatch.setattr(desktop_setup, "modals", lambda close_safe=False: shown)
    with server.ModalWatch(every=0.01) as w:
        pass
    out = w.attach({"ok": True})
    assert out["ok"] is True
    assert out["desktopModals"][0]["title"] == "File Recovery"
    assert "tell the user" in out["modalNote"]


def test_no_modal_leaves_the_result_untouched(monkeypatch):
    monkeypatch.setattr(desktop_setup, "modals", lambda close_safe=False: [])
    with server.ModalWatch(every=0.01) as w:
        pass
    assert w.attach({"ok": True}) == {"ok": True}
    assert w.attach([1, 2]) == [1, 2]
