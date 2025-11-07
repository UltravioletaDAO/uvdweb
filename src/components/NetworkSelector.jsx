import React from 'react';
import { useTranslation } from 'react-i18next';

// Network configuration with icons and colors
const NETWORKS = [
  {
    id: 'optimism',
    name: 'Optimism',
    icon: '🔴',
    color: 'from-red-500 to-red-600',
    description: 'Low fees, fast',
    gasEstimate: '~$0.01'
  },
  {
    id: 'base',
    name: 'Base',
    icon: '🔵',
    color: 'from-blue-500 to-blue-600',
    description: 'Coinbase L2',
    gasEstimate: '~$0.01'
  },
  {
    id: 'polygon',
    name: 'Polygon',
    icon: '🟣',
    color: 'from-purple-500 to-purple-600',
    description: 'Popular, reliable',
    gasEstimate: '~$0.01'
  },
  {
    id: 'avalanche',
    name: 'Avalanche',
    icon: '🔺',
    color: 'from-red-400 to-red-500',
    description: 'Fast finality',
    gasEstimate: '~$0.02'
  },
  {
    id: 'celo',
    name: 'Celo',
    icon: '🟡',
    color: 'from-yellow-400 to-yellow-500',
    description: 'Mobile-first',
    gasEstimate: '~$0.001'
  }
];

/**
 * NetworkSelector Component
 * Allows users to choose which blockchain network to use for payment
 *
 * @param {string} selectedNetwork - Currently selected network ID
 * @param {function} onSelectNetwork - Callback when network is selected
 * @param {boolean} disabled - Whether selector is disabled
 */
function NetworkSelector({ selectedNetwork, onSelectNetwork, disabled = false }) {
  const { t } = useTranslation();

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-text-secondary">
        {t('networkSelector.title', 'Select Payment Network')}
      </label>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {NETWORKS.map((network) => {
          const isSelected = selectedNetwork === network.id;

          return (
            <button
              key={network.id}
              onClick={() => !disabled && onSelectNetwork(network.id)}
              disabled={disabled}
              className={`
                relative p-4 rounded-lg border-2 transition-all duration-200
                ${isSelected
                  ? 'border-violet-500 bg-violet-500/10 shadow-lg shadow-violet-500/20'
                  : 'border-zinc-700 bg-zinc-800 hover:border-zinc-600'
                }
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                group
              `}
              aria-label={`Select ${network.name}`}
              aria-pressed={isSelected}
            >
              {/* Selected indicator */}
              {isSelected && (
                <div className="absolute top-2 right-2">
                  <svg className="w-5 h-5 text-violet-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
              )}

              {/* Network icon */}
              <div className="text-3xl mb-2">{network.icon}</div>

              {/* Network name */}
              <div className="text-sm font-semibold text-text-primary mb-1">
                {network.name}
              </div>

              {/* Network description */}
              <div className="text-xs text-text-secondary mb-2">
                {network.description}
              </div>

              {/* Gas estimate */}
              <div className="text-xs text-violet-400 font-medium">
                {network.gasEstimate} gas
              </div>

              {/* Hover effect */}
              {!disabled && !isSelected && (
                <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-10 rounded-lg transition-opacity pointer-events-none"
                     style={{ backgroundImage: `linear-gradient(to bottom right, var(--tw-gradient-stops))` }} />
              )}
            </button>
          );
        })}
      </div>

      {/* Selected network info */}
      {selectedNetwork && (
        <div className="mt-3 p-3 bg-zinc-800/50 border border-zinc-700 rounded-lg">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-violet-400">✓</span>
            <span className="text-text-secondary">
              {t('networkSelector.selected', 'You will pay on')} <span className="font-semibold text-text-primary">
                {NETWORKS.find(n => n.id === selectedNetwork)?.name}
              </span>
            </span>
          </div>
        </div>
      )}

      {/* Help text */}
      <p className="text-xs text-text-secondary mt-2">
        {t('networkSelector.help', 'Choose the network where you have USDC. Gas fees are minimal on all networks.')}
      </p>
    </div>
  );
}

export default NetworkSelector;
