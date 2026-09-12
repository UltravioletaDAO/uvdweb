// Normaliza lo que entra como wallet o usuario en la ruleta (formulario manual y canje de Twitch).

// Lo que un copy-paste arrastra sin que se vea: espacios de cualquier tipo, saltos de línea,
// espacio de ancho cero (U+200B..U+200D), word joiner (U+2060), BOM (U+FEFF), NBSP (U+00A0).
// Medido 2026-09-12: String.prototype.trim() quita espacios, NBSP y BOM, pero NO el ancho
// cero ni el word joiner, y con esos dos al final una wallet válida falla isAddress.
const INVISIBLE_OR_SPACE = /[\s ᠎​-‍⁠﻿]/g;

// Una wallet no lleva espacios en ningún lado: se quita todo lo invisible, no solo los bordes.
export const cleanWalletInput = (value) => String(value ?? '').replace(INVISIBLE_OR_SPACE, '');

const HEX_ADDRESS = /^0x[0-9a-fA-F]{40}$/;

// Por qué una wallet no pasa: 'checksum' si es hex de 40 con mayúsculas alteradas (EIP-55),
// 'invalid' en cualquier otro caso. Sirve para que el mensaje diga qué corregir.
export const describeInvalidAddress = (wallet, isValidAddress) => {
  if (isValidAddress(wallet)) return null;
  if (HEX_ADDRESS.test(wallet) && wallet !== wallet.toLowerCase()) return 'checksum';
  return 'invalid';
};

// Recorta espacios del usuario, limpia la wallet y, si la wallet vino en el campo de usuario
// (y el campo de wallet trae algo que no es una dirección), intercambia los dos campos.
export const normalizeParticipantInput = ({ wallet = '', username = '' }, isValidAddress) => {
  let cleanWallet = cleanWalletInput(wallet);
  let cleanUsername = String(username ?? '').trim();
  let swapped = false;

  const usernameAsWallet = cleanWalletInput(cleanUsername);
  if (!isValidAddress(cleanWallet) && isValidAddress(usernameAsWallet)) {
    [cleanWallet, cleanUsername] = [usernameAsWallet, cleanWallet];
    swapped = true;
  }

  return { wallet: cleanWallet, username: cleanUsername, swapped };
};
