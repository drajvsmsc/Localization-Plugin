#!/bin/bash

###############################################################################
# LocalizationChecker Extension Setup Script
# 
# This script downloads required libraries and sets up the extension
# for development or production use.
###############################################################################

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
LIBS_DIR="$SCRIPT_DIR/libs"

echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  LocalizationChecker Setup Script     ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
echo ""

# Check if curl is installed
if ! command -v curl &> /dev/null; then
    echo -e "${RED}Error: curl is not installed${NC}"
    echo "Please install curl and try again:"
    echo "  macOS: brew install curl"
    echo "  Ubuntu/Debian: sudo apt-get install curl"
    echo "  Windows: Use Git Bash or install curl"
    exit 1
fi

# Create libs directory if it doesn't exist
if [ ! -d "$LIBS_DIR" ]; then
    echo -e "${YELLOW}Creating libs directory...${NC}"
    mkdir -p "$LIBS_DIR"
fi

cd "$LIBS_DIR"

echo ""
echo -e "${BLUE}Downloading required libraries...${NC}"
echo ""

###############################################################################
# Download franc.js (Language Detection)
###############################################################################
echo -e "${YELLOW}[1/2] Downloading franc.js (Language Detection)...${NC}"

if [ -f "franc.min.js" ]; then
    echo -e "${YELLOW}  franc.min.js already exists. Overwriting...${NC}"
fi

curl -L -o franc.min.js "https://cdn.jsdelivr.net/npm/franc-min@6/dist/index.js"

if [ $? -eq 0 ] && [ -s "franc.min.js" ]; then
    FILE_SIZE=$(du -h franc.min.js | cut -f1)
    echo -e "${GREEN}  ✓ franc.min.js downloaded successfully (${FILE_SIZE})${NC}"
else
    echo -e "${RED}  ✗ Failed to download franc.min.js${NC}"
    exit 1
fi

###############################################################################
# Download compromise.js (POS Tagging)
###############################################################################
echo ""
echo -e "${YELLOW}[2/2] Downloading compromise.js (POS Tagging)...${NC}"

if [ -f "compromise.min.js" ]; then
    echo -e "${YELLOW}  compromise.min.js already exists. Overwriting...${NC}"
fi

curl -L -o compromise.min.js "https://cdn.jsdelivr.net/npm/compromise@14/builds/compromise.min.js"

if [ $? -eq 0 ] && [ -s "compromise.min.js" ]; then
    FILE_SIZE=$(du -h compromise.min.js | cut -f1)
    echo -e "${GREEN}  ✓ compromise.min.js downloaded successfully (${FILE_SIZE})${NC}"
else
    echo -e "${RED}  ✗ Failed to download compromise.min.js${NC}"
    exit 1
fi

###############################################################################
# Optional: Download additional libraries
###############################################################################
echo ""
read -p "Download optional libraries (SheetJS, jsPDF)? [y/N]: " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo -e "${YELLOW}[Optional 1/2] Downloading SheetJS (Excel Export)...${NC}"
    curl -L -o xlsx.full.min.js "https://cdn.sheetjs.com/xlsx-0.18.5/package/dist/xlsx.full.min.js"
    
    if [ $? -eq 0 ] && [ -s "xlsx.full.min.js" ]; then
        FILE_SIZE=$(du -h xlsx.full.min.js | cut -f1)
        echo -e "${GREEN}  ✓ xlsx.full.min.js downloaded successfully (${FILE_SIZE})${NC}"
    else
        echo -e "${YELLOW}  ⚠ Failed to download xlsx.full.min.js (optional)${NC}"
    fi
    
    echo ""
    echo -e "${YELLOW}[Optional 2/2] Downloading jsPDF (PDF Export)...${NC}"
    curl -L -o jspdf.min.js "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"
    
    if [ $? -eq 0 ] && [ -s "jspdf.min.js" ]; then
        FILE_SIZE=$(du -h jspdf.min.js | cut -f1)
        echo -e "${GREEN}  ✓ jspdf.min.js downloaded successfully (${FILE_SIZE})${NC}"
    else
        echo -e "${YELLOW}  ⚠ Failed to download jspdf.min.js (optional)${NC}"
    fi
fi

###############################################################################
# Verification
###############################################################################
echo ""
echo -e "${BLUE}Verifying installation...${NC}"
echo ""

ALL_GOOD=true

# Check franc.js
if [ -f "franc.min.js" ] && [ -s "franc.min.js" ]; then
    echo -e "${GREEN}✓ franc.min.js${NC} - OK"
else
    echo -e "${RED}✗ franc.min.js${NC} - MISSING OR EMPTY"
    ALL_GOOD=false
fi

# Check compromise.js
if [ -f "compromise.min.js" ] && [ -s "compromise.min.js" ]; then
    echo -e "${GREEN}✓ compromise.min.js${NC} - OK"
else
    echo -e "${RED}✗ compromise.min.js${NC} - MISSING OR EMPTY"
    ALL_GOOD=false
fi

# Check optional libraries
if [ -f "xlsx.full.min.js" ] && [ -s "xlsx.full.min.js" ]; then
    echo -e "${GREEN}✓ xlsx.full.min.js${NC} - OK (optional)"
fi

if [ -f "jspdf.min.js" ] && [ -s "jspdf.min.js" ]; then
    echo -e "${GREEN}✓ jspdf.min.js${NC} - OK (optional)"
fi

###############################################################################
# Final Status
###############################################################################
echo ""
if [ "$ALL_GOOD" = true ]; then
    echo -e "${GREEN}╔════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║  ✓ Setup completed successfully!      ║${NC}"
    echo -e "${GREEN}╚════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${BLUE}Next steps:${NC}"
    echo "  1. Load extension in Chrome:"
    echo "     chrome://extensions/ → Enable Developer Mode → Load unpacked"
    echo ""
    echo "  2. Select the extension directory:"
    echo "     $SCRIPT_DIR"
    echo ""
    echo "  3. Start testing!"
    echo "     Navigate to a website and click the extension icon"
    echo ""
    echo -e "${BLUE}Documentation:${NC}"
    echo "  • README.md - Overview and features"
    echo "  • INSTALLATION.md - Detailed installation guide"
    echo "  • USER_GUIDE.md - How to use the extension"
    echo ""
else
    echo -e "${RED}╔════════════════════════════════════════╗${NC}"
    echo -e "${RED}║  ✗ Setup incomplete                    ║${NC}"
    echo -e "${RED}╚════════════════════════════════════════╝${NC}"
    echo ""
    echo "Some required libraries failed to download."
    echo "Please check your internet connection and try again."
    echo ""
    echo "Alternatively, download manually:"
    echo "  • franc.js: https://cdn.jsdelivr.net/npm/franc-min@6/dist/index.js"
    echo "  • compromise.js: https://cdn.jsdelivr.net/npm/compromise@14/builds/compromise.min.js"
    echo ""
    exit 1
fi

exit 0

