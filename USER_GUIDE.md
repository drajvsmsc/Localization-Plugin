# LocalizationChecker - User Guide

Complete guide to using the LocalizationChecker browser extension for automated localization testing.

## Table of Contents

1. [Getting Started](#getting-started)
2. [Interface Overview](#interface-overview)
3. [Running Your First Analysis](#running-your-first-analysis)
4. [Understanding Results](#understanding-results)
5. [Configuration & Settings](#configuration--settings)
6. [Exporting Reports](#exporting-reports)
7. [Advanced Features](#advanced-features)
8. [Best Practices](#best-practices)
9. [FAQ](#faq)
10. [Troubleshooting](#troubleshooting)

---

## Getting Started

### Prerequisites

- Chrome 90+ or Edge 90+ or Firefox 89+
- Extension installed (see [INSTALLATION.md](INSTALLATION.md))
- Required libraries downloaded (franc.js, compromise.js)

### Opening the Extension

1. Navigate to any website
2. Click the LocalizationChecker icon in your browser toolbar
3. The popup interface will open

---

## Interface Overview

### Popup Window

The popup consists of several sections:

#### 1. Header
- Shows current website URL
- Displays extension status

#### 2. Configuration Panel
- **Target Region**: Select the geographic region to test
- **Target Language**: Choose expected language for that region
- **Exclude Common Nouns**: Toggle to exclude/include common nouns
- **Analyze Button**: Start analysis
- **Clear Results Button**: Reset current results

#### 3. Summary Section
- **Total Elements**: Count of text elements scanned
- **Localized**: Successfully translated content
- **Non-Localized**: English text needing translation
- **Proper Nouns**: Names/brands (excluded from count)
- **Excluded**: Custom exclusions applied

#### 4. Findings List
- Detailed list of all text elements found
- Status indicators for each item
- Search and filter capabilities
- Pagination for large result sets

#### 5. Footer Actions
- Export buttons (Excel, Word, PDF)
- Settings link

---

## Running Your First Analysis

### Step-by-Step Example

Let's test a website for Hindi localization:

1. **Navigate to website**
   ```
   Open: https://example.com
   ```

2. **Open extension**
   - Click LocalizationChecker icon in toolbar

3. **Configure analysis**
   - Region: Select "India"
   - Language: Select "Hindi"
   - Exclude Common Nouns: Leave unchecked (default)

4. **Run analysis**
   - Click "Analyze" button
   - Wait 2-5 seconds for processing

5. **Review results**
   ```
   Summary shows:
   - Total Elements: 47
   - Localized: 40 (85%)
   - Non-Localized: 3 (6%)
   - Proper Nouns: 4 (9%)
   ```

6. **Examine findings**
   - Scroll through detailed findings list
   - Click on items to see more details
   - Use search to find specific text

### Quick Analysis Tips

✅ **Do:**
- Wait for page to fully load before analyzing
- Test multiple pages of the same site
- Export results for documentation
- Compare results across different regions

❌ **Don't:**
- Run analysis on chrome:// or about:// pages
- Analyze before page content loads
- Ignore proper noun classifications

---

## Understanding Results

### Status Classifications

#### ✓ Localized (Green)
**Meaning**: Text has been properly translated to target language

**Example**:
```
Text: "नमस्ते, स्वागत है" (Hindi)
Status: ✓ Localized
Reason: Non-English text detected
```

**Action**: ✅ No action needed

#### ✗ Non-Localized (Red)
**Meaning**: English text found that should be translated

**Example**:
```
Text: "Welcome to our service"
Status: ✗ Non-Localized
Element: <h1>
Location: Header
Reason: English text needs localization
```

**Action**: ⚠️ Translation required

#### ◐ Proper Noun Only (Blue)
**Meaning**: Contains only proper nouns (names, brands)

**Example**:
```
Text: "Google Chrome"
Status: ◐ Proper Noun Only
Reason: Contains primarily proper nouns
```

**Action**: ✅ Usually acceptable, but review for context

#### ⊘ Excluded (Yellow)
**Meaning**: Filtered by custom exclusion rules

**Example**:
```
Text: "API v2.0"
Status: ⊘ Excluded
Reason: Custom exclusion rule
```

**Action**: ✅ Intentionally excluded

### Summary Statistics

#### Localization Coverage Percentage
```
Formula: (Localized Count / Total Elements) × 100
Example: (40 / 47) × 100 = 85%
```

**Interpretation**:
- **90-100%**: Excellent localization
- **70-89%**: Good, minor issues
- **50-69%**: Fair, needs improvement
- **Below 50%**: Poor, significant issues

---

## Configuration & Settings

### Access Settings

Click "Settings" in popup footer or:
- Chrome: Right-click extension icon → Options
- Firefox: about:addons → LocalizationChecker → Options

### General Settings

#### Default Region & Language
Set your most commonly used region/language pair:
```
Region: India
Language: Hindi
```
This becomes the default selection in the popup.

#### Detection Sensitivity (50%-99%)
Controls how strictly English is detected:
- **50-70%**: Lenient (catches more, more false positives)
- **75-85%**: Balanced (recommended)
- **86-99%**: Strict (catches less, fewer false positives)

**Recommendation**: Start at 85% and adjust based on results

#### Auto-Analyze on Page Load
⚠️ **Experimental**: Automatically runs analysis when page loads
- Useful for testing workflows
- May slow down browsing
- Disabled by default

### Noun Filtering Settings

#### Proper Noun Exclusion
**Always Active** - Cannot be disabled

Excludes:
- Brand names: "Google", "Microsoft", "Apple"
- Product names: "iPhone", "Windows", "Chrome"
- Person names: "John Smith", "Jane Doe"
- Place names: "New York", "Paris", "Tokyo"

#### Common Noun Exclusion
**Optional** - Toggle on/off

When enabled, excludes:
- Common objects: "computer", "table", "browser"
- Generic terms: "file", "folder", "document"
- Technical terms: "server", "database", "network"

**When to enable**:
- ✅ Product intentionally uses English terms
- ✅ Technical documentation with standard terminology
- ✅ Internal tools with established English conventions

**When to disable**:
- ❌ Consumer-facing applications
- ❌ Full localization expected
- ❌ Region-specific requirements mandate translation

#### Filtering Mode

**Strict**: Only excludes clear, unambiguous proper nouns
- Use for: Consumer applications with full localization

**Moderate**: Balanced approach (recommended)
- Use for: Most applications

**Lenient**: Excludes more potential nouns
- Use for: Technical documentation, internal tools

### Custom Exclusions

#### Exclusion Word List

Add words to exclude (one per line):
```
API
SDK
HTTP
HTTPS
URL
JSON
XML
OAuth
```

**Use cases**:
- Technical abbreviations
- Industry-standard terms
- Brand-specific terminology
- Version numbers

#### Regular Expression Patterns

Add regex patterns for advanced matching:
```
v\d+\.\d+              # Version numbers: v1.0, v2.5
\d+GB                  # Storage: 256GB, 512GB
\d+px                  # Pixels: 1920px, 100px
\w+@\w+\.\w+          # Email addresses
#[0-9A-Fa-f]{6}       # Hex colors: #FF5733
```

**Test Patterns**: Use "Test Patterns" button to validate regex

#### Import/Export Exclusions

**Export**:
1. Click "Export" button
2. Save JSON file
3. Share with team

**Import**:
1. Click "Import" button
2. Select JSON file
3. Exclusions applied automatically

**File format**:
```json
{
  "words": ["API", "SDK", "HTTP"],
  "patterns": ["v\\d+\\.\\d+", "\\d+GB"],
  "exportDate": "2025-11-04T10:30:00Z"
}
```

---

## Exporting Reports

### Export Formats

#### Excel (.csv)
**Best for**: Data analysis, spreadsheet manipulation

**Contents**:
- Summary statistics
- Detailed findings table
- Metadata (URL, region, language, date)

**How to export**:
1. Run analysis
2. Click "Export Excel"
3. File downloads automatically
4. Open in Excel, Google Sheets, or LibreOffice

**File naming**:
```
localization-report_India-Hindi_2025-11-04T10-30-00.csv
```

#### Word (.doc)
**Best for**: Formal reports, documentation

**Contents**:
- Title page with metadata
- Executive summary
- Statistics
- Formatted findings table
- Professional layout

**How to export**:
1. Run analysis
2. Click "Export Word"
3. File downloads automatically
4. Open in Microsoft Word, Google Docs, or LibreOffice

**File naming**:
```
localization-report_India-Hindi_2025-11-04T10-30-00.doc
```

#### PDF (.pdf)
**Best for**: Sharing, archiving, presentations

**Contents**:
- Print-ready format
- Visual charts
- Grouped findings
- Page numbers

**How to export**:
1. Run analysis
2. Click "Export PDF"
3. Print dialog opens
4. Save as PDF or print

**Tip**: Use browser's "Save as PDF" option in print dialog

### Report Contents

All exports include:

**Metadata**:
- Website URL
- Target region and language
- Analysis date and time
- Extension version

**Summary Statistics**:
- Total elements scanned
- Localized count and percentage
- Non-localized count and percentage
- Proper noun count
- Excluded count

**Detailed Findings**:
- Status (Localized/Non-Localized/etc.)
- Text content
- HTML element type
- Page location
- Classification reason

---

## Advanced Features

### Search & Filter

#### Search Findings
Type in search box to filter by text content:
```
Search: "welcome"
Results: Shows only items containing "welcome"
```

**Tips**:
- Case-insensitive search
- Partial matches work
- Clears on "Clear Results"

#### Filter by Status
Use status dropdown:
- **All**: Show everything
- **Non-Localized**: Only issues
- **Localized**: Only translated content
- **Proper Nouns**: Only names/brands
- **Excluded**: Only custom exclusions

**Use case**: Focus on non-localized items to prioritize fixes

### Pagination

For pages with many elements:
- **Items per page**: 10 (default)
- **Navigation**: Previous/Next buttons
- **Page info**: "Page 1 of 5"

### Multi-Page Testing

**Workflow**:
1. Analyze page 1, export results
2. Navigate to page 2
3. Analyze page 2, export results
4. Compare results across pages

**Future feature**: Batch analysis of multiple pages

---

## Best Practices

### Testing Workflow

#### 1. Preparation
- Identify target regions and languages
- Document expected localization coverage
- Create custom exclusion list for your product

#### 2. Systematic Testing
```
For each region:
  For each critical page:
    1. Navigate to page
    2. Run analysis
    3. Review findings
    4. Export report
    5. Document issues
```

#### 3. Documentation
- Export reports for each test
- Track issues in bug tracker
- Monitor localization coverage over time

#### 4. Iteration
- Retest after fixes
- Compare before/after coverage
- Update exclusion lists as needed

### Region-Specific Testing

#### India
**Languages**: Hindi, Telugu, Tamil, Kannada, Marathi
**Considerations**:
- Multiple scripts (Devanagari, Telugu, Tamil, etc.)
- Regional variations
- Mix of English and regional language acceptable in some contexts

#### Europe
**Languages**: French, Spanish, German
**Considerations**:
- Complete translation typically expected
- Fewer proper noun issues
- Cultural adaptation important

#### Asia
**Languages**: Japanese, Chinese
**Considerations**:
- Character encoding crucial
- RTL not applicable, but vertical text possible
- Technical terms often kept in English

### Team Collaboration

#### Share Settings
1. Export exclusion rules
2. Share with team
3. Ensure consistent testing

#### Standardize Process
- Document testing workflow
- Create test case templates
- Use consistent naming for exports

#### Track Metrics
- Measure localization coverage over time
- Set targets (e.g., >95% coverage)
- Monitor trends in reports

---

## FAQ

### General Questions

**Q: Does the extension send data to external servers?**  
A: No. All processing happens locally in your browser. No data is transmitted.

**Q: Can I use this extension on internal/private websites?**  
A: Yes. The extension works on any website accessible to your browser.

**Q: Does it work offline?**  
A: Yes, once libraries are downloaded, the extension works completely offline.

**Q: What browsers are supported?**  
A: Chrome 90+, Edge 90+, Brave 1.x+. Firefox 89+ with minimal modifications.

### Analysis Questions

**Q: Why are some English words marked as "Localized"?**  
A: They may be proper nouns or match custom exclusion rules.

**Q: How accurate is the language detection?**  
A: ~95% accuracy with franc.js. Adjust sensitivity in settings if needed.

**Q: Can it detect mixed language content?**  
A: Yes, it analyzes each text element independently.

**Q: Why does analysis take a long time?**  
A: Large pages (1000+ elements) take longer. Typical pages complete in 2-5 seconds.

### Configuration Questions

**Q: Should I exclude common nouns?**  
A: Depends on your product. Enable for technical tools, disable for consumer apps.

**Q: How do I add custom exclusions?**  
A: Settings → Exclusions tab → Add words or regex patterns.

**Q: Can I test multiple languages simultaneously?**  
A: Not currently. Analyze each language separately.

### Export Questions

**Q: Can I customize export format?**  
A: Not currently. Future versions may include templates.

**Q: Why is PDF export opening print dialog?**  
A: Use "Save as PDF" in print dialog for PDF output.

**Q: Can I schedule automated exports?**  
A: Not currently. Future versions may include CI/CD integration.

---

## Troubleshooting

### Common Issues

#### Extension icon not showing
**Symptoms**: Can't find extension in toolbar

**Solutions**:
1. Click puzzle icon (Extensions menu)
2. Find LocalizationChecker
3. Click pin icon
4. OR enable in chrome://extensions/

#### Analysis returns no results
**Symptoms**: "Total Elements: 0" or empty findings

**Solutions**:
1. Wait for page to fully load
2. Refresh page and try again
3. Check if page is privileged URL (chrome://, about://)
4. Verify extension has permissions

#### Libraries not loading error
**Symptoms**: "Language detection unavailable" or "POS tagging disabled"

**Solutions**:
1. Check libs/ folder contains franc.min.js and compromise.min.js
2. Verify file sizes (not 0 bytes)
3. Reload extension in chrome://extensions/
4. See [libs/LIBRARIES_SETUP.md](libs/LIBRARIES_SETUP.md)

#### Export not working
**Symptoms**: Export button does nothing or error

**Solutions**:
1. Check browser download settings
2. Allow pop-ups for extension
3. Try different export format
4. Check browser console (F12) for errors

#### Slow performance
**Symptoms**: Analysis takes >10 seconds

**Solutions**:
1. Page may have many elements (check Total Elements count)
2. Close other tabs to free memory
3. Disable auto-analyze feature
4. Try on smaller pages first

#### Incorrect classifications
**Symptoms**: English text marked as "Localized" or vice versa

**Solutions**:
1. Adjust detection sensitivity in settings
2. Review custom exclusion rules
3. Check filtering mode (strict/moderate/lenient)
4. Report issue with example on GitHub

### Error Messages

#### "Cannot analyze privileged pages"
**Cause**: Trying to analyze chrome://, edge://, or about:// pages

**Solution**: Extension cannot access these pages due to browser restrictions

#### "Failed to inject content script"
**Cause**: Permission denied or page not fully loaded

**Solution**: Refresh page and try again

#### "Storage quota exceeded"
**Cause**: Too much data stored (very rare)

**Solution**: Clear results and settings, restart browser

### Getting Help

Still having issues?

1. **Check documentation**: README.md, INSTALLATION.md
2. **Search issues**: GitHub issues for similar problems
3. **Report bug**: Create new issue with details
4. **Contact support**: support@localizationchecker.dev

---

## Keyboard Shortcuts

Currently not implemented. Future versions may include:

- `Alt+L`: Open extension popup
- `Alt+A`: Run analysis
- `Alt+E`: Export last report
- `Alt+C`: Clear results

---

## Tips & Tricks

### Power User Tips

1. **Bulk Testing**: Open multiple tabs, analyze each, export all
2. **Regex Mastery**: Use regex101.com to test patterns before adding
3. **Team Sync**: Share exclusion JSON files via version control
4. **Trend Analysis**: Compare exports over time to track progress
5. **Custom Workflow**: Combine with test automation tools

### Performance Optimization

1. **Close unused tabs**: Free up memory
2. **Clear old results**: Remove stored data periodically
3. **Use search/filter**: Navigate large result sets faster
4. **Export regularly**: Don't let results accumulate

### Quality Assurance

1. **Spot check**: Manually verify sample findings
2. **Cross-reference**: Compare with manual testing
3. **Document exceptions**: Maintain list of known proper nouns
4. **Iterate**: Refine exclusions based on false positives

---

**Need more help?** Visit our [documentation site](https://github.com/localization-checker/docs) or [open an issue](https://github.com/localization-checker/issues).

Happy testing! 🌍✨

