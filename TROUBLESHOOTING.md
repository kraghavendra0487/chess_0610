# Troubleshooting Guide

## 🚀 Quick Setup (Windows Users)

### **Automated Setup Scripts:**

1. **Install Python Dependencies:**
   ```batch
   install-python-deps.bat
   ```

2. **Test Complete Setup:**
   ```batch
   test-chess-setup.bat
   ```

3. **Start All Services:**
   ```batch
   start-chess-services.bat
   ```

## 🚨 Common Issues and Solutions

### Issue 1: "Unexpected token '<', "<!doctype "... is not valid JSON"

**Problem**: The frontend is receiving HTML instead of JSON, indicating the backend service isn't running or accessible.

**Solutions**:

1. **Check if Node.js backend is running**:
   ```bash
   # Check if port 5000 is in use
   netstat -an | grep 5000
   # or
   lsof -i :5000
   ```

2. **Start the backend manually**:
   ```bash
   cd backend
   npm start
   ```

3. **Test the backend directly**:
   ```bash
   # Test the endpoint directly
   curl "http://localhost:5000/api/stockfish/analyze?fen=rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR%20w%20KQkq%20-%200%201&depth=10"
   ```

4. **Use the test backend**:
   ```bash
   cd backend
   node test-backend.js
   ```

### Issue 2: "ModuleNotFoundError: No module named 'stockfish'"

**Problem**: Python can't find the stockfish module, causing the AI analysis to fail.

**Solutions**:

1. **Install Python dependencies (automated):**
   ```batch
   install-python-deps.bat
   ```

2. **Manual installation:**
   ```bash
   cd python
   venv\Scripts\activate.bat
   pip install -r requirements.txt
   ```

3. **Verify installation:**
   ```bash
   python -c "import stockfish; print('Stockfish module available')"
   ```

### Issue 3: FastAPI Service Not Starting

**Problem**: FastAPI service fails to start or isn't accessible.

**Solutions**:

1. **Install Python dependencies**:
   ```bash
   cd python
   pip install -r requirements.txt
   ```

2. **Check Python version** (requires 3.8+):
   ```bash
   python --version
   ```

3. **Start FastAPI manually**:
   ```bash
   cd python
   python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
   ```

4. **Test FastAPI directly**:
   ```bash
   curl http://localhost:8000/health
   ```

### Issue 3: Stockfish Not Found

**Problem**: "Stockfish executable not found" error.

**Solutions**:

1. **Verify Stockfish path** in:
   - `python/engine.py` (line 8)
   - `python/main.py` (line 11)

2. **Update the path** to match your system:
   ```python
   STOCKFISH_PATH = "C:\\Users\\ragha\\Desktop\\Chess_0610\\stockfish\\stockfish.exe"
   ```

3. **Test Stockfish directly**:
   ```bash
   cd stockfish
   ./stockfish.exe
   # Type "quit" to exit
   ```

### Issue 4: Frontend Not Connecting to Backend

**Problem**: Frontend can't reach the backend API.

**Solutions**:

1. **Check Vite proxy configuration** in `frontend/vite.config.js`:
   ```javascript
   server: {
     proxy: {
       '/api': {
         target: 'http://localhost:5000',
         changeOrigin: true,
         secure: false,
       }
     }
   }
   ```

2. **Restart the frontend** after changing config:
   ```bash
   cd frontend
   npm run dev
   ```

3. **Check browser console** for detailed error messages.

### Issue 5: CORS Errors

**Problem**: Cross-origin request blocked.

**Solutions**:

1. **Verify CORS is enabled** in backend:
   ```javascript
   app.use(cors());
   ```

2. **Check FastAPI CORS** in `python/main.py`:
   ```python
   app.add_middleware(
       CORSMiddleware,
       allow_origins=["*"],
       allow_credentials=True,
       allow_methods=["*"],
       allow_headers=["*"],
   )
   ```

## 🔧 Step-by-Step Debugging

### 1. Test Backend Services

```bash
# Test Node.js backend
curl http://localhost:5000/health

# Test FastAPI service
curl http://localhost:8000/health

# Test AI endpoint
curl "http://localhost:5000/api/stockfish/analyze?fen=rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR%20w%20KQkq%20-%200%201&depth=10"
```

### 2. Check Service Logs

**Node.js Backend**:
```bash
cd backend
npm start
# Look for: "🚀 Backend server running on port 5000"
```

**FastAPI Service**:
```bash
cd python
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
# Look for: "Uvicorn running on http://0.0.0.0:8000"
```

### 3. Frontend Debugging

1. **Open browser developer tools** (F12)
2. **Check Network tab** for failed requests
3. **Look at Console tab** for error messages
4. **Verify the request URL** matches `/api/stockfish/analyze`

### 4. Port Conflicts

If you get "port already in use" errors:

```bash
# Find processes using ports
netstat -ano | findstr :5000
netstat -ano | findstr :8000

# Kill processes (Windows)
taskkill /PID <process_id> /F

# Kill processes (Linux/Mac)
kill -9 <process_id>
```

## 🚀 Quick Start Checklist

1. ✅ **Install dependencies**:
   ```bash
   cd python && pip install -r requirements.txt
   cd ../backend && npm install
   cd ../frontend && npm install
   ```

2. ✅ **Start services**:
   ```bash
   # Use the startup script
   start-services.bat  # Windows
   ./start-services.sh # Linux/Mac
   
   # Or manually:
   # Terminal 1: cd python && python -m uvicorn main:app --port 8000
   # Terminal 2: cd backend && npm start
   # Terminal 3: cd frontend && npm run dev
   ```

3. ✅ **Test endpoints**:
   ```bash
   curl http://localhost:5000/health
   curl http://localhost:8000/health
   ```

4. ✅ **Open frontend** and enable AI

## 📞 Still Having Issues?

1. **Check all services are running** on the correct ports
2. **Verify file paths** match your system
3. **Check firewall settings** aren't blocking ports
4. **Try the test backend** first to isolate the issue
5. **Look at browser console** for detailed error messages

## 🎯 Expected Behavior

When everything is working correctly:
- Node.js backend shows: "🚀 Backend server running on port 5000"
- FastAPI shows: "Uvicorn running on http://0.0.0.0:8000"
- Frontend loads without console errors
- AI moves are calculated and applied automatically
- Console shows: "[fetchBestMove] ✅ Multithreaded analysis complete"
