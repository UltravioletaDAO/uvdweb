import {
  getQuote,
  buildSwap,
  checkAllowance,
  buildApproval,
  SwapErrorCode,
  swapError,
} from '../aggregator';
import { TOKENS } from '../tokens';

const KYBER_ROUTER = '0x6131B5fae19EA4f9D964eAc0408E4408b66337b5';
const PARASWAP_ROUTER = '0xDEF171Fe48CF0115B1d80b88dc8eAB59176FEe57';
const PARASWAP_PROXY = '0x216b4b4ba9f3e719726886d34a177484278bfcae';
const OWNER = '0x52110a2Cc8B6bBf846101265edAAe34E753f3389'; // multisig público del DAO
const WAVAX = '0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7';

// --- fixtures calcados de las respuestas reales medidas el 2026-08-28 -------

const kyberQuoteOk = {
  code: 0,
  message: 'successfully',
  data: {
    routeSummary: {
      tokenIn: TOKENS.USDC.address,
      amountIn: '1000000',
      amountInUsd: '0.9991401926746988',
      tokenOut: TOKENS.UVD.address,
      amountOut: '1284451397726484202974409',
      amountOutUsd: '0.9963756408315853',
      gas: '653283',
      gasUsd: '0.0002274654059868662',
      route: [
        [
          { exchange: 'axima-v2/dodo-dpp', tokenOut: WAVAX },
          { exchange: 'arenadex-v2', tokenOut: TOKENS.UVD.address },
        ],
      ],
    },
    routerAddress: KYBER_ROUTER,
  },
};

const kyberBuildOk = {
  code: 0,
  message: 'successfully',
  data: {
    amountIn: '1000000',
    amountOut: '1284451397726484202974408',
    gas: '653283',
    gasUsd: '0.0002274654059868662',
    data: '0xe21fd0e9deadbeef',
    routerAddress: KYBER_ROUTER,
    transactionValue: '0',
  },
};

const paraswapQuoteOk = {
  priceRoute: {
    srcToken: TOKENS.USDC.address.toLowerCase(),
    srcDecimals: 6,
    srcAmount: '1000000',
    srcUSD: '0.9999780000',
    destToken: TOKENS.UVD.address.toLowerCase(),
    destDecimals: 18,
    destAmount: '1283512144513057300867020',
    destUSD: '0.9903900098',
    gasCostUSD: '0.002574',
    contractAddress: PARASWAP_ROUTER,
    tokenTransferProxy: PARASWAP_PROXY,
    side: 'SELL',
    network: 43114,
    bestRoute: [
      { swaps: [{ swapExchanges: [{ exchange: 'uniswapv3' }] }, { swapExchanges: [{ exchange: 'ArenaDexV2' }] }] },
    ],
  },
};

const paraswapBuildOk = {
  from: OWNER,
  to: PARASWAP_ROUTER,
  value: '0',
  data: '0xa94e78efdeadbeef',
  gasPrice: '1046848867',
  chainId: 43114,
};

// --- helpers de mock -------------------------------------------------------

const res = (status, body) => ({
  ok: status >= 200 && status < 300,
  status,
  text: async () => JSON.stringify(body),
});

/** Cada handler es [substring de la URL, respuesta o función]. Sin red real. */
function mockFetch(handlers) {
  const impl = jest.fn(async (url, init) => {
    const target = String(url);
    for (const [match, respond] of handlers) {
      if (target.includes(match)) {
        return typeof respond === 'function' ? respond(target, init) : respond;
      }
    }
    throw new TypeError(`unmocked request: ${target}`);
  });
  impl.hit = (needle) => impl.mock.calls.filter(([u]) => String(u).includes(needle)).length;
  return impl;
}

const KYBER_ROUTES = 'kyberswap.com/avalanche/api/v1/routes';
const KYBER_BUILD = 'route/build';
const PARASWAP_PRICES = 'api.paraswap.io/prices';
const PARASWAP_TX = 'api.paraswap.io/transactions';

const USDC_TO_UVD = { fromToken: 'USDC', toToken: 'UVD', amount: '1' };

// ---------------------------------------------------------------------------

describe('getQuote — camino feliz por Kyber', () => {
  it('normaliza el quote al contrato y NO llama a ParaSwap', async () => {
    const fetchImpl = mockFetch([[KYBER_ROUTES, res(200, kyberQuoteOk)]]);
    const quote = await getQuote(USDC_TO_UVD, { fetchImpl });

    expect(quote.ok).toBe(true);
    expect(quote.provider).toBe('kyber');
    expect(quote.fromToken).toBe('USDC');
    expect(quote.toToken).toBe('UVD');
    expect(quote.amountIn).toBe('1000000');
    expect(quote.amountInFormatted).toBe('1');
    expect(quote.amountOut).toBe('1284451397726484202974409');
    expect(quote.amountOutFormatted).toBe('1284451.397726');
    expect(quote.amountInUsd).toBeCloseTo(0.99914, 5);
    expect(quote.amountOutUsd).toBeCloseTo(0.996376, 5);
    expect(quote.priceImpactPct).toBeCloseTo(-0.2767, 3);
    expect(quote.gasUsd).toBeCloseTo(0.000227, 6);
    expect(quote.routeLabel).toBe('axima-v2/dodo-dpp → arenadex-v2');
    expect(quote.raw).toEqual(kyberQuoteOk.data.routeSummary); // opaco, intacto
    expect(quote.fetchedAt).toBeGreaterThan(0);
    expect(fetchImpl.hit('paraswap')).toBe(0);
  });

  it('manda el header x-client-id y el amountIn en unidades mínimas', async () => {
    const fetchImpl = mockFetch([[KYBER_ROUTES, res(200, kyberQuoteOk)]]);
    await getQuote(USDC_TO_UVD, { fetchImpl });

    const [url, init] = fetchImpl.mock.calls[0];
    expect(url).toContain('amountIn=1000000'); // 1 USDC con 6 decimales
    expect(url).toContain(`tokenIn=${encodeURIComponent(TOKENS.USDC.address)}`);
    expect(init.headers['x-client-id']).toBe('uvdweb');
  });

  it('usa el sentinel de AVAX para el token nativo', async () => {
    const fetchImpl = mockFetch([[KYBER_ROUTES, res(200, kyberQuoteOk)]]);
    await getQuote({ fromToken: 'AVAX', toToken: 'UVD', amount: '0.01' }, { fetchImpl });
    expect(fetchImpl.mock.calls[0][0]).toContain(
      encodeURIComponent('0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE')
    );
  });
});

describe('getQuote — cascada de providers', () => {
  it('cae a ParaSwap si Kyber devuelve 5xx', async () => {
    const fetchImpl = mockFetch([
      [KYBER_ROUTES, res(503, { message: 'service unavailable' })],
      [PARASWAP_PRICES, res(200, paraswapQuoteOk)],
    ]);
    const quote = await getQuote(USDC_TO_UVD, { fetchImpl });

    expect(quote.ok).toBe(true);
    expect(quote.provider).toBe('paraswap');
    expect(quote.amountOut).toBe('1283512144513057300867020');
    expect(quote.routeLabel).toBe('uniswapv3 → ArenaDexV2');
  });

  it('cae a ParaSwap si Kyber no encuentra ruta (4008)', async () => {
    const fetchImpl = mockFetch([
      [KYBER_ROUTES, res(400, { code: 4008, message: 'route not found' })],
      [PARASWAP_PRICES, res(200, paraswapQuoteOk)],
    ]);
    const quote = await getQuote(USDC_TO_UVD, { fetchImpl });
    expect(quote.provider).toBe('paraswap');
    expect(fetchImpl.hit(PARASWAP_PRICES)).toBe(1);
  });

  it('NO cae a ParaSwap ante un error del usuario (4009 monto muy grande)', async () => {
    const fetchImpl = mockFetch([
      [KYBER_ROUTES, res(400, { code: 4009, message: 'amountIn is greater than max allowed' })],
      [PARASWAP_PRICES, res(200, paraswapQuoteOk)],
    ]);
    const quote = await getQuote(USDC_TO_UVD, { fetchImpl });

    expect(quote.ok).toBe(false);
    expect(quote.error.code).toBe(SwapErrorCode.AMOUNT_TOO_LARGE);
    expect(quote.error.retryable).toBe(false);
    expect(fetchImpl.hit(PARASWAP_PRICES)).toBe(0); // el fallback fallaría igual
  });

  it('NO cae a ParaSwap ante 4011 token inexistente', async () => {
    const fetchImpl = mockFetch([
      [KYBER_ROUTES, res(400, { code: 4011, message: 'token not found' })],
      [PARASWAP_PRICES, res(200, paraswapQuoteOk)],
    ]);
    const quote = await getQuote(USDC_TO_UVD, { fetchImpl });
    expect(quote.error.code).toBe(SwapErrorCode.TOKEN_NOT_FOUND);
    expect(fetchImpl.hit(PARASWAP_PRICES)).toBe(0);
  });

  it('distingue 4000 por campo: amountIn -> monto, tokenIn -> token', async () => {
    const withViolation = (field) =>
      mockFetch([
        [KYBER_ROUTES, res(400, { code: 4000, message: 'bad request', details: [{ fieldViolations: [{ field, description: 'invalid' }] }] })],
        [PARASWAP_PRICES, res(200, paraswapQuoteOk)],
      ]);
    const byAmount = await getQuote(USDC_TO_UVD, { fetchImpl: withViolation('amountIn') });
    expect(byAmount.error.code).toBe(SwapErrorCode.AMOUNT_TOO_SMALL);
    const byToken = await getQuote(USDC_TO_UVD, { fetchImpl: withViolation('tokenOut') });
    expect(byToken.error.code).toBe(SwapErrorCode.TOKEN_NOT_FOUND);
  });

  it('con los DOS caídos devuelve PROVIDER_DOWN accionable — el botón nunca queda mudo', async () => {
    const fetchImpl = jest.fn(async () => {
      throw new TypeError('fetch failed');
    });
    const quote = await getQuote(USDC_TO_UVD, { fetchImpl });

    expect(quote.ok).toBe(false);
    expect(quote.error.code).toBe(SwapErrorCode.PROVIDER_DOWN);
    expect(quote.error.i18nKey).toBe('swap.err.provider_down');
    expect(quote.error.retryable).toBe(true);
    expect(quote.error.detail.kyber.code).toBe(SwapErrorCode.PROVIDER_DOWN);
    expect(quote.error.detail.paraswap.code).toBe(SwapErrorCode.PROVIDER_DOWN);
  });

  it('prefiere el error del provider que SÍ contestó', async () => {
    const fetchImpl = mockFetch([
      [KYBER_ROUTES, () => Promise.reject(new TypeError('fetch failed'))],
      [PARASWAP_PRICES, res(404, { error: 'No routes found with enough liquidity' })],
    ]);
    const quote = await getQuote(USDC_TO_UVD, { fetchImpl });
    expect(quote.error.code).toBe(SwapErrorCode.NO_ROUTE);
  });

  it('si vencen los dos timeouts devuelve TIMEOUT, no PROVIDER_DOWN', async () => {
    const hang = jest.fn(
      (url, init) =>
        new Promise((_, reject) => {
          init.signal.addEventListener('abort', () => {
            const error = new Error('aborted');
            error.name = 'AbortError';
            reject(error);
          });
        })
    );
    const quote = await getQuote(USDC_TO_UVD, { fetchImpl: hang, timeoutMs: 20 });
    expect(quote.error.code).toBe(SwapErrorCode.TIMEOUT);
    expect(quote.error.retryable).toBe(true);
  });

  it('relanza AbortError cuando cancela el llamador (no lo traga como error del provider)', async () => {
    const controller = new AbortController();
    const hang = jest.fn(
      (url, init) =>
        new Promise((_, reject) => {
          init.signal.addEventListener('abort', () => {
            const error = new Error('aborted');
            error.name = 'AbortError';
            reject(error);
          });
        })
    );
    const pending = getQuote(USDC_TO_UVD, { fetchImpl: hang, signal: controller.signal });
    controller.abort();
    await expect(pending).rejects.toThrow(/abort/i);
  });
});

describe('getQuote — validación local (sin tocar la red)', () => {
  const noNetwork = jest.fn(async () => {
    throw new Error('no debería llamar a la red');
  });

  it.each([
    ['token de origen desconocido', { fromToken: 'PEPE', toToken: 'UVD', amount: '1' }, SwapErrorCode.TOKEN_NOT_FOUND],
    ['token de destino desconocido', { fromToken: 'UVD', toToken: 'PEPE', amount: '1' }, SwapErrorCode.TOKEN_NOT_FOUND],
    ['mismo token', { fromToken: 'UVD', toToken: 'UVD', amount: '1' }, SwapErrorCode.NO_ROUTE],
    ['monto vacío', { fromToken: 'USDC', toToken: 'UVD', amount: '' }, SwapErrorCode.AMOUNT_TOO_SMALL],
    ['monto cero', { fromToken: 'USDC', toToken: 'UVD', amount: '0' }, SwapErrorCode.AMOUNT_TOO_SMALL],
    ['monto negativo', { fromToken: 'USDC', toToken: 'UVD', amount: '-5' }, SwapErrorCode.AMOUNT_TOO_SMALL],
    ['monto con coma', { fromToken: 'USDC', toToken: 'UVD', amount: '1,5' }, SwapErrorCode.AMOUNT_TOO_SMALL],
    ['monto que trunca a cero', { fromToken: 'USDC', toToken: 'UVD', amount: '0.0000001' }, SwapErrorCode.AMOUNT_TOO_SMALL],
  ])('%s -> %s sin pegarle a ningún provider', async (_label, params, code) => {
    const quote = await getQuote(params, { fetchImpl: noNetwork });
    expect(quote.ok).toBe(false);
    expect(quote.error.code).toBe(code);
    expect(quote.error.i18nKey).toBe(`swap.err.${code.toLowerCase()}`);
    expect(noNetwork).not.toHaveBeenCalled();
  });
});

describe('buildSwap', () => {
  const quoteVia = async (fetchImpl, params = USDC_TO_UVD) => getQuote(params, { fetchImpl });

  it('en Kyber el spender ES el router y el value sale de transactionValue', async () => {
    const fetchImpl = mockFetch([
      [KYBER_BUILD, res(200, kyberBuildOk)],
      [KYBER_ROUTES, res(200, kyberQuoteOk)],
    ]);
    const quote = await quoteVia(fetchImpl);
    const build = await buildSwap({ quote, sender: OWNER, slippageBps: 100 }, { fetchImpl });

    expect(build.ok).toBe(true);
    expect(build.provider).toBe('kyber');
    expect(build.to).toBe(KYBER_ROUTER);
    expect(build.spender).toBe(KYBER_ROUTER);
    expect(build.value).toBe('0');
    expect(build.data).toBe('0xe21fd0e9deadbeef');
    expect(build.amountOutFormatted).toBe('1284451.397726');
  });

  it('manda slippageTolerance en BPS y el routeSummary intacto', async () => {
    const fetchImpl = mockFetch([
      [KYBER_BUILD, res(200, kyberBuildOk)],
      [KYBER_ROUTES, res(200, kyberQuoteOk)],
    ]);
    const quote = await quoteVia(fetchImpl);
    await buildSwap({ quote, sender: OWNER, slippageBps: 250 }, { fetchImpl });

    const buildCall = fetchImpl.mock.calls.find(([u]) => String(u).includes(KYBER_BUILD));
    const body = JSON.parse(buildCall[1].body);
    expect(body.slippageTolerance).toBe(250);
    expect(body.routeSummary).toEqual(kyberQuoteOk.data.routeSummary);
    expect(body.sender).toBe(OWNER);
    expect(body.recipient).toBe(OWNER);
    expect(body.source).toBe('uvdweb');
    expect(body.deadline).toBeGreaterThan(Math.floor(Date.now() / 1000));
  });

  it('AVAX nativo: el value lo dice la API, no se calcula', async () => {
    const fetchImpl = mockFetch([
      [KYBER_BUILD, res(200, { ...kyberBuildOk, data: { ...kyberBuildOk.data, transactionValue: '1000000000000000000' } })],
      [KYBER_ROUTES, res(200, kyberQuoteOk)],
    ]);
    const quote = await quoteVia(fetchImpl, { fromToken: 'AVAX', toToken: 'UVD', amount: '1' });
    const build = await buildSwap({ quote, sender: OWNER }, { fetchImpl });
    expect(build.value).toBe('1000000000000000000');
  });

  it('en ParaSwap el spender es el tokenTransferProxy, NUNCA el `to` de la tx', async () => {
    const fetchImpl = mockFetch([
      [KYBER_ROUTES, res(503, { message: 'down' })],
      [PARASWAP_PRICES, res(200, paraswapQuoteOk)],
      [PARASWAP_TX, res(200, paraswapBuildOk)],
    ]);
    const quote = await quoteVia(fetchImpl);
    const build = await buildSwap({ quote, sender: OWNER, slippageBps: 100 }, { fetchImpl });

    expect(build.provider).toBe('paraswap');
    expect(build.to).toBe(PARASWAP_ROUTER);
    expect(build.spender).toBe(PARASWAP_PROXY);
    // Aprobar el `to` dejaría el swap revirtiendo con la allowance "aprobada".
    expect(build.spender.toLowerCase()).not.toBe(build.to.toLowerCase());
  });

  it('si el build del provider del quote falla, re-cotiza ENTERO con el otro', async () => {
    const fetchImpl = mockFetch([
      [KYBER_BUILD, res(500, { message: 'build down' })],
      [KYBER_ROUTES, res(200, kyberQuoteOk)],
      [PARASWAP_PRICES, res(200, paraswapQuoteOk)],
      [PARASWAP_TX, res(200, paraswapBuildOk)],
    ]);
    const quote = await quoteVia(fetchImpl);
    const build = await buildSwap({ quote, sender: OWNER }, { fetchImpl });

    expect(build.ok).toBe(true);
    expect(build.provider).toBe('paraswap');
    // Re-cotizó: jamás se le pasa un routeSummary de Kyber a ParaSwap.
    expect(fetchImpl.hit(PARASWAP_PRICES)).toBe(1);
    const txCall = fetchImpl.mock.calls.find(([u]) => String(u).includes(PARASWAP_TX));
    expect(JSON.parse(txCall[1].body).priceRoute).toEqual(paraswapQuoteOk.priceRoute);
  });

  it.each([[0], [2001], [1.5], ['100'], [null]])(
    'rechaza slippageBps inválido (%p) con un mensaje que dice bps',
    async (slippageBps) => {
      const fetchImpl = mockFetch([[KYBER_ROUTES, res(200, kyberQuoteOk)]]);
      const quote = await quoteVia(fetchImpl);
      const build = await buildSwap({ quote, sender: OWNER, slippageBps }, { fetchImpl });
      expect(build.ok).toBe(false);
      expect(build.error.message).toMatch(/basis points/);
      expect(fetchImpl.hit(KYBER_BUILD)).toBe(0);
    }
  );

  it('rechaza sender inválido y quote que no salió de getQuote', async () => {
    const fetchImpl = mockFetch([[KYBER_ROUTES, res(200, kyberQuoteOk)]]);
    const quote = await quoteVia(fetchImpl);
    expect((await buildSwap({ quote, sender: '0x123' }, { fetchImpl })).error.message).toMatch(/sender/i);
    expect((await buildSwap({ quote: { ok: true, provider: 'odos', raw: {} }, sender: OWNER }, { fetchImpl })).error.message).toMatch(/getQuote/);
  });
});

describe('checkAllowance', () => {
  const rpcResult = (hex) => res(200, { jsonrpc: '2.0', id: 1, result: hex });
  const RPC = 'avax.network';

  it('AVAX nativo no necesita allowance y no toca el RPC', async () => {
    const fetchImpl = jest.fn();
    const result = await checkAllowance(
      { tokenSymbol: 'AVAX', owner: OWNER, spender: KYBER_ROUTER, amount: '1' },
      { fetchImpl }
    );
    expect(result.ok).toBe(true);
    expect(result.sufficient).toBe(true);
    expect(result.native).toBe(true);
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it('compara la allowance contra el monto pedido con los decimales del token', async () => {
    const fetchImpl = mockFetch([[RPC, rpcResult(`0x${(2500000).toString(16)}`)]]);
    const enough = await checkAllowance(
      { tokenSymbol: 'USDC', owner: OWNER, spender: KYBER_ROUTER, amount: '1' },
      { fetchImpl }
    );
    expect(enough.allowance).toBe('2500000');
    expect(enough.needed).toBe('1000000');
    expect(enough.sufficient).toBe(true);

    const short = await checkAllowance(
      { tokenSymbol: 'USDC', owner: OWNER, spender: KYBER_ROUTER, amount: '3' },
      { fetchImpl }
    );
    expect(short.sufficient).toBe(false);
  });

  it('llama a allowance(owner,spender) contra el contrato del token', async () => {
    const fetchImpl = mockFetch([[RPC, rpcResult('0x0')]]);
    await checkAllowance({ tokenSymbol: 'UVD', owner: OWNER, spender: KYBER_ROUTER }, { fetchImpl });
    const body = JSON.parse(fetchImpl.mock.calls[0][1].body);
    expect(body.method).toBe('eth_call');
    expect(body.params[0].to).toBe(TOKENS.UVD.address);
    expect(body.params[0].data).toBe(
      `0xdd62ed3e${OWNER.slice(2).toLowerCase().padStart(64, '0')}${KYBER_ROUTER.slice(2).toLowerCase().padStart(64, '0')}`
    );
  });

  it('si el RPC falla devuelve error tipado y NUNCA una allowance 0 mentirosa', async () => {
    const failing = jest.fn(async () => {
      throw new TypeError('fetch failed');
    });
    const result = await checkAllowance(
      { tokenSymbol: 'USDC', owner: OWNER, spender: KYBER_ROUTER, amount: '1' },
      { fetchImpl: failing }
    );
    expect(result.ok).toBe(false);
    expect(result.error.code).toBe(SwapErrorCode.PROVIDER_DOWN);
    expect(result.allowance).toBeUndefined();
    expect(result.sufficient).toBeUndefined();
  });

  it('si el RPC responde con error JSON-RPC tampoco inventa un 0', async () => {
    const fetchImpl = mockFetch([[RPC, res(200, { jsonrpc: '2.0', id: 1, error: { message: 'execution reverted' } })]]);
    const result = await checkAllowance(
      { tokenSymbol: 'USDC', owner: OWNER, spender: KYBER_ROUTER, amount: '1' },
      { fetchImpl }
    );
    expect(result.ok).toBe(false);
    expect(result.allowance).toBeUndefined();
  });

  it('distingue una allowance legítimamente cero de un fallo', async () => {
    const fetchImpl = mockFetch([[RPC, rpcResult('0x0')]]);
    const result = await checkAllowance(
      { tokenSymbol: 'USDC', owner: OWNER, spender: KYBER_ROUTER, amount: '1' },
      { fetchImpl }
    );
    expect(result.ok).toBe(true);
    expect(result.allowance).toBe('0');
    expect(result.sufficient).toBe(false);
  });
});

describe('buildApproval', () => {
  it('codifica approve(spender, max) contra el contrato del token', () => {
    const approval = buildApproval({ tokenSymbol: 'USDC', spender: KYBER_ROUTER, amount: 'max' });
    expect(approval.ok).toBe(true);
    expect(approval.to).toBe(TOKENS.USDC.address);
    expect(approval.value).toBe('0');
    expect(approval.data).toBe(
      `0x095ea7b3${KYBER_ROUTER.slice(2).toLowerCase().padStart(64, '0')}${'f'.repeat(64)}`
    );
  });

  it('codifica un monto exacto con los decimales del token', () => {
    const approval = buildApproval({ tokenSymbol: 'USDC', spender: KYBER_ROUTER, amount: '1.5' });
    expect(approval.data.slice(-64)).toBe((1500000).toString(16).padStart(64, '0'));
  });

  it('rechaza AVAX (no hay approve para el gas token) y spender inválido', () => {
    expect(buildApproval({ tokenSymbol: 'AVAX', spender: KYBER_ROUTER }).ok).toBe(false);
    expect(buildApproval({ tokenSymbol: 'USDC', spender: 'no-es-address' }).ok).toBe(false);
    expect(buildApproval({ tokenSymbol: 'PEPE', spender: KYBER_ROUTER }).error.code).toBe(
      SwapErrorCode.TOKEN_NOT_FOUND
    );
  });
});

describe('SwapError', () => {
  it('los 10 códigos del contrato tienen i18nKey en el namespace swap.err', () => {
    const codes = Object.keys(SwapErrorCode);
    expect(codes).toHaveLength(10);
    codes.forEach((code) => {
      expect(swapError(code, 'x').i18nKey).toBe(`swap.err.${code.toLowerCase()}`);
    });
  });

  it('un código desconocido cae en UNKNOWN en vez de dejar el botón sin texto', () => {
    const error = swapError('INVENTADO', 'algo raro');
    expect(error.code).toBe(SwapErrorCode.UNKNOWN);
    expect(error.i18nKey).toBe('swap.err.unknown');
    expect(error.message).toBe('algo raro');
  });
});
