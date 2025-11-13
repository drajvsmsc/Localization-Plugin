# LibreTranslate Integration Guide

**Date**: November 11, 2025  
**Status**: ✅ **IMPLEMENTED**  
**Feature**: Translation Verification with LibreTranslate

---

## 🎯 What Is This?

LibreTranslate is a **free, open-source translation API** that we've integrated for translation verification. Now your plugin can:

1. **Detect** if text is in the target language (already had this)
2. **Verify** if translations are correct (NEW!)

### Example Use Cases

```
Page shows: "Casa"
Expected: "Início" (Home in Portuguese)
Result: ⚠️ Incorrectly Translated

Page shows: "Início"  
Expected: "Início"
Result: ✓ Correctly Translated
```

---

## ⚙️ Setup Instructions

### Step 1: Open Extension Settings

1. Click the LocalizationChecker extension icon
2. Click "Settings" (⚙️ icon)
3. Go to "Translation Verification" tab

### Step 2: Enable Verification

1. Check "Enable Translation Verification"
2. Settings panel will appear

### Step 3: Configure API

**Option A: Use Free Public API (Recommended for Testing)**
```
LibreTranslate API URL: https://libretranslate.com
API Key: (leave empty)
```

**Option B: Use API Key (For Higher Limits)**
1. Visit https://libretranslate.com
2. Sign up for free API key
3. Enter your API key in settings

**Option C: Self-Host (Unlimited)**
1. Follow: https://github.com/LibreTranslate/LibreTranslate
2. Host on your own server
3. Enter your server URL (e.g., `http://localhost:5000`)

### Step 4: Test Connection

1. Click "Test Connection" button
2. Should see: ✓ Connected (Test: "Hello" → "Hola")
3. If successful, click "Save Settings"

---

## 🚀 How It Works

### Architecture

```
┌──────────────────────────────────────────────────────┐
│  Content Script (Your Page)                          │
│  ┌────────────────────────────────────────────────┐  │
│  │ 1. Detect non-English text                     │  │
│  │ 2. If verification enabled:                    │  │
│  │    - Translate English version to target lang  │  │
│  │    - Compare with actual text on page          │  │
│  │ 3. Flag if incorrect                           │  │
│  └────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────┘
                          ↕ API Call
┌──────────────────────────────────────────────────────┐
│  LibreTranslate API (https://libretranslate.com)     │
│  ┌────────────────────────────────────────────────┐  │
│  │ Translate: "Home" → "Início" (Portuguese)      │  │
│  └────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────┘
```

### Detection Flow

**WITHOUT Verification (Default):**
```
1. Find text: "Início"
2. Detect language: Portuguese
3. Target: Portuguese
4. Result: ✓ Localized
```

**WITH Verification (NEW):**
```
1. Find text: "Casa"
2. Detect language: Portuguese ✓
3. Target: Portuguese ✓
4. Verification enabled:
   - Translate "Home" to Portuguese via API
   - Expected: "Início"
   - Actual: "Casa"
   - Similarity: 0% match
5. Result: ⚠️ Incorrectly Translated
```

---

## 📊 New Statuses

### Before (Detection Only)
```
✓ Localized - In target language
✗ Non-Localized - Not in target language
⊗ Excluded - Numbers, dates, etc.
```

### After (With Verification)
```
✓ Correctly Translated - Verified with API ⭐ NEW
⚠️ Incorrectly Translated - Wrong translation ⭐ NEW
✓ Localized - In target language (not verified)
✗ Non-Localized - Not in target language
⊗ Excluded - Numbers, dates, etc.
```

---

## 💻 API Usage

### Settings

**Verification Mode:**
- **Sample Mode** (Default): Verifies random 20% of items
  - Pros: Fast, fewer API calls, stays within rate limits
  - Cons: Might miss some incorrect translations
  
- **Full Mode**: Verifies all items
  - Pros: Complete verification, finds all issues
  - Cons: Slower, more API calls, may hit rate limits

**Cache Translations:**
- ✅ Enabled (Default): Saves translations locally
  - Reduces API calls significantly
  - Faster subsequent analyses
  
- ❌ Disabled: Always calls API
  - Always fresh translations
  - More API usage

---

## 🔢 Rate Limits

### Free Public API (No API Key)
- **Limit**: ~100 requests per day
- **Speed**: May be slower during peak times
- **Best for**: Testing, small sites, sample mode

### Free API Key
- **Limit**: ~10,000 characters/day
- **Speed**: Better performance
- **Best for**: Regular use, medium sites

### Self-Hosted
- **Limit**: Unlimited
- **Speed**: Depends on your server
- **Best for**: Production use, large sites

### Tips to Stay Within Limits

1. **Use Sample Mode**: Only verifies 20% (reduces calls by 80%)
2. **Enable Caching**: Reuses previous translations
3. **Get Free API Key**: Increases limits significantly
4. **Self-Host**: Unlimited translations

---

## 📋 Example Analysis

### Before (Detection Only)
```
Analysis Results:
✓ Localized: 80 items
✗ Non-Localized: 15 items
⊗ Excluded: 5 items

Issue: Can't tell if "localized" items are correctly translated!
```

### After (With Verification)
```
Analysis Results:
✓ Correctly Translated: 65 items (verified!)
⚠️ Incorrectly Translated: 10 items (needs fixing!)
✓ Localized: 5 items (detected, not verified)
✗ Non-Localized: 15 items
⊗ Excluded: 5 items

Incorrectly Translated Items:
⚠️ "Casa" 
   Element: <button>
   Expected: "Início" (Home)
   Found: "Casa" (House)
   Suggestion: Change "Casa" to "Início"

⚠️ "Livro agora"
   Element: <button>
   Expected: "Reserve agora" (Book now)
   Found: "Livro agora" (Book now - wrong context)
   Suggestion: Change to "Reserve agora"

⚠️ "Computador"
   Element: <span>
   Expected: "Computador" (Computer)
   Found: "Computador"
   Wait, this is CORRECT! False positive?
```

---

## ⚠️ Limitations & Known Issues

### 1. Translation May Not Be Perfect
- LibreTranslate is good but not perfect
- May suggest alternative translations that are also correct
- Example: "Home" → Could be "Início" or "Página Inicial" (both correct)

### 2. Context Matters
- API doesn't know page context
- "Book" could be "Livro" (noun) or "Reservar" (verb)
- May flag correct translations as incorrect

### 3. Rate Limits
- Free API has limits
- Use sample mode to conserve API calls
- Consider self-hosting for production

### 4. Performance
- Network latency for API calls
- Slower than detection-only mode
- Caching helps significantly

### 5. Offline Usage
- Requires internet connection
- Won't work offline
- Detection-only mode still works offline

---

## 🆚 Comparison with Other Options

| Feature | LibreTranslate (Free) | LibreTranslate (Self-Host) | Google Translate API | Microsoft Translator |
|---------|----------------------|----------------------------|---------------------|---------------------|
| **Cost** | ✅ Free | ✅ Free (hosting) | 💰 $20/M chars | 💰 $10/M chars |
| **Setup** | ✅ Easy | ⚠️ Complex | ⚠️ Medium | ⚠️ Medium |
| **Limits** | ⚠️ ~100/day | ✅ Unlimited | ✅ 500k free | ✅ 2M free |
| **Accuracy** | ⭐⭐⭐ Good | ⭐⭐⭐ Good | ⭐⭐⭐⭐⭐ Excellent | ⭐⭐⭐⭐ Very Good |
| **Speed** | ⚠️ Moderate | ✅ Fast | ✅ Fast | ✅ Fast |
| **Offline** | ❌ No | ❌ No | ❌ No | ❌ No |
| **Open Source** | ✅ Yes | ✅ Yes | ❌ No | ❌ No |
| **Privacy** | ✅ Good | ✅ Excellent | ⚠️ Moderate | ⚠️ Moderate |
| **Legal** | ✅ OK | ✅ OK | ✅ OK | ✅ OK |

---

## 🔧 Troubleshooting

### Issue: "Connection Failed"

**Solutions:**
1. Check internet connection
2. Verify API URL is correct: `https://libretranslate.com`
3. Try without API key first
4. Check browser console for errors

### Issue: "Rate Limit Exceeded"

**Solutions:**
1. Switch to "Sample Mode"
2. Get a free API key
3. Wait and try again later
4. Consider self-hosting

### Issue: "Too Many False Positives"

**Solutions:**
1. Translations may have multiple correct options
2. Manually review flagged items
3. Use verification as a guide, not absolute truth
4. Consider Google/Microsoft API for better accuracy

### Issue: "Too Slow"

**Solutions:**
1. Enable caching
2. Use "Sample Mode"
3. Self-host for faster performance
4. Reduce number of items being verified

---

## 📝 Self-Hosting Guide

### Why Self-Host?
- ✅ Unlimited translations
- ✅ Better performance
- ✅ Full privacy
- ✅ No rate limits
- ✅ Customize as needed

### Quick Setup (Docker)

```bash
# 1. Install Docker
# https://docs.docker.com/get-docker/

# 2. Run LibreTranslate
docker run -d \
  -p 5000:5000 \
  -e LT_LOAD_ONLY=en,pt,es,fr,de \
  libretranslate/libretranslate

# 3. Open browser
# http://localhost:5000

# 4. In extension settings:
# LibreTranslate API URL: http://localhost:5000
```

### Production Setup

```bash
# Use production config
docker run -d \
  -p 5000:5000 \
  -e LT_API_KEYS=true \
  -e LT_API_KEYS_DB_PATH=/app/db/api_keys.db \
  -v $(pwd)/db:/app/db \
  libretranslate/libretranslate
```

---

## 📊 Performance Tips

### 1. Smart Caching
```javascript
// Cached translations are reused
"Home" → "Início" (cached)
Next time: instant retrieval!
```

### 2. Sample Mode
```javascript
// Verify 20% randomly
100 items → Verify 20 → Find 2 issues
Estimate: ~10 total issues (2 * 5)
```

### 3. Batch Analysis
```javascript
// Analyze once, review multiple times
Run analysis → Save results → Review offline
```

---

## 🎯 Best Practices

### 1. Start with Detection Only
- Use free detection first
- Enable verification after initial analysis
- Reduces API usage

### 2. Use Sample Mode First
- Quick overview of issues
- Switch to Full Mode for final check
- Saves API calls

### 3. Review False Positives
- Not all flagged items are wrong
- Manually verify suggestions
- Some translations have multiple correct options

### 4. Enable Caching
- Always leave caching ON
- Significantly reduces API calls
- Faster subsequent analyses

### 5. Consider Context
- API doesn't know page context
- Use your judgment
- Verify suggestions make sense

---

## 📌 Summary

**What You Get:**
- ✅ Free translation verification
- ✅ Detect incorrectly translated text
- ✅ Get translation suggestions
- ✅ No API key required (optional)
- ✅ Open source and ethical

**What to Remember:**
- ⚠️ Not 100% accurate (good enough for most cases)
- ⚠️ Has rate limits (use sample mode)
- ⚠️ Requires internet (offline detection still works)
- ⚠️ Review suggestions (don't blindly trust)

**When to Use:**
- ✅ Quality check existing translations
- ✅ Find translation errors
- ✅ Verify localization work
- ✅ Testing and development

**When NOT to Use:**
- ❌ High-volume production sites (use paid APIs)
- ❌ Need 100% accuracy (use human reviewers)
- ❌ Offline environments (stick to detection)
- ❌ Real-time translation (too slow)

---

## 🚀 Next Steps

1. **Try It Out**: Enable verification in settings
2. **Test Connection**: Click "Test Connection" button
3. **Run Analysis**: Analyze a page
4. **Review Results**: Check for incorrectly translated items
5. **Adjust Settings**: Switch between sample/full mode as needed

**Happy Translation Verification!** 🎉

