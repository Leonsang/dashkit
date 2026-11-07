/**
 * Operations v3: pages, themes, template synthesis and UX audit.
 * Shared by CLI and MCP; every outcome feeds knowledge/.
 */
import type { Page } from 'puppeteer-core';
import { evaluateOn, getReportPage } from './browser.js';
import { learn, listTemplates, saveTemplate } from './knowledge.js';
import { requireEditMode } from './looker/report.js';
import { bindFieldsScript, diagnoseReportScript, readComponentConfigScript, readDataSourcesScript } from './looker/scripts.js';
import { deleteComponentScript } from './looker/scripts2.js';
import { navDispatchScript, navPagesScript } from './looker/scripts4.js';
import {
  addFilterScript,
  reportSettingsScript,
  addPageScript,
  attachFilterScript,
  updateFilterScript,
  listFiltersScript,
  setThemePresetScript,
  applyThemeScript,
  listPagesScript,
  readThemeScript,
  renamePageScript,
  synthesizeComponentScript,
  uxFactsScript,
} from './looker/scripts3.js';
import { reloadReport, resolveDataset } from './ops.js';
import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { auditUx, fromThemeContent, toThemeContent, type FriendlyTheme, type UxFacts } from './theme.js';
import { packageRoot } from './paths.js';

const T = Number(process.env.LS_EVAL_TIMEOUT_MS ?? 15_000);
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function watchSaves(page: Page) {
  const statuses: number[] = [];
  const on = (r: { url(): string; status(): number }) => {
    if (/\/(updatePage|updateReport|createPages)\b/.test(r.url())) statuses.push(r.status());
  };
  page.on('response', on);
  return { statuses, stop: () => page.off('response', on) };
}

// ---- theme ---------------------------------------------------------------------

export async function readTheme() {
  const page = await getReportPage();
  const r = await evaluateOn(page, T, readThemeScript);
  return { themeConfig: r.themeConfig, customThemes: r.themes, theme: fromThemeContent(r.custom as Record<string, unknown> | null), raw: r.custom };
}

export async function applyTheme(theme: FriendlyTheme) {
  const { page } = await requireEditMode();
  const cur = await evaluateOn(page, T, readThemeScript);
  const content = toThemeContent(theme, (cur.custom as Record<string, any> | null) ?? undefined);
  const w = watchSaves(page);
  const r = await evaluateOn(page, T, applyThemeScript, content);
  await sleep(2500);
  w.stop();
  if (!r.ok) throw new Error(r.error);
  if (w.statuses.some((s) => s >= 400)) {
    learn('save_rejected', 'theme', { statuses: w.statuses });
    await reloadReport();
    throw new Error(`El guardado del tema fue rechazado (${w.statuses.join(',')}); se recargo el informe.`);
  }
  learn('note', 'theme_applied', { text: r.created ? 'theme resource created' : 'theme resource updated' });
  return { ...r, saves: w.statuses };
}

// ---- theme presets / library -----------------------------------------------------

/** Preset ids found in the editor bundle (2026-11-03). Spanish names from the "Tema y diseno" panel. */
export const THEME_PRESETS: Record<string, string> = {
  't-default-modern': 'Predeterminado (moderno)', 't-default': 'Predeterminado', 't-edge': 'Edge', 't-constellation': 'Constelacion',
  't-groovy': 'Groovy', 't-insight': 'Insight', 't-ocean': 'Oceano', 't-harvest': 'Cosecha', 't-eucalyptus': 'Eucalipto', 't-pop': 'Pop',
  't-fog': 'Niebla', 't-lagoon': 'Laguna', 't-executive': 'Ejecutivo', 't-woodsy': 'Bosque', 't-royalty': 'Realeza', 't-sienna': 'Siena',
  't-material': 'Material', 't-muted': 'Apagado', 't-primary': 'Primario', 't-cut-out': 'Recorte', 't-shift': 'Shift',
  't-energetic': 'Energetico', 't-forest': 'Selva', 't-magazine': 'Revista', 't-tunnel': 'Tunel', 't-quartz': 'Cuarzo', 't-onyx': 'Onix',
};
const LIBRARY = join(packageRoot(), 'themes', 'library');

export function themeLibrary() {
  const own = existsSync(LIBRARY)
    ? readdirSync(LIBRARY).filter((f) => f.endsWith('.json')).map((f) => ({ name: f.replace(/\.json$/, ''), file: join(LIBRARY, f) }))
    : [];
  return { presets: Object.entries(THEME_PRESETS).map(([id, name]) => ({ id, name })), library: own };
}

export async function useThemePreset(idOrName: string) {
  const { page } = await requireEditMode();
  const lib = themeLibrary().library.find((t) => t.name === idOrName);
  if (lib) return applyTheme(JSON.parse(readFileSync(lib.file, 'utf8')));
  const id = THEME_PRESETS[idOrName] ? idOrName : Object.entries(THEME_PRESETS).find(([, n]) => n.toLowerCase() === idOrName.toLowerCase())?.[0];
  if (!id) throw new Error(`Tema "${idOrName}" no encontrado. Usa theme presets para ver los disponibles.`);
  const w = watchSaves(page);
  const r = await evaluateOn(page, T, setThemePresetScript, id);
  await sleep(2500);
  w.stop();
  if (!r.ok) throw new Error(r.error);
  learn('note', 'theme_preset', { text: id });
  return { ok: true, themeConfig: id, saves: w.statuses };
}

export async function exportTheme(file: string) {
  const t = await readTheme();
  if (!t.raw) throw new Error(`El informe usa el tema predefinido "${t.themeConfig}": no hay colores que exportar (aplica uno personalizado o importa de la biblioteca).`);
  writeFileSync(file, JSON.stringify({ friendly: t.theme, raw: t.raw }, null, 2));
  return { file, theme: t.theme };
}

export async function importTheme(file: string) {
  const j = JSON.parse(readFileSync(file, 'utf8'));
  // accepts {friendly, raw} (export), or a friendly theme object
  return applyTheme((j.friendly ?? j) as FriendlyTheme);
}

// ---- filters -----------------------------------------------------------------------

export interface FilterSpec {
  name: string;
  field: string;
  /** EQ, CONTAINS, STARTS_WITH, RM (regex), RP (regex parcial), IN, NU (nulo), GT, GE, LT, LE, BETWEEN */
  op?: string;
  values?: Array<string | number>;
  include?: boolean;
  dataset?: string;
}

export async function listFilters() {
  return evaluateOn(await getReportPage(), T, listFiltersScript);
}

export async function addFilter(f: FilterSpec, target?: string) {
  const { page } = await requireEditMode();
  const existing = (await evaluateOn(page, T, listFiltersScript)).find((x) => x.name === f.name);
  let filterId = existing?.id ?? null;
  if (!filterId) {
    const datasetId = (await resolveDataset(page, f.dataset ?? `@${f.field}`))!;
    const r = await evaluateOn(page, T, addFilterScript, {
      name: f.name, datasetId, field: f.field, condition: (f.op ?? 'EQ').toUpperCase(), values: f.values ?? [], include: f.include ?? true,
    });
    if (!r.ok) throw new Error(r.error ?? 'No se pudo crear el filtro.');
    filterId = r.filterId!;
    await sleep(1500);
  }
  let attached: string[] | undefined;
  if (target) {
    const w = watchSaves(page);
    const a = await evaluateOn(page, T, attachFilterScript, { filterId, target });
    await sleep(2500);
    w.stop();
    if (!a.ok) throw new Error(a.error);
    if (w.statuses.some((s) => s >= 400)) {
      learn('save_rejected', 'filter', { statuses: w.statuses });
      throw new Error(`Aplicar el filtro fue rechazado (${w.statuses.join(',')}).`);
    }
    attached = a.filters;
  }
  learn('create_ok', 'filter', { source: existing ? 'reused' : 'addResource' });
  return { filterId, reused: !!existing, ...(attached ? { target, filters: attached } : {}) };
}

export async function updateFilter(f: { filterId: string; name?: string; op?: string; values?: Array<string | number>; include?: boolean }) {
  const { page } = await requireEditMode();
  const w = watchSaves(page);
  const r = await evaluateOn(page, T, updateFilterScript, {
    filterId: f.filterId,
    ...(f.name !== undefined ? { name: f.name } : {}),
    ...(f.op !== undefined ? { condition: f.op.toUpperCase() } : {}),
    ...(f.values !== undefined ? { values: f.values } : {}),
    ...(f.include !== undefined ? { include: f.include } : {}),
  });
  await sleep(2500);
  w.stop();
  if (!r.ok) throw new Error(r.error);
  if (w.statuses.some((s) => s >= 400)) {
    learn('save_rejected', 'filter_update', { statuses: w.statuses });
    throw new Error(`El cambio del filtro fue rechazado (${w.statuses.join(',')}).`);
  }
  return { filterId: f.filterId, ...r.filter };
}

export async function detachFilter(filterId: string, target: string) {
  const { page } = await requireEditMode();
  const a = await evaluateOn(page, T, attachFilterScript, { filterId, target, detach: true });
  if (!a.ok) throw new Error(a.error);
  await sleep(2000);
  return a;
}

// ---- report settings ------------------------------------------------------------------

export async function reportSettings(patch?: Record<string, unknown>) {
  if (!patch || !Object.keys(patch).length) return evaluateOn(await getReportPage(), T, reportSettingsScript, null);
  const { page } = await requireEditMode();
  const w = watchSaves(page);
  const r = await evaluateOn(page, T, reportSettingsScript, patch);
  await sleep(2500);
  w.stop();
  if (!r.ok) throw new Error(r.error);
  if (w.statuses.some((s) => s >= 400)) throw new Error(`Guardado rechazado (${w.statuses.join(',')}).`);
  return { ...r, saves: w.statuses };
}


// ---- pages ---------------------------------------------------------------------

/** Pages in the order and with the names viewers see (report navigation); modelName is the editor's internal name. */
export async function listPages() {
  const page = await getReportPage();
  const nav = await evaluateOn(page, T, navPagesScript).catch(() => []);
  if (!nav.length) return evaluateOn(page, T, listPagesScript);
  return nav.map((p) => ({ id: p.pageId, name: p.displayName || p.modelName, modelName: p.modelName, components: p.components, index: p.index,
    ...(p.hiddenFromNav ? { hiddenFromNav: true } : {}), ...(p.hiddenFromViewer ? { hiddenFromViewer: true } : {}) }));
}

export async function addPage(name: string) {
  const { page } = await requireEditMode();
  // The editor inserts the new page right after the CURRENT one, not at the end
  // (verified 2026-11-04), so the new page is the id that was not there before.
  const idsBefore = new Set((await evaluateOn(page, T, listPagesScript)).map((p) => p.id));
  const w = watchSaves(page);
  // A narrow window folds the toolbar and hides "Anadir pagina": widen the viewport meanwhile.
  await page.bringToFront();
  await page.setViewport({ width: 1900, height: 1100 });
  await sleep(800);
  let r = await evaluateOn(page, T, addPageScript);
  if (!r.ok) {
    // Fallback: menu "Pagina" > "Nueva pagina" (the toolbar button is not always rendered).
    const opened = await page.evaluate(() => {
      const b = Array.from(document.querySelectorAll('button')).find((x) => /^(P[aá]gina|Page)$/.test(((x as HTMLElement).innerText || '').trim()));
      if (b) (b as HTMLElement).click();
      return !!b;
    });
    await sleep(800);
    const clicked = opened && (await page.evaluate(() => {
      const it = Array.from(document.querySelectorAll('[role=menuitem],button')).find((x) => /Nueva p[aá]gina|New page/i.test((x as HTMLElement).innerText || ''));
      if (it) (it as HTMLElement).click();
      return !!it;
    }));
    if (clicked) r = { ...r, ok: true };
  }
  await sleep(500);
  await page.setViewport(null as never).catch(() => undefined);
  if (!r.ok) {
    w.stop();
    learn('method_missing', 'toolbar:add-page', { error: r.error });
    throw new Error(r.error);
  }
  let pages = await evaluateOn(page, T, listPagesScript);
  for (let i = 0; i < 20 && pages.length <= r.before; i++) {
    await sleep(500);
    pages = await evaluateOn(page, T, listPagesScript);
  }
  const createdIndex = pages.findIndex((p) => !idsBefore.has(p.id));
  const created = createdIndex >= 0 ? pages[createdIndex] : undefined;
  if (!created || pages.length <= r.before) {
    w.stop();
    throw new Error('La pagina no aparecio tras pulsar "Anadir pagina".');
  }
  await sleep(1500);
  const rn = await evaluateOn(page, T, renamePageScript, { pageId: created.id, name });
  await sleep(2000);
  w.stop();
  if (!rn.ok) throw new Error(rn.error);
  const nd = await evaluateOn(page, T + 5000, navDispatchScript, { type: 'UPDATE NAV ITEM NAME', payload: { itemId: created.id, displayName: name } });
  if (!nd.ok) learn('note', 'rename_page_nav_failed', { text: String(nd.error).slice(0, 200) });
  const nav = await evaluateOn(page, T, navPagesScript);
  learn('create_ok', 'page', { source: 'toolbar+rename' });
  return { ok: true, pageId: created.id, index: nav.findIndex((p) => p.pageId === created.id), name, url: page.url(), saves: w.statuses };
}

export async function renamePage(pageId: string, name: string) {
  const { page } = await requireEditMode();
  const r = await evaluateOn(page, T, renamePageScript, { pageId, name });
  if (!r.ok) throw new Error(r.error);
  await sleep(1500);
  // model name (above) + the name viewers see, which lives in the report navigation and is saved
  // by its own effect (/updateReportNavigationInfo) when this action is dispatched (verified 2026-11-06).
  // The earlier "Gestionar paginas > Cambiar nombre" UI flow picked the page by the model's index,
  // which differs from the navigation order once pages are moved.
  const d = await evaluateOn(page, T + 5000, navDispatchScript, { type: 'UPDATE NAV ITEM NAME', payload: { itemId: pageId, displayName: name } });
  if (!d.ok) throw new Error(d.error);
  const nav = await evaluateOn(page, T, navPagesScript);
  return { ...r, navigation: nav.map((p) => p.displayName) };
}

// ---- template synthesis ------------------------------------------------------------

/** Field roles per display type, used to bind a valid minimal config before the first save. */
const RECIPES: Record<string, { dims: Array<'text' | 'date' | 'number' | 'geo'>; metrics: number }> = {
  'simple-treemap': { dims: ['text', 'text'], metrics: 1 },
  'pivot-table': { dims: ['text'], metrics: 1 },
  'simple-scatterchart': { dims: ['text'], metrics: 2 },
  bulletchart: { dims: [], metrics: 1 },
  'gauge-viz': { dims: [], metrics: 1 },
  'simple-combochart': { dims: ['date'], metrics: 2 },
  'simple-areachart': { dims: ['date'], metrics: 1 },
  'simple-sankey': { dims: ['text', 'text'], metrics: 1 },
  'simple-funnel': { dims: ['text'], metrics: 1 },
  'simple-waterfall': { dims: ['text'], metrics: 1 },
  'simple-histogram': { dims: ['number'], metrics: 1 },
  'google-map': { dims: ['geo'], metrics: 1 },
  'simple-barchart': { dims: ['text'], metrics: 1 },
  'simple-linechart': { dims: ['date'], metrics: 1 },
  'simple-piechart': { dims: ['text'], metrics: 1 },
  'simple-geomap': { dims: ['geo'], metrics: 1 },
  'simple-table': { dims: ['text'], metrics: 1 },
};

export async function synthesizeTemplates(types: string[], opts: { pageId?: string } = {}) {
  const { page } = await requireEditMode();
  const known = new Set(listTemplates().map((t) => t.type));
  const ds = await evaluateOn(page, T, readDataSourcesScript);
  const results: Array<{ type: string; ok: boolean; status?: number[]; error?: string; skipped?: string }> = [];
  for (const type of types) {
    if (known.has(type)) {
      results.push({ type, ok: true, skipped: 'ya hay plantilla' });
      continue;
    }
    const s = await evaluateOn(page, T, synthesizeComponentScript, { type, box: { x: 20, y: 20, width: 400, height: 300 }, ...(opts.pageId ? { pageId: opts.pageId } : {}) });
    if (!s.ok) {
      learn('create_fail', type, { source: 'synth', error: s.error });
      results.push({ type, ok: false, error: s.error });
      continue;
    }
    const id = s.componentId!;
    const dsId = await evaluateOn(page, T, readComponentConfigScript, id).then((r: any) => r.config?.config?.datasource?.keys?.dataset?.value?.id);
    const src = ds.dataSources.find((d) => d.dataSourceId === dsId) ?? ds.dataSources.find((d) => d.fields.length);
    const fields = src?.fields ?? [];
    const BAD = /(^|_)id(_|$)|url|imagen|image|comentario|lat_long/i;
    const used = new Set<string>();
    const pick = (role: string) => {
      const f = fields.find((x) => !used.has(x.id) && !BAD.test(x.name) && (
        role === 'date' ? x.dataType === 'DATE' :
        role === 'number' ? x.dataType === 'NUMBER' :
        role === 'geo' ? /pais|country|codigo_pais|ciudad|city|region/i.test(x.name) :
        x.dataType === 'TEXT'));
      if (f) used.add(f.id);
      return f;
    };
    const metricRef = () => { const f = pick('number'); return f ? (f.type === 'METRIC' ? f.name : `SUM(${f.name})`) : undefined; };
    // Field slots: from the type's own getDataFieldConfigs (learned at runtime), else the static recipe.
    const fcs = s.fieldConfigs ?? [];
    const recipe = RECIPES[type];
    let dims: string[] = [], metrics: string[] = [];
    const slots: Record<string, string[]> = {};
    if (fcs.length) {
      for (const fc of fcs.filter((f) => f.min >= 1 || f.slot === 'primary')) {
        const n = Math.max(fc.min, fc.count, fc.slot === 'primary' ? 1 : 0);
        const refs: string[] = [];
        for (let i = 0; i < n; i++) {
          const role = fc.kind === 'metric' ? 'metric' : fc.supportedTypes?.includes(1) || (recipe?.dims[i] === 'date') ? 'date' : recipe?.dims[i] === 'geo' ? 'geo' : recipe?.dims[i] === 'number' ? 'number' : 'text';
          const r = role === 'metric' ? metricRef() : pick(role)?.name;
          if (r) refs.push(r);
        }
        if (fc.slot === 'primary') (fc.kind === 'dimension' ? dims : metrics).push(...refs);
        else if (refs.length) slots[fc.slot] = refs;
      }
      learn('note', `fields:${type}`, { text: JSON.stringify(fcs.map((f) => `${f.slot}:${f.kind}:${f.min}`)) });
    } else if (recipe) {
      dims = recipe.dims.map((r) => pick(r)?.name).filter(Boolean) as string[];
      metrics = Array.from({ length: recipe.metrics }, metricRef).filter(Boolean) as string[];
    } else {
      results.push({ type, ok: false, error: 'sin configuracion de campos para este tipo' });
      continue;
    }
    const w = watchSaves(page);
    const b = await evaluateOn(page, T + 10_000, bindFieldsScript, { componentId: id, dimensions: dims, metrics, clearDimensions: !dims.length, ...(Object.keys(slots).length ? { slots } : {}) });
    await sleep(2500);
    w.stop();
    if (!b.ok || w.statuses.some((x) => x >= 400)) {
      learn('save_rejected', type, { source: 'synth', statuses: w.statuses, error: b.error });
      results.push({ type, ok: false, status: w.statuses, error: b.error ?? 'updatePage rechazado' });
      await reloadReport();
      continue;
    }
    const cfg = await evaluateOn(page, T, readComponentConfigScript, id);
    if (cfg.ok) saveTemplate(type, cfg.config, { source: 'synthesized', fields: { dims, metrics } });
    learn('create_ok', type, { source: 'synth' });
    // remove the scaffold component
    await evaluateOn(page, T, deleteComponentScript, id);
    await sleep(1500);
    results.push({ type, ok: true, status: w.statuses });
  }
  return { results, templates: listTemplates().map((t) => t.type) };
}

// ---- template seeding from the editor's own insert menu ---------------------------

/**
 * Inserts each menu option (aria-label of PRESET-PREVIEW, e.g. "Tabla dinamica con mapa de calor")
 * with a real click on the canvas, captures the config the editor generated, saves it as template
 * (`<type>` if new, plus `<type>@<option>`) and deletes the component. No screenshots involved.
 */
export async function seedTemplatesFromUi(labels: string[]) {
  const { page } = await requireEditMode();
  const results: Array<{ label: string; ok: boolean; type?: string; error?: string }> = [];
  await page.bringToFront();
  await page.setViewport({ width: 1900, height: 1100 });
  await sleep(1000);
  try {
    for (const label of labels) {
      const before = new Set<string>(await page.evaluate(() =>
        (window as any).angular.element(document.body).injector().get('legoUndoRedoService').report.pages.flatMap((p: any) => p.components.map((c: any) => c.getId()))));
      // "control:<texto>" -> menu "Anadir un control" (items are buttons matched by text);
      // otherwise -> menu "Anadir un grafico" (PRESET-PREVIEW matched by aria-label).
      const isControl = label.startsWith('control:');
      const item = isControl ? label.slice(8) : label;
      const opened = await page.evaluate((ctl) => {
        const sel = ctl
          ? 'button[aria-label="Añadir un control"], button[aria-label="Add a control"]'
          : 'button[aria-label="Añadir un gráfico"], button[aria-label="Add a chart"]';
        const b = document.querySelector(sel) as HTMLElement | null;
        if (b) b.click();
        return !!b;
      }, isControl);
      await sleep(900);
      const picked = opened && (await page.evaluate((l, ctl) => {
        const panes = Array.from(document.querySelectorAll('.cdk-overlay-pane'));
        const pane = panes[panes.length - 1] || document;
        const cands = Array.from(pane.querySelectorAll(ctl ? 'button,[role=menuitem]' : 'preset-preview,[role=menuitem]'));
        const el = cands.find((e) => (ctl ? ((e as HTMLElement).innerText || '').replace(/\s+/g, ' ').trim() === l : e.getAttribute('aria-label') === l)) as HTMLElement | undefined;
        if (el) el.click();
        return !!el;
      }, item, isControl));
      if (!picked) {
        await page.keyboard.press('Escape');
        results.push({ label, ok: false, error: opened ? 'opcion no encontrada en el menu' : 'boton "Anadir un grafico" no encontrado' });
        learn('method_missing', `insert-menu:${label}`);
        continue;
      }
      await sleep(500);
      const box = await page.evaluate(() => {
        const c = document.querySelector('.ng2-canvas-container');
        const r = c ? c.getBoundingClientRect() : null;
        return r ? { x: r.x, y: r.y } : null;
      });
      if (!box) {
        results.push({ label, ok: false, error: 'lienzo no encontrado' });
        continue;
      }
      await page.mouse.click(box.x + 80, box.y + 80);
      await sleep(2500);
      const added = await page.evaluate((prev: string[]) => {
        const rep = (window as any).angular.element(document.body).injector().get('legoUndoRedoService').report;
        const all = rep.pages.flatMap((p: any) => p.components);
        const c = all.find((x: any) => !prev.includes(x.getId()));
        return c ? { id: String(c.getId()), type: String(c.config.config.display.type), config: JSON.parse(JSON.stringify(c.config)) } : null;
      }, [...before]);
      if (!added) {
        // Some options do not add a canvas component (e.g. the report-level viewer filter bar).
        await page.keyboard.press('Escape').catch(() => undefined);
        results.push({ label, ok: false, error: 'no se creo ningun componente en el lienzo (puede ser un elemento de informe)' });
        continue;
      }
      const slug = item.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      saveTemplate(added.type, added.config, { source: isControl ? 'control-menu' : 'insert-menu', label: item });
      saveTemplate(`${added.type}@${slug}`, added.config, { source: isControl ? 'control-menu' : 'insert-menu', label: item });
      learn('create_ok', added.type, { source: 'insert-menu' });
      await evaluateOn(page, T, deleteComponentScript, added.id);
      await sleep(1500);
      results.push({ label, ok: true, type: added.type });
    }
  } finally {
    await page.setViewport(null as never).catch(() => undefined);
  }
  return { results, templates: listTemplates().map((t) => t.type) };
}

// ---- UX audit ------------------------------------------------------------------

export async function uxAudit() {
  const page = await getReportPage();
  const facts = (await evaluateOn(page, T, uxFactsScript)) as UxFacts;
  const diag = await evaluateOn(page, T, diagnoseReportScript);
  return auditUx(facts, diag.issues);
}

// ---- data source fields ---------------------------------------------------------

/**
 * Adds a calculated field to a data source, through the editor's own UI (Datos >
 * Anadir un campo > Anadir campo calculado), because a source-level field is the
 * only kind other charts can filter on: checkbox controls and preset filter
 * buttons need a BOOLEAN one (reason 116), and a chart-level formula, while it
 * clears the error, filters nothing (verified by CDP 2026-11-04).
 *
 * An embedded source ("Insertada") belongs to this report alone. A reusable one is
 * shared with every report that uses it, so it is refused unless allowShared.
 */
export async function addSourceField(opts: { name: string; formula: string; source?: string; allowShared?: boolean }) {
  const { page } = await requireEditMode();
  await page.bringToFront();
  await page.setViewport({ width: 1900, height: 1100 });
  await sleep(1000);
  const clickText = async (selector: string, re: RegExp) => {
    const box = await page.evaluate((sel: string, src: string, flags: string) => {
      const rx = new RegExp(src, flags);
      const el = Array.from(document.querySelectorAll(sel)).find((e) => (e as HTMLElement).offsetParent && rx.test(((e as HTMLElement).innerText || '').trim())) as HTMLElement | undefined;
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
    }, selector, re.source, re.flags);
    if (!box) return false;
    await page.mouse.click(box.x, box.y);
    return true;
  };
  const editorSource = () => page.evaluate(() => {
    const leaves = Array.from(document.querySelectorAll('*')).filter((e) => (e as HTMLElement).offsetParent && e.children.length === 0) as HTMLElement[];
    // The field editor's header bar: "<source name>   Ambito: [Insertada]   Credenciales ...".
    const label = leaves.find((e) => /^(Ámbito|Ambito|Scope):?$/.test((e.innerText || '').trim()));
    let row: HTMLElement | null = label ? label.parentElement : null;
    while (row && row.parentElement && (row.innerText || '').length < 30) row = row.parentElement;
    const rowLeaves = row ? leaves.filter((e) => row!.contains(e)) : [];
    const name = rowLeaves.length ? (rowLeaves[0]!.innerText || '').trim() : '';
    // The scope chip carries an icon whose ligature text sticks to the word ("linkInsertada"): no word boundary before it.
    const word = /(Insertada|Embedded|Reutilizable|Reusable)\b/;
    const hit = (row ? [row] : []).concat(Array.from(document.querySelectorAll('*')) as HTMLElement[])
      .map((e) => ((e as HTMLElement).offsetParent ? (e as HTMLElement).innerText || '' : ''))
      .find((t) => t.length < 40 && word.test(t)) || '';
    return { name: name.split('\n')[0]!, scope: hit ? hit.match(word)![1]! : '' };
  });
  const open = async () => {
    if (!(await clickText('button', /^(add_circle\s*)?(Añadir un campo|Add a field)$/))) {
      // The data panel lists a source's fields only with one of its charts selected: select one and retry.
      const { selectSourceChart } = await import('./ops4.js');
      await selectSourceChart(page, opts.source && opts.source.startsWith('@') ? opts.source : undefined);
      if (!(await clickText('button', /^(add_circle\s*)?(Añadir un campo|Add a field)$/))) throw new Error('No se encontro "Anadir un campo" en el panel Datos.');
    }
    await sleep(1200);
    if (!(await clickText('[role=menuitem], .mat-mdc-menu-item', /(Añadir campo calculado|Add calculated field)/))) throw new Error('No aparecio "Anadir campo calculado".');
    await sleep(2500);
  };
  const close = async () => { await clickText('button', /^(Hecho|Done)$/); await sleep(2000); };
  try {
    await open();
    // The scope chip renders a moment after the editor: an empty read made the first call fail as
    // "reusable (unknown scope)" (benchmark 2026-11-07). Read again until it shows.
    const readSource = async () => { let r = await editorSource(); for (let i = 0; i < 12 && !r.scope; i++) { await sleep(500); r = await editorSource(); } return r; };
    let src = await readSource();
    // With a single source in the report there is nothing to choose: a name is not looked up in the panel
    // (clicking the source's name there opens the data source editor and takes the tab off the report).
    const dsList = await evaluateOn(page, T, readDataSourcesScript).then((r) => (Array.isArray(r.dataSources) ? r.dataSources : Object.values(r.dataSources as Record<string, never>))).catch(() => [] as unknown[]);
    if (opts.source && !opts.source.startsWith('@') && dsList.length === 1) opts = { ...opts, source: undefined };
    // "@campo" picks the source through a chart of it (selected before opening); a name is matched in the panel.
    const byField = !!opts.source && opts.source.startsWith('@');
    if (byField) {
      const { selectSourceChart } = await import('./ops4.js');
      await clickText('button', /^(Cancelar|Cancel)$/);
      await close();
      await selectSourceChart(page, opts.source);
      await open();
      src = await readSource();
    }
    if (opts.source && !byField && !src.name.toLowerCase().includes(opts.source.toLowerCase())) {
      // The editor opened on another source: expand the requested one in the panel and retry once.
      await clickText('button', /^(Cancelar|Cancel)$/);
      await close();
      const escaped = opts.source.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      if (!(await clickText('*', new RegExp(escaped, 'i')))) throw new Error(`No hay un origen "${opts.source}" en el panel Datos.`);
      await sleep(1500);
      await open();
      src = await readSource();
      if (!src.name.toLowerCase().includes(opts.source.toLowerCase())) throw new Error(`El editor de campos abrio "${src.name}", no "${opts.source}".`);
    }
    if (!/^(Insertada|Embedded)$/.test(src.scope) && !opts.allowShared) {
      await clickText('button', /^(Cancelar|Cancel)$/);
      await close();
      throw new Error(src.scope
        ? `El origen es reutilizable (${src.scope}): el campo apareceria en todos los informes que lo usan. Repite con allowShared si es lo que quieres.`
        : 'No se pudo leer en el editor de campos si el origen es insertado o reutilizable: repite; si sabes que es insertado (p. ej. el de un CSV subido a este informe), anade allowShared.');
    }
    const fieldId = await page.evaluate((name: string, formula: string) => {
      // Only the field editor's inputs: once the source has a parameter, the properties panel shows
      // its value as another gmat input, and typing the name there overrides the parameter of the
      // selected chart (reason 67, seen 2026-11-06).
      const inputs = Array.from(document.querySelectorAll('input.gmat-mdc-input'))
        .filter((i) => (i as HTMLElement).offsetParent && !i.closest('[class*=propert]')) as HTMLInputElement[];
      const nameInput = inputs.find((i) => !/^calc_/.test(i.value));
      const idInput = inputs.find((i) => /^calc_/.test(i.value));
      if (!nameInput) return null;
      nameInput.focus();
      nameInput.value = name;
      nameInput.dispatchEvent(new Event('input', { bubbles: true }));
      nameInput.dispatchEvent(new Event('change', { bubbles: true }));
      const cm = (document.querySelector('.CodeMirror') as any)?.CodeMirror;
      if (!cm) return null;
      cm.setValue(formula);
      return idInput ? idInput.value : '';
    }, opts.name, opts.formula);
    if (fieldId === null) throw new Error('No se encontraron los campos Nombre/Formula del editor.');
    await sleep(2500);
    const saved = await clickText('button:not([disabled])', /^(Guardar|Save)$/);
    if (!saved) {
      const why = await page.evaluate(() => Array.from(document.querySelectorAll('[class*=error], [class*=invalid]')).filter((e) => (e as HTMLElement).offsetParent).map((e) => ((e as HTMLElement).innerText || '').trim()).filter(Boolean).join(' | ').slice(0, 300));
      await clickText('button', /^(Cancelar|Cancel)$/);
      await close();
      throw new Error(`La formula no es valida para el editor: ${why || 'Guardar sigue desactivado'}`);
    }
    await sleep(3500);
    await close();
    learn('create_ok', 'source-field', { source: 'data-panel' });
    // The panel's first text is not always the source's name (a field, e.g. "canal", came back in the
    // benchmark 2026-11-07): report the source that holds the new field, read from the model.
    let owner: { dataSourceId: string; name: string } | undefined;
    for (let i = 0; i < 6 && !owner && fieldId; i++) {
      const ds = await evaluateOn(page, T, readDataSourcesScript).catch(() => null);
      const list = ds ? (Array.isArray(ds.dataSources) ? ds.dataSources : Object.values(ds.dataSources as Record<string, never>)) : [];
      const hit = (list as Array<{ dataSourceId: string; name: string; fields: Array<{ id: string }> }>).find((d) => d.fields.some((f) => f.id === fieldId));
      if (hit) owner = { dataSourceId: hit.dataSourceId, name: hit.name };
      else await sleep(1000);
    }
    return { ok: true, fieldId, name: opts.name, formula: opts.formula, ...(owner ? { dataSourceId: owner.dataSourceId, ...(owner.name !== owner.dataSourceId ? { source: owner.name } : {}) } : {}), scope: src.scope };
  } finally {
    await page.setViewport(null as never).catch(() => undefined);
  }
}
