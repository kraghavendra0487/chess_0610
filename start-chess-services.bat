@echo off
echo Starting Chess AI Services...
echo.

REM Check if Python dependencies are installed
echo Checking Python dependencies...
cd /d "C:\Users\ragha\Desktop\Chess_0610\python"
call venv\Scripts\activate.bat
python -c "import stockfish; print('Stockfish module found')" 2>nul
if errorlevel 1 (
    echo Installing Python dependencies...
    pip install -r requirements.txt
    echo.
)

REM Start the backend server
echo Starting Backend Server (Port 5000)...
start "Chess Backend" cmd /k "cd /d C:\Users\ragha\Desktop\Chess_0610\backend && npm start"

REM Wait a moment for backend to start
timeout /t 3 /nobreak >nul

REM Start the frontend development server
echo Starting Frontend Server (Port 5173)...
start "Chess Frontend" cmd /k "cd /d C:\Users\ragha\Desktop\Chess_0610\frontend && npm run dev"

echo.
echo Services starting...
echo Backend: http://localhost:5000
echo Frontend: http://localhost:5173
echo.
echo Press any key to exit this launcher...
pause >nul
