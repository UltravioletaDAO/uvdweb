import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useActiveAccount, useReadContract, useSendTransaction, useWaitForReceipt } from 'thirdweb/react';
import { createThirdwebClient, getContract, prepareContractCall, toWei, toEther, getRpcClient, eth_getBalance, readContract } from 'thirdweb';
import { avalanche } from 'thirdweb/chains';
import { ArrowsUpDownIcon, CogIcon, ArrowPathIcon, CheckCircleIcon, XCircleIcon, ClockIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';

const client = createThirdwebClient({
  clientId: "7343a278c7ff30dd04caba86259e87ea",
});

const UVD_ADDRESS = "0x4Ffe7e01832243e03668E090706F17726c26d6B2";
const WAVAX_ADDRESS = "0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7";
const ARENA_ROUTER_ADDRESS = "0xf56d524d651b90e4b84dc2fffd83079698b9066e";

// Minimal ERC20 ABI for UVD token
const ERC20_ABI = [
  {
    "constant": true,
    "inputs": [{"name": "_owner", "type": "address"}],
    "name": "balanceOf",
    "outputs": [{"name": "balance", "type": "uint256"}],
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [{"name": "_spender", "type": "address"}, {"name": "_value", "type": "uint256"}],
    "name": "approve",
    "outputs": [{"name": "", "type": "bool"}],
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [{"name": "_owner", "type": "address"}, {"name": "_spender", "type": "address"}],
    "name": "allowance",
    "outputs": [{"name": "", "type": "uint256"}],
    "type": "function"
  }
];

// Arena Router ABI (simplified for swap functions)
const ARENA_ROUTER_ABI = [
  {
    "inputs": [
      {"internalType": "uint256", "name": "amountOutMin", "type": "uint256"},
      {"internalType": "address[]", "name": "path", "type": "address[]"},
      {"internalType": "address", "name": "to", "type": "address"},
      {"internalType": "uint256", "name": "deadline", "type": "uint256"}
    ],
    "name": "swapExactAVAXForTokens",
    "outputs": [{"internalType": "uint256[]", "name": "amounts", "type": "uint256[]"}],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "uint256", "name": "amountIn", "type": "uint256"},
      {"internalType": "uint256", "name": "amountOutMin", "type": "uint256"},
      {"internalType": "address[]", "name": "path", "type": "address[]"},
      {"internalType": "address", "name": "to", "type": "address"},
      {"internalType": "uint256", "name": "deadline", "type": "uint256"}
    ],
    "name": "swapExactTokensForAVAX",
    "outputs": [{"internalType": "uint256[]", "name": "amounts", "type": "uint256[]"}],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "uint256", "name": "amountIn", "type": "uint256"},
      {"internalType": "address[]", "name": "path", "type": "address[]"}
    ],
    "name": "getAmountsOut",
    "outputs": [{"internalType": "uint256[]", "name": "amounts", "type": "uint256[]"}],
    "stateMutability": "view",
    "type": "function"
  }
];

// Token image component with fallback
const TokenImage = ({ token, className }) => {
  const [imageError, setImageError] = useState(false);
  
  const getTokenImage = (tokenSymbol) => {
    switch(tokenSymbol) {
      case 'AVAX':
        return 'https://images.ctfassets.net/gcj8jwzm6086/5VHupNKwnDYJvqMENeV7iJ/3e4b8ff10b69bfa31e70080a4b142cd0/avalanche-avax-logo.svg';
      case 'UVD':
        return 'https://ultravioletadao.xyz/logo_uvd.svg';
      default:
        return '';
    }
  };

  if (imageError) {
    // Fallback to gradient if image fails to load
    return (
      <div className={`bg-gradient-to-r ${
        token === 'AVAX' 
          ? 'from-red-500 to-orange-500' 
          : 'from-ultraviolet to-ultraviolet-light'
      } ${className} flex items-center justify-center`}>
        <span className="text-white text-xs font-bold">
          {token.substring(0, 2)}
        </span>
      </div>
    );
  }

  return (
    <div className={`${className} flex items-center justify-center overflow-hidden`}>
      <img 
        src={getTokenImage(token)}
        alt={token === 'AVAX' ? 'Avalanche AVAX cryptocurrency logo' : 'UVD token UltraVioleta DAO governance logo'}
        className="w-full h-full object-cover"
        onError={() => setImageError(true)}
      />
    </div>
  );
};

const SwapWidget = () => {
  const { t } = useTranslation();
  const activeAccount = useActiveAccount();
  const [fromToken, setFromToken] = useState('AVAX');
  const [toToken, setToToken] = useState('UVD');
  const [fromAmount, setFromAmount] = useState('');
  const [toAmount, setToAmount] = useState('');
  const [slippage, setSlippage] = useState(1);
  const [customSlippage, setCustomSlippage] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [avaxBalance, setAvaxBalance] = useState('0');
  const [uvdBalance, setUvdBalance] = useState('0');
  
  // New states for allowance and transaction tracking
  const [uvdAllowance, setUvdAllowance] = useState('0');
  const [isApproving, setIsApproving] = useState(false);
  const [transactionStatus, setTransactionStatus] = useState(null);
  const [needsApproval, setNeedsApproval] = useState(false);
  const [currentTransactionType, setCurrentTransactionType] = useState(null); // 'approval' | 'swap'

  const uvdContract = getContract({
    client,
    chain: avalanche,
    address: UVD_ADDRESS,
    abi: ERC20_ABI,
  });

  const routerContract = getContract({
    client,
    chain: avalanche,
    address: ARENA_ROUTER_ADDRESS,
    abi: ARENA_ROUTER_ABI,
  });

  const rpcClient = getRpcClient({ client, chain: avalanche });
  const { 
    mutate: sendTransaction, 
    data: transactionResult,
    isLoading: isTransactionLoading,
    isSuccess: isTransactionSuccess,
    isError: isTransactionError,
    error: transactionError,
    reset: resetTransaction
  } = useSendTransaction();

  // Wait for transaction receipt
  const { 
    data: transactionReceipt,
    isLoading: isReceiptLoading,
    isSuccess: isReceiptSuccess,
    isError: isReceiptError
  } = useWaitForReceipt({
    client,
    chain: avalanche,
    transactionHash: transactionResult?.transactionHash,
  });

  // Get UVD balance
  const { data: uvdBalanceData } = useReadContract({
    contract: uvdContract,
    method: "balanceOf",
    params: [activeAccount?.address || "0x0000000000000000000000000000000000000000"],
    queryOptions: { enabled: !!activeAccount }
  });

  // Get UVD allowance for Arena Router
  const { data: uvdAllowanceData } = useReadContract({
    contract: uvdContract,
    method: "allowance",
    params: [
      activeAccount?.address || "0x0000000000000000000000000000000000000000",
      ARENA_ROUTER_ADDRESS
    ],
    queryOptions: { enabled: !!activeAccount }
  });

  // Function to update balances
  const updateBalances = useCallback(async () => {
    if (!activeAccount?.address) {
      setAvaxBalance('0.0');
      setUvdBalance('0.0');
      return;
    }

    try {
      // Update AVAX balance
      const avaxBalance = await eth_getBalance(rpcClient, {
        address: activeAccount.address
      });
      setAvaxBalance(toEther(avaxBalance));

      // Update UVD balance
      const uvdBalance = await readContract({
        contract: uvdContract,
        method: "balanceOf",
        params: [activeAccount.address]
      });
      setUvdBalance(toEther(uvdBalance));

      // Update UVD allowance
      const uvdAllowance = await readContract({
        contract: uvdContract,
        method: "allowance",
        params: [activeAccount.address, ARENA_ROUTER_ADDRESS]
      });
      setUvdAllowance(toEther(uvdAllowance));
    } catch (error) {
      console.error('Error updating balances:', error);
    }
  }, [activeAccount, rpcClient, uvdContract]);

  // Get AVAX balance
  useEffect(() => {
    const fetchAvaxBalance = async () => {
      if (activeAccount?.address) {
        try {
          const balance = await eth_getBalance(rpcClient, {
            address: activeAccount.address
          });
          const balanceInEther = toEther(balance);
          setAvaxBalance(balanceInEther);
        } catch (error) {
          console.error('Error fetching AVAX balance:', error);
          setAvaxBalance('0.0');
        }
      } else {
        setAvaxBalance('0.0');
      }
    };

    fetchAvaxBalance();
    
    // Refresh balance every 10 seconds
    const interval = setInterval(fetchAvaxBalance, 10000);
    return () => clearInterval(interval);
  }, [activeAccount, rpcClient]);

  useEffect(() => {
    if (uvdBalanceData) {
      try {
        setUvdBalance(toEther(uvdBalanceData));
      } catch (error) {
        console.error('Error converting UVD balance:', error);
        setUvdBalance('0.0');
      }
    } else {
      setUvdBalance('0.0');
    }
  }, [uvdBalanceData]);

  // Handle UVD allowance
  useEffect(() => {
    if (uvdAllowanceData) {
      try {
        const allowanceInEther = toEther(uvdAllowanceData);
        setUvdAllowance(allowanceInEther);
      } catch (error) {
        console.error('Error converting UVD allowance:', error);
        setUvdAllowance('0.0');
      }
    } else {
      setUvdAllowance('0.0');
    }
  }, [uvdAllowanceData]);

  // Check if approval is needed for UVD to AVAX swap
  useEffect(() => {
    if (fromToken === 'UVD' && fromAmount && parseFloat(fromAmount) > 0) {
      const needsApprovalCheck = parseFloat(fromAmount) > parseFloat(uvdAllowance);
      setNeedsApproval(needsApprovalCheck);
    } else {
      setNeedsApproval(false);
    }
  }, [fromToken, fromAmount, uvdAllowance]);

  // Handle transaction status updates automatically
  useEffect(() => {
    if (isTransactionLoading && transactionResult?.transactionHash) {
      // Transaction was submitted to blockchain
      setTransactionStatus({
        type: 'submitted',
        message: currentTransactionType === 'approval' 
          ? t('swap.approval_submitted') 
          : t('swap.swap_submitted'),
        hash: transactionResult.transactionHash
      });
    } else if (isReceiptLoading && transactionResult?.transactionHash) {
      // Transaction is being mined
      setTransactionStatus({
        type: 'pending',
        message: currentTransactionType === 'approval' 
          ? t('swap.approval_pending') 
          : t('swap.swap_pending'),
        hash: transactionResult.transactionHash
      });
    } else if (isReceiptSuccess && transactionReceipt) {
      // Transaction confirmed successfully
      setTransactionStatus({
        type: 'success',
        message: currentTransactionType === 'approval' 
          ? t('swap.approval_confirmed') 
          : t('swap.swap_confirmed'),
        hash: transactionReceipt.transactionHash
      });
      
      // Clear form and update balances after successful transaction
      if (currentTransactionType === 'swap') {
        setFromAmount('');
        setToAmount('');
        // Update balances after successful swap
        updateBalances();
      } else if (currentTransactionType === 'approval') {
        // Update balances and allowance after successful approval
        updateBalances();
      }
      
      // Reset transaction type but keep status visible
      setCurrentTransactionType(null);
      setIsApproving(false);
      setIsLoading(false);
      resetTransaction();
    } else if (isReceiptError || isTransactionError) {
      // Transaction failed
      const error = transactionError || 'Transaction failed';
      const isUserRejection = error.message?.includes('User rejected') || 
                              error.message?.includes('user rejected') ||
                              error.message?.includes('User denied') ||
                              error.code === 4001 ||
                              error.code === 'ACTION_REJECTED';
      
      setTransactionStatus({
        type: 'error',
        message: isUserRejection 
          ? (currentTransactionType === 'approval' ? t('swap.approval_cancelled') : t('swap.swap_cancelled'))
          : `${currentTransactionType === 'approval' ? t('swap.approval_failed') : t('swap.swap_failed')}: ${error.message || 'Please try again.'}`,
        hash: transactionResult?.transactionHash || null
      });
      
      // Reset transaction type but keep status visible
      setCurrentTransactionType(null);
      setIsApproving(false);
      setIsLoading(false);
      resetTransaction();
    }
  }, [
    isTransactionLoading, 
    isReceiptLoading, 
    isReceiptSuccess, 
    isReceiptError, 
    isTransactionError,
    transactionResult,
    transactionReceipt,
    transactionError,
    currentTransactionType,
    resetTransaction,
    t
  ]);

  // Get quote from Arena router
  const getQuote = async (inputAmount, isAvaxToUvd) => {
    if (!inputAmount || inputAmount === '0') return '0';
    
    try {
      const amountIn = toWei(inputAmount);
      const path = isAvaxToUvd 
        ? [WAVAX_ADDRESS, UVD_ADDRESS]
        : [UVD_ADDRESS, WAVAX_ADDRESS];

      // Get amounts out from Arena router
      const amounts = await readContract({
        contract: routerContract,
        method: "getAmountsOut",
        params: [amountIn, path]
      });

      if (amounts && amounts.length > 1) {
        const amountOut = toEther(amounts[1]);
        return parseFloat(amountOut).toFixed(8);
      }
      return '0';
    } catch (error) {
      console.error('Error getting quote from router:', error);
    }
  };

  // Handle input change
  const handleFromAmountChange = async (value) => {
    setFromAmount(value);
    if (value && parseFloat(value) > 0) {
      const quote = await getQuote(value, fromToken === 'AVAX');
      setToAmount(quote);
    } else {
      setToAmount('');
    }
  };

  // Refresh quote function
  const refreshQuote = useCallback(async () => {
    if (fromAmount && parseFloat(fromAmount) > 0) {
      setIsRefreshing(true);
      try {
        // Update quote and balances simultaneously
        const [quote] = await Promise.all([
          getQuote(fromAmount, fromToken === 'AVAX'),
          updateBalances()
        ]);
        setToAmount(quote);
      } catch (error) {
        console.error('Error refreshing quote:', error);
      } finally {
        setIsRefreshing(false);
      }
    } else if (activeAccount?.address) {
      // If no amount, just update balances
      setIsRefreshing(true);
      try {
        await updateBalances();
      } catch (error) {
        console.error('Error updating balances:', error);
      } finally {
        setIsRefreshing(false);
      }
    }
  }, [fromAmount, fromToken, activeAccount, updateBalances]);

  // Auto-refresh quote and balances every 5 seconds
  useEffect(() => {
    if (fromAmount && parseFloat(fromAmount) > 0) {
      const interval = setInterval(refreshQuote, 5000);
      return () => clearInterval(interval);
    } else if (activeAccount?.address) {
      // If no amount but wallet connected, just refresh balances every 10 seconds
      const interval = setInterval(updateBalances, 10000);
      return () => clearInterval(interval);
    }
  }, [fromAmount, fromToken, toToken, activeAccount, refreshQuote, updateBalances]);

  // Swap tokens
  const handleSwapTokens = () => {
    const tempToken = fromToken;
    setFromToken(toToken);
    setToToken(tempToken);
    setFromAmount(toAmount);
    setToAmount(fromAmount);
  };

  // Handle token approval
  const handleApprove = async () => {
    if (!activeAccount || !fromAmount || parseFloat(fromAmount) === 0) return;

    // Clear previous transaction status
    setTransactionStatus(null);
    setIsApproving(true);
    setCurrentTransactionType('approval');
    
    try {
      const amountToApprove = toWei(fromAmount);
      
      const transaction = prepareContractCall({
        contract: uvdContract,
        method: "approve",
        params: [ARENA_ROUTER_ADDRESS, amountToApprove]
      });

      sendTransaction(transaction);
      // Transaction status will be handled automatically by useEffect
    } catch (error) {
      console.error('Approval failed:', error);
      setIsApproving(false);
      setCurrentTransactionType(null);
    }
  };

  // Execute swap
  const handleSwap = async () => {
    if (!activeAccount || !fromAmount || parseFloat(fromAmount) === 0) return;

    // Clear previous transaction status
    setTransactionStatus(null);
    setIsLoading(true);
    setCurrentTransactionType('swap');

    try {
      const amountIn = toWei(fromAmount);
      const minAmountOut = toWei(
        (parseFloat(toAmount) * (100 - slippage) / 100).toString()
      );
      const deadline = Math.floor(Date.now() / 1000) + 60; // 1 minutes

      let transaction;
      
      if (fromToken === 'AVAX') {
        // AVAX to UVD
        transaction = prepareContractCall({
          contract: routerContract,
          method: "swapExactAVAXForTokens",
          params: [
            minAmountOut,
            [WAVAX_ADDRESS, UVD_ADDRESS],
            activeAccount.address,
            deadline
          ],
          value: amountIn
        });
      } else {
        // UVD to AVAX
        transaction = prepareContractCall({
          contract: routerContract,
          method: "swapExactTokensForAVAX",
          params: [
            amountIn,
            minAmountOut,
            [UVD_ADDRESS, WAVAX_ADDRESS],
            activeAccount.address,
            deadline
          ]
        });
      }

      sendTransaction(transaction);
      // Transaction status will be handled automatically by useEffect
    } catch (error) {
      console.error('Swap failed:', error);
      setIsLoading(false);
      setCurrentTransactionType(null);
    }
  };

  const currentBalance = fromToken === 'AVAX' ? avaxBalance : uvdBalance;

  // Transaction Status Component
  const TransactionStatus = () => {
    if (!transactionStatus) return null;

    const getStatusIcon = () => {
      switch (transactionStatus.type) {
        case 'submitted':
          return <ArrowPathIcon className="w-5 h-5 text-blue-500 animate-spin" />;
        case 'pending':
          return <ClockIcon className="w-5 h-5 text-yellow-500 animate-pulse" />;
        case 'success':
          return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
        case 'error':
          return <XCircleIcon className="w-5 h-5 text-red-500" />;
        default:
          return null;
      }
    };

    const getStatusColor = () => {
      switch (transactionStatus.type) {
        case 'submitted':
          return 'border-blue-500/20 bg-blue-500/10';
        case 'pending':
          return 'border-yellow-500/20 bg-yellow-500/10';
        case 'success':
          return 'border-green-500/20 bg-green-500/10';
        case 'error':
          return 'border-red-500/20 bg-red-500/10';
        default:
          return '';
      }
    };

    const handleClose = () => {
      setTransactionStatus(null);
    };

    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className={`mb-4 p-3 rounded-lg border ${getStatusColor()}`}
      >
        <div className="flex items-center gap-3">
          {getStatusIcon()}
          <div className="flex-1">
            <p className="text-sm text-text-primary">{transactionStatus.message}</p>
            {transactionStatus.hash && (
              <a
                href={`https://snowtrace.io/tx/${transactionStatus.hash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-ultraviolet hover:text-ultraviolet-light underline"
              >
                {t('swap.view_transaction')} ↗
              </a>
            )}
          </div>
          <button
            onClick={handleClose}
            className="p-1 hover:bg-white/10 rounded-full transition-colors"
            title={t('common.close')}
            aria-label={t('common.close')}
          >
            <XMarkIcon className="w-4 h-4 text-text-secondary hover:text-text-primary" />
          </button>
        </div>
      </motion.div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ 
        opacity: 1, 
        y: 0,
        boxShadow: isRefreshing 
          ? "0 0 30px rgba(106, 0, 255, 0.15)" 
          : "0 0 0px rgba(106, 0, 255, 0)"
      }}
      transition={{ 
        delay: 0.2,
        boxShadow: { duration: 0.3 }
      }}
      className={`w-full max-w-md mx-auto bg-background-lighter border rounded-2xl p-6 transition-all duration-300 ${
        isRefreshing 
          ? 'border-ultraviolet/30' 
          : 'border-ultraviolet-darker/20'
      }`}
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-text-primary flex items-center gap-2">
          <ArrowsUpDownIcon className="w-6 h-6 text-ultraviolet" />
          {t('swap.title')}
        </h2>
        <div className="flex items-center gap-2">
          <motion.button
            onClick={refreshQuote}
            disabled={isRefreshing || !activeAccount?.address}
            className={`relative p-2 rounded-lg transition-all duration-300 ${
              !activeAccount?.address 
                ? 'cursor-not-allowed opacity-50' 
                : 'hover:bg-background-input hover:text-ultraviolet hover:scale-105'
            } ${
              isRefreshing ? 'bg-ultraviolet/10 shadow-lg shadow-ultraviolet/20' : ''
            }`}
            title={fromAmount && parseFloat(fromAmount) > 0 ? t('swap.refresh_quote') : 'Actualizar balances'}
            animate={isRefreshing ? { 
              rotate: 360,
              scale: [1, 1.1, 1],
            } : { 
              rotate: 0,
              scale: 1 
            }}
            transition={isRefreshing ? { 
              rotate: { duration: 1, repeat: Infinity, ease: "linear" },
              scale: { duration: 0.3, ease: "easeInOut" }
            } : { 
              duration: 0.3 
            }}
            whileHover={!isRefreshing && activeAccount?.address ? { 
              scale: 1.05,
              rotate: 15 
            } : {}}
            whileTap={!isRefreshing && activeAccount?.address ? { 
              scale: 0.95,
              rotate: -15 
            } : {}}
          >
            {isRefreshing && (
              <motion.div
                className="absolute inset-0 rounded-lg bg-gradient-to-r from-ultraviolet/20 to-ultraviolet-light/20"
                animate={{ opacity: [0.3, 0.7, 0.3] }}
                transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
              />
            )}
            <ArrowPathIcon className={`w-5 h-5 relative z-10 transition-colors duration-300 ${
              isRefreshing ? 'text-ultraviolet' : 'text-text-secondary'
            }`} />
            {isRefreshing && (
              <motion.div
                className="absolute -inset-1 rounded-lg border border-ultraviolet/30"
                animate={{ 
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 0, 0.5]
                }}
                transition={{ 
                  duration: 1.5, 
                  repeat: Infinity, 
                  ease: "easeInOut" 
                }}
              />
            )}
          </motion.button>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 hover:bg-background-input rounded-lg transition-colors"
            title={t('swap.settings')}
            aria-label={t('swap.settings')}
            aria-expanded={showSettings}
          >
            <CogIcon className="w-5 h-5 text-text-secondary hover:text-ultraviolet" />
          </button>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="mb-4 p-4 bg-background-input rounded-lg border border-ultraviolet-darker/10"
        >
          <div>
            <div className="flex justify-between items-center mb-3">
              <span className="text-text-secondary text-sm">{t('swap.slippage_tolerance')}</span>
              <div className="flex gap-2">
                {[0.5, 1, 2, 3].map((value) => (
                  <button
                    key={value}
                    onClick={() => {
                      setSlippage(value);
                      setCustomSlippage('');
                    }}
                    className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                      slippage === value && !customSlippage
                        ? 'bg-ultraviolet text-white'
                        : 'bg-background hover:bg-ultraviolet-darker/20 text-text-secondary'
                    }`}
                  >
                    {value}%
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-text-secondary text-sm">{t('swap.custom_slippage')}:</span>
              <div className="flex items-center">
                <input
                  type="number"
                  placeholder="0.0"
                  value={customSlippage}
                  onChange={(e) => {
                    const value = e.target.value;
                    setCustomSlippage(value);
                    if (value && parseFloat(value) > 0) {
                      setSlippage(parseFloat(value));
                    }
                  }}
                  className="w-16 px-2 py-1 bg-background border border-ultraviolet-darker/20 rounded-lg text-text-primary text-sm outline-none focus:border-ultraviolet"
                  min="0.1"
                  max="50"
                  step="0.1"
                />
                <span className="text-text-secondary text-sm ml-1">%</span>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* From Token */}
      <div className="mb-2">
        <div className="flex justify-between items-center mb-2">
          <span className="text-text-secondary text-sm">{t('swap.from')}</span>
          <span className="text-text-secondary text-sm">
            {t('swap.balance')}: {parseFloat(currentBalance).toFixed(6)}
          </span>
        </div>
        <div className="bg-background-input border border-ultraviolet-darker/20 rounded-xl p-4">
          <div className="flex justify-between items-center">
            <input
              type="number"
              placeholder="0"
              value={fromAmount}
              onChange={(e) => handleFromAmountChange(e.target.value)}
              className="bg-transparent text-2xl font-semibold text-text-primary outline-none w-full"
            />
                <div className="flex items-center gap-3 ml-4">
                <div className="flex items-center gap-3 bg-background px-4 py-2 rounded-lg">
                  <TokenImage 
                    token={fromToken}
                    className="w-7 h-7 rounded-full object-cover border border-white"
                  />
                  <span className="font-semibold text-text-primary">{fromToken}</span>
                </div>
              </div>
          </div>
          <div className="flex justify-between mt-2">
            <div className="flex gap-2">
              <button
                onClick={() => handleFromAmountChange((parseFloat(currentBalance) * 0.25).toString())}
                className="px-2 py-1 bg-ultraviolet-darker/20 hover:bg-ultraviolet-darker/40 rounded-lg text-xs text-white transition-colors"
                aria-label="Use 25% of balance"
              >
                25%
              </button>
              <button
                onClick={() => handleFromAmountChange((parseFloat(currentBalance) * 0.5).toString())}
                className="px-2 py-1 bg-ultraviolet-darker/20 hover:bg-ultraviolet-darker/40 rounded-lg text-xs text-white transition-colors"
                aria-label="Use 50% of balance"
              >
                50%
              </button>
              <button
                onClick={() => handleFromAmountChange((parseFloat(currentBalance) * 0.75).toString())}
                className="px-2 py-1 bg-ultraviolet-darker/20 hover:bg-ultraviolet-darker/40 rounded-lg text-xs text-white transition-colors"
                aria-label="Use 75% of balance"
              >
                75%
              </button>
              <button
                onClick={() => handleFromAmountChange(currentBalance)}
                className="px-2 py-1 bg-ultraviolet-darker/20 hover:bg-ultraviolet-darker/40 rounded-lg text-xs text-white transition-colors"
                aria-label="Use maximum balance"
              >
                MAX
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Swap Button */}
      <div className="flex justify-center my-2">
        <button
          onClick={handleSwapTokens}
          className="p-2 bg-background-input hover:bg-ultraviolet-darker/20 border border-ultraviolet-darker/20 rounded-xl transition-colors"
          aria-label="Switch tokens"
          title="Switch tokens"
        >
          <ArrowsUpDownIcon className="w-5 h-5 text-white" />
        </button>
      </div>

      {/* To Token */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-text-secondary text-sm">{t('swap.to')}</span>
          <span className="text-text-secondary text-sm">
            {t('swap.balance')}: {parseFloat(toToken === 'AVAX' ? avaxBalance : uvdBalance).toFixed(6)}
          </span>
        </div>
        <div className="bg-background-input border border-ultraviolet-darker/20 rounded-xl p-4">
          <div className="flex justify-between items-center">
            <div className="relative w-full">
              <input
                type="number"
                placeholder="0"
                value={isRefreshing ? '' : toAmount}
                readOnly
                className="bg-transparent text-2xl font-semibold text-text-primary outline-none w-full"
              />
              {isRefreshing && (
                <div className="absolute inset-0 flex items-center">
                  <motion.div
                    className="flex items-center gap-2 text-ultraviolet"
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    <div className="flex gap-1">
                      <motion.div
                        className="w-2 h-2 bg-ultraviolet rounded-full"
                        animate={{ scale: [1, 1.5, 1] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                      />
                      <motion.div
                        className="w-2 h-2 bg-ultraviolet rounded-full"
                        animate={{ scale: [1, 1.5, 1] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                      />
                      <motion.div
                        className="w-2 h-2 bg-ultraviolet rounded-full"
                        animate={{ scale: [1, 1.5, 1] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                      />
                    </div>
                    <span className="text-sm font-medium">{t('swap.updating')}...</span>
                  </motion.div>
                </div>
              )}
            </div>
                          <div className="flex items-center gap-3 ml-4">
                <div className="flex items-center gap-3 bg-background px-4 py-2 rounded-lg">
                  <TokenImage 
                    token={toToken}
                    className="w-7 h-7 rounded-full border border-white"
                  />
                  <span className="font-semibold text-text-primary">{toToken}</span>
                </div>
              </div>
          </div>
        </div>
      </div>

      {/* Transaction Status */}
      <TransactionStatus />

      {/* Swap Info */}
      {fromAmount && toAmount && (
        <div className="mb-4 p-3 bg-background-input rounded-lg border border-ultraviolet-darker/10">
          <div className="flex justify-between items-center text-sm">
            <span className="text-text-secondary">{t('swap.rate')}</span>
            <span className="text-text-primary">
              1 {fromToken} = {(parseFloat(toAmount) / parseFloat(fromAmount)).toFixed(6)} {toToken}
            </span>
          </div>
          <div className="flex justify-between items-center text-sm mt-1">
            <span className="text-text-secondary">{t('swap.slippage_tolerance')}</span>
            <span className="text-ultraviolet">{slippage}%</span>
          </div>
          <div className="flex justify-between items-center text-sm mt-1">
            <span className="text-text-secondary">{t('swap.minimum_received')}</span>
            <span className="text-text-primary">
              {(parseFloat(toAmount) * (100 - slippage) / 100).toFixed(6)} {toToken}
            </span>
          </div>
          <div className="flex justify-between items-center text-sm mt-1">
            <span className="text-text-secondary text-xs opacity-75">{t('swap.auto_refresh')}</span>
            <div className="flex items-center gap-1">
              <div className={`w-2 h-2 rounded-full ${isRefreshing ? 'bg-ultraviolet animate-pulse' : 'bg-green-500'}`}></div>
              <span className="text-text-secondary text-xs">Auto</span>
            </div>
          </div>
          {/* Show allowance info for UVD swaps */}
          {fromToken === 'UVD' && (
            <div className="flex justify-between items-center text-sm mt-1 pt-2 border-t border-ultraviolet-darker/10">
              <span className="text-text-secondary">{t('swap.allowance')}</span>
              <span className="text-text-primary">
                {parseFloat(uvdAllowance).toFixed(6)} UVD
              </span>
            </div>
          )}
        </div>
      )}

      {/* Connect/Approve/Swap Button */}
      {!activeAccount ? (
        <div className="text-center text-text-secondary">
          {t('swap.connect_wallet')}
        </div>
      ) : (
        <div className="space-y-3">
          {/* Show approval button if needed for UVD to AVAX swap */}
          {fromToken === 'UVD' && needsApproval && fromAmount && parseFloat(fromAmount) > 0 && parseFloat(fromAmount) <= parseFloat(currentBalance) && (
            <button
              onClick={handleApprove}
              disabled={isApproving || isTransactionLoading || isReceiptLoading}
              className={`w-full py-4 rounded-xl font-semibold transition-all ${
                (isApproving || isTransactionLoading || isReceiptLoading)
                  ? 'bg-background-input text-text-secondary cursor-not-allowed'
                  : 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white hover:shadow-lg hover:shadow-yellow-500/25'
              }`}
            >
              {(isApproving || (isTransactionLoading && currentTransactionType === 'approval') || (isReceiptLoading && currentTransactionType === 'approval')) ? t('swap.approving') : t('swap.approve_uvd')}
            </button>
          )}
          
          {/* Main swap button */}
          <button
            onClick={handleSwap}
            disabled={
              !fromAmount || 
              parseFloat(fromAmount) === 0 || 
              isLoading || 
              isApproving ||
              isTransactionLoading ||
              isReceiptLoading ||
              parseFloat(fromAmount) > parseFloat(currentBalance) ||
              (fromToken === 'UVD' && needsApproval)
            }
            className={`w-full py-4 rounded-xl font-semibold transition-all ${
              !fromAmount || 
              parseFloat(fromAmount) === 0 || 
              isLoading || 
              isApproving ||
              isTransactionLoading ||
              isReceiptLoading ||
              parseFloat(fromAmount) > parseFloat(currentBalance) ||
              (fromToken === 'UVD' && needsApproval)
                ? 'bg-background-input text-text-secondary cursor-not-allowed'
                : 'bg-gradient-to-r from-ultraviolet to-ultraviolet-light text-white hover:shadow-lg hover:shadow-ultraviolet/25'
            }`}
          >
            {(isLoading || isTransactionLoading || isReceiptLoading) ? t('swap.swapping') : 
             isApproving ? t('swap.approval_required') :
             parseFloat(fromAmount) > parseFloat(currentBalance) ? t('swap.insufficient_balance') :
             !fromAmount || parseFloat(fromAmount) === 0 ? t('swap.enter_amount') : 
             (fromToken === 'UVD' && needsApproval) ? t('swap.approve_required') :
             t('swap.swap')}
          </button>
        </div>
      )}
    </motion.div>
  );
};

export default SwapWidget; 