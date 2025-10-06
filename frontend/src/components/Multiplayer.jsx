import React, { useState, useRef } from 'react';
import { Chessboard } from 'react-chessboard';
import { Chess } from 'chess.js';

const Multiplayer = () => {
  // Create a chess game using a ref to maintain the game state across renders
  const chessGameRef = useRef(new Chess());
  const chessGame = chessGameRef.current;

  // Track the current position of the chess game in state
  const [chessPosition, setChessPosition] = useState(chessGame.fen());
  const [gameStatus, setGameStatus] = useState('Game in progress');
  const [currentPlayer, setCurrentPlayer] = useState('White');

  // Handle piece drop
  const onPieceDrop = ({ sourceSquare, targetSquare }) => {
    // Type narrow targetSquare potentially being null
    if (!targetSquare) {
      return false;
    }

    // Try to make the move according to chess.js logic
    try {
      chessGame.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: 'q' // Always promote to a queen for example simplicity
      });

      // Update the position state upon successful move to trigger a re-render
      setChessPosition(chessGame.fen());

      // Update current player
      setCurrentPlayer(chessGame.turn() === 'w' ? 'White' : 'Black');

      // Check game status
      if (chessGame.isCheckmate()) {
        setGameStatus(`Checkmate! ${chessGame.turn() === 'w' ? 'Black' : 'White'} wins!`);
      } else if (chessGame.isDraw()) {
        setGameStatus('Draw!');
      } else if (chessGame.isCheck()) {
        setGameStatus(`Check! ${chessGame.turn() === 'w' ? 'White' : 'Black'} to move`);
      } else {
        setGameStatus('Game in progress');
      }

      // Return true as the move was successful
      return true;
    } catch {
      // Return false as the move was not successful
      return false;
    }
  };

  // Allow white to only drag white pieces
  const canDragPieceWhite = ({ piece }) => {
    return piece.pieceType[0] === 'w';
  };

  // Allow black to only drag black pieces
  const canDragPieceBlack = ({ piece }) => {
    return piece.pieceType[0] === 'b';
  };

  // Reset game function
  const resetGame = () => {
    chessGameRef.current = new Chess();
    setChessPosition(chessGameRef.current.fen());
    setGameStatus('Game in progress');
    setCurrentPlayer('White');
  };

  // Set the chessboard options for white's perspective
  const whiteBoardOptions = {
    canDragPiece: canDragPieceWhite,
    position: chessPosition,
    onPieceDrop,
    boardOrientation: 'white',
    id: 'multiplayer-white',
    boardWidth: 400,
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

  // Set the chessboard options for black's perspective
  const blackBoardOptions = {
    canDragPiece: canDragPieceBlack,
    position: chessPosition,
    onPieceDrop,
    boardOrientation: 'black',
    id: 'multiplayer-black',
    boardWidth: 400,
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
        Multiplayer Chess
      </h2>

      <div style={{
        display: 'flex',
        gap: '1rem',
        alignItems: 'center',
        marginBottom: '1rem'
      }}>
        <div style={{ fontSize: '1.1rem', fontWeight: '500' }}>
          Current Player: {currentPlayer}
        </div>
        <button 
          onClick={resetGame}
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
          Reset Game
        </button>
      </div>

      <div style={{
        fontSize: '1rem',
        fontWeight: '500',
        color: '#dc2626',
        marginBottom: '1rem',
        textAlign: 'center'
      }}>
        {gameStatus}
      </div>

      {/* Render both chessboards side by side with a gap */}
      <div style={{
        display: 'flex',
        gap: '20px',
        justifyContent: 'center',
        flexWrap: 'wrap',
        padding: '10px'
      }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{
            textAlign: 'center',
            marginBottom: '0.5rem',
            fontWeight: '500'
          }}>
            White's perspective
          </p>
          <div style={{ maxWidth: '400px' }}>
            <Chessboard options={whiteBoardOptions} />
          </div>
        </div>

        <div style={{ textAlign: 'center' }}>
          <p style={{
            textAlign: 'center',
            marginBottom: '0.5rem',
            fontWeight: '500'
          }}>
            Black's perspective
          </p>
          <div style={{ maxWidth: '400px' }}>
            <Chessboard options={blackBoardOptions} />
          </div>
        </div>
      </div>

      <p style={{
        fontSize: '0.8rem',
        color: '#666',
        textAlign: 'center',
        maxWidth: '600px'
      }}>
        This example demonstrates a multiplayer chess experience where each player can see 
        the board from their own perspective. In a real multiplayer game, the game state 
        would be synchronized over a network.
      </p>
    </div>
  );
};

export default Multiplayer;
