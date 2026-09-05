// Registro ÚNICO de tokens del swap + configuración + conversión de unidades.
// Ninguna otra superficie (widget, selector, precios, providers) vuelve a tipear
// una dirección, un decimal o un endpoint. Contrato: docs/swap-fix-2026-08-28/CONTRATO.md §1

export const CHAIN_ID = 43114;

// Sentinel que los agregadores usan para el gas token nativo (AVAX).
export const AVAX_SENTINEL = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE';

// Solo se usa para precios: AVAX no tiene par propio en DexScreener, toma el de WAVAX.
export const WAVAX_ADDRESS = '0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7';

export const TOKENS = {
  AVAX: {
    symbol: 'AVAX',
    address: AVAX_SENTINEL,
    decimals: 18,
    native: true,
    priceKey: 'WAVAX',
    label: 'AVAX',
  },
  UVD: {
    symbol: 'UVD',
    address: '0x4Ffe7e01832243e03668E090706F17726c26d6B2',
    decimals: 6,
    native: false,
    priceKey: 'UVD',
    label: 'UVD',
  },
  USDC: {
    symbol: 'USDC',
    address: '0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E',
    decimals: 6,
    native: false,
    priceKey: 'USDC',
    label: 'USDC',
  },
  'USDC.e': {
    symbol: 'USDC.e',
    address: '0xA7D7079b0FEaD91F3e65f86E8915Cb59c1a4C664',
    decimals: 6,
    native: false,
    priceKey: 'USDC.e',
    // El selector debe mostrar la etiqueta: es el USDC puenteado, no el nativo.
    label: 'USDC.e (bridged)',
    bridged: true,
  },
};

export const SWAP_TOKENS = ['AVAX', 'UVD', 'USDC', 'USDC.e'];

const DEFAULT_RPC_URL = 'https://api.avax.network/ext/bc/C/rpc';

// Override por env var con prefijo del proyecto. Valor basura => default + warning,
// nunca excepción al importar (tumbaría el bundle entero en frío).
// CRA reemplaza `process.env.REACT_APP_*` en build time (igual que en services/api.js);
// una guarda `typeof process` dejaría el override muerto en el bundle del navegador.
function readRpcUrl() {
  const raw = process.env.REACT_APP_AVALANCHE_RPC_URL;
  if (!raw) return DEFAULT_RPC_URL;
  if (!/^https:\/\/\S+$/.test(raw)) {
    console.warn(
      `[swap/tokens] REACT_APP_AVALANCHE_RPC_URL inválida ("${raw}"): uso el default público.`
    );
    return DEFAULT_RPC_URL;
  }
  return raw;
}

export const SWAP_CONFIG = {
  chainId: CHAIN_ID,
  rpcUrl: readRpcUrl(),
  // Kyber respondió 0.33–0.41 s el 2026-08-28; 8 s es holgado. CONTRATO §7.
  requestTimeoutMs: 8000,
  priceCacheTtlMs: 60_000,
  defaultSlippageBps: 100, // 1%
  minSlippageBps: 1,
  maxSlippageBps: 2000, // 20%
  defaultDeadlineSec: 1200, // 20 min
  clientId: 'uvdweb',
};

export const MAX_UINT256 =
  '115792089237316195423570985008687907853269984665640564039457584007913129639935';

export function getToken(symbol) {
  return TOKENS[symbol] || null;
}

export function isNative(symbol) {
  return Boolean(TOKENS[symbol]?.native);
}

/** Dirección que se le manda al agregador (sentinel si es el token nativo). */
export function tokenAddress(symbol) {
  return TOKENS[symbol]?.address || null;
}

/** Dirección ERC-20 real para leer balance/allowance. `null` para el nativo. */
export function erc20Address(symbol) {
  const token = TOKENS[symbol];
  if (!token || token.native) return null;
  return token.address;
}

/** Dirección con la que se pide el precio USD (AVAX -> WAVAX). */
export function priceAddress(symbol) {
  const token = TOKENS[symbol];
  if (!token) return null;
  return token.native ? WAVAX_ADDRESS : token.address;
}

export function isAddress(value) {
  return typeof value === 'string' && /^0x[0-9a-fA-F]{40}$/.test(value);
}

export function sameAddress(a, b) {
  return isAddress(a) && isAddress(b) && a.toLowerCase() === b.toLowerCase();
}

// ---------------------------------------------------------------------------
// Unidades. ESTE es el único lugar donde se aplica un `decimals`.
// Todo en BigInt/strings: un float en la ruta del dinero pierde wei.
// ---------------------------------------------------------------------------

const DECIMAL_RE = /^(\d+(\.\d*)?|\.\d+)$/;

/**
 * "1.5" (unidades legibles) -> "1500000" (unidades mínimas), como string decimal.
 * Devuelve `null` si el string no es un decimal válido. Los decimales que sobran
 * se TRUNCAN (nunca se redondea hacia arriba: jamás gastar más de lo tipeado).
 */
export function parseUnits(amount, decimals) {
  if (typeof decimals !== 'number' || decimals < 0) return null;
  const s = String(amount ?? '').trim();
  if (!DECIMAL_RE.test(s)) return null;
  const [intPart = '', fracPart = ''] = s.split('.');
  const frac = (fracPart + '0'.repeat(decimals)).slice(0, decimals);
  const combined = `${intPart || '0'}${frac}`.replace(/^0+(?=\d)/, '');
  return combined === '' ? '0' : combined;
}

/** "1500000" + 6 -> "1.5". Precisión completa, sin trailing zeros. */
export function formatUnits(minimal, decimals) {
  const s = String(minimal ?? '').trim();
  if (!/^\d+$/.test(s) || typeof decimals !== 'number' || decimals < 0) return null;
  if (decimals === 0) return s.replace(/^0+(?=\d)/, '');
  const padded = s.padStart(decimals + 1, '0');
  const intPart = padded.slice(0, padded.length - decimals).replace(/^0+(?=\d)/, '');
  const frac = padded.slice(padded.length - decimals).replace(/0+$/, '');
  return frac ? `${intPart}.${frac}` : intPart;
}

/**
 * Igual que formatUnits pero recortado para pintar en pantalla.
 * Si truncar a `maxDecimals` daría "0" para un valor no nulo, se muestran
 * 4 dígitos desde el primer decimal significativo (UVD cotiza a ~1e-7).
 */
export function formatDisplay(minimal, decimals, maxDecimals = 6) {
  const full = formatUnits(minimal, decimals);
  if (full === null) return null;
  const [intPart, fracPart = ''] = full.split('.');
  if (!fracPart) return intPart;
  let cut = fracPart.slice(0, maxDecimals);
  if (/^0*$/.test(cut)) {
    const firstSignificant = fracPart.search(/[1-9]/);
    if (firstSignificant >= 0) cut = fracPart.slice(0, firstSignificant + 4);
  }
  cut = cut.replace(/0+$/, '');
  return cut ? `${intPart}.${cut}` : intPart;
}
