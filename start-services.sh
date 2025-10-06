#!/bin/bash

echo "Starting Multithreaded Chess AI Services..."
echo

echo "[1/3] Starting FastAPI service (Port 8000)..."
cd python && python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload &
FASTAPI_PID=$!

echo "[2/3] Waiting for FastAPI to initialize..."
sleep 3

echo "[3/3] Starting Node.js backend (Port 5000)..."
cd ../backend && npm start &
NODE_PID=$!

echo
echo "✅ Services started!"
echo "📡 FastAPI: http://localhost:8000 (PID: $FASTAPI_PID)"
echo "📡 Node.js: http://localhost:5000 (PID: $NODE_PID)"
echo "🎯 Frontend: Start your React app separately"
echo
echo "Press Ctrl+C to stop all services..."

# Function to cleanup on exit
cleanup() {
    echo
    echo "🛑 Stopping services..."
    kill $FASTAPI_PID 2>/dev/null
    kill $NODE_PID 2>/dev/null
    echo "✅ Services stopped"
    exit 0
}

# Set trap to cleanup on script exit
trap cleanup SIGINT SIGTERM

# Wait for processes
wait
