// src/hook-lint.ts
import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync as readFileSync2 } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

// src/spec.ts
import { readFileSync } from "node:fs";
var KNOWN_TYPES = [
  "simple-linechart",
  "simple-barchart",
  "simple-histogram",
  "simple-combochart",
  "simple-piechart",
  "simple-table",
  "google-map",
  "simple-geomap",
  "kpi-metric",
  "simple-scatterchart",
  "bulletchart",
  "simple-areachart",
  "pivot-table",
  "simple-treemap",
  "gauge-viz",
  "simple-sankey",
  "simple-waterfall",
  "simple-timeline",
  "simple-funnel",
  "third-party-viz",
  "framed-external-content",
  "notebook-data-app",
  "simple-description",
  "image-component",
  "arrow",
  "placeholder",
  "shape",
  "ellipse",
  "generic-shape",
  "filter-bar",
  "metric-filter",
  "advanced-filter",
  "simple-daterangepicker",
  "dimension-filter",
  "dataset-picker",
  "dimension-control",
  "button"
];
var NON_DATA = /* @__PURE__ */ new Set(["simple-description", "image-component", "arrow", "placeholder", "shape", "ellipse", "generic-shape", "framed-external-content", "button"]);
function loadSpec(file) {
  const spec = JSON.parse(readFileSync(file, "utf8"));
  if (!spec || !Array.isArray(spec.pages)) throw new Error(`${file}: falta "pages" (array).`);
  return spec;
}
function resolveSpec(spec) {
  const grid = spec.grid ?? 10;
  const W = spec.canvasWidth ?? 1200;
  const floorGrid = (v) => Math.floor(v / grid) * grid;
  const out = [];
  for (const p of spec.pages) {
    const page = p.page ?? (p.name ? `name:${p.name}` : "active");
    for (const c of p.components) {
      if ("row" in c) {
        const { y, h } = c.row;
        const margin = c.row.margin ?? 20;
        const gap = c.row.gap ?? 20;
        const x0 = c.row.x ?? margin;
        const width = c.row.width ?? W - x0 - margin;
        const n = c.items.length;
        const w = floorGrid((width - (n - 1) * gap) / n);
        c.items.forEach((it, i) => {
          out.push({
            key: it.key,
            type: it.type,
            id: it.id,
            x: x0 + i * (w + gap),
            y,
            w,
            h,
            padding: it.padding ?? spec.defaults?.padding,
            dataset: it.dataset ?? spec.defaults?.dataset,
            dimensions: it.dimensions ?? [],
            metrics: it.metrics ?? [],
            page,
            ...it.dateRangeDays !== void 0 ? { dateRangeDays: it.dateRangeDays } : {},
            ...it.stripStyles ? { stripStyles: true } : {},
            ...it.filters ? { filters: it.filters } : {},
            ...it.variant ? { variant: it.variant } : {},
            ...it.slots ? { slots: it.slots } : {},
            ...it.text !== void 0 ? { text: it.text } : {},
            ...it.parameter ? { parameter: it.parameter } : {},
            ...it.style ? { style: it.style } : {}
          });
        });
      } else {
        out.push({
          key: c.key,
          type: c.type,
          id: c.id,
          x: c.x ?? 0,
          y: c.y ?? 0,
          w: c.w ?? 400,
          h: c.h ?? 300,
          padding: c.padding ?? spec.defaults?.padding,
          dataset: c.dataset ?? spec.defaults?.dataset,
          dimensions: c.dimensions ?? [],
          metrics: c.metrics ?? [],
          page,
          ...c.dateRangeDays !== void 0 ? { dateRangeDays: c.dateRangeDays } : {},
          ...c.stripStyles ? { stripStyles: true } : {},
          ...c.filters ? { filters: c.filters } : {},
          ...c.variant ? { variant: c.variant } : {},
          ...c.slots ? { slots: c.slots } : {},
          ...c.text !== void 0 ? { text: c.text } : {},
          ...c.parameter ? { parameter: c.parameter } : {},
          ...c.style ? { style: c.style } : {}
        });
      }
    }
  }
  return out;
}
function lintSpec(spec) {
  const grid = spec.grid ?? 10;
  const W = spec.canvasWidth ?? 1200;
  const H = spec.canvasHeight ?? 1e4;
  const comps = resolveSpec(spec);
  const issues = [];
  const push = (severity, key, rule, message) => issues.push({ severity, key, rule, message });
  const keys = /* @__PURE__ */ new Set();
  for (const c of comps) {
    if (!c.key) push("error", null, "key", 'Cada componente necesita "key" (identificador estable del spec).');
    if (keys.has(c.key)) push("error", c.key, "key", `Clave duplicada "${c.key}".`);
    keys.add(c.key);
    if (!KNOWN_TYPES.includes(c.type)) push("error", c.key, "type", `Tipo desconocido "${c.type}".`);
    if ([c.x, c.y, c.w, c.h].some((v) => v % grid !== 0))
      push("warning", c.key, "grid", `x/y/w/h (${c.x},${c.y},${c.w},${c.h}) no son multiplos de la reticula ${grid}px [diseno-layout \xA73].`);
    if (c.x < 0 || c.y < 0 || c.x + c.w > W || c.y + c.h > H)
      push("error", c.key, "canvas", `Se sale del lienzo ${W}x${H} [diseno-layout \xA72].`);
    if (c.x < 20 || W - (c.x + c.w) < 20) push("info", c.key, "margin", "Margen exterior < 20 px [diseno-layout \xA73].");
    if (c.padding !== void 0 && (c.padding < 10 || c.padding > 16))
      push("info", c.key, "padding", `Padding ${c.padding}px fuera de 10\u201316 px [diseno-layout \xA73].`);
    if (c.type === "kpi-metric") {
      if (c.metrics.length !== 1 && !c.slots) push("warning", c.key, "kpi", "Un scorecard debe tener exactamente 1 metrica [kpi-scorecards].");
      if (c.h < 100 || c.h > 140) push("info", c.key, "kpi", `Alto de scorecard ${c.h}px fuera de 100\u2013140 [kpi-scorecards \xA71].`);
    }
    if (c.type === "simple-daterangepicker" && c.dateRangeDays === void 0)
      push("info", c.key, "date-range", "Control de periodo sin dateRangeDays: heredara el periodo por defecto (p. ej. ultimos 28 dias) y puede dejar la pagina sin datos.");
    if (!NON_DATA.has(c.type) && !["filter-bar", "simple-daterangepicker"].includes(c.type) && !c.dataset)
      push("warning", c.key, "dataset", "Sin dataset: se usara el del componente clonado o el del informe.");
  }
  const byPage = /* @__PURE__ */ new Map();
  for (const c of comps) byPage.set(c.page, [...byPage.get(c.page) ?? [], c]);
  for (const [page, list] of byPage) {
    for (let i = 0; i < list.length; i++)
      for (let j = i + 1; j < list.length; j++) {
        const a = list[i], b = list[j];
        if (a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h)
          push("warning", a.key, "overlap", `Se solapa con "${b.key}" en la pagina ${page}.`);
      }
    const data = list.filter((c) => !NON_DATA.has(c.type)).length;
    if (data > 25) push("error", null, "density", `Pagina ${page}: ${data} componentes con datos (>25) [rendimiento].`);
    else if (data > 15) push("warning", null, "density", `Pagina ${page}: ${data} componentes con datos (>15) [rendimiento].`);
    const kpis = list.filter((c) => c.type === "kpi-metric");
    const rows = /* @__PURE__ */ new Map();
    for (const k of kpis) rows.set(k.y, [...rows.get(k.y) ?? [], k]);
    for (const [y, row] of rows) {
      if (row.length > 1 && (row.length < 4 || row.length > 6))
        push("info", null, "kpi-row", `Fila de KPIs en y=${y} con ${row.length} tarjetas (recomendado 4\u20136) [kpi-scorecards \xA71].`);
      if (new Set(row.map((r) => r.h)).size > 1) push("warning", null, "kpi-row", `Fila y=${y}: alturas distintas [kpi-scorecards \xA71].`);
      const sorted = [...row].sort((a, b) => a.x - b.x);
      const gaps = sorted.slice(1).map((r, i) => r.x - (sorted[i].x + sorted[i].w));
      if (gaps.length && Math.max(...gaps) - Math.min(...gaps) > 2) push("warning", null, "kpi-row", `Fila y=${y}: separaciones irregulares (${gaps.join(", ")}) [diseno-layout \xA73].`);
    }
  }
  return { issues, components: comps };
}

// src/hook-lint.ts
function emit(out) {
  process.stdout.write(JSON.stringify(out));
  process.exit(0);
}
function context(text) {
  emit({ hookSpecificOutput: { hookEventName: "PostToolUse", additionalContext: text } });
}
function findCli() {
  const override = process.env.LS_STUDIO_CLI;
  if (override && existsSync(override)) return override;
  const cache = join(homedir(), ".claude", "plugins", "cache");
  if (!existsSync(cache)) return null;
  for (const market of readdirSync(cache)) {
    const plugin = join(cache, market, "looker-studio-authoring");
    if (!existsSync(plugin)) continue;
    for (const version of readdirSync(plugin).sort().reverse()) {
      const cli = join(plugin, version, "looker-studio-mcp", "dist", "cli.js");
      if (existsSync(cli)) return cli;
    }
  }
  return null;
}
async function cdpUp() {
  const url = (process.env.LS_CDP_URL || "http://127.0.0.1:9222") + "/json/version";
  try {
    const r = await fetch(url, { signal: AbortSignal.timeout(1500) });
    return r.ok;
  } catch {
    return false;
  }
}
async function main() {
  let input = {};
  try {
    input = JSON.parse(readFileSync2(0, "utf8") || "{}");
  } catch {
    process.exit(0);
  }
  const file = input.tool_input?.file_path ?? input.tool_input?.path ?? "";
  if (!/\.spec\.json$/i.test(file) || /\.state\.json$/i.test(file) || !existsSync(file)) process.exit(0);
  let issues;
  try {
    issues = lintSpec(loadSpec(file)).issues;
  } catch (e) {
    emit({ decision: "block", reason: `${file} no es un spec v\xE1lido: ${e.message}` });
  }
  const errors = issues.filter((i) => i.severity === "error");
  const warnings = issues.filter((i) => i.severity === "warning");
  const fmt = (i) => `- [${i.rule}]${i.key ? ` ${i.key}:` : ""} ${i.message}`;
  if (errors.length) {
    emit({
      decision: "block",
      reason: `looker-studio-guardrails: ${errors.length} error(es) de lint en ${file}. Corr\xEDgelos antes de aplicar el spec:
` + errors.map(fmt).join("\n")
    });
  }
  const notes = [`looker-studio-guardrails: ${file} pasa el lint (${warnings.length} aviso(s)).`];
  if (warnings.length) notes.push(warnings.map(fmt).join("\n"));
  if (await cdpUp()) {
    const cli = findCli();
    if (!cli) {
      notes.push("Hay un navegador en el puerto CDP, pero no se encontr\xF3 el CLI de looker-studio-authoring para el dry-run (define LS_STUDIO_CLI).");
    } else {
      try {
        const plan = execFileSync(process.execPath, [cli, "apply", file, "--dry-run"], {
          encoding: "utf8",
          timeout: 9e4,
          stdio: ["ignore", "pipe", "ignore"]
        });
        notes.push(`Dry-run contra el informe abierto (nada aplicado):
${plan.slice(0, 4e3)}`);
      } catch (e) {
        notes.push(`El dry-run no se pudo ejecutar: ${e.message.split("\n")[0]}`);
      }
    }
  }
  context(notes.join("\n\n"));
}
void main();
