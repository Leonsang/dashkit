import { createRequire as __lsCreateRequire } from 'node:module'; const require = __lsCreateRequire(import.meta.url);

// src/looker/scripts4.ts
function navPagesScript() {
  const w = window;
  const inj = w.angular.element(document.body).injector();
  const report = inj.get("legoUndoRedoService").report;
  let s;
  inj.get("store").subscribe((x) => s = x).unsubscribe();
  const items = s && s.reportNavigation && s.reportNavigation.navigationInfo && s.reportNavigation.navigationInfo.navItems || [];
  const flat = [];
  const walk = (list, sectionId) => {
    for (const it of list) {
      if (it.page) flat.push({ it, sectionId });
      const kids = it.section && (it.section.navItems || it.section.items);
      if (Array.isArray(kids)) walk(kids, String(it.section.sectionId || it.itemId || ""));
    }
  };
  walk(items, null);
  const byId = new Map(report.pages.map((p) => [String(p.getId()), p]));
  return flat.map(({ it, sectionId }, i) => {
    const p = byId.get(String(it.page.pageId));
    return {
      pageId: String(it.page.pageId),
      index: i,
      displayName: String(it.page.displayName || ""),
      modelName: p ? String(p.config.attribute && p.config.attribute.name || "") : "",
      sectionId: sectionId || (it.sectionId ? String(it.sectionId) : null),
      hiddenFromNav: !!(it.hiddenFromNav || it.page.hiddenFromNav),
      hiddenFromViewer: !!(it.hiddenFromViewer || it.page.hiddenFromViewer),
      components: p ? p.components.length : 0
    };
  });
}
async function navDispatchScript(args) {
  const w = window;
  try {
    const store = w.angular.element(document.body).injector().get("store");
    store.dispatch({ type: `[ReportNavigation] ${args.type}`, ...args.payload });
    await new Promise((r) => setTimeout(r, 2500));
    return { ok: true };
  } catch (e) {
    return { ok: false, error: String(e && e.message) };
  }
}
function listBlendsScript() {
  const w = window;
  const report = w.angular.element(document.body).injector().get("legoUndoRedoService").report;
  const res = report.config.resource && report.config.resource.dataViewResource || {};
  const TYPES = { 0: "unknown", 1: "inner", 2: "full", 3: "left", 4: "right", 5: "union", 101: "cross" };
  const all = [...report.pages.flatMap((p) => p.components), ...report.components];
  const out = [];
  for (const [id, v] of Object.entries(res)) {
    const bd = v && v.blockDatasource;
    if (!bd) continue;
    const tables = [];
    const joins = [];
    const conceptField = /* @__PURE__ */ new Map();
    const visit = (node) => {
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
        const conds = node.join.condition && node.join.condition.and && node.join.condition.and.conditions || [];
        joins.push({
          type: TYPES[node.join.type] || String(node.join.type),
          keys: conds.map((c) => c.boolean && c.boolean.joinKeyPair).filter(Boolean).map((k) => ({ left: conceptField.get(k.leftName) || k.leftName, right: conceptField.get(k.rightName) || k.rightName }))
        });
      }
    };
    for (const b of bd.blocks || []) visit(b.treeQueryBlockConfig);
    const outFields = bd.datasourceBlock && bd.datasourceBlock.fields || [];
    const fields = outFields.map((f) => String(f.outputName));
    const visible = (sf) => {
      const f = outFields.find((x) => x.field && typeof x.field.name === "string" && (x.field.name.startsWith(`${sf}__dv`) || x.field.name.startsWith(`${sf}_dv`)));
      return f ? String(f.outputName) : sf;
    };
    for (const j of joins) j.keys = j.keys.map((k) => ({ left: visible(k.left), right: visible(k.right) }));
    const usedBy = all.filter((c) => {
      try {
        const k = c.config.config.datasource.keys;
        return k.dataViewActive && k.dataViewActive.value && k.dataViewResource && k.dataViewResource.value === id;
      } catch {
        return false;
      }
    }).map((c) => String(c.getId()));
    out.push({ blendId: id, name: String(bd.datasourceBlock && bd.datasourceBlock.name || ""), tables, joins, fields: [...new Set(fields)], usedBy });
  }
  return out;
}
function updateBlendScript(args) {
  const w = window;
  try {
    const inj = w.angular.element(document.body).injector();
    const report = inj.get("legoUndoRedoService").report;
    const res = report.config.resource.dataViewResource || {};
    const v = res[args.blendId];
    if (!v) return { ok: false, error: `No hay una combinacion ${args.blendId}.` };
    const copy = JSON.parse(JSON.stringify(v));
    const bd = copy.blockDatasource;
    if (args.name !== void 0) bd.datasourceBlock.name = args.name;
    if (args.joinType !== void 0) {
      const visit = (node) => {
        if (!node || !node.join) return;
        node.join.type = args.joinType;
        if (args.joinType === 101) delete node.join.condition;
        visit(node.join.left);
        visit(node.join.right);
      };
      for (const b of bd.blocks || []) visit(b.treeQueryBlockConfig);
    }
    report.updateResourceById("dataViewResource", args.blendId, copy);
    inj.get("wrapperSaveService").save([report]);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: String(e && e.message) };
  }
}
function blendSnapshotScript() {
  const w = window;
  const report = w.angular.element(document.body).injector().get("legoUndoRedoService").report;
  const all = [...report.pages.flatMap((p) => p.components), ...report.components];
  return {
    blends: Object.keys(report.config.resource && report.config.resource.dataViewResource || {}),
    blended: all.filter((c) => {
      try {
        const k = c.config.config.datasource.keys;
        return !!(k.dataViewActive && k.dataViewActive.value);
      } catch {
        return false;
      }
    }).map((c) => String(c.getId())),
    components: all.map((c) => String(c.getId()))
  };
}
function componentPointsScript(ids) {
  const w = window;
  const report = w.angular.element(document.body).injector().get("legoUndoRedoService").report;
  const cv = document.querySelector(".ng2-canvas-container");
  if (!cv) return ids.map(() => null);
  const all = [...report.pages.flatMap((p) => p.components), ...report.components];
  const z = cv.getBoundingClientRect().width / (Number(report.config.attribute && report.config.attribute.width) || 1200);
  let scroller = cv.parentElement;
  while (scroller && scroller.scrollHeight <= scroller.clientHeight) scroller = scroller.parentElement;
  return ids.map((id) => {
    const c = all.find((x) => x.getId() === id);
    if (!c) return null;
    const a = c.getAttribute();
    let r = cv.getBoundingClientRect();
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
function selectedIdsScript() {
  const w = window;
  return w.angular.element(document.body).injector().get("selectedComponentService").getSelectedComponents().map((c) => String(c.getId()));
}
function menuItemPointScript(texts) {
  const rx = new RegExp(`^(${texts.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})$`);
  const els = Array.from(document.querySelectorAll("*")).filter((e2) => e2.offsetParent && e2.children.length <= 2 && rx.test((e2.innerText || "").trim()) && e2.closest(".mat-mdc-menu-panel, [role=menu]"));
  const e = els[els.length - 1];
  if (!e) return null;
  e.scrollIntoView({ block: "center" });
  const q = e.getBoundingClientRect();
  const item = e.closest("[role=menuitem], button") || e;
  return { x: q.x + q.width / 2, y: q.y + q.height / 2, disabled: item.getAttribute("aria-disabled") === "true" || item.disabled === true };
}
function arrangeScript(args) {
  const w = window;
  try {
    const inj = w.angular.element(document.body).injector();
    const report = inj.get("legoUndoRedoService").report;
    const save = inj.get("wrapperSaveService");
    if (args.op === "report" || args.op === "page") {
      const page = args.pageId ? report.getPage(args.pageId) : report.pages.find((p) => args.componentIds.some((id) => p.hasComponent(p.getComponent && p.getComponent(id))));
      const target = page || report.pages.find((p) => p.getId() === (report.selected && report.selected.getId && report.selected.getId()));
      if (!target) return { ok: false, error: "Pagina no encontrada (indica pageId)." };
      if (args.op === "report") {
        const comps = args.componentIds.map((id) => target.getComponent(id)).filter(Boolean);
        if (!comps.length) return { ok: false, error: "Componentes no encontrados en esa pagina." };
        report.makeComponentsGlobal(target, comps);
      } else {
        const comps = args.componentIds.map((id) => report.getComponent(id)).filter(Boolean);
        if (!comps.length) return { ok: false, error: "Componentes de informe no encontrados." };
        report.makeComponentsLocal(target, comps);
      }
      save.save([report, target]);
      return { ok: true, ids: report.getSelectedComponents ? report.getSelectedComponents().map((c) => String(c.getId())) : [] };
    }
    for (const id of args.componentIds) {
      const owner = report.pages.find((p) => p.getComponent(id)) || (report.getComponent(id) ? report : null);
      if (!owner) return { ok: false, error: `Componente ${id} no encontrado.` };
      const c = owner.getComponent(id);
      const fn = { front: "moveComponentToTheFront", back: "moveComponentToTheEnd", forward: "moveComponentForward", backward: "moveComponentBackward" }[args.op];
      owner[fn](c);
      save.save([owner]);
    }
    return { ok: true };
  } catch (e) {
    return { ok: false, error: String(e && e.message) };
  }
}
function setControlParameterScript(args) {
  const w = window;
  try {
    const inj = w.angular.element(document.body).injector();
    const report = inj.get("legoUndoRedoService").report;
    const all = [...report.pages.flatMap((p) => p.components), ...report.components];
    const comp = all.find((c) => c.getId() === args.componentId);
    if (!comp) return { ok: false, error: `Componente ${args.componentId} no encontrado.` };
    const keys = comp.config.config.display && comp.config.config.display.keys;
    if (!keys || !("controlParameter" in keys || comp.getDisplayType() === "dimension-filter")) return { ok: false, error: `${comp.getDisplayType()} no es un control que acepte parametros.` };
    comp.setDisplayKeyValue("controlParameter", { parameterKey: args.parameterKey });
    comp.setDisplayKeyValue("singleSelect", true);
    const dv = comp.config.config.datasource.keys.dimensions && comp.config.config.datasource.keys.dimensions.value;
    if (dv && Array.isArray(dv.primary) && dv.primary.length) comp.updateDimensions("primary", []);
    const sd = comp.config.config.datasource.keys.sortData;
    if (sd && Array.isArray(sd.value) && sd.value.length && typeof comp.setDataSourceKeyValue === "function") comp.setDataSourceKeyValue("sortData", [], true, true);
    comp.syncState && comp.syncState();
    inj.get("wrapperSaveService").save([comp]);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: String(e && e.message) };
  }
}
function setTextScript(args) {
  const w = window;
  try {
    const inj = w.angular.element(document.body).injector();
    const report = inj.get("legoUndoRedoService").report;
    const all = [...report.pages.flatMap((p) => p.components), ...report.components];
    const comp = all.find((c) => c.getId() === args.componentId);
    if (!comp) return { ok: false, error: `Componente ${args.componentId} no encontrado.` };
    if (comp.getDisplayType() !== "simple-description") return { ok: false, error: `${comp.getDisplayType()} no es un cuadro de texto (simple-description).` };
    comp.setDisplayKeyValue("text", args.html);
    inj.get("wrapperSaveService").save([comp]);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: String(e && e.message) };
  }
}
function deleteBlendScript(blendId) {
  const w = window;
  try {
    const inj = w.angular.element(document.body).injector();
    const report = inj.get("legoUndoRedoService").report;
    const res = report.config.resource.dataViewResource || {};
    if (!res[blendId]) return { ok: false, error: `No hay una combinacion ${blendId}.` };
    const all = [...report.pages.flatMap((p) => p.components), ...report.components];
    const users = all.filter((c) => {
      try {
        const k = c.config.config.datasource.keys;
        return k.dataViewResource && k.dataViewResource.value === blendId;
      } catch {
        return false;
      }
    });
    if (users.length) return { ok: false, error: `La combinacion la usan ${users.map((c) => c.getId()).join(", ")}: borralos o cambialos antes.` };
    report.removeResource("dataViewResource", blendId);
    inj.get("wrapperSaveService").save([report]);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: String(e && e.message) };
  }
}
async function ensureSeedScript(pageId) {
  const w = window;
  try {
    const inj = w.angular.element(document.body).injector();
    const report = inj.get("legoUndoRedoService").report;
    const all = [...report.pages.flatMap((p) => p.components), ...report.components];
    if (all.length) return { seedId: null };
    const page = pageId && report.pages.find((p) => String(p.getId()) === pageId) || void 0;
    const c = await inj.get("createComponentService").create({
      type: "simple-description",
      geometry: { top: 0, left: 0, width: 20, height: 20 },
      creationMethod: "Insert",
      ...page ? { parent: page } : {}
    });
    return { seedId: c && c.getId ? String(c.getId()) : null };
  } catch (e) {
    return { seedId: null, error: String(e && e.message) };
  }
}
function setDisplayKeysScript(args) {
  const w = window;
  try {
    const inj = w.angular.element(document.body).injector();
    const report = inj.get("legoUndoRedoService").report;
    const all = [...report.pages.flatMap((p) => p.components), ...report.components];
    const comp = all.find((c) => c.getId() === args.componentId);
    if (!comp) return { ok: false, error: `Componente ${args.componentId} no encontrado.` };
    const set = [];
    for (const [k, v] of Object.entries(args.keys)) {
      comp.setDisplayKeyValue(k, v);
      set.push(k);
    }
    inj.get("wrapperSaveService").save([comp]);
    return { ok: true, set };
  } catch (e) {
    return { ok: false, error: String(e && e.message) };
  }
}

export {
  navPagesScript,
  navDispatchScript,
  listBlendsScript,
  updateBlendScript,
  blendSnapshotScript,
  componentPointsScript,
  selectedIdsScript,
  menuItemPointScript,
  arrangeScript,
  setControlParameterScript,
  setTextScript,
  deleteBlendScript,
  ensureSeedScript,
  setDisplayKeysScript
};
