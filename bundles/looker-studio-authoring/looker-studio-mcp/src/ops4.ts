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

async function clickComponents(page: Page, ids: string[], opts: { button?: 'left' | 'right' } = {}): Promise<string[]> {
  await page.keyboard.press('Escape');
  await sleep(300);
  const pts = await evaluateOn(page, T, componentPointsScript, ids);
  if (pts.some((p) => !p)) throw new Error(`No se encontraron en el lienzo: ${ids.filter((_, i) => !pts[i]).join(', ')}`);
  for (let i = 0; i < pts.length; i++) {
    const p = pts[i]!;
    if (i > 0) await page.keyboard.down('Shift');
    await page.mouse.click(p.x, p.y);
    if (i > 0) await page.keyboard.up('Shift');
    await sleep(500);
  }
  if (opts.button === 'right') {
    const last = pts[pts.length - 1]!;
    await page.mouse.click(last.x, last.y, { button: 'right' });
    await sleep(1300);
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

async function withViewport<T>(page: Page, fn: () => Promise<T>): Promise<T> {
  await page.bringToFront();
  await page.setViewport({ width: 1900, height: 1100 });
  await sleep(800);
  try {
    return await fn();
  } finally {
    await page.setViewport(null as never).catch(() => undefined);
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
      await p.setViewport({ width: 1900, height: 1100 });
      await sleep(1500);
      const before = await evaluateOn(p, T, blendSnapshotScript);
      let selected = await clickComponents(p, temps, { button: 'right' });
      if (temps.some((id) => !selected.includes(id))) {
        selected = await clickComponents(p, temps, { button: 'right' });
        if (temps.some((id) => !selected.includes(id))) throw new Error(`No se pudieron seleccionar las tablas temporales (seleccionadas: ${selected.join(', ')}).`);
      }
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
      let bound: unknown;
      if (o.dimensions?.length || o.metrics?.length) {
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
    const c = pg.components.find((x: any) => {
      try { const k = x.config.config.datasource.keys; const id = k.dataset && k.dataset.value && k.dataset.value.id; return id && (!ds || id === ds) && !(k.dataViewActive && k.dataViewActive.value); } catch { return false; }
    });
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
    await sleep(2500);
    const fill = async (pick: string, value: string) => {
      const pt = await page.evaluate((how: string) => {
        const inputs = Array.from(document.querySelectorAll('input')).filter((i) => (i as HTMLElement).offsetParent && !i.closest('[class*=propert]') && i.type !== 'radio' && i.type !== 'search') as HTMLInputElement[];
        const label = (i: HTMLInputElement) => ((i.closest('mat-form-field, .mat-mdc-form-field') as HTMLElement | null)?.innerText || '').trim();
        const [kind, arg] = how.split(':');
        let el: HTMLInputElement | undefined;
        if (kind === 'ph') el = inputs.filter((i) => new RegExp(arg!, 'i').test(i.placeholder)).pop();
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
    };
    const cancel = async () => {
      await clickText(page, /^(Cancelar|Cancel)$/);
      await sleep(800);
      await clickText(page, /^(Descartar|Discard)( cambios| changes)?$/);
      await sleep(500);
      await clickText(page, /^(Hecho|Done)$/);
    };
    // The editor derives the id from the name and rejects accents and spaces ("El ID solo puede contener letras, numeros, puntos y guiones bajos").
    const id = o.id ?? o.name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9_.]+/g, '_').replace(/^_+|_+$/g, '');
    try {
      await fill('ph:^(Nombre del parámetro|Parameter name)$', o.name);
      await sleep(500);
      await fill('label:(ID del parámetro|Parameter ID)', id);
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
        if (o.min !== undefined) await fill('ph:^M[ií]n', String(o.min));
        if (o.max !== undefined) await fill('ph:^M[aá]x', String(o.max));
      }
      if (allowed === 'list') {
        // One row is there; each further value needs "Añadir otro valor". The label copies the value unless given.
        const vals = o.values ?? [];
        for (let i = 0; i < vals.length; i++) {
          if (i > 0) {
            if (!(await clickText(page, /^(Añadir otro valor|Add another value)$/))) throw new Error('No se encontro "Anadir otro valor".');
            await sleep(600);
          }
          await fill('ph:^(Valor|Value)$', String(vals[i]!.value));
          if (vals[i]!.label) await fill('ph:^(Etiqueta|Label)$', vals[i]!.label!);
        }
      }
      if (o.default !== undefined && type !== 'boolean' && allowed !== 'list') {
        await fill('label:(predeterminado|Default)', String(o.default)).catch(async () => fill('ph:^[0-9.]+$', String(o.default)));
      }
      await sleep(1000);
      const enabled = await page.evaluate(() => {
        const b = Array.from(document.querySelectorAll('button')).find((x) => (x as HTMLElement).offsetParent && /^(Guardar|Save)$/.test(x.innerText.trim()));
        return b ? !(b as HTMLButtonElement).disabled : false;
      });
      if (!enabled) {
        const why = await page.evaluate(() => Array.from(document.querySelectorAll('mat-error, .mat-mdc-form-field-error')).filter((e) => (e as HTMLElement).offsetParent).map((e) => (e as HTMLElement).innerText.trim()).join(' | '));
        throw new Error(`El editor no deja guardar el parametro: ${why || 'Guardar desactivado'}`);
      }
      await clickText(page, /^(Guardar|Save)$/);
      await sleep(3000);
      await clickText(page, /^(Hecho|Done)$/);
      await sleep(2000);
    } catch (e) {
      await cancel().catch(() => undefined);
      throw e;
    }
    const seen = await page.evaluate((name: string) => Array.from(document.querySelectorAll('*')).some((e) => (e as HTMLElement).offsetParent && e.children.length === 0 && ((e as HTMLElement).innerText || '').trim() === name), o.name);
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
