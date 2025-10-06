# Chess Backend - Node.js → Python → Stockfish

This backend provides a Node.js API that controls Python/Stockfish chess analysis directly, without running a separate Python server.

## 🏗️ Architecture

```
Frontend (React + Vite)
      ↓
Backend (Node.js + Express)
      ↓
Python Script (engine.py)
      ↓
Stockfish.exe
```

## 🚀 Quick Start

### 1. Install Node.js Dependencies

```bash
cd backend
npm install
```

### 2. Update Stockfish Path

Edit `python/engine.py` and update the `STOCKFISH_PATH` to match your system:

```python
STOCKFISH_PATH = "C:\\Users\\ragha\\Desktop\\Chess_0610\\stockfish\\stockfish.exe"
```

### 3. Start the Backend

```bash
npm start
```

The server will start on `http://localhost:5000`

### 4. Test the Integration

Visit `http://localhost:5000/test` to verify everything is working.

## 📡 API Endpoints

### `GET /`
Health check and API information.

### `GET /test`
Test the Python/Stockfish integration with a sample position.

### `POST /analyze`
Analyze a chess position.

**Request Body:**
```json
{
  "fen": "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
  "depth": 15
}
```

**Response:**
```json
{
  "fen": "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
  "best_move": "e2e4",
  "evaluation": {"type": "cp", "value": 28},
  "depth": 15,
  "deterministic": true,
  "success": true
}
```

## 🔧 Configuration

The Python engine uses deterministic settings:
- **Threads**: 1 (no randomness from threading)
- **Hash**: 0 (no cached evaluations)
- **Skill Level**: 20 (full strength)
- **Contempt**: 0 (neutral evaluation)
- **Move Overhead**: 0 (no delay)
- **Minimum Thinking Time**: 30ms (constant time)

## 🧪 Testing with curl

```bash
# Test integration
curl http://localhost:5000/test

# Analyze a position
curl -X POST http://localhost:5000/analyze \
  -H "Content-Type: application/json" \
  -d '{"fen": "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1", "depth": 15}'
```

## 🎯 Advantages

- **No separate Python server** - Node controls everything
- **Deterministic results** - Same FEN always gives same output
- **Scalable** - Node can queue or parallelize analysis
- **Clean architecture** - One backend process handles everything
- **Flexible** - Easy to add caching or persistence later

## 🐛 Troubleshooting

1. **Python not found**: Make sure Python is in your PATH
2. **Stockfish path error**: Update `STOCKFISH_PATH` in `python/engine.py`
3. **Permission denied**: Ensure Stockfish.exe is executable
4. **Module not found**: Install required Python packages (`pip install stockfish`)

## 📁 File Structure

```
backend/
├── package.json          # Node.js dependencies
├── server.js            # Express server
└── python-runner.js     # Python process controller

python/
├── engine.py            # Lightweight Stockfish script
└── main.py              # Original FastAPI version (kept for reference)
```
