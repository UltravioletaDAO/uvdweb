/* Verificación end-to-end del SwapWidgetV2 (fix KyberSwap, 2026-08-28).
 *
 *   PORT=3111 BROWSER=none npx craco start
 *   node tests/swap-widget-verify.js            # BASE_URL=http://localhost:3111 por defecto
 *
 * NO firma ni envía transacciones: solo lecturas on-chain (quotes, balanceOf, allowance) y UI,
 * con window.ethereum mockeado sobre una dirección PÚBLICA (el multisig del DAO).
 * Cada escenario de fallo se MONTA explícitamente (route interception) para que el test
 * discrimine: un test que no se pone rojo con el estado malo no es un test.
 */
// Playwright no es dependencia del proyecto: se resuelve del paquete local si existe,
// si no del global (`npm i -g @playwright/test`). PLAYWRIGHT_PATH lo fuerza a mano.
function loadPlaywright() {
  const candidates = [
    process.env.PLAYWRIGHT_PATH,
    'playwright',
    '@playwright/test',
  ].filter(Boolean);
  for (const candidate of candidates) {
    try {
      return require(candidate);
    } catch (error) {
      /* siguiente */
    }
  }
  throw new Error('No encuentro playwright. Instalá @playwright/test o exportá PLAYWRIGHT_PATH.');
}
const { chromium } = loadPlaywright();

const BASE = process.env.BASE_URL || 'http://localhost:3111';
const ACCOUNT = '0x52110a2Cc8B6bBf846101265edAAe34E753f3389'; // Safe multisig UltraVioleta DAO
const USDC = '0xb97ef9ef8734c71904d8002f8b6bc66dd9c48a6e';
// Las capturas van al temp del sistema: el test no ensucia el repo.
const OUT = process.env.OUT_DIR || require('path').join(require('os').tmpdir(), 'swap-widget-verify');
require('fs').mkdirSync(OUT, { recursive: true });

const results = [];
const check = (name, pass, detail) => {
  results.push({ name, pass, detail });
  console.log(`${pass ? 'PASS' : 'FAIL'}  ${name}${detail ? ' :: ' + detail : ''}`);
};

const INIT = ({ account }) => {
  const listeners = {};
  const provider = {
    isMetaMask: true,
    _isMock: true,
    request: async ({ method, params }) => {
      switch (method) {
        case 'eth_sendTransaction': {
          // NUNCA se firma nada: se registra el payload que la UI mando a la wallet y se
          // rechaza como si el usuario cancelara (codigo 4001).
          window.__sentTx = window.__sentTx || [];
          window.__sentTx.push((params && params[0]) || null);
          throw Object.assign(new Error('User rejected the request (test mock)'), { code: 4001 });
        }
        case 'eth_requestAccounts':
        case 'eth_accounts':
          return [account];
        case 'eth_chainId':
          return '0xa86a';
        case 'net_version':
          return '43114';
        case 'wallet_switchEthereumChain':
        case 'wallet_addEthereumChain':
          return null;
        case 'wallet_getPermissions':
        case 'wallet_requestPermissions':
          return [{ parentCapability: 'eth_accounts' }];
        default:
          throw Object.assign(new Error('mock provider: ' + method + ' not supported'), { code: 4200 });
      }
    },
    on: (event, handler) => {
      (listeners[event] = listeners[event] || []).push(handler);
      return provider;
    },
    removeListener: (event, handler) => {
      listeners[event] = (listeners[event] || []).filter((h) => h !== handler);
      return provider;
    },
    emit: (event, payload) => (listeners[event] || []).forEach((h) => h(payload)),
  };

  window.ethereum = provider;
  window.__mockProvider = provider;

  const info = {
    uuid: '11111111-2222-3333-4444-555555555555',
    name: 'MetaMask',
    icon: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciLz4=',
    rdns: 'io.metamask',
  };
  const announce = () =>
    window.dispatchEvent(
      new CustomEvent('eip6963:announceProvider', { detail: Object.freeze({ info, provider }) })
    );
  window.addEventListener('eip6963:requestProvider', announce);
  announce();
  setTimeout(announce, 300);
};

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  await context.addInitScript(INIT, { account: ACCOUNT });

  // Estado de la simulación de fallo de RPC (se activa a mitad del test).
  const state = { breakUsdc: false, breakAggregators: false, zeroAllowance: false, breakAllowance: false };

  const page = await context.newPage();

  // Rompe SOLO la lectura de balanceOf de USDC, dejando pasar todo lo demás.
  await page.route(/rpc\.thirdweb\.com/i, async (route) => {
    if (!state.breakUsdc) return route.continue();
    const request = route.request();
    let body;
    try {
      body = JSON.parse(request.postData() || 'null');
    } catch {
      return route.continue();
    }
    const isUsdcCall = (entry) =>
      entry &&
      entry.method === 'eth_call' &&
      entry.params &&
      entry.params[0] &&
      String(entry.params[0].to || '').toLowerCase() === USDC;

    const touchesUsdc = Array.isArray(body) ? body.some(isUsdcCall) : isUsdcCall(body);
    if (!touchesUsdc) return route.continue();

    const response = await route.fetch();
    let json;
    try {
      json = await response.json();
    } catch {
      return route.fulfill({ response });
    }
    const breakEntry = (entry, source) => {
      const original = Array.isArray(body) ? body.find((b) => b.id === entry.id) : body;
      if (isUsdcCall(original)) {
        delete entry.result;
        entry.error = { code: -32000, message: 'forced RPC failure (test)' };
      }
      return entry;
    };
    if (Array.isArray(json)) json.forEach(breakEntry);
    else breakEntry(json);
    return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(json) });
  });

  // Fuerza allowance = 0 para montar explicitamente el estado "falta aprobar".
  await page.route(/api\.avax\.network/i, async (route) => {
    if (!state.zeroAllowance && !state.breakAllowance) return route.continue();
    let body;
    try {
      body = JSON.parse(route.request().postData() || 'null');
    } catch {
      return route.continue();
    }
    const isAllowance = body && body.method === 'eth_call' &&
      String(body.params?.[0]?.data || '').startsWith('0xdd62ed3e');
    if (!isAllowance) return route.continue();
    if (state.breakAllowance) {
      return route.fulfill({ status: 503, contentType: 'text/plain', body: 'rpc down (test)' });
    }
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ jsonrpc: '2.0', id: body.id, result: '0x' + '0'.repeat(64) }),
    });
  });

  // Corta los DOS agregadores para verificar que el botón dice el motivo.
  await page.route(/(kyberswap|paraswap)\.(com|io)/i, async (route) => {
    if (!state.breakAggregators) return route.continue();
    return route.fulfill({ status: 530, contentType: 'text/plain', body: 'error code: 1033' });
  });

  // Errores de consola: se guardan todos y al final se descuentan los ESPERADOS
  // (los fallos que el propio test provoca y el ruido preexistente de thirdweb).
  const consoleErrors = [];
  page.on('console', (msg) => {
    if (msg.type() !== 'error') return;
    const text = msg.text().slice(0, 300);
    const where = (typeof msg.location === 'function' && msg.location()?.url) || '';
    consoleErrors.push({ text, where });
    console.log('  [console.error]', text);
  });
  page.on('pageerror', (error) => {
    const text = `pageerror: ${String(error && error.message).slice(0, 300)}`;
    // El stack dice de QUE origen vino: el iframe de DexScreener tira los suyos.
    const where = String((error && error.stack) || '').slice(0, 600);
    consoleErrors.push({ text, where });
    console.log('  [pageerror]', text);
  });

  // Calldata real que la UI pidio a los agregadores (prueba de ruteo sin firmar).
  const builds = [];
  page.on('response', async (response) => {
    const url = response.url();
    if (!/route\/build|api\.paraswap\.io\/transactions/i.test(url)) return;
    const payload = await response.json().catch(() => null);
    const data = payload?.data?.data || payload?.data;
    builds.push({
      url,
      status: response.status(),
      router: payload?.data?.routerAddress || payload?.to || null,
      calldataBytes: typeof data === 'string' && data.startsWith('0x') ? (data.length - 2) / 2 : 0,
    });
  });

  await page.goto(`${BASE}/token`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4000);

  // ---------------------------------------------------------------- conectar
  const connect = page.getByRole('button', { name: /connect|conectar/i }).first();
  await connect.click({ timeout: 20000 });
  await page.waitForTimeout(1500);
  const metamask = page.getByText('MetaMask', { exact: false }).first();
  await metamask.click({ timeout: 20000 });
  await page.waitForTimeout(4000);
  await page.screenshot({ path: `${OUT}/01-connected.png`, fullPage: false });

  await page.keyboard.press('Escape');
  await page.waitForTimeout(800);

  // TODO lo del widget se busca dentro de su card: la pagina tambien monta el WrapWidget,
  // que tiene su propio input y su propio MAX.
  const swap = page.locator('[data-testid="swap-widget"]');

  const connected = await page
    .locator('body')
    .innerText()
    .then((text) => /0x52|0X52|\.\.\./.test(text));
  check('wallet conectada (mock EIP-6963)', connected);

  // ------------------------------------------------- balances + USD por token
  const readBalances = async () => {
    return page.evaluate(() => {
      const out = {};
      const root = document.querySelector('[data-testid="swap-widget"]');
      root.querySelectorAll('[data-testid^="balance-"]').forEach((el) => {
        const id = el.getAttribute('data-testid');
        out[id] = el.textContent.trim();
      });
      return out;
    });
  };

  await page.waitForTimeout(3000);
  let balances = await readBalances();
  console.log('  balances visibles:', JSON.stringify(balances));

  check(
    'el campo activo muestra balance real (no 0 mentiroso ni vacío)',
    Object.keys(balances).some((k) => k.startsWith('balance-') && !k.includes('usd') && balances[k] !== '—'),
    JSON.stringify(balances)
  );

  // Abrir el dropdown del campo "from" y leer balance + USD de CADA token
  await page.keyboard.press('Escape');
  await page.waitForTimeout(500);
  await swap.locator('[data-testid="token-trigger-AVAX"]').first().click();
  await page.waitForTimeout(1200);
  await page.screenshot({ path: `${OUT}/02-dropdown.png` });

  const optionRows = await page.evaluate(() => {
    const out = {};
    document.querySelectorAll('[data-testid^="option-balance-"]').forEach((el) => {
      out[el.getAttribute('data-testid').replace('option-balance-', '')] = el.textContent.trim();
    });
    return out;
  });
  console.log('  filas del selector:', JSON.stringify(optionRows));
  check(
    'el selector lista los 4 tokens con su balance',
    ['AVAX', 'UVD', 'USDC', 'USDC.e'].every((s) => s in optionRows),
    JSON.stringify(optionRows)
  );
  check(
    'al menos un token muestra estimado en USD en el selector',
    Object.values(optionRows).some((v) => v.includes('$')),
    JSON.stringify(optionRows)
  );

  // Elegir USDC como token de entrada (el par que fallaba)
  await swap.locator('[data-testid="option-USDC"]').first().click();
  await page.waitForTimeout(1500);

  // ------------------------------------------------ el par roto: USDC -> UVD
  const amountInput = swap.locator('input[type="number"]').first();
  await amountInput.fill('1');
  await page.waitForTimeout(6000);
  await page.screenshot({ path: `${OUT}/03-usdc-uvd.png` });

  const buttonText = (await swap.locator('[data-testid="swap-button"]').innerText().catch(() => '')).trim();
  const toAmount = await swap
    .locator('input[type="number"]')
    .nth(1)
    .inputValue()
    .catch(() => '');
  const route = await swap.locator('[data-testid="swap-route"]').innerText().catch(() => '');
  console.log(`  USDC->UVD  boton="${buttonText}"  out="${toAmount}"  ruta="${route}"`);

  check(
    'USDC->UVD cotiza (el bug original): hay monto de salida',
    !!toAmount && parseFloat(toAmount) > 0,
    `out=${toAmount}`
  );
  check(
    'el boton NO dice "Ingresa cantidad" con la cantidad ya ingresada',
    !/enter amount|ingresa cantidad|indique|montant|insira/i.test(buttonText),
    `boton="${buttonText}"`
  );
  check('la ruta cross-DEX se muestra', !!route, route);

  const amountUsd = await swap
    .locator('[data-testid^="amount-usd-"]')
    .first()
    .innerText()
    .catch(() => '');
  check('el campo activo muestra el estimado en USD del monto', /\$/.test(amountUsd), amountUsd);

  // -------------------------------- una lectura RPC que falla no pone 0 a las demas
  state.breakUsdc = true;
  await swap.locator('button[aria-label*="quote" i], button[aria-label*="cotiza" i]').first().click().catch(() => {});
  await page.waitForTimeout(9000);
  balances = await readBalances();
  console.log('  balances con USDC roto:', JSON.stringify(balances));
  await page.screenshot({ path: `${OUT}/04-usdc-rpc-roto.png` });

  const usdcCell = balances['balance-USDC'];
  const othersOk = Object.entries(balances)
    .filter(([k]) => k.startsWith('balance-') && !k.includes('usd') && k !== 'balance-USDC')
    .map(([, v]) => v);
  check(
    'el token con RPC caido muestra "—" (no un 0 mentiroso)',
    usdcCell === '—',
    `USDC="${usdcCell}"`
  );
  check(
    'los demas tokens conservan su valor pese al fallo de USDC',
    othersOk.length > 0 && othersOk.every((v) => v !== '—'),
    JSON.stringify(othersOk)
  );
  state.breakUsdc = false;

  // ------------------------------------- allowance 0 -> el boton pide aprobar
  state.zeroAllowance = true;
  await amountInput.fill('1.5');
  await page.waitForTimeout(9000);
  const approveVisible = await swap.locator('[data-testid="approve-button"]').isVisible().catch(() => false);
  const approveText = (await swap.locator('[data-testid="approve-button"]').innerText().catch(() => '')).trim();
  const gatedText = (await swap.locator('[data-testid="swap-button"]').innerText().catch(() => '')).trim();
  await page.screenshot({ path: `${OUT}/07-falta-aprobar.png` });
  console.log(`  allowance=0: approve="${approveText}" swap="${gatedText}"`);
  check(
    'con allowance 0 aparece el boton de aprobar al spender del build',
    approveVisible && /approve/i.test(approveText),
    `approve="${approveText}"`
  );
  check(
    'con allowance 0 el boton principal dice que falta aprobar',
    /approval|aprob/i.test(gatedText),
    `swap="${gatedText}"`
  );
  state.zeroAllowance = false;

  // ------------- allowance ILEGIBLE -> no se habilita a ciegas, se dice el motivo
  state.breakAllowance = true;
  await amountInput.fill('1.25');
  await page.waitForTimeout(10000);
  const unknownText = (await swap.locator('[data-testid="swap-button"]').innerText().catch(() => '')).trim();
  const unknownDisabled = await swap.locator('[data-testid="swap-button"]').isDisabled().catch(() => false);
  console.log(`  allowance ilegible: boton="${unknownText}" disabled=${unknownDisabled}`);
  check(
    'allowance ilegible: el boton NO se habilita y dice el motivo',
    unknownDisabled && !/swap tokens/i.test(unknownText) && !!unknownText,
    `boton="${unknownText}" disabled=${unknownDisabled}`
  );
  state.breakAllowance = false;

  // ------------------------------------------- saldo insuficiente -> lo dice
  await amountInput.fill('999999');
  await page.waitForTimeout(2500);
  const overText = (await swap.locator('[data-testid="swap-button"]').innerText().catch(() => '')).trim();
  console.log(`  saldo insuficiente: boton="${overText}"`);
  check(
    'monto mayor al balance: el boton dice saldo insuficiente',
    /insufficient|insuficiente/i.test(overText),
    `boton="${overText}"`
  );
  await amountInput.fill('1');
  await page.waitForTimeout(4000);

  // ---------------------------- ambos agregadores caidos -> el boton dice por que
  state.breakAggregators = true;
  await amountInput.fill('2');
  await page.waitForTimeout(12000);
  const downText = (await swap.locator('[data-testid="swap-button"]').innerText().catch(() => '')).trim();
  await page.screenshot({ path: `${OUT}/05-agregadores-caidos.png` });
  console.log(`  ambos agregadores caidos: boton="${downText}"`);
  check(
    'con los dos agregadores caidos el boton dice el motivo (nunca mudo)',
    !!downText && !/enter amount|ingresa cantidad/i.test(downText),
    `boton="${downText}"`
  );
  state.breakAggregators = false;

  // ------------------------------------------------------- MAX reserva gas AVAX
  await amountInput.fill('');
  await page.waitForTimeout(500);
  await swap.locator('[data-testid="token-trigger-USDC"]').first().click();
  await page.waitForTimeout(800);
  await swap.locator('[data-testid="option-AVAX"]').first().click();
  await page.waitForTimeout(2500);
  const avaxBalanceText = (await swap.locator('[data-testid="balance-AVAX"]').first().innerText().catch(() => '')).trim();
  await swap.getByRole('button', { name: 'MAX', exact: true }).first().click();
  await page.waitForTimeout(1200);
  const maxValue = await amountInput.inputValue();
  console.log(`  MAX AVAX: balance=${avaxBalanceText} max=${maxValue}`);
  const balNum = parseFloat(avaxBalanceText);
  const maxNum = parseFloat(maxValue);
  check(
    'MAX de AVAX reserva gas (max < balance)',
    Number.isFinite(balNum) && Number.isFinite(maxNum) && maxNum < balNum,
    `balance=${balNum} max=${maxNum}`
  );
  await page.screenshot({ path: `${OUT}/06-max-avax.png` });

  console.log('\n---- RESUMEN ----');
  // -------------------------------- AVAX (nativo) -> UVD: sin approval, habilitado
  await amountInput.fill('0.1');
  await page.waitForTimeout(7000);
  const avaxBtn = (await swap.locator('[data-testid="swap-button"]').innerText().catch(() => '')).trim();
  const avaxDisabled = await swap.locator('[data-testid="swap-button"]').isDisabled().catch(() => true);
  const avaxApprove = await swap.locator('[data-testid="approve-button"]').isVisible().catch(() => false);
  const avaxOut = await swap.locator('input[type="number"]').nth(1).inputValue().catch(() => '');
  console.log(`  AVAX->UVD: boton="${avaxBtn}" disabled=${avaxDisabled} approve=${avaxApprove} out=${avaxOut}`);
  await page.screenshot({ path: `${OUT}/08-avax-uvd.png` });
  check(
    'AVAX->UVD (nativo): cotiza, sin boton de aprobar y el swap queda habilitado',
    !avaxDisabled && !avaxApprove && parseFloat(avaxOut) > 0,
    `boton="${avaxBtn}" out=${avaxOut}`
  );

  // --------------- RUTEO REAL SIN FIRMAR: USDC->UVD hasta la puerta de la wallet
  // Se vuelve al par que fallaba, se confirma que el boton queda HABILITADO y se hace
  // click: el provider mockeado registra el payload de eth_sendTransaction y lo rechaza
  // con 4001. Nada se firma ni se envia a la red.
  await amountInput.fill('');
  await page.waitForTimeout(500);
  await swap.locator('[data-testid="token-trigger-AVAX"]').first().click();
  await page.waitForTimeout(800);
  await swap.locator('[data-testid="option-USDC"]').first().click();
  await page.waitForTimeout(1200);
  await amountInput.fill('1');
  await page.waitForTimeout(9000);

  const liveOut = await swap.locator('input[type="number"]').nth(1).inputValue().catch(() => '');
  const liveBtn = (await swap.locator('[data-testid="swap-button"]').innerText().catch(() => '')).trim();
  const liveDisabled = await swap.locator('[data-testid="swap-button"]').isDisabled().catch(() => true);
  const liveApprove = await swap.locator('[data-testid="approve-button"]').isVisible().catch(() => false);
  console.log(`  USDC->UVD (ruteo real): out=${liveOut} boton="${liveBtn}" disabled=${liveDisabled} approve=${liveApprove}`);
  check(
    'USDC->UVD: amountOut > 0 y el boton queda habilitado para aprobar/swapear',
    parseFloat(liveOut) > 0 && (!liveDisabled || liveApprove),
    `out=${liveOut} boton="${liveBtn}" approve=${liveApprove}`
  );

  const target = liveApprove
    ? swap.locator('[data-testid="approve-button"]')
    : swap.locator('[data-testid="swap-button"]');
  await target.click({ timeout: 15000 }).catch(() => {});
  await page.waitForTimeout(6000);
  const sent = await page.evaluate(() => window.__sentTx || []);
  const lastSent = sent[sent.length - 1] || null;
  console.log(`  eth_sendTransaction interceptado: ${sent.length} · to=${lastSent && lastSent.to} · dataBytes=${lastSent && lastSent.data ? (lastSent.data.length - 2) / 2 : 0}`);
  check(
    'la UI llega a mandar la tx a la wallet con calldata real (interceptada, NUNCA firmada)',
    sent.length > 0 &&
      /^0x[0-9a-fA-F]{40}$/.test(String(lastSent && lastSent.to)) &&
      String(lastSent && lastSent.data || '').length > 10,
    `n=${sent.length} to=${lastSent && lastSent.to} dataBytes=${lastSent && lastSent.data ? (lastSent.data.length - 2) / 2 : 0}`
  );
  const rejectedMsg = (await swap.innerText().catch(() => '')).replace(/\s+/g, ' ');
  check(
    'el rechazo en la wallet se reporta en la UI (no queda colgada)',
    /cancel|rechaz|annul/i.test(rejectedMsg),
    rejectedMsg.slice(0, 160)
  );
  console.log(`  builds del agregador observados: ${JSON.stringify(builds.slice(-3))}`);
  check(
    'el calldata vino de un build REAL del agregador (HTTP 200 + bytes)',
    builds.some((b) => b.status === 200 && b.calldataBytes > 100),
    JSON.stringify(builds.slice(-2))
  );
  await page.screenshot({ path: `${OUT}/09-ruteo-real.png` });

  // ------------------------------------------------- movil 390px sin overflow
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(2500);
  const overflow = await page.evaluate(() => {
    const doc = document.documentElement;
    const widget = document.querySelector('[data-testid="swap-widget"]');
    return {
      docScroll: doc.scrollWidth,
      innerWidth: window.innerWidth,
      widgetScroll: widget ? widget.scrollWidth : 0,
      widgetClient: widget ? widget.clientWidth : 0,
    };
  });
  console.log(`  movil 390px: ${JSON.stringify(overflow)}`);
  await page.screenshot({ path: `${OUT}/10-movil-390.png`, fullPage: true });
  check(
    'movil 390px: la pagina no scrollea horizontalmente',
    overflow.docScroll <= overflow.innerWidth + 1,
    JSON.stringify(overflow)
  );
  check(
    'movil 390px: el widget entra en su ancho',
    overflow.widgetScroll <= overflow.widgetClient + 1,
    JSON.stringify(overflow)
  );

  // ------------------------------------------------------- errores de consola
  // Ruido ESPERADO: los fallos que el test provoca a proposito (530 de los agregadores,
  // RPC roto) y el ruido preexistente de thirdweb/analytics, que ya estaba en develop.
  const EXPECTED_NOISE = [
    /kyberswap|paraswap/i,
    /forced RPC failure|rpc down \(test\)/i,
    /530|503|Failed to load resource/i,
    /validateDOMNesting/i,
    /thirdweb|walletconnect|coinbase|c\.thirdweb\.com|in-app-wallet/i,
    /User rejected the request \(test mock\)/i,
    /mock provider: .* not supported/i,
    /favicon|manifest|analytics|Content Security Policy/i,
    /net::ERR_/i,
  ];
  // El /token monta el iframe embebido de DexScreener (src/pages/Token.js, ya en develop),
  // que escupe sus propios CORS/WebSocket 403 desde SU origen. No es codigo de la app:
  // se descuenta por la URL de origen del mensaje, no por el texto. `api.dexscreener.com`
  // (el que SI usa el widget para precios) queda fuera del filtro a proposito.
  const THIRD_PARTY_FRAME = /https:\/\/(io\.)?dexscreener\.com\//i;
  const unexpected = consoleErrors.filter(
    ({ text, where }) =>
      !THIRD_PARTY_FRAME.test(where) &&
      !THIRD_PARTY_FRAME.test(text) &&
      !EXPECTED_NOISE.some((re) => re.test(text))
  );
  console.log(`  console.error: ${consoleErrors.length} totales · ${unexpected.length} inesperados`);
  unexpected.forEach(({ text }) => console.log('    inesperado:', text));
  check(
    'sin errores de consola nuevos fuera del ruido esperado',
    unexpected.length === 0,
    unexpected.slice(0, 3).map((e) => e.text).join(' | ')
  );

  const failed = results.filter((r) => !r.pass);
  console.log(`${results.length - failed.length}/${results.length} checks OK`);
  failed.forEach((f) => console.log(`  FALLO: ${f.name} :: ${f.detail || ''}`));

  await browser.close();
  process.exit(failed.length ? 1 : 0);
})().catch((error) => {
  console.error('ERROR FATAL DEL TEST:', error && error.message);
  process.exit(2);
});
