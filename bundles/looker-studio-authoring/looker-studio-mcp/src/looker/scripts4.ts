/**
 * Page functions for blends, report navigation (page order, delete, visibility) and component
 * layering. Each runs inside the report tab via page.evaluate, so it must be self-contained
 * (tools/check-page-scripts.mjs checks it).
 *
 * Verified on Data Studio 2026-11-06:
 * - Blends live in report.config.resource.dataViewResource[<id>].blockDatasource: the blend's
 *   name is datasourceBlock.name, the join tree is blocks[0].treeQueryBlockConfig.join with
 *   type 1 inner, 2 full outer, 3 left outer, 4 right outer, 5 union, 101 cross, and its
 *   condition holds joinKeyPair {leftName, rightName} over the queries' concepts.
 *   report.updateResourceById + wrapperSaveService.save([report]) persists a change.
 * - Page order, names shown to viewers, hiding and deleting pages live in the report
 *   navigation (NgRx store "reportNavigation"), saved by its own effects through
 *   /updateReportNavigationInfo and /deletePages when these actions are dispatched:
 *   "[ReportNavigation] MOVE NAV ITEM" {itemId, position:{sectionId, index}},
 *   "[ReportNavigation] REMOVE PAGES" {pageIds}, "[ReportNavigation] UPDATE NAV ITEM NAME"
 *   {itemId, displayName}, "... HIDDEN FROM NAV" {itemId, hiddenFromNav},
 *   "... HIDDEN FROM VIEWER" {itemId, hiddenFromViewer}. Reordering report.pages and saving the
 *   report is NOT persisted.
 */

export interface NavPage {
  pageId: string;
  index: number;
  displayName: string;
  modelName: string;
  sectionId: string | null;
  hiddenFromNav: boolean;
  hiddenFromViewer: boolean;
  components: number;
}

export function navPagesScript(): NavPage[] {
  const w = window as any;
  const inj = w.angular.element(document.body).injector();
  const report = inj.get('legoUndoRedoService').report;
  let s: any;
  inj.get('store').subscribe((x: any) => (s = x)).unsubscribe();
  const items: any[] = (s && s.reportNavigation && s.reportNavigation.navigationInfo && s.reportNavigation.navigationInfo.navItems) || [];
  // Pages can sit inside sections; flatten in display order.
  const flat: any[] = [];
  const walk = (list: any[], sectionId: string | null) => {
    for (const it of list) {
      if (it.page) flat.push({ it, sectionId });
      const kids = it.section && (it.section.navItems || it.section.items);
      if (Array.isArray(kids)) walk(kids, String(it.section.sectionId || it.itemId || ''));
    }
  };
  walk(items, null);
  const byId = new Map(report.pages.map((p: any) => [String(p.getId()), p]));
  return flat.map(({ it, sectionId }, i) => {
    const p: any = byId.get(String(it.page.pageId));
    return {
      pageId: String(it.page.pageId),
      index: i,
      displayName: String(it.page.displayName || ''),
      modelName: p ? String((p.config.attribute && p.config.attribute.name) || '') : '',
      sectionId: sectionId || (it.sectionId ? String(it.sectionId) : null),
      hiddenFromNav: !!(it.hiddenFromNav || it.page.hiddenFromNav),
      hiddenFromViewer: !!(it.hiddenFromViewer || it.page.hiddenFromViewer),
      components: p ? p.components.length : 0,
    };
  });
}

/** Dispatches a [ReportNavigation] action and returns the navigation once it settles. */
export async function navDispatchScript(args: { type: string; payload: Record<string, unknown> }): Promise<{ ok: boolean; error?: string }> {
  const w = window as any;
  try {
    const store = w.angular.element(document.body).injector().get('store');
    store.dispatch({ type: `[ReportNavigation] ${args.type}`, ...args.payload });
    await new Promise((r) => setTimeout(r, 2500));
    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: String(e && e.message) };
  }
}

export interface BlendInfo {
  blendId: string;
  name: string;
  tables: string[];
  joins: Array<{ type: string; keys: Array<{ left: string; right: string }> }>;
  fields: string[];
  usedBy: string[];
}

export function listBlendsScript(): BlendInfo[] {
  const w = window as any;
  const report = w.angular.element(document.body).injector().get('legoUndoRedoService').report;
  const res = (report.config.resource && report.config.resource.dataViewResource) || {};
  const TYPES: Record<number, string> = { 0: 'unknown', 1: 'inner', 2: 'full', 3: 'left', 4: 'right', 5: 'union', 101: 'cross' };
  const all = [...report.pages.flatMap((p: any) => p.components), ...report.components];
  const out: BlendInfo[] = [];
  for (const [id, v] of Object.entries(res) as Array<[string, any]>) {
    const bd = v && v.blockDatasource;
    if (!bd) continue;
    const tables: string[] = [];
    const joins: BlendInfo['joins'] = [];
    // concept name -> source field name, per query, to show join keys as fields
    const conceptField = new Map<string, string>();
    const visit = (node: any) => {
      if (!node) return;
      if (node.query) {
        tables.push(String(node.query.datasourceId));
        for (const c of node.query.concepts || []) {
          const nm = c.id && c.id.name;
          const sf = c.queryTimeTransformation && c.queryTimeTransformation.dataTransformation && c.queryTimeTransformation.dataTransformation.sourceFieldName;
          if (nm) conceptField.set(String(nm), String(sf || nm));
        }
      }
      if (node.join) {
        visit(node.join.left);
        visit(node.join.right);
        const conds = (node.join.condition && node.join.condition.and && node.join.condition.and.conditions) || [];
        joins.push({
          type: TYPES[node.join.type] || String(node.join.type),
          keys: conds.map((c: any) => c.boolean && c.boolean.joinKeyPair).filter(Boolean)
            .map((k: any) => ({ left: conceptField.get(k.leftName) || k.leftName, right: conceptField.get(k.rightName) || k.rightName })),
        });
      }
    };
    for (const b of bd.blocks || []) visit(b.treeQueryBlockConfig);
    const outFields: any[] = (bd.datasourceBlock && bd.datasourceBlock.fields) || [];
    const fields = outFields.map((f: any) => String(f.outputName));
    // source field id -> the blend's visible name (output fields are named <sourceField>__dv<n>)
    const visible = (sf: string) => {
      const f = outFields.find((x: any) => x.field && typeof x.field.name === 'string' && (x.field.name.startsWith(`${sf}__dv`) || x.field.name.startsWith(`${sf}_dv`)));
      return f ? String(f.outputName) : sf;
    };
    for (const j of joins) j.keys = j.keys.map((k) => ({ left: visible(k.left), right: visible(k.right) }));
    const usedBy = all.filter((c: any) => {
      try { const k = c.config.config.datasource.keys; return k.dataViewActive && k.dataViewActive.value && k.dataViewResource && k.dataViewResource.value === id; } catch { return false; }
    }).map((c: any) => String(c.getId()));
    out.push({ blendId: id, name: String((bd.datasourceBlock && bd.datasourceBlock.name) || ''), tables, joins, fields: [...new Set(fields as string[])], usedBy });
  }
  return out;
}

export function updateBlendScript(args: { blendId: string; name?: string; joinType?: number }): { ok: boolean; error?: string } {
  const w = window as any;
  try {
    const inj = w.angular.element(document.body).injector();
    const report = inj.get('legoUndoRedoService').report;
    const res = report.config.resource.dataViewResource || {};
    const v = res[args.blendId];
    if (!v) return { ok: false, error: `No hay una combinacion ${args.blendId}.` };
    const copy = JSON.parse(JSON.stringify(v));
    const bd = copy.blockDatasource;
    if (args.name !== undefined) bd.datasourceBlock.name = args.name;
    if (args.joinType !== undefined) {
      const visit = (node: any) => {
        if (!node || !node.join) return;
        node.join.type = args.joinType;
        // A cross join has no condition; the editor drops it.
        if (args.joinType === 101) delete node.join.condition;
        visit(node.join.left);
        visit(node.join.right);
      };
      for (const b of bd.blocks || []) visit(b.treeQueryBlockConfig);
    }
    report.updateResourceById('dataViewResource', args.blendId, copy);
    inj.get('wrapperSaveService').save([report]);
    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: String(e && e.message) };
  }
}

/** Snapshot to find what a UI action created: blend ids and blended component ids. */
export function blendSnapshotScript(): { blends: string[]; blended: string[]; components: string[] } {
  const w = window as any;
  const report = w.angular.element(document.body).injector().get('legoUndoRedoService').report;
  const all = [...report.pages.flatMap((p: any) => p.components), ...report.components];
  return {
    blends: Object.keys((report.config.resource && report.config.resource.dataViewResource) || {}),
    blended: all.filter((c: any) => { try { const k = c.config.config.datasource.keys; return !!(k.dataViewActive && k.dataViewActive.value); } catch { return false; } }).map((c: any) => String(c.getId())),
    components: all.map((c: any) => String(c.getId())),
  };
}

/** Screen point of each component (scrolling the canvas so it is visible), for real clicks. */
export function componentPointsScript(ids: string[]): Array<{ id: string; x: number; y: number } | null> {
  const w = window as any;
  const report = w.angular.element(document.body).injector().get('legoUndoRedoService').report;
  const cv = document.querySelector('.ng2-canvas-container') as HTMLElement | null;
  if (!cv) return ids.map(() => null);
  const all = [...report.pages.flatMap((p: any) => p.components), ...report.components];
  const z = cv.getBoundingClientRect().width / (Number(report.config.attribute && report.config.attribute.width) || 1200);
  let scroller: HTMLElement | null = cv.parentElement;
  while (scroller && scroller.scrollHeight <= scroller.clientHeight) scroller = scroller.parentElement;
  return ids.map((id) => {
    const c = all.find((x: any) => x.getId() === id);
    if (!c) return null;
    const a = c.getAttribute();
    let r = cv.getBoundingClientRect();
    // Near the top edge and off-centre: inside a chart, a click lands on the plot (a series or a
    // cross-filter) instead of selecting the component; the centre of the top edge is a resize handle.
    const dy = Math.min(8, a.height / 2);
    let y = r.y + (a.top + dy) * z;
    if ((y > window.innerHeight - 60 || y < 160) && scroller) {
      scroller.scrollTop += y - window.innerHeight / 2;
      r = cv.getBoundingClientRect();
      y = r.y + (a.top + dy) * z;
    }
    return { id, x: r.x + (a.left + Math.min(a.width / 4, 60)) * z, y };
  });
}

export function selectedIdsScript(): string[] {
  const w = window as any;
  return w.angular.element(document.body).injector().get('selectedComponentService').getSelectedComponents().map((c: any) => String(c.getId()));
}

/** Point of a visible menu item with this exact text inside an open menu panel (scrolled into view). */
export function menuItemPointScript(texts: string[]): { x: number; y: number; disabled: boolean } | null {
  const rx = new RegExp(`^(${texts.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})$`);
  const els = Array.from(document.querySelectorAll('*')).filter((e) => (e as HTMLElement).offsetParent && e.children.length <= 2 &&
    rx.test(((e as HTMLElement).innerText || '').trim()) && e.closest('.mat-mdc-menu-panel, [role=menu]')) as HTMLElement[];
  const e = els[els.length - 1];
  if (!e) return null;
  e.scrollIntoView({ block: 'center' });
  const q = e.getBoundingClientRect();
  const item = (e.closest('[role=menuitem], button') || e) as HTMLElement;
  return { x: q.x + q.width / 2, y: q.y + q.height / 2, disabled: item.getAttribute('aria-disabled') === 'true' || (item as HTMLButtonElement).disabled === true };
}

/** Layer order and report-level placement of components, saved with the editor's save service. */
export function arrangeScript(args: { componentIds: string[]; op: 'front' | 'back' | 'forward' | 'backward' | 'report' | 'page'; pageId?: string }): { ok: boolean; error?: string; ids?: string[] } {
  const w = window as any;
  try {
    const inj = w.angular.element(document.body).injector();
    const report = inj.get('legoUndoRedoService').report;
    const save = inj.get('wrapperSaveService');
    if (args.op === 'report' || args.op === 'page') {
      const page = args.pageId ? report.getPage(args.pageId) : report.pages.find((p: any) => args.componentIds.some((id) => p.hasComponent(p.getComponent && p.getComponent(id))));
      const target = page || report.pages.find((p: any) => p.getId() === (report.selected && report.selected.getId && report.selected.getId()));
      if (!target) return { ok: false, error: 'Pagina no encontrada (indica pageId).' };
      if (args.op === 'report') {
        const comps = args.componentIds.map((id) => target.getComponent(id)).filter(Boolean);
        if (!comps.length) return { ok: false, error: 'Componentes no encontrados en esa pagina.' };
        report.makeComponentsGlobal(target, comps);
      } else {
        const comps = args.componentIds.map((id) => report.getComponent(id)).filter(Boolean);
        if (!comps.length) return { ok: false, error: 'Componentes de informe no encontrados.' };
        report.makeComponentsLocal(target, comps);
      }
      save.save([report, target]);
      return { ok: true, ids: report.getSelectedComponents ? report.getSelectedComponents().map((c: any) => String(c.getId())) : [] };
    }
    for (const id of args.componentIds) {
      const owner = report.pages.find((p: any) => p.getComponent(id)) || (report.getComponent(id) ? report : null);
      if (!owner) return { ok: false, error: `Componente ${id} no encontrado.` };
      const c = owner.getComponent(id);
      const fn = { front: 'moveComponentToTheFront', back: 'moveComponentToTheEnd', forward: 'moveComponentForward', backward: 'moveComponentBackward' }[args.op];
      owner[fn](c);
      save.save([owner]);
    }
    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: String(e && e.message) };
  }
}

/**
 * A control that sets a parameter instead of filtering (verified 2026-11-06: the editor's
 * "Campo de control > Parámetros" writes display key controlParameter {parameterKey: <param id>},
 * empties the primary dimension and keeps singleSelect on).
 */
export function setControlParameterScript(args: { componentId: string; parameterKey: string }): { ok: boolean; error?: string } {
  const w = window as any;
  try {
    const inj = w.angular.element(document.body).injector();
    const report = inj.get('legoUndoRedoService').report;
    const all = [...report.pages.flatMap((p: any) => p.components), ...report.components];
    const comp = all.find((c: any) => c.getId() === args.componentId);
    if (!comp) return { ok: false, error: `Componente ${args.componentId} no encontrado.` };
    const keys = comp.config.config.display && comp.config.config.display.keys;
    if (!keys || !('controlParameter' in keys || comp.getDisplayType() === 'dimension-filter')) return { ok: false, error: `${comp.getDisplayType()} no es un control que acepte parametros.` };
    comp.setDisplayKeyValue('controlParameter', { parameterKey: args.parameterKey });
    comp.setDisplayKeyValue('singleSelect', true);
    const dv = comp.config.config.datasource.keys.dimensions && comp.config.config.datasource.keys.dimensions.value;
    if (dv && Array.isArray(dv.primary) && dv.primary.length) comp.updateDimensions('primary', []);
    // The sort pointed at the old dimension: without it the control shows "Orden no valido".
    const sd = comp.config.config.datasource.keys.sortData;
    if (sd && Array.isArray(sd.value) && sd.value.length && typeof comp.setDataSourceKeyValue === 'function') comp.setDataSourceKeyValue('sortData', [], true, true);
    comp.syncState && comp.syncState();
    inj.get('wrapperSaveService').save([comp]);
    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: String(e && e.message) };
  }
}

/** Text of a text box (simple-description): display key "text", HTML as the editor stores it. */
export function setTextScript(args: { componentId: string; html: string }): { ok: boolean; error?: string } {
  const w = window as any;
  try {
    const inj = w.angular.element(document.body).injector();
    const report = inj.get('legoUndoRedoService').report;
    const all = [...report.pages.flatMap((p: any) => p.components), ...report.components];
    const comp = all.find((c: any) => c.getId() === args.componentId);
    if (!comp) return { ok: false, error: `Componente ${args.componentId} no encontrado.` };
    if (comp.getDisplayType() !== 'simple-description') return { ok: false, error: `${comp.getDisplayType()} no es un cuadro de texto (simple-description).` };
    comp.setDisplayKeyValue('text', args.html);
    inj.get('wrapperSaveService').save([comp]);
    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: String(e && e.message) };
  }
}

/** Deletes a blend that no chart uses (report.removeResource + save). */
export function deleteBlendScript(blendId: string): { ok: boolean; error?: string } {
  const w = window as any;
  try {
    const inj = w.angular.element(document.body).injector();
    const report = inj.get('legoUndoRedoService').report;
    const res = report.config.resource.dataViewResource || {};
    if (!res[blendId]) return { ok: false, error: `No hay una combinacion ${blendId}.` };
    const all = [...report.pages.flatMap((p: any) => p.components), ...report.components];
    const users = all.filter((c: any) => { try { const k = c.config.config.datasource.keys; return k.dataViewResource && k.dataViewResource.value === blendId; } catch { return false; } });
    if (users.length) return { ok: false, error: `La combinacion la usan ${users.map((c: any) => c.getId()).join(', ')}: borralos o cambialos antes.` };
    report.removeResource('dataViewResource', blendId);
    inj.get('wrapperSaveService').save([report]);
    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: String(e && e.message) };
  }
}

/**
 * An empty report has no component to mint ids from (duplicateConfig). Creates a tiny text box with the
 * editor's own factory (createComponentService.create, the path the insert menu uses) to serve as the
 * seed; the caller deletes it afterwards. Returns null when the report already has components.
 */
export async function ensureSeedScript(pageId?: string): Promise<{ seedId: string | null; error?: string }> {
  const w = window as any;
  try {
    const inj = w.angular.element(document.body).injector();
    const report = inj.get('legoUndoRedoService').report;
    const all = [...report.pages.flatMap((p: any) => p.components), ...report.components];
    if (all.length) return { seedId: null };
    const page = (pageId && report.pages.find((p: any) => String(p.getId()) === pageId)) || undefined;
    const c = await inj.get('createComponentService').create({
      type: 'simple-description', geometry: { top: 0, left: 0, width: 20, height: 20 }, creationMethod: 'Insert', ...(page ? { parent: page } : {}),
    });
    return { seedId: c && c.getId ? String(c.getId()) : null };
  } catch (e: any) {
    return { seedId: null, error: String(e && e.message) };
  }
}

/** Sets display (style) keys of a component, e.g. a scorecard's hideMetric, as the Style panel does. */
export function setDisplayKeysScript(args: { componentId: string; keys: Record<string, unknown> }): { ok: boolean; error?: string; set?: string[] } {
  const w = window as any;
  try {
    const inj = w.angular.element(document.body).injector();
    const report = inj.get('legoUndoRedoService').report;
    const all = [...report.pages.flatMap((p: any) => p.components), ...report.components];
    const comp = all.find((c: any) => c.getId() === args.componentId);
    if (!comp) return { ok: false, error: `Componente ${args.componentId} no encontrado.` };
    const set: string[] = [];
    for (const [k, v] of Object.entries(args.keys)) { comp.setDisplayKeyValue(k, v); set.push(k); }
    inj.get('wrapperSaveService').save([comp]);
    return { ok: true, set };
  } catch (e: any) {
    return { ok: false, error: String(e && e.message) };
  }
}

// ---------------------------------------------------------------------------
// blend structure: tables and join keys of an existing blend
// The join tree is left-deep: join(join(t1, t2), t3)... Each join's condition pairs a concept of an
// earlier table (leftName) with one of the table it adds (rightName). datasourceBlock.fields lists the
// blend's output fields: name `<sourceField>_dv<n>`, outputName = the field's display name, and
// sourceFieldName = the concept in its table's query. Verified 2026-11-06 against blends made by the editor.
// ---------------------------------------------------------------------------

export interface BlendSchemaField { id: string; name: string; dataType: string }

export interface BlendEdit {
  blendId: string;
  /** Source fields per dataset id (from readDataSourcesScript), to add concepts. */
  schemas: Record<string, BlendSchemaField[]>;
  addTable?: { datasetId: string; dimensions: string[]; metrics: string[]; joinType: number; keys: Array<{ left: string; right: string }> };
  /** 1-based table position to remove (not the first). */
  removeTable?: number;
  /** Keys of the join that adds table `table` (2..n), by field display name. */
  setKeys?: { table: number; keys: Array<{ left: string; right: string }>; joinType?: number };
}

export function editBlendScript(args: BlendEdit): { ok: boolean; error?: string; tables?: number; removedFields?: string[]; addedFields?: string[] } {
  const w = window as any;
  try {
    const inj = w.angular.element(document.body).injector();
    const report = inj.get('legoUndoRedoService').report;
    const res = (report.config.resource && report.config.resource.dataViewResource) || {};
    const cur = res[args.blendId];
    if (!cur || !cur.blockDatasource) return { ok: false, error: `Combinacion ${args.blendId} no encontrada (ids en list_blends).` };
    const copy = JSON.parse(JSON.stringify(cur));
    const bd = copy.blockDatasource;
    const root = bd.blocks && bd.blocks[0] && bd.blocks[0].treeQueryBlockConfig;
    if (!root || !root.join) return { ok: false, error: 'La combinacion no tiene la forma esperada (arbol de uniones).' };

    // flatten
    type Join = { type: number; condition: any };
    const tables: any[] = [];
    const joins: Join[] = [];
    const flat = (n: any): boolean => {
      if (n.query) { tables.push(n.query); return true; }
      const j = n.join;
      if (!j) return false;
      if (!flat(j.left)) return false;
      if (!j.right || !j.right.query) return false; // only left-deep trees
      tables.push(j.right.query);
      joins.push({ type: j.type, condition: j.condition });
      return true;
    };
    if (!flat({ join: root.join })) return { ok: false, error: 'Arbol de uniones no lineal: editalo en el editor de combinaciones.' };

    const fields: any[] = bd.datasourceBlock.fields;
    const conceptTable = new Map<string, number>(); // concept name -> table index
    tables.forEach((t, i) => (t.concepts || []).forEach((c: any) => conceptTable.set(c.id.name, i)));
    const outName = (concept: string) => (fields.find((f) => f.queryTimeTransformation.dataTransformation.sourceFieldName === concept) || {}).outputName;
    const DT: Record<string, number> = { TEXT: 100, NUMBER: 2, BOOLEAN: 1, DATE: 8, DATETIME: 9 };
    const AGG: Record<string, number> = { AVG: 1, COUNT: 2, COUNT_DISTINCT: 3, MAX: 4, MIN: 5, SUM: 6 };
    const rnd = () => 'qt_' + Math.random().toString(36).slice(2, 12).padEnd(10, '0');
    const added: string[] = [];

    // A concept for `ref` ("campo" or "SUM(campo)") in table i: reuse one with the same source field, or add it.
    const conceptFor = (i: number, ref: string, metric: boolean): string => {
      const m = /^([A-Z_]+)\((.+)\)$/i.exec(ref.trim());
      const nm = (m ? m[2]! : ref).trim();
      const agg = m ? AGG[m[1]!.toUpperCase()] : metric ? AGG.SUM : undefined;
      if (m && agg === undefined) throw new Error(`Agregacion "${m[1]}" no soportada.`);
      const t = tables[i];
      const sch = args.schemas[String(t.datasourceId)] || [];
      const f = sch.find((x) => x.id === nm) || sch.find((x) => x.name.toLowerCase() === nm.toLowerCase());
      if (!f) throw new Error(`El campo "${nm}" no esta en el origen ${t.datasourceId}.`);
      const have = (t.concepts || []).find((c: any) => c.queryTimeTransformation.dataTransformation.sourceFieldName === f.id &&
        (c.queryTimeTransformation.dataTransformation.aggregation ?? undefined) === agg);
      if (have) return have.id.name;
      const qt = rnd();
      const dt: any = { sourceFieldName: f.id };
      if (agg !== undefined) dt.aggregation = agg;
      (t.concepts = t.concepts || []).push({ id: { id: 't0.' + qt, name: qt, namespace: 't0' }, semantic: [], queryTimeTransformation: { dataTransformation: dt, displayTransformation: {} }, isDummy: false });
      conceptTable.set(qt, i);
      const base = f.id + '_dv';
      const n = fields.filter((x) => String(x.field.name).startsWith(base)).length;
      const tpl = fields[0] ? JSON.parse(JSON.stringify(fields[0])) : { columnType: 0, enabled: true, conceptType: 0, params: [], property: [], isRepeated: false, isDefault: false, ancestors: [], lookerFilterOnlyFieldAllowedValues: [] };
      tpl.field = { ns: 't0', name: base + n, simpleName: base + n };
      tpl.outputName = f.name;
      tpl.dataType = DT[f.dataType] ?? 100;
      tpl.conceptType = 0;
      tpl.queryTimeTransformation = { dataTransformation: { sourceFieldName: qt } };
      // Fields are listed table by table, in table order: insert after the last field of this table (or
      // of an earlier one). Appending a table-1 key field at the end gave "Error del sistema".
      let at = -1;
      fields.forEach((x, k) => { const ti = conceptTable.get(x.queryTimeTransformation.dataTransformation.sourceFieldName); if (ti !== undefined && ti <= i) at = k; });
      fields.splice(at + 1, 0, tpl);
      added.push(f.name);
      return qt;
    };
    // Left side of a key: a field of an earlier table, by output name (first table that has it), else added to table 0.
    const leftConcept = (upto: number, name: string): string => {
      for (let i = 0; i < upto; i++) {
        const c = (tables[i].concepts || []).find((x: any) => {
          const o = outName(x.id.name);
          const sf = x.queryTimeTransformation.dataTransformation.sourceFieldName;
          return x.queryTimeTransformation.dataTransformation.aggregation === undefined && ((o && o.toLowerCase() === name.toLowerCase()) || sf === name);
        });
        if (c) return c.id.name;
      }
      return conceptFor(0, name, false);
    };
    const cond = (pairs: Array<{ left: string; right: string }>, idx: number) => {
      if (!pairs.length) return null;
      return { and: { conditions: pairs.map((p) => ({ boolean: { joinKeyPair: { leftName: leftConcept(idx, p.left), rightName: conceptFor(idx, p.right, false) } } })) } };
    };

    let removedFields: string[] = [];
    if (args.removeTable !== undefined) {
      const t = args.removeTable - 1;
      if (t < 1 || t >= tables.length) return { ok: false, error: `removeTable debe ir de 2 a ${tables.length} (la primera tabla no se quita).` };
      if (tables.length <= 2) return { ok: false, error: 'Una combinacion necesita al menos 2 tablas: borra la combinacion.' };
      const gone = new Set<string>((tables[t].concepts || []).map((c: any) => c.id.name));
      tables.splice(t, 1);
      joins.splice(t - 1, 1);
      for (const j of joins) {
        const refs = JSON.stringify(j.condition || {}).match(/qt_[a-z0-9]+/g) || [];
        if (refs.some((r) => gone.has(r))) return { ok: false, error: 'Otra union usa como clave un campo de esa tabla: cambia antes sus claves (setKeys).' };
      }
      removedFields = fields.filter((f) => gone.has(f.queryTimeTransformation.dataTransformation.sourceFieldName)).map((f) => String(f.outputName));
      for (let k = fields.length - 1; k >= 0; k--) if (gone.has(fields[k].queryTimeTransformation.dataTransformation.sourceFieldName)) fields.splice(k, 1);
      // re-index the tables after the removed one
      conceptTable.clear();
      tables.forEach((tb, ti) => (tb.concepts || []).forEach((c: any) => conceptTable.set(c.id.name, ti)));
    }
    if (args.addTable) {
      if (tables.length >= 5) return { ok: false, error: 'Una combinacion admite como mucho 5 tablas.' };
      tables.push({ concepts: [], datasourceId: args.addTable.datasetId });
      const i = tables.length - 1;
      for (const d of args.addTable.dimensions) conceptFor(i, d, false);
      for (const m of args.addTable.metrics) conceptFor(i, m, true);
      const c = cond(args.addTable.keys, i);
      if (!c && args.addTable.joinType !== 101) return { ok: false, error: 'Sin claves de union: indica keys o joinType cross.' };
      joins.push({ type: args.addTable.joinType, condition: c || undefined });
    }
    if (args.setKeys) {
      const i = args.setKeys.table - 1;
      if (i < 1 || i >= tables.length) return { ok: false, error: `setKeys.table debe ir de 2 a ${tables.length}.` };
      const c = cond(args.setKeys.keys, i);
      joins[i - 1] = { type: args.setKeys.joinType ?? joins[i - 1]!.type, condition: c || undefined };
    }

    // keep the fields table by table (stable), as the editor lists them
    const ord = fields.map((f, k) => ({ f, k, t: conceptTable.get(f.queryTimeTransformation.dataTransformation.sourceFieldName) ?? 99 }));
    ord.sort((a, b) => a.t - b.t || a.k - b.k);
    fields.splice(0, fields.length, ...ord.map((x) => x.f));

    // rebuild left-deep
    let node: any = { query: tables[0] };
    for (let i = 1; i < tables.length; i++) {
      const j: any = { left: node, right: { query: tables[i] }, type: joins[i - 1]!.type };
      if (joins[i - 1]!.condition) j.condition = joins[i - 1]!.condition;
      node = { join: j };
    }
    root.join = node.join;
    report.updateResourceById('dataViewResource', args.blendId, copy);
    inj.get('wrapperSaveService').save([report]);
    return { ok: true, tables: tables.length, removedFields, addedFields: added };
  } catch (e: any) {
    return { ok: false, error: String(e && e.message) };
  }
}

// ---------------------------------------------------------------------------
// conditional formatting (tables, pivot tables, scorecards): display key conditionalFormat = {rule: [...]}
// Shapes taken from rules made in the editor (2026-11-06):
//  single colour: conditionDefinition.matchCondition {input.selector.step [cell, field], type 1..6, value}
//                 format.single.property [{key: 'background-color' | 'color', value.colorValue}]
//  colour scale:  conditionDefinition.scale {input, anchor[3] (valueSemantic 2: 0..1 of the range)}
//                 format.scale.property [{key, value.anchor[3] colorValue}]
//  target: step [row] (whole row) or [cell, field] (that column). scope is always 'row'.
// ---------------------------------------------------------------------------

export interface CfRule {
  /** Field shown in the chart: display name ("Ingresos") or concept id (qt_...). */
  field: string;
  /** Single-colour rule: EQ, NE, GT, GE, LT, LE. */
  op?: string;
  value?: string | number;
  /** "row" or a field of the chart (its column). Default: the rule's own field. */
  target?: string;
  background?: string;
  color?: string;
  /** Colour scale over the field's range: three colours for min, middle and max. */
  scale?: string[];
}

export function setConditionalFormatScript(args: { componentId: string; rules: CfRule[]; append?: boolean }): { ok: boolean; error?: string; rules?: number } {
  const w = window as any;
  try {
    const inj = w.angular.element(document.body).injector();
    const report = inj.get('legoUndoRedoService').report;
    const all = [...report.pages.flatMap((p: any) => p.components), ...report.components];
    const comp = all.find((c: any) => c.getId() === args.componentId);
    if (!comp) return { ok: false, error: `Componente ${args.componentId} no encontrado.` };
    const keys = comp.config.config.datasource.keys;
    const live: string[] = [...((keys.dimensions && keys.dimensions.value && keys.dimensions.value.primary) || []), ...((keys.metrics && keys.metrics.value && keys.metrics.value.primary) || [])];
    let schema: any = {};
    try { schema = comp.getSchema().qe.concepts || {}; } catch { /* blended or not loaded: display names only */ }
    const label = (n: string) => {
      const d = comp.config.conceptDefs[n];
      const dn = d && d.queryTimeTransformation && d.queryTimeTransformation.displayTransformation && d.queryTimeTransformation.displayTransformation.displayName;
      if (dn) return String(dn);
      const sf = d && d.queryTimeTransformation && d.queryTimeTransformation.dataTransformation && d.queryTimeTransformation.dataTransformation.sourceFieldName;
      const s = sf && schema[sf];
      return String((s && s.displayName) || sf || n);
    };
    const concept = (ref: string) => {
      const n = live.find((x) => x === ref) || live.find((x) => label(x).toLowerCase() === ref.toLowerCase());
      if (!n) throw new Error(`"${ref}" no es un campo del grafico (${live.map(label).join(', ')}).`);
      const d = JSON.parse(JSON.stringify(comp.config.conceptDefs[n]));
      const qtt = d.queryTimeTransformation || { dataTransformation: {} };
      qtt.displayTransformation = Object.assign({}, qtt.displayTransformation || {}, { displayName: label(n) });
      return { id: d.id || `t0.${n}`, name: n, namespace: d.namespace || 't0', queryTimeTransformation: qtt };
    };
    const colour = (c: string) => {
      const m = /^serie:(\d+)$/i.exec(c);
      if (m) {
        // themeRef indexes: 0 fill, 1 font, 2 accent, 3 accent font, 4.. series (observed: series 2 = index 5).
        let hex = '#000000';
        try {
          const th = (report.config.resource && report.config.resource.theme) || [];
          const list = Array.isArray(th) ? th : Object.values(th);
          const s = list.map((t: any) => t && t.content && t.content.themeSeriesColor).find(Boolean);
          if (s && s[Number(m[1]) - 1]) hex = s[Number(m[1]) - 1].color;
        } catch { /* default */ }
        return { color: hex, themeRef: { index: Number(m[1]) + 3 } };
      }
      if (!/^#[0-9a-f]{6}$/i.test(c)) throw new Error(`Color no valido: ${c} (usa #rrggbb o serie:N).`);
      return { color: c.toUpperCase() };
    };
    const OPS: Record<string, number> = { EQ: 1, NE: 2, GT: 3, GE: 4, LT: 5, LE: 6 };
    const rules = args.rules.map((r) => {
      const f = concept(r.field);
      const target = !r.target || r.target === r.field ? { step: [{ string: 'cell' }, { field: f }] }
        : r.target === 'row' ? { step: [{ string: 'row' }] } : { step: [{ string: 'cell' }, { field: concept(r.target) }] };
      if (r.scale) {
        const cs = r.scale.length === 3 ? r.scale : r.scale.length === 2 ? [r.scale[0]!, '', r.scale[1]!] : null;
        if (!cs) throw new Error('scale lleva 2 o 3 colores (minimo, [medio,] maximo).');
        const anchors = cs[1] ? [0, 0.5, 1] : [0, 1];
        const cols = cs.filter(Boolean);
        return {
          conditionDefinition: { scale: { input: { selector: { step: [{ string: 'cell' }, { field: f }] } }, anchor: anchors.map((a) => ({ stringValue: [], numberValue: [a], valueSemantic: 2 })) } },
          target: { target },
          format: { scale: { property: [{ key: 'background-color', value: { anchor: cols.map((c) => ({ colorValue: colour(c) })) } }] } },
          scope: 'row',
        };
      }
      const op = OPS[String(r.op || '').toUpperCase()];
      if (!op) throw new Error(`op no valida: ${r.op} (EQ, NE, GT, GE, LT, LE).`);
      if (r.value === undefined) throw new Error('Falta value.');
      if (!r.background && !r.color) throw new Error('Indica background o color (o ambos).');
      const value = typeof r.value === 'number' ? { stringValue: [], numberValue: [r.value] } : { stringValue: [String(r.value)], numberValue: [] };
      const prop: any[] = [];
      if (r.color) prop.push({ key: 'color', value: { colorValue: colour(r.color) } });
      if (r.background) prop.push({ key: 'background-color', value: { colorValue: colour(r.background) } });
      return {
        conditionDefinition: { matchCondition: { input: { selector: { step: [{ string: 'cell' }, { field: f }] } }, type: op, value } },
        target: { target },
        format: { single: { property: prop } },
        scope: 'row',
      };
    });
    const cur = comp.config.config.display.keys.conditionalFormat;
    const prev = args.append && cur && cur.value && Array.isArray(cur.value.rule) ? cur.value.rule : [];
    comp.setDisplayKeyValue('conditionalFormat', { rule: [...prev, ...rules] });
    inj.get('wrapperSaveService').save([comp]);
    return { ok: true, rules: prev.length + rules.length };
  } catch (e: any) {
    return { ok: false, error: String(e && e.message) };
  }
}

// ---------------------------------------------------------------------------
// groups and boxes (verified 2026-11-06): page.createGroup(components, groupsToRemove) makes a group
// (id g-...), saved in page.config.group; grouped components stay in page.components with absolute
// positions and the group as parent. page.removeGroups(groups) ungroups.
// ---------------------------------------------------------------------------

export function componentBoxesScript(ids: string[]): Array<{ id: string; x: number; y: number; w: number; h: number; pageId: string | null } | null> {
  const w = window as any;
  const report = w.angular.element(document.body).injector().get('legoUndoRedoService').report;
  return ids.map((id) => {
    for (const p of report.pages) {
      const c = p.components.find((x: any) => x.getId() === id);
      if (c) { const a = c.getAttribute(); return { id, x: Number(a.left), y: Number(a.top), w: Number(a.width), h: Number(a.height), pageId: String(p.getId()) }; }
    }
    const c = report.components.find((x: any) => x.getId() === id);
    if (c) { const a = c.getAttribute(); return { id, x: Number(a.left), y: Number(a.top), w: Number(a.width), h: Number(a.height), pageId: null }; }
    return null;
  });
}

export function groupScript(args: { componentIds?: string[]; ungroup?: boolean; groupIds?: string[]; list?: boolean; pageId?: string }): {
  ok: boolean; error?: string; groupId?: string; removed?: string[]; groups?: Array<{ pageId: string; groupId: string; componentIds: string[] }>;
} {
  const w = window as any;
  try {
    const inj = w.angular.element(document.body).injector();
    const report = inj.get('legoUndoRedoService').report;
    const groupsOf = (p: any) => (p.getGroups ? p.getGroups() : []) as any[];
    if (args.list) {
      const pages = args.pageId ? report.pages.filter((p: any) => p.getId() === args.pageId) : report.pages;
      return { ok: true, groups: pages.flatMap((p: any) => groupsOf(p).map((g: any) => ({ pageId: String(p.getId()), groupId: String(g.getId()), componentIds: g.getComponents().map((c: any) => String(c.getId())) }))) };
    }
    const ids = args.componentIds || [];
    if (args.ungroup) {
      const removed: string[] = [];
      for (const p of report.pages) {
        const gs = groupsOf(p).filter((g: any) => (args.groupIds || []).includes(String(g.getId())) || g.getComponents().some((c: any) => ids.includes(String(c.getId()))));
        if (!gs.length) continue;
        p.removeGroups(gs);
        removed.push(...gs.map((g: any) => String(g.getId())));
        inj.get('wrapperSaveService').save([p]);
      }
      if (!removed.length) return { ok: false, error: 'Ningun grupo coincide (ids en group_components list).' };
      return { ok: true, removed };
    }
    if (ids.length < 2) return { ok: false, error: 'Un grupo necesita al menos 2 componentes.' };
    const page = report.pages.find((p: any) => ids.every((id) => p.components.some((c: any) => c.getId() === id)));
    if (!page) return { ok: false, error: 'Los componentes tienen que estar en la misma pagina (y no a nivel de informe).' };
    const comps = ids.map((id) => page.components.find((c: any) => c.getId() === id));
    // Groups that already hold some of them are replaced by the new one (the editor does the same).
    const old = groupsOf(page).filter((g: any) => g.getComponents().some((c: any) => ids.includes(String(c.getId()))));
    const g = page.createGroup(comps, old);
    inj.get('wrapperSaveService').save([page]);
    return { ok: true, groupId: g && g.getId ? String(g.getId()) : undefined };
  } catch (e: any) {
    return { ok: false, error: String(e && e.message) };
  }
}

// ---------------------------------------------------------------------------
// chart style by name (verified 2026-11-07): series settings are display keys holding 20-slot arrays
// (seriesColor [{color}], seriesType, seriesLineWeight, seriesShowPoints, seriesShowDataLabel,
// seriesAxisIndex 0/1, seriesTrendlineType, seriesCumulative, seriesCompactNumbers, seriesDecimalPrecision);
// chart-wide keys: legend top|bottom|right|left + showLegend, showDataLabel, showStack, showAxis,
// showHAxisTitle, showLeftYAxisTitle, showRightYAxisTitle, leftYAxisViewWindowMin/Max, leftYAxisLogScale,
// gridColor. setDisplayKeyValue saves but the canvas repaints only after a reload.
// ---------------------------------------------------------------------------

export interface ChartSeriesStyle {
  /** 1-based series position, or the metric's display name. */
  series: number | string;
  color?: string;
  /** Only in combined (simple-combochart) and time series (simple-linechart) charts. */
  type?: 'bars' | 'line';
  lineWeight?: number;
  showPoints?: boolean;
  dataLabels?: boolean;
  axis?: 'left' | 'right';
  trendline?: 'none' | 'linear' | 'exponential' | 'polynomial';
  cumulative?: boolean;
  compact?: boolean;
  decimals?: number;
}

export interface ChartStyle {
  componentId: string;
  series?: ChartSeriesStyle[];
  legend?: 'top' | 'bottom' | 'right' | 'left' | 'none';
  dataLabels?: boolean;
  compactNumbers?: boolean;
  stacked?: boolean;
  axes?: { show?: boolean; xTitle?: boolean; yTitle?: boolean; rightTitle?: boolean; yMin?: number | null; yMax?: number | null; logScale?: boolean };
  gridColor?: string;
  /** The component's own title (drawn above its box). null hides it. */
  title?: { text: string; size?: number; bold?: boolean } | null;
}

export function chartStyleScript(args: ChartStyle): { ok: boolean; error?: string; set?: string[]; series?: string[] } {
  const w = window as any;
  try {
    const inj = w.angular.element(document.body).injector();
    const report = inj.get('legoUndoRedoService').report;
    const all = [...report.pages.flatMap((p: any) => p.components), ...report.components];
    const comp = all.find((c: any) => c.getId() === args.componentId);
    if (!comp) return { ok: false, error: `Componente ${args.componentId} no encontrado.` };
    const keys = comp.config.config.display.keys || {};
    const has = (k: string) => k in keys || (() => { try { return k in comp.getDefaultDisplayKeys(); } catch { return false; } })();
    const metrics: string[] = (comp.config.config.datasource.keys.metrics && comp.config.config.datasource.keys.metrics.value && comp.config.config.datasource.keys.metrics.value.primary) || [];
    let schema: any = {};
    try { schema = comp.getSchema().qe.concepts || {}; } catch { /* blended or not loaded */ }
    const label = (n: string) => {
      const d = comp.config.conceptDefs[n];
      const q = d && d.queryTimeTransformation;
      const dn = q && q.displayTransformation && q.displayTransformation.displayName;
      if (dn) return String(dn);
      const sf = q && q.dataTransformation && q.dataTransformation.sourceFieldName;
      return String((sf && schema[sf] && schema[sf].displayName) || sf || n);
    };
    const names = metrics.map(label);
    const set: string[] = [];
    const put = (k: string, v: unknown) => {
      if (!has(k)) throw new Error(`Este grafico (${comp.getDisplayType()}) no tiene la propiedad ${k}.`);
      comp.setDisplayKeyValue(k, v); set.push(k);
    };
    const hex = (c: string) => { if (!/^#[0-9a-f]{6}$/i.test(c)) throw new Error(`Color no valido: ${c} (#rrggbb).`); return c.toUpperCase(); };
    const arrays: Record<string, unknown[]> = {};
    const slot = (k: string, i: number, v: unknown) => {
      if (!arrays[k]) {
        if (!has(k)) throw new Error(`Este grafico (${comp.getDisplayType()}) no tiene series configurables (${k}).`);
        const cur = keys[k] && Array.isArray(keys[k].value) ? keys[k].value : [];
        arrays[k] = Array.from({ length: 20 }, (_, j) => (cur[j] === undefined ? null : cur[j]));
      }
      arrays[k]![i] = v;
    };
    for (const s of args.series || []) {
      const i = typeof s.series === 'number' ? s.series - 1 : names.findIndex((n) => n.toLowerCase() === String(s.series).toLowerCase());
      if (i < 0 || i >= 20) throw new Error(`Serie "${s.series}" no encontrada (metricas: ${names.join(', ') || 'ninguna'}).`);
      if (s.color) slot('seriesColor', i, { color: hex(s.color) });
      if (s.type) {
        if (!/combochart|linechart/.test(String(comp.getDisplayType()))) throw new Error(`Un grafico ${comp.getDisplayType()} no cambia el tipo de serie: usa un grafico combinado (combo-chart) o de serie temporal.`);
        slot('seriesType', i, s.type);
      }
      if (s.lineWeight !== undefined) slot('seriesLineWeight', i, s.lineWeight);
      if (s.showPoints !== undefined) slot('seriesShowPoints', i, s.showPoints);
      if (s.dataLabels !== undefined) slot('seriesShowDataLabel', i, s.dataLabels);
      if (s.axis) slot('seriesAxisIndex', i, s.axis === 'right' ? 1 : 0);
      if (s.trendline) slot('seriesTrendlineType', i, s.trendline);
      if (s.cumulative !== undefined) slot('seriesCumulative', i, s.cumulative);
      if (s.compact !== undefined) slot('seriesCompactNumbers', i, s.compact);
      if (s.decimals !== undefined) slot('seriesDecimalPrecision', i, s.decimals);
    }
    for (const [k, v] of Object.entries(arrays)) put(k, v);
    if (args.legend) { put('showLegend', args.legend !== 'none'); if (args.legend !== 'none') put('legend', args.legend); }
    if (args.dataLabels !== undefined) put('showDataLabel', args.dataLabels);
    if (args.compactNumbers !== undefined) put('compactNumbers', args.compactNumbers);
    if (args.stacked !== undefined) put('showStack', args.stacked);
    const a = args.axes;
    if (a) {
      if (a.show !== undefined) put('showAxis', a.show);
      if (a.xTitle !== undefined) put('showHAxisTitle', a.xTitle);
      if (a.yTitle !== undefined) put('showLeftYAxisTitle', a.yTitle);
      if (a.rightTitle !== undefined) put('showRightYAxisTitle', a.rightTitle);
      if (a.yMin !== undefined) put('leftYAxisViewWindowMin', a.yMin);
      if (a.yMax !== undefined) put('leftYAxisViewWindowMax', a.yMax);
      if (a.logScale !== undefined) put('leftYAxisLogScale', a.logScale);
    }
    if (args.gridColor) put('gridColor', { color: hex(args.gridColor), opacity: 1 });
    if (args.title === null) put('chartTitleShowTitle', false);
    else if (args.title) {
      put('chartTitleShowTitle', true);
      put('chartTitleText', args.title.text);
      if (args.title.size) put('chartTitleFontSize', args.title.size);
      if (args.title.bold !== undefined) put('chartTitleBold', args.title.bold);
    }
    if (!set.length) return { ok: false, error: 'No hay nada que cambiar.' };
    inj.get('wrapperSaveService').save([comp]);
    return { ok: true, set, series: names };
  } catch (e: any) {
    return { ok: false, error: String(e && e.message) };
  }
}

/** Effective chart style (overrides merged with the type's defaults), in set_chart_style's terms. */
export function readChartStyleScript(componentId: string): { ok: boolean; error?: string; style?: Record<string, unknown> } {
  const w = window as any;
  try {
    const report = w.angular.element(document.body).injector().get('legoUndoRedoService').report;
    const all = [...report.pages.flatMap((p: any) => p.components.map((c: any) => [p, c])), ...report.components.map((c: any) => [null, c])];
    const hit = all.find(([, c]: any) => c.getId() === componentId);
    if (!hit) return { ok: false, error: `Componente ${componentId} no encontrado.` };
    const [pg, comp] = hit;
    const type = String(comp.getDisplayType());
    const eff = (k: string) => { try { return comp.getDisplayKeyValue(k); } catch { return undefined; } };
    const metrics: string[] = (comp.config.config.datasource.keys.metrics && comp.config.config.datasource.keys.metrics.value && comp.config.config.datasource.keys.metrics.value.primary) || [];
    let schema: any = {};
    try { schema = comp.getSchema().qe.concepts || {}; } catch { /* not loaded */ }
    const label = (n: string) => {
      const q = comp.config.conceptDefs[n] && comp.config.conceptDefs[n].queryTimeTransformation;
      const dn = q && q.displayTransformation && q.displayTransformation.displayName;
      const sf = q && q.dataTransformation && q.dataTransformation.sourceFieldName;
      return String(dn || (sf && schema[sf] && schema[sf].displayName) || sf || n);
    };
    const at = (k: string, i: number) => { const v = eff(k); return Array.isArray(v) ? v[i] : undefined; };
    const set = (v: unknown) => v !== undefined && v !== null;
    const combo = /combochart/.test(type);
    const series = metrics.map((n, i) => {
      const ax = at('seriesAxisIndex', i);
      const col = at('seriesColor', i);
      return {
        series: i + 1,
        name: label(n),
        color: col && col.color ? col.color : '(tema)',
        ...(set(at('seriesType', i)) ? { type: at('seriesType', i) } : {}),
        axis: (set(ax) ? ax : combo && i > 0 ? 1 : 0) === 1 ? 'right' : 'left',
        dataLabels: at('seriesShowDataLabel', i) ?? null,
        ...(set(at('seriesLineWeight', i)) ? { lineWeight: at('seriesLineWeight', i) } : {}),
        ...(set(at('seriesShowPoints', i)) ? { showPoints: at('seriesShowPoints', i) } : {}),
        ...(at('seriesTrendlineType', i) && at('seriesTrendlineType', i) !== 'none' ? { trendline: at('seriesTrendlineType', i) } : {}),
      };
    });
    const showLegend = eff('showLegend');
    return {
      ok: true,
      style: {
        componentId, type, pageId: pg ? String(pg.getId()) : null, series,
        legend: showLegend === false ? 'none' : eff('legend') ?? null,
        dataLabels: eff('showDataLabel') ?? null,
        stacked: eff('showStack') ?? null,
        axes: { show: eff('showAxis') ?? null, xTitle: eff('showHAxisTitle') ?? null, yTitle: eff('showLeftYAxisTitle') ?? null, rightTitle: eff('showRightYAxisTitle') ?? null, yMin: eff('leftYAxisViewWindowMin') ?? null, yMax: eff('leftYAxisViewWindowMax') ?? null },
      },
    };
  } catch (e: any) {
    return { ok: false, error: String(e && e.message) };
  }
}

// ---------------------------------------------------------------------------
// comparison period and page links (verified 2026-11-07 against a published template):
//  datasource key compareDateDuration = {anchorType: 1, config: {startOffsetUnit: 9 (previous period) | 8
//  (previous year), startOffset: 1, endOffsetUnit: same, endOffset: 1}}; {anchorType: 0, config: {}} = none.
//  A scorecard shows the delta only with display key hideCompare=false.
//  Button to a page: display keys internalLink=<pageId>, actionType 1, internalActionType 1, linkType 1.
// ---------------------------------------------------------------------------

export function comparisonScript(args: { componentId: string; comparison: 'none' | 'previous_period' | 'previous_year' }): { ok: boolean; error?: string; set?: string[] } {
  const w = window as any;
  try {
    const inj = w.angular.element(document.body).injector();
    const report = inj.get('legoUndoRedoService').report;
    const all = [...report.pages.flatMap((p: any) => p.components), ...report.components];
    const comp = all.find((c: any) => c.getId() === args.componentId);
    if (!comp) return { ok: false, error: `Componente ${args.componentId} no encontrado.` };
    const keys = comp.config.config.datasource && comp.config.config.datasource.keys;
    if (!keys || !('compareDateDuration' in keys)) {
      let ok = false;
      try { ok = 'compareDateDuration' in (comp.getAllDataSourceKeys ? comp.getAllDataSourceKeys() : {}); } catch { /* none */ }
      if (!ok) return { ok: false, error: `Un ${comp.config.config.display.type} no admite periodo de comparacion.` };
    }
    const unit = args.comparison === 'previous_year' ? 8 : 9;
    const value = args.comparison === 'none' ? { anchorType: 0, config: {} } : { anchorType: 1, config: { startOffsetUnit: unit, startOffset: 1, endOffsetUnit: unit, endOffset: 1 } };
    comp.setDataSourceKeyValue('compareDateDuration', value);
    const set = ['compareDateDuration'];
    if (comp.config.config.display.type === 'kpi-metric') { comp.setDisplayKeyValue('hideCompare', args.comparison === 'none'); set.push('hideCompare'); }
    inj.get('wrapperSaveService').save([comp]);
    return { ok: true, set };
  } catch (e: any) {
    return { ok: false, error: String(e && e.message) };
  }
}

export function pageLinkScript(args: { componentId: string; pageId: string }): { ok: boolean; error?: string; page?: string } {
  const w = window as any;
  try {
    const inj = w.angular.element(document.body).injector();
    const report = inj.get('legoUndoRedoService').report;
    const all = [...report.pages.flatMap((p: any) => p.components), ...report.components];
    const comp = all.find((c: any) => c.getId() === args.componentId);
    if (!comp) return { ok: false, error: `Componente ${args.componentId} no encontrado.` };
    const ty = comp.config.config.display.type;
    if (ty !== 'button' && ty !== 'image-component') return { ok: false, error: 'El enlace a una pagina va en un boton o una imagen.' };
    const target = report.pages.find((p: any) => String(p.getId()) === args.pageId);
    if (!target) return { ok: false, error: `Pagina ${args.pageId} no encontrada (ids en list_pages).` };
    const name = String((target.config.attribute && target.config.attribute.name) || '');
    const keys: Record<string, unknown> = ty === 'button'
      ? { internalLink: args.pageId, actionType: 1, internalActionType: 1, linkType: 1, linkUrl: `http://${name}`, linkNewTab: false }
      : { internalLink: args.pageId, linkUrl: `http://${name}`, linkNewTab: false };
    for (const [k, v] of Object.entries(keys)) comp.setDisplayKeyValue(k, v);
    inj.get('wrapperSaveService').save([comp]);
    return { ok: true, page: name };
  } catch (e: any) {
    return { ok: false, error: String(e && e.message) };
  }
}

// ---------------------------------------------------------------------------
// chart interactions (read 2026-11-07 from a published template): they live in comp.config.behavior.
//  onMetricSelect: [{action: 'metric-selector', isControl: false, resource: {type: 'concepts', value: [concept...]}}]
//    the optional metrics the viewer can switch to (the chart's own metrics stay in metrics.primary).
//  onDrillDown + onTooltipOrHeaderClick: [{action: 'drill-down', isControl: false, resource: {type: 'concepts',
//    value: [levels...]}}]; a date drills as [transformationType 3, 4, the date itself] (month, week, day).
//  onSelect: [{action: 'cross-filtering', isControl: false}] makes a click filter the rest of the page.
// ---------------------------------------------------------------------------

export function chartInteractionsScript(args: {
  componentId: string;
  /** Move this many trailing metrics of metrics.primary into the metric selector. */
  toSelector?: number;
  clearSelector?: boolean;
  dateDrill?: boolean;
  /** Level shown first: month (default) or day. */
  drillStart?: 'month' | 'day';
  crossFilter?: boolean;
}): { ok: boolean; error?: string; selector?: string[]; drill?: string[]; crossFilter?: boolean } {
  const w = window as any;
  try {
    const inj = w.angular.element(document.body).injector();
    const report = inj.get('legoUndoRedoService').report;
    const all = [...report.pages.flatMap((p: any) => p.components), ...report.components];
    const comp = all.find((c: any) => c.getId() === args.componentId);
    if (!comp) return { ok: false, error: `Componente ${args.componentId} no encontrado.` };
    const cfg = comp.config;
    cfg.behavior = cfg.behavior || {};
    const beh = cfg.behavior;
    const keys = cfg.config.datasource.keys;
    let schema: any = {};
    try { schema = comp.getSchema().qe.concepts || {}; } catch { /* not loaded */ }
    const label = (n: string) => {
      const q = cfg.conceptDefs[n] && cfg.conceptDefs[n].queryTimeTransformation;
      const dn = q && q.displayTransformation && q.displayTransformation.displayName;
      const sf = q && q.dataTransformation && q.dataTransformation.sourceFieldName;
      return String(dn || (sf && schema[sf] && schema[sf].displayName) || sf || n);
    };
    const conceptObj = (n: string, type: number, dataType: number) => {
      const d = JSON.parse(JSON.stringify(cfg.conceptDefs[n]));
      return { id: d.id || `t0.${n}`, name: n, namespace: d.namespace || 't0', displayName: label(n), type, dataType, isDefault: false, isAutoField: true, queryTimeTransformation: d.queryTimeTransformation };
    };
    const out: { selector?: string[]; drill?: string[]; crossFilter?: boolean } = {};
    if (args.clearSelector) { delete beh.onMetricSelect; out.selector = []; }
    if (args.toSelector) {
      const prim: string[] = keys.metrics.value.primary;
      if (args.toSelector >= prim.length) return { ok: false, error: 'El grafico tiene que conservar al menos una metrica propia.' };
      const moved = prim.slice(prim.length - args.toSelector);
      keys.metrics.value.primary = prim.slice(0, prim.length - args.toSelector);
      const prev = beh.onMetricSelect && beh.onMetricSelect[0] && beh.onMetricSelect[0].resource ? beh.onMetricSelect[0].resource.value : [];
      const fresh = moved.map((n) => conceptObj(n, 1, 5));
      // Re-applying a spec binds the optional metrics again: keep one entry per display name.
      const value = [...prev.filter((v: any) => !moved.includes(v.name) && !fresh.some((f) => f.displayName === v.displayName)), ...fresh];
      beh.onMetricSelect = [{ action: 'metric-selector', isControl: false, resource: { type: 'concepts', value }, init: null }];
      out.selector = value.map((v: any) => v.displayName);
    }
    if (args.dateDrill) {
      const base: string | undefined = keys.dimensions && keys.dimensions.value && keys.dimensions.value.primary && keys.dimensions.value.primary[0];
      if (!base) return { ok: false, error: 'El grafico no tiene dimension.' };
      // Already drilling: the daily date is the last level of the existing list.
      const prevDrill = beh.onDrillDown && beh.onDrillDown[0] && beh.onDrillDown[0].resource && beh.onDrillDown[0].resource.value;
      if (prevDrill && prevDrill.length && prevDrill.some((v: any) => v.name === base) && base !== prevDrill[prevDrill.length - 1].name) { out.drill = prevDrill.map((v: any) => v.name); }
      else {
      const bd = cfg.conceptDefs[base];
      const tc = bd && bd.queryTimeTransformation && bd.queryTimeTransformation.dataTransformation && bd.queryTimeTransformation.dataTransformation.transformationConfig;
      if (tc && tc.transformationType) return { ok: false, error: 'La dimension ya esta agrupada (mes, semana...): usa la fecha diaria para desglosar.' };
      const levels: string[] = [];
      for (const t of [3, 4]) {
        let name = Object.keys(cfg.conceptDefs).find((n) => {
          const q = cfg.conceptDefs[n].queryTimeTransformation;
          return q && q.dataTransformation && q.dataTransformation.sourceFieldName === bd.queryTimeTransformation.dataTransformation.sourceFieldName && q.dataTransformation.transformationConfig && q.dataTransformation.transformationConfig.transformationType === t;
        });
        if (!name) {
          name = 'qt_' + Math.random().toString(36).slice(2, 12);
          const d = JSON.parse(JSON.stringify(bd));
          d.id = `${d.namespace || 't0'}.${name}`; d.name = name;
          d.queryTimeTransformation.dataTransformation.transformationConfig = { transformationType: t };
          d.queryTimeTransformation.displayTransformation = Object.assign({}, d.queryTimeTransformation.displayTransformation || {}, { outputSemanticInfo: { semanticConfig: [{ semanticType: t, dateTimeOptions: { useNativeDateTime: true } }] } });
          delete d.queryTimeTransformation.displayTransformation.displayName;
          cfg.conceptDefs[name] = d;
        }
        levels.push(name);
      }
      levels.push(base);
      const value = levels.map((n) => conceptObj(n, 0, 6));
      const act = () => [{ action: 'drill-down', isControl: false, resource: { type: 'concepts', value: JSON.parse(JSON.stringify(value)) } }];
      beh.onDrillDown = act();
      beh.onTooltipOrHeaderClick = act();
      out.drill = ['mes', 'semana', label(base)];
      if (args.drillStart !== 'day') {
        // Start at month: the chart's dimension becomes the month level, and its sort follows.
        const month = levels[0]!;
        keys.dimensions.value.primary = [month, ...keys.dimensions.value.primary.slice(1)];
        const sd = keys.sortData && Array.isArray(keys.sortData.value) ? keys.sortData.value : [];
        for (const s of sd) if (s.sortColumn === base) s.sortColumn = month;
        for (const a of (beh.onSort || [])) {
          const so = a && a.init && a.init.sortOptions;
          for (const s of (so && so.sortData) || []) if (s.sortColumn && s.sortColumn.name === base) { s.sortColumn.name = month; s.sortColumn.dataTransformation = JSON.parse(JSON.stringify(cfg.conceptDefs[month].queryTimeTransformation.dataTransformation)); }
        }
        out.drill = ['mes (inicio)', 'semana', label(base)];
      }
      }
    }
    if (args.crossFilter !== undefined) {
      if (args.crossFilter) beh.onSelect = [{ action: 'cross-filtering', isControl: false }];
      else delete beh.onSelect;
      out.crossFilter = args.crossFilter;
    }
    inj.get('wrapperSaveService').save([comp]);
    return { ok: true, ...out };
  } catch (e: any) {
    return { ok: false, error: String(e && e.message) };
  }
}

// ---------------------------------------------------------------------------
// images (verified 2026-11-07): this editor has no image URL option, only "Selecciona un archivo". Uploading
// through any input[type=file].file-upload-input creates a NEW image component on the current page whose display
// key file = {name, type, id}. That value can be set on any other image of the same report, so a file is uploaded once.
// ---------------------------------------------------------------------------

export function imageComponentsScript(): Array<{ id: string; pageId: string | null; file: { name?: string; id?: string; type?: string } | null }> {
  const w = window as any;
  const report = w.angular.element(document.body).injector().get('legoUndoRedoService').report;
  const rows: Array<{ id: string; pageId: string | null; file: any }> = [];
  const add = (c: any, pageId: string | null) => {
    if (c.config.config.display.type !== 'image-component') return;
    const f = c.config.config.display.keys.file;
    rows.push({ id: String(c.getId()), pageId, file: f && f.value && f.value.id ? JSON.parse(JSON.stringify(f.value)) : null });
  };
  for (const p of report.pages) for (const c of p.components) add(c, String(p.getId()));
  for (const c of report.components) add(c, null);
  return rows;
}

/** "report" if the component is at report level (on every page), "page" if on a page, null if missing. */
export function componentLevelScript(id: string): 'report' | 'page' | null {
  const report = (window as any).angular.element(document.body).injector().get('legoUndoRedoService').report;
  if (report.components.some((c: any) => c.getId() === id)) return 'report';
  if (report.pages.some((p: any) => p.components.some((c: any) => c.getId() === id))) return 'page';
  return null;
}
