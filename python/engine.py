import sys
import json
import threading
import time
from stockfish import Stockfish

# Path to your stockfish.exe (update this path as needed)
STOCKFISH_PATH = "C:\\Users\\ragha\\Desktop\\Chess_0610\\stockfish\\stockfish.exe"

# Global lock for thread safety
stockfish_lock = threading.Lock()

def create_stockfish_instance():
    """Create a new Stockfish instance with safe parameters"""
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

def analyze_position(fen, depth=10):
    """Analyze a chess position using optimized Stockfish"""
    with stockfish_lock:
        stockfish = create_stockfish_instance()
        try:
            # Optimized analysis - no unnecessary resets
            stockfish.set_fen_position(fen)
            stockfish.set_depth(depth)
            
            # Get analysis results
            best_move = stockfish.get_best_move()
            evaluation = stockfish.get_evaluation()
            
            return {
                "fen": fen,
                "best_move": best_move,
                "evaluation": evaluation,
                "depth": depth,
                "optimized": True,
                "success": True
            }
        except Exception as e:
            raise Exception(f"Analysis failed: {str(e)}")

def main():
    try:
        # Read JSON input from Node.js (via stdin)
        raw_input = sys.stdin.read()
        data = json.loads(raw_input)
        
        fen = data["fen"]
        depth = data.get("depth", 10)
        
        # Analyze the position
        result = analyze_position(fen, depth)
        
        # Output JSON result to Node.js
        print(json.dumps(result))
        sys.stdout.flush()
        
    except Exception as e:
        error_result = {
            "error": str(e),
            "success": False
        }
        print(json.dumps(error_result))
        sys.stdout.flush()
        sys.exit(1)

if __name__ == "__main__":
    main()
