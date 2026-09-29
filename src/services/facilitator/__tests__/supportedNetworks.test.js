import {
  countFacilitatorNetworks,
  listFacilitatorNetworks,
  networksFromNetworksJson,
  chainIdFromCaip2,
  isTestnet,
} from '../supportedNetworks';

// Recorte fiel de GET https://facilitator.ultravioletadao.xyz/supported (medido 2026-09-13):
// cada red aparece como kind v1 ("base") y como kind v2 ("eip155:8453"), y los dos traen
// ambas grafías en networkAliases. Contar `network` a secas da el doble (78 para 39 redes).
const BASE = ['base', 'eip155:8453'];
const SOLANA = ['solana', 'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp'];
const FUJI = ['avalanche-fuji', 'eip155:43113'];

const kind = (x402Version, network, networkAliases, scheme = 'exact') => ({
  x402Version,
  scheme,
  network,
  networkAliases,
});

describe('countFacilitatorNetworks — redes distintas de /supported', () => {
  it('cuenta una sola vez la red que /supported lista en v1 y en CAIP-2', () => {
    const kinds = [
      kind(1, 'base', BASE),
      kind(2, 'eip155:8453', BASE),
      kind(1, 'solana', SOLANA),
      kind(2, SOLANA[1], SOLANA),
      kind(1, 'avalanche-fuji', FUJI),
      kind(2, 'eip155:43113', FUJI),
    ];
    // El conteo ingenuo (el que daba "78 redes" en vivo) duplica cada red.
    expect(new Set(kinds.map((k) => k.network)).size).toBe(6);
    expect(countFacilitatorNetworks(kinds)).toBe(3);
  });

  it('varios esquemas sobre la misma red no suman redes', () => {
    const kinds = [
      kind(1, 'base', BASE, 'exact'),
      kind(2, 'eip155:8453', BASE, 'upto'),
      kind(2, 'eip155:8453', BASE, 'escrow'),
    ];
    expect(countFacilitatorNetworks(kinds)).toBe(1);
  });

  it('un kind sin networkAliases cuenta por su network', () => {
    const kinds = [kind(1, 'base', BASE), { x402Version: 1, scheme: 'exact', network: 'monad' }];
    expect(countFacilitatorNetworks(kinds)).toBe(2);
  });

  it('sin kinds utilizables devuelve null, nunca 0 (la página muestra el texto sin cifra)', () => {
    expect(countFacilitatorNetworks(undefined)).toBeNull();
    expect(countFacilitatorNetworks(null)).toBeNull();
    expect(countFacilitatorNetworks('kinds')).toBeNull();
    expect(countFacilitatorNetworks([])).toBeNull();
    expect(countFacilitatorNetworks([{}, null, { network: '' }])).toBeNull();
  });
});

describe('listFacilitatorNetworks — una entrada por red, con su nombre, su CAIP-2 y si es testnet', () => {
  const HEDERA = 'hedera:mainnet';

  it('agrupa v1 y CAIP-2 en una red con el nombre v1, el CAIP-2 y el chain id del CAIP-2', () => {
    const networks = listFacilitatorNetworks([
      kind(1, 'base', BASE),
      kind(2, 'eip155:8453', BASE, 'upto'),
      kind(1, 'solana', SOLANA),
      kind(2, SOLANA[1], SOLANA),
      kind(1, 'avalanche-fuji', FUJI),
    ]);
    expect(networks.map(({ aliases, ...n }) => n)).toEqual([
      { id: 'base', name: 'base', caip2: 'eip155:8453', chainId: 8453, testnet: false },
      { id: 'solana', name: 'solana', caip2: SOLANA[1], chainId: null, testnet: false },
      { id: 'avalanche-fuji', name: 'avalanche-fuji', caip2: 'eip155:43113', chainId: 43113, testnet: true },
    ]);
  });

  it('una red que solo llega en CAIP-2 (Hedera nativa) no desaparece: su nombre es el CAIP-2', () => {
    const networks = listFacilitatorNetworks([
      kind(2, HEDERA, [HEDERA]),
      kind(2, 'hedera:testnet', ['hedera:testnet']),
    ]);
    expect(networks.map((n) => [n.name, n.testnet])).toEqual([
      [HEDERA, false],
      ['hedera:testnet', true],
    ]);
  });

  it('sin kinds devuelve una lista vacía', () => {
    expect(listFacilitatorNetworks(undefined)).toEqual([]);
    expect(listFacilitatorNetworks([null, {}])).toEqual([]);
  });

  it('chainIdFromCaip2 solo lee el <id> de eip155:<id>', () => {
    expect(chainIdFromCaip2('eip155:999')).toBe(999);
    expect(chainIdFromCaip2(SOLANA[1])).toBeNull();
    expect(chainIdFromCaip2('eip155:')).toBeNull();
    expect(chainIdFromCaip2(null)).toBeNull();
  });

  it('isTestnet reconoce los nombres de testnet de /supported y nada más', () => {
    ['base-sepolia', 'avalanche-fuji', 'polygon-amoy', 'solana-devnet', 'hedera:testnet'].forEach((n) =>
      expect(isTestnet(n)).toBe(true)
    );
    ['base', 'hyperevm', 'eip155:999', HEDERA, undefined].forEach((n) => expect(isTestnet(n)).toBe(false));
  });
});

describe('networksFromNetworksJson — filas de GET /networks.json', () => {
  it('toma displayName, chainId y testnet de cada fila; el chainId ausente sale del CAIP-2', () => {
    const networks = networksFromNetworksJson({
      networks: [
        { id: 'hyperevm', caip2: 'eip155:999', chainId: 999, testnet: false, displayName: 'HyperEVM' },
        { id: 'hyperevm-testnet', caip2: 'eip155:998', testnet: true, displayName: 'HyperEVM Testnet' },
        { id: 'solana', caip2: SOLANA[1], chainId: null, testnet: false, displayName: 'Solana' },
        { id: 'monad', caip2: 'eip155:143', chainId: 143 },
        { caip2: 'eip155:1' },
      ],
    });
    expect(networks).toEqual([
      { id: 'hyperevm', name: 'HyperEVM', caip2: 'eip155:999', chainId: 999, testnet: false },
      { id: 'hyperevm-testnet', name: 'HyperEVM Testnet', caip2: 'eip155:998', chainId: 998, testnet: true },
      { id: 'solana', name: 'Solana', caip2: SOLANA[1], chainId: null, testnet: false },
      { id: 'monad', name: 'monad', caip2: 'eip155:143', chainId: 143, testnet: false },
    ]);
  });

  it('sin filas utilizables devuelve null', () => {
    expect(networksFromNetworksJson(null)).toBeNull();
    expect(networksFromNetworksJson({})).toBeNull();
    expect(networksFromNetworksJson({ networks: [{ displayName: 'x' }] })).toBeNull();
  });
});

describe('la regla de testnet vive en un solo archivo', () => {
  const fs = require('fs');
  const path = require('path');
  const SRC = path.join(__dirname, '..', '..', '..');
  const sources = (dir) =>
    fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) return entry.name === '__tests__' ? [] : sources(full);
      return /\.(js|jsx)$/.test(entry.name) ? [full] : [];
    });
  const definesTestnetRule = (text) =>
    /\b(const|let|var|function)\s+isTestnet\b/.test(text) || text.includes('sepolia|testnet|devnet|fuji|amoy');

  it('solo src/services/facilitator/supportedNetworks.js define isTestnet', () => {
    const files = sources(SRC)
      .filter((file) => definesTestnetRule(fs.readFileSync(file, 'utf8')))
      .map((file) => path.relative(SRC, file).split(path.sep).join('/'));
    expect(files).toEqual(['services/facilitator/supportedNetworks.js']);
  });
});
