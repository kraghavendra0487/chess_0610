import { Chessboard } from 'react-chessboard';

function SimpleChess() {
  const chessboardOptions = {
    position: 'start',
    boardWidth: 600,
    showBoardNotation: true,
    customDarkSquareStyle: { backgroundColor: '#769656' },
    customLightSquareStyle: { backgroundColor: '#EEEED2' },
    customBoardStyle: {
      borderRadius: '8px',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
    },
    animationDuration: 300,
    arePiecesDraggable: true,
    onPieceDrop: ({ sourceSquare, targetSquare, piece }) => {
      console.log(`Move: ${sourceSquare} → ${targetSquare} (${piece.pieceType})`);
      return true;
    },
    onSquareClick: ({ square, piece }) => {
      console.log(`Clicked: ${square}`, piece ? `(${piece.pieceType})` : '(empty)');
    },
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-8 text-gray-800">
          Chess Game
        </h1>
        
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <Chessboard options={chessboardOptions} />
          
          <div className="mt-4 text-sm text-gray-600">
            <p>Drag pieces to move them • Click squares for interaction</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SimpleChess;
