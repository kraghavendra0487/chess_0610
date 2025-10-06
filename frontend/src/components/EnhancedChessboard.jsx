import { useState, useEffect } from 'react';
import { Chessboard } from 'react-chessboard';

function EnhancedChessboard() {
  const [activeExample, setActiveExample] = useState('classic');
  const [gamePosition, setGamePosition] = useState('start');
  const [moveHistory, setMoveHistory] = useState([]);
  const [selectedSquare, setSelectedSquare] = useState('');
  const [highlightedSquares, setHighlightedSquares] = useState({});

  const examples = {
    classic: 'Classic Chess',
    modern: 'Modern Theme',
    interactive: 'Interactive Game',
    puzzle: 'Chess Puzzle'
  };

  // Classic chessboard options
  const classicOptions = {
    position: gamePosition,
    boardWidth: 520,
    showBoardNotation: true,
    customDarkSquareStyle: { backgroundColor: '#769656' },
    customLightSquareStyle: { backgroundColor: '#EEEED2' },
    customBoardStyle: {
      borderRadius: '8px',
      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
    },
    animationDuration: 300,
    arePiecesDraggable: true,
    onPieceDrop: handleMove,
    onSquareClick: handleSquareClick,
  };

  // Modern theme options
  const modernOptions = {
    position: gamePosition,
    boardWidth: 520,
    showBoardNotation: true,
    customDarkSquareStyle: { 
      backgroundColor: '#B58863',
      backgroundImage: 'linear-gradient(45deg, #B58863 25%, transparent 25%), linear-gradient(-45deg, #B58863 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #B58863 75%), linear-gradient(-45deg, transparent 75%, #B58863 75%)',
      backgroundSize: '8px 8px',
      backgroundPosition: '0 0, 0 4px, 4px -4px, -4px 0px'
    },
    customLightSquareStyle: { 
      backgroundColor: '#F0D9B5',
      backgroundImage: 'linear-gradient(45deg, #F0D9B5 25%, transparent 25%), linear-gradient(-45deg, #F0D9B5 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #F0D9B5 75%), linear-gradient(-45deg, transparent 75%, #F0D9B5 75%)',
      backgroundSize: '8px 8px',
      backgroundPosition: '0 0, 0 4px, 4px -4px, -4px 0px'
    },
    customBoardStyle: {
      borderRadius: '12px',
      boxShadow: '0 15px 35px rgba(0, 0, 0, 0.2), inset 0 0 0 2px #8B4513',
      border: '4px solid #654321',
    },
    animationDuration: 400,
    arePiecesDraggable: true,
    onPieceDrop: handleMove,
    onSquareClick: handleSquareClick,
  };

  // Interactive game options
  const interactiveOptions = {
    position: gamePosition,
    boardWidth: 520,
    showBoardNotation: true,
    customDarkSquareStyle: { backgroundColor: '#779556' },
    customLightSquareStyle: { backgroundColor: '#ebecd0' },
    customBoardStyle: {
      borderRadius: '10px',
      boxShadow: '0 12px 40px rgba(0, 0, 0, 0.25)',
    },
    squareStyles: highlightedSquares,
    animationDuration: 250,
    arePiecesDraggable: true,
    areArrowsAllowed: true,
    customArrowColor: '#7c3aed',
    onPieceDrop: handleMove,
    onSquareClick: handleSquareClick,
  };

  // Puzzle mode options
  const puzzleOptions = {
    position: 'r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/3P1N2/PPP2PPP/RNBQK2R w KQkq - 4 4',
    boardWidth: 520,
    showBoardNotation: true,
    customDarkSquareStyle: { backgroundColor: '#769656' },
    customLightSquareStyle: { backgroundColor: '#EEEED2' },
    customBoardStyle: {
      borderRadius: '8px',
      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
      border: '3px solid #FF6B6B',
    },
    animationDuration: 300,
    arePiecesDraggable: true,
    onPieceDrop: handleMove,
    onSquareClick: handleSquareClick,
  };

  function handleMove({ sourceSquare, targetSquare, piece }) {
    const move = `${sourceSquare} → ${targetSquare}`;
    setMoveHistory(prev => [...prev, { move, piece, timestamp: new Date() }]);
    console.log(`Move: ${move} (${piece.pieceType})`);
    return true;
  }

  function handleSquareClick({ square, piece }) {
    setSelectedSquare(square);
    
    if (piece) {
      setHighlightedSquares({
        [square]: {
          background: 'rgba(255, 255, 0, 0.4)',
          borderRadius: '50%'
        }
      });
    } else {
      setHighlightedSquares({});
    }
    
    console.log(`Clicked: ${square}`, piece ? `(${piece.pieceType})` : '(empty)');
  }

  function resetGame() {
    setGamePosition('start');
    setMoveHistory([]);
    setSelectedSquare('');
    setHighlightedSquares({});
  }

  function getCurrentOptions() {
    switch (activeExample) {
      case 'classic': return classicOptions;
      case 'modern': return modernOptions;
      case 'interactive': return interactiveOptions;
      case 'puzzle': return puzzleOptions;
      default: return classicOptions;
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-gray-800 mb-2">
            ♛ Enhanced Chessboard ♛
          </h1>
          <p className="text-gray-600 text-lg">
            Interactive chess experience with multiple themes and features
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Navigation Panel */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-4">
              <h2 className="text-xl font-bold mb-4 text-gray-800">Examples</h2>
              <div className="space-y-2">
                {Object.entries(examples).map(([key, title]) => (
                  <button
                    key={key}
                    onClick={() => setActiveExample(key)}
                    className={`w-full text-left px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                      activeExample === key
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {title}
                  </button>
                ))}
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <button
                  onClick={resetGame}
                  className="w-full bg-green-600 text-white px-4 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors"
                >
                  🔄 Reset Game
                </button>
              </div>

              {/* Move History */}
              {moveHistory.length > 0 && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h3 className="text-lg font-bold mb-3 text-gray-800">Recent Moves</h3>
                  <div className="max-h-48 overflow-y-auto space-y-1">
                    {moveHistory.slice(-10).map((item, index) => (
                      <div key={index} className="text-sm bg-gray-50 p-2 rounded">
                        <span className="font-medium">{item.move}</span>
                        <span className="text-gray-500 ml-2">({item.piece.pieceType})</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Chessboard Area */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="text-center">
                <h2 className="text-2xl font-bold mb-4 text-gray-800">
                  {examples[activeExample]}
                </h2>

                {/* Example Descriptions */}
                <div className="mb-6">
                  {activeExample === 'classic' && (
                    <p className="text-gray-600">
                      Traditional chessboard with classic green and beige squares. Perfect for serious play.
                    </p>
                  )}
                  {activeExample === 'modern' && (
                    <p className="text-gray-600">
                      Modern design with textured squares and elegant borders. Great for casual games.
                    </p>
                  )}
                  {activeExample === 'interactive' && (
                    <p className="text-gray-600">
                      Enhanced interactivity with move highlighting and arrows. Click squares or drag pieces!
                    </p>
                  )}
                  {activeExample === 'puzzle' && (
                    <p className="text-gray-600">
                      Chess puzzle setup. Can you find the best move for white?
                    </p>
                  )}
                </div>

                {/* Chessboard */}
                <div className="flex justify-center mb-6">
                  <Chessboard options={getCurrentOptions()} />
                </div>

                {/* Interactive Features Info */}
                <div className="bg-blue-50 rounded-lg p-4 text-sm text-blue-800">
                  <h4 className="font-bold mb-2">🎮 Interactive Features:</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <div>• Drag pieces to move them</div>
                    <div>• Click squares for selection</div>
                    <div>• Move history tracking</div>
                    <div>• Visual move highlighting</div>
                  </div>
                </div>

                {/* Game Stats */}
                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="font-bold text-gray-800">Moves Made</div>
                    <div className="text-2xl font-bold text-blue-600">{moveHistory.length}</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="font-bold text-gray-800">Selected Square</div>
                    <div className="text-lg font-bold text-green-600">{selectedSquare || 'None'}</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="font-bold text-gray-800">Theme</div>
                    <div className="text-lg font-bold text-purple-600">{examples[activeExample]}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EnhancedChessboard;
