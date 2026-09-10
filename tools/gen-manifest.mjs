#!/usr/bin/env node
// Regenerates internal/catalog/manifest.json from an upstream skills-for-fabric checkout.
//
//   node tools/gen-manifest.mjs <path-to-skills-for-fabric-clone> [ref]
//
// The upstream marketplace file is the source of truth for which skills, agents
// and MCP servers belong to each bundle. Prerequisite mappings are fabkit's own
// and live in PREREQS below.
import { readFileSync, writeFileSync, existsSync, readdirSync } from "node:fs";
import { join, resolve } from "node:path";

const root = resolve(process.argv[2] ?? ".");
const ref = process.argv[3] ?? "main";

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
    title: TITLES[p.name] ?? p.name,
    description: p.description,
    dir,
    skills,
    agents: (p.agents ?? []).map(stripPrefix),
    common,
    mcpServers: p.mcpServers ?? {},
    prereqs: PREREQS[p.name] ?? { required: ["git"], optional: [] },
  });
}

// Power BI first: it is the bundle most people arrive for.
const order = ["powerbi-authoring", "fabric-skills", "fabric-authoring", "fabric-consumption", "fabric-operations"];
bundles.sort((a, b) => order.indexOf(a.id) - order.indexOf(b.id));

const manifest = {
  schemaVersion: 1,
  source: {
    repo: "microsoft/skills-for-fabric",
    ref,
    upstreamVersion: marketplace.metadata?.version ?? null,
  },
  bundles,
};

const out = join(process.cwd(), "internal", "catalog", "manifest.json");
writeFileSync(out, JSON.stringify(manifest, null, 2) + "\n");
console.log(
  `wrote ${out}: ${bundles.length} bundles, ${new Set(bundles.flatMap((b) => b.skills)).size} distinct skills, ref ${ref}`,
);
