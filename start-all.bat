@echo off
echo 🚀 Starting AgriSaarthi - Full Stack Application...
echo.

REM Check if Python is available
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Python not found! Please install Python first.
    pause
    exit /b 1
)

REM Check if Node.js is available
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js not found! Please install Node.js first.
    pause
    exit /b 1
)

echo 🌦️  Starting Weather Service...
start "Weather Service" cmd /k "cd backend && set WEATHER_API_KEY=3df4d44e440343649bf173624251110 && python -m uvicorn weather_service:app --host 0.0.0.0 --port 8004 --reload"

echo 🐍 Starting Flask Backend...
start "Flask Backend" cmd /k "cd backend && python app.py"

echo ⚛️  Starting Next.js Frontend...
echo.
echo 🎉 All services are starting!
echo 📱 Frontend will be available at: http://localhost:3000
echo 🌦️  Weather API will be available at: http://localhost:8004
echo 🐍 Flask API will be available at: http://localhost:5000
echo.
echo 💡 Close the terminal windows to stop the services
echo.

REM Start Next.js (this will block)
npm run dev:frontend
