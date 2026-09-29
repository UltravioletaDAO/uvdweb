// El pulso y la ventana fac_supported cuentan redes distintas del facilitador, no cadenas `network`.
//
// /supported nombra cada red dos veces (v1 "base" y CAIP-2 "eip155:8453"); contar `network` a secas
// daba el doble. La cifra esperada se calcula acá, desde los kinds del replay grabado, con otra regla
// (una red = un conjunto de networkAliases), para no comparar la función consigo misma.
import { loadSnapshot } from '../../../../../services/ecosystem/endpoints';
import { selectSupported as selectPulse } from '../PulseTerm';
import { selectSupported as selectFacSupported } from '../FacSupportedTerm';

const replay = require('../../../../../data/ecosystem/replays/facilitator_supported.json');

const kinds = replay.json.kinds;
const groupKey = (kind) => [...kind.networkAliases].sort().join('|');
const EXPECTED_NETWORKS = new Set(kinds.map(groupKey)).size;
const NAIVE_NETWORKS = new Set(kinds.map((kind) => kind.network)).size;

// De cualquier grafía (v1 o CAIP-2) a su red.
const networkOf = new Map(kinds.flatMap((kind) => kind.networkAliases.map((alias) => [alias, groupKey(kind)])));

describe('replay de /supported', () => {
  it('trae networkAliases en todos los kinds (sin eso el oráculo del test no vale)', () => {
    expect(kinds.length).toBeGreaterThan(0);
    kinds.forEach((kind) => {
      expect(Array.isArray(kind.networkAliases)).toBe(true);
      expect(kind.networkAliases).toContain(kind.network);
    });
    expect(NAIVE_NETWORKS).toBeGreaterThan(EXPECTED_NETWORKS);
  });
});

describe('pulso del ecosistema — redes del facilitador', () => {
  it('ENDPOINTS.facilitator_supported (lo que usan el pulso y get_ecosystem_pulse) da las redes distintas', async () => {
    const snapshot = await loadSnapshot('facilitator_supported');
    expect(snapshot.value).toEqual({ kinds: kinds.length, networks: EXPECTED_NETWORKS });
    expect(snapshot.value.networks).not.toBe(NAIVE_NETWORKS);
  });

  it('la ventana pulse@uvd cuenta lo mismo sobre el replay', () => {
    expect(selectPulse(replay.json)).toEqual({ kinds: kinds.length, networks: EXPECTED_NETWORKS });
  });
});

describe('ventana fac_supported — lista de mainnets', () => {
  const value = selectFacSupported(replay.json);

  it('cuenta las redes distintas', () => {
    expect(value.networks).toBe(EXPECTED_NETWORKS);
  });

  it('ninguna red aparece dos veces entre las mainnets (ni con su otra grafía)', () => {
    const networks = value.mainnets.map((name) => networkOf.get(name));
    expect(networks.every(Boolean)).toBe(true);
    expect(new Set(networks).size).toBe(value.mainnets.length);
  });

  it('no mezcla testnets en la lista de mainnets', () => {
    const testnetNames = /sepolia|testnet|devnet|fuji|amoy/i;
    value.mainnets.forEach((name) => {
      const aliases = [...networkOf.entries()].filter(([, key]) => key === networkOf.get(name)).map(([alias]) => alias);
      expect(aliases.some((alias) => testnetNames.test(alias))).toBe(false);
    });
  });
});
