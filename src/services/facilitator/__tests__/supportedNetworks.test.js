import { countFacilitatorNetworks } from '../supportedNetworks';

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
