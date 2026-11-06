// Writes ../skills/ls-authoring/references/operaciones.md from the running server: every MCP tool with
// its parameters, the ls-studio CLI command that does the same, and the reference that explains it.
//
//   node tools/ops-reference.mjs           write the file
//   node tools/ops-reference.mjs --check   fail when the file is out of date, a tool or CLI command has
//                                          no pair or no guide, a guide does not name its tool, or a
//                                          skill's references are not linked from its SKILL.md
//
// `npm run check` and CI run --check, so the skills cannot drift from the server.
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const SKILLS = join(root, '..', 'skills');
const OUT = join(SKILLS, 'ls-authoring', 'references', 'operaciones.md');
const R = 'ls-authoring/references/';

// Where each MCP tool is explained (paths relative to skills/).
const GUIDE = {
  attach_to_report: ['ls-authoring/SKILL.md'],
  open_report: ['ls-authoring/SKILL.md'],
  copy_report: ['ls-authoring/SKILL.md'],
  get_report_layout: [R + 'componentes.md'],
  create_component: [R + 'componentes.md'],
  set_component_box_model: [R + 'componentes.md'],
  patch_component: [R + 'componentes.md'],
  delete_component: [R + 'componentes.md'],
  capture_templates: [R + 'componentes.md'],
  list_templates: [R + 'componentes.md'],
  synthesize_templates: [R + 'componentes.md'],
  seed_templates_from_menu: [R + 'componentes.md'],
  inspect_data_sources: [R + 'campos.md'],
  bind_fields_to_component: [R + 'campos.md'],
  add_source_field: [R + 'campos.md'],
  list_filters: [R + 'controles-y-filtros.md'],
  add_filter: [R + 'controles-y-filtros.md'],
  detach_filter: [R + 'controles-y-filtros.md'],
  update_filter: [R + 'controles-y-filtros.md'],
  update_parameter: [R + 'combinaciones-y-parametros.md'],
  delete_parameter: [R + 'combinaciones-y-parametros.md'],
  list_pages: [R + 'paginas-temas-y-ajustes.md'],
  add_page: [R + 'paginas-temas-y-ajustes.md'],
  rename_page: [R + 'paginas-temas-y-ajustes.md'],
  get_theme: [R + 'paginas-temas-y-ajustes.md'],
  apply_theme: [R + 'paginas-temas-y-ajustes.md'],
  use_theme: [R + 'paginas-temas-y-ajustes.md'],
  list_theme_presets: [R + 'paginas-temas-y-ajustes.md'],
  report_settings: [R + 'paginas-temas-y-ajustes.md'],
  audit_ux: [R + 'paginas-temas-y-ajustes.md', R + 'revision.md'],
  lint_report_spec: [R + 'informe-como-codigo.md'],
  apply_report_spec: [R + 'informe-como-codigo.md'],
  list_orphan_components: [R + 'informe-como-codigo.md'],
  export_report: [R + 'informe-como-codigo.md', R + 'revision.md'],
  diagnose_report: [R + 'revision.md'],
  get_component_config: [R + 'revision.md'],
  reload_report: [R + 'revision.md'],
  get_learnings: [R + 'revision.md'],
  record_learning: [R + 'revision.md'],
  create_blend: [R + 'combinaciones-y-parametros.md'],
  list_blends: [R + 'combinaciones-y-parametros.md'],
  update_blend: [R + 'combinaciones-y-parametros.md'],
  delete_blend: [R + 'combinaciones-y-parametros.md'],
  add_parameter: [R + 'combinaciones-y-parametros.md'],
  move_page: [R + 'paginas-temas-y-ajustes.md'],
  delete_pages: [R + 'paginas-temas-y-ajustes.md'],
  set_page_visibility: [R + 'paginas-temas-y-ajustes.md'],
  duplicate_page: [R + 'paginas-temas-y-ajustes.md'],
  arrange_components: [R + 'componentes.md'],
};

// ls-studio command -> MCP tool, with what differs. Every CLI command must be here, and so must every tool.
const CLI = [
  ['open <url>', 'open_report', ''],
  ['attach', 'attach_to_report', ''],
  ['reload', 'reload_report', ''],
  ['copy <url|id> [--name N]', 'copy_report', ''],
  ['layout [--page <id>]', 'get_report_layout', ''],
  ['sources', 'inspect_data_sources', ''],
  ['fields add --name N --formula F', 'add_source_field', '`--source`, `--allow-shared` = `source`, `allowShared`'],
  ['config <id>', 'get_component_config', ''],
  ['diagnose', 'diagnose_report', ''],
  ['export [-o f.json]', 'export_report', 'MCP: `file`, dentro de `LS_WORKSPACE`'],
  ['box <id> --x --y --w --h --padding', 'set_component_box_model', 'MCP: `position{x,y}`, `dimensions{width,height}`, `padding`'],
  ['bind <id> --dims --metrics [--append]', 'bind_fields_to_component', 'MCP: `mode=append`'],
  ['create --type t[@variante] --box x,y,w,h', 'create_component', 'MCP: `box{x,y,width,height}`; `type` también admite `@variante`; `slots` solo en MCP y spec'],
  ['delete <id>', 'delete_component', 'MCP: además `LS_ALLOW_DELETE=1`'],
  ['patch <id> --date-days N --strip-styles --parameter P --text T', 'patch_component', 'MCP: `parameter`, `text`, `textSize`, `textBold`, `textColor`'],
  ['pages [list]', 'list_pages', ''],
  ['pages add <nombre>', 'add_page', ''],
  ['pages rename <id> <nombre>', 'rename_page', ''],
  ['pages move <id> <indice>', 'move_page', ''],
  ['pages delete <id...>', 'delete_pages', 'MCP: además `LS_ALLOW_DELETE=1`'],
  ['pages duplicate <id> [nombre]', 'duplicate_page', ''],
  ['pages hide <id> [--nav on|off] [--viewer on|off]', 'set_page_visibility', 'MCP: `hiddenFromNav`, `hiddenFromViewer`'],
  ['arrange <id...> --to front|back|forward|backward|report|page', 'arrange_components', 'MCP: `op`, `pageId`'],
  ['blends [list]', 'list_blends', ''],
  ['blends create <spec.json|json>', 'create_blend', 'Mismo objeto que el MCP'],
  ['blends update <blendId> [--name] [--join] [--add-table] [--remove-table] [--keys]', 'update_blend', 'MCP: `joinType`, `addTable`, `removeTable`, `setKeys {table, keys}`; CLI `--keys 2:pais,anio_mes=mes`'],
  ['blends delete <blendId>', 'delete_blend', 'MCP: además `LS_ALLOW_DELETE=1`'],
  ['params add --name N [--type] [--values a:Etiqueta,b] [--min --max] [--default] [--source]', 'add_parameter', 'MCP: `values` [{value,label}], `allowed`, `id`'],
  ['params update <nombre> [--name] [--values] [--min --max] [--default] [--source]', 'update_parameter', '`--name` es el nombre nuevo (MCP `newName`)'],
  ['params delete <nombre> [--source]', 'delete_parameter', 'Sin el control de escritura del MCP'],
  ['theme [get]', 'get_theme', ''],
  ['theme set <json|f.json>', 'apply_theme', ''],
  ['theme export <f.json>', 'get_theme', 'El MCP devuelve el mismo JSON; el agente lo guarda si hace falta'],
  ['theme import <f.json>', 'apply_theme', 'El MCP recibe el objeto del tema en lugar del archivo'],
  ['theme presets', 'list_theme_presets', ''],
  ['theme use <preset|biblioteca>', 'use_theme', ''],
  ['report settings [--viewer-filter-bar] [--cross-filter] [--set k=v]', 'report_settings', 'MCP: `patch{viewerFilterBar, crossFilterByDefault, ...}`'],
  ['filters [list]', 'list_filters', ''],
  ['filters add --name --field [--op] [--values] [--exclude] [--to]', 'add_filter', 'MCP: `include=false`, `target`'],
  ['filters detach <filterId> <pageId|cd-..>', 'detach_filter', ''],
  ['filters update <filterId> [--name N] [--op EQ] [--values a,b] [--include|--exclude]', 'update_filter', '`--numeric` convierte los valores en números'],
  ['ux', 'audit_ux', ''],
  ['orphans <spec.json...>', 'list_orphan_components', ''],
  ['lint <spec.json>', 'lint_report_spec', 'MCP: ruta o el objeto spec'],
  ['apply <spec.json> [--dry-run]', 'apply_report_spec', 'MCP: `dryRun`'],
  ['templates capture', 'capture_templates', ''],
  ['templates list', 'list_templates', ''],
  ['templates synth <tipo...>', 'synthesize_templates', ''],
  ['templates seed-ui "<opción>"...', 'seed_templates_from_menu', ''],
  ['learnings [--raw]', 'get_learnings', ''],
  ['learn <clave> <texto>', 'record_learning', 'MCP: `kind=fix|note`, `key`, `text`'],
];

async function listTools() {
  const c = new Client({ name: 'ops-reference', version: '0.0.0' });
  await c.connect(new StdioClientTransport({ command: process.execPath, args: [join(root, 'dist', 'index.js')], stderr: 'ignore' }));
  const { tools } = await c.listTools();
  await c.close();
  return tools;
}

const firstSentence = (s = '') => (s.match(/^[\s\S]*?\.(\s|$)/)?.[0] ?? s).trim().replace(/\s+/g, ' ').replace(/\|/g, '\\|');
const params = (t) => {
  const req = new Set(t.inputSchema?.required ?? []);
  return Object.keys(t.inputSchema?.properties ?? {}).map((k) => (req.has(k) ? `**${k}**` : k)).join(', ') || '—';
};

function render(tools) {
  const lines = [
    '# Operaciones del MCP looker-studio y de la CLI ls-studio', '',
    'Índice generado desde el servidor (`node tools/ops-reference.mjs`); no lo edites a mano. Los parámetros en',
    'negrita son obligatorios. La CLI es `node dist/cli.js <comando>` (o `ls-studio` tras `npm link`), usa el mismo',
    'motor y no lleva el control de `LS_ALLOW_WRITE`.', '',
    '## Herramientas MCP', '',
    '| Herramienta | Parámetros | Qué hace | Guía |', '|---|---|---|---|',
  ];
  for (const t of tools) {
    const guide = (GUIDE[t.name] ?? []).map((g) => `\`${g.replace(R, '').replace('ls-authoring/', '')}\``).join(', ') || '—';
    lines.push(`| \`${t.name}\` | ${params(t)} | ${firstSentence(t.description)} | ${guide} |`);
  }
  lines.push('', '## CLI ↔ MCP', '', 'Cada comando de la CLI tiene su herramienta MCP. Lo que cambia, en la última columna.', '',
    '| CLI `ls-studio` | Herramienta MCP | Diferencias |', '|---|---|---|');
  for (const [cmd, tool, note] of CLI) lines.push(`| \`${cmd.replace(/\|/g, '\\|')}\` | \`${tool}\` | ${note || '—'} |`);
  lines.push('');
  return lines.join('\n');
}

function check(tools, text) {
  const problems = [];
  const names = new Set(tools.map((t) => t.name));
  if (!existsSync(OUT) || readFileSync(OUT, 'utf8') !== text) problems.push(`${OUT} está desactualizado: node tools/ops-reference.mjs`);
  for (const n of names) {
    if (!GUIDE[n]) problems.push(`${n}: sin guía en GUIDE`);
    else for (const g of GUIDE[n]) {
      const p = join(SKILLS, g);
      if (!existsSync(p)) problems.push(`${n}: la guía ${g} no existe`);
      else if (!new RegExp(`\\b${n}\\b`).test(readFileSync(p, 'utf8'))) problems.push(`${n}: ${g} no la nombra`);
    }
    if (!CLI.some(([, t]) => t === n)) problems.push(`${n}: sin comando de CLI en la tabla CLI (o explica por qué solo existe en MCP)`);
  }
  for (const n of Object.keys(GUIDE)) if (!names.has(n)) problems.push(`GUIDE nombra ${n}, que el servidor ya no tiene`);
  for (const [cmd, t] of CLI) if (!names.has(t)) problems.push(`CLI "${cmd}" apunta a ${t}, que el servidor no tiene`);
  // every top-level CLI command (case '<cmd>' in src/cli.ts) appears in the table
  const cli = readFileSync(join(root, 'src', 'cli.ts'), 'utf8');
  const cmds = [...cli.matchAll(/^ {4}case '([a-z][\w-]*)'/gm)].map((m) => m[1]).filter((c) => c !== 'help');
  for (const c of new Set(cmds)) if (!CLI.some(([cmd]) => cmd.split(' ')[0] === c)) problems.push(`CLI ${c}: no está en la tabla CLI`);
  // every skill's references are linked from its SKILL.md
  for (const d of readdirSync(SKILLS, { withFileTypes: true })) {
    const refs = join(SKILLS, d.name, 'references');
    if (!d.isDirectory() || !existsSync(refs)) continue;
    const skill = readFileSync(join(SKILLS, d.name, 'SKILL.md'), 'utf8');
    for (const f of readdirSync(refs)) if (f.endsWith('.md') && !skill.includes(`references/${f}`)) problems.push(`${d.name}/SKILL.md no enlaza references/${f}`);
  }
  return problems;
}

const tools = await listTools();
const text = render(tools);
if (process.argv.includes('--check')) {
  const problems = check(tools, text);
  if (problems.length) {
    console.error('FAIL skills ↔ servidor:\n- ' + problems.join('\n- '));
    process.exit(1);
  }
  console.log(`skills ↔ servidor: ${tools.length} herramientas y ${CLI.length} comandos de CLI documentados`);
} else {
  writeFileSync(OUT, text, 'utf8');
  console.log('wrote', OUT);
}
