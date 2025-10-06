@echo off
echo 🚀 Chess AI System Startup Script
echo =====================================
echo.

echo 🔍 Checking system requirements...

:: Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)
echo ✅ Node.js is installed

:: Check if Python is installed
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Python is not installed or not in PATH
    echo Please install Python 3.8+ from https://python.org/
    pause
    exit /b 1
)
echo ✅ Python is installed

:: Check if Stockfish exists
if not exist "stockfish\stockfish.exe" (
    echo ❌ Stockfish executable not found
    echo Please ensure stockfish.exe is in the stockfish\ folder
    pause
    exit /b 1
)
echo ✅ Stockfish executable found

echo.
echo 📦 Installing dependencies...

:: Install backend dependencies
echo Installing backend dependencies...
cd backend
call npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install backend dependencies
    pause
    exit /b 1
)
cd ..

:: Install frontend dependencies
echo Installing frontend dependencies...
cd frontend
call npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install frontend dependencies
    pause
    exit /b 1
)
cd ..

:: Install Python dependencies
echo Installing Python dependencies...
cd python
call pip install -r requirements.txt
if %errorlevel% neq 0 (
    echo ❌ Failed to install Python dependencies
    echo Try running: pip install --upgrade pip
    pause
    exit /b 1
)
cd ..

echo.
echo 🧪 Running system tests...

:: Test Python environment
echo Testing Python environment...
cd python
python setup_environment.py
if %errorlevel% neq 0 (
    echo ❌ Python environment test failed
    echo Please check Python dependencies and Stockfish path
    pause
    exit /b 1
)
cd ..

echo.
echo 🚀 Starting services...

:: Start backend server
echo Starting backend server...
start "Chess AI Backend" cmd /k "cd backend && npm start"

:: Wait a moment for backend to start
timeout /t 3 /nobreak >nul

:: Start frontend server
echo Starting frontend server...
start "Chess AI Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo ✅ Chess AI System is starting up!
echo.
echo 📡 Services:
echo   - Backend: http://localhost:5000
echo   - Frontend: http://localhost:5173
echo.
echo 🎯 Features available:
echo   - Chess game analysis
echo   - PGN game loading
echo   - Stockfish integration
echo   - Multi-worker analysis
echo.
echo Press any key to run comprehensive tests...
pause >nul

:: Run comprehensive tests
echo.
echo 🧪 Running comprehensive tests...
node test-comprehensive.js

echo.
echo 🎉 Setup complete! Check the opened windows for any errors.
echo If everything looks good, you can start using the Chess AI system!
pause
