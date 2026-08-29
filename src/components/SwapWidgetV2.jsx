/* global BigInt */
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useActiveAccount, useSendTransaction, useWaitForReceipt } from 'thirdweb/react';
import { createThirdwebClient, prepareTransaction } from 'thirdweb';
import { avalanche } from 'thirdweb/chains';
import { ArrowDownUp, Settings, RefreshCw, CheckCircle2, XCircle, Clock, X, Info, Zap, TrendingUp } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Slider } from './ui/slider';
import { TokenSelector } from './ui/token-selector';
import { cn } from '../lib/utils';
import { TOKENS, SWAP_TOKENS, SWAP_CONFIG, parseUnits, formatUnits } from '../services/swap/tokens';
import { getQuote, buildSwap, checkAllowance, buildApproval } from '../services/swap/aggregator';
import { useSwapBalances } from '../hooks/useSwapBalances';

const client = createThirdwebClient({
  clientId: "7343a278c7ff30dd04caba86259e87ea",
});

// AVAX que MAX deja sin gastar para poder pagar el gas de la propia tx.
const AVAX_GAS_RESERVE = '0.01';
// Refresco del quote: debounce al tipear, intervalo con quote vigente (CONTRATO §11).
const QUOTE_DEBOUNCE_MS = 400;
const QUOTE_REFRESH_MS = 20000;
// Nunca se firma un calldata más viejo que esto: se re-arma antes de enviar.
const BUILD_MAX_AGE_MS = 30000;
// Slippage y deadline salen de la config central: el widget no vuelve a tipear el número.
const DEFAULT_SLIPPAGE_PCT = SWAP_CONFIG.defaultSlippageBps / 100;
const DEFAULT_DEADLINE_MIN = Math.round(SWAP_CONFIG.defaultDeadlineSec / 60);
const MAX_DEADLINE_MIN = 60;

// Fallbacks en inglés para los textos del botón mientras el verificador agrega las claves a
// los 4 idiomas (pedido en docs/swap-fix-2026-08-28/i18n-requests.md).
const ERROR_FALLBACKS = {
  NO_ROUTE: 'No route available for this pair',
  AMOUNT_TOO_SMALL: 'Amount too small to route',
  AMOUNT_TOO_LARGE: 'Amount too large to route',
  TOKEN_NOT_FOUND: 'Token not supported by the router',
  PROVIDER_DOWN: 'Swap providers unavailable, try again',
  TIMEOUT: 'Quote timed out, try again',
  INSUFFICIENT_BALANCE: 'Insufficient balance',
  NEEDS_APPROVAL: 'Approval required',
  USER_REJECTED: 'Cancelled in your wallet',
  UNKNOWN: 'Swap unavailable right now',
};

const gte = (a, b) => {
  try {
    return BigInt(a) >= BigInt(b);
  } catch {
    return false;
  }
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
  const [slippage, setSlippage] = useState([DEFAULT_SLIPPAGE_PCT]);
  const [deadlineMin, setDeadlineMin] = useState(DEFAULT_DEADLINE_MIN);
  const [showSettings, setShowSettings] = useState(false);

  const [quote, setQuote] = useState(null);
  const [quoteError, setQuoteError] = useState(null);
  const [isQuoting, setIsQuoting] = useState(false);

  const [build, setBuild] = useState(null);
  const [buildError, setBuildError] = useState(null);
  const [allowanceInfo, setAllowanceInfo] = useState(null);
  const [allowanceError, setAllowanceError] = useState(null);
  const [allowanceNonce, setAllowanceNonce] = useState(0);

  const [isApproving, setIsApproving] = useState(false);
  const [isSwapping, setIsSwapping] = useState(false);
  const [transactionStatus, setTransactionStatus] = useState(null);
  const [currentTransactionType, setCurrentTransactionType] = useState(null);

  const quoteReqId = useRef(0);
  const quoteAbort = useRef(null);

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

  const txInFlight = isSwapping || isApproving || isTransactionLoading || isReceiptLoading;

  const { balances, refresh: refreshBalances, isRefreshing: isBalancesRefreshing } = useSwapBalances({
    client,
    address: activeAccount?.address,
    paused: txInFlight,
  });

  // El slider da PORCENTAJE; buildSwap quiere BASIS POINTS enteros dentro de rango.
  // Equivocarse por 100x acá es un slippage de 100% o de 0.01%.
  const slippageBps = Math.min(
    Math.max(Math.round(slippage[0] * 100), SWAP_CONFIG.minSlippageBps),
    SWAP_CONFIG.maxSlippageBps
  );
  const isNativeFrom = !!TOKENS[fromToken]?.native;
  const fromBalance = balances[fromToken] || { status: 'idle', value: null, usd: null };
  const toBalance = balances[toToken] || { status: 'idle', value: null, usd: null };
  const toAmount = quote?.amountOutFormatted || '';

  const errorLabel = useCallback((error) => {
    if (!error) return t('swap.err.unknown', ERROR_FALLBACKS.UNKNOWN);
    const code = String(error.code || 'UNKNOWN').toUpperCase();
    const key = error.i18nKey || `swap.err.${code.toLowerCase()}`;
    const fallback = ERROR_FALLBACKS[code] || error.message || ERROR_FALLBACKS.UNKNOWN;
    const label = t(key, fallback);
    if (code === 'UNKNOWN' && error.message) return `${label}: ${error.message}`;
    return label;
  }, [t]);

  // ---------------------------------------------------------------- quotes

  const runQuote = useCallback(async () => {
    if (!fromAmount || !(parseFloat(fromAmount) > 0) || fromToken === toToken) return;

    const id = ++quoteReqId.current;
    if (quoteAbort.current) quoteAbort.current.abort();
    const controller = new AbortController();
    quoteAbort.current = controller;

    setIsQuoting(true);
    try {
      const result = await getQuote(
        { fromToken, toToken, amount: fromAmount, userAddress: activeAccount?.address },
        { signal: controller.signal }
      );
      if (id !== quoteReqId.current) return; // respuesta vieja: no pisa el estado
      if (result && result.ok) {
        setQuote(result);
        setQuoteError(null);
      } else {
        setQuote(null);
        setQuoteError((result && result.error) || { code: 'UNKNOWN' });
      }
    } catch (error) {
      if (id !== quoteReqId.current || error?.name === 'AbortError') return;
      setQuote(null);
      setQuoteError({ code: 'UNKNOWN', message: error?.message });
    } finally {
      if (id === quoteReqId.current) setIsQuoting(false);
    }
  }, [fromAmount, fromToken, toToken, activeAccount?.address]);

  const pairKey = `${fromToken}/${toToken}`;
  const prevPairKey = useRef(pairKey);

  useEffect(() => {
    const pairChanged = prevPairKey.current !== pairKey;
    prevPairKey.current = pairKey;

    if (!fromAmount || !(parseFloat(fromAmount) > 0) || fromToken === toToken) {
      quoteReqId.current += 1;
      if (quoteAbort.current) quoteAbort.current.abort();
      setQuote(null);
      setQuoteError(null);
      setIsQuoting(false);
      return undefined;
    }

    // Cambio de token: inmediato. Cambio de monto: debounce.
    const timer = setTimeout(runQuote, pairChanged ? 0 : QUOTE_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [fromAmount, fromToken, toToken, pairKey, runQuote]);

  useEffect(() => {
    if (!quote || txInFlight) return undefined;
    const interval = setInterval(runQuote, QUOTE_REFRESH_MS);
    return () => clearInterval(interval);
  }, [quote, txInFlight, runQuote]);

  // ------------------------------------------------- build + allowance

  // El `spender` sale del build vigente: no se hardcodea un router (en ParaSwap el spender
  // NO es el `to` de la tx). Una sola allowance, contra ese spender.
  useEffect(() => {
    let cancelled = false;

    const resolveApproval = async () => {
      if (!quote || !activeAccount?.address || isNativeFrom) {
        setBuild(null);
        setBuildError(null);
        setAllowanceInfo(null);
        setAllowanceError(null);
        return;
      }

      try {
        const result = await buildSwap({
          quote,
          sender: activeAccount.address,
          slippageBps,
          deadlineSec: deadlineMin * 60,
        });
        if (cancelled) return;

        if (!result || !result.ok) {
          setBuild(null);
          setBuildError((result && result.error) || { code: 'UNKNOWN' });
          setAllowanceInfo(null);
          setAllowanceError(null);
          return;
        }

        setBuild({ ...result, builtAt: Date.now() });
        setBuildError(null);

        const allowance = await checkAllowance({
          tokenSymbol: fromToken,
          owner: activeAccount.address,
          spender: result.spender,
          amount: quote.amountInFormatted,
        });
        if (cancelled) return;

        if (allowance && allowance.ok) {
          setAllowanceInfo({
            spender: result.spender,
            allowance: allowance.allowance,
            sufficient: gte(allowance.allowance, quote.amountIn),
          });
          setAllowanceError(null);
        } else {
          // Allowance desconocida NO es allowance suficiente: se bloquea con el motivo,
          // porque habilitar el swap acá lo manda a revertir on-chain.
          setAllowanceInfo(null);
          setAllowanceError((allowance && allowance.error) || { code: 'UNKNOWN' });
        }
      } catch (error) {
        if (cancelled) return;
        setBuild(null);
        setBuildError({ code: 'UNKNOWN', message: error?.message });
        setAllowanceInfo(null);
      }
    };

    resolveApproval();
    return () => { cancelled = true; };
  }, [quote, activeAccount?.address, isNativeFrom, fromToken, slippageBps, deadlineMin, allowanceNonce]);

  const needsApproval = !isNativeFrom && !!quote && !!allowanceInfo && !allowanceInfo.sufficient;

  // ------------------------------------------------------------ balances

  const balanceTitleFor = useCallback((entry) => {
    if (!entry) return undefined;
    if (entry.status === 'error') {
      return `${t('swap.balance_unavailable', 'Balance unavailable — could not read this token')}${entry.error ? `: ${entry.error}` : ''}`;
    }
    if (entry.status === 'loading') return t('swap.balance_loading', 'Loading balance…');
    return undefined;
  }, [t]);

  const hasBalance = fromBalance.status === 'ok' && fromBalance.value !== null;
  const insufficientBalance =
    hasBalance && !!fromAmount && parseFloat(fromAmount) > parseFloat(fromBalance.value);

  // MAX/porcentajes en enteros exactos: un toFixed(18) sobre un float puede devolver más de
  // lo que hay y la tx revierte.
  const amountFromBalance = useCallback((symbol, fraction) => {
    const entry = balances[symbol];
    const token = TOKENS[symbol];
    if (!token || !entry || entry.status !== 'ok' || entry.value === null) return '';

    const minimal = parseUnits(entry.value, token.decimals);
    if (minimal === null) return '';

    let raw = BigInt(minimal);
    if (token.native) {
      // MAX de AVAX reserva gas: gastar el balance entero deja la tx sin con qué pagarse.
      const reserve = BigInt(parseUnits(AVAX_GAS_RESERVE, token.decimals) || '0');
      raw = raw > reserve ? raw - reserve : BigInt(0);
    }
    if (fraction < 1) {
      raw = (raw * BigInt(Math.round(fraction * 100))) / BigInt(100);
    }
    return formatUnits(raw.toString(), token.decimals) || '';
  }, [balances]);

  // ------------------------------------------------------ transacciones

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
        setQuote(null);
        setBuild(null);
      }
      setAllowanceNonce((value) => value + 1);
      refreshBalances();

      setCurrentTransactionType(null);
      setIsApproving(false);
      setIsSwapping(false);
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

      const baseLabel = currentTransactionType === 'approval'
        ? t('swap.approval_failed')
        : t('swap.swap_failed');

      const finalMessage = isUserRejection
        ? (currentTransactionType === 'approval'
            ? t('swap.approval_cancelled')
            : t('swap.swap_cancelled'))
        : `${baseLabel}: ${errorMessage || t('swap.try_again')}`;

      setTransactionStatus({
        type: 'error',
        message: finalMessage,
        hash: transactionResult?.transactionHash || null
      });

      setCurrentTransactionType(null);
      setIsApproving(false);
      setIsSwapping(false);
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
    refreshBalances
  ]);

  const handleFromAmountChange = (value) => {
    setFromAmount(value);
  };

  const handleRefresh = useCallback(() => {
    refreshBalances();
    runQuote();
  }, [refreshBalances, runQuote]);

  const handleSwapTokens = () => {
    const previousFrom = fromToken;
    setFromToken(toToken);
    setToToken(previousFrom);
    setFromAmount(toAmount || '');
    setQuote(null);
    setQuoteError(null);
  };

  const selectFromToken = (token) => {
    if (token === toToken) setToToken(fromToken);
    setFromToken(token);
    setQuote(null);
    setQuoteError(null);
  };

  const selectToToken = (token) => {
    if (token === fromToken) setFromToken(toToken);
    setToToken(token);
    setQuote(null);
    setQuoteError(null);
  };

  const handleApprove = async () => {
    const spender = allowanceInfo?.spender || build?.spender;
    if (!activeAccount || !spender || !fromAmount) return;

    setTransactionStatus(null);
    setIsApproving(true);
    setCurrentTransactionType('approval');

    try {
      const approval = buildApproval({
        tokenSymbol: fromToken,
        spender,
        amount: quote?.amountInFormatted || fromAmount,
      });
      if (!approval || !approval.ok) {
        throw new Error(errorLabel(approval && approval.error));
      }

      const transaction = prepareTransaction({
        to: approval.to,
        data: approval.data,
        value: BigInt(approval.value || '0'),
        chain: avalanche,
        client,
      });

      sendTransaction(transaction);
    } catch (error) {
      setIsApproving(false);
      setCurrentTransactionType(null);
      setTransactionStatus({
        type: 'error',
        message: `${t('swap.approval_failed')}: ${error?.message || t('swap.try_again')}`,
        hash: null,
      });
    }
  };

  const handleSwap = async () => {
    if (!activeAccount || !quote) return;

    setTransactionStatus(null);
    setIsSwapping(true);
    setCurrentTransactionType('swap');

    try {
      // Nunca se firma un calldata rancio: si el build tiene más de BUILD_MAX_AGE_MS, o no
      // existe (caso AVAX nativo, que no necesita allowance), se re-arma acá.
      let current = build;
      if (!current || Date.now() - current.builtAt > BUILD_MAX_AGE_MS) {
        const result = await buildSwap({
          quote,
          sender: activeAccount.address,
          slippageBps,
          deadlineSec: deadlineMin * 60,
        });
        if (!result || !result.ok) {
          const error = (result && result.error) || { code: 'UNKNOWN' };
          setBuildError(error);
          throw new Error(errorLabel(error));
        }
        current = { ...result, builtAt: Date.now() };
        setBuild(current);
        setBuildError(null);
      }

      const transaction = prepareTransaction({
        to: current.to,
        data: current.data,
        value: BigInt(current.value || '0'),
        chain: avalanche,
        client,
      });

      sendTransaction(transaction);
    } catch (error) {
      setIsSwapping(false);
      setCurrentTransactionType(null);
      setTransactionStatus({
        type: 'error',
        message: `${t('swap.swap_failed')}: ${error?.message || t('swap.try_again')}`,
        hash: null,
      });
    }
  };

  // ------------------------------------------------------------- botón

  // Ningún estado sin texto: si está deshabilitado, el texto dice por qué (CONTRATO §10).
  const swapButton = useMemo(() => {
    if (!activeAccount) {
      return { label: t('swap.connect_wallet'), disabled: true };
    }
    if (isSwapping || (isTransactionLoading && currentTransactionType === 'swap') || (isReceiptLoading && currentTransactionType === 'swap')) {
      return { label: t('swap.swapping'), disabled: true };
    }
    if (isApproving || currentTransactionType === 'approval') {
      return { label: t('swap.approving'), disabled: true };
    }
    if (fromToken === toToken) {
      return { label: t('swap.select_different_token', 'Select a different token'), disabled: true };
    }
    if (!fromAmount || !(parseFloat(fromAmount) > 0)) {
      return { label: t('swap.enter_amount'), disabled: true };
    }
    if (insufficientBalance) {
      return { label: t('swap.insufficient_balance'), disabled: true };
    }
    if (isQuoting) {
      return { label: t('swap.quoting', 'Finding best route…'), disabled: true };
    }
    if (quoteError) {
      return { label: errorLabel(quoteError), disabled: true };
    }
    if (buildError) {
      return { label: errorLabel(buildError), disabled: true };
    }
    if (!quote) {
      return { label: t('swap.quoting', 'Finding best route…'), disabled: true };
    }
    if (!isNativeFrom && allowanceError) {
      return { label: errorLabel(allowanceError), disabled: true };
    }
    if (needsApproval) {
      return { label: t('swap.approve_required'), disabled: true };
    }
    if (!isNativeFrom && !allowanceInfo) {
      // Todavía no sabemos si la allowance alcanza: no se habilita a ciegas.
      return { label: t('swap.building', 'Preparing transaction…'), disabled: true };
    }
    return { label: t('swap.swap_tokens'), disabled: false };
  }, [
    activeAccount,
    isSwapping,
    isApproving,
    isTransactionLoading,
    isReceiptLoading,
    currentTransactionType,
    fromToken,
    toToken,
    fromAmount,
    insufficientBalance,
    isQuoting,
    quoteError,
    buildError,
    needsApproval,
    allowanceError,
    allowanceInfo,
    isNativeFrom,
    quote,
    errorLabel,
    t,
  ]);

  const optionBadges = useMemo(() => {
    const badges = {};
    if (SWAP_TOKENS.includes('USDC.e')) badges['USDC.e'] = t('swap.bridged', 'bridged');
    return badges;
  }, [t]);

  const fromAmountUsd = useMemo(() => {
    if (quote && typeof quote.amountInUsd === 'number') return quote.amountInUsd;
    return null;
  }, [quote]);

  const toAmountUsd = useMemo(() => {
    if (quote && typeof quote.amountOutUsd === 'number') return quote.amountOutUsd;
    return null;
  }, [quote]);

  const allowanceDisplay = useMemo(() => {
    if (!allowanceInfo || allowanceInfo.allowance === null || allowanceInfo.allowance === undefined) return null;
    return formatUnits(String(allowanceInfo.allowance), TOKENS[fromToken].decimals);
  }, [allowanceInfo, fromToken]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      data-testid="swap-widget"
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
                {t('swap.subtitle')}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={handleRefresh}
                disabled={isBalancesRefreshing || isQuoting || !activeAccount?.address}
                aria-label={t('swap.refresh_quote')}
                className={cn(
                  "transition-all",
                  (isBalancesRefreshing || isQuoting) && "border-ultraviolet/50"
                )}
              >
                <RefreshCw className={cn(
                  "w-4 h-4",
                  (isBalancesRefreshing || isQuoting) && "animate-spin text-ultraviolet"
                )} />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setShowSettings(!showSettings)}
                aria-label={t('swap.settings')}
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
                          {t('swap.slippage_tolerance', 'Slippage tolerance')}
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
                    <div className="flex items-center justify-between gap-3">
                      <label className="text-sm font-medium" htmlFor="swap-deadline">
                        {t('swap.deadline', 'Transaction deadline')}
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          id="swap-deadline"
                          type="number"
                          min={1}
                          max={MAX_DEADLINE_MIN}
                          value={deadlineMin}
                          onChange={(e) => {
                            const next = parseInt(e.target.value, 10);
                            setDeadlineMin(Number.isFinite(next) && next > 0 ? Math.min(next, MAX_DEADLINE_MIN) : DEFAULT_DEADLINE_MIN);
                          }}
                          className="w-20 rounded-md border border-border/50 bg-transparent px-2 py-1 text-sm text-foreground outline-none focus:border-ultraviolet/50"
                        />
                        <span className="text-xs text-muted-foreground">
                          {t('swap.deadline_minutes', 'minutes')}
                        </span>
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
            balance={fromBalance.value}
            balanceStatus={fromBalance.status}
            balanceUsd={fromBalance.usd}
            balanceTitle={balanceTitleFor(fromBalance)}
            amountUsd={fromAmountUsd}
            tokenBalances={balances}
            optionBadges={optionBadges}
            maxTitle={isNativeFrom
              ? t('swap.max_keeps_gas', `MAX keeps ${AVAX_GAS_RESERVE} AVAX for gas`, { amount: AVAX_GAS_RESERVE })
              : undefined}
            onAmountChange={handleFromAmountChange}
            onMaxClick={() => handleFromAmountChange(amountFromBalance(fromToken, 1))}
            onPercentageClick={(percent) => handleFromAmountChange(amountFromBalance(fromToken, percent))}
            onTokenSelect={selectFromToken}
            options={SWAP_TOKENS}
            showQuickButtons={true}
          />

          {/* Swap Direction Button */}
          <div className="flex justify-center -my-3 z-10 relative">
            <Button
              size="icon"
              variant="secondary"
              className="rounded-full w-10 h-10 shadow-md border border-border/50 hover:scale-110 transition-transform bg-background"
              onClick={handleSwapTokens}
              disabled={txInFlight}
              aria-label={t('swap.switch_direction')}
            >
              <ArrowDownUp className="w-5 h-5 text-ultraviolet" />
            </Button>
          </div>

          {/* To Token */}
          <TokenSelector
            label={t('swap.to')}
            token={toToken}
            amount={toAmount}
            balance={toBalance.value}
            balanceStatus={toBalance.status}
            balanceUsd={toBalance.usd}
            balanceTitle={balanceTitleFor(toBalance)}
            amountUsd={toAmountUsd}
            tokenBalances={balances}
            optionBadges={optionBadges}
            readOnly={true}
            isLoading={isQuoting}
            onTokenSelect={selectToToken}
            options={SWAP_TOKENS}
          />

          {/* Swap Info */}
          {quote && fromAmount && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="bg-card/50 border-border/50">
                <CardContent className="pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Info className="w-3 h-3" />
                      {t('swap.rate', 'Rate')}
                    </span>
                    <span className="font-medium">
                      1 {fromToken} ≈ {(parseFloat(toAmount) / parseFloat(fromAmount)).toFixed(6)} {toToken}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{t('swap.slippage_tolerance', 'Slippage tolerance')}</span>
                    <span className="font-medium text-ultraviolet">{slippage[0]}%</span>
                  </div>
                  {typeof quote.priceImpactPct === 'number' && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{t('swap.price_impact', 'Price impact')}</span>
                      <span className="font-medium">{quote.priceImpactPct.toFixed(2)}%</span>
                    </div>
                  )}
                  {typeof quote.gasUsd === 'number' && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{t('swap.network_fee', 'Network fee')}</span>
                      <span className="font-medium">${quote.gasUsd.toFixed(4)}</span>
                    </div>
                  )}
                  {quote.routeLabel && (
                    <div className="flex justify-between text-sm gap-4">
                      <span className="text-muted-foreground">{t('swap.route', 'Route')}</span>
                      <span className="font-medium text-right break-all" data-testid="swap-route">
                        {quote.routeLabel}
                      </span>
                    </div>
                  )}
                  {quote.provider && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{t('swap.via_provider', 'via {{provider}}', { provider: quote.provider })}</span>
                    </div>
                  )}
                  {!isNativeFrom && allowanceDisplay !== null && (
                    <div className="flex justify-between text-sm pt-2 border-t border-border/50">
                      <span className="text-muted-foreground">{fromToken} {t('swap.allowance', 'Allowance')}</span>
                      <span className="font-medium">
                        {parseFloat(allowanceDisplay).toFixed(6)} {fromToken}
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
                  {t('swap.connect_wallet')}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {needsApproval && !insufficientBalance && (
                <Button
                  onClick={handleApprove}
                  disabled={txInFlight}
                  data-testid="approve-button"
                  className="w-full h-12 text-base font-semibold bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600"
                >
                  {(isApproving || currentTransactionType === 'approval')
                    ? t('swap.approving')
                    : t('swap.approve_token', `Approve ${fromToken}`, { token: fromToken })}
                </Button>
              )}

              <Button
                onClick={handleSwap}
                disabled={swapButton.disabled}
                data-testid="swap-button"
                className="w-full h-12 text-base font-semibold bg-gradient-to-r from-ultraviolet to-ultraviolet-light hover:shadow-lg hover:shadow-ultraviolet/25"
              >
                {swapButton.label}
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
