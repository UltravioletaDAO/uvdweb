/*
 * Helper compartido de Playwright para tests/ecosystem/*.playwright.js (contrato C14).
 * Usa el @playwright/test global (mismo patrón que wave3/wheel-audit-playwright.js).
 *
 *   const H = require('./_helpers');
 *   const browser = await H.launch({ webgl: 'swiftshader' });
 *   const page = await H.newPage(browser, { viewport: { width: 1280, height: 800 }, lang: 'es' });
 */
const path = require('path');
const fs = require('fs');

const GLOBAL = 'C:/Users/lxhxr/AppData/Roaming/npm/node_modules';
let chromium;
try {
  ({ chromium } = require(GLOBAL + '/@playwright/test'));
} catch (e) {
  ({ chromium } = require(GLOBAL + '/@playwright/test/node_modules/playwright-core'));
}

const BASE = process.env.UVD_BASE || 'http://localhost:3100';
const VERIFY_DIR = path.resolve(__dirname, '../../../docs/audit-2026-08-26/wave3/verify');

const WEBGL_ARGS = {
  swiftshader: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'],
  off: ['--disable-3d-apis'],
  default: [],
};

async function launch({ webgl = 'default', headless = true } = {}) {
  const args = WEBGL_ARGS[webgl] || [];
  return chromium.launch({ headless, args });
}

async function newPage(browser, { viewport = { width: 1280, height: 800 }, lang = 'es', reducedMotion = false, mobile = false, saveData = false } = {}) {
  const ctx = await browser.newContext({
    viewport,
    isMobile: mobile,
    hasTouch: mobile,
    deviceScaleFactor: mobile ? 2 : 1,
    locale: lang === 'es' ? 'es-CO' : lang,
    reducedMotion: reducedMotion ? 'reduce' : 'no-preference',
  });
  await ctx.addInitScript((l) => {
    try {
      localStorage.setItem('i18nextLng', l);
    } catch (e) {
      /* noop */
    }
  }, lang);
  if (saveData) {
    await ctx.addInitScript(() => {
      try {
        Object.defineProperty(navigator, 'connection', { value: { saveData: true }, configurable: true });
      } catch (e) {
        /* noop */
      }
    });
  }
  return ctx.newPage();
}

const IGNORED_CONSOLE = [/\[Report Only\]/i, /ResizeObserver loop/i, /Download the React DevTools/i];

/** Acumula pageerror + console.error (sin CSP report-only ni ResizeObserver). */
function collectErrors(page) {
  const errors = [];
  page.on('pageerror', (e) => errors.push({ type: 'pageerror', text: String(e && e.message ? e.message : e).slice(0, 400) }));
  page.on('console', (m) => {
    if (m.type() !== 'error') return;
    const text = m.text();
    if (IGNORED_CONSOLE.some((re) => re.test(text))) return;
    errors.push({ type: 'console', text: text.slice(0, 400) });
  });
  return errors;
}

/** Instala un PerformanceObserver de longtask; devuelve { read() } con las entradas > 50 ms. */
async function longTasks(page) {
  await page.evaluate(() => {
    window.__uvdLongTasks = [];
    try {
      const po = new PerformanceObserver((list) => {
        list.getEntries().forEach((e) => window.__uvdLongTasks.push({ start: Math.round(e.startTime), duration: Math.round(e.duration), name: e.name }));
      });
      po.observe({ type: 'longtask', buffered: true });
      window.__uvdLongTasksObserver = po;
    } catch (e) {
      window.__uvdLongTasksError = String(e);
    }
  });
  return {
    read: () => page.evaluate(() => ({ tasks: window.__uvdLongTasks || [], error: window.__uvdLongTasksError || null })),
    reset: () => page.evaluate(() => { window.__uvdLongTasks = []; }),
  };
}

/** Ralentiza la CPU vía CDP (Emulation.setCPUThrottlingRate). rate=1 restaura. */
async function cpuThrottle(page, rate = 4) {
  const session = await page.context().newCDPSession(page);
  await session.send('Emulation.setCPUThrottlingRate', { rate });
  return session;
}

/** Guarda <name>.json en wave3/verify y devuelve la ruta. */
function writeJson(name, obj) {
  fs.mkdirSync(VERIFY_DIR, { recursive: true });
  const p = path.join(VERIFY_DIR, `${name}.json`);
  fs.writeFileSync(p, `${JSON.stringify(obj, null, 2)}\n`);
  return p;
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

module.exports = { BASE, VERIFY_DIR, launch, newPage, collectErrors, longTasks, cpuThrottle, writeJson, sleep };
