import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { useStreamSummary } from '../hooks/useStreamSummaries';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const StreamSummaryCard = ({ summary }) => {
  const { t } = useTranslation();
  const [isCardOpen, setIsCardOpen] = useState(false);

  // Only fetch full summary when card is opened
  // Fetches from S3: stream-summaries/{streamer}/{fecha_stream}/{video_id}.{language}.json
  const { data: fullSummary, isLoading: isLoadingSummary } = useStreamSummary(
    summary.streamer,
    summary.video_id,
    summary.fecha_stream,
    isCardOpen
  );

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
    if (!isCardOpen) return null;

    if (isLoadingSummary) {
      return (
        <div className="text-text-secondary text-sm mt-4 p-4 bg-zinc-800/50 rounded-lg">
          <div className="flex items-center justify-center space-x-2">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-violet-400"></div>
            <span>{t('streamSummaries.loadingSummary', 'Cargando resumen...')}</span>
          </div>
        </div>
      );
    }

    if (!fullSummary?.resumenes?.web) return null;

    const webSummary = fullSummary.resumenes.web;

    return (
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        exit={{ opacity: 0, height: 0 }}
        transition={{ duration: 0.3 }}
        className="mt-4"
      >
        <div className="border border-zinc-700 rounded-lg overflow-hidden">
          <div className="p-4 bg-zinc-900/50">
            {/* Summary metadata */}
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-zinc-800">
              <h4 className="text-sm font-semibold text-violet-300">
                {t('streamSummaries.webSummary', 'Resumen del Stream')}
              </h4>
              <span className="text-xs text-text-secondary/60">
                {webSummary.longitud} caracteres
              </span>
            </div>

            {/* Markdown content */}
            <div className="prose prose-invert prose-sm max-w-none text-text-secondary">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  // Estilos personalizados para elementos markdown
                  h1: ({node, ...props}) => <h1 className="text-2xl font-bold text-violet-300 mt-4 mb-3" {...props} />,
                  h2: ({node, ...props}) => <h2 className="text-xl font-bold text-violet-300 mt-4 mb-2" {...props} />,
                  h3: ({node, ...props}) => <h3 className="text-lg font-semibold text-violet-300 mt-3 mb-2" {...props} />,
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
              <div className="text-xs text-text-secondary/60 mt-3 pt-3 border-t border-zinc-800">
                {webSummary.descripcion}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="bg-zinc-900 rounded-lg overflow-hidden shadow-lg border border-zinc-800 hover:border-ultraviolet-darker transition-all duration-300 hover:shadow-[0_0_15px_rgba(255,255,255,0.1)]">
      <div className="p-5">
        {/* Header with streamer badge and date */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-2">
            <span className={`${getStreamerColor(summary.streamer)} text-white text-xs px-3 py-1 rounded-full font-semibold`}>
              {summary.streamer}
            </span>
            <span className="text-text-secondary text-sm">
              {formatDate(summary.fecha_formateada)}
            </span>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold text-text-primary mb-3 hover:text-violet-400 transition-colors">
          {summary.titulo_stream}
        </h3>

        {/* Video ID and Twitch Link */}
        <div className="flex items-center space-x-4 mb-4 text-sm text-text-secondary">
          <span className="flex items-center space-x-1">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714z"/>
            </svg>
            <a
              href={summary.twitch_url}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-violet-400 transition-colors"
            >
              {t('streamSummaries.watchOnTwitch', 'Ver en Twitch')}
            </a>
          </span>
          <span className="text-text-secondary/60">
            ID: {summary.video_id}
          </span>
        </div>

        {/* Expand/Collapse Button */}
        <button
          onClick={toggleCard}
          className="w-full mt-4 flex items-center justify-center space-x-2 py-2 px-4 bg-zinc-800 hover:bg-violet-900/30 text-violet-300 rounded-lg transition-all duration-300 border border-zinc-700 hover:border-violet-600"
        >
          <span>
            {isCardOpen
              ? t('streamSummaries.collapse', 'Ocultar resumen')
              : t('streamSummaries.expand', 'Ver resumen')
            }
          </span>
          <motion.svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            animate={{ rotate: isCardOpen ? 180 : 0 }}
            transition={{ duration: 0.3 }}
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </motion.svg>
        </button>

        {/* Summary Content */}
        <AnimatePresence>
          {renderSummaryContent()}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default StreamSummaryCard;
