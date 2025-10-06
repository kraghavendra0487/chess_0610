@echo off
echo Testing Chess AI Setup...
echo.

REM Test 1: Python Dependencies
echo [1/4] Testing Python Dependencies...
cd /d "C:\Users\ragha\Desktop\Chess_0610\python"
call venv\Scripts\activate.bat
python -c "import stockfish; print('✓ Stockfish module available')" 2>nul
if errorlevel 1 (
    echo ✗ Stockfish module missing - run install-python-deps.bat
    goto :end
)

REM Test 2: Stockfish Executable
echo [2/4] Testing Stockfish Executable...
if exist "C:\Users\ragha\Desktop\Chess_0610\stockfish\stockfish.exe" (
    echo ✓ Stockfish executable found
) else (
    echo ✗ Stockfish executable missing
    goto :end
)

REM Test 3: Python Engine
echo [3/4] Testing Python Engine...
echo {"fen":"rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1","depth":5} | python engine.py
if errorlevel 1 (
    echo ✗ Python engine test failed
    goto :end
) else (
    echo ✓ Python engine working
)

REM Test 4: Backend Server (if running)
echo [4/4] Testing Backend Server...
curl -s http://localhost:5000/health >nul 2>&1
if errorlevel 1 (
    echo ! Backend server not running - start it with: cd backend && npm start
) else (
    echo ✓ Backend server responding
)

:end
echo.
echo Test complete!
pause
