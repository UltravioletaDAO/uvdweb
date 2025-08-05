import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { SparklesIcon } from '@heroicons/react/24/outline';

const DaoStoryteller = ({ metrics }) => {
  const [story, setStory] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { t, i18n } = useTranslation();

  const generateStory = async () => {
    setLoading(true);
    setError(null);

    try {
      // Preparar el prompt con las métricas actuales
      const currentLang = i18n.language;
      const prompt = currentLang === 'es' 
        ? `Escribe un resumen casual y entretenido sobre cómo va Ultravioleta DAO actualmente, usando estos datos:
          - ${metrics.proposals} propuestas totales (sumando Cuchorapido fase 1 + Ultravioleta fase 2)
          - ${metrics.votes.toLocaleString()} votos emitidos por la comunidad
          - ${metrics.followers} seguidores promedio en Snapshot
          - ${metrics.uvdPrice.toLocaleString()} UVD = 1 USD
          - ${metrics.holders.toLocaleString()} holders del token
          - ${metrics.transactions.toLocaleString()} transacciones del token
          - $${metrics.treasury.toLocaleString()} USD en el tesoro multisig de Avalanche
          - ${metrics.multisigners} multifirmantes activos
          
          Escribe como si fueras un miembro de la comunidad contando a otros cómo va el DAO. Usa un tono conversacional, amigable y motivador. Menciona la evolución de Cuchorapido a Ultravioleta como una historia de crecimiento. NO suenes como una IA, escribe como una persona real que está emocionada por el progreso. 2-3 párrafos máximo.`
        : `Write a casual and entertaining summary about how Ultravioleta DAO is doing right now, using these numbers:
          - ${metrics.proposals} total proposals (combining Cuchorapido phase 1 + Ultravioleta phase 2)
          - ${metrics.votes.toLocaleString()} votes cast by the community
          - ${metrics.followers} average followers on Snapshot
          - ${metrics.uvdPrice.toLocaleString()} UVD = 1 USD
          - ${metrics.holders.toLocaleString()} token holders
          - ${metrics.transactions.toLocaleString()} token transactions
          - $${metrics.treasury.toLocaleString()} USD in Avalanche multisig treasury
          - ${metrics.multisigners} active multisigners
          
          Write like you're a community member telling others how the DAO is going. Use a conversational, friendly and motivating tone. Mention the evolution from Cuchorapido to Ultravioleta as a growth story. DO NOT sound like an AI, write like a real person who's excited about the progress. 2-3 paragraphs max.`;

      // Aquí puedes usar diferentes servicios de LLM
      // Opción 1: OpenAI API (comentado para evitar costos)
      /*
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: currentLang === 'es' 
                ? 'Eres un narrador creativo que cuenta historias inspiradoras sobre DAOs y Web3 en Latinoamérica.'
                : 'You are a creative storyteller who tells inspiring stories about DAOs and Web3 in Latin America.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.8,
          max_tokens: 300
        })
      });

      if (!response.ok) {
        throw new Error('Error al generar la historia');
      }

      const data = await response.json();
      setStory(data.choices[0].message.content);
      */

      // Por ahora usar directamente el fallback (puedes descomentar arriba cuando tengas API key)
      throw new Error('Using fallback story');

    } catch (err) {
      console.error('Error generating story:', err);
      
      // Fallback: Historia predefinida basada en los datos
      const currentLang = i18n.language;
      const fallbackStory = currentLang === 'es'
        ? `¡Qué viaje hemos tenido! Empezamos como Cuchorapido y ahora somos Ultravioleta DAO, con ${metrics.proposals} propuestas que hemos votado juntos y ${metrics.votes.toLocaleString()} votos que muestran lo activa que está nuestra comunidad. Cada número cuenta una historia de gente real construyendo algo increíble.

Tenemos ${metrics.holders.toLocaleString()} personas que creen en este proyecto, con $${metrics.treasury.toLocaleString()} USD bien guardados por ${metrics.multisigners} multifirmantes que cuidan nuestros fondos. Las ${metrics.transactions.toLocaleString()} transacciones de UVD demuestran que esto no es solo teoría - la gente realmente está usando el token.

Con ${metrics.uvdPrice.toLocaleString()} UVD por cada dólar, estamos construyendo algo que va más allá del dinero. Es sobre darle poder a la comunidad latina en Web3 y mostrar que podemos hacer cosas grandes cuando nos unimos.`
        : `What a journey we've had! We started as Cuchorapido and now we're Ultravioleta DAO, with ${metrics.proposals} proposals we've voted on together and ${metrics.votes.toLocaleString()} votes showing how active our community is. Every number tells a story of real people building something incredible.

We have ${metrics.holders.toLocaleString()} people who believe in this project, with $${metrics.treasury.toLocaleString()} USD safely stored by ${metrics.multisigners} multisigners taking care of our funds. The ${metrics.transactions.toLocaleString()} UVD transactions prove this isn't just theory - people are actually using the token.

With ${metrics.uvdPrice.toLocaleString()} UVD per dollar, we're building something that goes beyond money. It's about empowering the Latin community in Web3 and showing we can do big things when we come together.`;

      setStory(fallbackStory);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Generar historia cuando se montan las métricas
    if (metrics && Object.keys(metrics).length > 0) {
      generateStory();
    }
  }, [metrics, i18n.language]);

  if (loading) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center py-8"
      >
        <SparklesIcon className="w-8 h-8 text-ultraviolet-light mx-auto mb-2 animate-pulse" />
        <p className="text-text-secondary">
          {t('home.metrics.generating_story', 'Generando historia...')}
        </p>
      </motion.div>
    );
  }

  if (error) {
    return null; // Silently fail and don't show anything
  }

  if (!story) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.2 }}
      className="mt-8 mb-4 px-4"
    >
      <div className="max-w-4xl mx-auto">
        <div className="bg-gradient-to-br from-ultraviolet-darker/20 to-transparent 
          border border-ultraviolet-darker/30 rounded-xl p-6
          backdrop-blur-sm"
        >
          <div className="flex items-center gap-2 mb-4">
            <SparklesIcon className="w-5 h-5 text-ultraviolet-light" />
            <h3 className="text-lg font-semibold text-text-primary">
              {t('home.metrics.story_title', 'Nuestra Historia en Números')}
            </h3>
          </div>
          <div className="text-text-secondary leading-relaxed whitespace-pre-line">
            {story}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default DaoStoryteller;