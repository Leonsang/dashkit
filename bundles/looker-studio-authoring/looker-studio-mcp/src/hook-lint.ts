/**
 * PostToolUse hook for the looker-studio-guardrails plugin, bundled into
 * ../../looker-studio-guardrails/hooks/lint-spec.mjs by tools/esbuild.mjs.
 *
 * After any edit to a *.spec.json it runs the same lint as `ls-studio lint`
 * (pure: no browser), and blocks on errors so Claude fixes the spec before
 * applying it. When a browser answers on the CDP port and the authoring
 * plugin's CLI can be found, it also runs `apply <spec> --dry-run` and hands
 * the plan back as context. A guardrail that cannot run says so: it never
 * fails silently and never blocks for its own problems.
 */
import { execFileSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { lintSpec, loadSpec } from './spec.js';

type HookInput = { tool_input?: { file_path?: string; path?: string } };

function emit(out: Record<string, unknown>): never {
  process.stdout.write(JSON.stringify(out));
  process.exit(0);
}

function context(text: string): never {
  emit({ hookSpecificOutput: { hookEventName: 'PostToolUse', additionalContext: text } });
}

/** The authoring plugin's CLI, from an env override or Claude Code's plugin cache. */
function findCli(): string | null {
  const override = process.env.LS_STUDIO_CLI;
  if (override && existsSync(override)) return override;
  const cache = join(homedir(), '.claude', 'plugins', 'cache');
  if (!existsSync(cache)) return null;
  for (const market of readdirSync(cache)) {
    const plugin = join(cache, market, 'looker-studio-authoring');
    if (!existsSync(plugin)) continue;
    for (const version of readdirSync(plugin).sort().reverse()) {
      const cli = join(plugin, version, 'looker-studio-mcp', 'dist', 'cli.js');
      if (existsSync(cli)) return cli;
    }
  }
  return null;
}

async function cdpUp(): Promise<boolean> {
  const url = (process.env.LS_CDP_URL || 'http://127.0.0.1:9222') + '/json/version';
  try {
    const r = await fetch(url, { signal: AbortSignal.timeout(1500) });
    return r.ok;
  } catch {
    return false;
  }
}

async function main(): Promise<void> {
  let input: HookInput = {};
  try {
    input = JSON.parse(readFileSync(0, 'utf8') || '{}') as HookInput;
  } catch {
    process.exit(0);
  }
  const file = input.tool_input?.file_path ?? input.tool_input?.path ?? '';
  if (!/\.spec\.json$/i.test(file) || /\.state\.json$/i.test(file) || !existsSync(file)) process.exit(0);

  let issues;
  try {
    issues = lintSpec(loadSpec(file)).issues;
  } catch (e) {
    emit({ decision: 'block', reason: `${file} no es un spec válido: ${(e as Error).message}` });
  }
  const errors = issues.filter((i) => i.severity === 'error');
  const warnings = issues.filter((i) => i.severity === 'warning');
  const fmt = (i: (typeof issues)[number]) => `- [${i.rule}]${i.key ? ` ${i.key}:` : ''} ${i.message}`;

  if (errors.length) {
    emit({
      decision: 'block',
      reason: `looker-studio-guardrails: ${errors.length} error(es) de lint en ${file}. Corrígelos antes de aplicar el spec:\n` +
        errors.map(fmt).join('\n'),
    });
  }

  const notes = [`looker-studio-guardrails: ${file} pasa el lint (${warnings.length} aviso(s)).`];
  if (warnings.length) notes.push(warnings.map(fmt).join('\n'));

  if (await cdpUp()) {
    const cli = findCli();
    if (!cli) {
      notes.push('Hay un navegador en el puerto CDP, pero no se encontró el CLI de looker-studio-authoring para el dry-run (define LS_STUDIO_CLI).');
    } else {
      try {
        const plan = execFileSync(process.execPath, [cli, 'apply', file, '--dry-run'], {
          encoding: 'utf8', timeout: 90_000, stdio: ['ignore', 'pipe', 'ignore'],
        });
        notes.push(`Dry-run contra el informe abierto (nada aplicado):\n${plan.slice(0, 4000)}`);
      } catch (e) {
        notes.push(`El dry-run no se pudo ejecutar: ${(e as Error).message.split('\n')[0]}`);
      }
    }
  }
  context(notes.join('\n\n'));
}

void main();
