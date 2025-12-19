@echo off
echo 🌾 Setting up AgriSaarthi - Multilingual Farm Chatbot
echo ==================================================

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js is not installed. Please install Node.js first.
    pause
    exit /b 1
)

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python is not installed. Please install Python first.
    pause
    exit /b 1
)

echo ✅ Node.js and Python are installed

REM Install frontend dependencies
echo 📦 Installing frontend dependencies...
npm install

REM Install backend dependencies
echo 📦 Installing backend dependencies...
cd backend
pip install -r requirements.txt
cd ..

REM Create environment files
echo 🔧 Setting up environment files...
if not exist .env.local (
    copy env.local.example .env.local
    echo 📝 Created .env.local file. Please update with your API keys.
)

if not exist backend\.env (
    copy backend\env.example backend\.env
    echo 📝 Created backend\.env file. Please update with your API keys.
)

REM Create necessary directories
echo 📁 Creating necessary directories...
if not exist temp mkdir temp
if not exist backend\temp mkdir backend\temp

echo ✅ Setup complete!
echo.
echo 🚀 Next steps:
echo 1. Update .env.local with your Bhashini API key
echo 2. Update backend\.env with your Bhashini API key
echo 3. Run 'npm run dev' to start the frontend
echo 4. Run 'npm run backend' to start the backend
echo.
echo 🌾 AgriSaarthi is ready to help farmers!
pause
