import {
  TOKENS,
  SWAP_TOKENS,
  AVAX_SENTINEL,
  SWAP_CONFIG,
  getToken,
  erc20Address,
  priceAddress,
  isAddress,
  parseUnits,
  formatUnits,
  formatDisplay,
} from '../tokens';

describe('registro de tokens', () => {
  it('expone exactamente los 4 tokens decididos y todos existen en TOKENS', () => {
    expect(SWAP_TOKENS).toEqual(['AVAX', 'UVD', 'USDC', 'USDC.e']);
    SWAP_TOKENS.forEach((symbol) => expect(TOKENS[symbol]).toBeDefined());
  });

  it('tiene las direcciones y decimales medidos on-chain', () => {
    expect(TOKENS.UVD.address).toBe('0x4Ffe7e01832243e03668E090706F17726c26d6B2');
    expect(TOKENS.UVD.decimals).toBe(18);
    expect(TOKENS.USDC.address).toBe('0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E');
    expect(TOKENS.USDC.decimals).toBe(6);
    expect(TOKENS['USDC.e'].address).toBe('0xA7D7079b0FEaD91F3e65f86E8915Cb59c1a4C664');
    expect(TOKENS['USDC.e'].decimals).toBe(6);
    expect(TOKENS.AVAX.address).toBe(AVAX_SENTINEL);
    SWAP_TOKENS.forEach((symbol) => expect(isAddress(TOKENS[symbol].address)).toBe(true));
  });

  it('marca USDC.e como bridged para que el selector no lo confunda con el nativo', () => {
    expect(TOKENS['USDC.e'].bridged).toBe(true);
    expect(TOKENS['USDC.e'].label).toMatch(/bridged/i);
    expect(TOKENS.USDC.bridged).toBeUndefined();
  });

  it('AVAX es nativo: no tiene ERC20 que leer y toma el precio de WAVAX', () => {
    expect(erc20Address('AVAX')).toBeNull();
    expect(erc20Address('UVD')).toBe(TOKENS.UVD.address);
    expect(priceAddress('AVAX')).toBe('0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7');
    expect(priceAddress('UVD')).toBe(TOKENS.UVD.address);
  });

  it('getToken devuelve null para un símbolo desconocido, no explota', () => {
    expect(getToken('PEPE')).toBeNull();
    expect(getToken(undefined)).toBeNull();
  });

  it('el slippage por defecto son 100 bps = 1 %, dentro del rango válido', () => {
    expect(SWAP_CONFIG.defaultSlippageBps).toBe(100);
    expect(SWAP_CONFIG.minSlippageBps).toBeLessThanOrEqual(SWAP_CONFIG.defaultSlippageBps);
    expect(SWAP_CONFIG.maxSlippageBps).toBeGreaterThanOrEqual(SWAP_CONFIG.defaultSlippageBps);
  });
});

describe('SWAP_CONFIG.rpcUrl — default en código, override por env var', () => {
  const ENV = 'REACT_APP_AVALANCHE_RPC_URL';
  const original = process.env[ENV];
  const DEFAULT = 'https://api.avax.network/ext/bc/C/rpc';

  const loadConfig = (value) => {
    if (value === undefined) delete process.env[ENV];
    else process.env[ENV] = value;
    let config;
    jest.isolateModules(() => {
      config = require('../tokens').SWAP_CONFIG;
    });
    return config;
  };

  afterEach(() => {
    if (original === undefined) delete process.env[ENV];
    else process.env[ENV] = original;
  });

  it('sin env var usa el RPC público por defecto', () => {
    expect(loadConfig(undefined).rpcUrl).toBe(DEFAULT);
  });

  it('respeta un override válido', () => {
    expect(loadConfig('https://mi-rpc.example/ext/bc/C/rpc').rpcUrl).toBe(
      'https://mi-rpc.example/ext/bc/C/rpc'
    );
  });

  it('env var basura -> default + warning, NUNCA excepción al importar', () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
    expect(() => loadConfig('no-es-una-url')).not.toThrow();
    expect(loadConfig('no-es-una-url').rpcUrl).toBe(DEFAULT);
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });
});

describe('parseUnits', () => {
  it('convierte unidades legibles a mínimas con los decimales del token', () => {
    expect(parseUnits('1', 6)).toBe('1000000');
    expect(parseUnits('1.5', 6)).toBe('1500000');
    expect(parseUnits('1.5', 18)).toBe('1500000000000000000');
    expect(parseUnits('0.000001', 6)).toBe('1');
    expect(parseUnits('.5', 18)).toBe('500000000000000000');
    expect(parseUnits('1.', 6)).toBe('1000000');
  });

  it('no pierde precisión con montos grandes (donde un float sí la perdería)', () => {
    // 123456789.123456789012345678 en float pierde los últimos dígitos.
    expect(parseUnits('123456789.123456789012345678', 18)).toBe(
      '123456789123456789012345678'
    );
  });

  it('TRUNCA los decimales que sobran: nunca gasta más de lo tipeado', () => {
    expect(parseUnits('1.9999999', 6)).toBe('1999999');
    expect(parseUnits('0.0000009', 6)).toBe('0');
  });

  it('devuelve null (no tira) ante entradas inválidas', () => {
    ['', '.', '-5', '1,5', 'abc', '1e18', '0x1', null, undefined, '1.2.3'].forEach((bad) => {
      expect(parseUnits(bad, 6)).toBeNull();
    });
  });
});

describe('formatUnits / formatDisplay', () => {
  it('vuelve de unidades mínimas a legibles sin trailing zeros', () => {
    expect(formatUnits('1000000', 6)).toBe('1');
    expect(formatUnits('1500000', 6)).toBe('1.5');
    expect(formatUnits('1', 6)).toBe('0.000001');
    expect(formatUnits('0', 18)).toBe('0');
  });

  it('formatDisplay recorta a 6 decimales para pintar', () => {
    // amountOut real de Kyber para USDC->UVD (1 USDC), 18 decimales.
    expect(formatDisplay('1284451397726484202974409', 18)).toBe('1284451.397726');
    expect(formatDisplay('1000000', 6)).toBe('1');
  });

  it('NO muestra 0 para un valor chico pero real: cae a dígitos significativos', () => {
    // 1000 UVD -> 0.000106… AVAX. Truncar a 6 decimales daría "0.000106";
    // un valor 100x más chico daría "0" y eso sería un cero mentiroso.
    expect(formatDisplay('106284398908684', 18)).toBe('0.000106');
    const tiny = formatDisplay('1062843989086', 18); // 0.000001062…
    expect(tiny).not.toBe('0');
    expect(Number(tiny)).toBeGreaterThan(0);
  });

  it('devuelve null ante basura en vez de un 0 inventado', () => {
    expect(formatUnits('abc', 6)).toBeNull();
    expect(formatUnits(undefined, 6)).toBeNull();
    expect(formatDisplay(null, 18)).toBeNull();
  });
});
