# Quick Start Guide

Get up and running with LocalizationChecker in 5 minutes!

## 🚀 Super Quick Setup (3 Steps)

### 1. Download & Setup

```bash
# Clone repository
git clone https://github.com/localization-checker/extension.git
cd extension

# Run setup script (downloads libraries automatically)
./setup.sh
```

**Windows users**: Use Git Bash or manually download libraries (see below)

### 2. Load Extension

**Chrome/Edge:**
1. Open `chrome://extensions/`
2. Toggle "Developer mode" ON (top-right)
3. Click "Load unpacked"
4. Select the `extension` folder
5. Done! 🎉

### 3. Test It

1. Visit any website (e.g., https://example.com)
2. Click the LocalizationChecker icon in toolbar
3. Select region (e.g., "India") and language (e.g., "Hindi")
4. Click "Analyze"
5. See results!

---

## ⚡ 60-Second Tutorial

### Your First Analysis

```
Step 1: Open any website
        → https://google.com

Step 2: Click extension icon
        → Popup opens

Step 3: Configure
        Region: India
        Language: Hindi
        
Step 4: Click "Analyze"
        → Wait 2 seconds

Step 5: View Results
        ✓ Localized: 45 (82%)
        ✗ Non-Localized: 10 (18%)
        
Step 6: Export (optional)
        → Click "Export Excel"
        → Download report
```

**That's it!** You've just performed your first automated localization test.

---

## 🔧 Manual Library Download (if setup.sh fails)

### Required Files

Download and save to `libs/` folder:

1. **franc.min.js**
   ```bash
   curl -o libs/franc.min.js https://cdn.jsdelivr.net/npm/franc-min@6/dist/index.js
   ```
   Or download: https://cdn.jsdelivr.net/npm/franc-min@6/dist/index.js

2. **compromise.min.js**
   ```bash
   curl -o libs/compromise.min.js https://cdn.jsdelivr.net/npm/compromise@14/builds/compromise.min.js
   ```
   Or download: https://cdn.jsdelivr.net/npm/compromise@14/builds/compromise.min.js

### Verify Downloads

```bash
ls -lh libs/
# Should show:
# franc.min.js (~150KB)
# compromise.min.js (~500KB)
```

---

## 🎯 Common Use Cases

### Test Website for Hindi Localization
```
Region: India
Language: Hindi
→ Analyze
→ Export Excel
```

### Test App for French Localization
```
Region: France
Language: French
→ Analyze
→ Review non-localized items
```

### Test with Custom Exclusions
```
Settings → Exclusions
→ Add: API, SDK, OAuth
→ Save
→ Run analysis
```

---

## 📊 Understanding Results

### Status Icons

| Icon | Meaning | Action |
|------|---------|--------|
| ✓ | Localized | ✅ Good |
| ✗ | Non-Localized | ⚠️ Fix |
| ◐ | Proper Noun | ✅ Usually OK |
| ⊘ | Excluded | ℹ️ Intentional |

### Coverage Metrics

- **90-100%**: Excellent ⭐⭐⭐⭐⭐
- **70-89%**: Good ⭐⭐⭐⭐
- **50-69%**: Fair ⭐⭐⭐
- **<50%**: Needs Work ⭐⭐

---

## 🛠️ Quick Troubleshooting

### Extension Not Loading?
```bash
# Verify files exist
ls manifest.json
ls libs/franc.min.js
ls libs/compromise.min.js

# If missing, run setup again
./setup.sh
```

### No Results?
1. Wait for page to load completely
2. Refresh page and try again
3. Check if it's a privileged URL (chrome://)

### Libraries Missing?
```bash
# Re-run setup
cd extension
./setup.sh
```

---

## 📚 Next Steps

Once you're comfortable with basics:

1. **Customize Settings**
   - Click "Settings" in popup
   - Set default region/language
   - Add custom exclusions

2. **Explore Features**
   - Search and filter findings
   - Try different export formats
   - Test multiple regions

3. **Read Full Guides**
   - [USER_GUIDE.md](USER_GUIDE.md) - Complete guide
   - [INSTALLATION.md](INSTALLATION.md) - Detailed setup
   - [README.md](README.md) - Full documentation

---

## 💡 Pro Tips

1. **Keyboard Shortcuts**: Pin extension for quick access
2. **Batch Testing**: Open multiple tabs, analyze each
3. **Export Everything**: Keep reports for tracking progress
4. **Custom Exclusions**: Build a list for your product
5. **Regular Testing**: Test after each deployment

---

## 🆘 Need Help?

- 📖 [Full Documentation](README.md)
- 🐛 [Report Issue](https://github.com/localization-checker/issues)
- 💬 [Ask Questions](https://github.com/localization-checker/discussions)
- 📧 Email: support@localizationchecker.dev

---

## ✅ Quick Checklist

Before your first real test:

- [ ] Extension loaded and visible in toolbar
- [ ] Libraries downloaded (franc.js, compromise.js)
- [ ] Tested on sample page successfully
- [ ] Reviewed settings options
- [ ] Tried export functionality
- [ ] Read basic documentation

---

**Ready to test? Let's go!** 🚀

*Need more details? See [USER_GUIDE.md](USER_GUIDE.md) for comprehensive instructions.*

