// SEO Constants and Utilities for UltraVioleta DAO
// Optimized for Web3, DeFi, and Latin America blockchain markets

export const SEO_DEFAULTS = {
  siteName: 'UltraVioleta DAO',
  siteUrl: 'https://ultravioleta.xyz',
  twitterHandle: '@ultravioletadao',
  defaultImage: 'https://ultravioleta.xyz/og-image.png',
  themeColor: '#6A00FF',
  locale: 'es-ES',
  type: 'website',
};

// Web3 and DAO specific keywords for each page
export const PAGE_KEYWORDS = {
  home: 'UltraVioleta DAO, Latin America Web3, DAO LATAM, blockchain governance, decentralized organization, Web3 community, Avalanche ecosystem, crypto DAO, DeFi Latin America, governance token',

  about: 'about UltraVioleta DAO, DAO mission, Web3 vision, Latin America blockchain, decentralized governance model, DAO structure, DUNA LLC, Wyoming DAO, legal DAO framework, Web3 innovation',

  token: 'UVD token, governance token, Avalanche token, ERC-20, DeFi token, DAO voting power, token swap, AVAX trading, Arena DEX, cryptocurrency LATAM, Web3 token economics',

  services: 'blockchain development, smart contracts, DeFi protocols, Web3 consulting, DAO setup, tokenization services, NFT development, dApp development, blockchain integration, Latin America Web3 services',

  metrics: 'DAO analytics, treasury metrics, governance statistics, token metrics, on-chain data, DAO performance, voting analytics, member growth, treasury value, DeFi metrics',

  snapshot: 'DAO voting, Snapshot governance, proposal voting, decentralized decisions, on-chain voting, governance proposals, community voting, Web3 democracy, DAO participation',

  contributors: 'DAO contributors, Web3 builders, blockchain developers, community members, open source contributors, Latin America developers, DAO participants, GitHub contributors',

  courses: 'Web3 education, blockchain courses, smart contract tutorials, DeFi learning, DAO education, crypto development, Web3 bootcamp, Latin America blockchain education, developer training',

  events: 'Web3 events, blockchain meetups, DAO gatherings, crypto conferences, Latin America Web3, hackathons, workshops, networking events, community events, Ultra Evento',

  blog: 'Web3 blog, DAO updates, blockchain articles, DeFi insights, governance updates, community news, crypto analysis, Latin America Web3 news, DAO announcements',

  safestats: 'Safe multisig, treasury management, on-chain treasury, Gnosis Safe, multi-signature wallet, DAO treasury, fund management, blockchain treasury, secure wallet',

  aplicar: 'join DAO, DAO membership, apply to DAO, become member, Web3 community, DAO application, join UltraVioleta, Latin America DAO membership, governance participation',
};

// Structured data templates for different content types
export const STRUCTURED_DATA_TEMPLATES = {
  event: (eventData) => ({
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: eventData.name,
    startDate: eventData.startDate,
    endDate: eventData.endDate,
    eventStatus: 'EventScheduled',
    eventAttendanceMode: eventData.isOnline ? 'OnlineEventAttendanceMode' : 'OfflineEventAttendanceMode',
    location: eventData.location ? {
      '@type': 'Place',
      name: eventData.location.name,
      address: {
        '@type': 'PostalAddress',
        addressLocality: eventData.location.city,
        addressCountry: eventData.location.country,
      }
    } : {
      '@type': 'VirtualLocation',
      url: eventData.url,
    },
    organizer: {
      '@type': 'Organization',
      name: 'UltraVioleta DAO',
      url: SEO_DEFAULTS.siteUrl,
    },
    description: eventData.description,
    offers: {
      '@type': 'Offer',
      price: eventData.price || '0',
      priceCurrency: eventData.currency || 'USD',
      availability: 'InStock',
      url: eventData.registrationUrl,
    },
  }),

  course: (courseData) => ({
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: courseData.name,
    description: courseData.description,
    provider: {
      '@type': 'Organization',
      name: 'UltraVioleta DAO',
      sameAs: SEO_DEFAULTS.siteUrl,
    },
    educationalLevel: courseData.level || 'Beginner to Advanced',
    inLanguage: courseData.languages || ['es', 'en'],
    courseMode: courseData.mode || 'Online',
    duration: courseData.duration,
    hasCourseInstance: {
      '@type': 'CourseInstance',
      startDate: courseData.startDate,
      endDate: courseData.endDate,
      courseMode: courseData.mode || 'Online',
    },
  }),

  blogPost: (postData) => ({
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: postData.title,
    description: postData.description,
    image: postData.image || SEO_DEFAULTS.defaultImage,
    author: {
      '@type': postData.authorType || 'Organization',
      name: postData.author || 'UltraVioleta DAO',
    },
    publisher: {
      '@type': 'Organization',
      name: 'UltraVioleta DAO',
      logo: {
        '@type': 'ImageObject',
        url: `${SEO_DEFAULTS.siteUrl}/logo.png`,
      },
    },
    datePublished: postData.publishedDate,
    dateModified: postData.modifiedDate || postData.publishedDate,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': postData.url,
    },
    keywords: postData.keywords,
  }),

  financialProduct: (tokenData) => ({
    '@context': 'https://schema.org',
    '@type': 'FinancialProduct',
    name: tokenData.name,
    alternateName: tokenData.symbol,
    description: tokenData.description,
    url: tokenData.url,
    provider: {
      '@type': 'Organization',
      name: 'UltraVioleta DAO',
    },
    category: 'Cryptocurrency',
    additionalProperty: [
      {
        '@type': 'PropertyValue',
        name: 'Blockchain',
        value: tokenData.blockchain || 'Avalanche C-Chain',
      },
      {
        '@type': 'PropertyValue',
        name: 'Contract Address',
        value: tokenData.contractAddress,
      },
      {
        '@type': 'PropertyValue',
        name: 'Token Standard',
        value: tokenData.standard || 'ERC-20',
      },
      {
        '@type': 'PropertyValue',
        name: 'Total Supply',
        value: tokenData.totalSupply,
      },
    ],
  }),
};

// Generate meta tags for social media
export const generateSocialMeta = (data) => {
  const {
    title,
    description,
    image = SEO_DEFAULTS.defaultImage,
    url,
    type = 'website',
    video,
  } = data;

  return {
    openGraph: {
      title,
      description,
      url,
      type,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      siteName: SEO_DEFAULTS.siteName,
      ...(video && {
        videos: [
          {
            url: video.url,
            type: video.type || 'video/mp4',
            width: video.width || 1280,
            height: video.height || 720,
          },
        ],
      }),
    },
    twitter: {
      card: video ? 'player' : 'summary_large_image',
      site: SEO_DEFAULTS.twitterHandle,
      creator: SEO_DEFAULTS.twitterHandle,
      title,
      description,
      image,
      ...(video && {
        player: video.url,
        playerWidth: video.width || 1280,
        playerHeight: video.height || 720,
      }),
    },
  };
};

// Generate breadcrumb schema
export const generateBreadcrumb = (path, titles = {}) => {
  const segments = path.split('/').filter(Boolean);
  const items = [];
  let currentPath = SEO_DEFAULTS.siteUrl;

  items.push({
    '@type': 'ListItem',
    position: 1,
    name: 'Home',
    item: SEO_DEFAULTS.siteUrl,
  });

  segments.forEach((segment, index) => {
    currentPath += `/${segment}`;
    items.push({
      '@type': 'ListItem',
      position: index + 2,
      name: titles[segment] || segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' '),
      item: currentPath,
    });
  });

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items,
  };
};

// Generate FAQ schema
export const generateFAQ = (questions) => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: questions.map(q => ({
    '@type': 'Question',
    name: q.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: q.answer,
    },
  })),
});

// Optimize title and description for search
export const optimizeMetadata = (title, description, page) => {
  const maxTitleLength = 60;
  const maxDescriptionLength = 160;

  // Add page-specific suffixes
  const titleSuffix = ' | UltraVioleta DAO';
  let optimizedTitle = title;

  if (optimizedTitle.length + titleSuffix.length > maxTitleLength) {
    optimizedTitle = optimizedTitle.substring(0, maxTitleLength - titleSuffix.length - 3) + '...';
  }
  optimizedTitle += titleSuffix;

  // Ensure description includes key terms
  let optimizedDescription = description;
  if (optimizedDescription.length > maxDescriptionLength) {
    optimizedDescription = optimizedDescription.substring(0, maxDescriptionLength - 3) + '...';
  }

  return {
    title: optimizedTitle,
    description: optimizedDescription,
  };
};

// Language alternatives for international SEO
export const generateLanguageAlternates = (pathname) => {
  const languages = ['es', 'en', 'pt', 'fr'];
  const alternates = {};

  languages.forEach(lang => {
    alternates[lang] = `${SEO_DEFAULTS.siteUrl}${pathname}?lang=${lang}`;
  });

  alternates['x-default'] = `${SEO_DEFAULTS.siteUrl}${pathname}`;

  return alternates;
};

// Generate canonical URL
export const generateCanonical = (pathname, params = {}) => {
  const url = new URL(pathname, SEO_DEFAULTS.siteUrl);

  // Only include essential params in canonical
  const allowedParams = ['lang', 'page'];
  Object.keys(params).forEach(key => {
    if (allowedParams.includes(key)) {
      url.searchParams.set(key, params[key]);
    }
  });

  return url.toString();
};

export default {
  SEO_DEFAULTS,
  PAGE_KEYWORDS,
  STRUCTURED_DATA_TEMPLATES,
  generateSocialMeta,
  generateBreadcrumb,
  generateFAQ,
  optimizeMetadata,
  generateLanguageAlternates,
  generateCanonical,
};