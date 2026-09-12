import { ethers } from 'ethers';
import {
  applyMultiplier,
  buildCsvContent,
  buildPayoutRows,
  buildSafeOrigin,
  buildSafeTransferTransactions,
  decodeTransfer,
  sumPayout,
} from './wheelAirdrop';

const TOKEN = '0x4Ffe7e01832243e03668E090706F17726c26d6B2';
const WINNERS = [
  { wallet: '0x975c0a087033034FB532bFfCe75b4A604BdaF40a', result: '46368', username: 'a' },
  { wallet: '0xA993838A8Fb36F271B5Fb879658b7466d2083Be6', result: '317811', username: 'b' },
];

test('con x1 el CSV conserva el formato exacto que pega en CSV Airdrop', () => {
  const csv = buildCsvContent(buildPayoutRows(WINNERS, 1), TOKEN);
  expect(csv).toBe(
    'token_type,token_address,receiver,amount,id\n' +
      `erc20,${TOKEN},0x975c0a087033034FB532bFfCe75b4A604BdaF40a,46368,\n` +
      `erc20,${TOKEN},0xA993838A8Fb36F271B5Fb879658b7466d2083Be6,317811,`
  );
});

test('con x10 cada fila y el total se multiplican', () => {
  const rows = buildPayoutRows(WINNERS, 10);
  expect(rows.map((r) => r.amount)).toEqual(['463680', '3178110']);
  expect(sumPayout(rows)).toBe(3641790);
  expect(buildCsvContent(rows, TOKEN)).toContain(',463680,');
});

test('el batch del Safe transfiere exactamente lo que dice el CSV', () => {
  const rows = buildPayoutRows(WINNERS, 5);
  const txs = buildSafeTransferTransactions(rows, TOKEN, 18);
  expect(txs).toHaveLength(rows.length);
  txs.forEach((tx, i) => {
    expect(tx.to).toBe(TOKEN);
    expect(tx.value).toBe('0');
    expect(tx.operation).toBe(0);
    const decoded = decodeTransfer(tx.data);
    expect(decoded.to.toLowerCase()).toBe(rows[i].wallet.toLowerCase());
    expect(decoded.amount).toBe(ethers.utils.parseUnits(rows[i].amount, 18).toString());
  });
});

test('un multiplicador inválido deja el monto intacto', () => {
  expect(applyMultiplier('46368', 0)).toBe('46368');
  expect(applyMultiplier('46368', '')).toBe('46368');
  expect(applyMultiplier('46368', 'abc')).toBe('46368');
});

test('un multiplicador decimal no deja basura de coma flotante', () => {
  expect(applyMultiplier('46368', 0.1)).toBe('4636.8');
  expect(applyMultiplier('46368', 1.5)).toBe('69552');
});

test('el origen que ve Safe lleva nombre, fecha y multiplicador', () => {
  const origin = JSON.parse(
    buildSafeOrigin({ url: 'https://ultravioletadao.xyz/wheel', multiplier: 10, winners: 2, date: new Date(2026, 8, 12) })
  );
  expect(origin.name).toBe('Ruleta UVD');
  expect(origin.url).toBe('https://ultravioletadao.xyz/wheel');
  expect(origin.note).toBe('ruleta 20260912 x10 (2 ganadores)');
});
