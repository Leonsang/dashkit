"""Tableau Desktop's own interface, through Windows UI Automation: its menus and commands.

Desktop's External Client API writes a workbook only as a whole document. The commands of its interface (menus,
toolbar) are not in that API, but Desktop exposes them to UI Automation. This module lists them and runs one,
so a command can be reverse-engineered: run it on a probe workbook and diff the document before and after
(scripts/ui_reverse.py). Running a command changes the open workbook: use it on test workbooks only.
"""

from __future__ import annotations

import json
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
