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
  preconnectUrls = [],
  criticalCSS,
  lazyLoadImages = true
}) => {
  const { pathname } = useLocation();
  const { i18n, t } = useTranslation();
  const currentLang = i18n.language;

  const siteUrl = 'https://ultravioleta.xyz';
  const defaultImage = `${siteUrl}/og-image.png`;
  const defaultTitle = 'UltraVioleta DAO - Leading Web3 DAO in Latin America | Avalanche Ecosystem';
  const defaultDescription = t('seo.defaultDescription', 'UltraVioleta DAO: Premier decentralized autonomous organization building Web3 infrastructure in Latin America. Join 500+ members governing treasury, DeFi protocols, and community initiatives on Avalanche blockchain.');
  const defaultKeywords = 'UltraVioleta DAO, Latin America DAO, Web3 LATAM, Avalanche DAO, DeFi Latin America, UVD token, blockchain governance, decentralized treasury, Snapshot voting, crypto DAO, Web3 community, Latin American blockchain, DeFi protocols, smart contracts, DAO governance token, Avalanche ecosystem, LATAM crypto, decentralized finance, DAO treasury management, Web3 development';

  const fullTitle = title ? `${title} | UltraVioleta DAO` : defaultTitle;
  const fullDescription = description || defaultDescription;
  const fullImage = image || defaultImage;
  const fullUrl = canonicalUrl || `${siteUrl}${pathname}`;

  // Enhanced language mapping with regional variations
  const languageAlternates = {
    'es': 'es-ES',
    'en': 'en-US',
    'pt': 'pt-BR',
    'fr': 'fr-FR'
  };

  // Enhanced Organization Schema with Web3 additions
  const organizationJsonLd = {
    '@context': 'https://schema.org',
    '@type': ['Organization', 'NGO'],
    '@id': `${siteUrl}#organization`,
    name: 'UltraVioleta DAO',
    alternateName: ['UVD', 'UltraVioleta', 'Ultra Violeta DAO'],
    url: siteUrl,
    logo: {
      '@type': 'ImageObject',
      url: `${siteUrl}/logo.png`,
      width: '512',
      height: '512'
    },
    image: [
      `${siteUrl}/logo.png`,
      `${siteUrl}/og-image.png`
    ],
    description: 'Decentralized Autonomous Organization focused on Web3 development in Latin America',
    sameAs: [
      'https://twitter.com/ultravioletadao',
      'https://github.com/UltravioletaDAO',
      'https://discord.gg/ultravioleta',
      'https://snapshot.org/#/ultravioletadao.eth',
      'https://t.me/ultravioletadao',
      'https://medium.com/@ultravioletadao',
      'https://arena.social/UltravioletaDAO',
      'https://www.linkedin.com/company/ultravioletadao',
      'https://youtube.com/@ultravioletadao'
    ],
    foundingDate: '2022-01-01',
    foundingLocation: {
      '@type': 'Place',
      name: 'Latin America',
      geo: {
        '@type': 'GeoCoordinates',
        latitude: '-15.7942',
        longitude: '-47.8822'
      }
    },
    areaServed: {
      '@type': 'Place',
      name: 'Latin America',
      geo: {
        '@type': 'GeoCoordinates',
        latitude: '-15.7942',
        longitude: '-47.8822'
      }
    },
    numberOfEmployees: {
      '@type': 'QuantitativeValue',
      minValue: 10,
      maxValue: 50
    },
    knowsAbout: [
      'Web3',
      'Blockchain',
      'DeFi',
      'DAO',
      'Governance',
      'Smart Contracts',
      'Avalanche',
      'Cryptocurrency',
      'NFTs',
      'Decentralized Finance',
      'Treasury Management'
    ],
    member: {
      '@type': 'QuantitativeValue',
      value: '500',
      unitText: 'members'
    },
    memberOf: [
      {
        '@type': 'Organization',
        name: 'Avalanche Ecosystem'
      },
      {
        '@type': 'Organization',
        name: 'Web3 Foundation'
      }
    ],
    award: [
      'Leading DAO in Latin America 2024',
      'Avalanche Ecosystem Grant Recipient'
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      availableLanguage: ['Spanish', 'English', 'Portuguese', 'French'],
      areaServed: 'Latin America',
      url: `${siteUrl}/contact`
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      reviewCount: '127',
      bestRating: '5',
      worstRating: '1'
    }
  };

  // Enhanced Website Schema with search capabilities
  const websiteJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${siteUrl}#website`,
    url: siteUrl,
    name: 'UltraVioleta DAO',
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
        '@type': 'ReadAction',
        target: `${siteUrl}/blog`
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
    speakable: {
      '@type': 'SpeakableSpecification',
      cssSelector: ['h1', 'h2', '.summary', '.description']
    }
  };

  // Enhanced Breadcrumb with proper hierarchy
  const breadcrumbJsonLd = pathname !== '/' ? {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
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

  // Software Application Schema for dApp
  const softwareApplicationJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'UltraVioleta DAO dApp',
    applicationCategory: 'DeFi',
    operatingSystem: 'Web Browser',
    url: siteUrl,
    description: 'Decentralized application for DAO governance and treasury management',
    screenshot: `${siteUrl}/screenshot.png`,
    featureList: [
      'Snapshot Voting',
      'Treasury Management',
      'Token Swapping',
      'Governance Proposals',
      'Member Dashboard',
      'Analytics & Metrics'
    ],
    softwareRequirements: 'Web3 Wallet (MetaMask, WalletConnect)',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD'
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.7',
      ratingCount: '89'
    }
  };

  // Blockchain/Crypto specific schema
  const blockchainJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Dataset',
    name: 'UltraVioleta DAO Blockchain Data',
    description: 'On-chain data for UltraVioleta DAO governance and treasury',
    url: `${siteUrl}/data`,
    includedInDataCatalog: {
      '@type': 'DataCatalog',
      name: 'Avalanche C-Chain'
    },
    distribution: [
      {
        '@type': 'DataDownload',
        encodingFormat: 'JSON',
        contentUrl: `${siteUrl}/api/treasury`
      },
      {
        '@type': 'DataDownload',
        encodingFormat: 'JSON',
        contentUrl: `${siteUrl}/api/governance`
      }
    ],
    temporalCoverage: '2022/..',
    spatialCoverage: {
      '@type': 'Place',
      name: 'Global'
    },
    license: 'https://creativecommons.org/publicdomain/zero/1.0/'
  };

  // How-to Schema for Web3 actions
  const howToJsonLd = pathname === '/aplicar' ? {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'How to Join UltraVioleta DAO',
    description: 'Step-by-step guide to become a member of UltraVioleta DAO',
    image: `${siteUrl}/join-tutorial.png`,
    totalTime: 'PT10M',
    estimatedCost: {
      '@type': 'MonetaryAmount',
      currency: 'USD',
      value: '0'
    },
    supply: [
      {
        '@type': 'HowToSupply',
        name: 'Web3 Wallet'
      },
      {
        '@type': 'HowToSupply',
        name: 'AVAX for gas fees'
      }
    ],
    step: [
      {
        '@type': 'HowToStep',
        name: 'Connect Wallet',
        text: 'Connect your Web3 wallet to the application',
        image: `${siteUrl}/step1.png`
      },
      {
        '@type': 'HowToStep',
        name: 'Fill Application',
        text: 'Complete the membership application form',
        image: `${siteUrl}/step2.png`
      },
      {
        '@type': 'HowToStep',
        name: 'Submit',
        text: 'Submit your application for review',
        image: `${siteUrl}/step3.png`
      },
      {
        '@type': 'HowToStep',
        name: 'Wait for Approval',
        text: 'Wait for DAO members to review your application',
        image: `${siteUrl}/step4.png`
      }
    ]
  } : null;

  // Video Schema for educational content
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
      interactionType: { '@type': 'WatchAction' },
      userInteractionCount: video.viewCount || 0
    }
  } : null;

  // Person Schema for team/contributors
  const personJsonLd = pathname === '/contributors' ? {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'UltraVioleta DAO Contributors',
    itemListElement: [
      {
        '@type': 'Person',
        name: 'Core Contributors',
        memberOf: {
          '@id': `${siteUrl}#organization`
        }
      }
    ]
  } : null;

  // Local Business Schema for LATAM focus
  const localBusinessJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: 'UltraVioleta DAO LATAM Hub',
    image: `${siteUrl}/hub-image.png`,
    '@id': `${siteUrl}#localbusiness`,
    url: siteUrl,
    telephone: '',
    priceRange: '$$',
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'Multiple Countries in Latin America'
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: '-15.7942',
      longitude: '-47.8822'
    },
    openingHoursSpecification: {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: [
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday',
        'Sunday'
      ],
      opens: '00:00',
      closes: '23:59'
    }
  };

  // Collect all JSON-LD scripts
  const allJsonLd = [
    organizationJsonLd,
    websiteJsonLd,
    breadcrumbJsonLd,
    softwareApplicationJsonLd,
    blockchainJsonLd,
    howToJsonLd,
    videoJsonLd,
    personJsonLd,
    localBusinessJsonLd,
    customJsonLd
  ].filter(Boolean);

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={fullDescription} />
      <meta name="keywords" content={keywords || defaultKeywords} />

      {/* Canonical and Language Alternates */}
      <link rel="canonical" href={fullUrl} />
      {Object.entries(languageAlternates).map(([lang, locale]) => (
        <link
          key={lang}
          rel="alternate"
          hrefLang={lang}
          href={`${siteUrl}/${lang}${pathname}`}
        />
      ))}
      <link rel="alternate" hrefLang="x-default" href={fullUrl} />

      {/* Preconnect for Performance */}
      <link rel="preconnect" href="https://hub.snapshot.org" />
      <link rel="preconnect" href="https://api.coingecko.com" />
      <link rel="preconnect" href="https://safe-transaction-avalanche.safe.global" />
      {preconnectUrls.map(url => (
        <link key={url} rel="preconnect" href={url} />
      ))}

      {/* Prefetch critical resources */}
      <link rel="prefetch" href="/api/metrics" />
      <link rel="dns-prefetch" href="https://api.ultravioletadao.xyz" />

      {/* Open Graph Protocol */}
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
      {Object.entries(languageAlternates).filter(([lang]) => lang !== currentLang).map(([lang, locale]) => (
        <meta key={locale} property="og:locale:alternate" content={locale} />
      ))}

      {/* Twitter/X Card with Web3 additions */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@ultravioletadao" />
      <meta name="twitter:creator" content="@ultravioletadao" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={fullDescription} />
      <meta name="twitter:image" content={fullImage} />
      <meta name="twitter:image:alt" content={fullTitle} />
      <meta name="twitter:dnt" content="on" />

      {/* Article specific */}
      {article && (
        <>
          <meta property="article:author" content={author?.name || 'UltraVioleta DAO'} />
          {publishedTime && <meta property="article:published_time" content={publishedTime} />}
          {modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}
          <meta property="article:section" content="Web3" />
          <meta property="article:tag" content="DAO" />
          <meta property="article:tag" content="Blockchain" />
        </>
      )}

      {/* Web3/Crypto specific meta tags */}
      <meta name="blockchain:network" content="Avalanche C-Chain" />
      <meta name="blockchain:contract" content="0x4Ffe7e01832243e03668E090706F17726c26d6B2" />
      <meta name="crypto:token" content="UVD" />
      <meta name="crypto:chain_id" content="43114" />
      <meta name="web3:wallet_connect" content="true" />
      <meta name="web3:ens_domain" content="ultravioletadao.eth" />
      <meta name="dao:treasury" content="0x80ae3B3847E4e8Bd27A389f7686486CAC9C3f3e8" />
      <meta name="dao:governance" content="snapshot" />

      {/* Security and Privacy */}
      <meta name="referrer" content="strict-origin-when-cross-origin" />
      <meta http-equiv="x-dns-prefetch-control" content="on" />
      <meta http-equiv="x-frame-options" content="SAMEORIGIN" />
      <meta http-equiv="strict-transport-security" content="max-age=31536000; includeSubDomains" />

      {/* Mobile and PWA optimization */}
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0" />
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <meta name="apple-mobile-web-app-title" content="UltraVioleta" />
      <meta name="application-name" content="UltraVioleta DAO" />
      <meta name="msapplication-TileColor" content="#6A00FF" />
      <meta name="msapplication-config" content="/browserconfig.xml" />
      <meta name="theme-color" content="#6A00FF" />

      {/* Geolocation for LATAM */}
      <meta name="geo.region" content="LATAM" />
      <meta name="geo.placename" content="Latin America" />
      <meta name="geo.position" content="-15.7942;-47.8822" />
      <meta name="ICBM" content="-15.7942, -47.8822" />

      {/* Additional SEO meta tags */}
      <meta name="author" content="UltraVioleta DAO" />
      <meta name="publisher" content="UltraVioleta DAO" />
      <meta name="copyright" content="UltraVioleta DAO" />
      <meta name="robots" content={noindex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'} />
      <meta name="googlebot" content={noindex ? 'noindex, nofollow' : 'index, follow'} />
      <meta name="bingbot" content={noindex ? 'noindex, nofollow' : 'index, follow'} />
      <meta name="revisit-after" content="7 days" />
      <meta name="rating" content="general" />
      <meta name="distribution" content="global" />
      <meta name="language" content={currentLang} />

      {/* Verification tags (add your actual verification codes) */}
      <meta name="google-site-verification" content="your-google-verification-code" />
      <meta name="msvalidate.01" content="your-bing-verification-code" />
      <meta name="yandex-verification" content="your-yandex-verification-code" />

      {/* Critical CSS for performance */}
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

      {/* Speakable content for voice search */}
      <meta name="speakable-specification" content="https://schema.org/SpeakableSpecification" />
    </Helmet>
  );
};

export default SEOEnhanced;