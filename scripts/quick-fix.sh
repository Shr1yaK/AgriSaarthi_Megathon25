#!/bin/bash

echo "🚀 QUICK FIX - AgriSaarthi Setup"
echo "================================="

# Install missing system packages
echo "📦 Installing system dependencies..."
sudo apt update
sudo apt install -y python3.12-venv python3-distutils python3-dev build-essential

# Clean everything
echo "🧹 Cleaning up..."
rm -rf backend/venv
rm -rf .next
rm -rf node_modules
rm -rf temp
rm -rf backend/temp

# Create directories
mkdir -p temp
mkdir -p backend/temp

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
npm install --legacy-peer-deps

# Create Python virtual environment
echo "🐍 Setting up Python environment..."
cd backend
python3 -m venv venv
source venv/bin/activate

# Upgrade pip and install dependencies
pip install --upgrade pip
pip install wheel setuptools
pip install -r requirements.txt
cd ..

# Copy environment files
echo "🔧 Setting up environment..."
cp env.local.example .env.local
cp backend/env.example backend/.env

echo "✅ DONE! Now run:"
echo "cd backend && source venv/bin/activate && python app.py"
echo ""
echo "In another terminal:"
echo "npm run dev"
