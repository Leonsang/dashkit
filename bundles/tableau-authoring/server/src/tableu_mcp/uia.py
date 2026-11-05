"""Tableau Desktop's own interface, through Windows UI Automation: its menus and commands.

Desktop's External Client API writes a workbook only as a whole document. The commands of its interface (menus,
toolbar) are not in that API, but Desktop exposes them to UI Automation. This module lists them and runs one,
so a command can be reverse-engineered: run it on a probe workbook and diff the document before and after
(scripts/ui_reverse.py). Running a command changes the open workbook: use it on test workbooks only.
"""

from __future__ import annotations

import json
import re
import subprocess
import sys

from . import desktop_setup

_COMMON = r"""
Add-Type -AssemblyName UIAutomationClient, UIAutomationTypes
$A=[System.Windows.Automation.AutomationElement]; $T=[System.Windows.Automation.TreeScope]
$PC=[System.Windows.Automation.PropertyCondition]; $CT=[System.Windows.Automation.ControlType]
$EC=[System.Windows.Automation.ExpandCollapsePattern]; $IP=[System.Windows.Automation.InvokePattern]
$procId = __PID__
$main = $A::RootElement.FindFirst($T::Children, (New-Object $PC($A::ProcessIdProperty, $procId)))
foreach ($w in $A::RootElement.FindAll($T::Children, (New-Object $PC($A::ProcessIdProperty, $procId)))) {
  if ($w.Current.AutomationId -like '*TMainWindow') { $main = $w }
}
$bar = $main.FindFirst($T::Children, (New-Object $PC($A::ControlTypeProperty, $CT::MenuBar)))  # a direct child: fast
# Qt puts an open menu (and its submenus) under the menu bar in the tree, not under the desktop root.
function Popups { @($bar.FindAll($T::Descendants, (New-Object $PC($A::ControlTypeProperty, $CT::Menu)))) }
function Key($e) { ($e.GetRuntimeId() -join '.') }
function NewPopup($before) {
  for ($i = 0; $i -lt 20; $i++) {
    Start-Sleep -Milliseconds 100
    $p = @(Popups | Where-Object { $before -notcontains (Key $_) })
    if ($p.Count) { return $p[-1] }
  }
  return $null
}
function Items($popup) {
  @($popup.FindAll($T::Children, (New-Object $PC($A::ControlTypeProperty, $CT::MenuItem))) | Where-Object { $_.Current.Name })
}
function Info($it) {
  $toggle = $null; $sub = $false
  try { $toggle = [string]$it.GetCurrentPattern([System.Windows.Automation.TogglePattern]::Pattern).Current.ToggleState } catch { }
  try { $sub = $it.GetCurrentPattern($EC::Pattern).Current.ExpandCollapseState -ne 'LeafNode' } catch { }
  [ordered]@{ name = $it.Current.Name; enabled = $it.Current.IsEnabled; checked = $toggle; submenu = $sub }
}
function Open($name) {
  $m = $bar.FindFirst($T::Children, (New-Object $PC($A::NameProperty, $name)))
  if (-not $m) { throw "no menu '$name'" }
  $before = @(Popups | ForEach-Object { Key $_ })
  $m.GetCurrentPattern($EC::Pattern).Expand()
  $p = NewPopup $before
  if (-not $p) { throw "menu '$name' did not open" }
  return $p
}
function Expand($popup, $name) {
  $it = Items $popup | Where-Object { $_.Current.Name -eq $name } | Select-Object -First 1
  if (-not $it) { throw "no item '$name'" }
  $before = @(Popups | ForEach-Object { Key $_ })
  $it.GetCurrentPattern($EC::Pattern).Expand()
  return (NewPopup $before)
}
# Close menus through UI Automation (Collapse), never with keystrokes: keys go to whatever window has the focus.
function Collapse($e) { try { $e.GetCurrentPattern($EC::Pattern).Collapse() } catch { } }
function CloseAll {
  foreach ($m in @($bar.FindAll($T::Children, (New-Object $PC($A::ControlTypeProperty, $CT::MenuItem))))) {
    try { if ($m.GetCurrentPattern($EC::Pattern).Current.ExpandCollapseState -ne 'Collapsed') { Collapse $m } } catch { }
  }
}
"""

_LIST = _COMMON + r"""
$depth = __DEPTH__
$out = @()
function Walk($popup, $path, $level) {
  foreach ($it in Items $popup) {
    $i = Info $it; $i.path = ($path + @($i.name)) -join ' > '
    $script:out += [pscustomobject]$i
    # Map's submenus (background maps, layers) load from the map service and can hang: one level only there.
    if ($i.submenu -and $i.enabled -and $level -lt $depth -and $path[0] -ne 'Map') {
      $sub = Expand $popup $i.name
      if ($sub) {
        Walk $sub ($path + @($i.name)) ($level + 1)
        $again = Items $popup | Where-Object { $_.Current.Name -eq $i.name } | Select-Object -First 1
        if ($again) { Collapse $again }; Start-Sleep -Milliseconds 150
      }
    }
  }
}
try {
  foreach ($name in @(__MENUS__)) {
    if (-not $name) { continue }
    # the menu bar changes with the sheet on screen (no Map menu on some sheets): skip what is not there
    if (-not $bar.FindFirst($T::Children, (New-Object $PC($A::NameProperty, $name)))) { continue }
    $p = Open $name
    Walk $p @($name) 1
    CloseAll; Start-Sleep -Milliseconds 200
  }
} catch { CloseAll; $out += [pscustomobject]@{ error = "$_" } }
ConvertTo-Json -InputObject @($out) -Compress -Depth 3
"""

_INVOKE = _COMMON + r"""
$parts = @(__PATH__)
$res = [ordered]@{ path = ($parts -join ' > '); invoked = $false }
try {
  $p = Open $parts[0]
  for ($k = 1; $k -lt $parts.Count - 1; $k++) { $p = Expand $p $parts[$k]; if (-not $p) { throw "submenu '$($parts[$k])' did not open" } }
  $it = Items $p | Where-Object { $_.Current.Name -eq $parts[-1] } | Select-Object -First 1
  if (-not $it) { throw "no item '$($parts[-1])'" }
  if (-not $it.Current.IsEnabled) { throw "item '$($parts[-1])' is disabled" }
  $it.GetCurrentPattern($IP::Pattern).Invoke()
  $res.invoked = $true
  # Invoke leaves the menu expanded (measured): collapsed, or it swallows the next click on the canvas
  Start-Sleep -Milliseconds 300; CloseAll
} catch { CloseAll; $res.error = "$_" }
ConvertTo-Json -InputObject $res -Compress
"""

_CLOSE = r"""
Add-Type -AssemblyName UIAutomationClient, UIAutomationTypes
$A=[System.Windows.Automation.AutomationElement]; $T=[System.Windows.Automation.TreeScope]
$PC=[System.Windows.Automation.PropertyCondition]; $CT=[System.Windows.Automation.ControlType]
$IP=[System.Windows.Automation.InvokePattern]
$closed = @()
# Qt dialogs hang under the main window in the tree, so look below every top-level window too.
for ($round = 0; $round -lt 3; $round++) {
  $cands = @()
  foreach ($top in $A::RootElement.FindAll($T::Children, (New-Object $PC($A::ProcessIdProperty, __PID__)))) {
    if ($top.Current.AutomationId -notlike '*TMainWindow' -and $top.Current.ClassName -ne 'SysShadow' -and $top.Current.Name) { $cands += $top }
    $cands += @($top.FindAll($T::Descendants, (New-Object $PC($A::ControlTypeProperty, $CT::Window))) | Where-Object {
      $_.Current.Name -and $_.Current.AutomationId -notmatch 'WebEngineView' -and $_.Current.AutomationId -notlike '*TMainWindow' })
  }
  if (-not $cands.Count) { break }
  foreach ($d in $cands) {
    $name = $d.Current.Name; $done = $false
    # The title-bar X / Cancel only dismiss; never a decision button (OK, Delete, Open, Save...).
    $x = $d.FindFirst($T::Descendants, (New-Object $PC($A::AutomationIdProperty, ($d.Current.AutomationId + '.mainFrame.titleBar.closeButton'))))
    if ($x) { try { $x.GetCurrentPattern($IP::Pattern).Invoke(); $done = $true } catch { } }
    if (-not $done) { try { $d.GetCurrentPattern([System.Windows.Automation.WindowPattern]::Pattern).Close(); $done = $true } catch { } }
    if (-not $done) {
      $c = $d.FindFirst($T::Descendants, (New-Object $PC($A::NameProperty, 'Cancel')))
      if ($c) { try { $c.GetCurrentPattern($IP::Pattern).Invoke(); $done = $true } catch { } }
    }
    if ($done) { $closed += $name }
  }
  Start-Sleep -Milliseconds 600
}
ConvertTo-Json -InputObject @($closed) -Compress
"""


def _ps_list(values: list[str]) -> str:
    return ",".join("'" + v.replace("'", "''") + "'" for v in values)


# The Desktop process the commands go to; None = the first one running. Set it when several are open.
PID: int | None = None


def _run(script: str, timeout: int = 180):
    if sys.platform != "win32":
        raise RuntimeError("UI Automation needs Windows")
    pids = [PID] if PID else desktop_setup.tableau_running()
    if not pids:
        raise RuntimeError("Tableau Desktop is not running")
    res = subprocess.run(["powershell", "-NoProfile", "-NonInteractive", "-Command", script.replace("__PID__", str(pids[0]))],
                         capture_output=True, text=True, encoding="utf-8", check=False, timeout=timeout)
    try:
        return json.loads(res.stdout.strip().splitlines()[-1])
    except (ValueError, IndexError):
        raise RuntimeError((res.stderr or res.stdout).strip()[:800]) from None


MENUS = ("File", "Data", "Worksheet", "Dashboard", "Story", "Analysis", "Map", "Format", "Server", "Window", "Help")


def menu_items(menus: list[str] | tuple[str, ...] = MENUS, depth: int = 2) -> list[dict]:
    """Every item of Desktop's menus for the sheet now on screen: path ('Analysis > Totals > Show Row Grand
    Totals'), enabled, checked (On/Off for toggles), submenu. Submenus are opened down to `depth` levels."""
    return _run(_LIST.replace("__MENUS__", _ps_list(list(menus))).replace("__DEPTH__", str(depth)))


def invoke(path: str) -> dict:
    """Run one menu command, e.g. 'Worksheet > Show Title'. It changes the open workbook."""
    parts = [p.strip() for p in path.split(">")]
    return _run(_INVOKE.replace("__PATH__", _ps_list(parts)), timeout=90)


def close_windows() -> list[str]:
    """Close every window of Desktop other than its main window (dialogs, panes opened by a command) with the
    title-bar X, which cancels them. Use only after a command the harness ran itself."""
    return _run(_CLOSE, timeout=60)


# Dialogs whose controls the harness may change (and whose OK it may press) on its test workbook: editors that
# only change the open workbook. Never one that deletes, replaces, opens, saves, exports, publishes or connects.
ACCEPT_OK = (r"^(Edit Axis|Add Reference Line|Edit Reference Line|Edit Annotation|Edit Title|Edit Caption"
             r"|Edit Alias|Edit Aliases|Edit Drop Lines|Trend Lines Options|Edit Colors|Edit Shape|Edit Size"
             r"|Edit Tooltip|Edit Label|Sort|Create Group|Edit Group|Create Set|Edit Set|Create Bins|Edit Bins"
             r"|Create Parameter|Edit Parameter|Custom Date|Create Custom Date|Filter|Edit Filter|Forecast Options"
             r"|Default Number Format|Default Date Format|Date Properties|Table Options|Accessibility|Edit Comment"
             r"|Custom Split|Create Hierarchy|Apply Filter to Worksheets)")
_DENY_OK = r"(Delete|Remove|Replace|Open|Save|Export|Publish|Connect|Refresh|Extract|Close)"

# Controls inside a dialog. Desktop's dialogs are mostly web pages (QtWebEngine): UI Automation lists their
# controls, but Toggle/Select/Invoke do nothing there. A click posted to the window under the control, with
# the cursor held on it, works (same as the context menus).
_DLG_COMMON = r"""
Add-Type -AssemblyName UIAutomationClient, UIAutomationTypes
Add-Type @"
using System; using System.Runtime.InteropServices;
public static class DlgClick {
  [StructLayout(LayoutKind.Sequential)] public struct POINT { public int X; public int Y; }
  [DllImport("user32.dll")] public static extern bool ScreenToClient(IntPtr h, ref POINT p);
  [DllImport("user32.dll")] public static extern IntPtr PostMessage(IntPtr h, uint m, IntPtr w, IntPtr l);
  [DllImport("user32.dll")] public static extern bool GetCursorPos(out POINT p);
  [DllImport("user32.dll")] public static extern bool SetCursorPos(int x, int y);
  [DllImport("user32.dll")] public static extern IntPtr WindowFromPoint(POINT p);
}
"@
$A=[System.Windows.Automation.AutomationElement]; $T=[System.Windows.Automation.TreeScope]
$PC=[System.Windows.Automation.PropertyCondition]; $CT=[System.Windows.Automation.ControlType]
$prefix = '__TITLE__'
function FindDialog {
  foreach ($top in $A::RootElement.FindAll($T::Children, (New-Object $PC($A::ProcessIdProperty, __PID__)))) {
    foreach ($x in $top.FindAll($T::Subtree, (New-Object $PC($A::ControlTypeProperty, $CT::Window)))) {
      if ($x.Current.Name -and $x.Current.Name.StartsWith($prefix) -and $x.Current.AutomationId -notlike '*TMainWindow') { return $x }
    }
  }
  return $null
}
function Controls($w) {
  $out = @(); $seen = @{}
  foreach ($e in $w.FindAll($T::Descendants, [System.Windows.Automation.Condition]::TrueCondition)) {
    $t = $e.Current.ControlType.ProgrammaticName -replace 'ControlType\.', ''
    if ($t -notin 'CheckBox', 'RadioButton', 'Edit', 'ComboBox', 'Button', 'TabItem') { continue }
    $name = ($e.Current.Name -replace "[​]", '').Trim()
    if ($t -eq 'Button' -and $name -ne 'OK') { continue }
    $k = "$t|$name"; $seen[$k] = 1 + [int]$seen[$k]
    $state = $null
    try { $state = "$($e.GetCurrentPattern([System.Windows.Automation.TogglePattern]::Pattern).Current.ToggleState)" } catch { }
    if ($t -in 'RadioButton', 'TabItem') { try { $state = "$($e.GetCurrentPattern([System.Windows.Automation.SelectionItemPattern]::Pattern).Current.IsSelected)" } catch { } }
    $val = $null; try { $val = $e.GetCurrentPattern([System.Windows.Automation.ValuePattern]::Pattern).Current.Value } catch { }
    $r = $e.Current.BoundingRectangle
    $out += [ordered]@{ type = $t; name = $name; index = $seen[$k] - 1; enabled = $e.Current.IsEnabled; state = $state
                        value = $val; visible = (-not $e.Current.IsOffscreen) -and $r.Width -gt 0; el = $e }
  }
  return $out
}
function ClickAt($sx, $sy) {
  $old = New-Object DlgClick+POINT; [DlgClick]::GetCursorPos([ref]$old) | Out-Null
  $p = New-Object DlgClick+POINT; $p.X = $sx; $p.Y = $sy
  try {
    [DlgClick]::SetCursorPos($sx, $sy) | Out-Null; Start-Sleep -Milliseconds 80
    $h = [DlgClick]::WindowFromPoint($p)
    $c = New-Object DlgClick+POINT; $c.X = $sx; $c.Y = $sy; [DlgClick]::ScreenToClient($h, [ref]$c) | Out-Null
    $lp = [IntPtr](($c.Y -shl 16) -bor ($c.X -band 0xFFFF))
    [DlgClick]::PostMessage($h, 0x0200, [IntPtr]0, $lp) | Out-Null; Start-Sleep -Milliseconds 80
    [DlgClick]::PostMessage($h, 0x0201, [IntPtr]1, $lp) | Out-Null; Start-Sleep -Milliseconds 80
    [DlgClick]::SetCursorPos($sx, $sy) | Out-Null
    [DlgClick]::PostMessage($h, 0x0202, [IntPtr]0, $lp) | Out-Null; Start-Sleep -Milliseconds 600
    return $h
  } finally { [DlgClick]::SetCursorPos($old.X, $old.Y) | Out-Null }
}
function ClickEl($e, $left) {
  $r = $e.Current.BoundingRectangle
  $x = if ($left) { [int]($r.X + [Math]::Min(10, $r.Width / 2)) } else { [int]($r.X + $r.Width / 2) }
  return ClickAt $x ([int]($r.Y + $r.Height / 2))
}
"""

_DLG_LIST = _DLG_COMMON + r"""
$w = FindDialog
if (-not $w) { ConvertTo-Json -InputObject @{ error = "no dialog '$prefix'" } -Compress; exit }
$res = @(Controls $w | ForEach-Object { $_.Remove('el'); $_ })
ConvertTo-Json -InputObject @{ title = $w.Current.Name; controls = $res } -Compress -Depth 4
"""

_DLG_ACT = _DLG_COMMON + r"""
$type = '__TYPE__'; $name = '__NAME__'; $index = __INDEX__; $value = '__VALUE__'
$res = [ordered]@{ acted = $false }
$w = FindDialog
if (-not $w) { $res.error = "no dialog '$prefix'"; ConvertTo-Json -InputObject $res -Compress; exit }
$c = @(Controls $w | Where-Object { $_.type -eq $type -and $_.name -eq $name -and $_.index -eq $index }) | Select-Object -First 1
if (-not $c) { $res.error = "no control $type '$name' #$index"; ConvertTo-Json -InputObject $res -Compress; exit }
if (-not $c.enabled) { $res.error = 'disabled'; ConvertTo-Json -InputObject $res -Compress; exit }
$e = $c.el
function Key($h, $vk) {
  [DlgClick]::PostMessage($h, 0x0100, [IntPtr]$vk, [IntPtr]0) | Out-Null; Start-Sleep -Milliseconds 25
  [DlgClick]::PostMessage($h, 0x0101, [IntPtr]$vk, [IntPtr]0) | Out-Null; Start-Sleep -Milliseconds 25
}
if ($type -eq 'Edit') {
  # A web field ignores ValuePattern.SetValue: type like a user (End, Backspace over the old text, the
  # characters, Tab to commit).
  $h = ClickEl $e $false
  Key $h 0x23
  for ($k = 0; $k -lt ([string]$c.value).Length + 2; $k++) { Key $h 0x08 }
  foreach ($ch in $value.ToCharArray()) {
    [DlgClick]::PostMessage($h, 0x0102, [IntPtr][int]$ch, [IntPtr]0) | Out-Null; Start-Sleep -Milliseconds 25
  }
  Start-Sleep -Milliseconds 200
  Key $h 0x09; Start-Sleep -Milliseconds 500
} else { ClickEl $e ($type -in 'CheckBox', 'RadioButton') | Out-Null }
$after = @(Controls $w | Where-Object { $_.type -eq $type -and $_.name -eq $name -and $_.index -eq $index }) | Select-Object -First 1
$res.acted = $true
$res.before = if ($type -eq 'Edit') { $c.value } else { $c.state }
$res.after = if ($after) { if ($type -eq 'Edit') { $after.value } else { $after.state } } else { $null }
if ('__OK__' -eq '1') {
  $ok = @(Controls $w | Where-Object { $_.type -eq 'Button' -and $_.name -eq 'OK' -and $_.enabled }) | Select-Object -First 1
  if ($ok) { ClickEl $ok.el $false | Out-Null; Start-Sleep -Milliseconds 800; $res.pressed = 'OK' }
}
ConvertTo-Json -InputObject $res -Compress
"""


def _dlg(script: str, title: str) -> str:
    return script.replace("__TITLE__", title.replace("'", "''"))


def dialog_controls(title: str) -> dict:
    """The controls of the open dialog whose title starts with `title`: check boxes, radio buttons, text
    fields, lists and its OK button, with their state."""
    return _run(_dlg(_DLG_LIST, title), timeout=90)


def dialog_act(title: str, control: dict, value: str = "1000", press_ok: bool = True) -> dict:
    """Change one control of the open dialog `title` the way a user would: click a check box or radio
    button, or type `value` into a text field and Tab out. With press_ok, press the dialog's OK afterwards
    if it has one (web dialogs apply at once and have none). Only on the harness's test workbook."""
    if not re.match(ACCEPT_OK, title) or re.search(_DENY_OK, title):
        raise ValueError(f"not an editor dialog the harness may change: {title!r}")
    script = (_dlg(_DLG_ACT, title).replace("__TYPE__", control["type"])
              .replace("__NAME__", control["name"].replace("'", "''")).replace("__INDEX__", str(control["index"]))
              .replace("__VALUE__", value.replace("'", "''")).replace("__OK__", "1" if press_ok else "0"))
    return _run(script, timeout=90)


_GOTO = _COMMON + r"""
Add-Type @"
using System; using System.Runtime.InteropServices;
public static class TabClick {
  [StructLayout(LayoutKind.Sequential)] public struct POINT { public int X; public int Y; }
  [DllImport("user32.dll")] public static extern bool ScreenToClient(IntPtr h, ref POINT p);
  [DllImport("user32.dll")] public static extern IntPtr PostMessage(IntPtr h, uint m, IntPtr w, IntPtr l);
}
"@
$index = __INDEX__
$res = [ordered]@{ sheet = '__SHEET__'; invoked = $false }
$list = $main.FindFirst($T::Descendants, (New-Object $PC($A::AutomationIdProperty, 'QApplication.TMainWindow.CentralWidget.QWidget.SheetTabsWidget.SheetListWidget')))
$tabs = @(); if ($list) { $tabs = @($list.FindAll($T::Children, (New-Object $PC($A::ControlTypeProperty, $CT::ListItem)))) }
if ($index -ge 0 -and $index -lt $tabs.Count) {
  # The tabs ignore Invoke/Select; a click posted to the window selects one without moving the mouse.
  $r = $tabs[$index].Current.BoundingRectangle
  $pt = New-Object TabClick+POINT; $pt.X = [int]($r.X + $r.Width / 2); $pt.Y = [int]($r.Y + $r.Height / 2)
  $h = [IntPtr]$main.Current.NativeWindowHandle
  [TabClick]::ScreenToClient($h, [ref]$pt) | Out-Null
  $lp = [IntPtr](($pt.Y -shl 16) -bor ($pt.X -band 0xFFFF))
  [TabClick]::PostMessage($h, 0x0201, [IntPtr]1, $lp) | Out-Null
  Start-Sleep -Milliseconds 80
  [TabClick]::PostMessage($h, 0x0202, [IntPtr]0, $lp) | Out-Null
  Start-Sleep -Milliseconds 700
  $res.invoked = $true; $res.byIndex = $index
} else { $res.error = "no tab $index (tabs: $($tabs.Count))" }
ConvertTo-Json -InputObject $res -Compress
"""


def goto_sheet(name: str, index: int = -1) -> dict:
    """Open a sheet by its tab at the bottom of the window (works from the Data Source page too). The tabs
    expose no name to UI Automation, so `index` (its position among the document's <windows>) selects it."""
    return _run(_GOTO.replace("__SHEET__", name.replace("'", "''")).replace("__INDEX__", str(index)), timeout=60)


# --- Context menus (right-click) ----------------------------------------------------------------------------
# A right-click posted to the main window opens Desktop's context menu without moving the mouse. The menu is a
# top-level window of class TableauMenu; a submenu is a Menu below the item that opened it (Expand). The objects
# that carry a context menu are found by UI Automation: the fields of the Data pane (named TreeItems), the shelves
# (their pills are drawn, not exposed: the first pill sits at the shelf's left edge), the Marks card, the axes and
# headers around the view, the view itself, the title and the sheet tabs.

_CTX_COMMON = _COMMON + r"""
Add-Type @"
using System; using System.Runtime.InteropServices;
public static class CtxClick {
  [StructLayout(LayoutKind.Sequential)] public struct POINT { public int X; public int Y; }
  [DllImport("user32.dll")] public static extern bool ScreenToClient(IntPtr h, ref POINT p);
  [DllImport("user32.dll")] public static extern bool GetCursorPos(out POINT p);
  [DllImport("user32.dll")] public static extern bool SetCursorPos(int x, int y);

  [DllImport("user32.dll")] public static extern IntPtr PostMessage(IntPtr h, uint m, IntPtr w, IntPtr l);
}
"@
function CtxMenus { @($A::RootElement.FindAll($T::Children, (New-Object $PC($A::ProcessIdProperty, $procId))) | Where-Object { $_.Current.ClassName -eq 'TableauMenu' }) }
function CtxClose { foreach ($m in CtxMenus) { try { $m.GetCurrentPattern([System.Windows.Automation.WindowPattern]::Pattern).Close() } catch { } } }
function CtxOpen([int]$sx, [int]$sy) {
  CtxClose
  $h = [IntPtr]$main.Current.NativeWindowHandle
  $pt = New-Object CtxClick+POINT; $pt.X = $sx; $pt.Y = $sy
  [CtxClick]::ScreenToClient($h, [ref]$pt) | Out-Null
  $lp = [IntPtr](($pt.Y -shl 16) -bor ($pt.X -band 0xFFFF))
  # The shelves, axes, headers and the view hit-test their menu with the real cursor (QCursor::pos), not with
  # the click's position: the cursor is put on the point while the click is posted, then put back (~0.3 s).
  # The click itself is posted to Desktop's window only: nothing reaches another application.
  $save = New-Object CtxClick+POINT; [CtxClick]::GetCursorPos([ref]$save) | Out-Null
  [CtxClick]::SetCursorPos($sx, $sy) | Out-Null
  $m = @()
  try {
    [CtxClick]::PostMessage($h, 0x0200, [IntPtr]0, $lp) | Out-Null; Start-Sleep -Milliseconds 60
    [CtxClick]::PostMessage($h, 0x0204, [IntPtr]2, $lp) | Out-Null; Start-Sleep -Milliseconds 60
    [CtxClick]::PostMessage($h, 0x0205, [IntPtr]0, $lp) | Out-Null
    for ($i = 0; $i -lt 24 -and -not $m.Count; $i++) {
      Start-Sleep -Milliseconds 50; $m = CtxMenus
      # the Data pane opens its menu on the button; the canvas waits for WM_CONTEXTMENU
      if ($i -eq 5 -and -not $m.Count) { [CtxClick]::PostMessage($h, 0x007B, $h, [IntPtr](($sy -shl 16) -bor ($sx -band 0xFFFF))) | Out-Null }
    }
  } finally { [CtxClick]::SetCursorPos($save.X, $save.Y) | Out-Null }
  if ($m.Count) { Start-Sleep -Milliseconds 300; return (CtxMenus)[0] }
  return $null
}
function CtxOpenRetry([int]$sx, [int]$sy) {
  # right after an apply the canvas may still be rebuilding: one more try
  $m = CtxOpen $sx $sy; if (-not $m) { Start-Sleep -Milliseconds 800; $m = CtxOpen $sx $sy }; return $m
}
# Invoke on a first-level item of a context menu returns but runs nothing (measured: no command in Desktop's log);
# a click posted to the menu's window at the item runs it. In a submenu it is the other way round: the click is
# ignored and Invoke runs the item (measured: Measure > Average -> tabui:change-aggregation-ui).
function ClickItem($it) {
  $e = $it; $hm = [IntPtr]0
  while ($e -and $hm -eq [IntPtr]0) {
    $hm = [IntPtr]$e.Current.NativeWindowHandle
    if ($hm -eq [IntPtr]0) { $e = [System.Windows.Automation.TreeWalker]::RawViewWalker.GetParent($e) }
  }
  if ($hm -eq [IntPtr]0) { throw 'no window for the menu item' }
  $r = $it.Current.BoundingRectangle
  $sx = [int]($r.X + $r.Width / 2); $sy = [int]($r.Y + $r.Height / 2)
  $pt = New-Object CtxClick+POINT; $pt.X = $sx; $pt.Y = $sy
  [CtxClick]::ScreenToClient($hm, [ref]$pt) | Out-Null
  $lp = [IntPtr](($pt.Y -shl 16) -bor ($pt.X -band 0xFFFF))
  # Qt checks the real cursor when the button goes up: if the user's mouse is elsewhere the click is
  # dropped. Hold the cursor on the item while the click is posted, then put it back.
  $old = New-Object CtxClick+POINT; [CtxClick]::GetCursorPos([ref]$old) | Out-Null
  try {
    [CtxClick]::SetCursorPos($sx, $sy) | Out-Null; Start-Sleep -Milliseconds 60
    [CtxClick]::PostMessage($hm, 0x0200, [IntPtr]0, $lp) | Out-Null; Start-Sleep -Milliseconds 100
    [CtxClick]::PostMessage($hm, 0x0201, [IntPtr]1, $lp) | Out-Null; Start-Sleep -Milliseconds 80
    [CtxClick]::SetCursorPos($sx, $sy) | Out-Null
    [CtxClick]::PostMessage($hm, 0x0202, [IntPtr]0, $lp) | Out-Null; Start-Sleep -Milliseconds 150
  } finally { [CtxClick]::SetCursorPos($old.X, $old.Y) | Out-Null }
}
function SubMenu($it) {
  try { $it.GetCurrentPattern($EC::Pattern).Expand() } catch { return $null }
  for ($i = 0; $i -lt 15; $i++) {
    Start-Sleep -Milliseconds 100
    $s = $it.FindFirst($T::Children, (New-Object $PC($A::ControlTypeProperty, $CT::Menu)))
    if ($s) { Start-Sleep -Milliseconds 150; return $s }
  }
  return $null
}
"""

_CTX_LIST = _CTX_COMMON + r"""
$depth = __DEPTH__
$out = @()
function Walk($popup, $path, $level) {
  foreach ($it in Items $popup) {
    $i = Info $it; $i.path = ($path + @($i.name)) -join ' > '
    $script:out += [pscustomobject]$i
    if ($i.submenu -and $i.enabled -and $level -lt $depth) {
      $sub = SubMenu $it
      if ($sub) { Walk $sub ($path + @($i.name)) ($level + 1); Collapse $it; Start-Sleep -Milliseconds 120 }
    }
  }
}
try {
  $m = CtxOpenRetry __X__ __Y__
  if ($m) { Walk $m @() 1 } else { $out += [pscustomobject]@{ error = 'no context menu' } }
} catch { $out += [pscustomobject]@{ error = "$_" } }
CtxClose
ConvertTo-Json -InputObject @($out) -Compress -Depth 3
"""

_CTX_INVOKE = _CTX_COMMON + r"""
$parts = @(__PATH__)
$res = [ordered]@{ path = ($parts -join ' > '); invoked = $false }
try {
  $p = CtxOpenRetry __X__ __Y__
  if (-not $p) { throw 'no context menu' }
  for ($k = 0; $k -lt $parts.Count - 1; $k++) {
    $it = Items $p | Where-Object { $_.Current.Name -eq $parts[$k] } | Select-Object -First 1
    if (-not $it) { throw "no item '$($parts[$k])'" }
    $p = SubMenu $it; if (-not $p) { throw "submenu '$($parts[$k])' did not open" }
  }
  $it = Items $p | Where-Object { $_.Current.Name -eq $parts[-1] } | Select-Object -First 1
  if (-not $it) { throw "no item '$($parts[-1])'" }
  if (-not $it.Current.IsEnabled) { throw "item '$($parts[-1])' is disabled" }
  if ($parts.Count -gt 1) { $it.GetCurrentPattern($IP::Pattern).Invoke() } else { ClickItem $it }
  Start-Sleep -Milliseconds 600
  $res.invoked = $true
  if ((CtxMenus).Count) { $res.menuLeftOpen = $true; CtxClose }
} catch { CtxClose; $res.error = "$_" }
ConvertTo-Json -InputObject $res -Compress
"""

_CTX_TARGETS = _COMMON + r"""
$out = [ordered]@{}
function Center($e) { $r = $e.Current.BoundingRectangle; @([int]($r.X + $r.Width / 2), [int]($r.Y + $r.Height / 2)) }
foreach ($e in @($main.FindAll($T::Descendants, [System.Windows.Automation.Condition]::TrueCondition))) {
  $id = $e.Current.AutomationId; $r = $e.Current.BoundingRectangle
  if ($r.Width -le 0 -or $e.Current.IsOffscreen) { continue }
  $ct = $e.Current.ControlType
  if ($ct -eq $CT::TreeItem -and $id -match 'm_commonTree' -and $e.Current.Name) { $out['field:' + $e.Current.Name] = Center $e }
  elseif ($id -match '\.m_yAxisShelf$') { $out['shelf:rows'] = @([int]($r.X + __PILL__), [int]($r.Y + $r.Height / 2)) }
  elseif ($id -match '\.m_xAxisShelf$') { $out['shelf:cols'] = @([int]($r.X + __PILL__), [int]($r.Y + $r.Height / 2)) }
  elseif ($id -match '\.m_filterShelf$') { $out['shelf:filters'] = @([int]($r.X + $r.Width / 2), [int]($r.Y + 30)) }
  elseif ($id -match 'defaultMarksCardTabContents\.m_en[^.]*$') { $out['marks:encoding'] = @([int]($r.X + $r.Width / 2), [int]($r.Y + 11)) }
  elseif ($id -match 'SceneMarginWidget_m_(left|bottom|top|right)Axes$') {
    # the first header / axis label: left headers are stacked rows, top headers side by side
    if ($Matches[1] -eq 'left') { $out['axis:left'] = @([int]($r.X + $r.Width / 2), [int]($r.Y + 10)) } else { $out['axis:' + $Matches[1]] = Center $e } }
  elseif ($id -match '\.SceneWidget_[^.]*$' -and -not $out.Contains('view')) {
    $out['view:rect'] = @([int]$r.X, [int]$r.Y, [int]$r.Width, [int]$r.Height) }
  elseif ($id -match 'm_titleWidget$') { $out['title'] = Center $e }
  elseif ($id -match 'SheetTabsWidget\.SheetListWidget$') {
    $k = 0; foreach ($t in $e.FindAll($T::Children, (New-Object $PC($A::ControlTypeProperty, $CT::ListItem)))) { $out['tab:' + $k] = Center $t; $k++ }
  }
  elseif ($id -match 'DashboardWidget\.ZoneWidget (\d+)$') { $out['zone:' + $Matches[1]] = @([int]($r.X + 8), [int]($r.Y + 8)) }
}
ConvertTo-Json -InputObject $out -Compress
"""


def context_targets(pill: int = 30) -> dict[str, list[int]]:
    """Screen points that open a context menu on the sheet now on screen: field:<name>, shelf:rows|cols|filters,
    marks:encoding, axis:left|bottom|top, title, tab:<i>, zone:<id>; view:rect is the view's x, y, w, h (the marks
    are drawn, not exposed: `find_marks` finds one). `pill` is how far into a shelf its first pill sits."""
    return _run(_CTX_TARGETS.replace("__PILL__", str(pill)), timeout=90)


def find_marks(rect, cols: int = 6, rows: int = 5) -> dict[str, list[int]]:
    """In the view's rect (x, y, w, h), a point on a mark (its menu has Keep Only) and one on the background."""
    x, y, w, h = rect
    found: dict[str, list[int]] = {}
    for j in range(rows):
        for i in range(cols):
            pt = [int(x + w * (i + 0.5) / cols), int(y + h * (j + 0.5) / rows)]
            names = {it.get("name") for it in context_items(pt, depth=1)}
            key = "view" if "Keep Only" in names else ("view:empty" if "Annotate" in names else None)
            if key and key not in found:
                found[key] = pt
            if len(found) == 2:
                return found
    return found


def context_items(point, depth: int = 2) -> list[dict]:
    """The items of the context menu a right-click at `point` (screen x, y) opens; the menu is closed after."""
    return _run(_CTX_LIST.replace("__X__", str(int(point[0]))).replace("__Y__", str(int(point[1])))
                .replace("__DEPTH__", str(depth)), timeout=150)


def context_invoke(point, path: str) -> dict:
    """Right-click at `point` and run the item `path` ('Sort...', 'Format > Font'). It changes the open workbook."""
    parts = [p.strip() for p in path.split(">")]
    return _run(_CTX_INVOKE.replace("__X__", str(int(point[0]))).replace("__Y__", str(int(point[1])))
                .replace("__PATH__", _ps_list(parts)), timeout=90)


def context_close() -> None:
    """Close a context menu left open (WindowPattern.Close: no keystroke)."""
    _run(_CTX_COMMON + "\nCtxClose\n'[]'", timeout=30)
