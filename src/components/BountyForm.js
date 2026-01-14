import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDownIcon } from '@heroicons/react/24/outline';

// Tokens disponibles para recompensas (el label de CUSTOM se traduce dinámicamente)
const REWARD_TOKENS = [
  { symbol: 'USDC', label: 'USDC', icon: '💵' },
  { symbol: 'UVD', label: '$UVD', icon: '🟣' },
  { symbol: 'AVAX', label: 'AVAX', icon: '🔺' },
  { symbol: 'POL', label: 'POL', icon: '🟪' },
  { symbol: 'SOL', label: 'SOL', icon: '◎' },
  { symbol: 'ETH', label: 'ETH', icon: 'Ξ' },
  { symbol: 'CUSTOM', labelKey: 'bountyForm.custom_token_label', icon: '✏️' },
];

const BountyForm = ({ onSubmit, loading, error }) => {
  const { t } = useTranslation();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [rewardAmount, setRewardAmount] = useState('');
  const [selectedToken, setSelectedToken] = useState(REWARD_TOKENS[0]); // USDC por defecto
  const [customToken, setCustomToken] = useState('');
  const [showTokenDropdown, setShowTokenDropdown] = useState(false);
  const [endDate, setEndDate] = useState('');
  const dropdownRef = useRef(null);

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowTokenDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setRewardAmount('');
    setSelectedToken(REWARD_TOKENS[0]);
    setCustomToken('');
    setEndDate('');
  };

  // Construir el reward string completo (ej: "100 USDC" o "50 UVD")
  const getRewardString = () => {
    const amount = rewardAmount.trim();
    if (!amount) return '';
    const tokenSymbol = selectedToken.symbol === 'CUSTOM' ? customToken.trim() : selectedToken.symbol;
    return tokenSymbol ? `${amount} ${tokenSymbol}` : amount;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await onSubmit({
        title,
        description,
        reward: getRewardString(),
        endDate: endDate || null,
      });
      // Reset form on successful submission
      resetForm();
    } catch {
      // Error is handled by parent component
    }
  };

  const handleTokenSelect = (token) => {
    setSelectedToken(token);
    setShowTokenDropdown(false);
    if (token.symbol !== 'CUSTOM') {
      setCustomToken('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="title" className="block text-sm text-text-secondary mb-1">{t('bountyForm.title_label')}</label>
        <input
          type="text"
          id="title"
          className="w-full px-4 py-2 rounded-lg border border-ultraviolet/20 bg-background focus:border-ultraviolet focus:ring-2 focus:ring-ultraviolet outline-none text-text-primary"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>
      <div>
        <label htmlFor="description" className="block text-sm text-text-secondary mb-1">{t('bountyForm.description_label')}</label>
        <textarea
          id="description"
          className="w-full px-4 py-2 rounded-lg border border-ultraviolet/20 bg-background focus:border-ultraviolet focus:ring-2 focus:ring-ultraviolet outline-none text-text-primary min-h-[100px]"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
      </div>
      <div>
        <label htmlFor="reward" className="block text-sm text-text-secondary mb-1">{t('bountyForm.reward_label')}</label>
        <div className="flex gap-2">
          {/* Input de cantidad */}
          <input
            type="number"
            id="reward"
            min="0"
            step="any"
            placeholder="0"
            className="flex-1 px-4 py-2 rounded-lg border border-ultraviolet/20 bg-background focus:border-ultraviolet focus:ring-2 focus:ring-ultraviolet outline-none text-text-primary"
            value={rewardAmount}
            onChange={(e) => setRewardAmount(e.target.value)}
            required
          />

          {/* Selector de token */}
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setShowTokenDropdown(!showTokenDropdown)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-ultraviolet/20 bg-background hover:border-ultraviolet/40 focus:border-ultraviolet focus:ring-2 focus:ring-ultraviolet outline-none text-text-primary min-w-[120px] justify-between transition-colors"
            >
              <span className="flex items-center gap-2">
                <span>{selectedToken.icon}</span>
                <span className="font-medium">{selectedToken.labelKey ? t(selectedToken.labelKey) : selectedToken.label}</span>
              </span>
              <ChevronDownIcon className={`w-4 h-4 transition-transform ${showTokenDropdown ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown menu */}
            {showTokenDropdown && (
              <div className="absolute top-full right-0 mt-1 w-48 bg-background-lighter border border-ultraviolet/20 rounded-lg shadow-xl z-50 overflow-hidden">
                {REWARD_TOKENS.map((token) => (
                  <button
                    key={token.symbol}
                    type="button"
                    onClick={() => handleTokenSelect(token)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-ultraviolet/10 transition-colors ${
                      selectedToken.symbol === token.symbol ? 'bg-ultraviolet/20 text-ultraviolet-light' : 'text-text-primary'
                    }`}
                  >
                    <span className="text-lg">{token.icon}</span>
                    <span className="font-medium">{token.labelKey ? t(token.labelKey) : token.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Input para token personalizado */}
        {selectedToken.symbol === 'CUSTOM' && (
          <input
            type="text"
            placeholder={t('bountyForm.custom_token_placeholder') || 'Escribe el símbolo del token'}
            className="w-full mt-2 px-4 py-2 rounded-lg border border-ultraviolet/20 bg-background focus:border-ultraviolet focus:ring-2 focus:ring-ultraviolet outline-none text-text-primary text-sm"
            value={customToken}
            onChange={(e) => setCustomToken(e.target.value.toUpperCase())}
            maxLength={10}
            required
          />
        )}
      </div>
      <div>
        <label htmlFor="endDate" className="block text-sm text-text-secondary mb-1">{t('bountyForm.endDate_label')}</label>
        <input
          type="date"
          id="endDate"
          className="w-full px-4 py-2 rounded-lg border border-ultraviolet/20 bg-background focus:border-ultraviolet focus:ring-2 focus:ring-ultraviolet outline-none text-text-primary"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />
      </div>
      {error && <div className="text-error text-sm bg-error/10 p-2 rounded">{error}</div>}
      <button
        type="submit"
        className="w-full py-2 bg-ultraviolet text-white rounded-lg font-semibold hover:bg-ultraviolet-dark transition-colors disabled:opacity-60"
        disabled={loading}
      >
        {loading ? t('bountyForm.creating_button') : t('bountyForm.create_button')}
      </button>
    </form>
  );
};

export default BountyForm; 