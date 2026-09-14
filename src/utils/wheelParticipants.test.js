import { isAddress } from '@ethersproject/address';
import { cleanWalletInput, describeInvalidAddress, normalizeParticipantInput } from './wheelParticipants';

const WALLET = '0xe4dc963c56979E0260fc146b87eE24F18220e545';

test('recorta espacios a ambos lados de la wallet y del usuario', () => {
  const out = normalizeParticipantInput({ wallet: `  ${WALLET}\t`, username: ' ultra ' }, isAddress);
  expect(out).toEqual({ wallet: WALLET, username: 'ultra', swapped: false });
});

test('quita los caracteres invisibles que trim() deja pasar (ancho cero, word joiner, BOM, NBSP)', () => {
  const sucia = `﻿ ${WALLET}​​⁠ \n`;
  expect(isAddress(sucia.trim())).toBe(false); // el bug medido: trim no alcanza
  expect(cleanWalletInput(sucia)).toBe(WALLET);
  expect(isAddress(cleanWalletInput(sucia))).toBe(true);
});

test('quita espacios y saltos de línea dentro de la wallet, no solo en los bordes', () => {
  expect(cleanWalletInput('0xe4dc963c 56979E0260fc146b87eE24F1\n8220e545')).toBe(WALLET);
});

test('si el usuario quedó en el campo de wallet y la wallet en el de usuario, los intercambia', () => {
  const out = normalizeParticipantInput({ wallet: 'ultra', username: ` ${WALLET}​ ` }, isAddress);
  expect(out).toEqual({ wallet: WALLET, username: 'ultra', swapped: true });
});

test('no intercambia cuando ninguno de los dos es una dirección', () => {
  const out = normalizeParticipantInput({ wallet: 'ultra', username: 'otro' }, isAddress);
  expect(out).toEqual({ wallet: 'ultra', username: 'otro', swapped: false });
});

test('explica por qué una wallet no pasa: checksum alterado vs inválida', () => {
  expect(describeInvalidAddress(WALLET, isAddress)).toBeNull();
  expect(describeInvalidAddress(WALLET.toLowerCase(), isAddress)).toBeNull();
  expect(describeInvalidAddress('0xe4dc963c56979e0260fc146b87eE24F18220e545', isAddress)).toBe('checksum');
  expect(describeInvalidAddress('0x1234', isAddress)).toBe('invalid');
  expect(describeInvalidAddress('ultra', isAddress)).toBe('invalid');
});
