import sys
import json
import threading
import time
import queue
import multiprocessing
import os
from concurrent.futures import ThreadPoolExecutor, as_completed
from stockfish import Stockfish
import chess
import chess.pgn
from io import StringIO

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

def get_optimal_worker_count():
    """Determine optimal number of workers based on system resources"""
    # Use only 1 worker for single-threaded operation
    return 1

def create_stockfish_instance():
    """Create a new Stockfish instance with single-threaded configuration"""
    return Stockfish(
        STOCKFISH_PATH,
        parameters={
            "Threads": 1,                # Use 1 thread for single-threaded operation
            "Hash": 512,                 # Large hash for better performance
            "Skill Level": 20,           # Full engine strength
            "Contempt": 0,               # Neutral evaluation
            "Move Overhead": 0,          # No move delay
            "Minimum Thinking Time": 0,  # No minimum thinking time
            "Ponder": False,             # Disable pondering
            "MultiPV": 1                # Analyze only the best line
        }
    )

def analyze_position_worker(fen_data):
    """Worker function to analyze a single FEN position with ULTRA-FAST performance"""
    fen, move_number, depth, move_played, previous_fen = fen_data
    worker_id = threading.current_thread().name
    
    try:
        print(f"WORKER {worker_id}: Starting analysis of position {move_number}", file=sys.stderr)
        
        stockfish = create_stockfish_instance()
        
        # Analyze current position for evaluation
        stockfish.set_fen_position(fen)
        stockfish.set_depth(depth)
        evaluation = stockfish.get_evaluation()
        
        # Get best move from PREVIOUS position (if it exists)
        best_move = None
        if previous_fen and move_played and move_played != "start":
            try:
                # Analyze the previous position to get the best move from there
                stockfish.set_fen_position(previous_fen)
                stockfish.set_depth(depth)
                best_move = stockfish.get_best_move()
                
                # Reset back to current position for other evaluations
                stockfish.set_fen_position(fen)
            except Exception as best_move_error:
                print(f"WORKER {worker_id}: Could not get best move from previous position: {best_move_error}", file=sys.stderr)
                best_move = None
        else:
            # For starting position, no previous position exists
            best_move = None
        
        # Process evaluation - convert mate to +1000/-1000 based on color
        if evaluation['type'] == 'cp':
            evaluation_raw = evaluation['value']  # Keep raw centipawn values
        elif evaluation['type'] == 'mate':
            # Convert mate to +1000 (white mate) or -1000 (black mate)
            mate_value = evaluation['value']
            if mate_value > 0:
                evaluation_raw = 1000  # White has mate
            else:
                evaluation_raw = -1000  # Black has mate
        else:
            evaluation_raw = 0
        
        # Get evaluation of the previous position
        previous_position_evaluation = None
        if previous_fen:
            try:
                stockfish.set_fen_position(previous_fen)
                stockfish.set_depth(depth)
                prev_eval = stockfish.get_evaluation()
                
                if prev_eval['type'] == 'cp':
                    previous_position_evaluation = prev_eval['value']
                elif prev_eval['type'] == 'mate':
                    # Convert mate to +1000/-1000 based on color
                    mate_value = prev_eval['value']
                    if mate_value > 0:
                        previous_position_evaluation = 1000  # White has mate
                    else:
                        previous_position_evaluation = -1000  # Black has mate
                else:
                    previous_position_evaluation = 0
                    
                # Reset back to current position for other evaluations
                stockfish.set_fen_position(fen)
            except Exception as prev_eval_error:
                print(f"WORKER {worker_id}: Could not get previous position evaluation: {prev_eval_error}", file=sys.stderr)
                previous_position_evaluation = None
        else:
            # For starting position (move 0), previous evaluation is 0
            previous_position_evaluation = 0
        
        # Get evaluation of the move that was played vs best move (both from previous position)
        move_played_evaluation = None
        best_move_evaluation = None
        
        if previous_fen and move_played and move_played != "start":
            try:
                # Start from the previous position
                stockfish.set_fen_position(previous_fen)
                stockfish.set_depth(depth)
                
                # Get the best move from the previous position
                previous_best_move = stockfish.get_best_move()
                
                # Evaluate the position after playing the ACTUAL move that was played
                try:
                    board = chess.Board(previous_fen)
                    # Convert SAN move to chess.Move object
                    if move_played:
                        # Parse SAN move to get the move object
                        move_obj = board.parse_san(move_played)
                        if move_obj in board.legal_moves:
                            board.push(move_obj)
                            actual_move_fen = board.fen()
                            
                            # Evaluate the position after the actual move
                            stockfish.set_fen_position(actual_move_fen)
                            stockfish.set_depth(depth)
                            
                            actual_move_eval = stockfish.get_evaluation()
                            if actual_move_eval['type'] == 'cp':
                                move_played_evaluation = actual_move_eval['value']
                            elif actual_move_eval['type'] == 'mate':
                                # Convert mate to +1000/-1000 based on color
                                mate_value = actual_move_eval['value']
                                if mate_value > 0:
                                    move_played_evaluation = 1000  # White has mate
                                else:
                                    move_played_evaluation = -1000  # Black has mate
                            else:
                                move_played_evaluation = 0
                except Exception as actual_move_error:
                    print(f"WORKER {worker_id}: Could not evaluate actual move: {actual_move_error}", file=sys.stderr)
                    move_played_evaluation = None
                
                # Evaluate the position after playing the BEST move from previous position
                try:
                    board = chess.Board(previous_fen)
                    # Convert UCI move to chess.Move object if needed
                    if previous_best_move:
                        move_obj = chess.Move.from_uci(previous_best_move)
                        if move_obj in board.legal_moves:
                            board.push(move_obj)
                            best_move_fen = board.fen()
                            
                            # Evaluate the position after the best move
                            stockfish.set_fen_position(best_move_fen)
                            stockfish.set_depth(depth)
                            
                            best_move_eval = stockfish.get_evaluation()
                            if best_move_eval['type'] == 'cp':
                                best_move_evaluation = best_move_eval['value']
                            elif best_move_eval['type'] == 'mate':
                                # Convert mate to +1000/-1000 based on color
                                mate_value = best_move_eval['value']
                                if mate_value > 0:
                                    best_move_evaluation = 1000  # White has mate
                                else:
                                    best_move_evaluation = -1000  # Black has mate
                            else:
                                best_move_evaluation = 0
                except Exception as best_move_error:
                    print(f"WORKER {worker_id}: Could not evaluate best move: {best_move_error}", file=sys.stderr)
                    best_move_evaluation = None
                    
            except Exception as eval_error:
                print(f"WORKER {worker_id}: Could not evaluate moves: {eval_error}", file=sys.stderr)
                move_played_evaluation = None
        
        print(f"WORKER {worker_id}: Completed position {move_number} - Previous eval: {previous_position_evaluation}, Best move from previous: {best_move}, Current eval: {evaluation_raw}, Move played eval: {move_played_evaluation}, Best move eval: {best_move_evaluation}", file=sys.stderr)
        
        return {
            "move_number": move_number,
            "fen": fen,
            "best_move": best_move,
            "evaluation": evaluation_raw,
            "previous_position_evaluation": previous_position_evaluation,
            "move_played_evaluation": move_played_evaluation,
            "best_move_evaluation": best_move_evaluation,
            "depth": depth,
            "worker_id": worker_id,
            "move_played": move_played,
            "success": True
        }
    except Exception as e:
        print(f"WORKER {worker_id}: ERROR analyzing position {move_number}: {e}", file=sys.stderr)
        return {
            "move_number": move_number,
            "fen": fen,
            "error": str(e),
            "worker_id": worker_id,
            "success": False
        }

def parse_pgn_to_fens(pgn_string):
    """Parse PGN string and extract FEN positions for each move"""
    try:
        pgn_io = StringIO(pgn_string)
        game = chess.pgn.read_game(pgn_io)
        
        if not game:
            raise ValueError("Invalid PGN format - no game found")
        
        # Create chess board to track positions
        board = game.board()
        fens = []
        
        # Add starting position
        fens.append({
            "fen": board.fen(),
            "move_number": 0,
            "move": "start",
            "move_played": None,
            "previous_fen": None
        })
        
        # Process each move
        move_number = 1
        moves_processed = 0
        for move in game.mainline_moves():
            try:
                # Store the previous position's FEN
                previous_fen = board.fen()
                # Get the move in SAN notation before making it
                move_san = board.san(move)
                board.push(move)
                fens.append({
                    "fen": board.fen(),
                    "move_number": move_number,
                    "move": str(move),
                    "move_played": move_san,
                    "previous_fen": previous_fen
                })
                move_number += 1
                moves_processed += 1
            except Exception as move_error:
                print(f"WARNING: Failed to process move {move_number}: {move_error}", file=sys.stderr)
                # Continue with next move instead of failing completely
                continue
        
        if moves_processed == 0:
            raise ValueError("No valid moves found in PGN")
        
        print(f"Successfully parsed {moves_processed} moves from PGN", file=sys.stderr)
        return fens
        
    except Exception as e:
        raise ValueError(f"Failed to parse PGN: {str(e)}")

def analyze_pgn_ultra_fast(pgn_string, depth=10, max_workers=None):
    """Analyze entire PGN game using ULTRA-FAST multi-worker analysis"""
    try:
        # Parse PGN to get FEN positions
        print(f"ULTRA-FAST PGN Analysis Starting...", file=sys.stderr)
        fens = parse_pgn_to_fens(pgn_string)
        print(f"Found {len(fens)} positions to analyze", file=sys.stderr)
        
        # Determine optimal worker count
        if max_workers is None:
            max_workers = get_optimal_worker_count()
        
        print(f"Using {max_workers} single-threaded worker", file=sys.stderr)
        
        # Prepare data for workers
        analysis_data = [
            (fen_info["fen"], fen_info["move_number"], depth, fen_info["move_played"], fen_info["previous_fen"])
            for fen_info in fens
        ]
        
        # Use ThreadPoolExecutor for parallel analysis
        results = {}
        start_time = time.time()
        
        with ThreadPoolExecutor(max_workers=max_workers) as executor:
            print(f"MASTER: Submitting {len(analysis_data)} analysis tasks to {max_workers} workers", file=sys.stderr)
            
            # Submit all analysis tasks
            future_to_move = {}
            for i, data in enumerate(analysis_data):
                future = executor.submit(analyze_position_worker, data)
                future_to_move[future] = data[1]
                print(f"MASTER: Submitted task {i+1}/{len(analysis_data)} for position {data[1]}", file=sys.stderr)
            
            print(f"MASTER: All tasks submitted, waiting for completion...", file=sys.stderr)
            
            # Collect results as they complete
            completed = 0
            for future in as_completed(future_to_move):
                move_number = future_to_move[future]
                try:
                    result = future.result()
                    results[move_number] = result
                    completed += 1
                    
                    worker_id = result.get('worker_id', 'Unknown')
                    print(f"MASTER: Worker {worker_id} completed position {move_number} ({completed}/{len(fens)})", file=sys.stderr)
                    
                    if completed % 5 == 0 or completed == len(fens):
                        elapsed = time.time() - start_time
                        rate = completed / elapsed if elapsed > 0 else 0
                        print(f"MASTER: Progress update - {completed}/{len(fens)} analyses completed ({rate:.1f} pos/sec)", file=sys.stderr)
                        
                except Exception as e:
                    print(f"MASTER: ERROR analyzing move {move_number}: {e}", file=sys.stderr)
                    results[move_number] = {
                        "move_number": move_number,
                        "error": str(e),
                        "success": False
                    }
        
        end_time = time.time()
        analysis_time = end_time - start_time
        
        # Sort results by move number
        sorted_results = {}
        worker_stats = {}
        for move_num in sorted(results.keys()):
            sorted_results[str(move_num)] = results[move_num]
            worker_id = results[move_num].get('worker_id', 'Unknown')
            worker_stats[worker_id] = worker_stats.get(worker_id, 0) + 1
        
        print(f"ULTRA-FAST Analysis Complete!", file=sys.stderr)
        print(f"Total time: {analysis_time:.2f} seconds", file=sys.stderr)
        print(f"Rate: {len(fens)/analysis_time:.1f} positions/second", file=sys.stderr)
        print(f"Worker statistics:", file=sys.stderr)
        for worker_id, count in worker_stats.items():
            print(f"  {worker_id}: {count} positions", file=sys.stderr)
        
        return {
            "success": True,
            "total_positions": len(fens),
            "analysis_time": round(analysis_time, 2),
            "workers_used": max_workers,
            "depth": depth,
            "positions_per_second": round(len(fens)/analysis_time, 1),
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
            "positions_per_second": 0,
            "results": {}
        }

def main():
    try:
        print("Python ULTRA-FAST analyzer starting...", file=sys.stderr)
        
        # Read JSON input from Node.js (via stdin)
        raw_input = sys.stdin.read()
        print(f"Received input: {len(raw_input)} characters", file=sys.stderr)
        
        data = json.loads(raw_input)
        print(f"Parsed JSON data: {list(data.keys())}", file=sys.stderr)
        
        pgn_string = data["pgn"]
        depth = data.get("depth", 10)
        max_workers = data.get("max_workers", None)
        
        print(f"Starting ULTRA-FAST PGN analysis with depth {depth}", file=sys.stderr)
        print(f"PGN length: {len(pgn_string)} characters", file=sys.stderr)
        
        # Test Stockfish path
        print(f"Stockfish path: {STOCKFISH_PATH}", file=sys.stderr)
        if not os.path.exists(STOCKFISH_PATH):
            raise FileNotFoundError(f"Stockfish not found at: {STOCKFISH_PATH}")
        
        # Analyze the PGN game
        result = analyze_pgn_ultra_fast(pgn_string, depth, max_workers)
        
        print(f"Analysis completed, sending results...", file=sys.stderr)
        
        # Output JSON result to Node.js
        print(json.dumps(result))
        sys.stdout.flush()
        
    except Exception as e:
        print(f"ERROR: Error in main(): {str(e)}", file=sys.stderr)
        import traceback
        print(f"ERROR: Traceback: {traceback.format_exc()}", file=sys.stderr)
        
        error_result = {
            "success": False,
            "error": str(e),
            "total_positions": 0,
            "analysis_time": 0,
            "workers_used": 0,
            "depth": 10,
            "positions_per_second": 0,
            "results": {}
        }
        print(json.dumps(error_result))
        sys.stdout.flush()
        sys.exit(1)

if __name__ == "__main__":
    main()
