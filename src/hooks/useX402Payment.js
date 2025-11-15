import { useState, useCallback, useEffect, useMemo } from 'react';
import { createWalletClient, custom } from 'viem';
import { base, optimism, polygon, avalanche, celo } from 'viem/chains';
import { wrapFetchWithPayment, createSigner } from 'x402-fetch';

// Supported networks configuration
const NETWORKS = {
  base: { chain: base, name: 'Base', x402Name: 'base' },
  optimism: { chain: optimism, name: 'Optimism', x402Name: 'optimism' },
  polygon: { chain: polygon, name: 'Polygon', x402Name: 'polygon' },
  avalanche: { chain: avalanche, name: 'Avalanche', x402Name: 'avalanche' },
  celo: { chain: celo, name: 'Celo', x402Name: 'celo' }
};

/**
 * Hook for x402 payments using viem + x402-fetch
 * Automatically handles 402 responses and payment through facilitator
 */
export function useX402Payment() {
  const [account, setAccount] = useState(null);
  const [selectedNetwork, setSelectedNetwork] = useState('base');
  const [isConnecting, setIsConnecting] = useState(false);

  // Create viem wallet client
  const walletClient = useMemo(() => {
    if (!account || !window.ethereum) return null;

    return createWalletClient({
      account,
      chain: NETWORKS[selectedNetwork].chain,
      transport: custom(window.ethereum)
    });
  }, [account, selectedNetwork]);

  // Create fetch with payment wrapper
  const fetchWithPayment = useMemo(() => {
    if (!walletClient) return null; // Return null if no wallet
    return wrapFetchWithPayment(fetch, walletClient);
  }, [walletClient]);

  // Connect wallet
  useEffect(() => {
    if (window.ethereum) {
      // Get current account
      window.ethereum.request({ method: 'eth_accounts' })
        .then(accounts => {
          if (accounts.length > 0) {
            setAccount(accounts[0]);
          }
        });

      // Listen for account changes
      window.ethereum.on('accountsChanged', (accounts) => {
        setAccount(accounts[0] || null);
      });

      // Listen for chain changes
      window.ethereum.on('chainChanged', () => {
        window.location.reload();
      });
    }
  }, []);

  const connectWallet = useCallback(async () => {
    if (!window.ethereum) {
      throw new Error('No wallet detected. Please install MetaMask.');
    }

    setIsConnecting(true);
    try {
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });
      setAccount(accounts[0]);
      return accounts[0];
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      throw error;
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const switchNetwork = useCallback(async (networkKey) => {
    const network = NETWORKS[networkKey];
    if (!network) throw new Error(`Network ${networkKey} not supported`);

    const chainId = `0x${network.chain.id.toString(16)}`;

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId }],
      });
      setSelectedNetwork(networkKey);
    } catch (error) {
      // Network not added, try to add it
      if (error.code === 4902) {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId,
            chainName: network.chain.name,
            nativeCurrency: network.chain.nativeCurrency,
            rpcUrls: network.chain.rpcUrls.default.http,
            blockExplorerUrls: network.chain.blockExplorers?.default ? [network.chain.blockExplorers.default.url] : undefined
          }],
        });
        setSelectedNetwork(networkKey);
      } else {
        throw error;
      }
    }
  }, []);

  const hasPaid = useCallback((contentId) => {
    if (!account) return false;
    const paidKey = `x402_paid_${account}_${contentId}`;
    return localStorage.getItem(paidKey) !== null;
  }, [account]);

  const markAsPaid = useCallback((contentId, paymentProof) => {
    if (!account) return;
    const paidKey = `x402_paid_${account}_${contentId}`;
    localStorage.setItem(paidKey, JSON.stringify({
      ...paymentProof,
      paidAt: Date.now()
    }));
  }, [account]);

  return {
    account,
    isWalletConnected: !!account,
    isConnecting,
    connectWallet,
    switchNetwork,
    selectedNetwork,
    setSelectedNetwork,
    hasPaid,
    markAsPaid,
    supportedNetworks: Object.keys(NETWORKS),
    fetchWithPayment,  // Use this instead of regular fetch for x402-protected resources
    walletClient
  };
}

export default useX402Payment;
