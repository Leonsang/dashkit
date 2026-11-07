import { createRequire as __lsCreateRequire } from 'node:module'; const require = __lsCreateRequire(import.meta.url);
import {
  applyBoxModelScript,
  bindFieldsScript,
  createComponent,
  deleteComponent,
  evaluate,
  evaluateOn,
  getReportPage,
  getTemplate,
  learn,
  openReport,
  probeReadScript,
  probeStartScript,
  readDataSourcesScript,
  reloadReport,
  requireEditMode,
  resolveDataset
} from "./chunk-ESSLXUCI.js";
import {
  arrangeScript,
  blendSnapshotScript,
  chartInteractionsScript,
  chartStyleScript,
  comparisonScript,
  componentBoxesScript,
  componentPointsScript,
  deleteBlendScript,
  editBlendScript,
  groupScript,
  imageComponentsScript,
  listBlendsScript,
  menuItemPointScript,
  navDispatchScript,
  navPagesScript,
  pageLinkScript,
  readChartStyleScript,
  selectedIdsScript,
  setConditionalFormatScript,
  setControlParameterScript,
  setDisplayKeysScript,
  setTextScript,
  updateBlendScript
} from "./chunk-3SD32QSA.js";

// src/looker/data.ts
var EVAL_TIMEOUT_MS = Number(process.env.LS_EVAL_TIMEOUT_MS ?? 15e3);
async function inspectDataSources() {
  return evaluate(readDataSourcesScript);
}
async function bindFieldsToComponent(args) {
  const { page } = await requireEditMode();
  const res = await evaluateOn(page, EVAL_TIMEOUT_MS, bindFieldsScript, args);
  if (!res.ok) {
    const extra = res.warnings.length ? ` (${res.warnings.join(" ")})` : "";
    throw new Error((res.error ?? `No se pudieron vincular campos a ${args.componentId}.`) + extra);
  }
  return res;
}

// src/looker/boxModel.ts
var EVAL_TIMEOUT_MS2 = Number(process.env.LS_EVAL_TIMEOUT_MS ?? 15e3);
function normalizePadding(p) {
  if (p === void 0) return void 0;
  if (typeof p === "number") return { top: p, right: p, bottom: p, left: p };
  return p;
}
async function setComponentBoxModel(input) {
  const { page } = await requireEditMode();
  const args = {
    componentId: input.componentId,
    ...input.padding !== void 0 ? { padding: normalizePadding(input.padding) } : {},
    ...input.dimensions ? { dimensions: input.dimensions } : {},
    ...input.position ? { position: input.position } : {}
  };
  const res = await evaluateOn(page, EVAL_TIMEOUT_MS2, applyBoxModelScript, args);
  if (!res.ok) throw new Error(res.error ?? `No se pudo aplicar el box model a ${input.componentId}.`);
  return res;
}

// src/ops4.ts
var T = Number(process.env.LS_EVAL_TIMEOUT_MS ?? 15e3);
var sleep = (ms) => new Promise((r) => setTimeout(r, ms));
var JOIN_TYPES = { inner: 1, full: 2, left: 3, right: 4, cross: 101 };
var lastClickTrace = "";
async function clickComponents(page, ids, opts = {}) {
  await page.keyboard.press("Escape");
  await sleep(300);
  const pts = await evaluateOn(page, T, componentPointsScript, ids);
  if (pts.some((p) => !p)) throw new Error(`No se encontraron en el lienzo: ${ids.filter((_, i) => !pts[i]).join(", ")}`);
  const trace = [];
  for (let i = 0; i < pts.length; i++) {
    const p = pts[i];
    if (i > 0) await page.keyboard.down("Shift");
    await page.mouse.click(p.x, p.y);
    if (i > 0) await page.keyboard.up("Shift");
    await sleep(500);
    trace.push(`${p.id}@${Math.round(p.x)},${Math.round(p.y)}->[${(await evaluateOn(page, T, selectedIdsScript)).join(" ")}]`);
  }
  lastClickTrace = trace.join(" ");
  if (opts.button === "right") {
    await sleep(1500);
    const last = pts[pts.length - 1];
    await page.evaluate((x, y) => {
      const el = document.elementFromPoint(x, y);
      el?.dispatchEvent(new MouseEvent("contextmenu", { bubbles: true, cancelable: true, clientX: x, clientY: y, button: 2, buttons: 2, view: window }));
    }, last.x, last.y);
    await sleep(1300);
    trace.push(`right->[${(await evaluateOn(page, T, selectedIdsScript)).join(" ")}]`);
    lastClickTrace = trace.join(" ");
  }
  return evaluateOn(page, T, selectedIdsScript);
}
async function clickText(page, re, scope = "*") {
  const box = await page.evaluate((sel, src, flags) => {
    const rx = new RegExp(src, flags);
    const els = Array.from(document.querySelectorAll(sel)).filter((e) => e.offsetParent && e.children.length <= 3 && rx.test((e.innerText || "").trim()));
    const el = els[els.length - 1];
    if (!el) return null;
    el.scrollIntoView({ block: "center" });
    const r = el.getBoundingClientRect();
    return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
  }, scope, re.source, re.flags);
  if (!box) return false;
  await page.mouse.click(box.x, box.y);
  return true;
}
async function ensureVisible(page) {
  await page.bringToFront();
  if (!await page.evaluate(() => document.hidden).catch(() => false)) return;
  const s = await page.target().createCDPSession();
  try {
    const { windowId } = await s.send("Browser.getWindowForTarget");
    await s.send("Browser.setWindowBounds", { windowId, bounds: { windowState: "minimized" } });
    await sleep(600);
    await s.send("Browser.setWindowBounds", { windowId, bounds: { windowState: "normal" } });
    await sleep(1200);
    await page.bringToFront();
  } finally {
    await s.detach().catch(() => void 0);
  }
  if (await page.evaluate(() => document.hidden).catch(() => false)) throw new Error("La ventana del navegador sigue oculta: ponla delante y repite.");
}
async function withViewport(page, fn) {
  await ensureVisible(page);
  const real = await page.evaluate(() => ({ w: window.innerWidth, h: window.innerHeight }));
  const emulate = real.w < 1500 || real.h < 800;
  if (emulate) {
    await page.setViewport({ width: 1900, height: 1100 });
    await sleep(800);
  }
  try {
    return await fn();
  } finally {
    if (emulate) await page.setViewport(null).catch(() => void 0);
  }
}
async function listBlends() {
  return evaluateOn(await getReportPage(), T, listBlendsScript);
}
async function datasetFields(page, id) {
  const ds = await evaluateOn(page, T, readDataSourcesScript);
  const hit = ds.dataSources.find((d) => d.dataSourceId === id);
  if (hit && hit.fields.length) return hit.fields.map((f) => ({ id: f.id, name: f.name, dataType: f.dataType }));
  const st = await evaluateOn(page, T, probeStartScript, { datasetId: id, template: getTemplate("kpi-metric") });
  if (!st.ok) throw new Error(`No se pudo leer el esquema del origen ${id}: ${st.error}`);
  let pr = { ready: false, fields: [] };
  for (let i = 0; i < 24 && !pr.ready; i++) {
    await sleep(250);
    pr = await evaluateOn(page, T, probeReadScript, i === 23);
  }
  if (!pr.fields.length) throw new Error(`El origen ${id} no devolvio campos.`);
  const DT = { 0: "TEXT", 2: "NUMBER", 3: "BOOLEAN", 6: "DATE", 7: "DATETIME" };
  return pr.fields.map((f) => ({ id: f.id, name: f.name, dataType: DT[f.dataType] ?? "TEXT" }));
}
var keyPairs = (keys) => (keys ?? []).map((k) => typeof k === "string" ? { left: k, right: k } : k);
async function updateBlend(args) {
  const { page } = await requireEditMode();
  const jtOf = (j) => {
    if (j === void 0) return void 0;
    const v = JOIN_TYPES[j];
    if (v === void 0) throw new Error(`joinType no valido: ${j}. Usa ${Object.keys(JOIN_TYPES).join(", ")}.`);
    return v;
  };
  const jt = jtOf(args.joinType);
  const out = {};
  if (args.addTable || args.removeTable !== void 0 || args.setKeys) {
    const blend2 = (await evaluateOn(page, T, listBlendsScript)).find((b) => b.blendId === args.blendId);
    if (!blend2) throw new Error(`Combinacion ${args.blendId} no encontrada (ids en list_blends).`);
    const ids = new Set(blend2.tables);
    let addTable;
    if (args.addTable) {
      const datasetId = await resolveDataset(page, args.addTable.dataset);
      ids.add(datasetId);
      const have = new Set(blend2.fields.map((f) => f.toLowerCase()));
      const keys = args.addTable.keys ? keyPairs(args.addTable.keys) : args.addTable.dimensions.filter((d) => have.has(d.toLowerCase())).map((d) => ({ left: d, right: d }));
      const joinType = jtOf(args.addTable.joinType) ?? JOIN_TYPES.left;
      if (!keys.length && joinType !== JOIN_TYPES.cross) throw new Error("La tabla nueva no comparte ninguna dimension con la combinacion: indica keys o joinType cross.");
      addTable = { datasetId, dimensions: args.addTable.dimensions, metrics: args.addTable.metrics ?? [], joinType, keys };
    }
    const schemas = {};
    for (const id of ids) schemas[id] = await datasetFields(page, id);
    const r = await evaluateOn(page, T, editBlendScript, {
      blendId: args.blendId,
      schemas,
      ...addTable ? { addTable } : {},
      ...args.removeTable !== void 0 ? { removeTable: args.removeTable } : {},
      ...args.setKeys ? { setKeys: { table: args.setKeys.table, keys: keyPairs(args.setKeys.keys), ...args.setKeys.joinType ? { joinType: jtOf(args.setKeys.joinType) } : {} } } : {}
    });
    if (!r.ok) throw new Error(r.error);
    Object.assign(out, { tableCount: r.tables, ...r.addedFields?.length ? { addedFields: r.addedFields } : {}, ...r.removedFields?.length ? { removedFields: r.removedFields } : {} });
    await sleep(2500);
  }
  if (args.name !== void 0 || jt !== void 0) {
    const r = await evaluateOn(page, T, updateBlendScript, { blendId: args.blendId, ...args.name !== void 0 ? { name: args.name } : {}, ...jt !== void 0 ? { joinType: jt } : {} });
    if (!r.ok) throw new Error(r.error);
    await sleep(2500);
  }
  const blend = (await evaluateOn(page, T, listBlendsScript)).find((b) => b.blendId === args.blendId);
  return { ...blend, ...out, ...out.removedFields ? { note: "Los graficos que usaban los campos quitados quedan en error: vuelve a vincularlos." } : {} };
}
async function deleteBlend(blendId) {
  const { page } = await requireEditMode();
  const r = await evaluateOn(page, T, deleteBlendScript, blendId);
  if (!r.ok) throw new Error(r.error);
  await sleep(2500);
  return { ok: true, blendId, remaining: (await evaluateOn(page, T, listBlendsScript)).map((b) => b.blendId) };
}
async function createBlend(o) {
  if (o.tables.length < 2 || o.tables.length > 5) throw new Error("Un blend combina entre 2 y 5 tablas.");
  if (o.joinType && JOIN_TYPES[o.joinType] === void 0) throw new Error(`joinType no valido: ${o.joinType}. Usa ${Object.keys(JOIN_TYPES).join(", ")}.`);
  const { page } = await requireEditMode();
  const type = o.type ?? "simple-table";
  const temps = [];
  return withViewport(page, async () => {
    try {
      const n = o.tables.length;
      const w = Math.max(120, Math.floor((o.box.width - (n - 1) * 10) / n));
      for (let i = 0; i < n; i++) {
        const t = o.tables[i];
        const r = await createComponent({
          type,
          box: { x: o.box.x + i * (w + 10), y: o.box.y, width: w, height: Math.max(120, o.box.height) },
          ...o.pageId ? { pageId: o.pageId } : {},
          dataset: t.dataset,
          dimensions: t.dimensions,
          metrics: t.metrics ?? []
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
      let selected = [];
      for (let attempt = 0; attempt < 3; attempt++) {
        await sleep(attempt ? 2500 : 1500);
        selected = await clickComponents(p, temps, { button: "right" });
        if (temps.every((id) => selected.includes(id))) break;
      }
      if (temps.some((id) => !selected.includes(id))) throw new Error(`No se pudieron seleccionar los graficos temporales (seleccionados: ${selected.join(", ")}; clics: ${lastClickTrace}).`);
      const item = await evaluateOn(p, T, menuItemPointScript, ["Combinar datos", "Blend data"]);
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
        learn("create_fail", "blend", { error: "no blend after menu" });
        throw new Error("El editor no creo la combinacion (si se abrio el editor de combinaciones, las tablas no comparten ninguna dimension para unirse).");
      }
      await clickText(p, /^(close\s*)?(CERRAR|CLOSE)$/);
      for (const id of temps.splice(0)) await deleteComponent(id).catch(() => void 0);
      if (o.name || o.joinType) {
        const r = await evaluateOn(p, T, updateBlendScript, { blendId, ...o.name ? { name: o.name } : {}, ...o.joinType ? { joinType: JOIN_TYPES[o.joinType] } : {} });
        if (!r.ok) throw new Error(r.error);
        await sleep(2500);
      }
      await setComponentBoxModel({ componentId, position: { x: o.box.x, y: o.box.y }, dimensions: { width: o.box.width, height: o.box.height } });
      let bound;
      if (o.dimensions?.length || o.metrics?.length) {
        await sleep(4e3);
        bound = await bindFieldsToComponent({ componentId, dimensions: o.dimensions ?? [], metrics: o.metrics ?? [] });
        await sleep(3e3);
        await reloadReport();
        const again = await bindFieldsToComponent({ componentId, dimensions: [], metrics: [] }).catch(() => null);
        const want = (bound?.dimensions?.length ?? 0) + (bound?.metrics?.length ?? 0);
        const have = (again?.dimensions?.length ?? 0) + (again?.metrics?.length ?? 0);
        if (!again || have !== want || (again.dimensions ?? []).join() !== (bound?.dimensions ?? []).join())
          bound = await bindFieldsToComponent({ componentId, dimensions: o.dimensions ?? [], metrics: o.metrics ?? [] });
      }
      learn("create_ok", "blend", { tables: o.tables.length });
      const blend = (await evaluateOn(p, T, listBlendsScript)).find((b) => b.blendId === blendId);
      return { ok: true, blendId, componentId, blend, ...bound ? { bound } : {} };
    } finally {
      for (const id of temps) await deleteComponent(id).catch(() => void 0);
    }
  });
}
async function selectSourceChart(page, source) {
  const dsId = source ? await resolveDataset(page, source) : void 0;
  const target = await page.evaluate((ds) => {
    const rep = window.angular.element(document.body).injector().get("legoUndoRedoService").report;
    const pid = (window.location.pathname.match(/\/page\/([^/]+)/) || [])[1];
    const pg = rep.pages.find((p) => p.getId() === pid) || rep.pages[0];
    const ofSource = pg.components.filter((x) => {
      try {
        const k = x.config.config.datasource.keys;
        const id = k.dataset && k.dataset.value && k.dataset.value.id;
        return id && (!ds || id === ds) && !(k.dataViewActive && k.dataViewActive.value);
      } catch {
        return false;
      }
    });
    const isControl = (x) => /filter|daterange|button|dataset-picker|dimension-control/.test(String(x.config.config.display.type));
    const c = ofSource.find((x) => !isControl(x)) || ofSource[0];
    return c ? String(c.getId()) : null;
  }, dsId ?? null);
  if (!target) throw new Error(`No hay en esta pagina ningun grafico del origen ${source ?? ""}: el panel Datos solo ofrece sus campos con uno seleccionado.`);
  await clickComponents(page, [target]);
  await sleep(800);
  return target;
}
var PARAM_TYPES = {
  text: /^(Texto|Text)$/,
  integer: /^(Número \(entero\)|Number \(whole\)|Number \(integer\))$/,
  decimal: /^(Número \(decimal\)|Number \(decimal\))$/,
  boolean: /^(Booleano|Boolean)$/
};
async function paramFill(page, pick, value) {
  const pt = await page.evaluate((how) => {
    const inputs = Array.from(document.querySelectorAll("input")).filter((i) => i.offsetParent && !i.closest("[class*=propert]") && i.type !== "radio" && i.type !== "search");
    const label = (i) => (i.closest("mat-form-field, .mat-mdc-form-field")?.innerText || "").trim();
    const [kind, arg, nth] = how.split(":");
    let el;
    if (kind === "ph") el = inputs.filter((i) => new RegExp(arg, "i").test(i.placeholder)).pop();
    else if (kind === "nth") el = inputs.filter((i) => new RegExp(arg, "i").test(i.placeholder))[Number(nth)];
    else if (kind === "value") el = inputs.filter((i) => i.value === arg).pop();
    else if (kind === "label") el = inputs.filter((i) => new RegExp(arg, "i").test(label(i))).pop();
    else if (kind === "emptyph") el = inputs.filter((i) => new RegExp(arg, "i").test(i.placeholder) && !i.value).pop();
    if (!el) return null;
    el.scrollIntoView({ block: "center" });
    const r = el.getBoundingClientRect();
    return { x: r.x + 15, y: r.y + r.height / 2 };
  }, pick);
  if (!pt) throw new Error(`Campo del formulario no encontrado (${pick}).`);
  await page.mouse.click(pt.x, pt.y);
  await page.keyboard.down("Control");
  await page.keyboard.press("a");
  await page.keyboard.up("Control");
  await page.keyboard.type(value, { delay: 20 });
  await sleep(400);
}
async function paramCancel(page) {
  await clickText(page, /^(Cancelar|Cancel)$/);
  await sleep(800);
  await clickText(page, /^(Descartar|Discard)( cambios| changes)?$/);
  await sleep(500);
  await clickText(page, /^(Hecho|Done)$/);
  await sleep(1e3);
}
async function paramSave(page, what) {
  await sleep(1e3);
  const enabled = await page.evaluate(() => {
    const b = Array.from(document.querySelectorAll("button")).find((x) => x.offsetParent && /^(Guardar|Save)$/.test(x.innerText.trim()));
    return b ? !b.disabled : false;
  });
  if (!enabled) {
    const why = await page.evaluate(() => Array.from(document.querySelectorAll("mat-error, .mat-mdc-form-field-error")).filter((e) => e.offsetParent).map((e) => e.innerText.trim()).join(" | "));
    throw new Error(`El editor no deja guardar ${what}: ${why || "Guardar desactivado (\xBFsin cambios?)"}`);
  }
  await clickText(page, /^(Guardar|Save)$/);
  await sleep(3e3);
  await clickText(page, /^(Hecho|Done)$/);
  await sleep(2e3);
}
async function buttonRightOf(page, ref) {
  return page.evaluate((r0) => {
    const mid = r0.y + r0.h / 2;
    const b = Array.from(document.querySelectorAll("button, [role=button], mat-icon")).filter((x) => x.offsetParent).map((x) => ({ x, r: x.getBoundingClientRect() })).filter(({ r }) => r.x >= r0.right && r.x < r0.right + 90 && Math.abs(r.y + r.height / 2 - mid) < 14).sort((a, c) => a.r.x - c.r.x)[0];
    return b ? { x: b.r.x + b.r.width / 2, y: b.r.y + b.r.height / 2 } : null;
  }, ref);
}
async function paramFillList(page, vals) {
  const rows = () => page.evaluate(() => Array.from(document.querySelectorAll("input")).filter((i) => i.offsetParent && /^(Valor|Value)$/.test(i.placeholder)).length);
  for (let n = await rows(); n > Math.max(vals.length, 1); n--) {
    const last = await page.evaluate(() => {
      const labels = Array.from(document.querySelectorAll("input")).filter((i) => i.offsetParent && /^(Etiqueta|Label)$/.test(i.placeholder));
      const el = labels[labels.length - 1];
      if (!el) return null;
      el.scrollIntoView({ block: "center" });
      const r = el.getBoundingClientRect();
      return { x: r.x, y: r.y, right: r.right, h: r.height };
    });
    const pt = last && await buttonRightOf(page, last);
    if (!pt) throw new Error("No se encontro el boton para quitar un valor de la lista.");
    await page.mouse.click(pt.x, pt.y);
    await sleep(600);
  }
  for (let i = 0; i < vals.length; i++) {
    if (i >= await rows()) {
      if (!await clickText(page, /^(Añadir otro valor|Add another value)$/)) throw new Error('No se encontro "Anadir otro valor".');
      await sleep(600);
    }
    await paramFill(page, `nth:^(Valor|Value)$:${i}`, String(vals[i].value));
    await paramFill(page, `nth:^(Etiqueta|Label)$:${i}`, vals[i].label ?? String(vals[i].value));
  }
}
async function waitParamForm(page, timeoutMs = 1e4) {
  const t0 = Date.now();
  while (Date.now() - t0 < timeoutMs) {
    const open = await page.evaluate(() => Array.from(document.querySelectorAll("input")).some((i) => i.offsetParent && /^(Nombre del parámetro|Parameter name)$/.test(i.placeholder)));
    if (open) {
      await sleep(600);
      return true;
    }
    await sleep(400);
  }
  return false;
}
async function findParamChip(page, name, keep = false) {
  const box = await page.evaluate(() => {
    const i = Array.from(document.querySelectorAll("input")).find((x) => x.offsetParent && /^(Buscar campos|Search fields)/i.test(x.placeholder) && x.getBoundingClientRect().y < 400);
    if (!i) return null;
    const r = i.getBoundingClientRect();
    return { x: r.x + 20, y: r.y + r.height / 2 };
  });
  if (box) {
    await page.mouse.click(box.x, box.y);
    await page.keyboard.down("Control");
    await page.keyboard.press("a");
    await page.keyboard.up("Control");
    await page.keyboard.type(name, { delay: 15 });
    await sleep(1500);
  }
  const pt = await page.evaluate((nm) => {
    const chip = Array.from(document.querySelectorAll(".common-chip.parameter")).find((c) => c.getAttribute("aria-label") === nm);
    if (!chip) return null;
    chip.scrollIntoView({ block: "center" });
    const r = chip.getBoundingClientRect();
    return { x: r.x + 12, y: r.y + r.height / 2 };
  }, name);
  if (!keep) await clearFieldSearch(page);
  return pt;
}
async function clearFieldSearch(page) {
  const box = await page.evaluate(() => {
    const i = Array.from(document.querySelectorAll("input")).find((x) => x.offsetParent && /^(Buscar campos|Search fields)/i.test(x.placeholder) && x.getBoundingClientRect().y < 400);
    if (!i || !i.value) return null;
    const r = i.getBoundingClientRect();
    return { x: r.x + 20, y: r.y + r.height / 2 };
  });
  if (!box) return;
  await page.mouse.click(box.x, box.y);
  await page.keyboard.down("Control");
  await page.keyboard.press("a");
  await page.keyboard.up("Control");
  await page.keyboard.press("Backspace");
  await sleep(500);
}
async function openParameterEditor(page, name, source) {
  await selectSourceChart(page, source);
  const pt = await findParamChip(page, name, true);
  if (!pt) await clearFieldSearch(page);
  if (!pt) throw new Error(`No hay ningun parametro "${name}" en el origen del grafico seleccionado (usa source).`);
  await page.mouse.move(pt.x, pt.y);
  await sleep(600);
  await page.mouse.click(pt.x, pt.y);
  if (!await waitParamForm(page)) throw new Error(`No se abrio el editor del parametro "${name}".`);
}
var paramId = (name) => name.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9_.]+/g, "_").replace(/^_+|_+$/g, "");
async function addParameter(o) {
  const { page } = await requireEditMode();
  const type = o.type ?? "text";
  if (!PARAM_TYPES[type]) throw new Error(`type no valido: ${type}. Usa text, integer, decimal o boolean.`);
  const allowed = o.allowed ?? (o.values?.length ? "list" : o.min !== void 0 || o.max !== void 0 ? "range" : "any");
  return withViewport(page, async () => {
    await selectSourceChart(page, o.source);
    if (!await clickText(page, /^(add_circle\s*)?(Añadir un parámetro|Add a parameter)$/)) throw new Error('No se encontro "A\xF1adir un parametro" en el panel Datos.');
    if (!await waitParamForm(page)) throw new Error("No se abrio el formulario del parametro.");
    const id = o.id ?? paramId(o.name);
    try {
      await paramFill(page, "ph:^(Nombre del par\xE1metro|Parameter name)$", o.name);
      await sleep(500);
      await paramFill(page, "label:(ID del par\xE1metro|Parameter ID)", id);
      if (type !== "text") {
        if (!await clickText(page, /^(Texto|Text)$/)) throw new Error('No se encontro el selector "Tipo de datos".');
        await sleep(800);
        if (!await clickText(page, PARAM_TYPES[type])) throw new Error(`Tipo ${type} no disponible.`);
        await sleep(800);
      }
      if (allowed !== "any") {
        const re = allowed === "list" ? /^(Lista de valores|List of values)$/ : /^(Rango|Range)$/;
        if (!await clickText(page, re)) throw new Error(`Opcion "${allowed}" no disponible para el tipo ${type}.`);
        await sleep(800);
      }
      if (allowed === "range") {
        if (o.min !== void 0) await paramFill(page, "ph:^M[i\xED]n", String(o.min));
        if (o.max !== void 0) await paramFill(page, "ph:^M[a\xE1]x", String(o.max));
      }
      if (allowed === "list") await paramFillList(page, o.values ?? []);
      if (o.default !== void 0 && type !== "boolean" && allowed !== "list") {
        await paramFill(page, "label:(predeterminado|Default)", String(o.default)).catch(async () => paramFill(page, "ph:^[0-9.]+$", String(o.default)));
      }
      await paramSave(page, "el parametro");
    } catch (e) {
      await paramCancel(page).catch(() => void 0);
      throw e;
    }
    await selectSourceChart(page, o.source).catch(() => void 0);
    const seen = !!await findParamChip(page, o.name);
    learn(seen ? "create_ok" : "create_fail", "parameter", { type, allowed });
    return {
      ok: seen,
      name: o.name,
      id,
      type,
      allowed,
      ...o.values ? { values: o.values } : {},
      ...o.min !== void 0 ? { min: o.min } : {},
      ...o.max !== void 0 ? { max: o.max } : {},
      ...o.default !== void 0 ? { default: o.default } : {},
      note: "En formulas usa el nombre visible del parametro, no su id."
    };
  });
}
async function updateParameter(o) {
  const { page } = await requireEditMode();
  return withViewport(page, async () => {
    await openParameterEditor(page, o.name, o.source);
    const changed = [];
    try {
      if (o.newName !== void 0 && o.newName !== o.name) {
        await paramFill(page, "ph:^(Nombre del par\xE1metro|Parameter name)$", o.newName);
        changed.push("name");
      }
      if (o.values) {
        const isList = await page.evaluate(() => Array.from(document.querySelectorAll("input")).some((i) => i.offsetParent && /^(Valor|Value)$/.test(i.placeholder)));
        if (!isList) {
          if (!await clickText(page, /^(Lista de valores|List of values)$/)) throw new Error("Este parametro no admite lista de valores.");
          await sleep(800);
        }
        await paramFillList(page, o.values);
        changed.push("values");
      }
      if (o.min !== void 0 || o.max !== void 0) {
        const hasRange = await page.evaluate(() => Array.from(document.querySelectorAll("input")).some((i) => i.offsetParent && /^M[ií]n/.test(i.placeholder)));
        if (!hasRange) {
          if (!await clickText(page, /^(Rango|Range)$/)) throw new Error("Este parametro no admite rango.");
          await sleep(800);
        }
        if (o.min !== void 0) await paramFill(page, "ph:^M[i\xED]n", String(o.min));
        if (o.max !== void 0) await paramFill(page, "ph:^M[a\xE1]x", String(o.max));
        changed.push("range");
      }
      if (o.default !== void 0) {
        await paramFill(page, "label:(predeterminado|Default)", String(o.default));
        changed.push("default");
      }
      if (!changed.length) throw new Error("Nada que cambiar: indica newName, values, min, max o default.");
      await paramSave(page, "el parametro");
    } catch (e) {
      await paramCancel(page).catch(() => void 0);
      throw e;
    }
    await selectSourceChart(page, o.source).catch(() => void 0);
    const seen = !!await findParamChip(page, o.newName ?? o.name);
    learn("note", "parameter_update", { text: `${changed.join(",")} ${seen ? "ok" : "not listed"}` });
    return {
      ok: seen,
      name: o.newName ?? o.name,
      changed,
      ...o.newName ? { note: "Las formulas nombran el parametro por su nombre visible: revisa los campos que lo usan." } : {}
    };
  });
}
async function deleteParameter(o) {
  const { page } = await requireEditMode();
  return withViewport(page, async () => {
    await openParameterEditor(page, o.name, o.source);
    try {
      if (!await clickText(page, /^(Todos los campos|All fields)$/)) throw new Error('No se encontro "Todos los campos".');
      await sleep(2500);
      const search = await page.evaluate(() => {
        const i = Array.from(document.querySelectorAll("input")).find((x) => x.offsetParent && /^(Search fields|Buscar campos)/i.test(x.placeholder) && x.getBoundingClientRect().y > 400);
        if (!i) return null;
        const r = i.getBoundingClientRect();
        return { x: r.x + 20, y: r.y + r.height / 2 };
      });
      if (!search) throw new Error("No se encontro el buscador de campos del origen.");
      await page.mouse.click(search.x, search.y);
      await page.keyboard.type(o.name, { delay: 20 });
      await sleep(1500);
      const dots = await page.evaluate((nm) => {
        const row = Array.from(document.querySelectorAll(".parameter-field-entry")).find((r2) => r2.offsetParent && Array.from(r2.querySelectorAll("*")).some((e) => e.children.length === 0 && (e.innerText || "").trim() === nm));
        const btn = row && row.querySelector('button.more, button[aria-label*="opciones"], button[aria-label*="options"]');
        if (!btn) return null;
        btn.scrollIntoView({ block: "center" });
        const r = btn.getBoundingClientRect();
        return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
      }, o.name);
      if (!dots) throw new Error(`No se encontro la fila de "${o.name}" en la lista de campos del origen.`);
      await page.mouse.click(dots.x, dots.y);
      await sleep(1e3);
      if (!await clickText(page, /^(Quitar|Remove)$/, "[role=menuitem], [role=menuitem] *")) throw new Error('El menu de la fila no tiene "Quitar".');
      await sleep(1500);
      await clickText(page, /^(Quitar|Remove|Eliminar|Delete)$/, "mat-dialog-container button, [role=dialog] button");
      await sleep(1500);
      await clickText(page, /^(Hecho|Done)$/);
      await sleep(2e3);
    } catch (e) {
      await page.keyboard.press("Escape").catch(() => void 0);
      await clickText(page, /^(Hecho|Done)$/).catch(() => void 0);
      throw e;
    }
    await selectSourceChart(page, o.source).catch(() => void 0);
    const still = !!await findParamChip(page, o.name);
    learn("note", "parameter_delete", { text: still ? "still listed" : "removed" });
    if (still) throw new Error(`"${o.name}" sigue en el panel Datos tras quitarlo.`);
    return { ok: true, removed: o.name, note: "Los campos y controles que lo usaban quedan en error: corrigelos o borralos." };
  });
}
async function navPages() {
  return evaluateOn(await getReportPage(), T, navPagesScript);
}
async function nav(type, payload) {
  const { page } = await requireEditMode();
  const r = await evaluateOn(page, T + 5e3, navDispatchScript, { type, payload });
  if (!r.ok) throw new Error(r.error);
  return evaluateOn(page, T, navPagesScript);
}
async function movePage(pageId, index) {
  const pages = await navPages();
  const it = pages.find((p) => p.pageId === pageId);
  if (!it) throw new Error(`No hay una pagina ${pageId}.`);
  return nav("MOVE NAV ITEM", { itemId: pageId, position: { sectionId: it.sectionId ?? void 0, index } });
}
async function deletePages(pageIds) {
  const pages = await navPages();
  const missing = pageIds.filter((id) => !pages.some((p) => p.pageId === id));
  if (missing.length) throw new Error(`No existen: ${missing.join(", ")}.`);
  if (pageIds.length >= pages.length) throw new Error("No se pueden borrar todas las paginas.");
  return nav("REMOVE PAGES", { pageIds });
}
async function setPageVisibility(pageId, v) {
  let out = await navPages();
  if (v.hiddenFromNav !== void 0) out = await nav("UPDATE NAV ITEM HIDDEN FROM NAV", { itemId: pageId, hiddenFromNav: v.hiddenFromNav });
  if (v.hiddenFromViewer !== void 0) out = await nav("UPDATE NAV ITEM HIDDEN FROM VIEWER", { itemId: pageId, hiddenFromViewer: v.hiddenFromViewer });
  return out.find((p) => p.pageId === pageId);
}
async function duplicatePage(pageId, name) {
  const { page, info } = await requireEditMode();
  const before = await navPages();
  if (!before.some((p2) => p2.pageId === pageId)) throw new Error(`No hay una pagina ${pageId}.`);
  if (info.pageId !== pageId) await openReport(`https://datastudio.google.com/reporting/${info.reportId}/page/${pageId}/edit`);
  const p = await getReportPage();
  return withViewport(p, async () => {
    if (!await clickText(p, /^(Página|Page)$/)) throw new Error('No se encontro el menu "Pagina".');
    await sleep(800);
    if (!await clickText(p, /^(Duplicar página|Duplicate page)$/)) throw new Error('No se encontro "Duplicar pagina".');
    let after = before;
    for (let i = 0; i < 15; i++) {
      await sleep(800);
      after = await evaluateOn(p, T, navPagesScript);
      if (after.length > before.length) break;
    }
    const created = after.find((x) => !before.some((b) => b.pageId === x.pageId));
    if (!created) throw new Error("La pagina no se duplico.");
    if (name) {
      const r = await evaluateOn(p, T + 5e3, navDispatchScript, { type: "UPDATE NAV ITEM NAME", payload: { itemId: created.pageId, displayName: name } });
      if (!r.ok) throw new Error(r.error);
    }
    return (await evaluateOn(p, T, navPagesScript)).find((x) => x.pageId === created.pageId);
  });
}
async function arrangeComponents(componentIds, op, pageId) {
  const { page } = await requireEditMode();
  const r = await evaluateOn(page, T, arrangeScript, { componentIds, op, ...pageId ? { pageId } : {} });
  if (!r.ok) throw new Error(r.error);
  await sleep(2500);
  return r;
}
async function setControlParameter(componentId, parameterId) {
  const { page } = await requireEditMode();
  const r = await evaluateOn(page, T, setControlParameterScript, { componentId, parameterKey: parameterId });
  if (!r.ok) throw new Error(r.error);
  await sleep(2500);
  return { ok: true, componentId, parameterId, note: "Recarga (reload_report) para ver el control con los valores del parametro." };
}
async function setText(componentId, text, opts = {}) {
  const { page } = await requireEditMode();
  const esc = (t) => t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  let html = opts.html ? text : text.split("\n").map((l) => `<div>${esc(l) || "<br>"}</div>`).join("");
  if (!opts.html && (opts.size || opts.bold || opts.color || opts.align)) {
    const style = [opts.size ? `font-size:${opts.size}px` : "", opts.color ? `color:${opts.color}` : "", opts.align ? `text-align:${opts.align}` : ""].filter(Boolean).join(";");
    html = `<div style="${style}">${opts.bold ? `<b>${html}</b>` : html}</div>`;
  }
  const r = await evaluateOn(page, T, setTextScript, { componentId, html });
  if (!r.ok) throw new Error(r.error);
  await sleep(2e3);
  return { ok: true, componentId };
}
async function groupComponents(o) {
  const { page } = await requireEditMode();
  const r = await evaluateOn(page, T, groupScript, {
    ...o.componentIds ? { componentIds: o.componentIds } : {},
    ...o.groupIds ? { groupIds: o.groupIds } : {},
    ...o.pageId ? { pageId: o.pageId } : {},
    ...o.op === "ungroup" ? { ungroup: true } : {},
    ...o.op === "list" ? { list: true } : {}
  });
  if (!r.ok) throw new Error(r.error);
  if (o.op !== "list") await sleep(2e3);
  return r;
}
async function alignComponents(o) {
  if (o.componentIds.length < 2) throw new Error("Hacen falta al menos 2 componentes.");
  if (!o.align && !o.distribute && !o.matchSize) throw new Error("Indica align, distribute o matchSize.");
  const { page } = await requireEditMode();
  const boxes = await evaluateOn(page, T, componentBoxesScript, o.componentIds);
  const missing = o.componentIds.filter((_, i) => !boxes[i]);
  if (missing.length) throw new Error(`No encontrados: ${missing.join(", ")}`);
  const b = boxes.map((x) => ({ ...x }));
  if (o.matchSize) {
    const W = Math.max(...b.map((x) => x.w)), H = Math.max(...b.map((x) => x.h));
    for (const x of b) {
      if (o.matchSize !== "height") x.w = W;
      if (o.matchSize !== "width") x.h = H;
    }
  }
  const L = Math.min(...b.map((x) => x.x)), R = Math.max(...b.map((x) => x.x + x.w));
  const T0 = Math.min(...b.map((x) => x.y)), B = Math.max(...b.map((x) => x.y + x.h));
  switch (o.align) {
    case "left":
      for (const x of b) x.x = L;
      break;
    case "right":
      for (const x of b) x.x = R - x.w;
      break;
    case "center":
      for (const x of b) x.x = (L + R) / 2 - x.w / 2;
      break;
    case "top":
      for (const x of b) x.y = T0;
      break;
    case "bottom":
      for (const x of b) x.y = B - x.h;
      break;
    case "middle":
      for (const x of b) x.y = (T0 + B) / 2 - x.h / 2;
      break;
  }
  if (o.distribute) {
    const hz = o.distribute === "horizontal";
    const s = [...b].sort((p, q) => hz ? p.x - q.x : p.y - q.y);
    if (s.length < 3 && o.gap === void 0) throw new Error("Distribuir sin gap necesita al menos 3 componentes.");
    const size = (x) => hz ? x.w : x.h;
    const first = hz ? s[0].x : s[0].y;
    const last = hz ? s[s.length - 1].x + s[s.length - 1].w : s[s.length - 1].y + s[s.length - 1].h;
    const gap = o.gap ?? (last - first - s.reduce((a, x) => a + size(x), 0)) / (s.length - 1);
    let pos = first;
    for (const x of s) {
      if (hz) x.x = pos;
      else x.y = pos;
      pos += size(x) + gap;
    }
  }
  const changed = [];
  for (let i = 0; i < b.length; i++) {
    const n = b[i], was = boxes[i];
    const nx = Math.round(n.x), ny = Math.round(n.y), nw = Math.round(n.w), nh = Math.round(n.h);
    if (nx === was.x && ny === was.y && nw === was.w && nh === was.h) continue;
    await setComponentBoxModel({ componentId: n.id, position: { x: nx, y: ny }, ...nw !== was.w || nh !== was.h ? { dimensions: { width: nw, height: nh } } : {} });
    changed.push({ id: n.id, x: nx, y: ny, w: nw, h: nh });
  }
  return { ok: true, changed, unchanged: b.length - changed.length };
}
async function setConditionalFormat(componentId, rules, append = false) {
  const { page } = await requireEditMode();
  const r = await evaluateOn(page, T, setConditionalFormatScript, { componentId, rules, append });
  if (!r.ok) throw new Error(r.error);
  await sleep(1500);
  return { ok: true, componentId, rules: r.rules };
}
async function setComparison(componentId, comparison) {
  const { page } = await requireEditMode();
  const r = await evaluateOn(page, T, comparisonScript, { componentId, comparison });
  if (!r.ok) throw new Error(r.error);
  await sleep(1500);
  return { ok: true, componentId, comparison, set: r.set };
}
async function setPageLink(componentId, pageRef) {
  const { page } = await requireEditMode();
  let pageId = pageRef;
  if (pageRef.startsWith("name:")) {
    const { listPages } = await import("./ops3-7J47QTYX.js");
    const hit = (await listPages()).find((p) => p.name === pageRef.slice(5));
    if (!hit) throw new Error(`No hay ninguna pagina llamada "${pageRef.slice(5)}".`);
    pageId = hit.id;
  }
  const r = await evaluateOn(page, T, pageLinkScript, { componentId, pageId });
  if (!r.ok) throw new Error(r.error);
  await sleep(1500);
  return { ok: true, componentId, pageId, page: r.page };
}
async function setChartInteractions(o) {
  const { page } = await requireEditMode();
  if (o.optionalMetrics && o.optionalMetrics.length)
    await bindFieldsToComponent({ componentId: o.componentId, dimensions: [], metrics: o.optionalMetrics, mode: "append" });
  const r = await evaluateOn(page, T, chartInteractionsScript, {
    componentId: o.componentId,
    ...o.optionalMetrics ? o.optionalMetrics.length ? { toSelector: o.optionalMetrics.length } : { clearSelector: true } : {},
    ...o.dateDrillDown ? { dateDrill: true, ...o.drillStart ? { drillStart: o.drillStart } : {} } : {},
    ...o.crossFilter !== void 0 ? { crossFilter: o.crossFilter } : {}
  });
  if (!r.ok) throw new Error(r.error);
  if (o.reload !== false) await reloadReport();
  else await sleep(1500);
  return { ok: true, componentId: o.componentId, ...r.selector ? { optionalMetrics: r.selector } : {}, ...r.drill ? { drillDown: r.drill } : {}, ...r.crossFilter !== void 0 ? { crossFilter: r.crossFilter } : {} };
}
async function addImage(o) {
  const { resolve, basename, extname } = await import("node:path");
  const { existsSync } = await import("node:fs");
  const abs = resolve(o.path);
  if (!existsSync(abs)) throw new Error(`No existe ${abs}.`);
  if (![".svg", ".png", ".jpg", ".jpeg", ".gif"].includes(extname(abs).toLowerCase())) throw new Error("La imagen tiene que ser SVG, PNG, JPG o GIF.");
  const name = basename(abs);
  let { page, info } = await requireEditMode();
  const before = await evaluateOn(page, T, imageComponentsScript);
  const known = before.find((r) => r.file && r.file.name === name);
  let id;
  let uploaded = false;
  if (known) {
    const r = await createComponent({ type: "image-component", box: o.box, ...o.pageId ? { pageId: o.pageId } : {}, dimensions: [], metrics: [] });
    id = r.componentId;
    await setStyle(id, { file: known.file });
  } else {
    if (o.pageId && info.pageId !== o.pageId) {
      await openReport(`https://datastudio.google.com/reporting/${info.reportId}/page/${o.pageId}/edit`);
      page = await getReportPage();
    }
    await ensureVisible(page);
    const input = await page.$("input[type=file].file-upload-input");
    if (!input) throw new Error("No se encontro el selector de archivo del editor.");
    const old = new Set(before.map((r) => r.id));
    await input.uploadFile(abs);
    let hit;
    for (let i = 0; i < 50 && !hit; i++) {
      await sleep(500);
      hit = (await evaluateOn(page, T, imageComponentsScript)).find((r) => !old.has(r.id) && r.file && r.file.name === name);
    }
    if (!hit) throw new Error(`La subida de ${name} no creo ninguna imagen (mira el editor).`);
    id = hit.id;
    uploaded = true;
    await setComponentBoxModel({ componentId: id, position: { x: o.box.x, y: o.box.y }, dimensions: { width: o.box.width, height: o.box.height } });
  }
  if (o.altText) await setStyle(id, { altText: o.altText });
  return { ok: true, componentId: id, file: name, uploaded };
}
async function getChartStyle(componentId) {
  const r = await evaluateOn(await getReportPage(), T, readChartStyleScript, componentId);
  if (!r.ok) throw new Error(r.error);
  return r.style;
}
async function setChartStyle(args) {
  const { reload, ...style } = args;
  const { page } = await requireEditMode();
  const r = await evaluateOn(page, T, chartStyleScript, style);
  if (!r.ok) throw new Error(r.error);
  if (reload !== false) await reloadReport();
  else await sleep(1500);
  return { ok: true, componentId: args.componentId, set: r.set, series: r.series, reloaded: reload !== false, note: "Se recarga la pagina abierta; si el grafico esta en otra, abrela para verlo (pageId en get_chart_style)." };
}
async function setStyle(componentId, keys) {
  const { page } = await requireEditMode();
  const r = await evaluateOn(page, T, setDisplayKeysScript, { componentId, keys });
  if (!r.ok) throw new Error(r.error);
  await sleep(1500);
  return { ok: true, componentId, set: r.set };
}

export {
  setComponentBoxModel,
  inspectDataSources,
  bindFieldsToComponent,
  JOIN_TYPES,
  ensureVisible,
  listBlends,
  updateBlend,
  deleteBlend,
  createBlend,
  selectSourceChart,
  addParameter,
  updateParameter,
  deleteParameter,
  navPages,
  movePage,
  deletePages,
  setPageVisibility,
  duplicatePage,
  arrangeComponents,
  setControlParameter,
  setText,
  groupComponents,
  alignComponents,
  setConditionalFormat,
  setComparison,
  setPageLink,
  setChartInteractions,
  addImage,
  getChartStyle,
  setChartStyle,
  setStyle
};
