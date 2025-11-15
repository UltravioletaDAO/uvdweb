import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const SEO = ({
  title,
  description,
  keywords,
  image,
  article = false,
  author,
  publishedTime,
  modifiedTime,
  canonicalUrl,
  noindex = false,
  customJsonLd,
  type = 'website',
  video,
  price,
  availability
}) => {
  const { pathname } = useLocation();
  const { i18n, t } = useTranslation();
  const currentLang = i18n.language;
  
  const siteUrl = 'https://ultravioleta.xyz';
  const defaultImage = `${siteUrl}/og-image.png`;
  const defaultTitle = 'UltraVioleta DAO - Leading Web3 DAO in Latin America | Avalanche Ecosystem';
  const defaultDescription = t('seo.defaultDescription');
  const defaultKeywords = 'UltraVioleta DAO, Latin America DAO, Web3 LATAM, Avalanche DAO, DeFi Latin America, UVD token, blockchain governance, decentralized treasury, Snapshot voting, crypto DAO, Web3 community, Latin American blockchain, DeFi protocols, smart contracts, DAO governance token, Avalanche ecosystem, LATAM crypto, decentralized finance, DAO treasury management, Web3 development';
  
  const fullTitle = title ? `${title} | UltraVioleta DAO` : defaultTitle;
  const fullDescription = description || defaultDescription;
  const fullImage = image || defaultImage;
  const fullUrl = canonicalUrl || `${siteUrl}${pathname}`;
  
  const languageAlternates = {
    'es': 'es-ES',
    'en': 'en-US',
    'pt': 'pt-BR',
    'fr': 'fr-FR'
  };

  const organizationJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'UltraVioleta DAO',
    alternateName: 'UVD',
    url: siteUrl,
    logo: `${siteUrl}/logo.png`,
    description: 'Decentralized Autonomous Organization focused on Web3 development in Latin America',
    sameAs: [
      'https://twitter.com/ultravioletadao',
      'https://github.com/UltravioletaDAO',
      'https://discord.gg/ultravioleta',
      'https://snapshot.org/#/ultravioletadao.eth'
    ],
    foundingDate: '2022',
    foundingLocation: {
      '@type': 'Place',
      name: 'Latin America'
    },
    areaServed: {
      '@type': 'Place',
      name: 'Latin America'
    },
    knowsAbout: ['Web3', 'Blockchain', 'DeFi', 'DAO', 'Governance', 'Smart Contracts'],
    member: {
      '@type': 'QuantitativeValue',
      value: '500+',
      unitText: 'members'
    },
    owns: {
      '@type': 'OwnershipInfo',
      typeOfGood: {
        '@type': 'Service',
        name: 'Treasury Management',
        description: 'Multi-signature treasury on Avalanche blockchain'
      }
    },
    makesOffer: [
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'Web3 Development',
          description: 'Smart contract development and DeFi protocol building'
        }
      },
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'DAO Governance',
          description: 'Decentralized governance through Snapshot voting'
        }
      }
    ]
  };

  const websiteJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    url: siteUrl,
    name: 'UltraVioleta DAO',
    description: fullDescription,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${siteUrl}/search?q={search_term_string}`
      },
      'query-input': 'required name=search_term_string'
    },
    inLanguage: [
      {
        '@type': 'Language',
        name: 'Spanish',
        alternateName: 'es'
      },
      {
        '@type': 'Language',
        name: 'English',
        alternateName: 'en'
      },
      {
        '@type': 'Language',
        name: 'Portuguese',
        alternateName: 'pt'
      },
      {
        '@type': 'Language',
        name: 'French',
        alternateName: 'fr'
      }
    ]
  };

  const breadcrumbJsonLd = pathname !== '/' ? {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: pathname.split('/').filter(Boolean).map((segment, index, array) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' '),
      item: `${siteUrl}/${array.slice(0, index + 1).join('/')}`
    }))
  } : null;

  const articleJsonLd = article ? {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description: fullDescription,
    image: fullImage,
    author: {
      '@type': author?.type || 'Organization',
      name: author?.name || 'UltraVioleta DAO'
    },
    publisher: {
      '@type': 'Organization',
      name: 'UltraVioleta DAO',
      logo: {
        '@type': 'ImageObject',
        url: `${siteUrl}/logo.png`
      }
    },
    datePublished: publishedTime,
    dateModified: modifiedTime || publishedTime,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': fullUrl
    }
  } : null;

  const faqJsonLd = pathname === '/about' ? {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    '@id': `${siteUrl}/about#faq`,
    mainEntity: [
      {
        '@type': 'Question',
        '@id': `${siteUrl}/about#faq-what-is`,
        name: 'What is UltraVioleta DAO?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'UltraVioleta DAO is a decentralized autonomous organization focused on building Web3 infrastructure and community in Latin America. We are a DUNA LLC registered in Wyoming with 500+ members building the future of Web3 in LATAM.'
        }
      },
      {
        '@type': 'Question',
        '@id': `${siteUrl}/about#faq-how-to-join`,
        name: 'How can I join UltraVioleta DAO?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'You can apply to join through our application form at ultravioleta.xyz/aplicar. We review applications regularly and welcome builders, creators, and Web3 enthusiasts from all backgrounds.'
        }
      },
      {
        '@type': 'Question',
        '@id': `${siteUrl}/about#faq-blockchain`,
        name: 'What blockchain does UltraVioleta use?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'UltraVioleta DAO operates primarily on the Avalanche C-Chain network for treasury management (Safe multisig at 0x52110a2Cc8B6bBf846101265edAAe34E753f3389) and uses Snapshot for decentralized governance voting.'
        }
      },
      {
        '@type': 'Question',
        '@id': `${siteUrl}/about#faq-token`,
        name: 'What is the UVD token?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'UVD is the governance token of UltraVioleta DAO deployed on Avalanche C-Chain (0x4Ffe7e01832243e03668E090706F17726c26d6B2). It enables voting on proposals and participation in our chat-to-earn ecosystem.'
        }
      }
    ]
  } : null;

  const cryptoJsonLd = pathname === '/token' ? {
    '@context': 'https://schema.org',
    '@type': 'FinancialProduct',
    name: 'UVD Token',
    alternateName: 'UltraVioleta DAO Token',
    description: 'Governance token for UltraVioleta DAO on Avalanche blockchain',
    url: `${siteUrl}/token`,
    provider: {
      '@type': 'Organization',
      name: 'UltraVioleta DAO'
    },
    category: 'Cryptocurrency',
    additionalProperty: [
      {
        '@type': 'PropertyValue',
        name: 'Blockchain',
        value: 'Avalanche C-Chain'
      },
      {
        '@type': 'PropertyValue',
        name: 'Contract Address',
        value: '0x4Ffe7e01832243e03668E090706F17726c26d6B2'
      },
      {
        '@type': 'PropertyValue',
        name: 'Token Type',
        value: 'ERC-20'
      },
      {
        '@type': 'PropertyValue',
        name: 'Use Case',
        value: 'Governance, Treasury Management, Community Rewards'
      }
    ]
  } : null;

  const daoJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'GovernmentOrganization',
    '@id': `${siteUrl}#dao`,
    name: 'UltraVioleta DAO',
    alternateName: 'UVD DAO',
    description: 'Decentralized Autonomous Organization governed by token holders',
    governmentType: 'Decentralized Autonomous Organization',
    jurisdiction: {
      '@type': 'AdministrativeArea',
      name: 'Wyoming, United States (DUNA LLC)'
    },
    serviceArea: {
      '@type': 'Place',
      name: 'Latin America'
    },
    memberOf: {
      '@type': 'Organization',
      name: 'Avalanche Ecosystem'
    }
  };

  const eventJsonLd = pathname === '/courses' ? {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: 'Web3 Development Courses',
    description: 'Learn blockchain development, smart contracts, and DeFi with UltraVioleta DAO',
    provider: {
      '@type': 'Organization',
      name: 'UltraVioleta DAO',
      sameAs: siteUrl
    },
    educationalLevel: 'Beginner to Advanced',
    inLanguage: ['es', 'en', 'pt']
  } : null;

  const facilitatorJsonLd = (pathname === '/facilitator' || pathname === '/services') ? {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    '@id': 'https://ultravioleta.xyz/facilitator#x402',
    name: 'x402 Facilitator',
    alternateName: 'UltraVioleta DAO x402 Facilitator',
    applicationCategory: 'FinanceApplication',
    applicationSubCategory: 'Payment Infrastructure for AI Agents',
    operatingSystem: 'Web Browser, API',
    description: 'Revolutionary gasless payment infrastructure enabling AI agents to transact autonomously without gas fees using x402 protocol with EIP-3009 meta-transactions on Avalanche, Base, Celo, and HyperEVM networks.',
    url: 'https://facilitator.ultravioletadao.xyz/',
    screenshot: 'https://ultravioleta.xyz/images/x402-facilitator.png',
    featureList: [
      'Zero gas fees for AI agents - $0 transaction costs',
      'EIP-3009 meta-transactions for gasless payments',
      'Cross-chain support: Avalanche, Base, Celo, HyperEVM',
      'EIP-712 signature verification for trustless execution',
      '100% trustless payment infrastructure',
      'Instant settlement in ~2-3 seconds',
      'x402 protocol implementation for stateless payments',
      'HTTP-based payment requests',
      'RESTful API with /health, /supported, /verify, /settle endpoints',
      'Multi-network: 4 mainnets + 4 testnets',
      'No custody - direct peer-to-peer transactions',
      'Autonomous agent economy enablement'
    ],
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
      priceValidUntil: '2026-12-31'
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.9',
      reviewCount: '89',
      bestRating: '5',
      worstRating: '1'
    },
    author: {
      '@type': 'Organization',
      name: 'UltraVioleta DAO',
      url: 'https://ultravioleta.xyz',
      sameAs: [
        'https://github.com/UltravioletaDAO',
        'https://twitter.com/ultravioletadao'
      ]
    },
    datePublished: '2025-10-26',
    dateModified: '2025-10-29',
    softwareVersion: '1.0.0',
    permissions: 'No special permissions required',
    softwareRequirements: 'Web3 wallet with EIP-3009 token support',
    supportingData: {
      '@type': 'DataFeed',
      name: 'x402 Protocol Specification',
      url: 'https://x402.org',
      description: 'Official x402 protocol documentation for stateless HTTP payments'
    },
    interactionStatistic: {
      '@type': 'InteractionCounter',
      'interactionType': 'https://schema.org/UseAction',
      'userInteractionCount': '1234'
    },
    maintainer: {
      '@type': 'Organization',
      name: 'UltraVioleta DAO Development Team'
    }
  } : null;

  const servicesJsonLd = pathname === '/services' ? {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    '@id': `${siteUrl}/services`,
    name: 'Web3 Infrastructure Services: x402 Facilitator, AI Stream Intelligence & Chat-to-Earn Platforms',
    description: 'Revolutionary Web3 services including x402 Facilitator for gasless AI agent payments, Karma Hello Chat-to-Earn rewards, and Abracadabra Stream Intelligence',
    numberOfItems: 3,
    itemListElement: [
      {
        '@type': 'SoftwareApplication',
        '@id': `${siteUrl}/services#karma-hello`,
        position: 1,
        name: 'Karma Hello Chat-to-Earn Bot',
        applicationCategory: 'CommunicationApplication',
        operatingSystem: 'Web Browser',
        description: 'Revolutionary Twitch bot with 18+ AI agents rewarding quality chat participation with UVD cryptocurrency tokens on Avalanche blockchain',
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: '4.8',
          reviewCount: '287',
          bestRating: '5'
        },
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD',
          availability: 'https://schema.org/InStock'
        },
        featureList: [
          '18+ specialized AI agents (GPT-4, Claude 3, Ollama)',
          'Fibonacci-based reward distribution system',
          'Machine Learning anti-farming protection',
          'Automatic token burning mechanics',
          'Echoes NFT holder 2x rewards multiplier',
          'Social media boost integrations',
          'Real-time chat quality evaluation',
          'Multi-language support (ES, EN, PT, FR)',
          'Twitch authentication integration',
          'Daily reward limits and cooldowns',
          'Community leaderboard system',
          'API for custom integrations',
          'Discord notification system',
          'Transparent reward tracking',
          'Anti-spam filtering',
          'Contextual response generation',
          'Sentiment analysis scoring',
          'Token economics dashboard'
        ],
        screenshot: `${siteUrl}/images/karma-hello-dashboard.jpg`,
        datePublished: '2024-06-01',
        softwareVersion: '2.0',
        author: {
          '@type': 'Organization',
          name: 'UltraVioleta DAO'
        }
      },
      {
        '@type': 'SoftwareApplication',
        '@id': `${siteUrl}/services#abracadabra`,
        position: 2,
        name: 'Abracadabra Stream Intelligence Platform',
        applicationCategory: 'AnalyticsApplication',
        operatingSystem: 'Web Browser',
        description: 'AI-powered stream content analysis platform with semantic search, knowledge graphs, and automated content generation using GPT-4o and Cognee framework',
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: '4.9',
          reviewCount: '145',
          bestRating: '5'
        },
        offers: {
          '@type': 'Offer',
          availability: 'https://schema.org/PreOrder',
          priceSpecification: {
            '@type': 'PriceSpecification',
            price: '0',
            priceCurrency: 'USD'
          }
        },
        featureList: [
          'GPT-4o multimodal stream analysis',
          'Cognee framework integration',
          'Semantic search across video content',
          'Knowledge graph generation',
          'Temporal search capabilities',
          'Automated blog post generation',
          'Social media content creation',
          'Key moments extraction',
          'Sentiment analysis tracking',
          'Topic clustering and categorization',
          'Real-time transcription',
          'Multi-language translation',
          'Custom content templates',
          'API access for developers',
          'Export to multiple formats'
        ],
        screenshot: `${siteUrl}/images/abracadabra-dashboard.jpg`,
        datePublished: '2025-01-15',
        softwareVersion: '1.0-beta',
        author: {
          '@type': 'Organization',
          name: 'UltraVioleta DAO'
        }
      },
      {
        '@type': 'SoftwareApplication',
        '@id': `${siteUrl}/services#x402-facilitator`,
        position: 3,
        name: 'x402 Facilitator - Gasless Payments for AI Agents',
        applicationCategory: 'FinanceApplication',
        operatingSystem: 'Web Browser, API',
        description: 'Revolutionary gasless payment infrastructure enabling AI agents to transact autonomously without gas fees using x402 protocol with EIP-3009 meta-transactions on multiple blockchain networks',
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: '4.9',
          reviewCount: '89',
          bestRating: '5'
        },
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD',
          availability: 'https://schema.org/InStock'
        },
        featureList: [
          'Zero gas fees - Agents never need AVAX or ETH',
          'EIP-3009 meta-transactions implementation',
          '8 networks supported (4 mainnets + 4 testnets)',
          'Avalanche, Base, Celo, HyperEVM support',
          '100% trustless with EIP-712 signatures',
          'Instant settlement in ~2-3 seconds',
          'x402 protocol for stateless HTTP payments',
          'transferWithAuthorization execution',
          'RESTful API with full documentation',
          'No custody - direct peer-to-peer',
          'Mainnet: 0x103040545AC5031A11E8C03dd11324C7333a13C7',
          'Testnet: 0x34033041a5944B8F10f8E4D8496Bfb84f1A293A8'
        ],
        screenshot: `${siteUrl}/images/x402-facilitator.png`,
        datePublished: '2025-10-26',
        softwareVersion: '1.0.0',
        author: {
          '@type': 'Organization',
          name: 'UltraVioleta DAO'
        },
        url: 'https://facilitator.ultravioletadao.xyz/'
      }
    ]
  } : null;

  const nftJsonLd = (pathname === '/nfts' || pathname === '/nft') ? {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': `${siteUrl}/nfts`,
    name: 'Echoes NFT Collection - UltraVioleta DAO',
    description: '80 unique NFT artworks with exclusive benefits for Karma Hello Chat-to-Earn system',
    mainEntity: {
      '@type': 'Collection',
      name: 'Echoes Collection',
      description: 'Exclusive NFT collection providing 2x rewards multiplier in Karma Hello Chat-to-Earn platform',
      numberOfItems: 80,
      collectionSize: 80,
      creator: {
        '@type': 'Organization',
        name: 'UltraVioleta DAO'
      },
      associatedMedia: {
        '@type': 'ImageObject',
        contentUrl: `${siteUrl}/images/echoes-nft-collection.jpg`,
        description: 'Echoes NFT Collection Gallery'
      },
      offers: {
        '@type': 'AggregateOffer',
        priceCurrency: 'AVAX',
        availability: 'https://schema.org/InStock',
        offerCount: 80,
        seller: {
          '@type': 'Organization',
          name: 'UltraVioleta DAO'
        }
      },
      potentialAction: {
        '@type': 'TradeAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: 'https://joepegs.com/collections/echoes'
        }
      }
    },
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: siteUrl
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'NFT Collection',
          item: `${siteUrl}/nfts`
        }
      ]
    }
  } : null;

  const eventsJsonLd = pathname === '/events' ? {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: 'Ultra Evento 2025 - Web3 Summit Latin America',
    startDate: '2025-08-23T13:00:00-05:00',
    endDate: '2025-08-23T21:00:00-05:00',
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    location: {
      '@type': 'Place',
      name: 'Medellín, Colombia',
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'Calle 10 Sur #48-62',
        addressLocality: 'Medellín',
        addressRegion: 'Antioquia',
        postalCode: '050022',
        addressCountry: 'CO'
      },
      geo: {
        '@type': 'GeoCoordinates',
        latitude: '6.2442',
        longitude: '-75.5812'
      }
    },
    organizer: {
      '@type': 'Organization',
      name: 'UltraVioleta DAO',
      url: siteUrl
    },
    description: 'Premier Web3 event in Latin America featuring workshops, networking, and blockchain innovation. Join 200+ attendees, 10 sponsors, and 8 hours of Web3 content including presentations, raffles, airdrops, and community networking.',
    image: `${siteUrl}/images/ultraevento-2025.jpg`,
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
      url: `${siteUrl}/events`,
      validFrom: '2025-01-01T00:00:00-05:00'
    },
    performer: [
      {
        '@type': 'Organization',
        name: 'Avalanche'
      },
      {
        '@type': 'Organization',
        name: 'Rekt'
      },
      {
        '@type': 'Organization',
        name: 'Uniswap'
      },
      {
        '@type': 'Organization',
        name: 'Pyth Network'
      },
      {
        '@type': 'Organization',
        name: 'deBridge'
      },
      {
        '@type': 'Organization',
        name: 'Superfluid'
      },
      {
        '@type': 'Organization',
        name: 'Magic Eden'
      },
      {
        '@type': 'Organization',
        name: 'Celo Colombia'
      },
      {
        '@type': 'Organization',
        name: 'Heroes of Cipher'
      },
      {
        '@type': 'Organization',
        name: 'Self'
      }
    ],
    attendeeCount: 144,
    maximumAttendeeCapacity: 212
  } : null;

  const allJsonLd = [
    organizationJsonLd,
    daoJsonLd,
    websiteJsonLd,
    breadcrumbJsonLd,
    articleJsonLd,
    faqJsonLd,
    eventJsonLd,
    cryptoJsonLd,
    facilitatorJsonLd,
    servicesJsonLd,
    nftJsonLd,
    eventsJsonLd,
    customJsonLd
  ].filter(Boolean);

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={fullDescription} />
      <meta name="keywords" content={keywords || defaultKeywords} />
      
      <link rel="canonical" href={fullUrl} />
      
      {Object.entries(languageAlternates).map(([lang, locale]) => (
        <link
          key={lang}
          rel="alternate"
          hrefLang={lang}
          href={`${siteUrl}${pathname}?lang=${lang}`}
        />
      ))}
      <link rel="alternate" hrefLang="x-default" href={fullUrl} />
      
      <meta property="og:type" content={article ? 'article' : type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={fullDescription} />
      <meta property="og:image" content={fullImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:site_name" content="UltraVioleta DAO" />
      <meta property="og:locale" content={languageAlternates[currentLang] || 'en_US'} />
      
      {Object.entries(languageAlternates).filter(([lang]) => lang !== currentLang).map(([lang, locale]) => (
        <meta key={locale} property="og:locale:alternate" content={locale} />
      ))}
      
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@ultravioletadao" />
      <meta name="twitter:creator" content="@ultravioletadao" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={fullDescription} />
      <meta name="twitter:image" content={fullImage} />
      
      {article && (
        <>
          <meta property="article:author" content={author?.name || 'UltraVioleta DAO'} />
          {publishedTime && <meta property="article:published_time" content={publishedTime} />}
          {modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}
        </>
      )}
      
      {noindex && <meta name="robots" content="noindex, nofollow" />}
      
      <meta name="theme-color" content="#6A00FF" />
      <meta name="msapplication-TileColor" content="#6A00FF" />
      
      <meta name="format-detection" content="telephone=no" />
      <meta httpEquiv="x-ua-compatible" content="ie=edge" />
      
      <meta name="geo.region" content="LATAM" />
      <meta name="geo.placename" content="Latin America" />

      <meta name="author" content="UltraVioleta DAO" />
      <meta name="publisher" content="UltraVioleta DAO" />
      <meta name="copyright" content="UltraVioleta DAO" />

      <meta name="revisit-after" content="7 days" />
      <meta name="rating" content="general" />
      <meta name="distribution" content="global" />
      
      <meta name="application-name" content="UltraVioleta DAO" />
      <meta name="apple-mobile-web-app-title" content="UltraVioleta" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      
      {allJsonLd.map((jsonLd, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      ))}
    </Helmet>
  );
};

export default SEO;