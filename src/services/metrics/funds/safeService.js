const SAFE_API_BASE = "https://safe-transaction-avalanche.safe.global/api/v1";

export const getSafeInfo = async (safeAddress) => {
  const response = await fetch(`${SAFE_API_BASE}/safes/${safeAddress}/`, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'content-type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  return await response.json();
};

export const getSafeBalances = async (safeAddress) => {
    const safeApiBalances = `https://safe-client.safe.global/v1/chains/43114/safes/${safeAddress}/balances/usd?trusted=false`;
    const response = await fetch(safeApiBalances, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'content-type': 'application/json',
      },
    });
  
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
  
    return await response.json();
  };