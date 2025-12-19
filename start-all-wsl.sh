#!/bin/bash

echo "Starting AgriSaarthi Chat Platform on WSL..."

# Make scripts executable
chmod +x backend/setup-venv.sh

# Setup backend virtual environment
echo "Setting up backend environment..."
cd backend
./setup-venv.sh

# Activate virtual environment and start backend
echo "Starting backend service..."
chmod +x start-chat-service.sh
./start-chat-service.sh &
BACKEND_PID=$!

# Go back to root directory
cd ..

# Start frontend
echo "Starting frontend..."
npm run dev &
FRONTEND_PID=$!

echo ""
echo "🚀 AgriSaarthi Chat Platform is running!"
echo "Frontend: http://localhost:3000"
echo "Backend API: http://localhost:8005"
echo ""
echo "Press Ctrl+C to stop all services"

# Wait for interrupt
trap "echo 'Stopping services...'; kill $BACKEND_PID $FRONTEND_PID; exit" INT
wait
