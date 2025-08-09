import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { SparklesIcon, FireIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { generateDaoAnalysis } from '../api/storyteller';

const DaoStoryteller = ({ metrics }) => {
  const [analysis, setAnalysis] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isUsingFallback, setIsUsingFallback] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);
  const { t, i18n } = useTranslation();
  const lastLanguageRef = useRef(i18n.language);

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
        console.log('DAO Storyteller: Successfully generated AI analysis');
        setAnalysis(result.analysis);
        setHasGenerated(true);
        lastLanguageRef.current = currentLang;
      } else {
        // Use fallback but mark it as such
        console.warn('DAO Storyteller: Using fallback analysis', {
          error: result.error,
          hasKey: !!process.env.REACT_APP_OPENAI_API_KEY
        });
        setAnalysis(result.fallback);
        setIsUsingFallback(result.isUsingFallback || true);
        setHasGenerated(true);
        lastLanguageRef.current = currentLang;
      }

    } catch (err) {
      console.error('Error generating analysis:', err);
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
        {isUsingFallback && (
          <div className="flex items-center gap-1 text-xs text-yellow-500">
            <ExclamationTriangleIcon className="w-4 h-4" />
            <span>{t('home.metrics.offline_analysis')}</span>
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