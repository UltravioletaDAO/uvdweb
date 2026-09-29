// Redes distintas que sirve el facilitador x402, leídas de GET /supported (y de GET /networks.json).
//
// /supported repite cada red una vez por versión del protocolo: x402 v1 la nombra "base" y v2
// "eip155:8453", y suma un kind más por cada esquema (exact, upto, escrow...). Contar `network` a
// secas duplica (78 cadenas para 39 redes, medido 2026-09-13). Cada kind trae las dos grafías en
// `networkAliases`, así que dos kinds son la misma red si comparten algún nombre.
//
// Este módulo es la única regla del sitio para eso: el pulso, las ventanas de /ecosystem, la tool
// get_facilitator_networks y la ficha /facilitator cuentan y listan con estas funciones.

// Hostnames de testnet en /supported del facilitador (sepolia, fuji, amoy, devnet, testnet).
export const isTestnet = (network) =>
  typeof network === 'string' && /sepolia|testnet|devnet|fuji|amoy/i.test(network);

const isCaip2 = (name) => typeof name === 'string' && name.includes(':');

/** El <id> de un CAIP-2 eip155:<id>, o null si la red no es EVM. */
export function chainIdFromCaip2(caip2) {
  const match = typeof caip2 === 'string' ? /^eip155:(\d+)$/.exec(caip2) : null;
  return match ? Number(match[1]) : null;
}

/**
 * Las redes distintas de los kinds de /supported, en el orden en que aparecen.
 *
 * Cada red: { id, name, caip2, chainId, testnet, aliases }. `id` (y `name`, que acá es el mismo) es
 * el nombre v1 ("base") y, si la red no tiene (Hedera nativa solo llega en CAIP-2), su CAIP-2: la
 * misma regla con la que el facilitador arma el `id` de /networks.json, y un valor que /supported
 * acepta como `network`.
 * Devuelve [] cuando no hay kinds utilizables.
 */
export function listFacilitatorNetworks(kinds) {
  if (!Array.isArray(kinds)) return [];
  const parent = new Map();
  const find = (name) => {
    let root = name;
    while (parent.get(root) !== root) root = parent.get(root);
    return root;
  };
  kinds.forEach((kind) => {
    if (!kind || typeof kind.network !== 'string' || !kind.network) return;
    const aliases = Array.isArray(kind.networkAliases) ? kind.networkAliases : [];
    const names = [kind.network, ...aliases.filter((a) => typeof a === 'string' && a)];
    names.forEach((name) => {
      if (!parent.has(name)) parent.set(name, name);
    });
    const root = find(names[0]);
    names.forEach((name) => {
      const other = find(name);
      if (other !== root) parent.set(other, root);
    });
  });

  const groups = new Map();
  [...parent.keys()].forEach((name) => {
    const root = find(name);
    if (!groups.has(root)) groups.set(root, []);
    groups.get(root).push(name);
  });

  return [...groups.values()].map((aliases) => {
    const id = aliases.find((a) => !isCaip2(a)) || aliases[0];
    const caip2 = aliases.find(isCaip2) || null;
    return {
      id,
      name: id,
      caip2,
      chainId: chainIdFromCaip2(caip2),
      testnet: aliases.some(isTestnet),
      aliases,
    };
  });
}

// Devuelve null, nunca 0, cuando no hay kinds utilizables: quien lo muestra cae al texto sin cifra.
export function countFacilitatorNetworks(kinds) {
  const networks = listFacilitatorNetworks(kinds).length;
  return networks > 0 ? networks : null;
}

/**
 * Las filas de GET /networks.json (la presentación que publica el propio facilitador: displayName,
 * chainId, testnet) con la misma forma que listFacilitatorNetworks. El chainId es el que trae la
 * fila o el del CAIP-2; nada se completa por fuera. null si el documento no trae filas utilizables.
 */
export function networksFromNetworksJson(json) {
  const rows = json && Array.isArray(json.networks) ? json.networks : [];
  const networks = rows
    .filter((row) => row && typeof row.id === 'string' && row.id)
    .map((row) => {
      const caip2 = typeof row.caip2 === 'string' && row.caip2 ? row.caip2 : null;
      return {
        name: typeof row.displayName === 'string' && row.displayName ? row.displayName : row.id,
        id: row.id,
        caip2,
        chainId: Number.isInteger(row.chainId) ? row.chainId : chainIdFromCaip2(caip2),
        testnet: typeof row.testnet === 'boolean' ? row.testnet : isTestnet(row.id) || isTestnet(caip2),
      };
    });
  return networks.length ? networks : null;
}
