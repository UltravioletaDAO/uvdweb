const PAIR_ID = "0xbff3e2238e545c76f705560bd1677bd9c0e9dab4";
const INTERVAL = "day?aggregate=1&limit=30";

export async function fetchPriceHistory() {
    const url = `https://api.geckoterminal.com/api/v2/networks/avax/pools/${PAIR_ID}/ohlcv/${INTERVAL}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("Error fetching OHLCV data from GeckoTerminal");
    const json = await res.json();
    
    return json.data.attributes.ohlcv_list.map(([timestamp, open, high, low, close, volume]) => ({
      date: new Date(timestamp * 1000).toLocaleDateString(),
      price: close,
      open,
      high,
      low,
      volume,
    }));
}