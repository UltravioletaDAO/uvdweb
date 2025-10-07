import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { FireIcon, PlayIcon, PauseIcon, SpeakerWaveIcon } from '@heroicons/react/24/outline';
import { generateFallbackAnalysis } from '../api/storyteller';
import ttsService from '../services/textToSpeech';

const DaoStoryteller = ({ metrics }) => {
  const [analysis, setAnalysis] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const { t, i18n } = useTranslation();
  const lastLanguageRef = useRef(i18n.language);

  // Check if TTS is enabled in config
  const ttsEnabled = process.env.REACT_APP_TTS_ENABLED === 'true';

  const generateStory = () => {
    // Generate static template based analysis
    const currentLang = i18n.language;
    const fallbackAnalysis = generateFallbackAnalysis(metrics, currentLang);
    setAnalysis(fallbackAnalysis);
    lastLanguageRef.current = currentLang;
  };

  const handleSpeak = async () => {
    if (!analysis) return;

    if (isPaused) {
      ttsService.resume();
      setIsPaused(false);
      return;
    }

    if (isSpeaking) {
      ttsService.pause();
      setIsPaused(true);
      return;
    }

    try {
      setIsLoadingAudio(true);
      
      // Check cache stats for debugging
      if (process.env.REACT_APP_DEBUG_ENABLED === 'true') {
        const stats = await ttsService.getCacheStats();
        if (stats) {
          console.log('[TTS Cache Stats]', stats);
        }
      }
      
      await ttsService.play(
        analysis, 
        i18n.language,
        () => {
          // onStart
          setIsLoadingAudio(false);
          setIsSpeaking(true);
          setIsPaused(false);
        },
        () => {
          // onEnd
          setIsSpeaking(false);
          setIsPaused(false);
        },
        () => {
          // onPause
          setIsPaused(true);
        }
      );
    } catch (error) {
      setIsLoadingAudio(false);
      setIsSpeaking(false);
      setIsPaused(false);
    }
  };

  useEffect(() => {
    return () => {
      // Cleanup on unmount
      ttsService.stop();
    };
  }, []);

  useEffect(() => {
    // Generate story on initial mount or when metrics change
    if (metrics && Object.keys(metrics).length > 0) {
      generateStory();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [metrics, i18n.language]); // Regenerate when metrics or language changes

  if (!analysis) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.2 }}
      style={{
        backgroundColor: 'rgba(106, 0, 255, 0.05)',
        border: '1px solid rgba(106, 0, 255, 0.2)',
        borderRadius: '12px',
        padding: '24px',
        textAlign: 'left',
        minHeight: '180px',
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        overflow: 'hidden'
      }}
    >
      <div className="flex items-center justify-between mb-3" style={{ flexShrink: 0 }}>
        <div className="flex items-center gap-2">
          <FireIcon className="w-5 h-5 text-ultraviolet-light" />
          <h3 style={{ fontSize: '14px', color: '#888', textTransform: 'uppercase', letterSpacing: '1px', margin: 0 }}>
            {t('home.metrics.expert_analysis')}
          </h3>
        </div>
        {ttsEnabled && (
          <div className="flex items-center gap-2">
            {isLoadingAudio && (
              <div className="flex items-center gap-2 text-xs text-ultraviolet-light">
                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>{t('home.metrics.loading_audio')}</span>
              </div>
            )}
            <button
              onClick={handleSpeak}
              disabled={isLoadingAudio}
              className="p-1.5 rounded-lg transition-all duration-200 hover:bg-ultraviolet-light/10 focus:outline-none focus:ring-2 focus:ring-ultraviolet-light/50 disabled:opacity-50 disabled:cursor-not-allowed"
              title={isLoadingAudio ? t('home.metrics.loading_audio') : (isSpeaking ? (isPaused ? t('home.metrics.resume_audio') : t('home.metrics.pause_audio')) : t('home.metrics.play_audio'))}
              style={{
                backgroundColor: isSpeaking || isLoadingAudio ? 'rgba(106, 0, 255, 0.1)' : 'transparent',
                border: '1px solid rgba(106, 0, 255, 0.2)',
              }}
            >
              {isLoadingAudio ? (
                <svg className="animate-spin h-4 w-4 text-ultraviolet-light" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : isSpeaking ? (
                isPaused ? (
                  <PlayIcon className="w-4 h-4 text-ultraviolet-light" />
                ) : (
                  <PauseIcon className="w-4 h-4 text-ultraviolet-light" />
                )
              ) : (
                <SpeakerWaveIcon className="w-4 h-4 text-ultraviolet-light" />
              )}
            </button>
          </div>
        )}
      </div>
      <div style={{
        color: '#fff',
        lineHeight: '1.5',
        fontSize: '13px',
        flex: 1,
        overflow: 'auto',
        paddingRight: '8px',
        whiteSpace: 'pre-line'
      }}>
        {analysis}
      </div>
    </motion.div>
  );
};

export default DaoStoryteller;