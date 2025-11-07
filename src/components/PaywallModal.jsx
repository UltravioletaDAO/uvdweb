import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import NetworkSelector from './NetworkSelector';
import useX402Payment from '../hooks/useX402Payment';

/**
 * PaywallModal - Modal de pago x402 simplificado
 * Sin thirdweb, usa ethers.js + MetaMask directamente
 */
function PaywallModal({ isOpen, onClose, content, onPaymentSuccess }) {
  const { t } = useTranslation();
  const {
    account,
    isWalletConnected,
    connectWallet,
    makePayment,
    paymentState
  } = useX402Payment();

  const [selectedNetwork, setSelectedNetwork] = useState('base');

  if (!isOpen) return null;

  const handleConnect = async () => {
    try {
      await connectWallet();
    } catch (error) {
      console.error('Failed to connect:', error);
    }
  };

  const handlePayment = async () => {
    try {
      const paymentProof = await makePayment(
        content.receivingWallet || '0x52110a2Cc8B6bBf846101265edAAe34E753f3389',
        content.price || '0.05',
        selectedNetwork
      );

      if (onPaymentSuccess) {
        onPaymentSuccess(paymentProof);
      }
    } catch (error) {
      console.error('Payment failed:', error);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-zinc-900 border border-zinc-700 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-zinc-700">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold text-text-primary mb-2">
                {t('paywall.title', 'Contenido Premium')}
              </h2>
              <p className="text-text-secondary">
                {content.title || 'Stream Summary'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-text-secondary hover:text-text-primary transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Price */}
        <div className="p-6">
          <div className="bg-gradient-to-r from-violet-900/20 to-purple-900/20 border border-violet-700/30 rounded-lg p-6 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-secondary mb-1">Precio</p>
                <p className="text-4xl font-bold text-violet-400">
                  {content.price || '0.05'} <span className="text-2xl">USDC</span>
                </p>
              </div>
              <div className="text-5xl">💎</div>
            </div>
          </div>

          {/* Benefits */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-text-primary mb-3">
              Qué obtienes:
            </h3>
            <ul className="space-y-2">
              <li className="flex items-start gap-2 text-text-secondary">
                <span className="text-violet-400">✓</span>
                <span>Resumen completo generado por IA</span>
              </li>
              <li className="flex items-start gap-2 text-text-secondary">
                <span className="text-violet-400">✓</span>
                <span>Momentos clave y highlights técnicos</span>
              </li>
              <li className="flex items-start gap-2 text-text-secondary">
                <span className="text-violet-400">✓</span>
                <span>Acceso permanente - paga una vez, ve para siempre</span>
              </li>
              <li className="flex items-start gap-2 text-text-secondary">
                <span className="text-violet-400">✓</span>
                <span>Apoyas el desarrollo de UltraVioleta DAO</span>
              </li>
            </ul>
          </div>

          {/* Network Selection */}
          {isWalletConnected && (
            <NetworkSelector
              selectedNetwork={selectedNetwork}
              onSelectNetwork={setSelectedNetwork}
              disabled={paymentState.isPaying}
            />
          )}

          {/* Wallet Status */}
          {isWalletConnected && account && (
            <div className="mt-4 p-3 bg-zinc-800 border border-zinc-700 rounded-lg text-sm">
              <span className="text-text-secondary">Conectado: </span>
              <span className="text-violet-400 font-mono">
                {account.substring(0, 6)}...{account.substring(account.length - 4)}
              </span>
            </div>
          )}

          {/* Errors */}
          {paymentState.error && (
            <div className="mt-4 bg-red-900/20 border border-red-600 rounded-lg p-4">
              <p className="font-semibold text-red-400">Error de Pago</p>
              <p className="text-sm text-red-300 mt-1">{paymentState.error}</p>
            </div>
          )}

          {/* Success */}
          {paymentState.txHash && (
            <div className="mt-4 bg-green-900/20 border border-green-600 rounded-lg p-4">
              <p className="font-semibold text-green-400">¡Pago Exitoso!</p>
              <p className="text-sm text-green-300 mt-1 font-mono break-all">
                Tx: {paymentState.txHash}
              </p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="p-6 border-t border-zinc-700 bg-zinc-800/50">
          {!isWalletConnected ? (
            <button
              onClick={handleConnect}
              className="w-full px-6 py-3 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white font-semibold rounded-lg transition-all shadow-lg"
            >
              Conectar Wallet
            </button>
          ) : (
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 px-6 py-3 bg-zinc-700 hover:bg-zinc-600 text-text-primary font-semibold rounded-lg transition-colors"
                disabled={paymentState.isPaying}
              >
                Cancelar
              </button>
              <button
                onClick={handlePayment}
                disabled={paymentState.isPaying || !selectedNetwork}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white font-semibold rounded-lg transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {paymentState.isPaying ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Procesando...
                  </span>
                ) : (
                  `Pagar ${content.price || '0.05'} USDC`
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default PaywallModal;
