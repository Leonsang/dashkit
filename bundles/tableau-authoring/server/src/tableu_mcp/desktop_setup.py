"""Enable/disable the Tableau Desktop External Client API.

Findings (reverse engineered with REA + targeted disassembly, Tableau 2026.3, build 20263.26.1022.1645):

* tabexternalapihost.dll hosts a loopback HTTP server ("External Client API").
* tableau.exe calls ``externalapihost::SetEnabled(FeatureFlags::IsOn(0x6aefb043))`` at startup.
  Flag 0x6aefb043 is named ``ProjectAthena`` ("Allows editing of the workbook via HTTP endpoint"),
  default OFF, requires restart.
* tableau.exe reads feature overrides with ``TSettings::GetStringValue(Group=8, "FeatureOverrideOn")``.
  Group 8 maps to the registry subkey ``Debug``; the value is a comma-separated list of flag names.
* ``Settings\\ExternalApiEnabled`` is only a mirror that Tableau rewrites from the flag; setting it alone
  has no effect.

So enabling = ``HKCU\\Software\\Tableau\\Tableau <ver>\\Debug\\FeatureOverrideOn`` contains ``ProjectAthena``
and then (re)starting Tableau Desktop.
"""

from __future__ import annotations

import os
import subprocess
import sys
from dataclasses import dataclass
from pathlib import Path

FLAG_NAME = "ProjectAthena"
OVERRIDE_VALUE = "FeatureOverrideOn"
BASE_KEY = r"Software\Tableau"


def _winreg():
    if sys.platform != "win32":
        raise RuntimeError("Tableau Desktop registry settings are only available on Windows.")
    import winreg  # noqa: PLC0415

    return winreg


def installed_versions() -> list[str]:
    """Return Tableau Desktop versions that have a per-user registry hive, newest first."""
    winreg = _winreg()
    versions: list[str] = []
    try:
        with winreg.OpenKey(winreg.HKEY_CURRENT_USER, BASE_KEY) as k:
            i = 0
            while True:
                try:
                    name = winreg.EnumKey(k, i)
                except OSError:
                    break
                if name.startswith("Tableau 20"):
                    versions.append(name.removeprefix("Tableau "))
                i += 1
    except FileNotFoundError:
        return []
    return sorted(versions, reverse=True)


def _resolve_version(version: str | None) -> str:
    if version:
        return version
    found = installed_versions()
    if not found:
        raise RuntimeError("No Tableau Desktop registry hive found under HKCU\\Software\\Tableau.")
    return found[0]


def _read_overrides(version: str) -> list[str]:
    winreg = _winreg()
    try:
        with winreg.OpenKey(winreg.HKEY_CURRENT_USER, rf"{BASE_KEY}\Tableau {version}\Debug") as k:
            value, _ = winreg.QueryValueEx(k, OVERRIDE_VALUE)
    except FileNotFoundError:
        return []
    return [v.strip() for v in str(value).split(",") if v.strip()]


def _write_overrides(version: str, flags: list[str]) -> None:
    winreg = _winreg()
    path = rf"{BASE_KEY}\Tableau {version}\Debug"
    with winreg.CreateKeyEx(winreg.HKEY_CURRENT_USER, path, 0, winreg.KEY_SET_VALUE) as k:
        if flags:
            winreg.SetValueEx(k, OVERRIDE_VALUE, 0, winreg.REG_SZ, ",".join(flags))
        else:
            try:
                winreg.DeleteValue(k, OVERRIDE_VALUE)
            except FileNotFoundError:
                pass


def _mirror_enabled(version: str) -> int | None:
    winreg = _winreg()
    try:
        with winreg.OpenKey(winreg.HKEY_CURRENT_USER, rf"{BASE_KEY}\Tableau {version}\Settings") as k:
            value, _ = winreg.QueryValueEx(k, "ExternalApiEnabled")
            return int(value)
    except FileNotFoundError:
        return None


def tableau_running() -> list[int]:
    """PIDs of running tableau.exe processes."""
    if sys.platform != "win32":
        return []
    out = subprocess.run(
        ["tasklist", "/FI", "IMAGENAME eq tableau.exe", "/FO", "CSV", "/NH"],
        capture_output=True,
        text=True,
        check=False,
    ).stdout
    pids = []
    for line in out.splitlines():
        parts = [p.strip('"') for p in line.split('","')]
        if len(parts) > 1 and parts[0].lower() == "tableau.exe":
            pids.append(int(parts[1]))
    return pids


def find_tableau_exe(version: str | None = None) -> Path | None:
    version = _resolve_version(version)
    for root in (os.environ.get("ProgramW6432"), os.environ.get("ProgramFiles"), r"C:\Program Files"):
        if root:
            exe = Path(root) / "Tableau" / f"Tableau {version}" / "bin" / "tableau.exe"
            if exe.exists():
                return exe
    return None


@dataclass
class ApiStatus:
    version: str
    flag_override: bool
    mirror_enabled: int | None
    running_pids: list[int]
    tableau_exe: str | None

    @property
    def needs_restart(self) -> bool:
        # The flag is read at startup; the mirror reflects the state of the last run.
        return bool(self.running_pids) and self.flag_override and self.mirror_enabled != 1

    def as_dict(self) -> dict:
        return {
            "version": self.version,
            "flagOverride": self.flag_override,
            "externalApiEnabledMirror": self.mirror_enabled,
            "runningPids": self.running_pids,
            "tableauExe": self.tableau_exe,
            "needsRestart": self.needs_restart,
        }


def status(version: str | None = None) -> ApiStatus:
    version = _resolve_version(version)
    exe = find_tableau_exe(version)
    return ApiStatus(
        version=version,
        flag_override=FLAG_NAME in _read_overrides(version),
        mirror_enabled=_mirror_enabled(version),
        running_pids=tableau_running(),
        tableau_exe=str(exe) if exe else None,
    )


def enable(version: str | None = None) -> ApiStatus:
    version = _resolve_version(version)
    flags = _read_overrides(version)
    if FLAG_NAME not in flags:
        flags.append(FLAG_NAME)
        _write_overrides(version, flags)
    return status(version)


def disable(version: str | None = None) -> ApiStatus:
    version = _resolve_version(version)
    flags = [f for f in _read_overrides(version) if f != FLAG_NAME]
    _write_overrides(version, flags)
    return status(version)


def launch(version: str | None = None, workbook: str | None = None) -> int:
    exe = find_tableau_exe(version)
    if not exe:
        raise RuntimeError("tableau.exe not found under Program Files.")
    args = [str(exe)] + ([workbook] if workbook else [])
    proc = subprocess.Popen(args, close_fds=True)  # noqa: S603
    return proc.pid


# --------------------------------------------------------------------------------------------
# modal error dialogs
# --------------------------------------------------------------------------------------------
# With API 0.1.1 some failures (an invalid query, exporting an unrendered sheet, applying a workbook
# without sheets) are reported by Desktop as a modal "Unable to complete action" dialog that blocks
# the UI thread, so later API calls hang. These helpers read and close them with UI Automation.
_DIALOG_PS = r"""
Add-Type -AssemblyName UIAutomationClient, UIAutomationTypes
$A=[System.Windows.Automation.AutomationElement]; $T=[System.Windows.Automation.TreeScope]
$P=[System.Windows.Automation.PropertyCondition]
$out = @()
foreach ($procId in @(__PIDS__)) {
  $w = $A::RootElement.FindAll($T::Children, (New-Object $P($A::ProcessIdProperty, [int]$procId)))
  foreach ($win in $w) {
    $frames = $win.FindAll($T::Descendants, (New-Object $P($A::AutomationIdProperty, 'QApplication.UnifiedDetailedErrorDialog.mainFrame')))
    foreach ($f in $frames) {
      $get = { param($id) $e = $f.FindFirst($T::Descendants, (New-Object $P($A::AutomationIdProperty, "QApplication.UnifiedDetailedErrorDialog.mainFrame.$id"))); if ($e) { $e.Current.Name } else { '' } }
      $item = [ordered]@{ pid = [int]$procId; title = (& $get 'titleBar.titleContainer.defaultTitle');
        message = (& $get 'contentContainer.DetailedErrorContents.shortErrorMessage');
        code = ((& $get 'contentContainer.DetailedErrorContents.errorCode') -replace '^Error Code:\s*', ''); dismissed = $false }
      if (__DISMISS__) {
        $b = $f.FindFirst($T::Descendants, (New-Object $P($A::AutomationIdProperty, 'QApplication.UnifiedDetailedErrorDialog.mainFrame.titleBar.closeButton')))
        if ($b) { $b.GetCurrentPattern([System.Windows.Automation.InvokePattern]::Pattern).Invoke(); $item.dismissed = $true }
      }
      $out += [pscustomobject]$item
    }
    # Plain Qt message boxes ("Warning", "Tableau", "Error") with an OK button.
    $wins = @($win) + @($win.FindAll($T::Descendants, (New-Object $P($A::ControlTypeProperty, [System.Windows.Automation.ControlType]::Window))))
    foreach ($d in $wins) {
      $title = $d.Current.Name
      if ($title -notin @('Warning', 'Error', 'Tableau', 'Tableau Desktop')) { continue }
      $ok = $d.FindFirst($T::Descendants, (New-Object $P($A::NameProperty, 'OK')))
      if (-not $ok) { continue }
      $texts = $d.FindAll($T::Descendants, (New-Object $P($A::ControlTypeProperty, [System.Windows.Automation.ControlType]::Text))) | ForEach-Object { $_.Current.Name } | Where-Object { $_ }
      $item = [ordered]@{ pid = [int]$procId; title = $title; message = (($texts | Select-Object -Unique) -join ' | '); code = ''; dismissed = $false }
      if (__DISMISS__) { $ok.GetCurrentPattern([System.Windows.Automation.InvokePattern]::Pattern).Invoke(); $item.dismissed = $true }
      $out += [pscustomobject]$item
    }
  }
}
ConvertTo-Json -InputObject @($out) -Compress
"""


def error_dialogs(dismiss: bool = False, pids: list[int] | None = None) -> list[dict]:
    """List (and optionally close) Tableau's modal error dialogs: [{pid, title, message, code, dismissed}]."""
    import json  # noqa: PLC0415

    pids = pids or tableau_running()
    if sys.platform != "win32" or not pids:
        return []
    script = _DIALOG_PS.replace("__PIDS__", ",".join(map(str, pids))).replace("__DISMISS__", "$true" if dismiss else "$false")
    res = subprocess.run(
        ["powershell", "-NoProfile", "-NonInteractive", "-Command", script],
        capture_output=True, text=True, encoding="utf-8", check=False, timeout=60,
    )
    try:
        data = json.loads(res.stdout.strip() or "[]")
    except ValueError:
        return [{"error": (res.stderr or res.stdout).strip()[:500]}]
    return data if isinstance(data, list) else [data]


# --------------------------------------------------------------------------------------------
# load / query warnings that Desktop only writes to its log
# --------------------------------------------------------------------------------------------
_LOG_PATTERNS = ("Errors for ", "ignoring", "Ignoring", "Error parsing", "LogicalQuery", "invalid query",
                 "is not a valid", "Unable to", "could not be", "Warnings occurred")
_LOG_NOISE = ("connector-plugin", "javaScriptConsole", "helpLink", "DialogWaitHandler", "QTranslator", "InfoUtils")


def log_dir() -> Path:
    docs = Path(os.environ.get("USERPROFILE", str(Path.home()))) / "Documents"
    return docs / "My Tableau Repository" / "Logs"


def desktop_warnings(pid: int | None = None, since: str | None = None, limit: int = 50) -> list[dict]:
    """Workbook-load and query warnings from Desktop's log (log.txt / log_N.txt) for a process.
    ``since`` is an ISO timestamp prefix (e.g. '2026-11-03T21:13'). Most recent last."""
    import json  # noqa: PLC0415

    pids = [pid] if pid else tableau_running()
    out: list[dict] = []
    for f in sorted(log_dir().glob("log*.txt"), key=lambda x: x.stat().st_mtime):
        try:
            lines = f.read_text(encoding="utf-8", errors="replace").splitlines()
        except OSError:
            continue
        for line in lines:
            if not any(f'"pid":{p},' in line for p in pids):
                continue
            if any(n in line for n in _LOG_NOISE) or not any(k in line for k in _LOG_PATTERNS):
                continue
            try:
                rec = json.loads(line)
            except ValueError:
                continue
            if since and rec.get("ts", "") < since:
                continue
            v = rec.get("v")
            msg = v if isinstance(v, str) else (v.get("error-messages") or v.get("shortMessage") or json.dumps(v)[:300])
            out.append({"ts": rec.get("ts"), "severity": rec.get("sev"), "message": str(msg).strip()[:500]})
    return out[-limit:]



# --------------------------------------------------------------------------------------------
# any modal window (not only errors): File Recovery, Save changes?, connection prompts...
# --------------------------------------------------------------------------------------------
_MODALS_PS = r"""
Add-Type -AssemblyName UIAutomationClient, UIAutomationTypes
$A=[System.Windows.Automation.AutomationElement]; $T=[System.Windows.Automation.TreeScope]
$PC=[System.Windows.Automation.PropertyCondition]; $CT=[System.Windows.Automation.ControlType]
$out = @()
foreach ($procId in @(__PIDS__)) {
  $tops = $A::RootElement.FindAll($T::Children, (New-Object $PC($A::ProcessIdProperty, [int]$procId)))
  foreach ($top in $tops) {
    $cands = @()
    if ($top.Current.ClassName -ne 'TMainWindow' -and $top.Current.ClassName -ne 'SysShadow' -and $top.Current.Name) { $cands += $top }
    $cands += @($top.FindAll($T::Descendants, (New-Object $PC($A::ControlTypeProperty, $CT::Window))) | Where-Object { $_.Current.Name -and $_.Current.AutomationId -notmatch "WebEngineView" })
    foreach ($d in $cands) {
      $buttons = @($d.FindAll($T::Descendants, (New-Object $PC($A::ControlTypeProperty, $CT::Button))) | ForEach-Object { $_.Current.Name } | Where-Object { $_ } | Select-Object -Unique)
      if ($buttons.Count -eq 0) { continue }
      $texts = @($d.FindAll($T::Descendants, (New-Object $PC($A::ControlTypeProperty, $CT::Text))) | ForEach-Object { $_.Current.Name } | Where-Object { $_ } | Select-Object -Unique)
      $items = @($d.FindAll($T::Descendants, (New-Object $PC($A::ControlTypeProperty, $CT::DataItem))) | ForEach-Object { $_.Current.Name } | Where-Object { $_ } | Select-Object -Unique)
      $out += [pscustomobject]([ordered]@{ pid = [int]$procId; title = $d.Current.Name; automationId = $d.Current.AutomationId; texts = $texts; items = $items; buttons = $buttons; closed = $false })
    }
  }
}
ConvertTo-Json -InputObject @($out) -Compress -Depth 4
"""

# Modals that are safe to close with their title-bar X: closing only dismisses the message.
SAFE_TO_CLOSE = ("Unable to complete action", "Errors occurred while reloading the data source.", "Warning", "Error")


def modals(close_safe: bool = False, pids: list[int] | None = None) -> list[dict]:
    """Every modal window Tableau Desktop shows (title, texts, list items, buttons), not only errors:
    'File Recovery', 'Save changes?', connection prompts... With close_safe, error/warning messages are
    closed (as ErrorDialogs does); anything else is only reported: buttons such as Delete or Open are the
    user's decision."""
    import json  # noqa: PLC0415

    pids = pids or tableau_running()
    if sys.platform != "win32" or not pids:
        return []
    script = _MODALS_PS.replace("__PIDS__", ",".join(map(str, pids)))
    res = subprocess.run(["powershell", "-NoProfile", "-NonInteractive", "-Command", script],
                         capture_output=True, text=True, encoding="utf-8", check=False, timeout=60)
    try:
        data = json.loads(res.stdout.strip() or "[]")
    except ValueError:
        return [{"error": (res.stderr or res.stdout).strip()[:500]}]
    data = data if isinstance(data, list) else [data]
    if close_safe and any(d.get("title") in SAFE_TO_CLOSE for d in data):
        error_dialogs(dismiss=True, pids=pids)
        for d in data:
            if d.get("title") in SAFE_TO_CLOSE:
                d["closed"] = True
    for d in data:
        d["action"] = ("closed (error/warning message)" if d.get("closed") else
                       "needs the user: tell them what it asks and wait")
    return data
