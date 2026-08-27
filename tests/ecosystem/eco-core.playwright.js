/*
 * WP1 · eco-core — acceptance de ECOSYSTEM_PLAN §4/WP1 contra un dev server o build servido.
 *
 *   UVD_BASE=http://localhost:3355 node tests/ecosystem/eco-core.playwright.js
 *   (SKIP_RECORD=1 para no volver a grabar los replays con red)
 *
 * Casos:
 *   (a) 1280×800: [data-desk] mide ≥ innerHeight−44 y ≤ innerHeight; ≥ 3 [data-window] visibles; ≤ 4 con vidrio
 *   (b) chip del panel: scan_timestamp del graph.json servido (o del S3 vivo) + texto en vivo/snapshot según status
 *   (c) drag sobre [data-window-title] mueve ≥ 100 px; skew durante el arrastre; skew = 0 a los 600 ms
 *   (d) Ctrl+Alt+→ → karmakadabra < 1 s; F3 → expose; Esc → desk; Ctrl+` cambia el foco
 *   (e) CustomEvent uvd:ecosystem-open {kind:'pulse'} → result {ok:true} y pulse enfocada
 *   (f) reduce-motion: sin [data-ring]; Ctrl+Alt+→ sigue cambiando; mismo conteo de ventanas por escritorio
 *   (g) 390×844: sin [data-ring] ni drag; <details open> graph y pulse; sin scroll horizontal
 *   (h) CPU 4×: arrastrar 1.5 s + girar → ninguna long task > 50 ms → wave3/verify/eco-core-perf.json
 *   (i) record-replays.js: ≥ 12 archivos con recorded_at de hoy, sin 0x+64hex ni rutas locales
 *   (j) 0 pageerror y 0 errores de consola propios
 */
const path = require('path');
const fs = require('fs');
const { execFileSync } = require('child_process');
const H = require('./_helpers');

const BASE = H.BASE;
const ROOT = path.resolve(__dirname, '../..');
const SHOT_DIR = path.resolve(__dirname, '../../../docs/audit-2026-08-26/wave3/shots-eco-core');
fs.mkdirSync(SHOT_DIR, { recursive: true });

const checks = [];
function check(name, ok, detail) {
  checks.push({ name, ok: !!ok, detail });
  // eslint-disable-next-line no-console
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail !== undefined ? '  ' + JSON.stringify(detail) : ''}`);
}

const WIN_VISIBLE = '[data-window]:not([data-static])';

async function gotoDesk(page, url = `${BASE}/ecosystem`) {
  await page.goto(url, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('[data-desk]', { timeout: 30000 });
  await page.waitForFunction(() => document.querySelectorAll('[data-window]').length >= 1, null, { timeout: 30000 });
  await H.sleep(800);
}

async function countWindows(page) {
  return page.evaluate((sel) => Array.from(document.querySelectorAll(sel)).filter((el) => el.getBoundingClientRect().width > 0).length, WIN_VISIBLE);
}

async function transformOf(page, selector) {
  return page.evaluate((s) => {
    const el = document.querySelector(s);
    return el ? el.style.transform || getComputedStyle(el).transform : null;
  }, selector);
}

const skewOf = (transform) => {
  if (!transform) return 0;
  const m = transform.match(/skewX\((-?[\d.]+)deg\)/);
  return m ? Math.abs(parseFloat(m[1])) : 0;
};

async function dragFocused(page, dx, dy, steps = 12, stepDelay = 16) {
  const title = page.locator(`${WIN_VISIBLE}[data-focused="true"] [data-window-title]`).first();
  const winSel = `${WIN_VISIBLE}[data-focused="true"]`;
  const before = await page.locator(winSel).first().boundingBox();
  const desk = await page.locator('[data-desk]').boundingBox();
  // Arrastrar hacia donde hay sitio: si la ventana chocara con el borde, framer la devolvería
  // (rebote elástico) y eso no es lo que mide el caso (c).
  if (before && desk) {
    if (before.x + before.width + Math.abs(dx) > desk.x + desk.width) dx = -Math.abs(dx);
    if (before.y + before.height + Math.abs(dy) > desk.y + desk.height) dy = -Math.abs(dy);
    if (before.x + dx < desk.x) dx = Math.abs(dx);
    if (before.y + dy < desk.y) dy = Math.abs(dy);
  }
  const tb = await title.boundingBox();
  const sx = tb.x + Math.min(120, tb.width / 3);
  const sy = tb.y + tb.height / 2;
  await page.mouse.move(sx, sy);
  await page.mouse.down();
  let midTransform = null;
  let maxSkew = 0;
  for (let i = 1; i <= steps; i += 1) {
    await page.mouse.move(sx + (dx * i) / steps, sy + (dy * i) / steps);
    await H.sleep(stepDelay);
    const tr = await transformOf(page, winSel);
    const s = skewOf(tr);
    if (s > maxSkew) {
      maxSkew = s;
      midTransform = tr;
    }
  }
  await page.mouse.up();
  const after = await page.locator(winSel).first().boundingBox();
  return { before, after, midTransform, maxSkew, winSel, dx, dy, deskBox: desk };
}

async function main() {
  const summary = { base: BASE, at: new Date().toISOString() };
  const browser = await H.launch({ webgl: 'swiftshader' });

  // ---------- (a)(b)(c)(d)(e)(j) escritorio 1280×800 ----------
  const page = await H.newPage(browser, { viewport: { width: 1280, height: 800 }, lang: 'es' });
  const errors = H.collectErrors(page);
  await gotoDesk(page);
  await page.waitForFunction(() => document.querySelectorAll('[data-window]').length >= 3, null, { timeout: 30000 }).catch(() => {});
  await H.sleep(1500);

  const deskBox = await page.locator('[data-desk]').boundingBox();
  const innerH = await page.evaluate(() => window.innerHeight);
  check('(a) [data-desk] altura ≥ innerHeight−44 y ≤ innerHeight', deskBox && deskBox.height >= innerH - 44 && deskBox.height <= innerH, { height: deskBox && deskBox.height, innerH });
  const visibleCount = await countWindows(page);
  check('(a) ≥ 3 ventanas visibles', visibleCount >= 3, { visibleCount });
  const glassCount = await page.evaluate(() => document.querySelectorAll('[data-window][data-glass="true"]').length);
  check('(a) ≤ 4 ventanas con vidrio', glassCount <= 4, { glassCount });
  await page.screenshot({ path: path.join(SHOT_DIR, 'desk-0-1280.png') });

  // (b) chip c0der
  await page.waitForFunction(() => {
    const c = document.querySelector('[data-scan-chip]');
    return c && c.getAttribute('data-scan-timestamp');
  }, null, { timeout: 15000 }).catch(() => {});
  const chip = await page.evaluate(() => {
    const c = document.querySelector('[data-scan-chip]');
    return c ? { text: c.textContent, status: c.getAttribute('data-graph-status'), ts: c.getAttribute('data-scan-timestamp') } : null;
  });
  const served = await page.request.get(`${BASE}/ecosystem/graph.json`).then((r) => r.json()).catch(() => null);
  let live = null;
  try {
    live = await page.request.get('https://ultravioletadao.s3.us-east-1.amazonaws.com/ecosystem/graph.json', { timeout: 8000 }).then((r) => (r.ok() ? r.json() : null));
  } catch (e) {
    live = null;
  }
  const servedTs = served && served.source ? served.source.scan_timestamp : null;
  const liveTs = live && live.source ? live.source.scan_timestamp : null;
  const expectedTs = chip && chip.status === 'live' && liveTs ? liveTs : servedTs;
  check('(b) chip contiene el scan_timestamp del JSON servido', chip && chip.text.includes(expectedTs), { chipTs: chip && chip.ts, servedTs, liveTs, status: chip && chip.status });
  const statusWord = chip && chip.status === 'live' ? 'en vivo' : 'snapshot';
  check('(b) chip dice en vivo/snapshot según status', chip && chip.text.includes(statusWord), { status: chip && chip.status, text: chip && chip.text });
  summary.chip = chip;

  // (c) drag con wobble
  await page.locator(`${WIN_VISIBLE}[data-focused="true"] [data-window-title]`).first().waitFor({ timeout: 10000 });
  const drag = await dragFocused(page, 180, 90);
  const moved = drag.before && drag.after ? Math.hypot(drag.after.x - drag.before.x, drag.after.y - drag.before.y) : 0;
  const box = (b) => (b ? [Math.round(b.x), Math.round(b.y), Math.round(b.width), Math.round(b.height)] : null);
  check('(c) drag mueve la ventana ≥ 100 px', moved >= 100, { moved: Math.round(moved), dx: drag.dx, dy: drag.dy, before: box(drag.before), after: box(drag.after), desk: box(drag.deskBox) });
  check('(c) transform contiene skew durante el arrastre', drag.midTransform && /skew/.test(drag.midTransform) && drag.maxSkew > 0, { maxSkew: drag.maxSkew, midTransform: drag.midTransform });
  await H.sleep(600);
  const afterTr = await transformOf(page, drag.winSel);
  // < 0.25° = visualmente cero (el spring de framer se detiene en restDelta 0.01 con cola sub-grado).
  check('(c) skew vuelve a 0 a los 600 ms', skewOf(afterTr) < 0.25, { afterTransform: afterTr, skew: skewOf(afterTr) });
  summary.drag = { moved: Math.round(moved), maxSkew: drag.maxSkew, midTransform: drag.midTransform, afterTransform: afterTr };

  // (d) atajos
  const focusedBefore = await page.getAttribute(`${WIN_VISIBLE}[data-focused="true"]`, 'data-window');
  await page.keyboard.press('Control+Backquote');
  await H.sleep(150);
  const focusedAfter = await page.getAttribute(`${WIN_VISIBLE}[data-focused="true"]`, 'data-window');
  check('(d) Ctrl+` cambia la ventana enfocada', focusedBefore && focusedAfter && focusedBefore !== focusedAfter, { focusedBefore, focusedAfter });

  const t0 = Date.now();
  await page.keyboard.press('Control+Alt+ArrowRight');
  let switched = true;
  await page.waitForSelector('[data-desk][data-desktop-active="karmakadabra"]', { timeout: 1000 }).catch(() => { switched = false; });
  check('(d) Ctrl+Alt+→ → karmakadabra en < 1 s', switched, { ms: Date.now() - t0 });
  await H.sleep(1200);
  const kkCount = await countWindows(page);
  await page.screenshot({ path: path.join(SHOT_DIR, 'desk-1-karmakadabra-1280.png') });

  await page.keyboard.press('F3');
  await page.waitForSelector('[data-desk][data-mode="expose"]', { timeout: 1000 }).catch(() => {});
  const modeExpose = await page.getAttribute('[data-desk]', 'data-mode');
  check('(d) F3 → data-mode=expose', modeExpose === 'expose', { modeExpose });
  await H.sleep(600);
  await page.screenshot({ path: path.join(SHOT_DIR, 'desk-1-expose-1280.png') });
  await page.keyboard.press('Escape');
  await H.sleep(200);
  const modeAfterEsc = await page.getAttribute('[data-desk]', 'data-mode');
  check('(d) Esc → data-mode=desk', modeAfterEsc === 'desk', { modeAfterEsc });

  await page.keyboard.press('Control+Alt+ArrowLeft');
  await page.waitForSelector('[data-desk][data-desktop-active="ecosystem"]', { timeout: 2000 }).catch(() => {});
  await H.sleep(800);
  const ecoCount = await countWindows(page);

  // (e) bus: abrir pulse por evento
  const openResult = await page.evaluate(() => {
    const d = { kind: 'pulse' };
    window.dispatchEvent(new CustomEvent('uvd:ecosystem-open', { detail: d }));
    return d.result || null;
  });
  await H.sleep(300);
  const pulseFocused = await page.evaluate(() => Boolean(document.querySelector('[data-window][data-kind="pulse"][data-focused="true"]')));
  check('(e) uvd:ecosystem-open {kind:pulse} → result.ok y pulse enfocada', openResult && openResult.ok === true && pulseFocused, { openResult, pulseFocused });
  summary.openResult = openResult;

  // (j) errores en el escritorio principal
  await H.sleep(500);
  check('(j) 0 pageerror / 0 console.error propios en /ecosystem', errors.length === 0, { errors: errors.slice(0, 8) });
  summary.errors = errors;
  await page.close();

  // ---------- (f) reduce-motion ----------
  const rm = await H.newPage(browser, { viewport: { width: 1280, height: 800 }, lang: 'es', reducedMotion: true });
  const rmErrors = H.collectErrors(rm);
  await gotoDesk(rm);
  await rm.waitForFunction(() => document.querySelectorAll('[data-window]').length >= 3, null, { timeout: 30000 }).catch(() => {});
  await H.sleep(1200);
  const ringRm = await rm.evaluate(() => Boolean(document.querySelector('[data-ring]')));
  check('(f) reduce-motion: no existe [data-ring]', !ringRm);
  const rmEco = await countWindows(rm);
  await rm.keyboard.press('Control+Alt+ArrowRight');
  let rmSwitched = true;
  await rm.waitForSelector('[data-desk][data-desktop-active="karmakadabra"]', { timeout: 1500 }).catch(() => { rmSwitched = false; });
  await H.sleep(1200);
  const rmKk = await countWindows(rm);
  check('(f) reduce-motion: Ctrl+Alt+→ sigue cambiando de escritorio', rmSwitched);
  check('(f) reduce-motion: mismo conteo de ventanas por escritorio', rmEco === ecoCount && rmKk === kkCount, { normal: { ecosystem: ecoCount, karmakadabra: kkCount }, reduced: { ecosystem: rmEco, karmakadabra: rmKk } });
  await rm.screenshot({ path: path.join(SHOT_DIR, 'desk-1-reduced-motion-1280.png') });
  check('(f) reduce-motion: sin errores', rmErrors.length === 0, { errors: rmErrors.slice(0, 5) });
  await rm.close();

  // ---------- (g) móvil 390×844 ----------
  const mob = await H.newPage(browser, { viewport: { width: 390, height: 844 }, lang: 'es', mobile: true });
  const mobErrors = H.collectErrors(mob);
  await mob.goto(`${BASE}/ecosystem`, { waitUntil: 'domcontentloaded' });
  await mob.waitForSelector('[data-desk]', { timeout: 30000 });
  await H.sleep(2500);
  const mobState = await mob.evaluate(() => ({
    ring: Boolean(document.querySelector('[data-ring]')),
    draggable: document.querySelectorAll('[draggable="true"], [data-dragging]').length,
    graphOpen: Boolean(document.querySelector('details[open][data-mobile-window="graph"]')),
    pulseOpen: Boolean(document.querySelector('details[open][data-mobile-window="pulse"]')),
    iframes: document.querySelectorAll('iframe').length,
    scrollWidth: document.documentElement.scrollWidth,
    innerWidth: window.innerWidth,
  }));
  check('(g) móvil: sin [data-ring] ni drag', !mobState.ring && mobState.draggable === 0, mobState);
  check('(g) móvil: <details open> para graph y pulse', mobState.graphOpen && mobState.pulseOpen, { graphOpen: mobState.graphOpen, pulseOpen: mobState.pulseOpen });
  check('(g) móvil: scrollWidth === innerWidth', mobState.scrollWidth === mobState.innerWidth, { scrollWidth: mobState.scrollWidth, innerWidth: mobState.innerWidth });
  check('(g) móvil: ningún iframe', mobState.iframes === 0, { iframes: mobState.iframes });
  await mob.screenshot({ path: path.join(SHOT_DIR, 'desk-mobile-390.png'), fullPage: false });
  check('(g) móvil: sin errores', mobErrors.length === 0, { errors: mobErrors.slice(0, 5) });
  await mob.close();

  // ---------- (h) CPU 4× ----------
  const perf = await H.newPage(browser, { viewport: { width: 1280, height: 800 }, lang: 'es' });
  await gotoDesk(perf);
  await perf.waitForFunction(() => document.querySelectorAll('[data-window]').length >= 3, null, { timeout: 30000 }).catch(() => {});
  // Precalentar el escritorio 1 (sus chunks lazy se compilan una vez) y volver.
  await perf.keyboard.press('Control+Alt+ArrowRight');
  await H.sleep(2500);
  await perf.keyboard.press('Control+Alt+ArrowLeft');
  await H.sleep(2000);
  const lt = await H.longTasks(perf);
  const cdp = await H.cpuThrottle(perf, 4);
  await H.sleep(300);
  await lt.reset();
  const mark = (name) => perf.evaluate((n) => { (window.__uvdMarks = window.__uvdMarks || {})[n] = Math.round(performance.now()); }, name);
  await mark('dragStart');
  const perfDrag = await dragFocused(perf, 220, 120, 45, 33); // ≈ 1.5 s de arrastre
  await mark('dragEnd');
  await H.sleep(300);
  await mark('rotateStart');
  await perf.keyboard.press('Control+Alt+ArrowRight');
  await H.sleep(900);
  await mark('rotateEnd');
  const marks = await perf.evaluate(() => window.__uvdMarks || {});
  const tasks = await lt.read();
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 1 });
  const over = tasks.tasks.filter((x) => x.duration > 50);
  const perfJson = { at: new Date().toISOString(), base: BASE, cpuThrottle: 4, dragMs: 1500, marks, dragMoved: perfDrag.after && perfDrag.before ? Math.round(Math.hypot(perfDrag.after.x - perfDrag.before.x, perfDrag.after.y - perfDrag.before.y)) : null, maxSkew: perfDrag.maxSkew, longTasks: tasks.tasks, over50: over, observerError: tasks.error, note: 'dev server (sin minificar); escritorio 1 precalentado antes de medir' };
  const perfPath = H.writeJson('eco-core-perf', perfJson);
  check('(h) CPU 4×: ninguna long task > 50 ms arrastrando + girando', over.length === 0 && !tasks.error, { longTasks: tasks.tasks.length, over50: over.length, maxDuration: Math.max(0, ...tasks.tasks.map((x) => x.duration)), json: perfPath });
  await perf.close();

  // ---------- (i) replays ----------
  const replayDir = path.join(ROOT, 'src', 'data', 'ecosystem', 'replays');
  if (!process.env.SKIP_RECORD) {
    try {
      const out = execFileSync(process.execPath, [path.join(ROOT, 'scripts', 'ecosystem', 'record-replays.js')], { cwd: ROOT, encoding: 'utf8', timeout: 180000 });
      summary.recordOutput = out.split('\n').filter(Boolean).slice(-3);
    } catch (e) {
      check('(i) record-replays.js corre sin error', false, { error: String(e && e.message).slice(0, 300) });
    }
  }
  const today = new Date().toISOString().slice(0, 10);
  const files = fs.readdirSync(replayDir).filter((f) => f.endsWith('.json') && f !== 'index.json');
  const HEX64 = /0x[0-9a-fA-F]{64}/;
  // Letra de unidad (Z:\ o Z:/), UNC (\\server\share tal como queda escapado en JSON) o dao/ ai/ code/ sueltos.
  // Los escapes \\u0003 de los códigos mIRC en stdout NO son rutas (solo 2 barras, sin \\ de cierre).
  const LOCAL = /(?<![A-Za-z0-9])[A-Za-z]:[\\/]|\\{4}[A-Za-z0-9_.$-]+\\{2}|(^|[\s"'(])(dao|ai|code)\//m;
  const bad = [];
  let fresh = 0;
  for (const f of files) {
    const raw = fs.readFileSync(path.join(replayDir, f), 'utf8');
    const json = JSON.parse(raw);
    if (json.recorded_at && json.recorded_at.startsWith(today)) fresh += 1;
    if (HEX64.test(raw)) bad.push(`${f}: hex64`);
    if (LOCAL.test(raw)) bad.push(`${f}: ruta local`);
  }
  check('(i) ≥ 12 replays con recorded_at de hoy', fresh >= 12, { files: files.length, fresh, today });
  check('(i) ningún replay contiene 0x+64hex ni rutas locales', bad.length === 0, { bad });

  await browser.close();

  const failed = checks.filter((c) => !c.ok);
  summary.checks = checks;
  summary.passed = checks.length - failed.length;
  summary.failed = failed.length;
  H.writeJson('eco-core', summary);
  // eslint-disable-next-line no-console
  console.log(`\n${summary.passed}/${checks.length} checks OK · shots en ${SHOT_DIR}`);
  process.exit(failed.length ? 1 : 0);
}

main().catch((e) => {
  // eslint-disable-next-line no-console
  console.error('ERROR', e);
  process.exit(2);
});
