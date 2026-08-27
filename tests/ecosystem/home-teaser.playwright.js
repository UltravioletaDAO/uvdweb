/*
 * WP4 · home-teaser — acceptance de ECOSYSTEM_PLAN §4/WP4 contra un dev server o build servido.
 *
 *   UVD_BASE=http://localhost:3311 node tests/ecosystem/home-teaser.playwright.js
 *
 * Casos:
 *   (a) 1280×800: teaser a la derecha del h1, min-height ≥ 232, altura del <section> estable
 *       entre t=0.5 s y t=6 s, CLS < 0.05, LCP = H1|IMG (nunca el teaser) → wave3/verify/home-lcp-cls.json
 *   (b) ≤ 8 s: comando de MeshRelay, "connected", {"status":"healthy"}, "tool":"c0der" (o chips
 *       snapshot/último dato); nunca `c0der --last-scan`
 *   (c) click → /ecosystem; Enter con foco → /ecosystem
 *   (d) 390×844: teaser debajo del subtítulo, sin rotate, sin scroll horizontal, sin canvas
 *   (e) reduce-motion 1280: sin typewriter (≤ 4 mutaciones de texto por línea)
 *   (f) 10 s en /: ninguna request a karmakadabra, bridge.meshrelay.xyz, JetBrains Mono ni ecosystem-vendor
 *   (h) 0 pageerror
 *
 * Usa tests/ecosystem/_helpers.js (contrato C14). Si eco-core aún no lo entregó, cae a un
 * helper local equivalente para no bloquear la verificación de este paquete.
 */
const path = require('path');
const fs = require('fs');

const SHOT_DIR = path.resolve(__dirname, '../../../docs/audit-2026-08-26/wave3/shots-home-teaser');
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

const FORBIDDEN_HOSTS = ['karmakadabra.ultravioletadao.xyz', 'bridge.meshrelay.xyz'];
const isForbidden = (url) =>
  FORBIDDEN_HOSTS.some((h) => url.includes(h)) ||
  (url.includes('fonts.googleapis.com') && /jetbrains/i.test(url)) ||
  /ecosystem-vendor/i.test(url);

const normalizeErrors = (x) => (Array.isArray(x) ? x : x && typeof x === 'object' ? Object.values(x).flat() : []);
const pageErrorsOnly = (list) => list.filter((e) => (e.type || '').toString() === 'pageerror');

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const checks = [];
function check(name, ok, detail) {
  checks.push({ name, ok: !!ok, detail });
  // eslint-disable-next-line no-console
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail !== undefined ? '  ' + JSON.stringify(detail) : ''}`);
}

const PERF_INIT = () => {
  window.__uvdPerf = { cls: 0, shifts: [], lcp: [] };
  try {
    new PerformanceObserver((list) => {
      for (const e of list.getEntries()) {
        if (e.hadRecentInput) continue;
        window.__uvdPerf.cls += e.value;
        window.__uvdPerf.shifts.push({ t: Math.round(e.startTime), value: e.value });
      }
    }).observe({ type: 'layout-shift', buffered: true });
  } catch (e) { /* noop */ }
  try {
    new PerformanceObserver((list) => {
      for (const e of list.getEntries()) {
        const el = e.element || null;
        window.__uvdPerf.lcp.push({
          t: Math.round(e.startTime),
          size: e.size,
          tag: el ? el.tagName : null,
          inTeaser: !!(el && el.closest && el.closest('[data-home-teaser]')),
          text: el && el.textContent ? el.textContent.slice(0, 60) : null,
        });
      }
    }).observe({ type: 'largest-contentful-paint', buffered: true });
  } catch (e) { /* noop */ }
};

const TEASER_TEXT = () => {
  const el = document.querySelector('[data-home-teaser]');
  return el ? el.textContent || '' : '';
};

async function caseDesktop(browser) {
  const page = await H.newPage(browser, { viewport: { width: 1280, height: 800 }, lang: 'es' });
  const errors = H.collectErrors(page);
  const requests = [];
  page.on('request', (r) => requests.push(r.url()));
  await page.addInitScript(PERF_INIT);

  const t0 = Date.now();
  await page.goto(BASE + '/', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForSelector('h1', { timeout: 30000 });
  await sleep(Math.max(0, 500 - (Date.now() - t0)));
  const sectionH05 = await page.evaluate(() => document.querySelector('h1').closest('section').getBoundingClientRect().height);

  await page.waitForSelector('[data-home-teaser]', { timeout: 15000 });
  const boxes = await page.evaluate(() => {
    const h1 = document.querySelector('h1').getBoundingClientRect();
    const teaserEl = document.querySelector('[data-home-teaser]');
    const teaser = teaserEl.getBoundingClientRect();
    const cs = getComputedStyle(teaserEl);
    return { h1: { x: h1.x, y: h1.y, w: h1.width, h: h1.height }, teaser: { x: teaser.x, y: teaser.y, w: teaser.width, h: teaser.height }, minHeight: parseFloat(cs.minHeight) };
  });
  check('a.teaser-right-of-h1', boxes.teaser.x > boxes.h1.x + boxes.h1.w - 40, boxes);
  check('a.teaser-min-height>=232', boxes.minHeight >= 232 && boxes.teaser.h >= 232, { minHeight: boxes.minHeight, height: boxes.teaser.h });

  // (b) salidas reales en ≤ 8 s desde la navegación
  let bOk = false;
  try {
    await page.waitForFunction(
      () => {
        // Cada salida se verifica en SU línea (el chip snapshot de otra línea no cuenta).
        const el = document.querySelector('[data-home-teaser]');
        const s = el ? el.textContent || '' : '';
        const line = (id) => (document.querySelector('[data-term-line="' + id + '"]') || {}).textContent || '';
        const hasMesh = s.includes('curl -s https://api.meshrelay.xyz/irc/stats');
        const meshOut = line('out-mesh').includes('"connected"') || /snapshot|último dato/i.test(line('out-mesh'));
        const facOut = line('out-fac').includes('{"status":"healthy"}') || /snapshot|último dato/i.test(line('out-fac'));
        const graphOut = line('out-graph').includes('"tool":"c0der"') || /snapshot/i.test(line('out-graph'));
        return hasMesh && meshOut && facOut && graphOut;
      },
      null,
      { timeout: Math.max(1000, 8000 - (Date.now() - t0)) }
    );
    bOk = true;
  } catch (e) {
    bOk = false;
  }
  const teaserText = await page.evaluate(TEASER_TEXT);
  check('b.real-outputs-within-8s', bOk, { elapsedMs: Date.now() - t0, text: teaserText.slice(0, 400) });
  check('b.mesh-command-literal', teaserText.includes('curl -s https://api.meshrelay.xyz/irc/stats'));
  check('b.facilitator-command-literal', teaserText.includes('curl -s https://facilitator.ultravioletadao.xyz/health'));
  check('b.graph-command-literal', teaserText.includes('curl -s https://ultravioletadao.xyz/ecosystem/graph.json | jq .source'));
  check('b.open-line', /uvd@ecosystem:~\$ open \/ecosystem/.test(teaserText));
  const noLastScan1 = await page.evaluate(() => !document.documentElement.innerHTML.includes('c0der --last-scan'));

  await sleep(Math.max(0, 6000 - (Date.now() - t0)));
  const sectionH6 = await page.evaluate(() => document.querySelector('h1').closest('section').getBoundingClientRect().height);
  check('a.section-height-stable-0.5s-6s', Math.abs(sectionH6 - sectionH05) < 0.5, { at05: sectionH05, at6: sectionH6 });

  await sleep(Math.max(0, 10000 - (Date.now() - t0)));
  const noLastScan2 = await page.evaluate(() => !document.documentElement.innerHTML.includes('c0der --last-scan'));
  check('b.never-c0der-last-scan', noLastScan1 && noLastScan2);

  const perf = await page.evaluate(() => window.__uvdPerf);
  const lastLcp = perf.lcp[perf.lcp.length - 1] || null;
  check('a.cls<0.05', perf.cls < 0.05, { cls: perf.cls, shifts: perf.shifts });
  check('a.lcp-element-h1-or-img', !!lastLcp && (lastLcp.tag === 'H1' || lastLcp.tag === 'IMG') && !lastLcp.inTeaser, lastLcp);

  const forbidden = requests.filter(isForbidden);
  check('f.no-forbidden-requests-10s', forbidden.length === 0, { forbidden, total: requests.length });

  const canvas = await page.evaluate(() => {
    const c = document.querySelector('canvas[data-constellation]');
    return c ? { width: c.width, height: c.height, opacity: getComputedStyle(c).opacity } : null;
  });
  check('a.constellation-mounted-desktop', !!canvas && canvas.width > 0, canvas);

  await page.screenshot({ path: path.join(SHOT_DIR, 'home-1280.png'), fullPage: false });
  await page.locator('[data-home-teaser]').screenshot({ path: path.join(SHOT_DIR, 'teaser-1280.png') });

  // (c) click
  await page.click('[data-home-teaser] button');
  await sleep(500);
  const pathAfterClick = await page.evaluate(() => location.pathname);
  check('c.click-navigates-/ecosystem', pathAfterClick === '/ecosystem', { pathAfterClick });

  // (c) Enter con foco
  await page.goto(BASE + '/', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForSelector('[data-home-teaser] button', { timeout: 15000 });
  await page.focus('[data-home-teaser] button');
  const focused = await page.evaluate(() => document.activeElement && document.activeElement.closest('[data-home-teaser]') !== null);
  await page.keyboard.press('Enter');
  await sleep(500);
  const pathAfterEnter = await page.evaluate(() => location.pathname);
  check('c.enter-navigates-/ecosystem', focused && pathAfterEnter === '/ecosystem', { focused, pathAfterEnter });

  const errs = normalizeErrors(errors);
  check('h.no-pageerror-desktop', pageErrorsOnly(errs).length === 0, pageErrorsOnly(errs));

  const out = {
    generated_at: new Date().toISOString(),
    base: BASE,
    helpers: helpersSource,
    viewport: '1280x800',
    cls: perf.cls,
    shifts: perf.shifts,
    lcp: perf.lcp,
    lcp_last: lastLcp,
    section_height: { at_0_5s: sectionH05, at_6s: sectionH6 },
    boxes,
    teaser_text_sample: teaserText.slice(0, 600),
    forbidden_requests: forbidden,
    requests_total: requests.length,
    constellation: canvas,
    errors: errs,
  };
  const p = H.writeJson('home-lcp-cls', out);
  // eslint-disable-next-line no-console
  console.log('wrote', p);
  await page.context().close();
}

async function caseMobile(browser) {
  const page = await H.newPage(browser, { viewport: { width: 390, height: 844 }, lang: 'es', mobile: true });
  const errors = H.collectErrors(page);
  await page.goto(BASE + '/', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForSelector('[data-home-teaser]', { timeout: 15000 });
  await sleep(4000); // idle + posible montaje de la constelación
  const m = await page.evaluate(() => {
    const h1 = document.querySelector('h1');
    const sub = h1.nextElementSibling;
    const teaserEl = document.querySelector('[data-home-teaser]');
    const btn = teaserEl.querySelector('button');
    const sb = sub.getBoundingClientRect();
    const tb = teaserEl.getBoundingClientRect();
    return {
      sub: { y: sb.y, h: sb.height },
      teaser: { x: tb.x, y: tb.y, h: tb.height, w: tb.width },
      h1: { x: h1.getBoundingClientRect().x, right: h1.getBoundingClientRect().right, h: h1.getBoundingClientRect().height },
      transform: getComputedStyle(btn).transform,
      scrollWidth: document.documentElement.scrollWidth,
      innerWidth: window.innerWidth,
      canvas: !!document.querySelector('canvas[data-constellation]'),
    };
  });
  check('d.teaser-below-subtitle', m.teaser.y > m.sub.y + m.sub.h, m);
  check('d.no-rotate-transform', m.transform === 'none' || !/rotate|matrix3d/.test(m.transform), { transform: m.transform });
  check('d.no-horizontal-scroll', m.scrollWidth === m.innerWidth, { scrollWidth: m.scrollWidth, innerWidth: m.innerWidth });
  check('d.no-constellation-canvas', m.canvas === false);
  // Regresión vista en el shot 390: el min-content nowrap de la salida JSON ensanchaba el track
  // implícito del grid (teaser 634 px en 390) y el H1 se salía por la derecha (overflow-hidden lo ocultaba).
  check('d.teaser-fits-viewport', m.teaser.x >= 0 && m.teaser.x + m.teaser.w <= m.innerWidth + 0.5, { x: m.teaser.x, w: m.teaser.w, innerWidth: m.innerWidth });
  check('d.h1-fits-viewport', m.h1.x >= 0 && m.h1.right <= m.innerWidth + 0.5, m.h1);
  await page.screenshot({ path: path.join(SHOT_DIR, 'home-390.png'), fullPage: false });
  const errs = normalizeErrors(errors);
  check('h.no-pageerror-mobile', pageErrorsOnly(errs).length === 0, pageErrorsOnly(errs));
  await page.context().close();
}

async function caseReducedMotion(browser) {
  const page = await H.newPage(browser, { viewport: { width: 1280, height: 800 }, lang: 'es', reducedMotion: true });
  const errors = H.collectErrors(page);
  // Retrasa las respuestas reales 1.5 s para garantizar que el MutationObserver ya está instalado.
  await page.route(/api\.meshrelay\.xyz\/irc\/stats|facilitator\.ultravioletadao\.xyz\/health|ecosystem\/graph\.json/, async (route) => {
    await sleep(1500);
    await route.continue();
  });
  await page.goto(BASE + '/', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForSelector('[data-home-teaser] [data-term-line]', { timeout: 15000 });
  const firstFrame = await page.evaluate(() => {
    const q = (id) => (document.querySelector(`[data-term-line="${id}"]`) || {}).textContent || '';
    const el = document.querySelector('[data-home-teaser]');
    window.__uvdMut = {};
    const mo = new MutationObserver((muts) => {
      for (const mu of muts) {
        const node = mu.target.nodeType === 3 ? mu.target.parentElement : mu.target;
        const line = node && node.closest ? node.closest('[data-term-line]') : null;
        const key = line ? line.getAttribute('data-term-line') : '(outside)';
        window.__uvdMut[key] = (window.__uvdMut[key] || 0) + 1;
      }
    });
    mo.observe(el, { subtree: true, childList: true, characterData: true });
    return { mesh: q('prompt-mesh'), fac: q('prompt-fac'), graph: q('prompt-graph'), open: q('prompt-open') };
  });
  check('e.prompts-full-on-first-frame', firstFrame.mesh.includes('curl -s https://api.meshrelay.xyz/irc/stats') && firstFrame.fac.includes('/health') && firstFrame.graph.includes('jq .source') && firstFrame.open.includes('open /ecosystem'), firstFrame);

  let outputsOk = false;
  try {
    await page.waitForFunction(
      () => {
        const line = (id) => (document.querySelector('[data-term-line="' + id + '"]') || {}).textContent || '';
        return (line('out-mesh').includes('"connected"') || /snapshot|último dato/i.test(line('out-mesh'))) && (line('out-fac').includes('{"status":"healthy"}') || /snapshot|último dato/i.test(line('out-fac'))) && (line('out-graph').includes('"tool":"c0der"') || /snapshot/i.test(line('out-graph')));
      },
      null,
      { timeout: 12000 }
    );
    outputsOk = true;
  } catch (e) {
    outputsOk = false;
  }
  await sleep(800);
  const muts = await page.evaluate(() => window.__uvdMut);
  const perLine = Object.entries(muts).filter(([k]) => k !== '(outside)');
  const maxPerLine = perLine.reduce((m, [, v]) => Math.max(m, v), 0);
  check('e.outputs-appear-reduced-motion', outputsOk, muts);
  check('e.no-typewriter<=4-mutations-per-line', maxPerLine <= 4, muts);
  const transform = await page.evaluate(() => getComputedStyle(document.querySelector('[data-home-teaser] button')).transform);
  check('e.no-rotate-with-reduced-motion', transform === 'none', { transform });
  await page.screenshot({ path: path.join(SHOT_DIR, 'home-1280-reduced-motion.png'), fullPage: false });
  const errs = normalizeErrors(errors);
  check('h.no-pageerror-reduced', pageErrorsOnly(errs).length === 0, pageErrorsOnly(errs));
  await page.context().close();
}

(async () => {
  // eslint-disable-next-line no-console
  console.log('home-teaser acceptance · base', BASE, '· helpers', helpersSource);
  const browser = await H.launch({ webgl: 'swiftshader' });
  try {
    await caseDesktop(browser);
    await caseMobile(browser);
    await caseReducedMotion(browser);
  } finally {
    await browser.close();
  }
  const failed = checks.filter((c) => !c.ok);
  const summary = { generated_at: new Date().toISOString(), base: BASE, helpers: helpersSource, passed: checks.length - failed.length, failed: failed.length, checks };
  const p = H.writeJson('home-teaser', summary);
  // eslint-disable-next-line no-console
  console.log(`\n${summary.passed}/${checks.length} checks OK · ${p}`);
  process.exit(failed.length ? 1 : 0);
})().catch((e) => {
  // eslint-disable-next-line no-console
  console.error('FATAL', e);
  process.exit(2);
});
