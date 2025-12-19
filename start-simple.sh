#!/bin/bash

echo "🚀 Starting AgriSaarthi - Simple Mode"
echo

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Start Weather Service in background
echo -e "${BLUE}🌦️  Starting Weather Service...${NC}"
cd backend
export WEATHER_API_KEY=3df4d44e440343649bf173624251110
source venv/bin/activate
python -m uvicorn weather_service:app --host 0.0.0.0 --port 8004 --reload &
WEATHER_PID=$!

# Start Bhashini Backend in background
echo -e "${BLUE}🎤 Starting Bhashini Backend...${NC}"
export PORT=8000
python app.py &
BHASHINI_PID=$!
cd ..

# Unset PORT for Next.js to use default port 3000
unset PORT

# Wait a moment for services to start
sleep 3

echo -e "${GREEN}✅ Weather Service started on port 8004${NC}"
echo -e "${GREEN}✅ Bhashini Backend started on port 8000${NC}"
echo -e "${BLUE}📱 Starting Next.js Frontend...${NC}"
echo
echo -e "${YELLOW}💡 Weather API: http://localhost:8004${NC}"
echo -e "${YELLOW}💡 Bhashini API: http://localhost:8000${NC}"
echo -e "${YELLOW}💡 Frontend: http://localhost:3000${NC}"
echo -e "${YELLOW}💡 Press Ctrl+C to stop all services${NC}"
echo

# Function to cleanup on exit
cleanup() {
    echo -e "\n${YELLOW}🛑 Stopping services...${NC}"
    kill $WEATHER_PID 2>/dev/null
    kill $BHASHINI_PID 2>/dev/null
    exit 0
}

# Set trap to cleanup on exit
trap cleanup SIGINT SIGTERM

# Start Next.js (this will block)
npm run dev:frontend
