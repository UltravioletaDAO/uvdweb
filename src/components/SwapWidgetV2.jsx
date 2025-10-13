import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useActiveAccount, useReadContract, useSendTransaction, useWaitForReceipt } from 'thirdweb/react';
import { createThirdwebClient, getContract, prepareContractCall, toWei, toEther, getRpcClient, eth_getBalance, readContract } from 'thirdweb';
import { avalanche } from 'thirdweb/chains';
import { ArrowDownUp, Settings, RefreshCw, CheckCircle2, XCircle, Clock, X, Info, Zap, TrendingUp } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Slider } from './ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { TokenSelector } from './ui/token-selector';
import { cn } from '../lib/utils';

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

// Transaction Status Component
const TransactionStatus = ({ status, onClose }) => {
  if (!status) return null;

  const getStatusConfig = () => {
    switch (status.type) {
      case 'submitted':
        return {
          icon: RefreshCw,
          iconClass: 'text-blue-500 animate-spin',
          bgClass: 'bg-blue-500/10 border-blue-500/30',
          title: status.message,
        };
      case 'pending':
        return {
          icon: Clock,
          iconClass: 'text-yellow-500 animate-pulse',
          bgClass: 'bg-yellow-500/10 border-yellow-500/30',
          title: status.message,
        };
      case 'success':
        return {
          icon: CheckCircle2,
          iconClass: 'text-green-500',
          bgClass: 'bg-green-500/10 border-green-500/30',
          title: status.message,
        };
      case 'error':
        return {
          icon: XCircle,
          iconClass: 'text-red-500',
          bgClass: 'bg-red-500/10 border-red-500/30',
          title: status.message,
        };
      default:
        return null;
    }
  };

  const config = getStatusConfig();
  if (!config) return null;

  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={cn(
        "relative overflow-hidden rounded-lg border p-4",
        config.bgClass
      )}
    >
      <div className="flex items-start gap-3">
        <Icon className={cn("w-5 h-5 mt-0.5", config.iconClass)} />
        <div className="flex-1 space-y-1">
          <p className="text-sm font-medium text-foreground">{config.title}</p>
          {status.hash && (
            <a
              href={`https://snowtrace.io/tx/${status.hash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-ultraviolet hover:text-ultraviolet-light underline inline-flex items-center gap-1"
            >
              View on Snowtrace
              <TrendingUp className="w-3 h-3" />
            </a>
          )}
        </div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-white/10 rounded-full transition-colors"
        >
          <X className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>
    </motion.div>
  );
};

const SwapWidgetV2 = () => {
  const { t } = useTranslation();
  const activeAccount = useActiveAccount();
  const [fromToken, setFromToken] = useState('AVAX');
  const [toToken, setToToken] = useState('UVD');
  const [fromAmount, setFromAmount] = useState('');
  const [toAmount, setToAmount] = useState('');
  const [slippage, setSlippage] = useState([1]);
  const [showSettings, setShowSettings] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [avaxBalance, setAvaxBalance] = useState('0');
  const [uvdBalance, setUvdBalance] = useState('0');
  const [uvdAllowance, setUvdAllowance] = useState('0');
  const [isApproving, setIsApproving] = useState(false);
  const [transactionStatus, setTransactionStatus] = useState(null);
  const [needsApproval, setNeedsApproval] = useState(false);
  const [currentTransactionType, setCurrentTransactionType] = useState(null);

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

  const { data: uvdBalanceData } = useReadContract({
    contract: uvdContract,
    method: "balanceOf",
    params: [activeAccount?.address || "0x0000000000000000000000000000000000000000"],
    queryOptions: { enabled: !!activeAccount }
  });

  const { data: uvdAllowanceData } = useReadContract({
    contract: uvdContract,
    method: "allowance",
    params: [
      activeAccount?.address || "0x0000000000000000000000000000000000000000",
      ARENA_ROUTER_ADDRESS
    ],
    queryOptions: { enabled: !!activeAccount }
  });

  // Update balances
  const updateBalances = useCallback(async () => {
    if (!activeAccount?.address) {
      setAvaxBalance('0.0');
      setUvdBalance('0.0');
      return;
    }

    try {
      const avaxBalance = await eth_getBalance(rpcClient, {
        address: activeAccount.address
      });
      setAvaxBalance(toEther(avaxBalance));

      const uvdBalance = await readContract({
        contract: uvdContract,
        method: "balanceOf",
        params: [activeAccount.address]
      });
      setUvdBalance(toEther(uvdBalance));

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

  useEffect(() => {
    const fetchAvaxBalance = async () => {
      if (activeAccount?.address) {
        try {
          const balance = await eth_getBalance(rpcClient, {
            address: activeAccount.address
          });
          setAvaxBalance(toEther(balance));
        } catch (error) {
          console.error('Error fetching AVAX balance:', error);
          setAvaxBalance('0.0');
        }
      } else {
        setAvaxBalance('0.0');
      }
    };

    fetchAvaxBalance();
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

  useEffect(() => {
    if (uvdAllowanceData) {
      try {
        setUvdAllowance(toEther(uvdAllowanceData));
      } catch (error) {
        console.error('Error converting UVD allowance:', error);
        setUvdAllowance('0.0');
      }
    } else {
      setUvdAllowance('0.0');
    }
  }, [uvdAllowanceData]);

  useEffect(() => {
    if (fromToken === 'UVD' && fromAmount && parseFloat(fromAmount) > 0) {
      setNeedsApproval(parseFloat(fromAmount) > parseFloat(uvdAllowance));
    } else {
      setNeedsApproval(false);
    }
  }, [fromToken, fromAmount, uvdAllowance]);

  // Handle transaction status updates
  useEffect(() => {
    if (isTransactionLoading && transactionResult?.transactionHash) {
      setTransactionStatus({
        type: 'submitted',
        message: currentTransactionType === 'approval'
          ? t('swap.approval_submitted')
          : t('swap.swap_submitted'),
        hash: transactionResult.transactionHash
      });
    } else if (isReceiptLoading && transactionResult?.transactionHash) {
      setTransactionStatus({
        type: 'pending',
        message: currentTransactionType === 'approval'
          ? t('swap.approval_pending')
          : t('swap.swap_pending'),
        hash: transactionResult.transactionHash
      });
    } else if (isReceiptSuccess && transactionReceipt) {
      setTransactionStatus({
        type: 'success',
        message: currentTransactionType === 'approval'
          ? t('swap.approval_confirmed')
          : t('swap.swap_confirmed'),
        hash: transactionReceipt.transactionHash
      });

      if (currentTransactionType === 'swap') {
        setFromAmount('');
        setToAmount('');
        updateBalances();
      } else if (currentTransactionType === 'approval') {
        updateBalances();
      }

      setCurrentTransactionType(null);
      setIsApproving(false);
      setIsLoading(false);
      resetTransaction();
    } else if (isReceiptError || isTransactionError) {
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
    t,
    updateBalances
  ]);

  // Get quote from Arena router
  const getQuote = async (inputAmount, isAvaxToUvd) => {
    if (!inputAmount || inputAmount === '0') return '0';

    try {
      const amountIn = toWei(inputAmount);
      const path = isAvaxToUvd
        ? [WAVAX_ADDRESS, UVD_ADDRESS]
        : [UVD_ADDRESS, WAVAX_ADDRESS];

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
      return '0';
    }
  };

  const handleFromAmountChange = async (value) => {
    setFromAmount(value);
    if (value && parseFloat(value) > 0) {
      const quote = await getQuote(value, fromToken === 'AVAX');
      setToAmount(quote);
    } else {
      setToAmount('');
    }
  };

  const refreshQuote = useCallback(async () => {
    if (fromAmount && parseFloat(fromAmount) > 0) {
      setIsRefreshing(true);
      try {
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

  useEffect(() => {
    if (fromAmount && parseFloat(fromAmount) > 0) {
      const interval = setInterval(refreshQuote, 5000);
      return () => clearInterval(interval);
    } else if (activeAccount?.address) {
      const interval = setInterval(updateBalances, 10000);
      return () => clearInterval(interval);
    }
  }, [fromAmount, fromToken, toToken, activeAccount, refreshQuote, updateBalances]);

  const handleSwapTokens = () => {
    const tempToken = fromToken;
    setFromToken(toToken);
    setToToken(tempToken);
    setFromAmount(toAmount);
    setToAmount(fromAmount);
  };

  const handleApprove = async () => {
    if (!activeAccount || !fromAmount || parseFloat(fromAmount) === 0) return;

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
    } catch (error) {
      console.error('Approval failed:', error);
      setIsApproving(false);
      setCurrentTransactionType(null);
    }
  };

  const handleSwap = async () => {
    if (!activeAccount || !fromAmount || parseFloat(fromAmount) === 0) return;

    setTransactionStatus(null);
    setIsLoading(true);
    setCurrentTransactionType('swap');

    try {
      const amountIn = toWei(fromAmount);
      const minAmountOut = toWei(
        (parseFloat(toAmount) * (100 - slippage[0]) / 100).toString()
      );
      const deadline = Math.floor(Date.now() / 1000) + 60;

      let transaction;

      if (fromToken === 'AVAX') {
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
    } catch (error) {
      console.error('Swap failed:', error);
      setIsLoading(false);
      setCurrentTransactionType(null);
    }
  };

  const currentBalance = fromToken === 'AVAX' ? avaxBalance : uvdBalance;
  const isSwapDisabled = !fromAmount ||
    parseFloat(fromAmount) === 0 ||
    isLoading ||
    isApproving ||
    isTransactionLoading ||
    isReceiptLoading ||
    parseFloat(fromAmount) > parseFloat(currentBalance) ||
    (fromToken === 'UVD' && needsApproval);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="w-full max-w-lg mx-auto"
    >
      <Card className="relative overflow-hidden border-ultraviolet/20 bg-background/95 backdrop-blur-sm">
        {/* Decorative gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-ultraviolet/5 via-transparent to-transparent pointer-events-none" />

        <CardHeader className="relative">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="text-2xl font-bold flex items-center gap-2">
                <Zap className="w-6 h-6 text-ultraviolet" />
                {t('swap.title')}
              </CardTitle>
              <CardDescription>
                Swap AVAX & UVD tokens instantly
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={refreshQuote}
                disabled={isRefreshing || !activeAccount?.address}
                className={cn(
                  "transition-all",
                  isRefreshing && "border-ultraviolet/50"
                )}
              >
                <RefreshCw className={cn(
                  "w-4 h-4",
                  isRefreshing && "animate-spin text-ultraviolet"
                )} />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setShowSettings(!showSettings)}
              >
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="relative space-y-4">
          <AnimatePresence>
            {transactionStatus && (
              <TransactionStatus
                status={transactionStatus}
                onClose={() => setTransactionStatus(null)}
              />
            )}
          </AnimatePresence>

          {/* Settings Panel */}
          <AnimatePresence>
            {showSettings && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <Card className="bg-card/50 border-border/50">
                  <CardContent className="pt-6 space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium">
                          Slippage Tolerance
                        </label>
                        <Badge variant="secondary">{slippage[0]}%</Badge>
                      </div>
                      <Slider
                        value={slippage}
                        onValueChange={setSlippage}
                        max={10}
                        step={0.5}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>0%</span>
                        <span>10%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* From Token */}
          <TokenSelector
            token={fromToken}
            amount={fromAmount}
            balance={currentBalance}
            onAmountChange={handleFromAmountChange}
            onMaxClick={() => handleFromAmountChange(currentBalance)}
            onPercentageClick={(percent) =>
              handleFromAmountChange((parseFloat(currentBalance) * percent).toString())
            }
            label={t('swap.from')}
            showQuickButtons={true}
          />

          {/* Swap Direction Button */}
          <div className="flex justify-center -my-2 relative z-10">
            <Button
              variant="outline"
              size="icon"
              onClick={handleSwapTokens}
              className="rounded-full border-2 bg-background hover:bg-ultraviolet hover:text-white hover:border-ultraviolet transition-all"
            >
              <ArrowDownUp className="w-4 h-4" />
            </Button>
          </div>

          {/* To Token */}
          <TokenSelector
            token={toToken}
            amount={toAmount}
            balance={toToken === 'AVAX' ? avaxBalance : uvdBalance}
            label={t('swap.to')}
            readOnly={true}
            isLoading={isRefreshing}
            showQuickButtons={false}
          />

          {/* Swap Info */}
          {fromAmount && toAmount && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="bg-card/50 border-border/50">
                <CardContent className="pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Info className="w-3 h-3" />
                      Rate
                    </span>
                    <span className="font-medium">
                      1 {fromToken} ≈ {(parseFloat(toAmount) / parseFloat(fromAmount)).toFixed(6)} {toToken}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Slippage Tolerance</span>
                    <span className="font-medium text-ultraviolet">{slippage[0]}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Minimum Received</span>
                    <span className="font-medium">
                      {(parseFloat(toAmount) * (100 - slippage[0]) / 100).toFixed(6)} {toToken}
                    </span>
                  </div>
                  {fromToken === 'UVD' && (
                    <div className="flex justify-between text-sm pt-2 border-t border-border/50">
                      <span className="text-muted-foreground">UVD Allowance</span>
                      <span className="font-medium">
                        {parseFloat(uvdAllowance).toFixed(6)} UVD
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Action Buttons */}
          {!activeAccount ? (
            <Card className="bg-muted/50 border-dashed">
              <CardContent className="pt-6 text-center">
                <p className="text-muted-foreground">
                  Please connect your wallet to start swapping
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {fromToken === 'UVD' && needsApproval && fromAmount && parseFloat(fromAmount) > 0 && parseFloat(fromAmount) <= parseFloat(currentBalance) && (
                <Button
                  onClick={handleApprove}
                  disabled={isApproving || isTransactionLoading || isReceiptLoading}
                  className="w-full h-12 text-base font-semibold bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600"
                >
                  {(isApproving || (isTransactionLoading && currentTransactionType === 'approval') || (isReceiptLoading && currentTransactionType === 'approval'))
                    ? 'Approving...'
                    : 'Approve UVD'}
                </Button>
              )}

              <Button
                onClick={handleSwap}
                disabled={isSwapDisabled}
                className="w-full h-12 text-base font-semibold bg-gradient-to-r from-ultraviolet to-ultraviolet-light hover:shadow-lg hover:shadow-ultraviolet/25"
              >
                {(isLoading || isTransactionLoading || isReceiptLoading) ? 'Swapping...' :
                 isApproving ? 'Approval Required' :
                 parseFloat(fromAmount) > parseFloat(currentBalance) ? 'Insufficient Balance' :
                 !fromAmount || parseFloat(fromAmount) === 0 ? 'Enter Amount' :
                 (fromToken === 'UVD' && needsApproval) ? 'Approve Required' :
                 'Swap Tokens'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default SwapWidgetV2;
