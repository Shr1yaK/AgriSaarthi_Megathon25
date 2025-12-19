#!/bin/bash

echo "🌾 Setting up AgriSaarthi - Multilingual Farm Chatbot (WSL)"
echo "=========================================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Installing Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Installing Python 3..."
    sudo apt update
    sudo apt install -y python3 python3-pip python3-venv
fi

echo "✅ Node.js and Python 3 are installed"

# Install frontend dependencies with legacy peer deps
echo "📦 Installing frontend dependencies..."
npm install --legacy-peer-deps

# Create Python virtual environment for backend
echo "📦 Setting up Python virtual environment..."
cd backend
python3 -m venv venv
source venv/bin/activate

# Install backend dependencies
echo "📦 Installing backend dependencies..."
pip install -r requirements.txt
cd ..

# Create environment files
echo "🔧 Setting up environment files..."
if [ ! -f .env.local ]; then
    cp env.local.example .env.local
    echo "📝 Created .env.local file. Please update with your API keys."
fi

if [ ! -f backend/.env ]; then
    cp backend/env.example backend/.env
    echo "📝 Created backend/.env file. Please update with your API keys."
fi

# Create necessary directories
echo "📁 Creating necessary directories..."
mkdir -p temp
mkdir -p backend/temp

echo "✅ Setup complete!"
echo ""
echo "🚀 Next steps:"
echo "1. Update .env.local with your Bhashini API key"
echo "2. Update backend/.env with your Bhashini API key"
echo "3. Run './scripts/start-wsl.sh' to start both servers"
echo ""
echo "🌾 AgriSaarthi is ready to help farmers!"
