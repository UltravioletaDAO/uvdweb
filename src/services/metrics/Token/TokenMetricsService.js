/* global BigInt */
const PAIR_ID = "0xbff3e2238e545c76f705560bd1677bd9c0e9dab4";
const CHAIN_ID = "avalanche";
const TOKEN_ADDRESS = "0x4Ffe7e01832243e03668E090706F17726c26d6B2";

async function fetchBurnedTokens() {
  const zeroAddress = "0x0000000000000000000000000000000000000000";
  const deadAddress = "0x000000000000000000000000000000000000dEaD";

  try {
    // ERC20 balanceOf function signature
    const balanceOfSignature = "0x70a08231"; // balanceOf(address)

    // Prepare the data for both calls
    const deadAddressData = balanceOfSignature + deadAddress.slice(2).padStart(64, '0');
    const zeroAddressData = balanceOfSignature + zeroAddress.slice(2).padStart(64, '0');

    // Use Avalanche public RPC
    const rpcUrl = "https://api.avax.network/ext/bc/C/rpc";

    // Make RPC calls to get balances
    const [deadResponse, zeroResponse] = await Promise.all([
      fetch(rpcUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'eth_call',
          params: [{
            to: TOKEN_ADDRESS,
            data: deadAddressData
          }, 'latest']
        })
      }),
      fetch(rpcUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 2,
          method: 'eth_call',
          params: [{
            to: TOKEN_ADDRESS,
            data: zeroAddressData
          }, 'latest']
        })
      })
    ]);

    const [deadData, zeroData] = await Promise.all([
      deadResponse.json(),
      zeroResponse.json()
    ]);

    let deadTokens = 0;
    let zeroTokens = 0;

    // Parse the hex results and convert from wei to tokens (divide by 1e18)
    if (deadData?.result) {
      // BUG-14: parseInt pierde precisión con uint256 (supera Number.MAX_SAFE_INTEGER).
      // BigInt parsea el hex exacto; dividimos primero en la escala de 1e14 con BigInt
      // para luego dividir el resto (1e4) en float — mantenemos 4 decimales.
      deadTokens = Number(BigInt(deadData.result) / 10n ** 14n) / 10000;
    }

    if (zeroData?.result) {
      zeroTokens = Number(BigInt(zeroData.result) / 10n ** 14n) / 10000;
    }

    // Updated known minimum value - as of last manual check
    const knownMinimumDead = 17718151; // Updated minimum in dead address
    const knownMinimumZero = 0;

    // Ensure we never show less than the known minimum (in case of RPC errors)
    const finalDeadTokens = Math.max(deadTokens, knownMinimumDead);
    const finalZeroTokens = Math.max(zeroTokens, knownMinimumZero);

    if (process.env.REACT_APP_DEBUG_ENABLED === 'true') {
      console.log('Burned tokens fetched:', {
        dead: finalDeadTokens.toLocaleString(),
        zero: finalZeroTokens.toLocaleString(),
        total: (finalDeadTokens + finalZeroTokens).toLocaleString()
      });
    }

    return {
      zeroAddress: finalZeroTokens,
      deadAddress: finalDeadTokens,
      total: finalZeroTokens + finalDeadTokens
    };
  } catch (error) {
    console.error("Error fetching burned tokens:", error);
    // Return known minimum values
    const knownMinimumDead = 17718151;
    return {
      zeroAddress: 0,
      deadAddress: knownMinimumDead,
      total: knownMinimumDead
    };
  }
}

// BUG-13: helper que intenta fetch con AbortController (timeout 8s).
// Si falla, reintenta sin proxy como fallback; si ese también falla, retorna null.
async function fetchWithFallback(proxyUrl, directUrl) {
  const attempt = async (url) => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 8000);
    try {
      const res = await fetch(url, { signal: controller.signal });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } finally {
      clearTimeout(timer);
    }
  };

  try {
    return await attempt(proxyUrl);
  } catch (proxyErr) {
    if (process.env.REACT_APP_DEBUG_ENABLED === 'true') {
      console.warn('[TokenMetrics] proxy fetch failed, trying direct:', proxyErr.message);
    }
    if (!directUrl) return null;
    try {
      return await attempt(directUrl);
    } catch (directErr) {
      if (process.env.REACT_APP_DEBUG_ENABLED === 'true') {
        console.warn('[TokenMetrics] direct fetch also failed:', directErr.message);
      }
      return null;
    }
  }
}

export async function getTokenData() {

  const url1Proxy = `https://corsproxy.io/?https://api.dexscreener.com/latest/dex/pairs/${CHAIN_ID}/${PAIR_ID}`;
  // BUG-13: fetch con timeout + degradado limpio a null si corsproxy falla.
  // Sin fallback directo: los endpoints de DexScreener no envían headers CORS al browser
  // (generaban errores CORS en consola). Un proxy en el backend es el fix real (ver plan backend).
  const data = await fetchWithFallback(url1Proxy, null);
  const pair = data?.pair || data?.pairs?.[0] || {};

  const url2Proxy = `https://corsproxy.io/?https://io.dexscreener.com/dex/pair-details/v3/${CHAIN_ID}/${PAIR_ID}`;
  const details = await fetchWithFallback(url2Proxy, null);

  const url3 = `https://cdn.routescan.io/api/evm/43114/erc20-transfers?count=true&limit=50&tokenAddress=${TOKEN_ADDRESS}`;
  const res3 = await fetch(url3);
  const transactionsData = await res3.json();

  // Fetch burned tokens from both addresses
  const burnedTokens = await fetchBurnedTokens();

  // La liquidez total del pool incluye ambos lados (UVD + AVAX)
  // Pero solo queremos mostrar el valor de los AVAX (la mitad del pool)
  const liquidityTotalUsd = pair.liquidity?.usd || "0";
  const liquidityAvax = pair.liquidity?.quote || "0"; // Cantidad de AVAX en el pool
  const liquidityUvd = pair.liquidity?.base || "0"; // Cantidad de UVD en el pool
  
  // El valor real de liquidez es solo el lado de AVAX (aproximadamente la mitad del total)
  // Esto es lo que realmente respalda el valor del token
  const liquidityUsd = parseFloat(liquidityTotalUsd) / 2;

  return {
    priceNative: pair.priceNative || "NA",
    priceUsd: pair.priceUsd || "N/A",
    priceChange24h: pair.priceChange?.h24 || pair.priceChange24h || "N/A",
    liquidity: liquidityUsd, // Valor de solo el lado AVAX en USD
    liquidityAvax: liquidityAvax, // Cantidad de AVAX
    liquidityUvd: liquidityUvd, // Cantidad de UVD
    marketCap: pair.marketCap || "N/A",
    holderCount: details?.gp?.holderCount || "N/A",
    totalSupply: details?.su?.totalSupply || "N/A",
    circulatingSupply: details?.su?.circulatingSupply || "N/A",
    totalTransactions: transactionsData.count || "N/A",
    // BUG-01: details.ds sin guard lanzaba TypeError cuando DexScreener falla/429
    burnedSupply: details?.ds?.supplies?.burnedSupply || "N/A",
    burnedTokens: burnedTokens, // New field with detailed burned token info
    totalBurnedTokens: burnedTokens.total // Total burned tokens from both addresses
  };
} 