import { isAddress } from '@ethersproject/address';
import { normalizeParticipantInput } from './wheelParticipants';

const WALLET = '0xe4dc963c56979E0260fc146b87eE24F18220e545';

test('recorta espacios a ambos lados de la wallet y del usuario', () => {
  const out = normalizeParticipantInput({ wallet: `  ${WALLET}\t`, username: ' ultra ' }, isAddress);
  expect(out).toEqual({ wallet: WALLET, username: 'ultra', swapped: false });
});

test('si el usuario quedó en el campo de wallet y la wallet en el de usuario, los intercambia', () => {
  const out = normalizeParticipantInput({ wallet: 'ultra', username: ` ${WALLET} ` }, isAddress);
  expect(out).toEqual({ wallet: WALLET, username: 'ultra', swapped: true });
});

test('no intercambia cuando ninguno de los dos es una dirección', () => {
  const out = normalizeParticipantInput({ wallet: 'ultra', username: 'otro' }, isAddress);
  expect(out).toEqual({ wallet: 'ultra', username: 'otro', swapped: false });
});
