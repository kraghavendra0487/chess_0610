#!/bin/bash

echo "Starting Chess AI Services..."
echo

echo "[1/1] Starting Node.js backend (Port 5000)..."
cd ../backend && npm start &
NODE_PID=$!

echo
echo "✅ Services started!"
echo "📡 Node.js: http://localhost:5000 (PID: $NODE_PID)"
echo "🎯 Frontend: Start your React app separately"
echo
echo "Press Ctrl+C to stop all services..."

# Function to cleanup on exit
cleanup() {
    echo
    echo "🛑 Stopping services..."
    kill $NODE_PID 2>/dev/null
    echo "✅ Services stopped"
    exit 0
}

# Set trap to cleanup on script exit
trap cleanup SIGINT SIGTERM

# Wait for processes
wait
