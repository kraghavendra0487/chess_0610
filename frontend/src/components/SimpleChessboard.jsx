import { useState, useEffect } from 'react';
import { Chessboard } from 'react-chessboard';

function SimpleChessboard() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeExample, setActiveExample] = useState('default');

  // Ensure component is properly mounted before rendering
  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const examples = {
    default: 'Default Chessboard',
    custom: 'Custom Styled Board',
    interactive: 'Interactive Board'
  };

  // Simple chessboard options
  const defaultOptions = {
    position: 'start',
    boardWidth: 500,
    showBoardNotation: true,
    customDarkSquareStyle: { backgroundColor: '#779556' },
    customLightSquareStyle: { backgroundColor: '#ebecd0' },
    customBoardStyle: {
      borderRadius: '5px',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    },
  };

  const customOptions = {
    position: 'start',
    boardWidth: 500,
    showBoardNotation: true,
    customDarkSquareStyle: { backgroundColor: '#B58863' },
    customLightSquareStyle: { backgroundColor: '#F0D9B5' },
    customBoardStyle: {
      borderRadius: '10px',
      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.2)',
      border: '3px solid #8B4513',
    },
    animationDuration: 300,
  };

  const interactiveOptions = {
    position: 'start',
    boardWidth: 500,
    showBoardNotation: true,
    customDarkSquareStyle: { backgroundColor: '#769656' },
    customLightSquareStyle: { backgroundColor: '#EEEED2' },
    customBoardStyle: {
      borderRadius: '8px',
      boxShadow: '0 8px 32px -8px rgba(0, 0, 0, 0.3)',
    },
    arePiecesDraggable: true,
    areArrowsAllowed: true,
    customArrowColor: '#7c3aed',
    onPieceDrop: ({ sourceSquare, targetSquare }) => {
      console.log('Move from', sourceSquare, 'to', targetSquare);
      return true;
    },
    onSquareClick: ({ square, piece }) => {
      console.log('Clicked:', square, piece);
    },
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading chessboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">
          React Chessboard Examples
        </h1>
        
        {/* Navigation */}
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          {Object.entries(examples).map(([key, title]) => (
            <button
              key={key}
              onClick={() => setActiveExample(key)}
              className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                activeExample === key
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
              }`}
            >
              {title}
            </button>
          ))}
        </div>

        {/* Chessboard Container */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">
              {examples[activeExample]}
            </h2>
            
            {activeExample === 'default' && (
              <>
                <p className="text-gray-600 mb-6">
                  A simple chessboard with default pieces and basic styling.
                </p>
                <div className="flex justify-center">
                  <Chessboard options={defaultOptions} />
                </div>
              </>
            )}

            {activeExample === 'custom' && (
              <>
                <p className="text-gray-600 mb-6">
                  Chessboard with custom colors, border, and animation settings.
                </p>
                <div className="flex justify-center">
                  <Chessboard options={customOptions} />
                </div>
              </>
            )}

            {activeExample === 'interactive' && (
              <>
                <p className="text-gray-600 mb-6">
                  Interactive chessboard with drag-and-drop and click events. Check console for logs.
                </p>
                <div className="flex justify-center">
                  <Chessboard options={interactiveOptions} />
                </div>
                <div className="mt-4 text-sm text-gray-500">
                  <p>• Drag pieces to move them</p>
                  <p>• Click squares to log interactions</p>
                  <p>• Install chess.js for move validation</p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default SimpleChessboard;
