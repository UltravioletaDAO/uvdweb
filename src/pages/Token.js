import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import SEO from '../components/SEO';
import { useTranslation } from 'react-i18next';
import SwapWidgetV2 from '../components/SwapWidgetV2';
import WrapWidget from '../components/WrapWidget';
import { createThirdwebClient } from "thirdweb";
import { ConnectButton } from "thirdweb/react";
import { darkTheme } from "thirdweb/react";
import { createWallet } from "thirdweb/wallets";

const client = createThirdwebClient({
  clientId: "7343a278c7ff30dd04caba86259e87ea",
});

const wallets = [
  createWallet("io.metamask"),
  createWallet("io.rabby"),
  createWallet("app.core.extension"),
];

const Token = () => {
  const { t } = useTranslation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);


  return (
    <>
      <SEO
        title="UVD Token | Avalanche Governance Token for Latin America DAO"
        description="UVD is the native governance token of UltraVioleta DAO on Avalanche blockchain. Trade, swap, and participate in DAO governance. Contract: 0x4Ffe7e01832243e03668E090706F17726c26d6B2"
        keywords="UVD token, UltraVioleta token, Avalanche token, governance token, DAO token, Latin America cryptocurrency, AVAX DEX, Arena swap, DeFi token LATAM, ERC-20 token, crypto governance, Web3 token, decentralized governance, Avalanche C-Chain, UVD price, UVD trading"
      />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="min-h-screen bg-background py-16 px-4"
      >
        <div className="border-b border-gray-800">
          <div className="max-w-6xl mx-auto px-2 sm:px-4 py-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2 sm:gap-4">
                <img src="/logo.png" alt={t('common.logo_alt')} className="w-8 h-8 sm:w-10 sm:h-10" />
                <h1 className="text-xl sm:text-2xl font-bold text-text-primary">
                  {t('token.title')}
                </h1>
              </div>

              <div className="flex items-center gap-2 sm:gap-4">




                <ConnectButton
                  client={client}
                  connectButton={{ label: t('snapshot.connect_wallet') }}
                  connectModal={{ showThirdwebBranding: false, size: "compact" }}
                  locale={t('common.locale')}
                  theme={darkTheme({
                    colors: {
                      primaryButtonBg: "hsl(271, 100%, 35%)",
                      primaryButtonText: "#FFFFFF",
                      secondaryButtonBg: "hsl(271, 40%, 15%)",
                      secondaryButtonText: "#FFFFFF",
                      modalBg: "hsl(269, 100%, 6%)",
                      borderColor: "hsl(273, 100%, 60%)",
                      separatorLine: "hsl(273, 50%, 30%)",
                      tertiaryBg: "hsl(271, 100%, 4%)",
                      primaryText: "#FFFFFF",
                      secondaryText: "#E5E5E5",
                      accentButtonBg: "hsl(273, 100%, 45%)",
                      accentButtonText: "#FFFFFF",
                    },
                  })}
                  wallets={wallets}
                />

              </div>
            </div>
          </div>
        </div>
        <div className="max-w-6xl mx-auto px-2 sm:px-4 py-4">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-1xl font-bold text-text-primary mb-1 text-justify"
          >
            {t('token.description_1')}
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-1xl font-bold text-text-primary mb-5 text-justify"
          >
            {t('token.description_2')}
          </motion.p>
          {/* Swap and Wrap Widgets */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8 flex flex-col lg:flex-row justify-center gap-6"
          >

            <WrapWidget />
            <SwapWidgetV2 />
          </motion.div>
          {/* Dexscreener Embed */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8 flex justify-center"
          >
            <style>
              {`
            #dexscreener-embed {
              position: relative;
              width: 100%;
              padding-bottom: 125%;
              display: flex;
              justify-content: center;
              align-items: center;
            }
            @media(min-width: 1400px) {
              #dexscreener-embed {
                padding-bottom: 40%;
              }
            }
            #dexscreener-embed iframe {
              position: absolute;
              width: 100%;
              height: 100%;
              top: 0;
              left: 0;
              border: 0;
            }
            `}
            </style>
            <div id="dexscreener-embed">
              <iframe
                src="https://dexscreener.com/avalanche/0xBFf3e2238e545C76f705560BD1677BD9c0E9dAB4?embed=1&loadChartSettings=0&chartDefaultOnMobile=1&chartTheme=dark&theme=dark&chartStyle=1&chartType=usd&interval=1"
                title={t('token.chart_title')}
              ></iframe>
            </div>
          </motion.div>

          {/* Tokenomics Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-8"
          >
            {/* Header */}
            <div className="text-center mb-10">
              <h2 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-cyan-100 to-white mb-2">
                {t('tokenomics.supply.title')}
              </h2>
              <div className="w-24 h-1 bg-gradient-to-r from-ultraviolet to-cyan-400 mx-auto rounded-full" />
            </div>

            {/* Top Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              {[
                { title: t('tokenomics.supply.total'), value: "10,000,000,000 UVD", sub: "10 Billion", color: "from-purple-500/20 to-blue-500/5", border: "border-purple-500/30" },
                { title: t('tokenomics.supply.launch'), value: "7,300,000,000 UVD", sub: "7.3 Billion (73%)", color: "from-cyan-500/20 to-blue-500/5", border: "border-cyan-500/30" },
                { title: t('tokenomics.supply.circulating'), value: "~6,070,000,000 UVD", sub: "~60.7%", color: "from-green-500/20 to-emerald-500/5", border: "border-green-500/30" }
              ].map((item, i) => (
                <div key={i} className={`relative overflow-hidden rounded-2xl p-6 border ${item.border} bg-gradient-to-br ${item.color} backdrop-blur-sm`}>
                  <div className="relative z-10">
                    <p className="text-gray-400 text-sm font-medium uppercase tracking-wider mb-2">{item.title}</p>
                    <p className="text-2xl lg:text-3xl font-bold text-white mb-1">{item.value}</p>
                    <p className="text-sm text-gray-400">{item.sub}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Main Distribution Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">

              {/* Distribution Column */}
              <div className="glass-panel p-8 relative overflow-hidden group hover:border-ultraviolet/30 transition-colors">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <span className="text-9xl">📊</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                  <span className="text-2xl filter drop-shadow no-emoji-grayscale">📊</span>
                  {t('tokenomics.supply.distribution')}
                </h3>
                <div className="space-y-4">
                  {[
                    { label: t('tokenomics.supply.uvt_holders'), value: "3,017,000,000 UVD" },
                    { label: t('tokenomics.supply.multisig'), value: "3,930,000,000 UVD" },
                    { label: t('tokenomics.supply.liquidity'), value: "2,450,000,000 UVD" },
                    { label: t('tokenomics.supply.airdrop'), value: "333,300,000 UVD" },
                    { label: t('tokenomics.supply.champions'), value: "250,000,000 UVD" }
                  ].map((item, i) => (
                    <div key={i} className="flex justify-between items-center py-2 border-b border-white/5 last:border-0">
                      <span className="text-gray-300">{item.label}</span>
                      <span className="text-white font-mono font-medium">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Treasury Column */}
              <div className="glass-panel p-8 relative overflow-hidden group hover:border-cyan-400/30 transition-colors">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <span className="text-9xl">🏦</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                  <span className="text-2xl filter drop-shadow no-emoji-grayscale">🏦</span>
                  {t('tokenomics.supply.treasury_allocation')}
                </h3>
                <div className="space-y-6">
                  <div>
                    <p className="text-gray-400 text-sm mb-1">{t('tokenomics.treasury_base')}</p>
                    <p className="text-2xl font-bold text-white">2,139,063,651 UVD</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm mb-1">{t('tokenomics.supply.period')}</p>
                    <p className="text-xl font-medium text-white">18 {t('tokenomics.months')}</p>
                    <p className="text-cyan-400 text-sm mt-1">{t('tokenomics.period_dates')}</p>
                  </div>
                </div>
              </div>

              {/* Bounties */}
              <div className="glass-panel p-8 relative overflow-hidden border-orange-500/20 hover:border-orange-500/40 transition-colors">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                  <span className="text-2xl filter drop-shadow no-emoji-grayscale">🏆</span>
                  {t('tokenomics.bounties.title')}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                  <div>
                    <p className="text-gray-400 text-xs uppercase">{t('tokenomics.allocation')}</p>
                    <p className="text-lg font-bold text-white">855,625,460.64 UVD <span className="text-orange-400 text-sm">(40%)</span></p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs uppercase">{t('tokenomics.bounties.monthly')}</p>
                    <p className="text-lg font-bold text-white">~47,534,748 UVD</p>
                  </div>
                </div>

                <div className="bg-orange-500/5 rounded-xl p-4 border border-orange-500/10">
                  <p className="text-orange-300 text-sm mb-3 font-medium flex justify-between">
                    {t('tokenomics.bounties.prizes')}
                    <span className="text-white/60">{t('tokenomics.bounties.frequency')}: 3 {t('tokenomics.bounties.per_month')}</span>
                  </p>
                  <div className="space-y-2">
                    {[
                      { place: "🥇 " + t('tokenomics.bounties.first'), val: "50% (~7,922,458 UVD)", col: "text-yellow-400" },
                      { place: "🥈 " + t('tokenomics.bounties.second'), val: "30% (~4,753,475 UVD)", col: "text-gray-300" },
                      { place: "🥉 " + t('tokenomics.bounties.third'), val: "20% (~3,168,983 UVD)", col: "text-orange-400" }
                    ].map((p, i) => (
                      <div key={i} className="flex justify-between items-center text-sm">
                        <span className={`${p.col} font-medium`}>{p.place}</span>
                        <span className="text-white font-mono">{p.val}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Airdrops */}
              <div className="glass-panel p-8 relative overflow-hidden border-sky-500/20 hover:border-sky-500/40 transition-colors">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                  <span className="text-2xl filter drop-shadow no-emoji-grayscale">🪂</span>
                  {t('tokenomics.airdrops.title')}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                  <div>
                    <p className="text-gray-400 text-xs uppercase">{t('tokenomics.allocation')}</p>
                    <p className="text-lg font-bold text-white">427,812,730.32 UVD <span className="text-sky-400 text-sm">(20%)</span></p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs uppercase">{t('tokenomics.airdrops.monthly')}</p>
                    <p className="text-lg font-bold text-white">~23,767,374 UVD</p>
                  </div>
                </div>

                <div className="bg-sky-500/5 rounded-xl p-4 border border-sky-500/10 h-full">
                  <p className="text-sky-300 text-sm mb-3 font-medium flex justify-between">
                    {t('tokenomics.airdrops.objectives')}
                    <span className="text-white/60">{t('tokenomics.airdrops.frequency')}: 1 {t('tokenomics.airdrops.per_month')}</span>
                  </p>
                  <ul className="space-y-2">
                    {[
                      t('tokenomics.airdrops.obj1'),
                      t('tokenomics.airdrops.obj2'),
                      t('tokenomics.airdrops.obj3')
                    ].map((obj, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                        <span className="text-sky-400 mt-1">•</span>
                        {obj}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Wheel Section */}
              <div className="glass-panel p-8 relative overflow-hidden border-pink-500/20 hover:border-pink-500/40 transition-colors">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                  <span className="text-2xl filter drop-shadow no-emoji-grayscale">🎰</span>
                  {t('tokenomics.wheel.title')}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                  <div>
                    <p className="text-gray-400 text-xs uppercase">{t('tokenomics.allocation')}</p>
                    <p className="text-lg font-bold text-white">92,226,939.31 UVD <span className="text-pink-400 text-sm">(4.31%)</span></p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs uppercase">{t('tokenomics.wheel.total')}</p>
                    <p className="text-lg font-bold text-white">70 {t('tokenomics.wheel.wheels')}</p>
                  </div>
                </div>

                <div className="bg-pink-500/5 rounded-xl p-4 border border-pink-500/10">
                  <p className="text-pink-300 text-sm mb-3 font-medium flex justify-between">
                    {t('tokenomics.wheel.prizes')}
                    <span className="text-white/60">{t('tokenomics.wheel.frequency')}: 4 {t('tokenomics.wheel.per_month')}</span>
                  </p>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    {[
                      { l: "1º", v: "514,229 UVD" },
                      { l: "2º", v: "317,811 UVD" },
                      { l: "3º", v: "196,418 UVD" },
                      { l: "4º", v: "121,393 UVD" }
                    ].map((item, i) => (
                      <div key={i} className="flex justify-between bg-black/20 px-2 py-1 rounded">
                        <span className="text-pink-400 font-bold">{item.l}</span>
                        <span className="text-white font-mono text-xs">{item.v}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Savings Fund */}
              <div className="glass-panel p-8 relative overflow-hidden border-teal-500/20 hover:border-teal-500/40 transition-colors">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                  <span className="text-2xl filter drop-shadow no-emoji-grayscale">💰</span>
                  {t('tokenomics.savings.title')}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                  <div>
                    <p className="text-gray-400 text-xs uppercase">{t('tokenomics.allocation')}</p>
                    <p className="text-lg font-bold text-white">427,812,730.32 UVD <span className="text-teal-400 text-sm">(20%)</span></p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs uppercase">{t('tokenomics.savings.monthly')}</p>
                    <p className="text-lg font-bold text-white">~23,767,374 UVD</p>
                  </div>
                </div>

                <div className="bg-teal-500/5 rounded-xl p-4 border border-teal-500/10 text-sm">
                  <p className="text-teal-300 text-sm mb-2 font-medium">{t('tokenomics.savings.uses')}</p>
                  <ul className="space-y-1 text-gray-300">
                    <li>• {t('tokenomics.savings.use1')}</li>
                    <li>• {t('tokenomics.savings.use2')}</li>
                    <li>• {t('tokenomics.savings.use3')}</li>
                  </ul>
                </div>
              </div>

              {/* Ultra Evento - Full Width */}
              <div className="glass-panel p-8 relative overflow-hidden lg:col-span-2 border-indigo-500/20 hover:border-indigo-500/40">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-900/10 to-transparent pointer-events-none" />
                <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center">
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-white mb-2 flex items-center gap-3">
                      <span className="text-3xl filter drop-shadow no-emoji-grayscale">🎉</span>
                      {t('tokenomics.event.title')}
                    </h3>
                    <div className="flex items-baseline gap-3 mb-2">
                      <p className="text-4xl font-bold text-white">55,000,000 UVD</p>
                      <span className="text-indigo-400 font-medium uppercase tracking-wider text-sm">{t('tokenomics.event.allocation')}</span>
                    </div>
                    <p className="text-gray-400 max-w-xl">{t('tokenomics.event.description')}</p>
                  </div>
                  <div className="w-full md:w-auto bg-indigo-500/10 rounded-xl p-5 border border-indigo-500/20 min-w-[300px]">
                    <p className="text-indigo-300 text-sm mb-3 font-bold uppercase tracking-wider">{t('tokenomics.event.source')}</p>
                    <ul className="space-y-2 text-sm">
                      <li className="flex justify-between items-center text-gray-200">
                        <span>{t('tokenomics.event.july')}</span>
                        <span className="font-mono font-bold">~23.76M UVD</span>
                      </li>
                      <li className="flex justify-between items-center text-gray-200">
                        <span>{t('tokenomics.event.august')}</span>
                        <span className="font-mono font-bold">~23.76M UVD</span>
                      </li>
                      <li className="pt-2 border-t border-indigo-500/20 flex justify-between items-center text-gray-200">
                        <span className="text-xs">{t('tokenomics.event.complement')}</span>
                        <span className="font-mono font-bold">7.46M UVD</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Reserve - Full Width */}
              <div className="glass-panel p-8 relative overflow-hidden lg:col-span-2 border-gray-700/50">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                  <span className="text-2xl filter drop-shadow no-emoji-grayscale">🔒</span>
                  {t('tokenomics.reserve.title')}
                </h3>
                <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                  <div className="text-center md:text-left">
                    <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">{t('tokenomics.reserve.amount')}</p>
                    <p className="text-3xl font-bold text-white font-mono">335,585,590.99 UVD</p>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">{t('tokenomics.reserve.percentage')}</p>
                    <p className="text-3xl font-bold text-gray-300">15.69%</p>
                  </div>
                  <div className="text-center md:text-right">
                    <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">{t('tokenomics.reserve.purpose')}</p>
                    <p className="text-xl text-white">{t('tokenomics.reserve.future')}</p>
                  </div>
                </div>
              </div>

            </div>

            {/* Proposal Link */}
            <div className="mt-12 text-center">
              <a
                href="https://snapshot.box/#/s:ultravioletadao.eth/proposal/0xc132335dbab914d230d394b90877679568eb51e859f50b34afaeb0879ddd185e"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-white font-semibold transition-all hover:scale-105 hover:shadow-lg hover:shadow-cyan-500/10"
              >
                {t('tokenomics.view_proposal')}
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </>
  );
};

export default Token;
