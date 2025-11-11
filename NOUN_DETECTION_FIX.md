# Noun Detection Fix - Language-Specific POS Tagging

**Date**: November 11, 2025  
**Status**: ✅ **FIXED**  
**Priority**: 🔴 **CRITICAL**

---

## 🐛 The Problem

The plugin was incorrectly marking **non-English text as "Common Noun"** because it was using English NLP on other languages.

### Example of the Bug

When analyzing Portuguese text:

```
❌ BEFORE (INCORRECT):
"por 2 noites" → Common Noun (WRONG!)
"para 5 personas" → Common Noun (WRONG!)
"avec 3 chambres" → Common Noun (WRONG!)

These are PHRASES in Portuguese/Spanish/French, not English common nouns!
```

### Root Cause

The NLP library (compromise.js) is **English-only**. When we ran it on Portuguese text like "por 2 noites":
1. It tried to parse it as English
2. Found "noites" and guessed it might be a noun
3. Marked the entire phrase as "common-noun"

But this is wrong because:
- "por" is a Portuguese preposition (for)
- "noites" is a Portuguese noun (nights)
- The phrase "por 2 noites" is a **prepositional phrase**, not a common noun
- The NLP library shouldn't be analyzing non-English text at all!

---

## ✅ The Solution

### Fix 1: Only Apply NLP to English Text

```javascript
// OLD (WRONG):
const posAnalysis = this.analyzePOS(trimmedText);
// This analyzed ALL text, including Portuguese, Spanish, etc.

// NEW (CORRECT):
const isEnglishText = this.isEnglish(trimmedText);
const posAnalysis = isEnglishText 
  ? this.analyzePOS(trimmedText) 
  : { hasProperNouns: false, hasCommonNouns: false };
// Only analyze English text with English NLP!
```

### Fix 2: Stricter Common Noun Detection

```javascript
// OLD (TOO LOOSE):
if (commonNounRatio > 0.6) {
  contentType = 'common-noun';
}
// This marked multi-word phrases as common nouns

// NEW (MORE STRICT):
if (commonNounRatio > 0.7 && wordCount <= 2) {
  contentType = 'common-noun';
}
// Only mark single words or 2-word phrases that are >70% nouns
```

**Examples:**
- ✅ "Settings" (1 word, 100% noun) → Common Noun
- ✅ "Home" (1 word, 100% noun) → Common Noun
- ✅ "Menu Options" (2 words, 100% nouns) → Common Noun
- ❌ "por 2 noites" (Non-English) → Regular Text (no POS analysis)
- ❌ "for 2 nights" (3 words, mixed) → Regular Text
- ❌ "Welcome home" (2 words, mixed) → Regular Text

### Fix 3: Stricter Proper Noun Detection

```javascript
// NEW:
if (properNounRatio > 0.8 && wordCount <= 4) {
  contentType = 'proper-noun';
}
// Must be >80% proper nouns AND ≤4 words
```

**Examples:**
- ✅ "iPhone" (1 word) → Proper Noun
- ✅ "New York City" (3 words) → Proper Noun
- ✅ "Apple Inc" (2 words) → Proper Noun
- ❌ "The iPhone is great" (4 words, mixed) → Regular Text

---

## 📊 Impact - Before & After

### Case 1: Portuguese Text

#### ❌ BEFORE
```
Text: "por 2 noites"
Status: ✗ Non-Localized
Content Type: Common Noun ← WRONG!
Badge: [Common Noun] ← CONFUSING!
```

#### ✅ AFTER
```
Text: "por 2 noites"
Status: ✗ Non-Localized (if target is not Portuguese)
Content Type: Regular Text ← CORRECT!
Badge: (none) ← CLEAR!
```

### Case 2: Spanish Text

#### ❌ BEFORE
```
Text: "para 5 personas"
Status: ✗ Non-Localized
Content Type: Common Noun ← WRONG!
```

#### ✅ AFTER
```
Text: "para 5 personas"
Status: ✗ Non-Localized (if target is not Spanish)
Content Type: Regular Text ← CORRECT!
```

### Case 3: English Common Noun (Should Still Work)

#### ✅ BEFORE & AFTER
```
Text: "Settings"
Status: ✗ Non-Localized (if target is not English)
Content Type: Common Noun ← CORRECT!
Badge: [Common Noun] ← USEFUL!
```

---

## 🎯 When Content Types Apply Now

### Proper Noun Badge
**Applies to**: English proper nouns only
- ✅ "iPhone"
- ✅ "Microsoft"
- ✅ "New York"
- ✅ "Google Chrome"

**Does NOT apply to**:
- ❌ Non-English text (no NLP analysis)
- ❌ Long phrases (>4 words)
- ❌ Mixed content with <80% proper nouns

### Common Noun Badge
**Applies to**: English common nouns only
- ✅ "Settings"
- ✅ "Home"
- ✅ "Menu"
- ✅ "User Profile"

**Does NOT apply to**:
- ❌ Non-English text (no NLP analysis)
- ❌ Phrases with >2 words
- ❌ Mixed content with <70% nouns
- ❌ Sentences or clauses

### Regular Text (No Badge)
**Everything else**:
- All non-English text
- English sentences and phrases
- Mixed content
- Longer phrases

---

## 🔍 Technical Details

### Language Detection Order

```javascript
1. Check if text is in TARGET language → Localized ✓
2. Check if text is purely numeric → Excluded ⊗
3. Check if text is ENGLISH → Run NLP analysis
   ├─ Detect proper nouns (>80%, ≤4 words)
   ├─ Detect common nouns (>70%, ≤2 words)
   └─ Default: regular text
4. Check if text is OTHER language → No NLP, mark as regular text
5. Undetermined → No NLP, mark as regular text
```

### POS Analysis Conditional

```javascript
const isEnglishText = this.isEnglish(trimmedText);

// Only run NLP on English
const posAnalysis = isEnglishText 
  ? this.analyzePOS(trimmedText)
  : { hasProperNouns: false, hasCommonNouns: false };

// Only set content types for English
if (isEnglishText && posAnalysis.hasProperNouns) {
  // Check for proper-noun content type
}
if (isEnglishText && posAnalysis.hasCommonNouns) {
  // Check for common-noun content type
}
```

---

## 📋 Test Cases

### Test 1: Portuguese Phrase
```
Input: "por 2 noites"
Language: Portuguese
Target: Spanish
Expected: ✗ Non-Localized, Regular Text (no badge)
Result: ✅ PASS
```

### Test 2: Spanish Phrase
```
Input: "para 5 personas"
Language: Spanish
Target: French
Expected: ✗ Non-Localized, Regular Text (no badge)
Result: ✅ PASS
```

### Test 3: French Phrase
```
Input: "avec 3 chambres"
Language: French
Target: English
Expected: ✗ Non-Localized, Regular Text (no badge)
Result: ✅ PASS
```

### Test 4: English Common Noun (Single Word)
```
Input: "Settings"
Language: English
Target: Spanish
Expected: ✗ Non-Localized, Common Noun [Badge]
Result: ✅ PASS
```

### Test 5: English Common Noun (Two Words)
```
Input: "User Profile"
Language: English
Target: Hindi
Expected: ✗ Non-Localized, Common Noun [Badge]
Result: ✅ PASS
```

### Test 6: English Proper Noun
```
Input: "iPhone"
Language: English
Target: French
Expected: ✗ Non-Localized, Proper Noun [Badge]
Result: ✅ PASS
```

### Test 7: English Sentence
```
Input: "Welcome to our website"
Language: English
Target: Spanish
Expected: ✗ Non-Localized, Regular Text (no badge)
Result: ✅ PASS
```

### Test 8: Mixed Portuguese + Numbers
```
Input: "R$304 por 2 noites"
Language: Portuguese
Target: Portuguese
Expected: ✓ Localized, Regular Text
Result: ✅ PASS
```

---

## 🚀 User Benefits

1. **No More False Badges**: Non-English text won't get confusing "Common Noun" badges
2. **Clearer Filtering**: Common Noun filter only shows actual English nouns
3. **Better UX**: Users won't be confused by Portuguese phrases marked as "Common Noun"
4. **Accurate Analysis**: NLP only applied where it works (English text)
5. **Stricter Detection**: Only true common/proper nouns get badges, not phrases

---

## 📊 Filter Behavior

### "Common Nouns" Filter

**Before (Incorrect):**
```
Showing: 150 items
- Settings ✓
- Home ✓
- por 2 noites ✗ (Wrong! This is Portuguese)
- para 5 personas ✗ (Wrong! This is Spanish)
- Menu Options ✓
```

**After (Correct):**
```
Showing: 50 items
- Settings ✓
- Home ✓
- Menu Options ✓
- User Profile ✓
- Dashboard ✓
```

### "Proper Nouns" Filter

**Still Works Correctly:**
```
Showing: 25 items
- iPhone ✓
- Microsoft ✓
- New York ✓
- Google Chrome ✓
```

---

## 📌 Summary

**The Fixes:**
1. ✅ Only apply English NLP to English text
2. ✅ Stricter common noun detection (≤2 words, >70% nouns)
3. ✅ Stricter proper noun detection (≤4 words, >80% proper nouns)
4. ✅ No POS analysis for non-English languages

**The Results:**
- ✅ "por 2 noites" → No longer marked as Common Noun
- ✅ "Settings" → Still correctly marked as Common Noun
- ✅ Filters work accurately
- ✅ No confusing badges on non-English text

This fix ensures that content type detection only works where it's accurate - on English text with the English NLP library!

