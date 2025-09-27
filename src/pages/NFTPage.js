import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import SEOEnhanced from '../components/SEOEnhanced';
import OptimizedNFTCard from '../components/OptimizedNFTCard';
import { useNFTCache } from '../hooks/useNFTCache';

const NFTPage = () => {
  const { t, i18n } = useTranslation();
  const [echoesNFTs, setEchoesNFTs] = useState([]);
  const [selectedCollection, setSelectedCollection] = useState('echoes');
  const [loading, setLoading] = useState(true);
  const [loadedNFTs, setLoadedNFTs] = useState(new Set());
  const { getCachedUrl, preloadImages, markAsLoaded, isLoaded } = useNFTCache();

  // Register service worker for offline caching
  useEffect(() => {
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      navigator.serviceWorker
        .register('/nft-cache-sw.js')
        .then(registration => {
          console.log('NFT Cache Service Worker registered:', registration);
        })
        .catch(error => {
          console.warn('Service Worker registration failed:', error);
        });
    }
  }, []);

  const collections = {
    echoes: {
      name: 'Echoes by Ultravioleta DAO',
      description: t('nft.echoes.description'),
      totalSupply: 89,
      chain: 'Avalanche',
      contract: '0x6d08557830959b3441d269145b32dab93206b3d2',
      marketplaceUrl: 'https://magiceden.us/collections/avalanche/echoes-by-ultravioleta-dao-806754961',
      stats: {
        uniqueOwners: 52,
        listed: 1,
        royalty: '5%'
      }
    },
    vulvas: {
      name: 'Vulvas de Vulvas, Penes de Penes y Baretos de Baret',
      description: t('nft.vulvas.description'),
      chain: 'Ethereum',
      marketplaceUrl: 'https://opensea.io/collection/vulvas-de-vulvas-penes-de-penes-y-baretos-de-baret',
      stats: {}
    }
  };

  useEffect(() => {
    const loadEchoesMetadata = async () => {
      setLoading(true);
      try {
        const metadataPromises = [];

        for (let i = 0; i <= 88; i++) {
          metadataPromises.push(
            fetch(`/echoes/metadata/${i}`)
              .then(res => res.json())
              .then(data => ({ id: i, collectionNumber: i + 1, ...data }))
              .catch(() => null)
          );
        }

        const results = await Promise.all(metadataPromises);
        const validNFTs = results.filter(nft => nft !== null);
        setEchoesNFTs(validNFTs);
      } catch (error) {
        console.error('Error loading NFT metadata:', error);
      } finally {
        setLoading(false);
      }
    };

    if (selectedCollection === 'echoes') {
      loadEchoesMetadata();
    }
  }, [selectedCollection]);

  const convertIPFSToGateway = (ipfsUrl) => {
    if (!ipfsUrl) return '';
    if (ipfsUrl.startsWith('ipfs://')) {
      const hash = ipfsUrl.replace('ipfs://', '');
      return `https://ipfs.io/ipfs/${hash}`;
    }
    return ipfsUrl;
  };

  const fibonacciNumbers = [1, 2, 3, 5, 8, 13, 21, 34, 55];

  // Preload adjacent NFTs for smoother scrolling
  useEffect(() => {
    if (echoesNFTs.length > 0 && !loading) {
      const visibleRange = 12; // Preload first 12 NFTs
      const preloadUrls = echoesNFTs
        .slice(0, visibleRange)
        .flatMap(nft => [
          convertIPFSToGateway(nft.image),
          nft.animation_url ? convertIPFSToGateway(nft.animation_url) : null
        ])
        .filter(Boolean);

      preloadImages(preloadUrls);
    }
  }, [echoesNFTs, loading, preloadImages]);

  const handleNFTLoad = useCallback((nftId) => {
    setLoadedNFTs(prev => new Set(prev).add(nftId));
    markAsLoaded(nftId);
  }, [markAsLoaded]);

  // Use memoized NFT rendering for performance
  const renderNFTCard = useCallback((nft, index) => {
    const isFibonacci = fibonacciNumbers.includes(nft.collectionNumber);
    const isReserved = nft.collectionNumber > 55;
    const isPriority = index < 8; // First 8 NFTs load immediately

    return (
      <OptimizedNFTCard
        key={nft.id}
        nft={nft}
        isFibonacci={isFibonacci}
        isReserved={isReserved}
        getCachedUrl={getCachedUrl}
        onLoad={handleNFTLoad}
        priority={isPriority}
      />
    );
  }, [getCachedUrl, handleNFTLoad]);

  const CollectionStats = ({ collection }) => (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      {collection.totalSupply && (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
          <div className="text-sm text-gray-500 dark:text-gray-400">{t('nft.totalSupply')}</div>
          <div className="text-2xl font-bold text-purple-600">{collection.totalSupply}</div>
        </div>
      )}
      {collection.stats.uniqueOwners && (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
          <div className="text-sm text-gray-500 dark:text-gray-400">{t('nft.uniqueOwners')}</div>
          <div className="text-2xl font-bold text-purple-600">{collection.stats.uniqueOwners}</div>
        </div>
      )}
      {collection.chain && (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
          <div className="text-sm text-gray-500 dark:text-gray-400">{t('nft.chain')}</div>
          <div className="text-2xl font-bold text-purple-600">{collection.chain}</div>
        </div>
      )}
      {collection.stats.royalty && (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
          <div className="text-sm text-gray-500 dark:text-gray-400">{t('nft.royalty')}</div>
          <div className="text-2xl font-bold text-purple-600">{collection.stats.royalty}</div>
        </div>
      )}
    </div>
  );

  return (
    <>
      <SEOEnhanced
        title={`NFT Collections - ${t('site.name')}`}
        description={t('nft.meta.description')}
        keywords="NFT, Echoes, Ultravioleta DAO, Avalanche, Digital Art, Web3, Collectibles"
        path="/nfts"
      />

      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              {t('nft.title')}
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              {t('nft.subtitle')}
            </p>
          </motion.div>

          {/* Collection selector hidden for now - only showing Echoes */}
          {/*<div className="flex flex-wrap justify-center gap-4 mb-8">
            {Object.entries(collections).map(([key, collection]) => (
              <button
                key={key}
                onClick={() => setSelectedCollection(key)}
                className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                  selectedCollection === key
                    ? 'bg-purple-600 text-white shadow-lg'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:shadow-md'
                }`}
              >
                {collection.name}
              </button>
            ))}
          </div>*/}

          {selectedCollection && (
            <motion.div
              key={selectedCollection}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl p-8 mb-8">
                <h2 className="text-3xl font-bold mb-4">{collections[selectedCollection].name}</h2>
                <p className="text-lg mb-6">{collections[selectedCollection].description}</p>
                <a
                  href={collections[selectedCollection].marketplaceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-6 py-3 bg-white text-purple-600 font-bold rounded-lg hover:bg-gray-100 transition"
                >
                  {t('nft.viewOnMarketplace')}
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>

              {selectedCollection === 'echoes' && (
                <div className="bg-gradient-to-br from-purple-900 via-purple-600 to-pink-600 text-white rounded-xl p-8 mb-8">
                  <h3 className="text-2xl font-bold mb-6 text-center">✨ {t('nft.echoes.superpowers.title')} ✨</h3>
                  <div className="grid md:grid-cols-2 gap-4 mb-6">
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                      <div className="flex items-start">
                        <span className="text-2xl mr-3">💰</span>
                        <div>
                          <h4 className="font-bold mb-1">{t('nft.echoes.superpowers.airdrop')}</h4>
                          <p className="text-sm opacity-90">3-Month Airdrop of $UVD</p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                      <div className="flex items-start">
                        <span className="text-2xl mr-3">🎟️</span>
                        <div>
                          <h4 className="font-bold mb-1">{t('nft.echoes.superpowers.whitelist')}</h4>
                          <p className="text-sm opacity-90">WL for next NFT Collection: "The Order"</p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                      <div className="flex items-start">
                        <span className="text-2xl mr-3">🎪</span>
                        <div>
                          <h4 className="font-bold mb-1">{t('nft.echoes.superpowers.event')}</h4>
                          <p className="text-sm opacity-90">Free access to Ultraquedada 2025 (Medellín - Aug 24)¹</p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                      <div className="flex items-start">
                        <span className="text-2xl mr-3">🛍️</span>
                        <div>
                          <h4 className="font-bold mb-1">{t('nft.echoes.superpowers.discount')}</h4>
                          <p className="text-sm opacity-90">13% OFF on all official merch²</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-black rounded-lg p-4 mb-4">
                    <div className="flex items-center justify-center mb-2">
                      <span className="text-3xl mr-2">🌟</span>
                      <h4 className="text-xl font-bold">{t('nft.echoes.superpowers.fibonacci.title')}</h4>
                      <span className="text-3xl ml-2">🌟</span>
                    </div>
                    <p className="text-center font-semibold mb-2">{t('nft.echoes.superpowers.fibonacci.description')}</p>
                    <p className="text-center text-sm">NFTs #1, #2, #3, #5, #8, #13, #21, #34, #55</p>
                  </div>

                  <div className="text-xs opacity-75 space-y-1">
                    <p>¹ {t('nft.echoes.superpowers.notes.venue')}</p>
                    <p>² {t('nft.echoes.superpowers.notes.shipping')}</p>
                  </div>
                </div>
              )}

              {selectedCollection === 'echoes' && (
                <div className="bg-purple-100 dark:bg-purple-900/30 border-2 border-purple-300 dark:border-purple-700 rounded-xl p-6 mb-8">
                  <div className="flex items-center mb-3">
                    <span className="text-2xl mr-3">🏛️</span>
                    <h3 className="text-lg font-bold text-purple-900 dark:text-purple-100">
                      {t('nft.echoes.treasury.title')}
                    </h3>
                  </div>
                  <p className="text-purple-800 dark:text-purple-200">
                    {t('nft.echoes.treasury.description')}
                  </p>
                </div>
              )}

              {selectedCollection === 'echoes' && (
                <>
                  {loading ? (
                    <div className="flex justify-center items-center h-64">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {echoesNFTs.map((nft, index) => renderNFTCard(nft, index))}
                    </div>
                  )}
                </>
              )}

              {/* Vulvas collection hidden for now */}
              {/*selectedCollection === 'vulvas' && (
                <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl">
                  <h3 className="text-2xl font-bold mb-4">{t('nft.vulvas.title')}</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-2xl mx-auto">
                    {t('nft.vulvas.info')}
                  </p>
                  <a
                    href={collections.vulvas.marketplaceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-6 py-3 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-700 transition"
                  >
                    {t('nft.viewOnOpenSea')}
                    <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>
              )*/}
            </motion.div>
          )}
        </div>
      </div>
    </>
  );
};

export default NFTPage;