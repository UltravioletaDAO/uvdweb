// Fuente única de las colecciones NFT del DAO: la consume /nfts (NFTPage) para renderizar
// y las tools WebMCP (agent/tools.js) para responderle a un agente. Las descripciones
// visibles siguen viniendo de i18n (nft.<id>.description); acá va solo el dato duro.
export const NFT_COLLECTIONS = {
  echoes: {
    name: 'Echoes by Ultravioleta DAO',
    totalSupply: 89,
    chain: 'Avalanche',
    contract: '0x6d08557830959b3441d269145b32dab93206b3d2',
    marketplaceUrl: 'https://salvor.io/collections/0x6d08557830959b3441d269145b32dab93206b3d2',
    stats: {
      uniqueOwners: 52,
      listed: 1,
      royalty: '5%'
    }
  },
  vulvas: {
    name: 'Vulvas de Vulvas, Penes de Penes y Baretos de Baret',
    chain: 'Ethereum',
    marketplaceUrl: 'https://opensea.io/collection/vulvas-de-vulvas-penes-de-penes-y-baretos-de-baret',
    stats: {}
  }
};
