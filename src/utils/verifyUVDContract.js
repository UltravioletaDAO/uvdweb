import { ethers } from 'ethers';

/**
 * Script de Verificación del Contrato UVD
 * 
 * Este script verifica que el contrato del token UVD esté correctamente configurado
 * y puede leer información básica del token.
 * 
 * Contrato UVD: 0x4Ffe7e01832243e03668E090706F17726c26d6B2
 */

const UVD_CONTRACT_ADDRESS = '0x4Ffe7e01832243e03668E090706F17726c26d6B2';

// ABI mínimo para verificar el token
const UVD_TOKEN_ABI = [
  'function balanceOf(address owner) view returns (uint256)',
  'function decimals() view returns (uint8)',
  'function symbol() view returns (string)',
  'function name() view returns (string)',
  'function totalSupply() view returns (uint256)'
];

/**
 * Verifica la información del contrato UVD
 * @param {ethers.providers.Provider} provider - Provider de ethers.js
 */
export const verifyUVDContract = async (provider) => {
  try {
    console.log('🔍 Verificando contrato UVD...');
    console.log('Dirección:', UVD_CONTRACT_ADDRESS);
    
    const contract = new ethers.Contract(UVD_CONTRACT_ADDRESS, UVD_TOKEN_ABI, provider);
    
    // Obtener información básica del token
    const [name, symbol, decimals, totalSupply] = await Promise.all([
      contract.name(),
      contract.symbol(),
      contract.decimals(),
      contract.totalSupply()
    ]);
    
    const totalSupplyFormatted = ethers.utils.formatUnits(totalSupply, decimals);
    
    const info = {
      name,
      symbol,
      decimals,
      totalSupply: totalSupplyFormatted,
      address: UVD_CONTRACT_ADDRESS
    };
    
    console.log('✅ Información del Token UVD:');
    console.log('   Nombre:', info.name);
    console.log('   Símbolo:', info.symbol);
    console.log('   Decimales:', info.decimals);
    console.log('   Supply Total:', info.totalSupply, info.symbol);
    
    return {
      success: true,
      info
    };
    
  } catch (error) {
    console.error('❌ Error al verificar contrato UVD:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Verifica el balance UVD de una wallet específica
 * @param {string} walletAddress - Dirección de la wallet
 * @param {ethers.providers.Provider} provider - Provider de ethers.js
 */
export const checkUVDBalance = async (walletAddress, provider) => {
  try {
    console.log('💰 Verificando balance de:', walletAddress);
    
    const contract = new ethers.Contract(UVD_CONTRACT_ADDRESS, UVD_TOKEN_ABI, provider);
    
    const [balance, decimals, symbol] = await Promise.all([
      contract.balanceOf(walletAddress),
      contract.decimals(),
      contract.symbol()
    ]);
    
    const balanceFormatted = ethers.utils.formatUnits(balance, decimals);
    const balanceNumber = parseFloat(balanceFormatted);
    
    const meetsRequirement = balanceNumber >= 1000000;
    
    console.log('   Balance:', balanceFormatted, symbol);
    console.log('   Requisito: 1,000,000', symbol);
    console.log('   Cumple:', meetsRequirement ? '✅ SÍ' : '❌ NO');
    
    return {
      success: true,
      balance: balanceFormatted,
      balanceNumber,
      symbol,
      meetsRequirement,
      required: 1000000
    };
    
  } catch (error) {
    console.error('❌ Error al verificar balance:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Función de prueba completa
 * Verifica el contrato y un balance de ejemplo
 */
export const runUVDVerification = async () => {
  console.log('\n🚀 Iniciando verificación del sistema UVD...\n');
  
  try {
    // Usar un RPC público (puedes cambiar esto según la red)
    // Ethereum Mainnet
    const provider = new ethers.providers.JsonRpcProvider('https://rpc.ankr.com/eth');
    
    // 1. Verificar información del contrato
    const contractInfo = await verifyUVDContract(provider);
    
    if (!contractInfo.success) {
      throw new Error('No se pudo verificar el contrato');
    }
    
    console.log('\n✅ Verificación completada exitosamente!\n');
    
    return {
      success: true,
      contractInfo: contractInfo.info
    };
    
  } catch (error) {
    console.error('\n❌ Error en la verificación:', error.message, '\n');
    return {
      success: false,
      error: error.message
    };
  }
};

// Para usar en consola del navegador:
// import { runUVDVerification } from './verifyUVDContract';
// runUVDVerification();

