/**
 * LocalizationChecker Background Service Worker
 * Handles data processing, storage, and coordination
 */

// Initialize default settings on install
chrome.runtime.onInstalled.addListener(async (details) => {
  if (details.reason === 'install') {
    const defaultSettings = {
      targetRegion: 'India',
      targetLanguage: 'Hindi',
      excludeCommonNouns: false,
      detectionThreshold: 0.85,
      customExclusions: [],
      autoAnalyze: false
    };
    
    await chrome.storage.local.set({ settings: defaultSettings });
    console.log('LocalizationChecker installed with default settings');
  }
});

// Handle messages from content scripts and popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getSettings') {
    chrome.storage.local.get(['settings'], (result) => {
      sendResponse({ success: true, settings: result.settings });
    });
    return true;
  }
  
  if (request.action === 'saveSettings') {
    chrome.storage.local.set({ settings: request.settings }, () => {
      sendResponse({ success: true });
    });
    return true;
  }
  
  if (request.action === 'getResults') {
    chrome.storage.local.get(['analysisResults', 'analysisUrl', 'analysisTimestamp'], (result) => {
      sendResponse({ 
        success: true, 
        results: result.analysisResults,
        url: result.analysisUrl,
        timestamp: result.analysisTimestamp
      });
    });
    return true;
  }
  
  if (request.action === 'clearResults') {
    chrome.storage.local.remove(['analysisResults', 'analysisUrl', 'analysisTimestamp'], () => {
      sendResponse({ success: true });
    });
    return true;
  }
});

// Regional language mappings
const REGION_LANGUAGE_MAP = {
  'India': ['Hindi', 'Telugu', 'Tamil', 'Kannada', 'Marathi'],
  'France': ['French'],
  'Spain': ['Spanish', 'Catalan'],
  'Germany': ['German'],
  'Japan': ['Japanese'],
  'China': ['Simplified Chinese', 'Traditional Chinese'],
  'Mexico': ['Spanish'],
  'Brazil': ['Portuguese']
};

const LANGUAGE_CODES = {
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
  'Simplified Chinese': 'zh-CN',
  'Traditional Chinese': 'zh-TW',
  'Portuguese': 'pt-BR'
};

// Expose region-language mapping
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getRegionLanguageMap') {
    sendResponse({ 
      success: true, 
      map: REGION_LANGUAGE_MAP,
      codes: LANGUAGE_CODES
    });
    return true;
  }
});

console.log('LocalizationChecker background service worker loaded');

