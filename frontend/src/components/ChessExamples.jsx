import { useState, useRef, useEffect } from 'react';
import { Chessboard } from 'react-chessboard';
import { Chess } from 'chess.js';

function ChessExamples() {
  const [activeExample, setActiveExample] = useState('default');

  const examples = {
    default: 'Default Chessboard',
    chessjs: 'Using with chess.js',
    clickToMove: 'Click to Move',
    clickOrDrag: 'Click or Drag to Move'
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
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

        {/* Example Components */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          {activeExample === 'default' && <DefaultChessboard />}
          {activeExample === 'chessjs' && <ChessJsExample />}
          {activeExample === 'clickToMove' && <ClickToMoveExample />}
          {activeExample === 'clickOrDrag' && <ClickOrDragExample />}
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

// Chess.js Integration Example
function ChessJsExample() {
  const chessGameRef = useRef(new Chess());
  const chessGame = chessGameRef.current;
  const [chessPosition, setChessPosition] = useState(chessGame.fen());

  // Make a random "CPU" move
  function makeRandomMove() {
    const possibleMoves = chessGame.moves();
    
    if (chessGame.isGameOver()) {
      return;
    }
    
    const randomMove = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
    chessGame.move(randomMove);
    setChessPosition(chessGame.fen());
  }

  // Handle piece drop
  function onPieceDrop({ sourceSquare, targetSquare }) {
    if (!targetSquare) {
      return false;
    }

    try {
      chessGame.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: 'q'
      });

      setChessPosition(chessGame.fen());
      setTimeout(makeRandomMove, 500);
      return true;
    } catch {
      return false;
    }
  }

  const chessboardOptions = {
    position: chessPosition,
    onPieceDrop,
    id: 'play-vs-random',
    boardWidth: 560,
    showBoardNotation: true,
    customDarkSquareStyle: { backgroundColor: '#779556' },
    customLightSquareStyle: { backgroundColor: '#ebecd0' },
  };

  return (
    <div className="text-center">
      <h2 className="text-2xl font-bold mb-4">Using with chess.js</h2>
      <p className="text-gray-600 mb-6">
        Interactive chess game with drag-and-drop moves and AI opponent.
      </p>
      <div className="flex justify-center">
        <Chessboard options={chessboardOptions} />
      </div>
      <div className="mt-4 text-sm text-gray-500">
        Make a move and the computer will respond automatically!
      </div>
    </div>
  );
}

// Click to Move Example
function ClickToMoveExample() {
  const chessGameRef = useRef(new Chess());
  const chessGame = chessGameRef.current;
  const [chessPosition, setChessPosition] = useState(chessGame.fen());
  const [moveFrom, setMoveFrom] = useState('');
  const [optionSquares, setOptionSquares] = useState({});

  // Make a random "CPU" move
  function makeRandomMove() {
    const possibleMoves = chessGame.moves();
    
    if (chessGame.isGameOver()) {
      return;
    }
    
    const randomMove = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
    chessGame.move(randomMove);
    setChessPosition(chessGame.fen());
  }

  // Get move options for a square
  function getMoveOptions(square) {
    const moves = chessGame.moves({
      square,
      verbose: true
    });

    if (moves.length === 0) {
      setOptionSquares({});
      return false;
    }

    const newSquares = {};
    for (const move of moves) {
      newSquares[move.to] = {
        background: chessGame.get(move.to) && 
          chessGame.get(move.to)?.color !== chessGame.get(square)?.color 
          ? 'radial-gradient(circle, rgba(0,0,0,.1) 85%, transparent 85%)'
          : 'radial-gradient(circle, rgba(0,0,0,.1) 25%, transparent 25%)',
        borderRadius: '50%'
      };
    }

    newSquares[square] = {
      background: 'rgba(255, 255, 0, 0.4)'
    };

    setOptionSquares(newSquares);
    return true;
  }

  function onSquareClick({ square, piece }) {
    if (!moveFrom && piece) {
      const hasMoveOptions = getMoveOptions(square);
      if (hasMoveOptions) {
        setMoveFrom(square);
      }
      return;
    }

    const moves = chessGame.moves({
      square: moveFrom,
      verbose: true
    });
    const foundMove = moves.find(m => m.from === moveFrom && m.to === square);

    if (!foundMove) {
      const hasMoveOptions = getMoveOptions(square);
      setMoveFrom(hasMoveOptions ? square : '');
      return;
    }

    try {
      chessGame.move({
        from: moveFrom,
        to: square,
        promotion: 'q'
      });
    } catch {
      const hasMoveOptions = getMoveOptions(square);
      setMoveFrom(hasMoveOptions ? square : '');
      return;
    }

    setChessPosition(chessGame.fen());
    setTimeout(makeRandomMove, 300);
    setMoveFrom('');
    setOptionSquares({});
  }

  const chessboardOptions = {
    allowDragging: false,
    onSquareClick,
    position: chessPosition,
    squareStyles: optionSquares,
    id: 'click-to-move',
    boardWidth: 560,
    showBoardNotation: true,
    customDarkSquareStyle: { backgroundColor: '#779556' },
    customLightSquareStyle: { backgroundColor: '#ebecd0' },
  };

  return (
    <div className="text-center">
      <h2 className="text-2xl font-bold mb-4">Click to Move</h2>
      <p className="text-gray-600 mb-6">
        Click on a piece to select it, then click on a destination square to move.
      </p>
      <div className="flex justify-center">
        <Chessboard options={chessboardOptions} />
      </div>
      <div className="mt-4 text-sm text-gray-500">
        Click a piece to see available moves highlighted in yellow!
      </div>
    </div>
  );
}

// Click or Drag to Move Example
function ClickOrDragExample() {
  const chessGameRef = useRef(new Chess());
  const chessGame = chessGameRef.current;
  const [chessPosition, setChessPosition] = useState(chessGame.fen());
  const [moveFrom, setMoveFrom] = useState('');
  const [optionSquares, setOptionSquares] = useState({});

  // Make a random "CPU" move
  function makeRandomMove() {
    const possibleMoves = chessGame.moves();
    
    if (chessGame.isGameOver()) {
      return;
    }
    
    const randomMove = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
    chessGame.move(randomMove);
    setChessPosition(chessGame.fen());
  }

  // Get move options for a square
  function getMoveOptions(square) {
    const moves = chessGame.moves({
      square,
      verbose: true
    });

    if (moves.length === 0) {
      setOptionSquares({});
      return false;
    }

    const newSquares = {};
    for (const move of moves) {
      newSquares[move.to] = {
        background: chessGame.get(move.to) && 
          chessGame.get(move.to)?.color !== chessGame.get(square)?.color 
          ? 'radial-gradient(circle, rgba(0,0,0,.1) 85%, transparent 85%)'
          : 'radial-gradient(circle, rgba(0,0,0,.1) 25%, transparent 25%)',
        borderRadius: '50%'
      };
    }

    newSquares[square] = {
      background: 'rgba(255, 255, 0, 0.4)'
    };

    setOptionSquares(newSquares);
    return true;
  }

  function onSquareClick({ square, piece }) {
    if (!moveFrom && piece) {
      const hasMoveOptions = getMoveOptions(square);
      if (hasMoveOptions) {
        setMoveFrom(square);
      }
      return;
    }

    const moves = chessGame.moves({
      square: moveFrom,
      verbose: true
    });
    const foundMove = moves.find(m => m.from === moveFrom && m.to === square);

    if (!foundMove) {
      const hasMoveOptions = getMoveOptions(square);
      setMoveFrom(hasMoveOptions ? square : '');
      return;
    }

    try {
      chessGame.move({
        from: moveFrom,
        to: square,
        promotion: 'q'
      });
    } catch {
      const hasMoveOptions = getMoveOptions(square);
      setMoveFrom(hasMoveOptions ? square : '');
      return;
    }

    setChessPosition(chessGame.fen());
    setTimeout(makeRandomMove, 300);
    setMoveFrom('');
    setOptionSquares({});
  }

  // Handle piece drop
  function onPieceDrop({ sourceSquare, targetSquare }) {
    if (!targetSquare) {
      return false;
    }

    try {
      chessGame.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: 'q'
      });

      setChessPosition(chessGame.fen());
      setMoveFrom('');
      setOptionSquares({});
      setTimeout(makeRandomMove, 500);
      return true;
    } catch {
      return false;
    }
  }

  const chessboardOptions = {
    onPieceDrop,
    onSquareClick,
    position: chessPosition,
    squareStyles: optionSquares,
    id: 'click-or-drag-to-move',
    boardWidth: 560,
    showBoardNotation: true,
    customDarkSquareStyle: { backgroundColor: '#779556' },
    customLightSquareStyle: { backgroundColor: '#ebecd0' },
  };

  return (
    <div className="text-center">
      <h2 className="text-2xl font-bold mb-4">Click or Drag to Move</h2>
      <p className="text-gray-600 mb-6">
        You can either drag pieces or click to select and move them.
      </p>
      <div className="flex justify-center">
        <Chessboard options={chessboardOptions} />
      </div>
      <div className="mt-4 text-sm text-gray-500">
        Try both methods: drag pieces or click to select then click destination!
      </div>
    </div>
  );
}

export default ChessExamples;
