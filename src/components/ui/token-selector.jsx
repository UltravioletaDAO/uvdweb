import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
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

export const TokenSelector = ({
  token,
  amount,
  balance,
  onAmountChange,
  onMaxClick,
  onPercentageClick,
  label,
  showQuickButtons = true,
  readOnly = false,
  isLoading = false,
  className
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "relative overflow-hidden rounded-xl border bg-card transition-all duration-200",
        "hover:border-ultraviolet/30 focus-within:border-ultraviolet/50",
        "border-border/50",
        className
      )}
    >
      {/* Ambient glow effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-ultraviolet/5 via-transparent to-transparent pointer-events-none" />

      <div className="relative p-4 space-y-3">
        {/* Label and Balance Row */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground font-medium">{label}</span>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Balance:</span>
            <span className="text-foreground font-semibold">
              {parseFloat(balance || 0).toFixed(6)}
            </span>
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
                <span className="text-sm text-muted-foreground">Updating...</span>
              </div>
            ) : (
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
            )}
          </div>

          {/* Token Display */}
          <div className="flex items-center gap-3 px-4 py-2 bg-background/50 rounded-lg border border-border/50">
            <TokenImage
              token={token}
              className="w-8 h-8 rounded-full border-2 border-background"
            />
            <span className="text-xl font-bold text-foreground">{token}</span>
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
