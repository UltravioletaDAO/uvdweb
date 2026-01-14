import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ethers } from 'ethers';
import { useActiveAccount, useReadContract, useSendTransaction, useWaitForReceipt } from 'thirdweb/react';
import { createThirdwebClient, getContract, prepareContractCall, prepareTransaction, toWei, toEther, getRpcClient, eth_getBalance, readContract } from 'thirdweb';
import { avalanche } from 'thirdweb/chains';
import { ArrowDownUp, Settings, RefreshCw, CheckCircle2, XCircle, Clock, X, Info, Zap, TrendingUp } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Slider } from './ui/slider';
import { TokenSelector } from './ui/token-selector';
import { cn } from '../lib/utils';

const client = createThirdwebClient({
  clientId: "7343a278c7ff30dd04caba86259e87ea",
});

const UVD_ADDRESS = "0x4Ffe7e01832243e03668E090706F17726c26d6B2";
const WAVAX_ADDRESS = "0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7";
const USDC_ADDRESS = "0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E";
const USDC_DECIMALS = 6;
const ARENA_ROUTER_ADDRESS = "0xf56d524d651b90e4b84dc2fffd83079698b9066e";
const JOE_ROUTER_ADDRESS = "0x60aE616a2155Ee3d9A68541Ba4544862310933d4";
const ODOS_ROUTER_ADDRESS = "0x88de50B233052e4Fb783d4F6db78Cc34fEa3e9FC";

const TOKEN_OPTIONS = ['AVAX', 'UVD', 'USDC'];

const ALLOWED_SWAP_PAIRS = {
  AVAX: ['UVD', 'USDC'],
  UVD: ['AVAX', 'USDC'],
  USDC: ['UVD', 'AVAX'],
};

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
      {"internalType": "uint256", "name": "amountOutMin", "type": "uint256"},
      {"internalType": "address[]", "name": "path", "type": "address[]"},
      {"internalType": "address", "name": "to", "type": "address"},
      {"internalType": "uint256", "name": "deadline", "type": "uint256"}
    ],
    "name": "swapExactTokensForTokens",
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
  },
  {
    "inputs": [
      {"internalType": "uint256", "name": "amountOutMin", "type": "uint256"},
      {"internalType": "address[]", "name": "path", "type": "address[]"},
      {"internalType": "address", "name": "to", "type": "address"},
      {"internalType": "uint256", "name": "deadline", "type": "uint256"}
    ],
    "name": "swapExactAVAXForTokensSupportingFeeOnTransferTokens",
    "outputs": [],
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
    "name": "swapExactTokensForAVAXSupportingFeeOnTransferTokens",
    "outputs": [],
    "stateMutability": "nonpayable",
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
    "name": "swapExactTokensForTokensSupportingFeeOnTransferTokens",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

const getValidSwapPair = (fromToken, toToken, changedSide) => {
  let nextFrom = fromToken;
  let nextTo = toToken;

  const allowedTargets = ALLOWED_SWAP_PAIRS[nextFrom] || [];

  if (!allowedTargets.includes(nextTo)) {
    if (changedSide === 'from') {
      nextTo = allowedTargets[0];
    } else {
      const candidateFrom = TOKEN_OPTIONS.find(
        (token) => (ALLOWED_SWAP_PAIRS[token] || []).includes(nextTo)
      );
      if (candidateFrom) {
        nextFrom = candidateFrom;
      }
    }
  }

  if (nextFrom === nextTo) {
    if (changedSide === 'from') {
      const alternativeTargets = allowedTargets.filter((token) => token !== nextFrom);
      if (alternativeTargets.length > 0) {
        nextTo = alternativeTargets[0];
      }
    } else {
      const candidateFrom = TOKEN_OPTIONS.find(
        (token) => token !== nextTo && (ALLOWED_SWAP_PAIRS[token] || []).includes(nextTo)
      );
      if (candidateFrom) {
        nextFrom = candidateFrom;
      }
    }
  }

  return { fromToken: nextFrom, toToken: nextTo };
};

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
  const [usdcBalance, setUsdcBalance] = useState('0');
  const [uvdAllowance, setUvdAllowance] = useState('0');
  const [uvdAllowanceJoe, setUvdAllowanceJoe] = useState('0');
  const [usdcAllowanceArena, setUsdcAllowanceArena] = useState('0');
  const [usdcAllowanceJoe, setUsdcAllowanceJoe] = useState('0');
   const [uvdAllowanceOdos, setUvdAllowanceOdos] = useState('0');
   const [usdcAllowanceOdos, setUsdcAllowanceOdos] = useState('0');
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

  const usdcContract = getContract({
    client,
    chain: avalanche,
    address: USDC_ADDRESS,
    abi: ERC20_ABI,
  });

  const arenaRouterContract = getContract({
    client,
    chain: avalanche,
    address: ARENA_ROUTER_ADDRESS,
    abi: ARENA_ROUTER_ABI,
  });

  const joeRouterContract = getContract({
    client,
    chain: avalanche,
    address: JOE_ROUTER_ADDRESS,
    abi: ARENA_ROUTER_ABI, // Compatible ABI
  });

  const getPath = useCallback((tokenIn, tokenOut) => {
    if (tokenIn === 'AVAX' && tokenOut === 'UVD') return [WAVAX_ADDRESS, UVD_ADDRESS];
    if (tokenIn === 'UVD' && tokenOut === 'AVAX') return [UVD_ADDRESS, WAVAX_ADDRESS];
    if (tokenIn === 'USDC' && tokenOut === 'UVD') return [USDC_ADDRESS, WAVAX_ADDRESS, UVD_ADDRESS];
    if (tokenIn === 'UVD' && tokenOut === 'USDC') return [UVD_ADDRESS, WAVAX_ADDRESS, USDC_ADDRESS];
    if (tokenIn === 'AVAX' && tokenOut === 'USDC') return [WAVAX_ADDRESS, USDC_ADDRESS];
    if (tokenIn === 'USDC' && tokenOut === 'AVAX') return [USDC_ADDRESS, WAVAX_ADDRESS];
    return [];
  }, []);

  const selectRouterForPath = useCallback(async (tokenIn, tokenOut, amountIn, path) => {
    // Force Arena whenever UVD participates to avoid cross-router multi-hop
    if (tokenIn === 'UVD' || tokenOut === 'UVD') {
      return { contract: arenaRouterContract, address: ARENA_ROUTER_ADDRESS };
    }
    if ((tokenIn === 'AVAX' && tokenOut === 'UVD') || (tokenIn === 'UVD' && tokenOut === 'AVAX')) {
      return { contract: arenaRouterContract, address: ARENA_ROUTER_ADDRESS };
    }
    try {
      await readContract({
        contract: arenaRouterContract,
        method: "getAmountsOut",
        params: [amountIn, path]
      });
      return { contract: arenaRouterContract, address: ARENA_ROUTER_ADDRESS };
    } catch {
      await readContract({
        contract: joeRouterContract,
        method: "getAmountsOut",
        params: [amountIn, path]
      });
      return { contract: joeRouterContract, address: JOE_ROUTER_ADDRESS };
    }
  }, [arenaRouterContract, joeRouterContract]);

  const rpcClient = getRpcClient({ client, chain: avalanche });
  const {
    mutate: sendTransaction,
    data: transactionResult,
    isLoading: isTransactionLoading,
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

  const { data: uvdAllowanceJoeData } = useReadContract({
    contract: uvdContract,
    method: "allowance",
    params: [
      activeAccount?.address || "0x0000000000000000000000000000000000000000",
      JOE_ROUTER_ADDRESS
    ],
    queryOptions: { enabled: !!activeAccount }
  });

  const { data: usdcBalanceData } = useReadContract({
    contract: usdcContract,
    method: "balanceOf",
    params: [activeAccount?.address || "0x0000000000000000000000000000000000000000"],
    queryOptions: { enabled: !!activeAccount }
  });

  const { data: usdcAllowanceArenaData } = useReadContract({
    contract: usdcContract,
    method: "allowance",
    params: [
      activeAccount?.address || "0x0000000000000000000000000000000000000000",
      ARENA_ROUTER_ADDRESS
    ],
    queryOptions: { enabled: !!activeAccount }
  });

  const { data: usdcAllowanceJoeData } = useReadContract({
    contract: usdcContract,
    method: "allowance",
    params: [
      activeAccount?.address || "0x0000000000000000000000000000000000000000",
      JOE_ROUTER_ADDRESS
    ],
    queryOptions: { enabled: !!activeAccount }
  });

  const { data: uvdAllowanceOdosData } = useReadContract({
    contract: uvdContract,
    method: "allowance",
    params: [
      activeAccount?.address || "0x0000000000000000000000000000000000000000",
      ODOS_ROUTER_ADDRESS
    ],
    queryOptions: { enabled: !!activeAccount }
  });

  const { data: usdcAllowanceOdosData } = useReadContract({
    contract: usdcContract,
    method: "allowance",
    params: [
      activeAccount?.address || "0x0000000000000000000000000000000000000000",
      ODOS_ROUTER_ADDRESS
    ],
    queryOptions: { enabled: !!activeAccount }
  });

  // Update balances
  const updateBalances = useCallback(async () => {
    if (!activeAccount?.address) {
      setAvaxBalance('0.0');
      setUvdBalance('0.0');
      setUsdcBalance('0.0');
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

      const usdcBalance = await readContract({
        contract: usdcContract,
        method: "balanceOf",
        params: [activeAccount.address]
      });
      setUsdcBalance(ethers.utils.formatUnits(usdcBalance, USDC_DECIMALS));

      const usdcAllowanceArena = await readContract({
        contract: usdcContract,
        method: "allowance",
        params: [activeAccount.address, ARENA_ROUTER_ADDRESS]
      });
      setUsdcAllowanceArena(ethers.utils.formatUnits(usdcAllowanceArena, USDC_DECIMALS));

      const usdcAllowanceJoe = await readContract({
        contract: usdcContract,
        method: "allowance",
        params: [activeAccount.address, JOE_ROUTER_ADDRESS]
      });
      setUsdcAllowanceJoe(ethers.utils.formatUnits(usdcAllowanceJoe, USDC_DECIMALS));
    } catch (error) {
      console.error('Error updating balances:', error);
    }
  }, [activeAccount, rpcClient, uvdContract, usdcContract]);

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
    if (uvdAllowanceJoeData) {
      try {
        setUvdAllowanceJoe(toEther(uvdAllowanceJoeData));
      } catch (error) {
        setUvdAllowanceJoe('0.0');
      }
    } else {
      setUvdAllowanceJoe('0.0');
    }
  }, [uvdAllowanceJoeData]);

  useEffect(() => {
    if (usdcAllowanceArenaData) {
      try {
        setUsdcAllowanceArena(ethers.utils.formatUnits(usdcAllowanceArenaData, USDC_DECIMALS));
      } catch (error) {
        setUsdcAllowanceArena('0.0');
      }
    } else {
      setUsdcAllowanceArena('0.0');
    }
  }, [usdcAllowanceArenaData]);

  useEffect(() => {
    if (usdcAllowanceJoeData) {
      try {
        setUsdcAllowanceJoe(ethers.utils.formatUnits(usdcAllowanceJoeData, USDC_DECIMALS));
      } catch (error) {
        setUsdcAllowanceJoe('0.0');
      }
    } else {
      setUsdcAllowanceJoe('0.0');
    }
  }, [usdcAllowanceJoeData]);

  useEffect(() => {
    if (uvdAllowanceOdosData) {
      try {
        setUvdAllowanceOdos(toEther(uvdAllowanceOdosData));
      } catch (error) {
        setUvdAllowanceOdos('0.0');
      }
    } else {
      setUvdAllowanceOdos('0.0');
    }
  }, [uvdAllowanceOdosData]);

  useEffect(() => {
    if (usdcAllowanceOdosData) {
      try {
        setUsdcAllowanceOdos(ethers.utils.formatUnits(usdcAllowanceOdosData, USDC_DECIMALS));
      } catch (error) {
        setUsdcAllowanceOdos('0.0');
      }
    } else {
      setUsdcAllowanceOdos('0.0');
    }
  }, [usdcAllowanceOdosData]);

  useEffect(() => {
    const evaluateApproval = async () => {
      if (!(fromAmount && parseFloat(fromAmount) > 0)) {
        setNeedsApproval(false);
        return;
      }
      if (fromToken === 'UVD' || fromToken === 'USDC') {
        const isOdosPair =
          (fromToken === 'USDC' && toToken === 'UVD') ||
          (fromToken === 'UVD' && toToken === 'USDC');
        if (isOdosPair) {
          const allowanceStr = fromToken === 'UVD' ? uvdAllowanceOdos : usdcAllowanceOdos;
          setNeedsApproval(parseFloat(fromAmount) > parseFloat(allowanceStr));
          return;
        }
        const path = getPath(fromToken, toToken);
        if (path.length === 0) {
          setNeedsApproval(false);
          return;
        }
        try {
          const amountIn = fromToken === 'USDC'
            ? ethers.utils.parseUnits(fromAmount, USDC_DECIMALS).toString()
            : toWei(fromAmount);
          const { address } = await selectRouterForPath(fromToken, toToken, amountIn, path);
          let allowanceStr = '0';
          if (fromToken === 'UVD') {
            allowanceStr = address === ARENA_ROUTER_ADDRESS ? uvdAllowance : uvdAllowanceJoe;
          } else {
            allowanceStr = address === ARENA_ROUTER_ADDRESS ? usdcAllowanceArena : usdcAllowanceJoe;
          }
          setNeedsApproval(parseFloat(fromAmount) > parseFloat(allowanceStr));
        } catch {
          setNeedsApproval(true);
        }
      } else {
        setNeedsApproval(false);
      }
    };
    evaluateApproval();
  }, [fromToken, toToken, fromAmount, uvdAllowance, uvdAllowanceJoe, usdcAllowanceArena, usdcAllowanceJoe, uvdAllowanceOdos, usdcAllowanceOdos, selectRouterForPath, getPath]);

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
      const errorCode = typeof error === 'object' && error !== null ? error.code : undefined;
      const errorMessage = typeof error === 'string' ? error : error?.message || '';
      const isUserRejection = errorMessage.includes('User rejected') ||
                              errorMessage.includes('user rejected') ||
                              errorMessage.includes('User denied') ||
                              errorCode === 4001 ||
                              errorCode === 'ACTION_REJECTED';
      const isOdosSignatureError = errorMessage.includes('0xfb8f41b2') ||
                                   errorMessage.includes('Encoded error signature');

      const baseLabel = currentTransactionType === 'approval'
        ? t('swap.approval_failed')
        : t('swap.swap_failed');

      let finalMessage;

      if (isUserRejection) {
        finalMessage = currentTransactionType === 'approval'
          ? t('swap.approval_cancelled')
          : t('swap.swap_cancelled');
      } else if (isOdosSignatureError) {
        finalMessage = `${baseLabel}: ${t('swap.odos_error')}`;
      } else {
        finalMessage = `${baseLabel}: ${errorMessage || t('swap.try_again')}`;
      }

      setTransactionStatus({
        type: 'error',
        message: finalMessage,
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

  // Get quote from router
  const getQuote = async (inputAmount, tokenIn, tokenOut) => {
    if (!inputAmount || inputAmount === '0') return '0';

    try {
      const isOdosPair =
        (tokenIn === 'USDC' && tokenOut === 'UVD') ||
        (tokenIn === 'UVD' && tokenOut === 'USDC');

      if (isOdosPair) {
        if (!activeAccount?.address) {
          return '0';
        }

        const inputAddress = tokenIn === 'USDC' ? USDC_ADDRESS : UVD_ADDRESS;
        const outputAddress = tokenOut === 'USDC' ? USDC_ADDRESS : UVD_ADDRESS;
        const amountIn = tokenIn === 'USDC'
          ? ethers.utils.parseUnits(inputAmount, USDC_DECIMALS).toString()
          : ethers.utils.parseUnits(inputAmount, 18).toString();

        const payload = {
          chainId: 43114,
          inputTokens: [
            {
              tokenAddress: inputAddress,
              amount: amountIn,
            },
          ],
          outputTokens: [
            {
              tokenAddress: outputAddress,
              proportion: 1,
            },
          ],
          userAddr: activeAccount.address,
          slippageLimitPercent: slippage[0],
          referralCode: 0,
          disableRFQs: true,
          compact: true,
        };

        if (process.env.REACT_APP_DEBUG_ENABLED === 'true') {
          console.log('Odos getQuote request', {
            tokenIn,
            tokenOut,
            payload,
          });
        }

        const response = await fetch('https://api.odos.xyz/sor/quote/v2', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const errorBody = await response.json().catch(() => null);
          console.error('Odos getQuote HTTP error', {
            status: response.status,
            error: errorBody,
          });
        } else {
          const quote = await response.json();
          if (process.env.REACT_APP_DEBUG_ENABLED === 'true') console.log('Odos getQuote response', quote);
          const rawOutAmount =
            (quote.outAmounts && quote.outAmounts[0]) ||
            (quote.outputTokens && quote.outputTokens[0] && quote.outputTokens[0].amount);

          if (rawOutAmount && rawOutAmount !== '0') {
            const outputDecimals = tokenOut === 'USDC' ? USDC_DECIMALS : 18;
            const formatted = ethers.utils.formatUnits(rawOutAmount.toString(), outputDecimals);
            return formatted;
          }
          if (process.env.REACT_APP_DEBUG_ENABLED === 'true') console.warn('Odos getQuote returned no outAmount, falling back to router');
        }
      }

      let amountIn;
      if (tokenIn === 'USDC') {
        amountIn = ethers.utils.parseUnits(inputAmount, USDC_DECIMALS).toString();
      } else {
        amountIn = toWei(inputAmount);
      }

      const path = getPath(tokenIn, tokenOut);
      if (path.length === 0) return '0';

      const { contract: router } = await selectRouterForPath(tokenIn, tokenOut, amountIn, path);

      const amounts = await readContract({
        contract: router,
        method: "getAmountsOut",
        params: [amountIn, path]
      });

      if (amounts && amounts.length > 0) {
        const amountOutRaw = amounts[amounts.length - 1];
        let amountOut;
        if (tokenOut === 'USDC') {
          amountOut = ethers.utils.formatUnits(amountOutRaw.toString(), USDC_DECIMALS);
        } else {
          amountOut = toEther(amountOutRaw);
        }
        return amountOut;
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
      const quote = await getQuote(value, fromToken, toToken);
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
          getQuote(fromAmount, fromToken, toToken),
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
  }, [fromAmount, fromToken, toToken, activeAccount, updateBalances]);

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
    const tempAmount = fromAmount;
    
    // When swapping, we switch tokens. 
    // If we were swapping AVAX->UVD, now it's UVD->AVAX.
    // If USDC->UVD, now UVD->USDC.
    // But if we have specific logic for what is allowed, we might need to adjust.
    // Here we just swap whatever is there.
    setFromToken(toToken);
    setToToken(tempToken);
    
    // Also swap amounts logic
    setFromAmount(toAmount);
    setToAmount(tempAmount);
    
    // Note: getQuote will be triggered by effect if needed, but since we set amounts directly,
    // we might not need to recalculate immediately unless amounts are empty.
  };

  const handleApprove = async () => {
    if (!activeAccount || !fromAmount || parseFloat(fromAmount) === 0) return;

    setTransactionStatus(null);
    setIsApproving(true);
    setCurrentTransactionType('approval');

    try {
      let amountToApprove;
      let contractToApprove;

      let routerAddress = ARENA_ROUTER_ADDRESS;
      const path = getPath(fromToken, toToken);
      const isOdosPair =
        (fromToken === 'USDC' && toToken === 'UVD') ||
        (fromToken === 'UVD' && toToken === 'USDC');
      if (isOdosPair) {
        routerAddress = ODOS_ROUTER_ADDRESS;
      } else if (path.length > 0) {
        const amountIn = fromToken === 'USDC'
          ? ethers.utils.parseUnits(fromAmount, USDC_DECIMALS).toString()
          : toWei(fromAmount);
        const { address } = await selectRouterForPath(fromToken, toToken, amountIn, path);
        routerAddress = address;
      }

      if (fromToken === 'UVD') {
        amountToApprove = toWei(fromAmount);
        contractToApprove = uvdContract;
      } else if (fromToken === 'USDC') {
        amountToApprove = ethers.utils.parseUnits(fromAmount, USDC_DECIMALS).toString();
        contractToApprove = usdcContract;
      } else {
        return; // Native token doesn't need approval
      }

      const transaction = prepareContractCall({
        contract: contractToApprove,
        method: "approve",
        params: [routerAddress, amountToApprove]
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
      const isOdosPair =
        (fromToken === 'USDC' && toToken === 'UVD') ||
        (fromToken === 'UVD' && toToken === 'USDC');

      if (isOdosPair) {
        const inputAddress = fromToken === 'USDC' ? USDC_ADDRESS : UVD_ADDRESS;
        const outputAddress = toToken === 'USDC' ? USDC_ADDRESS : UVD_ADDRESS;
        const amountInOdos = fromToken === 'USDC'
          ? ethers.utils.parseUnits(fromAmount, USDC_DECIMALS).toString()
          : ethers.utils.parseUnits(fromAmount, 18).toString();

        const quotePayload = {
          chainId: 43114,
          inputTokens: [
            {
              tokenAddress: inputAddress,
              amount: amountInOdos,
            },
          ],
          outputTokens: [
            {
              tokenAddress: outputAddress,
              proportion: 1,
            },
          ],
          userAddr: activeAccount.address,
          slippageLimitPercent: slippage[0],
          referralCode: 0,
          disableRFQs: true,
          compact: true,
        };

        if (process.env.REACT_APP_DEBUG_ENABLED === 'true') {
          console.log('Odos swap quote request', {
            fromToken,
            toToken,
            quotePayload,
          });
        }

        let usedOdos = false;

        try {
          const quoteResponse = await fetch('https://api.odos.xyz/sor/quote/v2', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(quotePayload),
          });

          if (!quoteResponse.ok) {
            const errorBody = await quoteResponse.json().catch(() => null);
            console.error('Odos swap quote HTTP error', {
              status: quoteResponse.status,
              error: errorBody,
            });
          } else {
            const quoteJson = await quoteResponse.json();
            if (process.env.REACT_APP_DEBUG_ENABLED === 'true') console.log('Odos swap quote response', quoteJson);

            if (!quoteJson.pathId) {
              console.error('Odos swap quote missing pathId');
            } else {
              const assemblePayload = {
                userAddr: activeAccount.address,
                pathId: quoteJson.pathId,
                simulate: false,
              };

              if (process.env.REACT_APP_DEBUG_ENABLED === 'true') console.log('Odos assemble request', assemblePayload);

              const assembleResponse = await fetch('https://api.odos.xyz/sor/assemble', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(assemblePayload),
              });

              if (!assembleResponse.ok) {
                const errorBody = await assembleResponse.json().catch(() => null);
                console.error('Odos assemble HTTP error', {
                  status: assembleResponse.status,
                  error: errorBody,
                });
              } else {
                const assembleJson = await assembleResponse.json();
                if (process.env.REACT_APP_DEBUG_ENABLED === 'true') console.log('Odos assemble response', assembleJson);
                const tx = assembleJson.transaction;

                if (!tx || !tx.to || !tx.data) {
                  console.error('Odos assemble returned invalid transaction', tx);
                } else {
                  const preparedTx = prepareTransaction({
                    to: tx.to,
                    data: tx.data,
                    chain: avalanche,
                    client,
                  });

                  sendTransaction(preparedTx);
                  usedOdos = true;
                }
              }
            }
          }
        } catch (odosError) {
          console.error('Odos swap failed, will try router fallback', odosError);
        }

        if (usedOdos) {
          return;
        }

        if (process.env.REACT_APP_DEBUG_ENABLED === 'true') {
          console.warn('Falling back to router swap for pair expected to use Odos', {
            fromToken,
            toToken,
          });
        }
      }

      let amountIn;
      let minAmountOut;
      let path;
      let transaction;
      const deadline = Math.floor(Date.now() / 1000) + 300;

      // Calculate minAmountOut based on slippage
      // Note: toAmount needs to be parsed with correct decimals for the TO token
      if (toToken === 'USDC') {
         minAmountOut = ethers.utils.parseUnits(
            (parseFloat(toAmount) * (100 - slippage[0]) / 100).toFixed(USDC_DECIMALS), 
            USDC_DECIMALS
         ).toString();
      } else {
         minAmountOut = toWei(
            (parseFloat(toAmount) * (100 - slippage[0]) / 100).toFixed(18)
         );
      }

      let routerContractSelected = arenaRouterContract;
      const pathForSelection = getPath(fromToken, toToken);
      if (pathForSelection.length > 0) {
        const amountForSelection = fromToken === 'USDC'
          ? ethers.utils.parseUnits(fromAmount, USDC_DECIMALS).toString()
          : toWei(fromAmount);
        const { contract } = await selectRouterForPath(fromToken, toToken, amountForSelection, pathForSelection);
        routerContractSelected = contract;
      }

      // Build path once and preflight check amounts on selected router
      path = getPath(fromToken, toToken);
      if (!path.length) {
        setIsLoading(false);
        setCurrentTransactionType(null);
        return;
      }
      amountIn = fromToken === 'USDC'
        ? ethers.utils.parseUnits(fromAmount, USDC_DECIMALS).toString()
        : toWei(fromAmount);
      try {
        await readContract({
          contract: routerContractSelected,
          method: "getAmountsOut",
          params: [amountIn, path]
        });
      } catch (e) {
        setIsLoading(false);
        setCurrentTransactionType(null);
        return;
      }

      if (fromToken === 'AVAX') {
        amountIn = toWei(fromAmount);
        
        transaction = prepareContractCall({
          contract: routerContractSelected,
          method: "swapExactAVAXForTokensSupportingFeeOnTransferTokens",
          params: [
            minAmountOut,
            path,
            activeAccount.address,
            deadline
          ],
          value: amountIn
        });
      } else if (fromToken === 'UVD' && toToken === 'AVAX') {
        amountIn = toWei(fromAmount);
        
        transaction = prepareContractCall({
          contract: routerContractSelected,
          method: "swapExactTokensForAVAXSupportingFeeOnTransferTokens",
          params: [
            amountIn,
            minAmountOut,
            path,
            activeAccount.address,
            deadline
          ]
        });
      } else if (fromToken === 'USDC' && toToken === 'UVD') {
        amountIn = ethers.utils.parseUnits(fromAmount, USDC_DECIMALS).toString();
        
        transaction = prepareContractCall({
          contract: routerContractSelected,
          method: "swapExactTokensForTokensSupportingFeeOnTransferTokens",
          params: [
            amountIn,
            minAmountOut,
            path,
            activeAccount.address,
            deadline
          ]
        });
      } else if (fromToken === 'UVD' && toToken === 'USDC') {
        amountIn = toWei(fromAmount);
        
        transaction = prepareContractCall({
          contract: routerContractSelected,
          method: "swapExactTokensForTokensSupportingFeeOnTransferTokens",
          params: [
            amountIn,
            minAmountOut,
            path,
            activeAccount.address,
            deadline
          ]
        });
      } else if (fromToken === 'AVAX' && toToken === 'USDC') {
        amountIn = toWei(fromAmount);
        
        transaction = prepareContractCall({
          contract: routerContractSelected,
          method: "swapExactAVAXForTokensSupportingFeeOnTransferTokens",
          params: [
            minAmountOut,
            path,
            activeAccount.address,
            deadline
          ],
          value: amountIn
        });
      } else if (fromToken === 'USDC' && toToken === 'AVAX') {
        amountIn = ethers.utils.parseUnits(fromAmount, USDC_DECIMALS).toString();
        
        transaction = prepareContractCall({
          contract: routerContractSelected,
          method: "swapExactTokensForAVAXSupportingFeeOnTransferTokens",
          params: [
            amountIn,
            minAmountOut,
            path,
            activeAccount.address,
            deadline
          ]
        });
      }

      sendTransaction(transaction);
    } catch (error) {
      console.error('Swap failed:', error);
      const errorMessage = typeof error === 'string' ? error : error?.message || '';
      const isOdosSignatureError = errorMessage.includes('0xfb8f41b2') ||
                                   errorMessage.includes('Encoded error signature');

      let finalMessage;

      if (isOdosSignatureError) {
        finalMessage = `${t('swap.swap_failed')}: ${t('swap.odos_error')}`;
      } else {
        finalMessage = `${t('swap.swap_failed')}: ${errorMessage || t('swap.try_again')}`;
      }

      setIsLoading(false);
      setCurrentTransactionType(null);
      setTransactionStatus({
        type: 'error',
        message: finalMessage,
        hash: null
      });
    }
  };

  let currentBalance = '0';
  if (fromToken === 'AVAX') currentBalance = avaxBalance;
  else if (fromToken === 'UVD') currentBalance = uvdBalance;
  else if (fromToken === 'USDC') currentBalance = usdcBalance;

  const isSwapDisabled = !fromAmount ||
    parseFloat(fromAmount) === 0 ||
    isLoading ||
    isApproving ||
    isTransactionLoading ||
    isReceiptLoading ||
    parseFloat(fromAmount) > parseFloat(currentBalance) ||
    (['UVD','USDC'].includes(fromToken) && parseFloat(toAmount || '0') === 0) ||
    ((fromToken === 'UVD' || fromToken === 'USDC') && needsApproval);

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
                Swap AVAX, USDC & UVD tokens instantly
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
            label={t('swap.from')}
            token={fromToken}
            amount={fromAmount}
            balance={currentBalance}
            onAmountChange={handleFromAmountChange}
            onMaxClick={() => handleFromAmountChange(currentBalance)}
            onPercentageClick={(percent) => {
              const amount = parseFloat(currentBalance) * percent;
              const decimals = fromToken === 'USDC' ? 6 : 18;
              handleFromAmountChange(amount.toFixed(decimals));
            }}
            onTokenSelect={(token) => {
              const { fromToken: nextFromToken, toToken: nextToToken } = getValidSwapPair(
                token,
                toToken,
                'from'
              );
              setFromToken(nextFromToken);
              setToToken(nextToToken);
              setFromAmount('');
              setToAmount('');
            }}
            options={['AVAX', 'UVD', 'USDC']}
            showQuickButtons={true}
          />

          {/* Swap Direction Button */}
          <div className="flex justify-center -my-3 z-10 relative">
            <Button
              size="icon"
              variant="secondary"
              className="rounded-full w-10 h-10 shadow-md border border-border/50 hover:scale-110 transition-transform bg-background"
              onClick={handleSwapTokens}
              disabled={isLoading || isApproving}
            >
              <ArrowDownUp className="w-5 h-5 text-ultraviolet" />
            </Button>
          </div>

          {/* To Token */}
          <TokenSelector
            label={t('swap.to')}
            token={toToken}
            amount={toAmount}
            balance={toToken === 'UVD' ? uvdBalance : (toToken === 'AVAX' ? avaxBalance : usdcBalance)}
            readOnly={true}
            isLoading={isRefreshing}
            onTokenSelect={(token) => {
              const { fromToken: nextFromToken, toToken: nextToToken } = getValidSwapPair(
                fromToken,
                token,
                'to'
              );
              setFromToken(nextFromToken);
              setToToken(nextToToken);
              setFromAmount('');
              setToAmount('');
            }}
            options={['AVAX', 'UVD', 'USDC']}
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
                  {(fromToken === 'UVD' || fromToken === 'USDC') && (
                    <div className="flex justify-between text-sm pt-2 border-t border-border/50">
                      <span className="text-muted-foreground">{fromToken} Allowance</span>
                      <span className="font-medium">
                        {parseFloat((() => {
                          const path = getPath(fromToken, toToken);
                          if (!path.length) return '0';
                          if (fromToken === 'UVD') {
                            const a = parseFloat(uvdAllowance);
                            const j = parseFloat(uvdAllowanceJoe);
                            const o = parseFloat(uvdAllowanceOdos);
                            return (Math.max(a, j, o)).toString();
                          } else {
                            const a = parseFloat(usdcAllowanceArena);
                            const j = parseFloat(usdcAllowanceJoe);
                            const o = parseFloat(usdcAllowanceOdos);
                            return (Math.max(a, j, o)).toString();
                          }
                        })()).toFixed(6)} {fromToken}
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
              {(fromToken === 'UVD' || fromToken === 'USDC') && needsApproval && fromAmount && parseFloat(fromAmount) > 0 && parseFloat(fromAmount) <= parseFloat(currentBalance) && (
                <Button
                  onClick={handleApprove}
                  disabled={isApproving || isTransactionLoading || isReceiptLoading}
                  className="w-full h-12 text-base font-semibold bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600"
                >
                  {(isApproving || (isTransactionLoading && currentTransactionType === 'approval') || (isReceiptLoading && currentTransactionType === 'approval'))
                    ? 'Approving...'
                    : `Approve ${fromToken}`}
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

              <p className="text-xs text-muted-foreground text-center">
                {t('swap.gas_hint')}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default SwapWidgetV2;
