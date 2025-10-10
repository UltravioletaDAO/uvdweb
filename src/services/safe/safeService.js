// Service for interacting with SAFE API
const SAFE_API_BASE_URL = 'https://safe-transaction-avalanche.safe.global/api/v1';

/**
 * Fetches multisig transactions for a specific Safe
 * @param {string} safeAddress - The address of the Safe
 * @param {number} limit - Maximum number of transactions to return
 * @param {number} offset - Number of transactions to skip
 * @returns {Promise<Object>} - The API response with transactions data
 */
export const getMultisigTransactions = async (safeAddress, limit = 100, offset = 0) => {
  try {
    const response = await fetch(
      `${SAFE_API_BASE_URL}/safes/${safeAddress}/multisig-transactions/?limit=${limit}&offset=${offset}`,
      {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'content-type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching multisig transactions:', error);
    throw error;
  }
};

/**
 * Fetches all owners of a specific Safe
 * @param {string} safeAddress - The address of the Safe
 * @returns {Promise<Array<string>>} - Array of owner addresses
 */
export const getSafeOwners = async (safeAddress) => {
  try {
    const response = await fetch(`${SAFE_API_BASE_URL}/safes/${safeAddress}/`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'content-type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    return data.owners || [];
  } catch (error) {
    console.error('Error fetching Safe owners:', error);
    throw error;
  }
};

/**
 * Filters transactions by date range using exact date comparison (ignores time)
 * @param {Array} transactions - The list of multisig transactions
 * @param {string} startDate - Start date in YYYY-MM-DD format
 * @param {string} endDate - End date in YYYY-MM-DD format
 * @returns {Array} - Filtered transactions
 */
export const filterTransactionsByDateRange = (transactions, startDate, endDate) => {
  // If no dates are provided, return all transactions
  if (!startDate && !endDate) {
    return transactions;
  }

  // Convert string dates to Date objects, setting to start of day in local time
  let start = null;
  let end = null;

  if (startDate) {
    start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
  }

  if (endDate) {
    end = new Date(endDate);
    // Set to end of the selected day
    end.setHours(23, 59, 59, 999);
  }

  return transactions.filter(tx => {
    // Get the execution date
    if (!tx.executionDate) return false;

    // Convert UTC date to local date for comparison (keep only the date part)
    const txDateStr = tx.executionDate.split('T')[0]; // Extract YYYY-MM-DD part
    const txDate = new Date(txDateStr);
    txDate.setHours(12, 0, 0, 0); // Set to noon to avoid timezone issues

    if (start && end) {
      return txDate >= start && txDate <= end;
    } else if (start) {
      return txDate >= start;
    } else if (end) {
      return txDate <= end;
    }
    
    return true;
  });
};

/**
 * Format a transaction date string to YYYY-MM-DD format
 * @param {string} dateString - Date string in ISO format
 * @returns {string} - Formatted date
 */
export const formatTransactionDate = (dateString) => {
  if (!dateString) return '';
  return dateString.split('T')[0]; // Extract YYYY-MM-DD part
};

/**
 * Calculates signing statistics for each owner
 * @param {Array} transactions - The list of multisig transactions
 * @param {Array} owners - The list of Safe owners
 * @returns {Array} - Owner stats sorted by number of signatures ascending
 */
export const calculateOwnerStats = (transactions, owners) => {
  // Initialize stats for each owner
  const ownerStats = {};
  
  // Make sure all addresses are lowercase for comparison
  owners.forEach(owner => {
    ownerStats[owner.toLowerCase()] = {
      address: owner,
      signatureCount: 0,
      percentage: 0
    };
  });

  // Count signatures for each transaction
  transactions.forEach(tx => {
    if (tx.confirmations && tx.confirmations.length > 0) {
      tx.confirmations.forEach(confirmation => {
        const ownerAddress = confirmation.owner.toLowerCase();
        if (ownerStats[ownerAddress]) {
          ownerStats[ownerAddress].signatureCount += 1;
        }
      });
    }
  });

  // Calculate percentages and convert to array
  const txCount = transactions.length;
  const statsArray = Object.values(ownerStats).map(stat => ({
    ...stat,
    percentage: txCount > 0 ? (stat.signatureCount / txCount) * 100 : 0
  }));

  // Sort by signature count (ascending - lowest signers first)
  return statsArray.sort((a, b) => a.signatureCount - b.signatureCount);
};

const safeService = {
  getMultisigTransactions,
  getSafeOwners,
  calculateOwnerStats,
  filterTransactionsByDateRange,
  formatTransactionDate
};

export default safeService; 