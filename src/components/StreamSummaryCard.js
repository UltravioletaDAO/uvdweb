import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { useStreamSummary } from '../hooks/useStreamSummaries';
import { PaymentRequiredError } from '../services/streamSummaries';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const StreamSummaryCard = ({ summary, onPaymentRequired, paymentProof }) => {
  const { t } = useTranslation();
  const [isCardOpen, setIsCardOpen] = useState(false);

  // Only fetch full summary when card is opened
  // Supports x402 payment system - will throw PaymentRequiredError if payment needed
  const { data: fullSummary, isLoading: isLoadingSummary, error } = useStreamSummary(
    summary.streamer,
    summary.video_id,
    summary.fecha_stream,
    isCardOpen,
    paymentProof
  );

  // Handle payment required error
  useEffect(() => {
    console.log('🟡 StreamSummaryCard: Error changed:', {
      hasError: !!error,
      errorName: error?.name,
      errorMessage: error?.message,
      errorStatus: error?.status,
      paymentDetails: error?.paymentDetails,
      hasOnPaymentRequired: !!onPaymentRequired,
      fullError: error
    });

    // Check for payment required error by multiple conditions
    const isPaymentRequired = error && (
      error.name === 'PaymentRequiredError' ||
      error.status === 402 ||
      error.paymentDetails
    );

    if (isPaymentRequired) {
      console.log('🟢 StreamSummaryCard: PaymentRequiredError detected! Calling onPaymentRequired');
      if (onPaymentRequired) {
        onPaymentRequired(error.paymentDetails);
      } else {
        console.error('🔴 onPaymentRequired callback is not defined!');
      }
    }
  }, [error, onPaymentRequired]);

  const toggleCard = () => {
    setIsCardOpen(!isCardOpen);
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return '';
    // dateString format: "09/10/2025"
    return dateString;
  };

  // Get streamer badge color
  const getStreamerColor = (streamer) => {
    const colors = {
      '0xultravioleta': 'bg-violet-600',
      'karenngo': 'bg-pink-600',
      'elbitterx': 'bg-blue-600',
      'herniep': 'bg-green-600',
    };
    return colors[streamer.toLowerCase()] || 'bg-gray-600';
  };

  // Render summary content based on what's loaded
  const renderSummaryContent = () => {
    if (isLoadingSummary) {
      return (
        <div className="text-text-secondary text-sm p-6 bg-zinc-800/30 rounded-lg">
          <div className="flex items-center justify-center space-x-2">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-violet-400"></div>
            <span>{t('streamSummaries.loadingSummary')}</span>
          </div>
        </div>
      );
    }

    // Handle payment required error
    const isPaymentRequired = error && (
      error.name === 'PaymentRequiredError' ||
      error.status === 402 ||
      error.paymentDetails
    );

    if (isPaymentRequired) {
      return (
        <div className="text-text-secondary text-sm p-6 bg-gradient-to-r from-violet-900/20 to-purple-900/20 rounded-lg border border-violet-700/30">
          <div className="flex items-center justify-center space-x-2">
            <span className="text-2xl">💎</span>
            <span className="text-violet-400 font-semibold">
              {t('streamSummaries.paymentRequired', 'Este contenido requiere pago. Abriendo modal de pago...')}
            </span>
          </div>
        </div>
      );
    }

    // Handle other errors
    if (error && !isPaymentRequired) {
      return (
        <div className="text-text-secondary text-sm p-6 bg-red-900/20 rounded-lg border border-red-700/30">
          <div className="flex items-center justify-center space-x-2">
            <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-red-400">
              {t('streamSummaries.errorLoadingSummary', 'Error cargando el resumen. Intenta de nuevo más tarde.')}
            </span>
          </div>
        </div>
      );
    }

    if (!fullSummary?.resumenes?.web) return null;

    const webSummary = fullSummary.resumenes.web;

    return (
      <div className="bg-zinc-800/30 rounded-lg p-4">
        {/* Summary metadata */}
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-zinc-700/50">
          <h4 className="text-sm font-semibold text-violet-300">
            {t('streamSummaries.webSummary')}
          </h4>
          <span className="text-xs text-text-secondary/60">
            {webSummary.longitud} {t('streamSummaries.characters')}
          </span>
        </div>

        {/* Markdown content */}
        <div className="prose prose-invert prose-sm max-w-none text-text-secondary">
          {/* eslint-disable-next-line jsx-a11y/heading-has-content, jsx-a11y/anchor-has-content */}
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              // Estilos personalizados para elementos markdown
              // eslint-disable-next-line jsx-a11y/heading-has-content
              h1: ({node, ...props}) => <h1 className="text-2xl font-bold text-violet-300 mt-4 mb-3" {...props} />,
              // eslint-disable-next-line jsx-a11y/heading-has-content
              h2: ({node, ...props}) => <h2 className="text-xl font-bold text-violet-300 mt-4 mb-2" {...props} />,
              // eslint-disable-next-line jsx-a11y/heading-has-content
              h3: ({node, ...props}) => <h3 className="text-lg font-semibold text-violet-300 mt-3 mb-2" {...props} />,
              // eslint-disable-next-line jsx-a11y/heading-has-content
              h4: ({node, ...props}) => <h4 className="text-base font-semibold text-violet-400 mt-2 mb-1" {...props} />,
              p: ({node, ...props}) => <p className="text-sm text-text-secondary my-2 leading-relaxed" {...props} />,
              ul: ({node, ...props}) => <ul className="list-disc list-inside my-2 space-y-1" {...props} />,
              ol: ({node, ...props}) => <ol className="list-decimal list-inside my-2 space-y-1" {...props} />,
              li: ({node, ...props}) => <li className="text-sm text-text-secondary ml-2" {...props} />,
              code: ({node, inline, ...props}) =>
                inline
                  ? <code className="bg-zinc-800 text-violet-300 px-1.5 py-0.5 rounded text-xs font-mono" {...props} />
                  : <code className="block bg-zinc-800 text-violet-300 p-3 rounded-lg text-xs font-mono overflow-x-auto my-2" {...props} />,
              pre: ({node, ...props}) => <pre className="bg-zinc-800 rounded-lg overflow-x-auto my-2" {...props} />,
              blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-violet-600 pl-4 italic text-text-secondary/80 my-2" {...props} />,
              // eslint-disable-next-line jsx-a11y/anchor-has-content
              a: ({node, ...props}) => <a className="text-violet-400 hover:text-violet-300 underline" {...props} />,
              strong: ({node, ...props}) => <strong className="font-bold text-violet-300" {...props} />,
              em: ({node, ...props}) => <em className="italic text-violet-300" {...props} />,
              hr: ({node, ...props}) => <hr className="border-zinc-700 my-4" {...props} />,
            }}
          >
            {webSummary.contenido}
          </ReactMarkdown>
        </div>

        {/* Description footer */}
        {webSummary.descripcion && (
          <div className="text-xs text-text-secondary/60 mt-3 pt-3 border-t border-zinc-700/50">
            {webSummary.descripcion}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`bg-zinc-900 rounded-lg overflow-hidden border transition-all duration-300 ${
      isCardOpen
        ? 'border-violet-600/50 shadow-[0_0_20px_rgba(139,92,246,0.2)]'
        : 'border-zinc-800 hover:border-violet-700/30'
    }`}>
      {/* Horizontal Bar - Always Visible */}
      <button
        onClick={toggleCard}
        className="w-full p-3 flex items-center gap-3 hover:bg-zinc-800/50 transition-colors"
      >
        {/* Left: Streamer Badge */}
        <span className={`${getStreamerColor(summary.streamer)} text-white text-xs px-2.5 py-1 rounded-full font-semibold flex-shrink-0`}>
          {summary.streamer}
        </span>

        {/* Center: Title and Info */}
        <div className="flex-1 text-left min-w-0">
          <h3 className="text-sm font-bold text-text-primary mb-0.5 truncate group-hover:text-violet-400 transition-colors">
            {summary.titulo_stream}
          </h3>
          <div className="flex items-center gap-2 text-xs text-text-secondary">
            <a
              href={summary.twitch_url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-1 text-violet-400 hover:text-violet-300 transition-colors"
            >
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714z"/>
              </svg>
              <span>{t('streamSummaries.watchOnTwitch')}</span>
              <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
            <span className="text-text-secondary/40">•</span>
            <span>{formatDate(summary.fecha_formateada)}</span>
            {fullSummary?.resumenes?.web?.longitud && (
              <>
                <span className="text-text-secondary/40">•</span>
                <span className="text-text-secondary/60">
                  {fullSummary.resumenes.web.longitud} {t('streamSummaries.characters')}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Right: Expand Icon */}
        <motion.div
          animate={{ rotate: isCardOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
          className="flex-shrink-0"
        >
          <svg className="w-5 h-5 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </motion.div>
      </button>

      {/* Collapsible Summary Content */}
      <AnimatePresence>
        {isCardOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="border-t border-zinc-800"
          >
            <div className="p-4">
              {/* Summary Content */}
              {renderSummaryContent()}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default StreamSummaryCard;
