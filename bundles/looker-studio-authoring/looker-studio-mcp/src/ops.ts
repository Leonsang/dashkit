/**
 * High-level operations shared by the CLI (src/cli.ts) and the MCP server
 * (src/index.ts). Every operation feeds the learning layer (knowledge.ts).
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import type { Page } from 'puppeteer-core';
import { evaluateOn, getBrowser, getReportPage, REPORT_URL_RE } from './browser.js';
import { getTemplate, knownFix, learn, saveTemplate, seedKnowledge, summary } from './knowledge.js';
import { log } from './log.js';
import { requireEditMode } from './looker/report.js';
import {
  applyBoxModelScript,
  bindFieldsScript,
  diagnoseReportScript,
  pageInfoScript,
  readDataSourcesScript,
} from './looker/scripts.js';
import {
  captureTemplatesScript,
  componentExistsScript,
  createComponentScript,
  deleteComponentScript,
  exportReportScript,
  installNetMonitorScript,
  patchComponentScript,
  readNetLogScript,
  readyStateScript,
} from './looker/scripts2.js';
import type { DiagnoseIssue, DiagnoseResult } from './looker/types.js';
import type { Box, CreateComponentResult, ExportResult } from './looker/types2.js';
import { lintSpec, loadSpec, type ReportSpec, type ResolvedComponent } from './spec.js';
import { probeReadScript, probeStartScript } from './looker/scripts3.js';
import { addFilter, addPage, applyTheme, listPages, useThemePreset } from './ops3.js';

const T = Number(process.env.LS_EVAL_TIMEOUT_MS ?? 15_000);
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

seedKnowledge();

// Node-side network log (puppeteer 'response' events): URL path + status only.
// More reliable than the in-page XHR hook (the editor does not always go through it).
const NET_RE = /\/(updatePage|updateReport|batchedDataV2|createReport|deletePage)\b/;
const netLogs = new WeakMap<Page, Array<{ path: string; status: number; t: number }>>();
function trackNet(page: Page): void {
  if (netLogs.has(page)) return;
  const log: Array<{ path: string; status: number; t: number }> = [];
  netLogs.set(page, log);
  page.on('response', (r) => {
    const u = r.url();
    if (!NET_RE.test(u)) return;
    log.push({ path: new URL(u).pathname, status: r.status(), t: Date.now() });
    if (log.length > 200) log.splice(0, log.length - 200);
  });
}
function netSince(page: Page, t0: number) {
  return (netLogs.get(page) ?? []).filter((e) => e.t >= t0);
}

// ---------------------------------------------------------------------------
// page lifecycle
// ---------------------------------------------------------------------------

export async function waitReady(page: Page, timeoutMs = 45_000): Promise<void> {
  const t0 = Date.now();
  while (Date.now() - t0 < timeoutMs) {
    const s = await evaluateOn(page, 5_000, readyStateScript).catch(() => null);
    if (s?.ready) {
      trackNet(page);
      await evaluateOn(page, 5_000, installNetMonitorScript).catch(() => undefined);
      return;
    }
    await sleep(500);
  }
  throw new Error('El editor no termino de cargar (legoUndoRedoService sin paginas).');
}

/** Opens (or reuses) a tab on the given report URL and waits for the editor. */
export async function openReport(url: string): Promise<{ url: string }> {
  const browser = await getBrowser();
  const target = browser.targets().find((t) => t.type() === 'page' && REPORT_URL_RE.test(t.url()));
  const page = (target && (await target.page())) || (await browser.newPage());
  // Bring to front BEFORE navigating: in a hidden tab the editor does not boot
  // (observed 2026-11-03: it ends on the home page with the model empty).
  await page.bringToFront();
  await page.goto(url, { waitUntil: 'networkidle2', timeout: 90_000 });
  await waitReady(page);
  return { url: page.url() };
}

/** The report id in a report URL, or the id itself. */
export function reportId(urlOrId: string): string {
  const m = urlOrId.match(/reporting\/([A-Za-z0-9_-]+)/);
  const id = m ? m[1]! : urlOrId.trim();
  if (!/^[A-Za-z0-9_-]{10,}$/.test(id)) throw new Error(`No es un id de informe: ${urlOrId}`);
  return id;
}

/**
 * Copies a report and opens the copy in /edit — the "always work on a copy"
 * rule as one call. Uses the official Linking API (/reporting/create?c.reportId=),
 * which shows the source read-only with "Edit and share"; confirming the data
 * access review saves a new report owned by the signed-in user. Data sources
 * keep their credentials: the copy reads the same data as the original.
 * Verified by CDP 2026-11-04 (ES UI; EN labels matched too).
 */
export async function copyReport(source: string, name?: string): Promise<{ sourceId: string; id: string; url: string; name: string }> {
  const sourceId = reportId(source);
  const copyName = name?.trim() || `Copia de ${sourceId} ${new Date().toISOString().slice(0, 16).replace('T', ' ')}`;
  const url =
    `https://datastudio.google.com/reporting/create?c.reportId=${encodeURIComponent(sourceId)}` +
    `&r.reportName=${encodeURIComponent(copyName)}`;
  const browser = await getBrowser();
  const page = await browser.newPage();
  await page.bringToFront();
  await page.goto(url, { waitUntil: 'networkidle2', timeout: 90_000 });

  const click = (pattern: string, scope: string) =>
    page.waitForFunction(
      (p: string, s: string) => {
        const re = new RegExp(p, 'i');
        const b = [...document.querySelectorAll<HTMLButtonElement>(s)].find((x) => re.test(x.innerText.trim()) && !x.disabled);
        if (!b) return false;
        b.click();
        return true;
      },
      { timeout: 45_000, polling: 500 },
      pattern,
      scope,
    );
  try {
    await click('^(Editar y compartir|Edit and share)$', 'button');
    // The data-access review dialog; older builds skip it and save directly.
    await Promise.race([
      click('^(Confirmar y guardar|Acknowledge and save|Confirm and save)$', '[role=dialog] button, mat-dialog-container button'),
      page.waitForFunction(() => /\/reporting\/[^/]+\/page\//.test(location.href), { timeout: 45_000 }),
    ]);
    await page.waitForFunction(() => /\/reporting\/[^/]+\/page\/[^/]+\/edit/.test(location.href), { timeout: 60_000, polling: 500 });
  } catch (e) {
    const shown = await page.evaluate(() => document.body.innerText.slice(0, 300)).catch(() => '');
    throw new Error(`No se pudo copiar el informe ${sourceId} (${(e as Error).message}). La pagina muestra: ${shown}`);
  }
  await waitReady(page);
  const id = reportId(page.url());
  if (id === sourceId) throw new Error('La URL final es la del original, no la de una copia.');
  learn('note', 'report_copy', { text: 'Linking API /reporting/create?c.reportId= -> Editar y compartir -> Confirmar y guardar' });
  return { sourceId, id, url: page.url(), name: copyName };
}

/** Reloads the report tab: renders components created via the API and drops any unsaved invalid state. */
export async function reloadReport(): Promise<{ url: string; components: number }> {
  const page = await getReportPage();
  await page.bringToFront();
  await page.reload({ waitUntil: 'networkidle2', timeout: 90_000 });
  await waitReady(page);
  const s = await evaluateOn(page, T, readyStateScript);
  return { url: s.url, components: s.components };
}

async function editPage(): Promise<Page> {
  const { page } = await requireEditMode();
  trackNet(page);
  await evaluateOn(page, 5_000, installNetMonitorScript).catch(() => undefined);
  return page;
}

// ---------------------------------------------------------------------------
// export / templates (learning: display types + templates)
// ---------------------------------------------------------------------------

export async function exportReport(file?: string): Promise<ExportResult & { learnedTemplates: string[]; file?: string }> {
  const page = await getReportPage();
  const res = await evaluateOn(page, T, exportReportScript);
  for (const t of res.types) learn('display_type', t, { seenIn: res.reportId });
  const learned = await captureTemplatesOn(page);
  if (file) writeFileSync(file, JSON.stringify(res, null, 2));
  return { ...res, learnedTemplates: learned, ...(file ? { file } : {}) };
}

async function captureTemplatesOn(page: Page): Promise<string[]> {
  const cap = await evaluateOn(page, T, captureTemplatesScript);
  for (const t of cap.registeredTypes) learn('display_type', t, { registered: true });
  const learned: string[] = [];
  for (const [type, tpl] of Object.entries(cap.templates)) {
    if (saveTemplate(type, tpl.config, { url: cap.url.split('?')[0], fromComponent: tpl.fromComponent, dataSourceId: tpl.dataSourceId }))
      learned.push(type);
  }
  return learned;
}

export async function captureTemplates(): Promise<{ learned: string[]; known: string[]; registeredTypes: number }> {
  const page = await getReportPage();
  const learned = await captureTemplatesOn(page);
  const s = summary();
  return { learned, known: s.templates, registeredTypes: s.displayTypes.length };
}

// ---------------------------------------------------------------------------
// diagnose with knowledge (learning: error reasons; output: known fixes)
// ---------------------------------------------------------------------------

export async function diagnoseWithKnowledge(): Promise<DiagnoseResult & { issues: Array<DiagnoseIssue & { fix?: unknown }> }> {
  const page = await getReportPage();
  const res = await evaluateOn(page, T, diagnoseReportScript);
  const issues = res.issues.map((i) => {
    const m = i.message.match(/reason (\d+)\):\s*([^|]*)\|?\s*([^|]*)/);
    if (m) learn('error_reason', m[1]!, { title: m[2]!.trim(), description: m[3]!.trim() });
    const fix = (m && knownFix(`reason:${m[1]}`)) ?? knownFix(i.code);
    return fix ? { ...i, fix } : i;
  });
  return { ...res, issues };
}

// ---------------------------------------------------------------------------
// data sources: "@field" selector
// ---------------------------------------------------------------------------

export async function resolveDataset(page: Page, sel: string | undefined): Promise<string | undefined> {
  if (!sel) return undefined;
  if (!sel.startsWith('@')) return sel;
  const field = sel.slice(1).toLowerCase();
  const ds = await evaluateOn(page, T, readDataSourcesScript);
  let hit = ds.dataSources.find((d) => d.fields.some((f) => f.id.toLowerCase() === field || f.name.toLowerCase() === field));
  if (!hit) {
    // Sources no component uses yet have an empty schema: probe them with a temporary, unsaved component.
    for (const d of ds.dataSources.filter((x) => !x.fields.length)) {
      const st = await evaluateOn(page, T, probeStartScript, { datasetId: d.dataSourceId, template: getTemplate('kpi-metric') });
      if (!st.ok) continue;
      let pr = { ready: false, fields: [] as Array<{ id: string; name: string }> };
      for (let i = 0; i < 24 && !pr.ready; i++) {
        await sleep(250);
        pr = await evaluateOn(page, T, probeReadScript, i === 23);
      }
      if (pr.ready) learn('note', `dataset_fields:${d.dataSourceId}`, { text: pr.fields.map((f) => f.name).join(',') });
      if (pr.fields.some((f) => f.id.toLowerCase() === field || f.name.toLowerCase() === field)) return d.dataSourceId;
    }
  }
  if (!hit) throw new Error(`Ningun origen del informe tiene el campo "${sel.slice(1)}". Anade el origen o revisa el nombre.`);
  return hit.dataSourceId;
}

// ---------------------------------------------------------------------------
// create / delete (learning: outcomes, rejected saves, missing methods)
// ---------------------------------------------------------------------------

export interface CreateOptions {
  type: string;
  /** Template variant key suffix (type@variant). Forces using that template. */
  variant?: string;
  box: Box;
  pageId?: string;
  dataset?: string;
  dimensions?: string[];
  metrics?: string[];
  padding?: number;
  slots?: Record<string, string[]>;
}

export async function createComponent(o: CreateOptions): Promise<CreateComponentResult & { bound?: unknown; fix?: unknown }> {
  const page = await editPage();
  const datasetId = await resolveDataset(page, o.dataset);
  const hasFields = !!(o.dimensions?.length || o.metrics?.length || (o.slots && Object.keys(o.slots).length));
  const NO_DIMS = ['gauge-viz', 'bulletchart', 'kpi-metric'];
  const t0 = Date.now();
  // Empty report: mint ids from a temporary seed made by the editor's own factory.
  const { ensureSeedScript } = await import('./looker/scripts4.js');
  const seed = await evaluateOn(page, T, ensureSeedScript, o.pageId);
  if (seed.seedId) await sleep(1500);
  const res = await evaluateOn(page, T, createComponentScript, {
    type: o.type,
    box: o.box,
    ...(o.pageId ? { pageId: o.pageId } : {}),
    ...(datasetId ? { datasetId } : {}),
    ...(o.padding !== undefined ? { padding: o.padding } : {}),
    template: (o.variant && getTemplate(`${o.type}@${o.variant}`)) || getTemplate(o.type),
    ...(o.variant ? { preferTemplate: true } : {}),
    deferSave: hasFields,
  });
  if (seed.seedId) await deleteComponent(seed.seedId).catch(() => undefined);
  if (!res.ok) {
    learn('create_fail', o.type, { error: res.error });
    throw new Error(res.error);
  }
  let bound: unknown;
  if (hasFields) {
    bound = await evaluateOn(page, T + 10_000, bindFieldsScript, {
      componentId: res.componentId!, dimensions: o.dimensions ?? [], metrics: o.metrics ?? [],
      ...(NO_DIMS.includes(o.type) && !o.dimensions?.length ? { clearDimensions: true } : {}),
      ...(o.slots ? { slots: o.slots } : {}),
    });
  }
  await sleep(2500);
  const inPage = await evaluateOn(page, 5_000, readNetLogScript, t0).catch(() => []);
  const net = [...netSince(page, t0), ...inPage];
  const rejected = net.filter((e) => /updatePage/.test(e.path) && e.status >= 400);
  if (rejected.length) {
    learn('save_rejected', o.type, { source: res.source, status: rejected[0]!.status });
    await reloadReport(); // drop the invalid local state, otherwise every later save fails too
    const fix = knownFix('save_rejected:type_change');
    throw new Error(`El servidor rechazo el guardado (updatePage ${rejected[0]!.status}) del ${o.type} creado desde ${res.source}. Se recargo el informe. ${fix ?? ''}`);
  }
  learn('create_ok', o.type, { source: res.source?.startsWith('clone') ? 'clone' : res.source });
  return { ...res, ...(bound ? { bound } : {}) };
}

export async function deleteComponent(componentId: string): Promise<{ ok: boolean; method: string; warning?: string }> {
  const page = await editPage();
  const t0 = Date.now();
  const r = await evaluateOn(page, T, deleteComponentScript, componentId);
  if (r.ok) {
    // Wait for this delete's own updatePage: back-to-back page saves can drop one (observed 2026-11-03).
    for (let i = 0; i < 24 && !netSince(page, t0).some((e) => /updatePage/.test(e.path)); i++) await sleep(250);
    const saved = netSince(page, t0).filter((e) => /updatePage|updateReport/.test(e.path));
    if (saved.some((e) => e.status >= 400)) {
      learn('save_rejected', 'delete', { statuses: saved.map((e) => e.status) });
      throw new Error(`El borrado de ${componentId} fue rechazado (${saved.map((e) => e.status).join(',')}).`);
    }
    learn('note', 'delete_method', { text: r.method });
    return { ok: true, method: r.method!, ...(saved.length ? {} : { warning: 'Sin respuesta de guardado en 6 s: verifica con reload si es critico.' }) };
  }
  if (r.needsKeyboard) {
    learn('method_missing', 'page.removeComponent', { fallback: 'select+Delete' });
    await page.bringToFront();
    await page.keyboard.press('Delete');
    await sleep(2000);
    const still = await evaluateOn(page, T, componentExistsScript, componentId);
    if (!still) return { ok: true, method: 'select+Delete' };
    throw new Error(`No se pudo borrar ${componentId} (la tecla Supr no tuvo efecto; ¿el foco esta en el lienzo?).`);
  }
  throw new Error(r.error ?? `No se pudo borrar ${componentId}.`);
}

// ---------------------------------------------------------------------------
// spec apply (idempotent through <spec>.state.json)
// ---------------------------------------------------------------------------

interface SpecState {
  reportId: string | null;
  keys: Record<string, string>;
}

export interface ApplyResult {
  dryRun: boolean;
  lint: ReturnType<typeof lintSpec>['issues'];
  actions: Array<{ key: string; action: 'create' | 'update' | 'skip'; componentId?: string; error?: string; warnings?: string[] }>;
  pages?: Array<{ name: string; pageId: string; created: boolean }>;
  theme?: unknown;
  diagnose?: unknown;
  stateFile?: string;
}

export async function applySpec(specOrFile: string | ReportSpec, opts: { dryRun?: boolean; statePath?: string } = {}): Promise<ApplyResult> {
  const spec = typeof specOrFile === 'string' ? loadSpec(specOrFile) : specOrFile;
  const statePath = opts.statePath ?? (typeof specOrFile === 'string' ? specOrFile.replace(/\.json$/i, '') + '.state.json' : undefined);
  const { issues, components } = lintSpec(spec);
  const result: ApplyResult = { dryRun: !!opts.dryRun, lint: issues, actions: [], ...(statePath ? { stateFile: statePath } : {}) };
  if (issues.some((i) => i.severity === 'error')) {
    result.actions = components.map((c) => ({ key: c.key, action: 'skip' as const, error: 'lint con errores' }));
    return result;
  }
  const state: SpecState = statePath && existsSync(statePath) ? JSON.parse(readFileSync(statePath, 'utf8')) : { reportId: null, keys: {} };
  const page = opts.dryRun ? await getReportPage() : await editPage();
  const info = await evaluateOn(page, T, pageInfoScript);
  if (state.reportId && state.reportId !== info.internalReportId) {
    log(`El state ${statePath} es de otro informe (${state.reportId}); se ignora el mapeo de ids.`);
    state.keys = {};
  }
  state.reportId = info.internalReportId;

  // Backup before any change (like the Power BI modeling MCP's "always back up" rule):
  // a full export that can be used to compare or rebuild. backups/ is git-ignored.
  if (!opts.dryRun) {
    const dir = join(process.env.LS_BACKUP_DIR ?? join(process.cwd(), 'backups'));
    mkdirSync(dir, { recursive: true });
    const file = join(dir, `${info.internalReportId}-${new Date().toISOString().replace(/[:.]/g, '-')}.json`);
    writeFileSync(file, JSON.stringify(await evaluateOn(page, T, exportReportScript), null, 2));
    (result as ApplyResult & { backup?: string }).backup = file;
  }

  // theme + pages by name (created if missing)
  if (spec.theme && !opts.dryRun) result.theme = await applyTheme(spec.theme);
  else if (spec.themePreset && !opts.dryRun) result.theme = await useThemePreset(spec.themePreset);
  const pageIds: Record<string, string> = {};
  const wanted = [...new Set(components.map((c) => c.page).filter((p) => p.startsWith('name:')))].map((p) => p.slice(5));
  if (wanted.length) {
    let pages = await listPages();
    result.pages = [];
    for (const name of wanted) {
      let hit = pages.find((p) => p.name === name);
      let created = false;
      if (!hit && !opts.dryRun) {
        await addPage(name);
        await reloadReport();
        pages = await listPages();
        hit = pages.find((p) => p.name === name);
        created = true;
      }
      if (hit) pageIds[`name:${name}`] = hit.id;
      result.pages.push({ name, pageId: hit?.id ?? '(nueva)', created });
    }
  }

  for (const c of components) {
    const pageId = c.page === 'active' ? undefined : c.page.startsWith('name:') ? pageIds[c.page] : c.page;
    const existingId = c.id ?? state.keys[c.key];
    const exists = existingId ? await evaluateOn(page, T, componentExistsScript, existingId) : false;
    if (opts.dryRun) {
      result.actions.push({ key: c.key, action: exists ? 'update' : 'create', ...(exists ? { componentId: existingId } : {}) });
      continue;
    }
    try {
      if (exists) {
        await updateExisting(page, existingId!, c);
        state.keys[c.key] = existingId!;
        const extra = await patchIfNeeded(page, existingId!, c);
        result.actions.push({ key: c.key, action: 'update', componentId: existingId!, ...(extra.length ? { warnings: extra } : {}) });
      } else {
        const r = await createComponent({
          ...(c.variant ? { variant: c.variant } : {}),
          type: c.type, box: { x: c.x, y: c.y, width: c.w, height: c.h },
          ...(pageId ? { pageId } : {}), ...(c.dataset ? { dataset: c.dataset } : {}),
          dimensions: c.dimensions, metrics: c.metrics, ...(c.padding !== undefined ? { padding: c.padding } : {}),
          ...(c.slots ? { slots: c.slots } : {}),
        });
        state.keys[c.key] = r.componentId!;
        const extra = await patchIfNeeded(page, r.componentId!, c);
        result.actions.push({ key: c.key, action: 'create', componentId: r.componentId!, warnings: [...r.warnings, ...extra] });
      }
    } catch (e) {
      result.actions.push({ key: c.key, action: exists ? 'update' : 'create', error: (e as Error).message });
    }
    if (statePath) writeFileSync(statePath, JSON.stringify(state, null, 2));
  }
  // page-level and component-level filters (idempotent: reused by name)
  if (!opts.dryRun) {
    const filterLog: Array<{ name: string; target: string; filterId?: string; error?: string }> = [];
    for (const p of spec.pages) {
      const pid = p.page && p.page !== 'active' ? p.page : p.name ? pageIds[`name:${p.name}`] : info.activePageId ?? undefined;
      for (const f of p.filters ?? []) {
        try { const r = await addFilter(f, pid ?? undefined); filterLog.push({ name: f.name, target: `page:${pid}`, filterId: r.filterId }); }
        catch (e) { filterLog.push({ name: f.name, target: `page:${pid}`, error: (e as Error).message }); }
      }
    }
    for (const c of components) {
      const id = state.keys[c.key];
      for (const f of c.filters ?? []) {
        if (!id) continue;
        try { const r = await addFilter(f, id); filterLog.push({ name: f.name, target: id, filterId: r.filterId }); }
        catch (e) { filterLog.push({ name: f.name, target: id, error: (e as Error).message }); }
      }
    }
    if (filterLog.length) (result as ApplyResult & { filters?: unknown }).filters = filterLog;
    await reloadReport();
    result.diagnose = await diagnoseWithKnowledge();
  }
  return result;
}

async function patchIfNeeded(page: Page, id: string, c: ResolvedComponent): Promise<string[]> {
  const changes: string[] = [];
  if (c.dateRangeDays !== undefined || c.stripStyles) {
    const r = await evaluateOn(page, T, patchComponentScript, {
      componentId: id,
      ...(c.dateRangeDays !== undefined ? { dateRangeDays: c.dateRangeDays } : {}),
      ...(c.stripStyles ? { stripThemeStyles: true } : {}),
    });
    if (!r.ok) throw new Error(r.error);
    changes.push(...r.changes);
  }
  if (c.text !== undefined) {
    const t = typeof c.text === 'string' ? { text: c.text } : c.text;
    const { setText } = await import('./ops4.js');
    await setText(id, t.text, { ...(t.size ? { size: t.size } : {}), ...(t.bold ? { bold: true } : {}), ...(t.color ? { color: t.color } : {}) });
    changes.push('text');
  }
  if (c.style) {
    const { setStyle } = await import('./ops4.js');
    await setStyle(id, c.style);
    changes.push('style');
  }
  if (c.parameter) {
    const { setControlParameter } = await import('./ops4.js');
    await setControlParameter(id, c.parameter);
    changes.push(`parameter:${c.parameter}`);
  }
  return changes;
}

export async function patchComponent(args: { componentId: string; dateRangeDays?: number; stripThemeStyles?: boolean }) {
  const page = await editPage();
  const r = await evaluateOn(page, T, patchComponentScript, args);
  if (!r.ok) throw new Error(r.error);
  return r;
}

async function updateExisting(page: Page, id: string, c: ResolvedComponent): Promise<void> {
  await evaluateOn(page, T, applyBoxModelScript, {
    componentId: id,
    position: { x: c.x, y: c.y },
    dimensions: { width: c.w, height: c.h },
    ...(c.padding !== undefined ? { padding: { top: c.padding, right: c.padding, bottom: c.padding, left: c.padding } } : {}),
  });
  if (c.dimensions.length || c.metrics.length || c.slots) {
    const r = await evaluateOn(page, T + 10_000, bindFieldsScript, {
      componentId: id, dimensions: c.dimensions, metrics: c.metrics,
      ...(['gauge-viz', 'bulletchart', 'kpi-metric'].includes(c.type) && !c.dimensions.length ? { clearDimensions: true } : {}),
      ...(c.slots ? { slots: c.slots } : {}),
    });
    if (!r.ok) throw new Error(r.error);
  }
}

export { lintSpec, loadSpec, summary };

// ---------------------------------------------------------------------------
// orphans: components that no spec state file references
// ---------------------------------------------------------------------------

/** Components on the report that none of the specs' <spec>.state.json files reference (leftovers, manual additions). */
export async function findOrphans(specFiles: string[]) {
  const known = new Set<string>();
  for (const f of specFiles) {
    const st = f.replace(/\.json$/i, '') + '.state.json';
    if (existsSync(st)) for (const id of Object.values((JSON.parse(readFileSync(st, 'utf8')) as { keys: Record<string, string> }).keys)) known.add(id);
  }
  const ex = await exportReport();
  return ex.pages.flatMap((p) =>
    (p.components as Array<{ id: string; attribute: { left: number; top: number; width: number; height: number }; config: { display: { type: string } } }>)
      .filter((c) => !known.has(c.id))
      .map((c) => ({ page: p.name || p.id, id: c.id, type: c.config.display.type, box: [c.attribute.left, c.attribute.top, c.attribute.width, c.attribute.height] })),
  );
}
