/**
 * Simple backend test script
 * Tests if the Node.js backend is working correctly
 */

import express from "express";
import cors from "cors";

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Test endpoint
app.get("/api/stockfish/analyze", (req, res) => {
  console.log("✅ Backend endpoint reached!");
  console.log("Query params:", req.query);
  
  const { fen, depth } = req.query;
  
  if (!fen) {
    return res.status(400).json({ 
      error: "FEN string is required",
      success: false
    });
  }
  
  // Return a mock response for testing
  res.json({
    bestmove: "e2e4",
    evaluation: { type: "cp", value: 20 },
    depth: depth || 15,
    multithreaded: true,
    success: true,
    test: true
  });
});

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "healthy", service: "Test Backend" });
});

// Root endpoint
app.get("/", (req, res) => {
  res.json({ 
    message: "Test Backend Running ✅",
    endpoints: {
      "GET /api/stockfish/analyze": "Test AI endpoint",
      "GET /health": "Health check"
    }
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Test backend running on port ${PORT}`);
  console.log(`📡 Test the endpoint:`);
  console.log(`   http://localhost:${PORT}/api/stockfish/analyze?fen=rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR%20w%20KQkq%20-%200%201&depth=10`);
});
