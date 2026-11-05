// Builds looker-studio-mcp-<version>.mcpb, the bundle a Claude Enterprise admin
// distributes to Claude Desktop.
//
//   npm run build:mcpb
//
// 1. esbuild bundles only this package's own code (dependencies external);
// 2. javascript-obfuscator rewrites that, with settings proven safe for the
//    page-injected scripts (tools/check-page-scripts.mjs --obfuscate);
// 3. esbuild bundles the result with its dependencies, minified, into
//    build/mcpb/server/index.js — so the obfuscator never wades through
//    puppeteer, and the dependencies stay byte-identical to upstream;
// 4. skills and themes are copied beside it, the manifest gets the version and
//    the tool list the built server actually reports, and `mcpb pack` zips it.
//
// Nothing from outside this plugin is read, so internal research notes can
// never end up in the bundle; a final check refuses to pack if one does.
import { build } from 'esbuild';
import JavaScriptObfuscator from 'javascript-obfuscator';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { execFileSync } from 'node:child_process';
import { cpSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { obfuscatorOptions } from './obfuscator-options.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const pluginRoot = join(root, '..');
const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
const work = join(root, 'build');
const stage = join(work, 'mcpb');
const FORBIDDEN = [/LOOKER_STUDIO_INTERNALS\.md$/i, /\.state\.json$/i, /(^|[\\/])knowledge[\\/]/i, /\.map$/i];

const step = (msg) => console.log(`- ${msg}`);
rmSync(work, { recursive: true, force: true });
mkdirSync(join(stage, 'server'), { recursive: true });

// The page scripts must survive obfuscation; refuse to build if they would not.
step('checking page scripts survive minify + obfuscate');
execFileSync(process.execPath, [join(root, 'tools', 'check-page-scripts.mjs'), '--minify', '--obfuscate'], { stdio: 'inherit' });

step('bundling own code');
const own = join(work, 'own.js');
await build({
  entryPoints: [join(root, 'src', 'index.ts')],
  outfile: own,
  bundle: true,
  packages: 'external',
  platform: 'node',
  format: 'esm',
  target: 'node20',
  logLevel: 'warning',
});

step('obfuscating');
writeFileSync(own, JavaScriptObfuscator.obfuscate(readFileSync(own, 'utf8'), obfuscatorOptions).getObfuscatedCode());

step('bundling with dependencies, minified');
const bundled = await build({
  metafile: true,
  entryPoints: [own],
  outfile: join(stage, 'server', 'index.js'),
  bundle: true,
  platform: 'node',
  format: 'esm',
  target: 'node20',
  minify: true,
  legalComments: 'none',
  external: ['bufferutil', 'utf-8-validate'],
  banner: {
    js: "import { createRequire as __lsCreateRequire } from 'node:module'; const require = __lsCreateRequire(import.meta.url);",
  },
  logLevel: 'warning',
});
// The minified bundle is still a copy of its dependencies: ship their notices.
const { writeNotices } = await import('./notices.mjs');
writeNotices(bundled.metafile, join(stage, 'server', 'THIRD_PARTY_NOTICES.txt'), root);
// Node needs to know server/index.js is an ES module.
writeFileSync(join(stage, 'server', 'package.json'), JSON.stringify({ type: 'module' }) + '\n');

step('copying skills and themes');
cpSync(join(pluginRoot, 'skills'), join(stage, 'skills'), { recursive: true });
cpSync(join(root, 'themes'), join(stage, 'themes'), { recursive: true });

step('reading the tool list from the built server');
const client = new Client({ name: 'build-mcpb', version: pkg.version });
await client.connect(
  new StdioClientTransport({
    command: process.execPath,
    args: [join(stage, 'server', 'index.js')],
    env: { ...process.env, LS_SKILLS_DIR: join(stage, 'skills') },
    stderr: 'ignore',
  }),
);
const { tools } = await client.listTools();
const { prompts } = await client.listPrompts();
await client.close();
if (tools.length === 0) throw new Error('the built server lists no tools');

const manifest = JSON.parse(readFileSync(join(root, 'manifest.json'), 'utf8'));
delete manifest.$schema;
manifest.version = pkg.version;
manifest.tools = tools.map((t) => ({ name: t.name, description: (t.description ?? '').split('\n')[0].slice(0, 300) }));
manifest.prompts = prompts.map((p) => ({ name: p.name, description: p.description ?? '', text: p.description ?? p.name }));
writeFileSync(join(stage, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');

const files = [];
const walk = (dir) => {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p);
    else files.push(relative(stage, p));
  }
};
walk(stage);
const leaked = files.filter((f) => FORBIDDEN.some((re) => re.test(f)));
if (leaked.length) throw new Error(`refusing to pack internal files: ${leaked.join(', ')}`);

const mcpbCli = join(root, 'node_modules', '@anthropic-ai', 'mcpb', 'dist', 'cli', 'cli.js');
step('validating and packing');
execFileSync(process.execPath, [mcpbCli, 'validate', join(stage, 'manifest.json')], { stdio: 'inherit' });
const out = join(work, `looker-studio-mcp-${pkg.version}.mcpb`);
execFileSync(process.execPath, [mcpbCli, 'pack', stage, out], { stdio: 'inherit' });
if (!statSync(out, { throwIfNoEntry: false })) throw new Error(`mcpb pack did not write ${out}`);
console.log(`\n${relative(root, out)}: ${tools.length} tools, ${prompts.length} prompts, ${files.length} files`);
