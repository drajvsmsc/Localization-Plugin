# Translation Verification Implementation

## Overview
This document describes the implementation of translation verification using LibreTranslate API in the Localization Plugin.

## Implementation Summary

### 1. Core Logic (`content-script.js`)

#### Initialization
```javascript
async init() {
  // Load settings
  const stored = await chrome.storage.local.get(['settings']);
  if (stored.settings) {
    this.settings = { ...this.settings, ...stored.settings };
  }
  
  // Initialize LibreTranslate API if verification is enabled
  if (this.settings.enableVerification && typeof LibreTranslateAPI !== 'undefined') {
    const apiUrl = this.settings.libretranslateUrl || 'https://libretranslate.com';
    const apiKey = this.settings.verificationApiKey || null;
    this.translator = new LibreTranslateAPI(apiUrl, apiKey);
    console.log('Translation verification enabled:', apiUrl);
  } else {
    this.translator = null;
  }
}
```

#### Classification
- Localized items are now marked with `needsVerification: true`
- This flag triggers the verification process after initial analysis

#### Verification Process
```javascript
async verifyTranslations() {
  // Get items marked for verification
  let itemsToVerify = this.results.findings.filter(f => f.needsVerification && f.status === 'localized');
  
  // Sample mode: verify only 20%
  if (this.settings.verificationMode === 'sample') {
    const sampleSize = Math.ceil(itemsToVerify.length * 0.2);
    itemsToVerify = this.sampleRandomItems(itemsToVerify, sampleSize);
  }
  
  // Translate each item from English to target language
  for (const finding of itemsToVerify) {
    const expectedTranslation = await this.translator.translate(
      finding.fullText,
      'en',
      targetLangCode
    );
    
    // Calculate similarity
    const similarity = this.calculateSimilarity(finding.fullText, expectedTranslation);
    
    // Update status based on similarity
    if (similarity > 0.8) {
      finding.status = 'correctly-translated';
      finding.reason = `Verified: Matches expected translation`;
    } else {
      finding.status = 'incorrectly-translated';
      finding.reason = `Incorrect translation (Expected: "${expectedTranslation}")`;
    }
    
    finding.expectedTranslation = expectedTranslation;
    finding.similarity = similarity;
  }
}
```

### 2. New Statuses

#### `correctly-translated`
- Text is in the target language AND matches expected translation (>80% similarity)
- Icon: ✓✓
- Color: #17a2b8 (cyan)

#### `incorrectly-translated`
- Text is in the target language BUT doesn't match expected translation
- Icon: ⚠️
- Color: #ff9800 (orange)
- Shows expected translation in findings

### 3. UI Updates

#### Popup Display
- Two new stat cards (shown only when verification is enabled):
  - "Correctly Translated" (cyan/blue)
  - "Incorrectly Translated" (orange)
- Filter dropdown includes both new statuses
- Findings show:
  - Expected translation
  - Similarity percentage
  - Verification reason

#### Styling
```css
.stat-verified {
  border-left-color: #17a2b8;
  background: linear-gradient(135deg, #f8f9fa 0%, #e3f2fd 100%);
}

.stat-incorrect {
  border-left-color: #ff9800;
  background: linear-gradient(135deg, #f8f9fa 0%, #fff3e0 100%);
}

.verification-info {
  background: #f0f8ff;
  padding: 8px;
  margin: 8px 0;
  border-radius: 4px;
  font-size: 12px;
  color: #0066cc;
  border-left: 3px solid #2196f3;
}
```

### 4. Language Mapping

Added `getLibreTranslateCode()` method to `libretranslate.js` to map language names to LibreTranslate codes:

```javascript
getLibreTranslateCode(languageName) {
  const mapping = {
    'Portuguese': 'pt',
    'Spanish': 'es',
    'Hindi': 'hi',
    // ... 50+ languages
  };
  return mapping[languageName] || 'en';
}
```

### 5. Similarity Calculation

Uses Levenshtein Distance algorithm:

```javascript
calculateSimilarity(str1, str2) {
  const editDistance = this.levenshteinDistance(longer, shorter);
  return (longer.length - editDistance) / longer.length;
}
```

- Threshold: 80% similarity
- Above 80%: correctly-translated
- Below 80%: incorrectly-translated

## Verification Modes

### 1. All Mode
- Verifies every localized item
- Most accurate but slowest
- Use for: Final verification before deployment

### 2. Sample Mode (Default)
- Verifies random 20% of localized items
- Good balance of speed and accuracy
- Use for: Regular development testing

## Usage Flow

1. **Enable Verification** (Options Page)
   - Check "Enable Translation Verification"
   - Enter LibreTranslate URL (e.g., `http://localhost:5000`)
   - Enter API Key (if required)
   - Click "Test Connection" to verify

2. **Analyze Page**
   - Click "Analyze" button
   - Plugin performs language detection
   - If verification enabled:
     - Marks localized items for verification
     - Translates English → Target Language
     - Compares with actual text
     - Updates status accordingly

3. **View Results**
   - See new stat cards for verification results
   - Filter by "Incorrectly Translated" to see issues
   - Each finding shows:
     - Current text
     - Expected translation
     - Similarity percentage

## Performance Considerations

### Rate Limiting
- 100ms delay between API calls
- Prevents overwhelming the translation service
- Configurable if needed

### Caching
- Enabled by default
- Stores translation results in memory
- Reduces API calls for repeated text

### Sample Mode
- Reduces API calls by 80%
- Still provides good coverage
- Recommended for iterative testing

## Example Output

```
Total Elements: 100
Correctly Translated: 15 (15%)
Incorrectly Translated: 3 (3%)
Localized: 60 (60%)
Non-Localized: 20 (20%)
Excluded: 2 (2%)
```

### Finding Example (Incorrect):
```
Status: ⚠️ Incorrectly Translated
Text: "Buscar hoteles"
Expected: "Procurar hotéis" (65% match)
Reason: Incorrect translation (Expected: "Procurar hotéis")
Location: Main Content > Section
Element: <button>
```

## Benefits

1. **Automated Quality Assurance**: Catches translation errors automatically
2. **Context-Aware**: Compares actual vs. expected translations
3. **Flexible**: Sample mode for quick checks, all mode for thorough verification
4. **Self-Hosted Support**: Works with local LibreTranslate instances
5. **No External Dependencies**: Optional feature, doesn't affect core functionality

## Limitations

1. **English Source Only**: Currently assumes English as source language
2. **LibreTranslate Quality**: Depends on LibreTranslate's translation accuracy
3. **Context-Insensitive**: Doesn't consider cultural or contextual nuances
4. **Similarity Threshold**: 80% may need tuning for specific languages
5. **API Dependency**: Requires running LibreTranslate instance

## Future Enhancements

1. **Multi-Source Languages**: Support verification from any source language
2. **Custom Thresholds**: Allow users to adjust similarity threshold
3. **Batch Translation**: Group multiple texts for efficiency
4. **Context Analysis**: Consider surrounding text for better verification
5. **Alternative APIs**: Support Google Translate, DeepL, etc.

## Troubleshooting

### Verification Not Running
- Check "Enable Translation Verification" is checked
- Verify LibreTranslate URL is correct
- Test connection in options page

### All Items Show as Incorrectly Translated
- LibreTranslate may be using different dialect
- Consider lowering similarity threshold
- Check if target language is supported

### Slow Performance
- Switch to "Sample" mode
- Reduce number of items to analyze
- Use local LibreTranslate instance
- Enable caching

### Connection Errors
- Verify LibreTranslate is running
- Check firewall settings
- Ensure API key is correct (if required)
- Check browser console for detailed errors

## API Reference

### LibreTranslate API Methods

```javascript
// Initialize
const translator = new LibreTranslateAPI(apiUrl, apiKey);

// Translate
const result = await translator.translate(text, 'en', 'pt');

// Test connection
const status = await translator.testConnection();

// Get language code
const code = translator.getLibreTranslateCode('Portuguese'); // Returns 'pt'

// Clear cache
translator.clearCache();

// Get cache size
const size = translator.getCacheSize();
```

## Settings Schema

```javascript
{
  enableVerification: boolean,      // Enable/disable feature
  libretranslateUrl: string,        // API URL
  verificationApiKey: string,       // API key (optional)
  cacheTranslations: boolean,       // Enable caching
  verificationMode: 'all' | 'sample' // Verification mode
}
```

