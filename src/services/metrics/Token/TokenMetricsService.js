const PAIR_ID = "0xbff3e2238e545c76f705560bd1677bd9c0e9dab4";
const CHAIN_ID = "avalanche";
const TOKEN_ADDRESS = "0x4Ffe7e01832243e03668E090706F17726c26d6B2";

export async function getTokenData() {
  
  const url1 = `https://corsproxy.io/?https://api.dexscreener.com/latest/dex/pairs/${CHAIN_ID}/${PAIR_ID}`;
  const res1 = await fetch(url1);
  const data = await res1.json();
  const pair = data.pair || data.pairs?.[0] || {};

  const url2 = `https://corsproxy.io/?https://io.dexscreener.com/dex/pair-details/v3/${CHAIN_ID}/${PAIR_ID}`;
  const res2 = await fetch(url2);
  const details = await res2.json();

  const url3 = `https://cdn.routescan.io/api/evm/43114/erc20-transfers?count=true&limit=50&tokenAddress=${TOKEN_ADDRESS}`;
  const res3 = await fetch(url3);
  const transactionsData = await res3.json();

  return {
    priceNative: pair.priceNative || "NA",
    priceUsd: pair.priceUsd || "N/A",
    priceChange24h: pair.priceChange?.h24 || pair.priceChange24h || "N/A",
    liquidity: pair.liquidity?.usd || pair.liquidity || "N/A",
    marketCap: pair.marketCap || "N/A",
    holderCount: details.gp?.holderCount || "N/A",
    totalSupply: details.su?.totalSupply || "N/A",
    circulatingSupply: details.su?.circulatingSupply || "N/A",
    totalTransactions: transactionsData.count || "N/A",
  };
} 