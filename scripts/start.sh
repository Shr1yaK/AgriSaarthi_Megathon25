#!/bin/bash

echo "🌾 Starting AgriSaarthi - Multilingual Farm Chatbot"
echo "================================================="

# Check if environment files exist
if [ ! -f .env.local ]; then
    echo "❌ .env.local file not found. Please run setup.sh first."
    exit 1
fi

if [ ! -f backend/.env ]; then
    echo "❌ backend/.env file not found. Please run setup.sh first."
    exit 1
fi

# Start backend in background
echo "🚀 Starting backend server..."
cd backend
python app.py &
BACKEND_PID=$!
cd ..

# Wait a moment for backend to start
sleep 3

# Start frontend
echo "🚀 Starting frontend server..."
npm run dev &
FRONTEND_PID=$!

echo "✅ Both servers are starting..."
echo ""
echo "🌐 Frontend: http://localhost:3000"
echo "🔧 Backend: http://localhost:5000"
echo ""
echo "Press Ctrl+C to stop both servers"

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Stopping servers..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    exit 0
}

# Set trap to cleanup on script exit
trap cleanup SIGINT SIGTERM

# Wait for processes
wait
