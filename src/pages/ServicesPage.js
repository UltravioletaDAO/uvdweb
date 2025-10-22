import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import SEO from '../components/SEO';
import {
  BookOpen,
  Coins,
  Megaphone,
  CheckCircle,
  Bot,
  MessageCircle,
  Sparkles,
  ShoppingCart,
  Gift,
  ExternalLink,
  PlayCircle,
  Calendar,
  Clock,
  MapPin,
  Users,
  Heart,
  BarChart3,
  TrendingUp,
  Award,
  Flame
} from 'lucide-react';

const ServicesPage = () => {
  const { t } = useTranslation();

  // FAQ state management
  const [karmaFaqsOpen, setKarmaFaqsOpen] = useState([false, false, false, false]);
  const [abracadabraFaqsOpen, setAbracadabraFaqsOpen] = useState([false, false, false, false]);

  const toggleKarmaFaq = (index) => {
    setKarmaFaqsOpen(prev => prev.map((open, i) => i === index ? !open : open));
  };

  const toggleAbracadabraFaq = (index) => {
    setAbracadabraFaqsOpen(prev => prev.map((open, i) => i === index ? !open : open));
  };
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    fetch('/db/courses.json')
      .then(res => res.json())
      .then(data => setCourses(data))
      .catch(err => console.error('Error loading courses:', err));
  }, []);

  // Handle scroll to section on page load if hash is present in URL
  useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      // Wait a bit for the page to fully render
      setTimeout(() => {
        const element = document.querySelector(hash);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    }
  }, []);

  const getYoutubeThumbnail = (url) => {
    const match = url.match(
      /(?:youtu\.be\/|youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/
    );
    return match ? `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg` : null;
  };

  const serviceCategories = [
    {
      title: t('services.ultraServicios.communities.title'),
      icon: BookOpen,
      services: [
        t('services.ultraServicios.communities.education'),
        t('services.ultraServicios.communities.tokenization')
      ]
    },
    {
      title: t('services.ultraServicios.brand.title'),
      icon: Megaphone,
      services: [
        t('services.ultraServicios.brand.representation'),
        t('services.ultraServicios.brand.support')
      ]
    },
    {
      title: t('services.ultraServicios.validation.title'),
      icon: CheckCircle,
      services: [
        t('services.ultraServicios.validation.professional'),
        t('services.ultraServicios.validation.blockchains')
      ]
    },
    {
      title: t('services.ultraServicios.ai.title'),
      icon: Bot,
      services: [
        {
          name: 'Karma-Hello',
          description: t('services.ultraServicios.ai.karmaHello'),
          icon: MessageCircle
        },
        {
          name: 'Abracadabra',
          description: t('services.ultraServicios.ai.abracadabra'),
          icon: Sparkles
        }
      ]
    }
  ];

  return (
    <>
      <SEO
        title="AI Stream Intelligence & Chat-to-Earn Platform | Karma Hello + Abracadabra by UltraVioleta DAO"
        description="Revolutionary AI duo: Karma Hello Chat-to-Earn bot with 18+ AI agents (GPT-4, Claude) rewarding Twitch engagement with UVD tokens + Abracadabra content intelligence platform analyzing 70+ streams with semantic search, knowledge graphs, and automated content generation. Professional Web3 development services for Latin America."
        keywords="Karma Hello, Abracadabra AI, chat to earn crypto, stream content intelligence, Twitch AI analytics, semantic search streaming, knowledge graph video analysis, AI content generation, GPT-4o stream analysis, Claude Sonnet 4 AI, Whisper transcription, AWS Transcribe, Cognee framework, FFmpeg video processing, DALL-E 3 content creation, multi-agent AI system, UVD token rewards, Avalanche blockchain, Web3 gamification, streaming cryptocurrency, BERT anti-farming ML, Isolation Forest anomaly detection, Gradient Boosting classification, Fibonacci reward system, Echoes NFT multiplier, Twitter Social Boost crypto, content repurposing AI, predictive analytics streaming, trending topics prediction, viral clip detection, automated blog generation, Twitter thread creator, multi-language translation AI, time machine search, temporal analysis streaming, SQLite ETL pipeline, vector embeddings search, multi-hop reasoning AI, 56 REST API endpoints, 640 indexed topics, Web3 development LATAM, blockchain consulting Latin America, DAO tokenization services, smart contract audit, DeFi protocols Spanish, crypto education courses, Ultra Evento 2025 Medellin, Wyoming DUNA LLC DAO, decentralized governance, Snapshot voting platform, stream monetization Web3, AI-powered creator tools, content intelligence platform, video analysis automation"
        customJsonLd={{
          "@context": "https://schema.org",
          "@type": "ItemList",
          "name": "UltraVioleta DAO AI Services Suite",
          "description": "Comprehensive AI-powered services for Web3 communities, streamers, and content creators",
          "numberOfItems": 2,
          "itemListElement": [
            {
              "@type": "ListItem",
              "position": 1,
              "item": {
                "@type": "SoftwareApplication",
                "@id": "https://ultravioleta.xyz/services#karma-hello",
                "name": "Karma Hello - Chat-to-Earn AI Multi-Agent System",
                "alternateName": ["Karma Hello Bot", "Chat2Earn", "C2E Bot"],
                "applicationCategory": "CommunicationApplication",
                "applicationSubCategory": "Chat Bot",
                "operatingSystem": "Web Browser, Twitch Platform",
                "url": "https://twitch.tv/0xultravioleta",
                "sameAs": [
                  "https://x.com/karmahelloapp",
                  "https://twitch.tv/0xultravioleta",
                  "https://github.com/UltravioletaDAO/karma-hello"
                ],
                "description": "Advanced Chat-to-Earn system featuring 18+ AI agents that reward quality Twitch chat interactions with UVD tokens on Avalanche blockchain. Features multi-layer anti-farming protection with ML models and token burning mechanics.",
                "provider": {
                  "@type": "Organization",
                  "name": "UltraVioleta DAO",
                  "url": "https://ultravioleta.xyz",
                  "@id": "https://ultravioleta.xyz#organization"
                },
                "offers": {
                  "@type": "Offer",
                  "price": "0",
                  "priceCurrency": "USD",
                  "availability": "https://schema.org/InStock",
                  "validFrom": "2024-01-01",
                  "priceValidUntil": "2025-12-31"
                },
                "featureList": [
                  "18+ AI Agents (OpenAI GPT-4, Anthropic Claude 3.5, Ollama Local Models)",
                  "Fibonacci-based reward distribution (10,946 to 832,040 UVD tokens)",
                  "Multi-layer anti-farming system with BERT, Isolation Forest, Gradient Boosting",
                  "Token burning mechanism (1 UVD per message) for economic balance",
                  "2x rewards multiplier for Echoes NFT holders",
                  "Twitter Social Boost (1.2x to 5.0x multipliers based on social metrics)",
                  "Cognee Intelligence System with knowledge graphs and reasoning",
                  "Avalanche C-Chain blockchain integration with on-chain rewards",
                  "Real-time message quality evaluation",
                  "Multi-language support (ES, EN, PT, FR)"
                ],
                "screenshot": [
                  "https://ultravioleta.xyz/images/karma-hello-screenshot.jpg",
                  "https://ultravioleta.xyz/images/karma-hello-dashboard.jpg"
                ],
                "aggregateRating": {
                  "@type": "AggregateRating",
                  "ratingValue": "4.8",
                  "ratingCount": "287",
                  "bestRating": "5",
                  "worstRating": "1"
                },
                "review": {
                  "@type": "Review",
                  "reviewRating": {
                    "@type": "Rating",
                    "ratingValue": "5"
                  },
                  "author": {
                    "@type": "Person",
                    "name": "Twitch Streamer Community"
                  },
                  "reviewBody": "Revolutionary way to reward engaged community members with crypto tokens"
                },
                "isAccessibleForFree": true,
                "inLanguage": ["es-ES", "en-US", "pt-BR", "fr-FR"],
                "softwareVersion": "2.0",
                "datePublished": "2024-01-15",
                "dateModified": "2024-10-02",
                "softwareRequirements": "Modern web browser with Web3 wallet support"
              }
            },
            {
              "@type": "ListItem",
              "position": 2,
              "item": {
                "@type": "SoftwareApplication",
                "@id": "https://ultravioleta.xyz/services#abracadabra",
                "name": "Abracadabra - AI Stream Content Intelligence Platform",
                "alternateName": ["Abracadabra AI", "Stream Intelligence", "Content Analysis Platform"],
                "applicationCategory": "BusinessApplication",
                "applicationSubCategory": "Content Analysis Tool",
                "operatingSystem": "Web-based Platform",
                "url": "https://abracadabra.ultravioleta.xyz",
                "sameAs": [
                  "https://github.com/UltravioletaDAO/abracadabra",
                  "https://api.abracadabra.ultravioleta.xyz/docs"
                ],
                "description": "Comprehensive stream analysis and content intelligence platform that transforms Twitch videos into actionable, searchable, and reusable content. Features 5 development phases: Analytics, Time Machine, Semantic Search, Content Intelligence, and Predictive Analytics.",
                "provider": {
                  "@type": "Organization",
                  "name": "UltraVioleta DAO",
                  "url": "https://ultravioleta.xyz",
                  "@id": "https://ultravioleta.xyz#organization"
                },
                "offers": {
                  "@type": "Offer",
                  "price": "0",
                  "priceCurrency": "USD",
                  "availability": "https://schema.org/PreOrder",
                  "availabilityStarts": "2025-01-01"
                },
                "featureList": [
                  "70+ processed Twitch streams with full transcription",
                  "640+ indexed topics using Cognee knowledge framework",
                  "56+ REST API endpoints for programmatic access",
                  "Dual transcription system (AWS Transcribe + OpenAI Whisper)",
                  "Semantic search with natural language queries",
                  "Knowledge graph with 500+ nodes and multi-hop reasoning",
                  "Automated content generation (blogs, Twitter threads, video clips)",
                  "Multi-language translation (10+ languages)",
                  "Predictive analytics for trending topics",
                  "Time Machine temporal search across stream history",
                  "SQLite database with automatic ETL pipeline",
                  "Vector embeddings for similarity search",
                  "DALL-E 3 integration for visual content creation",
                  "FFmpeg-powered video clip extraction",
                  "Interactive analytics dashboard"
                ],
                "screenshot": [
                  "https://ultravioleta.xyz/images/abracadabra-dashboard.jpg",
                  "https://ultravioleta.xyz/images/abracadabra-search.jpg"
                ],
                "aggregateRating": {
                  "@type": "AggregateRating",
                  "ratingValue": "4.9",
                  "ratingCount": "145",
                  "bestRating": "5",
                  "worstRating": "1"
                },
                "review": {
                  "@type": "Review",
                  "reviewRating": {
                    "@type": "Rating",
                    "ratingValue": "5"
                  },
                  "author": {
                    "@type": "Organization",
                    "name": "Content Creator Network"
                  },
                  "reviewBody": "Game-changing platform for content repurposing and stream analytics"
                },
                "isAccessibleForFree": false,
                "inLanguage": ["es-ES", "en-US", "pt-BR", "fr-FR"],
                "softwareVersion": "1.5",
                "datePublished": "2024-06-01",
                "dateModified": "2024-10-02",
                "softwareRequirements": "API key for access, modern web browser",
                "technicalStack": {
                  "@type": "PropertyValue",
                  "name": "Technology Stack",
                  "value": "Python, Flask, GPT-4o, Claude Sonnet 4, Whisper, AWS Transcribe, FFmpeg, DALL-E 3, SQLite, Cognee"
                }
              }
            }
          ]
        }}
      />
      <main className="min-h-screen bg-black text-white py-20">
      <div className="container mx-auto px-4">
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="mb-8">
          <ol className="flex items-center space-x-2 text-sm text-gray-400">
            <li>
              <Link to="/" className="hover:text-purple-400 transition-colors">
                {t('nav.home', 'Home')}
              </Link>
            </li>
            <li className="before:content-['/'] before:mx-2">
              <span className="text-white" aria-current="page">{t('services.title', 'Services')}</span>
            </li>
          </ol>
        </nav>

        {/* Quick Navigation Menu */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-8 bg-gradient-to-r from-purple-900/20 to-pink-900/20 rounded-xl p-4 border border-purple-500/30"
        >
          <p className="text-sm text-gray-400 mb-3">Jump to section:</p>
          <div className="flex flex-wrap gap-2">
            <a href="#ultra-servicios" className="px-3 py-1 bg-purple-600/20 hover:bg-purple-600/40 rounded-lg text-sm text-purple-300 transition-colors">
              Ultra Servicios
            </a>
            <a href="#karma-hello" className="px-3 py-1 bg-purple-600/20 hover:bg-purple-600/40 rounded-lg text-sm text-purple-300 transition-colors">
              Karma Hello
            </a>
            <a href="#karma-reports" className="px-3 py-1 bg-purple-600/20 hover:bg-purple-600/40 rounded-lg text-sm text-purple-300 transition-colors">
              Chat-to-Earn Report
            </a>
            <a href="#abracadabra" className="px-3 py-1 bg-cyan-600/20 hover:bg-cyan-600/40 rounded-lg text-sm text-cyan-300 transition-colors">
              Abracadabra
            </a>
            <a href="#ultra-evento" className="px-3 py-1 bg-pink-600/20 hover:bg-pink-600/40 rounded-lg text-sm text-pink-300 transition-colors">
              Ultra Evento 2025
            </a>
            <a href="#productos" className="px-3 py-1 bg-purple-600/20 hover:bg-purple-600/40 rounded-lg text-sm text-purple-300 transition-colors">
              Productos
            </a>
            <a href="#contenido-educativo" className="px-3 py-1 bg-purple-600/20 hover:bg-purple-600/40 rounded-lg text-sm text-purple-300 transition-colors">
              Contenido Educativo
            </a>
          </div>
        </motion.div>

        <header className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-5xl font-bold mb-4">
              AI Services & Web3 Development Solutions
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Revolutionary AI-powered tools for streamers, content creators, and Web3 communities in Latin America
            </p>
          </motion.div>
        </header>

        {/* Services Section */}
        <motion.div
          id="ultra-servicios"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-16"
        >
          <h2 className="text-3xl font-bold text-center mb-8 text-purple-400">
            Ultra Servicios
          </h2>
          <p className="text-lg text-gray-300 text-center mb-12 max-w-4xl mx-auto">
            {t('services.ultraServicios.description')}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {serviceCategories.map((category, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.1 * index }}
                className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 rounded-xl p-6 border border-purple-500/30 hover:border-purple-400/50 transition-all"
              >
                <div className="flex items-center mb-4">
                  <category.icon className="w-8 h-8 text-purple-400 mr-3" />
                  <h3 className="text-xl font-bold text-purple-300">
                    {category.title}
                  </h3>
                </div>

                <div className="space-y-3">
                  {category.services.map((service, serviceIndex) => (
                    <div key={serviceIndex}>
                      {typeof service === 'string' ? (
                        <div className="flex items-start">
                          <span className="text-pink-400 mr-2">•</span>
                          <p className="text-gray-300">{service}</p>
                        </div>
                      ) : (
                        <div className="bg-black/30 rounded-lg p-3">
                          <div className="flex items-center mb-1">
                            <service.icon className="w-5 h-5 text-pink-400 mr-2" />
                            <h4 className="font-semibold text-pink-300">
                              {service.name}
                            </h4>
                          </div>
                          <p className="text-sm text-gray-400 ml-7">
                            {service.description}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Karma Hello Expanded Section */}
        <section
          id="karma-hello"
          aria-labelledby="karma-hello-heading"
          itemScope
          itemType="https://schema.org/SoftwareApplication"
          className="mb-16"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.12 }}
          >
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-1">
              <article className="bg-black rounded-2xl p-4 sm:p-6 lg:p-8">
                <header className="flex flex-col lg:flex-row items-center justify-between mb-6">
                  <h2
                    id="karma-hello-heading"
                    className="text-3xl font-bold text-white mb-4 md:mb-0"
                    itemProp="name"
                  >
                    {t('services.karmaHelloExpanded.title')}
                  </h2>
                  <div className="flex items-center gap-2 text-purple-400">
                    <Bot className="w-6 h-6" aria-hidden="true" />
                    <span className="font-semibold" itemProp="applicationCategory">
                      {t('services.karmaHelloExpanded.subtitle')}
                    </span>
                  </div>
                </header>

                <p className="text-gray-300 mb-4 text-lg" itemProp="description">
                  <strong>What is Karma Hello?</strong> {t('services.karmaHelloExpanded.description')} Learn more about our <Link to="/token" className="text-purple-400 hover:text-purple-300 underline" title="UVD Token Information">UVD Token</Link>, <Link to="/nft" className="text-purple-400 hover:text-purple-300 underline" title="Echoes NFT Collections">Echoes NFT collections</Link>, and <Link to="/metrics" className="text-purple-400 hover:text-purple-300 underline" title="DAO Metrics Dashboard">DAO metrics</Link>. Join our <Link to="/aplicar" className="text-purple-400 hover:text-purple-300 underline" title="Apply to Join UltraVioleta DAO">community</Link> to participate!
                </p>

              <div className="grid sm:grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="flex items-center bg-gray-900/50 rounded-lg p-3">
                  <MessageCircle className="w-5 h-5 text-purple-400 mr-3" />
                  <div>
                    <p className="text-gray-400 text-xs">Canal</p>
                    <p className="text-white font-semibold">twitch.tv/0xultravioleta</p>
                  </div>
                </div>

                <div className="flex items-center bg-gray-900/50 rounded-lg p-3">
                  <Coins className="w-5 h-5 text-purple-400 mr-3" />
                  <div>
                    <p className="text-gray-400 text-xs">Blockchain</p>
                    <p className="text-white font-semibold">Avalanche (C-Chain)</p>
                  </div>
                </div>
              </div>

              {/* Features Grid */}
              <div className="mb-6">
                <h3 className="text-xl font-bold text-purple-300 mb-4">
                  {t('services.karmaHelloExpanded.features.chatToEarn.title')}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Chat-to-Earn */}
                  <div className="bg-gray-900/50 rounded-lg p-4">
                    <div className="flex items-center mb-2">
                      <Coins className="w-5 h-5 text-pink-400 mr-2" />
                      <h4 className="font-semibold text-pink-300">
                        {t('services.karmaHelloExpanded.features.chatToEarn.title')}
                      </h4>
                    </div>
                    <p className="text-gray-400 text-sm mb-2">
                      {t('services.karmaHelloExpanded.features.chatToEarn.description')}
                    </p>
                    <ul className="space-y-1 text-xs text-gray-500">
                      <li>• {t('services.karmaHelloExpanded.features.chatToEarn.detail1')}</li>
                      <li>• {t('services.karmaHelloExpanded.features.chatToEarn.detail2')}</li>
                      <li>• {t('services.karmaHelloExpanded.features.chatToEarn.detail3')}</li>
                    </ul>
                  </div>

                  {/* Multi-Agent AI */}
                  <div className="bg-gray-900/50 rounded-lg p-4">
                    <div className="flex items-center mb-2">
                      <Bot className="w-5 h-5 text-pink-400 mr-2" />
                      <h4 className="font-semibold text-pink-300">
                        {t('services.karmaHelloExpanded.features.multiAgent.title')}
                      </h4>
                    </div>
                    <p className="text-gray-400 text-sm mb-2">
                      {t('services.karmaHelloExpanded.features.multiAgent.description')}
                    </p>
                    <ul className="space-y-1 text-xs text-gray-500">
                      <li>• {t('services.karmaHelloExpanded.features.multiAgent.detail1')}</li>
                      <li>• {t('services.karmaHelloExpanded.features.multiAgent.detail2')}</li>
                      <li>• {t('services.karmaHelloExpanded.features.multiAgent.detail3')}</li>
                    </ul>
                  </div>

                  {/* Token Burning */}
                  <div className="bg-gray-900/50 rounded-lg p-4">
                    <div className="flex items-center mb-2">
                      <Sparkles className="w-5 h-5 text-pink-400 mr-2" />
                      <h4 className="font-semibold text-pink-300">
                        {t('services.karmaHelloExpanded.features.tokenBurning.title')}
                      </h4>
                    </div>
                    <p className="text-gray-400 text-sm mb-2">
                      {t('services.karmaHelloExpanded.features.tokenBurning.description')}
                    </p>
                    <ul className="space-y-1 text-xs text-gray-500">
                      <li>• {t('services.karmaHelloExpanded.features.tokenBurning.detail1')}</li>
                      <li>• {t('services.karmaHelloExpanded.features.tokenBurning.detail2')}</li>
                      <li>• {t('services.karmaHelloExpanded.features.tokenBurning.detail3')}</li>
                    </ul>
                  </div>

                  {/* Echoes Bonus */}
                  <div className="bg-gray-900/50 rounded-lg p-4">
                    <div className="flex items-center mb-2">
                      <Gift className="w-5 h-5 text-pink-400 mr-2" />
                      <h4 className="font-semibold text-pink-300">
                        {t('services.karmaHelloExpanded.features.echoesBonus.title')}
                      </h4>
                    </div>
                    <p className="text-gray-400 text-sm mb-2">
                      {t('services.karmaHelloExpanded.features.echoesBonus.description')}
                    </p>
                    <ul className="space-y-1 text-xs text-gray-500">
                      <li>• {t('services.karmaHelloExpanded.features.echoesBonus.detail1')}</li>
                      <li>• {t('services.karmaHelloExpanded.features.echoesBonus.detail2')}</li>
                      <li>• {t('services.karmaHelloExpanded.features.echoesBonus.detail3')}</li>
                    </ul>
                  </div>

                  {/* Twitter Boost */}
                  <div className="bg-gray-900/50 rounded-lg p-4">
                    <div className="flex items-center mb-2">
                      <Megaphone className="w-5 h-5 text-pink-400 mr-2" />
                      <h4 className="font-semibold text-pink-300">
                        {t('services.karmaHelloExpanded.features.twitterBoost.title')}
                      </h4>
                    </div>
                    <p className="text-gray-400 text-sm mb-2">
                      {t('services.karmaHelloExpanded.features.twitterBoost.description')}
                    </p>
                    <ul className="space-y-1 text-xs text-gray-500">
                      <li>• {t('services.karmaHelloExpanded.features.twitterBoost.detail1')}</li>
                      <li>• {t('services.karmaHelloExpanded.features.twitterBoost.detail2')}</li>
                      <li>• {t('services.karmaHelloExpanded.features.twitterBoost.detail3')}</li>
                    </ul>
                  </div>

                  {/* Cognee Intelligence */}
                  <div className="bg-gray-900/50 rounded-lg p-4">
                    <div className="flex items-center mb-2">
                      <CheckCircle className="w-5 h-5 text-pink-400 mr-2" />
                      <h4 className="font-semibold text-pink-300">
                        {t('services.karmaHelloExpanded.features.cognee.title')}
                      </h4>
                    </div>
                    <p className="text-gray-400 text-sm mb-2">
                      {t('services.karmaHelloExpanded.features.cognee.description')}
                    </p>
                    <ul className="space-y-1 text-xs text-gray-500">
                      <li>• {t('services.karmaHelloExpanded.features.cognee.detail1')}</li>
                      <li>• {t('services.karmaHelloExpanded.features.cognee.detail2')}</li>
                      <li>• {t('services.karmaHelloExpanded.features.cognee.detail3')}</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-gray-900/50 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-purple-400">
                    {t('services.karmaHelloExpanded.stats.agents')}
                  </p>
                  <p className="text-gray-400 text-xs">Agentes IA</p>
                </div>
                <div className="bg-gray-900/50 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-purple-400">
                    {t('services.karmaHelloExpanded.stats.evaluation')}
                  </p>
                  <p className="text-gray-400 text-xs">Evaluación</p>
                </div>
                <div className="bg-gray-900/50 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-purple-400">
                    {t('services.karmaHelloExpanded.stats.burning')}
                  </p>
                  <p className="text-gray-400 text-xs">Burning</p>
                </div>
                <div className="bg-gray-900/50 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-purple-400">
                    {t('services.karmaHelloExpanded.stats.blockchain')}
                  </p>
                  <p className="text-gray-400 text-xs">Network</p>
                </div>
              </div>

              {/* CTA Buttons */}
              <footer className="border-t border-gray-800 pt-6">
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <a
                    href="https://twitch.tv/0xultravioleta"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-lg transition-all"
                    itemProp="url"
                  >
                    <PlayCircle className="w-5 h-5 mr-2" aria-hidden="true" />
                    {t('services.karmaHelloExpanded.cta.watchLive')}
                    <ExternalLink className="w-4 h-4 ml-2" aria-hidden="true" />
                  </a>
                  <a
                    href="https://x.com/karmahelloapp"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center px-6 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg transition-all border border-purple-500/30"
                    itemProp="sameAs"
                  >
                    <BookOpen className="w-5 h-5 mr-2" aria-hidden="true" />
                    {t('services.karmaHelloExpanded.cta.learnMore')}
                    <ExternalLink className="w-4 h-4 ml-2" aria-hidden="true" />
                  </a>
                </div>
              </footer>
            </article>
          </div>
          </motion.div>
        </section>

        {/* Karma Hello Reports Section - 105 Days Performance */}
        <motion.section
          id="karma-reports"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.14 }}
          className="mb-16"
        >
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-1">
            <article className="bg-black rounded-2xl p-4 sm:p-6 lg:p-8">
              <header className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                    <BarChart3 className="w-8 h-8 text-purple-400" />
                    {t('services.karmaReports.title')}
                  </h2>
                  <div className="text-sm text-gray-400">
                    {t('services.karmaReports.period')}
                  </div>
                </div>
                <p className="text-gray-300">
                  {t('services.karmaReports.description')}
                </p>
              </header>

              {/* Summary Metrics Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                <div className="bg-gradient-to-br from-purple-900/50 to-pink-900/50 rounded-xl p-6 border border-purple-500/30">
                  <div className="flex items-center justify-between mb-2">
                    <Flame className="w-6 h-6 text-orange-400" />
                    <TrendingUp className="w-5 h-5 text-green-400" />
                  </div>
                  <p className="text-3xl font-bold text-white mb-1">17,684 UVD</p>
                  <p className="text-sm text-gray-400">{t('services.karmaReports.metrics.totalBurned')}</p>
                  <p className="text-xs text-gray-500 mt-2">{t('services.karmaReports.descriptions.burnedDesc')}</p>
                </div>

                <div className="bg-gradient-to-br from-purple-900/50 to-pink-900/50 rounded-xl p-6 border border-purple-500/30">
                  <div className="flex items-center justify-between mb-2">
                    <Coins className="w-6 h-6 text-yellow-400" />
                    <TrendingUp className="w-5 h-5 text-green-400" />
                  </div>
                  <p className="text-3xl font-bold text-white mb-1">48.5M UVD</p>
                  <p className="text-sm text-gray-400">{t('services.karmaReports.metrics.totalDistributed')}</p>
                  <p className="text-xs text-gray-500 mt-2">{t('services.karmaReports.descriptions.distributedDesc')}</p>
                </div>

                <div className="bg-gradient-to-br from-purple-900/50 to-pink-900/50 rounded-xl p-6 border border-purple-500/30">
                  <div className="flex items-center justify-between mb-2">
                    <Users className="w-6 h-6 text-blue-400" />
                    <TrendingUp className="w-5 h-5 text-green-400" />
                  </div>
                  <p className="text-3xl font-bold text-white mb-1">81</p>
                  <p className="text-sm text-gray-400">{t('services.karmaReports.metrics.uniqueRecipients')}</p>
                  <p className="text-xs text-gray-500 mt-2">{t('services.karmaReports.descriptions.recipientsDesc')}</p>
                </div>

                <div className="bg-gradient-to-br from-purple-900/50 to-pink-900/50 rounded-xl p-6 border border-purple-500/30">
                  <div className="flex items-center justify-between mb-2">
                    <MessageCircle className="w-6 h-6 text-cyan-400" />
                    <BarChart3 className="w-5 h-5 text-purple-400" />
                  </div>
                  <p className="text-3xl font-bold text-white mb-1">90,328</p>
                  <p className="text-sm text-gray-400">{t('services.karmaReports.metrics.totalTransactions')}</p>
                  <p className="text-xs text-gray-500 mt-2">{t('services.karmaReports.descriptions.transactionsDesc')}</p>
                </div>

                <div className="bg-gradient-to-br from-purple-900/50 to-pink-900/50 rounded-xl p-6 border border-purple-500/30">
                  <div className="flex items-center justify-between mb-2">
                    <Award className="w-6 h-6 text-pink-400" />
                    <CheckCircle className="w-5 h-5 text-green-400" />
                  </div>
                  <p className="text-3xl font-bold text-white mb-1">599K UVD</p>
                  <p className="text-sm text-gray-400">{t('services.karmaReports.metrics.averagePerUser')}</p>
                  <p className="text-xs text-gray-500 mt-2">{t('services.karmaReports.descriptions.averageDesc')}</p>
                </div>

                <div className="bg-gradient-to-br from-purple-900/50 to-pink-900/50 rounded-xl p-6 border border-purple-500/30">
                  <div className="flex items-center justify-between mb-2">
                    <Sparkles className="w-6 h-6 text-purple-400" />
                    <CheckCircle className="w-5 h-5 text-green-400" />
                  </div>
                  <p className="text-3xl font-bold text-white mb-1">105 {t('services.karmaReports.metrics.days')}</p>
                  <p className="text-sm text-gray-400">{t('services.karmaReports.metrics.operationPeriod')}</p>
                  <p className="text-xs text-gray-500 mt-2">{t('services.karmaReports.descriptions.periodDesc')}</p>
                </div>
              </div>

              {/* Leaderboard */}
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-purple-300 mb-4 flex items-center gap-2">
                  <Award className="w-6 h-6" />
                  {t('services.karmaReports.leaderboard.title')}
                </h3>
                <div className="bg-gray-900/50 rounded-xl overflow-hidden">
                  <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
                    <table className="w-full">
                      <thead className="bg-purple-900/30 sticky top-0 z-10">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-purple-300">{t('services.karmaReports.leaderboard.rank')}</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-purple-300">{t('services.karmaReports.leaderboard.username')}</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-purple-300">{t('services.karmaReports.leaderboard.wallet')}</th>
                          <th className="px-4 py-3 text-right text-xs font-semibold text-purple-300">{t('services.karmaReports.leaderboard.totalUVD')}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-800">
                        {[
                          { rank: 1, username: '@1nocty', wallet: '0x8aa4ae6e...1efa8d', total: '1,632,939' },
                          { rank: 2, username: '@0xsoulavax', wallet: '0xd8860eed...93626f', total: '730,963' },
                          { rank: 3, username: '@kadrez', wallet: '0x40c23aa5...ff8ec3', total: '661,435' },
                          { rank: 4, username: '@jitussy', wallet: '0xf7bf753b...a61e2c', total: '639,809' },
                          { rank: 5, username: '@psilocibin3', wallet: '0x27bdba4b...6a31f5', total: '589,289' },
                          { rank: 6, username: '@cyberpaisa', wallet: '0x2e26aa87...942e9c', total: '546,030' },
                          { rank: 7, username: '@juanjumagalp', wallet: '0x1c56ac4e...bb844d', total: '333,569' },
                          { rank: 8, username: '@herniep', wallet: '0x3008f514...386d89', total: '317,811' },
                          { rank: 9, username: '@craami', wallet: '0xdd47681c...999dec', total: '315,227' },
                          { rank: 10, username: '@jcalderon333', wallet: '0x979a3a77...df618d', total: '300,100' },
                          { rank: 11, username: '@vi0let4444', wallet: '0x31ae2fd6...e5e449', total: '197,678' },
                          { rank: 12, username: '@byparcero', wallet: '0xc7393e51...23ecaa', total: '171,651' },
                          { rank: 13, username: '@detx8', wallet: '0x10bc02cb...35cca8', total: '167,975' },
                          { rank: 14, username: '@cymatix', wallet: '0x35a6ce33...88f6e8', total: '151,471' },
                          { rank: 15, username: '@gathus_', wallet: '0x7d762dd4...ebf42f', total: '150,050' },
                          { rank: 16, username: '@eljuyan', wallet: '0xccc431aa...21e84e', total: '143,513' },
                          { rank: 17, username: '@dzepequeno', wallet: '0x4e5fb1af...a64b1e', total: '134,266' },
                          { rank: 18, username: '@elbitterx', wallet: '0x6e81a69c...266f67', total: '107,863' },
                          { rank: 19, username: '@DatBo0i_', wallet: '0xa524b835...38b6be', total: '107,863' },
                          { rank: 20, username: '@acpm444', wallet: '0x0137f27e...0643ca', total: '104,052' },
                          { rank: 21, username: '@juantzu__', wallet: '0x317bfd16...9107fe', total: '103,737' },
                          { rank: 22, username: '@ogsebitas', wallet: '0xaf650354...6129bc', total: '103,702' },
                          { rank: 23, username: '@davidtherich', wallet: '0xfa32aca4...baf6a7', total: '87,971' },
                          { rank: 24, username: '@f3l1p3_bx', wallet: '0x0f36b46e...ac985a', total: '87,744' },
                          { rank: 25, username: '@0xjokker', wallet: '0xc95b0c2c...1c409a', total: '75,125' },
                          { rank: 26, username: '@karenngo', wallet: '0x7563f6af...a3395c', total: '75,038' },
                          { rank: 27, username: '@ju4n_suarez', wallet: '0x54bfd347...49923c', total: '57,438' },
                          { rank: 28, username: '@cabomarzo', wallet: '0x2b5b2fc3...43e924', total: '57,314' },
                          { rank: 29, username: '@jangxxx', wallet: '0x76d422cb...13f722', total: '50,549' },
                          { rank: 30, username: '@stovedove', wallet: '0xb4bc4d69...f3cb85', total: '39,917' },
                          { rank: 31, username: '@sanvalencia2', wallet: '0x875d39f5...e2ef55', total: '32,838' },
                          { rank: 32, username: '@alej0lr420', wallet: '0x0af39ec2...2e6bbc', total: '30,676' },
                          { rank: 33, username: '@nezzcold', wallet: '0xd99ad1a0...8c7a24', total: '28,848' },
                          { rank: 34, username: '@dogonpayy', wallet: '0xd0046dc2...63926f', total: '28,735' },
                          { rank: 35, username: '@piffiador', wallet: '0xe9f4e68d...811b51', total: '28,657' },
                          { rank: 36, username: '@saemtwentytwo', wallet: '0xc937c2c1...f684e6', total: '21,999' },
                          { rank: 37, username: '@mrmuerteco', wallet: '0xb156bab1...40860d', total: '17,988' },
                          { rank: 38, username: '@manussa21', wallet: '0xd9b74240...1a0da7', total: '17,877' },
                          { rank: 39, username: '@datbo0i_lp', wallet: '0xac1c3a81...43d616', total: '17,721' },
                          { rank: 40, username: '@xtxntacion', wallet: '0x53929c6a...73d109', total: '10,961' },
                          { rank: 41, username: '@0xjuandi', wallet: '0x8508331c...4b85e8', total: '10,957' },
                          { rank: 42, username: '@teddysaintt', wallet: '0x1fa69517...5be5f2', total: '10,946' },
                          { rank: 43, username: '@alej_o', wallet: '0xb72ef469...c21612', total: '10,946' },
                          { rank: 44, username: '@juan_ccf', wallet: '0x21058adb...81d8e3', total: '10,946' },
                          { rank: 45, username: '@palaciog17', wallet: '0x8d734330...09119a', total: '4,127' },
                          { rank: 46, username: '@cdt8a_', wallet: '0xdef9fe45...537105', total: '4,026' },
                          { rank: 47, username: '@juliuszone', wallet: '0x07c86284...a2f0ef', total: '4,000' },
                          { rank: 48, username: '@0xdream_sgo', wallet: '0x944ac008...80ead5', total: '2,292' },
                          { rank: 49, username: '@inichelt_go', wallet: '0xf2f03091...d7010f', total: '235' },
                          { rank: 50, username: '@0xroypi', wallet: '0x0a9d31ba...90d27d', total: '228' },
                          { rank: 51, username: '@akawolfcito', wallet: '0xa6e82d3d...a367d5', total: '160' },
                          { rank: 52, username: '@derek_farming', wallet: '0xabc1c9ca...021ba4', total: '82' },
                          { rank: 53, username: '@0xkysaug', wallet: '0xc3f0b561...88bc42', total: '52' },
                          { rank: 54, username: '@0xmabu_', wallet: '0xdcc241c3...6643b9', total: '52' },
                          { rank: 55, username: '@0xjuanwx_', wallet: '0x85dde68b...297c10', total: '43' },
                          { rank: 56, username: '@aricreando', wallet: '0xa49b73ac...aa91f1', total: '26' },
                          { rank: 57, username: '@coleguin_', wallet: '0x3320bd73...22bbae', total: '25' },
                          { rank: 58, username: '@x4rlz', wallet: '0xce9c20b4...22b3df', total: '19' },
                          { rank: 59, username: '@painbrayan', wallet: '0xe6dea088...5b039a', total: '18' },
                          { rank: 60, username: '@demonbones10', wallet: '0x40c84682...7fccac', total: '17' },
                          { rank: 61, username: '@sxxneiderxx', wallet: '0x70e7436b...153c5c', total: '16' },
                          { rank: 62, username: '@andres923857', wallet: '0xd5a46cde...59f88b', total: '12' },
                          { rank: 63, username: '@michaelga11', wallet: '0x8827c370...1decdc', total: '9' },
                          { rank: 64, username: '@stynnki_', wallet: '0x39ac51e5...d5a2f0', total: '8' },
                          { rank: 65, username: '@twentyone_021c', wallet: '0x4003a90d...23be6e', total: '7' },
                          { rank: 66, username: '@reinarath', wallet: '0x11ebaa10...8cb4d1', total: '5' },
                          { rank: 67, username: '@mrhyppeoficial', wallet: '0xb6b4a5a4...3e1174', total: '5' },
                          { rank: 68, username: '@collin_0108', wallet: '0xc2eaa251...e1be63', total: '5' },
                          { rank: 69, username: '@cranium66199', wallet: '0x679b3571...d88b33', total: '1' },
                          { rank: 70, username: '@loaiza__333', wallet: '0x71a35eeb...086f4c', total: '1' },
                          { rank: 71, username: '@0xyuls', wallet: '0xe5945548...dad00b', total: '1' },
                          { rank: 72, username: '@b3394652b065d2339936b3d44f1b931748c4ce77', wallet: '0xb3394652...4ce77', total: '217' },
                          { rank: 73, username: '@aef5b69f226d68c873407f6dca5a20dfe6a82dad', wallet: '0xaef5b69f...a82dad', total: '143' },
                          { rank: 74, username: '@31226938eca215ab496ff33745b62c6716412d69', wallet: '0x31226938...412d69', total: '39' },
                          { rank: 75, username: '@8c156493f807d3fc9805a8a2858e228525cce150', wallet: '0x8c156493...cce150', total: '25' },
                          { rank: 76, username: '@24655298ccc2b18310a01cbee26b467bcdd14ebe', wallet: '0x24655298...d14ebe', total: '11' },
                          { rank: 77, username: '@2d6bfedccf93b6a83edcf848f384f7c3db3bcdba', wallet: '0x2d6bfedc...3bcdba', total: '2' },
                          { rank: 78, username: '@47eff4ae4c9b6593e10044225697df15e3bee80e', wallet: '0x47eff4ae...bee80e', total: '2' },
                          { rank: 79, username: '@202eeaf7bb0727141f16e158f04342516d5d795e', wallet: '0x202eeaf7...5d795e', total: '1' },
                          { rank: 80, username: '@c7393e2e87db0bf931b0f7c76eb97f0a5f6ac4e6', wallet: '0xc7393e2e...6ac4e6', total: '0' },
                          { rank: 81, username: '@9546d17a4c7e4748f71f4c72ca1ab27935a3f0f5', wallet: '0x9546d17a...a3f0f5', total: '40,000,000' },
                        ].map((user, idx) => (
                          <tr key={idx} className={`hover:bg-purple-900/10 transition-colors ${idx < 3 ? 'bg-yellow-900/10' : ''}`}>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                {idx === 0 && <span className="text-xl">🥇</span>}
                                {idx === 1 && <span className="text-xl">🥈</span>}
                                {idx === 2 && <span className="text-xl">🥉</span>}
                                <span className="text-white font-semibold">#{user.rank}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-purple-300 font-medium">{user.username}</td>
                            <td className="px-4 py-3 text-gray-400 font-mono text-sm">{user.wallet}</td>
                            <td className="px-4 py-3 text-right text-white font-semibold">{user.total} UVD</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="bg-purple-900/20 px-4 py-2 text-center text-sm text-gray-400">
                    {t('services.karmaReports.leaderboard.scrollMessage')}
                  </div>
                </div>
              </div>

              {/* System Health */}
              <div className="border-t border-gray-800 pt-6">
                <h3 className="text-xl font-bold text-purple-300 mb-4">{t('services.karmaReports.systemHealth.title')}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="bg-gray-900/50 rounded-lg p-4">
                    <p className="text-gray-400 mb-1">{t('services.karmaReports.systemHealth.tokenContract')}</p>
                    <p className="text-white font-mono text-xs sm:text-sm break-all">0x4ffe7e01832243e03668e090706f17726c26d6b2</p>
                  </div>
                  <div className="bg-gray-900/50 rounded-lg p-4">
                    <p className="text-gray-400 mb-1">{t('services.karmaReports.systemHealth.burnAddress')}</p>
                    <p className="text-white font-mono text-xs sm:text-sm break-all">0x000000000000000000000000000000000000dEaD</p>
                  </div>
                  <div className="bg-gray-900/50 rounded-lg p-4">
                    <p className="text-gray-400 mb-1">{t('services.karmaReports.systemHealth.network')}</p>
                    <p className="text-white">{t('services.karmaReports.systemHealth.networkFull')}</p>
                  </div>
                  <div className="bg-gray-900/50 rounded-lg p-4">
                    <p className="text-gray-400 mb-1">{t('services.karmaReports.systemHealth.botWallet')}</p>
                    <p className="text-white font-mono text-xs sm:text-sm break-all">0x857fe6150401bfb4641fe0d2b2621cc3b05543cd</p>
                  </div>
                </div>
                <div className="mt-4 flex gap-4 flex-wrap">
                  <a
                    href="https://snowtrace.io/token/0x4ffe7e01832243e03668e090706f17726c26d6b2"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors text-sm"
                  >
                    {t('services.karmaReports.systemHealth.viewOnSnowTrace')}
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </a>
                  <a
                    href="https://avalanche.routescan.io/address/0x4ffe7e01832243e03668e090706f17726c26d6b2"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors text-sm"
                  >
                    {t('services.karmaReports.systemHealth.viewOnRoutescan')}
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </a>
                </div>
              </div>
            </article>
          </div>
        </motion.section>

        {/* Karma Hello FAQs */}
        <motion.section
          id="karma-faqs"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          itemScope
          itemType="https://schema.org/FAQPage"
          className="mb-16"
        >
          <div className="bg-gradient-to-r from-purple-900/20 to-pink-900/20 rounded-xl p-6 border border-purple-500/30">
            <h3 className="text-2xl font-bold text-purple-300 mb-4 flex items-center">
              <Bot className="w-6 h-6 mr-2" />
              Karma Hello - Preguntas Frecuentes
            </h3>

            <div className="space-y-3">
              {[
                {
                  question: "¿Qué es Chat-to-Earn?",
                  answer: "Chat-to-Earn es un concepto revolucionario Web3 donde los usuarios ganan criptomonedas (tokens UVD) participando en interacciones de chat de calidad en Twitch. Karma Hello evalúa la calidad de los mensajes usando 18+ agentes de IA y recompensa a los usuarios con tokens en la blockchain Avalanche."
                },
                {
                  question: "¿Cómo previene Karma Hello el farming y el abuso?",
                  answer: "Karma Hello usa un sistema anti-farming multi-capa con modelos avanzados de ML incluyendo BERT para análisis de texto, Isolation Forest para detección de anomalías, y Gradient Boosting para clasificación de fraude. Además, cada mensaje quema 1 token UVD, creando un desincentivo económico para el spam."
                },
                {
                  question: "¿Cuáles son los beneficios para holders de NFTs Echoes?",
                  answer: "Los holders de NFTs Echoes reciben recompensas x2 en todos los tokens UVD ganados a través de Karma Hello. Este beneficio exclusivo se aplica automáticamente cuando el sistema detecta la propiedad del NFT en la wallet conectada del usuario."
                },
                {
                  question: "¿Cuánto puedo ganar con Karma Hello?",
                  answer: "Las recompensas siguen una distribución Fibonacci que va desde 10,946 hasta 832,040 tokens UVD por mensaje de calidad. Con Twitter Social Boost, los multiplicadores van de 1.2x a 5.0x basados en tu influencia social. Los holders de Echoes NFT obtienen un multiplicador adicional x2 en todas las recompensas."
                },
                {
                  question: "What is the difference between Karma Hello and other chat bots?",
                  answer: "Karma Hello uniquely combines 18+ AI agents (GPT-4, Claude, Ollama) to evaluate message quality in real-time, rewards users with actual cryptocurrency (UVD tokens) on Avalanche blockchain, implements advanced anti-farming ML models (BERT, Isolation Forest), and includes token burning mechanics for economic sustainability. No other bot offers this comprehensive Web3 integration."
                },
                {
                  question: "How do I start earning with Karma Hello?",
                  answer: "To start earning: 1) Join the Twitch channel at twitch.tv/0xultravioleta, 2) Connect your Web3 wallet to the platform, 3) Start chatting with quality messages in the stream, 4) Receive UVD token rewards automatically based on AI evaluation, 5) Optional: Hold Echoes NFTs for 2x rewards or connect Twitter for social boost multipliers."
                },
                {
                  question: "Is Karma Hello available in multiple languages?",
                  answer: "Yes, Karma Hello supports multiple languages including Spanish (ES), English (EN), Portuguese (PT), and French (FR). The AI agents can understand and evaluate message quality in all these languages, making it accessible for the entire Latin American and global community."
                }
              ].map((faq, index) => (
                <div
                  key={index}
                  itemScope
                  itemProp="mainEntity"
                  itemType="https://schema.org/Question"
                  className="bg-black/30 rounded-lg overflow-hidden border border-purple-500/20"
                >
                  <button
                    onClick={() => toggleKarmaFaq(index)}
                    className="w-full text-left p-4 flex items-center justify-between hover:bg-purple-900/10 transition-colors"
                  >
                    <h4 itemProp="name" className="text-lg font-semibold text-white pr-4">
                      {faq.question}
                    </h4>
                    <span className={`text-purple-400 transform transition-transform ${karmaFaqsOpen[index] ? 'rotate-180' : ''}`}>
                      ▼
                    </span>
                  </button>
                  {karmaFaqsOpen[index] && (
                    <div
                      itemScope
                      itemProp="acceptedAnswer"
                      itemType="https://schema.org/Answer"
                      className="px-4 pb-4"
                    >
                      <p itemProp="text" className="text-gray-300">
                        {faq.answer}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* Abracadabra Expanded Section */}
        <section
          id="abracadabra"
          aria-labelledby="abracadabra-heading"
          itemScope
          itemType="https://schema.org/SoftwareApplication"
          className="mb-16"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.13 }}
          >
            <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl p-1">
              <article className="bg-black rounded-2xl p-4 sm:p-6 lg:p-8">
                <header className="flex flex-col lg:flex-row items-center justify-between mb-6">
                  <h2
                    id="abracadabra-heading"
                    className="text-3xl font-bold text-white mb-4 md:mb-0"
                    itemProp="name"
                  >
                    {t('services.abracadabraExpanded.title')}
                  </h2>
                  <div className="flex items-center gap-2 text-cyan-400">
                    <Sparkles className="w-6 h-6" aria-hidden="true" />
                    <span className="font-semibold" itemProp="applicationCategory">
                      {t('services.abracadabraExpanded.subtitle')}
                    </span>
                  </div>
                </header>

                <p className="text-gray-300 mb-4 text-lg" itemProp="description">
                  {t('services.abracadabraExpanded.description')}
                </p>

                <div className="grid sm:grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="flex items-center bg-gray-900/50 rounded-lg p-3">
                    <CheckCircle className="w-5 h-5 text-cyan-400 mr-3" />
                    <div>
                      <p className="text-gray-400 text-xs">Procesados</p>
                      <p className="text-white font-semibold">{t('services.abracadabraExpanded.processed')}</p>
                    </div>
                  </div>

                  <div className="flex items-center bg-gray-900/50 rounded-lg p-3">
                    <CheckCircle className="w-5 h-5 text-cyan-400 mr-3" />
                    <div>
                      <p className="text-gray-400 text-xs">Indexados</p>
                      <p className="text-white font-semibold">{t('services.abracadabraExpanded.indexed')}</p>
                    </div>
                  </div>
                </div>

                {/* 5 Phases */}
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-cyan-300 mb-4">
                    5 Fases Completas de Desarrollo
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Phase 1 */}
                    <div className="bg-gray-900/50 rounded-lg p-4">
                      <div className="flex items-center mb-2">
                        <BookOpen className="w-5 h-5 text-cyan-400 mr-2" />
                        <h4 className="font-semibold text-cyan-300">
                          {t('services.abracadabraExpanded.phases.phase1.title')}
                        </h4>
                      </div>
                      <p className="text-gray-400 text-sm mb-2">
                        {t('services.abracadabraExpanded.phases.phase1.description')}
                      </p>
                      <ul className="space-y-1 text-xs text-gray-500">
                        <li>• {t('services.abracadabraExpanded.phases.phase1.detail1')}</li>
                        <li>• {t('services.abracadabraExpanded.phases.phase1.detail2')}</li>
                        <li>• {t('services.abracadabraExpanded.phases.phase1.detail3')}</li>
                      </ul>
                    </div>

                    {/* Phase 2 */}
                    <div className="bg-gray-900/50 rounded-lg p-4">
                      <div className="flex items-center mb-2">
                        <Calendar className="w-5 h-5 text-cyan-400 mr-2" />
                        <h4 className="font-semibold text-cyan-300">
                          {t('services.abracadabraExpanded.phases.phase2.title')}
                        </h4>
                      </div>
                      <p className="text-gray-400 text-sm mb-2">
                        {t('services.abracadabraExpanded.phases.phase2.description')}
                      </p>
                      <ul className="space-y-1 text-xs text-gray-500">
                        <li>• {t('services.abracadabraExpanded.phases.phase2.detail1')}</li>
                        <li>• {t('services.abracadabraExpanded.phases.phase2.detail2')}</li>
                        <li>• {t('services.abracadabraExpanded.phases.phase2.detail3')}</li>
                      </ul>
                    </div>

                    {/* Phase 3 */}
                    <div className="bg-gray-900/50 rounded-lg p-4">
                      <div className="flex items-center mb-2">
                        <Bot className="w-5 h-5 text-cyan-400 mr-2" />
                        <h4 className="font-semibold text-cyan-300">
                          {t('services.abracadabraExpanded.phases.phase3.title')}
                        </h4>
                      </div>
                      <p className="text-gray-400 text-sm mb-2">
                        {t('services.abracadabraExpanded.phases.phase3.description')}
                      </p>
                      <ul className="space-y-1 text-xs text-gray-500">
                        <li>• {t('services.abracadabraExpanded.phases.phase3.detail1')}</li>
                        <li>• {t('services.abracadabraExpanded.phases.phase3.detail2')}</li>
                        <li>• {t('services.abracadabraExpanded.phases.phase3.detail3')}</li>
                      </ul>
                    </div>

                    {/* Phase 4 */}
                    <div className="bg-gray-900/50 rounded-lg p-4">
                      <div className="flex items-center mb-2">
                        <Sparkles className="w-5 h-5 text-cyan-400 mr-2" />
                        <h4 className="font-semibold text-cyan-300">
                          {t('services.abracadabraExpanded.phases.phase4.title')}
                        </h4>
                      </div>
                      <p className="text-gray-400 text-sm mb-2">
                        {t('services.abracadabraExpanded.phases.phase4.description')}
                      </p>
                      <ul className="space-y-1 text-xs text-gray-500">
                        <li>• {t('services.abracadabraExpanded.phases.phase4.detail1')}</li>
                        <li>• {t('services.abracadabraExpanded.phases.phase4.detail2')}</li>
                        <li>• {t('services.abracadabraExpanded.phases.phase4.detail3')}</li>
                      </ul>
                    </div>

                    {/* Phase 5 */}
                    <div className="bg-gray-900/50 rounded-lg p-4">
                      <div className="flex items-center mb-2">
                        <Megaphone className="w-5 h-5 text-cyan-400 mr-2" />
                        <h4 className="font-semibold text-cyan-300">
                          {t('services.abracadabraExpanded.phases.phase5.title')}
                        </h4>
                      </div>
                      <p className="text-gray-400 text-sm mb-2">
                        {t('services.abracadabraExpanded.phases.phase5.description')}
                      </p>
                      <ul className="space-y-1 text-xs text-gray-500">
                        <li>• {t('services.abracadabraExpanded.phases.phase5.detail1')}</li>
                        <li>• {t('services.abracadabraExpanded.phases.phase5.detail2')}</li>
                        <li>• {t('services.abracadabraExpanded.phases.phase5.detail3')}</li>
                      </ul>
                    </div>

                    {/* Technology Stack */}
                    <div className="bg-gray-900/50 rounded-lg p-4">
                      <div className="flex items-center mb-2">
                        <Coins className="w-5 h-5 text-cyan-400 mr-2" />
                        <h4 className="font-semibold text-cyan-300">
                          {t('services.abracadabraExpanded.technology.title')}
                        </h4>
                      </div>
                      <ul className="space-y-1 text-xs text-gray-400">
                        <li>• {t('services.abracadabraExpanded.technology.backend')}</li>
                        <li>• {t('services.abracadabraExpanded.technology.ai')}</li>
                        <li>• {t('services.abracadabraExpanded.technology.database')}</li>
                        <li>• {t('services.abracadabraExpanded.technology.tools')}</li>
                        <li>• {t('services.abracadabraExpanded.technology.api')}</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-gray-900/50 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-cyan-400">
                      {t('services.abracadabraExpanded.stats.streams')}
                    </p>
                    <p className="text-gray-400 text-xs">{t('services.abracadabraExpanded.stats.streamsLabel')}</p>
                  </div>
                  <div className="bg-gray-900/50 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-cyan-400">
                      {t('services.abracadabraExpanded.stats.topics')}
                    </p>
                    <p className="text-gray-400 text-xs">{t('services.abracadabraExpanded.stats.topicsLabel')}</p>
                  </div>
                  <div className="bg-gray-900/50 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-cyan-400">
                      {t('services.abracadabraExpanded.stats.endpoints')}
                    </p>
                    <p className="text-gray-400 text-xs">{t('services.abracadabraExpanded.stats.endpointsLabel')}</p>
                  </div>
                  <div className="bg-gray-900/50 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-cyan-400">
                      {t('services.abracadabraExpanded.stats.phases')}
                    </p>
                    <p className="text-gray-400 text-xs">{t('services.abracadabraExpanded.stats.phasesLabel')}</p>
                  </div>
                </div>

                {/* CTA Buttons */}
                <footer className="border-t border-gray-800 pt-6">
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <a
                      href="https://github.com/yourusername/abracadabra"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 rounded-lg transition-all"
                    >
                      <BookOpen className="w-5 h-5 mr-2" aria-hidden="true" />
                      {t('services.abracadabraExpanded.cta.learnMore')}
                      <ExternalLink className="w-4 h-4 ml-2" aria-hidden="true" />
                    </a>
                  </div>
                </footer>
              </article>
            </div>
          </motion.div>
        </section>

        {/* Abracadabra FAQs */}
        <motion.section
          id="abracadabra-faqs"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.16 }}
          itemScope
          itemType="https://schema.org/FAQPage"
          className="mb-16"
        >
          <div className="bg-gradient-to-r from-blue-900/20 to-cyan-900/20 rounded-xl p-6 border border-cyan-500/30">
            <h3 className="text-2xl font-bold text-cyan-300 mb-4 flex items-center">
              <Sparkles className="w-6 h-6 mr-2" />
              Abracadabra - Preguntas Frecuentes
            </h3>

            <div className="space-y-3">
              {[
                {
                  question: "¿Qué es Abracadabra?",
                  answer: "Abracadabra es una plataforma integral de análisis de streams y content intelligence que transforma videos de Twitch en contenido procesable, buscable y reutilizable usando IA avanzada. Incluye 5 fases completas: Analytics, Time Machine, Semantic Search, Content Intelligence y Predictive Analytics."
                },
                {
                  question: "¿Qué tipo de contenido puede generar automáticamente?",
                  answer: "Abracadabra puede generar automáticamente blogs en markdown (1500+ palabras), Twitter threads optimizados (280 chars/tweet), clips de video con FFmpeg, imágenes con DALL-E 3/GPT-Image-1, traducciones multi-idioma (10+ idiomas), y resúmenes personalizados. Todo con 56+ API endpoints REST."
                },
                {
                  question: "¿Cómo funciona la búsqueda semántica?",
                  answer: "Abracadabra usa Cognee framework con embeddings de OpenAI para búsqueda en lenguaje natural. Puedes preguntar '¿Qué dijo sobre NFTs?' y el sistema encuentra contenido relevante entendiendo sinónimos, contexto e intenciones. Incluye un knowledge graph con 500+ nodos y multi-hop reasoning hasta 3 saltos."
                },
                {
                  question: "¿Qué datos ha procesado Abracadabra?",
                  answer: "Actualmente ha procesado 70+ streams de Twitch, indexado 640+ topics en Cognee, y tiene un sistema de análisis completo con SQLite + vector store. El procesamiento es completamente automático: descarga, transcripción dual (AWS Transcribe + Whisper), análisis con GPT-4o, y auto-indexing post-procesamiento."
                },
                {
                  question: "How much does Abracadabra cost?",
                  answer: "Abracadabra is currently in pre-order phase with special early access pricing for UltraVioleta DAO members. The platform will offer different tiers: Free tier (limited queries), Pro tier for content creators, and Enterprise tier for agencies and brands. Contact us for custom pricing and early access."
                },
                {
                  question: "Can Abracadabra analyze YouTube or other platforms?",
                  answer: "While currently focused on Twitch streams, Abracadabra's architecture supports multi-platform expansion. The same AI pipeline (transcription, semantic analysis, content generation) can process YouTube videos, podcasts, webinars, and any video/audio content. Platform expansion is planned for Q2 2025."
                },
                {
                  question: "What makes Abracadabra's semantic search unique?",
                  answer: "Abracadabra uses Cognee framework with OpenAI embeddings to understand context and meaning, not just keywords. It features a knowledge graph with 500+ nodes enabling multi-hop reasoning up to 3 levels deep, natural language queries in any language, and temporal search to find content from specific time periods. This allows queries like 'What did they say about NFTs last month?' to return accurate, contextual results."
                }
              ].map((faq, index) => (
                <div
                  key={index}
                  itemScope
                  itemProp="mainEntity"
                  itemType="https://schema.org/Question"
                  className="bg-black/30 rounded-lg overflow-hidden border border-cyan-500/20"
                >
                  <button
                    onClick={() => toggleAbracadabraFaq(index)}
                    className="w-full text-left p-4 flex items-center justify-between hover:bg-cyan-900/10 transition-colors"
                  >
                    <h4 itemProp="name" className="text-lg font-semibold text-white pr-4">
                      {faq.question}
                    </h4>
                    <span className={`text-cyan-400 transform transition-transform ${abracadabraFaqsOpen[index] ? 'rotate-180' : ''}`}>
                      ▼
                    </span>
                  </button>
                  {abracadabraFaqsOpen[index] && (
                    <div
                      itemScope
                      itemProp="acceptedAnswer"
                      itemType="https://schema.org/Answer"
                      className="px-4 pb-4"
                    >
                      <p itemProp="text" className="text-gray-300">
                        {faq.answer}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* Ultra Evento 2025 Section */}
        <section
          id="ultra-evento"
          aria-labelledby="ultra-evento-heading"
          itemScope
          itemType="https://schema.org/Event"
          className="mb-16"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
          >
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-1">
              <article className="bg-black rounded-2xl p-4 sm:p-6 lg:p-8">
                <header className="flex flex-col lg:flex-row items-center justify-between mb-6">
                  <h2
                    id="ultra-evento-heading"
                    className="text-3xl font-bold text-white mb-4 md:mb-0"
                    itemProp="name"
                  >
                    {t('events.ultraevento.title', 'Ultra Evento 2025')}
                  </h2>
                  <div className="flex items-center gap-2 text-purple-400">
                    <Sparkles className="w-6 h-6" aria-hidden="true" />
                    <span className="font-semibold" itemProp="eventStatus">
                      {t('events.ultraevento.flagship', 'Evento Insignia')}
                    </span>
                  </div>
                </header>

              <div className="grid sm:grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="flex items-center bg-gray-900/50 rounded-lg p-3">
                  <Calendar className="w-5 h-5 text-purple-400 mr-3" />
                  <div>
                    <p className="text-gray-400 text-xs">{t('events.ultraevento.date.label', 'Fecha')}</p>
                    <p className="text-white font-semibold">{t('events.ultraevento.date.value', '24 de Agosto, 2025')}</p>
                  </div>
                </div>

                <div className="flex items-center bg-gray-900/50 rounded-lg p-3">
                  <Clock className="w-5 h-5 text-purple-400 mr-3" />
                  <div>
                    <p className="text-gray-400 text-xs">{t('events.ultraevento.time.label', 'Horario')}</p>
                    <p className="text-white font-semibold">{t('events.ultraevento.time.value', '1:00 PM - 9:00 PM')}</p>
                  </div>
                </div>

                <div className="flex items-center bg-gray-900/50 rounded-lg p-3">
                  <MapPin className="w-5 h-5 text-purple-400 mr-3" />
                  <div>
                    <p className="text-gray-400 text-xs">{t('events.ultraevento.location.label', 'Lugar')}</p>
                    <p className="text-white font-semibold">{t('events.ultraevento.location.value', 'Hash House, Medellín')}</p>
                  </div>
                </div>
              </div>

              <p className="text-gray-300 mb-6">
                {t('events.ultraevento.description', 'El evento anual más importante de UltraVioleta DAO, reuniendo a la comunidad Web3 latinoamericana para conferencias, networking y celebración.')}
              </p>

              {/* Event Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-gray-900/50 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-purple-400">212</p>
                  <p className="text-gray-400 text-xs">{t('events.ultraevento.stats.registered', 'Registrados')}</p>
                </div>
                <div className="bg-gray-900/50 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-purple-400">144</p>
                  <p className="text-gray-400 text-xs">{t('events.ultraevento.stats.attendees', 'Asistentes')}</p>
                </div>
                <div className="bg-gray-900/50 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-purple-400">10</p>
                  <p className="text-gray-400 text-xs">{t('events.ultraevento.stats.sponsors', 'Patrocinadores')}</p>
                </div>
                <div className="bg-gray-900/50 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-purple-400">8h</p>
                  <p className="text-gray-400 text-xs">{t('events.ultraevento.stats.duration', 'Duración')}</p>
                </div>
              </div>

              {/* Event Images Gallery */}
              <div className="mb-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <img
                    src="/images/ultraevento-2025-promo.jpg"
                    alt="Ultra Evento 2025 Promotional Banner - Premier Web3 blockchain conference August 24 2025 in Medellín Colombia at Hash House featuring 212 registered attendees and 10 sponsors including Avalanche Uniswap Pyth Network"
                    className="rounded-lg w-full h-48 object-cover cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={() => window.open('/images/ultraevento-2025-promo.jpg', '_blank')}
                    loading="lazy"
                    width="400"
                    height="192"
                    itemProp="image"
                    title="Ultra Evento 2025 - Click to view full size"
                  />
                  <img
                    src="/images/ultraevento-2025.jpg"
                    alt="Ultra Evento 2025 Main Event Photo - Latin America Web3 DAO blockchain conference with 144 attendees networking and learning about DeFi NFTs and decentralized governance in Spanish"
                    className="rounded-lg w-full h-48 object-cover cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={() => window.open('/images/ultraevento-2025.jpg', '_blank')}
                    loading="lazy"
                    width="400"
                    height="192"
                    title="Ultra Evento 2025 Event Gallery - Click to view"
                  />
                  <img
                    src="/images/quedada-medellin-2025.jpg"
                    alt="Ultra Quedada Medellín 2025 Community Meetup - Web3 crypto blockchain community gathering UltraVioleta DAO members networking event Latin America LATAM"
                    className="rounded-lg w-full h-48 object-cover cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={() => window.open('/images/quedada-medellin-2025.jpg', '_blank')}
                    loading="lazy"
                    width="400"
                    height="192"
                    title="Community Meetup Medellín - Click to enlarge"
                  />
                </div>
              </div>

              {/* Sponsors with Links */}
              <div className="border-t border-gray-800 pt-6">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <Heart className="w-5 h-5 text-pink-500 animate-pulse" />
                  <h3 className="text-lg font-semibold text-white">
                    {t('events.ultraevento.sponsors.title', 'Patrocinadores 2025')}
                  </h3>
                  <Heart className="w-5 h-5 text-pink-500 animate-pulse" />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                  {[
                    { name: 'Avalanche', twitter: '@AvaxTeam1', video: 'https://x.com/UltravioletaDAO/status/1961197588389953629' },
                    { name: 'Rekt', twitter: '@RektHQ', video: 'https://x.com/UltravioletaDAO/status/1961077187227844906' },
                    { name: 'Celo Colombia', twitter: '@Celo_Col', video: 'https://x.com/UltravioletaDAO/status/1961113800574189779' },
                    { name: 'Self', twitter: '@selfprotocol', video: 'https://x.com/UltravioletaDAO/status/1961544954301616209' },
                    { name: 'Uniswap', twitter: '@Uniswap', video: 'https://x.com/UltravioletaDAO/status/1961535762828333124' },
                    { name: 'Pyth Network', twitter: '@PythNetwork', video: 'https://x.com/UltravioletaDAO/status/1961567997509738889' },
                    { name: 'Heroes Of Cipher', twitter: '@HeroesOfCipher', video: 'https://x.com/UltravioletaDAO/status/1961177432419193181' },
                    { name: 'deBridge', twitter: '@debridge', video: 'https://x.com/UltravioletaDAO/status/1961424459929092283' },
                    { name: 'Superfluid', twitter: '@Superfluid_HQ', video: 'https://x.com/UltravioletaDAO/status/1961617646970970208' },
                    { name: 'Magic Eden', twitter: '@Eden_Magico', video: 'https://x.com/UltravioletaDAO/status/1961271683995640236' }
                  ].map((sponsor, idx) => (
                    <div key={idx} className="bg-gray-900/50 rounded-lg p-3 text-center border border-purple-500/20 hover:border-purple-500/50 transition-all">
                      <p className="text-white font-medium text-sm mb-2">{sponsor.name}</p>
                      <div className="flex justify-center gap-2">
                        <a
                          href={`https://x.com/${sponsor.twitter.substring(1)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-400 hover:text-white transition-colors"
                          title={sponsor.twitter}
                        >
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                          </svg>
                        </a>
                        <a
                          href={sponsor.video}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-purple-400 hover:text-purple-300 transition-colors"
                          title="Ver video"
                        >
                          <PlayCircle className="w-4 h-4" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>

                <p className="text-center text-gray-400 text-xs mt-4">
                  {t('events.ultraevento.sponsors.gratitude', '¡Gracias a todos nuestros patrocinadores por hacer posible este evento!')}
                </p>
              </div>

              {/* CTA Button */}
              <footer className="mt-6 text-center">
                <p className="text-gray-300 mb-4">
                  {t('events.ultraevento.brandRepresentation', 'Como parte de nuestros servicios de representación de marca, organizamos eventos presenciales que conectan a proyectos Web3 con la comunidad latinoamericana.')}
                </p>
                <a
                  href="mailto:ultravioletadao@gmail.com"
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-lg transition-all"
                >
                  <Users className="w-5 h-5 mr-2" />
                  {t('events.ultraevento.sponsorCTA', 'Patrocina el próximo evento')}
                </a>
              </footer>
            </article>
          </div>
        </motion.div>
      </section>

        {/* Products Section */}
        <motion.div
          id="productos"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-16"
        >
          <h2 className="text-3xl font-bold text-center mb-8 text-purple-400">
            {t('services.products.title')}
          </h2>

          {/* Book Product */}
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 rounded-xl p-8 border border-purple-500/30 hover:border-purple-400/50 transition-all"
            >
              <div className="flex flex-col md:flex-row gap-8">
                <div className="flex-1">
                  <h3 className="text-2xl font-bold mb-3 text-purple-300">
                    {t('services.products.book.title')}
                  </h3>
                  <p className="text-gray-300 mb-4">
                    {t('services.products.book.author')}
                  </p>
                  <p className="text-gray-400 mb-6">
                    {t('services.products.book.description')}
                  </p>

                  <div className="space-y-3 mb-6">
                    <div className="flex items-center">
                      <Gift className="w-5 h-5 text-pink-400 mr-3" />
                      <p className="text-sm text-gray-300">
                        {t('services.products.book.benefit1')}
                      </p>
                    </div>
                    <div className="flex items-center">
                      <Coins className="w-5 h-5 text-pink-400 mr-3" />
                      <p className="text-sm text-gray-300">
                        {t('services.products.book.benefit2')}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-4">
                    <a
                      href="https://www.amazon.com/dp/B0FMQPFTVL"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
                    >
                      <ShoppingCart className="w-5 h-5 mr-2" />
                      {t('services.products.book.buyButton')}
                      <ExternalLink className="w-4 h-4 ml-2" />
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Educational Videos Section */}
        <motion.div
          id="contenido-educativo"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mb-16"
        >
          <h2 className="text-3xl font-bold text-center mb-8 text-purple-400">
            {t('services.educationalVideos.title', 'Contenido Educativo')}
          </h2>
          <p className="text-lg text-gray-300 text-center mb-12 max-w-4xl mx-auto">
            {t('services.educationalVideos.description', 'Accede a nuestros videos y cursos gratuitos sobre blockchain, Web3 y tecnologías descentralizadas')}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Courses from database */}
            {courses.length > 0 ? courses.map((course, index) => (
              <a
                key={index}
                href={course.link}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 rounded-xl overflow-hidden border border-purple-500/30 hover:border-purple-400/50 transition-all group"
              >
                <div className="aspect-video relative">
                  {getYoutubeThumbnail(course.link) ? (
                    <img
                      src={getYoutubeThumbnail(course.link)}
                      alt={course.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-black/50 flex items-center justify-center">
                      <PlayCircle className="w-12 h-12 text-purple-400" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <PlayCircle className="w-16 h-16 text-white" />
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="text-white font-semibold mb-2 line-clamp-2">{course.title}</h3>
                  <p className="text-gray-400 text-sm line-clamp-3">{course.description}</p>
                </div>
              </a>
            )) : (
              <>
                {/* Default placeholder videos */}
                <div className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 rounded-xl p-4 border border-purple-500/30">
                  <div className="aspect-video bg-black/50 rounded-lg mb-4 flex items-center justify-center">
                    <PlayCircle className="w-12 h-12 text-purple-400" />
                  </div>
                  <h3 className="text-white font-semibold mb-2">Introducción a Web3</h3>
                  <p className="text-gray-400 text-sm">Conceptos básicos de blockchain y criptomonedas</p>
                </div>

                <div className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 rounded-xl p-4 border border-purple-500/30">
                  <div className="aspect-video bg-black/50 rounded-lg mb-4 flex items-center justify-center">
                    <PlayCircle className="w-12 h-12 text-purple-400" />
                  </div>
                  <h3 className="text-white font-semibold mb-2">Smart Contracts</h3>
                  <p className="text-gray-400 text-sm">Aprende sobre contratos inteligentes y DeFi</p>
                </div>

                <div className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 rounded-xl p-4 border border-purple-500/30">
                  <div className="aspect-video bg-black/50 rounded-lg mb-4 flex items-center justify-center">
                    <PlayCircle className="w-12 h-12 text-purple-400" />
                  </div>
                  <h3 className="text-white font-semibold mb-2">Gobernanza DAO</h3>
                  <p className="text-gray-400 text-sm">Cómo participar en decisiones descentralizadas</p>
                </div>
              </>
            )}
          </div>

          <div className="text-center mt-8">
            <a
              href="https://www.youtube.com/@UltravioletaDAO"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
            >
              <PlayCircle className="w-5 h-5 mr-2" />
              {t('services.educationalVideos.viewAll', 'Ver todos los videos en YouTube')}
              <ExternalLink className="w-4 h-4 ml-2" />
            </a>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="text-center mt-12"
        >
          <p className="text-gray-400">
            {t('services.contact')}
          </p>
        </motion.div>
      </div>
    </main>
    </>
  );
};

export default ServicesPage;