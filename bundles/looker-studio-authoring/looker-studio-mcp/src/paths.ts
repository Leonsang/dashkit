/**
 * Where the package's own files are, wherever the bundler put this code.
 *
 * Bundled with code splitting, a module can land in dist/ or dist/chunks/, and
 * in the .mcpb it is server/index.js. A path relative to import.meta.url
 * (`../themes`) is right in one layout and wrong in the others, so the root is
 * found instead: the nearest directory, walking up, that has themes/base-theme.json.
 */
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

let cached: string | null = null;

export function packageRoot(): string {
  if (cached) return cached;
  let dir = dirname(fileURLToPath(import.meta.url));
  for (let i = 0; i < 5; i++) {
    if (existsSync(join(dir, 'themes', 'base-theme.json'))) return (cached = dir);
    const up = dirname(dir);
    if (up === dir) break;
    dir = up;
  }
  // Source checkout run through tsx/ts-node: src/ sits under the package root.
  return (cached = join(dirname(fileURLToPath(import.meta.url)), '..'));
}
