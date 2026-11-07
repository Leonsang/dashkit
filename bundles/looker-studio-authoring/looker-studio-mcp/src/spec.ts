/**
 * Report spec ("report as code"). A JSON file describing pages and components:
 *
 * {
 *   "grid": 10, "canvasWidth": 1200,
 *   "defaults": { "dataset": "@ingresos", "padding": 12 },
 *   "pages": [
 *     { "page": "active",                       // page id, or "active"
 *       "components": [
 *         { "key": "kpi_ingresos", "type": "kpi-metric", "x": 20, "y": 100, "w": 270, "h": 120,
 *           "metrics": ["SUM(ingresos)"] },
 *         { "row": { "y": 100, "h": 120, "margin": 20, "gap": 20 },   // KPI-row macro
 *           "items": [ { "key": "k1", "type": "kpi-metric", "metrics": ["ingresos"] }, ... ] },
 *         { "key": "tabla", "id": "cd-j2uffxuy8d", ... }               // adopt an existing component
 *       ] } ] }
 *
 * dataset: a data source id, or "@<field>" = the data source that has that field.
 * Lint rules come from the skills (diseno-layout.md, kpi-scorecards.md, rendimiento.md).
 */
import type { CfRule, ChartStyle } from './looker/scripts4.js';
import { readFileSync } from 'node:fs';

export interface SpecComponent {
  key: string;
  type: string;
  id?: string;
  x?: number;
  y?: number;
  w?: number;
  h?: number;
  padding?: number;
  dataset?: string;
  dimensions?: string[];
  metrics?: string[];
  /** Date-range controls: default range = last N days (rolling). */
  dateRangeDays?: number;
  /** Remove per-component theme overrides (colors/fonts/borders). */
  stripStyles?: boolean;
  /** Component-level filters. */
  filters?: import('./ops3.js').FilterSpec[];
  /** Template variant, e.g. "tabla-dinamica-con-mapa-de-calor" (templates seed-ui). */
  variant?: string;
  /** Extra concept slots (scatter x_metric/y_metric/bubble_size, breakdown, color...). */
  slots?: Record<string, string[]>;
  /** Text box (simple-description) content: a string, or {text, size, bold, color}; "
" separates lines. */
  text?: string | { text: string; size?: number; bold?: boolean; color?: string; align?: 'left' | 'center' | 'right' };
  /** Control that sets this parameter (id) instead of filtering. */
  parameter?: string;
  /** Style (display) keys, e.g. {"hideMetric": false} on a scorecard. */
  style?: Record<string, unknown>;
  /** Conditional formatting rules (they replace the component's rules). See set_conditional_format. */
  conditional?: CfRule[];
  /** Chart style by name (series, legend, axes). See set_chart_style. */
  chartStyle?: Omit<ChartStyle, 'componentId'>;
  /** Comparison period of a chart or scorecard. */
  comparison?: 'none' | 'previous_period' | 'previous_year';
  /** Date field the comparison and the date range control use (name). Default: the source's first daily date. */
  dateField?: string;
  /** Button: the page it opens (id, or "name:<page name>"). */
  linkPage?: string;
  /** Put it at report level: it shows on every page, in the same place (navigation, global filters). */
  reportLevel?: boolean;
  /**
   * Wrap it in a card: a rounded shape behind it, the component inset inside with its own title, and for a
   * scorecard an icon tile on the left. Expanded by resolveSpec into extra components (<key>__card, __tile, __icon).
   */
  card?: SpecCard;
  /** image-component: a local image file (path relative to the spec), uploaded once per report. See add_image. */
  image?: string;
  /** Viewer interactions: optional metrics, date drill-down, cross-filtering. See set_chart_interactions. */
  interactions?: { optionalMetrics?: string[]; dateDrillDown?: boolean; drillStart?: 'month' | 'day'; crossFilter?: boolean };
}

export interface SpecCard {
  /** Adopt the card shape that already exists (its component id) instead of creating one. */
  id?: string;
  /** Title inside the card (the component's own chart title). */
  title?: string;
  /** Scorecard icon: an image file (white line icon), drawn on a coloured tile left of the value. */
  icon?: string;
  /** Tile colour (#rrggbb). Default: the theme accent. */
  iconBackground?: string;
  /** Card colour. Default white. */
  background?: string;
  radius?: number;
  /** Inner margin. Default 10. */
  inset?: number;
}

export interface SpecRow {
  row: { y: number; h: number; margin?: number; gap?: number; width?: number; x?: number };
  items: Array<Omit<SpecComponent, 'x' | 'y' | 'w' | 'h'>>;
}

export interface SpecPage {
  /** Page id, or "active". */
  page?: string;
  /** Page name: apply finds the page by name and creates it if missing. */
  name?: string;
  /** Page-level filters (apply to every component of the page). */
  filters?: import('./ops3.js').FilterSpec[];
  components: Array<SpecComponent | SpecRow>;
}

export interface ReportSpec {
  grid?: number;
  canvasWidth?: number;
  canvasHeight?: number;
  /** Report settings applied first (report_settings keys): width, height, viewModeNav, viewerFilterBar... */
  settings?: Record<string, unknown>;
  defaults?: { dataset?: string; padding?: number };
  /** Report theme (see theme.ts FriendlyTheme). */
  theme?: import('./theme.js').FriendlyTheme;
  /** Or a preset id/name ("t-harvest" / "Cosecha") or a themes/library name. */
  themePreset?: string;
  pages: SpecPage[];
}

export interface ResolvedComponent extends Required<Pick<SpecComponent, 'key' | 'type' | 'x' | 'y' | 'w' | 'h'>> {
  id?: string;
  padding?: number;
  dataset?: string;
  dimensions: string[];
  metrics: string[];
  page: string;
  dateRangeDays?: number;
  stripStyles?: boolean;
  filters?: import('./ops3.js').FilterSpec[];
  variant?: string;
  slots?: Record<string, string[]>;
  text?: SpecComponent['text'];
  parameter?: string;
  style?: Record<string, unknown>;
  conditional?: CfRule[];
  /** Chart style by name (series, legend, axes). See set_chart_style. */
  chartStyle?: Omit<ChartStyle, 'componentId'>;
  comparison?: SpecComponent['comparison'];
  dateField?: string;
  linkPage?: string;
  interactions?: SpecComponent['interactions'];
  image?: string;
  reportLevel?: boolean;
  card?: SpecCard;
}

export interface LintIssue {
  severity: 'error' | 'warning' | 'info';
  key: string | null;
  rule: string;
  message: string;
}

export const KNOWN_TYPES = [
  'simple-linechart', 'simple-barchart', 'simple-histogram', 'simple-combochart', 'simple-piechart', 'simple-table',
  'google-map', 'simple-geomap', 'kpi-metric', 'simple-scatterchart', 'bulletchart', 'simple-areachart', 'pivot-table',
  'simple-treemap', 'gauge-viz', 'simple-sankey', 'simple-waterfall', 'simple-timeline', 'simple-funnel', 'third-party-viz',
  'framed-external-content', 'notebook-data-app', 'simple-description', 'image-component', 'arrow', 'placeholder', 'shape',
  'ellipse', 'generic-shape', 'filter-bar', 'metric-filter', 'advanced-filter', 'simple-daterangepicker', 'dimension-filter',
  'dataset-picker', 'dimension-control', 'button',
];
const NON_DATA = new Set(['simple-description', 'image-component', 'arrow', 'placeholder', 'shape', 'ellipse', 'generic-shape', 'framed-external-content', 'button']);

export function loadSpec(file: string): ReportSpec {
  const spec = JSON.parse(readFileSync(file, 'utf8')) as ReportSpec;
  if (!spec || !Array.isArray(spec.pages)) throw new Error(`${file}: falta "pages" (array).`);
  return spec;
}

/** Expands row macros and defaults into absolute boxes (skill kpi-scorecards formula). */
export function resolveSpec(spec: ReportSpec): ResolvedComponent[] {
  const grid = spec.grid ?? 10;
  const W = spec.canvasWidth ?? 1200;
  const floorGrid = (v: number) => Math.floor(v / grid) * grid;
  const out: ResolvedComponent[] = [];
  for (const p of spec.pages) {
    const page = p.page ?? (p.name ? `name:${p.name}` : 'active');
    for (const c of p.components) {
      if ('row' in c) {
        const { y, h } = c.row;
        const margin = c.row.margin ?? 20;
        const gap = c.row.gap ?? 20;
        const x0 = c.row.x ?? margin;
        const width = c.row.width ?? W - x0 - margin;
        const n = c.items.length;
        // w = (ancho - (n-1)*gap) / n, floored to the grid.
        const w = floorGrid((width - (n - 1) * gap) / n);
        c.items.forEach((it, i) => {
          out.push({
            key: it.key, type: it.type, id: it.id, x: x0 + i * (w + gap), y, w, h,
            padding: it.padding ?? spec.defaults?.padding, dataset: it.dataset ?? (NON_DATA.has(it.type) && !it.dimensions?.length ? undefined : spec.defaults?.dataset),
            dimensions: it.dimensions ?? [], metrics: it.metrics ?? [], page,
            ...(it.dateRangeDays !== undefined ? { dateRangeDays: it.dateRangeDays } : {}),
            ...(it.stripStyles ? { stripStyles: true } : {}),
            ...(it.filters ? { filters: it.filters } : {}),
            ...(it.variant ? { variant: it.variant } : {}),
            ...(it.slots ? { slots: it.slots } : {}),
            ...(it.text !== undefined ? { text: it.text } : {}),
            ...(it.parameter ? { parameter: it.parameter } : {}),
            ...(it.style ? { style: it.style } : {}),
            ...(it.conditional ? { conditional: it.conditional } : {}),
            ...(it.chartStyle ? { chartStyle: it.chartStyle } : {}),
            ...(it.comparison ? { comparison: it.comparison } : {}),
            ...(it.dateField ? { dateField: it.dateField } : {}),
            ...(it.linkPage ? { linkPage: it.linkPage } : {}),
            ...(it.interactions ? { interactions: it.interactions } : {}),
            ...(it.image ? { image: it.image } : {}),
            ...(it.reportLevel ? { reportLevel: true } : {}),
            ...(it.card ? { card: it.card } : {}),
          });
        });
      } else {
        out.push({
          key: c.key, type: c.type, id: c.id, x: c.x ?? 0, y: c.y ?? 0, w: c.w ?? 400, h: c.h ?? 300,
          padding: c.padding ?? spec.defaults?.padding, dataset: c.dataset ?? (NON_DATA.has(c.type) && !c.dimensions?.length ? undefined : spec.defaults?.dataset),
          dimensions: c.dimensions ?? [], metrics: c.metrics ?? [], page,
          ...(c.dateRangeDays !== undefined ? { dateRangeDays: c.dateRangeDays } : {}),
          ...(c.stripStyles ? { stripStyles: true } : {}),
          ...(c.filters ? { filters: c.filters } : {}),
          ...(c.variant ? { variant: c.variant } : {}),
          ...(c.slots ? { slots: c.slots } : {}),
          ...(c.text !== undefined ? { text: c.text } : {}),
          ...(c.parameter ? { parameter: c.parameter } : {}),
          ...(c.style ? { style: c.style } : {}),
          ...(c.conditional ? { conditional: c.conditional } : {}),
          ...(c.chartStyle ? { chartStyle: c.chartStyle } : {}),
          ...(c.comparison ? { comparison: c.comparison } : {}),
          ...(c.dateField ? { dateField: c.dateField } : {}),
          ...(c.linkPage ? { linkPage: c.linkPage } : {}),
          ...(c.interactions ? { interactions: c.interactions } : {}),
          ...(c.image ? { image: c.image } : {}),
          ...(c.reportLevel ? { reportLevel: true } : {}),
          ...(c.card ? { card: c.card } : {}),
        });
      }
    }
  }
  return expandCards(out);
}

/**
 * Card macro (pattern taken from published templates, 2026-11-07): the title of a chart renders above its box,
 * outside the theme border, so a closed card needs a shape behind it. Scorecards get an icon tile and their
 * value moves right of it.
 */
function expandCards(list: ResolvedComponent[]): ResolvedComponent[] {
  const out: ResolvedComponent[] = [];
  for (const c of list) {
    if (!c.card) { out.push(c); continue; }
    const k = c.card;
    const inset = k.inset ?? 10;
    const radius = k.radius ?? 12;
    const shared = { page: c.page, dimensions: [], metrics: [], ...(c.reportLevel ? { reportLevel: true } : {}) };
    out.push({
      key: `${c.key}__card`, type: 'generic-shape', ...(k.id ? { id: k.id } : {}), x: c.x, y: c.y, w: c.w, h: c.h, ...shared,
      style: { background: { color: k.background ?? '#FFFFFF', opacity: 1 }, border: { color: '#FFFFFF', opacity: 0, size: 0, style: 'solid', radius } },
    });
    const clear = { background: { color: '#FFFFFF', opacity: 0 }, border: { color: '#FFFFFF', opacity: 0, size: 0, style: 'solid', radius: 0 } };
    if (c.type === 'kpi-metric' && k.icon) {
      const tile = Math.min(64, c.h - 2 * 20);
      const ty = c.y + Math.round((c.h - tile) / 2);
      out.push({ key: `${c.key}__tile`, type: 'generic-shape', x: c.x + 20, y: ty, w: tile, h: tile, ...shared,
        style: { background: { color: k.iconBackground ?? '#1A73E8', opacity: 1 }, border: { color: '#FFFFFF', opacity: 0, size: 0, style: 'solid', radius: Math.round(tile / 4) } } });
      const ic = Math.round(tile / 2);
      out.push({ key: `${c.key}__icon`, type: 'image-component', x: c.x + 20 + (tile - ic) / 2, y: ty + (tile - ic) / 2, w: ic, h: ic, ...shared, image: k.icon });
      const left = 20 + tile + 10;
      out.push({ ...c, x: c.x + left, y: c.y + inset, w: c.w - left - inset, h: c.h - 2 * inset, style: { ...clear, fontSize: '24px', ...(c.style ?? {}) } });
      continue;
    }
    // With no background or border of its own, the title is drawn inside the component's box, at its top.
    const titleH = 0;
    out.push({
      ...c, x: c.x + inset, y: c.y + inset + titleH, w: c.w - 2 * inset, h: c.h - 2 * inset - titleH,
      style: {
        ...clear,
        ...(k.title ? { chartTitleShowTitle: true, chartTitleText: k.title, chartTitleFontSize: 15, chartTitleBold: true } : {}),
        ...(c.style ?? {}),
      },
    });
  }
  return out;
}

/** Best-practice validation (skills) before touching the report. */
export function lintSpec(spec: ReportSpec): { issues: LintIssue[]; components: ResolvedComponent[] } {
  const grid = spec.grid ?? 10;
  const W = spec.canvasWidth ?? 1200;
  const H = spec.canvasHeight ?? 10_000;
  const comps = resolveSpec(spec);
  const issues: LintIssue[] = [];
  const push = (severity: LintIssue['severity'], key: string | null, rule: string, message: string) =>
    issues.push({ severity, key, rule, message });

  const keys = new Set<string>();
  for (const c of comps) {
    if (!c.key) push('error', null, 'key', 'Cada componente necesita "key" (identificador estable del spec).');
    if (keys.has(c.key)) push('error', c.key, 'key', `Clave duplicada "${c.key}".`);
    keys.add(c.key);
    if (!KNOWN_TYPES.includes(c.type)) push('error', c.key, 'type', `Tipo desconocido "${c.type}".`);
    if (!c.key.includes('__') && !c.card && [c.x, c.y, c.w, c.h].some((v) => v % grid !== 0))
      push('warning', c.key, 'grid', `x/y/w/h (${c.x},${c.y},${c.w},${c.h}) no son multiplos de la reticula ${grid}px [diseno-layout §3].`);
    if (c.x < 0 || c.y < 0 || c.x + c.w > W || c.y + c.h > H)
      push('error', c.key, 'canvas', `Se sale del lienzo ${W}x${H} [diseno-layout §2].`);
    if (c.x < 20 || W - (c.x + c.w) < 20) push('info', c.key, 'margin', 'Margen exterior < 20 px [diseno-layout §3].');
    if (c.padding !== undefined && (c.padding < 10 || c.padding > 16))
      push('info', c.key, 'padding', `Padding ${c.padding}px fuera de 10–16 px [diseno-layout §3].`);
    if (c.type === 'kpi-metric') {
      if (c.metrics.length !== 1 && !c.slots && !(c.id && !c.metrics.length)) push('warning', c.key, 'kpi', 'Un scorecard debe tener exactamente 1 metrica [kpi-scorecards].');
      if (c.h < 100 || c.h > 140) push('info', c.key, 'kpi', `Alto de scorecard ${c.h}px fuera de 100–140 [kpi-scorecards §1].`);
    }
    if (c.type.startsWith('pivot-table') && !c.id && c.dimensions.length + Object.values(c.slots ?? {}).flat().length < 2)
      push('error', c.key, 'pivot', 'Una tabla dinamica necesita una dimension de filas y otra de columnas (con una sola da "Combinacion no valida", reason 9). Con una dimension, usa simple-table (admite formato condicional y mapa de calor).');
    if (c.type === 'simple-daterangepicker' && c.dateRangeDays === undefined)
      push('info', c.key, 'date-range', 'Control de periodo sin dateRangeDays: heredara el periodo por defecto (p. ej. ultimos 28 dias) y puede dejar la pagina sin datos.');
    if (!NON_DATA.has(c.type) && !['filter-bar', 'simple-daterangepicker'].includes(c.type) && !c.dataset)
      push('warning', c.key, 'dataset', 'Sin dataset: se usara el del componente clonado o el del informe.');
  }

  const byPage = new Map<string, ResolvedComponent[]>();
  for (const c of comps) byPage.set(c.page, [...(byPage.get(c.page) ?? []), c]);
  for (const [page, list] of byPage) {
    // overlaps
    for (let i = 0; i < list.length; i++)
      for (let j = i + 1; j < list.length; j++) {
        const a = list[i]!, b = list[j]!;
        // A decoration that contains the other one is a background (card, side bar, icon tile), not an overlap.
        const inside = (p: ResolvedComponent, q: ResolvedComponent) => q.x >= p.x && q.y >= p.y && q.x + q.w <= p.x + p.w && q.y + q.h <= p.y + p.h;
        if ((NON_DATA.has(a.type) && inside(a, b)) || (NON_DATA.has(b.type) && inside(b, a))) continue;
        if (a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h)
          push('warning', a.key, 'overlap', `Se solapa con "${b.key}" en la pagina ${page}.`);
      }
    // density
    const data = list.filter((c) => !NON_DATA.has(c.type)).length;
    if (data > 25) push('error', null, 'density', `Pagina ${page}: ${data} componentes con datos (>25) [rendimiento].`);
    else if (data > 15) push('warning', null, 'density', `Pagina ${page}: ${data} componentes con datos (>15) [rendimiento].`);
    // KPI rows
    const kpis = list.filter((c) => c.type === 'kpi-metric');
    const rows = new Map<number, ResolvedComponent[]>();
    for (const k of kpis) rows.set(k.y, [...(rows.get(k.y) ?? []), k]);
    for (const [y, row] of rows) {
      if (row.length > 1 && (row.length < 4 || row.length > 6))
        push('info', null, 'kpi-row', `Fila de KPIs en y=${y} con ${row.length} tarjetas (recomendado 4–6) [kpi-scorecards §1].`);
      if (new Set(row.map((r) => r.h)).size > 1) push('warning', null, 'kpi-row', `Fila y=${y}: alturas distintas [kpi-scorecards §1].`);
      const sorted = [...row].sort((a, b) => a.x - b.x);
      const gaps = sorted.slice(1).map((r, i) => r.x - (sorted[i]!.x + sorted[i]!.w));
      if (gaps.length && Math.max(...gaps) - Math.min(...gaps) > 2) push('warning', null, 'kpi-row', `Fila y=${y}: separaciones irregulares (${gaps.join(', ')}) [diseno-layout §3].`);
    }
  }
  return { issues, components: comps };
}
