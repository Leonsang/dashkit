#!/usr/bin/env node
// Regenerates internal/catalog/manifest.json.
//
//   node tools/gen-manifest.mjs <skills-for-fabric clone> <ref> [--goblin <power-bi-agentic-development clone>]
//
// Two kinds of bundle come out of this:
//
// - vendored: Microsoft's skills-for-fabric (MIT). The upstream marketplace file
//   is the source of truth for which skills, agents and MCP servers belong to
//   each bundle; dashkit downloads the pinned tag and writes it into each host.
//
// - marketplace: curated plugins from data-goblin/power-bi-agentic-development.
//   Its licence does not allow copying the skills into another tool, so dashkit
//   never downloads or rewrites them — it asks the host's own plugin manager to
//   install them. The clone is read only to list skill names for the docs; the
//   descriptions below are dashkit's own words.
//
// Prerequisite mappings and titles are dashkit's and live in the tables below.
import { readFileSync, writeFileSync, existsSync, readdirSync } from "node:fs";
import { join, resolve } from "node:path";

const args = process.argv.slice(2);
const goblinFlag = args.indexOf("--goblin");
const goblinRoot = goblinFlag >= 0 ? resolve(args[goblinFlag + 1]) : null;
const positional = args.filter((_, i) => goblinFlag < 0 || (i !== goblinFlag && i !== goblinFlag + 1));

const root = resolve(positional[0] ?? ".");
const ref = positional[1] ?? "main";

const marketplace = JSON.parse(
  readFileSync(join(root, ".claude-plugin", "marketplace.json"), "utf8"),
);

// Bundle id -> prerequisite ids (see internal/prereq). "required" blocks install,
// "optional" is reported by doctor but never blocks.
const PREREQS = {
  "powerbi-authoring": {
    required: ["git", "node20", "npm:@microsoft/powerbi-report-authoring-cli"],
    optional: [
      "npm:@microsoft/powerbi-desktop-bridge-cli",
      "pbir-cli",
      "az",
      "powerbi-desktop",
    ],
  },
  "fabric-skills": { required: ["git", "az"], optional: ["node20", "sqlcmd"] },
  "fabric-authoring": { required: ["git", "az"], optional: ["sqlcmd"] },
  "fabric-consumption": { required: ["git", "az"], optional: ["sqlcmd"] },
  "fabric-operations": { required: ["git", "az"], optional: ["sqlcmd"] },
};

// Short labels for the wizard list; the upstream description is kept as the long form.
const TITLES = {
  "powerbi-authoring": "Power BI authoring",
  "fabric-skills": "Fabric — everything",
  "fabric-authoring": "Fabric authoring",
  "fabric-consumption": "Fabric consumption",
  "fabric-operations": "Fabric operations",
};

const MICROSOFT_CREDIT = {
  author: "Microsoft",
  license: "MIT",
  homepage: "https://github.com/microsoft/skills-for-fabric",
};

const GOBLIN_CREDIT = {
  author: "Kurt Buhler, Data Goblins",
  license: "GPL-3.0",
  homepage: "https://github.com/data-goblin/power-bi-agentic-development",
};

// The data-goblin plugins dashkit offers. Deliberately a short list: the
// marketplace itself warns that every installed skill competes for the agent's
// context window, so offering all twelve would repeat the mistake it warns about.
const CURATED = [
  {
    plugin: "pbip",
    id: "goblin-pbip",
    title: "PBIP guardrails",
    description:
      "Checks PBIR structure, TMDL syntax and report-to-model binding automatically after every edit, with PBIR and TMDL format references. Ships native validators for macOS, Linux and Windows; its hooks need jq, and silently do nothing without it.",
    hooks: [
      "PBIR structure and schema, after any edit inside a .Report folder",
      "TMDL syntax, after any .tmdl edit",
      "report-to-model binding, after definition.pbir edits",
    ],
    prereqs: { required: ["jq"], optional: ["python3", "pbir-cli"] },
  },
  {
    plugin: "pbi-desktop",
    id: "goblin-pbi-desktop",
    title: "Live model guardrails",
    description:
      "Connects to an open Power BI Desktop model and checks DAX references, measure metadata and referential integrity as the agent changes it. Windows only, with Power BI Desktop running.",
    hooks: [
      "DAX references resolve to real tables, columns and measures",
      "new measures carry a display folder, description and format string",
      "referential integrity after relationship or key-column changes",
    ],
    prereqs: { required: ["windows-desktop", "jq"], optional: [] },
  },
  {
    plugin: "semantic-models",
    id: "goblin-semantic-models",
    title: "Semantic model craft",
    description:
      "DAX, Power Query, naming conventions, lineage analysis and refresh, with an auditor agent that reviews a whole model.",
    hooks: [],
    prereqs: { required: [], optional: [] },
  },
  {
    plugin: "reports",
    id: "goblin-reports",
    title: "Report craft",
    description:
      "Report creation and design, theme JSON, report review and pbir-cli, with reviewer agents for Deneb, SVG, R and Python visuals.",
    hooks: [],
    prereqs: { required: [], optional: ["pbir-cli"] },
  },
  {
    plugin: "tabular-editor",
    id: "goblin-tabular-editor",
    title: "Tabular Editor",
    description:
      "Best Practice Analyzer rules, C# scripting and Tabular Editor 2/3 CLI automation.",
    hooks: [],
    prereqs: { required: [], optional: [] },
  },
];

const stripPrefix = (p) => p.replace(/^\.\//, "").replace(/^skills\//, "").replace(/^agents\//, "");

const bundles = [];
for (const p of marketplace.plugins) {
  if (/DEPRECATED/i.test(p.description ?? "")) continue;
  const dir = stripPrefix(p.source).replace(/^\.\//, "");
  const abs = join(root, dir);
  if (!existsSync(abs)) throw new Error(`bundle dir missing: ${dir}`);

  const skills = (p.skills ?? []).map(stripPrefix);
  for (const s of skills) {
    if (!existsSync(join(abs, "skills", s, "SKILL.md")))
      throw new Error(`${p.name}: skill ${s} has no SKILL.md`);
  }

  const commonDir = join(abs, "common");
  const common = existsSync(commonDir)
    ? readdirSync(commonDir).filter((f) => f.endsWith(".md")).sort()
    : [];

  bundles.push({
    id: p.name,
    kind: "vendored",
    title: TITLES[p.name] ?? p.name,
    description: p.description,
    dir,
    skills,
    agents: (p.agents ?? []).map(stripPrefix),
    common,
    mcpServers: p.mcpServers ?? {},
    prereqs: PREREQS[p.name] ?? { required: ["git"], optional: [] },
    credit: MICROSOFT_CREDIT,
  });
}

// Power BI first: it is the bundle most people arrive for.
const order = ["powerbi-authoring", "fabric-skills", "fabric-authoring", "fabric-consumption", "fabric-operations"];
bundles.sort((a, b) => order.indexOf(a.id) - order.indexOf(b.id));

// dashkit's own bundles, embedded in the binary (see bundles/embed.go). Each is
// also a plugin in dashkit's marketplace (.claude-plugin/marketplace.json);
// those with `plugin: true` are installed through it by hosts with a plugin
// manager, so their slash commands, subagents and hooks come along. MCP server
// entries use ${DASHKIT_BUNDLE} for where the bundle's `files` get copied.
const DASHKIT_MARKET = { repo: "leonsang/dashkit", name: "dashkit" };
const BUILTIN = {
  "pbi-sdd": {
    title: "Spec-driven workflow",
    description:
      "A thin spec-driven workflow for Power BI: survey an existing or published report (levantamiento), or start a new one, then spec, tasks, build and verify with written, approved steps. Leans on the Microsoft and data-goblin skills rather than repeating them.",
    prereqs: { required: ["node20"], optional: [] },
  },
  "tableau-authoring": {
    title: "Tableau authoring",
    description:
      "Drives Tableau Desktop 2026.3 through its External Client API with the tableu MCP server: data sources and .hyper extracts, fields, calculations, parameters, sets, sheets, filters, formatting, dashboards, navigation buttons, filter/parameter/set actions and stories, each validated by Tableau and linted against its best practices. Includes a tableau-author subagent and /setup.",
    prereqs: { required: ["uv", "tableau-desktop"], optional: ["tableau-api-flag"] },
    plugin: true,
    files: ["server"],
    mcpServers: {
      tableu: { command: "uv", args: ["--directory", "${DASHKIT_BUNDLE}/server", "run", "--quiet", "tableu-mcp"] },
    },
  },
  "tableau-sdd": {
    title: "Tableau spec-driven workflow",
    description:
      "Survey a Tableau workbook with Info and Lint evidence or start a new one, then spec, tasks, a build where every task runs inside a transaction, and verification with exported images and Desktop's warnings.",
    prereqs: { required: [], optional: [] },
    plugin: true,
  },
  "tableau-guardrails": {
    title: "Tableau guardrails",
    description:
      "Lints every .twb/.twbx the agent edits against Tableau's best practices and blocks on errors, so they are fixed before moving on. Runs as a Claude Code or Copilot CLI plugin hook; needs uv.",
    prereqs: { required: ["uv"], optional: [] },
    plugin: true,
    hooks: ["tableu lint after any .twb or .twbx edit; errors block, warnings come back as context"],
  },
  "looker-studio-authoring": {
    title: "Looker Studio authoring",
    description:
      "Edits a Looker Studio / Data Studio report open in Edge or Chrome over CDP with the looker-studio MCP server: safe copies, layout, fields, source calculated fields, components, controls, filters, themes, pages and declarative report specs, with diagnosis and a UX audit. Six best-practice skills, a looker-studio-author subagent and /setup.",
    prereqs: { required: ["node20"], optional: ["cdp-9222"] },
    plugin: true,
    files: ["looker-studio-mcp"],
    mcpServers: {
      "looker-studio": {
        command: "node",
        args: ["${DASHKIT_BUNDLE}/looker-studio-mcp/dist/index.js"],
        env: { LS_ALLOW_WRITE: "1", LS_SKILLS_DIR: "${DASHKIT_BUNDLE}/skills" },
      },
    },
  },
  "ls-sdd": {
    title: "Looker Studio spec-driven workflow",
    description:
      "Survey a Looker Studio report with diagnose evidence or start a new one, then a spec materialised as a declarative report spec, tasks, a build that dry-runs every apply first, and verification in view mode.",
    prereqs: { required: [], optional: [] },
    plugin: true,
  },
  "looker-studio-guardrails": {
    title: "Looker Studio guardrails",
    description:
      "Lints every *.spec.json the agent edits and blocks on errors; when a browser answers on the CDP port it also shows the apply --dry-run plan. Runs as a Claude Code or Copilot CLI plugin hook; needs Node 20+.",
    prereqs: { required: ["node20"], optional: ["cdp-9222"] },
    plugin: true,
    hooks: ["report-spec lint after any *.spec.json edit; errors block", "apply --dry-run plan when a browser is on the CDP port"],
  },
  "dataviz-engineering": {
    title: "Data visualization engineering",
    description:
      "Platform-agnostic chart craft: the question picks the chart, quantities in position and length, one y axis, palettes checked for colour blindness and contrast, rendering at real volume. Works against a reference design (points at a Claude Design canvas, PNG, HTML or Figma, asks for one or helps generate it) and hands a mapping to the Power BI, Tableau or Looker Studio author. A dataviz-engineer subagent.",
    prereqs: { required: [], optional: [] },
    plugin: true,
  },
};
const list = (dir, keep) => (existsSync(dir) ? readdirSync(dir).filter(keep).sort() : []);
for (const [id, meta] of Object.entries(BUILTIN)) {
  const base = join(process.cwd(), "bundles", id);
  if (!existsSync(join(base, ".claude-plugin", "plugin.json"))) throw new Error(`builtin bundle ${id} has no .claude-plugin/plugin.json`);
  const skills = list(join(base, "skills"), (s) => existsSync(join(base, "skills", s, "SKILL.md")));
  if (!skills.length && !meta.hooks) throw new Error(`builtin bundle ${id} has neither skills nor hooks`);
  for (const f of meta.files ?? []) if (!existsSync(join(base, f))) throw new Error(`builtin bundle ${id}: missing ${f}/`);
  bundles.push({
    id,
    kind: "builtin",
    title: meta.title,
    description: meta.description,
    dir: id,
    skills,
    agents: list(join(base, "agents"), (f) => f.endsWith(".md")).length
      ? list(join(base, "agents"), (f) => f.endsWith(".md"))
      : undefined,
    files: meta.files,
    mcpServers: meta.mcpServers,
    prereqs: meta.prereqs,
    hooks: meta.hooks,
    marketplace: meta.plugin ? { ...DASHKIT_MARKET, plugin: id } : undefined,
    credit: { author: "dashkit", license: "MIT", homepage: "https://github.com/leonsang/dashkit" },
  });
}

if (goblinRoot) {
  const goblinMarket = JSON.parse(
    readFileSync(join(goblinRoot, ".claude-plugin", "marketplace.json"), "utf8"),
  );
  const offered = new Set(goblinMarket.plugins.map((p) => p.name));

  for (const c of CURATED) {
    if (!offered.has(c.plugin))
      throw new Error(`data-goblin no longer offers plugin ${c.plugin}; update CURATED`);
    const skillsDir = join(goblinRoot, "plugins", c.plugin, "skills");
    const skills = existsSync(skillsDir) ? readdirSync(skillsDir).sort() : [];
    bundles.push({
      id: c.id,
      kind: "marketplace",
      title: c.title,
      description: c.description,
      skills,
      prereqs: c.prereqs,
      hooks: c.hooks,
      marketplace: {
        repo: "data-goblin/power-bi-agentic-development",
        name: goblinMarket.name,
        plugin: c.plugin,
      },
      credit: GOBLIN_CREDIT,
    });
  }
} else {
  console.warn("no --goblin clone given: marketplace bundles omitted");
}

const manifest = {
  schemaVersion: 2,
  source: {
    repo: "microsoft/skills-for-fabric",
    ref,
    upstreamVersion: marketplace.metadata?.version ?? null,
  },
  bundles,
};

const out = join(process.cwd(), "internal", "catalog", "manifest.json");
writeFileSync(out, JSON.stringify(manifest, null, 2) + "\n");
const byKind = (k) => bundles.filter((b) => b.kind === k).length;
console.log(
  `wrote ${out}: ${byKind("vendored")} vendored + ${byKind("builtin")} builtin + ${byKind("marketplace")} marketplace bundles, ref ${ref}`,
);
