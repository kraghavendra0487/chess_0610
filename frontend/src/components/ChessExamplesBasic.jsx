import { useState } from 'react';
import { Chessboard } from 'react-chessboard';

function ChessExamplesBasic() {
  const [activeExample, setActiveExample] = useState('default');

  const examples = {
    default: 'Default Chessboard',
    custom: 'Custom Styled Board',
    interactive: 'Interactive Board'
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">
          React Chessboard Examples
        </h1>
        
        {/* Installation Notice */}
        <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4 mb-8">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                <strong>Installation Required:</strong> Run <code className="bg-yellow-200 px-2 py-1 rounded">npm install chess.js</code> to enable full chess game functionality.
              </p>
            </div>
          </div>
        </div>
        
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

        {/* Example Components */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          {activeExample === 'default' && <DefaultChessboard />}
          {activeExample === 'custom' && <CustomChessboard />}
          {activeExample === 'interactive' && <InteractiveChessboard />}
        </div>
      </div>
    </div>
  );
}

// Default Chessboard Component
function DefaultChessboard() {
  const chessboardOptions = {
    position: 'start',
    boardWidth: 560,
    showBoardNotation: true,
    customDarkSquareStyle: { backgroundColor: '#779556' },
    customLightSquareStyle: { backgroundColor: '#ebecd0' },
    customBoardStyle: {
      borderRadius: '5px',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    },
  };

  return (
    <div className="text-center">
      <h2 className="text-2xl font-bold mb-4">Default Chessboard</h2>
      <p className="text-gray-600 mb-6">
        A simple chessboard with default pieces and basic styling.
      </p>
      <div className="flex justify-center">
        <Chessboard options={chessboardOptions} />
      </div>
    </div>
  );
}

// Custom Styled Chessboard
function CustomChessboard() {
  const chessboardOptions = {
    position: 'start',
    boardWidth: 560,
    showBoardNotation: true,
    customDarkSquareStyle: { backgroundColor: '#B58863' },
    customLightSquareStyle: { backgroundColor: '#F0D9B5' },
    customBoardStyle: {
      borderRadius: '10px',
      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.2)',
      border: '3px solid #8B4513',
    },
    customPieces: {},
    animationDuration: 300,
  };

  return (
    <div className="text-center">
      <h2 className="text-2xl font-bold mb-4">Custom Styled Board</h2>
      <p className="text-gray-600 mb-6">
        Chessboard with custom colors, border, and animation settings.
      </p>
      <div className="flex justify-center">
        <Chessboard options={chessboardOptions} />
      </div>
    </div>
  );
}

// Interactive Chessboard (without chess.js)
function InteractiveChessboard() {
  const [position, setPosition] = useState('start');

  function onPieceDrop({ sourceSquare, targetSquare }) {
    console.log('Move attempted from', sourceSquare, 'to', targetSquare);
    // Without chess.js, we can't validate moves, but we can log them
    return true; // Allow all moves for demo purposes
  }

  function onSquareClick({ square, piece }) {
    console.log('Square clicked:', square, 'Piece:', piece);
  }

  const chessboardOptions = {
    position: position,
    onPieceDrop,
    onSquareClick,
    boardWidth: 560,
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
  };

  return (
    <div className="text-center">
      <h2 className="text-2xl font-bold mb-4">Interactive Board</h2>
      <p className="text-gray-600 mb-6">
        Interactive chessboard with drag-and-drop and click events. Check console for move logs.
      </p>
      <div className="flex justify-center mb-4">
        <Chessboard options={chessboardOptions} />
      </div>
      <div className="text-sm text-gray-500">
        <p>• Drag pieces to move them</p>
        <p>• Click squares to log interactions</p>
        <p>• Install chess.js for move validation</p>
      </div>
    </div>
  );
}

export default ChessExamplesBasic;
