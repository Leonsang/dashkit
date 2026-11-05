// Bundles the MCP server and the CLI into dist/index.js and dist/cli.js, with
// every dependency inlined; the code they share goes once into dist/chunks/.
//
// They are committed: a Claude Code plugin is installed by copying its folder,
// with no `npm install`, so the server has to run from what is in git.
//
//   node tools/esbuild.mjs            readable bundle (the committed one)
//   node tools/esbuild.mjs --minify   minified, for the .mcpb build
//
// Never pass keepNames: esbuild would wrap functions in __name(...) calls, and
// the page scripts in src/looker/scripts*.ts are sent to the browser with
// Function.prototype.toString(), where that helper does not exist.
import { build } from 'esbuild';
import { rmSync } from 'node:fs';
import { writeNotices } from './notices.mjs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const minify = process.argv.includes('--minify');
const outdir = process.argv.includes('--outdir')
  ? process.argv[process.argv.indexOf('--outdir') + 1]
  : join(root, 'dist');

// Chunk names carry a content hash, so stale ones would pile up in git.
rmSync(outdir, { recursive: true, force: true });

const result = await build({
  metafile: true,
  entryPoints: { index: join(root, 'src/index.ts'), cli: join(root, 'src/cli.ts') },
  outdir,
  bundle: true,
  splitting: true,
  chunkNames: 'chunks/[name]-[hash]',
  platform: 'node',
  format: 'esm',
  target: 'node20',
  minify,
  legalComments: minify ? 'none' : 'eof',
  // ws probes these native speed-ups with a guarded require; without them it
  // falls back to plain JavaScript.
  external: ['bufferutil', 'utf-8-validate'],
  // Some dependencies are CommonJS and call require() at runtime.
  banner: {
    js: "import { createRequire as __lsCreateRequire } from 'node:module'; const require = __lsCreateRequire(import.meta.url);",
  },
  logLevel: 'warning',
});
console.log(`bundled index.js and cli.js into ${outdir}${minify ? ' (minified)' : ''}`);

const count = writeNotices(result.metafile, join(outdir, 'THIRD_PARTY_NOTICES.txt'), root);
console.log(`wrote THIRD_PARTY_NOTICES.txt (${count} packages)`);

// The guardrails plugin's hook: lint only, no browser or puppeteer, one file.
const hookOut = join(root, '..', '..', 'looker-studio-guardrails', 'hooks', 'lint-spec.mjs');
await build({
  entryPoints: [join(root, 'src', 'hook-lint.ts')],
  outfile: hookOut,
  bundle: true,
  platform: 'node',
  format: 'esm',
  target: 'node20',
  legalComments: 'none',
  logLevel: 'warning',
});
console.log(`bundled the guardrails hook into ${hookOut}`);
