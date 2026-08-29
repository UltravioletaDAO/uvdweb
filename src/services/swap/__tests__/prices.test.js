import { getUsdPrices, priceUsdFor, clearPriceCache } from '../prices';
import { TOKENS, WAVAX_ADDRESS } from '../tokens';

const res = (status, body) => ({
  ok: status >= 200 && status < 300,
  status,
  text: async () => JSON.stringify(body),
});

const pair = (address, symbol, priceUsd, liquidityUsd, dexId = 'arenatrade') => ({
  chainId: 'avalanche',
  dexId,
  baseToken: { address, symbol },
  quoteToken: { address: WAVAX_ADDRESS, symbol: 'WAVAX' },
  priceUsd,
  liquidity: { usd: liquidityUsd },
});

// Calcado de la respuesta real de DexScreener del 2026-08-28.
const dexscreenerOk = [
  pair(TOKENS.UVD.address, 'UVD', '0.0000007786', 5295.53),
  pair(WAVAX_ADDRESS, 'WAVAX', '7.28', 9803352.76, 'pharaoh'),
  pair(TOKENS.USDC.address, 'USDC', '0.9975', 37931.36, 'uniswap'),
  pair(TOKENS['USDC.e'].address, 'USDC.e', '1.00050', 481098.27, 'traderjoe'),
];

beforeEach(() => clearPriceCache());

describe('getUsdPrices', () => {
  it('resuelve los 4 tokens en UNA sola llamada y AVAX toma el precio de WAVAX', async () => {
    const fetchImpl = jest.fn(async () => res(200, dexscreenerOk));
    const prices = await getUsdPrices(['AVAX', 'UVD', 'USDC', 'USDC.e'], { fetchImpl });

    expect(fetchImpl).toHaveBeenCalledTimes(1);
    expect(prices).toEqual({ AVAX: 7.28, UVD: 7.786e-7, USDC: 0.9975, 'USDC.e': 1.0005 });
    expect(fetchImpl.mock.calls[0][0]).toContain(WAVAX_ADDRESS.toLowerCase());
  });

  it('cachea 60 s: la segunda llamada no vuelve a la red', async () => {
    const fetchImpl = jest.fn(async () => res(200, dexscreenerOk));
    await getUsdPrices(['UVD'], { fetchImpl });
    await getUsdPrices(['UVD'], { fetchImpl });
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });

  it('se queda con el par de MAYOR liquidez del token', async () => {
    const fetchImpl = jest.fn(async () =>
      res(200, [
        pair(TOKENS.UVD.address, 'UVD', '0.0000009999', 12, 'pool-flaco'),
        pair(TOKENS.UVD.address, 'UVD', '0.0000007786', 5295.53, 'pool-gordo'),
      ])
    );
    expect(await priceUsdFor('UVD', { fetchImpl })).toBe(7.786e-7);
  });

  it('un token que no resuelve devuelve null, NUNCA 0', async () => {
    const fetchImpl = jest.fn(async () => res(200, [dexscreenerOk[0]]));
    const prices = await getUsdPrices(['UVD', 'USDC'], { fetchImpl });
    expect(prices.UVD).toBe(7.786e-7);
    expect(prices.USDC).toBeNull();
    expect(prices.USDC).not.toBe(0);
  });

  it('descarta precios basura (0, negativos, no numéricos) en vez de pintarlos', async () => {
    const fetchImpl = jest.fn(async () =>
      res(200, [
        pair(TOKENS.UVD.address, 'UVD', '0', 5295.53),
        pair(TOKENS.USDC.address, 'USDC', 'N/A', 37931.36),
        pair(TOKENS['USDC.e'].address, 'USDC.e', '-1', 481098.27),
      ])
    );
    const prices = await getUsdPrices(['UVD', 'USDC', 'USDC.e'], { fetchImpl });
    expect(prices).toEqual({ UVD: null, USDC: null, 'USDC.e': null });
  });

  it('si DexScreener se cae devuelve null sin tirar: un fallo de precios no bloquea el swap', async () => {
    const fetchImpl = jest.fn(async () => {
      throw new TypeError('fetch failed');
    });
    await expect(getUsdPrices(['UVD'], { fetchImpl })).resolves.toEqual({ UVD: null });
  });

  it('con la red caída sirve el último precio conocido antes que un null', async () => {
    const ok = jest.fn(async () => res(200, dexscreenerOk));
    await getUsdPrices(['UVD'], { fetchImpl: ok });

    // Se vence el cache a mano y se cae la red: el valor viejo sobrevive.
    const down = jest.fn(async () => {
      throw new TypeError('fetch failed');
    });
    jest.spyOn(Date, 'now').mockReturnValue(Date.now() + 120000);
    const prices = await getUsdPrices(['UVD'], { fetchImpl: down });
    expect(down).toHaveBeenCalled();
    expect(prices.UVD).toBe(7.786e-7);
    Date.now.mockRestore();
  });

  it('un HTTP 500 no rompe: null y sigue', async () => {
    const fetchImpl = jest.fn(async () => res(500, { error: 'boom' }));
    await expect(getUsdPrices(['UVD'], { fetchImpl })).resolves.toEqual({ UVD: null });
  });
});

describe('priceUsdFor', () => {
  it('devuelve el precio de un token suelto', async () => {
    const fetchImpl = jest.fn(async () => res(200, dexscreenerOk));
    expect(await priceUsdFor('AVAX', { fetchImpl })).toBe(7.28);
  });

  it('devuelve null para un símbolo desconocido sin tocar la red', async () => {
    const fetchImpl = jest.fn();
    expect(await priceUsdFor('PEPE', { fetchImpl })).toBeNull();
    expect(fetchImpl).not.toHaveBeenCalled();
  });
});
