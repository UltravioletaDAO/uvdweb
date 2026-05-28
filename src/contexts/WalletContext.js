import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { ethers } from 'ethers';

/**
 * WalletContext — centralizes wallet state for the whole app.
 *
 * Exposes: { address, isConnected, provider, chainId, connect, disconnect }
 *
 * - Uses EIP-6963 for wallet detection (same approach as WalletConnect.js).
 * - Falls back to legacy window.ethereum if no EIP-6963 wallets announce themselves.
 * - Persists address in localStorage under 'walletAddress' (same key as before).
 * - `provider` is an ethers.providers.Web3Provider (the signer-capable one).
 *   Snapshot's signing logic can use this directly via provider.getSigner().
 *
 * WalletConnect.js UI component continues to work unchanged via its own callbacks;
 * when it calls onWalletConnected/onWalletDisconnected, those parents (Bounties)
 * now just forward to the context. For Snapshot, we skip WalletConnect entirely
 * and call context.connect() directly.
 */

const WalletContext = createContext(null);

export const useWallet = () => {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error('useWallet must be used inside <WalletProvider>');
  return ctx;
};

export const WalletProvider = ({ children }) => {
  const [address, setAddress] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [provider, setProvider] = useState(null); // ethers.providers.Web3Provider
  const [chainId, setChainId] = useState(null);

  // Raw EIP-6963 / legacy provider ref (needed for listeners + signing)
  const rawProviderRef = useRef(null);
  const addressRef = useRef(null); // stable ref for listener closures
  const eip6963ProvidersRef = useRef(new Map());

  // -------------------------------------------------------------------------
  // EIP-6963 wallet detection — mirrors WalletConnect.js detection logic
  // -------------------------------------------------------------------------
  useEffect(() => {
    const handleAnnounce = (event) => {
      const { info, provider: rawProvider } = event.detail;
      if (!eip6963ProvidersRef.current.has(info.uuid)) {
        eip6963ProvidersRef.current.set(info.uuid, { info, provider: rawProvider });
      }
    };

    window.addEventListener('eip6963:announceProvider', handleAnnounce);
    window.dispatchEvent(new Event('eip6963:requestProvider'));

    return () => {
      window.removeEventListener('eip6963:announceProvider', handleAnnounce);
    };
  }, []);

  // -------------------------------------------------------------------------
  // Restore session from localStorage on mount
  // -------------------------------------------------------------------------
  useEffect(() => {
    const saved = localStorage.getItem('walletAddress');
    if (!saved) return;

    // Re-hydrate: we only restore the address display; a full provider
    // reconnect requires the user to interact (browsers block eth_accounts
    // without a prior connection). We attempt a passive check with window.ethereum.
    const attemptRestore = async () => {
      const rawProvider = window.ethereum;
      if (!rawProvider) return;

      try {
        const accounts = await rawProvider.request({ method: 'eth_accounts' });
        if (accounts && accounts.length > 0 && accounts[0].toLowerCase() === saved.toLowerCase()) {
          const ethersProvider = new ethers.providers.Web3Provider(rawProvider, 'any');
          const chainIdHex = await rawProvider.request({ method: 'eth_chainId' });

          rawProviderRef.current = rawProvider;
          addressRef.current = accounts[0];
          setAddress(accounts[0]);
          setIsConnected(true);
          setProvider(ethersProvider);
          setChainId(parseInt(chainIdHex, 16));
          setupListeners(rawProvider);
        }
      } catch {
        // Silent — user will reconnect manually if needed
      }
    };

    attemptRestore();
    // setupListeners is defined below; React is fine because this effect
    // runs once on mount and setupListeners is stable (useCallback).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // -------------------------------------------------------------------------
  // Disconnect
  // -------------------------------------------------------------------------
  const disconnect = useCallback(async () => {
    if (rawProviderRef.current?._walletCtxHandlers) {
      const { onAccounts, onChain } = rawProviderRef.current._walletCtxHandlers;
      rawProviderRef.current.removeListener('accountsChanged', onAccounts);
      rawProviderRef.current.removeListener('chainChanged', onChain);
    }

    try {
      if (rawProviderRef.current) {
        await rawProviderRef.current.request({
          method: 'wallet_revokePermissions',
          params: [{ eth_accounts: {} }],
        });
      }
    } catch {
      // wallet_revokePermissions not supported by all wallets — ignore
    }

    rawProviderRef.current = null;
    addressRef.current = null;
    setAddress(null);
    setIsConnected(false);
    setProvider(null);
    setChainId(null);
    localStorage.removeItem('walletAddress');
  }, []);

  // -------------------------------------------------------------------------
  // Listeners — mirrors WalletConnect.js setupListeners
  // -------------------------------------------------------------------------
  const setupListeners = useCallback((rawProvider) => {
    if (!rawProvider) return;

    // Remove stale handlers if any
    if (rawProvider._walletCtxHandlers) {
      const { onAccounts, onChain } = rawProvider._walletCtxHandlers;
      rawProvider.removeListener('accountsChanged', onAccounts);
      rawProvider.removeListener('chainChanged', onChain);
    }

    const onAccounts = (accounts) => {
      if (!accounts || accounts.length === 0) {
        disconnect();
        return;
      }
      const newAddr = accounts[0];
      if (newAddr.toLowerCase() !== addressRef.current?.toLowerCase()) {
        const ethersProvider = new ethers.providers.Web3Provider(rawProvider, 'any');
        addressRef.current = newAddr;
        setAddress(newAddr);
        setProvider(ethersProvider);
        localStorage.setItem('walletAddress', newAddr);
      }
    };

    const onChain = async (chainIdHex) => {
      const newChainId = parseInt(chainIdHex, 16);
      const ethersProvider = new ethers.providers.Web3Provider(rawProvider, 'any');
      setProvider(ethersProvider);
      setChainId(newChainId);
    };

    rawProvider.on('accountsChanged', onAccounts);
    rawProvider.on('chainChanged', onChain);
    rawProvider._walletCtxHandlers = { onAccounts, onChain };
  }, [disconnect]);

  // -------------------------------------------------------------------------
  // Connect — picks first available EIP-6963 wallet, falls back to legacy
  // -------------------------------------------------------------------------
  const connect = useCallback(async (preferredRawProvider) => {
    // Caller can pass a specific raw provider (e.g. from WalletConnect selector).
    // If not provided, we pick the first EIP-6963 wallet or window.ethereum.
    let rawProvider = preferredRawProvider;

    if (!rawProvider) {
      // Re-request announcements to get fresh list
      window.dispatchEvent(new Event('eip6963:requestProvider'));
      await new Promise((r) => setTimeout(r, 100));

      if (eip6963ProvidersRef.current.size > 0) {
        rawProvider = eip6963ProvidersRef.current.values().next().value.provider;
      } else if (window.ethereum) {
        rawProvider = window.ethereum;
      } else {
        throw new Error('No wallet detected. Please install MetaMask or another Web3 wallet.');
      }
    }

    // Request permissions (shows wallet's account selector)
    try {
      await rawProvider.request({
        method: 'wallet_requestPermissions',
        params: [{ eth_accounts: {} }],
      });
    } catch (err) {
      if (err.code === 4001) throw err; // User rejected — propagate
      // Other errors (e.g. already-permitted): fall through
    }

    const accounts = await rawProvider.request({ method: 'eth_requestAccounts' });
    if (!accounts || accounts.length === 0) {
      throw new Error('No account selected.');
    }

    const newAddr = accounts[0];
    const chainIdHex = await rawProvider.request({ method: 'eth_chainId' });
    const ethersProvider = new ethers.providers.Web3Provider(rawProvider, 'any');

    rawProviderRef.current = rawProvider;
    addressRef.current = newAddr;
    setAddress(newAddr);
    setIsConnected(true);
    setProvider(ethersProvider);
    setChainId(parseInt(chainIdHex, 16));
    localStorage.setItem('walletAddress', newAddr);

    setupListeners(rawProvider);

    return { address: newAddr, chainId: parseInt(chainIdHex, 16), provider: ethersProvider };
  }, [setupListeners]);

  // -------------------------------------------------------------------------
  // syncFromExternal — called by WalletConnect.js callback consumers (Bounties)
  // so that connecting through the WalletConnect UI component also updates context.
  // -------------------------------------------------------------------------
  const syncFromExternal = useCallback((newAddress, newChainId, ethersProvider) => {
    addressRef.current = newAddress;
    setAddress(newAddress);
    setIsConnected(true);
    setProvider(ethersProvider);
    setChainId(newChainId);
    localStorage.setItem('walletAddress', newAddress);
  }, []);

  const value = { address, isConnected, provider, chainId, connect, disconnect, syncFromExternal };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
};
