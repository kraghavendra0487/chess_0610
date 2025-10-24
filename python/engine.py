import sys
import json
import threading
import time
import os
from stockfish import Stockfish

# Dynamic path to stockfish.exe based on script location
def get_stockfish_path():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.dirname(script_dir)
    stockfish_path = os.path.join(project_root, "stockfish", "stockfish.exe")
    
    # Check if stockfish.exe exists
    if os.path.exists(stockfish_path):
        return stockfish_path
    
    # Fallback to original hardcoded path
    fallback_path = "C:\\Users\\ragha\\Desktop\\Chess_0610\\stockfish\\stockfish.exe"
    if os.path.exists(fallback_path):
        return fallback_path
    
    # Try to find stockfish in common locations
    common_paths = [
        os.path.join(project_root, "stockfish", "stockfish"),
        os.path.join(project_root, "stockfish", "stockfish.exe"),
        "stockfish",
        "stockfish.exe"
    ]
    
    for path in common_paths:
        if os.path.exists(path):
            return path
    
    raise FileNotFoundError("Stockfish executable not found. Please ensure stockfish.exe is in the stockfish directory.")

STOCKFISH_PATH = get_stockfish_path()

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
            
            # Convert evaluation to cp/100 format with mate handling
            if evaluation['type'] == 'cp':
                evaluation_cp_100 = evaluation['value'] / 100.0
            elif evaluation['type'] == 'mate':
                # Convert mate to +1000 (white mate) or -1000 (black mate)
                mate_value = evaluation['value']
                if mate_value > 0:
                    evaluation_cp_100 = 1000  # White has mate
                else:
                    evaluation_cp_100 = -1000  # Black has mate
            else:
                evaluation_cp_100 = 0
            
            return {
                "fen": fen,
                "best_move": best_move,
                "evaluation": evaluation_cp_100,
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
