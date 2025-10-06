# Advanced React Chessboard Examples

This project demonstrates advanced features of React Chessboard with larger chess boards and sophisticated functionality.

## Features Implemented

### 1. Analysis Board
- **Stockfish Integration**: Real-time position analysis using Stockfish engine
- **Best Move Visualization**: Green arrows show the engine's recommended moves
- **Position Evaluation**: Displays centipawn evaluation and mate threats
- **Larger Board**: 600px width for better visibility

### 2. Mini Puzzles
- **Custom Board Size**: 4x6 board configuration for puzzle-specific layouts
- **Interactive Puzzles**: Mate in 2 puzzles with automatic opponent responses
- **Piece Restrictions**: Only allows valid moves for the puzzle solution
- **Reset Functionality**: Easy puzzle reset for multiple attempts

### 3. Multiplayer
- **Dual Perspectives**: Shows both White and Black board orientations
- **Turn-based Play**: Proper piece dragging restrictions based on current player
- **Game Status**: Real-time check, checkmate, and draw detection
- **Side-by-side Layout**: Both boards visible simultaneously

### 4. Premoves
- **Premove Functionality**: Make moves before opponent's turn
- **Visual Feedback**: Orange arrows indicate premove intentions
- **Premove History**: Track all executed premoves
- **Automatic Execution**: Premoves execute automatically after opponent moves

### 5. Promotion Piece Selection
- **Interactive Dialog**: Click-to-select promotion piece interface
- **Visual Piece Selection**: Unicode chess symbols with piece names
- **Positioned Overlay**: Dialog appears directly over the promotion square
- **Multiple Options**: Queen, Rook, Knight, and Bishop choices

## Technical Implementation

### Engine Integration
- **Backend API**: Python FastAPI server with Stockfish integration
- **Deterministic Analysis**: Consistent evaluations for reproducible results
- **Web Worker Alternative**: HTTP-based communication for engine analysis

### Board Customization
- **Larger Sizes**: All boards use 500-600px width for better visibility
- **Consistent Styling**: Unified color scheme and visual design
- **Responsive Design**: Flexible layouts that work on different screen sizes

### State Management
- **React Hooks**: useState and useRef for component state management
- **Chess.js Integration**: Proper game logic and move validation
- **Real-time Updates**: Immediate UI updates on position changes

## Getting Started

1. **Install Dependencies**:
   ```bash
   cd frontend
   npm install
   ```

2. **Start Python Backend** (for Analysis Board):
   ```bash
   cd python
   python main.py
   ```

3. **Start Frontend Development Server**:
   ```bash
   cd frontend
   npm run dev
   ```

4. **Navigate Examples**: Use the navigation buttons to switch between different examples

## Requirements

- Node.js 16+ for frontend
- Python 3.8+ with FastAPI for backend
- Stockfish executable for engine analysis
- Modern web browser with ES6+ support

## File Structure

```
frontend/src/components/
├── AnalysisBoard.jsx      # Stockfish analysis with larger board
├── MiniPuzzles.jsx       # Custom-sized puzzle board
├── Multiplayer.jsx       # Dual-perspective multiplayer
├── Premoves.jsx          # Premove functionality
├── PromotionSelection.jsx # Promotion piece selection
└── Engine.js             # Stockfish integration helper
```

## Key Features

- **Larger Chess Boards**: All examples use bigger board sizes (500-600px)
- **Advanced Interactions**: Premoves, promotion selection, analysis
- **Professional UI**: Clean, modern interface with proper styling
- **Real-time Analysis**: Live position evaluation and best move suggestions
- **Interactive Puzzles**: Engaging puzzle-solving experience
- **Multiplayer Ready**: Foundation for online chess implementation

Each example is self-contained and demonstrates specific advanced features while maintaining a consistent, professional appearance with larger, more visible chess boards.
