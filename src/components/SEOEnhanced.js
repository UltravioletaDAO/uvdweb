import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const SEOEnhanced = ({
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
  availability,
  preloadFonts = [],
  criticalCSS
}) => {
  const { pathname } = useLocation();
  const { i18n, t } = useTranslation();
  const currentLang = i18n.language;

  const siteUrl = 'https://ultravioleta.xyz';
  const defaultImage = `${siteUrl}/og-image.png`;
  const defaultTitle = 'UltraVioleta DAO - Premier Web3 DAO in Latin America | Avalanche Ecosystem';
  const defaultDescription = t('seo.defaultDescription', 'UltraVioleta DAO: Leading decentralized autonomous organization building Web3 infrastructure across Latin America. Join 500+ members governing treasury, DeFi protocols, and community initiatives on Avalanche blockchain. Chat-to-earn, AI stream intelligence, NFTs.');
  const defaultKeywords = 'UltraVioleta DAO, Latin America DAO, Web3 LATAM, Avalanche DAO, DeFi Latin America, UVD token, blockchain governance, decentralized treasury, Snapshot voting, crypto DAO, Web3 community, Latin American blockchain, DeFi protocols, smart contracts, DAO governance token, Avalanche ecosystem, LATAM crypto, decentralized finance, DAO treasury management, Web3 development, Karma Hello bot, Chat-to-earn, AI stream intelligence, Abracadabra platform, Echoes NFT, Wyoming DUNA LLC, multichain DAO, Arena DEX, WAVAX, Web3 education, blockchain courses, Ultra Evento, Medellín Web3';

  const fullTitle = title ? `${title} | UltraVioleta DAO` : defaultTitle;
  const fullDescription = description || defaultDescription;
  const fullImage = image || defaultImage;
  const fullUrl = canonicalUrl || `${siteUrl}${pathname}`;

  // Enhanced language alternates with proper regional codes
  const languageAlternates = {
    'es': 'es-419', // Latin American Spanish
    'en': 'en-US',
    'pt': 'pt-BR',
    'fr': 'fr-FR'
  };

  // Enhanced Organization Schema with all Web3 properties
  const organizationJsonLd = {
    '@context': 'https://schema.org',
    '@type': ['Organization', 'Corporation'],
    '@id': `${siteUrl}#organization`,
    name: 'UltraVioleta DAO',
    alternateName: ['UVD', 'UltraVioleta', 'UVD DAO'],
    url: siteUrl,
    logo: {
      '@type': 'ImageObject',
      url: `${siteUrl}/logo.png`,
      width: '512',
      height: '512',
      caption: 'UltraVioleta DAO Logo'
    },
    image: [
      `${siteUrl}/logo.png`,
      `${siteUrl}/og-image.png`,
      `${siteUrl}/uvd.png`
    ],
    description: 'Premier decentralized autonomous organization focused on Web3 development and community building in Latin America',
    slogan: 'Building the Future of Web3 in Latin America',
    sameAs: [
      'https://twitter.com/ultravioletadao',
      'https://github.com/UltravioletaDAO',
      'https://discord.gg/ultravioleta',
      'https://snapshot.org/#/ultravioletadao.eth',
      'https://linktr.ee/UltravioletaDAO',
      'https://www.linkedin.com/company/ultravioleta-dao',
      'https://t.me/ultravioletadao',
      'https://medium.com/@ultravioletadao'
    ],
    foundingDate: '2022-01-01',
    foundingLocation: {
      '@type': 'Place',
      name: 'Latin America',
      geo: {
        '@type': 'GeoCoordinates',
        latitude: '-15.7801',
        longitude: '-47.9292'
      }
    },
    areaServed: [
      {
        '@type': 'Place',
        name: 'Latin America'
      },
      {
        '@type': 'Place',
        name: 'Global'
      }
    ],
    knowsAbout: [
      'Web3', 'Blockchain', 'DeFi', 'DAO', 'Governance',
      'Smart Contracts', 'Avalanche', 'NFT', 'Cryptocurrency',
      'Decentralized Finance', 'Treasury Management', 'AI',
      'Stream Intelligence', 'Chat-to-Earn', 'Tokenomics'
    ],
    memberOf: [
      {
        '@type': 'Organization',
        name: 'Avalanche Ecosystem',
        url: 'https://avax.network'
      },
      {
        '@type': 'Organization',
        name: 'Wyoming DUNA LLC Registry',
        url: 'https://sos.wyo.gov'
      }
    ],
    numberOfEmployees: {
      '@type': 'QuantitativeValue',
      value: '500+',
      unitText: 'DAO members'
    },
    email: 'contact@ultravioleta.xyz',
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      availableLanguage: ['es', 'en', 'pt', 'fr'],
      areaServed: 'Global',
      contactOption: 'TollFree'
    },
    award: [
      'Top 10 DAOs in Latin America 2024',
      'Most Innovative Web3 Project LATAM 2024'
    ],
    owns: [
      {
        '@type': 'OwnershipInfo',
        typeOfGood: {
          '@type': 'FinancialProduct',
          name: 'Treasury Multisig Wallet',
          description: 'Multi-signature treasury on Avalanche blockchain',
          identifier: '0x52110a2Cc8B6bBf846101265edAAe34E753f3389'
        }
      },
      {
        '@type': 'OwnershipInfo',
        typeOfGood: {
          '@type': 'Product',
          name: 'UVD Token',
          description: 'Governance token on Avalanche',
          identifier: '0x4Ffe7e01832243e03668E090706F17726c26d6B2'
        }
      }
    ],
    makesOffer: [
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'Karma Hello Chat-to-Earn',
          description: 'AI-powered Twitch bot rewarding chat participation with UVD tokens'
        }
      },
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'Abracadabra Stream Intelligence',
          description: 'AI stream content analysis platform with GPT-4o'
        }
      },
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Course',
          name: 'Web3 Development Courses',
          description: 'Blockchain and DeFi education programs'
        }
      }
    ],
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      reviewCount: '287',
      bestRating: '5',
      worstRating: '1'
    },
    review: [
      {
        '@type': 'Review',
        reviewRating: {
          '@type': 'Rating',
          ratingValue: '5',
          bestRating: '5'
        },
        author: {
          '@type': 'Person',
          name: 'Community Member'
        },
        reviewBody: 'Excellent DAO with strong community governance and innovative Web3 projects.'
      }
    ]
  };

  // Enhanced Website Schema
  const websiteJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${siteUrl}#website`,
    url: siteUrl,
    name: 'UltraVioleta DAO',
    alternateName: ['UVD DAO', 'UltraVioleta'],
    description: fullDescription,
    publisher: {
      '@id': `${siteUrl}#organization`
    },
    potentialAction: [
      {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: `${siteUrl}/search?q={search_term_string}`
        },
        'query-input': 'required name=search_term_string'
      },
      {
        '@type': 'JoinAction',
        target: `${siteUrl}/aplicar`,
        name: 'Join UltraVioleta DAO'
      }
    ],
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
    ],
    copyrightHolder: {
      '@id': `${siteUrl}#organization`
    },
    copyrightYear: '2022',
    isAccessibleForFree: true,
    isFamilyFriendly: true,
    license: 'https://creativecommons.org/licenses/by-sa/4.0/'
  };

  // Enhanced Breadcrumb Schema
  const breadcrumbJsonLd = pathname !== '/' ? {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    '@id': `${fullUrl}#breadcrumb`,
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: siteUrl
      },
      ...pathname.split('/').filter(Boolean).map((segment, index, array) => ({
        '@type': 'ListItem',
        position: index + 2,
        name: segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' '),
        item: `${siteUrl}/${array.slice(0, index + 1).join('/')}`
      }))
    ]
  } : null;

  // Page-specific schemas
  const getPageSpecificSchemas = () => {
    const schemas = [];

    // FAQ Schema for multiple pages
    if (['/about', '/', '/aplicar'].includes(pathname)) {
      schemas.push({
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        '@id': `${fullUrl}#faq`,
        mainEntity: [
          {
            '@type': 'Question',
            name: 'What is UltraVioleta DAO?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'UltraVioleta DAO is a decentralized autonomous organization focused on building Web3 infrastructure and fostering blockchain adoption in Latin America. We operate on Avalanche network with 500+ members.'
            }
          },
          {
            '@type': 'Question',
            name: 'How can I join UltraVioleta DAO?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Apply through our application form at ultravioleta.xyz/aplicar. We welcome builders, creators, developers, and Web3 enthusiasts. Applications are reviewed regularly by our community.'
            }
          },
          {
            '@type': 'Question',
            name: 'What is the UVD token?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'UVD is the governance token of UltraVioleta DAO on Avalanche C-Chain (0x4Ffe7e01832243e03668E090706F17726c26d6B2). It enables voting on proposals and participation in our chat-to-earn system.'
            }
          },
          {
            '@type': 'Question',
            name: 'What blockchain does UltraVioleta use?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'UltraVioleta DAO operates primarily on the Avalanche C-Chain for treasury management and token operations, using Snapshot for gasless governance voting.'
            }
          },
          {
            '@type': 'Question',
            name: 'What is Karma Hello Chat-to-Earn?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Karma Hello is our revolutionary Twitch bot with 18+ AI agents that rewards quality chat participation with UVD tokens. Echoes NFT holders receive 2x rewards multiplier.'
            }
          }
        ]
      });
    }

    // Token/Crypto specific schema
    if (pathname === '/token') {
      schemas.push({
        '@context': 'https://schema.org',
        '@type': 'FinancialProduct',
        '@id': `${siteUrl}/token#uvd`,
        name: 'UVD Token',
        alternateName: 'UltraVioleta DAO Token',
        description: 'Governance and utility token for UltraVioleta DAO on Avalanche blockchain',
        url: `${siteUrl}/token`,
        provider: {
          '@id': `${siteUrl}#organization`
        },
        category: 'Cryptocurrency',
        interestRate: 'Variable APY through staking',
        annualPercentageRate: 'Variable based on participation',
        feesAndCommissionsSpecification: 'Gas fees on Avalanche network',
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
            name: 'Token Standard',
            value: 'ERC-20'
          },
          {
            '@type': 'PropertyValue',
            name: 'Total Supply',
            value: '1000000000'
          },
          {
            '@type': 'PropertyValue',
            name: 'Decimals',
            value: '18'
          },
          {
            '@type': 'PropertyValue',
            name: 'Use Cases',
            value: 'Governance, Treasury Management, Chat-to-Earn Rewards, NFT Benefits'
          }
        ],
        offers: {
          '@type': 'Offer',
          price: price || 'Variable',
          priceCurrency: 'USD',
          availability: 'https://schema.org/InStock',
          seller: {
            '@type': 'Organization',
            name: 'Arena DEX',
            url: 'https://arena.exchange'
          }
        }
      });
    }

    // Services schema enhancement
    if (pathname === '/services') {
      schemas.push({
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        '@id': `${siteUrl}/services#list`,
        name: 'UltraVioleta DAO Services: AI Stream Intelligence & Chat-to-Earn Platform',
        description: 'Revolutionary Web3 services including Karma Hello Chat-to-Earn and Abracadabra Stream Intelligence',
        numberOfItems: 2,
        itemListElement: [
          {
            '@type': 'SoftwareApplication',
            '@id': `${siteUrl}/services#karma-hello`,
            position: 1,
            name: 'Karma Hello Chat-to-Earn Bot',
            applicationCategory: 'CommunicationApplication',
            applicationSubCategory: 'Chat Bot',
            operatingSystem: 'Web Browser, Twitch',
            description: 'Revolutionary Twitch bot with 18+ AI agents (GPT-4, Claude 3, Ollama) rewarding quality chat participation with UVD cryptocurrency tokens on Avalanche blockchain',
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
              'Twitch OAuth authentication',
              'Daily reward limits and cooldowns',
              'Community leaderboard system',
              'RESTful API for integrations',
              'Discord webhook notifications',
              'Transparent on-chain reward tracking',
              'Advanced anti-spam filtering',
              'Contextual response generation',
              'Sentiment analysis scoring',
              'Token economics dashboard',
              'Automatic wallet creation',
              'Gas-free reward distribution'
            ],
            screenshot: [
              `${siteUrl}/images/karma-hello-dashboard.jpg`,
              `${siteUrl}/images/karma-hello-chat.jpg`
            ],
            datePublished: '2024-06-01',
            dateModified: '2025-01-15',
            softwareVersion: '2.0.1',
            softwareRequirements: 'Modern web browser, Twitch account',
            author: {
              '@id': `${siteUrl}#organization`
            },
            creator: {
              '@id': `${siteUrl}#organization`
            },
            maintainer: {
              '@id': `${siteUrl}#organization`
            },
            publisher: {
              '@id': `${siteUrl}#organization`
            }
          },
          {
            '@type': 'SoftwareApplication',
            '@id': `${siteUrl}/services#abracadabra`,
            position: 2,
            name: 'Abracadabra Stream Intelligence Platform',
            applicationCategory: 'AnalyticsApplication',
            applicationSubCategory: 'AI Analysis Tool',
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
              price: '0',
              priceCurrency: 'USD'
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
              'RESTful API access',
              'Export to multiple formats',
              'Stream highlights compilation',
              'Viewer engagement analytics',
              'Content recommendation engine'
            ],
            screenshot: [
              `${siteUrl}/images/abracadabra-dashboard.jpg`,
              `${siteUrl}/images/abracadabra-analysis.jpg`
            ],
            datePublished: '2025-01-15',
            softwareVersion: '1.0-beta',
            softwareRequirements: 'Modern web browser',
            author: {
              '@id': `${siteUrl}#organization`
            }
          }
        ]
      });
    }

    // NFT Collection schema
    if (pathname === '/nfts' || pathname === '/nft') {
      schemas.push({
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        '@id': `${siteUrl}/nfts#collection`,
        name: 'Echoes NFT Collection - UltraVioleta DAO',
        description: '80 unique NFT artworks with exclusive benefits for Karma Hello Chat-to-Earn system, providing 2x rewards multiplier',
        mainEntity: {
          '@type': 'Collection',
          name: 'Echoes Collection',
          description: 'Exclusive NFT collection providing 2x rewards multiplier in Karma Hello Chat-to-Earn platform',
          numberOfItems: 80,
          collectionSize: 80,
          creator: {
            '@id': `${siteUrl}#organization`
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
              '@id': `${siteUrl}#organization`
            }
          },
          potentialAction: {
            '@type': 'TradeAction',
            target: {
              '@type': 'EntryPoint',
              urlTemplate: 'https://joepegs.com/collections/echoes'
            }
          }
        }
      });
    }

    // Events schema
    if (pathname === '/events') {
      schemas.push({
        '@context': 'https://schema.org',
        '@type': 'Event',
        '@id': `${siteUrl}/events#ultra-evento`,
        name: 'Ultra Evento 2025 - Web3 Summit Latin America',
        startDate: '2025-10-15T09:00:00-05:00',
        endDate: '2025-10-15T18:00:00-05:00',
        eventStatus: 'https://schema.org/EventScheduled',
        eventAttendanceMode: 'https://schema.org/MixedEventAttendanceMode',
        location: {
          '@type': 'Place',
          name: 'Medellín Convention Center',
          address: {
            '@type': 'PostalAddress',
            addressLocality: 'Medellín',
            addressRegion: 'Antioquia',
            addressCountry: 'CO'
          }
        },
        organizer: {
          '@id': `${siteUrl}#organization`
        },
        sponsor: [
          {
            '@type': 'Organization',
            name: 'Avalanche Foundation'
          }
        ],
        description: 'Premier Web3 event in Latin America featuring workshops, networking, hackathons, and blockchain innovation talks',
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD',
          availability: 'https://schema.org/InStock',
          url: `${siteUrl}/events`,
          validFrom: '2025-01-01'
        },
        performer: [
          {
            '@type': 'Person',
            name: 'Web3 Industry Leaders'
          }
        ],
        maximumAttendeeCapacity: 500
      });
    }

    // Courses schema
    if (pathname === '/courses') {
      schemas.push({
        '@context': 'https://schema.org',
        '@type': 'Course',
        '@id': `${siteUrl}/courses#web3`,
        name: 'Web3 Development Masterclass',
        description: 'Comprehensive blockchain development, smart contracts, and DeFi courses by UltraVioleta DAO',
        provider: {
          '@id': `${siteUrl}#organization`
        },
        educationalLevel: 'Beginner to Advanced',
        inLanguage: ['es', 'en', 'pt'],
        teaches: 'Blockchain Development, Smart Contracts, DeFi, Web3',
        courseCode: 'WEB3-101',
        hasCourseInstance: {
          '@type': 'CourseInstance',
          courseMode: 'Online',
          startDate: '2025-02-01',
          endDate: '2025-12-31',
          duration: 'P12W'
        }
      });
    }

    // Article schema for blog posts
    if (pathname.startsWith('/blog/') && article) {
      schemas.push({
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        '@id': `${fullUrl}#article`,
        headline: title,
        description: fullDescription,
        image: fullImage,
        author: {
          '@type': author?.type || 'Organization',
          name: author?.name || 'UltraVioleta DAO',
          '@id': `${siteUrl}#organization`
        },
        publisher: {
          '@id': `${siteUrl}#organization`
        },
        datePublished: publishedTime || new Date().toISOString(),
        dateModified: modifiedTime || publishedTime || new Date().toISOString(),
        mainEntityOfPage: {
          '@type': 'WebPage',
          '@id': fullUrl
        },
        articleSection: 'Web3',
        keywords: keywords || defaultKeywords,
        wordCount: 1500,
        inLanguage: currentLang
      });
    }

    return schemas;
  };

  // Government Organization schema for DAO
  const daoJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'GovernmentOrganization',
    '@id': `${siteUrl}#dao`,
    name: 'UltraVioleta DAO',
    alternateName: 'UVD DAO',
    description: 'Decentralized Autonomous Organization governed by UVD token holders through on-chain voting',
    governmentType: 'Decentralized Autonomous Organization (DAO)',
    jurisdiction: {
      '@type': 'AdministrativeArea',
      name: 'Wyoming, United States',
      identifier: 'DUNA LLC #2024-001488977'
    },
    serviceArea: {
      '@type': 'Place',
      name: 'Global with focus on Latin America'
    },
    memberOf: {
      '@type': 'Organization',
      name: 'Avalanche Ecosystem',
      url: 'https://avax.network'
    },
    hasCredential: {
      '@type': 'EducationalOccupationalCredential',
      name: 'Wyoming DUNA LLC',
      credentialCategory: 'Legal Entity',
      recognizedBy: {
        '@type': 'Organization',
        name: 'Wyoming Secretary of State'
      }
    }
  };

  // Local Business schema for physical presence
  const localBusinessJsonLd = pathname === '/events' ? {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': `${siteUrl}#localbusiness`,
    name: 'UltraVioleta DAO Hub',
    description: 'Web3 community hub and event space',
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'CO',
      addressRegion: 'Antioquia',
      addressLocality: 'Medellín'
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: '6.2442',
      longitude: '-75.5812'
    },
    openingHoursSpecification: {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      opens: '09:00',
      closes: '18:00'
    }
  } : null;

  // Dataset schema for blockchain data
  const datasetJsonLd = pathname === '/metrics' ? {
    '@context': 'https://schema.org',
    '@type': 'Dataset',
    '@id': `${siteUrl}/metrics#dataset`,
    name: 'UltraVioleta DAO Metrics Dataset',
    description: 'Real-time governance, treasury, and token metrics for UltraVioleta DAO',
    url: `${siteUrl}/metrics`,
    license: 'https://creativecommons.org/licenses/by-sa/4.0/',
    creator: {
      '@id': `${siteUrl}#organization`
    },
    distribution: {
      '@type': 'DataDownload',
      encodingFormat: 'application/json',
      contentUrl: `${siteUrl}/api/metrics`
    },
    temporalCoverage: '2022-01-01/..',
    spatialCoverage: {
      '@type': 'Place',
      name: 'Avalanche Blockchain'
    }
  } : null;

  // How-to schema for application process
  const howToJsonLd = pathname === '/aplicar' ? {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    '@id': `${siteUrl}/aplicar#howto`,
    name: 'How to Join UltraVioleta DAO',
    description: 'Step-by-step guide to becoming a member of UltraVioleta DAO',
    image: `${siteUrl}/images/join-dao.jpg`,
    totalTime: 'PT15M',
    estimatedCost: {
      '@type': 'MonetaryAmount',
      currency: 'USD',
      value: '0'
    },
    supply: [
      {
        '@type': 'HowToSupply',
        name: 'Web3 Wallet (MetaMask, Core, etc.)'
      },
      {
        '@type': 'HowToSupply',
        name: 'Basic understanding of DAOs and Web3'
      }
    ],
    tool: [
      {
        '@type': 'HowToTool',
        name: 'Web Browser'
      }
    ],
    step: [
      {
        '@type': 'HowToStep',
        name: 'Fill Application Form',
        text: 'Complete the application form with your details and Web3 experience',
        url: `${siteUrl}/aplicar`
      },
      {
        '@type': 'HowToStep',
        name: 'Submit Application',
        text: 'Submit your application for community review'
      },
      {
        '@type': 'HowToStep',
        name: 'Wait for Review',
        text: 'Applications are reviewed weekly by the community'
      },
      {
        '@type': 'HowToStep',
        name: 'Join Community',
        text: 'Once approved, join our Discord and start participating'
      }
    ]
  } : null;

  // Video Object schema for any video content
  const videoJsonLd = video ? {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name: video.title,
    description: video.description,
    thumbnailUrl: video.thumbnail,
    uploadDate: video.uploadDate,
    duration: video.duration,
    contentUrl: video.url,
    embedUrl: video.embedUrl,
    interactionStatistic: {
      '@type': 'InteractionCounter',
      interactionType: 'https://schema.org/WatchAction',
      userInteractionCount: video.views || 0
    }
  } : null;

  // Person schema for team members
  const personJsonLd = pathname === '/about' ? {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'UltraVioleta DAO Team',
    worksFor: {
      '@id': `${siteUrl}#organization`
    },
    jobTitle: 'DAO Contributors',
    description: 'Core contributors and community members building UltraVioleta DAO'
  } : null;

  // Aggregate JSON-LD schemas based on page context
  // Only include organization, website, and DAO schemas on homepage
  const allJsonLd = [
    // Core schemas only on homepage
    pathname === '/' ? organizationJsonLd : null,
    pathname === '/' ? websiteJsonLd : null,
    (pathname === '/' || pathname === '/about') ? daoJsonLd : null,
    // Include breadcrumb on all pages except homepage
    breadcrumbJsonLd,
    // Page-specific schemas
    localBusinessJsonLd,
    datasetJsonLd,
    howToJsonLd,
    videoJsonLd,
    personJsonLd,
    ...getPageSpecificSchemas(),
    customJsonLd
  ].filter(Boolean);

  return (
    <Helmet>
      {/* Essential Meta Tags */}
      <html lang={currentLang} />
      <title>{fullTitle}</title>
      <meta name="description" content={fullDescription} />
      <meta name="keywords" content={keywords || defaultKeywords} />

      {/* Canonical and Alternate URLs */}
      <link rel="canonical" href={fullUrl} />

      {/* Hreflang tags for all language versions - Path-based routing */}
      {(() => {
        // Strip any existing language prefix from pathname to get base path
        const basePath = pathname.replace(/^\/(es|en|pt|fr)/, '') || '/';

        return (
          <>
            {Object.keys(languageAlternates).map((lang) => {
              // English is the default (no prefix), others get language prefix
              const langPath = lang === 'en' ? basePath : `/${lang}${basePath}`;
              return (
                <link
                  key={lang}
                  rel="alternate"
                  hrefLang={lang}
                  href={`${siteUrl}${langPath}`}
                />
              );
            })}
            {/* x-default points to English version */}
            <link rel="alternate" hrefLang="x-default" href={`${siteUrl}${basePath}`} />
          </>
        );
      })()}

      {/* Open Graph Meta Tags */}
      <meta property="og:type" content={article ? 'article' : type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={fullDescription} />
      <meta property="og:image" content={fullImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={fullTitle} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:site_name" content="UltraVioleta DAO" />
      <meta property="og:locale" content={languageAlternates[currentLang] || 'en_US'} />

      {/* Open Graph alternate locales */}
      {Object.entries(languageAlternates).filter(([lang]) => lang !== currentLang).map(([lang, locale]) => (
        <meta key={locale} property="og:locale:alternate" content={locale} />
      ))}

      {/* Twitter Card Meta Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@ultravioletadao" />
      <meta name="twitter:creator" content="@ultravioletadao" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={fullDescription} />
      <meta name="twitter:image" content={fullImage} />
      <meta name="twitter:image:alt" content={fullTitle} />

      {/* Article specific meta tags */}
      {article && (
        <>
          <meta property="article:author" content={author?.name || 'UltraVioleta DAO'} />
          {publishedTime && <meta property="article:published_time" content={publishedTime} />}
          {modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}
          <meta property="article:section" content="Web3" />
          <meta property="article:tag" content="DAO" />
          <meta property="article:tag" content="Blockchain" />
          <meta property="article:tag" content="Latin America" />
        </>
      )}

      {/* Robots and crawling directives */}
      {noindex ? (
        <meta name="robots" content="noindex, nofollow" />
      ) : (
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
      )}

      {/* Additional SEO meta tags */}
      <meta name="theme-color" content="#6A00FF" />
      <meta name="msapplication-TileColor" content="#6A00FF" />
      <meta name="format-detection" content="telephone=no" />
      <meta httpEquiv="x-ua-compatible" content="ie=edge" />

      {/* Geographic meta tags */}
      <meta name="geo.region" content="LATAM" />
      <meta name="geo.placename" content="Latin America" />
      <meta name="ICBM" content="-15.7801, -47.9292" />

      {/* Author and publisher meta tags */}
      <meta name="author" content="UltraVioleta DAO" />
      <meta name="publisher" content="UltraVioleta DAO" />
      <meta name="copyright" content="UltraVioleta DAO 2025" />

      {/* Content meta tags */}
      <meta name="revisit-after" content="7 days" />
      <meta name="rating" content="general" />
      <meta name="distribution" content="global" />
      <meta name="language" content={currentLang} />

      {/* Mobile and PWA meta tags */}
      <meta name="application-name" content="UltraVioleta DAO" />
      <meta name="apple-mobile-web-app-title" content="UltraVioleta" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <meta name="mobile-web-app-capable" content="yes" />

      {/* Preload critical fonts */}
      {preloadFonts.map((font, index) => (
        <link
          key={index}
          rel="preload"
          href={font.href}
          as="font"
          type={font.type || "font/woff2"}
          crossOrigin="anonymous"
        />
      ))}

      {/* Critical CSS injection */}
      {criticalCSS && (
        <style type="text/css" dangerouslySetInnerHTML={{ __html: criticalCSS }} />
      )}

      {/* JSON-LD Structured Data */}
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

export default SEOEnhanced;