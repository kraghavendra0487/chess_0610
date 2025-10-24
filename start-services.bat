@echo off
echo Starting Chess AI Services...
echo.

echo [1/1] Starting Node.js backend (Port 5000)...
start "Node.js Backend" cmd /k "cd backend && npm start"

echo.
echo ✅ Services started!
echo 📡 Node.js: http://localhost:5000
echo 🎯 Frontend: Start your React app separately
echo.
echo Press any key to continue...
pause >nul
