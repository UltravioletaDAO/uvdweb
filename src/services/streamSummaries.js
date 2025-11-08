// Stream Summaries Service - Fetches stream summary data from ECS Fargate API with x402 payment support
const DEBUG_ENABLED = process.env.REACT_APP_DEBUG_ENABLED === 'true';

// ECS Fargate API URL (ALB endpoint)
// Falls back to S3 if not set
const API_BASE_URL = process.env.REACT_APP_STREAM_SUMMARIES_API;
const S3_BASE_URL = 'https://ultravioletadao.s3.us-east-1.amazonaws.com';

// x402 Payment Error
class PaymentRequiredError extends Error {
  constructor(message, paymentDetails) {
    super(message);
    this.name = 'PaymentRequiredError';
    this.paymentDetails = paymentDetails;
    this.status = 402;
  }
}

class StreamSummariesService {
  constructor() {
    this.cache = new Map();
    this.cacheExpiry = 5 * 60 * 1000; // 5 minutes cache
    this.currentLanguage = 'es'; // Default language (always use 2-letter codes: es, en, pt, fr)
  }

  /**
   * Set current language for fetching summaries
   * @param {string} language - Language code (es, en, pt, fr) or full locale (en-US, es-MX, etc.)
   */
  setLanguage(language) {
    // Normalize language code: extract just the first 2 letters (en-US → en, es-MX → es, etc.)
    this.currentLanguage = language.split('-')[0].toLowerCase();
    this.log(`Language normalized: ${language} → ${this.currentLanguage}`);
  }

  log(message, data = null) {
    if (DEBUG_ENABLED) {
      console.log(`[Stream Summaries] ${message}`, data || '');
    }
  }

  /**
   * Fetch global stream summaries index
   * Tries ECS Fargate API first (if configured), then S3, then local fallback
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

      // Try ECS Fargate API first (if configured)
      if (API_BASE_URL) {
        try {
          const apiUrl = `${API_BASE_URL}/summaries?lang=${this.currentLanguage}`;
          this.log('Fetching index from ECS Fargate API', { url: apiUrl });

          const apiResponse = await fetch(apiUrl);

          if (apiResponse.ok) {
            const { success, data } = await apiResponse.json();

            if (success) {
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

              this.log('Index fetched successfully from ECS Fargate API', {
                total: transformedData.total_resumenes,
                streamers: Object.keys(streamersCount).length
              });

              this.setCache(cacheKey, transformedData);
              return transformedData;
            }
          }
        } catch (apiError) {
          this.log('ECS Fargate API index fetch failed, falling back to S3', apiError);
        }
      }

      // Fallback to S3: stream-summaries/index_{language}.json
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
      this.log('Error fetching index (all sources failed)', error);
      throw error;
    }
  }

  /**
   * Fetch a specific stream summary by streamer, date, and video_id
   * Tries ECS Fargate API first (with x402 payment support), then S3 fallback
   * @param {string} streamer - Streamer username
   * @param {string} videoId - Twitch video ID
   * @param {string} fechaStream - Stream date in YYYYMMDD format (e.g., '20251009')
   * @param {Object} paymentProof - Optional payment proof for x402 (from useX402Payment hook)
   * @returns {Promise<Object>} Full stream summary data
   * @throws {PaymentRequiredError} If content requires payment (402)
   */
  async fetchSummary(streamer, videoId = null, fechaStream = null, paymentProof = null) {
    try {
      const cacheKey = `summary_${streamer}_${videoId || 'latest'}_${this.currentLanguage}`;
      const cached = this.getFromCache(cacheKey);

      if (cached) {
        this.log('Returning cached summary data', { streamer, videoId, language: this.currentLanguage });
        return cached;
      }

      if (!videoId || !fechaStream) {
        const errorMsg = `Missing required parameters - videoId: ${videoId}, fechaStream: ${fechaStream}`;
        this.log('❌ ' + errorMsg);
        throw new Error(errorMsg);
      }

      // Try ECS Fargate API first (if configured)
      if (API_BASE_URL) {
        try {
          const apiUrl = `${API_BASE_URL}/summaries/${videoId}?lang=${this.currentLanguage}`;
          this.log('Fetching summary from ECS Fargate API', { url: apiUrl });

          const headers = {};
          if (paymentProof) {
            headers['X-PAYMENT'] = JSON.stringify(paymentProof);
            this.log('Including payment proof in request', { txHash: paymentProof.txHash });
          }

          const apiResponse = await fetch(apiUrl, { headers });

          // Handle 402 Payment Required
          if (apiResponse.status === 402) {
            this.log('💳 Payment required for this content');
            const errorData = await apiResponse.json();

            // Parse x402-express format response
            const accepts = errorData.accepts?.[0] || {};
            const maxAmount = accepts.maxAmountRequired || '50000'; // USDC has 6 decimals
            const priceUSD = (parseInt(maxAmount) / 1000000).toString(); // Convert to USD

            throw new PaymentRequiredError('Payment required to access this content', {
              videoId,
              streamer,
              price: priceUSD,
              receivingWallet: accepts.payTo || '0x52110a2Cc8B6bBf846101265edAAe34E753f3389',
              title: `Stream Summary - ${streamer}`,
              // Store x402 details for payment verification
              x402Details: {
                network: accepts.network,
                asset: accepts.asset,
                maxAmountRequired: accepts.maxAmountRequired,
                resource: accepts.resource
              }
            });
          }

          if (apiResponse.ok) {
            const { success, data } = await apiResponse.json();

            if (success) {
              this.log('✅ Summary fetched successfully from ECS Fargate API', {
                streamer: data.metadata?.streamer,
                video_id: data.metadata?.video_id,
                language: this.currentLanguage
              });

              this.setCache(cacheKey, data);
              return data;
            }
          }
        } catch (error) {
          // Re-throw PaymentRequiredError
          if (error instanceof PaymentRequiredError) {
            throw error;
          }
          this.log('ECS Fargate API summary fetch failed, falling back to S3', error);
        }
      }

      // Fallback to S3: stream-summaries/{streamer}/{fecha_stream}/{video_id}.{language}.json
      const s3Url = `${S3_BASE_URL}/stream-summaries/${streamer}/${fechaStream}/${videoId}.${this.currentLanguage}.json`;
      this.log('Fetching summary from S3', { url: s3Url });

      const s3Response = await fetch(s3Url);

      if (!s3Response.ok) {
        const errorMsg = `S3 fetch failed with status ${s3Response.status}: ${s3Response.statusText} - URL: ${s3Url}`;
        this.log('❌ ' + errorMsg);
        throw new Error(errorMsg);
      }

      const data = await s3Response.json();
      this.log('✅ Summary fetched successfully from S3', {
        streamer: data.metadata?.streamer,
        video_id: data.metadata?.video_id,
        language: this.currentLanguage
      });

      this.setCache(cacheKey, data);
      return data;
    } catch (error) {
      this.log('Error fetching summary', error);
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

const streamSummariesServiceInstance = new StreamSummariesService();
export default streamSummariesServiceInstance;
export { PaymentRequiredError };
