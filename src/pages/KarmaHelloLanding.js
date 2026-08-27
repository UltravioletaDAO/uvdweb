import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import SEO from '../components/SEO';
import {
  Bot, Coins, Shield, Zap, Globe, Users, TrendingUp, Gift,
  CheckCircle, ArrowRight, PlayCircle, MessageCircle,
  Twitter, Clock, Award, Database, Code, Sparkles
} from 'lucide-react';

const KarmaHelloLanding = () => {
  const { t } = useTranslation();

  const features = [
    {
      icon: Bot,
      title: t('karmaHello.features.agents.title'),
      description: t('karmaHello.features.agents.description'),
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: Shield,
      title: t('karmaHello.features.antiFarming.title'),
      description: t('karmaHello.features.antiFarming.description'),
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: Coins,
      title: t('karmaHello.features.fibonacci.title'),
      description: t('karmaHello.features.fibonacci.description'),
      color: 'from-green-500 to-emerald-500'
    },
    {
      icon: Gift,
      title: t('karmaHello.features.nftMultiplier.title'),
      description: t('karmaHello.features.nftMultiplier.description'),
      color: 'from-yellow-500 to-orange-500'
    },
    {
      icon: Twitter,
      title: t('karmaHello.features.socialBoost.title'),
      description: t('karmaHello.features.socialBoost.description'),
      color: 'from-indigo-500 to-purple-500'
    },
    {
      icon: Globe,
      title: t('karmaHello.features.languages.title'),
      description: t('karmaHello.features.languages.description'),
      color: 'from-red-500 to-pink-500'
    }
  ];

  const howItWorks = [
    {
      step: 1,
      title: t('karmaHello.steps.join.title'),
      description: t('karmaHello.steps.join.description'),
      icon: PlayCircle
    },
    {
      step: 2,
      title: t('karmaHello.steps.connect.title'),
      description: t('karmaHello.steps.connect.description'),
      icon: Database
    },
    {
      step: 3,
      title: t('karmaHello.steps.chat.title'),
      description: t('karmaHello.steps.chat.description'),
      icon: MessageCircle
    },
    {
      step: 4,
      title: t('karmaHello.steps.earn.title'),
      description: t('karmaHello.steps.earn.description'),
      icon: Coins
    }
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        "@id": "https://ultravioletadao.xyz/karma-hello",
        "name": "Karma Hello - Revolutionary Chat-to-Earn Platform",
        "applicationCategory": "CommunicationApplication",
        "operatingSystem": "Web Browser",
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "USD"
        }
      },
      {
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": t('karmaHello.faq.q1.question'),
            "acceptedAnswer": {
              "@type": "Answer",
              "text": t('karmaHello.faq.q1.answer')
            }
          },
          {
            "@type": "Question",
            "name": t('karmaHello.faq.q2.question'),
            "acceptedAnswer": {
              "@type": "Answer",
              "text": t('karmaHello.faq.q2.answer')
            }
          }
        ]
      }
    ]
  };

  return (
    <>
      <SEO
        title={t('karmaHello.seo.title')}
        description={t('karmaHello.seo.description')}
        keywords="Karma Hello, chat to earn, Twitch crypto rewards, UVD tokens, AI chat evaluation, Web3 streaming, Avalanche blockchain, chat monetization, stream engagement, crypto earnings Twitch"
        customJsonLd={jsonLd}
        canonicalUrl="https://ultravioletadao.xyz/karma-hello"
      />

      <main className="min-h-screen bg-black text-white">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-20">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-pink-900/20" />

          <div className="container mx-auto px-4 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center max-w-5xl mx-auto"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600/20 border border-purple-500/50 rounded-full text-sm text-purple-300 mb-6">
                <Sparkles className="w-4 h-4" />
                <span>{t('karmaHello.hero.badge')}</span>
              </div>

              <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                {t('karmaHello.hero.title')}
              </h1>

              <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
                {t('karmaHello.hero.subtitle')}
              </p>

              {/* Demo Stats — illustrative values, not live data */}
              <div className="mb-2 text-xs text-yellow-400/80 text-center">
                {t('karmaHello.hero.demoNotice')}
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {[
                  { label: t('karmaHello.hero.stats.activeUsers'), value: '2,847', icon: Users },
                  { label: t('karmaHello.hero.stats.messagesProcessed'), value: '1,284K', icon: MessageCircle },
                  { label: t('karmaHello.hero.stats.uvdDistributed'), value: '892.7M', icon: Coins },
                  { label: t('karmaHello.hero.stats.liveStreams'), value: '47', icon: PlayCircle }
                ].map((stat, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.1 }}
                    className="bg-gray-900/50 backdrop-blur rounded-lg p-4"
                  >
                    <stat.icon className="w-5 h-5 text-purple-400 mb-2 mx-auto" />
                    <div className="text-2xl font-bold text-white">{stat.value}</div>
                    <div className="text-sm text-gray-400">{stat.label}</div>
                  </motion.div>
                ))}
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="https://twitch.tv/0xultravioleta"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg font-semibold text-lg hover:shadow-lg hover:scale-105 transition-all inline-flex items-center justify-center gap-2"
                >
                  <PlayCircle className="w-5 h-5" />
                  {t('karmaHello.hero.ctaPrimary')}
                  <ArrowRight className="w-5 h-5" />
                </a>

                <Link
                  to="/services#karma-hello"
                  className="px-8 py-4 bg-gray-800 rounded-lg font-semibold text-lg hover:bg-gray-700 transition-all inline-flex items-center justify-center gap-2"
                >
                  {t('karmaHello.hero.ctaSecondary')}
                </Link>
              </div>

              {/* Trust Signal */}
              <div className="mt-6 flex items-center justify-center gap-6 text-sm text-gray-400">
                <div className="flex items-center gap-1">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span>{t('karmaHello.badges.noInvestment')}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Shield className="w-4 h-4 text-blue-400" />
                  <span>{t('karmaHello.badges.antiFraud')}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Zap className="w-4 h-4 text-yellow-400" />
                  <span>{t('karmaHello.badges.instant')}</span>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-20 bg-gradient-to-b from-black to-purple-900/10">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4">{t('karmaHello.why.title')}</h2>
              <p className="text-xl text-gray-400">{t('karmaHello.why.subtitle')}</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-gray-900/50 backdrop-blur rounded-xl p-6 border border-gray-800 hover:border-purple-500/50 transition-all"
                >
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${feature.color} p-2.5 mb-4`}>
                    <feature.icon className="w-full h-full text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-gray-400">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4">{t('karmaHello.steps.title')}</h2>
              <p className="text-xl text-gray-400">{t('karmaHello.steps.subtitle')}</p>
            </div>

            <div className="max-w-4xl mx-auto">
              <div className="relative">
                {/* Connection Line */}
                <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-purple-500 to-pink-500 hidden md:block" />

                {howItWorks.map((item, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.15 }}
                    className="relative flex items-start gap-6 mb-8"
                  >
                    <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-2xl font-bold">
                      {item.step}
                    </div>
                    <div className="flex-grow bg-gray-900/50 rounded-xl p-6">
                      <div className="flex items-center gap-3 mb-2">
                        <item.icon className="w-5 h-5 text-purple-400" />
                        <h3 className="text-xl font-semibold">{item.title}</h3>
                      </div>
                      <p className="text-gray-400">{item.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Earnings Calculator */}
        <section className="py-20 bg-gradient-to-b from-purple-900/10 to-black">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto bg-gray-900/50 rounded-2xl p-8 border border-purple-500/30">
              <h2 className="text-3xl font-bold mb-6 text-center">{t('karmaHello.calculator.title')}</h2>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">{t('karmaHello.calculator.label')}</label>
                  <input
                    type="range"
                    min="10"
                    max="200"
                    defaultValue="50"
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>10</span>
                    <span>200</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-black/50 rounded-lg p-4">
                    <div className="text-sm text-gray-400 mb-1">{t('karmaHello.calculator.daily')}</div>
                    <div className="text-2xl font-bold text-purple-400">547,300 - 4,160,200</div>
                  </div>
                  <div className="bg-black/50 rounded-lg p-4">
                    <div className="text-sm text-gray-400 mb-1">{t('karmaHello.calculator.nftBoost')}</div>
                    <div className="text-2xl font-bold text-green-400">1,094,600 - 8,320,400</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-20">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-4xl font-bold mb-4">{t('karmaHello.cta.title')}</h2>
            <p className="text-xl text-gray-400 mb-8">{t('karmaHello.cta.subtitle')}</p>

            <a
              href="https://twitch.tv/0xultravioleta"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg font-semibold text-lg hover:shadow-lg hover:scale-105 transition-all"
            >
              <PlayCircle className="w-6 h-6" />
              {t('karmaHello.cta.button')}
              <ArrowRight className="w-6 h-6" />
            </a>

            <div className="mt-8 flex items-center justify-center gap-8 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span>{t('karmaHello.stats.users')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>{t('karmaHello.stats.uptime')}</span>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
};

export default KarmaHelloLanding;