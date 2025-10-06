import React, { useState, useRef, useEffect } from 'react';
import { Chessboard } from 'react-chessboard';
import { Chess } from 'chess.js';

const PromotionSelection = () => {
  // Create a chess game using a ref to always have access to the latest game state
  const chessGameRef = useRef(new Chess('8/P7/7K/8/8/8/8/k7 w - - 0 1'));
  const chessGame = chessGameRef.current;

  // Track the current position of the chess game in state to trigger a re-render
  const [chessPosition, setChessPosition] = useState(chessGame.fen());

  // Track the promotion move
  const [promotionMove, setPromotionMove] = useState(null);

  // Handle piece drop
  const onPieceDrop = ({ sourceSquare, targetSquare }) => {
    // Type narrow targetSquare potentially being null
    if (!targetSquare) {
      return false;
    }

    // Target square is a promotion square, check if valid and show promotion dialog
    if (targetSquare.match(/\d+$/)?.[0] === '8') {
      // Get all possible moves for the source square
      const possibleMoves = chessGame.moves({
        square: sourceSquare
      });

      // Check if target square is in possible moves (accounting for promotion notation)
      if (possibleMoves.some(move => move.startsWith(`${targetSquare}=`))) {
        setPromotionMove({
          sourceSquare,
          targetSquare
        });
      }

      // Return true so that the promotion move is not animated
      return true;
    }

    // Not a promotion square, try to make the move now
    try {
      chessGame.move({
        from: sourceSquare,
        to: targetSquare
      });

      // Update the game state
      setChessPosition(chessGame.fen());

      // Return true if the move was successful
      return true;
    } catch {
      // Return false if the move was not successful
      return false;
    }
  };

  // Handle promotion piece select
  const onPromotionPieceSelect = (piece) => {
    try {
      chessGame.move({
        from: promotionMove.sourceSquare,
        to: promotionMove.targetSquare,
        promotion: piece
      });

      // Update the game state
      setChessPosition(chessGame.fen());
    } catch {
      // Do nothing
    }

    // Reset the promotion move to clear the promotion dialog
    setPromotionMove(null);
  };

  // Reset position function
  const resetPosition = () => {
    chessGameRef.current = new Chess('8/P7/7K/8/8/8/8/k7 w - - 0 1');
    setChessPosition(chessGameRef.current.fen());
    setPromotionMove(null);
  };

  // Calculate the left position of the promotion square
  const [promotionSquareLeft, setPromotionSquareLeft] = useState(0);
  const [squareWidth, setSquareWidth] = useState(0);

  useEffect(() => {
    if (promotionMove?.targetSquare) {
      const squareElement = document.querySelector(`[data-column="${promotionMove.targetSquare.charAt(0)}"][data-row="8"]`);
      if (squareElement) {
        const rect = squareElement.getBoundingClientRect();
        setSquareWidth(rect.width);
        
        // Calculate position based on column
        const columnIndex = promotionMove.targetSquare.charCodeAt(0) - 97; // 'a' = 97
        setPromotionSquareLeft(columnIndex * rect.width);
      }
    }
  }, [promotionMove]);

  // Set the chessboard options
  const chessboardOptions = {
    position: chessPosition,
    onPieceDrop,
    id: 'piece-promotion',
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

  // Promotion piece options
  const promotionPieces = [
    { symbol: 'q', name: 'Queen', unicode: '♕' },
    { symbol: 'r', name: 'Rook', unicode: '♖' },
    { symbol: 'n', name: 'Knight', unicode: '♘' },
    { symbol: 'b', name: 'Bishop', unicode: '♗' }
  ];

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem',
      alignItems: 'center',
      padding: '2rem'
    }}>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>
        Promotion Piece Selection
      </h2>

      <button 
        onClick={resetPosition}
        style={{
          padding: '0.5rem 1rem',
          backgroundColor: '#4f46e5',
          color: 'white',
          border: 'none',
          borderRadius: '0.375rem',
          cursor: 'pointer',
          fontSize: '0.875rem',
          fontWeight: '500',
          marginBottom: '1rem'
        }}
      >
        Reset Position
      </button>

      <div style={{ position: 'relative' }}>
        {/* Overlay for promotion dialog */}
        {promotionMove && (
          <div 
            onClick={() => setPromotionMove(null)}
            onContextMenu={(e) => {
              e.preventDefault();
              setPromotionMove(null);
            }}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.1)',
              zIndex: 1000
            }}
          />
        )}

        {/* Promotion piece selection dialog */}
        {promotionMove && (
          <div style={{
            position: 'absolute',
            top: 0,
            left: promotionSquareLeft,
            backgroundColor: 'white',
            width: squareWidth,
            zIndex: 1001,
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 0 10px 0 rgba(0, 0, 0, 0.5)',
            borderRadius: '0.25rem',
            overflow: 'hidden'
          }}>
            {promotionPieces.map(piece => (
              <button 
                key={piece.symbol} 
                onClick={() => onPromotionPieceSelect(piece.symbol)}
                onContextMenu={(e) => {
                  e.preventDefault();
                }}
                style={{
                  width: '100%',
                  aspectRatio: '1',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '0.5rem',
                  border: 'none',
                  cursor: 'pointer',
                  backgroundColor: 'white',
                  borderBottom: '1px solid #e5e7eb',
                  fontSize: '1.5rem',
                  fontWeight: 'bold'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#f3f4f6';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'white';
                }}
              >
                <div style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>
                  {piece.unicode}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#666' }}>
                  {piece.name}
                </div>
              </button>
            ))}
          </div>
        )}

        <Chessboard options={chessboardOptions} />
      </div>

      <p style={{
        fontSize: '0.8rem',
        color: '#666',
        textAlign: 'center',
        maxWidth: '500px'
      }}>
        Move the white pawn to the 8th rank to trigger the promotion dialog. 
        Click the reset button to return to the initial position.
      </p>
    </div>
  );
};

export default PromotionSelection;
