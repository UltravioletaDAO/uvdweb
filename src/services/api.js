// API Service for UltraVioleta DAO
// Centralized service to handle all API calls to AWS Lambda and existing APIs

// API Configuration
const API_CONFIG = {
  // Bounties API - AWS Lambda
  BOUNTIES_API_URL: process.env.REACT_APP_BOUNTIES_API_URL || 'https://othbtswzu7.execute-api.us-east-1.amazonaws.com/prod',
  
  // New Applicants API - Existing API
  NEW_APPLICANTS_API_URL: process.env.REACT_APP_NEW_APPLICANTS_API_URL || 'https://api.ultravioletadao.xyz',
  
  // Legacy API URL (for backward compatibility)
  LEGACY_API_URL: process.env.REACT_APP_API_URL || 'https://api.ultravioletadao.xyz'
};

// Helper function to make API requests
const makeRequest = async (url, options = {}) => {
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const finalOptions = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, finalOptions);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API Request Error:', error);
    throw error;
  }
};

// Bounties API Service
export const bountiesAPI = {
  // Get all bounties
  getAll: async (params = {}) => {
    const { status, limit = 50, page = 1 } = params;
    const queryParams = new URLSearchParams();
    
    if (status) queryParams.append('status', status);
    if (limit) queryParams.append('limit', limit);
    if (page) queryParams.append('page', page);
    
    const url = `${API_CONFIG.BOUNTIES_API_URL}/bounties${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return makeRequest(url);
  },

  // Get single bounty by ID
  getById: async (id) => {
    const url = `${API_CONFIG.BOUNTIES_API_URL}/bounties/${id}`;
    return makeRequest(url);
  },

  // Create new bounty
  create: async (bountyData) => {
    const url = `${API_CONFIG.BOUNTIES_API_URL}/bounties`;
    return makeRequest(url, {
      method: 'POST',
      body: JSON.stringify(bountyData),
    });
  },

  // Update bounty
  update: async (id, bountyData) => {
    const url = `${API_CONFIG.BOUNTIES_API_URL}/bounties/${id}`;
    return makeRequest(url, {
      method: 'PUT',
      body: JSON.stringify(bountyData),
    });
  },

  // Delete bounty
  delete: async (id) => {
    const url = `${API_CONFIG.BOUNTIES_API_URL}/bounties/${id}`;
    return makeRequest(url, {
      method: 'DELETE',
    });
  },

  // Update bounty status
  updateStatus: async (id, status) => {
    const url = `${API_CONFIG.BOUNTIES_API_URL}/bounties/${id}/status`;
    return makeRequest(url, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },

  // Get bounty submissions
  getSubmissions: async (bountyId) => {
    const url = `${API_CONFIG.BOUNTIES_API_URL}/bounties/${bountyId}/submissions`;
    return makeRequest(url);
  },

  // Create submission
  createSubmission: async (bountyId, submissionData) => {
    const url = `${API_CONFIG.BOUNTIES_API_URL}/bounties/${bountyId}/submissions`;
    return makeRequest(url, {
      method: 'POST',
      body: JSON.stringify(submissionData),
    });
  },

  // Test API connection
  test: async () => {
    const url = `${API_CONFIG.BOUNTIES_API_URL}/test`;
    return makeRequest(url);
  }
};

// New Applicants API Service
export const applicantsAPI = {
  // Submit new application
  submit: async (applicationData) => {
    const url = `${API_CONFIG.NEW_APPLICANTS_API_URL}/apply`;
    return makeRequest(url, {
      method: 'POST',
      body: JSON.stringify(applicationData),
    });
  },

  // Get application status
  getStatus: async (email) => {
    const url = `${API_CONFIG.NEW_APPLICANTS_API_URL}/apply/status/${email}`;
    return makeRequest(url);
  },

  // Get all applications (admin only)
  getAll: async () => {
    const url = `${API_CONFIG.NEW_APPLICANTS_API_URL}/apply`;
    return makeRequest(url);
  }
};

// Admin API Service
export const adminAPI = {
  // Check if wallet is admin (public endpoint)
  isAdmin: async (wallet) => {
    const url = `${API_CONFIG.BOUNTIES_API_URL}/admin/auth/is-admin/${wallet}`;
    return makeRequest(url);
  },

  // Get nonce for signing
  getNonce: async (wallet) => {
    const url = `${API_CONFIG.BOUNTIES_API_URL}/admin/auth/nonce`;
    return makeRequest(url, {
      method: 'POST',
      body: JSON.stringify({ wallet }),
    });
  },

  // Verify signature and get JWT token
  verifySignature: async (wallet, signature, message) => {
    const url = `${API_CONFIG.BOUNTIES_API_URL}/admin/auth/verify`;
    return makeRequest(url, {
      method: 'POST',
      body: JSON.stringify({ wallet, signature, message }),
    });
  },

  // Check if current token is valid
  checkAuth: async (token) => {
    const url = `${API_CONFIG.BOUNTIES_API_URL}/admin/auth/check`;
    return makeRequest(url, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  },

  // Update bounty (admin only)
  updateBounty: async (id, bountyData, token) => {
    const url = `${API_CONFIG.BOUNTIES_API_URL}/admin/bounties/${id}`;
    return makeRequest(url, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(bountyData),
    });
  },

  // Delete bounty (admin only)
  deleteBounty: async (id, token) => {
    const url = `${API_CONFIG.BOUNTIES_API_URL}/admin/bounties/${id}`;
    return makeRequest(url, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  },

  // Update bounty status (admin only)
  updateBountyStatus: async (id, status, token) => {
    const url = `${API_CONFIG.BOUNTIES_API_URL}/admin/bounties/${id}/status`;
    return makeRequest(url, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ status }),
    });
  },

  // Get all admin wallets
  getAdminWallets: async (token) => {
    const url = `${API_CONFIG.BOUNTIES_API_URL}/admin/wallets`;
    return makeRequest(url, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  },

  // Add admin wallet
  addAdminWallet: async (walletData, token) => {
    const url = `${API_CONFIG.BOUNTIES_API_URL}/admin/wallets`;
    return makeRequest(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(walletData),
    });
  },

  // Update admin wallet
  updateAdminWallet: async (id, walletData, token) => {
    const url = `${API_CONFIG.BOUNTIES_API_URL}/admin/wallets/${id}`;
    return makeRequest(url, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(walletData),
    });
  },

  // Delete admin wallet
  deleteAdminWallet: async (id, token) => {
    const url = `${API_CONFIG.BOUNTIES_API_URL}/admin/wallets/${id}`;
    return makeRequest(url, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  }
};

// Legacy API Service (for backward compatibility)
export const legacyAPI = {
  // Auth endpoints
  auth: {
    verify: async (token) => {
      const url = `${API_CONFIG.LEGACY_API_URL}/auth/verify`;
      return makeRequest(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
    },

    login: async (credentials) => {
      const url = `${API_CONFIG.LEGACY_API_URL}/auth/login`;
      return makeRequest(url, {
        method: 'POST',
        body: JSON.stringify(credentials),
      });
    }
  },

  // Wallet endpoints
  wallets: {
    create: async (walletData) => {
      const url = `${API_CONFIG.LEGACY_API_URL}/wallets`;
      return makeRequest(url, {
        method: 'POST',
        body: JSON.stringify(walletData),
      });
    }
  }
};

// Export API configuration for debugging
export const getAPIConfig = () => API_CONFIG;

// Export default API service
export default {
  bounties: bountiesAPI,
  applicants: applicantsAPI,
  admin: adminAPI,
  legacy: legacyAPI,
  config: API_CONFIG
};

