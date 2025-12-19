#!/bin/bash

echo "🔧 Fixing AgriSaarthi for WSL"
echo "============================="

# Install python3-venv
echo "📦 Installing python3-venv..."
sudo apt update
sudo apt install python3.12-venv -y

# Clean up and recreate virtual environment
echo "🧹 Cleaning up..."
rm -rf backend/venv

# Create virtual environment
echo "🐍 Creating Python virtual environment..."
cd backend
python3 -m venv venv
source venv/bin/activate

# Install dependencies
echo "📦 Installing Python dependencies..."
pip install -r requirements.txt
cd ..

echo "✅ Fixed! Now run: ./scripts/start-wsl.sh"
