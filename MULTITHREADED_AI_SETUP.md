# Multithreaded Chess AI Setup

This setup provides a high-performance, multithreaded chess AI system using Stockfish with FastAPI and Node.js integration.

## 🚀 Features

• **Multithreaded AI Analysis**: Uses 4 threads for faster move calculation
• **Thread-Safe Operations**: Proper locking mechanisms prevent race conditions
• **FastAPI Backend**: High-performance Python service with automatic API documentation
• **Fallback System**: Automatically falls back to Python process if FastAPI fails
• **CORS Enabled**: Ready for frontend integration
• **Health Monitoring**: Built-in health check endpoints

## 🏗️ Architecture

```
Frontend (React) 
    ↓ HTTP Request
Node.js Backend (Port 5000)
    ↓ FastAPI Request (Primary)
FastAPI Service (Port 8000) → Stockfish (Multithreaded)
    ↓ Fallback if needed
Python Process → Stockfish (Single-threaded)
```

## 📦 Installation

### 1. Python Dependencies
```bash
cd python
pip install -r requirements.txt
```

### 2. Node.js Dependencies
```bash
cd backend
npm install
```

### 3. Frontend Dependencies
```bash
cd frontend
npm install
```

## 🚀 Running the System

### Option 1: Automatic Startup (Recommended)
```bash
# Windows
start-services.bat

# Linux/Mac
chmod +x start-services.sh
./start-services.sh
```

### Option 2: Manual Startup

**Terminal 1 - FastAPI Service:**
```bash
cd python
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

**Terminal 2 - Node.js Backend:**
```bash
cd backend
npm start
```

**Terminal 3 - Frontend:**
```bash
cd frontend
npm run dev
```

## 🔧 Configuration

### Environment Variables
- `FASTAPI_URL`: FastAPI service URL (default: http://localhost:8000)
- `USE_FASTAPI`: Enable/disable FastAPI (default: true)

### Stockfish Configuration
The system uses optimized settings for multithreaded performance:
- **Threads**: 4 (configurable)
- **Hash**: 256 MB (configurable)
- **Skill Level**: 20 (maximum strength)
- **Thinking Time**: 100ms minimum

## 📡 API Endpoints

### FastAPI Service (Port 8000)
- `GET /` - Service information
- `GET /health` - Health check
- `POST /analyze` - Analyze chess position

### Node.js Backend (Port 5000)
- `GET /` - Service information
- `GET /health` - Health check
- `GET /test` - Integration test
- `POST /analyze` - Backend analysis endpoint
- `GET /api/stockfish/analyze` - Frontend AI endpoint

## 🧪 Testing

### Test FastAPI Service
```bash
curl -X POST "http://localhost:8000/analyze" \
  -H "Content-Type: application/json" \
  -d '{"fen": "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1", "depth": 10}'
```

### Test Node.js Backend
```bash
curl "http://localhost:5000/api/stockfish/analyze?fen=rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR%20w%20KQkq%20-%200%201&depth=10"
```

### Test Integration
```bash
curl "http://localhost:5000/test"
```

## 🔍 Performance Benefits

### Multithreaded vs Single-threaded
- **4x faster analysis** on multi-core systems
- **Better responsiveness** during complex positions
- **Improved user experience** with faster AI moves

### Fallback System
- **Automatic recovery** if FastAPI service fails
- **No interruption** to gameplay
- **Seamless operation** for users

## 🛠️ Troubleshooting

### Common Issues

**1. FastAPI Service Won't Start**
```bash
# Check Python version (3.8+ required)
python --version

# Install dependencies
cd python && pip install -r requirements.txt

# Check port availability
netstat -an | grep 8000
```

**2. Node.js Backend Connection Issues**
```bash
# Check if FastAPI is running
curl http://localhost:8000/health

# Check Node.js logs
cd backend && npm start
```

**3. Stockfish Not Found**
```bash
# Verify Stockfish path in:
# - python/engine.py (line 8)
# - python/main.py (line 11)
```

### Performance Tuning

**Increase Threads (if you have more CPU cores):**
```python
# In python/main.py and python/engine.py
"Threads": 8,  # Change from 4 to 8
```

**Increase Hash Memory (if you have more RAM):**
```python
# In python/main.py and python/engine.py
"Hash": 512,  # Change from 256 to 512 (MB)
```

## 📊 Monitoring

### Health Checks
- FastAPI: `http://localhost:8000/health`
- Node.js: `http://localhost:5000/health`

### Logs
- FastAPI logs show analysis requests and responses
- Node.js logs show API calls and fallback usage
- Frontend console shows AI move timing

## 🔒 Security Notes

- CORS is configured for development (allows all origins)
- For production, restrict CORS origins
- Consider adding authentication if needed
- Validate all input parameters

## 🎯 Next Steps

1. **Start the services** using the startup scripts
2. **Open your frontend** and enable AI
3. **Play against the AI** and enjoy faster responses!
4. **Monitor the logs** to see multithreaded performance in action

The system is now ready for high-performance chess AI gameplay! 🏆
