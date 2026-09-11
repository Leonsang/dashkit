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
      "Checks PBIR structure, TMDL syntax and report-to-model binding automatically after every edit, with PBIR and TMDL format references. Ships native validators for macOS, Linux and Windows.",
    hooks: [
      "PBIR structure and schema, after any edit inside a .Report folder",
      "TMDL syntax, after any .tmdl edit",
      "report-to-model binding, after definition.pbir edits",
    ],
    prereqs: { required: [], optional: ["python3", "pbir-cli"] },
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
    prereqs: { required: ["windows-desktop"], optional: [] },
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
  `wrote ${out}: ${byKind("vendored")} vendored + ${byKind("marketplace")} marketplace bundles, ref ${ref}`,
);
