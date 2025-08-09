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
  customJsonLd
}) => {
  const { pathname } = useLocation();
  const { i18n, t } = useTranslation();
  const currentLang = i18n.language;
  
  const siteUrl = 'https://ultravioleta.xyz';
  const defaultImage = `${siteUrl}/og-image.png`;
  const defaultTitle = 'UltraVioleta DAO - Latin American Web3 Community';
  const defaultDescription = t('seo.defaultDescription', 'Building the future of Web3 in Latin America through decentralized governance, community-driven innovation, and collaborative treasury management.');
  const defaultKeywords = 'DAO, Web3, Latin America, Blockchain, Decentralized Governance, DeFi, Avalanche, Community, Treasury, Snapshot, Governance Token, LATAM, Crypto, Ethereum';
  
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
    }
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
    mainEntity: [
      {
        '@type': 'Question',
        name: 'What is UltraVioleta DAO?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'UltraVioleta DAO is a decentralized autonomous organization focused on building Web3 infrastructure and community in Latin America.'
        }
      },
      {
        '@type': 'Question',
        name: 'How can I join UltraVioleta DAO?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'You can apply to join through our application form at ultravioleta.xyz/aplicar. We review applications regularly and welcome builders, creators, and Web3 enthusiasts.'
        }
      },
      {
        '@type': 'Question',
        name: 'What blockchain does UltraVioleta use?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'UltraVioleta DAO operates primarily on the Avalanche network for treasury management and uses Snapshot for decentralized governance voting.'
        }
      }
    ]
  } : null;

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

  const allJsonLd = [
    organizationJsonLd,
    websiteJsonLd,
    breadcrumbJsonLd,
    articleJsonLd,
    faqJsonLd,
    eventJsonLd,
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
      
      <meta property="og:type" content={article ? 'article' : 'website'} />
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