// Audio Cache Service using IndexedDB for TTS caching
const DEBUG_ENABLED = process.env.REACT_APP_DEBUG_ENABLED === 'true';
const CACHE_EXPIRY_MS = 60 * 60 * 1000; // 1 hour
const DB_NAME = 'UVDAudioCache';
const DB_VERSION = 1;
const STORE_NAME = 'audioCache';

class AudioCacheService {
  constructor() {
    this.db = null;
    this.initPromise = this.initDB();
  }

  log(message, data = null) {
    if (DEBUG_ENABLED) {
      console.log(`[Audio Cache] ${message}`, data || '');
    }
  }

  async initDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        this.log('Failed to open IndexedDB');
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        this.log('IndexedDB initialized');
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        
        // Create object store if it doesn't exist
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
          store.createIndex('timestamp', 'timestamp', { unique: false });
          this.log('Created audio cache store');
        }
      };
    });
  }

  // Generate cache key from text and language
  generateCacheKey(text, language) {
    // Create a simple hash of the text
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      const char = text.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return `tts_${language}_${Math.abs(hash)}`;
  }

  async getCachedAudio(text, language) {
    try {
      await this.initPromise;
      
      const cacheKey = this.generateCacheKey(text, language);
      
      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction([STORE_NAME], 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.get(cacheKey);

        request.onsuccess = () => {
          const data = request.result;
          
          if (!data) {
            this.log(`Cache miss for key: ${cacheKey}`);
            resolve(null);
            return;
          }

          // Check if cache is expired
          const now = Date.now();
          const age = now - data.timestamp;
          
          if (age > CACHE_EXPIRY_MS) {
            this.log(`Cache expired for key: ${cacheKey} (age: ${Math.round(age / 1000 / 60)} minutes)`);
            // Delete expired cache
            this.deleteCachedAudio(cacheKey);
            resolve(null);
            return;
          }

          this.log(`Cache hit for key: ${cacheKey} (age: ${Math.round(age / 1000 / 60)} minutes)`);
          
          // Convert array buffer back to blob
          const blob = new Blob([data.audioData], { type: 'audio/mpeg' });
          const audioUrl = URL.createObjectURL(blob);
          
          resolve({
            url: audioUrl,
            cached: true,
            age: Math.round(age / 1000 / 60) // age in minutes
          });
        };

        request.onerror = () => {
          this.log('Error reading from cache', request.error);
          reject(request.error);
        };
      });
    } catch (error) {
      this.log('Error getting cached audio', error);
      return null;
    }
  }

  async cacheAudio(text, language, audioBlob) {
    try {
      await this.initPromise;
      
      const cacheKey = this.generateCacheKey(text, language);
      
      // Convert blob to array buffer for storage
      const arrayBuffer = await audioBlob.arrayBuffer();
      
      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        
        const data = {
          id: cacheKey,
          audioData: arrayBuffer,
          timestamp: Date.now(),
          language: language,
          textLength: text.length // Store text length for debugging
        };
        
        const request = store.put(data);

        request.onsuccess = () => {
          this.log(`Audio cached successfully for key: ${cacheKey}`);
          resolve();
        };

        request.onerror = () => {
          this.log('Error caching audio', request.error);
          reject(request.error);
        };
      });
    } catch (error) {
      this.log('Error caching audio', error);
    }
  }

  async deleteCachedAudio(cacheKey) {
    try {
      await this.initPromise;
      
      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.delete(cacheKey);

        request.onsuccess = () => {
          this.log(`Deleted cache for key: ${cacheKey}`);
          resolve();
        };

        request.onerror = () => {
          this.log('Error deleting cache', request.error);
          reject(request.error);
        };
      });
    } catch (error) {
      this.log('Error deleting cached audio', error);
    }
  }

  async clearAllCache() {
    try {
      await this.initPromise;
      
      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.clear();

        request.onsuccess = () => {
          this.log('All audio cache cleared');
          resolve();
        };

        request.onerror = () => {
          this.log('Error clearing cache', request.error);
          reject(request.error);
        };
      });
    } catch (error) {
      this.log('Error clearing all cache', error);
    }
  }

  async getCacheStats() {
    try {
      await this.initPromise;
      
      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction([STORE_NAME], 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.getAll();

        request.onsuccess = () => {
          const items = request.result;
          const now = Date.now();
          
          const stats = {
            totalItems: items.length,
            totalSize: 0,
            expiredItems: 0,
            validItems: 0,
            languages: {},
            oldestCache: null,
            newestCache: null
          };
          
          items.forEach(item => {
            stats.totalSize += item.audioData.byteLength;
            
            const age = now - item.timestamp;
            if (age > CACHE_EXPIRY_MS) {
              stats.expiredItems++;
            } else {
              stats.validItems++;
            }
            
            // Count by language
            stats.languages[item.language] = (stats.languages[item.language] || 0) + 1;
            
            // Track oldest and newest
            if (!stats.oldestCache || item.timestamp < stats.oldestCache) {
              stats.oldestCache = item.timestamp;
            }
            if (!stats.newestCache || item.timestamp > stats.newestCache) {
              stats.newestCache = item.timestamp;
            }
          });
          
          // Convert size to MB
          stats.totalSizeMB = (stats.totalSize / 1024 / 1024).toFixed(2);
          
          // Convert timestamps to age in minutes
          if (stats.oldestCache) {
            stats.oldestCacheMinutes = Math.round((now - stats.oldestCache) / 1000 / 60);
          }
          if (stats.newestCache) {
            stats.newestCacheMinutes = Math.round((now - stats.newestCache) / 1000 / 60);
          }
          
          this.log('Cache stats', stats);
          resolve(stats);
        };

        request.onerror = () => {
          this.log('Error getting cache stats', request.error);
          reject(request.error);
        };
      });
    } catch (error) {
      this.log('Error getting cache stats', error);
      return null;
    }
  }
}

export default new AudioCacheService();