import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useActiveAccount, useReadContract, useSendTransaction, useWaitForReceipt } from 'thirdweb/react';
import { createThirdwebClient, getContract, prepareContractCall, toWei, toEther, readContract } from 'thirdweb';
import { avalanche } from 'thirdweb/chains';
import { ArrowsUpDownIcon, ArrowPathIcon, CheckCircleIcon, XCircleIcon, ClockIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';

const client = createThirdwebClient({
  clientId: "7343a278c7ff30dd04caba86259e87ea",
});

const UVD_ADDRESS = "0x4Ffe7e01832243e03668E090706F17726c26d6B2";
const UVDX_ADDRESS = "0x11C6AD55Aad69f4612e374e5237b71D580F38f06";

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

// UVDx Superfluid ABI (simplified for upgrade/downgrade functions)
const UVDX_ABI = [
  {
    "inputs": [{"internalType": "uint256", "name": "amount", "type": "uint256"}],
    "name": "upgrade",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "amount", "type": "uint256"}],
    "name": "downgrade",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [{"name": "_owner", "type": "address"}],
    "name": "balanceOf",
    "outputs": [{"name": "balance", "type": "uint256"}],
    "type": "function"
  }
];

// Token image component with fallback
const TokenImage = ({ token, className }) => {
  const [imageError, setImageError] = useState(false);
  
  const getTokenImage = (tokenSymbol) => {
    switch(tokenSymbol) {
      case 'UVD':
        return 'https://ultravioletadao.xyz/logo_uvd.svg';
      case 'UVDx':
        return 'https://ultravioletadao.xyz/logo_uvd.svg'; // Using same logo for UVDx
      default:
        return '';
    }
  };

  if (imageError) {
    // Fallback to gradient if image fails to load
    return (
      <div className={`bg-gradient-to-r from-ultraviolet to-ultraviolet-light ${className} flex items-center justify-center`}>
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
        alt={`${token} logo`}
        className="w-full h-full object-cover"
        onError={() => setImageError(true)}
      />
    </div>
  );
};

const WrapWidget = () => {
  const { t } = useTranslation();
  const activeAccount = useActiveAccount();
  const [fromToken, setFromToken] = useState('UVD');
  const [toToken, setToToken] = useState('UVDx');
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [uvdBalance, setUvdBalance] = useState('0');
  const [uvdxBalance, setUvdxBalance] = useState('0');
  
  // States for allowance and transaction tracking
  const [uvdAllowance, setUvdAllowance] = useState('0');
  const [isApproving, setIsApproving] = useState(false);
  const [transactionStatus, setTransactionStatus] = useState(null);
  const [needsApproval, setNeedsApproval] = useState(false);
  const [currentTransactionType, setCurrentTransactionType] = useState(null); // 'approval' | 'wrap' | 'unwrap'

  const uvdContract = getContract({
    client,
    chain: avalanche,
    address: UVD_ADDRESS,
    abi: ERC20_ABI,
  });

  const uvdxContract = getContract({
    client,
    chain: avalanche,
    address: UVDX_ADDRESS,
    abi: UVDX_ABI,
  });

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

  // Get UVDx balance
  const { data: uvdxBalanceData } = useReadContract({
    contract: uvdxContract,
    method: "balanceOf",
    params: [activeAccount?.address || "0x0000000000000000000000000000000000000000"],
    queryOptions: { enabled: !!activeAccount }
  });

  // Get UVD allowance for UVDx contract
  const { data: uvdAllowanceData } = useReadContract({
    contract: uvdContract,
    method: "allowance",
    params: [
      activeAccount?.address || "0x0000000000000000000000000000000000000000",
      UVDX_ADDRESS
    ],
    queryOptions: { enabled: !!activeAccount }
  });

  // Function to update balances
  const updateBalances = async () => {
    if (!activeAccount?.address) {
      setUvdBalance('0.0');
      setUvdxBalance('0.0');
      return;
    }

    try {
      // Update UVD balance
      const uvdBalance = await readContract({
        contract: uvdContract,
        method: "balanceOf",
        params: [activeAccount.address]
      });
      setUvdBalance(toEther(uvdBalance));

      // Update UVDx balance
      const uvdxBalance = await readContract({
        contract: uvdxContract,
        method: "balanceOf",
        params: [activeAccount.address]
      });
      setUvdxBalance(toEther(uvdxBalance));

      // Update UVD allowance
      const uvdAllowance = await readContract({
        contract: uvdContract,
        method: "allowance",
        params: [activeAccount.address, UVDX_ADDRESS]
      });
      setUvdAllowance(toEther(uvdAllowance));
    } catch (error) {
      console.error('Error updating balances:', error);
    }
  };

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

  useEffect(() => {
    if (uvdxBalanceData) {
      try {
        setUvdxBalance(toEther(uvdxBalanceData));
      } catch (error) {
        console.error('Error converting UVDx balance:', error);
        setUvdxBalance('0.0');
      }
    } else {
      setUvdxBalance('0.0');
    }
  }, [uvdxBalanceData]);

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

  // Check if approval is needed for UVD to UVDx wrap
  useEffect(() => {
    if (fromToken === 'UVD' && amount && parseFloat(amount) > 0) {
      const needsApprovalCheck = parseFloat(amount) > parseFloat(uvdAllowance);
      setNeedsApproval(needsApprovalCheck);
    } else {
      setNeedsApproval(false);
    }
  }, [fromToken, amount, uvdAllowance]);

  // Handle transaction status updates automatically
  useEffect(() => {
    if (isTransactionLoading && transactionResult?.transactionHash) {
      // Transaction was submitted to blockchain
      setTransactionStatus({
        type: 'submitted',
        message: currentTransactionType === 'approval' 
          ? t('wrap.approval_submitted') 
          : currentTransactionType === 'wrap'
          ? t('wrap.wrap_submitted')
          : t('wrap.unwrap_submitted'),
        hash: transactionResult.transactionHash
      });
    } else if (isReceiptLoading && transactionResult?.transactionHash) {
      // Transaction is being mined
      setTransactionStatus({
        type: 'pending',
        message: currentTransactionType === 'approval' 
          ? t('wrap.approval_pending') 
          : currentTransactionType === 'wrap'
          ? t('wrap.wrap_pending')
          : t('wrap.unwrap_pending'),
        hash: transactionResult.transactionHash
      });
    } else if (isReceiptSuccess && transactionReceipt) {
      // Transaction confirmed successfully
      setTransactionStatus({
        type: 'success',
        message: currentTransactionType === 'approval' 
          ? t('wrap.approval_confirmed') 
          : currentTransactionType === 'wrap'
          ? t('wrap.wrap_confirmed')
          : t('wrap.unwrap_confirmed'),
        hash: transactionReceipt.transactionHash
      });
      
      // Clear form and update balances after successful transaction
      if (currentTransactionType === 'wrap' || currentTransactionType === 'unwrap') {
        setAmount('');
        // Update balances after successful transaction
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
          ? (currentTransactionType === 'approval' 
              ? t('wrap.approval_cancelled') 
              : currentTransactionType === 'wrap'
              ? t('wrap.wrap_cancelled')
              : t('wrap.unwrap_cancelled'))
          : `${currentTransactionType === 'approval' 
              ? t('wrap.approval_failed') 
              : currentTransactionType === 'wrap'
              ? t('wrap.wrap_failed')
              : t('wrap.unwrap_failed')}: ${error.message || 'Please try again.'}`,
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

  // Refresh balances function
  const refreshBalances = async () => {
    if (activeAccount?.address) {
      setIsRefreshing(true);
      try {
        await updateBalances();
      } catch (error) {
        console.error('Error updating balances:', error);
      } finally {
        setIsRefreshing(false);
      }
    }
  };

  // Auto-refresh balances every 10 seconds
  useEffect(() => {
    if (activeAccount?.address) {
      const interval = setInterval(updateBalances, 10000);
      return () => clearInterval(interval);
    }
  }, [activeAccount]);

  // Swap tokens (UVD <-> UVDx)
  const handleSwapTokens = () => {
    const tempToken = fromToken;
    setFromToken(toToken);
    setToToken(tempToken);
    // Since it's 1:1 for wrap/unwrap, amount stays the same
  };

  // Handle token approval
  const handleApprove = async () => {
    if (!activeAccount || !amount || parseFloat(amount) === 0) return;

    // Clear previous transaction status
    setTransactionStatus(null);
    setIsApproving(true);
    setCurrentTransactionType('approval');
    
    try {
      const amountToApprove = toWei(amount);
      
      const transaction = prepareContractCall({
        contract: uvdContract,
        method: "approve",
        params: [UVDX_ADDRESS, amountToApprove]
      });

      sendTransaction(transaction);
      // Transaction status will be handled automatically by useEffect
    } catch (error) {
      console.error('Approval failed:', error);
      setIsApproving(false);
      setCurrentTransactionType(null);
    }
  };

  // Execute wrap/unwrap
  const handleWrapUnwrap = async () => {
    if (!activeAccount || !amount || parseFloat(amount) === 0) return;

    // Clear previous transaction status
    setTransactionStatus(null);
    setIsLoading(true);
    setCurrentTransactionType(fromToken === 'UVD' ? 'wrap' : 'unwrap');

    try {
      const amountInWei = toWei(amount);

      let transaction;
      
      if (fromToken === 'UVD') {
        // Wrap: UVD to UVDx (upgrade)
        transaction = prepareContractCall({
          contract: uvdxContract,
          method: "upgrade",
          params: [amountInWei]
        });
      } else {
        // Unwrap: UVDx to UVD (downgrade)
        transaction = prepareContractCall({
          contract: uvdxContract,
          method: "downgrade",
          params: [amountInWei]
        });
      }

      sendTransaction(transaction);
      // Transaction status will be handled automatically by useEffect
    } catch (error) {
      console.error('Wrap/Unwrap failed:', error);
      setIsLoading(false);
      setCurrentTransactionType(null);
    }
  };

  const currentBalance = fromToken === 'UVD' ? uvdBalance : uvdxBalance;

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
                {t('wrap.view_transaction')} ↗
              </a>
            )}
          </div>
          <button
            onClick={handleClose}
            className="p-1 hover:bg-white/10 rounded-full transition-colors"
            title="Cerrar notificación"
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
          {t('wrap.title')}
        </h2>
        <div className="flex items-center gap-2">
          <motion.button
            onClick={refreshBalances}
            disabled={isRefreshing || !activeAccount?.address}
            className={`relative p-2 rounded-lg transition-all duration-300 ${
              !activeAccount?.address 
                ? 'cursor-not-allowed opacity-50' 
                : 'hover:bg-background-input hover:text-ultraviolet hover:scale-105'
            } ${
              isRefreshing ? 'bg-ultraviolet/10 shadow-lg shadow-ultraviolet/20' : ''
            }`}
            title={t('wrap.refresh_balances')}
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
        </div>
      </div>

      {/* From Token */}
      <div className="mb-2">
        <div className="flex justify-between items-center mb-2">
          <span className="text-text-secondary text-sm">{t('wrap.from')}</span>
          <span className="text-text-secondary text-sm">
            {t('wrap.balance')}: {parseFloat(currentBalance).toFixed(6)}
          </span>
        </div>
        <div className="bg-background-input border border-ultraviolet-darker/20 rounded-xl p-4">
          <div className="flex justify-between items-center">
            <input
              type="number"
              placeholder="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
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
                onClick={() => setAmount((parseFloat(currentBalance) * 0.25).toString())}
                className="px-2 py-1 bg-ultraviolet-darker/20 hover:bg-ultraviolet-darker/40 rounded-lg text-xs text-white transition-colors"
              >
                25%
              </button>
              <button
                onClick={() => setAmount((parseFloat(currentBalance) * 0.5).toString())}
                className="px-2 py-1 bg-ultraviolet-darker/20 hover:bg-ultraviolet-darker/40 rounded-lg text-xs text-white transition-colors"
              >
                50%
              </button>
              <button
                onClick={() => setAmount((parseFloat(currentBalance) * 0.75).toString())}
                className="px-2 py-1 bg-ultraviolet-darker/20 hover:bg-ultraviolet-darker/40 rounded-lg text-xs text-white transition-colors"
              >
                75%
              </button>
              <button
                onClick={() => setAmount(currentBalance)}
                className="px-2 py-1 bg-ultraviolet-darker/20 hover:bg-ultraviolet-darker/40 rounded-lg text-xs text-white transition-colors"
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
        >
          <ArrowsUpDownIcon className="w-5 h-5 text-white" />
        </button>
      </div>

      {/* To Token */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-text-secondary text-sm">{t('wrap.to')}</span>
          <span className="text-text-secondary text-sm">
            {t('wrap.balance')}: {parseFloat(toToken === 'UVD' ? uvdBalance : uvdxBalance).toFixed(6)}
          </span>
        </div>
        <div className="bg-background-input border border-ultraviolet-darker/20 rounded-xl p-4">
          <div className="flex justify-between items-center">
            <div className="relative w-full">
              <input
                type="number"
                placeholder="0"
                value={amount} // 1:1 ratio for wrap/unwrap
                readOnly
                className="bg-transparent text-2xl font-semibold text-text-primary outline-none w-full"
              />
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

      {/* Wrap Info */}
      {amount && parseFloat(amount) > 0 && (
        <div className="mb-4 p-3 bg-background-input rounded-lg border border-ultraviolet-darker/10">
          <div className="flex justify-between items-center text-sm">
            <span className="text-text-secondary">{t('wrap.rate')}</span>
            <span className="text-text-primary">
              1 {fromToken} = 1 {toToken}
            </span>
          </div>
          <div className="flex justify-between items-center text-sm mt-1">
            <span className="text-text-secondary">{t('wrap.operation')}</span>
            <span className="text-ultraviolet">
              {fromToken === 'UVD' ? t('wrap.wrapping') : t('wrap.unwrapping')}
            </span>
          </div>
          {/* Show allowance info for UVD wraps */}
          {fromToken === 'UVD' && (
            <div className="flex justify-between items-center text-sm mt-1 pt-2 border-t border-ultraviolet-darker/10">
              <span className="text-text-secondary">{t('wrap.allowance')}</span>
              <span className="text-text-primary">
                {parseFloat(uvdAllowance).toFixed(6)} UVD
              </span>
            </div>
          )}
        </div>
      )}

      {/* Connect/Approve/Wrap Button */}
      {!activeAccount ? (
        <div className="text-center text-text-secondary">
          {t('wrap.connect_wallet')}
        </div>
      ) : (
        <div className="space-y-3">
          {/* Show approval button if needed for UVD to UVDx wrap */}
          {fromToken === 'UVD' && needsApproval && amount && parseFloat(amount) > 0 && parseFloat(amount) <= parseFloat(currentBalance) && (
            <button
              onClick={handleApprove}
              disabled={isApproving || isTransactionLoading || isReceiptLoading}
              className={`w-full py-4 rounded-xl font-semibold transition-all ${
                (isApproving || isTransactionLoading || isReceiptLoading)
                  ? 'bg-background-input text-text-secondary cursor-not-allowed'
                  : 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white hover:shadow-lg hover:shadow-yellow-500/25'
              }`}
            >
              {(isApproving || (isTransactionLoading && currentTransactionType === 'approval') || (isReceiptLoading && currentTransactionType === 'approval')) ? t('wrap.approving') : t('wrap.approve_uvd')}
            </button>
          )}
          
          {/* Main wrap/unwrap button */}
          <button
            onClick={handleWrapUnwrap}
            disabled={
              !amount || 
              parseFloat(amount) === 0 || 
              isLoading || 
              isApproving ||
              isTransactionLoading ||
              isReceiptLoading ||
              parseFloat(amount) > parseFloat(currentBalance) ||
              (fromToken === 'UVD' && needsApproval)
            }
            className={`w-full py-4 rounded-xl font-semibold transition-all ${
              !amount || 
              parseFloat(amount) === 0 || 
              isLoading || 
              isApproving ||
              isTransactionLoading ||
              isReceiptLoading ||
              parseFloat(amount) > parseFloat(currentBalance) ||
              (fromToken === 'UVD' && needsApproval)
                ? 'bg-background-input text-text-secondary cursor-not-allowed'
                : 'bg-gradient-to-r from-ultraviolet to-ultraviolet-light text-white hover:shadow-lg hover:shadow-ultraviolet/25'
            }`}
          >
            {(isLoading || isTransactionLoading || isReceiptLoading) ? 
             (fromToken === 'UVD' ? t('wrap.wrapping') : t('wrap.unwrapping')) : 
             isApproving ? t('wrap.approval_required') :
             parseFloat(amount) > parseFloat(currentBalance) ? t('wrap.insufficient_balance') :
             !amount || parseFloat(amount) === 0 ? t('wrap.enter_amount') : 
             (fromToken === 'UVD' && needsApproval) ? t('wrap.approve_required') :
             fromToken === 'UVD' ? t('wrap.wrap') : t('wrap.unwrap')}
          </button>
        </div>
      )}
    </motion.div>
  );
};

export default WrapWidget;