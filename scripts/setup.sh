#!/bin/bash

echo "🌾 Setting up AgriSaarthi - Multilingual Farm Chatbot"
echo "=================================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3 first."
    exit 1
fi

echo "✅ Node.js and Python 3 are installed"

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
npm install

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
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
echo "3. Run 'npm run dev' to start the frontend"
echo "4. Run 'npm run backend' to start the backend"
echo ""
echo "🌾 AgriSaarthi is ready to help farmers!"
