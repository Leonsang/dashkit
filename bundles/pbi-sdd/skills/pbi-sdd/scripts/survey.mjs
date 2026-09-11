#!/usr/bin/env node
// Surveys a Power BI project (PBIP) and prints an evidence report: what the
// report shows, what the model holds, where the data comes from, and what looks
// wrong. It reads files only — nothing is changed, nothing is sent anywhere.
//
//   node survey.mjs <project.pbip | project folder> [--json]
//
// The agent writes the narrative survey from this output; the script exists so
// that the inventory is exact and cheap instead of being read by hand.
import { readFileSync, readdirSync, existsSync, statSync } from "node:fs";
import { join, dirname, basename, resolve } from "node:path";

const args = process.argv.slice(2);
const asJSON = args.includes("--json");
const target = args.find((a) => !a.startsWith("--"));
if (!target) {
  console.error("usage: node survey.mjs <project.pbip | folder> [--json]");
  process.exit(2);
}

// ---- locate the report and the model --------------------------------------
function findPbip(p) {
  const abs = resolve(p);
  if (statSync(abs).isFile()) return abs;
  const found = readdirSync(abs).filter((f) => f.endsWith(".pbip"));
  if (found.length === 0) throw new Error(`no .pbip file in ${abs}`);
  if (found.length > 1) throw new Error(`several .pbip files in ${abs}; name one: ${found.join(", ")}`);
  return join(abs, found[0]);
}

const readJSON = (f) => JSON.parse(readFileSync(f, "utf8").replace(/^﻿/, ""));
const pbip = findPbip(target);
const root = dirname(pbip);
const name = basename(pbip, ".pbip");
const pbipJSON = readJSON(pbip);
const reportRel = pbipJSON.artifacts?.find((a) => a.report)?.report?.path ?? `${name}.Report`;
const reportDir = join(root, reportRel);
const defDir = join(reportDir, "definition");

let modelDir = null;
let connection = null;
const pbir = join(reportDir, "definition.pbir");
if (existsSync(pbir)) {
  const ref = readJSON(pbir).datasetReference ?? {};
  if (ref.byPath?.path) modelDir = join(reportDir, ref.byPath.path);
  else if (ref.byConnection) connection = ref.byConnection;
}
if (!modelDir && existsSync(join(root, `${name}.SemanticModel`))) modelDir = join(root, `${name}.SemanticModel`);

// ---- report: pages and visuals ----------------------------------------------
const pages = [];
const fieldUses = new Map(); // "Table|Name" -> Set(page names)
const refKinds = new Map(); // "Table|Name" -> "Measure" | "Column" | ...

// Every field reference in PBIR has the same shape wherever it appears — query,
// filters, conditional formatting: { <Kind>: { Expression: { SourceRef: { Entity } }, Property } }.
function collectRefs(node, page) {
  if (Array.isArray(node)) return node.forEach((n) => collectRefs(n, page));
  if (!node || typeof node !== "object") return;
  for (const [kind, val] of Object.entries(node)) {
    const entity = val?.Expression?.SourceRef?.Entity;
    if (entity && typeof val.Property === "string" && ["Column", "Measure", "Hierarchy", "HierarchyLevel"].includes(kind)) {
      const key = `${entity}|${val.Property}`;
      if (!fieldUses.has(key)) fieldUses.set(key, new Set());
      fieldUses.get(key).add(page);
      refKinds.set(key, kind);
    }
    collectRefs(val, page);
  }
}

if (existsSync(join(defDir, "pages"))) {
  const meta = existsSync(join(defDir, "pages", "pages.json")) ? readJSON(join(defDir, "pages", "pages.json")) : {};
  const order = meta.pageOrder ?? readdirSync(join(defDir, "pages")).filter((d) => existsSync(join(defDir, "pages", d, "page.json")));
  for (const id of order) {
    const pdir = join(defDir, "pages", id);
    if (!existsSync(join(pdir, "page.json"))) continue;
    const page = readJSON(join(pdir, "page.json"));
    // Page-level filters use fields too; missing them would call a measure
    // unused when it is filtering a whole page.
    collectRefs(page, page.displayName ?? id);
    const types = {};
    let hidden = 0;
    const vdir = join(pdir, "visuals");
    const visualIds = existsSync(vdir) ? readdirSync(vdir).filter((v) => existsSync(join(vdir, v, "visual.json"))) : [];
    for (const v of visualIds) {
      const vis = readJSON(join(vdir, v, "visual.json"));
      const t = vis.visual?.visualType ?? (vis.visualGroup ? "group" : "unknown");
      types[t] = (types[t] ?? 0) + 1;
      if (vis.isHidden) hidden++;
      collectRefs(vis, page.displayName ?? id);
    }
    pages.push({
      name: page.displayName ?? id,
      hidden: page.visibility === "HiddenInViewMode",
      size: page.width && page.height ? `${page.width}x${page.height}` : "",
      visuals: visualIds.length,
      hiddenVisuals: hidden,
      types,
    });
  }
}

// Report-level filters and bookmarked states reference fields as well.
if (existsSync(join(defDir, "report.json"))) collectRefs(readJSON(join(defDir, "report.json")), "report filters");
if (existsSync(join(defDir, "bookmarks"))) {
  for (const f of readdirSync(join(defDir, "bookmarks")).filter((f) => f.endsWith(".bookmark.json"))) {
    collectRefs(readJSON(join(defDir, "bookmarks", f)), "bookmarks");
  }
}

// ---- model: TMDL -------------------------------------------------------------
// A light TMDL reader: objects start at one tab of indentation, their
// properties at two; `///` lines right above an object are its description.
const tables = [];
const measures = [];
const relationships = [];
const roles = [];
const sources = [];

function readTmdl(file) {
  return readFileSync(file, "utf8").replace(/^﻿/, "").replace(/\r\n/g, "\n").split("\n");
}
const unquote = (s) => s.trim().replace(/^'(.*)'$/, "$1").replace(/''/g, "'");

function parseTable(file) {
  const lines = readTmdl(file);
  const head = lines.find((l) => l.startsWith("table "));
  if (!head) return;
  const table = { name: unquote(head.slice(6)), columns: 0, calculated: 0, measures: 0, hidden: false, partitions: [] };
  let pendingDoc = [];
  let current = null; // the object whose properties we are reading
  let inSource = false;
  let sourceText = [];

  const flushSource = () => {
    if (inSource && current?.kind === "partition") current.source = sourceText.join("\n");
    inSource = false;
    sourceText = [];
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const depth = line.match(/^\t*/)[0].length;
    const text = line.trim();
    if (inSource && (depth >= 3 || text === "")) {
      sourceText.push(text);
      continue;
    }
    flushSource();
    if (text.startsWith("///")) {
      pendingDoc.push(text.slice(3).trim());
      continue;
    }
    if (depth === 1 && /^(measure|column|partition|hierarchy|calculationGroup)\s/.test(text)) {
      const kind = text.split(/\s/)[0];
      const rest = text.slice(kind.length).trim();
      const eq = rest.indexOf("=");
      const objName = unquote(eq >= 0 ? rest.slice(0, eq) : rest);
      current = { kind, name: objName, description: pendingDoc.join(" "), expression: eq >= 0 ? rest.slice(eq + 1).trim() : "" };
      pendingDoc = [];
      if (kind === "measure") {
        // The expression runs on until the first property line.
        const expr = [current.expression];
        let j = i + 1;
        while (j < lines.length && !/^\t\t[A-Za-z]+:/.test(lines[j]) && !/^\t\S/.test(lines[j]) && !/^\S/.test(lines[j])) {
          expr.push(lines[j].trim());
          j++;
        }
        current.expression = expr.join(" ").replace(/```/g, "").trim();
        current.table = table.name;
        measures.push(current);
        table.measures++;
      } else if (kind === "column") {
        table.columns++;
        if (current.expression) table.calculated++;
      } else if (kind === "partition") {
        table.partitions.push(current);
      }
      continue;
    }
    if (depth === 0 && text.startsWith("table ")) continue;
    if (depth === 1 && text === "isHidden") table.hidden = true;
    if (depth === 2 && current) {
      const m = text.match(/^([A-Za-z]+):\s*(.*)$/);
      if (m) {
        current[m[1]] = m[2];
      } else if (text === "isHidden") {
        current.isHidden = true;
      } else if (text.startsWith("source =") && current.kind === "partition") {
        inSource = true;
        sourceText = [text.slice("source =".length).trim()];
      }
    }
    if (text !== "" && !text.startsWith("///")) pendingDoc = [];
  }
  flushSource();
  tables.push(table);
}

function parseRelationships(file) {
  let rel = null;
  for (const line of readTmdl(file)) {
    const text = line.trim();
    if (text.startsWith("relationship ")) {
      rel = { active: true, crossFilter: "single" };
      relationships.push(rel);
    } else if (rel) {
      const m = text.match(/^([A-Za-z]+):\s*(.*)$/);
      if (!m) continue;
      if (m[1] === "fromColumn") rel.from = m[2];
      if (m[1] === "toColumn") rel.to = m[2];
      if (m[1] === "isActive") rel.active = m[2] !== "false";
      if (m[1] === "crossFilteringBehavior") rel.crossFilter = m[2];
    }
  }
}

// What a partition's M reads from, and whether that location travels.
const CONNECTORS = [
  ["Excel.Workbook", "Excel"], ["Csv.Document", "CSV"], ["Sql.Database", "SQL Server"],
  ["Sql.Databases", "SQL Server"], ["Web.Contents", "Web"], ["SharePoint.", "SharePoint"],
  ["Lakehouse.", "Fabric Lakehouse"], ["Fabric.", "Fabric"], ["PowerBI.Dataflows", "Dataflow"],
  ["AnalysisServices.", "Analysis Services"], ["Databricks.", "Databricks"], ["Snowflake.", "Snowflake"],
  ["Odbc.", "ODBC"], ["OData.Feed", "OData"], ["Json.Document", "JSON"], ["Folder.Files", "Folder"],
];
function describeSource(table, partition) {
  const m = partition.source ?? "";
  const kinds = CONNECTORS.filter(([fn]) => m.includes(fn)).map(([, label]) => label);
  const file = m.match(/File\.Contents\("([^"]+)"/)?.[1];
  const local = file && /^[A-Za-z]:\\|^\\\\|^\//.test(file);
  sources.push({
    table, partition: partition.name, mode: partition.mode ?? (partition.expression === "m" ? "import" : ""),
    kinds: [...new Set(kinds)], file: file ?? null, localPath: Boolean(local),
    calculated: partition.expression === "calculated",
  });
}

if (modelDir) {
  const def = join(modelDir, "definition");
  if (existsSync(join(def, "tables"))) {
    for (const f of readdirSync(join(def, "tables")).filter((f) => f.endsWith(".tmdl")).sort()) parseTable(join(def, "tables", f));
  }
  if (existsSync(join(def, "relationships.tmdl"))) parseRelationships(join(def, "relationships.tmdl"));
  if (existsSync(join(def, "roles"))) {
    for (const f of readdirSync(join(def, "roles")).filter((f) => f.endsWith(".tmdl"))) roles.push(basename(f, ".tmdl"));
  }
  for (const t of tables) for (const p of t.partitions) describeSource(t.name, p);
}

// ---- cross-reference: what is used, what is broken ---------------------------
const measureKey = (m) => `${m.table}|${m.name}`;
const known = new Set([...measures.map(measureKey)]);
const tableNames = new Set(tables.map((t) => t.name));
// Columns are not individually listed above, so a reference to a column is
// only called broken when its whole table is missing.
const referencedInDax = new Set();
for (const m of measures) {
  for (const other of measures) {
    if (other !== m && m.expression.includes(`[${other.name}]`)) referencedInDax.add(measureKey(other));
  }
}
const unused = modelDir
  ? measures.filter((m) => !fieldUses.has(measureKey(m)) && !referencedInDax.has(measureKey(m)))
  : [];
const broken = [];
if (modelDir) {
  for (const [key, used] of fieldUses) {
    const [table, prop] = key.split("|");
    const kind = refKinds.get(key);
    if (!tableNames.has(table)) broken.push({ table, name: prop, kind, pages: [...used] });
    else if (kind === "Measure" && !known.has(key)) broken.push({ table, name: prop, kind, pages: [...used] });
  }
}
const undocumented = measures.filter((m) => !m.description);
const unformatted = measures.filter((m) => !m.formatString);
const noFolder = measures.filter((m) => !m.displayFolder);
const bidirectional = relationships.filter((r) => /both/i.test(r.crossFilter));
const inactive = relationships.filter((r) => !r.active);
const localSources = sources.filter((s) => s.localPath);
const busyPages = pages.filter((p) => p.visuals - (p.types.actionButton ?? 0) - (p.types.shape ?? 0) - (p.types.textbox ?? 0) > 12);
// Power BI's "Auto date/time" adds a hidden LocalDateTable_* for every date
// column (plus a DateTableTemplate_*): model weight nobody asked for, and a
// sign there is no proper date table marked as such.
const autoDateTables = tables.filter((t) => /^(LocalDateTable_|DateTableTemplate_)/.test(t.name)).map((t) => t.name);

const survey = {
  project: name,
  report: reportRel,
  model: modelDir ? basename(modelDir) : null,
  connection,
  pages,
  model_summary: {
    tables: tables.length,
    measures: measures.length,
    columns: tables.reduce((n, t) => n + t.columns, 0),
    calculatedColumns: tables.reduce((n, t) => n + t.calculated, 0),
    relationships: relationships.length,
    roles,
  },
  sources,
  findings: {
    brokenReferences: broken,
    unusedMeasures: unused.map((m) => `${m.table}[${m.name}]`),
    measuresWithoutDescription: undocumented.map((m) => `${m.table}[${m.name}]`),
    measuresWithoutFormat: unformatted.map((m) => `${m.table}[${m.name}]`),
    measuresWithoutFolder: noFolder.map((m) => `${m.table}[${m.name}]`),
    bidirectionalRelationships: bidirectional.map((r) => `${r.from} ↔ ${r.to}`),
    inactiveRelationships: inactive.map((r) => `${r.from} → ${r.to}`),
    localFileSources: localSources.map((s) => ({ table: s.table, file: s.file })),
    busyPages: busyPages.map((p) => p.name),
    autoDateTables,
  },
};

if (asJSON) {
  console.log(JSON.stringify(survey, null, 2));
  process.exit(0);
}

// ---- markdown ------------------------------------------------------------------
const out = [];
const list = (items, max = 12) => {
  if (items.length === 0) return ["- none"];
  const shown = items.slice(0, max).map((i) => `- ${i}`);
  if (items.length > max) shown.push(`- … and ${items.length - max} more`);
  return shown;
};
out.push(`# Survey evidence: ${name}`, "");
out.push(`Report \`${reportRel}\`; model ${modelDir ? `\`${basename(modelDir)}\` (local TMDL)` : connection ? "remote (thin report, `byConnection`)" : "not found"}.`, "");
out.push("## Pages", "", "| # | Page | Visuals | By type | Notes |", "|---|---|---|---|---|");
pages.forEach((p, i) => {
  const byType = Object.entries(p.types).sort((a, b) => b[1] - a[1]).map(([t, n]) => `${t} ${n}`).join(", ");
  const notes = [p.hidden && "hidden page", p.hiddenVisuals && `${p.hiddenVisuals} hidden visuals`].filter(Boolean).join("; ");
  out.push(`| ${i + 1} | ${p.name} | ${p.visuals} | ${byType} | ${notes} |`);
});
out.push("");
if (modelDir) {
  const s = survey.model_summary;
  out.push("## Model", "");
  out.push(`${s.tables} tables, ${s.columns} columns (${s.calculatedColumns} calculated), ${s.measures} measures, ${s.relationships} relationships, ${s.roles.length ? `RLS roles: ${s.roles.join(", ")}` : "no RLS roles"}.`, "");
  out.push("| Table | Columns | Measures | Hidden |", "|---|---|---|---|");
  for (const t of tables) out.push(`| ${t.name} | ${t.columns} | ${t.measures} | ${t.hidden ? "yes" : ""} |`);
  out.push("", "## Data sources", "", "| Table | Mode | Connector | Location |", "|---|---|---|---|");
  for (const s of sources) {
    const where = s.calculated ? "calculated in the model" : s.file ? `\`${s.file}\`${s.localPath ? " ⚠ local path" : ""}` : "";
    out.push(`| ${s.table} | ${s.mode} | ${s.kinds.join(", ") || (s.calculated ? "DAX" : "?")} | ${where} |`);
  }
  out.push("");
}
const f = survey.findings;
out.push("## Findings", "");
out.push(`### Broken references (${f.brokenReferences.length})`, "", ...list(f.brokenReferences.map((b) => `${b.kind} \`${b.table}[${b.name}]\` used on ${b.pages.join(", ")} does not exist in the model`)), "");
out.push(`### Local file sources (${f.localFileSources.length})`, "", "These paths only exist on one machine; a refresh anywhere else, including the Power BI service, fails.", "", ...list(f.localFileSources.map((s) => `${s.table}: \`${s.file}\``)), "");
out.push(`### Unused measures (${f.unusedMeasures.length})`, "", "Not on any visual, filter or format rule, and not referenced by another measure.", "", ...list(f.unusedMeasures), "");
out.push(`### Measures without a description (${f.measuresWithoutDescription.length} of ${measures.length})`, "", ...list(f.measuresWithoutDescription, 8), "");
out.push(`### Measures without a format string (${f.measuresWithoutFormat.length})`, "", ...list(f.measuresWithoutFormat, 8), "");
out.push(`### Measures outside any display folder (${f.measuresWithoutFolder.length})`, "", ...list(f.measuresWithoutFolder, 8), "");
out.push(`### Bidirectional relationships (${f.bidirectionalRelationships.length})`, "", ...list(f.bidirectionalRelationships), "");
out.push(`### Inactive relationships (${f.inactiveRelationships.length})`, "", "Only used through USERELATIONSHIP; check each is intentional.", "", ...list(f.inactiveRelationships), "");
out.push(`### Auto date/time tables (${f.autoDateTables.length})`, "", "Hidden tables Power BI generates per date column when Auto date/time is on. Turning it off and marking one date table usually shrinks the model.", "", ...list(f.autoDateTables, 6), "");
out.push(`### Pages with more than 12 data visuals (${f.busyPages.length})`, "", ...list(f.busyPages), "");
console.log(out.join("\n"));
