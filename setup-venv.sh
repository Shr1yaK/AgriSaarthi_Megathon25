#!/bin/bash

echo "🐍 Setting up Python Virtual Environment for AgriSaarthi..."
echo

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Create virtual environment
echo -e "${BLUE}📦 Creating virtual environment...${NC}"
cd backend
python3 -m venv venv

# Activate virtual environment
echo -e "${BLUE}🔧 Activating virtual environment...${NC}"
source venv/bin/activate

# Install dependencies
echo -e "${BLUE}📦 Installing Python dependencies...${NC}"
pip install -r requirements.txt

# Deactivate
deactivate

cd ..

echo -e "${GREEN}✅ Virtual environment setup complete!${NC}"
echo
echo -e "${YELLOW}💡 Now you can run: npm run dev${NC}"
