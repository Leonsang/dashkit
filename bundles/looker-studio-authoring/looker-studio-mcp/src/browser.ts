import puppeteer, { type Browser, type Page } from 'puppeteer-core';
import { readFileSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { log } from './log.js';

/** Matches Looker Studio report URLs on both the current and legacy domains. */
export const REPORT_URL_RE = /(lookerstudio|datastudio)\.google\.com\/(u\/\d+\/)?reporting\//;

const DEFAULT_CDP_URL = 'http://127.0.0.1:9222';
const DEFAULT_EVAL_TIMEOUT_MS = Number(process.env.LS_EVAL_TIMEOUT_MS ?? 15_000);

let browserPromise: Promise<Browser> | null = null;
let lastPage: Page | null = null;

export class BrowserNotReadyError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'BrowserNotReadyError';
  }
}

const KEEP_ACTIVE =
  '--disable-features=CalculateNativeWinOcclusion,IntensiveWakeUpThrottling --disable-background-timer-throttling ' +
  '--disable-backgrounding-occluded-windows --disable-renderer-backgrounding';
const HOW_TO_LAUNCH =
  'Lanza Chrome o Edge con depuracion remota y un perfil separado, por ejemplo:\n' +
  `  msedge.exe --remote-debugging-port=9222 --user-data-dir="%TEMP%\\ls-mcp-profile" ${KEEP_ACTIVE}\n` +
  `  chrome.exe --remote-debugging-port=9222 --user-data-dir="%TEMP%\\ls-mcp-profile" ${KEEP_ACTIVE}\n` +
  '(las opciones --disable-* evitan que una ventana tapada por otra aplace los guardados del editor)\n' +
  'y abre el informe de Looker Studio en modo edicion (URL .../reporting/<id>/page/<id>/edit).';

async function connect(): Promise<Browser> {
  const ws = process.env.LS_CDP_WS;
  const browserURL = process.env.LS_CDP_URL || DEFAULT_CDP_URL; // an empty value (unset .mcpb option) means the default
  try {
    // Ignore sandboxed viz iframes (*.usercontent.goog), recaptcha workers and extensions:
    // attaching to them can hang (Network.enable never returns, observed 2026-11-03).
    const targetFilter = (t: { url(): string; type(): string }) =>
      !/usercontent\.goog|recaptcha|^chrome-extension:/.test(t.url()) && t.type() !== 'service_worker';
    const browser = ws
      ? await puppeteer.connect({ browserWSEndpoint: ws, defaultViewport: null, targetFilter, protocolTimeout: 60_000 })
      : await puppeteer.connect({ browserURL, defaultViewport: null, targetFilter, protocolTimeout: 60_000 });
    browser.on('disconnected', () => {
      log('Navegador desconectado; se reconectara en la proxima llamada.');
      browserPromise = null;
      lastPage = null;
    });
    log(`Conectado via CDP a ${ws ?? browserURL}`);
    return browser;
  } catch (err) {
    throw new BrowserNotReadyError(
      `No se pudo conectar por CDP a ${ws ?? browserURL}: ${(err as Error).message}\n${HOW_TO_LAUNCH}`,
    );
  }
}

/** Returns a cached CDP connection, reconnecting if it was lost. */
export async function getBrowser(): Promise<Browser> {
  if (browserPromise) {
    const b = await browserPromise.catch(() => null);
    if (b && b.connected) return b;
    browserPromise = null;
  }
  browserPromise = connect();
  try {
    return await browserPromise;
  } catch (err) {
    browserPromise = null;
    throw err;
  }
}

async function pageState(page: Page): Promise<{ visible: boolean; focused: boolean }> {
  try {
    return await withTimeout(
      page.evaluate(() => ({ visible: document.visibilityState === 'visible', focused: document.hasFocus() })),
      3_000,
      'visibilityState',
    );
  } catch {
    return { visible: false, focused: false };
  }
}

/**
 * Finds the Looker Studio report tab. Preference order:
 * focused+visible > visible > last used > first match.
 */
/**
 * The report dashkit opened or created last (open_report, copy_report, create_report_from_csv): with several
 * report tabs open, every tool works on that one. Kept in a temp file so the CLI (one process per command)
 * and the MCP server agree.
 */
function activeReportFile(): string {
  return `${tmpdir()}/ls-studio-active-report.txt`;
}
export function setActiveReport(urlOrId: string): void {
  const m = /reporting\/([^/?#]+)/.exec(urlOrId);
  const id = m ? m[1]! : urlOrId;
  if (!id || id === 'create') return;
  try { writeFileSync(activeReportFile(), id); } catch { /* best effort */ }
}
function activeIsRecent(): boolean {
  try { return Date.now() - statSync(activeReportFile()).mtimeMs < 6 * 3600_000; } catch { return false; }
}
function activeReport(): string | null {
  try { return readFileSync(activeReportFile(), 'utf8').trim() || null; } catch { return null; }
}

export async function getReportPage(): Promise<Page> {
  const browser = await getBrowser();
  // Filter targets by URL BEFORE creating Page objects: attaching to unrelated hidden tabs
  // (e.g. the Data Studio home in the background) can hang (observed 2026-11-03).
  const pages = (
    await Promise.all(
      browser.targets().filter((t) => t.type() === 'page' && REPORT_URL_RE.test(t.url())).map((t) => t.page()),
    )
  ).filter((p): p is Page => !!p);
  if (!pages.length) {
    throw new BrowserNotReadyError(
      'No hay ninguna pestana con un informe de Looker Studio abierto ' +
        '(lookerstudio.google.com/reporting/... o datastudio.google.com/reporting/...).\n' +
        HOW_TO_LAUNCH,
    );
  }
  // Background tabs throttle timers and rendering: ask the browser to treat the report as
  // focused and active (no window switching needed).
  for (const p of pages) await keepActive(p);
  const active = activeReport();
  const preferred = active ? pages.find((p) => p.url().includes(`/reporting/${active}`)) : undefined;
  if (preferred) return (lastPage = preferred);
  // The report dashkit is working on is no longer in any tab (its tab went to another page, e.g. the data
  // source editor): never fall back to another report in silence, the next write would land there
  // (benchmark 2026-11-07: a theme applied to the wrong report). An old mark (another session) is ignored.
  if (active && activeIsRecent()) {
    const open = pages.map((p) => (/reporting\/([^/?#]+)/.exec(p.url()) || [])[1]).filter(Boolean);
    throw new Error(
      `El informe activo (${active}) no esta abierto en ninguna pestana; hay otros: ${[...new Set(open)].join(', ')}. ` +
        'Abre el que quieres con open_report <url> (CLI: open <url>): las herramientas no cambian de informe solas.',
    );
  }
  if (pages.length === 1) return (lastPage = pages[0]!);

  const states = await Promise.all(pages.map(async (p) => ({ page: p, ...(await pageState(p)) })));
  const pick =
    states.find((s) => s.visible && s.focused) ??
    states.find((s) => s.visible) ??
    states.find((s) => s.page === lastPage) ??
    states[0]!;
  lastPage = pick.page;
  return pick.page;
}

const activated = new WeakSet<Page>();
async function keepActive(page: Page): Promise<void> {
  if (activated.has(page)) return;
  activated.add(page);
  try {
    const s = await page.createCDPSession();
    await s.send('Emulation.setFocusEmulationEnabled', { enabled: true }).catch(() => undefined);
    await s.send('Page.setWebLifecycleState', { state: 'active' }).catch(() => undefined);
  } catch {
    /* best effort */
  }
}

/** Detaches from the browser (without closing it) if a connection exists. */
export async function disconnectIfConnected(): Promise<void> {
  if (!browserPromise) return;
  const b = await browserPromise.catch(() => null);
  browserPromise = null;
  lastPage = null;
  if (b && b.connected) await b.disconnect();
}

function withTimeout<T>(p: Promise<T>, ms: number, label: string): Promise<T> {
  let timer: NodeJS.Timeout | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error(`Timeout (${ms} ms) ejecutando ${label} en la pagina.`)), ms);
  });
  return Promise.race([p, timeout]).finally(() => clearTimeout(timer));
}

/**
 * Runs a self-contained function inside the report tab with a timeout.
 * `fn` must not close over Node-side variables (it is serialized).
 */
export async function evaluate<T, A extends unknown[] = unknown[]>(
  fn: (...args: A) => T | Promise<T>,
  ...args: A
): Promise<T> {
  const page = await getReportPage();
  return evaluateOn(page, DEFAULT_EVAL_TIMEOUT_MS, fn, ...args);
}

export async function evaluateOn<T, A extends unknown[]>(
  page: Page,
  timeoutMs: number,
  fn: (...args: A) => T | Promise<T>,
  ...args: A
): Promise<T> {
  await page.evaluate(schemaCompatShim).catch(() => undefined);
  // puppeteer's generic typing for evaluate is stricter than we need here.
  const run = page.evaluate(fn as unknown as (...a: unknown[]) => Promise<T>, ...args) as Promise<T>;
  return withTimeout(run, timeoutMs, fn.name || 'script');
}

/**
 * The scripts read a data source's fields as schema.qe.concepts. "qe" is a minified name: an editor release
 * renamed it ("re", seen 2026-11-07) and every schema read came back empty. When the name is missing, define
 * schema.qe as a getter for whichever own property holds the plain schema ({concepts, maxDimensions, ...}),
 * so the scripts keep working across renames. Runs before each script; a no-op once installed.
 */
function schemaCompatShim(): void {
  const w = window as any;
  if (w.__lsSchemaShim) return;
  try {
    const r = w.angular.element(document.body).injector().get('legoUndoRedoService').report;
    let s: any = null;
    let ids: unknown[] = [];
    try { ids = r.getDatasourceIds() || []; } catch { /* ignore */ }
    for (const id of ids) { try { s = r.getDatasourceSchema(id); } catch { /* ignore */ } if (s) break; }
    if (!s) {
      for (const c of r.pages.flatMap((p: any) => p.components)) { try { s = c.getSchema(); } catch { /* ignore */ } if (s) break; }
    }
    if (!s || typeof s !== 'object') return;
    if (!('qe' in s)) {
      Object.defineProperty(Object.getPrototypeOf(s), 'qe', {
        configurable: true,
        get() { return Object.values(this).find((v: any) => v && typeof v === 'object' && !Array.isArray(v) && 'concepts' in v && 'maxDimensions' in v); },
      });
    }
    w.__lsSchemaShim = true;
  } catch { /* the editor is not ready yet: try again on the next script */ }
}

/**
 * A hidden tab (window minimised or behind another, document.hidden) does not render and Looker Studio
 * defers its saves: components created there vanish on the next reload (benchmark 2026-11-07). Minimising
 * and restoring the window makes it visible again without the user doing anything.
 */
export async function revealIfHidden(page: Page): Promise<void> {
  await page.bringToFront().catch(() => undefined);
  if (!(await page.evaluate(() => document.hidden).catch(() => false))) return;
  const s = await page.target().createCDPSession();
  try {
    const { windowId } = (await s.send('Browser.getWindowForTarget')) as { windowId: number };
    await s.send('Browser.setWindowBounds', { windowId, bounds: { windowState: 'minimized' } });
    await new Promise((r) => setTimeout(r, 600));
    await s.send('Browser.setWindowBounds', { windowId, bounds: { windowState: 'normal' } });
    await new Promise((r) => setTimeout(r, 1200));
    await page.bringToFront();
  } finally {
    await s.detach().catch(() => undefined);
  }
  if (await page.evaluate(() => document.hidden).catch(() => false)) throw new Error('La ventana del navegador sigue oculta: ponla delante y repite.');
}
