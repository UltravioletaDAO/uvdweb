/*
 * WP3 · eco-products — acceptance de ECOSYSTEM_PLAN §4/WP3 contra un dev server o build servido.
 *
 *   UVD_BASE=http://localhost:3311 node tests/ecosystem/eco-products.playwright.js
 *
 * Casos:
 *   (a) 1280×800, escritorio karmakadabra (Ctrl+Alt+→ desde 0): [data-facade] con img kk-observatory.webp
 *       y chip `detenido desde 2026-08-24`; sin iframe ni request a bridge.meshrelay.xyz antes del click;
 *       click "Cargar observatorio 3D" (swiftshader) → iframe karmakadabra + canvas dentro del frame en ≤ 15 s
 *       + ≥ 1 request/WS a bridge.meshrelay.xyz; con --disable-3d-apis el iframe apunta a /classic.html;
 *       en 390×844 no hay iframe tras el click y se abre pestaña nueva.
 *   (b) KkKpiTerm imprime `curl -s -X POST https://karmakadabra.ultravioletadao.xyz/mcp` y en ≤ 10 s
 *       `"trades":` + número o chip snapshot con fecha; EmMetricsTerm muestra `dato de terceros vía MCP de KarmaKadabra`.
 *   (c) Escritorio execution_market: ReplayTerm con `X-Frame-Options: DENY` y `grabado`; a[href="https://execution.market"][target=_blank]; ningún iframe de execution.market.
 *   (d) Escritorio describe_net: MarkdownTerm con ≥ 1 h1/h2 o chip snapshot; ningún <img>; ningún iframe.
 *   (e) Escritorio facilitator: CodeTerm `main.rs:1-22 @ a48c6fd` + enlace al blob pineado; `pin-snippets.js --verify` exit 0.
 *   (f) #agentes: llms.txt, server-card.json, agent-skills, get_ecosystem_map; sin karmacadabra.com en el DOM.
 *   (g) InteropMatrix: filas = edges.length del JSON servido; Receipt lista X-Frame-Options en "no es público".
 *   (h) kk-observatory.webp ≤ 60 KB.
 *   (i) 0 pageerror.
 *
 * Usa tests/ecosystem/_helpers.js (contrato C14). Si eco-core aún no lo entregó, cae a un helper local.
 */
const path = require('path');
const fs = require('fs');
const { spawnSync } = require('child_process');

const ROOT = path.resolve(__dirname, '../..');
const SHOT_DIR = path.resolve(__dirname, '../../../docs/audit-2026-08-26/wave3/shots-eco-products');
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
let helpersSource = 'contract';
try {
  H = require('./_helpers');
  if (typeof H.launch !== 'function' || typeof H.newPage !== 'function') throw new Error('helpers incompletos');
} catch (e) {
  H = localHelpers();
  helpersSource = 'local-fallback (' + String(e.message).slice(0, 80) + ')';
}
const BASE = H.BASE || process.env.UVD_BASE || 'http://localhost:3100';
const KK_HOST = 'karmakadabra.ultravioletadao.xyz';
const BRIDGE_HOST = 'bridge.meshrelay.xyz';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const checks = [];
function check(name, ok, detail) {
  checks.push({ name, ok: !!ok, detail });
  // eslint-disable-next-line no-console
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail !== undefined ? '  ' + JSON.stringify(detail) : ''}`);
}
const normalizeErrors = (x) => (Array.isArray(x) ? x : x && typeof x === 'object' ? Object.values(x).flat() : []);
const pageErrorsOnly = (list) => normalizeErrors(list).filter((e) => (e.type || '').toString() === 'pageerror');

async function waitFor(fn, { timeout = 10000, every = 250 } = {}) {
  const t0 = Date.now();
  let last;
  while (Date.now() - t0 < timeout) {
    try {
      last = await fn();
      if (last) return last;
    } catch (e) {
      last = null;
    }
    await sleep(every);
  }
  return last || null;
}

/** Espera al escritorio y devuelve el id activo (o null). */
const activeDesktop = (page) =>
  page.evaluate(() => {
    const el = document.querySelector('[data-desktop-active]');
    return el ? el.getAttribute('data-desktop-active') : null;
  });

/** Va a un escritorio por id con Ctrl+Alt+→ (desktop) o con el chip del panel/móvil (fallback). */
async function gotoDesktop(page, id, { mobile = false } = {}) {
  await waitFor(activeDesktop, { timeout: 15000 });
  for (let i = 0; i < 8; i += 1) {
    const cur = await activeDesktop(page);
    if (cur === id) return true;
    if (!mobile) {
      await page.keyboard.press('Control+Alt+ArrowRight');
      await sleep(350);
      const after = await activeDesktop(page);
      if (after === id) return true;
      if (after !== cur) continue;
    }
    // Fallback: cualquier control del panel/chips que apunte al escritorio.
    // Click programático: en móvil el header fijo del sitio/panel puede tapar el chip.
    const clicked = await page.evaluate((d) => {
      const el = document.querySelector(`[data-desktop-btn="${d}"]`);
      if (!el) return false;
      el.click();
      return true;
    }, id);
    if (clicked) {
      await sleep(400);
      if ((await activeDesktop(page)) === id) return true;
    }
  }
  return (await activeDesktop(page)) === id;
}

/** Trae una ventana al frente (pointerdown → desk.focus): la cascada inicial puede taparla con otra. */
async function focusWindow(page, kind) {
  await page.evaluate((k) => {
    const el = document.querySelector(`[data-window][data-kind="${k}"]`);
    if (el) el.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, pointerId: 1, pointerType: 'mouse', isPrimary: true }));
  }, kind);
  await sleep(400);
}

const windowText = (page, kind) =>
  page.evaluate((k) => {
    const els = Array.from(document.querySelectorAll(`[data-window][data-kind="${k}"]`));
    return els.map((el) => el.innerText || el.textContent || '').join('\n');
  }, kind);

async function main() {
  // eslint-disable-next-line no-console
  console.log(`eco-products acceptance · BASE=${BASE} · helpers=${helpersSource}`);
  const verify = { base: BASE, helpers: helpersSource, at: new Date().toISOString() };

  /* ---------- (h) póster ---------- */
  const posterPath = path.join(ROOT, 'public', 'ecosystem', 'posters', 'kk-observatory.webp');
  const posterBytes = fs.existsSync(posterPath) ? fs.statSync(posterPath).size : -1;
  check('(h) kk-observatory.webp ≤ 60 KB', posterBytes > 0 && posterBytes <= 60 * 1024, { bytes: posterBytes });
  verify.posterBytes = posterBytes;

  /* ---------- (e2) pin-snippets --verify ---------- */
  const pin = spawnSync(process.execPath, [path.join(ROOT, 'scripts', 'ecosystem', 'pin-snippets.js'), '--verify'], { encoding: 'utf8', timeout: 90000 });
  check('(e) pin-snippets.js --verify exit 0', pin.status === 0, { status: pin.status, out: (pin.stdout || pin.stderr || '').trim().slice(0, 200) });
  verify.pinVerify = { status: pin.status };

  /* ---------- sesión principal: swiftshader 1280×800 ---------- */
  const browser = await H.launch({ webgl: 'swiftshader' });
  const page = await H.newPage(browser, { viewport: { width: 1280, height: 800 }, lang: 'es' });
  const errors = H.collectErrors(page);
  const requests = [];
  page.on('request', (r) => requests.push({ url: r.url(), t: Date.now() }));
  const sockets = [];
  page.on('websocket', (ws) => sockets.push({ url: ws.url(), t: Date.now() }));

  await page.goto(`${BASE}/ecosystem`, { waitUntil: 'domcontentloaded' });
  const deskReady = await waitFor(async () => (await page.locator('[data-window]').count()) > 0, { timeout: 30000 });
  check('escritorio montado (≥ 1 [data-window])', Boolean(deskReady));

  /* ---------- (a) karmakadabra ---------- */
  const onKk = await gotoDesktop(page, 'karmakadabra');
  check('(a) Ctrl+Alt+→ llega al escritorio karmakadabra', onKk, { active: await activeDesktop(page) });
  const facade = page.locator('[data-facade]').first();
  const facadeReady = await waitFor(async () => (await facade.count()) > 0, { timeout: 15000 });
  check('(a) [data-facade] presente', Boolean(facadeReady));
  const posterSrc = await page.evaluate(() => {
    const img = document.querySelector('[data-facade] img');
    return img ? img.getAttribute('src') : null;
  });
  check('(a) póster img[src$="kk-observatory.webp"]', typeof posterSrc === 'string' && posterSrc.endsWith('kk-observatory.webp'), { posterSrc });
  const chipText = await waitFor(async () => {
    const txt = await page.evaluate(() => {
      const el = document.querySelector('[data-facade-chip]');
      return el ? el.textContent : '';
    });
    return /detenido desde 2026-08-24/.test(txt) ? txt : null;
  }, { timeout: 12000 });
  check('(a) chip "detenido desde 2026-08-24"', Boolean(chipText), { chipText });
  const iframesBefore = await page.locator('[data-facade] iframe').count();
  const bridgeBefore = requests.filter((r) => r.url.includes(BRIDGE_HOST)).length + sockets.filter((s) => s.url.includes(BRIDGE_HOST)).length;
  check('(a) sin iframe antes del click', iframesBefore === 0, { iframesBefore });
  check('(a) sin request a bridge.meshrelay.xyz antes del click', bridgeBefore === 0, { bridgeBefore });
  await page.screenshot({ path: path.join(SHOT_DIR, 'a-kk-facade-idle.png') });

  /* ---------- (b) kk_kpi (antes del click, mismo escritorio) ---------- */
  const kpiOk = await waitFor(async () => {
    const txt = await windowText(page, 'kk_kpi');
    const hasCmd = txt.includes('curl -s -X POST https://karmakadabra.ultravioletadao.xyz/mcp');
    const hasTrades = /"trades":\s*\d+/.test(txt);
    const hasSnapshot = /snapshot \d{4}-\d{2}-\d{2}/.test(txt);
    return hasCmd && (hasTrades || hasSnapshot) ? { hasCmd, hasTrades, hasSnapshot } : null;
  }, { timeout: 12000 });
  check('(b) KkKpiTerm: curl real + "trades": número (o snapshot con fecha)', Boolean(kpiOk), kpiOk || { text: (await windowText(page, 'kk_kpi')).slice(0, 200) });

  /* ---------- (a) click → iframe + canvas + bridge ---------- */
  const loadBtn = page.locator('[data-facade-load]').first();
  check('(a) botón "Cargar observatorio 3D"', (await loadBtn.count()) > 0 && /Cargar observatorio 3D/.test(await loadBtn.textContent()));
  await focusWindow(page, 'observatory');
  const tClick = Date.now();
  await loadBtn.click({ timeout: 15000 });
  const frameSrc = await waitFor(async () => {
    const src = await page.evaluate(() => {
      const f = document.querySelector('[data-facade] iframe');
      return f ? f.getAttribute('src') : null;
    });
    return src && src.startsWith(`https://${KK_HOST}/`) ? src : null;
  }, { timeout: 5000 });
  check('(a) iframe[src^="https://karmakadabra.ultravioletadao.xyz/"] tras el click', Boolean(frameSrc), { frameSrc });
  const canvasInFrame = await waitFor(async () => {
    const frame = page.frames().find((f) => f.url().startsWith(`https://${KK_HOST}/`));
    if (!frame) return null;
    const has = await frame.evaluate(() => !!document.querySelector('canvas')).catch(() => false);
    return has ? true : null;
  }, { timeout: 15000, every: 500 });
  check('(a) canvas dentro del iframe en ≤ 15 s', Boolean(canvasInFrame), { ms: Date.now() - tClick });
  await sleep(1500);
  const bridgeAfter = requests.filter((r) => r.url.includes(BRIDGE_HOST) && r.t >= tClick).length + sockets.filter((s) => s.url.includes(BRIDGE_HOST) && s.t >= tClick).length;
  check('(a) ≥ 1 request/WS a bridge.meshrelay.xyz tras el click', bridgeAfter >= 1, { bridgeAfter, http: requests.filter((r) => r.url.includes(BRIDGE_HOST)).length, ws: sockets.filter((s) => s.url.includes(BRIDGE_HOST)).length });
  await page.screenshot({ path: path.join(SHOT_DIR, 'a-kk-facade-live.png') });
  verify.observatory = { frameSrc, canvasInFrame: Boolean(canvasInFrame), bridgeAfter, chipText };

  /* ---------- (b/c) execution_market ---------- */
  const onEm = await gotoDesktop(page, 'execution_market');
  check('(c) escritorio execution_market', onEm, { active: await activeDesktop(page) });
  const emMetrics = await waitFor(async () => {
    const txt = await windowText(page, 'em_metrics');
    return txt.includes('dato de terceros vía MCP de KarmaKadabra') ? true : null;
  }, { timeout: 12000 });
  check('(b) EmMetricsTerm: "dato de terceros vía MCP de KarmaKadabra"', Boolean(emMetrics));
  const replayTxt = await waitFor(async () => {
    const txt = await windowText(page, 'replay');
    return txt.includes('X-Frame-Options: DENY') && txt.includes('grabado') ? txt : null;
  }, { timeout: 12000 });
  check('(c) ReplayTerm: "X-Frame-Options: DENY" + "grabado"', Boolean(replayTxt));
  const emLink = await page.locator('a[href="https://execution.market"][target="_blank"]').count();
  const emIframe = await page.locator('iframe[src*="execution.market"]').count();
  check('(c) a[href="https://execution.market"][target=_blank] presente', emLink > 0, { emLink });
  check('(c) ningún iframe[src*="execution.market"]', emIframe === 0, { emIframe });
  await page.screenshot({ path: path.join(SHOT_DIR, 'c-execution-market.png') });

  /* ---------- (d) describe_net ---------- */
  const onDescribe = await gotoDesktop(page, 'describe_net');
  check('(d) escritorio describe_net', onDescribe, { active: await activeDesktop(page) });
  const mdOk = await waitFor(async () => {
    const r = await page.evaluate(() => {
      const wins = Array.from(document.querySelectorAll('[data-window][data-kind="md"]'));
      const headings = wins.reduce((n, w) => n + w.querySelectorAll('h1, h2').length, 0);
      const snapshot = wins.some((w) => /snapshot \d{4}-\d{2}-\d{2}/.test(w.textContent || ''));
      const imgs = wins.reduce((n, w) => n + w.querySelectorAll('img').length, 0);
      return { wins: wins.length, headings, snapshot, imgs };
    });
    return r.wins > 0 && (r.headings >= 1 || r.snapshot) ? r : null;
  }, { timeout: 12000 });
  check('(d) MarkdownTerm: ≥ 1 h1/h2 (o chip snapshot)', Boolean(mdOk), mdOk || undefined);
  check('(d) MarkdownTerm sin <img>', Boolean(mdOk) && mdOk.imgs === 0, mdOk ? { imgs: mdOk.imgs } : undefined);
  const describeIframes = await page.locator('[data-desk] iframe, [data-window] iframe').count();
  check('(d) ningún iframe en describe_net', describeIframes === 0, { describeIframes });
  await page.screenshot({ path: path.join(SHOT_DIR, 'd-describe-net.png') });

  /* ---------- (e) facilitator ---------- */
  const onFac = await gotoDesktop(page, 'facilitator');
  check('(e) escritorio facilitator', onFac, { active: await activeDesktop(page) });
  const codeOk = await waitFor(async () => {
    const r = await page.evaluate(() => {
      const wins = Array.from(document.querySelectorAll('[data-window][data-kind="code"]'));
      const titleOk = wins.some((w) => /main\.rs:1-22 @ a48c6fd/.test(w.textContent || ''));
      const link = document.querySelector('a[href*="github.com/UltravioletaDAO/x402-rs/blob/a48c6fd7a295"]');
      const highlighted = wins.some((w) => w.querySelector('[data-code-highlighted="true"]'));
      return { wins: wins.length, titleOk, link: Boolean(link), highlighted };
    });
    return r.titleOk && r.link ? r : null;
  }, { timeout: 12000 });
  check('(e) CodeTerm "main.rs:1-22 @ a48c6fd" + enlace al blob pineado', Boolean(codeOk), codeOk || undefined);
  await page.screenshot({ path: path.join(SHOT_DIR, 'e-facilitator-code.png') });

  /* ---------- (f) #agentes ---------- */
  const agentes = await page.evaluate(() => {
    const el = document.getElementById('agentes');
    if (!el) return null;
    const txt = el.textContent || '';
    return {
      llms: txt.includes('llms.txt'),
      serverCard: txt.includes('server-card.json'),
      skills: txt.includes('agent-skills'),
      tool: txt.includes('get_ecosystem_map'),
      badDomain: document.documentElement.outerHTML.includes('karmacadabra.com'),
    };
  });
  check('(f) #agentes existe', Boolean(agentes));
  check('(f) #agentes contiene llms.txt, server-card.json, agent-skills, get_ecosystem_map', Boolean(agentes) && agentes.llms && agentes.serverCard && agentes.skills && agentes.tool, agentes || undefined);
  check('(f) el DOM no contiene karmacadabra.com', Boolean(agentes) && !agentes.badDomain);
  await page.locator('#agentes').scrollIntoViewIfNeeded().catch(() => {});
  await page.screenshot({ path: path.join(SHOT_DIR, 'f-agentes.png') });

  /* ---------- (g) InteropMatrix + Receipt ---------- */
  const interopStatus = await page.evaluate(() => {
    const table = document.querySelector('[data-interop-table]');
    return table ? table.getAttribute('data-interop-status') : null;
  });
  const graphUrl = interopStatus === 'live' ? 'https://ultravioletadao.s3.us-east-1.amazonaws.com/ecosystem/graph.json' : `${BASE}/ecosystem/graph.json`;
  let servedEdges = -1;
  try {
    const res = await page.request.get(graphUrl);
    const json = await res.json();
    servedEdges = Array.isArray(json.edges) ? json.edges.length : -1;
  } catch (e) {
    servedEdges = -1;
  }
  const rows = await waitFor(async () => {
    const n = await page.locator('[data-interop-table] tbody tr[data-edge-source]').count();
    return n > 0 ? n : null;
  }, { timeout: 12000 });
  check('(g) InteropMatrix filas = edges.length del JSON servido', rows === servedEdges && servedEdges > 0, { rows, servedEdges, interopStatus, graphUrl });
  const receiptPrivate = await page.evaluate(() => {
    const col = document.querySelector('[data-receipt-col="private"]');
    return col ? col.textContent : '';
  });
  check('(g) Receipt lista X-Frame-Options en "no es público"', /X-Frame-Options/.test(receiptPrivate));
  await page.locator('[data-receipt]').scrollIntoViewIfNeeded().catch(() => {});
  await page.screenshot({ path: path.join(SHOT_DIR, 'g-receipt.png') });
  verify.interop = { rows, servedEdges, interopStatus };

  /* ---------- (i) errores ---------- */
  const pe = pageErrorsOnly(errors);
  check('(i) 0 pageerror (sesión principal)', pe.length === 0, pe.slice(0, 5));
  verify.errorsMain = normalizeErrors(errors).slice(0, 20);
  await browser.close();

  /* ---------- (a) webgl off → classic.html ---------- */
  const browserOff = await H.launch({ webgl: 'off' });
  const pageOff = await H.newPage(browserOff, { viewport: { width: 1280, height: 800 }, lang: 'es' });
  const errorsOff = H.collectErrors(pageOff);
  await pageOff.goto(`${BASE}/ecosystem`, { waitUntil: 'domcontentloaded' });
  await waitFor(async () => (await pageOff.locator('[data-window]').count()) > 0, { timeout: 30000 });
  await gotoDesktop(pageOff, 'karmakadabra');
  await waitFor(async () => (await pageOff.locator('[data-facade-load]').count()) > 0, { timeout: 15000 });
  await focusWindow(pageOff, 'observatory');
  await pageOff.locator('[data-facade-load]').first().click({ timeout: 15000 });
  const classicSrc = await waitFor(async () => {
    const src = await pageOff.evaluate(() => {
      const f = document.querySelector('[data-facade] iframe');
      return f ? f.getAttribute('src') : null;
    });
    return src || null;
  }, { timeout: 5000 });
  check('(a) sin WebGL → iframe apunta a /classic.html', typeof classicSrc === 'string' && classicSrc.endsWith('/classic.html'), { classicSrc });
  await pageOff.screenshot({ path: path.join(SHOT_DIR, 'a-kk-facade-classic.png') });
  check('(i) 0 pageerror (webgl off)', pageErrorsOnly(errorsOff).length === 0, pageErrorsOnly(errorsOff).slice(0, 5));
  await browserOff.close();

  /* ---------- (a) móvil 390×844 → pestaña nueva, nunca iframe ---------- */
  const browserM = await H.launch({ webgl: 'swiftshader' });
  const pageM = await H.newPage(browserM, { viewport: { width: 390, height: 844 }, lang: 'es', mobile: true });
  const errorsM = H.collectErrors(pageM);
  await pageM.goto(`${BASE}/ecosystem`, { waitUntil: 'domcontentloaded' });
  await waitFor(async () => (await pageM.locator('[data-window], details').count()) > 0, { timeout: 30000 });
  await gotoDesktop(pageM, 'karmakadabra', { mobile: true });
  // En móvil las ventanas son <details>: abrir la del observatorio si está cerrada.
  await pageM.evaluate(() => {
    const d = document.querySelector('details[data-mobile-window="observatory"]');
    if (d) d.open = true;
  });
  const openLink = pageM.locator('[data-facade-open]').first();
  const hasOpen = await waitFor(async () => (await openLink.count()) > 0, { timeout: 15000 });
  check('(a) móvil: link-out [data-facade-open] presente', Boolean(hasOpen));
  let newPageUrl = null;
  if (hasOpen) {
    const ctxM = pageM.context();
    const [popup] = await Promise.all([ctxM.waitForEvent('page', { timeout: 10000 }).catch(() => null), openLink.click({ force: true, timeout: 5000 }).catch(() => null)]);
    newPageUrl = popup ? popup.url() : null;
    if (popup) await popup.close().catch(() => {});
  }
  const mobileIframes = await pageM.locator('[data-facade] iframe').count();
  check('(a) móvil: se abre pestaña nueva con karmakadabra', typeof newPageUrl === 'string' && newPageUrl.includes(KK_HOST), { newPageUrl });
  check('(a) móvil: ningún iframe tras el click', mobileIframes === 0, { mobileIframes });
  const scrollW = await pageM.evaluate(() => ({ sw: document.documentElement.scrollWidth, iw: window.innerWidth }));
  check('(a) móvil: sin scroll horizontal', scrollW.sw === scrollW.iw, scrollW);
  await pageM.screenshot({ path: path.join(SHOT_DIR, 'a-kk-facade-mobile.png'), fullPage: false });
  check('(i) 0 pageerror (móvil)', pageErrorsOnly(errorsM).length === 0, pageErrorsOnly(errorsM).slice(0, 5));
  await browserM.close();

  /* ---------- resumen ---------- */
  const failed = checks.filter((c) => !c.ok);
  verify.checks = checks;
  const out = H.writeJson('eco-products', verify);
  // eslint-disable-next-line no-console
  console.log(`\n${checks.length - failed.length}/${checks.length} PASS · ${failed.length} FAIL · ${out}`);
  process.exit(failed.length ? 1 : 0);
}

main().catch((e) => {
  // eslint-disable-next-line no-console
  console.error('eco-products: error inesperado', e);
  process.exit(2);
});
