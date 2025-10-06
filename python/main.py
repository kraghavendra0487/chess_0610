from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import threading
import time
from stockfish import Stockfish

app = FastAPI(title="Multithreaded Stockfish API")

# Path to Stockfish executable (using your actual path)
STOCKFISH_PATH = "C:\\Users\\ragha\\Desktop\\Chess_0610\\stockfish\\stockfish.exe"

# Global lock for thread safety
stockfish_lock = threading.Lock()

def create_stockfish_instance():
    """Create a new Stockfish instance with multithreaded configuration"""
    return Stockfish(
        STOCKFISH_PATH,
        parameters={
            "Threads": 4,                # use multiple threads for better performance
            "Hash": 256,                 # enable hash table for better performance
            "Skill Level": 20,           # full engine strength
            "Contempt": 0,               # neutral evaluation
            "Move Overhead": 0,          # no move delay
            "Minimum Thinking Time": 100, # slightly longer thinking time for better moves
            "Ponder": False,             # disable pondering for faster responses
            "MultiPV": 1                # analyze only the best line
        }
    )

# Add CORS middleware for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure this properly for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class AnalyzeRequest(BaseModel):
    fen: str
    depth: int = 15  # default analysis depth

@app.post("/analyze")
def analyze_position(request: AnalyzeRequest):
    """
    Analyze a given FEN position using multithreaded Stockfish.
    Returns best move and evaluation with thread safety.
    """
    try:
        with stockfish_lock:
            # Create a new Stockfish instance for this analysis
            stockfish = create_stockfish_instance()
            
            # Reset engine state before each analysis
            stockfish._put("ucinewgame")
            
            # Set position and analysis depth
            stockfish.set_fen_position(request.fen)
            stockfish.set_depth(request.depth)
            
            # Get analysis results
            best_move = stockfish.get_best_move()
            evaluation = stockfish.get_evaluation()
            
            return {
                "fen": request.fen,
                "depth": request.depth,
                "best_move": best_move,
                "evaluation": evaluation,
                "multithreaded": True,
                "success": True
            }
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

@app.get("/")
def home():
    return {
        "message": "Multithreaded Stockfish API ✅",
        "features": [
            "Multithreaded analysis",
            "Thread-safe operations", 
            "CORS enabled for frontend integration",
            "FastAPI backend service"
        ]
    }

@app.get("/health")
def health_check():
    """Health check endpoint for monitoring"""
    try:
        # Quick test to ensure Stockfish is working
        with stockfish_lock:
            test_stockfish = create_stockfish_instance()
            test_stockfish.set_fen_position("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1")
            test_stockfish.set_depth(1)
            _ = test_stockfish.get_best_move()
        
        return {
            "status": "healthy",
            "service": "Multithreaded Stockfish API",
            "thread_safety": True
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Health check failed: {str(e)}")
