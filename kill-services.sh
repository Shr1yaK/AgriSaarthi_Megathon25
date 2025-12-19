#!/bin/bash

echo "🛑 Stopping all AgriSaarthi services..."

# Kill processes on specific ports
echo "🌦️  Stopping Weather Service (port 8004)..."
lsof -ti:8004 | xargs kill -9 2>/dev/null || echo "No process on port 8004"

echo "🐍 Stopping Flask Backend (port 5000)..."
lsof -ti:5000 | xargs kill -9 2>/dev/null || echo "No process on port 5000"

echo "⚛️  Stopping Next.js (port 3000)..."
lsof -ti:3000 | xargs kill -9 2>/dev/null || echo "No process on port 3000"

# Kill any remaining node processes related to our app
echo "🧹 Cleaning up Node.js processes..."
pkill -f "start-all.js" 2>/dev/null || echo "No start-all.js processes found"
pkill -f "next dev" 2>/dev/null || echo "No next dev processes found"

echo "✅ All services stopped!"
