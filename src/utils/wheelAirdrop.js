import { ethers } from 'ethers';

// Fuente única de los montos que salen de la ruleta: el CSV que se copia, el airdrop
// directo desde la EOA y la propuesta al Safe se arman todos desde estas filas.

// Formato de la app CSV Airdrop de Safe (la columna id va vacía en cada fila).
export const CSV_HEADER = 'token_type,token_address,receiver,amount,id';

const ERC20_TRANSFER_IFACE = new ethers.utils.Interface([
  'function transfer(address to, uint256 amount) returns (bool)',
]);

// Multiplica un resultado de la ruleta (tokens enteros) por el multiplicador del día.
// Multiplicador inválido o no positivo deja el monto tal cual.
export const applyMultiplier = (amount, multiplier) => {
  const base = Number(amount);
  const mult = Number(multiplier);
  if (!Number.isFinite(base) || !Number.isFinite(mult) || mult <= 0) return String(amount);
  const value = base * mult;
  if (Number.isInteger(value)) return String(value);
  // Recorta la basura de coma flotante (46368 * 0.1 = 4636.800000000001)
  return parseFloat(value.toFixed(8)).toString();
};

export const buildPayoutRows = (completedParticipants, multiplier = 1) =>
  completedParticipants.map((p) => ({
    wallet: p.wallet,
    amount: applyMultiplier(p.result, multiplier),
  }));

export const sumPayout = (rows) => rows.reduce((sum, row) => sum + Number(row.amount), 0);

export const buildCsvContent = (rows, token) => {
  const content = rows.map((row) => `erc20,${token},${row.wallet},${row.amount}`).join(',\n');
  return `${CSV_HEADER}\n${content},`;
};

// Un transfer del token por ganador; Protocol Kit los envuelve en MultiSendCallOnly.
export const buildSafeTransferTransactions = (rows, token, decimals = 18) =>
  rows.map((row) => ({
    to: token,
    value: '0',
    data: ERC20_TRANSFER_IFACE.encodeFunctionData('transfer', [
      row.wallet,
      ethers.utils.parseUnits(row.amount, decimals).toString(),
    ]),
    operation: 0,
  }));

export const decodeTransfer = (data) => {
  const [to, amount] = ERC20_TRANSFER_IFACE.decodeFunctionData('transfer', data);
  return { to, amount: amount.toString() };
};

// Lo que Safe muestra como origen de la transacción en la cola (nombre y nota).
export const buildSafeOrigin = ({ url, multiplier, winners, date = new Date() }) => {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return JSON.stringify({
    url,
    name: 'Ruleta UVD',
    note: `ruleta ${yyyy}${mm}${dd} x${multiplier} (${winners} ganadores)`,
  });
};
