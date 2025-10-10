// Configuración de Web3 para UltraVioleta DAO

// Dirección del contrato del token de gobernanza UVD en Avalanche
export const GOVERNANCE_TOKEN_ADDRESS = '0x4Ffe7e01832243e03668E090706F17726c26d6B2'; // Token UVD en Avalanche C-Chain

// ABI del token de gobernanza (funciones básicas)
export const GOVERNANCE_TOKEN_ABI = [
  {
    "constant": true,
    "inputs": [{"name": "_owner", "type": "address"}],
    "name": "balanceOf",
    "outputs": [{"name": "balance", "type": "uint256"}],
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "decimals",
    "outputs": [{"name": "", "type": "uint8"}],
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "symbol",
    "outputs": [{"name": "", "type": "string"}],
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "name",
    "outputs": [{"name": "", "type": "string"}],
    "type": "function"
  }
];

// Configuración de redes soportadas
export const SUPPORTED_NETWORKS = {
  '0xa86a': {
    name: 'Avalanche C-Chain',
    chainId: 43114,
    rpcUrl: 'https://api.avax.network/ext/bc/C/rpc',
    explorer: 'https://snowtrace.io',
    nativeCurrency: {
      name: 'Avalanche',
      symbol: 'AVAX',
      decimals: 18
    }
  },
  '0x1': {
    name: 'Ethereum Mainnet',
    chainId: 1,
    rpcUrl: 'https://mainnet.infura.io/v3/YOUR_INFURA_KEY',
    explorer: 'https://etherscan.io',
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18
    }
  },
  '0x89': {
    name: 'Polygon',
    chainId: 137,
    rpcUrl: 'https://polygon-rpc.com',
    explorer: 'https://polygonscan.com',
    nativeCurrency: {
      name: 'MATIC',
      symbol: 'MATIC',
      decimals: 18
    }
  },
  '0xa': {
    name: 'Optimism',
    chainId: 10,
    rpcUrl: 'https://mainnet.optimism.io',
    explorer: 'https://optimistic.etherscan.io',
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18
    }
  },
  '0xa4b1': {
    name: 'Arbitrum One',
    chainId: 42161,
    rpcUrl: 'https://arb1.arbitrum.io/rpc',
    explorer: 'https://arbiscan.io',
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18
    }
  },
  '0x5': {
    name: 'Goerli Testnet',
    chainId: 5,
    rpcUrl: 'https://goerli.infura.io/v3/YOUR_INFURA_KEY',
    explorer: 'https://goerli.etherscan.io',
    nativeCurrency: {
      name: 'Goerli Ether',
      symbol: 'ETH',
      decimals: 18
    }
  },
  '0xaa36a7': {
    name: 'Sepolia Testnet',
    chainId: 11155111,
    rpcUrl: 'https://sepolia.infura.io/v3/YOUR_INFURA_KEY',
    explorer: 'https://sepolia.etherscan.io',
    nativeCurrency: {
      name: 'Sepolia Ether',
      symbol: 'ETH',
      decimals: 18
    }
  }
};

// Función para verificar si la red está soportada
export const isNetworkSupported = (chainId) => {
  return SUPPORTED_NETWORKS.hasOwnProperty(chainId);
};

// Función para obtener información de la red
export const getNetworkInfo = (chainId) => {
  return SUPPORTED_NETWORKS[chainId] || null;
};

// Función para formatear direcciones de wallet
export const formatAddress = (address) => {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

// Función para formatear balances de tokens
export const formatTokenBalance = (balance, decimals = 18) => {
  if (!balance) return '0';
  const formatted = balance / Math.pow(10, decimals);
  return formatted.toFixed(2);
};

// Función para inicializar Web3
export const initializeWeb3 = async () => {
  if (typeof window.ethereum !== 'undefined') {
    try {
      // Solicitar acceso a la cuenta
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      
      return {
        success: true,
        account: accounts[0],
        chainId: chainId,
        provider: window.ethereum
      };
    } catch (error) {
      console.error('Error initializing Web3:', error);
      return {
        success: false,
        error: error.message
      };
    }
  } else {
    return {
      success: false,
      error: 'No Ethereum provider detected'
    };
  }
};

// Función para cambiar de red
export const switchNetwork = async (targetChainId) => {
  if (typeof window.ethereum !== 'undefined') {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: targetChainId }],
      });
      return { success: true };
    } catch (switchError) {
      // Si la red no está agregada, intentar agregarla
      if (switchError.code === 4902) {
        const networkInfo = getNetworkInfo(targetChainId);
        if (networkInfo) {
          try {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [{
                chainId: targetChainId,
                chainName: networkInfo.name,
                nativeCurrency: networkInfo.nativeCurrency,
                rpcUrls: [networkInfo.rpcUrl],
                blockExplorerUrls: [networkInfo.explorer]
              }],
            });
            return { success: true };
          } catch (addError) {
            return { success: false, error: addError.message };
          }
        }
      }
      return { success: false, error: switchError.message };
    }
  }
  return { success: false, error: 'No Ethereum provider detected' };
}; 