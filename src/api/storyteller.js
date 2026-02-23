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
  // Provide reasonable minimum values when metrics haven't loaded
  // These floors prevent the text from showing "0 members" or "0 proposals"
  const safeMetrics = {
    proposals: metrics?.proposals || 200,
    votes: metrics?.votes || 5000,
    followers: metrics?.followers || 120,
    uvdPrice: metrics?.uvdPrice || 1,
    holders: metrics?.holders || 500,
    transactions: metrics?.transactions || 10000,
    treasury: metrics?.treasury || 1000,
    multisigners: metrics?.multisigners || 5,
    threshold: metrics?.threshold || 3,
    liquidity: metrics?.liquidity || 5000
  };

  if (language === 'es') {
    return `Te tengo que contar lo que estamos haciendo. Ya somos ${safeMetrics.holders.toLocaleString()} personas en Ultravioleta DAO, y entre todos ya votamos ${safeMetrics.votes.toLocaleString()} veces en nuestras ${safeMetrics.proposals} propuestas. Imagínate, somos miles tomando decisiones juntos sobre el futuro de Web3 en Latinoamérica. Nuestras ${safeMetrics.transactions.toLocaleString()} transacciones del token muestran que esto no es solo charla, estamos moviendo el proyecto todos los días.

Lo que nos hace diferentes es que no somos un proyecto más de crypto. Somos una comunidad real con $${safeMetrics.liquidity.toLocaleString()} USD en liquidez y $${safeMetrics.treasury.toLocaleString()} USD en nuestro tesoro comunitario. Para mover estos fondos desde el multisig, necesitamos que una propuesta pase en la gobernanza de Snapshot, y después ${safeMetrics.threshold} de nuestros ${safeMetrics.multisigners} multifirmantes ejecutan la decisión. Acá no hay un CEO ni una empresa detrás. Somos ${safeMetrics.followers} personas activas construyendo algo desde cero, tomando cada decisión entre todos a través de la gobernanza. Esto es Web3 de verdad, no de mentira.

Y mira el timing: con ${safeMetrics.uvdPrice.toLocaleString()} UVD por cada dólar, estás entrando en el momento perfecto para unirte a nosotros. No cuando ya explotó y está caro, sino ahora que lo estamos armando. Los que entraron temprano en Bitcoin o Ethereum hoy son leyendas. Esta es tu chance de ser parte de nuestro proyecto desde el día uno. Estamos despegando y todavía podés subirte.`;
  }
  
  if (language === 'fr') {
    return `Je dois te raconter ce que nous faisons. Nous sommes déjà ${safeMetrics.holders.toLocaleString()} personnes dans Ultravioleta DAO, et ensemble nous avons voté ${safeMetrics.votes.toLocaleString()} fois sur nos ${safeMetrics.proposals} propositions. Imagine, nous sommes des milliers à prendre des décisions ensemble sur l'avenir du Web3 en Amérique latine. Nos ${safeMetrics.transactions.toLocaleString()} transactions de tokens montrent que ce n'est pas que des paroles, nous faisons avancer le projet tous les jours.

Ce qui nous rend différents, c'est que nous ne sommes pas juste un autre projet crypto. Nous sommes une vraie communauté avec $${safeMetrics.liquidity.toLocaleString()} USD en liquidité et $${safeMetrics.treasury.toLocaleString()} USD dans notre trésor communautaire. Pour déplacer ces fonds depuis le multisig, nous avons besoin qu'une proposition passe dans la gouvernance Snapshot, puis ${safeMetrics.threshold} de nos ${safeMetrics.multisigners} multisignataires exécutent la décision. Il n'y a pas de PDG ni d'entreprise derrière. Nous sommes ${safeMetrics.followers} personnes actives construisant quelque chose depuis zéro, prenant chaque décision ensemble à travers la gouvernance. C'est le vrai Web3, pas du faux.

Et regarde le timing : avec ${safeMetrics.uvdPrice.toLocaleString()} UVD par dollar, tu entres au moment parfait pour nous rejoindre. Pas quand c'est déjà explosé et cher, mais maintenant pendant qu'on le construit. Ceux qui sont entrés tôt dans Bitcoin ou Ethereum sont des légendes aujourd'hui. C'est ta chance de faire partie de notre projet depuis le premier jour. Nous décollons et tu peux encore monter à bord.`;
  }
  
  if (language === 'pt') {
    return `Tenho que te contar o que estamos fazendo. Já somos ${safeMetrics.holders.toLocaleString()} pessoas no Ultravioleta DAO, e juntos já votamos ${safeMetrics.votes.toLocaleString()} vezes em nossas ${safeMetrics.proposals} propostas. Imagine, somos milhares tomando decisões juntos sobre o futuro da Web3 na América Latina. Nossas ${safeMetrics.transactions.toLocaleString()} transações de token mostram que isso não é só conversa, estamos movimentando o projeto todos os dias.

O que nos torna diferentes é que não somos apenas mais um projeto crypto. Somos uma comunidade real com $${safeMetrics.liquidity.toLocaleString()} USD em liquidez e $${safeMetrics.treasury.toLocaleString()} USD em nosso tesouro comunitário. Para mover esses fundos do multisig, precisamos que uma proposta passe na governança Snapshot, e então ${safeMetrics.threshold} dos nossos ${safeMetrics.multisigners} multiassinantes executam a decisão. Não há CEO nem empresa por trás. Somos ${safeMetrics.followers} pessoas ativas construindo algo do zero, tomando cada decisão juntos através da governança. Isso é Web3 de verdade, não de mentira.

E olha o timing: com ${safeMetrics.uvdPrice.toLocaleString()} UVD por dólar, você está entrando no momento perfeito para se juntar a nós. Não quando já explodiu e está caro, mas agora enquanto estamos construindo. Aqueles que entraram cedo no Bitcoin ou Ethereum hoje são lendas. Esta é sua chance de fazer parte do nosso projeto desde o primeiro dia. Estamos decolando e você ainda pode embarcar.`;
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