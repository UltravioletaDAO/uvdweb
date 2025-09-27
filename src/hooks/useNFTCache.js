import { useState, useEffect, useCallback } from 'react';

const CACHE_NAME = 'uvd-nft-cache-v1';
const CACHE_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds
const MEMORY_CACHE = new Map();
const PRELOAD_QUEUE = new Set();

// IndexedDB setup for persistent caching
const DB_NAME = 'UVDNFTCache';
const DB_VERSION = 1;
const STORE_NAME = 'nftMedia';

class NFTCacheManager {
  constructor() {
    this.db = null;
    this.initDB();
    this.preloadInProgress = false;
  }

  async initDB() {
    if (!window.indexedDB) return;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'url' });
          store.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };
    });
  }

  async getCachedMedia(url) {
    // Check memory cache first
    if (MEMORY_CACHE.has(url)) {
      const cached = MEMORY_CACHE.get(url);
      if (Date.now() - cached.timestamp < CACHE_DURATION) {
        return cached.blob;
      }
      MEMORY_CACHE.delete(url);
    }

    // Check IndexedDB
    if (!this.db) await this.initDB();
    if (!this.db) return null;

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(url);

      request.onsuccess = () => {
        const data = request.result;
        if (data && Date.now() - data.timestamp < CACHE_DURATION) {
          // Add to memory cache for faster access
          MEMORY_CACHE.set(url, {
            blob: data.blob,
            timestamp: data.timestamp
          });
          resolve(data.blob);
        } else {
          resolve(null);
        }
      };

      request.onerror = () => resolve(null);
    });
  }

  async cacheMedia(url, blob) {
    const timestamp = Date.now();

    // Add to memory cache
    MEMORY_CACHE.set(url, { blob, timestamp });

    // Keep memory cache size under control
    if (MEMORY_CACHE.size > 50) {
      const oldestKey = MEMORY_CACHE.keys().next().value;
      MEMORY_CACHE.delete(oldestKey);
    }

    // Add to IndexedDB
    if (!this.db) await this.initDB();
    if (!this.db) return;

    return new Promise((resolve) => {
      const transaction = this.db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);

      store.put({ url, blob, timestamp });
      transaction.oncomplete = () => resolve(true);
      transaction.onerror = () => resolve(false);
    });
  }

  async preloadMedia(urls) {
    if (this.preloadInProgress) return;
    this.preloadInProgress = true;

    const urlsToPreload = urls.filter(url => {
      if (MEMORY_CACHE.has(url) || PRELOAD_QUEUE.has(url)) {
        return false;
      }
      PRELOAD_QUEUE.add(url);
      return true;
    });

    // Preload in batches to avoid overwhelming the browser
    const batchSize = 3;
    for (let i = 0; i < urlsToPreload.length; i += batchSize) {
      const batch = urlsToPreload.slice(i, i + batchSize);
      await Promise.all(
        batch.map(async (url) => {
          try {
            const cached = await this.getCachedMedia(url);
            if (!cached) {
              const response = await fetch(url);
              if (response.ok) {
                const blob = await response.blob();
                await this.cacheMedia(url, blob);
              }
            }
          } catch (error) {
            console.warn('Preload failed for:', url);
          } finally {
            PRELOAD_QUEUE.delete(url);
          }
        })
      );
    }

    this.preloadInProgress = false;
  }

  async clearOldCache() {
    if (!this.db) await this.initDB();
    if (!this.db) return;

    const transaction = this.db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const index = store.index('timestamp');
    const cutoffTime = Date.now() - CACHE_DURATION;

    const request = index.openCursor(IDBKeyRange.upperBound(cutoffTime));
    request.onsuccess = (event) => {
      const cursor = event.target.result;
      if (cursor) {
        store.delete(cursor.primaryKey);
        cursor.continue();
      }
    };
  }
}

const cacheManager = new NFTCacheManager();

export const useNFTCache = () => {
  const [loadedImages, setLoadedImages] = useState(new Set());

  useEffect(() => {
    // Clear old cache periodically
    const interval = setInterval(() => {
      cacheManager.clearOldCache();
    }, 60 * 60 * 1000); // Every hour

    return () => clearInterval(interval);
  }, []);

  const getCachedUrl = useCallback(async (originalUrl) => {
    if (!originalUrl) return originalUrl;

    try {
      const cachedBlob = await cacheManager.getCachedMedia(originalUrl);
      if (cachedBlob) {
        return URL.createObjectURL(cachedBlob);
      }

      // Fetch and cache for next time
      const response = await fetch(originalUrl);
      if (response.ok) {
        const blob = await response.blob();
        await cacheManager.cacheMedia(originalUrl, blob);
        return URL.createObjectURL(blob);
      }
    } catch (error) {
      console.warn('Cache fetch failed, using original URL:', error);
    }

    return originalUrl;
  }, []);

  const preloadImages = useCallback(async (urls) => {
    await cacheManager.preloadMedia(urls);
  }, []);

  const markAsLoaded = useCallback((url) => {
    setLoadedImages(prev => new Set(prev).add(url));
  }, []);

  const isLoaded = useCallback((url) => {
    return loadedImages.has(url);
  }, [loadedImages]);

  return {
    getCachedUrl,
    preloadImages,
    markAsLoaded,
    isLoaded,
    clearCache: () => cacheManager.clearOldCache()
  };
};

export default useNFTCache;