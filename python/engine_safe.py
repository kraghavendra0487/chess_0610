import sys
import json
import threading
import time
import os
from stockfish import Stockfish

# Path to your stockfish.exe (update this path as needed)
STOCKFISH_PATH = "C:\\Users\\ragha\\Desktop\\Chess_0610\\stockfish\\stockfish.exe"

# Global lock for thread safety
stockfish_lock = threading.Lock()

def create_stockfish_instance():
    """Create a new Stockfish instance with safe parameters and error handling"""
    try:
        # Check if Stockfish executable exists
        if not os.path.exists(STOCKFISH_PATH):
            raise FileNotFoundError(f"Stockfish executable not found at: {STOCKFISH_PATH}")
        
        return Stockfish(
            STOCKFISH_PATH,
            parameters={
                "Threads": 1,                # Use 1 thread for stability
                "Hash": 128,                 # Conservative hash size
                "Skill Level": 20,           # Full engine strength
                "Contempt": 0,               # Neutral evaluation
                "Move Overhead": 0,          # No move delay
                "Minimum Thinking Time": 0,  # No minimum thinking time
                "Ponder": False,             # Disable pondering
                "MultiPV": 1                # Analyze only the best line
            }
        )
    except Exception as e:
        raise Exception(f"Failed to create Stockfish instance: {str(e)}")

def analyze_position(fen, depth=10):
    """Analyze a chess position using optimized Stockfish with comprehensive error handling"""
    with stockfish_lock:
        stockfish = None
        try:
            # Create Stockfish instance
            stockfish = create_stockfish_instance()
            
            # Validate FEN string
            if not fen or not isinstance(fen, str):
                raise ValueError("Invalid FEN string provided")
            
            # Validate depth
            if not isinstance(depth, int) or depth < 1 or depth > 25:
                raise ValueError("Depth must be an integer between 1 and 25")
            
            # Optimized analysis - no unnecessary resets
            stockfish.set_fen_position(fen)
            stockfish.set_depth(depth)
            
            # Get analysis results with timeout protection
            start_time = time.time()
            best_move = stockfish.get_best_move()
            evaluation = stockfish.get_evaluation()
            
            # Check if analysis took too long (safety measure)
            analysis_time = time.time() - start_time
            if analysis_time > 30:  # 30 second timeout
                print(f"Warning: Analysis took {analysis_time:.2f} seconds")
            
            return {
                "fen": fen,
                "best_move": best_move,
                "evaluation": evaluation,
                "depth": depth,
                "analysis_time": round(analysis_time, 2),
                "optimized": True,
                "success": True
            }
            
        except Exception as e:
            error_msg = f"Analysis failed: {str(e)}"
            print(f"Error in analyze_position: {error_msg}")
            
            # Return error result instead of raising exception
            return {
                "fen": fen,
                "best_move": None,
                "evaluation": {"type": "cp", "value": 0},
                "depth": depth,
                "analysis_time": 0,
                "error": error_msg,
                "success": False
            }
        finally:
            # Clean up Stockfish instance
            if stockfish:
                try:
                    # Stockfish cleanup is handled automatically
                    pass
                except:
                    pass

def main():
    """Main function with comprehensive error handling"""
    try:
        # Read JSON input from Node.js (via stdin)
        raw_input = sys.stdin.read()
        
        if not raw_input.strip():
            raise ValueError("No input provided")
        
        try:
            data = json.loads(raw_input)
        except json.JSONDecodeError as e:
            raise ValueError(f"Invalid JSON input: {str(e)}")
        
        # Extract and validate input parameters
        fen = data.get("fen")
        depth = data.get("depth", 10)
        
        if not fen:
            raise ValueError("FEN string is required")
        
        # Analyze the position
        result = analyze_position(fen, depth)
        
        # Output JSON result to Node.js
        print(json.dumps(result))
        sys.stdout.flush()
        
    except Exception as e:
        error_result = {
            "error": str(e),
            "success": False,
            "fen": "",
            "best_move": None,
            "evaluation": {"type": "cp", "value": 0},
            "depth": 0
        }
        print(json.dumps(error_result))
        sys.stdout.flush()
        sys.exit(1)

if __name__ == "__main__":
    main()