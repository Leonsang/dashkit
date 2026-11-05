"""Client for the Tableau Desktop External Client API (loopback HTTP, bearer token).

Discovery files: %LOCALAPPDATA%\\Tableau\\Tableau\\ExternalApi\\<pid>.json
  {schemaVersion, instanceId, pid, baseUrl, tokenType, token, applicationVersion, apiVersion, startedAt}
The server requires a loopback Host, a User-Agent header and the bearer token.
"""

from __future__ import annotations

import json
import os
import time
from dataclasses import dataclass
from pathlib import Path
from urllib.parse import quote

import httpx

from . import __version__
from .desktop_setup import tableau_running

USER_AGENT = f"tableu-mcp/{__version__}"


def discovery_dirs() -> list[Path]:
    override = os.environ.get("TABLEAU_EXTERNAL_API_DISCOVERY_DIR")
    if override:
        return [Path(override)]
    root = Path(os.environ.get("LOCALAPPDATA") or Path.home() / "AppData" / "Local")
    return [root / "Tableau" / "Tableau" / "ExternalApi", root / "Tableau" / "ExternalApi"]


@dataclass
class Instance:
    pid: int
    base_url: str
    token: str
    api_version: str
    app_version: str
    instance_id: str
    started_at: str
    path: Path

    def public(self) -> dict:
        return {
            "pid": self.pid,
            "baseUrl": self.base_url,
            "apiVersion": self.api_version,
            "applicationVersion": self.app_version,
            "instanceId": self.instance_id,
            "startedAt": self.started_at,
        }


def list_instances(only_alive: bool = True) -> list[Instance]:
    alive = set(tableau_running()) if only_alive else None
    found: list[Instance] = []
    for d in discovery_dirs():
        if not d.is_dir():
            continue
        for f in d.glob("*.json"):
            try:
                data = json.loads(f.read_text(encoding="utf-8"))
            except (OSError, json.JSONDecodeError):
                continue
            if data.get("schemaVersion") != 1 or not data.get("token") or not data.get("baseUrl"):
                continue
            pid = int(data.get("pid") or f.stem)
            if alive is not None and pid not in alive:
                continue
            found.append(
                Instance(
                    pid=pid,
                    base_url=data["baseUrl"].rstrip("/"),
                    token=data["token"],
                    api_version=str(data.get("apiVersion", "")),
                    app_version=str(data.get("applicationVersion", "")),
                    instance_id=str(data.get("instanceId", "")),
                    started_at=str(data.get("startedAt", "")),
                    path=f,
                )
            )
    return sorted(found, key=lambda i: i.started_at, reverse=True)


class ApiError(RuntimeError):
    def __init__(self, status: int, body: str, path: str):
        self.status = status
        self.body = body
        self.path = path
        super().__init__(f"HTTP {status} on {path}: {body[:800]}")


class DesktopClient:
    def __init__(self, instance: Instance, timeout: float = 60.0):
        self.instance = instance
        self._http = httpx.Client(
            base_url=instance.base_url,
            timeout=timeout,
            headers={
                "Authorization": f"Bearer {instance.token}",
                "User-Agent": f"{os.environ.get('TABLEAU_USER_AGENT_PREFIX', '')} {USER_AGENT}".strip(),
            },
        )

    @classmethod
    def connect(cls, pid: int | None = None, wait_seconds: float = 0) -> DesktopClient:
        deadline = time.monotonic() + wait_seconds
        while True:
            instances = list_instances()
            if pid is not None:
                instances = [i for i in instances if i.pid == pid]
            if instances:
                return cls(instances[0])
            if time.monotonic() >= deadline:
                raise RuntimeError(
                    "No running Tableau Desktop with the External Client API was found. "
                    "Run `tableu enable` and restart Tableau Desktop."
                    if pid is None
                    else f"No External Client API instance for pid {pid}."
                )
            time.sleep(1)

    # -- low level -------------------------------------------------------------------------
    def _req(self, method: str, path: str, **kw) -> httpx.Response:
        # Right after a launch Desktop answers reads with 500 operation-failed while the workbook is still
        # loading or rendering; the same GET succeeds seconds later. Writes are never retried.
        for attempt in range(5):
            r = self._http.request(method, path, **kw)
            if (r.status_code == 500 and method == "GET" and attempt < 4 and "operation-failed" in r.text
                    and not path.endswith(("/image", "/summaryData"))):  # those 500s pop a modal each time
                time.sleep(2 * (attempt + 1))
                continue
            break
        if r.status_code >= 400:
            raise ApiError(r.status_code, r.text, path)
        return r

    def get_json(self, path: str, **params) -> dict:
        params = {k: v for k, v in params.items() if v is not None}
        return self._req("GET", path, params=params).json()

    # -- endpoints (API 0.1.1) -------------------------------------------------------------
    def health(self) -> dict:
        return self.get_json("/v0/health")

    def openapi(self) -> dict:
        return self.get_json("/openapi.json")

    def app(self) -> dict:
        return self.get_json("/v0/app")

    def workbook(self) -> dict:
        return self.get_json("/v0/workbook")

    def worksheets(self) -> dict:
        return self.get_json("/v0/workbook/worksheets")

    def dashboards(self) -> dict:
        return self.get_json("/v0/workbook/dashboards")

    def storyboards(self) -> dict:
        return self.get_json("/v0/workbook/storyboards")

    def datasources(self) -> dict:
        return self.get_json("/v0/workbook/datasources")

    def site(self) -> dict:
        return self.get_json("/v0/site")

    def get_document(self) -> str:
        return self._req("GET", "/v0/workbook/document").text

    def validate_document(self, xml: str) -> dict:
        r = self._http.post(
            "/v0/workbook/document:validate",
            content=xml.encode("utf-8"),
            headers={"Content-Type": "application/xml"},
        )
        try:
            body = r.json()
        except ValueError:
            body = {"raw": r.text}
        body = body if isinstance(body, dict) else {"body": body}
        ok = r.status_code < 400 and body.get("isValid", True) is not False
        return {"status": r.status_code, "ok": ok, **body}

    def apply_document(self, xml: str) -> dict:
        r = self._req(
            "POST",
            "/v0/workbook/document",
            timeout=180,  # Desktop loads the data and runs the views' queries before answering
            content=xml.encode("utf-8"),
            headers={"Content-Type": "application/xml"},
        )
        try:
            return r.json()
        except ValueError:
            return {"raw": r.text}

    def _sheet_id(self, kind: str, name_or_id: str) -> str:
        if name_or_id.startswith("{"):
            return name_or_id
        wb = self.workbook()
        for item in wb.get(kind, []):
            if item.get("name") == name_or_id:
                return item["id"]
        names = [i.get("name") for i in wb.get(kind, [])]
        raise RuntimeError(f"No {kind[:-1]} named {name_or_id!r}. Available: {names}")

    def sheet_document(self, kind: str, name_or_id: str) -> str:
        sid = quote(self._sheet_id(kind, name_or_id), safe="")
        return self._req("GET", f"/v0/workbook/{kind}/{sid}/document").text

    def sheet_image(self, kind: str, name_or_id: str, allow_worksheet: bool = False) -> bytes:
        if kind == "worksheets" and not allow_worksheet:
            # API 0.1.1: exporting a worksheet that is not currently rendered makes Tableau show a
            # modal "Unable to complete action" dialog (error 8F2A4D91) that blocks the UI.
            wid = self._sheet_id(kind, name_or_id)
            hosts = [d["name"] for d in self.workbook().get("dashboards", []) if wid in d.get("containedSheets", [])]
            hint = f" Export a dashboard that contains it instead: {hosts}." if hosts else ""
            raise RuntimeError(
                f"Refusing to export worksheet {name_or_id!r}: if it is not the sheet shown in Tableau, "
                "Desktop pops a blocking 'Unable to complete action' dialog (8F2A4D91)." + hint +
                " Pass allow_worksheet=True (CLI: --allow-worksheet) once the sheet is visible."
            )
        sid = quote(self._sheet_id(kind, name_or_id), safe="")
        try:
            r = self._req("GET", f"/v0/workbook/{kind}/{sid}/image", timeout=30)
        except httpx.ReadTimeout as e:
            raise RuntimeError(
                f"Timed out exporting {name_or_id!r}. With API 0.1.1 the sheet must be rendered "
                "(visible in Desktop, or placed on the active dashboard) before it can be exported."
            ) from e
        ctype = r.headers.get("content-type", "")
        if "json" in ctype:
            import base64  # noqa: PLC0415

            data = r.json()
            b64 = data.get("imageBase64") or data.get("image") or ""
            return base64.b64decode(b64)
        return r.content

    def summary_data(
        self,
        worksheet: str,
        max_rows: int | None = 100,
        ignore_aliases: bool | None = None,
        ignore_selection: bool | None = True,
        columns: list[str] | None = None,
    ) -> dict:
        sid = quote(self._sheet_id("worksheets", worksheet), safe="")
        return self.get_json(
            f"/v0/workbook/worksheets/{sid}/summaryData",
            maxRows=max_rows,
            ignoreAliases=None if ignore_aliases is None else str(ignore_aliases).lower(),
            ignoreSelection=None if ignore_selection is None else str(ignore_selection).lower(),
            columnsToIncludeByFieldName=",".join(columns) if columns else None,
        )
