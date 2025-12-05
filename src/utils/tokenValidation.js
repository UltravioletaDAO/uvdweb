import { ethers } from 'ethers';

/**
 * Verifica si una wallet posee un balance mínimo de un token específico
 * @param {string} walletAddress - Dirección de la wallet a verificar
 * @param {string} tokenAddress - Dirección del contrato del token
 * @param {ethers.providers.Provider} provider - Provider de ethers.js
 * @param {number} minBalance - Balance mínimo requerido (en unidades del token, considerando decimales)
 * @returns {Promise<{hasToken: boolean, balance: string, error: string|null}>}
 */
export const checkTokenBalance = async (walletAddress, tokenAddress, provider, minBalance = 1) => {
  try {
    // ABI mínimo para consultar balance de tokens ERC20
    const tokenABI = [
      'function balanceOf(address owner) view returns (uint256)',
      'function decimals() view returns (uint8)',
      'function symbol() view returns (string)',
      'function name() view returns (string)'
    ];

    // Crear instancia del contrato
    const tokenContract = new ethers.Contract(tokenAddress, tokenABI, provider);

    // Obtener balance, decimales y símbolo del token
    const [balance, decimals, symbol] = await Promise.all([
      tokenContract.balanceOf(walletAddress),
      tokenContract.decimals(),
      tokenContract.symbol()
    ]);

    // Convertir balance a formato legible
    const balanceFormatted = ethers.utils.formatUnits(balance, decimals);

    // Verificar si cumple con el balance mínimo
    const hasToken = parseFloat(balanceFormatted) >= minBalance;

    return {
      hasToken,
      balance: balanceFormatted,
      symbol,
      decimals,
      error: null
    };

  } catch (error) {
    console.error('Error al verificar balance del token:', error);
    return {
      hasToken: false,
      balance: '0',
      symbol: '',
      decimals: 0,
      error: error.message || 'Error al verificar el token'
    };
  }
};

/**
 * Verifica si una wallet posee algún NFT de una colección específica (ERC721)
 * @param {string} walletAddress - Dirección de la wallet a verificar
 * @param {string} nftContractAddress - Dirección del contrato NFT
 * @param {ethers.providers.Provider} provider - Provider de ethers.js
 * @returns {Promise<{hasNFT: boolean, balance: number, error: string|null}>}
 */
export const checkNFTBalance = async (walletAddress, nftContractAddress, provider) => {
  try {
    // ABI mínimo para consultar balance de NFTs ERC721
    const nftABI = [
      'function balanceOf(address owner) view returns (uint256)',
      'function name() view returns (string)',
      'function symbol() view returns (string)'
    ];

    // Crear instancia del contrato
    const nftContract = new ethers.Contract(nftContractAddress, nftABI, provider);

    // Obtener balance y nombre
    const [balance, name, symbol] = await Promise.all([
      nftContract.balanceOf(walletAddress),
      nftContract.name(),
      nftContract.symbol()
    ]);

    const balanceNumber = balance.toNumber();

    return {
      hasNFT: balanceNumber > 0,
      balance: balanceNumber,
      name,
      symbol,
      error: null
    };

  } catch (error) {
    console.error('Error al verificar balance del NFT:', error);
    return {
      hasNFT: false,
      balance: 0,
      name: '',
      symbol: '',
      error: error.message || 'Error al verificar el NFT'
    };
  }
};

/**
 * Configuración de tokens para whitelist
 * Aquí defines qué token se requiere para acceder a la creación de bounties
 */
export const WHITELIST_CONFIG = {
  // Token UVD - UltraVioleta DAO en Avalanche C-Chain
  GOVERNANCE_TOKEN: {
    // Dirección del contrato del token UVD en Avalanche
    address: '0x4Ffe7e01832243e03668E090706F17726c26d6B2',
    minBalance: 1000000, // Balance mínimo requerido: 1,000,000 UVD
    name: 'UltraVioleta DAO',
    symbol: 'UVD',
    chainId: 43114, // Avalanche C-Chain
    rpcUrl: 'https://api.avax.network/ext/bc/C/rpc' // RPC de Avalanche
  },

  // Ejemplo alternativo: NFT de membresía (no en uso)
  MEMBERSHIP_NFT: {
    address: '0x...', // Dirección del NFT de membresía
    name: 'UltraVioleta Membership',
    symbol: 'UVNFT'
  },

  // Tipo de validación: 'token' para validar por UVD
  validationType: 'token'
};

/**
 * Función principal de validación de whitelist
 * @param {string} walletAddress - Dirección de la wallet a verificar
 * @param {ethers.providers.Provider} provider - Provider de ethers.js
 * @returns {Promise<{isWhitelisted: boolean, details: object}>}
 */
export const validateWhitelist = async (walletAddress, provider) => {
  if (!walletAddress) {
    return {
      isWhitelisted: false,
      details: { error: 'Dirección de wallet no disponible' }
    };
  }
  
  if (!provider) {
    return {
      isWhitelisted: false,
      details: { error: 'Provider de Web3 no disponible' }
    };
  }

  try {
    const { validationType, GOVERNANCE_TOKEN } = WHITELIST_CONFIG;
    
    // Red actual de la wallet (puede no ser Avalanche si el usuario está en otra chain)
    const network = await provider.getNetwork();
    const isOnAvalanche = Number(network.chainId) === Number(GOVERNANCE_TOKEN.chainId);
    
    // Provider dedicado a Avalanche para consultar balances SIEMPRE en la red correcta
    const avalancheRpcProvider = new ethers.providers.JsonRpcProvider(GOVERNANCE_TOKEN.rpcUrl);
    
    if (validationType === 'token') {
      // 1) Siempre verificamos el balance usando el RPC de Avalanche,
      //    independiente de la chain activa en la wallet
      const result = await checkTokenBalance(
        walletAddress,
        GOVERNANCE_TOKEN.address,
        avalancheRpcProvider,
        GOVERNANCE_TOKEN.minBalance
      );

      // 2) Si no está en Avalanche, intentamos cambiar automáticamente
      if (!isOnAvalanche) {
        try {
          // Cambiar a Avalanche (0xa86a)
          if (provider.provider?.request) {
            await provider.provider.request({
              method: 'wallet_switchEthereumChain',
              params: [{ chainId: '0xa86a' }]
            });
          } else if (provider.send) {
            await provider.send('wallet_switchEthereumChain', [{ chainId: '0xa86a' }]);
          }
        } catch (switchError) {
          // Si la red no está agregada, intentamos agregarla y luego cambiar
          if (switchError?.code === 4902 && provider.provider?.request) {
            try {
              await provider.provider.request({
                method: 'wallet_addEthereumChain',
                params: [{
                  chainId: '0xa86a',
                  chainName: 'Avalanche C-Chain',
                  nativeCurrency: { name: 'Avalanche', symbol: 'AVAX', decimals: 18 },
                  rpcUrls: [GOVERNANCE_TOKEN.rpcUrl],
                  blockExplorerUrls: ['https://snowtrace.io']
                }]
              });
              await provider.provider.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: '0xa86a' }]
              });
            } catch (_) {
              // Ignorar; solo informaremos wrongNetwork abajo
            }
          }
        }
      }

      return {
        isWhitelisted: result.hasToken,
        details: {
          type: 'token',
          tokenName: result.symbol || GOVERNANCE_TOKEN.symbol,
          balance: result.balance,
          minRequired: GOVERNANCE_TOKEN.minBalance,
          chainId: network.chainId,
          networkName: network.name,
          // Indicamos si la red activa NO es Avalanche, pero si el balance cumple
          // igual otorgamos acceso (result.hasToken)
          wrongNetwork: !isOnAvalanche,
          expectedChainId: GOVERNANCE_TOKEN.chainId,
          currentChainId: network.chainId,
          error: result.error
        }
      };

    } else if (validationType === 'nft') {
      const { MEMBERSHIP_NFT } = WHITELIST_CONFIG;
      const result = await checkNFTBalance(
        walletAddress,
        MEMBERSHIP_NFT.address,
        provider
      );

      return {
        isWhitelisted: result.hasNFT,
        details: {
          type: 'nft',
          nftName: result.name || MEMBERSHIP_NFT.name,
          balance: result.balance,
          error: result.error
        }
      };
    }

    return {
      isWhitelisted: false,
      details: { error: 'Tipo de validación no configurado' }
    };

  } catch (error) {
    console.error('Error en validación de whitelist:', error);
    return {
      isWhitelisted: false,
      details: { error: error.message }
    };
  }
};
