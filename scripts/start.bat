@echo off
echo 🌾 Starting AgriSaarthi - Multilingual Farm Chatbot
echo =================================================

REM Check if environment files exist
if not exist .env.local (
    echo ❌ .env.local file not found. Please run setup.bat first.
    pause
    exit /b 1
)

if not exist backend\.env (
    echo ❌ backend\.env file not found. Please run setup.bat first.
    pause
    exit /b 1
)

REM Start backend in background
echo 🚀 Starting backend server...
start /B cmd /c "cd backend && python app.py"

REM Wait a moment for backend to start
timeout /t 3 /nobreak >nul

REM Start frontend
echo 🚀 Starting frontend server...
start /B cmd /c "npm run dev"

echo ✅ Both servers are starting...
echo.
echo 🌐 Frontend: http://localhost:3000
echo 🔧 Backend: http://localhost:5000
echo.
echo Press any key to stop both servers
pause >nul
