import { useState, useCallback, useEffect } from 'react';
import { ethers } from 'ethers';

// Supported networks configuration
const NETWORKS = {
  optimism: {
    chainId: '0xa',
    name: 'Optimism',
    rpcUrl: 'https://mainnet.optimism.io',
    usdcAddress: '0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85'
  },
  base: {
    chainId: '0x2105',
    name: 'Base',
    rpcUrl: 'https://mainnet.base.org',
    usdcAddress: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913'
  },
  polygon: {
    chainId: '0x89',
    name: 'Polygon',
    rpcUrl: 'https://polygon-rpc.com',
    usdcAddress: '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359'
  },
  avalanche: {
    chainId: '0xa86a',
    name: 'Avalanche',
    rpcUrl: 'https://api.avax.network/ext/bc/C/rpc',
    usdcAddress: '0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E'
  },
  celo: {
    chainId: '0xa4ec',
    name: 'Celo',
    rpcUrl: 'https://forno.celo.org',
    usdcAddress: '0xcebA9300f2b948710d2653dD7B07f33A8B32118C'
  }
};

// ERC20 ABI (minimal - only transfer)
const USDC_ABI = [
  'function transfer(address to, uint256 amount) returns (bool)'
];

/**
 * Hook for x402 payments with ethers.js
 * Simple integration without thirdweb
 */
export function useX402Payment() {
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [paymentState, setPaymentState] = useState({
    isPaying: false,
    error: null,
    txHash: null
  });

  // Connect wallet
  useEffect(() => {
    if (window.ethereum) {
      const web3Provider = new ethers.providers.Web3Provider(window.ethereum);
      setProvider(web3Provider);

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
    }
  }, []);

  const connectWallet = useCallback(async () => {
    if (!window.ethereum) {
      throw new Error('No wallet detected. Please install MetaMask.');
    }

    try {
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });
      setAccount(accounts[0]);
      return accounts[0];
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      throw error;
    }
  }, []);

  const switchNetwork = useCallback(async (networkKey) => {
    const network = NETWORKS[networkKey];
    if (!network) throw new Error(`Network ${networkKey} not supported`);

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: network.chainId }],
      });
    } catch (error) {
      // Network not added, try to add it
      if (error.code === 4902) {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: network.chainId,
            chainName: network.name,
            rpcUrls: [network.rpcUrl],
          }],
        });
      } else {
        throw error;
      }
    }
  }, []);

  const makePayment = useCallback(async (recipientAddress, amountUSD, networkKey) => {
    if (!account) {
      throw new Error('Wallet not connected');
    }

    const network = NETWORKS[networkKey];
    if (!network) {
      throw new Error(`Network ${networkKey} not supported`);
    }

    setPaymentState({ isPaying: true, error: null, txHash: null });

    try {
      // Switch to correct network
      await switchNetwork(networkKey);

      // Get signer
      const signer = provider.getSigner();

      // Get USDC contract
      const usdcContract = new ethers.Contract(
        network.usdcAddress,
        USDC_ABI,
        signer
      );

      // Convert USD to USDC (6 decimals)
      const usdcAmount = ethers.utils.parseUnits(amountUSD, 6);

      // Send transaction
      const tx = await usdcContract.transfer(recipientAddress, usdcAmount);

      console.log('[x402] Transaction sent:', tx.hash);

      // Wait for confirmation
      const receipt = await tx.wait();

      console.log('[x402] Transaction confirmed:', receipt.transactionHash);

      setPaymentState({
        isPaying: false,
        error: null,
        txHash: receipt.transactionHash
      });

      // Return payment proof for x402
      return {
        network: networkKey,
        txHash: receipt.transactionHash,
        from: account,
        to: recipientAddress,
        amount: usdcAmount.toString(),
        timestamp: Date.now()
      };

    } catch (error) {
      console.error('[x402] Payment error:', error);
      setPaymentState({
        isPaying: false,
        error: error.message || 'Payment failed',
        txHash: null
      });
      throw error;
    }
  }, [account, provider, switchNetwork]);

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
    connectWallet,
    makePayment,
    hasPaid,
    markAsPaid,
    paymentState,
    supportedNetworks: Object.keys(NETWORKS)
  };
}

export default useX402Payment;
