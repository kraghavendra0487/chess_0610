@echo off
echo Starting Multithreaded Chess AI Services...
echo.

echo [1/3] Starting FastAPI service (Port 8000)...
start "FastAPI Service" cmd /k "cd python && python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload"

echo [2/3] Waiting for FastAPI to initialize...
timeout /t 3 /nobreak >nul

echo [3/3] Starting Node.js backend (Port 5000)...
start "Node.js Backend" cmd /k "cd backend && npm start"

echo.
echo ✅ Services started!
echo 📡 FastAPI: http://localhost:8000
echo 📡 Node.js: http://localhost:5000
echo 🎯 Frontend: Start your React app separately
echo.
echo Press any key to continue...
pause >nul
