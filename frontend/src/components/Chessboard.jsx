import { Chessboard } from 'react-chessboard';

function ChessboardComponent() {
  const chessboardOptions = {
    position: 'start',
    boardWidth: 560,
    showBoardNotation: true,
    customDarkSquareStyle: { backgroundColor: '#779556' },
    customLightSquareStyle: { backgroundColor: '#ebecd0' },
    customBoardStyle: {
      borderRadius: '5px',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    },
    customPieces: {},
    animationDuration: 200,
    arePiecesDraggable: true,
    areArrowsAllowed: true,
    arePremovesAllowed: true,
    customArrowColor: '#7c3aed',
    onPieceDrop: (sourceSquare, targetSquare, piece) => {
      console.log('Piece moved from', sourceSquare, 'to', targetSquare);
      return true; // Allow the move
    },
    onSquareClick: (square) => {
      console.log('Square clicked:', square);
    },
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="p-8">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
          Chess Game
        </h1>
        <div className="flex justify-center">
          <Chessboard options={chessboardOptions} />
        </div>
      </div>
    </div>
  );
}

export default ChessboardComponent;
