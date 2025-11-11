#!/usr/bin/env node

/**
 * Generate PNG icons from SVG
 * Uses sharp library if available, otherwise provides instructions
 */

const fs = require('fs');
const path = require('path');

const sizes = [16, 48, 128];
const svgPath = path.join(__dirname, 'icons', 'icon.svg');
const iconsDir = path.join(__dirname, 'icons');

// Check if sharp is available
let sharp;
try {
  sharp = require('sharp');
  console.log('✓ Using sharp library for conversion');
} catch (e) {
  console.log('⚠ sharp library not found. Attempting to install...');
  console.log('  Run: npm install sharp (or use alternative method)');
  
  // Try alternative: use puppeteer
  try {
    const puppeteer = require('puppeteer');
    generateWithPuppeteer();
    process.exit(0);
  } catch (e2) {
    console.error('\n❌ Neither sharp nor puppeteer are available.');
    console.log('\n📋 Alternative methods:');
    console.log('  1. Install ImageMagick: brew install imagemagick');
    console.log('  2. Use online converter: https://svgtopng.com/');
    console.log('  3. Install sharp: npm install sharp');
    console.log('\n📝 Manual conversion:');
    sizes.forEach(size => {
      console.log(`  convert -background none icons/icon.svg -resize ${size}x${size} icons/icon-${size}.png`);
    });
    process.exit(1);
  }
}

// Generate icons using sharp
async function generateWithSharp() {
  if (!fs.existsSync(svgPath)) {
    console.error(`❌ SVG file not found: ${svgPath}`);
    process.exit(1);
  }

  console.log(`\n🎨 Generating icons from: ${svgPath}\n`);

  for (const size of sizes) {
    try {
      const outputPath = path.join(iconsDir, `icon-${size}.png`);
      
      await sharp(svgPath)
        .resize(size, size, {
          kernel: sharp.kernel.lanczos3
        })
        .png()
        .toFile(outputPath);
      
      const stats = fs.statSync(outputPath);
      const fileSizeKB = (stats.size / 1024).toFixed(2);
      console.log(`  ✓ Generated icon-${size}.png (${size}x${size}, ${fileSizeKB} KB)`);
    } catch (error) {
      console.error(`  ✗ Failed to generate icon-${size}.png: ${error.message}`);
    }
  }

  console.log('\n✅ Icon generation complete!\n');
}

// Generate icons using Puppeteer (alternative method)
async function generateWithPuppeteer() {
  console.log('✓ Using Puppeteer for conversion');
  
  const puppeteer = require('puppeteer');
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  // Read SVG content
  const svgContent = fs.readFileSync(svgPath, 'utf-8');
  
  // Create HTML wrapper
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { margin: 0; padding: 0; }
          svg { display: block; }
        </style>
      </head>
      <body>${svgContent}</body>
    </html>
  `;
  
  for (const size of sizes) {
    try {
      await page.setContent(html);
      await page.setViewport({ width: size, height: size });
      
      const outputPath = path.join(iconsDir, `icon-${size}.png`);
      await page.screenshot({
        path: outputPath,
        width: size,
        height: size,
        omitBackground: false
      });
      
      const stats = fs.statSync(outputPath);
      const fileSizeKB = (stats.size / 1024).toFixed(2);
      console.log(`  ✓ Generated icon-${size}.png (${size}x${size}, ${fileSizeKB} KB)`);
    } catch (error) {
      console.error(`  ✗ Failed to generate icon-${size}.png: ${error.message}`);
    }
  }
  
  await browser.close();
  console.log('\n✅ Icon generation complete!\n');
}

// Try sharp first
if (sharp) {
  generateWithSharp().catch(console.error);
}
