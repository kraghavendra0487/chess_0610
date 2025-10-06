import React, { useState, useEffect } from 'react';
import { Chessboard } from 'react-chessboard';

const MiniPuzzles = () => {
  const [currentMoveIndex, setCurrentMoveIndex] = useState(0);
  const [position, setPosition] = useState({
    a4: { pieceType: 'bR' },
    c4: { pieceType: 'bK' },
    e4: { pieceType: 'bN' },
    d3: { pieceType: 'bP' },
    f3: { pieceType: 'bQ' },
    c2: { pieceType: 'wN' },
    d2: { pieceType: 'wQ' },
    b1: { pieceType: 'wN' }
  });

  // Hide specific squares to create the mini puzzle board
  useEffect(() => {
    const e1 = document.getElementById('mini-puzzles-square-e1');
    const f1 = document.getElementById('mini-puzzles-square-f1');
    if (e1) {
      e1.style.display = 'none';
    }
    if (f1) {
      f1.style.display = 'none';
    }
  }, []);

  // Moves for the puzzle
  const moves = [
    { sourceSquare: 'd2', targetSquare: 'c3' },
    { sourceSquare: 'e4', targetSquare: 'c3' },
    { sourceSquare: 'b1', targetSquare: 'd2' }
  ];

  // Handle piece drop
  const onPieceDrop = ({ sourceSquare, targetSquare, piece }) => {
    const requiredMove = moves[currentMoveIndex];

    // Check if the move is valid
    if (requiredMove.sourceSquare !== sourceSquare || requiredMove.targetSquare !== targetSquare) {
      // Return false as the move is not valid
      return false;
    }

    // Update the position
    const newPosition = { ...position };
    newPosition[targetSquare] = { pieceType: piece.pieceType };
    delete newPosition[sourceSquare];
    setPosition(newPosition);

    // Increment the current move index
    setCurrentMoveIndex(prev => prev + 1);

    // Define makeCpuMove inside onPieceDrop to capture current values
    const makeCpuMove = () => {
      const nextMoveIndex = currentMoveIndex + 1;

      // If there is another move, make it
      if (nextMoveIndex < moves.length) {
        const move = moves[nextMoveIndex];
        const updatedPosition = { ...newPosition };
        updatedPosition[move.targetSquare] = {
          pieceType: updatedPosition[move.sourceSquare].pieceType
        };
        delete updatedPosition[move.sourceSquare];
        setPosition(updatedPosition);
        setCurrentMoveIndex(nextMoveIndex + 1);
      }
    };

    // Make the cpu move
    setTimeout(makeCpuMove, 200);

    // Return true as the move was successful
    return true;
  };

  // Only allow white pieces to be dragged
  const canDragPiece = ({ piece }) => {
    return piece.pieceType[0] === 'w';
  };

  // Reset puzzle function
  const resetPuzzle = () => {
    setCurrentMoveIndex(0);
    setPosition({
      a4: { pieceType: 'bR' },
      c4: { pieceType: 'bK' },
      e4: { pieceType: 'bN' },
      d3: { pieceType: 'bP' },
      f3: { pieceType: 'bQ' },
      c2: { pieceType: 'wN' },
      d2: { pieceType: 'wQ' },
      b1: { pieceType: 'wN' }
    });
  };

  // Set the chessboard options
  const chessboardOptions = {
    canDragPiece,
    onPieceDrop,
    chessboardRows: 4,
    chessboardColumns: 6,
    position,
    id: 'mini-puzzles',
    boardWidth: 500,
    showBoardNotation: true,
    customDarkSquareStyle: { backgroundColor: '#779556' },
    customLightSquareStyle: { backgroundColor: '#ebecd0' },
    customBoardStyle: {
      borderRadius: '5px',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    },
    animationDuration: 200,
    arePiecesDraggable: true,
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem',
      alignItems: 'center',
      padding: '2rem'
    }}>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>
        Mini Puzzles
      </h2>
      
      <div style={{
        fontSize: '1.2rem',
        fontWeight: 'bold',
        marginBottom: '1rem',
        textAlign: 'center'
      }}>
        White to move, checkmate in 2
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <button 
          onClick={resetPuzzle}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#4f46e5',
            color: 'white',
            border: 'none',
            borderRadius: '0.375rem',
            cursor: 'pointer',
            fontSize: '0.875rem',
            fontWeight: '500'
          }}
        >
          Reset Puzzle
        </button>
      </div>

      <Chessboard options={chessboardOptions} />

      <p style={{
        fontSize: '0.8rem',
        color: '#666',
        textAlign: 'center',
        maxWidth: '500px'
      }}>
        This is a mate in 2 puzzle. Only white pieces can be moved. 
        Try to find the correct sequence of moves to checkmate the black king.
      </p>
    </div>
  );
};

export default MiniPuzzles;
