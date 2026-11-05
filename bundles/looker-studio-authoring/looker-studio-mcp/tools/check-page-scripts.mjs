// Every function exported from src/looker/scripts*.ts runs inside the report
// tab via page.evaluate(fn), which ships only fn.toString(). This checks that
// each one survives that trip after a build step has rewritten it: it must
// parse on its own, and none of its free names may be declared at the top of
// its module (a minifier's hoisted helper, an obfuscator's string table) —
// those will not exist in the page. Scope analysis, not pattern matching.
//
//   node tools/check-page-scripts.mjs [--minify] [--obfuscate]
import { build } from 'esbuild';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { parse } from 'acorn';
import { analyze } from 'eslint-scope';

const ast = (code) => parse(code, { ecmaVersion: 'latest', sourceType: 'module', ranges: true });
const scopes = (tree) => analyze(tree, { ecmaVersion: 2022, sourceType: 'module' });

/** Names declared at the top of a module: what a rewritten function might lean on. */
function moduleNames(code) {
  const manager = scopes(ast(code));
  const mod = manager.scopes.find((s) => s.type === 'module');
  return new Set(mod.variables.map((v) => v.name));
}

/** Free names a function's own source refers to. */
function freeNames(src) {
  const manager = scopes(ast(`(${src});`));
  return new Set(manager.globalScope.through.map((r) => r.identifier.name));
}

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const minify = process.argv.includes('--minify');
const obfuscate = process.argv.includes('--obfuscate');
const out = mkdtempSync(join(tmpdir(), 'ls-page-'));

try {
  const names = ['scripts', 'scripts2', 'scripts3'];
  await build({
    entryPoints: names.map((n) => join(root, 'src', 'looker', `${n}.ts`)),
    outdir: out,
    bundle: true,
    format: 'esm',
    platform: 'node',
    target: 'node20',
    minify,
    logLevel: 'error',
  });
  if (obfuscate) {
    const { obfuscatorOptions } = await import('./obfuscator-options.mjs');
    const { default: Obfuscator } = await import('javascript-obfuscator');
    for (const n of names) {
      const f = join(out, `${n}.js`);
      writeFileSync(f, Obfuscator.obfuscate(readFileSync(f, 'utf8'), obfuscatorOptions).getObfuscatedCode());
    }
  }

  let count = 0;
  const bad = [];
  for (const n of names) {
    const file = join(out, `${n}.js`);
    const topLevel = moduleNames(readFileSync(file, 'utf8'));
    const mod = await import(pathToFileURL(file).href);
    for (const [name, fn] of Object.entries(mod)) {
      if (typeof fn !== 'function') continue;
      count++;
      let free;
      try {
        free = freeNames(fn.toString());
      } catch (e) {
        bad.push(`${n}.${name}: does not parse standalone (${e.message})`);
        continue;
      }
      const leaked = [...free].filter((v) => topLevel.has(v));
      if (leaked.length) bad.push(`${n}.${name}: uses ${leaked.join(', ')}, defined outside the function`);
    }
  }
  console.log(`${count} page functions checked${minify ? ', minified' : ''}${obfuscate ? ', obfuscated' : ''}: ${bad.length} problem(s)`);
  for (const b of bad) console.error('  ' + b);
  process.exitCode = bad.length ? 1 : 0;
} finally {
  rmSync(out, { recursive: true, force: true });
}
