/*
 * WP2 · eco-live — acceptance de ECOSYSTEM_PLAN §4/WP2 contra un dev server o build servido.
 *
 *   UVD_BASE=http://localhost:3311 node tests/ecosystem/eco-live.playwright.js
 *
 * Casos:
 *   (a) escritorio 0 en 1280×800: canvas[data-wallpaper] con width>0 y data-layout-ms < 10; sin
 *       window.__uvdGraphDebug; click en button[data-node-hit="karmakadabra"] abre la ventana `node`
 *       con "KarmaKadabra" y "alimenta a"
 *   (b) GraphTerm: prompt `curl -s https://ultravioletadao.xyz/ecosystem/graph.json | jq .source` y
 *       `"tool": "c0der"`; `m` cicla [data-graph-view] braille → list → narrative; ≥ 40 chars braille;
 *       ArrowDown ×2 cambia [data-graph-selected]
 *   (c) narrative: tantos <rect data-map-node> como index.products del JSON servido; sin "26 agentes"
 *   (d) PulseTerm: ≤ 10 s {"status":"healthy"} o chip snapshot/último dato; `kinds ·` y `redes`
 *   (e) IrcTerm #agents: ≥ 1 mensaje o `sin mensajes recientes`; con fixture mIRC no hay \u0003 ni <a>;
 *       el toggle de filtro cambia el conteo
 *   (f) AgentTerm: help → ayuda; run get_ecosystem_map {"limit":3} → "tool": "c0der"; open pulse enfoca
 *   (g) 390×844: braille a 40 columnas y <ul> de aristas con ≥ 90 <li>
 *   (h) 0 pageerror (y 0 errores de consola propios)
 *
 * Usa tests/ecosystem/_helpers.js (contrato C14); si eco-core aún no lo entregó, cae a un helper
 * local equivalente. Salida: wave3/verify/eco-live.json + capturas en wave3/shots-eco-live/.
 */
const path = require('path');
const fs = require('fs');

const SHOT_DIR = path.resolve(__dirname, '../../../docs/audit-2026-08-26/wave3/shots-eco-live');
fs.mkdirSync(SHOT_DIR, { recursive: true });

function localHelpers() {
  const GLOBAL = 'C:/Users/lxhxr/AppData/Roaming/npm/node_modules';
  let chromium;
  try {
    ({ chromium } = require(GLOBAL + '/@playwright/test'));
  } catch (e) {
    ({ chromium } = require(GLOBAL + '/@playwright/test/node_modules/playwright-core'));
  }
  const VERIFY_DIR = path.resolve(__dirname, '../../../docs/audit-2026-08-26/wave3/verify');
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
    async newPage(browser, { viewport = { width: 1280, height: 800 }, lang = 'es', reducedMotion = false, mobile = false, saveData = false } = {}) {
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
      if (saveData) {
        await ctx.addInitScript(() => {
          try { Object.defineProperty(navigator, 'connection', { value: { saveData: true }, configurable: true }); } catch (e) { /* noop */ }
        });
      }
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
try {
  H = require('./_helpers');
} catch (e) {
  H = localHelpers();
}
const { BASE } = H;

const GRAPH_CURL = 'curl -s https://ultravioletadao.xyz/ecosystem/graph.json | jq .source';
const results = { base: BASE, at: new Date().toISOString(), cases: {}, errors: {} };
let failures = 0;

const check = (caseId, name, ok, detail) => {
  results.cases[caseId] = results.cases[caseId] || {};
  results.cases[caseId][name] = { ok: Boolean(ok), detail };
  if (!ok) failures += 1;
  // eslint-disable-next-line no-console
  console.log(`${ok ? 'PASS' : 'FAIL'} [${caseId}] ${name}${detail !== undefined ? ' — ' + JSON.stringify(detail) : ''}`);
};

const ownErrors = (errors) =>
  errors.filter((e) => !/\[Report Only\]|ResizeObserver|favicon|net::ERR_|Failed to load resource|CORS|Access-Control|status of 4\d\d|status of 5\d\d/.test(e.text));

// Avisos de consola de OTROS paquetes que comparten /ecosystem (se reportan, no cuentan como propios):
// - "key" prop spread → sections/ForAgents.jsx <IntegrationCard key={x.key} {...x} /> (WP3 eco-products).
const FOREIGN = [/IntegrationCard/];
const splitErrors = (errors) => {
  const own = ownErrors(errors);
  return { own: own.filter((e) => !FOREIGN.some((re) => re.test(e.text))), foreign: own.filter((e) => FOREIGN.some((re) => re.test(e.text))) };
};

const shot = (page, name) => page.screenshot({ path: path.join(SHOT_DIR, name), fullPage: false }).catch(() => {});

async function fetchJson(page, url) {
  const res = await page.request.get(url);
  return res.ok() ? res.json() : null;
}

const productsOf = (g) => (g && Array.isArray(g.nodes) ? g.nodes.filter((n) => n.status === 'live' && n.url).length : null);

async function openEcosystem(page) {
  await page.goto(`${BASE}/ecosystem`, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('[data-window]', { timeout: 45000 });
}

async function clickNodeHit(page, id) {
  const btn = page.locator(`button[data-node-hit="${id}"]`).first();
  await btn.waitFor({ state: 'attached', timeout: 20000 });
  try {
    await btn.click({ timeout: 3000 });
    return 'click';
  } catch (e) {
    await btn.dispatchEvent('click');
    return 'dispatchEvent';
  }
}

// Click real si el elemento está libre; si otra ventana o el header fijo lo tapan, dispara el click.
async function safeClick(locator) {
  try {
    await locator.click({ timeout: 3000 });
    return 'click';
  } catch (e) {
    await locator.dispatchEvent('click');
    return 'dispatchEvent';
  }
}

async function focusGraphTerm(page) {
  const term = page.locator('[data-graph-term]').first();
  await term.waitFor({ timeout: 20000 });
  // Trae la ventana al frente (otras ventanas en cascada pueden taparla) y enfoca el grupo de teclado.
  await safeClick(page.locator('[data-window][data-kind="graph"] [data-window-title]').first());
  await term.evaluate((el) => el.focus({ preventScroll: true }));
  return term;
}

async function repl(page, cmd) {
  const input = page.locator('[data-agent-input]').first();
  await input.waitFor({ timeout: 20000 });
  await input.fill(cmd);
  await input.press('Enter');
}

(async () => {
  const browser = await H.launch({ webgl: 'swiftshader' });
  try {
    // ------------------------------------------------------------------ desktop 1280×800
    const page = await H.newPage(browser, { viewport: { width: 1280, height: 800 }, lang: 'es' });
    const errors = H.collectErrors(page);
    const served = await fetchJson(page, `${BASE}/ecosystem/graph.json`);
    const live = await fetchJson(page, 'https://ultravioletadao.s3.us-east-1.amazonaws.com/ecosystem/graph.json').catch(() => null);
    results.graph = { served_products: productsOf(served), served_edges: served ? served.edges.length : null, live_products: productsOf(live), live_edges: live ? live.edges.length : null };

    await openEcosystem(page);

    // (a) wallpaper
    const canvas = page.locator('canvas[data-wallpaper]').first();
    await canvas.waitFor({ timeout: 20000 });
    await page.waitForFunction(() => {
      const c = document.querySelector('canvas[data-wallpaper]');
      return c && Number(c.getAttribute('data-nodes')) > 0 && c.width > 0;
    }, null, { timeout: 30000 });
    const wp = await canvas.evaluate((c) => ({ width: c.width, height: c.height, layoutMs: Number(c.getAttribute('data-layout-ms')), nodes: Number(c.getAttribute('data-nodes')), edges: Number(c.getAttribute('data-edges')) }));
    check('a', 'canvas_width_gt_0', wp.width > 0, wp);
    check('a', 'layout_ms_lt_10', wp.layoutMs >= 0 && wp.layoutMs < 10, { layoutMs: wp.layoutMs });
    const noGlobal = await page.evaluate(() => typeof window.__uvdGraphDebug === 'undefined');
    check('a', 'no_window_global', noGlobal);
    const hits = await page.locator('button[data-node-hit]').count();
    check('a', 'node_hit_buttons', hits === wp.nodes, { buttons: hits, nodes: wp.nodes });
    const srEdges = await page.locator('ul[data-wallpaper-edges] li').count();
    check('a', 'sr_edge_list', srEdges === wp.edges, { li: srEdges, edges: wp.edges });
    await shot(page, 'desktop-0.png');

    const how = await clickNodeHit(page, 'karmakadabra');
    const nodeWin = page.locator('[data-window][data-kind="node"]').first();
    await nodeWin.waitFor({ timeout: 15000 });
    await page.waitForFunction(() => {
      const w = document.querySelector('[data-window][data-kind="node"]');
      return w && /KarmaKadabra/.test(w.textContent) && /alimenta a/.test(w.textContent);
    }, null, { timeout: 15000 }).catch(() => {});
    const nodeText = await nodeWin.textContent();
    check('a', 'node_window_karmakadabra', /KarmaKadabra/.test(nodeText) && /alimenta a/.test(nodeText), { how, sample: nodeText.slice(0, 160) });
    await shot(page, 'node-card.png');

    // (b) GraphTerm
    const graphWin = page.locator('[data-window][data-kind="graph"]').first();
    await graphWin.waitFor({ timeout: 15000 });
    await page.waitForFunction(
      (curl) => {
        const w = document.querySelector('[data-window][data-kind="graph"]');
        return w && w.textContent.includes(curl) && w.textContent.includes('"tool": "c0der"');
      },
      GRAPH_CURL,
      { timeout: 20000 }
    ).catch(() => {});
    const graphText = await graphWin.textContent();
    check('b', 'graph_prompt_and_source', graphText.includes(GRAPH_CURL) && graphText.includes('"tool": "c0der"'), { hasCurl: graphText.includes(GRAPH_CURL), hasTool: graphText.includes('"tool": "c0der"') });

    await focusGraphTerm(page);
    const view = page.locator('[data-graph-view]').first();
    const v0 = await view.getAttribute('data-graph-view');
    const brailleText = await page.locator('[data-braille]').first().textContent();
    const brailleCount = [...brailleText].filter((ch) => ch.charCodeAt(0) >= 0x2800 && ch.charCodeAt(0) <= 0x28ff).length;
    const brailleNonBlank = [...brailleText].filter((ch) => ch.charCodeAt(0) > 0x2800 && ch.charCodeAt(0) <= 0x28ff).length;
    check('b', 'braille_chars_ge_40', brailleNonBlank >= 40, { total: brailleCount, nonBlank: brailleNonBlank, cols: await page.locator('[data-braille]').first().getAttribute('data-cols') });
    await shot(page, 'graph-braille.png');
    await page.keyboard.press('m');
    const v1 = await view.getAttribute('data-graph-view');
    await page.keyboard.press('m');
    const v2 = await view.getAttribute('data-graph-view');
    await shot(page, 'graph-narrative.png');
    check('b', 'm_cycles_views', v0 === 'braille' && v1 === 'list' && v2 === 'narrative', { v0, v1, v2 });

    // (c) narrative
    const rects = await page.locator('[data-graph-view="narrative"] svg rect[data-map-node]').count();
    const expected = [results.graph.served_products, results.graph.live_products].filter((n) => n !== null);
    check('c', 'narrative_rects_eq_products', expected.includes(rects), { rects, served: results.graph.served_products, live: results.graph.live_products });
    const bodyText = await page.evaluate(() => document.body.innerText);
    check('c', 'no_26_agentes', !bodyText.includes('26 agentes'));

    await page.keyboard.press('m'); // back to braille
    const s0 = await view.getAttribute('data-graph-selected');
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('ArrowDown');
    const s1 = await view.getAttribute('data-graph-selected');
    check('b', 'arrowdown_changes_selected', s0 && s1 && s0 !== s1, { s0, s1 });
    await page.keyboard.press('Enter');
    const outText = await page.locator('[data-graph-out]').first().textContent().catch(() => '');
    check('b', 'enter_lists_edges', /n=\d+/.test(outText), { sample: outText.slice(0, 120) });

    // (d) PulseTerm
    const pulseWin = page.locator('[data-window][data-kind="pulse"]').first();
    await pulseWin.waitFor({ timeout: 15000 });
    await page.waitForFunction(() => {
      const w = document.querySelector('[data-window][data-kind="pulse"]');
      if (!w) return false;
      const txt = w.textContent;
      return (txt.includes('{"status":"healthy"}') || /snapshot|último dato/.test(txt)) && txt.includes('kinds ·') && txt.includes('redes');
    }, null, { timeout: 10000 }).catch(() => {});
    const pulseText = await pulseWin.textContent();
    check('d', 'pulse_health_or_chip', pulseText.includes('{"status":"healthy"}') || /snapshot|último dato/.test(pulseText), { healthy: pulseText.includes('{"status":"healthy"}') });
    check('d', 'pulse_kinds_redes', pulseText.includes('kinds ·') && pulseText.includes('redes'));
    check('d', 'pulse_never_bare_zero', !/\bkinds ·\s*0 redes|0 kinds/.test(pulseText));
    await shot(page, 'pulse.png');

    // (e) IrcTerm real
    const ircWin = page.locator('[data-window][data-kind="irc"]').first();
    await ircWin.waitFor({ timeout: 15000 });
    await page.waitForFunction(() => {
      const w = document.querySelector('[data-window][data-kind="irc"]');
      return w && (w.querySelector('[data-irc-msg]') || /sin mensajes recientes|sin dato/.test(w.textContent));
    }, null, { timeout: 15000 }).catch(() => {});
    const ircMsgs = await ircWin.locator('[data-irc-msg]').count();
    const ircText = await ircWin.textContent();
    check('e', 'irc_messages_or_empty', ircMsgs >= 1 || /sin mensajes recientes/.test(ircText), { shown: ircMsgs, hidden: await page.locator('[data-irc]').first().getAttribute('data-irc-hidden') });

    // (f) AgentTerm
    const agentWin = page.locator('[data-window][data-kind="agent"]').first();
    await agentWin.waitFor({ timeout: 15000 });
    await repl(page, 'help');
    await page.waitForFunction(() => /esta ayuda/.test((document.querySelector('[data-agent-output]') || {}).textContent || ''), null, { timeout: 5000 }).catch(() => {});
    const helpText = await page.locator('[data-agent-output]').first().textContent();
    check('f', 'help_prints_help', /esta ayuda/.test(helpText) && /run <tool>/.test(helpText));
    await repl(page, 'run get_ecosystem_map {"limit":3}');
    await page.waitForFunction(() => /"tool": "c0der"/.test((document.querySelector('[data-agent-output]') || {}).textContent || ''), null, { timeout: 15000 }).catch(() => {});
    const mapText = await page.locator('[data-agent-output]').first().textContent();
    check('f', 'run_get_ecosystem_map', mapText.includes('"tool": "c0der"'));
    await repl(page, 'open pulse');
    await page.waitForSelector('[data-window][data-kind="pulse"][data-focused="true"]', { timeout: 10000 }).catch(() => {});
    const pulseFocused = await page.locator('[data-window][data-kind="pulse"][data-focused="true"]').count();
    check('f', 'open_pulse_focuses', pulseFocused === 1, { pulseFocused });
    await shot(page, 'agent.png');

    results.errors.desktop = splitErrors(errors);
    check('h', 'desktop_no_pageerror', errors.filter((e) => e.type === 'pageerror').length === 0, errors.filter((e) => e.type === 'pageerror'));
    check('h', 'desktop_no_own_console_errors', results.errors.desktop.own.length === 0, { own: results.errors.desktop.own.slice(0, 5), foreign: results.errors.desktop.foreign.map((e) => e.text.slice(0, 120)) });
    await page.context().close();

    // ------------------------------------------------------------------ (e) IRC con fixture
    const page2 = await H.newPage(browser, { viewport: { width: 1280, height: 800 }, lang: 'es' });
    const errors2 = H.collectErrors(page2);
    const now = new Date().toISOString();
    const fixture = [
      { id: 'fx-1', channel: '#agents', nick: 'Sentinel', text: '\u000311[FINDING]\u000f hola https://x.com', time: now },
      { id: 'fx-2', channel: '#agents', nick: 'claude-test-1', text: '\u0002hola\u0002 \u000304rojo\u000f https://y.example', time: now },
    ];
    await page2.route('**/irc/channels/%23agents/messages*', (route) => route.fulfill({ status: 200, contentType: 'application/json', headers: { 'access-control-allow-origin': '*' }, body: JSON.stringify(fixture) }));
    await openEcosystem(page2);
    const irc2 = page2.locator('[data-window][data-kind="irc"]').first();
    await irc2.waitFor({ timeout: 15000 });
    await page2.waitForFunction(() => {
      const w = document.querySelector('[data-window][data-kind="irc"] [data-irc]');
      return w && (Number(w.getAttribute('data-irc-shown')) + Number(w.getAttribute('data-irc-hidden'))) === 2;
    }, null, { timeout: 15000 }).catch(() => {});
    const html = await irc2.evaluate((el) => el.innerHTML);
    const text2 = await irc2.textContent();
    check('e', 'fixture_no_control_chars', !text2.includes('\u0003') && !text2.includes('\u000f') && !text2.includes('\u0002'));
    check('e', 'fixture_no_anchor', (await irc2.locator('a').count()) === 0, { anchors: await irc2.locator('a').count() });
    // Con el filtro por defecto solo se ve claude-test-1 (04 → irc-fg-4,  → bold); Sentinel queda oculto.
    check('e', 'fixture_color_span_fg4', /irc-fg-4\b/.test(html) && /font-bold/.test(html), { hasFg4: /irc-fg-4\b/.test(html) });
    const before = await page2.locator('[data-irc]').first().evaluate((el) => ({ shown: el.getAttribute('data-irc-shown'), hidden: el.getAttribute('data-irc-hidden') }));
    await safeClick(irc2.locator('[data-window-title]').first()); // trae la ventana al frente
    const howToggle = await safeClick(page2.locator('[data-irc-filter]').first());
    const after = await page2.locator('[data-irc]').first().evaluate((el) => ({ shown: el.getAttribute('data-irc-shown'), hidden: el.getAttribute('data-irc-hidden') }));
    const htmlAfter = await irc2.evaluate((el) => el.innerHTML);
    check('e', 'filter_toggle_changes_count', before.shown !== after.shown, { before, after, howToggle });
    check('e', 'fixture_house_filter', before.shown === '1' && before.hidden === '1' && after.shown === '2', { before, after });
    check('e', 'fixture_color_span_fg11_after_toggle', /irc-fg-11\b/.test(htmlAfter) && (await irc2.locator('a').count()) === 0, { hasFg11: /irc-fg-11\b/.test(htmlAfter) });
    const text2b = await irc2.textContent();
    check('e', 'fixture_no_control_chars_after_toggle', !text2b.includes('') && !text2b.includes('') && !text2b.includes(''));
    await shot(page2, 'irc-fixture.png');
    results.errors.irc = ownErrors(errors2);
    check('h', 'irc_no_pageerror', errors2.filter((e) => e.type === 'pageerror').length === 0);
    await page2.context().close();

    // ------------------------------------------------------------------ (g) móvil 390×844
    const page3 = await H.newPage(browser, { viewport: { width: 390, height: 844 }, lang: 'es', mobile: true });
    const errors3 = H.collectErrors(page3);
    await openEcosystem(page3);
    const br = page3.locator('[data-braille]').first();
    await br.waitFor({ timeout: 30000 }).catch(() => {});
    const cols = await br.getAttribute('data-cols').catch(() => null);
    check('g', 'mobile_braille_40_cols', cols === '40', { cols });
    await page3.waitForFunction(() => document.querySelectorAll('ul[data-graph-edges] li').length >= 90, null, { timeout: 15000 }).catch(() => {});
    const li = await page3.locator('ul[data-graph-edges] li').count();
    check('g', 'mobile_edge_list_ge_90', li >= 90, { li });
    const scroll = await page3.evaluate(() => ({ sw: document.documentElement.scrollWidth, iw: window.innerWidth }));
    check('g', 'mobile_no_horizontal_scroll', scroll.sw <= scroll.iw, scroll);
    await shot(page3, 'mobile.png');
    results.errors.mobile = ownErrors(errors3);
    check('h', 'mobile_no_pageerror', errors3.filter((e) => e.type === 'pageerror').length === 0);
    await page3.context().close();
  } catch (e) {
    results.fatal = String(e && e.stack ? e.stack : e).slice(0, 2000);
    failures += 1;
    // eslint-disable-next-line no-console
    console.error('FATAL', results.fatal);
  } finally {
    await browser.close();
  }
  results.failures = failures;
  const out = H.writeJson('eco-live', results);
  // eslint-disable-next-line no-console
  console.log(`\n${failures === 0 ? 'ALL PASS' : `${failures} FAIL`} → ${out}`);
  process.exit(failures === 0 ? 0 : 1);
})();
