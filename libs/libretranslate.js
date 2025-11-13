/**
 * LibreTranslate API Integration
 * Free and open-source translation API
 */

class LibreTranslateAPI {
  constructor(apiUrl = 'https://libretranslate.com', apiKey = null) {
    this.apiUrl = apiUrl;
    this.apiKey = apiKey;
    this.cache = new Map();
  }

  /**
   * Translate text using LibreTranslate API
   */
  async translate(text, sourceLang, targetLang) {
    // Check cache first
    const cacheKey = `${text}|${sourceLang}|${targetLang}`;
    if (this.cache.has(cacheKey)) {
      console.log('Using cached translation:', cacheKey);
      return this.cache.get(cacheKey);
    }

    try {
      const endpoint = `${this.apiUrl}/translate`;
      const body = {
        q: text,
        source: sourceLang,
        target: targetLang,
        format: 'text'
      };

      if (this.apiKey) {
        body.api_key = this.apiKey;
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        throw new Error(`LibreTranslate API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      // Cache the result
      this.cache.set(cacheKey, data.translatedText);
      
      return data.translatedText;
    } catch (error) {
      console.error('LibreTranslate translation error:', error);
      throw error;
    }
  }

  /**
   * Test API connection
   */
  async testConnection() {
    try {
      const result = await this.translate('Hello', 'en', 'es');
      return {
        success: true,
        message: 'Connection successful!',
        testTranslation: result
      };
    } catch (error) {
      return {
        success: false,
        message: `Connection failed: ${error.message}`,
        error: error
      };
    }
  }

  /**
   * Get supported languages
   */
  async getLanguages() {
    try {
      const endpoint = `${this.apiUrl}/languages`;
      const response = await fetch(endpoint);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch languages: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching languages:', error);
      return this.getDefaultLanguages();
    }
  }

  /**
   * Default language mapping (fallback)
   */
  getDefaultLanguages() {
    return [
      { code: 'en', name: 'English' },
      { code: 'pt', name: 'Portuguese' },
      { code: 'es', name: 'Spanish' },
      { code: 'fr', name: 'French' },
      { code: 'de', name: 'German' },
      { code: 'it', name: 'Italian' },
      { code: 'ja', name: 'Japanese' },
      { code: 'zh', name: 'Chinese' },
      { code: 'ar', name: 'Arabic' },
      { code: 'hi', name: 'Hindi' },
      { code: 'ru', name: 'Russian' }
    ];
  }

  /**
   * Convert our language names to LibreTranslate codes
   */
  getLibreTranslateCode(languageName) {
    const languageMap = {
      'Hindi': 'hi',
      'Telugu': 'te',
      'Tamil': 'ta',
      'Kannada': 'kn',
      'Marathi': 'mr',
      'French': 'fr',
      'Spanish': 'es',
      'Catalan': 'ca',
      'German': 'de',
      'Japanese': 'ja',
      'Simplified Chinese': 'zh',
      'Traditional Chinese': 'zh',
      'Portuguese': 'pt',
      'Italian': 'it',
      'Russian': 'ru',
      'Arabic': 'ar',
      'English': 'en'
    };
    return languageMap[languageName] || 'en';
  }

  /**
   * Clear cache
   */
  clearCache() {
    this.cache.clear();
    console.log('Translation cache cleared');
  }

  /**
   * Get cache size
   */
  getCacheSize() {
    return this.cache.size;
  }

  /**
   * Map language names to LibreTranslate codes
   * @param {string} languageName Language name (e.g., 'Portuguese')
   * @returns {string} LibreTranslate language code (e.g., 'pt')
   */
  getLibreTranslateCode(languageName) {
    const mapping = {
      'Portuguese': 'pt',
      'Spanish': 'es',
      'French': 'fr',
      'German': 'de',
      'Italian': 'it',
      'Dutch': 'nl',
      'Polish': 'pl',
      'Russian': 'ru',
      'Japanese': 'ja',
      'Korean': 'ko',
      'Chinese': 'zh',
      'Arabic': 'ar',
      'Hindi': 'hi',
      'Turkish': 'tr',
      'Vietnamese': 'vi',
      'Thai': 'th',
      'Indonesian': 'id',
      'Malay': 'ms',
      'Filipino': 'fil',
      'Tagalog': 'tl',
      'Bengali': 'bn',
      'Tamil': 'ta',
      'Telugu': 'te',
      'Marathi': 'mr',
      'Gujarati': 'gu',
      'Kannada': 'kn',
      'Malayalam': 'ml',
      'Punjabi': 'pa',
      'Urdu': 'ur',
      'Nepali': 'ne',
      'Sinhala': 'si',
      'Burmese': 'my',
      'Khmer': 'km',
      'Lao': 'lo',
      'Mongolian': 'mn',
      'Kazakh': 'kk',
      'Uzbek': 'uz',
      'Azerbaijani': 'az',
      'Georgian': 'ka',
      'Armenian': 'hy',
      'Hebrew': 'he',
      'Amharic': 'am',
      'Swahili': 'sw',
      'Zulu': 'zu',
      'Afrikaans': 'af',
      'Somali': 'so',
      'Hausa': 'ha',
      'Yoruba': 'yo',
      'Igbo': 'ig',
      'Xhosa': 'xh',
      'Shona': 'sn'
    };
    return mapping[languageName] || 'en';
  }
}

// Make it available globally
window.LibreTranslateAPI = LibreTranslateAPI;

