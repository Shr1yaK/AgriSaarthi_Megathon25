@echo off
echo Starting AgriSaarthi Chat Platform...

echo.
echo Installing dependencies...
call npm install

echo.
echo Starting Chat Service (Backend)...
start "Chat Service" cmd /k "cd backend && python -m pip install -r requirements.txt && python chat_service.py"

echo.
echo Waiting for backend to start...
timeout /t 5 /nobreak > nul

echo.
echo Starting Frontend...
start "Frontend" cmd /k "npm run dev"

echo.
echo AgriSaarthi Chat Platform is starting...
echo.
echo Frontend: http://localhost:3000
echo Backend API: http://localhost:8005
echo.
echo Press any key to stop all services...
pause > nul

echo.
echo Stopping services...
taskkill /f /im node.exe > nul 2>&1
taskkill /f /im python.exe > nul 2>&1
echo Services stopped.
