import { Chessboard } from 'react-chessboard';

function MinimalChessboard() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-8 text-gray-800">
          React Chessboard
        </h1>
        
        <div className="bg-white p-8 rounded-lg shadow-lg">
          <Chessboard 
            options={{
              position: 'start',
              boardWidth: 400,
              showBoardNotation: true,
              customDarkSquareStyle: { backgroundColor: '#779556' },
              customLightSquareStyle: { backgroundColor: '#ebecd0' },
            }} 
          />
          
          <p className="mt-4 text-gray-600">
            Basic chessboard is working! 🎉
          </p>
        </div>
      </div>
    </div>
  );
}

export default MinimalChessboard;
