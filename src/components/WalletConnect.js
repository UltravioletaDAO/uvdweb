import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { ethers } from 'ethers';
import makeBlockie from 'ethereum-blockies-base64';

/**
 * WalletConnect con soporte para EIP-6963 (Multi-wallet detection)
 *
 * EIP-6963 es el estándar moderno que permite detectar TODAS las wallets instaladas,
 * incluso cuando una wallet (como Brave) toma control de window.ethereum
 */

const WalletConnect = ({ onWalletConnected, onWalletDisconnected }) => {
  const { t } = useTranslation();
  const [isConnected, setIsConnected] = useState(false);
  const [account, setAccount] = useState(null);
  const [ensName, setEnsName] = useState(null);
  const [ensAvatar, setEnsAvatar] = useState(null);
  const [error, setError] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [availableWallets, setAvailableWallets] = useState([]);
  const [showWalletSelector, setShowWalletSelector] = useState(false);
  const [connectedWalletName, setConnectedWalletName] = useState(null);
  const selectedProviderRef = useRef(null);
  const providerRef = useRef(null);
  const eip6963ProvidersRef = useRef(new Map());
  const accountRef = useRef(null); // Ref para tener acceso al account actual en los listeners

  /**
   * Detectar wallets usando EIP-6963
   * Este es el método moderno y correcto para detectar múltiples wallets
   */
  useEffect(() => {
    const wallets = [];

    // Handler para EIP-6963
    const handleAnnounceProvider = (event) => {
      const { info, provider } = event.detail;

      // Evitar duplicados
      if (!eip6963ProvidersRef.current.has(info.uuid)) {
        eip6963ProvidersRef.current.set(info.uuid, { info, provider });

        // Actualizar estado con todas las wallets detectadas
        const allWallets = Array.from(eip6963ProvidersRef.current.values()).map(({ info, provider }) => ({
          id: info.uuid,
          name: info.name,
          icon: info.icon, // SVG o URL de imagen
          provider: provider
        }));

        setAvailableWallets(allWallets);
      }
    };

    // Escuchar anuncios de wallets (EIP-6963)
    window.addEventListener('eip6963:announceProvider', handleAnnounceProvider);

    // Solicitar que las wallets se anuncien
    window.dispatchEvent(new Event('eip6963:requestProvider'));

    // Fallback: después de 500ms, si no hay wallets EIP-6963, usar método legacy
    const fallbackTimeout = setTimeout(() => {
      if (eip6963ProvidersRef.current.size === 0) {
        detectLegacyProviders();
      }
    }, 500);

    return () => {
      window.removeEventListener('eip6963:announceProvider', handleAnnounceProvider);
      clearTimeout(fallbackTimeout);
    };
  }, []);

  /**
   * Método legacy para detectar wallets (cuando EIP-6963 no está disponible)
   */
  const detectLegacyProviders = () => {
    const wallets = [];

    if (typeof window === 'undefined' || !window.ethereum) {
      setAvailableWallets([]);
      return;
    }

    // Método 1: window.ethereum.providers (array de múltiples wallets)
    if (window.ethereum.providers && Array.isArray(window.ethereum.providers)) {
      window.ethereum.providers.forEach((provider, index) => {
        const info = identifyLegacyProvider(provider);
        if (info) {
          wallets.push({
            id: `legacy-${info.id}-${index}`,
            name: info.name,
            icon: info.icon,
            provider: provider
          });
        }
      });
    }

    // Método 2: Solo window.ethereum
    if (wallets.length === 0 && window.ethereum) {
      const info = identifyLegacyProvider(window.ethereum);
      wallets.push({
        id: 'legacy-default',
        name: info?.name || 'Browser Wallet',
        icon: info?.icon || '🔐',
        provider: window.ethereum
      });
    }

    setAvailableWallets(wallets);
  };

  /**
   * Identifica el proveedor legacy basado en sus flags
   */
  const identifyLegacyProvider = (provider) => {
    if (!provider) return null;

    if (provider.isRabby) return { id: 'rabby', name: 'Rabby', icon: '🐰' };
    if (provider.isBraveWallet) return { id: 'brave', name: 'Brave Wallet', icon: '🦁' };
    if (provider.isMetaMask && !provider.isRabby && !provider.isBraveWallet) {
      return { id: 'metamask', name: 'MetaMask', icon: '🦊' };
    }
    if (provider.isCoinbaseWallet) return { id: 'coinbase', name: 'Coinbase', icon: '🔵' };
    if (provider.isAvalanche || provider.isCore) return { id: 'core', name: 'Core', icon: '❄️' };
    if (provider.isTrust) return { id: 'trust', name: 'Trust', icon: '🛡️' };
    if (provider.isPhantom) return { id: 'phantom', name: 'Phantom', icon: '👻' };
    if (provider.isMetaMask) return { id: 'metamask-compat', name: 'MetaMask Compatible', icon: '🔗' };

    return { id: 'unknown', name: 'Wallet', icon: '🔐' };
  };

  // Limpiar error después de unos segundos
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const fetchENS = async (address, provider) => {
    try {
      const ens = await provider.lookupAddress(address);
      setEnsName(ens);
      if (ens) {
        const avatar = await provider.getAvatar(ens);
        setEnsAvatar(avatar);
      } else {
        setEnsAvatar(null);
      }
    } catch {
      // ENS lookup failed silently
      setEnsName(null);
      setEnsAvatar(null);
    }
  };

  /**
   * Desconecta la wallet
   * IMPORTANTE: Debe estar definido ANTES de setupListeners para evitar referencia circular
   */
  const disconnectWallet = useCallback(async () => {
    // Limpiar listeners
    if (selectedProviderRef.current?._handlers) {
      const { onAccountsChanged, onChainChanged } = selectedProviderRef.current._handlers;
      selectedProviderRef.current.removeListener('accountsChanged', onAccountsChanged);
      selectedProviderRef.current.removeListener('chainChanged', onChainChanged);
    }

    // Intentar revocar permisos
    if (selectedProviderRef.current) {
      try {
        await selectedProviderRef.current.request({
          method: 'wallet_revokePermissions',
          params: [{ eth_accounts: {} }],
        });
      } catch {
        // wallet_revokePermissions may not be supported by all wallets
      }
    }

    setIsConnected(false);
    setAccount(null);
    accountRef.current = null;
    setEnsName(null);
    setEnsAvatar(null);
    setError(null);
    setConnectedWalletName(null);
    selectedProviderRef.current = null;
    providerRef.current = null;

    if (onWalletDisconnected) onWalletDisconnected();
  }, [onWalletDisconnected]);

  /**
   * Configura listeners de eventos
   * IMPORTANTE: Usamos accountRef.current en lugar de account para evitar problemas de closure
   */
  const setupListeners = useCallback((provider) => {
    if (!provider) return;

    // Remover listeners anteriores si existen
    if (provider._handlers) {
      const { onAccountsChanged: oldAccountsHandler, onChainChanged: oldChainHandler } = provider._handlers;
      provider.removeListener('accountsChanged', oldAccountsHandler);
      provider.removeListener('chainChanged', oldChainHandler);
    }

    const onAccountsChanged = async (accounts) => {
      if (!accounts || accounts.length === 0) {
        disconnectWallet();
        return;
      }

      const newAddress = accounts[0];
      const currentAccount = accountRef.current;

      // Solo actualizar si la cuenta realmente cambió
      if (newAddress.toLowerCase() !== currentAccount?.toLowerCase()) {
        // Recrear el provider para evitar errores de red cacheada
        const newEthersProvider = new ethers.providers.Web3Provider(provider, 'any');
        providerRef.current = newEthersProvider;

        setAccount(newAddress);
        accountRef.current = newAddress;

        try {
          await fetchENS(newAddress, newEthersProvider);
          const network = await newEthersProvider.getNetwork();
          if (onWalletConnected) {
            onWalletConnected(newAddress, network.chainId, newEthersProvider);
          }
        } catch {
          // Account change update failed silently
        }
      }
    };

    const onChainChanged = async (chainIdHex) => {
      // Recrear el provider con la nueva red
      const newEthersProvider = new ethers.providers.Web3Provider(provider, 'any');
      providerRef.current = newEthersProvider;

      const chainId = parseInt(chainIdHex, 16);
      const currentAccount = accountRef.current;

      if (onWalletConnected && currentAccount) {
        onWalletConnected(currentAccount, chainId, newEthersProvider);
      }
    };

    provider.on('accountsChanged', onAccountsChanged);
    provider.on('chainChanged', onChainChanged);
    provider._handlers = { onAccountsChanged, onChainChanged };
  }, [onWalletConnected, disconnectWallet]);

  /**
   * Conecta con una wallet específica
   */
  const connectWithWallet = useCallback(async (wallet) => {
    setError(null);
    setIsConnecting(true);
    setShowWalletSelector(false);

    try {
      const provider = wallet.provider;
      selectedProviderRef.current = provider;

      // Solicitar permisos para abrir selector de cuenta
      try {
        await provider.request({
          method: 'wallet_requestPermissions',
          params: [{ eth_accounts: {} }],
        });
      } catch (permError) {
        if (permError.code === 4001) throw permError;
      }

      // Solicitar cuentas
      const accounts = await provider.request({
        method: 'eth_requestAccounts',
      });

      if (!accounts || accounts.length === 0) {
        throw new Error('No se seleccionó ninguna cuenta');
      }

      const address = accounts[0];
      // 'any' permite que el provider funcione con cualquier red sin cachear
      const ethersProvider = new ethers.providers.Web3Provider(provider, 'any');
      providerRef.current = ethersProvider;

      const chainIdHex = await provider.request({ method: 'eth_chainId' });
      const chainId = parseInt(chainIdHex, 16);

      setAccount(address);
      accountRef.current = address; // Mantener ref actualizada
      setIsConnected(true);
      setConnectedWalletName(wallet.name);
      await fetchENS(address, ethersProvider);

      if (onWalletConnected) {
        onWalletConnected(address, chainId, ethersProvider);
      }

      // Configurar listeners
      setupListeners(provider);

    } catch (err) {
      selectedProviderRef.current = null;
      providerRef.current = null;

      if (err.code === 4001 || err.message?.includes('rejected')) {
        setError(t('wallet.user_rejected') || 'Conexión cancelada');
      } else {
        setError(err.message || 'Error de conexión');
      }
    } finally {
      setIsConnecting(false);
    }
  }, [onWalletConnected, setupListeners]);

  /**
   * Handler del botón conectar
   */
  const handleConnectClick = () => {
    // Re-solicitar anuncios EIP-6963
    window.dispatchEvent(new Event('eip6963:requestProvider'));

    // Esperar un poco para que las wallets respondan
    setTimeout(() => {
      if (availableWallets.length === 0) {
        setError(t('wallet.no_ethereum_provider') || 'No se detectó ninguna wallet.');
        return;
      }

      if (availableWallets.length === 1) {
        connectWithWallet(availableWallets[0]);
      } else {
        setShowWalletSelector(true);
      }
    }, 100);
  };

  /**
   * Cambia de cuenta en la wallet actual
   */
  const switchAccount = useCallback(async () => {
    if (!selectedProviderRef.current || isConnecting) return;

    setError(null);
    setIsConnecting(true);

    try {
      const provider = selectedProviderRef.current;
      const currentAccounts = await provider.request({ method: 'eth_accounts' });
      const currentAddress = currentAccounts[0];

      await provider.request({
        method: 'wallet_requestPermissions',
        params: [{ eth_accounts: {} }],
      });

      const accounts = await provider.request({ method: 'eth_accounts' });

      if (!accounts || accounts.length === 0) {
        throw new Error(t('wallet.connection_error'));
      }

      if (accounts[0].toLowerCase() === currentAddress?.toLowerCase()) {
        setError(t('wallet.select_different_account'));
        return;
      }

      // 'any' permite que el provider funcione con cualquier red sin cachear
      const ethersProvider = new ethers.providers.Web3Provider(provider, 'any');
      providerRef.current = ethersProvider;

      const chainIdHex = await provider.request({ method: 'eth_chainId' });

      setAccount(accounts[0]);
      accountRef.current = accounts[0]; // Mantener ref actualizada
      await fetchENS(accounts[0], ethersProvider);

      if (onWalletConnected) {
        onWalletConnected(accounts[0], parseInt(chainIdHex, 16), ethersProvider);
      }

    } catch (err) {
      if (err.code === 4001) {
        setError(t('wallet.switch_cancelled'));
      } else {
        setError(err.message || t('wallet.connection_error'));
      }
    } finally {
      setIsConnecting(false);
    }
  }, [isConnecting, onWalletConnected]);

  // Render helpers
  const avatarUrl = ensAvatar || (account ? makeBlockie(account) : null);
  const displayName = ensName || (account ? `${account.slice(0, 6)}...${account.slice(-4)}` : '');

  /**
   * Renderiza el icono de la wallet (soporta SVG de EIP-6963 o emoji)
   */
  const renderWalletIcon = (icon) => {
    if (!icon) return '🔐';

    // Si es un data URL (SVG de EIP-6963) o URL de imagen
    if (icon.startsWith('data:') || icon.startsWith('http')) {
      return <img src={icon} alt="" className="w-8 h-8 rounded-md" />;
    }

    // Si es emoji
    return <span className="text-2xl">{icon}</span>;
  };

  return (
    <div className="p-4 bg-background-lighter rounded-lg border border-ultraviolet-darker/20">
      <h3 className="text-lg font-semibold text-text-primary mb-4">
        {t('wallet.voting_panel')}
      </h3>

      {/* Selector de wallets */}
      {showWalletSelector && !isConnected && (
        <div className="mb-4">
          <p className="text-sm text-text-secondary mb-3 text-center">
            {t('wallet.select_provider') || 'Selecciona tu wallet:'}
          </p>
          <div className="space-y-2">
            {availableWallets.map((wallet) => (
              <button
                key={wallet.id}
                onClick={() => connectWithWallet(wallet)}
                disabled={isConnecting}
                className="w-full flex items-center gap-3 p-3 rounded-lg bg-background border border-ultraviolet-darker/10
                  hover:border-ultraviolet-darker/40 hover:bg-ultraviolet-darker/5 transition-all
                  disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {renderWalletIcon(wallet.icon)}
                <span className="text-text-primary font-medium">{wallet.name}</span>
              </button>
            ))}
          </div>
          <button
            onClick={() => setShowWalletSelector(false)}
            className="w-full mt-3 text-sm text-text-secondary hover:text-text-primary transition-colors"
          >
            {t('common.cancel')}
          </button>
        </div>
      )}

      {/* Estado no conectado */}
      {!isConnected && !showWalletSelector && (
        <div className="text-center">
          <button
            onClick={handleConnectClick}
            disabled={isConnecting}
            className="bg-ultraviolet-darker text-text-primary px-6 py-3 rounded-lg font-semibold
              hover:bg-ultraviolet-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isConnecting ? t('wallet.connecting') : t('wallet.connect_wallet')}
          </button>
          {error && (
            <p className="text-red-400 text-sm mt-3 bg-red-900/10 border border-red-500/20 rounded-lg px-3 py-2">
              {error}
            </p>
          )}
          <p className="text-text-secondary text-sm mt-3">
            {t('wallet.supported_wallets')}
          </p>
        </div>
      )}

      {/* Estado conectado */}
      {isConnected && (
        <div className="space-y-4">
          <div className="flex items-center justify-center gap-3 p-3 bg-background rounded-lg border border-ultraviolet-darker/10">
            {avatarUrl && (
              <img src={avatarUrl} alt="avatar" className="w-10 h-10 rounded-full border-2 border-ultraviolet-darker/40" />
            )}
            <div className="text-left">
              <p className="text-text-primary font-semibold">{displayName}</p>
              <p className="text-xs text-text-secondary">
                {connectedWalletName ? `${connectedWalletName} · ` : ''}{t('wallet.connected')}
              </p>
            </div>
          </div>

          {error && (
            <p className="text-red-400 text-sm bg-red-900/10 border border-red-500/20 rounded-lg px-3 py-2 text-center">
              {error}
            </p>
          )}

          <div className="flex gap-2">
            <button
              onClick={switchAccount}
              disabled={isConnecting}
              className="flex-1 bg-ultraviolet-darker/30 text-text-primary px-3 py-2 rounded-lg text-sm font-medium
                hover:bg-ultraviolet-darker/50 transition-colors border border-ultraviolet-darker/20
                disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isConnecting ? '...' : (t('wallet.switch_account') || 'Cuenta')}
            </button>
            <button
              onClick={disconnectWallet}
              className="flex-1 bg-red-900/20 text-red-400 px-3 py-2 rounded-lg text-sm font-medium
                hover:bg-red-900/30 transition-colors border border-red-500/20"
            >
              {t('wallet.disconnect')}
            </button>
          </div>

          {availableWallets.length > 1 && (
            <button
              onClick={() => {
                disconnectWallet();
                setTimeout(() => setShowWalletSelector(true), 100);
              }}
              className="w-full text-sm text-text-secondary hover:text-ultraviolet transition-colors py-2"
            >
              {t('wallet.change_wallet') || 'Cambiar a otra wallet'}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default WalletConnect;
