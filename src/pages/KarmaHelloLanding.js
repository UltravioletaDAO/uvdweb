import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import SEO from '../components/SEO';
import {
  Bot, Coins, Shield, Zap, Globe, Users, TrendingUp, Gift,
  CheckCircle, ArrowRight, PlayCircle, Star, MessageCircle,
  Twitter, Clock, Award, Database, Code, Sparkles
} from 'lucide-react';

const KarmaHelloLanding = () => {
  const { t } = useTranslation();
  const [stats, setStats] = useState({
    totalUsers: 2847,
    messagesProcessed: 1284739,
    tokensDistributed: 892749283,
    activeStreams: 47
  });

  // Simulate real-time stats updates
  useEffect(() => {
    const interval = setInterval(() => {
      setStats(prev => ({
        totalUsers: prev.totalUsers + Math.floor(Math.random() * 3),
        messagesProcessed: prev.messagesProcessed + Math.floor(Math.random() * 50),
        tokensDistributed: prev.tokensDistributed + Math.floor(Math.random() * 10000),
        activeStreams: 47 + Math.floor(Math.random() * 5)
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const features = [
    {
      icon: Bot,
      title: '18+ AI Agents',
      description: 'GPT-4o, Claude 3.5, Ollama working together to evaluate message quality',
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: Shield,
      title: 'Anti-Farming Protection',
      description: 'Advanced ML models (BERT, Isolation Forest) prevent abuse',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: Coins,
      title: 'Fibonacci Rewards',
      description: '10,946 to 832,040 UVD tokens per quality message',
      color: 'from-green-500 to-emerald-500'
    },
    {
      icon: Gift,
      title: '2x NFT Multiplier',
      description: 'Echoes NFT holders get double rewards automatically',
      color: 'from-yellow-500 to-orange-500'
    },
    {
      icon: Twitter,
      title: 'Social Boost',
      description: '1.2x to 5.0x multiplier based on Twitter influence',
      color: 'from-indigo-500 to-purple-500'
    },
    {
      icon: Globe,
      title: '4 Languages',
      description: 'Native support for Spanish, English, Portuguese, French',
      color: 'from-red-500 to-pink-500'
    }
  ];

  const howItWorks = [
    {
      step: 1,
      title: 'Join the Stream',
      description: 'Navigate to twitch.tv/0xultravioleta',
      icon: PlayCircle
    },
    {
      step: 2,
      title: 'Connect Wallet',
      description: 'Link your MetaMask, Core, or Rabby wallet',
      icon: Database
    },
    {
      step: 3,
      title: 'Chat with Quality',
      description: 'Participate with meaningful messages',
      icon: MessageCircle
    },
    {
      step: 4,
      title: 'Earn UVD Tokens',
      description: 'Receive instant rewards on Avalanche',
      icon: Coins
    }
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        "@id": "https://ultravioleta.xyz/karma-hello",
        "name": "Karma Hello - Revolutionary Chat-to-Earn Platform",
        "applicationCategory": "CommunicationApplication",
        "operatingSystem": "Web Browser",
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "USD"
        },
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": "4.8",
          "ratingCount": "287"
        }
      },
      {
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "What is Karma Hello Chat-to-Earn?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Karma Hello is a revolutionary Web3 system that rewards quality Twitch chat interactions with UVD cryptocurrency tokens. Using 18+ AI agents, it evaluates message quality and distributes rewards on the Avalanche blockchain."
            }
          },
          {
            "@type": "Question",
            "name": "How much can I earn with Karma Hello?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Earnings range from 10,946 to 832,040 UVD tokens per quality message. With multipliers (2x for NFT holders, up to 5x for Twitter influence), active participants can earn 100,000-5,000,000 UVD tokens daily."
            }
          }
        ]
      }
    ]
  };

  return (
    <>
      <SEO
        title="Karma Hello - Revolutionary Chat-to-Earn Platform | Earn UVD Tokens on Twitch"
        description="Transform your Twitch chat into crypto earnings with Karma Hello. 18+ AI agents reward quality interactions with UVD tokens on Avalanche blockchain. Join 2,800+ users earning daily."
        keywords="Karma Hello, chat to earn, Twitch crypto rewards, UVD tokens, AI chat evaluation, Web3 streaming, Avalanche blockchain, chat monetization, stream engagement, crypto earnings Twitch"
        customJsonLd={jsonLd}
        canonicalUrl="https://ultravioleta.xyz/karma-hello"
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
                <span>Live on Twitch • Powered by AI • Built on Avalanche</span>
              </div>

              <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Turn Your Chat Into Crypto
              </h1>

              <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
                Karma Hello rewards quality Twitch interactions with UVD tokens.
                Chat smarter, earn instantly, no investment required.
              </p>

              {/* Live Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {[
                  { label: 'Active Users', value: stats.totalUsers.toLocaleString(), icon: Users },
                  { label: 'Messages Processed', value: (stats.messagesProcessed / 1000).toFixed(0) + 'K', icon: MessageCircle },
                  { label: 'UVD Distributed', value: (stats.tokensDistributed / 1000000).toFixed(1) + 'M', icon: Coins },
                  { label: 'Live Streams', value: stats.activeStreams, icon: PlayCircle }
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
                  Start Earning Now
                  <ArrowRight className="w-5 h-5" />
                </a>

                <Link
                  to="/services#karma-hello"
                  className="px-8 py-4 bg-gray-800 rounded-lg font-semibold text-lg hover:bg-gray-700 transition-all inline-flex items-center justify-center gap-2"
                >
                  Learn How It Works
                </Link>
              </div>

              {/* Trust Signal */}
              <div className="mt-6 flex items-center justify-center gap-6 text-sm text-gray-400">
                <div className="flex items-center gap-1">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span>No Investment Required</span>
                </div>
                <div className="flex items-center gap-1">
                  <Shield className="w-4 h-4 text-blue-400" />
                  <span>Anti-Fraud Protected</span>
                </div>
                <div className="flex items-center gap-1">
                  <Zap className="w-4 h-4 text-yellow-400" />
                  <span>Instant Rewards</span>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-20 bg-gradient-to-b from-black to-purple-900/10">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4">Why Karma Hello?</h2>
              <p className="text-xl text-gray-400">The most advanced Chat-to-Earn system in Web3</p>
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
              <h2 className="text-4xl font-bold mb-4">Start Earning in 4 Simple Steps</h2>
              <p className="text-xl text-gray-400">No coding, no complexity, just chat and earn</p>
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
              <h2 className="text-3xl font-bold mb-6 text-center">Calculate Your Potential Earnings</h2>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Daily Quality Messages</label>
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
                    <div className="text-sm text-gray-400 mb-1">Daily UVD Earnings</div>
                    <div className="text-2xl font-bold text-purple-400">547,300 - 4,160,200</div>
                  </div>
                  <div className="bg-black/50 rounded-lg p-4">
                    <div className="text-sm text-gray-400 mb-1">With NFT 2x Boost</div>
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
            <h2 className="text-4xl font-bold mb-4">Ready to Transform Your Chat?</h2>
            <p className="text-xl text-gray-400 mb-8">Join thousands earning UVD tokens daily</p>

            <a
              href="https://twitch.tv/0xultravioleta"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg font-semibold text-lg hover:shadow-lg hover:scale-105 transition-all"
            >
              <PlayCircle className="w-6 h-6" />
              Join Live Stream Now
              <ArrowRight className="w-6 h-6" />
            </a>

            <div className="mt-8 flex items-center justify-center gap-8 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span>2,847+ Active Users</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-yellow-400" />
                <span>4.8/5 Rating</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>24/7 Uptime</span>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
};

export default KarmaHelloLanding;