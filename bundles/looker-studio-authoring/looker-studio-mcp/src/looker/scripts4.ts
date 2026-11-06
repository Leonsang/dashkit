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
    let y = r.y + (a.top + Math.min(30, a.height / 2)) * z;
    if ((y > window.innerHeight - 60 || y < 160) && scroller) {
      scroller.scrollTop += y - window.innerHeight / 2;
      r = cv.getBoundingClientRect();
      y = r.y + (a.top + Math.min(30, a.height / 2)) * z;
    }
    return { id, x: r.x + (a.left + a.width / 2) * z, y };
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
