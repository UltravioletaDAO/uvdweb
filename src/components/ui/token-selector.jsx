import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '../../lib/utils';

// Token image component with fallback
export const TokenImage = ({ token, className }) => {
  const [imageError, setImageError] = useState(false);

  const getTokenImage = (tokenSymbol) => {
    switch(tokenSymbol) {
      case 'AVAX':
        return 'https://images.ctfassets.net/gcj8jwzm6086/5VHupNKwnDYJvqMENeV7iJ/3e4b8ff10b69bfa31e70080a4b142cd0/avalanche-avax-logo.svg';
      case 'UVD':
        return 'https://ultravioletadao.xyz/logo_uvd.svg';
      case 'USDC':
      case 'USDC.e':
        return 'https://cryptologos.cc/logos/usd-coin-usdc-logo.svg';
      default:
        return '';
    }
  };

  const getTokenGradient = (tokenSymbol) => {
    switch(tokenSymbol) {
      case 'AVAX':
        return 'from-red-500 to-orange-500';
      case 'UVD':
        return 'from-ultraviolet to-ultraviolet-light';
      case 'USDC':
      case 'USDC.e':
        return 'from-blue-500 to-blue-400';
      default:
        return 'from-gray-500 to-gray-700';
    }
  };

  if (imageError) {
    return (
      <div className={cn(
        "bg-gradient-to-r flex items-center justify-center",
        getTokenGradient(token),
        className
      )}>
        <span className="text-white text-xs font-bold">
          {token.substring(0, 2)}
        </span>
      </div>
    );
  }

  return (
    <div className={cn("flex items-center justify-center overflow-hidden", className)}>
      <img
        src={getTokenImage(token)}
        alt={token === 'AVAX' ? 'Avalanche AVAX' : 'UVD Token'}
        className="w-full h-full object-cover"
        onError={() => setImageError(true)}
      />
    </div>
  );
};

// Un balance que no se pudo leer se pinta `—`, nunca 0: un cero mentiroso es peor que
// no mostrar nada (DISENO 4.2).
const formatBalance = (value, status) => {
  if (status === 'error') return '—';
  if (value === null || value === undefined || value === '') {
    return status === 'loading' ? '…' : '—';
  }
  const parsed = parseFloat(value);
  if (!Number.isFinite(parsed)) return '—';
  // Un balance chiquito pero real no se redondea a "0.000000": eso se lee como cero.
  if (parsed !== 0 && Math.abs(parsed) < 0.000001) return parsed.toExponential(2);
  return parsed.toFixed(6);
};

// Sin precio no se inventa `$0.00`: simplemente no se muestra la linea.
export const formatUsd = (value) => {
  if (typeof value !== 'number' || !Number.isFinite(value)) return null;
  if (value === 0) return '$0.00';
  if (Math.abs(value) < 0.01) return '<$0.01';
  return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

export const TokenSelector = ({
  token,
  amount,
  balance,
  balanceStatus = 'idle',
  balanceUsd = null,
  balanceTitle,
  amountUsd = null,
  tokenBalances = null,
  optionBadges = null,
  onAmountChange,
  onMaxClick,
  onPercentageClick,
  onTokenSelect,
  options = [],
  label,
  showQuickButtons = true,
  readOnly = false,
  isLoading = false,
  maxTitle,
  className
}) => {
  const { t } = useTranslation();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      if (showDropdown) {
        document.removeEventListener('mousedown', handleClickOutside);
      }
    };
  }, [showDropdown]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      ref={dropdownRef}
      className={cn(
        "relative overflow-visible rounded-xl border bg-card transition-all duration-200",
        "hover:border-ultraviolet/30 focus-within:border-ultraviolet/50",
        "border-border/50",
        className
      )}
    >
      {/* Ambient glow effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-ultraviolet/5 via-transparent to-transparent pointer-events-none rounded-xl" />

      <div className="relative p-4 space-y-3">
        {/* Label and Balance Row */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground font-medium">{label}</span>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">{t('swap.balance')}:</span>
            <span
              className="text-foreground font-semibold"
              title={balanceTitle}
              data-testid={`balance-${token}`}
            >
              {formatBalance(balance, balanceStatus)}
            </span>
            {formatUsd(balanceUsd) && (
              <span
                className="text-muted-foreground"
                title={t('swap.usd_estimate', 'Estimated value in USD')}
                data-testid={`balance-usd-${token}`}
              >
                ≈ {formatUsd(balanceUsd)}
              </span>
            )}
          </div>
        </div>

        {/* Token Input Row */}
        <div className="flex items-center gap-3">
          {/* Amount Input */}
          <div className="flex-1">
            {isLoading ? (
              <div className="flex items-center gap-2 h-12">
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
                <span className="text-sm text-muted-foreground">{t('swap.updating')}…</span>
              </div>
            ) : (
              <>
                <input
                  type="number"
                  placeholder="0.0"
                  value={amount}
                  onChange={(e) => onAmountChange?.(e.target.value)}
                  readOnly={readOnly}
                  className={cn(
                    "w-full text-3xl font-bold bg-transparent border-none outline-none",
                    "text-foreground placeholder:text-muted-foreground/50",
                    readOnly && "cursor-default"
                  )}
                />
                {formatUsd(amountUsd) && (
                  <span
                    className="block text-xs text-muted-foreground mt-1"
                    data-testid={`amount-usd-${token}`}
                  >
                    {'≈'} {formatUsd(amountUsd)}
                  </span>
                )}
              </>
            )}
          </div>

          {/* Token Display / Selector */}
          <div className="relative">
            <button
              onClick={() => options.length > 1 && setShowDropdown(!showDropdown)}
              data-testid={`token-trigger-${token}`}
              className={cn(
                "flex items-center gap-3 px-4 py-2 rounded-lg border transition-colors",
                "bg-[#181326] border-ultraviolet/40 shadow-md shadow-black/40",
                options.length > 1 && "hover:bg-[#221b3a] cursor-pointer"
              )}
            >
              <TokenImage
                token={token}
                className="w-8 h-8 rounded-full border-2 border-background"
              />
              <span className="text-xl font-bold text-foreground">{token}</span>
              {options.length > 1 && (
                <ChevronDown className={cn(
                  "w-4 h-4 text-muted-foreground transition-transform duration-200",
                  showDropdown && "rotate-180"
                )} />
              )}
            </button>

            {/* Dropdown Menu */}
            <AnimatePresence>
              {showDropdown && options.length > 1 && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.96 }}
                  className="absolute right-0 top-full mt-2 w-52 z-50 overflow-hidden rounded-xl border border-ultraviolet/40 bg-[#0b0914] shadow-2xl shadow-black/60"
                >
                  <div className="p-1">
                    {options.map((option) => (
                      <button
                        key={option}
                        onClick={() => {
                          onTokenSelect?.(option);
                          setShowDropdown(false);
                        }}
                        data-testid={`option-${option}`}
                        className={cn(
                          "flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-left transition-colors",
                          token === option
                            ? "bg-ultraviolet/30 text-white"
                            : "hover:bg-[#181326] text-foreground"
                        )}
                      >
                        <TokenImage
                          token={option}
                          className="w-6 h-6 rounded-full"
                        />
                        <span className="flex flex-col min-w-0">
                          <span className="font-medium flex items-center gap-1.5">
                            {option}
                            {optionBadges?.[option] && (
                              <span className="px-1.5 py-0.5 rounded text-[10px] uppercase tracking-wide bg-ultraviolet/20 text-ultraviolet">
                                {optionBadges[option]}
                              </span>
                            )}
                          </span>
                          {tokenBalances?.[option] && (
                            <span
                              className="text-[11px] text-muted-foreground"
                              data-testid={`option-balance-${option}`}
                            >
                              {formatBalance(tokenBalances[option].value, tokenBalances[option].status)}
                              {formatUsd(tokenBalances[option].usd)
                                ? ` · ${'≈'} ${formatUsd(tokenBalances[option].usd)}`
                                : ''}
                            </span>
                          )}
                        </span>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Quick Amount Buttons */}
        {showQuickButtons && !readOnly && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => onPercentageClick?.(0.25)}
              className="px-3 py-1.5 text-xs font-medium rounded-md bg-ultraviolet/10 hover:bg-ultraviolet/20 text-ultraviolet transition-colors"
            >
              25%
            </button>
            <button
              onClick={() => onPercentageClick?.(0.5)}
              className="px-3 py-1.5 text-xs font-medium rounded-md bg-ultraviolet/10 hover:bg-ultraviolet/20 text-ultraviolet transition-colors"
            >
              50%
            </button>
            <button
              onClick={() => onPercentageClick?.(0.75)}
              className="px-3 py-1.5 text-xs font-medium rounded-md bg-ultraviolet/10 hover:bg-ultraviolet/20 text-ultraviolet transition-colors"
            >
              75%
            </button>
            <button
              onClick={onMaxClick}
              title={maxTitle}
              className="px-3 py-1.5 text-xs font-medium rounded-md bg-gradient-to-r from-ultraviolet to-ultraviolet-light hover:shadow-lg hover:shadow-ultraviolet/25 text-white transition-all"
            >
              MAX
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
};
