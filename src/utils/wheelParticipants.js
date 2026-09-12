// Normaliza lo que se escribe en el formulario de nuevo participante de la ruleta.
// Recorta espacios a ambos lados y, si la wallet vino en el campo de usuario (y el
// campo de wallet trae algo que no es una dirección), intercambia los dos campos.
export const normalizeParticipantInput = ({ wallet = '', username = '' }, isValidAddress) => {
  let cleanWallet = String(wallet).trim();
  let cleanUsername = String(username).trim();
  let swapped = false;

  if (!isValidAddress(cleanWallet) && isValidAddress(cleanUsername)) {
    [cleanWallet, cleanUsername] = [cleanUsername, cleanWallet];
    swapped = true;
  }

  return { wallet: cleanWallet, username: cleanUsername, swapped };
};
