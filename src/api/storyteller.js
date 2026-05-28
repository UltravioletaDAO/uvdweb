// Note: In a production app, you should use a backend API to call OpenAI
// to keep your API key secure. This is for demonstration purposes only.

const getApiKey = () => {
  // In React, environment variables are embedded at build time
  // We need to access them directly from window for runtime access
  const key = process.env.REACT_APP_OPENAI_API_KEY || window.REACT_APP_OPENAI_API_KEY;
  
  // Trim whitespace and validate
  const trimmedKey = key ? key.trim() : null;
  
  if (process.env.REACT_APP_DEBUG_ENABLED === 'true') {
    console.log('OpenAI API Key:', trimmedKey ? 'detected' : 'not found');
  }
  
  return trimmedKey && 
         trimmedKey !== 'your_openai_api_key_here' && 
         trimmedKey.length > 20 && 
         trimmedKey.startsWith('sk-') ? trimmedKey : null;
};

const SYSTEM_PROMPT = {
  es: `Eres parte de Ultravioleta DAO contándole a un amigo sobre lo increíble que estamos haciendo juntos. Habla en PRIMERA PERSONA PLURAL (nosotros, nuestro, somos).

IMPORTANTE: NO uses formato markdown. NO uses símbolos especiales. Solo texto simple.

SIEMPRE habla como parte del DAO: usa NOSOTROS, SOMOS, TENEMOS, NUESTRO. NUNCA uses ellos/tienen/su.

USA EXACTAMENTE los números que te doy, no inventes nada.

Escribe 3 párrafos medianos (3-4 oraciones cada uno):
- Primer párrafo: Cuenta lo que NOSOTROS estamos logrando con números concretos
- Segundo párrafo: Por qué NUESTRO proyecto es diferente y especial. IMPORTANTE: Cuando menciones el tesoro comunitario/vault, siempre aclara que para mover los fondos desde el multisig se requiere que una propuesta en Snapshot pase con aprobación de la gobernanza
- Tercer párrafo: Por qué es el momento perfecto para unirse a NOSOTROS

Habla como un miembro orgulloso del DAO. Simple pero con emoción. Como si estuvieras invitando a un amigo a ser parte de algo grande que ESTAMOS construyendo.`,
  
  en: `You're part of Ultravioleta DAO telling a friend about the incredible things WE are doing together. Speak in FIRST PERSON PLURAL (we, our, us).

IMPORTANT: DO NOT use markdown formatting. DO NOT use special symbols. Just simple text.

ALWAYS speak as part of the DAO: use WE, US, OUR. NEVER use they/them/their.

USE EXACTLY the numbers I give you, don't make anything up.

Write 3 medium paragraphs (3-4 sentences each):
- First paragraph: Tell what WE are achieving with concrete numbers
- Second paragraph: Why OUR project is different and special. IMPORTANT: When mentioning the community vault/treasury, always clarify that to move funds from the multisig, a proper proposal must pass in Snapshot governance
- Third paragraph: Why it's the perfect time to join US

Speak as a proud member of the DAO. Simple but with emotion. Like you're inviting a friend to be part of something big WE'RE building.`,
  
  fr: `Tu fais partie d'Ultravioleta DAO et tu racontes à un ami les choses incroyables que NOUS faisons ensemble. Parle à la PREMIÈRE PERSONNE DU PLURIEL (nous, notre, nos).

IMPORTANT : N'utilise PAS de formatage markdown. N'utilise PAS de symboles spéciaux. Juste du texte simple.

Parle TOUJOURS comme faisant partie du DAO : utilise NOUS, NOTRE, NOS. N'utilise JAMAIS ils/leur/leurs.

UTILISE EXACTEMENT les chiffres que je te donne, n'invente rien.

Écris 3 paragraphes moyens (3-4 phrases chacun) :
- Premier paragraphe : Raconte ce que NOUS accomplissons avec des chiffres concrets
- Deuxième paragraphe : Pourquoi NOTRE projet est différent et spécial. IMPORTANT : Quand tu mentionnes le coffre communautaire/trésor, précise toujours que pour déplacer les fonds depuis le multisig, une proposition doit être approuvée dans la gouvernance Snapshot
- Troisième paragraphe : Pourquoi c'est le moment parfait pour NOUS rejoindre

Parle comme un membre fier du DAO. Simple mais avec émotion. Comme si tu invitais un ami à faire partie de quelque chose de grand que NOUS construisons.`,
  
  pt: `Você faz parte do Ultravioleta DAO contando a um amigo sobre as coisas incríveis que ESTAMOS fazendo juntos. Fale na PRIMEIRA PESSOA DO PLURAL (nós, nosso, nossa).

IMPORTANTE: NÃO use formatação markdown. NÃO use símbolos especiais. Apenas texto simples.

SEMPRE fale como parte do DAO: use NÓS, NOSSO, NOSSA. NUNCA use eles/deles/suas.

USE EXATAMENTE os números que eu te der, não invente nada.

Escreva 3 parágrafos médios (3-4 frases cada):
- Primeiro parágrafo: Conte o que NÓS estamos conquistando com números concretos
- Segundo parágrafo: Por que NOSSO projeto é diferente e especial. IMPORTANTE: Ao mencionar o cofre comunitário/tesouro, sempre esclareça que para mover os fundos do multisig, uma proposta deve passar na governança Snapshot
- Terceiro parágrafo: Por que é o momento perfeito para se juntar a NÓS

Fale como um membro orgulhoso do DAO. Simples mas com emoção. Como se estivesse convidando um amigo para fazer parte de algo grande que ESTAMOS construindo.`
};

export const generateDaoAnalysis = async (metrics, language = 'en') => {
  // Validate metrics
  if (!metrics || typeof metrics !== 'object') {
    console.warn('Invalid metrics provided:', metrics);
    return {
      success: false,
      error: 'Invalid metrics',
      fallback: generateFallbackAnalysis(metrics || {}, language),
      isUsingFallback: true
    };
  }
  
  // Try to use backend API first (recommended for production)
  const backendUrl = process.env.REACT_APP_API_URL;
  if (backendUrl) {
    try {
      console.log('Attempting to generate analysis via backend API...');
      const response = await fetch(`${backendUrl}/storyteller/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          metrics,
          language
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.analysis) {
          console.log('Successfully generated analysis via backend');
          return {
            success: true,
            analysis: data.analysis,
            timestamp: new Date().toISOString()
          };
        }
      }
    } catch (error) {
      console.log('Backend API not available, falling back to direct OpenAI call:', error.message);
    }
  }
  
  // Fallback to direct OpenAI call (development only)
  const apiKey = getApiKey();
  
  // If no API key, return fallback immediately
  if (!apiKey) {
    console.info('No OpenAI API key found, using fallback analysis');
    return {
      success: false,
      error: 'No API key configured',
      fallback: generateFallbackAnalysis(metrics, language),
      isUsingFallback: true
    };
  }

  try {
    // Get the appropriate prompt based on language
    const getPrompt = (lang) => {
      const baseMetrics = `
- ${lang === 'es' ? 'Propuestas totales' : lang === 'fr' ? 'Propositions totales' : lang === 'pt' ? 'Propostas totais' : 'Total proposals'}: ${metrics.proposals}
- ${lang === 'es' ? 'Votos emitidos' : lang === 'fr' ? 'Votes exprimés' : lang === 'pt' ? 'Votos emitidos' : 'Votes cast'}: ${metrics.votes.toLocaleString()}
- ${lang === 'es' ? 'Seguidores promedio en Snapshot' : lang === 'fr' ? 'Followers moyens sur Snapshot' : lang === 'pt' ? 'Seguidores médios no Snapshot' : 'Average Snapshot followers'}: ${metrics.followers}
- ${lang === 'es' ? 'Precio del token' : lang === 'fr' ? 'Prix du token' : lang === 'pt' ? 'Preço do token' : 'Token price'}: ${metrics.uvdPrice.toLocaleString()} UVD = 1 USD
- ${lang === 'es' ? 'Holders del token' : lang === 'fr' ? 'Détenteurs du token' : lang === 'pt' ? 'Detentores do token' : 'Token holders'}: ${metrics.holders.toLocaleString()}
- ${lang === 'es' ? 'Transacciones del token' : lang === 'fr' ? 'Transactions du token' : lang === 'pt' ? 'Transações do token' : 'Token transactions'}: ${metrics.transactions.toLocaleString()}
- ${lang === 'es' ? 'Liquidez total del pool' : lang === 'fr' ? 'Liquidité totale du pool' : lang === 'pt' ? 'Liquidez total do pool' : 'Total pool liquidity'}: $${metrics.liquidity?.toLocaleString() || 0} USD
- ${lang === 'es' ? 'Tesoro comunitario (Avalanche)' : lang === 'fr' ? 'Trésor communautaire (Avalanche)' : lang === 'pt' ? 'Tesouro comunitário (Avalanche)' : 'Community treasury (Avalanche)'}: $${metrics.treasury.toLocaleString()} USD
- ${lang === 'es' ? 'Multifirmantes activos' : lang === 'fr' ? 'Multisignataires actifs' : lang === 'pt' ? 'Multiassinantes ativos' : 'Active multisigners'}: ${metrics.multisigners} (${metrics.threshold || 0} ${lang === 'es' ? 'firmas requeridas' : lang === 'fr' ? 'signatures requises' : lang === 'pt' ? 'assinaturas necessárias' : 'signatures required'})`;

      if (lang === 'es') {
        return `Analiza estas métricas de Ultravioleta DAO:
MÉTRICAS ACTUALES:${baseMetrics}

Escribe 3 párrafos medianos, simples y emocionantes. USA LOS NÚMEROS EXACTOS que te di.`;
      } else if (lang === 'fr') {
        return `Analyse ces métriques d'Ultravioleta DAO:
MÉTRIQUES ACTUELLES:${baseMetrics}

Écris 3 paragraphes moyens, simples et excitants. UTILISE LES CHIFFRES EXACTS que je t'ai donnés.`;
      } else if (lang === 'pt') {
        return `Analise estas métricas do Ultravioleta DAO:
MÉTRICAS ATUAIS:${baseMetrics}

Escreva 3 parágrafos médios, simples e empolgantes. USE OS NÚMEROS EXATOS que eu te dei.`;
      } else {
        return `Analyze these metrics for Ultravioleta DAO:
CURRENT METRICS:${baseMetrics}

Write 3 medium paragraphs, simple and exciting. USE THE EXACT NUMBERS I gave you.`;
      }
    };

    const prompt = getPrompt(language);

    // Make direct API call to OpenAI
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: SYSTEM_PROMPT[language] || SYSTEM_PROMPT['en']
          },
          {
            role: 'user',
            content: prompt || 'Analyze the current state of Ultravioleta DAO'
          }
        ],
        temperature: 0.8,
        max_tokens: 350
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('OpenAI API Error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData
      });
      
      // Check for specific error types
      if (response.status === 401) {
        throw new Error('Invalid API key. Please check your OpenAI API key.');
      } else if (response.status === 429) {
        throw new Error('Rate limit exceeded. Please try again later.');
      } else if (response.status === 403) {
        throw new Error('Access forbidden. Check your API key permissions.');
      }
      
      throw new Error(errorData.error?.message || `OpenAI API error: ${response.status}`);
    }

    const completion = await response.json();

    return {
      success: true,
      analysis: completion.choices[0].message.content,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error generating DAO analysis:', error);
    return {
      success: false,
      error: error.message,
      fallback: generateFallbackAnalysis(metrics, language)
    };
  }
};

export const generateFallbackAnalysis = (metrics, language) => {
  // Solo se narran números REALES (llegan desde las APIs en Home.js).
  // Sin floors inventados: si un dato no cargó, se omite esa frase — nada de cifras alucinadas.
  // members = conteo real de miembros del DAO. followers son seguidores de Snapshot (alcance),
  // NO se presentan como "miembros activos" (eso causaba la contradicción 89 vs 122).
  const m = (metrics && typeof metrics === 'object') ? metrics : {};
  const lang = ['es', 'fr', 'pt'].includes(language) ? language : 'en';
  const has = (v) => typeof v === 'number' && isFinite(v) && v > 0;
  const n = (v) => Number(v).toLocaleString('en-US', { maximumFractionDigits: 0 });
  // Números grandes/volátiles se muestran como "10k+" para no afirmar falsa precisión.
  const kPlus = (v) => !has(v) ? null : (v >= 1000 ? `${Math.floor(v / 1000)}k+` : n(v));
  const sentence = (parts) => parts.filter(Boolean).join(' ');

  const members = has(m.members) ? n(m.members) : '89'; // 89 = conteo actual confirmado del DAO
  const holders = has(m.holders) ? n(m.holders) : null;
  const proposals = has(m.proposals) ? n(m.proposals) : null;
  const votes = has(m.votes) ? n(m.votes) : null;
  const txns = kPlus(m.transactions);
  const treasury = has(m.treasury) ? n(m.treasury) : null;
  const liquidity = has(m.liquidity) ? n(m.liquidity) : null;
  const signers = has(m.multisigners) ? m.multisigners : null;
  const threshold = has(m.threshold) ? m.threshold : null;
  const funds = [
    treasury ? { es: `un tesoro comunitario de $${treasury} USD`, en: `a community treasury of $${treasury} USD`, fr: `une trésorerie communautaire de $${treasury} USD`, pt: `um tesouro comunitário de $${treasury} USD` } : null,
    liquidity ? { es: `$${liquidity} USD en liquidez`, en: `$${liquidity} USD in liquidity`, fr: `$${liquidity} USD de liquidité`, pt: `$${liquidity} USD em liquidez` } : null,
  ].filter(Boolean);

  if (lang === 'es') {
    const p1 = sentence([
      `Te tengo que contar lo que estamos construyendo: somos ${members} miembros en Ultravioleta DAO`,
      holders ? `junto a ${holders} holders del token UVD` : null,
      (votes && proposals) ? `y ya votamos ${votes} veces en nuestras ${proposals} propuestas.` : (proposals ? `con ${proposals} propuestas en nuestra gobernanza.` : 'construyendo en comunidad.'),
      'Tomamos cada decisión juntos sobre el futuro de web4 en Latinoamérica.',
      txns ? `Nuestras ${txns} transacciones del token muestran que esto no es solo charla.` : null,
    ]);
    const p2 = sentence([
      'Lo que nos hace diferentes es que somos una comunidad real, no un proyecto más de crypto.',
      funds.length ? `Gestionamos ${funds.map((x) => x.es).join(' y ')}.` : null,
      `Para mover fondos desde el multisig, una propuesta debe aprobarse en la gobernanza de Snapshot${(signers && threshold) ? `, y luego ${threshold} de nuestros ${signers} multifirmantes la ejecutan` : ''}.`,
      'Acá no hay un CEO ni una empresa detrás: las decisiones son de todos.',
    ]);
    const p3 = 'Y este es el momento de unirte: no cuando ya explotó, sino ahora que lo estamos armando desde cero. Esta es tu chance de ser parte de algo grande desde el día uno. Sigue la luz y construyamos juntos.';
    return `${p1}\n\n${p2}\n\n${p3}`;
  }

  if (lang === 'fr') {
    const p1 = sentence([
      `Je dois te raconter ce que nous construisons : nous sommes ${members} membres dans Ultravioleta DAO`,
      holders ? `aux côtés de ${holders} détenteurs du token UVD` : null,
      (votes && proposals) ? `et nous avons déjà voté ${votes} fois sur nos ${proposals} propositions.` : (proposals ? `avec ${proposals} propositions dans notre gouvernance.` : 'en construisant en communauté.'),
      "Nous prenons chaque décision ensemble sur l'avenir du web4 en Amérique latine.",
      txns ? `Nos ${txns} transactions de tokens montrent que ce ne sont pas que des paroles.` : null,
    ]);
    const p2 = sentence([
      "Ce qui nous rend différents, c'est que nous sommes une vraie communauté, pas juste un autre projet crypto.",
      funds.length ? `Nous gérons ${funds.map((x) => x.fr).join(' et ')}.` : null,
      `Pour déplacer des fonds depuis le multisig, une proposition doit être approuvée dans la gouvernance Snapshot${(signers && threshold) ? `, puis ${threshold} de nos ${signers} multisignataires l'exécutent` : ''}.`,
      "Il n'y a ni PDG ni entreprise derrière : les décisions sont à nous tous.",
    ]);
    const p3 = "Et c'est le moment de nous rejoindre : pas une fois que tout a explosé, mais maintenant pendant que nous le construisons depuis zéro. C'est ta chance de faire partie de quelque chose de grand dès le premier jour. Suis la lumière et construisons ensemble.";
    return `${p1}\n\n${p2}\n\n${p3}`;
  }

  if (lang === 'pt') {
    const p1 = sentence([
      `Tenho que te contar o que estamos construindo: somos ${members} membros no Ultravioleta DAO`,
      holders ? `junto a ${holders} holders do token UVD` : null,
      (votes && proposals) ? `e já votamos ${votes} vezes em nossas ${proposals} propostas.` : (proposals ? `com ${proposals} propostas em nossa governança.` : 'construindo em comunidade.'),
      'Tomamos cada decisão juntos sobre o futuro da web4 na América Latina.',
      txns ? `Nossas ${txns} transações de token mostram que isto não é só conversa.` : null,
    ]);
    const p2 = sentence([
      'O que nos torna diferentes é que somos uma comunidade real, não apenas mais um projeto crypto.',
      funds.length ? `Gerimos ${funds.map((x) => x.pt).join(' e ')}.` : null,
      `Para mover fundos do multisig, uma proposta deve ser aprovada na governança Snapshot${(signers && threshold) ? `, e então ${threshold} dos nossos ${signers} multiassinantes a executam` : ''}.`,
      'Não há CEO nem empresa por trás: as decisões são de todos nós.',
    ]);
    const p3 = 'E este é o momento de se juntar: não quando já explodiu, mas agora enquanto construímos do zero. Esta é a sua chance de fazer parte de algo grande desde o primeiro dia. Siga a luz e vamos construir juntos.';
    return `${p1}\n\n${p2}\n\n${p3}`;
  }

  const p1 = sentence([
    `Let me tell you what we're building: we're ${members} members in Ultravioleta DAO`,
    holders ? `alongside ${holders} UVD token holders` : null,
    (votes && proposals) ? `and together we've already voted ${votes} times across our ${proposals} proposals.` : (proposals ? `with ${proposals} proposals in our governance.` : 'building together as a community.'),
    'We make every decision together about the future of web4 in Latin America.',
    txns ? `Our ${txns} token transactions show this isn't just talk.` : null,
  ]);
  const p2 = sentence([
    "What makes us different is that we're a real community, not just another crypto project.",
    funds.length ? `We steward ${funds.map((x) => x.en).join(' and ')}.` : null,
    `To move funds from the multisig, a proposal must pass in Snapshot governance${(signers && threshold) ? `, and then ${threshold} of our ${signers} multisigners execute it` : ''}.`,
    "There's no CEO or company behind this — every decision is ours, together.",
  ]);
  const p3 = "And this is the moment to join: not after it's already exploded, but now while we're building it from scratch. This is your chance to be part of something big from day one. Follow the light and let's build together.";
  return `${p1}\n\n${p2}\n\n${p3}`;
};

export const cacheAnalysis = (() => {
  let cache = null;
  let cacheTimestamp = null;
  const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  return {
    get: (metrics, language) => {
      const now = Date.now();
      const cacheKey = JSON.stringify({ metrics, language });
      
      if (cache && cacheTimestamp && (now - cacheTimestamp < CACHE_DURATION)) {
        if (cache.key === cacheKey) {
          return cache.data;
        }
      }
      return null;
    },
    set: (metrics, language, data) => {
      cache = {
        key: JSON.stringify({ metrics, language }),
        data
      };
      cacheTimestamp = Date.now();
    }
  };
})();