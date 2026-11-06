/**
 * Blends, parameters, page management and component layering (verified 2026-11-06 on Data Studio).
 *
 * - Blends are created the way the editor does it: select 2-5 charts and pick "Combinar datos"
 *   (Blend data) in their context menu. The editor builds the blend from the charts' sources and
 *   fields, joins on the dimensions they share, and adds a new chart on it. We create temporary
 *   charts with the requested fields, blend them, delete them, then name the blend, set its join
 *   type, and place and bind the new chart. See scripts4.ts for the resource shape.
 * - Parameters are created in the source's field editor ("Añadir un parámetro"), driven with real
 *   input events like add_source_field. In formulas a parameter is referred to by its display
 *   name ("Umbral de margen"), not its id.
 * - Page order, viewer names, hiding and deleting go through the report navigation actions.
 */
import type { Page } from 'puppeteer-core';
import { evaluateOn, getReportPage } from './browser.js';
import { learn } from './knowledge.js';
import { requireEditMode } from './looker/report.js';
import { bindFieldsToComponent } from './looker/data.js';
import { setComponentBoxModel } from './looker/boxModel.js';
import {
  arrangeScript,
  blendSnapshotScript,
  componentPointsScript,
  deleteBlendScript,
  listBlendsScript,
  menuItemPointScript,
  navDispatchScript,
  navPagesScript,
  selectedIdsScript,
  setControlParameterScript,
  setDisplayKeysScript,
  setTextScript,
  updateBlendScript,
  type BlendInfo,
} from './looker/scripts4.js';
import { createComponent, deleteComponent, openReport, reloadReport, resolveDataset } from './ops.js';

const T = Number(process.env.LS_EVAL_TIMEOUT_MS ?? 15_000);
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export const JOIN_TYPES: Record<string, number> = { inner: 1, full: 2, left: 3, right: 4, cross: 101 };

// ---------------------------------------------------------------------------
// real clicks
// ---------------------------------------------------------------------------

let lastClickTrace = '';

async function clickComponents(page: Page, ids: string[], opts: { button?: 'left' | 'right' } = {}): Promise<string[]> {
  await page.keyboard.press('Escape');
  await sleep(300);
  const pts = await evaluateOn(page, T, componentPointsScript, ids);
  if (pts.some((p) => !p)) throw new Error(`No se encontraron en el lienzo: ${ids.filter((_, i) => !pts[i]).join(', ')}`);
  const trace: string[] = [];
  for (let i = 0; i < pts.length; i++) {
    const p = pts[i]!;
    if (i > 0) await page.keyboard.down('Shift');
    await page.mouse.click(p.x, p.y);
    if (i > 0) await page.keyboard.up('Shift');
    await sleep(500);
    trace.push(`${p.id}@${Math.round(p.x)},${Math.round(p.y)}->[${(await evaluateOn(page, T, selectedIdsScript)).join(' ')}]`);
  }
  lastClickTrace = trace.join(' ');
  if (opts.button === 'right') {
    // A real right click's mousedown can collapse the multi-selection to the clicked chart, and with Shift
    // it toggles it off (seen 2026-11-06). Opening the menu with the contextmenu event alone keeps it.
    await sleep(1500);
    const last = pts[pts.length - 1]!;
    await page.evaluate((x: number, y: number) => {
      const el = document.elementFromPoint(x, y);
      el?.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true, cancelable: true, clientX: x, clientY: y, button: 2, buttons: 2, view: window }));
    }, last.x, last.y);
    await sleep(1300);
    trace.push(`right->[${(await evaluateOn(page, T, selectedIdsScript)).join(' ')}]`);
    lastClickTrace = trace.join(' ');
  }
  return evaluateOn(page, T, selectedIdsScript);
}

async function clickText(page: Page, re: RegExp, scope = '*'): Promise<boolean> {
  const box = await page.evaluate((sel: string, src: string, flags: string) => {
    const rx = new RegExp(src, flags);
    const els = Array.from(document.querySelectorAll(sel)).filter((e) => (e as HTMLElement).offsetParent && e.children.length <= 3 &&
      rx.test(((e as HTMLElement).innerText || '').trim())) as HTMLElement[];
    const el = els[els.length - 1];
    if (!el) return null;
    el.scrollIntoView({ block: 'center' });
    const r = el.getBoundingClientRect();
    return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
  }, scope, re.source, re.flags);
  if (!box) return false;
  await page.mouse.click(box.x, box.y);
  return true;
}

/**
 * Real clicks need a painted page. A window covered by another app counts as hidden on Windows
 * (document.hidden stays true after bringToFront, and clicks and screenshots hang; seen 2026-11-06):
 * minimizing and restoring it brings it forward.
 */
export async function ensureVisible(page: Page): Promise<void> {
  await page.bringToFront();
  if (!(await page.evaluate(() => document.hidden).catch(() => false))) return;
  const s = await page.target().createCDPSession();
  try {
    const { windowId } = await s.send('Browser.getWindowForTarget');
    await s.send('Browser.setWindowBounds', { windowId, bounds: { windowState: 'minimized' } });
    await sleep(600);
    await s.send('Browser.setWindowBounds', { windowId, bounds: { windowState: 'normal' } });
    await sleep(1200);
    await page.bringToFront();
  } finally {
    await s.detach().catch(() => undefined);
  }
  if (await page.evaluate(() => document.hidden).catch(() => false)) throw new Error('La ventana del navegador sigue oculta: ponla delante y repite.');
}

async function withViewport<T>(page: Page, fn: () => Promise<T>): Promise<T> {
  await ensureVisible(page);
  // Emulate a large viewport only when the real window is small: an emulated viewport taller than the
  // window puts the bottom of the side panels (e.g. "Añadir un parámetro") outside it, and clicks there
  // only hover (seen 2026-11-06 with a 1920x1080 screen).
  const real = await page.evaluate(() => ({ w: window.innerWidth, h: window.innerHeight }));
  const emulate = real.w < 1500 || real.h < 800;
  if (emulate) {
    await page.setViewport({ width: 1900, height: 1100 });
    await sleep(800);
  }
  try {
    return await fn();
  } finally {
    if (emulate) await page.setViewport(null as never).catch(() => undefined);
  }
}

// ---------------------------------------------------------------------------
// blends
// ---------------------------------------------------------------------------

export async function listBlends(): Promise<BlendInfo[]> {
  return evaluateOn(await getReportPage(), T, listBlendsScript);
}

export async function updateBlend(args: { blendId: string; name?: string; joinType?: string }) {
  const { page } = await requireEditMode();
  const jt = args.joinType ? JOIN_TYPES[args.joinType] : undefined;
  if (args.joinType && jt === undefined) throw new Error(`joinType no valido: ${args.joinType}. Usa ${Object.keys(JOIN_TYPES).join(', ')}.`);
  const r = await evaluateOn(page, T, updateBlendScript, { blendId: args.blendId, ...(args.name !== undefined ? { name: args.name } : {}), ...(jt !== undefined ? { joinType: jt } : {}) });
  if (!r.ok) throw new Error(r.error);
  await sleep(2500);
  return (await evaluateOn(page, T, listBlendsScript)).find((b) => b.blendId === args.blendId);
}

export async function deleteBlend(blendId: string) {
  const { page } = await requireEditMode();
  const r = await evaluateOn(page, T, deleteBlendScript, blendId);
  if (!r.ok) throw new Error(r.error);
  await sleep(2500);
  return { ok: true, blendId, remaining: (await evaluateOn(page, T, listBlendsScript)).map((b) => b.blendId) };
}

export interface BlendTable {
  /** Source id or "@field". */
  dataset: string;
  /** Dimensions: the ones with the same name in every table become the join keys. */
  dimensions: string[];
  metrics?: string[];
}

export async function createBlend(o: {
  tables: BlendTable[];
  box: { x: number; y: number; width: number; height: number };
  name?: string;
  joinType?: string;
  type?: string;
  pageId?: string;
  dimensions?: string[];
  metrics?: string[];
}) {
  if (o.tables.length < 2 || o.tables.length > 5) throw new Error('Un blend combina entre 2 y 5 tablas.');
  if (o.joinType && JOIN_TYPES[o.joinType] === undefined) throw new Error(`joinType no valido: ${o.joinType}. Usa ${Object.keys(JOIN_TYPES).join(', ')}.`);
  const { page } = await requireEditMode();
  const type = o.type ?? 'simple-table';
  const temps: string[] = [];
  return withViewport(page, async () => {
    try {
      const n = o.tables.length;
      const w = Math.max(120, Math.floor((o.box.width - (n - 1) * 10) / n));
      for (let i = 0; i < n; i++) {
        const t = o.tables[i]!;
        const r = await createComponent({
          type,
          box: { x: o.box.x + i * (w + 10), y: o.box.y, width: w, height: Math.max(120, o.box.height) },
          ...(o.pageId ? { pageId: o.pageId } : {}),
          dataset: t.dataset,
          dimensions: t.dimensions,
          metrics: t.metrics ?? [],
        });
        if (!r.componentId) throw new Error(`No se pudo crear la tabla temporal ${i + 1}.`);
        temps.push(r.componentId);
      }
      await reloadReport();
      const p = await getReportPage();
      const vp = await p.evaluate(() => ({ w: window.innerWidth, h: window.innerHeight }));
      if (vp.w < 1500 || vp.h < 800) await p.setViewport({ width: 1900, height: 1100 });
      await sleep(1500);
      const before = await evaluateOn(p, T, blendSnapshotScript);
      // Charts that are still loading right after the reload swallow the shift-click: retry with time to render.
      let selected: string[] = [];
      for (let attempt = 0; attempt < 3; attempt++) {
        await sleep(attempt ? 2500 : 1500);
        selected = await clickComponents(p, temps, { button: 'right' });
        if (temps.every((id) => selected.includes(id))) break;
      }
      if (temps.some((id) => !selected.includes(id))) throw new Error(`No se pudieron seleccionar los graficos temporales (seleccionados: ${selected.join(', ')}; clics: ${lastClickTrace}).`);
      const item = await evaluateOn(p, T, menuItemPointScript, ['Combinar datos', 'Blend data']);
      if (!item) throw new Error('El menu contextual no tiene "Combinar datos".');
      if (item.disabled) throw new Error('"Combinar datos" esta desactivado: hacen falta de 2 a 5 graficos sin combinar, de tipos que se puedan combinar.');
      await p.mouse.click(item.x, item.y);
      let after = before;
      for (let i = 0; i < 20; i++) {
        await sleep(700);
        after = await evaluateOn(p, T, blendSnapshotScript);
        if (after.blends.length > before.blends.length && after.blended.length > before.blended.length) break;
      }
      const blendId = after.blends.find((b) => !before.blends.includes(b));
      const componentId = after.blended.find((c) => !before.blended.includes(c));
      if (!blendId || !componentId) {
        learn('create_fail', 'blend', { error: 'no blend after menu' });
        throw new Error('El editor no creo la combinacion (si se abrio el editor de combinaciones, las tablas no comparten ninguna dimension para unirse).');
      }
      // An incomplete blend opens the blend editor: close it so it does not cover the canvas.
      await clickText(p, /^(close\s*)?(CERRAR|CLOSE)$/);
      for (const id of temps.splice(0)) await deleteComponent(id).catch(() => undefined);
      if (o.name || o.joinType) {
        const r = await evaluateOn(p, T, updateBlendScript, { blendId, ...(o.name ? { name: o.name } : {}), ...(o.joinType ? { joinType: JOIN_TYPES[o.joinType]! } : {}) });
        if (!r.ok) throw new Error(r.error);
        await sleep(2500);
      }
      await setComponentBoxModel({ componentId, position: { x: o.box.x, y: o.box.y }, dimensions: { width: o.box.width, height: o.box.height } });
      let bound: any;
      if (o.dimensions?.length || o.metrics?.length) {
        // The editor finishes setting up the blended chart asynchronously and can overwrite a binding made
        // too early with its own guess (seen 2026-11-06 on a combo chart): wait, bind, and bind again if a
        // reload shows the guess came back.
        await sleep(4000);
        bound = await bindFieldsToComponent({ componentId, dimensions: o.dimensions ?? [], metrics: o.metrics ?? [] });
        await sleep(3000);
        await reloadReport();
        const again = await bindFieldsToComponent({ componentId, dimensions: [], metrics: [] }).catch(() => null);
        const want = (bound?.dimensions?.length ?? 0) + (bound?.metrics?.length ?? 0);
        const have = (again?.dimensions?.length ?? 0) + (again?.metrics?.length ?? 0);
        if (!again || have !== want || (again.dimensions ?? []).join() !== (bound?.dimensions ?? []).join())
          bound = await bindFieldsToComponent({ componentId, dimensions: o.dimensions ?? [], metrics: o.metrics ?? [] });
      }
      learn('create_ok', 'blend', { tables: o.tables.length });
      const blend = (await evaluateOn(p, T, listBlendsScript)).find((b) => b.blendId === blendId);
      return { ok: true, blendId, componentId, blend, ...(bound ? { bound } : {}) };
    } finally {
      for (const id of temps) await deleteComponent(id).catch(() => undefined);
    }
  });
}

/**
 * Selects (with a real click) a chart of the given source on the current page, so the data panel shows
 * that source with "Añadir un campo" / "Añadir un parámetro". Selecting through the model does not
 * update the panels.
 */
export async function selectSourceChart(page: Page, source?: string): Promise<string> {
  const dsId = source ? await resolveDataset(page, source) : undefined;
  const target = await page.evaluate((ds: string | null) => {
    const rep = (window as any).angular.element(document.body).injector().get('legoUndoRedoService').report;
    const pid = (window.location.pathname.match(/\/page\/([^/]+)/) || [])[1];
    const pg = rep.pages.find((p: any) => p.getId() === pid) || rep.pages[0];
    const ofSource = pg.components.filter((x: any) => {
      try { const k = x.config.config.datasource.keys; const id = k.dataset && k.dataset.value && k.dataset.value.id; return id && (!ds || id === ds) && !(k.dataViewActive && k.dataViewActive.value); } catch { return false; }
    });
    // Prefer a chart: a click on a control (drop-down, slider) opens it, and the next click only closes it.
    const isControl = (x: any) => /filter|daterange|button|dataset-picker|dimension-control/.test(String(x.config.config.display.type));
    const c = ofSource.find((x: any) => !isControl(x)) || ofSource[0];
    return c ? String(c.getId()) : null;
  }, dsId ?? null);
  if (!target) throw new Error(`No hay en esta pagina ningun grafico del origen ${source ?? ''}: el panel Datos solo ofrece sus campos con uno seleccionado.`);
  await clickComponents(page, [target]);
  await sleep(800);
  return target;
}

// ---------------------------------------------------------------------------
// parameters
// ---------------------------------------------------------------------------

const PARAM_TYPES: Record<string, RegExp> = {
  text: /^(Texto|Text)$/,
  integer: /^(Número \(entero\)|Number \(whole\)|Number \(integer\))$/,
  decimal: /^(Número \(decimal\)|Number \(decimal\))$/,
  boolean: /^(Booleano|Boolean)$/,
};

/** Types into a field of the parameter form. pick: ph:<re> | value:<v> | label:<re> | emptyph:<re> | nth:<re>:<i> (placeholder, i-th). */
async function paramFill(page: Page, pick: string, value: string): Promise<void> {
  const pt = await page.evaluate((how: string) => {
    const inputs = Array.from(document.querySelectorAll('input')).filter((i) => (i as HTMLElement).offsetParent && !i.closest('[class*=propert]') && i.type !== 'radio' && i.type !== 'search') as HTMLInputElement[];
    const label = (i: HTMLInputElement) => ((i.closest('mat-form-field, .mat-mdc-form-field') as HTMLElement | null)?.innerText || '').trim();
    const [kind, arg, nth] = how.split(':');
    let el: HTMLInputElement | undefined;
    if (kind === 'ph') el = inputs.filter((i) => new RegExp(arg!, 'i').test(i.placeholder)).pop();
    else if (kind === 'nth') el = inputs.filter((i) => new RegExp(arg!, 'i').test(i.placeholder))[Number(nth)];
    else if (kind === 'value') el = inputs.filter((i) => i.value === arg).pop();
    else if (kind === 'label') el = inputs.filter((i) => new RegExp(arg!, 'i').test(label(i))).pop();
    else if (kind === 'emptyph') el = inputs.filter((i) => new RegExp(arg!, 'i').test(i.placeholder) && !i.value).pop();
    if (!el) return null;
    el.scrollIntoView({ block: 'center' });
    const r = el.getBoundingClientRect();
    return { x: r.x + 15, y: r.y + r.height / 2 };
  }, pick);
  if (!pt) throw new Error(`Campo del formulario no encontrado (${pick}).`);
  await page.mouse.click(pt.x, pt.y);
  await page.keyboard.down('Control');
  await page.keyboard.press('a');
  await page.keyboard.up('Control');
  await page.keyboard.type(value, { delay: 20 });
  await sleep(400);
}

async function paramCancel(page: Page): Promise<void> {
  await clickText(page, /^(Cancelar|Cancel)$/);
  await sleep(800);
  await clickText(page, /^(Descartar|Discard)( cambios| changes)?$/);
  await sleep(500);
  await clickText(page, /^(Hecho|Done)$/);
  await sleep(1000);
}

/** Saves the open parameter form and closes the source editor; throws with the form's own errors. */
async function paramSave(page: Page, what: string): Promise<void> {
  await sleep(1000);
  const enabled = await page.evaluate(() => {
    const b = Array.from(document.querySelectorAll('button')).find((x) => (x as HTMLElement).offsetParent && /^(Guardar|Save)$/.test(x.innerText.trim()));
    return b ? !(b as HTMLButtonElement).disabled : false;
  });
  if (!enabled) {
    const why = await page.evaluate(() => Array.from(document.querySelectorAll('mat-error, .mat-mdc-form-field-error')).filter((e) => (e as HTMLElement).offsetParent).map((e) => (e as HTMLElement).innerText.trim()).join(' | '));
    throw new Error(`El editor no deja guardar ${what}: ${why || 'Guardar desactivado (¿sin cambios?)'}`);
  }
  await clickText(page, /^(Guardar|Save)$/);
  await sleep(3000);
  await clickText(page, /^(Hecho|Done)$/);
  await sleep(2000);
}

/** Point of the first button-like element right of `ref` on the same row (a row's remove or menu button). */
async function buttonRightOf(page: Page, ref: { x: number; y: number; right: number; h: number }): Promise<{ x: number; y: number } | null> {
  return page.evaluate((r0: { x: number; y: number; right: number; h: number }) => {
    const mid = r0.y + r0.h / 2;
    const b = Array.from(document.querySelectorAll('button, [role=button], mat-icon')).filter((x) => (x as HTMLElement).offsetParent)
      .map((x) => ({ x, r: x.getBoundingClientRect() }))
      .filter(({ r }) => r.x >= r0.right && r.x < r0.right + 90 && Math.abs(r.y + r.height / 2 - mid) < 14)
      .sort((a, c) => a.r.x - c.r.x)[0];
    return b ? { x: b.r.x + b.r.width / 2, y: b.r.y + b.r.height / 2 } : null;
  }, ref);
}

/** Fills the list rows of an open parameter form: reuses the rows there, adds or removes the rest. */
async function paramFillList(page: Page, vals: Array<{ value: string | number; label?: string }>): Promise<void> {
  const rows = () => page.evaluate(() => Array.from(document.querySelectorAll('input')).filter((i) => (i as HTMLElement).offsetParent && /^(Valor|Value)$/.test(i.placeholder)).length);
  // Surplus rows first, from the end: each row has a remove button after its label.
  for (let n = await rows(); n > Math.max(vals.length, 1); n--) {
    const last = await page.evaluate(() => {
      const labels = Array.from(document.querySelectorAll('input')).filter((i) => (i as HTMLElement).offsetParent && /^(Etiqueta|Label)$/.test(i.placeholder));
      const el = labels[labels.length - 1];
      if (!el) return null;
      el.scrollIntoView({ block: 'center' });
      const r = el.getBoundingClientRect();
      return { x: r.x, y: r.y, right: r.right, h: r.height };
    });
    const pt = last && (await buttonRightOf(page, last));
    if (!pt) throw new Error('No se encontro el boton para quitar un valor de la lista.');
    await page.mouse.click(pt.x, pt.y);
    await sleep(600);
  }
  for (let i = 0; i < vals.length; i++) {
    if (i >= (await rows())) {
      if (!(await clickText(page, /^(Añadir otro valor|Add another value)$/))) throw new Error('No se encontro "Anadir otro valor".');
      await sleep(600);
    }
    await paramFill(page, `nth:^(Valor|Value)$:${i}`, String(vals[i]!.value));
    await paramFill(page, `nth:^(Etiqueta|Label)$:${i}`, vals[i]!.label ?? String(vals[i]!.value));
  }
}

/** Waits for the parameter form (its name input) to be on screen. */
async function waitParamForm(page: Page, timeoutMs = 10_000): Promise<boolean> {
  const t0 = Date.now();
  while (Date.now() - t0 < timeoutMs) {
    const open = await page.evaluate(() => Array.from(document.querySelectorAll('input')).some((i) => (i as HTMLElement).offsetParent && /^(Nombre del parámetro|Parameter name)$/.test(i.placeholder)));
    if (open) { await sleep(600); return true; }
    await sleep(400);
  }
  return false;
}

/**
 * Whether the data panel lists a parameter with that name. The field list is virtual (only the rows on
 * screen are in the DOM, and parameters come last), so filter it with its search box first.
 * Leaves the filter on when `keep` (to click the chip); clearFieldSearch() removes it.
 */
async function findParamChip(page: Page, name: string, keep = false): Promise<{ x: number; y: number } | null> {
  const box = await page.evaluate(() => {
    const i = Array.from(document.querySelectorAll('input')).find((x) => (x as HTMLElement).offsetParent && /^(Buscar campos|Search fields)/i.test(x.placeholder) && x.getBoundingClientRect().y < 400);
    if (!i) return null;
    const r = i.getBoundingClientRect();
    return { x: r.x + 20, y: r.y + r.height / 2 };
  });
  if (box) {
    await page.mouse.click(box.x, box.y);
    await page.keyboard.down('Control');
    await page.keyboard.press('a');
    await page.keyboard.up('Control');
    await page.keyboard.type(name, { delay: 15 });
    await sleep(1500);
  }
  const pt = await page.evaluate((nm: string) => {
    const chip = Array.from(document.querySelectorAll('.common-chip.parameter')).find((c) => c.getAttribute('aria-label') === nm) as HTMLElement | undefined;
    if (!chip) return null;
    chip.scrollIntoView({ block: 'center' });
    const r = chip.getBoundingClientRect();
    return { x: r.x + 12, y: r.y + r.height / 2 };
  }, name);
  if (!keep) await clearFieldSearch(page);
  return pt;
}

async function clearFieldSearch(page: Page): Promise<void> {
  const box = await page.evaluate(() => {
    const i = Array.from(document.querySelectorAll('input')).find((x) => (x as HTMLElement).offsetParent && /^(Buscar campos|Search fields)/i.test(x.placeholder) && x.getBoundingClientRect().y < 400) as HTMLInputElement | undefined;
    if (!i || !i.value) return null;
    const r = i.getBoundingClientRect();
    return { x: r.x + 20, y: r.y + r.height / 2 };
  });
  if (!box) return;
  await page.mouse.click(box.x, box.y);
  await page.keyboard.down('Control');
  await page.keyboard.press('a');
  await page.keyboard.up('Control');
  await page.keyboard.press('Backspace');
  await sleep(500);
}

/** Opens an existing parameter's form from the data panel (the fx icon on its chip). */
async function openParameterEditor(page: Page, name: string, source?: string): Promise<void> {
  await selectSourceChart(page, source);
  const pt = await findParamChip(page, name, true);
  if (!pt) await clearFieldSearch(page);
  if (!pt) throw new Error(`No hay ningun parametro "${name}" en el origen del grafico seleccionado (usa source).`);
  // The edit (fx) icon replaces the type icon on hover; a click there opens the form.
  await page.mouse.move(pt.x, pt.y);
  await sleep(600);
  await page.mouse.click(pt.x, pt.y);
  if (!(await waitParamForm(page))) throw new Error(`No se abrio el editor del parametro "${name}".`);
}

const paramId = (name: string) => name.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9_.]+/g, '_').replace(/^_+|_+$/g, '');

export async function addParameter(o: {
  name: string;
  type?: 'text' | 'integer' | 'decimal' | 'boolean';
  allowed?: 'any' | 'list' | 'range';
  values?: Array<{ value: string | number; label?: string }>;
  min?: number;
  max?: number;
  default?: string | number | boolean;
  /** Source id or "@field": the parameter is added to that source. */
  source?: string;
  /** Parameter id: letters, digits, dots and underscores. By default, the name without accents. */
  id?: string;
}) {
  const { page } = await requireEditMode();
  const type = o.type ?? 'text';
  if (!PARAM_TYPES[type]) throw new Error(`type no valido: ${type}. Usa text, integer, decimal o boolean.`);
  const allowed = o.allowed ?? (o.values?.length ? 'list' : o.min !== undefined || o.max !== undefined ? 'range' : 'any');
  return withViewport(page, async () => {
    // The data panel offers "Añadir un parámetro" for the source of the selected chart.
    await selectSourceChart(page, o.source);
    if (!(await clickText(page, /^(add_circle\s*)?(Añadir un parámetro|Add a parameter)$/))) throw new Error('No se encontro "Añadir un parametro" en el panel Datos.');
    if (!(await waitParamForm(page))) throw new Error('No se abrio el formulario del parametro.');
    // The editor derives the id from the name and rejects accents and spaces ("El ID solo puede contener letras, numeros, puntos y guiones bajos").
    const id = o.id ?? paramId(o.name);
    try {
      await paramFill(page, 'ph:^(Nombre del parámetro|Parameter name)$', o.name);
      await sleep(500);
      await paramFill(page, 'label:(ID del parámetro|Parameter ID)', id);
      if (type !== 'text') {
        if (!(await clickText(page, /^(Texto|Text)$/))) throw new Error('No se encontro el selector "Tipo de datos".');
        await sleep(800);
        if (!(await clickText(page, PARAM_TYPES[type]!))) throw new Error(`Tipo ${type} no disponible.`);
        await sleep(800);
      }
      if (allowed !== 'any') {
        const re = allowed === 'list' ? /^(Lista de valores|List of values)$/ : /^(Rango|Range)$/;
        if (!(await clickText(page, re))) throw new Error(`Opcion "${allowed}" no disponible para el tipo ${type}.`);
        await sleep(800);
      }
      if (allowed === 'range') {
        if (o.min !== undefined) await paramFill(page, 'ph:^M[ií]n', String(o.min));
        if (o.max !== undefined) await paramFill(page, 'ph:^M[aá]x', String(o.max));
      }
      if (allowed === 'list') await paramFillList(page, o.values ?? []);
      if (o.default !== undefined && type !== 'boolean' && allowed !== 'list') {
        await paramFill(page, 'label:(predeterminado|Default)', String(o.default)).catch(async () => paramFill(page, 'ph:^[0-9.]+$', String(o.default)));
      }
      await paramSave(page, 'el parametro');
    } catch (e) {
      await paramCancel(page).catch(() => undefined);
      throw e;
    }
    await selectSourceChart(page, o.source).catch(() => undefined);
    const seen = !!(await findParamChip(page, o.name));
    learn(seen ? 'create_ok' : 'create_fail', 'parameter', { type, allowed });
    return {
      ok: seen,
      name: o.name,
      id,
      type,
      allowed,
      ...(o.values ? { values: o.values } : {}),
      ...(o.min !== undefined ? { min: o.min } : {}),
      ...(o.max !== undefined ? { max: o.max } : {}),
      ...(o.default !== undefined ? { default: o.default } : {}),
      note: 'En formulas usa el nombre visible del parametro, no su id.',
    };
  });
}

/**
 * Changes an existing parameter in its form: display name, allowed values (list rows), range and default.
 * The id and the data type stay: fields and controls refer to them.
 */
export async function updateParameter(o: {
  name: string;
  newName?: string;
  values?: Array<{ value: string | number; label?: string }>;
  min?: number;
  max?: number;
  default?: string | number;
  source?: string;
}) {
  const { page } = await requireEditMode();
  return withViewport(page, async () => {
    await openParameterEditor(page, o.name, o.source);
    const changed: string[] = [];
    try {
      if (o.newName !== undefined && o.newName !== o.name) {
        await paramFill(page, 'ph:^(Nombre del parámetro|Parameter name)$', o.newName);
        changed.push('name');
      }
      if (o.values) {
        const isList = await page.evaluate(() => Array.from(document.querySelectorAll('input')).some((i) => (i as HTMLElement).offsetParent && /^(Valor|Value)$/.test(i.placeholder)));
        if (!isList) {
          if (!(await clickText(page, /^(Lista de valores|List of values)$/))) throw new Error('Este parametro no admite lista de valores.');
          await sleep(800);
        }
        await paramFillList(page, o.values);
        changed.push('values');
      }
      if (o.min !== undefined || o.max !== undefined) {
        const hasRange = await page.evaluate(() => Array.from(document.querySelectorAll('input')).some((i) => (i as HTMLElement).offsetParent && /^M[ií]n/.test(i.placeholder)));
        if (!hasRange) {
          if (!(await clickText(page, /^(Rango|Range)$/))) throw new Error('Este parametro no admite rango.');
          await sleep(800);
        }
        if (o.min !== undefined) await paramFill(page, 'ph:^M[ií]n', String(o.min));
        if (o.max !== undefined) await paramFill(page, 'ph:^M[aá]x', String(o.max));
        changed.push('range');
      }
      if (o.default !== undefined) {
        await paramFill(page, 'label:(predeterminado|Default)', String(o.default));
        changed.push('default');
      }
      if (!changed.length) throw new Error('Nada que cambiar: indica newName, values, min, max o default.');
      await paramSave(page, 'el parametro');
    } catch (e) {
      await paramCancel(page).catch(() => undefined);
      throw e;
    }
    await selectSourceChart(page, o.source).catch(() => undefined);
    const seen = !!(await findParamChip(page, o.newName ?? o.name));
    learn('note', 'parameter_update', { text: `${changed.join(',')} ${seen ? 'ok' : 'not listed'}` });
    return {
      ok: seen,
      name: o.newName ?? o.name,
      changed,
      ...(o.newName ? { note: 'Las formulas nombran el parametro por su nombre visible: revisa los campos que lo usan.' } : {}),
    };
  });
}

/** Removes a parameter from its source (the "Quitar" item of its row in the source's field list). */
export async function deleteParameter(o: { name: string; source?: string }) {
  const { page } = await requireEditMode();
  return withViewport(page, async () => {
    await openParameterEditor(page, o.name, o.source);
    try {
      // Back to the field list, filter it to the parameter, open its row menu.
      if (!(await clickText(page, /^(Todos los campos|All fields)$/))) throw new Error('No se encontro "Todos los campos".');
      await sleep(2500);
      const search = await page.evaluate(() => {
        const i = Array.from(document.querySelectorAll('input')).find((x) => (x as HTMLElement).offsetParent && /^(Search fields|Buscar campos)/i.test(x.placeholder) && x.getBoundingClientRect().y > 400);
        if (!i) return null;
        const r = i.getBoundingClientRect();
        return { x: r.x + 20, y: r.y + r.height / 2 };
      });
      if (!search) throw new Error('No se encontro el buscador de campos del origen.');
      await page.mouse.click(search.x, search.y);
      await page.keyboard.type(o.name, { delay: 20 });
      await sleep(1500);
      // Each parameter row (.parameter-field-entry) has its own "more" (more_vert) button.
      const dots = await page.evaluate((nm: string) => {
        const row = Array.from(document.querySelectorAll('.parameter-field-entry')).find((r) =>
          (r as HTMLElement).offsetParent && Array.from(r.querySelectorAll('*')).some((e) => e.children.length === 0 && ((e as HTMLElement).innerText || '').trim() === nm));
        const btn = row && (row.querySelector('button.more, button[aria-label*="opciones"], button[aria-label*="options"]') as HTMLElement | null);
        if (!btn) return null;
        btn.scrollIntoView({ block: 'center' });
        const r = btn.getBoundingClientRect();
        return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
      }, o.name);
      if (!dots) throw new Error(`No se encontro la fila de "${o.name}" en la lista de campos del origen.`);
      await page.mouse.click(dots.x, dots.y);
      await sleep(1000);
      if (!(await clickText(page, /^(Quitar|Remove)$/, '[role=menuitem], [role=menuitem] *'))) throw new Error('El menu de la fila no tiene "Quitar".');
      await sleep(1500);
      // A confirmation may follow: accept only a dialog button that names removing.
      await clickText(page, /^(Quitar|Remove|Eliminar|Delete)$/, 'mat-dialog-container button, [role=dialog] button');
      await sleep(1500);
      await clickText(page, /^(Hecho|Done)$/);
      await sleep(2000);
    } catch (e) {
      await page.keyboard.press('Escape').catch(() => undefined);
      await clickText(page, /^(Hecho|Done)$/).catch(() => undefined);
      throw e;
    }
    await selectSourceChart(page, o.source).catch(() => undefined);
    const still = !!(await findParamChip(page, o.name));
    learn('note', 'parameter_delete', { text: still ? 'still listed' : 'removed' });
    if (still) throw new Error(`"${o.name}" sigue en el panel Datos tras quitarlo.`);
    return { ok: true, removed: o.name, note: 'Los campos y controles que lo usaban quedan en error: corrigelos o borralos.' };
  });
}

// ---------------------------------------------------------------------------
// pages
// ---------------------------------------------------------------------------

export async function navPages() {
  return evaluateOn(await getReportPage(), T, navPagesScript);
}

async function nav(type: string, payload: Record<string, unknown>) {
  const { page } = await requireEditMode();
  const r = await evaluateOn(page, T + 5000, navDispatchScript, { type, payload });
  if (!r.ok) throw new Error(r.error);
  return evaluateOn(page, T, navPagesScript);
}

export async function movePage(pageId: string, index: number) {
  const pages = await navPages();
  const it = pages.find((p) => p.pageId === pageId);
  if (!it) throw new Error(`No hay una pagina ${pageId}.`);
  return nav('MOVE NAV ITEM', { itemId: pageId, position: { sectionId: it.sectionId ?? undefined, index } });
}

export async function deletePages(pageIds: string[]) {
  const pages = await navPages();
  const missing = pageIds.filter((id) => !pages.some((p) => p.pageId === id));
  if (missing.length) throw new Error(`No existen: ${missing.join(', ')}.`);
  if (pageIds.length >= pages.length) throw new Error('No se pueden borrar todas las paginas.');
  return nav('REMOVE PAGES', { pageIds });
}

export async function setPageVisibility(pageId: string, v: { hiddenFromNav?: boolean; hiddenFromViewer?: boolean }) {
  let out = await navPages();
  if (v.hiddenFromNav !== undefined) out = await nav('UPDATE NAV ITEM HIDDEN FROM NAV', { itemId: pageId, hiddenFromNav: v.hiddenFromNav });
  if (v.hiddenFromViewer !== undefined) out = await nav('UPDATE NAV ITEM HIDDEN FROM VIEWER', { itemId: pageId, hiddenFromViewer: v.hiddenFromViewer });
  return out.find((p) => p.pageId === pageId);
}

/** Duplicates a page with the editor's "Página > Duplicar página" (components, filters and settings). */
export async function duplicatePage(pageId: string, name?: string) {
  const { page, info } = await requireEditMode();
  const before = await navPages();
  if (!before.some((p) => p.pageId === pageId)) throw new Error(`No hay una pagina ${pageId}.`);
  if (info.pageId !== pageId) await openReport(`https://datastudio.google.com/reporting/${info.reportId}/page/${pageId}/edit`);
  const p = await getReportPage();
  return withViewport(p, async () => {
    if (!(await clickText(p, /^(Página|Page)$/))) throw new Error('No se encontro el menu "Pagina".');
    await sleep(800);
    if (!(await clickText(p, /^(Duplicar página|Duplicate page)$/))) throw new Error('No se encontro "Duplicar pagina".');
    let after = before;
    for (let i = 0; i < 15; i++) {
      await sleep(800);
      after = await evaluateOn(p, T, navPagesScript);
      if (after.length > before.length) break;
    }
    const created = after.find((x) => !before.some((b) => b.pageId === x.pageId));
    if (!created) throw new Error('La pagina no se duplico.');
    if (name) {
      const r = await evaluateOn(p, T + 5000, navDispatchScript, { type: 'UPDATE NAV ITEM NAME', payload: { itemId: created.pageId, displayName: name } });
      if (!r.ok) throw new Error(r.error);
    }
    return (await evaluateOn(p, T, navPagesScript)).find((x) => x.pageId === created.pageId);
  });
}

// ---------------------------------------------------------------------------
// layering and report-level components
// ---------------------------------------------------------------------------

export async function arrangeComponents(componentIds: string[], op: 'front' | 'back' | 'forward' | 'backward' | 'report' | 'page', pageId?: string) {
  const { page } = await requireEditMode();
  const r = await evaluateOn(page, T, arrangeScript, { componentIds, op, ...(pageId ? { pageId } : {}) });
  if (!r.ok) throw new Error(r.error);
  await sleep(2500);
  return r;
}

/** Makes a control (dropdown, fixed list, slider, input box) set a parameter instead of filtering. */
export async function setControlParameter(componentId: string, parameterId: string) {
  const { page } = await requireEditMode();
  const r = await evaluateOn(page, T, setControlParameterScript, { componentId, parameterKey: parameterId });
  if (!r.ok) throw new Error(r.error);
  await sleep(2500);
  return { ok: true, componentId, parameterId, note: 'Recarga (reload_report) para ver el control con los valores del parametro.' };
}

/** Sets the text of a text box. Plain text is escaped; lines become <div>s. Pass html=true to send HTML as is. */
export async function setText(componentId: string, text: string, opts: { html?: boolean; size?: number; bold?: boolean; color?: string } = {}) {
  const { page } = await requireEditMode();
  const esc = (t: string) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  let html = opts.html ? text : text.split('\n').map((l) => `<div>${esc(l) || '<br>'}</div>`).join('');
  if (!opts.html && (opts.size || opts.bold || opts.color)) {
    const style = [opts.size ? `font-size:${opts.size}px` : '', opts.color ? `color:${opts.color}` : ''].filter(Boolean).join(';');
    html = `<div style="${style}">${opts.bold ? `<b>${html}</b>` : html}</div>`;
  }
  const r = await evaluateOn(page, T, setTextScript, { componentId, html });
  if (!r.ok) throw new Error(r.error);
  await sleep(2000);
  return { ok: true, componentId };
}

/** Sets style (display) keys of a component, as the Style panel does: e.g. {hideMetric: false} on a scorecard. */
export async function setStyle(componentId: string, keys: Record<string, unknown>) {
  const { page } = await requireEditMode();
  const r = await evaluateOn(page, T, setDisplayKeysScript, { componentId, keys });
  if (!r.ok) throw new Error(r.error);
  await sleep(1500);
  return { ok: true, componentId, set: r.set };
}
