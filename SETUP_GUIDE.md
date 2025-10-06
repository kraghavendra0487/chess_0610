# Chess AI System - Complete Setup Guide

## 🎯 Overview

This Chess AI system provides comprehensive chess analysis using Stockfish engine with a modern web interface. It includes:

- **Frontend**: React-based chess board with analysis features
- **Backend**: Node.js API server with Python integration
- **AI Engine**: Stockfish with multi-worker analysis capabilities
- **Analysis Features**: Position evaluation, PGN analysis, move suggestions

## 🚀 Quick Start

### Option 1: Automated Setup (Recommended)
```bash
# Run the automated setup script
start-chess-ai.bat
```

### Option 2: Manual Setup

#### 1. Install Dependencies
```bash
# Backend dependencies
cd backend
npm install

# Frontend dependencies  
cd ../frontend
npm install

# Python dependencies
cd ../python
pip install -r requirements.txt
```

#### 2. Verify Stockfish Installation
Ensure `stockfish.exe` exists in the `stockfish/` folder.

#### 3. Test Python Environment
```bash
cd python
python setup_environment.py
```

#### 4. Start Services
```bash
# Terminal 1: Backend
cd backend
npm start

# Terminal 2: Frontend
cd frontend
npm run dev
```

#### 5. Run Tests
```bash
node test-comprehensive.js
```

## 🔧 System Requirements

- **Node.js**: 16+ (for backend and frontend)
- **Python**: 3.8+ (for Stockfish integration)
- **Stockfish**: Executable in `stockfish/` folder
- **Memory**: 4GB+ RAM recommended
- **CPU**: Multi-core recommended for analysis

## 📁 Project Structure

```
Chess_0610/
├── frontend/                 # React frontend
│   ├── src/components/      # React components
│   │   ├── AnalysisBoard.jsx # Main analysis interface
│   │   ├── Engine.js        # Stockfish integration
│   │   └── ...
│   └── package.json
├── backend/                 # Node.js backend
│   ├── server.js           # Main server
│   ├── python-runner.js    # Python integration
│   └── package.json
├── python/                  # Python AI engine
│   ├── engine.py           # Basic Stockfish wrapper
│   ├── engine_safe.py      # Enhanced error handling
│   ├── main.py             # FastAPI server
│   ├── ultra_fast_pgn_analyzer.py # Multi-worker PGN analysis
│   ├── setup_environment.py # Environment setup
│   └── requirements.txt
├── stockfish/              # Stockfish engine
│   └── stockfish.exe
└── test-comprehensive.js   # Integration tests
```

## 🎮 Features

### Analysis Board
- **Interactive Chess Board**: Drag-and-drop piece movement
- **PGN Loading**: Load and analyze complete games
- **Move Navigation**: Step through game moves
- **Position Analysis**: Real-time Stockfish evaluation
- **Best Move Suggestions**: Engine-recommended moves

### AI Analysis
- **Position Evaluation**: Centipawn and mate evaluations
- **Multi-worker Analysis**: Parallel position processing
- **PGN Game Analysis**: Complete game evaluation
- **Depth Control**: Configurable analysis depth
- **Thread Management**: Optimized CPU usage

### API Endpoints
- `GET /health` - System health check
- `POST /analyze` - Position analysis
- `GET /api/stockfish/analyze` - Frontend API
- `POST /evaluate-game` - Game evaluation

## 🐛 Troubleshooting

### Common Issues

#### 1. Python Import Errors
```bash
# Solution: Reinstall Python dependencies
cd python
pip install --upgrade pip
pip install -r requirements.txt
```

#### 2. Stockfish Not Found
```bash
# Check if Stockfish exists
ls stockfish/stockfish.exe

# If missing, download from: https://stockfishchess.org/download/
```

#### 3. Backend Connection Failed
```bash
# Check if backend is running
curl http://localhost:5000/health

# Restart backend
cd backend
npm start
```

#### 4. Frontend Build Errors
```bash
# Clear cache and reinstall
cd frontend
rm -rf node_modules package-lock.json
npm install
npm run dev
```

#### 5. Analysis Timeout
- Reduce analysis depth in settings
- Check CPU usage during analysis
- Ensure sufficient RAM available

### Error Codes

| Error | Description | Solution |
|-------|-------------|----------|
| `PYTHON_NOT_FOUND` | Python not in PATH | Install Python 3.8+ |
| `STOCKFISH_NOT_FOUND` | Stockfish executable missing | Download Stockfish |
| `DEPENDENCY_ERROR` | Missing Python packages | Run `pip install -r requirements.txt` |
| `CONNECTION_REFUSED` | Backend not running | Start backend server |
| `ANALYSIS_TIMEOUT` | Analysis taking too long | Reduce depth or check system resources |

## 🔍 Testing

### Run All Tests
```bash
node test-comprehensive.js
```

### Individual Tests
```bash
# Python environment test
cd python
python setup_environment.py

# Backend health check
curl http://localhost:5000/health

# Frontend API test
curl "http://localhost:5000/api/stockfish/analyze?fen=rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR%20w%20KQkq%20-%200%201&depth=5"
```

## ⚡ Performance Optimization

### For Better Analysis Speed
1. **Increase Threads**: Modify `Threads` parameter in Python files
2. **Adjust Hash Size**: Increase `Hash` parameter for more memory
3. **Use Multi-worker**: Enable `useMultiWorker` in game evaluation
4. **Optimize Depth**: Use appropriate depth for your needs

### For Better Responsiveness
1. **Reduce Analysis Depth**: Use depth 5-10 for real-time analysis
2. **Enable Caching**: Implement position caching
3. **Background Analysis**: Run analysis in background threads
4. **Progressive Analysis**: Start with low depth, increase gradually

## 🛠️ Development

### Adding New Features
1. **Frontend**: Add components in `frontend/src/components/`
2. **Backend**: Add endpoints in `backend/server.js`
3. **Python**: Add analysis functions in `python/`

### Debugging
1. **Enable Logging**: Check console output in all services
2. **Use Diagnostic**: Run `python/setup_environment.py`
3. **Check Network**: Use browser dev tools for API calls
4. **Monitor Resources**: Check CPU/memory usage during analysis

## 📚 API Documentation

### Analysis Request
```javascript
POST /analyze
{
  "fen": "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
  "depth": 15
}
```

### Analysis Response
```javascript
{
  "fen": "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
  "best_move": "e2e4",
  "evaluation": {
    "type": "cp",
    "value": 20
  },
  "depth": 15,
  "success": true
}
```

## 🎉 Success Indicators

Your Chess AI system is working correctly when:
- ✅ All services start without errors
- ✅ Backend responds to health checks
- ✅ Frontend loads the chess board
- ✅ Analysis returns valid moves and evaluations
- ✅ PGN games can be loaded and analyzed
- ✅ All tests pass in comprehensive test suite

## 📞 Support

If you encounter issues:
1. Check the troubleshooting section above
2. Run the diagnostic scripts
3. Check system requirements
4. Verify all dependencies are installed
5. Check console logs for specific error messages

---

**Happy Chess Analysis! 🏆**
