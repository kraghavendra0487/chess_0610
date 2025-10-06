import React, { useState, useRef } from 'react';
import { Chessboard } from 'react-chessboard';
import { Chess } from 'chess.js';

const Premoves = () => {
  // Create a chess game using a ref to maintain the game state across renders
  const chessGameRef = useRef(new Chess());
  const chessGame = chessGameRef.current;

  // Track the current position of the chess game in state
  const [chessPosition, setChessPosition] = useState(chessGame.fen());
  const [premove, setPremove] = useState(null);
  const [premoveHistory, setPremoveHistory] = useState([]);
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

      // Check if there was a premove waiting
      if (premove) {
        // Execute the premove
        setTimeout(() => {
          try {
            chessGame.move({
              from: premove.sourceSquare,
              to: premove.targetSquare,
              promotion: 'q'
            });
            setChessPosition(chessGame.fen());
            setCurrentPlayer(chessGame.turn() === 'w' ? 'White' : 'Black');
            
            // Add to premove history
            setPremoveHistory(prev => [...prev, {
              move: `${premove.sourceSquare}-${premove.targetSquare}`,
              player: chessGame.turn() === 'w' ? 'Black' : 'White'
            }]);
            
            setPremove(null);
          } catch (error) {
            console.log('Premove was invalid:', error);
            setPremove(null);
          }
        }, 500);
      }

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

  // Handle premove
  const onPremove = ({ sourceSquare, targetSquare }) => {
    setPremove({ sourceSquare, targetSquare });
    return true;
  };

  // Allow pieces to be dragged based on current turn
  const canDragPiece = ({ piece }) => {
    const isWhitePiece = piece.pieceType[0] === 'w';
    const isWhiteTurn = chessGame.turn() === 'w';
    return isWhitePiece === isWhiteTurn;
  };

  // Reset game function
  const resetGame = () => {
    chessGameRef.current = new Chess();
    setChessPosition(chessGameRef.current.fen());
    setGameStatus('Game in progress');
    setCurrentPlayer('White');
    setPremove(null);
    setPremoveHistory([]);
  };

  // Clear premove function
  const clearPremove = () => {
    setPremove(null);
  };

  // Set the chessboard options
  const chessboardOptions = {
    canDragPiece,
    position: chessPosition,
    onPieceDrop,
    onPremove,
    id: 'premoves-board',
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
    arePremovesAllowed: true,
    customPremoveArrowColor: '#f59e0b',
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
        Premoves
      </h2>

      <div style={{
        display: 'flex',
        gap: '1rem',
        alignItems: 'center',
        marginBottom: '1rem',
        flexWrap: 'wrap',
        justifyContent: 'center'
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
        {premove && (
          <button 
            onClick={clearPremove}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#dc2626',
              color: 'white',
              border: 'none',
              borderRadius: '0.375rem',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: '500'
            }}
          >
            Clear Premove
          </button>
        )}
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

      {premove && (
        <div style={{
          padding: '0.5rem 1rem',
          backgroundColor: '#fef3c7',
          border: '1px solid #f59e0b',
          borderRadius: '0.375rem',
          marginBottom: '1rem'
        }}>
          <strong>Premove set:</strong> {premove.sourceSquare} → {premove.targetSquare}
        </div>
      )}

      <Chessboard options={chessboardOptions} />

      {premoveHistory.length > 0 && (
        <div style={{
          marginTop: '1rem',
          padding: '1rem',
          backgroundColor: '#f9fafb',
          borderRadius: '0.375rem',
          border: '1px solid #e5e7eb',
          minWidth: '300px'
        }}>
          <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '0.5rem' }}>
            Premove History:
          </h3>
          {premoveHistory.map((item, index) => (
            <div key={index} style={{ fontSize: '0.875rem', marginBottom: '0.25rem' }}>
              {item.player}: {item.move}
            </div>
          ))}
        </div>
      )}

      <p style={{
        fontSize: '0.8rem',
        color: '#666',
        textAlign: 'center',
        maxWidth: '500px'
      }}>
        Premoves allow you to make a move before your opponent moves. 
        The move will be executed automatically after your opponent's move. 
        Try making a premove by dragging a piece when it's not your turn!
      </p>
    </div>
  );
};

export default Premoves;
