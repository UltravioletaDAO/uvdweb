// Note: In a production app, you should use a backend API to call OpenAI
// to keep your API key secure. This is for demonstration purposes only.

const getApiKey = () => {
  // In React, environment variables are embedded at build time
  // We need to access them directly from window for runtime access
  const key = process.env.REACT_APP_OPENAI_API_KEY || window.REACT_APP_OPENAI_API_KEY;
  return key && key !== 'your_openai_api_key_here' && key.length > 20 ? key : null;
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

Speak as a proud member of the DAO. Simple but with emotion. Like you're inviting a friend to be part of something big WE'RE building.`
};

export const generateDaoAnalysis = async (metrics, language = 'en') => {
  const apiKey = getApiKey();
  
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
    const prompt = language === 'es' 
      ? `Analiza estas métricas de Ultravioleta DAO (anteriormente Cuchorapido):

MÉTRICAS ACTUALES:
- Propuestas totales: ${metrics.proposals} (fase Cuchorapido + fase Ultravioleta)
- Votos emitidos: ${metrics.votes.toLocaleString()}
- Seguidores promedio en Snapshot: ${metrics.followers}
- Precio del token: ${metrics.uvdPrice.toLocaleString()} UVD = 1 USD
- Holders del token: ${metrics.holders.toLocaleString()}
- Transacciones del token: ${metrics.transactions.toLocaleString()}
- Liquidez total del pool: $${metrics.liquidity?.toLocaleString() || 0} USD
- Tesoro comunitario (Avalanche): $${metrics.treasury.toLocaleString()} USD (para mover estos fondos se requiere una propuesta aprobada en Snapshot)
- Multifirmantes activos: ${metrics.multisigners} (${metrics.threshold || 0} firmas requeridas para ejecutar después de aprobación en gobernanza)

Escribe 3 párrafos medianos, simples y emocionantes. USA LOS NÚMEROS EXACTOS que te di. Cuando hables del tesoro, menciona que se requiere aprobación de la gobernanza en Snapshot para mover fondos. Sin palabras complicadas, sin markdown, solo texto normal que cualquiera entienda.`
      : `Analyze these metrics for Ultravioleta DAO (formerly Cuchorapido):

CURRENT METRICS:
- Total proposals: ${metrics.proposals} (Cuchorapido phase + Ultravioleta phase)
- Votes cast: ${metrics.votes.toLocaleString()}
- Average Snapshot followers: ${metrics.followers}
- Token price: ${metrics.uvdPrice.toLocaleString()} UVD = 1 USD
- Token holders: ${metrics.holders.toLocaleString()}
- Token transactions: ${metrics.transactions.toLocaleString()}
- Total pool liquidity: $${metrics.liquidity?.toLocaleString() || 0} USD
- Community treasury (Avalanche): $${metrics.treasury.toLocaleString()} USD (moving these funds requires an approved proposal in Snapshot)
- Active multisigners: ${metrics.multisigners} (${metrics.threshold || 0} signatures required to execute after governance approval)

Write 3 medium paragraphs, simple and exciting. USE THE EXACT NUMBERS I gave you. When talking about the treasury, mention that governance approval in Snapshot is required to move funds. No complicated words, no markdown, just normal text anyone can understand.`;

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
      const error = await response.json();
      throw new Error(error.error?.message || 'OpenAI API error');
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
  // Provide default values if metrics are missing
  const safeMetrics = {
    proposals: metrics?.proposals || 0,
    votes: metrics?.votes || 0,
    followers: metrics?.followers || 0,
    uvdPrice: metrics?.uvdPrice || 0,
    holders: metrics?.holders || 0,
    transactions: metrics?.transactions || 0,
    treasury: metrics?.treasury || 0,
    multisigners: metrics?.multisigners || 0,
    threshold: metrics?.threshold || 0,
    liquidity: metrics?.liquidity || 0
  };

  if (language === 'es') {
    return `Te tengo que contar lo que estamos haciendo. Ya somos ${safeMetrics.holders.toLocaleString()} personas en Ultravioleta DAO, y entre todos ya votamos ${safeMetrics.votes.toLocaleString()} veces en nuestras ${safeMetrics.proposals} propuestas. Imagínate, somos miles tomando decisiones juntos sobre el futuro de Web3 en Latinoamérica. Nuestras ${safeMetrics.transactions.toLocaleString()} transacciones del token muestran que esto no es solo charla, estamos moviendo el proyecto todos los días.

Lo que nos hace diferentes es que no somos un proyecto más de crypto. Somos una comunidad real con $${safeMetrics.liquidity.toLocaleString()} USD en liquidez y $${safeMetrics.treasury.toLocaleString()} USD en nuestro tesoro comunitario. Para mover estos fondos desde el multisig, necesitamos que una propuesta pase en la gobernanza de Snapshot, y después ${safeMetrics.threshold} de nuestros ${safeMetrics.multisigners} multifirmantes ejecutan la decisión. Acá no hay un CEO ni una empresa detrás. Somos ${safeMetrics.followers} personas activas construyendo algo desde cero, tomando cada decisión entre todos a través de la gobernanza. Esto es Web3 de verdad, no de mentira.

Y mira el timing: con ${safeMetrics.uvdPrice.toLocaleString()} UVD por cada dólar, estás entrando en el momento perfecto para unirte a nosotros. No cuando ya explotó y está caro, sino ahora que lo estamos armando. Los que entraron temprano en Bitcoin o Ethereum hoy son leyendas. Esta es tu chance de ser parte de nuestro proyecto desde el día uno. Estamos despegando y todavía podés subirte.`;
  }

  return `I've got to tell you what we're doing. We're already ${safeMetrics.holders.toLocaleString()} people in Ultravioleta DAO, and together we've voted ${safeMetrics.votes.toLocaleString()} times on our ${safeMetrics.proposals} proposals. Imagine that - we're thousands making decisions together about the future of Web3 in Latin America. Our ${safeMetrics.transactions.toLocaleString()} token transactions show this isn't just talk, we're moving the project forward every day.

What makes us different is that we're not just another crypto project. We're a real community with $${safeMetrics.liquidity.toLocaleString()} USD in liquidity and $${safeMetrics.treasury.toLocaleString()} USD in our community treasury. To move these funds from the multisig, we need a proposal to pass in Snapshot governance, and then ${safeMetrics.threshold} of our ${safeMetrics.multisigners} multisigners execute the decision. There's no CEO or company behind this. We're ${safeMetrics.followers} active people building something from scratch, making every decision together through governance. This is real Web3, not fake.

And look at the timing: with ${safeMetrics.uvdPrice.toLocaleString()} UVD per dollar, you're getting in at the perfect moment to join us. Not when it's already exploded and expensive, but now while we're building it. Those who got into Bitcoin or Ethereum early are legends today. This is your chance to be part of our project from day one. We're taking off and you can still get on board.`;
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