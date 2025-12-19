#!/bin/bash

echo "📦 Installing AgriSaarthi Dependencies..."
echo

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}🐍 Installing Python dependencies...${NC}"
cd backend
pip3 install -r requirements.txt
cd ..

echo -e "${BLUE}📦 Installing Node.js dependencies...${NC}"
npm install

echo -e "${GREEN}✅ All dependencies installed successfully!${NC}"
echo
echo -e "${YELLOW}💡 Now you can run: npm run dev${NC}"
