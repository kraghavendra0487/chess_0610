import sys
import json
import threading
import time
import queue
import multiprocessing
from concurrent.futures import ThreadPoolExecutor, as_completed
from stockfish import Stockfish
import chess
import chess.pgn
from io import StringIO

# Path to your stockfish.exe (update this path as needed)
STOCKFISH_PATH = "C:\\Users\\ragha\\Desktop\\Chess_0610\\stockfish\\stockfish.exe"

def get_optimal_worker_count():
    """Determine optimal number of workers based on system resources"""
    cpu_count = multiprocessing.cpu_count()
    # Use fewer workers but with more threads each for better performance
    # With 2 threads per worker, use fewer workers to avoid over-subscription
    return min(4, max(1, cpu_count // 2))

def create_stockfish_instance():
    """Create a new Stockfish instance optimized for maximum speed"""
    return Stockfish(
        STOCKFISH_PATH,
        parameters={
            "Threads": 2,                # Use 2 threads per worker for better performance
            "Hash": 256,                 # Increased hash for depth 10 analysis
            "Skill Level": 20,           # Full engine strength
            "Contempt": 0,               # Neutral evaluation
            "Move Overhead": 0,          # No move delay
            "Minimum Thinking Time": 0,  # No minimum thinking time for speed
            "Ponder": False,             # Disable pondering
            "MultiPV": 1,               # Analyze only the best line
            "UCI_LimitStrength": False, # Don't limit strength
            "UCI_Elo": 3200,            # High ELO for maximum strength
            "nodestime": 0              # No time limit per node
        }
    )

def analyze_position_worker(fen_data):
    """Worker function to analyze a single FEN position with optimized performance"""
    fen, move_number, depth = fen_data
    
    try:
        stockfish = create_stockfish_instance()
        
        # Optimized analysis - no unnecessary resets
        stockfish.set_fen_position(fen)
        stockfish.set_depth(depth)
        
        # Get analysis results
        best_move = stockfish.get_best_move()
        evaluation = stockfish.get_evaluation()
        
        return {
            "move_number": move_number,
            "fen": fen,
            "best_move": best_move,
            "evaluation": evaluation,
            "depth": depth,
            "success": True
        }
    except Exception as e:
        return {
            "move_number": move_number,
            "fen": fen,
            "error": str(e),
            "success": False
        }

def parse_pgn_to_fens(pgn_string):
    """Parse PGN string and extract FEN positions for each move"""
    try:
        pgn_io = StringIO(pgn_string)
        game = chess.pgn.read_game(pgn_io)
        
        if not game:
            raise ValueError("Invalid PGN format")
        
        # Create chess board to track positions
        board = game.board()
        fens = []
        
        # Add starting position
        fens.append({
            "fen": board.fen(),
            "move_number": 0,
            "move": "start"
        })
        
        # Process each move
        move_number = 1
        for move in game.mainline_moves():
            board.push(move)
            fens.append({
                "fen": board.fen(),
                "move_number": move_number,
                "move": str(move)
            })
            move_number += 1
        
        return fens
        
    except Exception as e:
        raise ValueError(f"Failed to parse PGN: {str(e)}")

def analyze_pgn_multithreaded(pgn_string, depth=10, max_workers=None):
    """Analyze entire PGN game using multiple workers"""
    try:
        # Parse PGN to get FEN positions
        print(f"Parsing PGN game...")
        fens = parse_pgn_to_fens(pgn_string)
        print(f"Found {len(fens)} positions to analyze")
        
        # Determine optimal worker count
        if max_workers is None:
            max_workers = get_optimal_worker_count()
        
        print(f"Using {max_workers} workers for analysis")
        
        # Prepare data for workers
        analysis_data = [
            (fen_info["fen"], fen_info["move_number"], depth)
            for fen_info in fens
        ]
        
        # Use ThreadPoolExecutor for parallel analysis
        results = {}
        start_time = time.time()
        
        with ThreadPoolExecutor(max_workers=max_workers) as executor:
            # Submit all analysis tasks
            future_to_move = {
                executor.submit(analyze_position_worker, data): data[1]
                for data in analysis_data
            }
            
            # Collect results as they complete
            completed = 0
            for future in as_completed(future_to_move):
                move_number = future_to_move[future]
                try:
                    result = future.result()
                    results[move_number] = result
                    completed += 1
                    
                    if completed % 5 == 0 or completed == len(fens):
                        print(f"Completed {completed}/{len(fens)} analyses")
                        
                except Exception as e:
                    print(f"Error analyzing move {move_number}: {e}")
                    results[move_number] = {
                        "move_number": move_number,
                        "error": str(e),
                        "success": False
                    }
        
        end_time = time.time()
        analysis_time = end_time - start_time
        
        # Sort results by move number
        sorted_results = {}
        for move_num in sorted(results.keys()):
            sorted_results[str(move_num)] = results[move_num]
        
        return {
            "success": True,
            "total_positions": len(fens),
            "analysis_time": round(analysis_time, 2),
            "workers_used": max_workers,
            "depth": depth,
            "results": sorted_results
        }
        
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "total_positions": 0,
            "analysis_time": 0,
            "workers_used": 0,
            "depth": depth,
            "results": {}
        }

def main():
    try:
        # Read JSON input from Node.js (via stdin)
        raw_input = sys.stdin.read()
        data = json.loads(raw_input)
        
        pgn_string = data["pgn"]
        depth = data.get("depth", 10)
        max_workers = data.get("max_workers", None)
        
        print(f"Starting PGN analysis with depth {depth}")
        
        # Analyze the PGN game
        result = analyze_pgn_multithreaded(pgn_string, depth, max_workers)
        
        # Output JSON result to Node.js
        print(json.dumps(result))
        sys.stdout.flush()
        
    except Exception as e:
        error_result = {
            "success": False,
            "error": str(e),
            "total_positions": 0,
            "analysis_time": 0,
            "workers_used": 0,
            "depth": 10,
            "results": {}
        }
        print(json.dumps(error_result))
        sys.stdout.flush()
        sys.exit(1)

if __name__ == "__main__":
    main()
