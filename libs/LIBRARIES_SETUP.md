# Required External Libraries Setup

This extension requires the following JavaScript libraries to function properly:

## 1. franc.js (Language Detection)
**Version:** 6.x or higher  
**License:** MIT  
**Purpose:** Detect the language of text content

### Installation:
Download from: https://cdn.jsdelivr.net/npm/franc-min@6/dist/index.js

Save as: `libs/franc.min.js`

Or use CDN:
```html
<script src="https://cdn.jsdelivr.net/npm/franc-min@6"></script>
```

### Usage in extension:
The library is already included in the content script manifest configuration.

---

## 2. compromise.js (NLP & POS Tagging)
**Version:** 14.x or higher  
**License:** MIT  
**Purpose:** Natural language processing and part-of-speech tagging

### Installation:
Download from: https://cdn.jsdelivr.net/npm/compromise@14/builds/compromise.min.js

Save as: `libs/compromise.min.js`

Or use CDN:
```html
<script src="https://cdn.jsdelivr.net/npm/compromise@14/builds/compromise.min.js"></script>
```

### Usage in extension:
The library is already included in the content script manifest configuration.

---

## 3. SheetJS (Excel Export) - Optional for Advanced Excel
**Version:** 0.18.x or higher  
**License:** Apache 2.0  
**Purpose:** Create Excel files (currently using CSV fallback)

### Installation:
Download from: https://cdn.sheetjs.com/xlsx-0.18.5/package/dist/xlsx.full.min.js

Save as: `libs/xlsx.full.min.js`

---

## 4. jsPDF (PDF Export) - Optional for Advanced PDF
**Version:** 2.x or higher  
**License:** MIT  
**Purpose:** Create PDF files (currently using print fallback)

### Installation:
Download from: https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js

Save as: `libs/jspdf.min.js`

---

## Quick Setup Script

Run this command to download all libraries (requires curl or wget):

```bash
# Create libs directory if it doesn't exist
mkdir -p libs

# Download franc.js
curl -o libs/franc.min.js https://cdn.jsdelivr.net/npm/franc-min@6/dist/index.js

# Download compromise.js  
curl -o libs/compromise.min.js https://cdn.jsdelivr.net/npm/compromise@14/builds/compromise.min.js

# Optional: Download SheetJS
curl -o libs/xlsx.full.min.js https://cdn.sheetjs.com/xlsx-0.18.5/package/dist/xlsx.full.min.js

# Optional: Download jsPDF
curl -o libs/jspdf.min.js https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js
```

---

## Alternative: Use npm to download

```bash
npm install franc-min compromise

# Copy to libs folder
cp node_modules/franc-min/dist/index.js libs/franc.min.js
cp node_modules/compromise/builds/compromise.min.js libs/compromise.min.js
```

---

## Verification

After downloading, verify the files exist:

```bash
ls -la libs/
```

You should see:
- `franc.min.js` (~150 KB)
- `compromise.min.js` (~500 KB)

---

## Note

The extension will still work without these libraries, but with reduced functionality:
- Without **franc.js**: Falls back to simple ASCII character detection
- Without **compromise.js**: Cannot identify proper nouns or common nouns
- Export functions use HTML/CSV fallbacks which work in all cases

For full functionality, please download and include both required libraries.

