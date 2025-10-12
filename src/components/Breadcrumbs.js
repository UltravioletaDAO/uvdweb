import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRightIcon, HomeIcon } from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';

const Breadcrumbs = ({ customItems = [] }) => {
  const location = useLocation();
  const { t } = useTranslation();

  // Don't show breadcrumbs on homepage
  if (location.pathname === '/') {
    return null;
  }

  const pathSegments = location.pathname.split('/').filter(Boolean);

  // Route to label mapping
  const getLabel = (segment) => {
    const labelMap = {
      'about': t('navigation.about'),
      'services': t('navigation.services'),
      'token': t('navigation.token'),
      'metrics': t('navigation.metrics'),
      'snapshot': t('navigation.governance'),
      'events': t('navigation.events'),
      'courses': t('navigation.courses'),
      'blog': t('navigation.blog'),
      'nfts': 'NFTs',
      'nft': 'NFTs',
      'aplicar': t('navigation.apply'),
      'application': t('navigation.application'),
      'contributors': t('navigation.contributors'),
      'experiments': t('navigation.experiments'),
      'delegations': t('navigation.delegations'),
      'social': t('navigation.social'),
      'karma-hello': 'Karma Hello',
      'uvd-wheel': 'UVD Wheel',
      'stream-summaries': t('navigation.stream_summaries'),
      'safe-stats': t('navigation.safe_stats'),
      'purge': t('navigation.purge'),
    };

    return labelMap[segment] || segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ');
  };

  // Build breadcrumb items
  const items = customItems.length > 0 ? customItems : pathSegments.map((segment, index) => {
    const path = '/' + pathSegments.slice(0, index + 1).join('/');
    return {
      label: getLabel(segment),
      href: path,
    };
  });

  // Structured data for breadcrumbs
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': [
      {
        '@type': 'ListItem',
        'position': 1,
        'name': t('navigation.home'),
        'item': 'https://ultravioleta.xyz'
      },
      ...items.map((item, index) => ({
        '@type': 'ListItem',
        'position': index + 2,
        'name': item.label,
        'item': `https://ultravioleta.xyz${item.href}`
      }))
    ]
  };

  return (
    <>
      <script type="application/ld+json">
        {JSON.stringify(breadcrumbSchema)}
      </script>

      <nav
        aria-label="Breadcrumb"
        className="mb-4 px-4 sm:px-6 lg:px-8"
      >
        <ol
          className="flex items-center space-x-2 text-sm"
          itemScope
          itemType="https://schema.org/BreadcrumbList"
        >
          {/* Home link */}
          <li
            itemProp="itemListElement"
            itemScope
            itemType="https://schema.org/ListItem"
            className="flex items-center"
          >
            <Link
              to="/"
              className="text-text-secondary hover:text-ultraviolet transition-colors flex items-center"
              itemProp="item"
              aria-label={t('navigation.home')}
            >
              <HomeIcon className="w-4 h-4 mr-1" />
              <span itemProp="name">{t('navigation.home')}</span>
            </Link>
            <meta itemProp="position" content="1" />
          </li>

          {/* Path segments */}
          {items.map((item, index) => (
            <li
              key={item.href}
              itemProp="itemListElement"
              itemScope
              itemType="https://schema.org/ListItem"
              className="flex items-center"
            >
              <ChevronRightIcon className="w-4 h-4 mx-2 text-text-secondary" aria-hidden="true" />
              {index === items.length - 1 ? (
                // Current page (no link)
                <span
                  className="text-text-primary font-medium"
                  itemProp="name"
                  aria-current="page"
                >
                  {item.label}
                </span>
              ) : (
                // Clickable breadcrumb
                <Link
                  to={item.href}
                  className="text-text-secondary hover:text-ultraviolet transition-colors"
                  itemProp="item"
                >
                  <span itemProp="name">{item.label}</span>
                </Link>
              )}
              <meta itemProp="position" content={String(index + 2)} />
            </li>
          ))}
        </ol>
      </nav>
    </>
  );
};

export default Breadcrumbs;