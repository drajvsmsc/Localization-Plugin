# Icons Directory

This directory contains the extension icons in various sizes.

## Required Icon Sizes

According to Chrome Extension Manifest V3 requirements, you need:

- **icon-16.png** (16×16) - Extension toolbar icon (standard resolution)
- **icon-48.png** (48×48) - Extension management page
- **icon-128.png** (128×128) - Chrome Web Store and installation

## Creating Icons from SVG

### Using ImageMagick (Command Line)

Install ImageMagick:
```bash
# macOS
brew install imagemagick

# Ubuntu/Debian
sudo apt-get install imagemagick

# Windows (use Chocolatey)
choco install imagemagick
```

Generate PNG icons:
```bash
# Navigate to icons directory
cd icons

# Generate 16x16
convert -background none icon.svg -resize 16x16 icon-16.png

# Generate 48x48
convert -background none icon.svg -resize 48x48 icon-48.png

# Generate 128x128
convert -background none icon.svg -resize 128x128 icon-128.png
```

### Using Online Tools

1. **SVG to PNG Converter**: https://svgtopng.com/
   - Upload `icon.svg`
   - Select size (16, 48, 128)
   - Download PNG files

2. **CloudConvert**: https://cloudconvert.com/svg-to-png
   - Upload SVG
   - Set dimensions
   - Convert and download

3. **GIMP** (Free Desktop Software):
   - Open `icon.svg` in GIMP
   - Export as PNG with desired dimensions
   - Repeat for each size

### Using Node.js (sharp library)

```bash
npm install sharp

node -e "
const sharp = require('sharp');
['16', '48', '128'].forEach(size => {
  sharp('icon.svg')
    .resize(parseInt(size), parseInt(size))
    .png()
    .toFile(\`icon-\${size}.png\`);
});
"
```

## Design Guidelines

- **Simple & Recognizable**: Icon should be clear at 16×16 pixels
- **High Contrast**: Use colors that stand out in toolbar
- **Consistent Theme**: Match brand colors (#667eea purple gradient)
- **No Text**: Avoid text that becomes unreadable at small sizes
- **Transparent Background**: Use PNG with transparency

## Current Icon Design

The included `icon.svg` features:
- 🌍 Globe representing internationalization
- ✓ Check mark indicating validation
- A/字 Letters representing multiple languages
- Purple gradient matching extension theme

## Placeholder Icons

If you haven't generated PNG icons yet, you can use placeholder icons temporarily:

```bash
# Create simple colored squares (temporary)
convert -size 16x16 xc:"#667eea" icon-16.png
convert -size 48x48 xc:"#667eea" icon-48.png
convert -size 128x128 xc:"#667eea" icon-128.png
```

## Verification

After creating icons, verify they exist:

```bash
ls -la icons/
```

Expected output:
```
icon-16.png   (16×16 pixels)
icon-48.png   (48×48 pixels)
icon-128.png  (128×128 pixels)
icon.svg      (source file)
```

## Alternative: Use Existing Icons

If you prefer to use professional icons:

1. **Download from:**
   - [Heroicons](https://heroicons.com/)
   - [Font Awesome](https://fontawesome.com/)
   - [Material Icons](https://fonts.google.com/icons)
   - [Flaticon](https://www.flaticon.com/)

2. **Ensure license compatibility** (commercial use allowed)

3. **Resize to required dimensions**

---

**Note:** The extension will not load without valid icon files. Make sure to generate all three PNG sizes before loading the extension.

