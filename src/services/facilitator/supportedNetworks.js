// Redes distintas que sirve el facilitador x402, contadas sobre GET /supported.
//
// /supported repite cada red una vez por versión del protocolo: x402 v1 la nombra "base" y v2
// "eip155:8453", y suma un kind más por cada esquema (exact, upto, escrow...). Contar `network` a
// secas duplica (78 cadenas para 39 redes, medido 2026-09-13). Cada kind trae las dos grafías en
// `networkAliases`, así que dos kinds son la misma red si comparten algún nombre.
//
// Devuelve null, nunca 0, cuando no hay kinds utilizables: quien lo muestra cae al texto sin cifra.
export function countFacilitatorNetworks(kinds) {
  if (!Array.isArray(kinds)) return null;
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
  const networks = new Set([...parent.keys()].map(find)).size;
  return networks > 0 ? networks : null;
}
