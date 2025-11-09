/**
 * LocalizationChecker Content Script
 * Analyzes DOM for English text and validates localization
 */

class LocalizationAnalyzer {
  constructor() {
    this.results = {
      totalElements: 0,
      localizedCount: 0,
      nonLocalizedCount: 0,
      excludedCount: 0,
      findings: []
    };
    this.settings = {
      targetRegion: 'India',
      targetLanguage: 'Hindi',
      detectionThreshold: 0.85,
      customExclusions: [],
      // Translation verification - ENABLED BY DEFAULT
      enableVerification: true,
      libretranslateUrl: 'http://localhost:5001',
      verificationApiKey: '',
      cacheTranslations: true,
      verificationMode: 'all',
      verificationType: 'language-only' // Default to language detection only
    };
  }

  /**
   * Initialize analyzer with settings from storage
   */
  async init() {
    try {
      const stored = await chrome.storage.local.get(['settings']);
      console.log('Loaded settings from storage:', stored.settings);
      if (stored.settings) {
        this.settings = { ...this.settings, ...stored.settings };
      }
      
      console.log('Current settings after merge:', this.settings);
      console.log('enableVerification:', this.settings.enableVerification);
      console.log('verificationType:', this.settings.verificationType);
      console.log('LibreTranslateAPI available:', typeof LibreTranslateAPI !== 'undefined');
      
      // Initialize LibreTranslate API if verification is enabled
      if (this.settings.enableVerification && typeof LibreTranslateAPI !== 'undefined') {
        const apiUrl = this.settings.libretranslateUrl || 'https://libretranslate.com';
        const apiKey = this.settings.verificationApiKey || null;
        this.translator = new LibreTranslateAPI(apiUrl, apiKey);
        console.log('✓ Translation verification enabled:', apiUrl);
      } else {
        this.translator = null;
        console.log('✗ Translation verification NOT enabled');
        if (!this.settings.enableVerification) {
          console.log('  Reason: enableVerification is false');
        }
        if (typeof LibreTranslateAPI === 'undefined') {
          console.log('  Reason: LibreTranslateAPI not loaded');
        }
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  }

  /**
   * Get all visible text nodes from DOM
   */
  getTextNodes(element = document.body) {
    const textNodes = [];
    const walker = document.createTreeWalker(
      element,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode: (node) => {
          // Skip hidden elements, scripts, styles
          const parent = node.parentElement;
          if (!parent) return NodeFilter.FILTER_REJECT;
          
          const style = window.getComputedStyle(parent);
          if (
            style.display === 'none' ||
            style.visibility === 'hidden' ||
            style.opacity === '0' ||
            parent.tagName === 'SCRIPT' ||
            parent.tagName === 'STYLE' ||
            parent.tagName === 'NOSCRIPT'
          ) {
            return NodeFilter.FILTER_REJECT;
          }
          
          // Check if text has meaningful content
          const text = node.textContent.trim();
          if (text.length < 2) return NodeFilter.FILTER_REJECT;
          
          return NodeFilter.FILTER_ACCEPT;
        }
      }
    );

    let node;
    while ((node = walker.nextNode())) {
      textNodes.push(node);
    }

    return textNodes;
  }

  /**
   * Language code mapping for franc.js (ISO 639-3 codes)
   */
  getLanguageCode(language) {
    const languageMap = {
      'Hindi': 'hin',
      'Telugu': 'tel',
      'Tamil': 'tam',
      'Kannada': 'kan',
      'Marathi': 'mar',
      'French': 'fra',
      'Spanish': 'spa',
      'Catalan': 'cat',
      'German': 'deu',
      'Japanese': 'jpn',
      'Simplified Chinese': 'cmn',
      'Traditional Chinese': 'cmn',
      'Portuguese': 'por'
    };
    return languageMap[language] || 'eng';
  }

  /**
   * Detect the language of the text
   */
  detectLanguage(text) {
    // Use franc for language detection
    if (typeof franc === 'undefined') {
      // Fallback: Cannot reliably detect language without franc
      return 'und'; // undetermined
    }
    
    // franc requires minimum text length for accuracy
    if (text.length < 10) {
      // For short text, use franc with all options
      return franc(text, { minLength: 1 });
    }
    
    return franc(text);
  }

  /**
   * Get common words for target language to help with short text detection
   */
  getCommonWords(languageCode) {
    const commonWords = {
      'por': ['por', 'para', 'em', 'de', 'com', 'sem', 'até', 'desde', 'sobre', 'entre', 'noite', 'noites', 'dia', 'dias', 'pessoa', 'pessoas', 'quarto', 'quartos'],
      'spa': ['por', 'para', 'en', 'de', 'con', 'sin', 'hasta', 'desde', 'sobre', 'entre', 'noche', 'noches', 'día', 'días', 'persona', 'personas', 'habitación', 'habitaciones'],
      'fra': ['pour', 'par', 'dans', 'de', 'avec', 'sans', 'jusqu', 'depuis', 'sur', 'entre', 'nuit', 'nuits', 'jour', 'jours', 'personne', 'personnes', 'chambre', 'chambres'],
      'deu': ['für', 'nach', 'in', 'von', 'mit', 'ohne', 'bis', 'seit', 'über', 'zwischen', 'nacht', 'nächte', 'tag', 'tage', 'person', 'personen', 'zimmer'],
      'hin': ['के', 'में', 'से', 'को', 'पर', 'और', 'या', 'है', 'हैं', 'था', 'थे'],
      'tel': ['కి', 'లో', 'నుండి', 'తో', 'పై', 'మరియు', 'లేదా', 'ఉంది', 'ఉన్నాయి'],
      'tam': ['க்கு', 'இல்', 'இருந்து', 'உடன்', 'மேல்', 'மற்றும்', 'அல்லது', 'உள்ளது'],
      'ita': ['per', 'in', 'di', 'da', 'con', 'su', 'tra', 'notte', 'notti', 'giorno', 'giorni', 'persona', 'persone', 'camera', 'camere']
    };
    return commonWords[languageCode] || [];
  }

  /**
   * Check if text is in the target language (properly localized)
   */
  isInTargetLanguage(text) {
    const detected = this.detectLanguage(text);
    const targetCode = this.getLanguageCode(this.settings.targetLanguage);
    
    // If detection failed or undetermined
    if (detected === 'und') {
      // For undetermined, check if it contains non-ASCII characters
      // which suggests it's in a non-English language
      const hasNonAscii = /[^\x00-\x7F]/.test(text);
      if (hasNonAscii) {
        // Contains special characters (likely localized)
        return true;
      }
      
      // For short text with ASCII, check for common words in target language
      // This helps catch phrases like "por 2 noites" (Portuguese)
      const textLower = text.toLowerCase();
      const commonWords = this.getCommonWords(targetCode);
      
      // Check if text contains any common words from target language
      for (const word of commonWords) {
        // Use word boundaries to match whole words
        const wordRegex = new RegExp(`\\b${word}\\b`, 'i');
        if (wordRegex.test(textLower)) {
          // Found a common word in target language
          return true;
        }
      }
      
      // Otherwise, we can't determine
      return false;
    }
    
    // Check if detected language matches target language
    if (detected === targetCode) {
      return true;
    }
    
    // Special case: Spanish and Catalan are similar
    if ((targetCode === 'spa' && detected === 'cat') || 
        (targetCode === 'cat' && detected === 'spa')) {
      return true;
    }
    
    // Special case: Portuguese and Spanish are similar
    if ((targetCode === 'por' && detected === 'spa') || 
        (targetCode === 'spa' && detected === 'por')) {
      // Double-check with common words to reduce false positives
      const textLower = text.toLowerCase();
      const commonWords = this.getCommonWords(targetCode);
      for (const word of commonWords) {
        const wordRegex = new RegExp(`\\b${word}\\b`, 'i');
        if (wordRegex.test(textLower)) {
          return true;
        }
      }
    }
    
    return false;
  }

  /**
   * Check if text is English (needs localization)
   */
  isEnglish(text) {
    const detected = this.detectLanguage(text);
    
    // If detection is undetermined for short text, use heuristics
    if (detected === 'und') {
      // Check if text contains only ASCII characters (likely English)
      const isAsciiOnly = /^[\x00-\x7F]*$/.test(text);
      if (isAsciiOnly && text.length > 0) {
        // Probably English
        return true;
      }
      return false;
    }
    
    return detected === 'eng';
  }

  /**
   * Extract POS tags and identify nouns
   */
  analyzePOS(text) {
    if (typeof nlp === 'undefined') {
      return { hasProperNouns: false, hasCommonNouns: false, tags: [] };
    }

    const doc = nlp(text);
    const properNouns = doc.match('#ProperNoun').out('array');
    const commonNouns = doc.match('#Noun').not('#ProperNoun').out('array');
    
    // Get detailed tags
    const terms = doc.terms().out('array');
    const tags = doc.terms().json().map(term => ({
      text: term.text,
      tags: term.terms[0]?.tags || []
    }));

    return {
      hasProperNouns: properNouns.length > 0,
      hasCommonNouns: commonNouns.length > 0,
      properNouns,
      commonNouns,
      tags,
      allText: terms
    };
  }

  /**
   * Check if text matches custom exclusion patterns
   */
  isExcluded(text) {
    if (!this.settings.customExclusions || this.settings.customExclusions.length === 0) {
      return false;
    }

    for (const pattern of this.settings.customExclusions) {
      try {
        const regex = new RegExp(pattern, 'i');
        if (regex.test(text)) {
          return true;
        }
      } catch (e) {
        // Invalid regex pattern, skip
        continue;
      }
    }
    return false;
  }

  /**
   * Check if text is primarily numeric or special characters
   * Numbers, dates, currency, punctuation, and symbols don't need localization
   */
  isNumericOrSpecialChars(text) {
    // Remove whitespace for analysis
    const cleanText = text.replace(/\s+/g, '');
    
    if (cleanText.length === 0) return true;
    
    // Count alphabetic characters (actual text that needs localization)
    // Include extended alphabets for all languages
    const alphabeticChars = (cleanText.match(/[a-zA-Z\u00C0-\u017F\u0400-\u04FF\u0600-\u06FF\u4E00-\u9FFF\u3040-\u309F\u30A0-\u30FF]/g) || []).length;
    
    // Count numeric and special characters
    const numericChars = (cleanText.match(/[0-9]/g) || []).length;
    const specialChars = (cleanText.match(/[^a-zA-Z0-9\u00C0-\u017F\u0400-\u04FF\u0600-\u06FF\u4E00-\u9FFF\u3040-\u309F\u30A0-\u30FF]/g) || []).length;
    
    // Calculate ratios
    const alphabeticRatio = alphabeticChars / cleanText.length;
    
    // If text has meaningful alphabetic content (>20%), it might be real text
    // Examples: "R$304 por 2 noites" has ~50% alphabetic = real text
    //           "$100" has 0% alphabetic = pure numeric
    if (alphabeticRatio >= 0.2) {
      // Has some real text, don't exclude - let language detection handle it
      // This allows "R$304 por 2 noites" to be checked for language
      return false;
    }
    
    // If text is entirely numbers and special characters (no letters), exclude it
    if (alphabeticChars === 0) {
      return true;
    }
    
    // Common patterns to exclude:
    // - Pure numbers: "123", "2024", "100.50"
    // - Dates: "01/01/2024", "2024-11-04"
    // - Times: "10:30 AM", "14:30:00"
    // - Currency: "$100", "€50", "¥1000"
    // - Percentages: "50%", "100%"
    // - Symbols: "→", "©", "®", "™"
    const numericPatterns = [
      /^\d+$/,                           // Pure numbers
      /^\d+[.,]\d+$/,                    // Decimals
      /^\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}$/,  // Dates
      /^\d{1,2}:\d{2}(\s?(AM|PM|am|pm))?$/, // Times
      /^[\$€£¥₹]\s?\d+([.,]\d+)?$/,      // Currency with symbols
      /^\d+\s?%$/,                       // Percentages
      /^[^\w\s]+$/,                      // Only special characters
      /^v?\d+\.\d+(\.\d+)?$/,            // Version numbers
      /^#[0-9A-Fa-f]{3,6}$/,             // Hex colors
      /^\d+\s?(px|em|rem|pt|%|vh|vw)$/i, // CSS units
      /^\d+\s?(KB|MB|GB|TB)$/i,          // File sizes
      /^\(\d+\)$/,                       // Numbers in parentheses
      /^\[\d+\]$/,                       // Numbers in brackets
    ];
    
    for (const pattern of numericPatterns) {
      if (pattern.test(text.trim())) {
        return true;
      }
    }
    
    return false;
  }

  /**
   * Classify a text element
   */
  classifyText(text, element) {
    const trimmedText = text.trim();
    
    // Check custom exclusions first
    if (this.isExcluded(trimmedText)) {
      return { status: 'excluded', reason: 'Custom exclusion rule' };
    }

    // Check if text is in target language FIRST (before numeric check)
    // This allows "R$304 por 2 noites" to be recognized as Portuguese
    if (this.isInTargetLanguage(trimmedText)) {
      return { 
        status: 'localized', 
        reason: `Text is in target language (${this.settings.targetLanguage})`,
        needsVerification: true // Mark for verification if enabled
      };
    }

    // Check if text is primarily numeric or special characters
    // Only exclude if it's NOT in target language
    if (this.isNumericOrSpecialChars(trimmedText)) {
      return { status: 'excluded', reason: 'Numeric or special characters (no localization needed)' };
    }

    // ANY text not in target language is non-localized
    // This includes English, other languages, and undetermined text
    
    const detectedLang = this.detectLanguage(trimmedText);
    const isEnglishText = this.isEnglish(trimmedText);
    
    // Only do POS analysis for English text (compromise.js is English-only)
    // Don't apply it to other languages like Portuguese, Spanish, etc.
    const posAnalysis = isEnglishText ? this.analyzePOS(trimmedText) : { hasProperNouns: false, hasCommonNouns: false };
    
    // Determine content type for filtering (only for English)
    let contentType = 'text'; // Default type
    
    if (isEnglishText && posAnalysis.hasProperNouns && posAnalysis.properNouns.length > 0) {
      const properNounRatio = posAnalysis.properNouns.join(' ').length / trimmedText.length;
      // Must be >80% proper nouns AND relatively short (proper noun phrases are usually short)
      if (properNounRatio > 0.8 && trimmedText.split(/\s+/).length <= 4) {
        contentType = 'proper-noun';
      }
    }
    
    if (isEnglishText && posAnalysis.hasCommonNouns && posAnalysis.commonNouns.length > 0 && contentType === 'text') {
      const commonNounRatio = posAnalysis.commonNouns.join(' ').length / trimmedText.length;
      const wordCount = trimmedText.split(/\s+/).length;
      // Only mark as common-noun if it's a single word or short phrase AND mostly nouns
      // Examples: "Settings", "Home", "Menu Options"
      if (commonNounRatio > 0.7 && wordCount <= 2) {
        contentType = 'common-noun';
      }
    }
    
    // Determine specific reason for non-localization
    let reason = '';
    let language = '';
    
    if (isEnglishText) {
      // For English text, provide content-type-specific reasons
      if (contentType === 'proper-noun') {
        reason = 'English proper nouns need localization';
      } else if (contentType === 'common-noun') {
        reason = 'English common nouns need localization';
      } else {
        reason = 'English text needs localization';
      }
      language = 'English';
    } else if (detectedLang !== 'und') {
      // For other detected languages, just say wrong language
      reason = `Text is in wrong language (detected: ${detectedLang}, expected: ${this.getLanguageCode(this.settings.targetLanguage)})`;
      language = detectedLang;
    } else {
      // Undetermined language
      reason = `Text not in target language (${this.settings.targetLanguage})`;
    }

    return { 
      status: 'non-localized', 
      reason: reason,
      language: language,
      contentType: contentType,
      posAnalysis: posAnalysis
    };
  }

  /**
   * Get element location information
   */
  getElementLocation(element) {
    const rect = element.getBoundingClientRect();
    let section = 'Body';

    // Try to determine section
    let parent = element;
    while (parent && parent !== document.body) {
      const tag = parent.tagName.toLowerCase();
      if (tag === 'header') section = 'Header';
      else if (tag === 'footer') section = 'Footer';
      else if (tag === 'nav') section = 'Navigation';
      else if (tag === 'aside') section = 'Sidebar';
      else if (tag === 'main') section = 'Main Content';
      
      parent = parent.parentElement;
    }

    return {
      section,
      x: Math.round(rect.left),
      y: Math.round(rect.top),
      width: Math.round(rect.width),
      height: Math.round(rect.height)
    };
  }

  /**
   * Main analysis function
   */
  async analyze() {
    console.log('LocalizationChecker: Starting analysis...');
    this.results = {
      totalElements: 0,
      localizedCount: 0,
      nonLocalizedCount: 0,
      excludedCount: 0,
      findings: []
    };

    const textNodes = this.getTextNodes();
    console.log(`Found ${textNodes.length} text nodes`);

    // Group text nodes by parent element to avoid duplicates
    const elementMap = new Map();
    
    for (const node of textNodes) {
      const element = node.parentElement;
      const text = node.textContent.trim();
      
      if (!elementMap.has(element)) {
        elementMap.set(element, []);
      }
      elementMap.get(element).push(text);
    }

    // Analyze each unique element
    for (const [element, texts] of elementMap) {
      const combinedText = texts.join(' ').trim();
      if (combinedText.length < 2) continue;

      this.results.totalElements++;

      const classification = this.classifyText(combinedText, element);
      const location = this.getElementLocation(element);

      const finding = {
        id: this.results.totalElements,
        text: combinedText.substring(0, 200), // Truncate for display
        fullText: combinedText,
        elementType: element.tagName.toLowerCase(),
        status: classification.status,
        reason: classification.reason,
        language: classification.language,
        contentType: classification.contentType || 'text',
        location: location,
        posAnalysis: classification.posAnalysis,
        needsVerification: classification.needsVerification || false,
        timestamp: new Date().toISOString()
      };

      this.results.findings.push(finding);

      // Update counts
      switch (classification.status) {
        case 'localized':
          this.results.localizedCount++;
          break;
        case 'non-localized':
          this.results.nonLocalizedCount++;
          break;
        case 'excluded':
          this.results.excludedCount++;
          break;
      }
    }

    console.log('Analysis complete:', this.results);
    
    // Verification step (if enabled)
    console.log('Checking if verification should run...');
    console.log('  - this.translator:', !!this.translator);
    console.log('  - this.settings.enableVerification:', this.settings.enableVerification);
    console.log('  - this.settings.verificationType:', this.settings.verificationType);
    
    if (this.settings.enableVerification) {
      if (this.settings.verificationType === 'language-only') {
        console.log('🔄 Starting language-only verification...');
        try {
          await this.verifyLanguageOnly();
          console.log('✅ Language verification complete:', this.results);
        } catch (error) {
          console.error('❌ Language verification error:', error);
        }
      } else if (this.translator) {
        console.log('🔄 Starting translation verification...');
        try {
          await this.verifyTranslations();
          console.log('✅ Translation verification complete:', this.results);
        } catch (error) {
          console.error('❌ Translation verification error:', error);
        }
      } else {
        console.log('⏭️  Skipping verification - translator not available');
      }
    } else {
      console.log('⏭️  Skipping verification - disabled');
    }
    
    // Store results
    await chrome.storage.local.set({ 
      analysisResults: this.results,
      analysisUrl: window.location.href,
      analysisTimestamp: new Date().toISOString()
    });

    return this.results;
  }

  /**
   * Verify translations using LibreTranslate API
   */
  async verifyTranslations() {
    // Get items that need verification
    let itemsToVerify = this.results.findings.filter(f => f.needsVerification && f.status === 'localized');
    
    // Sample mode: only verify a percentage
    if (this.settings.verificationMode === 'sample') {
      const sampleSize = Math.ceil(itemsToVerify.length * 0.2); // 20%
      itemsToVerify = this.sampleRandomItems(itemsToVerify, sampleSize);
      console.log(`Sample mode: Verifying ${itemsToVerify.length} of ${this.results.findings.filter(f => f.needsVerification).length} items`);
    }
    
    if (itemsToVerify.length === 0) {
      console.log('No items to verify');
      return;
    }
    
    const targetLangCode = this.translator.getLibreTranslateCode(this.settings.targetLanguage);
    let verifiedCount = 0;
    let correctCount = 0;
    let incorrectCount = 0;
    
    // Initialize new counts
    this.results.correctlyTranslatedCount = 0;
    this.results.incorrectlyTranslatedCount = 0;
    
    for (const finding of itemsToVerify) {
      try {
        // Measure API call performance
        const startTime = performance.now();
        
        // Translate from English to target language
        const expectedTranslation = await this.translator.translate(
          finding.fullText,
          'en',
          targetLangCode
        );
        
        const endTime = performance.now();
        const apiCallTime = endTime - startTime;
        finding.apiCallTime = apiCallTime;
        
        // Log performance for first few calls
        if (verifiedCount <= 5) {
          console.log(`Translation API call time: ${apiCallTime.toFixed(2)}ms for text length: ${finding.fullText.length}`);
        }
        
        verifiedCount++;
        
        // Compare with actual text
        const similarity = this.calculateSimilarity(finding.fullText, expectedTranslation);
        
        if (similarity > 0.8) { // 80% similar
          finding.status = 'correctly-translated';
          finding.reason = `Verified: Matches expected translation`;
          finding.expectedTranslation = expectedTranslation;
          finding.similarity = similarity;
          correctCount++;
          this.results.correctlyTranslatedCount++;
          this.results.localizedCount--; // Remove from localized count
        } else {
          finding.status = 'incorrectly-translated';
          finding.reason = `Incorrect translation (Expected: "${expectedTranslation}")`;
          finding.expectedTranslation = expectedTranslation;
          finding.similarity = similarity;
          incorrectCount++;
          this.results.incorrectlyTranslatedCount++;
          this.results.localizedCount--; // Remove from localized count
        }
        
        // Small delay to avoid rate limiting
        await this.sleep(100);
        
      } catch (error) {
        console.error(`Verification error for "${finding.text}":`, error);
        finding.verificationError = error.message;
      }
    }
    
    // Calculate performance metrics
    const apiCallTimes = itemsToVerify
      .filter(f => f.apiCallTime)
      .map(f => f.apiCallTime);
    
    if (apiCallTimes.length > 0) {
      const totalTime = apiCallTimes.reduce((sum, time) => sum + time, 0);
      const avgTime = totalTime / apiCallTimes.length;
      const minTime = Math.min(...apiCallTimes);
      const maxTime = Math.max(...apiCallTimes);
      
      console.log(`Translation performance: Avg ${avgTime.toFixed(2)}ms, Min ${minTime.toFixed(2)}ms, Max ${maxTime.toFixed(2)}ms, Total ${totalTime.toFixed(2)}ms`);
    }
    
    console.log(`Verification complete: ${correctCount} correct, ${incorrectCount} incorrect out of ${verifiedCount} verified`);
  }

  /**
   * Language-only verification - detects language using LibreTranslate API
   */
  async verifyLanguageOnly() {
    // Get all items for language verification (not just localized ones)
    let itemsToVerify = this.results.findings;
    
    // Sample mode: only verify a percentage
    if (this.settings.verificationMode === 'sample') {
      const sampleSize = Math.ceil(itemsToVerify.length * 0.2); // 20%
      itemsToVerify = this.sampleRandomItems(itemsToVerify, sampleSize);
      console.log(`Sample mode: Checking ${itemsToVerify.length} of ${this.results.findings.filter(f => f.status === 'localized').length} items`);
    }
    
    if (itemsToVerify.length === 0) {
      console.log('No items to verify');
      return;
    }
    
    // Check if LibreTranslate API is available
    if (!this.translator) {
      console.error('LibreTranslate API not available for language detection');
      return;
    }
    
    let verifiedCount = 0;
    let correctCount = 0;
    let incorrectCount = 0;
    
    // Initialize new counts
    this.results.correctlyTranslatedCount = 0;
    this.results.incorrectlyTranslatedCount = 0;
    
    const targetLangCode = this.translator.getLibreTranslateCode(this.settings.targetLanguage);
    
    for (const finding of itemsToVerify) {
      try {
        // Use LibreTranslate API to detect language
        const endpoint = `${this.settings.libretranslateUrl}/detect`;
        const body = {
          q: finding.fullText
        };
        
        if (this.settings.verificationApiKey) {
          body.api_key = this.settings.verificationApiKey;
        }
        
        // Measure API call performance
        const startTime = performance.now();
        
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
        
        const detectionResult = await response.json();
        
        const endTime = performance.now();
        const apiCallTime = endTime - startTime;
        finding.apiCallTime = apiCallTime;
        
        // Log performance for first few calls
        if (verifiedCount <= 5) {
          console.log(`Language detection API call time: ${apiCallTime.toFixed(2)}ms for text length: ${finding.fullText.length}`);
        }
        const detectedLang = detectionResult[0]?.language || 'und';
        const confidence = detectionResult[0]?.confidence || 0;
        
        verifiedCount++;
        
        console.log(`Detected language: ${detectedLang} (${confidence.toFixed(2)}) for text: "${finding.text.substring(0, 30)}..."`);
        
        // Check if detected language matches target
        if (detectedLang === targetLangCode) {
          // Only update counts if this was previously marked as localized
          if (finding.status === 'localized') {
            this.results.localizedCount--;
            this.results.correctlyTranslatedCount++;
          } else if (finding.status === 'non-localized') {
            this.results.nonLocalizedCount--;
            this.results.correctlyTranslatedCount++;
          }
          
          finding.status = 'correctly-translated';
          finding.reason = `Language verified: Detected ${detectedLang} with ${(confidence * 100).toFixed(1)}% confidence`;
          finding.detectedLanguage = detectedLang;
          finding.confidence = confidence;
          correctCount++;
        } else {
          // Only update counts if this was previously marked as localized
          if (finding.status === 'localized') {
            this.results.localizedCount--;
            this.results.incorrectlyTranslatedCount++;
          } else if (finding.status === 'non-localized') {
            // This was correctly identified as non-localized
            this.results.nonLocalizedCount--;
            this.results.incorrectlyTranslatedCount++;
          }
          
          finding.status = 'incorrectly-translated';
          finding.reason = `Language mismatch: Detected ${detectedLang}, expected ${targetLangCode} (${(confidence * 100).toFixed(1)}% confidence)`;
          finding.detectedLanguage = detectedLang;
          finding.confidence = confidence;
          incorrectCount++;
        }
        
        // Small delay to avoid rate limiting
        await this.sleep(100);
        
      } catch (error) {
        console.error(`Language detection error for "${finding.text}":`, error);
        finding.verificationError = error.message;
      }
    }
    
    // Calculate performance metrics
    const apiCallTimes = itemsToVerify
      .filter(f => f.apiCallTime)
      .map(f => f.apiCallTime);
    
    if (apiCallTimes.length > 0) {
      const totalTime = apiCallTimes.reduce((sum, time) => sum + time, 0);
      const avgTime = totalTime / apiCallTimes.length;
      const minTime = Math.min(...apiCallTimes);
      const maxTime = Math.max(...apiCallTimes);
      
      console.log(`Language detection performance: Avg ${avgTime.toFixed(2)}ms, Min ${minTime.toFixed(2)}ms, Max ${maxTime.toFixed(2)}ms, Total ${totalTime.toFixed(2)}ms`);
    }
    
    console.log(`Language verification complete: ${correctCount} correct, ${incorrectCount} incorrect out of ${verifiedCount} verified`);
  }

  /**
   * Sample random items from array
   */
  sampleRandomItems(array, sampleSize) {
    const shuffled = array.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, sampleSize);
  }

  /**
   * Calculate similarity between two strings
   */
  calculateSimilarity(str1, str2) {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    const editDistance = this.levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  }

  /**
   * Calculate Levenshtein distance between two strings
   */
  levenshteinDistance(str1, str2) {
    const matrix = [];
    
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    
    return matrix[str2.length][str1.length];
  }

  /**
   * Sleep helper
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Create global instance
const analyzer = new LocalizationAnalyzer();

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'analyze') {
    // Initialize analyzer first to load settings and setup translator
    analyzer.init().then(() => {
      // Override with any settings passed from popup
      analyzer.settings = { ...analyzer.settings, ...request.settings };
      return analyzer.analyze();
    }).then(results => {
      sendResponse({ success: true, results });
    }).catch(error => {
      console.error('Analysis error:', error);
      sendResponse({ success: false, error: error.message });
    });
    return true; // Keep channel open for async response
  }
  
  if (request.action === 'getResults') {
    sendResponse({ success: true, results: analyzer.results });
    return true;
  }
});

// Initialize on load
analyzer.init();

