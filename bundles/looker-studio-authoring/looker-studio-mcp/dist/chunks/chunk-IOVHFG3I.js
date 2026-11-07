import { createRequire as __lsCreateRequire } from 'node:module'; const require = __lsCreateRequire(import.meta.url);
import {
  evaluate,
  evaluateOn,
  getReportPage,
  parseReportUrl,
  readComponentConfigScript,
  readLayoutScript
} from "./chunk-7T2JYYHB.js";

// src/looker/layout.ts
var EVAL_TIMEOUT_MS = Number(process.env.LS_EVAL_TIMEOUT_MS ?? 15e3);
async function getReportLayout(pageId) {
  const page = await getReportPage();
  const current = parseReportUrl(page.url());
  if (pageId && current.pageId && pageId !== current.pageId) {
    const target = page.url().replace(/\/page\/[^/?#]+/, `/page/${encodeURIComponent(pageId)}`);
    await page.goto(target, { waitUntil: "networkidle2", timeout: 3e4 });
  }
  return evaluateOn(page, EVAL_TIMEOUT_MS, readLayoutScript, pageId);
}

// src/looker/diagnose.ts
async function getComponentConfig(componentId) {
  const res = await evaluate(readComponentConfigScript, componentId);
  if (!res.ok) throw new Error(res.error ?? `No se pudo leer ${componentId}.`);
  return res.config;
}

// src/security.ts
import { isAbsolute, relative, resolve } from "node:path";
var SecurityError = class extends Error {
  constructor(message) {
    super(message);
    this.name = "SecurityError";
  }
};
function writesAllowed() {
  return process.env.LS_ALLOW_WRITE === "1";
}
function assertWrite(tool, destructive = false) {
  if (!writesAllowed())
    throw new SecurityError(
      `${tool} modifica el informe y el servidor esta en modo solo lectura. Para habilitar escrituras arranca el MCP con LS_ALLOW_WRITE=1 (trabaja sobre una copia del informe).`
    );
  if (destructive && process.env.LS_ALLOW_DELETE !== "1")
    throw new SecurityError(`${tool} es destructiva: requiere ademas LS_ALLOW_DELETE=1 y confirmacion del usuario.`);
}
var REPORT_URL = /^https:\/\/(datastudio|lookerstudio)\.google\.com\/(u\/\d+\/)?reporting\/[A-Za-z0-9_-]+(\/[A-Za-z0-9_/-]*)?(\?[^#\s]*)?$/;
function assertReportUrl(url) {
  if (!REPORT_URL.test(url))
    throw new SecurityError("Solo se permiten URLs de informes: https://datastudio.google.com/reporting/<id>/... (o lookerstudio.google.com).");
}
function workspaceDir() {
  return resolve(process.env.LS_WORKSPACE ?? process.cwd());
}
function assertJsonPath(p) {
  const abs = resolve(workspaceDir(), p);
  const rel = relative(workspaceDir(), abs);
  if (rel.startsWith("..") || isAbsolute(rel)) throw new SecurityError(`Ruta fuera del directorio de trabajo (${workspaceDir()}): ${p}`);
  if (!/\.json$/i.test(abs)) throw new SecurityError(`Solo se permiten archivos .json: ${p}`);
  return abs;
}
var SECRET = /(ya29\.[\w-]{10,}|AIza[\w-]{30,}|Bearer\s+[\w.-]{20,}|xsrf[\w-]*\s*[:=]|-----BEGIN|sessionid|SAPISID|__Secure-)/i;
function sanitizeLearning(text) {
  const clean = text.replace(/[\u0000-\u0008\u000b-\u001f\u007f]/g, " ").trim().slice(0, 500);
  if (SECRET.test(clean)) throw new SecurityError("El texto parece contener una credencial; no se guarda.");
  return clean;
}

export {
  getReportLayout,
  getComponentConfig,
  writesAllowed,
  assertWrite,
  assertReportUrl,
  assertJsonPath,
  sanitizeLearning
};
