// A bundle is a copy of its dependencies, so their licence notices travel with
// it: one file with the licence text of every package esbuild inlined, taken
// from the build's metafile so it lists exactly what was bundled.
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

export function writeNotices(metafile, file, root) {
  const pkgs = new Map();
  for (const input of Object.keys(metafile.inputs)) {
    const m = input.split('\\').join('/').match(/node_modules\/((?:@[^/]+\/)?[^/]+)\//);
    if (m) pkgs.set(m[1], join(root, 'node_modules', ...m[1].split('/')));
  }
  const parts = [];
  for (const [name, dir] of [...pkgs].sort(([a], [b]) => a.localeCompare(b))) {
    const meta = JSON.parse(readFileSync(join(dir, 'package.json'), 'utf8'));
    const lic = readdirSync(dir).find((f) => /^(licen[cs]e|copying|notice)(\.|$)/i.test(f));
    const text = lic ? readFileSync(join(dir, lic), 'utf8').trim() : '(no licence file in the package)';
    parts.push(`${name}@${meta.version} — ${meta.license ?? 'see package'}\n\n${text}`);
  }
  const sep = `\n\n${'-'.repeat(72)}\n\n`;
  writeFileSync(file, `Third-party software bundled into this directory (${pkgs.size} packages).\n\n${parts.join(sep)}\n`);
  return pkgs.size;
}
