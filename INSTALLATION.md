# Installation Guide - LocalizationChecker Extension

This guide provides step-by-step instructions for installing the LocalizationChecker browser extension.

## Table of Contents
1. [Requirements](#requirements)
2. [Method 1: Chrome Web Store (Recommended)](#method-1-chrome-web-store)
3. [Method 2: Manual Installation (Development)](#method-2-manual-installation)
4. [Download Required Libraries](#download-required-libraries)
5. [Verify Installation](#verify-installation)
6. [Troubleshooting](#troubleshooting)

---

## Requirements

### Browser Support
- **Chrome/Chromium**: Version 90 or higher
- **Microsoft Edge**: Version 90 or higher
- **Brave Browser**: Version 1.x or higher
- **Firefox**: Version 89 or higher (with minor modifications)

### System Requirements
- Operating System: Windows 10+, macOS 10.14+, or Linux
- RAM: At least 4GB (8GB recommended)
- Disk Space: ~10 MB for extension

---

## Method 1: Chrome Web Store

### Coming Soon
The extension will be available on the Chrome Web Store after review and approval.

**Steps:**
1. Visit Chrome Web Store (link TBA)
2. Click "Add to Chrome"
3. Review permissions and click "Add extension"
4. Extension icon appears in toolbar
5. Click icon to start using

---

## Method 2: Manual Installation

### For Chrome/Edge/Brave

#### Step 1: Download the Extension

**Option A: Clone from Git**
```bash
git clone https://github.com/localization-checker/extension.git
cd extension
```

**Option B: Download ZIP**
1. Go to [GitHub repository](https://github.com/localization-checker/extension)
2. Click "Code" → "Download ZIP"
3. Extract the ZIP file to a folder

#### Step 2: Download Required Libraries

Navigate to the extension folder and run:

```bash
cd libs

# Download franc.js (language detection)
curl -o franc.min.js https://cdn.jsdelivr.net/npm/franc-min@6/dist/index.js

# Download compromise.js (POS tagging)
curl -o compromise.min.js https://cdn.jsdelivr.net/npm/compromise@14/builds/compromise.min.js
```

**Alternative for Windows (PowerShell):**
```powershell
cd libs

# Download franc.js
Invoke-WebRequest -Uri "https://cdn.jsdelivr.net/npm/franc-min@6/dist/index.js" -OutFile "franc.min.js"

# Download compromise.js
Invoke-WebRequest -Uri "https://cdn.jsdelivr.net/npm/compromise@14/builds/compromise.min.js" -OutFile "compromise.min.js"
```

**Manual Download:**
1. Download [franc.min.js](https://cdn.jsdelivr.net/npm/franc-min@6/dist/index.js)
2. Download [compromise.min.js](https://cdn.jsdelivr.net/npm/compromise@14/builds/compromise.min.js)
3. Save both files to the `libs/` folder

See detailed instructions in [libs/LIBRARIES_SETUP.md](libs/LIBRARIES_SETUP.md)

#### Step 3: Load Extension in Chrome

1. **Open Chrome Extensions page:**
   - Navigate to `chrome://extensions/`
   - OR click the three dots menu → More Tools → Extensions

2. **Enable Developer Mode:**
   - Toggle the "Developer mode" switch in the top-right corner

3. **Load the extension:**
   - Click "Load unpacked" button
   - Navigate to and select the extension folder
   - Click "Select Folder"

4. **Verify installation:**
   - You should see "LocalizationChecker" in your extensions list
   - The extension icon should appear in your toolbar
   - If not visible, click the puzzle icon and pin LocalizationChecker

### For Firefox

#### Step 1: Download Extension
Follow steps 1 and 2 from Chrome installation above.

#### Step 2: Load Extension (Temporary)

1. **Open Firefox Add-ons page:**
   - Navigate to `about:debugging#/runtime/this-firefox`
   - OR type `about:debugging` and click "This Firefox"

2. **Load temporary add-on:**
   - Click "Load Temporary Add-on..."
   - Navigate to extension folder
   - Select `manifest.json` file
   - Click "Open"

3. **Note:** Firefox temporary add-ons are removed when browser closes
   - For permanent installation, the extension needs to be signed
   - See [Firefox Extension Signing](https://extensionworkshop.com/documentation/publish/signing-and-distribution-overview/)

---

## Download Required Libraries

The extension requires two external libraries for full functionality:

### 1. franc.js (Language Detection)
**Required**: Yes  
**Size**: ~150 KB

```bash
curl -o libs/franc.min.js https://cdn.jsdelivr.net/npm/franc-min@6/dist/index.js
```

### 2. compromise.js (POS Tagging)
**Required**: Yes  
**Size**: ~500 KB

```bash
curl -o libs/compromise.min.js https://cdn.jsdelivr.net/npm/compromise@14/builds/compromise.min.js
```

### Verification

After downloading, verify files exist:

```bash
ls -la libs/
```

Expected output:
```
-rw-r--r--  franc.min.js        (~150 KB)
-rw-r--r--  compromise.min.js   (~500 KB)
-rw-r--r--  export-handler.js
-rw-r--r--  utils.js
-rw-r--r--  LIBRARIES_SETUP.md
```

**Note:** The extension will work with reduced functionality if libraries are missing:
- Without franc.js: Uses simple ASCII detection fallback
- Without compromise.js: Cannot identify proper/common nouns

---

## Verify Installation

### Test Extension is Working

1. **Click the extension icon** in your toolbar
2. **Popup should open** showing the LocalizationChecker interface
3. **Navigate to any website** (e.g., https://example.com)
4. **Select a region** (e.g., "India") and language (e.g., "Hindi")
5. **Click "Analyze"** button
6. **Results should appear** within a few seconds

### Expected Behavior
- Popup loads in < 500ms
- Analysis completes in < 5 seconds for typical pages
- Summary statistics display correctly
- Findings list shows detected text elements

### Common Issues

#### Extension icon not showing
**Solution:**
- Click the puzzle icon (Extensions) in Chrome toolbar
- Find "LocalizationChecker"
- Click the pin icon to keep it visible

#### "Libraries not loaded" error
**Solution:**
- Ensure franc.min.js and compromise.min.js are in libs/ folder
- Check file sizes are correct (not 0 bytes)
- Reload the extension (chrome://extensions → click reload icon)

#### "Cannot analyze page" error
**Solution:**
- Ensure you're not on a privileged page (chrome://, edge://, about://)
- Refresh the web page and try again
- Check browser console (F12) for errors

#### Popup doesn't open
**Solution:**
- Check if extension is enabled (chrome://extensions/)
- Try disabling and re-enabling the extension
- Check for conflicts with other extensions
- Restart browser

---

## Updating the Extension

### Chrome Web Store Version
- Updates automatically
- Notification appears when new version is available

### Manual Installation Version
1. Download latest version
2. Extract to new folder or overwrite existing
3. Download updated libraries (if needed)
4. Reload extension in chrome://extensions/

---

## Uninstallation

### Chrome/Edge/Brave
1. Go to `chrome://extensions/`
2. Find "LocalizationChecker"
3. Click "Remove"
4. Confirm removal

### Firefox
1. Go to `about:addons`
2. Find "LocalizationChecker"
3. Click "..." menu → "Remove"
4. Confirm removal

**Note:** Uninstalling removes all saved settings and data.

---

## Next Steps

After successful installation:

1. **Configure settings:**
   - Click extension icon → Settings
   - Set default region and language
   - Configure noun filtering preferences
   - Add custom exclusions if needed

2. **Test on sample pages:**
   - Visit a multilingual website
   - Run analysis with different region/language combinations
   - Familiarize yourself with the interface

3. **Explore export features:**
   - Try exporting results to Excel
   - Generate Word and PDF reports
   - Review export formats

4. **Read documentation:**
   - See [README.md](README.md) for full user guide
   - Check [USER_GUIDE.md](USER_GUIDE.md) for advanced features
   - Visit GitHub for latest updates

---

## Support

Need help with installation?

- 📖 [Full Documentation](https://github.com/localization-checker/docs)
- 🐛 [Report Issues](https://github.com/localization-checker/issues)
- 💬 [Community Forum](https://github.com/localization-checker/discussions)
- 📧 Email: support@localizationchecker.dev

---

**Installation successful? Start testing!** 🎉

