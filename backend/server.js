import express from "express";
import cors from "cors";
import { analyzeWithStockfish, testIntegration, analyzePGNUltraFast, evaluateGame } from "./python-runner.js";

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get("/", (req, res) => {
  res.json({
    message: "Node → Python → Stockfish integration ✅",
    status: "running",
    features: [
      "Multithreaded AI analysis",
      "Python process integration",
      "Thread-safe operations"
    ],
    endpoints: {
      "POST /analyze": "Analyze chess position",
      "POST /api/stockfish/analyze": "Frontend AI endpoint",
      "GET /test": "Test Python/Stockfish integration",
      "GET /health": "Health check"
    }
  });
});

// Health check endpoint for monitoring
app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    service: "Chess AI Backend",
    multithreaded: true,
    timestamp: new Date().toISOString()
  });
});

// Test endpoint to verify Python/Stockfish integration
app.get("/test", async (req, res) => {
  try {
    const success = await testIntegration();
    if (success) {
      res.json({ 
        message: "Python/Stockfish integration working correctly ✅",
        status: "success"
      });
    } else {
      res.status(500).json({ 
        message: "Python/Stockfish integration failed ❌",
        status: "error"
      });
    }
  } catch (error) {
    res.status(500).json({ 
      message: `Integration test error: ${error.message}`,
      status: "error"
    });
  }
});

// Main analysis endpoint (backend API)
app.post("/analyze", async (req, res) => {
  try {
    const { fen, depth } = req.body;
    
    // Validate input
    if (!fen) {
      return res.status(400).json({ 
        error: "FEN string is required",
        success: false
      });
    }
    
    if (depth && (depth < 1 || depth > 25)) {
      return res.status(400).json({ 
        error: "Depth must be between 1 and 25",
        success: false
      });
    }
    
    console.log(`📊 Analyzing position: ${fen}`);
    console.log(`🔍 Depth: ${depth || 15}`);
    
    const result = await analyzeWithStockfish(fen, depth);
    
    console.log(`✅ Analysis complete: ${result.best_move}`);
    res.json(result);
    
  } catch (error) {
    console.error("❌ Analysis error:", error.message);
    res.status(500).json({ 
      error: `Analysis failed: ${error.message}`,
      success: false
    });
  }
});

// Frontend AI endpoint (matches the frontend expectation)
app.get("/api/stockfish/analyze", async (req, res) => {
  try {
    const { fen, depth } = req.query;
    
    // Validate input
    if (!fen) {
      return res.status(400).json({ 
        error: "FEN string is required",
        success: false
      });
    }
    
    const analysisDepth = depth ? parseInt(depth) : 15;
    if (analysisDepth < 1 || analysisDepth > 25) {
      return res.status(400).json({ 
        error: "Depth must be between 1 and 25",
        success: false
      });
    }
    
    console.log(`🎯 Frontend AI request - FEN: ${fen}, Depth: ${analysisDepth}`);
    
    const result = await analyzeWithStockfish(fen, analysisDepth);
    
    // Return in the format expected by the frontend
    res.json({
      bestmove: result.best_move,
      evaluation: result.evaluation,
      depth: result.depth,
      multithreaded: result.multithreaded || false,
      success: result.success
    });
    
  } catch (error) {
    console.error("❌ Frontend AI error:", error.message);
    res.status(500).json({ 
      error: `AI analysis failed: ${error.message}`,
      success: false
    });
  }
});

// Direct PGN analysis endpoint - analyze entire PGN game using multi-worker analysis
app.post("/analyze-pgn", async (req, res) => {
  try {
    const { pgn, depth = 10, useMultiWorker = true } = req.body;
    
    // Validate input
    if (!pgn || typeof pgn !== 'string' || pgn.trim().length === 0) {
      return res.status(400).json({ 
        error: "PGN string is required and must not be empty",
        success: false
      });
    }
    
    if (depth < 1 || depth > 25) {
      return res.status(400).json({ 
        error: "Depth must be between 1 and 25",
        success: false
      });
    }
    
    console.log(`🎯 PGN analysis request - Depth: ${depth}, Multi-worker: ${useMultiWorker}`);
    console.log(`📊 PGN length: ${pgn.length} characters`);
    
    if (useMultiWorker) {
      // Use ULTRA-FAST multi-worker PGN analysis
      console.log(`🚀 Using ULTRA-FAST multi-worker PGN analysis`);
      const result = await analyzePGNUltraFast(pgn, depth, null);
      
      if (result.success) {
        console.log(`✅ Multi-worker PGN analysis complete - ${result.total_positions} positions in ${result.analysis_time}s`);
        console.log(`📈 Speed: ${result.positions_per_second} positions/second`);
        res.json(result);
      } else {
        throw new Error(result.error || "Multi-worker PGN analysis failed");
      }
    } else {
      // Fallback to sequential method (convert PGN to moves first)
      const moves = extractMovesFromPGN(pgn);
      if (moves.length === 0) {
        throw new Error("No valid moves found in PGN");
      }
      
      console.log(`📊 Extracted ${moves.length} moves from PGN`);
      const evaluations = await evaluateGame(moves, depth, 1);
      console.log(`✅ Sequential PGN analysis complete - ${Object.keys(evaluations).length} positions analyzed`);
      
      res.json({
        success: true,
        total_positions: Object.keys(evaluations).length,
        analysis_time: 0, // Sequential doesn't track time
        workers_used: 1,
        depth: depth,
        positions_per_second: 0,
        results: evaluations
      });
    }
    
  } catch (error) {
    console.error("❌ PGN analysis error:", error.message);
    res.status(500).json({ 
      error: `PGN analysis failed: ${error.message}`,
      success: false
    });
  }
});

// Game evaluation endpoint - analyze entire game using multi-worker PGN analysis
app.post("/evaluate-game", async (req, res) => {
  try {
    const { moves, depth = 10, threads = 1, useMultiWorker = true } = req.body;
    
    // Validate input
    if (!moves || !Array.isArray(moves) || moves.length === 0) {
      return res.status(400).json({ 
        error: "Moves array is required and must not be empty",
        success: false
      });
    }
    
    if (depth < 1 || depth > 25) {
      return res.status(400).json({ 
        error: "Depth must be between 1 and 25",
        success: false
      });
    }
    
    console.log(`🎯 Game evaluation request - Moves: ${moves.length}, Depth: ${depth}, Multi-worker: ${useMultiWorker}`);
    
    if (useMultiWorker) {
      // Use new multi-worker PGN analysis
      const { analyzePGNUltraFast } = await import('./python-runner.js');
      
      // Convert moves array to PGN format
      const pgnString = createPGNFromMoves(moves);
      
      console.log(`🚀 Using ULTRA-FAST multi-worker analysis`);
      const result = await analyzePGNUltraFast(pgnString, depth, null);
      
      if (result.success) {
        console.log(`✅ Multi-worker analysis complete - ${result.total_positions} positions in ${result.analysis_time}s`);
        console.log(`📈 Speed: ${result.positions_per_second} positions/second`);
        res.json(result.results);
      } else {
        throw new Error(result.error || "Multi-worker analysis failed");
      }
    } else {
      // Fallback to old sequential method
      const { evaluateGame } = await import('./python-runner.js');
      const evaluations = await evaluateGame(moves, depth, threads);
      console.log(`✅ Sequential analysis complete - ${Object.keys(evaluations).length} positions analyzed`);
      res.json(evaluations);
    }
    
  } catch (error) {
    console.error("❌ Game evaluation error:", error.message);
    res.status(500).json({ 
      error: `Game evaluation failed: ${error.message}`,
      success: false
    });
  }
});

// Helper function to create PGN from moves array
function createPGNFromMoves(moves) {
  const headers = [
    '[Event "Analysis Game"]',
    '[Site "Chess Analysis"]',
    '[Date "' + new Date().toISOString().split('T')[0] + '"]',
    '[Round "1"]',
    '[White "Analysis"]',
    '[Black "Analysis"]',
    '[Result "*"]',
    ''
  ].join('\n');
  
  // Format moves with move numbers
  let movesText = '';
  for (let i = 0; i < moves.length; i++) {
    if (i % 2 === 0) {
      movesText += `${Math.floor(i / 2) + 1}. `;
    }
    movesText += `${moves[i]} `;
  }
  
  return headers + movesText.trim();
}

// Helper function to extract moves from PGN string
function extractMovesFromPGN(pgnString) {
  try {
    const lines = pgnString.split('\n');
    let movesText = '';
    
    // Extract moves text (skip headers)
    for (const line of lines) {
      if (line.trim() && !line.startsWith('[')) {
        movesText += line + ' ';
      }
    }
    
    // Parse moves
    const moves = movesText.trim().split(/\s+/).filter(move => 
      move && !move.match(/^\d+\.$/) && move !== '1-0' && move !== '0-1' && move !== '1/2-1/2' && move !== '*'
    );
    
    return moves;
  } catch (error) {
    console.error('Error extracting moves from PGN:', error);
    return [];
  }
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ 
    error: "Internal server error",
    success: false
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Backend server running on port ${PORT}`);
  console.log(`📡 API endpoints:`);
  console.log(`   GET  http://localhost:${PORT}/`);
  console.log(`   GET  http://localhost:${PORT}/health`);
  console.log(`   GET  http://localhost:${PORT}/test`);
  console.log(`   POST http://localhost:${PORT}/analyze`);
  console.log(`   GET  http://localhost:${PORT}/api/stockfish/analyze`);
  console.log(`   POST http://localhost:${PORT}/analyze-pgn`);
  console.log(`   POST http://localhost:${PORT}/evaluate-game`);
  console.log(`\n🎯 Ready for multithreaded chess analysis!`);
  console.log(`🧠 AI Features: Python process integration, ULTRA-FAST PGN analysis`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down server...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down server...');
  process.exit(0);
});