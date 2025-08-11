// Text-to-Speech Service using ElevenLabs API with Browser TTS fallback
import audioCache from './audioCache';

const ELEVENLABS_API_KEY = process.env.REACT_APP_ELEVENLABS_API_KEY;
const DEBUG_ENABLED = process.env.REACT_APP_DEBUG_ENABLED === 'true';
const TTS_ENABLED = process.env.REACT_APP_TTS_ENABLED === 'true';

// Voice IDs for different languages (ElevenLabs multilingual voices)
const VOICE_IDS = {
  'es': 'IKne3meq5aSn9XLyUdCD', // Spanish voice - Ana
  'en': '21m00Tcm4TlvDq8ikWAM', // English voice - Rachel
  'pt': 'Zlb1dXrM653N07WRdFW3', // Portuguese voice - Domi
  'fr': 'oWAxZDx7w5VEj9dCyTzz', // French voice - Grace
};

// Fallback to free multilingual model if no specific voice
const MULTILINGUAL_VOICE_ID = 'pMsXgVXv3BLzUgSXRplE'; // Serena - multilingual

// Mobile detection
const isMobile = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

class TextToSpeechService {
  constructor() {
    this.audio = null;
    this.isPlaying = false;
    this.isPaused = false;
  }

  log(message, data = null) {
    if (DEBUG_ENABLED) {
      const platform = isMobile() ? '[Mobile]' : '[Desktop]';
      console.log(`[TTS Service] ${platform} ${message}`, data || '');
    }
  }

  async generateSpeech(text, language = 'en') {
    // Check if TTS is enabled at all
    if (!TTS_ENABLED) {
      throw new Error('TTS is disabled in configuration');
    }

    // Check cache first (with timeout for mobile)
    try {
      const cachePromise = audioCache.getCachedAudio(text, language);
      const timeoutPromise = new Promise((resolve) => 
        setTimeout(() => resolve(null), 2000) // 2 second timeout
      );
      
      const cachedAudio = await Promise.race([cachePromise, timeoutPromise]);
      
      if (cachedAudio) {
        this.log(`Using cached audio (${cachedAudio.age} minutes old)`);
        return cachedAudio.url;
      }
    } catch (error) {
      this.log('Cache check failed, continuing without cache');
    }

    // Check if API key exists
    if (ELEVENLABS_API_KEY && ELEVENLABS_API_KEY !== 'your_elevenlabs_api_key_here') {
      this.log('ElevenLabs API Key detected');
    } else {
      this.log('No valid ElevenLabs API Key found, using browser TTS');
    }

    // Try ElevenLabs first if API key exists and is valid format
    if (ELEVENLABS_API_KEY && ELEVENLABS_API_KEY !== 'your_elevenlabs_api_key_here') {
      const voiceId = VOICE_IDS[language] || MULTILINGUAL_VOICE_ID;
      this.log(`Generating new audio for language: ${language}`);

      try {
        // Add timeout to API request (15 seconds)
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000);
        
        const response = await fetch(
          `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
          {
            method: 'POST',
            headers: {
              'Accept': 'audio/mpeg',
              'Content-Type': 'application/json',
              'xi-api-key': ELEVENLABS_API_KEY,
            },
            body: JSON.stringify({
              text: text,
              model_id: 'eleven_multilingual_v2',
              voice_settings: {
                stability: 0.5,
                similarity_boost: 0.5,
                style: 0.5,
                use_speaker_boost: true
              }
            }),
            signal: controller.signal
          }
        );
        
        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorText = await response.text();
          this.log(`API error: ${response.status}`);
          throw new Error(`ElevenLabs API error: ${response.status}`);
        }

        const audioBlob = await response.blob();
        
        // Cache the audio for future use (with timeout)
        try {
          const cachePromise = audioCache.cacheAudio(text, language, audioBlob);
          const timeoutPromise = new Promise((resolve) => 
            setTimeout(() => resolve(), 1000) // 1 second timeout for caching
          );
          await Promise.race([cachePromise, timeoutPromise]);
          this.log('Audio cached for future use');
        } catch (cacheError) {
          this.log('Failed to cache audio (non-blocking)');
        }
        
        const audioUrl = URL.createObjectURL(audioBlob);
        
        this.log('Audio loaded successfully');
        return audioUrl;
      } catch (error) {
        if (error.name === 'AbortError') {
          this.log('API request timed out, falling back to browser TTS');
        } else {
          this.log('API failed, falling back to browser TTS');
        }
        // Fall through to browser TTS
      }
    } else {
      this.log('Using browser TTS');
    }

    // Always fallback to browser TTS
    return this.fallbackToBrowserTTS(text, language);
  }

  fallbackToBrowserTTS(text, language) {
    this.log('Using browser TTS as fallback');
    
    if (!('speechSynthesis' in window)) {
      throw new Error('Browser does not support text-to-speech');
    }

    // This will use the browser's built-in TTS
    return { 
      text, 
      language, 
      useBrowserTTS: true 
    };
  }

  async play(text, language = 'en', onStart, onEnd, onPause) {
    try {
      const result = await this.generateSpeech(text, language);
      
      if (result.useBrowserTTS) {
        // Use browser TTS
        this.playBrowserTTS(text, language, onStart, onEnd, onPause);
      } else {
        // Use ElevenLabs audio
        this.playAudio(result, onStart, onEnd, onPause);
      }
    } catch (error) {
      this.log('Error playing speech', error);
      throw error;
    }
  }

  playAudio(audioUrl, onStart, onEnd, onPause) {
    if (this.audio) {
      this.audio.pause();
      URL.revokeObjectURL(this.audio.src);
    }

    this.audio = new Audio(audioUrl);
    
    this.audio.onplay = () => {
      this.isPlaying = true;
      this.isPaused = false;
      if (onStart) onStart();
    };

    this.audio.onended = () => {
      this.isPlaying = false;
      this.isPaused = false;
      URL.revokeObjectURL(audioUrl);
      if (onEnd) onEnd();
    };

    this.audio.onpause = () => {
      this.isPaused = true;
      if (onPause) onPause();
    };

    this.audio.play().catch(error => {
      this.log('Error playing audio', error);
      this.isPlaying = false;
    });
  }

  playBrowserTTS(text, language, onStart, onEnd, onPause) {
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Set language code
    const langCode = this.getLanguageCode(language);
    utterance.lang = langCode;
    
    // Try to find a voice for the language
    const voices = window.speechSynthesis.getVoices();
    const voiceForLang = voices.find(v => v.lang.startsWith(language) || v.lang.startsWith(langCode.split('-')[0]));
    if (voiceForLang) {
      utterance.voice = voiceForLang;
      this.log(`Browser TTS using voice: ${voiceForLang.name} (${voiceForLang.lang})`);
    } else {
      this.log(`Browser TTS using default voice for language: ${langCode}`);
    }
    
    // Adjust rate for better pronunciation (even if it sounds bad)
    utterance.rate = language === 'es' ? 0.85 : 0.9;
    utterance.pitch = 1;
    utterance.volume = 1;

    utterance.onstart = () => {
      this.isPlaying = true;
      this.isPaused = false;
      if (onStart) onStart();
    };

    utterance.onend = () => {
      this.isPlaying = false;
      this.isPaused = false;
      if (onEnd) onEnd();
    };

    utterance.onpause = () => {
      this.isPaused = true;
      if (onPause) onPause();
    };

    utterance.onerror = (event) => {
      this.log('Browser TTS error:', event.error);
      this.isPlaying = false;
      this.isPaused = false;
      if (onEnd) onEnd();
    };

    window.speechSynthesis.speak(utterance);
  }

  pause() {
    if (this.audio && this.isPlaying) {
      this.audio.pause();
    } else if (window.speechSynthesis.speaking) {
      window.speechSynthesis.pause();
    }
    this.isPaused = true;
  }

  resume() {
    if (this.audio && this.isPaused) {
      this.audio.play();
    } else if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }
    this.isPaused = false;
  }

  stop() {
    if (this.audio) {
      this.audio.pause();
      this.audio.currentTime = 0;
      URL.revokeObjectURL(this.audio.src);
      this.audio = null;
    }
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    this.isPlaying = false;
    this.isPaused = false;
  }

  getLanguageCode(language) {
    const codes = {
      'es': 'es-ES',
      'en': 'en-US',
      'pt': 'pt-BR',
      'fr': 'fr-FR'
    };
    return codes[language] || 'en-US';
  }

  // Cache management methods
  async getCacheStats() {
    try {
      return await audioCache.getCacheStats();
    } catch (error) {
      this.log('Error getting cache stats', error);
      return null;
    }
  }

  async clearCache() {
    try {
      await audioCache.clearAllCache();
      this.log('Audio cache cleared');
    } catch (error) {
      this.log('Error clearing cache', error);
    }
  }
}

export default new TextToSpeechService();