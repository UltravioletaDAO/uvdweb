// Stream Summaries Service - Fetches stream summary data from S3
const DEBUG_ENABLED = process.env.REACT_APP_DEBUG_ENABLED === 'true';

// S3 Base URL for stream summaries
const S3_BASE_URL = 'https://ultravioletadao.s3.us-east-1.amazonaws.com';

class StreamSummariesService {
  constructor() {
    this.cache = new Map();
    this.cacheExpiry = 5 * 60 * 1000; // 5 minutes cache
    this.currentLanguage = 'es'; // Default language
  }

  /**
   * Set current language for fetching summaries
   * @param {string} language - Language code (es, en, pt, fr)
   */
  setLanguage(language) {
    this.currentLanguage = language;
    this.log(`Language set to: ${language}`);
  }

  log(message, data = null) {
    if (DEBUG_ENABLED) {
      console.log(`[Stream Summaries] ${message}`, data || '');
    }
  }

  /**
   * Fetch global stream summaries index from S3
   * Fetches stream-summaries/index_{language}.json
   * Falls back to local if S3 fails
   * @returns {Promise<Object>} Index data with all summaries
   */
  async fetchIndex() {
    try {
      const cacheKey = `index_${this.currentLanguage}`;
      const cached = this.getFromCache(cacheKey);

      if (cached) {
        this.log('Returning cached index data');
        return cached;
      }

      // Try S3 global index first: stream-summaries/index_{language}.json
      const s3Url = `${S3_BASE_URL}/stream-summaries/index_${this.currentLanguage}.json`;
      this.log('Fetching global index from S3', { url: s3Url });

      try {
        const s3Response = await fetch(s3Url);

        if (s3Response.ok) {
          const data = await s3Response.json();

          // Count streams per streamer
          const streamersCount = {};
          data.streams.forEach(stream => {
            const streamer = stream.streamer;
            streamersCount[streamer] = (streamersCount[streamer] || 0) + 1;
          });

          // Transform to match expected frontend format
          const transformedData = {
            ultima_actualizacion: data.ultima_actualizacion,
            total_resumenes: data.total_streams,
            streamers: streamersCount,
            resumenes: data.streams
          };

          this.log('Global index fetched successfully from S3', {
            total: transformedData.total_resumenes,
            streamers: Object.keys(streamersCount).length
          });

          this.setCache(cacheKey, transformedData);
          return transformedData;
        }
      } catch (s3Error) {
        this.log('S3 global index fetch failed, trying local fallback', s3Error);
      }

      // Fallback to local file
      const localUrl = '/stream-summaries/index.json';
      this.log('Fetching index.json from local fallback', { url: localUrl });
      const response = await fetch(localUrl);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      this.log('Index data fetched successfully from local', { total: data.total_resumenes });

      this.setCache(cacheKey, data);
      return data;
    } catch (error) {
      this.log('Error fetching index (both S3 and local failed)', error);
      throw error;
    }
  }

  /**
   * Fetch a specific stream summary by streamer, date, and video_id
   * Tries S3 first: stream-summaries/{streamer}/{fecha_stream}/{video_id}.{language}.json
   * Falls back to local file if S3 fails
   * @param {string} streamer - Streamer username
   * @param {string} videoId - Twitch video ID
   * @param {string} fechaStream - Stream date in YYYYMMDD format (e.g., '20251009')
   * @returns {Promise<Object>} Full stream summary data
   */
  async fetchSummary(streamer, videoId = null, fechaStream = null) {
    try {
      const cacheKey = `summary_${streamer}_${videoId || 'latest'}_${this.currentLanguage}`;
      const cached = this.getFromCache(cacheKey);

      if (cached) {
        this.log('Returning cached summary data', { streamer, videoId, language: this.currentLanguage });
        return cached;
      }

      // Try S3 first: stream-summaries/{streamer}/{fecha_stream}/{video_id}.{language}.json
      if (videoId && fechaStream) {
        const s3Url = `${S3_BASE_URL}/stream-summaries/${streamer}/${fechaStream}/${videoId}.${this.currentLanguage}.json`;
        this.log('Attempting to fetch summary from S3', { url: s3Url });

        try {
          const s3Response = await fetch(s3Url);

          if (s3Response.ok) {
            const data = await s3Response.json();
            this.log('✅ Summary data fetched successfully from S3', {
              streamer: data.metadata?.streamer,
              video_id: data.metadata?.video_id,
              language: this.currentLanguage
            });
            this.setCache(cacheKey, data);
            return data;
          } else {
            this.log('❌ S3 summary fetch failed with status', { status: s3Response.status, statusText: s3Response.statusText });
          }
        } catch (s3Error) {
          this.log('❌ S3 summary fetch failed with error', { error: s3Error.message, type: s3Error.name });
        }
      } else {
        this.log('⚠️ Missing parameters for S3 fetch', { videoId, fechaStream });
      }

      // Fallback to local file (language-agnostic for now)
      const localUrl = `/stream-summaries/resumen_${streamer}_example.json`;
      this.log('⚠️ Using LOCAL FALLBACK for summary', { url: localUrl });
      const response = await fetch(localUrl);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      this.log('Summary data fetched successfully from local', {
        streamer: data.metadata?.streamer,
        video_id: data.metadata?.video_id
      });

      this.setCache(cacheKey, data);
      return data;
    } catch (error) {
      this.log('Error fetching summary (both S3 and local failed)', error);
      throw error;
    }
  }

  /**
   * Fetch summaries with pagination
   * @param {number} page - Page number (1-indexed)
   * @param {number} perPage - Items per page
   * @returns {Promise<Object>} Paginated summaries data
   */
  async fetchPaginatedSummaries(page = 1, perPage = 10) {
    try {
      const indexData = await this.fetchIndex();
      const startIndex = (page - 1) * perPage;
      const endIndex = startIndex + perPage;

      const paginatedSummaries = indexData.resumenes.slice(startIndex, endIndex);

      return {
        summaries: paginatedSummaries,
        currentPage: page,
        totalPages: Math.ceil(indexData.resumenes.length / perPage),
        totalSummaries: indexData.resumenes.length,
        streamers: indexData.streamers,
        lastUpdate: indexData.ultima_actualizacion
      };
    } catch (error) {
      this.log('Error fetching paginated summaries', error);
      throw error;
    }
  }

  /**
   * Fetch summaries filtered by streamer
   * @param {string} streamer - Streamer username
   * @returns {Promise<Array>} Array of summaries for the specified streamer
   */
  async fetchByStreamer(streamer) {
    try {
      const indexData = await this.fetchIndex();
      const filtered = indexData.resumenes.filter(
        summary => summary.streamer.toLowerCase() === streamer.toLowerCase()
      );

      this.log(`Found ${filtered.length} summaries for streamer: ${streamer}`);
      return filtered;
    } catch (error) {
      this.log('Error fetching summaries by streamer', error);
      throw error;
    }
  }

  /**
   * Cache management
   */
  getFromCache(key) {
    const cached = this.cache.get(key);
    if (!cached) return null;

    const now = Date.now();
    if (now - cached.timestamp > this.cacheExpiry) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  setCache(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  clearCache() {
    this.cache.clear();
    this.log('Cache cleared');
  }
}

export default new StreamSummariesService();
