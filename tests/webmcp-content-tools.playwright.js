/*
 * Acceptance de las tools WebMCP de contenido (blog, cursos, contributors, NFTs) contra un dev
 * server o un build servido. Mismo patrón que tests/ecosystem/*: shim de document.modelContext
 * inyectado antes de cargar la página, y execute() real de cada tool dentro del navegador.
 *
 *   UVD_BASE=http://localhost:3311 node tests/webmcp-content-tools.playwright.js
 *
 * Verifica:
 *   (a) las 5 tools nuevas quedan registradas y el total de tools únicas es 24
 *   (b) cada una devuelve datos reales de la fuente que renderiza la página (no un stub)
 *   (c) get_blog_post con un slug inexistente devuelve { error, allowed }, sin lanzar
 *   (d) ninguna salida por defecto pasa de 1500 chars (presupuesto de Chrome por tool)
 *   (e) navigate_to acepta la sección 'blog'
 */
const path = require('path');
const fs = require('fs');

const BASE = process.env.UVD_BASE || 'http://localhost:3311';
const OUT_DIR = process.env.UVD_OUT || null;
const NEW_TOOLS = ['list_blog_posts', 'get_blog_post', 'list_courses', 'list_contributors', 'get_nft_collections'];
const TOTAL_EXPECTED = 24;
const MAX_OUTPUT = 1500;

function loadChromium() {
  const GLOBAL = 'C:/Users/lxhxr/AppData/Roaming/npm/node_modules';
  const candidates = ['@playwright/test', 'playwright', GLOBAL + '/@playwright/test', GLOBAL + '/playwright'];
  for (const mod of candidates) {
    try {
      return require(mod).chromium;
    } catch (e) {
      /* siguiente candidato */
    }
  }
  throw new Error('No encontré playwright. Instalá @playwright/test (global o local).');
}

const MODEL_CONTEXT_SHIM = () => {
  document.modelContext = {
    registerTool(t) {
      (window.__reg ||= []).push(t);
    },
  };
};

const checks = [];
function check(name, ok, detail) {
  checks.push({ name, ok: !!ok, detail });
  // eslint-disable-next-line no-console
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail !== undefined ? '  ' + JSON.stringify(detail).slice(0, 220) : ''}`);
}

async function runTool(page, name, args) {
  return page.evaluate(
    async ({ n, a }) => {
      const tool = [...(window.__reg || [])].reverse().find((t) => t && t.name === n);
      if (!tool) return { __missing: n };
      try {
        const out = await tool.execute(a || {});
        return JSON.parse(JSON.stringify(out ?? null));
      } catch (e) {
        return { __threw: String(e && e.message ? e.message : e) };
      }
    },
    { n: name, a: args }
  );
}

const size = (obj) => JSON.stringify(obj).length;

(async () => {
  const chromium = loadChromium();
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  await ctx.addInitScript(MODEL_CONTEXT_SHIM);
  const page = await ctx.newPage();
  const pageErrors = [];
  page.on('pageerror', (e) => pageErrors.push(String(e).slice(0, 300)));

  await page.goto(BASE + '/', { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('#root > *', { timeout: 30000 }).catch(() => {});
  await page.waitForFunction(() => (window.__reg || []).length > 0, { timeout: 20000 }).catch(() => {});

  const registered = await page.evaluate(() => [...new Set((window.__reg || []).map((t) => t.name))]);
  check('total de tools únicas', registered.length === TOTAL_EXPECTED, { got: registered.length, expected: TOTAL_EXPECTED });
  for (const name of NEW_TOOLS) check(`registrada: ${name}`, registered.includes(name));

  // (b) datos reales
  const blogList = await runTool(page, 'list_blog_posts', {});
  check('list_blog_posts trae posts', Array.isArray(blogList.posts) && blogList.posts.length > 0 && !!blogList.posts[0].slug, {
    total: blogList.total,
    first: blogList.posts && blogList.posts[0] && blogList.posts[0].slug,
  });

  const slug = blogList.posts && blogList.posts[0] && blogList.posts[0].slug;
  const post = await runTool(page, 'get_blog_post', { slug });
  check('get_blog_post trae cuerpo', typeof post.body === 'string' && post.body.length > 100, { chars: post.body && post.body.length, links: post.links && post.links.length });

  const courses = await runTool(page, 'list_courses', {});
  check('list_courses trae cursos', Array.isArray(courses.courses) && courses.courses.length > 0 && !!courses.courses[0].link, { total: courses.total });

  const contributors = await runTool(page, 'list_contributors', {});
  check(
    'list_contributors trae personas y slots',
    Array.isArray(contributors.contributors) && contributors.contributors.length > 0 && typeof contributors.open_slots === 'number',
    { activos: contributors.contributors && contributors.contributors.length, open_slots: contributors.open_slots }
  );

  const nfts = await runTool(page, 'get_nft_collections', {});
  const echoes = (nfts.collections || []).find((c) => c.id === 'echoes');
  check('get_nft_collections trae Echoes con contrato', !!echoes && !!echoes.contract && echoes.total_supply > 0, {
    supply: echoes && echoes.total_supply,
  });

  // (c) error estructurado, no excepción
  const bad = await runTool(page, 'get_blog_post', { slug: 'no-existe-este-post' });
  check('get_blog_post slug inválido → error + allowed', bad.error === 'unknown_slug' && Array.isArray(bad.allowed) && !bad.__threw, bad);

  // (d) presupuesto de salida
  const budgets = { list_blog_posts: blogList, get_blog_post: post, list_courses: courses, list_contributors: contributors, get_nft_collections: nfts };
  for (const [name, out] of Object.entries(budgets)) {
    // Una tool ausente o que lanzó no "cabe" en el presupuesto: es un fallo, no un PASS barato.
    const real = out && !out.__missing && !out.__threw && !out.error;
    check(`salida ≤ ${MAX_OUTPUT} chars: ${name}`, real && size(out) <= MAX_OUTPUT, { chars: size(out), real: !!real });
  }

  // (e) navegación a la sección nueva
  const nav = await runTool(page, 'navigate_to', { section: 'blog' });
  await page.waitForTimeout(600);
  const pathname = await page.evaluate(() => window.location.pathname);
  check("navigate_to 'blog' navega a /blog", nav.ok === true && pathname === '/blog', { nav, pathname });

  check('sin pageerror', pageErrors.length === 0, pageErrors.slice(0, 3));

  await browser.close();

  const failed = checks.filter((c) => !c.ok);
  // El reporte solo se escribe si se pide un destino, para no dejar artefactos en el repo.
  if (OUT_DIR) {
    fs.mkdirSync(OUT_DIR, { recursive: true });
    fs.writeFileSync(
      path.join(OUT_DIR, 'content-tools.json'),
      JSON.stringify({ base: BASE, when: new Date().toISOString(), registered, checks }, null, 2)
    );
  }
  // eslint-disable-next-line no-console
  console.log(`\n${checks.length - failed.length}/${checks.length} PASS`);
  process.exit(failed.length ? 1 : 0);
})().catch((e) => {
  // eslint-disable-next-line no-console
  console.error('ERROR:', e && e.message ? e.message : e);
  process.exit(1);
});
