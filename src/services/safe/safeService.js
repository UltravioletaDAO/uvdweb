// Service for interacting with SAFE API
// Using the robust Transaction Service URL directly to avoid redirects
const SAFE_API_BASE_URL = 'https://api.safe.global/tx-service/avax/api/v1';

/**
 * Fetches multisig transactions for a specific Safe
 * @param {string} safeAddress
 * @param {number} limit
 * @returns {Promise<{results: Array, count: number}>}
 */
export async function getMultisigTransactions(safeAddress, limit = 100) {
  try {
    const url = `${SAFE_API_BASE_URL}/safes/${safeAddress}/multisig-transactions/?limit=${limit}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Error fetching transactions: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error in getMultisigTransactions:', error);
    throw error;
  }
}

/**
 * Fetches the owners of a specific Safe
 * @param {string} safeAddress
 * @returns {Promise<Array>} List of owner addresses
 */
export async function getSafeOwners(safeAddress) {
  try {
    const url = `${SAFE_API_BASE_URL}/safes/${safeAddress}/`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Error fetching owners: ${response.statusText}`);
    }

    const data = await response.json();
    return data.owners;
  } catch (error) {
    console.error('Error in getSafeOwners:', error);
    throw error;
  }
}

/**
 * Calculates statistics for owners based on transactions
 * @param {Array} transactions
 * @param {Array} owners
 * @returns {Array} Stats per owner
 */
export function calculateOwnerStats(transactions, owners) {
  // Initialize stats for all owners
  const stats = owners.reduce((acc, owner) => {
    acc[owner] = {
      address: owner,
      signatureCount: 0,
      percentage: 0
    };
    return acc;
  }, {});

  const normalizeAddress = (addr) => addr ? addr.toLowerCase() : '';

  // Count signatures
  transactions.forEach(tx => {
    if (tx.confirmations) {
      tx.confirmations.forEach(conf => {
        const ownerKey = Object.keys(stats).find(key => normalizeAddress(key) === normalizeAddress(conf.owner));
        if (ownerKey) {
          stats[ownerKey].signatureCount++;
        }
      });
    }
  });

  // Calculate percentages
  const totalTransactions = transactions.length;
  Object.values(stats).forEach(stat => {
    stat.percentage = totalTransactions > 0
      ? (stat.signatureCount / totalTransactions) * 100
      : 0;
  });

  return Object.values(stats).sort((a, b) => b.signatureCount - a.signatureCount);
}

/**
 * Filter transactions by date range
 * @param {Array} transactions 
 * @param {string} startDate YYYY-MM-DD
 * @param {string} endDate YYYY-MM-DD
 * @returns {Array} Filtered transactions
 */
export function filterTransactionsByDateRange(transactions, startDate, endDate) {
  if (!startDate && !endDate) return transactions;

  const start = startDate ? new Date(startDate).getTime() : 0;
  // End date should include the entire day, so set to end of that day
  const end = endDate ? new Date(endDate).setHours(23, 59, 59, 999) : Infinity;

  return transactions.filter(tx => {
    const txDate = new Date(tx.submissionDate).getTime();
    return txDate >= start && txDate <= end;
  });
}