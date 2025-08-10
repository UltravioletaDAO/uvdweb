import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { SparklesIcon, FireIcon, ExclamationTriangleIcon, PlayIcon, PauseIcon, SpeakerWaveIcon } from '@heroicons/react/24/outline';
import { generateDaoAnalysis } from '../api/storyteller';
import ttsService from '../services/textToSpeech';

const DaoStoryteller = ({ metrics }) => {
  const [analysis, setAnalysis] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isUsingFallback, setIsUsingFallback] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const [isUsingCachedAudio, setIsUsingCachedAudio] = useState(false);
  const { t, i18n } = useTranslation();
  const lastLanguageRef = useRef(i18n.language);
  
  // Check if TTS is enabled in config
  const ttsEnabled = process.env.REACT_APP_TTS_ENABLED === 'true';

  const generateStory = async (forceRegenerate = false) => {
    // Allow regeneration when language changes
    if (hasGenerated && !forceRegenerate) return;
    
    setLoading(true);
    setError(null);
    setIsUsingFallback(false);

    try {
      const currentLang = i18n.language;
      
      // Generate new analysis
      const result = await generateDaoAnalysis(metrics, currentLang);
      
      if (result.success) {
        setAnalysis(result.analysis);
        setHasGenerated(true);
        lastLanguageRef.current = currentLang;
      } else {
        // Use fallback but mark it as such
        setAnalysis(result.fallback);
        setIsUsingFallback(result.isUsingFallback || true);
        setHasGenerated(true);
        lastLanguageRef.current = currentLang;
      }

    } catch (err) {
      setError(err.message);
      
      // Generate fallback analysis directly
      const { generateFallbackAnalysis } = await import('../api/storyteller');
      const fallback = generateFallbackAnalysis(metrics, i18n.language);
      setAnalysis(fallback);
      setIsUsingFallback(true);
      setHasGenerated(true);
      lastLanguageRef.current = i18n.language;
    } finally {
      setLoading(false);
    }
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
          setIsUsingCachedAudio(false);
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
      setIsUsingCachedAudio(false);
    }
  };

  const handleStop = () => {
    ttsService.stop();
    setIsSpeaking(false);
    setIsPaused(false);
  };

  useEffect(() => {
    return () => {
      // Cleanup on unmount
      ttsService.stop();
    };
  }, []);

  useEffect(() => {
    // Generate story on initial mount
    if (metrics && Object.keys(metrics).length > 0 && !hasGenerated) {
      generateStory();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array = only run once on mount

  useEffect(() => {
    // Regenerate story when language changes
    if (metrics && Object.keys(metrics).length > 0 && lastLanguageRef.current !== i18n.language) {
      // Stop speech when language changes
      handleStop();
      generateStory(true); // Force regeneration
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i18n.language]); // Run when language changes

  if (loading) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center py-8"
      >
        <FireIcon className="w-8 h-8 text-ultraviolet-light mx-auto mb-2 animate-pulse" />
        <p className="text-text-secondary">
          {t('home.metrics.generating_analysis')}
        </p>
      </motion.div>
    );
  }

  if (error && !analysis) {
    return null; // Silently fail if no fallback available
  }

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
        <div className="flex items-center gap-2">
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
          {isUsingFallback && (
            <div className="flex items-center gap-1 text-xs text-yellow-500">
              <ExclamationTriangleIcon className="w-4 h-4" />
              <span>{t('home.metrics.offline_analysis')}</span>
            </div>
          )}
        </div>
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
      {!isUsingFallback && (
        <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid rgba(106, 0, 255, 0.1)', flexShrink: 0 }}>
          <p style={{ fontSize: '11px', color: '#666', display: 'flex', alignItems: 'center', gap: '4px', margin: 0 }}>
            <SparklesIcon className="w-3 h-3" />
            {t('home.metrics.ai_generated')}
          </p>
        </div>
      )}
    </motion.div>
  );
};

export default DaoStoryteller;