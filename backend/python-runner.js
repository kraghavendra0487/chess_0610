import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


/**
 * Analyzes a chess position using Stockfish via Python
 * @param {string} fen - The FEN string of the position
 * @param {number} depth - Analysis depth (default: 10)
 * @returns {Promise<Object>} Analysis result with best move and evaluation
 */
async function analyzeWithPython(fen, depth = 10) {
  return new Promise((resolve, reject) => {
    // Path to Python executable (adjust if needed)
    const pythonPath = "python"; // or "python3" on some systems
    const scriptPath = path.join(__dirname, "..", "python", "engine_safe.py");
    
    console.log(`Spawning Python process: ${pythonPath} ${scriptPath}`);
    console.log(`Analyzing FEN: ${fen} at depth ${depth}`);
    
    const py = spawn(pythonPath, [scriptPath], {
      stdio: ['pipe', 'pipe', 'pipe']
    });
    
    let output = "";
    let error = "";
    
    py.stdout.on("data", (data) => {
      output += data.toString();
    });
    
    py.stderr.on("data", (data) => {
      error += data.toString();
    });
    
    py.on("close", (code) => {
      if (code !== 0) {
        console.error(`Python process exited with code ${code}`);
        console.error(`Error output: ${error}`);
        console.error(`Standard output: ${output}`);
        return reject(new Error(`Python failed (code ${code}): ${error || "Unknown error"}`));
      }
      
      try {
        const parsed = JSON.parse(output);
        if (parsed.success === false) {
          return reject(new Error(parsed.error || "Analysis failed"));
        }
        resolve(parsed);
      } catch (err) {
        console.error(`Failed to parse Python output: ${output}`);
        reject(new Error(`Invalid JSON from Python: ${err.message}`));
      }
    });
    
    py.on("error", (err) => {
      console.error(`Failed to start Python process: ${err.message}`);
      reject(new Error(`Failed to start Python: ${err.message}`));
    });
    
    // Send data to Python via stdin
    const inputData = JSON.stringify({ fen, depth });
    py.stdin.write(inputData);
    py.stdin.end();
  });
}

/**
 * Analyzes a PGN game using ULTRA-FAST multi-worker Python analysis
 * @param {string} pgn - The PGN string of the game
 * @param {number} depth - Analysis depth (default: 10)
 * @param {number} maxWorkers - Maximum number of workers (default: auto-detect)
 * @returns {Promise<Object>} Analysis result with evaluations for all positions
 */
async function analyzePGNUltraFastInternal(pgn, depth = 10, maxWorkers = null) {
  return new Promise((resolve, reject) => {
    // Path to Python executable (adjust if needed)
    const pythonPath = "python"; // or "python3" on some systems
    const scriptPath = path.join(__dirname, "..", "python", "ultra_fast_pgn_analyzer.py");
    
    console.log(`🚀 Spawning ULTRA-FAST Python PGN analyzer: ${pythonPath} ${scriptPath}`);
    console.log(`⚡ Analyzing PGN game with depth ${depth}, workers: ${maxWorkers || 'auto'}`);
    console.log(`📋 Python process started - watching for detailed worker logs...`);
    
    const py = spawn(pythonPath, [scriptPath], {
      stdio: ['pipe', 'pipe', 'pipe']
    });
    
    let output = "";
    let error = "";
    
    py.stdout.on("data", (data) => {
      output += data.toString();
    });
    
    py.stderr.on("data", (data) => {
      const stderrData = data.toString();
      error += stderrData;
      // Show stderr output in real-time for debugging
      if (stderrData.trim()) {
        console.log(`[PYTHON] ${stderrData.trim()}`);
      }
    });
    
    py.on("close", (code) => {
      if (code !== 0) {
        console.error(`❌ Python ULTRA-FAST analyzer exited with code ${code}`);
        console.error(`Error output: ${error}`);
        console.error(`Standard output: ${output}`);
        return reject(new Error(`Python ULTRA-FAST analysis failed: ${error || "Unknown error"}`));
      }
      
      try {
        const parsed = JSON.parse(output);
        if (parsed.success === false) {
          return reject(new Error(parsed.error || "ULTRA-FAST PGN analysis failed"));
        }
        console.log(`✅ Python ULTRA-FAST analysis completed successfully!`);
        resolve(parsed);
      } catch (err) {
        console.error(`Failed to parse Python ULTRA-FAST output: ${output}`);
        reject(new Error(`Invalid JSON from Python ULTRA-FAST analyzer: ${err.message}`));
      }
    });
    
    py.on("error", (err) => {
      console.error(`Failed to start Python ULTRA-FAST analyzer: ${err.message}`);
      reject(new Error(`Failed to start Python ULTRA-FAST analyzer: ${err.message}`));
    });
    
    // Send data to Python via stdin
    const inputData = JSON.stringify({ pgn, depth, max_workers: maxWorkers });
    py.stdin.write(inputData);
    py.stdin.end();
  });
}

/**
 * Main analysis function using Python
 * @param {string} fen - The FEN string of the position
 * @param {number} depth - Analysis depth (default: 10)
 * @returns {Promise<Object>} Analysis result with best move and evaluation
 */
export async function analyzeWithStockfish(fen, depth = 10) {
  console.log(`[Python] Using Python process for analysis`);
  return await analyzeWithPython(fen, depth);
}

/**
 * Analyze PGN game using ULTRA-FAST multi-worker Python analysis
 * @param {string} pgn - The PGN string of the game
 * @param {number} depth - Analysis depth (default: 10)
 * @param {number} maxWorkers - Maximum number of workers (default: auto-detect)
 * @returns {Promise<Object>} Analysis result with evaluations for all positions
 */
export async function analyzePGNUltraFast(pgn, depth = 10, maxWorkers = null) {
  console.log(`🚀 [Python] Using ULTRA-FAST multi-worker PGN analysis`);
  return await analyzePGNUltraFastInternal(pgn, depth, maxWorkers);
}

/**
 * Evaluate entire game by analyzing each position (legacy function - use analyzePGNGame for better performance)
 * @param {Array} moves - Array of moves in the game
 * @param {number} depth - Analysis depth (default: 10)
 * @param {number} threads - Number of threads (default: 1)
 * @returns {Promise<Object>} Object with evaluations for each position
 */
export async function evaluateGame(moves, depth = 10, threads = 1) {
  try {
    // Create a new Chess instance to track positions
    const { Chess } = await import('chess.js');
    const game = new Chess();
    
    const evaluations = {};
    
    // Evaluate starting position
    console.log('Evaluating starting position...');
    const startEval = await analyzeWithStockfish(game.fen(), depth);
    evaluations['start'] = {
      evaluation: startEval.evaluation.value,
      mate: startEval.evaluation.type === 'mate' ? startEval.evaluation.value : null,
      depth: startEval.depth,
      bestLine: startEval.best_move || ''
    };
    
    // Evaluate each position after each move
    for (let i = 0; i < moves.length; i++) {
      try {
        const move = game.move(moves[i]);
        if (!move) {
          console.warn(`Invalid move at index ${i}: ${moves[i]}`);
          continue;
        }
        
        console.log(`Evaluating position after move ${i + 1}: ${moves[i]}`);
        const analysis = await analyzeWithStockfish(game.fen(), depth);
        
        evaluations[i.toString()] = {
          evaluation: analysis.evaluation.value,
          mate: analysis.evaluation.type === 'mate' ? analysis.evaluation.value : null,
          depth: analysis.depth,
          bestLine: analysis.best_move || ''
        };
        
      } catch (error) {
        console.error(`Error evaluating position ${i}:`, error.message);
        evaluations[i.toString()] = {
          evaluation: 0,
          mate: null,
          depth: 0,
          bestLine: '',
          error: error.message
        };
      }
    }
    
    console.log(`✅ Game evaluation complete: ${Object.keys(evaluations).length} positions analyzed`);
    return evaluations;
    
  } catch (error) {
    console.error('❌ Game evaluation failed:', error.message);
    throw new Error(`Game evaluation failed: ${error.message}`);
  }
}

/**
 * Test function to verify Python/Stockfish integration
 */
export async function testIntegration() {
  const testFen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
  try {
    const result = await analyzeWithStockfish(testFen, 10);
    console.log("✅ Integration test successful:", result);
    return true;
  } catch (error) {
    console.error("❌ Integration test failed:", error.message);
    return false;
  }
}

/**
 * Analyze PGN game using multi-worker Python analysis (alias for analyzePGNUltraFast)
 * @param {string} pgn - The PGN string of the game
 * @param {number} depth - Analysis depth (default: 10)
 * @param {number} maxWorkers - Maximum number of workers (default: auto-detect)
 * @returns {Promise<Object>} Analysis result with evaluations for all positions
 */
export async function analyzePGNGame(pgn, depth = 10, maxWorkers = null) {
  console.log(`🚀 [Python] Using multi-worker PGN analysis (alias)`);
  return await analyzePGNUltraFast(pgn, depth, maxWorkers);
}

/**
 * Test function to verify PGN analysis integration
 */
export async function testPGNIntegration() {
  const testPGN = `[Event "Test Game"]
[Site "Test"]
[Date "2024.01.01"]
[Round "1"]
[White "Test White"]
[Black "Test Black"]
[Result "1-0"]

1. e4 e5 2. Nf3 Nc6 3. Bb5 a6 4. Ba4 Nf6 5. O-O Be7 6. Re1 b5 7. Bb3 d6 8. c3 O-O 9. h3 Nb8 10. d4 Nbd7 11. c4 c6 12. cxb5 axb5 13. Nc3 Bb7 14. Bg5 b4 15. Nb1 h6 16. Bh4 c5 17. dxe5 Nxe4 18. Bxe7 Qxe7 19. exd6 Qf6 20. Nbd2 Nxd6 21. Nc4 Nxc4 22. Bxc4 Nb6 23. Ne5 Rae8 24. Bxf7+ Rxf7 25. Nxf7 Rxe1+ 26. Qxe1 Kxf7 27. Qe3 Qg5 28. Qxg5 hxg5 29. b3 Ke6 30. a3 Kd6 31. axb4 cxb4 32. Ra5 Nd5 33. f3 Bc8 34. Kf2 Bf5 35. Ra7 g6 36. Ra6+ Kc5 37. Ke1 Nf4 38. g3 Nxh3 39. Kd2 Kb5 40. Rd6 Kc5 41. Ra6 Nf2 42. g4 Bd3 43. Re6 1-0`;
  
  try {
    const result = await analyzePGNGame(testPGN, 10, 4);
    console.log("✅ PGN Integration test successful:", {
      total_positions: result.total_positions,
      analysis_time: result.analysis_time,
      workers_used: result.workers_used
    });
    return true;
  } catch (error) {
    console.error("❌ PGN Integration test failed:", error.message);
    return false;
  }
}
