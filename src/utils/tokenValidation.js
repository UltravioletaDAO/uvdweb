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
  if (!walletAddress || !provider) {
    return {
      isWhitelisted: false,
      details: { error: 'Wallet o provider no disponible' }
    };
  }

  try {
    const { validationType, GOVERNANCE_TOKEN } = WHITELIST_CONFIG;

    // Verificar que estamos en la red correcta
    const network = await provider.getNetwork();
    
    if (validationType === 'token') {
      // Verificar si la wallet está en la red correcta (Avalanche)
      if (network.chainId !== GOVERNANCE_TOKEN.chainId) {
        return {
          isWhitelisted: false,
          details: {
            type: 'token',
            error: `Por favor cambia tu wallet a Avalanche C-Chain. Red actual: ${network.chainId}`,
            wrongNetwork: true,
            expectedChainId: GOVERNANCE_TOKEN.chainId,
            currentChainId: network.chainId
          }
        };
      }

      const result = await checkTokenBalance(
        walletAddress,
        GOVERNANCE_TOKEN.address,
        provider,
        GOVERNANCE_TOKEN.minBalance
      );

      return {
        isWhitelisted: result.hasToken,
        details: {
          type: 'token',
          tokenName: result.symbol || GOVERNANCE_TOKEN.symbol,
          balance: result.balance,
          minRequired: GOVERNANCE_TOKEN.minBalance,
          chainId: network.chainId,
          networkName: network.name,
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

