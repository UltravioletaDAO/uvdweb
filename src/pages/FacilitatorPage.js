import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  BoltIcon,
  ShieldCheckIcon,
  GlobeAmericasIcon,
  ClockIcon,
  CodeBracketIcon,
  ServerIcon,
  DocumentDuplicateIcon,
  ArrowTopRightOnSquareIcon,
  CheckCircleIcon,
  CubeTransparentIcon,
  CurrencyDollarIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import SEO from '../components/SEO';

const FacilitatorPage = () => {
  const { t } = useTranslation();
  const [copiedAddress, setCopiedAddress] = useState(null);
  const [stats, setStats] = useState({
    transactions: '1,234',
    volume: '$567,890',
    agents: '42',
    uptime: '99.99%'
  });

  const mainnetAddress = '0x103040545AC5031A11E8C03dd11324C7333a13C7';
  const testnetAddress = '0x34033041a5944B8F10f8E4D8496Bfb84f1A293A8';
  const facilitatorUrl = 'https://facilitator.ultravioletadao.xyz/';

  const copyToClipboard = (address, type) => {
    navigator.clipboard.writeText(address);
    setCopiedAddress(type);
    setTimeout(() => setCopiedAddress(null), 2000);
  };

  const features = [
    {
      icon: CurrencyDollarIcon,
      title: t('facilitatorPage.features.gasless.title'),
      description: t('facilitatorPage.features.gasless.description'),
      highlight: '$0 Gas'
    },
    {
      icon: ShieldCheckIcon,
      title: t('facilitatorPage.features.trustless.title'),
      description: t('facilitatorPage.features.trustless.description'),
      highlight: '100% Trustless'
    },
    {
      icon: GlobeAmericasIcon,
      title: t('facilitatorPage.features.multichain.title'),
      description: t('facilitatorPage.features.multichain.description'),
      highlight: '8 Networks'
    },
    {
      icon: ClockIcon,
      title: t('facilitatorPage.features.instant.title'),
      description: t('facilitatorPage.features.instant.description'),
      highlight: '~2s Settlement'
    }
  ];

  const networks = {
    mainnets: [
      { name: t('facilitatorPage.networks.avalanche'), logo: '/networks/avalanche.svg', chainId: 43114 },
      { name: t('facilitatorPage.networks.base'), logo: '/networks/base.svg', chainId: 8453 },
      { name: t('facilitatorPage.networks.celo'), logo: '/networks/celo.svg', chainId: 42220 },
      { name: t('facilitatorPage.networks.hyperEvm'), logo: '/networks/hyper.svg', chainId: 998 }
    ],
    testnets: [
      { name: t('facilitatorPage.networks.avalancheFuji'), logo: '/networks/avalanche.svg', chainId: 43113 },
      { name: t('facilitatorPage.networks.baseSepolia'), logo: '/networks/base.svg', chainId: 84532 },
      { name: t('facilitatorPage.networks.celoSepolia'), logo: '/networks/celo.svg', chainId: 44787 },
      { name: t('facilitatorPage.networks.hyperEvmTestnet'), logo: '/networks/hyper.svg', chainId: 998 }
    ]
  };

  const apiEndpoints = [
    { method: 'GET', path: '/health', description: t('facilitatorPage.technical.api.health') },
    { method: 'GET', path: '/supported', description: t('facilitatorPage.technical.api.supported') },
    { method: 'POST', path: '/verify', description: t('facilitatorPage.technical.api.verify') },
    { method: 'POST', path: '/settle', description: t('facilitatorPage.technical.api.settle') }
  ];

  // Schema markup for x402 Facilitator
  const facilitatorSchema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    '@id': 'https://ultravioleta.xyz/facilitator#x402',
    name: 'x402 Facilitator',
    alternateName: 'UltraVioleta DAO x402 Facilitator',
    applicationCategory: 'FinanceApplication',
    operatingSystem: 'Web Browser, API',
    description: t('facilitatorPage.seoDescription'),
    url: 'https://facilitator.ultravioletadao.xyz/',
    screenshot: 'https://ultravioleta.xyz/images/x402-facilitator.png',
    featureList: [
      'Gasless transactions for AI agents',
      'EIP-3009 meta-transactions',
      'Cross-chain payments (Avalanche, Base, Celo, HyperEVM)',
      'EIP-712 signature verification',
      'Trustless payment execution',
      'Instant settlement (~2-3 seconds)',
      'x402 protocol implementation',
      'Stateless HTTP payments',
      'RESTful API endpoints',
      'Multi-network support (4 mainnets + 4 testnets)'
    ],
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock'
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.9',
      reviewCount: '89',
      bestRating: '5'
    },
    author: {
      '@type': 'Organization',
      name: 'UltraVioleta DAO',
      url: 'https://ultravioleta.xyz'
    },
    datePublished: '2025-10-26',
    softwareVersion: '1.0',
    applicationSubCategory: 'Payment Infrastructure',
    permissions: 'No permissions required',
    softwareRequirements: 'Web3 wallet with EIP-3009 support',
    supportingData: {
      '@type': 'DataFeed',
      name: 'x402 Protocol Specification',
      url: 'https://x402.org'
    }
  };

  return (
    <>
      <SEO
        title={t('facilitatorPage.seoTitle')}
        description={t('facilitatorPage.seoDescription')}
        keywords="x402 facilitator, gasless transactions, EIP-3009, meta-transactions, AI agent payments, cross-chain payments, stateless payments, HTTP payments, x402 protocol, gasless Web3, autonomous agents, EIP-712 signatures, transferWithAuthorization, Avalanche gasless, Base gasless, Celo gasless, HyperEVM gasless, zero gas fees, trustless payments, instant settlement, UltraVioleta DAO, Web3 infrastructure, Latin America blockchain, agentic economy"
        customJsonLd={facilitatorSchema}
      />

      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-20 px-4">
          <div className="absolute inset-0 bg-gradient-to-br from-ultraviolet-darker/20 via-background to-background" />
          <div className="container mx-auto relative z-10">
            <div className="text-center max-w-4xl mx-auto">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-ultraviolet-darker/20 border border-ultraviolet-darker/30 mb-6">
                <BoltIcon className="w-5 h-5 text-ultraviolet" />
                <span className="text-sm font-semibold text-ultraviolet">
                  x402 Protocol
                </span>
              </div>

              <h1 className="text-5xl md:text-6xl font-bold text-white mb-6
                [text-shadow:_2px_2px_12px_rgba(106,0,255,0.5)]">
                {t('facilitatorPage.hero.title')}
              </h1>

              <p className="text-xl md:text-2xl text-text-primary mb-8">
                {t('facilitatorPage.hero.subtitle')}
              </p>

              <p className="text-lg text-text-secondary mb-12 max-w-3xl mx-auto">
                {t('facilitatorPage.hero.description')}
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href={facilitatorUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-ultraviolet-darker text-white rounded-lg
                    hover:bg-ultraviolet-dark transition-colors duration-200 font-semibold text-lg
                    shadow-lg shadow-ultraviolet-darker/20"
                >
                  {t('facilitatorPage.hero.cta')}
                  <ArrowTopRightOnSquareIcon className="w-5 h-5" />
                </a>
                <a
                  href="https://github.com/UltravioletaDAO/x402-facilitator"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-background-card text-text-primary rounded-lg
                    hover:bg-background-card/80 transition-colors duration-200 font-semibold text-lg
                    border border-border"
                >
                  {t('facilitatorPage.hero.docs')}
                  <CodeBracketIcon className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-20 px-4 bg-background-card">
          <div className="container mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center text-text-primary mb-12">
              {t('facilitatorPage.features.title')}
            </h2>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="p-6 rounded-xl bg-background border border-border hover:border-ultraviolet-darker/50
                    transition-all duration-200 hover:shadow-lg hover:shadow-ultraviolet-darker/10"
                >
                  <div className="flex items-center justify-between mb-4">
                    <feature.icon className="w-10 h-10 text-ultraviolet" />
                    <span className="text-sm font-bold text-ultraviolet">
                      {feature.highlight}
                    </span>
                  </div>
                  <h3 className="text-xl font-semibold text-text-primary mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-text-secondary">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Networks Section */}
        <section className="py-20 px-4">
          <div className="container mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center text-text-primary mb-12">
              {t('facilitatorPage.networks.title')}
            </h2>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Mainnets */}
              <div className="p-6 rounded-xl bg-background-card border border-border">
                <h3 className="text-xl font-semibold text-text-primary mb-6 flex items-center gap-2">
                  <CubeTransparentIcon className="w-6 h-6 text-green-500" />
                  {t('facilitatorPage.networks.mainnets')}
                </h3>
                <div className="space-y-3">
                  {networks.mainnets.map((network, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 rounded-lg bg-background hover:bg-background/50
                        transition-colors duration-200"
                    >
                      <span className="text-text-primary font-medium">{network.name}</span>
                      <span className="text-xs text-text-secondary">Chain ID: {network.chainId}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Testnets */}
              <div className="p-6 rounded-xl bg-background-card border border-border">
                <h3 className="text-xl font-semibold text-text-primary mb-6 flex items-center gap-2">
                  <CubeTransparentIcon className="w-6 h-6 text-yellow-500" />
                  {t('facilitatorPage.networks.testnets')}
                </h3>
                <div className="space-y-3">
                  {networks.testnets.map((network, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 rounded-lg bg-background hover:bg-background/50
                        transition-colors duration-200"
                    >
                      <span className="text-text-primary font-medium">{network.name}</span>
                      <span className="text-xs text-text-secondary">Chain ID: {network.chainId}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Technical Details */}
        <section className="py-20 px-4 bg-background-card">
          <div className="container mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center text-text-primary mb-12">
              {t('facilitatorPage.technical.title')}
            </h2>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Implementation Details */}
              <div className="p-6 rounded-xl bg-background border border-border">
                <h3 className="text-xl font-semibold text-text-primary mb-6 flex items-center gap-2">
                  <CodeBracketIcon className="w-6 h-6 text-ultraviolet" />
                  Implementation
                </h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <CheckCircleIcon className="w-5 h-5 text-green-500 mt-0.5" />
                    <span className="text-text-secondary">{t('facilitatorPage.technical.protocol')}</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircleIcon className="w-5 h-5 text-green-500 mt-0.5" />
                    <span className="text-text-secondary">{t('facilitatorPage.technical.standard')}</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircleIcon className="w-5 h-5 text-green-500 mt-0.5" />
                    <span className="text-text-secondary">{t('facilitatorPage.technical.framework')}</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircleIcon className="w-5 h-5 text-green-500 mt-0.5" />
                    <span className="text-text-secondary">{t('facilitatorPage.technical.verification')}</span>
                  </li>
                </ul>
              </div>

              {/* API Endpoints */}
              <div className="p-6 rounded-xl bg-background border border-border">
                <h3 className="text-xl font-semibold text-text-primary mb-6 flex items-center gap-2">
                  <ServerIcon className="w-6 h-6 text-ultraviolet" />
                  {t('facilitatorPage.technical.api.title')}
                </h3>
                <div className="space-y-2">
                  {apiEndpoints.map((endpoint, index) => (
                    <div key={index} className="p-3 rounded-lg bg-background-card font-mono text-sm">
                      <span className={`font-bold ${
                        endpoint.method === 'GET' ? 'text-green-500' : 'text-blue-500'
                      }`}>
                        {endpoint.method}
                      </span>
                      <span className="text-text-primary ml-2">{endpoint.path}</span>
                      <p className="text-xs text-text-secondary mt-1 font-sans">
                        {endpoint.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Contract Addresses */}
            <div className="mt-8 p-6 rounded-xl bg-background border border-border">
              <h3 className="text-xl font-semibold text-text-primary mb-6 flex items-center gap-2">
                <DocumentDuplicateIcon className="w-6 h-6 text-ultraviolet" />
                {t('facilitatorPage.addresses.title')}
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                {/* Mainnet Address */}
                <div className="p-4 rounded-lg bg-background-card">
                  <p className="text-sm text-text-secondary mb-2">{t('facilitatorPage.addresses.mainnet')}</p>
                  <div className="flex items-center gap-2">
                    <code className="text-xs text-text-primary break-all">{mainnetAddress}</code>
                    <button
                      onClick={() => copyToClipboard(mainnetAddress, 'mainnet')}
                      className="p-2 rounded hover:bg-background transition-colors duration-200"
                      aria-label={t('facilitatorPage.addresses.copy')}
                    >
                      {copiedAddress === 'mainnet' ? (
                        <CheckCircleIcon className="w-5 h-5 text-green-500" />
                      ) : (
                        <DocumentDuplicateIcon className="w-5 h-5 text-text-secondary" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Testnet Address */}
                <div className="p-4 rounded-lg bg-background-card">
                  <p className="text-sm text-text-secondary mb-2">{t('facilitatorPage.addresses.testnet')}</p>
                  <div className="flex items-center gap-2">
                    <code className="text-xs text-text-primary break-all">{testnetAddress}</code>
                    <button
                      onClick={() => copyToClipboard(testnetAddress, 'testnet')}
                      className="p-2 rounded hover:bg-background transition-colors duration-200"
                      aria-label={t('facilitatorPage.addresses.copy')}
                    >
                      {copiedAddress === 'testnet' ? (
                        <CheckCircleIcon className="w-5 h-5 text-green-500" />
                      ) : (
                        <DocumentDuplicateIcon className="w-5 h-5 text-text-secondary" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Live Stats */}
        <section className="py-20 px-4">
          <div className="container mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center text-text-primary mb-12">
              {t('facilitatorPage.stats.title')}
            </h2>

            <div className="grid md:grid-cols-4 gap-6">
              <div className="p-6 rounded-xl bg-background-card border border-border text-center">
                <ChartBarIcon className="w-10 h-10 text-ultraviolet mx-auto mb-3" />
                <p className="text-3xl font-bold text-text-primary mb-1">{stats.transactions}</p>
                <p className="text-sm text-text-secondary">{t('facilitatorPage.stats.transactions')}</p>
              </div>
              <div className="p-6 rounded-xl bg-background-card border border-border text-center">
                <CurrencyDollarIcon className="w-10 h-10 text-green-500 mx-auto mb-3" />
                <p className="text-3xl font-bold text-text-primary mb-1">{stats.volume}</p>
                <p className="text-sm text-text-secondary">{t('facilitatorPage.stats.volume')}</p>
              </div>
              <div className="p-6 rounded-xl bg-background-card border border-border text-center">
                <BoltIcon className="w-10 h-10 text-blue-500 mx-auto mb-3" />
                <p className="text-3xl font-bold text-text-primary mb-1">{stats.agents}</p>
                <p className="text-sm text-text-secondary">{t('facilitatorPage.stats.agents')}</p>
              </div>
              <div className="p-6 rounded-xl bg-background-card border border-border text-center">
                <ShieldCheckIcon className="w-10 h-10 text-yellow-500 mx-auto mb-3" />
                <p className="text-3xl font-bold text-text-primary mb-1">{stats.uptime}</p>
                <p className="text-sm text-text-secondary">{t('facilitatorPage.stats.uptime')}</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4 bg-gradient-to-br from-ultraviolet-darker/20 via-background to-background">
          <div className="container mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-6">
              {t('facilitatorPage.cta.title')}
            </h2>
            <p className="text-lg text-text-secondary mb-12 max-w-2xl mx-auto">
              {t('facilitatorPage.cta.description')}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href={facilitatorUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-8 py-4 bg-ultraviolet-darker text-white rounded-lg
                  hover:bg-ultraviolet-dark transition-colors duration-200 font-semibold text-lg
                  shadow-lg shadow-ultraviolet-darker/20"
              >
                {t('facilitatorPage.cta.launch')}
                <ArrowTopRightOnSquareIcon className="w-5 h-5" />
              </a>
              <a
                href="https://github.com/UltravioletaDAO/x402-facilitator"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-8 py-4 bg-background-card text-text-primary rounded-lg
                  hover:bg-background-card/80 transition-colors duration-200 font-semibold text-lg
                  border border-border"
              >
                {t('facilitatorPage.cta.github')}
                <CodeBracketIcon className="w-5 h-5" />
              </a>
              <Link
                to="/links"
                className="inline-flex items-center gap-2 px-8 py-4 bg-background-card text-text-primary rounded-lg
                  hover:bg-background-card/80 transition-colors duration-200 font-semibold text-lg
                  border border-border"
              >
                {t('facilitatorPage.cta.discord')}
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default FacilitatorPage;