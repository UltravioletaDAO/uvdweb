/*
 * WP5 · agent-routing — acceptance de ECOSYSTEM_PLAN §4/WP5 contra un dev server o build servido.
 *
 *   UVD_BASE=http://localhost:3311 node tests/ecosystem/agent-routing.playwright.js
 *
 * Casos:
 *   (a) /agents y /agent-discovery → pathname /ecosystem, hash #agentes, #agentes en viewport
 *   (b) Header 1280: a[href="/ecosystem"] con texto Ecosistema (es) / Ecosystem (en), sin a[href="/agents"];
 *       Hamburger 390: idem
 *   (c) Shim de document.modelContext antes de cargar /: 11 tools previas + 8 nuevas (19 únicas);
 *       execute() de get_ecosystem_map {limit:3}, list_ecosystem_products, open_terminal {kind:'pulse'}
 *       (navega a /ecosystem), focus_ecosystem_node {node_id:'nope'}, run_ecosystem_command
 *       {command:'curl https://evil.example'}, set_desk_mode {mode:'list'} → [data-mode="list"]
 *   (d) Estático (Node): rutas del sitemap con /ecosystem y sin /agents; ningún "/agents" residual en
 *       llms/index.md/.well-known/scripts/src salvo "/ecosystem#agentes"
 *   (g) 0 pageerror en /, /ecosystem, /agents
 *
 * Usa tests/ecosystem/_helpers.js (contrato C14). Si eco-core aún no lo entregó, cae a un helper
 * local equivalente para no bloquear la verificación de este paquete.
 * Salida: wave3/verify/agent-routing.json + capturas en wave3/shots-agent-routing/.
 */
const path = require('path');
const fs = require('fs');

const ROOT = path.resolve(__dirname, '../..');
const WAVE3 = path.resolve(ROOT, '../docs/audit-2026-08-26/wave3');
const SHOT_DIR = path.join(WAVE3, 'shots-agent-routing');
fs.mkdirSync(SHOT_DIR, { recursive: true });

function localHelpers() {
  const GLOBAL = 'C:/Users/lxhxr/AppData/Roaming/npm/node_modules';
  let chromium;
  try {
    ({ chromium } = require(GLOBAL + '/@playwright/test'));
  } catch (e) {
    ({ chromium } = require(GLOBAL + '/@playwright/test/node_modules/playwright-core'));
  }
  const VERIFY_DIR = path.join(WAVE3, 'verify');
  return {
    BASE: process.env.UVD_BASE || 'http://localhost:3100',
    async launch({ webgl = 'default' } = {}) {
      const args =
        webgl === 'swiftshader'
          ? ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist']
          : webgl === 'off'
            ? ['--disable-3d-apis']
            : [];
      return chromium.launch({ headless: true, args });
    },
    async newPage(browser, { viewport = { width: 1280, height: 800 }, lang = 'es', reducedMotion = false, mobile = false } = {}) {
      const ctx = await browser.newContext({
        viewport,
        isMobile: mobile,
        hasTouch: mobile,
        locale: lang === 'es' ? 'es-CO' : lang,
        reducedMotion: reducedMotion ? 'reduce' : 'no-preference',
      });
      await ctx.addInitScript((l) => {
        try { localStorage.setItem('i18nextLng', l); } catch (e) { /* noop */ }
      }, lang);
      return ctx.newPage();
    },
    collectErrors(page) {
      const errors = [];
      page.on('pageerror', (e) => errors.push({ type: 'pageerror', text: String(e).slice(0, 300) }));
      page.on('console', (m) => {
        if (m.type() === 'error') errors.push({ type: 'console', text: m.text().slice(0, 300) });
      });
      return errors;
    },
    writeJson(name, obj) {
      fs.mkdirSync(VERIFY_DIR, { recursive: true });
      const p = path.join(VERIFY_DIR, name + '.json');
      fs.writeFileSync(p, JSON.stringify(obj, null, 2));
      return p;
    },
  };
}

let H;
let helpersSource = 'contract';
try {
  H = require('./_helpers');
  if (typeof H.launch !== 'function' || typeof H.newPage !== 'function') throw new Error('helpers incompletos');
} catch (e) {
  H = localHelpers();
  helpersSource = 'local-fallback (' + String(e.message).slice(0, 80) + ')';
}
const BASE = H.BASE || process.env.UVD_BASE || 'http://localhost:3100';

const PREVIOUS_TOOLS = [
  'search_stream_memory', 'list_stream_summaries', 'get_stream_summary', 'list_governance_proposals',
  'get_token_metrics', 'get_treasury', 'get_facilitator_networks', 'get_dao_info', 'apply_dao_membership',
  'navigate_to', 'set_language',
];
const NEW_TOOLS = [
  'get_ecosystem_map', 'list_ecosystem_products', 'get_ecosystem_pulse', 'get_ecosystem_messages',
  'focus_ecosystem_node', 'open_terminal', 'run_ecosystem_command', 'set_desk_mode',
];

// Shim WebMCP: guarda cada tool registrada (StrictMode registra dos veces; se deduplica por nombre).
const MODEL_CONTEXT_SHIM = () => {
  document.modelContext = {
    registerTool(t) {
      (window.__reg ||= []).push(t);
    },
  };
};

const normalizeErrors = (x) => (Array.isArray(x) ? x : x && typeof x === 'object' ? Object.values(x).flat() : []);
const pageErrorsOnly = (list) => normalizeErrors(list).filter((e) => (e.type || '').toString() === 'pageerror');

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const checks = [];
function check(name, ok, detail) {
  checks.push({ name, ok: !!ok, detail });
  // eslint-disable-next-line no-console
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail !== undefined ? '  ' + JSON.stringify(detail) : ''}`);
}

async function gotoSpa(page, url) {
  await page.goto(url, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('#root > *', { timeout: 30000 }).catch(() => {});
}

// Ejecuta tool.execute(args) dentro de la página y devuelve el resultado serializable.
async function runTool(page, name, args) {
  return page.evaluate(async ({ n, a }) => {
    const list = window.__reg || [];
    const tool = [...list].reverse().find((t) => t && t.name === n);
    if (!tool) return { __missing: n };
    try {
      const out = await tool.execute(a || {});
      return JSON.parse(JSON.stringify(out ?? null));
    } catch (e) {
      return { __threw: String(e && e.message ? e.message : e) };
    }
  }, { n: name, a: args });
}

// ---------- (d) checks estáticos (no necesitan navegador) ----------
function staticChecks() {
  const sitemapSrc = fs.readFileSync(path.join(ROOT, 'scripts/generateAdvancedSitemap.js'), 'utf8');
  check('(d) generateAdvancedSitemap lista /ecosystem', /path:\s*['"]\/ecosystem['"]/.test(sitemapSrc));
  check('(d) generateAdvancedSitemap no lista /agents', !/path:\s*['"]\/agents['"]/.test(sitemapSrc));
  const simpleSrc = fs.readFileSync(path.join(ROOT, 'scripts/generateSitemap.js'), 'utf8');
  check('(d) generateSitemap lista /ecosystem y no /agents',
    /path:\s*['"]\/ecosystem['"]/.test(simpleSrc) && !/path:\s*['"]\/agents['"]/.test(simpleSrc));

  const targets = [
    'public/llms.txt', 'public/llms-full.txt', 'public/index.md',
    'public/.well-known', 'scripts', 'src',
  ];
  const exts = new Set(['.js', '.jsx', '.txt', '.json', '.md']);
  const residual = [];
  const commentOnly = [];
  const walk = (p) => {
    const st = fs.statSync(p);
    if (st.isDirectory()) {
      for (const f of fs.readdirSync(p)) walk(path.join(p, f));
      return;
    }
    if (!exts.has(path.extname(p))) return;
    const lines = fs.readFileSync(p, 'utf8').split(/\r?\n/);
    lines.forEach((line, i) => {
      if (!line.replace(/\/ecosystem#agentes/g, '').includes('/agents')) return;
      const ref = `${path.relative(ROOT, p)}:${i + 1}`;
      // Comentarios de código (no llegan al bundle ni a ningún documento servido): se listan aparte.
      if (/^\s*(\/\/|\/\*|\*)/.test(line)) commentOnly.push(ref);
      else residual.push(ref);
    });
  };
  for (const t of targets) {
    const abs = path.join(ROOT, t);
    if (fs.existsSync(abs)) walk(abs);
  }
  // La ruta <Route path="/agents"> de App.js es el redirect mismo: se permite explícitamente.
  const allowed = residual.filter((r) => !/^src[\\/]App\.js:/.test(r));
  check('(d) ningún "/agents" residual (salvo /ecosystem#agentes y el redirect de App.js)', allowed.length === 0,
    { residual: allowed, comment_only: commentOnly });
}

async function main() {
  staticChecks();
  if (process.env.UVD_STATIC_ONLY === '1') {
    const failedStatic = checks.filter((c) => !c.ok).length;
    // eslint-disable-next-line no-console
    console.log(`\n${checks.length - failedStatic}/${checks.length} checks estáticos OK (UVD_STATIC_ONLY=1)`);
    process.exit(failedStatic ? 1 : 0);
  }

  const browser = await H.launch({ webgl: 'swiftshader' });
  const errorsByPage = {};

  try {
    // ---------- (a) + (g) redirects ----------
    for (const from of ['/agents', '/agent-discovery']) {
      const page = await H.newPage(browser, { viewport: { width: 1280, height: 800 }, lang: 'es' });
      const errs = H.collectErrors(page);
      await gotoSpa(page, BASE + from);
      await page.waitForFunction(() => window.location.pathname === '/ecosystem', null, { timeout: 30000 }).catch(() => {});
      // La sección #agentes vive bajo el escritorio (lazy): dar tiempo al scroll post-montaje.
      await page.waitForSelector('#agentes', { timeout: 30000 }).catch(() => {});
      await sleep(1500);
      const loc = await page.evaluate(() => ({ pathname: window.location.pathname, hash: window.location.hash }));
      const inView = await page.evaluate(() => {
        const el = document.getElementById('agentes');
        if (!el) return { exists: false };
        const r = el.getBoundingClientRect();
        return { exists: true, top: Math.round(r.top), innerHeight: window.innerHeight };
      });
      check(`(a) ${from} → /ecosystem#agentes`, loc.pathname === '/ecosystem' && loc.hash === '#agentes', loc);
      check(`(a) ${from}: #agentes en viewport`, inView.exists && inView.top < inView.innerHeight, inView);
      await page.screenshot({ path: path.join(SHOT_DIR, `redirect${from.replace(/\//g, '-')}-1280.png`) });
      errorsByPage[from] = errs;
      check(`(g) 0 pageerror en ${from}`, pageErrorsOnly(errs).length === 0, pageErrorsOnly(errs));
      await page.context().close();
    }

    // ---------- (b) nav ----------
    for (const lang of ['es', 'en']) {
      const expected = lang === 'es' ? 'Ecosistema' : 'Ecosystem';
      const page = await H.newPage(browser, { viewport: { width: 1280, height: 800 }, lang });
      await gotoSpa(page, BASE + '/');
      await page.waitForSelector('nav button[aria-haspopup="true"]', { timeout: 30000 }).catch(() => {});
      // El item vive en el mismo lugar que ocupaba Agents: el desplegable "Más" del Header.
      let inMore = false;
      if (!(await page.$('nav a[href="/ecosystem"]'))) {
        await page.click('nav button[aria-haspopup="true"]').catch(() => {});
        await page.waitForSelector('nav a[href="/ecosystem"]', { timeout: 10000 }).catch(() => {});
        inMore = true;
      }
      const nav = await page.evaluate((more) => {
        const eco = document.querySelector('nav a[href="/ecosystem"]');
        return {
          ecoText: eco ? (eco.textContent || '').trim() : null,
          inMore: more,
          agentsLinks: document.querySelectorAll('a[href="/agents"]').length,
        };
      }, inMore);
      check(`(b) Header 1280 ${lang}: a[href="/ecosystem"] "${expected}"`, nav.ecoText === expected, nav);
      check(`(b) Header 1280 ${lang}: sin a[href="/agents"]`, nav.agentsLinks === 0, nav);
      if (lang === 'es') await page.screenshot({ path: path.join(SHOT_DIR, 'header-1280-es.png') });
      await page.context().close();

      const mobile = await H.newPage(browser, { viewport: { width: 390, height: 844 }, lang, mobile: true });
      await gotoSpa(mobile, BASE + '/');
      // El "Más" del Header también tiene aria-expanded pero está oculto (<lg): solo el toggle visible.
      const toggle = mobile.locator('button[aria-expanded]:visible').first();
      await toggle.waitFor({ timeout: 30000 }).catch(() => {});
      await toggle.click().catch(() => {});
      await mobile.waitForSelector('a[href="/ecosystem"]', { timeout: 15000 }).catch(() => {});
      const hb = await mobile.evaluate(() => {
        const eco = document.querySelector('a[href="/ecosystem"]');
        return {
          ecoText: eco ? (eco.textContent || '').trim() : null,
          ecoAria: eco ? eco.getAttribute('aria-label') : null,
          agentsLinks: document.querySelectorAll('a[href="/agents"]').length,
        };
      });
      // El item del hamburger imprime nombre + descripción: se compara por aria-label o por prefijo.
      const hbOk = hb.ecoAria === expected || (hb.ecoText || '').startsWith(expected);
      check(`(b) Hamburger 390 ${lang}: a[href="/ecosystem"] "${expected}"`, hbOk, hb);
      check(`(b) Hamburger 390 ${lang}: sin a[href="/agents"]`, hb.agentsLinks === 0, hb);
      if (lang === 'es') await mobile.screenshot({ path: path.join(SHOT_DIR, 'hamburger-390-es.png') });
      await mobile.context().close();
    }

    // ---------- (c) WebMCP ----------
    const page = await H.newPage(browser, { viewport: { width: 1280, height: 800 }, lang: 'es' });
    const errs = H.collectErrors(page);
    await page.context().addInitScript(MODEL_CONTEXT_SHIM);
    await gotoSpa(page, BASE + '/');
    await page.waitForFunction(() => (window.__reg || []).length >= 19, null, { timeout: 30000 }).catch(() => {});
    const names = await page.evaluate(() => Array.from(new Set((window.__reg || []).map((t) => t.name))));
    const missingPrev = PREVIOUS_TOOLS.filter((n) => !names.includes(n));
    const missingNew = NEW_TOOLS.filter((n) => !names.includes(n));
    check('(c) 19 tools registradas (11 previas + 8 nuevas)', names.length === 19 && !missingPrev.length && !missingNew.length,
      { count: names.length, missingPrev, missingNew });

    const map = await runTool(page, 'get_ecosystem_map', { limit: 3 });
    check('(c) get_ecosystem_map {limit:3} → source.tool c0der, 3 nodos',
      map && map.source && map.source.tool === 'c0der' && Array.isArray(map.nodes) && map.nodes.length === 3,
      { source: map && map.source, nodes: map && map.nodes && map.nodes.map((n) => n.id), edges: map && map.edges && map.edges.length });

    const products = await runTool(page, 'list_ecosystem_products', {});
    const withUrl = products && Array.isArray(products.products) ? products.products.filter((p) => !!p.url) : [];
    check('(c) list_ecosystem_products ≥ 8 con url', withUrl.length >= 8,
      { count: withUrl.length, ids: withUrl.map((p) => p.id) });

    const unknownNode = await runTool(page, 'focus_ecosystem_node', { node_id: 'nope' });
    check('(c) focus_ecosystem_node {node_id:"nope"} → unknown_node',
      unknownNode && unknownNode.error === 'unknown_node' && Array.isArray(unknownNode.allowed), unknownNode && { error: unknownNode.error, allowed: (unknownNode.allowed || []).length });

    const evil = await runTool(page, 'run_ecosystem_command', { command: 'curl https://evil.example' });
    check('(c) run_ecosystem_command curl evil → command_not_allowed', evil && evil.error === 'command_not_allowed', evil && { error: evil.error });

    const opened = await runTool(page, 'open_terminal', { kind: 'pulse' });
    const afterOpen = await page.evaluate(() => window.location.pathname);
    check('(c) open_terminal {kind:"pulse"} desde / → ok:true y /ecosystem',
      opened && opened.ok === true && opened.path === '/ecosystem' && afterOpen === '/ecosystem',
      { opened, pathname: afterOpen });
    const pulseFocused = await page.evaluate(() =>
      !!document.querySelector('[data-window][data-kind="pulse"]'));
    check('(c) ventana pulse presente tras open_terminal', pulseFocused);

    const mode = await runTool(page, 'set_desk_mode', { mode: 'list' });
    await page.waitForSelector('[data-mode="list"]', { timeout: 10000 }).catch(() => {});
    const hasList = await page.evaluate(() => !!document.querySelector('[data-mode="list"]'));
    check('(c) set_desk_mode {mode:"list"} → [data-mode="list"]', mode && mode.ok === true && hasList, { mode, hasList });
    await page.screenshot({ path: path.join(SHOT_DIR, 'ecosystem-after-tools-1280.png') });

    errorsByPage['/ (tools) → /ecosystem'] = errs;
    check('(g) 0 pageerror en / y /ecosystem (sesión de tools)', pageErrorsOnly(errs).length === 0, pageErrorsOnly(errs));
    await page.context().close();

    // ---------- (g) /ecosystem directo ----------
    const eco = await H.newPage(browser, { viewport: { width: 1280, height: 800 }, lang: 'es' });
    const ecoErrs = H.collectErrors(eco);
    await gotoSpa(eco, BASE + '/ecosystem');
    await eco.waitForSelector('[data-desk], #agentes', { timeout: 30000 }).catch(() => {});
    await sleep(3000);
    errorsByPage['/ecosystem'] = ecoErrs;
    check('(g) 0 pageerror en /ecosystem', pageErrorsOnly(ecoErrs).length === 0, pageErrorsOnly(ecoErrs));
    await eco.screenshot({ path: path.join(SHOT_DIR, 'ecosystem-1280.png') });
    await eco.context().close();
  } finally {
    await browser.close();
  }

  const failed = checks.filter((c) => !c.ok);
  const out = H.writeJson('agent-routing', {
    base: BASE,
    helpers: helpersSource,
    at: new Date().toISOString(),
    passed: checks.length - failed.length,
    failed: failed.length,
    checks,
    errors: errorsByPage,
  });
  // eslint-disable-next-line no-console
  console.log(`\n${checks.length - failed.length}/${checks.length} checks OK → ${out}`);
  process.exit(failed.length ? 1 : 0);
}

main().catch((e) => {
  // eslint-disable-next-line no-console
  console.error(e);
  process.exit(2);
});
