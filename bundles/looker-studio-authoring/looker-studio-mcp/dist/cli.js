#!/usr/bin/env node
import { createRequire as __lsCreateRequire } from 'node:module'; const require = __lsCreateRequire(import.meta.url);
import {
  assertReportUrl,
  getComponentConfig,
  getReportLayout,
  sanitizeLearning
} from "./chunks/chunk-LEEVQRKN.js";
import {
  addFilter,
  addPage,
  addParameter,
  addSourceField,
  applySpec,
  applyTheme,
  arrangeComponents,
  attachToReport,
  bindFieldsToComponent,
  captureTemplates,
  copyReport,
  createBlend,
  createComponent,
  deleteBlend,
  deleteComponent,
  deletePages,
  deleteParameter,
  detachFilter,
  diagnoseWithKnowledge,
  disconnectIfConnected,
  duplicatePage,
  exportReport,
  exportTheme,
  findOrphans,
  importTheme,
  inspectDataSources,
  learn,
  lintSpec,
  listBlends,
  listFilters,
  listPages,
  listTemplates,
  loadSpec,
  movePage,
  openReport,
  patchComponent,
  readLearnings,
  readTheme,
  reloadReport,
  renamePage,
  reportSettings,
  seedTemplatesFromUi,
  setComponentBoxModel,
  setControlParameter,
  setPageVisibility,
  setStyle,
  setText,
  summary,
  synthesizeTemplates,
  themeLibrary,
  updateBlend,
  updateFilter,
  updateParameter,
  useThemePreset,
  uxAudit
} from "./chunks/chunk-LHYHSSJM.js";
import "./chunks/chunk-5J4RMU5E.js";
import "./chunks/chunk-Y34SSGZY.js";
import "./chunks/chunk-MZHUAOKZ.js";
import "./chunks/chunk-FAVAKK4W.js";
import "./chunks/chunk-GIAQTVDD.js";
import "./chunks/chunk-BGDW2RS3.js";
import "./chunks/chunk-R5VSDU44.js";
import "./chunks/chunk-PP647YHP.js";
import "./chunks/chunk-5QDPZ4I5.js";

// src/cli.ts
import { readFileSync, existsSync } from "node:fs";
var HELP = `ls-studio <comando> [opciones]

Conexion (navegador con --remote-debugging-port; LS_CDP_URL, por defecto http://127.0.0.1:9222)
  open <url>                       Abre el informe (usa /edit para modificar) y espera al editor
  attach                           Informe activo: id, pagina, modo, lienzo
  reload                           Recarga (pinta componentes creados por API)
  copy <url|id> [--name N]         Copia el informe (Linking API) y abre la copia en /edit

Lectura
  layout [--page <id>]             Componentes de la pagina con caja, estilo y campos
  sources                          Origenes de datos y campos
  fields add --name N --formula F [--source texto] [--allow-shared]
                                   Campo calculado en el ORIGEN (lo que filtran casillas y botones)
  config <componentId>             JSON interno de un componente
  diagnose                         Problemas + soluciones conocidas (aprende reason codes)
  export [-o informe.json]         Informe completo a JSON (aprende tipos y plantillas)

Escritura (modo /edit)
  box <id> [--x N --y N] [--w N --h N] [--padding N]
  bind <id> [--dims a,b] [--metrics "SUM(x),AVG(y)"] [--append]
  create --type <tipo[@variante]> --box x,y,w,h [--page <id>] [--dataset <id|@campo>]
         [--dims a,b] [--metrics m1,m2] [--padding N]
  delete <id>
  patch <id> [--date-days N] [--strip-styles] [--parameter <id>] [--text "T" [--size N --bold --color #hex]]
         [--style '{"hideMetric":false}']   Claves de estilo (config.display.keys)
                                   Periodo de un control / quitar estilos de tema / control que fija un parametro

Paginas y tema
  pages [list] | pages add <nombre> | pages rename <id> <nombre>
  pages move <id> <indice> | pages delete <id...> | pages duplicate <id> [nombre]
  pages hide <id> [--nav on|off] [--viewer on|off]
  arrange <id...> --to front|back|forward|backward|report|page [--page <id>]

Combinaciones y parametros
  blends [list]                    Combinaciones: origenes, uniones, claves, campos, graficos
  blends create <spec.json|json>   {tables:[{dataset,dimensions,metrics}], box:{x,y,width,height}, name, joinType, type, dimensions, metrics}
  blends update <blendId> [--name N] [--join inner|left|right|full|cross]
  blends delete <blendId>          Solo si ningun grafico la usa
  params add --name N [--type text|integer|decimal|boolean] [--values a:Etiqueta,b] [--min N --max N]
             [--default V] [--source <id|@campo>]   (en formulas, por su nombre visible)
  params update <nombre> [--name nuevo] [--values a,b] [--min N --max N] [--default V] [--source <id|@campo>]
  params delete <nombre> [--source <id|@campo>]   Lo quita del origen; sus campos y controles quedan en error
  theme presets | theme use <preset|nombre|biblioteca> | theme export <f.json> | theme import <f.json>
  report settings [--viewer-filter-bar on|off] [--cross-filter on|off] [--set clave=valor,...]
  filters [list] | filters add --name N --field F [--op EQ] [--values a,b] [--exclude] [--to <pageId|cd-..>]
  filters detach <filterId> <pageId|cd-..>
  filters update <filterId> [--name N] [--op EQ] [--values a,b [--numeric]] [--include|--exclude]
  theme [get] | theme set <json|archivo.json>    Tema: font,text,fill,accent,accentText,background,grid,
                                                 increase,decrease,border,borderWeight,borderRadius,series[]
  ux                               Auditoria UX: contraste WCAG, tema, paleta, tipografia, layout (0-100)

Informe como codigo
  orphans <spec.json...>           Componentes que ningun spec referencia (restos, anadidos a mano)
  lint <spec.json>                 Valida contra las skills (reticula, lienzo, KPIs, densidad)
  apply <spec.json> [--dry-run]    Crea/actualiza (idempotente via <spec>.state.json)

Aprendizaje (knowledge/)
  templates capture                Guarda una plantilla por tipo del informe abierto
  templates list
  templates synth <tipo...>        Genera plantillas de tipos nuevos sin informe de referencia
  templates seed-ui "<opcion>"...   Inserta opciones del menu 'Anadir un grafico' y las guarda como plantilla
  learnings [--raw]                Resumen (o eventos) de lo aprendido
  learn <clave> <texto...>         Anade una nota o solucion (clave reason:93, CODIGO o tema)
`;
function parse(argv) {
  const [cmd = "help", ...rest] = argv;
  const pos = [];
  const flags = {};
  for (let i = 0; i < rest.length; i++) {
    const a = rest[i];
    if (a.startsWith("--") || a.startsWith("-") && a.length === 2) {
      const k = a.replace(/^-+/, "");
      const v = rest[i + 1];
      if (v !== void 0 && !v.startsWith("-")) {
        flags[k] = v;
        i++;
      } else flags[k] = true;
    } else pos.push(a);
  }
  return { cmd, pos, flags };
}
var list = (v) => typeof v === "string" ? v.split(/,(?![^(]*\))/).map((s) => s.trim()).filter(Boolean) : [];
var num = (v) => typeof v === "string" && v !== "" ? Number(v) : void 0;
var need = (v, what) => {
  if (!v) throw new Error(`Falta ${what}.

${HELP}`);
  return v;
};
async function main() {
  const { cmd, pos, flags } = parse(process.argv.slice(2));
  switch (cmd) {
    case "help":
    case "--help":
    case "-h":
      process.stdout.write(HELP);
      return void 0;
    case "open": {
      const url = need(pos[0], "la URL del informe");
      assertReportUrl(url);
      return openReport(url);
    }
    case "copy":
      return copyReport(need(pos[0], "la URL o el id del informe"), typeof flags.name === "string" ? flags.name : void 0);
    case "attach":
      return attachToReport();
    case "reload":
      return reloadReport();
    case "layout":
      return getReportLayout(typeof flags.page === "string" ? flags.page : void 0);
    case "sources":
      return inspectDataSources();
    case "config":
      return getComponentConfig(need(pos[0], "componentId"));
    case "diagnose":
      return diagnoseWithKnowledge();
    case "export": {
      const file = typeof flags.o === "string" ? flags.o : typeof flags.out === "string" ? flags.out : void 0;
      const r = await exportReport(file);
      return file ? { file, pages: r.pages.length, types: r.types, learnedTemplates: r.learnedTemplates } : r;
    }
    case "box": {
      const id = need(pos[0], "componentId");
      const x = num(flags.x), y = num(flags.y), w = num(flags.w), h = num(flags.h), p = num(flags.padding);
      return setComponentBoxModel({
        componentId: id,
        ...x !== void 0 && y !== void 0 ? { position: { x, y } } : {},
        ...w !== void 0 && h !== void 0 ? { dimensions: { width: w, height: h } } : {},
        ...p !== void 0 ? { padding: p } : {}
      });
    }
    case "bind":
      return bindFieldsToComponent({
        componentId: need(pos[0], "componentId"),
        dimensions: list(flags.dims),
        metrics: list(flags.metrics),
        mode: flags.append ? "append" : "replace"
      });
    case "create": {
      const box = list(flags.box).map(Number);
      if (box.length !== 4 || box.some((v) => Number.isNaN(v))) throw new Error("--box x,y,w,h");
      const padding = num(flags.padding);
      const [type, variant] = need(typeof flags.type === "string" ? flags.type : void 0, "--type").split("@");
      return createComponent({
        type,
        ...variant ? { variant } : {},
        box: { x: box[0], y: box[1], width: box[2], height: box[3] },
        ...typeof flags.page === "string" ? { pageId: flags.page } : {},
        ...typeof flags.dataset === "string" ? { dataset: flags.dataset } : {},
        dimensions: list(flags.dims),
        metrics: list(flags.metrics),
        ...padding !== void 0 ? { padding } : {}
      });
    }
    case "patch": {
      const days = num(flags["date-days"]);
      const id = need(pos[0], "componentId");
      const out = {};
      if (days !== void 0 || flags["strip-styles"])
        Object.assign(out, await patchComponent({ componentId: id, ...days !== void 0 ? { dateRangeDays: days } : {}, ...flags["strip-styles"] ? { stripThemeStyles: true } : {} }));
      if (typeof flags.parameter === "string") out.parameter = await setControlParameter(id, flags.parameter);
      if (typeof flags.style === "string") out.style = await setStyle(id, JSON.parse(flags.style));
      if (typeof flags.text === "string") out.text = await setText(id, flags.text.replace(/\\n/g, "\n"), { ...num(flags.size) ? { size: num(flags.size) } : {}, ...flags.bold ? { bold: true } : {}, ...typeof flags.color === "string" ? { color: flags.color } : {} });
      return out;
    }
    case "delete":
      return deleteComponent(need(pos[0], "componentId"));
    case "lint":
      return lintSpec(loadSpec(need(pos[0], "spec.json")));
    case "apply":
      return applySpec(need(pos[0], "spec.json"), { dryRun: !!flags["dry-run"] });
    case "pages":
      if (pos[0] === "add") return addPage(need(pos[1], "el nombre de la pagina"));
      if (pos[0] === "rename") return renamePage(need(pos[1], "pageId"), need(pos.slice(2).join(" "), "el nombre"));
      if (pos[0] === "move") return movePage(need(pos[1], "pageId"), Number(need(pos[2], "el indice")));
      if (pos[0] === "delete") return deletePages(pos.slice(1).length ? pos.slice(1) : [need(void 0, "pageId")]);
      if (pos[0] === "duplicate") return duplicatePage(need(pos[1], "pageId"), pos.slice(2).join(" ") || void 0);
      if (pos[0] === "hide") {
        const onOff = (v) => v === void 0 ? void 0 : v === true || /^(on|true|1|si|yes)$/i.test(String(v));
        const nav = onOff(flags.nav), viewer = onOff(flags.viewer);
        return setPageVisibility(need(pos[1], "pageId"), { ...nav !== void 0 ? { hiddenFromNav: nav } : { hiddenFromNav: true }, ...viewer !== void 0 ? { hiddenFromViewer: viewer } : {} });
      }
      return listPages();
    case "arrange": {
      const to = need(typeof flags.to === "string" ? flags.to : void 0, "--to front|back|forward|backward|report|page");
      if (!["front", "back", "forward", "backward", "report", "page"].includes(to)) throw new Error(`--to ${to} no valido`);
      return arrangeComponents(pos.length ? pos : [need(void 0, "componentId")], to, typeof flags.page === "string" ? flags.page : void 0);
    }
    case "blends": {
      if (pos[0] === "create") {
        const arg = need(pos[1], "el spec (JSON o archivo)");
        return createBlend(JSON.parse(existsSync(arg) ? readFileSync(arg, "utf8") : arg));
      }
      if (pos[0] === "delete") return deleteBlend(need(pos[1], "blendId"));
      if (pos[0] === "update") return updateBlend({ blendId: need(pos[1], "blendId"), ...typeof flags.name === "string" ? { name: flags.name } : {}, ...typeof flags.join === "string" ? { joinType: flags.join } : {} });
      return listBlends();
    }
    case "params": {
      const values = list(flags.values).map((v) => {
        const [value, ...label] = v.split(":");
        return { value, ...label.length ? { label: label.join(":") } : {} };
      });
      const n = (k) => typeof flags[k] === "string" ? Number(flags[k]) : void 0;
      const src = typeof flags.source === "string" ? { source: flags.source } : {};
      if (pos[0] === "update")
        return updateParameter({
          name: need(pos.slice(1).join(" ") || void 0, "el nombre del parametro"),
          ...typeof flags.name === "string" ? { newName: flags.name } : {},
          ...values.length ? { values } : {},
          ...n("min") !== void 0 ? { min: n("min") } : {},
          ...n("max") !== void 0 ? { max: n("max") } : {},
          ...typeof flags.default === "string" ? { default: flags.default } : {},
          ...src
        });
      if (pos[0] === "delete") return deleteParameter({ name: need(pos.slice(1).join(" ") || void 0, "el nombre del parametro"), ...src });
      if (pos[0] !== "add") throw new Error("Uso: params add|update|delete ... (ver ayuda)");
      return addParameter({
        name: need(typeof flags.name === "string" ? flags.name : void 0, "--name"),
        ...typeof flags.type === "string" ? { type: flags.type } : {},
        ...values.length ? { values } : {},
        ...n("min") !== void 0 ? { min: n("min") } : {},
        ...n("max") !== void 0 ? { max: n("max") } : {},
        ...typeof flags.default === "string" ? { default: flags.default } : {},
        ...typeof flags.source === "string" ? { source: flags.source } : {}
      });
    }
    case "orphans":
      return findOrphans(pos);
    case "report": {
      if (pos[0] !== "settings") throw new Error("Uso: report settings [--viewer-filter-bar on|off] [--cross-filter on|off] [--set clave=valor ...]");
      const patch = {};
      const bool = (v) => v === true || /^(on|true|1|si|yes)$/i.test(String(v));
      if (flags["viewer-filter-bar"] !== void 0) patch.viewerFilterBar = bool(flags["viewer-filter-bar"]);
      if (flags["cross-filter"] !== void 0) patch.crossFilterByDefault = bool(flags["cross-filter"]);
      if (typeof flags.set === "string") for (const kv of flags.set.split(",")) {
        const [k, v] = kv.split("=");
        if (k) patch[k] = v === void 0 ? true : /^-?\d+(\.\d+)?$/.test(v) ? Number(v) : /^(true|false)$/.test(v) ? v === "true" : v;
      }
      return reportSettings(patch);
    }
    case "fields": {
      if (pos[0] !== "add") throw new Error("Uso: fields add --name N --formula F [--source texto] [--allow-shared]");
      return addSourceField({
        name: need(typeof flags.name === "string" ? flags.name : void 0, "--name"),
        formula: need(typeof flags.formula === "string" ? flags.formula : void 0, "--formula"),
        ...typeof flags.source === "string" ? { source: flags.source } : {},
        ...flags["allow-shared"] ? { allowShared: true } : {}
      });
    }
    case "filters": {
      if (pos[0] === "add") {
        const vals = list(flags.values).map((v) => v !== "" && !Number.isNaN(Number(v)) && typeof flags.numeric !== "undefined" ? Number(v) : v);
        return addFilter(
          {
            name: need(typeof flags.name === "string" ? flags.name : void 0, "--name"),
            field: need(typeof flags.field === "string" ? flags.field : void 0, "--field"),
            ...typeof flags.op === "string" ? { op: flags.op } : {},
            values: vals,
            include: !flags.exclude,
            ...typeof flags.dataset === "string" ? { dataset: flags.dataset } : {}
          },
          typeof flags.to === "string" ? flags.to : void 0
        );
      }
      if (pos[0] === "update") {
        const vals = flags.values === void 0 ? void 0 : list(flags.values).map((v) => v !== "" && !Number.isNaN(Number(v)) && typeof flags.numeric !== "undefined" ? Number(v) : v);
        return updateFilter({
          filterId: need(pos[1], "filterId"),
          ...typeof flags.name === "string" ? { name: flags.name } : {},
          ...typeof flags.op === "string" ? { op: flags.op } : {},
          ...vals ? { values: vals } : {},
          ...flags.exclude ? { include: false } : flags.include ? { include: true } : {}
        });
      }
      if (pos[0] === "detach") return detachFilter(need(pos[1], "filterId"), need(pos[2], "destino"));
      return listFilters();
    }
    case "theme": {
      if (pos[0] === "presets") return themeLibrary();
      if (pos[0] === "use") return useThemePreset(need(pos.slice(1).join(" "), "el preset"));
      if (pos[0] === "export") return exportTheme(need(pos[1], "el archivo"));
      if (pos[0] === "import") return importTheme(need(pos[1], "el archivo"));
      if (pos[0] !== "set") return readTheme();
      const arg = need(pos[1], "el tema (JSON o archivo)");
      return applyTheme(JSON.parse(existsSync(arg) ? readFileSync(arg, "utf8") : arg));
    }
    case "ux":
      return uxAudit();
    case "templates":
      if (pos[0] === "capture") return captureTemplates();
      if (pos[0] === "synth") return synthesizeTemplates(pos.slice(1));
      if (pos[0] === "seed-ui") return seedTemplatesFromUi(pos.slice(1));
      return listTemplates();
    case "learnings":
      return flags.raw ? readLearnings() : summary();
    case "learn": {
      const key = need(pos[0], "la clave");
      const text = pos.slice(1).join(" ");
      const kind = /^reason:\d+$/.test(key) || /^[A-Z_]+$/.test(key) ? "fix" : "note";
      const clean = sanitizeLearning(text);
      learn(kind, key, kind === "fix" ? { fix: clean, source: "user" } : { text: clean });
      return { recorded: kind, key };
    }
    default:
      throw new Error(`Comando desconocido "${cmd}".

${HELP}`);
  }
}
main().then(async (out) => {
  if (out !== void 0) process.stdout.write(JSON.stringify(out, null, 2) + "\n");
  await closeQuietly();
}).catch(async (err) => {
  process.stderr.write(`Error: ${err instanceof Error ? err.message : String(err)}
`);
  await closeQuietly();
  process.exit(1);
});
async function closeQuietly() {
  try {
    await disconnectIfConnected();
  } catch {
  }
}
