#!/bin/bash

# Demos Vibe Starter Kit - Installation Script (Linux/Mac)
# This script automates the installation process

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo ""
echo "=========================================="
echo "  🚀 Demos Vibe Starter Kit Installer"
echo "=========================================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed!${NC}"
    echo ""
    echo "Please install Node.js v16 or higher from:"
    echo "https://nodejs.org/"
    echo ""
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 16 ]; then
    echo -e "${RED}❌ Node.js version is too old!${NC}"
    echo "Current version: $(node -v)"
    echo "Required: v16 or higher"
    echo ""
    echo "Please update Node.js from: https://nodejs.org/"
    exit 1
fi

echo -e "${GREEN}✅ Node.js $(node -v) detected${NC}"
echo ""

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm is not installed!${NC}"
    exit 1
fi

echo -e "${GREEN}✅ npm $(npm -v) detected${NC}"
echo ""

# Install dependencies
echo -e "${BLUE}📦 Installing dependencies...${NC}"
npm install

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Dependencies installed successfully!${NC}"
else
    echo -e "${RED}❌ Failed to install dependencies${NC}"
    exit 1
fi

echo ""
echo "=========================================="
echo "  🎉 Installation Complete!"
echo "=========================================="
echo ""
echo "Next steps:"
echo "  1. Run 'npm run setup' to configure your environment"
echo "  2. Run 'npm start' to launch the interactive menu"
echo "  3. Or run 'npm run hello' for your first Demos connection"
echo ""
echo "Need help? Check out the docs/ folder or README.md"
echo ""
echo "Happy vibe coding! 🚀"
echo ""
