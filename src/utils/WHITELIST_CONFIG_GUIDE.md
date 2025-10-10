# Guía de Configuración de Whitelist por Token

## 📋 Descripción

Este sistema permite validar el acceso al formulario de creación de bounties basándose en la posesión de un token ERC20 o NFT ERC721 específico en la wallet del usuario.

## 🔧 Configuración

### 1. Editar el archivo `tokenValidation.js`

Abre el archivo `src/utils/tokenValidation.js` y localiza la sección `WHITELIST_CONFIG`:

```javascript
export const WHITELIST_CONFIG = {
  // Token de gobernanza UVT
  GOVERNANCE_TOKEN: {
    // PASO 1: Reemplazar con la dirección del contrato del token
    address: '0x...', // ⚠️ IMPORTANTE: Cambiar esta dirección
    minBalance: 1, // Balance mínimo requerido
    name: 'UltraVioleta Token',
    symbol: 'UVT'
  },

  // Alternativa: NFT de membresía
  MEMBERSHIP_NFT: {
    address: '0x...', // Dirección del contrato NFT
    name: 'UltraVioleta Membership',
    symbol: 'UVNFT'
  },

  // PASO 2: Elegir tipo de validación
  validationType: 'token' // Opciones: 'token' o 'nft'
};
```

### 2. Opciones de Configuración

#### Opción A: Validar por Token ERC20

Si quieres validar que el usuario posea un token de gobernanza:

```javascript
GOVERNANCE_TOKEN: {
  address: '0x1234567890abcdef...', // Dirección real del contrato
  minBalance: 100, // Mínimo 100 tokens requeridos
  name: 'UltraVioleta Token',
  symbol: 'UVT'
},
validationType: 'token'
```

#### Opción B: Validar por NFT ERC721

Si quieres validar que el usuario posea un NFT de membresía:

```javascript
MEMBERSHIP_NFT: {
  address: '0x1234567890abcdef...', // Dirección del contrato NFT
  name: 'UltraVioleta Membership',
  symbol: 'UVNFT'
},
validationType: 'nft'
```

## 🌐 Obtener la Dirección del Contrato

### Para Tokens ERC20:
1. Busca tu token en [Etherscan](https://etherscan.io/)
2. Copia la dirección del contrato (Contract Address)
3. Ejemplo: `0xdac17f958d2ee523a2206206994597c13d831ec7` (USDT)

### Para NFTs ERC721:
1. Busca tu colección en [OpenSea](https://opensea.io/)
2. En la página de la colección, busca "Contract Address"
3. Copia la dirección completa

### Redes Soportadas:
- Ethereum Mainnet (Chain ID: 1)
- Polygon (Chain ID: 137)
- Optimism (Chain ID: 10)
- Arbitrum One (Chain ID: 42161)
- Goerli Testnet (Chain ID: 5)
- Sepolia Testnet (Chain ID: 11155111)

## 📊 Ejemplos de Configuración

### Ejemplo 1: Token UVT en Ethereum Mainnet
```javascript
GOVERNANCE_TOKEN: {
  address: '0x7b65B0E7e6e8C9f6e94fA6F8c4F8c4D0e9f8a6e5',
  minBalance: 50,
  name: 'UltraVioleta Token',
  symbol: 'UVT'
},
validationType: 'token'
```

### Ejemplo 2: NFT de Membresía en Polygon
```javascript
MEMBERSHIP_NFT: {
  address: '0x9b65B0E7e6e8C9f6e94fA6F8c4F8c4D0e9f8a6e5',
  name: 'UltraVioleta DAO Member',
  symbol: 'UVDMEM'
},
validationType: 'nft'
```

## 🔍 Cómo Funciona

1. **Usuario se autentica**: Hace login en la plataforma
2. **Usuario conecta wallet**: Usa Web3Modal para conectar su wallet (MetaMask, Rabby, etc.)
3. **Validación automática**: El sistema verifica si la wallet posee el token/NFT requerido
4. **Acceso concedido/denegado**:
   - ✅ Si tiene el token: Muestra el formulario de creación de bounties
   - ❌ Si NO tiene el token: Muestra mensaje de acceso restringido

## 🎯 Flujo de Usuario

```
Login → Conectar Wallet → Verificación Automática
                                |
                    ┌───────────┴───────────┐
                    ↓                       ↓
            ✅ Tiene Token          ❌ No Tiene Token
                    ↓                       ↓
        Formulario Habilitado    Mensaje de Restricción
```

## 🛠️ Testing

### Para probar en Testnet (Sepolia):

1. Obtén tokens de prueba desde un faucet
2. Despliega un token de prueba o usa uno existente
3. Configura la dirección en `WHITELIST_CONFIG`
4. Conecta tu wallet de prueba
5. Verifica que la validación funcione correctamente

### Token de Prueba en Sepolia (Ejemplo):
```javascript
GOVERNANCE_TOKEN: {
  address: '0x...' // Dirección de un token ERC20 de prueba en Sepolia
  minBalance: 1,
  name: 'Test Token',
  symbol: 'TEST'
},
validationType: 'token'
```

## ⚠️ Consideraciones Importantes

1. **Seguridad**: La validación se hace en el frontend, considera agregar validación en el backend también
2. **Redes**: Asegúrate de que la red de la wallet coincida con la red donde está desplegado el token
3. **Gas Fees**: La consulta de balances NO consume gas (son llamadas de lectura)
4. **Privacidad**: Solo se consulta el balance, no se accede a ninguna información privada

## 🐛 Troubleshooting

### Error: "Error al verificar el token"
- Verifica que la dirección del contrato sea correcta
- Asegúrate de que la wallet esté en la red correcta
- Revisa la consola del navegador para más detalles

### Error: "Acceso Restringido" pero tengo tokens
- Verifica el `minBalance` configurado
- Asegura que los decimales del token sean correctos
- Confirma que estás en la red correcta

### El panel no aparece
- Verifica que el usuario esté autenticado (`isLoggedIn = true`)
- Confirma que el usuario NO sea admin (los admins tienen acceso directo)
- Revisa la consola del navegador para errores

## 📞 Soporte

Para más ayuda o reportar problemas, contacta al equipo de desarrollo de UltraVioleta DAO.

