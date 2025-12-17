import { useState, useCallback } from 'react';
import { validateWhitelist } from '../utils/tokenValidation';

/**
 * Custom hook para manejar la validación de whitelist (UVD token)
 * @returns {Object} Estado y funciones para manejar la whitelist
 */
const useWhitelist = () => {
  const [isWhitelisted, setIsWhitelisted] = useState(false);
  const [whitelistDetails, setWhitelistDetails] = useState(null);
  const [checkingWhitelist, setCheckingWhitelist] = useState(false);
  const [tokenBalance, setTokenBalance] = useState(0);

  // Verificar si el usuario está en la whitelist
  const checkWhitelistStatus = useCallback(async (address, provider) => {
    if (!address || !provider) {
      setIsWhitelisted(false);
      setWhitelistDetails(null);
      setTokenBalance(0);
      return { isWhitelisted: false, details: null };
    }

    setCheckingWhitelist(true);
    try {
      const result = await validateWhitelist(address, provider);
      setIsWhitelisted(result.isWhitelisted);
      setWhitelistDetails(result.details);

      if (result.details?.balance) {
        setTokenBalance(parseFloat(result.details.balance));
      }

      return result;
    } catch (error) {
      setIsWhitelisted(false);
      setWhitelistDetails({ error: error.message });
      return { isWhitelisted: false, details: { error: error.message } };
    } finally {
      setCheckingWhitelist(false);
    }
  }, []);

  // Resetear el estado de whitelist
  const resetWhitelist = useCallback(() => {
    setIsWhitelisted(false);
    setWhitelistDetails(null);
    setTokenBalance(0);
    setCheckingWhitelist(false);
  }, []);

  return {
    isWhitelisted,
    whitelistDetails,
    checkingWhitelist,
    tokenBalance,
    checkWhitelistStatus,
    resetWhitelist,
  };
};

export default useWhitelist;
