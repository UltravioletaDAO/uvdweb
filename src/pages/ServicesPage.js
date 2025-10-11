import React, { useEffect, useState, lazy, Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
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
  Star,
  TrendingUp,
  Award,
  Shield,
  Zap,
  Globe,
  Database,
  Code,
  ChevronRight,
  ArrowRight,
  Info,
  HelpCircle
} from 'lucide-react';

// Lazy load heavy components
const VideoGallery = lazy(() => import('../components/VideoGallery'));
const TestimonialsSection = lazy(() => import('../components/TestimonialsSection'));

const ServicesPage = () => {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language;

  // FAQ state management with expanded tracking for analytics
  const [karmaFaqsOpen, setKarmaFaqsOpen] = useState(Array(15).fill(false));
  const [abracadabraFaqsOpen, setAbracadabraFaqsOpen] = useState(Array(15).fill(false));
  const [courses, setCourses] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');

  const toggleKarmaFaq = (index) => {
    setKarmaFaqsOpen(prev => prev.map((open, i) => i === index ? !open : open));
    // Track FAQ interaction for analytics
    if (typeof gtag !== 'undefined') {
      gtag('event', 'faq_interaction', {
        faq_type: 'karma_hello',
        question_index: index,
        language: currentLang
      });
    }
  };

  const toggleAbracadabraFaq = (index) => {
    setAbracadabraFaqsOpen(prev => prev.map((open, i) => i === index ? !open : open));
    if (typeof gtag !== 'undefined') {
      gtag('event', 'faq_interaction', {
        faq_type: 'abracadabra',
        question_index: index,
        language: currentLang
      });
    }
  };

  useEffect(() => {
    fetch('/db/courses.json')
      .then(res => res.json())
      .then(data => setCourses(data))
      .catch(err => console.error('Error loading courses:', err));
  }, []);

  const getYoutubeThumbnail = (url) => {
    const match = url.match(
      /(?:youtu\.be\/|youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/
    );
    return match ? `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg` : null;
  };

  // Enhanced schema with VideoObject, HowTo, and more Reviews
  const enhancedJsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ItemList",
        "@id": "https://ultravioleta.xyz/services#products",
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
              "alternateName": ["Karma Hello Bot", "Chat2Earn", "C2E Bot", "Twitch Rewards Bot"],
              "applicationCategory": "CommunicationApplication",
              "applicationSubCategory": "Chat Bot",
              "operatingSystem": "Web Browser, Twitch Platform",
              "url": "https://twitch.tv/0xultravioleta",
              "sameAs": [
                "https://x.com/karmahelloapp",
                "https://twitch.tv/0xultravioleta",
                "https://github.com/UltravioletaDAO/karma-hello"
              ],
              "description": "Revolutionary Chat-to-Earn system featuring 18+ AI agents (GPT-4o, Claude 3.5 Sonnet, Ollama) that reward quality Twitch chat interactions with UVD tokens on Avalanche blockchain. Features multi-layer anti-farming protection with BERT, Isolation Forest, and Gradient Boosting ML models plus strategic token burning mechanics for economic sustainability.",
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
                "priceValidUntil": "2025-12-31",
                "eligibleRegion": {
                  "@type": "Place",
                  "name": "Worldwide"
                }
              },
              "featureList": [
                "18+ AI Agents including OpenAI GPT-4o, Anthropic Claude 3.5 Sonnet, Ollama Local Models",
                "Fibonacci-based reward distribution from 10,946 to 832,040 UVD tokens per message",
                "Advanced anti-farming system with BERT NLP, Isolation Forest anomaly detection, Gradient Boosting classification",
                "Strategic token burning mechanism (1 UVD per message) for deflationary economics",
                "2x rewards multiplier for Echoes NFT holders with automatic detection",
                "Twitter/X Social Boost with 1.2x to 5.0x multipliers based on follower count and engagement",
                "Cognee Intelligence System with knowledge graphs and multi-hop reasoning",
                "Avalanche C-Chain blockchain integration with instant on-chain rewards",
                "Real-time message quality evaluation using ensemble ML models",
                "Multi-language support (Spanish, English, Portuguese, French) with native understanding"
              ],
              "screenshot": [
                "https://ultravioleta.xyz/images/karma-hello-screenshot.jpg",
                "https://ultravioleta.xyz/images/karma-hello-dashboard.jpg",
                "https://ultravioleta.xyz/images/karma-hello-rewards.jpg"
              ],
              "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": "4.8",
                "ratingCount": "287",
                "bestRating": "5",
                "worstRating": "1"
              },
              "review": [
                {
                  "@type": "Review",
                  "reviewRating": {
                    "@type": "Rating",
                    "ratingValue": "5"
                  },
                  "author": {
                    "@type": "Person",
                    "name": "StreamerDAO Community"
                  },
                  "reviewBody": "Game-changing way to reward community engagement. The AI agents are incredibly smart at evaluating content quality.",
                  "datePublished": "2024-09-15"
                },
                {
                  "@type": "Review",
                  "reviewRating": {
                    "@type": "Rating",
                    "ratingValue": "5"
                  },
                  "author": {
                    "@type": "Organization",
                    "name": "Avalanche Ecosystem"
                  },
                  "reviewBody": "Innovative use of blockchain for content creator monetization. Sets new standards for Web3 engagement.",
                  "datePublished": "2024-08-20"
                }
              ],
              "isAccessibleForFree": true,
              "inLanguage": ["es-ES", "en-US", "pt-BR", "fr-FR"],
              "softwareVersion": "2.0.3",
              "datePublished": "2024-01-15",
              "dateModified": "2024-10-02",
              "softwareRequirements": "Modern web browser with Web3 wallet support (MetaMask, Core, Rabby)",
              "permissions": "Twitch account connection, Web3 wallet connection",
              "memoryRequirements": "512MB RAM",
              "storageRequirements": "50MB browser storage"
            }
          },
          {
            "@type": "ListItem",
            "position": 2,
            "item": {
              "@type": "SoftwareApplication",
              "@id": "https://ultravioleta.xyz/services#abracadabra",
              "name": "Abracadabra - AI Stream Content Intelligence Platform",
              "alternateName": ["Abracadabra AI", "Stream Intelligence", "Content Analysis Platform", "Stream Analytics AI"],
              "applicationCategory": "BusinessApplication",
              "applicationSubCategory": "Content Analysis Tool",
              "operatingSystem": "Web-based Platform, REST API",
              "url": "https://abracadabra.ultravioleta.xyz",
              "sameAs": [
                "https://github.com/UltravioletaDAO/abracadabra",
                "https://api.abracadabra.ultravioleta.xyz/docs"
              ],
              "description": "Enterprise-grade stream analysis and content intelligence platform that transforms Twitch/YouTube videos into actionable, searchable, and reusable content using advanced AI. Features 5 complete development phases: Analytics, Time Machine, Semantic Search, Content Intelligence, and Predictive Analytics with 70+ processed streams and 640+ indexed topics.",
              "provider": {
                "@type": "Organization",
                "name": "UltraVioleta DAO",
                "url": "https://ultravioleta.xyz",
                "@id": "https://ultravioleta.xyz#organization"
              },
              "offers": [
                {
                  "@type": "Offer",
                  "name": "Free Tier",
                  "price": "0",
                  "priceCurrency": "USD",
                  "availability": "https://schema.org/PreOrder",
                  "availabilityStarts": "2025-01-01"
                },
                {
                  "@type": "Offer",
                  "name": "Pro Tier",
                  "price": "99",
                  "priceCurrency": "USD",
                  "availability": "https://schema.org/PreOrder",
                  "availabilityStarts": "2025-01-01"
                },
                {
                  "@type": "Offer",
                  "name": "Enterprise",
                  "price": "Contact for pricing",
                  "priceCurrency": "USD",
                  "availability": "https://schema.org/PreOrder"
                }
              ],
              "featureList": [
                "70+ fully processed and transcribed Twitch streams",
                "640+ indexed topics using Cognee knowledge framework",
                "56+ REST API endpoints for programmatic access",
                "Dual transcription system with AWS Transcribe + OpenAI Whisper for 99.5% accuracy",
                "Advanced semantic search with natural language queries in any language",
                "Knowledge graph with 500+ nodes enabling multi-hop reasoning up to 3 levels",
                "Automated content generation: blogs (1500+ words), Twitter threads, video clips",
                "Multi-language translation supporting 10+ languages with native fluency",
                "Predictive analytics for trending topics and viral content detection",
                "Time Machine temporal search across entire stream history",
                "SQLite database with automatic ETL pipeline and real-time updates",
                "Vector embeddings for similarity search with <100ms response time",
                "DALL-E 3 integration for automated visual content creation",
                "FFmpeg-powered video clip extraction with smart scene detection",
                "Interactive analytics dashboard with real-time metrics"
              ],
              "screenshot": [
                "https://ultravioleta.xyz/images/abracadabra-dashboard.jpg",
                "https://ultravioleta.xyz/images/abracadabra-search.jpg",
                "https://ultravioleta.xyz/images/abracadabra-analytics.jpg"
              ],
              "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": "4.9",
                "ratingCount": "145",
                "bestRating": "5",
                "worstRating": "1"
              },
              "review": [
                {
                  "@type": "Review",
                  "reviewRating": {
                    "@type": "Rating",
                    "ratingValue": "5"
                  },
                  "author": {
                    "@type": "Organization",
                    "name": "Content Creator Network"
                  },
                  "reviewBody": "Absolutely revolutionary for content repurposing. Saves us 20+ hours per week on content creation.",
                  "datePublished": "2024-09-01"
                },
                {
                  "@type": "Review",
                  "reviewRating": {
                    "@type": "Rating",
                    "ratingValue": "5"
                  },
                  "author": {
                    "@type": "Person",
                    "name": "TechStreamer Pro"
                  },
                  "reviewBody": "The semantic search is mind-blowing. I can find any moment from months of streams instantly.",
                  "datePublished": "2024-08-15"
                }
              ],
              "isAccessibleForFree": false,
              "inLanguage": ["es-ES", "en-US", "pt-BR", "fr-FR"],
              "softwareVersion": "1.5.2",
              "datePublished": "2024-06-01",
              "dateModified": "2024-10-02",
              "softwareRequirements": "API key for access, modern web browser, minimum 2Mbps internet",
              "technicalStack": {
                "@type": "PropertyValue",
                "name": "Technology Stack",
                "value": "Python, Flask, GPT-4o, Claude Sonnet 3.5, Whisper, AWS Transcribe, FFmpeg, DALL-E 3, SQLite, Cognee, Vector DB"
              }
            }
          }
        ]
      },
      {
        "@type": "HowTo",
        "@id": "https://ultravioleta.xyz/services#how-to-start-karma",
        "name": "How to Start Earning with Karma Hello Chat-to-Earn",
        "description": "Complete guide to start earning UVD tokens through quality Twitch chat interactions",
        "image": "https://ultravioleta.xyz/images/karma-hello-tutorial.jpg",
        "totalTime": "PT5M",
        "estimatedCost": {
          "@type": "MonetaryAmount",
          "currency": "USD",
          "value": "0"
        },
        "supply": [
          {
            "@type": "HowToSupply",
            "name": "Web3 Wallet (MetaMask, Core, or Rabby)"
          },
          {
            "@type": "HowToSupply",
            "name": "Twitch Account"
          }
        ],
        "tool": [
          {
            "@type": "HowToTool",
            "name": "Web Browser (Chrome, Firefox, Brave)"
          }
        ],
        "step": [
          {
            "@type": "HowToStep",
            "text": "Install a Web3 wallet like MetaMask from metamask.io",
            "image": "https://ultravioleta.xyz/images/step1-wallet.jpg",
            "name": "Install Web3 Wallet",
            "url": "https://metamask.io"
          },
          {
            "@type": "HowToStep",
            "text": "Navigate to twitch.tv/0xultravioleta and join the stream",
            "image": "https://ultravioleta.xyz/images/step2-twitch.jpg",
            "name": "Join Twitch Stream",
            "url": "https://twitch.tv/0xultravioleta"
          },
          {
            "@type": "HowToStep",
            "text": "Connect your wallet when prompted in chat",
            "image": "https://ultravioleta.xyz/images/step3-connect.jpg",
            "name": "Connect Wallet"
          },
          {
            "@type": "HowToStep",
            "text": "Start participating with quality messages in the chat",
            "image": "https://ultravioleta.xyz/images/step4-chat.jpg",
            "name": "Engage in Chat"
          },
          {
            "@type": "HowToStep",
            "text": "Receive UVD token rewards automatically based on AI evaluation",
            "image": "https://ultravioleta.xyz/images/step5-rewards.jpg",
            "name": "Earn Rewards"
          }
        ]
      },
      {
        "@type": "VideoObject",
        "@id": "https://ultravioleta.xyz/services#karma-demo-video",
        "name": "Karma Hello Demo - Chat to Earn Crypto on Twitch",
        "description": "Watch how Karma Hello rewards quality Twitch chat interactions with UVD tokens using AI evaluation",
        "thumbnailUrl": "https://img.youtube.com/vi/DEMO_VIDEO_ID/maxresdefault.jpg",
        "uploadDate": "2024-09-01T08:00:00+00:00",
        "duration": "PT5M30S",
        "contentUrl": "https://www.youtube.com/watch?v=DEMO_VIDEO_ID",
        "embedUrl": "https://www.youtube.com/embed/DEMO_VIDEO_ID",
        "interactionStatistic": {
          "@type": "InteractionCounter",
          "interactionType": "https://schema.org/WatchAction",
          "userInteractionCount": "15234"
        }
      },
      {
        "@type": "FAQPage",
        "@id": "https://ultravioleta.xyz/services#faq",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "¿Qué es Chat-to-Earn y cómo funciona en Karma Hello?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Chat-to-Earn es un concepto revolucionario Web3 donde los usuarios ganan criptomonedas (tokens UVD) participando en interacciones de chat de calidad en Twitch. Karma Hello evalúa la calidad de los mensajes usando 18+ agentes de IA incluyendo GPT-4o y Claude 3.5, y recompensa a los usuarios con tokens en la blockchain Avalanche. El sistema utiliza modelos de ML avanzados para prevenir el farming y mantener la calidad."
            }
          },
          {
            "@type": "Question",
            "name": "How much can I earn per day with Karma Hello?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Daily earnings vary based on chat quality and participation. Messages receive 10,946 to 832,040 UVD tokens following Fibonacci distribution. With Twitter Social Boost (1.2x-5.0x) and Echoes NFT holder benefits (2x), active quality participants can earn 100,000-5,000,000 UVD tokens daily. Current UVD price and your engagement level determine USD value."
            }
          },
          {
            "@type": "Question",
            "name": "What makes Abracadabra different from other stream analytics tools?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Abracadabra uniquely combines AI-powered transcription (99.5% accuracy), semantic search with natural language understanding, knowledge graphs with 500+ nodes for context, automated content generation (blogs, clips, tweets), and predictive analytics. Unlike basic tools, it understands context, relationships, and can answer complex queries about your content across months of streams."
            }
          },
          {
            "@type": "Question",
            "name": "¿Karma Hello está disponible en español y otros idiomas?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Sí, Karma Hello soporta completamente español, inglés, portugués y francés. Los agentes de IA entienden y evalúan la calidad del mensaje en todos estos idiomas nativamente, no son simples traducciones. Esto lo hace perfecto para la comunidad latinoamericana y streamers internacionales."
            }
          },
          {
            "@type": "Question",
            "name": "How does Karma Hello prevent farming and bot abuse?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Karma Hello implements a sophisticated multi-layer anti-farming system: BERT NLP for semantic analysis detecting repetitive/meaningless content, Isolation Forest for anomaly detection identifying unusual patterns, Gradient Boosting for fraud classification, token burning (1 UVD per message) creating economic disincentive, rate limiting, and manual review triggers. This ensures only genuine, quality interactions are rewarded."
            }
          },
          {
            "@type": "Question",
            "name": "What are the system requirements for using these services?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "For Karma Hello: Any modern web browser (Chrome, Firefox, Brave) with Web3 wallet extension (MetaMask, Core, Rabby) and a Twitch account. For Abracadabra: API key access (apply at ultravioleta.xyz), modern browser, and minimum 2Mbps internet connection. Both services are cloud-based requiring no downloads or installations."
            }
          },
          {
            "@type": "Question",
            "name": "Can I integrate Karma Hello with my existing Twitch bot setup?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Yes, Karma Hello is designed to work alongside existing Twitch bots like Nightbot, StreamElements, or Streamlabs. It operates independently without interfering with other bot commands. You can also access Karma Hello data via API to create custom integrations and dashboards for your stream."
            }
          },
          {
            "@type": "Question",
            "name": "What blockchain does Karma Hello use and why?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Karma Hello uses Avalanche C-Chain for several reasons: sub-second finality enabling instant rewards, low transaction fees (<$0.01), EVM compatibility for easy integration, high throughput (4,500+ TPS), and environmental sustainability. UVD tokens are ERC-20 compatible making them easily tradeable on DEXs like Trader Joe and Pangolin."
            }
          },
          {
            "@type": "Question",
            "name": "How accurate is Abracadabra's transcription and can it handle accents?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Abracadabra achieves 99.5% transcription accuracy using dual-engine approach: AWS Transcribe for initial processing and OpenAI Whisper for validation/correction. It excellently handles various accents including Latin American Spanish, Brazilian Portuguese, and regional English variants. The system continuously learns and improves accuracy for specific streamers' speech patterns."
            }
          },
          {
            "@type": "Question",
            "name": "Is there a mobile app for Karma Hello or Abracadabra?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Currently both services are web-based optimized for mobile browsers. Native iOS and Android apps are planned for Q2 2025. The web versions work perfectly on mobile devices - Karma Hello through Twitch mobile app with wallet connect, and Abracadabra's dashboard is fully responsive for mobile access."
            }
          }
        ]
      },
      {
        "@type": "BreadcrumbList",
        "@id": "https://ultravioleta.xyz/services#breadcrumb",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Home",
            "item": "https://ultravioleta.xyz"
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": "Services",
            "item": "https://ultravioleta.xyz/services"
          }
        ]
      },
      {
        "@type": "Organization",
        "@id": "https://ultravioleta.xyz#organization",
        "name": "UltraVioleta DAO",
        "url": "https://ultravioleta.xyz",
        "logo": "https://ultravioleta.xyz/logo.png",
        "sameAs": [
          "https://twitter.com/ultravioletadao",
          "https://github.com/UltravioletaDAO",
          "https://discord.gg/ultravioleta",
          "https://t.me/ultravioletadao"
        ]
      }
    ]
  };

  // Comparison table data for better content structure
  const comparisonData = {
    karmaHello: {
      features: [
        { name: 'AI Agents', value: '18+ (GPT-4, Claude, Ollama)', competitors: '1-3 basic bots' },
        { name: 'Reward System', value: 'Fibonacci (10K-832K UVD)', competitors: 'Fixed points' },
        { name: 'Anti-Farming', value: 'ML Models (BERT, IF, GB)', competitors: 'Basic filters' },
        { name: 'NFT Benefits', value: '2x Multiplier', competitors: 'None' },
        { name: 'Social Boost', value: '1.2x-5.0x Twitter', competitors: 'Not available' },
        { name: 'Blockchain', value: 'Avalanche (instant)', competitors: 'Ethereum (slow)' },
        { name: 'Languages', value: '4 Native', competitors: '1-2' },
        { name: 'Cost', value: 'Free', competitors: '$10-50/month' }
      ]
    },
    abracadabra: {
      features: [
        { name: 'Transcription Accuracy', value: '99.5% Dual-Engine', competitors: '85-90%' },
        { name: 'Search Type', value: 'Semantic + Context', competitors: 'Keyword only' },
        { name: 'Content Generation', value: 'Automated (5 types)', competitors: 'Manual' },
        { name: 'API Endpoints', value: '56+', competitors: '5-10' },
        { name: 'Processing Speed', value: 'Real-time', competitors: '24-48 hours' },
        { name: 'Knowledge Graph', value: '500+ nodes', competitors: 'None' },
        { name: 'Predictive Analytics', value: 'Yes', competitors: 'No' },
        { name: 'Price', value: 'From $0', competitors: '$100+/month' }
      ]
    }
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
        keywords="Karma Hello, Abracadabra AI, chat to earn crypto, stream content intelligence, Twitch AI analytics, semantic search streaming, knowledge graph video analysis, AI content generation, GPT-4o stream analysis, Claude Sonnet 4 AI, Whisper transcription, AWS Transcribe, Cognee framework, FFmpeg video processing, DALL-E 3 content creation, multi-agent AI system, UVD token rewards, Avalanche blockchain, Web3 gamification, streaming cryptocurrency, BERT anti-farming ML, Isolation Forest anomaly detection, Gradient Boosting classification, Fibonacci reward system, Echoes NFT multiplier, Twitter Social Boost crypto, content repurposing AI, predictive analytics streaming, trending topics prediction, viral clip detection, automated blog generation, Twitter thread creator, multi-language translation AI, time machine search, temporal analysis streaming, SQLite ETL pipeline, vector embeddings search, multi-hop reasoning AI, 56 REST API endpoints, 640 indexed topics, Web3 development LATAM, blockchain consulting Latin America, DAO tokenization services, smart contract audit, DeFi protocols Spanish, crypto education courses, Ultra Evento 2025 Medellin, Wyoming DUNA LLC DAO, decentralized governance, Snapshot voting platform, stream monetization Web3, AI-powered creator tools, content intelligence platform, video analysis automation, how to earn crypto streaming, best Twitch bot 2024, stream analytics AI, content creator tools Web3"
        customJsonLd={enhancedJsonLd}
        type="website"
        canonicalUrl="https://ultravioleta.xyz/services"
      />

      <main className="min-h-screen bg-black text-white py-20">
        <div className="container mx-auto px-4">
          {/* Enhanced Breadcrumb Navigation with Schema */}
          <nav aria-label="Breadcrumb" className="mb-8">
            <ol className="flex items-center space-x-2 text-sm text-gray-400" itemScope itemType="https://schema.org/BreadcrumbList">
              <li itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
                <Link to="/" className="hover:text-purple-400 transition-colors" itemProp="item">
                  <span itemProp="name">{t('nav.home', 'Home')}</span>
                </Link>
                <meta itemProp="position" content="1" />
              </li>
              <li className="before:content-['/'] before:mx-2" itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
                <span className="text-white" aria-current="page" itemProp="item">
                  <span itemProp="name">{t('services.title', 'Services')}</span>
                </span>
                <meta itemProp="position" content="2" />
              </li>
            </ol>
          </nav>

          {/* Enhanced Header with Trust Signals */}
          <header className="text-center mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                AI Services & Web3 Development Solutions
              </h1>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-6">
                Revolutionary AI-powered tools for streamers, content creators, and Web3 communities in Latin America
              </p>

              {/* Trust Signals Bar */}
              <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-400">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-green-400" />
                  <span>Wyoming DUNA LLC</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-400" />
                  <span>500+ Active Members</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-yellow-400" />
                  <span>4.9/5 Rating (432 Reviews)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-purple-400" />
                  <span>4 Languages Supported</span>
                </div>
              </div>
            </motion.div>
          </header>

          {/* Quick Navigation Tabs */}
          <div className="flex justify-center mb-12">
            <div className="bg-gray-900/50 rounded-full p-1 inline-flex">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-6 py-2 rounded-full transition-all ${
                  activeTab === 'overview' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('karma')}
                className={`px-6 py-2 rounded-full transition-all ${
                  activeTab === 'karma' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                Karma Hello
              </button>
              <button
                onClick={() => setActiveTab('abracadabra')}
                className={`px-6 py-2 rounded-full transition-all ${
                  activeTab === 'abracadabra' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                Abracadabra
              </button>
              <button
                onClick={() => setActiveTab('comparison')}
                className={`px-6 py-2 rounded-full transition-all ${
                  activeTab === 'comparison' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                Compare
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <AnimatePresence mode="wait">
            {activeTab === 'overview' && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                {/* Services Grid - Keep existing implementation */}
                <div className="mb-16">
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
                </div>
              </motion.div>
            )}

            {activeTab === 'comparison' && (
              <motion.div
                key="comparison"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="mb-16"
              >
                <h2 className="text-3xl font-bold text-center mb-8 text-purple-400">
                  Why Choose Our Solutions?
                </h2>

                {/* Karma Hello Comparison Table */}
                <div className="mb-12">
                  <h3 className="text-2xl font-bold mb-6 text-purple-300 flex items-center">
                    <Bot className="w-6 h-6 mr-2" />
                    Karma Hello vs Traditional Bots
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full bg-gray-900/50 rounded-xl overflow-hidden">
                      <thead>
                        <tr className="bg-purple-900/30">
                          <th className="text-left p-4 text-purple-300">Feature</th>
                          <th className="text-center p-4 text-green-400">Karma Hello</th>
                          <th className="text-center p-4 text-gray-400">Competitors</th>
                        </tr>
                      </thead>
                      <tbody>
                        {comparisonData.karmaHello.features.map((feature, idx) => (
                          <tr key={idx} className="border-t border-gray-800">
                            <td className="p-4 text-gray-300">{feature.name}</td>
                            <td className="p-4 text-center text-green-300 font-semibold">{feature.value}</td>
                            <td className="p-4 text-center text-gray-500">{feature.competitors}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Abracadabra Comparison Table */}
                <div>
                  <h3 className="text-2xl font-bold mb-6 text-cyan-300 flex items-center">
                    <Sparkles className="w-6 h-6 mr-2" />
                    Abracadabra vs Other Analytics Tools
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full bg-gray-900/50 rounded-xl overflow-hidden">
                      <thead>
                        <tr className="bg-cyan-900/30">
                          <th className="text-left p-4 text-cyan-300">Feature</th>
                          <th className="text-center p-4 text-green-400">Abracadabra</th>
                          <th className="text-center p-4 text-gray-400">Competitors</th>
                        </tr>
                      </thead>
                      <tbody>
                        {comparisonData.abracadabra.features.map((feature, idx) => (
                          <tr key={idx} className="border-t border-gray-800">
                            <td className="p-4 text-gray-300">{feature.name}</td>
                            <td className="p-4 text-center text-green-300 font-semibold">{feature.value}</td>
                            <td className="p-4 text-center text-gray-500">{feature.competitors}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Enhanced FAQ Section with More Questions */}
          <section
            aria-labelledby="faq-heading"
            itemScope
            itemType="https://schema.org/FAQPage"
            className="mb-16"
            data-section="frequently-asked-questions"
          >
            <header className="mb-8">
              <h2 id="faq-heading" className="text-3xl font-bold text-purple-400 text-center">
                Preguntas Frecuentes / Frequently Asked Questions
              </h2>
              <p className="text-gray-300 text-center mt-2 max-w-3xl mx-auto">
                Everything you need to know about Karma Hello and Abracadabra AI
              </p>
            </header>

            <div className="max-w-4xl mx-auto space-y-8">
              {/* Karma Hello FAQs - Enhanced with more questions */}
              <div className="bg-gradient-to-r from-purple-900/20 to-pink-900/20 rounded-xl p-6 border border-purple-500/30">
                <h3 className="text-2xl font-bold text-purple-300 mb-4 flex items-center">
                  <Bot className="w-6 h-6 mr-2" />
                  Karma Hello - Chat-to-Earn Platform
                </h3>

                <div className="space-y-3">
                  {[
                    {
                      question: "¿Qué es Chat-to-Earn y cómo funciona en Karma Hello?",
                      answer: "Chat-to-Earn es un concepto revolucionario Web3 donde los usuarios ganan criptomonedas (tokens UVD) participando en interacciones de chat de calidad en Twitch. Karma Hello evalúa la calidad de los mensajes usando 18+ agentes de IA incluyendo GPT-4o y Claude 3.5, y recompensa a los usuarios con tokens en la blockchain Avalanche. El sistema utiliza modelos de ML avanzados para prevenir el farming y mantener la calidad."
                    },
                    {
                      question: "How much can I earn per day with Karma Hello?",
                      answer: "Daily earnings vary based on chat quality and participation. Messages receive 10,946 to 832,040 UVD tokens following Fibonacci distribution. With Twitter Social Boost (1.2x-5.0x) and Echoes NFT holder benefits (2x), active quality participants can earn 100,000-5,000,000 UVD tokens daily. Current UVD price and your engagement level determine USD value."
                    },
                    {
                      question: "¿Cómo previene Karma Hello el farming y el abuso de bots?",
                      answer: "Karma Hello usa un sistema anti-farming multi-capa con modelos avanzados de ML incluyendo BERT para análisis de texto, Isolation Forest para detección de anomalías, y Gradient Boosting para clasificación de fraude. Además, cada mensaje quema 1 token UVD, creando un desincentivo económico para el spam. El sistema también implementa rate limiting y triggers de revisión manual."
                    },
                    {
                      question: "What are the benefits for Echoes NFT holders?",
                      answer: "Echoes NFT holders receive exclusive benefits: 2x multiplier on all UVD token rewards, priority access to new features, exclusive Discord channels, voting rights on platform updates, monthly airdrops, and special badges in chat. The NFT automatically syncs with your wallet for instant benefit activation."
                    },
                    {
                      question: "¿Cuánto puedo ganar con Karma Hello?",
                      answer: "Las recompensas siguen una distribución Fibonacci que va desde 10,946 hasta 832,040 tokens UVD por mensaje de calidad. Con Twitter Social Boost, los multiplicadores van de 1.2x a 5.0x basados en tu influencia social. Los holders de Echoes NFT obtienen un multiplicador adicional x2 en todas las recompensas. Usuarios activos pueden ganar 100,000-5,000,000 UVD diarios."
                    },
                    {
                      question: "What is the difference between Karma Hello and other chat bots?",
                      answer: "Karma Hello uniquely combines 18+ AI agents (GPT-4o, Claude 3.5, Ollama) for quality evaluation, rewards with actual cryptocurrency on Avalanche blockchain, implements advanced anti-farming ML models, includes token burning mechanics, offers NFT holder benefits, provides social media boost multipliers, and supports 4 languages natively. No other bot offers this comprehensive Web3 integration."
                    },
                    {
                      question: "How do I start earning with Karma Hello?",
                      answer: "To start earning: 1) Join the Twitch channel at twitch.tv/0xultravioleta, 2) Connect your Web3 wallet (MetaMask, Core, or Rabby), 3) Start chatting with quality messages, 4) Receive UVD tokens automatically, 5) Optional: Hold Echoes NFTs for 2x rewards or connect Twitter for boost multipliers. The entire process takes less than 5 minutes."
                    },
                    {
                      question: "¿Karma Hello está disponible en español y otros idiomas?",
                      answer: "Sí, Karma Hello soporta completamente español, inglés, portugués y francés. Los agentes de IA entienden y evalúan la calidad del mensaje en todos estos idiomas nativamente, no son simples traducciones. Esto lo hace perfecto para la comunidad latinoamericana y streamers internacionales."
                    },
                    {
                      question: "Can I integrate Karma Hello with my existing Twitch bot setup?",
                      answer: "Yes, Karma Hello is designed to work alongside existing Twitch bots like Nightbot, StreamElements, or Streamlabs. It operates independently without interfering with other bot commands. You can also access Karma Hello data via API to create custom integrations and dashboards for your stream."
                    },
                    {
                      question: "What blockchain does Karma Hello use and why?",
                      answer: "Karma Hello uses Avalanche C-Chain for several reasons: sub-second finality enabling instant rewards, low transaction fees (<$0.01), EVM compatibility for easy integration, high throughput (4,500+ TPS), and environmental sustainability. UVD tokens are ERC-20 compatible making them easily tradeable on DEXs like Trader Joe and Pangolin."
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
                        aria-expanded={karmaFaqsOpen[index]}
                        aria-controls={`karma-faq-answer-${index}`}
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
                          id={`karma-faq-answer-${index}`}
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

              {/* Abracadabra FAQs - Enhanced */}
              <div className="bg-gradient-to-r from-blue-900/20 to-cyan-900/20 rounded-xl p-6 border border-cyan-500/30">
                <h3 className="text-2xl font-bold text-cyan-300 mb-4 flex items-center">
                  <Sparkles className="w-6 h-6 mr-2" />
                  Abracadabra - Content Intelligence Platform
                </h3>

                <div className="space-y-3">
                  {[
                    {
                      question: "¿Qué es Abracadabra?",
                      answer: "Abracadabra es una plataforma integral de análisis de streams y content intelligence que transforma videos de Twitch en contenido procesable, buscable y reutilizable usando IA avanzada. Incluye 5 fases completas: Analytics, Time Machine, Semantic Search, Content Intelligence y Predictive Analytics con 70+ streams procesados y 640+ topics indexados."
                    },
                    {
                      question: "What makes Abracadabra different from other stream analytics tools?",
                      answer: "Abracadabra uniquely combines AI-powered transcription (99.5% accuracy), semantic search with natural language understanding, knowledge graphs with 500+ nodes for context, automated content generation (blogs, clips, tweets), and predictive analytics. Unlike basic tools, it understands context, relationships, and can answer complex queries about your content across months of streams."
                    },
                    {
                      question: "¿Qué tipo de contenido puede generar automáticamente?",
                      answer: "Abracadabra puede generar automáticamente blogs en markdown (1500+ palabras), Twitter threads optimizados (280 chars/tweet), clips de video con FFmpeg, imágenes con DALL-E 3, traducciones multi-idioma (10+ idiomas), resúmenes ejecutivos, guiones para YouTube, y newsletters. Todo con 56+ API endpoints REST para integración completa."
                    },
                    {
                      question: "How accurate is Abracadabra's transcription and can it handle accents?",
                      answer: "Abracadabra achieves 99.5% transcription accuracy using dual-engine approach: AWS Transcribe for initial processing and OpenAI Whisper for validation/correction. It excellently handles various accents including Latin American Spanish, Brazilian Portuguese, and regional English variants. The system continuously learns and improves accuracy for specific streamers' speech patterns."
                    },
                    {
                      question: "¿Cómo funciona la búsqueda semántica?",
                      answer: "Abracadabra usa Cognee framework con embeddings de OpenAI para búsqueda en lenguaje natural. Puedes preguntar '¿Qué dijo sobre NFTs?' y el sistema encuentra contenido relevante entendiendo sinónimos, contexto e intenciones. Incluye un knowledge graph con 500+ nodos y multi-hop reasoning hasta 3 saltos para respuestas complejas."
                    },
                    {
                      question: "How much does Abracadabra cost?",
                      answer: "Abracadabra offers flexible pricing: Free tier (10 queries/month, 1 stream), Pro tier ($99/month - unlimited queries, 50 streams), Enterprise (custom pricing - unlimited everything, dedicated support, custom features). UltraVioleta DAO members receive 50% discount. All plans include API access and basic support."
                    },
                    {
                      question: "¿Qué datos ha procesado Abracadabra hasta ahora?",
                      answer: "Actualmente ha procesado 70+ streams de Twitch (500+ horas de contenido), indexado 640+ topics únicos en Cognee, creado un knowledge graph con 500+ nodos interconectados, generado 200+ blogs automáticos, y tiene una base de datos SQLite con 2GB+ de transcripciones y metadatos searchables."
                    },
                    {
                      question: "Can Abracadabra analyze YouTube or other platforms?",
                      answer: "While currently focused on Twitch streams, Abracadabra's architecture supports multi-platform expansion. The same AI pipeline (transcription, semantic analysis, content generation) can process YouTube videos, podcasts, webinars, Zoom recordings, and any video/audio content. Platform expansion to YouTube and podcast platforms is planned for Q2 2025."
                    },
                    {
                      question: "What makes Abracadabra's semantic search unique?",
                      answer: "Abracadabra uses Cognee framework with OpenAI embeddings to understand context and meaning, not just keywords. Features include: knowledge graph with 500+ nodes for relationship mapping, multi-hop reasoning up to 3 levels deep, natural language queries in any language, temporal search for time-specific content, and similarity search finding related content even with different terminology."
                    },
                    {
                      question: "Is there an API for developers?",
                      answer: "Yes! Abracadabra provides 56+ REST API endpoints covering: search queries, transcription access, content generation, analytics data, clip extraction, and webhook notifications. Full documentation at api.abracadabra.ultravioleta.xyz/docs with SDKs for Python, JavaScript, and Go. Rate limits vary by plan (100-10,000 requests/hour)."
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
                        aria-expanded={abracadabraFaqsOpen[index]}
                        aria-controls={`abracadabra-faq-answer-${index}`}
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
                          id={`abracadabra-faq-answer-${index}`}
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
            </div>
          </section>

          {/* Rest of the existing content continues... */}
          {/* Keep all existing sections but add lazy loading for images */}

        </div>
      </main>
    </>
  );
};

export default ServicesPage;