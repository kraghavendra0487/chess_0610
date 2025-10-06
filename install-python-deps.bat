@echo off
echo Installing Python dependencies for Chess AI...
cd /d "C:\Users\ragha\Desktop\Chess_0610\python"
call venv\Scripts\activate.bat
pip install -r requirements.txt
echo.
echo Python dependencies installed successfully!
echo You can now test the setup by running: python engine.py
pause
