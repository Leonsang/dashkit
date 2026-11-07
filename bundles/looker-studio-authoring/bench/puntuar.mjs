#!/usr/bin/env node
// Puntuador automático del benchmark (rúbrica en rubrica.md). Mide el informe que dejó un agente con las
// propias herramientas de dashkit; el mock se revisa a mano (aquí solo se comprueba que exista y qué nombra).
//
// Uso: node bench/puntuar.mjs <url-del-informe> <carpeta-de-la-ejecución> [--diseno]
//   --diseno añade la fidelidad al diseño de referencia del escenario 2 (100 puntos aparte).
//   La carpeta puede tener mock.md, *.spec.json y metricas.json ({tokens, tool_uses, duration_ms, ...}).
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const cli = resolve(here, '../looker-studio-mcp/dist/cli.js');
const [url, runDir] = process.argv.slice(2);
if (!url || !runDir) { console.error('Uso: node bench/puntuar.mjs <url-del-informe> <carpeta>'); process.exit(2); }

const ls = (...args) => {
  try { return JSON.parse(execFileSync('node', [cli, ...args], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], timeout: 600_000 })); }
  catch (e) { return { error: String(e.stdout || e.message).slice(0, 300) }; }
};
const edit = url.replace(/\/(view|preview)$/, '').replace(/(\/page\/[^/]+)?$/, (m) => m) ;
ls('open', /\/edit$/.test(edit) ? edit : `${edit}/edit`);

const out = { url, puntos: {}, total: 0, datos: {} };
const add = (k, p, max, nota) => { out.puntos[k] = { p, max, ...(nota ? { nota } : {}) }; out.total += p; };

// 1. origen con los campos del CSV
const csvFields = ['ticket_id', 'fecha', 'local', 'turno', 'ingresos', 'tiempo_espera_min', 'valoracion'];
const src = ls('sources');
const hit = (src.dataSources || []).find((d) => csvFields.every((f) => d.fields.some((x) => x.name === f || x.id === f)));
add('origen_csv', hit ? 10 : 0, 10, hit ? hit.dataSourceId : 'ningún origen con los campos del CSV');

// 2. mock
const mockPath = join(runDir, process.argv.includes('--diseno') ? 'mapeo.md' : 'mock.md');
const mock = existsSync(mockPath) ? readFileSync(mockPath, 'utf8') : '';
const mockAuto = {
  existe: !!mock,
  arquetipo: /resumen ejecutivo|desglose|objetivos|exploraci|panel con barra lateral|arquetipo/i.test(mock),
  tema: /tema|theme|marca-azul|panel-lateral|alto-contraste|calido|oscuro/i.test(mock),
  cajas: (mock.match(/\[\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\]/g) || []).length,
};
out.datos.mock = mockAuto;
add('mock', (mockAuto.existe ? 5 : 0) + (mockAuto.arquetipo && mockAuto.tema ? 5 : 0) + (mockAuto.cajas >= 6 ? 5 : 0), 15, 'automático; revisar a mano');

// 3. páginas
const pages = ls('pages');
const names = Array.isArray(pages) ? pages.map((p) => p.name) : [];
out.datos.paginas = names;
const hasRes = names.some((n) => /resumen/i.test(n)), hasOp = names.some((n) => /operaci/i.test(n));
add('paginas', (hasRes ? 5 : 0) + (hasOp ? 5 : 0), 10);

// 4. spec: lint
const specs = existsSync(runDir) ? readdirSync(runDir).filter((f) => f.endsWith('.spec.json')) : [];
let lintErr = null;
if (specs.length) { const l = ls('lint', join(runDir, specs[0])); lintErr = (l.issues || []).filter((i) => i.severity === 'error').length; }
out.datos.spec = { archivos: specs, erroresLint: lintErr };
add('spec', specs.length ? (lintErr === 0 ? 10 : 3) : 0, 10, specs.length ? undefined : 'sin spec en la carpeta');

// 5. diagnóstico
const dg = ls('diagnose');
const nIss = (dg.issues || []).length;
out.datos.diagnose = { incidencias: nIss, codigos: [...new Set((dg.issues || []).map((i) => i.code))] };
add('diagnose', dg.error ? 0 : nIss === 0 ? 15 : nIss <= 2 ? 8 : 0, 15);

// 6. UX
const ux = ls('ux');
out.datos.ux = ux.score ?? null;
add('ux', ux.score >= 90 ? 15 : ux.score >= 75 ? 10 : ux.score >= 50 ? 5 : 0, 15);

// 7. cobertura (sobre todas las páginas). layout da ids internos (_103145323_, calc_...): se traducen a nombres.
const idName = {};
for (const d of src.dataSources || []) for (const f of d.fields || []) idName[f.id] = f.name;
// sin tildes: un alias "Valoración media" cuenta como valoracion
const nm = (x) => (idName[x] ?? idName[String(x).replace(/^t\d+\./, '')] ?? String(x)).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
let kpisCmp = 0, temporal = false, porLocalTurno = false, esperaVal = false;
for (const p of Array.isArray(pages) ? pages : []) {
  const d = ls('design', '--page', p.id);
  kpisCmp += ((d.page && d.page.kpis) || []).filter((k) => k.comparison).length;
  const lay = ls('layout', '--page', p.id);
  for (const c of lay.components || []) {
    const dims = ((c.data && c.data.dimensions) || []).map(nm), mets = ((c.data && c.data.metrics) || []).map(nm);
    const all = [...dims, ...mets].join(' ').toLowerCase();
    if (/linechart|timeseries|areachart|combochart/.test(c.type) && /fecha|mes|semana|dia/.test(dims.join(' '))) temporal = true;
    if (/local|turno/.test(dims.join(' ').toLowerCase())) porLocalTurno = true;
    if (/espera/.test(all) && /valoracion/.test(all)) esperaVal = true;
    if (/espera/.test(all) || /valoracion/.test(all)) out.datos.tocaEsperaOValoracion = true;
  }
}
out.datos.cobertura = { kpisConComparacion: kpisCmp, temporal, porLocalTurno, esperaYValoracionJuntas: esperaVal };
add('cobertura', (kpisCmp >= 4 ? 5 : 0) + (temporal ? 5 : 0) + (porLocalTurno ? 5 : 0) + (esperaVal ? 5 : out.datos.tocaEsperaOValoracion ? 2 : 0), 20);

// 9. fidelidad al diseño de referencia (escenario 2, con --diseno): 100 puntos aparte
if (process.argv.includes('--diseno')) {
  const near = (a, b, tol = 40) => {
    const rgb = (h) => (/^#?[0-9a-f]{6}$/i.test(h || '') ? [0, 2, 4].map((i) => parseInt(h.replace('#', '').slice(i, i + 2), 16)) : null);
    const x = rgb(a), y = rgb(b);
    return !!x && !!y && Math.hypot(x[0] - y[0], x[1] - y[1], x[2] - y[2]) <= tol;
  };
  const f = { puntos: {}, total: 0 };
  const fadd = (k, p, max, nota) => { f.puntos[k] = { p, max, ...(nota ? { nota } : {}) }; f.total += p; };
  const prof = (Array.isArray(pages) ? pages : []).map((p) => ({ id: p.id, d: ls('design', '--page', p.id), lay: ls('layout', '--page', p.id) }));
  const d0 = prof[0] ? prof[0].d : {};
  const th = d0.theme || {};
  fadd('tema_fondo', near(th.fill, '#F5EFE6') ? 10 : 0, 10, th.fill);
  fadd('tema_acento', near(th.accent, '#A8541F') ? 10 : 0, 10, th.accent);
  fadd('tipografia', /playfair|inter/i.test(th.font || '') ? 5 : 0, 5, th.font);
  const sh = d0.shell || {};
  fadd('barra_lateral', sh.sideBar ? (near(sh.sideBar.color, '#2A1B14', 60) ? 15 : 8) : 0, 15, sh.sideBar ? sh.sideBar.color : 'sin barra');
  const nav = (sh.navItems || []).filter((n) => n.toPage).length;
  fadd('navegacion', nav >= 2 ? 10 : nav === 1 ? 5 : 0, 10, `${nav} enlaces a paginas`);
  const imgs = prof.reduce((n, p) => n + ((p.lay.components || []).filter((c) => /image/.test(c.type)).length), 0);
  fadd('imagenes', imgs >= 10 ? 10 : imgs >= 3 ? 6 : imgs >= 1 ? 3 : 0, 10, `${imgs} imagenes (logo, banner, iconos)`);
  const kpis = prof.flatMap((p) => (p.d.page && p.d.page.kpis) || []);
  fadd('kpi_comparacion', kpis.filter((k) => k.comparison).length >= 8 ? 10 : kpis.filter((k) => k.comparison).length >= 4 ? 5 : 0, 10, `${kpis.filter((k) => k.comparison).length} de ${kpis.length}`);
  fadd('kpi_icono', kpis.filter((k) => k.iconTile).length >= 6 ? 10 : kpis.filter((k) => k.iconTile).length >= 2 ? 5 : 0, 10, `${kpis.filter((k) => k.iconTile).length} con icono`);
  const opt = prof.some((p) => ((p.d.page && p.d.page.interactions) || []).some((i) => (i.optionalMetrics || []).length));
  fadd('metricas_intercambiables', opt ? 10 : 0, 10);
  const cards = prof.reduce((n, p) => n + (((p.d.page && p.d.page.cards) || []).length), 0);
  fadd('tarjetas', cards >= 8 ? 10 : cards >= 4 ? 5 : 0, 10, `${cards} tarjetas`);
  out.fidelidad = f;
}

// 8. verificación como el lector: la declara el propio agente en metricas.json (verifico: true) o el log
const met = existsSync(join(runDir, 'metricas.json')) ? JSON.parse(readFileSync(join(runDir, 'metricas.json'), 'utf8')) : {};
add('verificacion_lector', met.verifico_vista ? 5 : 0, 5);
out.metricas = met;

writeFileSync(join(runDir, 'puntuacion.json'), JSON.stringify(out, null, 2));
console.log(JSON.stringify(out, null, 2));
