// Builds dist/mcp-bundle.js: every page-injected script from dist/looker/scripts.js
// exposed as window.__mcp.<name>. Useful to run the exact MCP logic from the
// browser console, a bookmarklet or an extension when CDP is not available.
//   node tools/build-bundle.mjs
import { build } from 'esbuild';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const tmp = mkdtempSync(join(tmpdir(), 'ls-bundle-'));
await build({
  entryPoints: ['scripts', 'scripts2'].map((f) => join(root, 'src', 'looker', `${f}.ts`)),
  outdir: tmp, bundle: true, format: 'esm', platform: 'node', target: 'node20', logLevel: 'error',
});
const load = (f) => import(pathToFileURL(join(tmp, f)).href);
const scripts = { ...(await load('scripts.js')), ...(await load('scripts2.js')) };
rmSync(tmp, { recursive: true, force: true });
const entries = Object.entries(scripts).filter(([, v]) => typeof v === 'function');
const body =
  '/* looker-studio-mcp page bundle (generated) */\n' +
  'window.__mcp = {\n' +
  entries.map(([name, fn]) => `  ${name}: (${fn.toString()})`).join(',\n') +
  '\n};\n';
const out = join(root, 'dist', 'mcp-bundle.js');
writeFileSync(out, body);
console.log(`${out}: ${entries.length} scripts, ${body.length} bytes`);
