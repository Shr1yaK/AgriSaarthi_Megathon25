#!/bin/bash

echo "🚀 Starting AgriSaarthi - Full Stack Application..."
echo

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check if Python is available
if ! command_exists python3; then
    echo -e "${RED}❌ Python3 not found! Please install Python first.${NC}"
    exit 1
fi

# Check if Node.js is available
if ! command_exists node; then
    echo -e "${RED}❌ Node.js not found! Please install Node.js first.${NC}"
    exit 1
fi

# Check if npm is available
if ! command_exists npm; then
    echo -e "${RED}❌ npm not found! Please install Node.js first.${NC}"
    exit 1
fi

echo -e "${BLUE}🌦️  Starting Weather Service...${NC}"
export WEATHER_API_KEY=3df4d44e440343649bf173624251110
cd backend
python3 -m uvicorn weather_service:app --host 0.0.0.0 --port 8004 --reload &
WEATHER_PID=$!
cd ..

echo -e "${BLUE}🐍 Starting Flask Backend...${NC}"
cd backend
python3 app.py &
FLASK_PID=$!
cd ..

# Wait a bit for services to start
sleep 3

echo -e "${GREEN}🎉 All services started successfully!${NC}"
echo -e "${BLUE}📱 Frontend: http://localhost:3000${NC}"
echo -e "${BLUE}🌦️  Weather API: http://localhost:8004${NC}"
echo -e "${BLUE}🐍 Flask API: http://localhost:5000${NC}"
echo
echo -e "${YELLOW}💡 Press Ctrl+C to stop all services${NC}"

# Function to cleanup on exit
cleanup() {
    echo -e "\n${YELLOW}🛑 Shutting down all services...${NC}"
    kill $WEATHER_PID 2>/dev/null
    kill $FLASK_PID 2>/dev/null
    exit 0
}

# Set trap to cleanup on exit
trap cleanup SIGINT SIGTERM

# Start Next.js (this will block)
npm run dev:frontend
