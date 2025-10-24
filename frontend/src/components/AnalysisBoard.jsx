import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Chessboard } from 'react-chessboard';
import { Chess } from 'chess.js';
import Engine from './Engine';
import {
  Box,
  Text,
  VStack,
  Button,
  HStack,
  Divider,
  useColorModeValue,
  Flex,
  Spinner,
  Textarea,
  Input,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  IconButton,
  Switch,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
} from '@chakra-ui/react';
import { ChevronLeftIcon, ChevronRightIcon, ChevronLeftIcon as FirstIcon, ChevronRightIcon as LastIcon } from '@chakra-ui/icons';

const AnalysisBoard = () => {
  // Initialize the engine
  const engine = useMemo(() => new Engine(), []);

  // Create a chess game using a ref to always have access to the latest game state
  const chessGameRef = useRef(new Chess());
  const chessGame = chessGameRef.current;

  // Track the current position of the chess game in state to trigger a re-render
  const [chessPosition, setChessPosition] = useState(chessGame.fen());
  const [moveHistory, setMoveHistory] = useState([]);
  const [allMoves, setAllMoves] = useState([]); // All moves from loaded PGN
  const [currentMoveIndex, setCurrentMoveIndex] = useState(-1); // Current position in the game
  const [forwardMoves, setForwardMoves] = useState([]); // Forward moves for navigation
  const [selectedSquare, setSelectedSquare] = useState(null);
  const [highlightedSquares, setHighlightedSquares] = useState([]);
  const [lastMove, setLastMove] = useState({ from: null, to: null });
  const [isGameLoading, setIsGameLoading] = useState(false);
  const [pgnText, setPgnText] = useState('');
  const [gameInfo, setGameInfo] = useState({});
  
  // Modal for PGN input
  const { isOpen, onOpen, onClose } = useDisclosure();

  // Store engine variables
  const [positionEvaluation, setPositionEvaluation] = useState(0);
  const [depth, setDepth] = useState(10);
  const [bestLine, setBestLine] = useState('');
  const [possibleMate, setPossibleMate] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  // Bulk analysis state
  const [bulkAnalysisResults, setBulkAnalysisResults] = useState({});
  const [isBulkAnalyzing, setIsBulkAnalyzing] = useState(false);
  const [bulkAnalysisProgress, setBulkAnalysisProgress] = useState(0);
  const [useBulkResults, setUseBulkResults] = useState(false);
  const [lastEvaluation, setLastEvaluation] = useState(0);
  
  

  // UI Styling Values (matching ChessGame)
  const boardContainerBg = useColorModeValue("white", "gray.700");
  const historyBg = useColorModeValue("white", "gray.700");
  const scrollbarTrackBg = useColorModeValue("gray.100", "gray.600");
  const scrollbarThumbBg = useColorModeValue("gray.400", "gray.400");
  const scrollbarThumbHoverBg = useColorModeValue("gray.500", "gray.300");
  const boardBorderColor = useColorModeValue("gray.300", "gray.600");
  const historyBorderColor = useColorModeValue("gray.200", "gray.600");
  const statusTextColor = useColorModeValue("gray.800", "gray.50");
  const controlsTextColor = useColorModeValue("gray.700", "gray.200");
  const historyTextColor = useColorModeValue("gray.500", "gray.400");
  const historyMoveNumColor = useColorModeValue("gray.600", "gray.400");
  const lastMoveColor = useColorModeValue('black','white');
  const defaultMoveColor = useColorModeValue("gray.700", "gray.300");
  const customDarkSquareStyle = useColorModeValue( { backgroundColor: '#A98A6E' }, { backgroundColor: '#6E5B4B' } );
  const customLightSquareStyle = useColorModeValue( { backgroundColor: '#F2E1CD' }, { backgroundColor: '#B3A18F' } );
  const selectedSquareColor = useColorModeValue( "rgba(34, 139, 34, 0.5)", "rgba(46, 160, 67, 0.5)" );
  const legalMoveDotColor = useColorModeValue( "rgba(0, 0, 0, 0.2)", "rgba(255, 255, 255, 0.25)" );
  const captureSquareColor = useColorModeValue( "rgba(255, 99, 71, 0.4)", "rgba(255, 127, 80, 0.45)" );
  const checkHighlightColor = useColorModeValue( "rgba(220, 20, 60, 0.7)", "rgba(255, 69, 0, 0.7)" );
  const lastMoveHighlightColor = useColorModeValue( "rgba(144, 238, 144, 0.35)", "rgba(144, 238, 144, 0.3)" );
  
  // Additional useColorModeValue hooks for render function
  const additionalTextColor = useColorModeValue("gray.600", "gray.300");
  const gameInfoBg = useColorModeValue("gray.50", "gray.700");
  const gameInfoBorder = useColorModeValue("gray.200", "gray.600");
  const loadingBg = useColorModeValue("gray.50", "gray.700");
  const moveItemBg = useColorModeValue("gray.50", "gray.700");
  const moveItemHover = useColorModeValue("gray.100", "gray.600");
  const blueCurrent = useColorModeValue("blue.200", "blue.700");
  const blueCurrentHover = useColorModeValue("blue.300", "blue.600");
  const grayHover = useColorModeValue("gray.200", "gray.600");
  const analysisBoxBg = useColorModeValue("gray.50", "gray.700");
  const greenMoveBg = useColorModeValue("green.100", "green.700");
  const blueMoveBg = useColorModeValue("blue.100", "blue.700");
  const whiteMoveBg = useColorModeValue("white", "gray.600");
  const greenMoveBorder = useColorModeValue("green.300", "green.500");
  const blueMoveBorder = useColorModeValue("blue.300", "blue.500");
  const grayMoveBorder = useColorModeValue("gray.200", "gray.500");
  const greenMoveHover = useColorModeValue("green.200", "green.600");
  const blueMoveHover = useColorModeValue("blue.200", "blue.600");
  const grayMoveHover = useColorModeValue("gray.100", "gray.500");
  const greenMoveText = useColorModeValue("green.700", "green.100");
  const blueMoveText = useColorModeValue("blue.700", "blue.100");
  const blueBadge = useColorModeValue("blue.600", "blue.300");
  const greenBadge = useColorModeValue("green.600", "green.300");
  const modalTextColor = useColorModeValue("gray.600", "gray.300");
  const modalExampleColor = useColorModeValue("gray.500", "gray.400");
  
  const [boardWidth, setBoardWidth] = useState(420);
  const movePanelWidth = 256;
  const movePanelHeight = Math.round(boardWidth * 1.15);
  const moveHistoryHeight = Math.round(boardWidth * 0.75);

  // Refs
  const moveHistoryRef = useRef(null);

  // Initialize engine on component mount
  useEffect(() => {
    engine.init();
  }, [engine]);

  // PGN Parsing Functions
  const parsePGN = useCallback((pgnString) => {
    try {
      const lines = pgnString.split('\n');
      let gameInfo = {};
      let movesText = '';
      
      // Parse headers
      for (const line of lines) {
        if (line.startsWith('[') && line.endsWith(']')) {
          const match = line.match(/\[(\w+)\s+"([^"]*)"\]/);
          if (match) {
            gameInfo[match[1]] = match[2];
          }
        } else if (line.trim() && !line.startsWith('[')) {
          movesText += line + ' ';
        }
      }
      
      // Parse moves
      const moves = movesText.trim().split(/\s+/).filter(move => {
        // Skip empty moves
        if (!move) return false;
        
        // Skip move numbers (e.g., "1.", "2.", etc.)
        if (move.match(/^\d+\.$/)) return false;
        
        // Skip game results
        if (move === '1-0' || move === '0-1' || move === '1/2-1/2') return false;
        
        // Skip moves that contain game results with metadata (e.g., "0-1[Event")
        if (move.match(/^\d-\d/) || move.match(/^1\/2-1\/2/)) return false;
        
        // Skip moves that start with brackets (metadata)
        if (move.startsWith('[') || move.startsWith('"')) return false;
        
        // Skip moves that end with brackets (metadata)
        if (move.endsWith(']') || move.endsWith('"')) return false;
        
        // Only include valid chess moves (basic validation)
        return move.match(/^[KQRBNP]?[a-h]?[1-8]?x?[a-h][1-8](=[QRBN])?[+#]?$|^O-O(-O)?[+#]?$/);
      });
      
      return { gameInfo, moves };
    } catch (error) {
      console.error('Error parsing PGN:', error);
      return { gameInfo: {}, moves: [] };
    }
  }, []);

  const loadPGN = useCallback((pgnString) => {
    const { gameInfo, moves } = parsePGN(pgnString);
    
    if (moves.length === 0) {
      alert('No valid moves found in PGN');
      return;
    }
    
    setGameInfo(gameInfo);
    setAllMoves(moves);
    setCurrentMoveIndex(-1);
    
    // Reset to starting position
    const newGame = new Chess();
    chessGameRef.current = newGame;
    setChessPosition(newGame.fen());
    setMoveHistory([]);
    setSelectedSquare(null);
    setHighlightedSquares([]);
    setLastMove({ from: null, to: null });
    setIsAnalyzing(false);
    setBestLine('');
    setPossibleMate('');
    setPositionEvaluation(0);
    setDepth(10);
    setBulkAnalysisResults({});
    setIsBulkAnalyzing(false);
    setBulkAnalysisProgress(0);
    
    onClose();
  }, [parsePGN, onClose]);

  // Move Navigation Functions
  const goToMove = useCallback((index) => {
    if (index < -1 || index >= allMoves.length) return;
    
    const newGame = new Chess();
    const movesToApply = allMoves.slice(0, index + 1);
    
    try {
      let lastMoveResult = null;
      movesToApply.forEach(move => {
        lastMoveResult = newGame.move(move);
      });
      
      chessGameRef.current = newGame;
      setChessPosition(newGame.fen());
      setMoveHistory(movesToApply);
      setCurrentMoveIndex(index);
      setSelectedSquare(null);
      setHighlightedSquares([]);
      setIsAnalyzing(false);
      setBestLine('');
      
      // Track the last move when navigating
      if (lastMoveResult) {
        setLastMove({ from: lastMoveResult.from, to: lastMoveResult.to });
      } else {
        setLastMove({ from: null, to: null });
      }
    } catch (error) {
      console.error('Error applying moves:', error);
    }
  }, [allMoves]);

  // Click on specific move to jump to that position
  const goToMoveByIndex = useCallback((moveIndex) => {
    goToMove(moveIndex);
  }, [goToMove]);

  const goToFirstMove = useCallback(() => goToMove(-1), [goToMove]);
  const goToPreviousMove = useCallback(() => goToMove(currentMoveIndex - 1), [goToMove, currentMoveIndex]);
  const goToNextMove = useCallback(() => goToMove(currentMoveIndex + 1), [goToMove, currentMoveIndex]);
  const goToLastMove = useCallback(() => goToMove(allMoves.length - 1), [goToMove, allMoves.length]);

  // Keyboard navigation for move control
  useEffect(() => {
    const handleKeyPress = (event) => {
      // Only handle arrow keys when not typing in input fields
      if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
        return;
      }

      switch (event.key) {
        case 'ArrowLeft':
          event.preventDefault();
          goToPreviousMove();
          break;
        case 'ArrowRight':
          event.preventDefault();
          goToNextMove();
          break;
        default:
          break;
      }
    };

    // Add event listener
    window.addEventListener('keydown', handleKeyPress);

    // Cleanup
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [goToPreviousMove, goToNextMove]);

  // Window Resize Effect (matching ChessGame)
  const [windowSize, setWindowSize] = useState({ innerWidth: window.innerWidth, innerHeight: window.innerHeight});
  useEffect(() => {
     const handleResize = () => {
        const newSize = {
            innerWidth: window.innerWidth,
            innerHeight: window.innerHeight,
        };
        setWindowSize(newSize);

        if (newSize.innerWidth < 992) {
            const padding = 48;
            setBoardWidth(newSize.innerWidth - padding);
        } else {
            let bw = newSize.innerWidth / 2;
            while (bw > newSize.innerHeight / 1.4 ){
                  bw = bw - 20;
            }
            setBoardWidth(bw);
        }
    };
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => { window.removeEventListener("resize", handleResize); };
  }, []);

  // When the chess game position changes, find the best move
  useEffect(() => {
    if (!chessGame.isGameOver() && !chessGame.isDraw()) {
      // Only run individual analysis if bulk results are not available
      if (Object.keys(bulkAnalysisResults).length === 0) {
        findBestMove();
      }
    }
  }, [chessPosition, bulkAnalysisResults]);

  // Find the best move
  const findBestMove = async () => {
    if (!engine.isEngineReady()) return;
    
    setIsAnalyzing(true);
    setBestLine('');
    
    try {
      await engine.evaluatePosition(chessGame.fen(), 10);
      
      engine.onMessage(({ positionEvaluation, possibleMate, pv, depth }) => {
        if (depth && depth < 10) {
          return;
        }

        if (positionEvaluation !== undefined) {
          setPositionEvaluation(Number(positionEvaluation));
          setLastEvaluation(Number(positionEvaluation));
        }

        if (possibleMate !== undefined) {
          setPossibleMate(possibleMate);
        }
        if (depth) {
          setDepth(depth);
        }
        if (pv) {
          setBestLine(pv);
          console.log('⚡ Individual analysis - pv (bestLine):', pv);
        }
        
        setIsAnalyzing(false);
      });
    } catch (error) {
      console.error('Analysis failed:', error);
      setIsAnalyzing(false);
    }
  };

  // Bulk analysis function - now sends entire PGN to backend for processing
  const performBulkAnalysis = useCallback(async () => {
    if (allMoves.length === 0) return;
    
    setIsBulkAnalyzing(true);
    setBulkAnalysisProgress(0);
    setBulkAnalysisResults({});
    
    try {
      // Create PGN string from loaded game
      const pgnString = createPGNString();
      
      console.log('🚀 Starting bulk PGN analysis...');
      console.log(`📊 Analyzing ${allMoves.length + 1} positions`);
      
      // Send PGN to backend for bulk analysis
      const response = await fetch('http://localhost:5000/analyze-pgn', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pgn: pgnString,
          depth: 10,
          useMultiWorker: true
        })
      });

      if (!response.ok) {
        throw new Error(`Backend analysis failed: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        console.log(`✅ Bulk analysis complete: ${result.total_positions} positions in ${result.analysis_time}s`);
        console.log(`📈 Speed: ${result.positions_per_second} positions/second`);
        
        // Convert backend results to frontend format
        const analysisResults = {};
        Object.keys(result.results).forEach(moveKey => {
          const analysis = result.results[moveKey];
          if (analysis.success) {
            console.log(`📊 Position ${moveKey} - best_move from previous:`, analysis.best_move);
            console.log(`📊 Position ${moveKey} - evaluation:`, analysis.evaluation);
            analysisResults[analysis.fen] = {
              evaluation: analysis.evaluation || 0, // Raw centipawn values from backend
              depth: analysis.depth || 10,
              bestLine: analysis.best_move || '',
              mate: '', // No separate mate handling needed
              movePlayed: analysis.move_played || null, // Track which move was actually played
              movePlayedEvaluation: analysis.move_played_evaluation || null, // Evaluation of move played
              bestMoveEvaluation: analysis.best_move_evaluation || null // Evaluation of best move
            };
          }
        });
        
        setBulkAnalysisResults(analysisResults);
        setBulkAnalysisProgress(result.total_positions);
        setUseBulkResults(true); // Enable showing bulk results after completion
      } else {
        throw new Error(result.error || 'Bulk analysis failed');
      }
      
    } catch (error) {
      console.error('❌ Bulk analysis failed:', error);
      alert(`Bulk analysis failed: ${error.message}`);
    } finally {
      setIsBulkAnalyzing(false);
    }
  }, [allMoves, gameInfo]);

  // Helper function to create PGN string from loaded game
  const createPGNString = useCallback(() => {
    const headers = [];
    Object.keys(gameInfo).forEach(key => {
      headers.push(`[${key} "${gameInfo[key]}"]`);
    });
    
    // Add default headers if missing
    if (!gameInfo.Event) headers.push('[Event "Analysis Game"]');
    if (!gameInfo.Site) headers.push('[Site "Chess Analysis"]');
    if (!gameInfo.Date) headers.push(`[Date "${new Date().toISOString().split('T')[0]}"]`);
    if (!gameInfo.Round) headers.push('[Round "1"]');
    if (!gameInfo.White) headers.push('[White "Analysis"]');
    if (!gameInfo.Black) headers.push('[Black "Analysis"]');
    if (!gameInfo.Result) headers.push('[Result "*"]');
    
    // Format moves with move numbers
    let movesText = '';
    for (let i = 0; i < allMoves.length; i++) {
      if (i % 2 === 0) {
        movesText += `${Math.floor(i / 2) + 1}. `;
      }
      movesText += `${allMoves[i]} `;
    }
    
    return headers.join('\n') + '\n\n' + movesText.trim();
  }, [allMoves, gameInfo]);

  // Display bulk analysis results when position changes (always use bulk results when available)
  useEffect(() => {
    if (Object.keys(bulkAnalysisResults).length > 0) {
      const currentFen = chessGame.fen();
      const analysis = bulkAnalysisResults[currentFen];
      
      if (analysis) {
        setPositionEvaluation(analysis.evaluation);
        setLastEvaluation(analysis.evaluation);
        setDepth(analysis.depth);
        setBestLine(analysis.bestLine);
        setPossibleMate(analysis.mate || '');
        console.log('🔄 Using bulk analysis - bestLine:', analysis.bestLine);
      }
    }
  }, [chessPosition, bulkAnalysisResults, chessGame]);



  // Helper Functions (matching ChessGame)
  const findKingSquareFn = (gameInstance) => {
    if (!gameInstance) return null;
    const board = gameInstance.board();
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = board[r][c];
        if (piece && piece.type === "k" && piece.color === gameInstance.turn()) {
          return "abcdefgh"[c] + (8 - r);
        }
      }
    }
    return null;
  };

  const checkIsPromotionFn = (gameInstance, from, to) => {
    if (!from || !to || !gameInstance) return false;
    const piece = gameInstance.get(from);
    if (!piece || piece.type !== 'p') return false;
    const targetRank = to[1];
    const promotionRank = (piece.color === 'w') ? '8' : '1';
    if (targetRank !== promotionRank) return false;
    const moves = gameInstance.moves({ square: from, verbose: true });
    return moves.some(m => m.to === to && (m.flags.includes('p') || m.promotion));
  };

  const checkIsPromotion = useCallback((from, to) => checkIsPromotionFn(chessGame, from, to), [chessGame]);

  // Make move function (matching ChessGame)
  const makeMove = useCallback((move) => {
    if (!chessGame) return false;
    let moveResult = null;
    let success = false;
    const tempGame = new Chess(chessGame.fen());

    try {
      moveResult = tempGame.move(move);
    } catch (e) {
      moveResult = null;
    }

    if (moveResult) {
      chessGameRef.current = tempGame;
      setChessPosition(tempGame.fen());
      setMoveHistory((prev) => [...prev, moveResult.san]);
      setForwardMoves([]);
      setPossibleMate('');
      engine.stop();
      setBestLine('');
      success = true;
      
      // Track the last move for highlighting
      setLastMove({ from: moveResult.from, to: moveResult.to });
    }

    setSelectedSquare(null);
    setHighlightedSquares([]);
    return success;
  }, [chessGame, engine]);

  // react-chessboard Callbacks (matching ChessGame)
  const isDraggablePiece = useCallback(({ piece }) => {
     if (!chessGame || chessGame.isGameOver() || isGameLoading) return false;
    return chessGame.turn() === piece[0];
  }, [chessGame, isGameLoading]);

  const onPieceDrop = useCallback((sourceSquare, targetSquare, pieceString) => {
     if (!chessGame || isGameLoading || chessGame.isGameOver()) return false;
    const pieceColor = pieceString[0];
    if (chessGame.turn() !== pieceColor) return false;
    const isPromo = checkIsPromotion(sourceSquare, targetSquare);
    if (isPromo) return true;
    else return makeMove({ from: sourceSquare, to: targetSquare, promotion: 'q' });
  }, [chessGame, checkIsPromotion, makeMove, isGameLoading]);

  const onSquareClick = useCallback((square) => {
     if (!chessGame || chessGame.isGameOver() || isGameLoading) return;

    if (!selectedSquare) {
        const piece = chessGame.get(square);
        if (piece && piece.color === chessGame.turn()) {
            const moves = chessGame.moves({ square: square, verbose: true });
            if (moves.length > 0) { setSelectedSquare(square); setHighlightedSquares(moves.map((m) => m.to)); }
        }
    } else {
        if (square === selectedSquare) { setSelectedSquare(null); setHighlightedSquares([]); return; }
        if (highlightedSquares.includes(square)) {
            const isPromo = checkIsPromotion(selectedSquare, square);
            if (isPromo) {
                makeMove({ from: selectedSquare, to: square, promotion: 'q' });
            } else { makeMove({ from: selectedSquare, to: square, promotion: 'q' }); }
        } else {
            const piece = chessGame.get(square);
            if (piece && piece.color === chessGame.turn()) {
                const moves = chessGame.moves({ square: square, verbose: true });
                if (moves.length > 0) { setSelectedSquare(square); setHighlightedSquares(moves.map((m) => m.to)); }
                else { setSelectedSquare(null); setHighlightedSquares([]); }
            } else { setSelectedSquare(null); setHighlightedSquares([]); }
        }
    }
  }, [chessGame, selectedSquare, highlightedSquares, checkIsPromotion, makeMove, isGameLoading]);

  // Control Button Functions
  const resetGame = useCallback(() => {
    const newGame = new Chess();
    chessGameRef.current = newGame;
    setChessPosition(newGame.fen());
    setMoveHistory([]);
    setAllMoves([]);
    setCurrentMoveIndex(-1);
    setIsAnalyzing(false);
    setBestLine('');
    setPossibleMate('');
    setPositionEvaluation(0);
    setDepth(10);
    setGameInfo({});
    setBulkAnalysisResults({});
    setIsBulkAnalyzing(false);
    setBulkAnalysisProgress(0);
    setLastMove({ from: null, to: null });
  }, []);

  // Auto-scroll & Style Functions (matching ChessGame)
  useEffect(() => {
    if (moveHistoryRef.current) { moveHistoryRef.current.scrollTop = moveHistoryRef.current.scrollHeight; }
  }, [moveHistory]);

  const getCustomSquareStyles = useCallback(() => {
    const styles = {}; 
    if (!chessGame) return styles; 
    const kingSquare = findKingSquareFn(chessGame); 
    const isInCheck = chessGame.inCheck();
    
    // Highlight last move squares
    if (lastMove.from) {
      styles[lastMove.from] = { backgroundColor: lastMoveHighlightColor };
    }
    if (lastMove.to) {
      styles[lastMove.to] = { backgroundColor: lastMoveHighlightColor };
    }
    
    highlightedSquares.forEach((sq) => { 
      const pieceOnTarget = chessGame.get(sq); 
      if (pieceOnTarget && pieceOnTarget.color !== chessGame.turn()) { 
        styles[sq] = { backgroundColor: captureSquareColor }; 
      } else { 
        styles[sq] = { background: `radial-gradient(circle, ${legalMoveDotColor} 25%, transparent 30%)` }; 
      } 
    });
    if (selectedSquare) { styles[selectedSquare] = { backgroundColor: selectedSquareColor }; }
    if (isInCheck && kingSquare) { styles[kingSquare] = { backgroundColor: checkHighlightColor }; } 
    return styles;
  }, [ chessGame, selectedSquare, highlightedSquares, lastMove, selectedSquareColor, legalMoveDotColor, captureSquareColor, checkHighlightColor, lastMoveHighlightColor ]);

  // Get the best move for arrows
  const bestMove = bestLine?.split(' ')?.[0];
  
  // Debug logging
  if (bestLine) {
    console.log('📍 Best Line:', bestLine);
    console.log('🎯 Best Move for arrow:', bestMove);
  }
  
  const customArrows = bestMove && bestMove.length >= 4 ? [
    [bestMove.substring(0, 2), bestMove.substring(2, 4), 'rgb(77, 166, 77)']
  ] : [];
  
  if (customArrows.length > 0) {
    console.log('➡️ Custom Arrows:', customArrows);
  }

  // Format evaluation display
  const formatEvaluation = () => {
    const currentEval = getCurrentEvaluation();
    
    // Check if it's a mate evaluation (backend converts mates to large centipawn values)
    // Use a higher threshold to distinguish between very bad positions and actual mates
    if (Math.abs(currentEval) > 9500) {
      // Convert back to mate distance for display
      if (currentEval > 0) {
        const mateDistance = 10000 - currentEval;
        return `#${mateDistance}`;
      } else {
        const mateDistance = Math.abs(-10000 - currentEval);
        return `#${mateDistance}`;
      }
    }
    
    return (currentEval / 100).toFixed(2);
  };

  // Unified evaluation functions - all components use the same source
  const getCurrentEvaluation = () => {
    // Priority: bulk analysis results > individual analysis > last evaluation
    if (Object.keys(bulkAnalysisResults).length > 0) {
      const currentFen = chessGame.fen();
      const analysis = bulkAnalysisResults[currentFen];
      if (analysis) {
        return analysis.evaluation; // Raw centipawn values from bulk analysis
      }
    }
    
    // Fallback to individual analysis
    if (positionEvaluation !== 0) {
      return positionEvaluation;
    }
    
    // Final fallback
    return lastEvaluation;
  };

  const getCurrentMateEvaluation = () => {
    // Priority: bulk analysis results > individual analysis
    if (Object.keys(bulkAnalysisResults).length > 0) {
      const currentFen = chessGame.fen();
      const analysis = bulkAnalysisResults[currentFen];
      if (analysis && analysis.mate) {
        return analysis.mate;
      }
    }
    
    // Fallback to individual analysis
    return possibleMate;
  };

  // Evaluation bar functions
  const getEvaluationBarValue = () => {
    const currentEval = getCurrentEvaluation();
    
    // Check if it's a mate evaluation (backend converts mates to large centipawn values)
    // Use a higher threshold to distinguish between very bad positions and actual mates
    if (Math.abs(currentEval) > 9500) {
      // For mate positions, show extreme values
      return currentEval > 0 ? 10 : -10;
    }
    
    // Convert centipawns to bar scale and clamp to -10 to +10 range
    const evalInPawns = currentEval / 100;
    return Math.max(-10, Math.min(10, evalInPawns));
  };

  const getEvaluationBarColor = () => {
    // Always return white color for the fill
    return '#FFFFFF';
  };


  // Evaluation graph functions
  const getEvaluationData = () => {
    if (Object.keys(bulkAnalysisResults).length === 0) {
      return [];
    }

    // Create evaluations array in move order by reconstructing the game
    const evaluations = [];
    
    // Start with starting position
    const startingGame = new Chess();
    const startingFen = startingGame.fen();
    const startingAnalysis = bulkAnalysisResults[startingFen];
    if (startingAnalysis) {
      // Always use the raw evaluation divided by 100 for the graph
      // The backend already handles mate conversion properly
      console.log(`Graph - Starting Position: evaluation=${startingAnalysis.evaluation}, divided=${startingAnalysis.evaluation / 100}`);
      evaluations.push(startingAnalysis.evaluation / 100);
    }
    
    // Add evaluations for each move in sequence
    for (let i = 0; i < allMoves.length; i++) {
      const tempGame = new Chess();
      const movesToApply = allMoves.slice(0, i + 1);
      
      try {
        movesToApply.forEach(move => {
          tempGame.move(move);
        });
        
        const currentFen = tempGame.fen();
        const analysis = bulkAnalysisResults[currentFen];
        if (analysis) {
          // Always use the raw evaluation divided by 100 for the graph
          // The backend already handles mate conversion properly
          console.log(`Graph - Position ${i + 1}: evaluation=${analysis.evaluation}, divided=${analysis.evaluation / 100}`);
          evaluations.push(analysis.evaluation / 100);
        } else {
          // Fallback if analysis not found
          console.log(`Graph - Position ${i + 1}: No analysis found, using 0`);
          evaluations.push(0);
        }
      } catch (error) {
        console.error('Error reconstructing position for evaluation graph:', error);
        evaluations.push(0);
      }
    }

    return evaluations;
  };

  // Calculate move differences
  const getMoveDifferences = () => {
    if (Object.keys(bulkAnalysisResults).length === 0) {
      return [];
    }

    const evaluations = getEvaluationData();
    const moveDifferences = [];

    // Process each evaluation (starting from move 0)
    for (let i = 0; i < evaluations.length; i++) {
      const currentEval = evaluations[i];
      let evaluationDiff = 0;
      let moveNumber = i; // Start from 0 (starting position)
      let isWhiteMove = i % 2 === 0; // Move 0, 2, 4... are white moves

      if (i > 0) {
        const previousEval = evaluations[i - 1];
        // Calculate evaluation difference (how much the position changed)
        if (i % 2 === 0) {
          // White move - check how much white's advantage changed
          evaluationDiff = currentEval - previousEval;
        } else {
          // Black move - check how much black's advantage changed
          evaluationDiff = previousEval - currentEval;
        }
      }

      moveDifferences.push({
        moveNumber: moveNumber,
        isWhiteMove: isWhiteMove,
        evaluationDiff: evaluationDiff,
        currentEval: currentEval,
        previousEval: i > 0 ? evaluations[i - 1] : 0
      });
    }

    return moveDifferences;
  };


  const renderEvaluationGraph = () => {
    const evaluations = getEvaluationData();
    if (evaluations.length === 0) return null;

    const SVG_WIDTH = 561;
    const SVG_HEIGHT = 204;
    const MAX_EVAL = 10.0;  // Use -10 to +10 range for consistency
    const MIN_EVAL = -10.0; // Use -10 to +10 range for consistency
    const EVAL_RANGE = MAX_EVAL - MIN_EVAL;
    const TENSION = 0.5; // Controls curviness (0 = straight, 1 = max curve)

    // Helper functions for scaling
    const scaleY = (evalValue) => {
      // Clamp extreme values to the visible range
      const clampedValue = Math.max(MIN_EVAL, Math.min(MAX_EVAL, evalValue));
      const normalized = (clampedValue - MIN_EVAL) / EVAL_RANGE;
      return SVG_HEIGHT * (1 - normalized);
    };

    const scaleX = (index) => {
      if (evaluations.length <= 1) return 0;
      return (index / (evaluations.length - 1)) * SVG_WIDTH;
    };

    // Prepare points array with scaled coordinates
    const points = evaluations.map((evalValue, index) => ({
      x: scaleX(index),
      y: scaleY(evalValue),
      evalValue: evalValue,
      moveNumber: index + 1,
      isWhiteMove: index % 2 === 0,
      index: index + 1
    }));

    // Build smooth Bézier curve path
    let smoothCurveD = `M${points[0].x} ${points[0].y}`;
    
    for (let i = 0; i < points.length - 1; i++) {
      const P0 = points[i - 1] || points[i];
      const P1 = points[i];
      const P2 = points[i + 1];
      const P3 = points[i + 2] || points[i + 1];

      const C1x = P1.x + (P2.x - P0.x) / 6 * TENSION;
      const C1y = P1.y + (P2.y - P0.y) / 6 * TENSION;
      const C2x = P2.x - (P3.x - P1.x) / 6 * TENSION;
      const C2y = P2.y - (P3.y - P1.y) / 6 * TENSION;

      smoothCurveD += ` C ${C1x.toFixed(2)} ${C1y.toFixed(2)}, ${C2x.toFixed(2)} ${C2y.toFixed(2)}, ${P2.x.toFixed(2)} ${P2.y.toFixed(2)}`;
    }

    // Create closed area path for white advantage
    let areaPathD = smoothCurveD;
    areaPathD += ` L ${SVG_WIDTH} ${SVG_HEIGHT}`;
    areaPathD += ` L 0 ${SVG_HEIGHT}`;
    areaPathD += ` Z`;

    return (
      <Box position="relative" w="100%" h="100%">
        <svg 
          width="100%" 
          height="100%" 
          viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
          style={{ 
            backgroundColor: '#1e1e1e',
            borderRadius: '0'
          }}
        >
          {/* Black Advantage Area (Base layer) */}
          <rect x="0" y="0" width={SVG_WIDTH} height={SVG_HEIGHT} fill="#333333" />

          {/* White Advantage Area (smooth area) */}
          <path d={areaPathD} fill="#FFFFFF" />

          {/* Grid Lines */}
          {/* Center Line (0.00) */}
          <line x1="0" y1={scaleY(0)} x2={SVG_WIDTH} y2={scaleY(0)} stroke="#555" strokeWidth="1" />
          
          {/* Y-axis labels */}
          <text x="10" y="20" fill="#aaa" fontSize="14">+10</text>
          <text x="10" y={scaleY(0) + 5} fill="#f0f0f0" fontSize="14">0.00</text>
          <text x="10" y={SVG_HEIGHT - 10} fill="#aaa" fontSize="14">-10</text>

          {/* Smooth boundary line */}
          <path 
            d={smoothCurveD} 
            fill="none" 
            stroke="#333333" 
            strokeWidth="2.5" 
            opacity="0.8"
          />

          {/* Current position indicator line */}
          {currentMoveIndex >= -1 && currentMoveIndex < evaluations.length - 1 && (
            <line
              x1={scaleX(currentMoveIndex + 1)}
              y1="0"
              x2={scaleX(currentMoveIndex + 1)}
              y2={SVG_HEIGHT}
              stroke="#ff6b6b"
              strokeWidth="2"
              opacity="0.8"
            />
          )}

        </svg>
      </Box>
    );
  };

  // Render with improved horizontal layout
  return (
    <>
    <Box w="100%" p={{ base: 2, md: 4, lg: 6 }}>
      {/* Header Section */}
      <Box mb={6}>
        <Flex justify="space-between" align="center" mb={4}>
          <Flex align="center" gap={3}>
            {(isGameLoading || isAnalyzing) && <Spinner color="teal.500" size="sm" />}
            <Text fontSize="2xl" fontWeight="bold" color={statusTextColor}>
              Analysis Board
            </Text>
            <Text fontSize="lg" fontWeight="medium" color={additionalTextColor}>
              Position Analysis
            </Text>
          </Flex>
          <Flex gap={3}>
            <Button 
              size="md" 
              colorScheme="blue" 
              onClick={performBulkAnalysis}
              isDisabled={isBulkAnalyzing || allMoves.length === 0}
              isLoading={isBulkAnalyzing}
              loadingText="Analyzing..."
            >
              {isBulkAnalyzing ? `Analyzing... ${bulkAnalysisProgress}/${allMoves.length + 1}` : 'Analyze All Positions'}
            </Button>
            <Button size="md" colorScheme="blue" variant="outline" onClick={onOpen}>
              Load PGN
            </Button>
          </Flex>
        </Flex>
        
        {/* Game Info Display - Enhanced */}
        {Object.keys(gameInfo).length > 0 && (
          <Box 
            p={4} 
            bg={gameInfoBg} 
            borderRadius="lg"
            border="1px"
            borderColor={gameInfoBorder}
            boxShadow="sm"
          >
            <Text fontSize="lg" fontWeight="bold" color={statusTextColor} mb={2}>
              {gameInfo.White} vs {gameInfo.Black}
            </Text>
            <Text fontSize="md" color={historyTextColor}>
              {gameInfo.Event} - {gameInfo.Date} - Result: {gameInfo.Result}
            </Text>
          </Box>
        )}
        
      </Box>

      {/* Main Content - Horizontal Layout */}
      <Flex
        direction={{ base: 'column', lg: 'row' }}
        align={{ base: 'center', lg: 'flex-start' }}
        gap={{ base: 6, lg: 2 }}
        w="100%"
      >
        {/* Evaluation Bar */}
        <Box 
          display={{ base: 'none', lg: 'flex' }} 
          alignItems="center"
          h={`${boardWidth}px`}
          pt={6}
          pb={6}
          mt="25.5px"
        >
          <Box
            w="28px"
            h={`${boardWidth}px`}
            bg="black"
            position="relative"
            overflow="visible"
            border="1px"
            borderColor="gray.400"
          >
            {/* Evaluation bar fill */}
            <Box
              position="absolute"
              bottom="0"
              left="0"
              right="0"
              h={`${Math.max(2, 50 + (getEvaluationBarValue() * 5))}%`}
              bg={getEvaluationBarColor()}
              transition="all 0.3s ease"
            />
            
            {/* Top evaluation (Black advantage - negative values) */}
            {getEvaluationBarValue() < 0 && (
              <Box
                position="absolute"
                top="-3px"
                left="50%"
                transform="translate(-50%, calc(-55% + 13px))"
                zIndex={50}
              >
                <Text fontSize="11px" color="white" fontWeight="bold">
                  {formatEvaluation()}
                </Text>
              </Box>
            )}
            
            {/* Bottom evaluation (White advantage - positive values) */}
            {getEvaluationBarValue() > 0 && (
              <Box
                position="absolute"
                bottom="-3px"
                left="50%"
                transform="translate(-50%, calc(55% - 13px))"
                zIndex={50}
              >
                <Text fontSize="11px" color="black" fontWeight="bold">
                  {formatEvaluation()}
                </Text>
              </Box>
            )}
            
            {/* Scale markers */}
            {[-10, -5, 0, 5, 10].map(value => (
              <Box
                key={value}
                position="absolute"
                top={`${50 - (value * 5)}%`}
                right="-25px"
                transform="translateY(-50%)"
              >
                <Text fontSize="10px" color={historyTextColor} fontWeight="bold">
                  {value}
                </Text>
              </Box>
            ))}
          </Box>
        </Box>

        {/* Chessboard Section */}
        <Box
          borderRadius="xl"
          p={6}
          bg={boardContainerBg}
          boxShadow="2xl"
          border="2px"
          borderColor={boardBorderColor}
          w="fit-content"
        >
          {isGameLoading ? (
            <Box 
              width={`${boardWidth}px`} 
              height={`${boardWidth}px`} 
              display="flex" 
              alignItems="center" 
              justifyContent="center"
              bg={loadingBg}
              borderRadius="lg"
            >
              <VStack spacing={3}>
                <Spinner color="teal.500" size="lg" />
                <Text color={statusTextColor} fontWeight="medium">Loading Board...</Text>
              </VStack>
            </Box>
          ) : (
            <Chessboard 
              id="AnalysisBoard" 
              position={chessPosition} 
              isDraggablePiece={isDraggablePiece} 
              onPieceDrop={onPieceDrop} 
              onSquareClick={onSquareClick}
              boardOrientation="white" 
              boardWidth={boardWidth} 
              customSquareStyles={getCustomSquareStyles()} 
              customDarkSquareStyle={customDarkSquareStyle} 
              customLightSquareStyle={customLightSquareStyle} 
              snapToCursor={true} 
              animationDuration={0}
              customArrows={customArrows}
              customArrowColor="rgb(77, 166, 77)"
              areArrowsAllowed={true}
            />
          )}
        </Box>

        {/* Move History & Controls Panel */}
        <Box
          w={{ base: '100%', lg: 'auto' }}
          minW={{ lg: 'auto' }}
          maxW={{ lg: 'none' }}
        >
          {/* Desktop Layout - Horizontal arrangement */}
          <HStack
            align="flex-start"
            spacing={6}
            display={{ base: 'none', lg: 'flex' }}
          >
            {/* Move History Section */}
            <VStack
              align="stretch"
              spacing={6}
              w="194px"
              minW="194px"
              maxW="194px"
            >
              {/* Move History Section */}
              <Box
                bg={historyBg}
                borderRadius="lg"
                border="2px"
                borderColor={historyBorderColor}
                boxShadow="lg"
                overflow="hidden"
              >
                <Box p={4} borderBottom="1px" borderColor={historyBorderColor}>
                  <Text fontSize="lg" fontWeight="bold" color={controlsTextColor}>
                    Move History
                  </Text>
                </Box>
                <Box
                  ref={moveHistoryRef}
                  h="390px"
                  w="100%"
                  overflowY="auto"
                  p={3}
                  sx={{ 
                    '&::-webkit-scrollbar': { width: '8px' }, 
                    '&::-webkit-scrollbar-track': { background: scrollbarTrackBg }, 
                    '&::-webkit-scrollbar-thumb': { background: scrollbarThumbBg, borderRadius: '4px' }, 
                    '&::-webkit-scrollbar-thumb:hover': { background: scrollbarThumbHoverBg } 
                  }}
                >
                  {isGameLoading ? (
                    <Flex justify="center" align="center" h="100%">
                      <Text color={historyTextColor} fontStyle="italic">Loading history...</Text>
                    </Flex>
                  ) : allMoves.length === 0 ? (
                    <Flex justify="center" align="center" h="100%">
                      <Text color={historyTextColor} fontStyle="italic">No moves yet.</Text>
                    </Flex>
                  ) : (
                    <VStack spacing={1} align="stretch">
                      {(() => {
                        const pairs = [];
                        // Show all moves from the loaded game, not just current position
                        for (let i = 0; i < allMoves.length; i += 2) {
                          const whiteMoveIndex = i;
                          const blackMoveIndex = i + 1;
                          
                          pairs.push({ 
                            moveNumber: (i / 2) + 1, 
                            white: allMoves[whiteMoveIndex], 
                            black: allMoves[blackMoveIndex], 
                            whiteMoveIndex: whiteMoveIndex,
                            blackMoveIndex: blackMoveIndex,
                            isWhiteCurrent: whiteMoveIndex === currentMoveIndex,
                            isBlackCurrent: blackMoveIndex === currentMoveIndex
                          });
                        }

                        return pairs.map((item) => (
                          <Flex 
                            key={item.moveNumber} 
                            justify="start" 
                            align="center" 
                            fontSize="sm" 
                            py={1} 
                            px={2}
                            borderRadius="md"
                            bg={moveItemBg}
                            _hover={{ bg: moveItemHover }}
                            wrap="nowrap"
                          >
                            <Text 
                              fontWeight="bold" 
                              minW="30px" 
                              textAlign="right" 
                              mr={3} 
                              color={historyMoveNumColor}
                              fontSize="xs"
                            >
                              {item.moveNumber}.
                            </Text>
                            <Button
                              minW="60px" 
                              px={2} 
                              py={1}
                              h="auto"
                              minH="auto"
                              fontSize="xs"
                              fontWeight={item.isWhiteCurrent ? 'extrabold' : 'normal'} 
                              color={item.isWhiteCurrent ? lastMoveColor : defaultMoveColor}
                              bg={item.isWhiteCurrent ? blueCurrent : "transparent"}
                              _hover={{ bg: item.isWhiteCurrent ? blueCurrentHover : grayHover }}
                              borderRadius="md"
                              visibility={item.white ? 'visible' : 'hidden'}
                              onClick={() => goToMoveByIndex(item.whiteMoveIndex)}
                              variant="ghost"
                              size="xs"
                            >
                              {item.white ?? ""}
                            </Button>
                            <Button
                              minW="60px" 
                              px={2} 
                              py={1}
                              h="auto"
                              minH="auto"
                              fontSize="xs"
                              fontWeight={item.isBlackCurrent ? 'extrabold' : 'normal'} 
                              color={item.isBlackCurrent ? lastMoveColor : defaultMoveColor}
                              bg={item.isBlackCurrent ? blueCurrent : "transparent"}
                              _hover={{ bg: item.isBlackCurrent ? blueCurrentHover : grayHover }}
                              borderRadius="md"
                              visibility={item.black ? 'visible' : 'hidden'}
                              onClick={() => goToMoveByIndex(item.blackMoveIndex)}
                              variant="ghost"
                              size="xs"
                            >
                              {item.black ?? ""}
                            </Button>
                          </Flex>
                        ));
                      })()}
                    </VStack>
                  )}
                </Box>
              </Box>

              {/* Move Navigation Section */}
              <Box
                bg={historyBg}
                borderRadius="lg"
                border="2px"
                borderColor={historyBorderColor}
                boxShadow="lg"
                p={4}
              >
                <HStack spacing={2}>
                  <IconButton
                    aria-label="Previous move"
                    icon={<ChevronLeftIcon />}
                    size="md"
                    onClick={goToPreviousMove}
                    isDisabled={currentMoveIndex === -1}
                    colorScheme="blue"
                    variant="outline"
                    flex={1}
                  />
                  <IconButton
                    aria-label="Next move"
                    icon={<ChevronRightIcon />}
                    size="md"
                    onClick={goToNextMove}
                    isDisabled={currentMoveIndex >= allMoves.length - 1}
                    colorScheme="blue"
                    variant="outline"
                    flex={1}
                  />
                </HStack>
              </Box>
            </VStack>

            {/* Analysis Results Panel - HIDDEN */}
            {/*
            <Box
              bg={historyBg}
              borderRadius="lg"
              border="2px"
              borderColor={historyBorderColor}
              boxShadow="lg"
              h={`${Math.round(boardWidth * 0.6)}px`}
              w="194px"
              minW="194px"
              maxW="194px"
            >
              <Box p={4} borderBottom="1px" borderColor={historyBorderColor}>
                <VStack spacing={3} align="stretch">
                  <Text fontSize="lg" fontWeight="bold" color={controlsTextColor}>
                    Analysis Results
                  </Text>
                  
                  {Object.keys(bulkAnalysisResults).length > 0 && (
                    <Button
                      colorScheme={useBulkResults ? "green" : "gray"}
                      size="sm"
                      onClick={() => setUseBulkResults(!useBulkResults)}
                      variant={useBulkResults ? "solid" : "outline"}
                    >
                      {useBulkResults ? "Using Bulk Results" : "Use Bulk Results"}
                    </Button>
                  )}
                  
                  {isBulkAnalyzing && (
                    <Box>
                      <Text fontSize="xs" color={historyTextColor} mb={1}>
                        Progress: {bulkAnalysisProgress}/{allMoves.length + 1}
                      </Text>
                      <Slider
                        value={bulkAnalysisProgress}
                        max={allMoves.length + 1}
                        isDisabled
                        size="sm"
                      >
                        <SliderTrack>
                          <SliderFilledTrack />
                        </SliderTrack>
                        <SliderThumb />
                      </Slider>
                    </Box>
                  )}
                </VStack>
              </Box>
              
              <Box
                h={`calc(100% - ${isBulkAnalyzing ? '140px' : '100px'})`}
                w="100%"
                overflowY="auto"
                p={3}
                sx={{ 
                  '&::-webkit-scrollbar': { width: '8px' }, 
                  '&::-webkit-scrollbar-track': { background: scrollbarTrackBg }, 
                  '&::-webkit-scrollbar-thumb': { background: scrollbarThumbBg, borderRadius: '4px' }, 
                  '&::-webkit-scrollbar-thumb:hover': { background: scrollbarThumbHoverBg } 
                }}
              >
                {Object.keys(bulkAnalysisResults).length > 0 ? (
                  <VStack spacing={2} align="stretch">
                    <Box>
                      <Text fontSize="xs" fontWeight="bold" color={controlsTextColor}>
                        Evaluation:
                      </Text>
                      <Text fontSize="sm" color={historyTextColor}>
                        {possibleMate ? `#${possibleMate}` : positionEvaluation.toFixed(2)}
                      </Text>
                    </Box>
                    
                    <Box>
                      <Text fontSize="xs" fontWeight="bold" color={controlsTextColor}>
                        Depth:
                      </Text>
                      <Text fontSize="sm" color={historyTextColor}>
                        {depth}
                      </Text>
                    </Box>
                    
                    {bestLine && (
                      <Box>
                        <Text fontSize="xs" fontWeight="bold" color={controlsTextColor}>
                          Best Line:
                        </Text>
                        <Text fontSize="xs" color={historyTextColor} wordBreak="break-all">
                          {bestLine}
                        </Text>
                      </Box>
                    )}
                    
                  </VStack>
                ) : (
                  <Flex justify="center" align="center" h="100%">
                    <Text fontSize="xs" color={historyTextColor} fontStyle="italic" textAlign="center">
                      {allMoves.length === 0 ? 'Load a PGN game first' : 'Click "Analyze All Positions" to start bulk analysis'}
                    </Text>
                  </Flex>
                )}
              </Box>
            </Box>
            */}

            {/* Evaluation Graph Column */}
            <VStack spacing={4} align="stretch">
              {/* Evaluation Graph Box */}
              <Box
                bg="#1e1e1e"
                border="1px"
                borderColor={historyBorderColor}
                boxShadow="lg"
                w="561px"
                h="204px"
                position="relative"
                overflow="hidden"
              >
                <Box
                  h="204px"
                  w="100%"
                  p={0}
                >
                  {Object.keys(bulkAnalysisResults).length > 0 ? (
                    renderEvaluationGraph()
                  ) : (
                    <Flex justify="center" align="center" h="100%">
                      <Text fontSize="sm" color="gray.400" textAlign="center">
                        Run analysis to see evaluation graph
                      </Text>
                    </Flex>
                  )}
                </Box>
              </Box>

              {/* Best Line Display Box */}
              <Box
                bg={analysisBoxBg}
                borderRadius="lg"
                border="2px"
                borderColor={historyBorderColor}
                boxShadow="lg"
                p={4}
                w="561px"
                minH="100px"
              >
                <VStack spacing={3} align="stretch">
                  <Text fontSize="sm" fontWeight="bold" color={controlsTextColor} textAlign="center">
                    Move Analysis
                  </Text>
                  
                  {/* Played Move (move that led to current position) */}
                  {currentMoveIndex >= 0 && allMoves[currentMoveIndex] ? (
                    <VStack spacing={2} align="center">
                      <Text fontSize="xs" color={historyTextColor} textAlign="center">
                        Move Played:
                      </Text>
                      <Text fontSize="lg" fontWeight="bold" color={blueMoveText} textAlign="center">
                        {allMoves[currentMoveIndex]}
                      </Text>
                      {(() => {
                        // Get the evaluation of the move that was played (after playing the actual move)
                        const currentAnalysis = bulkAnalysisResults[chessGame.fen()];
                        if (currentAnalysis && currentAnalysis.movePlayedEvaluation !== null) {
                          return (
                            <Text fontSize="xs" color={blueMoveText} textAlign="center" fontWeight="bold">
                              Eval: {(currentAnalysis.movePlayedEvaluation / 100).toFixed(2)}
                            </Text>
                          );
                        }
                        // Fallback to current position evaluation
                        const currentEval = getCurrentEvaluation();
                        if (currentEval !== 0) {
                          return (
                            <Text fontSize="xs" color={blueMoveText} textAlign="center" fontWeight="bold">
                              Eval: {(currentEval / 100).toFixed(2)}
                            </Text>
                          );
                        }
                        return null;
                      })()}
                    </VStack>
                  ) : (
                    <VStack spacing={1} align="center">
                      <Text fontSize="xs" color={historyTextColor} textAlign="center">
                        Move Played:
                      </Text>
                      <Text fontSize="sm" color={historyTextColor} textAlign="center" fontStyle="italic">
                        Starting Position
                      </Text>
                    </VStack>
                  )}
                  
                  {/* Best Move (from previous position) */}
                  {(() => {
                    // Get the best move from previous position (now provided directly by backend)
                          const currentAnalysis = bulkAnalysisResults[chessGame.fen()];
                    const bestMoveFromPrevious = currentAnalysis?.bestLine || '';
                    const bestMoveEvaluation = currentAnalysis?.bestMoveEvaluation || null;
                    
                    return bestMoveFromPrevious ? (
                      <VStack spacing={2} align="center">
                        <Text fontSize="xs" color={historyTextColor} textAlign="center">
                          Best Move:
                        </Text>
                        <Text fontSize="lg" fontWeight="bold" color={greenMoveText} textAlign="center">
                          {bestMoveFromPrevious}
                        </Text>
                        {bestMoveEvaluation !== null && (
                          <Text fontSize="xs" color={greenMoveText} textAlign="center" fontWeight="bold">
                            Eval: {(bestMoveEvaluation / 100).toFixed(2)}
                          </Text>
                        )}
                        {bestMoveEvaluation === null && (
                          <Text fontSize="xs" color={greenMoveText} textAlign="center" fontWeight="bold">
                            Eval: {formatEvaluation()}
                          </Text>
                        )}
                        
                        {/* Move Quality Assessment */}
                        {(() => {
                          const currentAnalysis = bulkAnalysisResults[chessGame.fen()];
                          const movePlayedEval = currentAnalysis?.movePlayedEvaluation;
                          const bestMoveEval = currentAnalysis?.bestMoveEvaluation;
                          
                          if (movePlayedEval !== null && bestMoveEval !== null) {
                            // Calculate difference: played move - best move
                            const evalDiff = movePlayedEval - bestMoveEval;
                            
                            // Determine if it's White's turn (even move numbers) or Black's turn (odd move numbers)
                            const isWhiteMove = currentMoveIndex % 2 === 0;
                            
                            let moveQuality, color, diffDisplay;
                            
                            // Check if either evaluation is a mate (backend now converts mates to large centipawn values)
                            // Use a higher threshold to distinguish between very bad positions and actual mates
                            const isMovePlayedMate = Math.abs(movePlayedEval) > 9500;
                            const isBestMoveMate = Math.abs(bestMoveEval) > 9500;
                            
                            if (isMovePlayedMate || isBestMoveMate) {
                              // Handle mate evaluations - backend converts them to comparable centipawn values
                              if (isMovePlayedMate && isBestMoveMate) {
                                // Both are mates - compare the converted values
                                const diffInPawns = Math.abs(evalDiff) / 100;
                                
                                if (diffInPawns < 0.05) {
                                  moveQuality = "Neutral";
                                  color = "gray.400";
                                  diffDisplay = "0.00";
                                } else {
                                  if (isWhiteMove) {
                                    if (evalDiff > 0) {
                                      moveQuality = "Positive";
                                      color = "green.400";
                                    } else {
                                      moveQuality = "Negative";
                                      color = "red.400";
                                    }
                                  } else {
                                    if (evalDiff < 0) {
                                      moveQuality = "Positive";
                                      color = "green.400";
                                    } else {
                                      moveQuality = "Negative";
                                      color = "red.400";
                                    }
                                  }
                                  diffDisplay = diffInPawns.toFixed(2);
                                }
                              } else {
                                // One is mate, one is not - mate is usually better
                                moveQuality = "Critical";
                                color = "purple.400";
                                diffDisplay = "Mate";
                              }
                            } else {
                              // Regular centipawn evaluations
                              const diffInPawns = Math.abs(evalDiff) / 100;
                              
                              if (diffInPawns < 0.05) { // Within 0.05 pawns = neutral
                                moveQuality = "Neutral";
                                color = "gray.400";
                              } else if (isWhiteMove) {
                                // White's perspective: positive = better for White
                                if (evalDiff > 0) {
                                  moveQuality = "Positive";
                                  color = "green.400";
                                } else {
                                  moveQuality = "Negative";
                                  color = "red.400";
                                }
                              } else {
                                // Black's perspective: positive = better for Black (opposite of White)
                                if (evalDiff < 0) {
                                  moveQuality = "Positive";
                                  color = "green.400";
                                } else {
                                  moveQuality = "Negative";
                                  color = "red.400";
                                }
                              }
                              diffDisplay = diffInPawns.toFixed(2);
                            }
                            
                            return (
                              <Text 
                                fontSize="xs" 
                                color={color} 
                                textAlign="center" 
                                fontWeight="bold"
                              >
                                {moveQuality} Move {diffDisplay}
                          </Text>
                            );
                          }
                          return null;
                        })()}
                      </VStack>
                    ) : (
                      <VStack spacing={1} align="center">
                        <Text fontSize="xs" color={historyTextColor} textAlign="center">
                          Best Move:
                        </Text>
                        <Text fontSize="sm" color={historyTextColor} textAlign="center" fontStyle="italic">
                          {currentMoveIndex === -1 ? 'Starting Position' : 'No analysis available'}
                        </Text>
                      </VStack>
                    );
                  })()}
                </VStack>
              </Box>

            </VStack>
          </HStack>

          {/* Mobile Layout */}
          <VStack
            align="stretch"
            spacing={4}
            display={{ base: 'flex', lg: 'none' }}
          >
            {/* Move Navigation */}
            <Box
              bg={historyBg}
              borderRadius="lg"
              border="2px"
              borderColor={historyBorderColor}
              boxShadow="lg"
              p={4}
            >
              <HStack spacing={2}>
                <IconButton
                  aria-label="Previous move"
                  icon={<ChevronLeftIcon />}
                  size="sm"
                  onClick={goToPreviousMove}
                  isDisabled={currentMoveIndex === -1}
                  colorScheme="blue"
                  variant="outline"
                  flex={1}
                />
                <IconButton
                  aria-label="Next move"
                  icon={<ChevronRightIcon />}
                  size="sm"
                  onClick={goToNextMove}
                  isDisabled={currentMoveIndex >= allMoves.length - 1}
                  colorScheme="blue"
                  variant="outline"
                  flex={1}
                />
              </HStack>
            </Box>

            {/* Move History for Mobile */}
            <Box
              bg={historyBg}
              borderRadius="lg"
              border="2px"
              borderColor={historyBorderColor}
              boxShadow="lg"
              overflow="hidden"
            >
              <Box p={4} borderBottom="1px" borderColor={historyBorderColor}>
                <Text fontSize="lg" fontWeight="bold" color={controlsTextColor}>
                  Move History
                </Text>
              </Box>
              <Box
                ref={moveHistoryRef}
                h="390px"
                w="100%"
                overflowY="auto"
                p={3}
                sx={{ 
                  '&::-webkit-scrollbar': { width: '8px' }, 
                  '&::-webkit-scrollbar-track': { background: scrollbarTrackBg }, 
                  '&::-webkit-scrollbar-thumb': { background: scrollbarThumbBg, borderRadius: '4px' }, 
                  '&::-webkit-scrollbar-thumb:hover': { background: scrollbarThumbHoverBg } 
                }}
              >
                {isGameLoading ? (
                  <Flex justify="center" align="center" h="100%">
                    <Text color={historyTextColor} fontStyle="italic">Loading history...</Text>
                  </Flex>
                ) : allMoves.length === 0 ? (
                  <Flex justify="center" align="center" h="100%">
                    <Text color={historyTextColor} fontStyle="italic">No moves yet.</Text>
                  </Flex>
                ) : (
                  <VStack spacing={1} align="stretch">
                    {(() => {
                      const pairs = [];
                      // Show all moves from the loaded game, not just current position
                      for (let i = 0; i < allMoves.length; i += 2) {
                        const whiteMoveIndex = i;
                        const blackMoveIndex = i + 1;
                        
                        pairs.push({ 
                          moveNumber: (i / 2) + 1, 
                          white: allMoves[whiteMoveIndex], 
                          black: allMoves[blackMoveIndex], 
                          whiteMoveIndex: whiteMoveIndex,
                          blackMoveIndex: blackMoveIndex,
                          isWhiteCurrent: whiteMoveIndex === currentMoveIndex,
                          isBlackCurrent: blackMoveIndex === currentMoveIndex
                        });
                      }

                      return pairs.map((item) => (
                        <Flex 
                          key={item.moveNumber} 
                          justify="start" 
                          align="center" 
                          fontSize="sm" 
                          py={1} 
                          px={2}
                          borderRadius="md"
                          bg={moveItemBg}
                          _hover={{ bg: moveItemHover }}
                          wrap="nowrap"
                        >
                          <Text 
                            fontWeight="bold" 
                            minW="30px" 
                            textAlign="right" 
                            mr={3} 
                            color={historyMoveNumColor}
                            fontSize="xs"
                          >
                            {item.moveNumber}.
                          </Text>
                          <Button
                            minW="60px" 
                            px={2} 
                            py={1}
                            h="auto"
                            minH="auto"
                            fontSize="xs"
                            fontWeight={item.isWhiteCurrent ? 'extrabold' : 'normal'} 
                            color={item.isWhiteCurrent ? lastMoveColor : defaultMoveColor}
                            bg={item.isWhiteCurrent ? blueCurrent : "transparent"}
                            _hover={{ bg: item.isWhiteCurrent ? blueCurrentHover : grayHover }}
                            borderRadius="md"
                            visibility={item.white ? 'visible' : 'hidden'}
                            onClick={() => goToMoveByIndex(item.whiteMoveIndex)}
                            variant="ghost"
                            size="xs"
                          >
                            {item.white ?? ""}
                          </Button>
                          <Button
                            minW="60px" 
                            px={2} 
                            py={1}
                            h="auto"
                            minH="auto"
                            fontSize="xs"
                            fontWeight={item.isBlackCurrent ? 'extrabold' : 'normal'} 
                            color={item.isBlackCurrent ? lastMoveColor : defaultMoveColor}
                            bg={item.isBlackCurrent ? blueCurrent : "transparent"}
                            _hover={{ bg: item.isBlackCurrent ? blueCurrentHover : grayHover }}
                            borderRadius="md"
                            visibility={item.black ? 'visible' : 'hidden'}
                            onClick={() => goToMoveByIndex(item.blackMoveIndex)}
                            variant="ghost"
                            size="xs"
                          >
                            {item.black ?? ""}
                          </Button>
                        </Flex>
                      ));
                    })()}
                  </VStack>
                )}
              </Box>
            </Box>
          </VStack>
        </Box>
      </Flex>
    </Box>
    
    {/* PGN Input Modal */}
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Load PGN Game</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4} align="stretch">
            <Text fontSize="sm" color={modalTextColor}>
              Paste your PGN game below. The format should include headers and moves.
            </Text>
            <Textarea
              placeholder="Paste PGN here..."
              value={pgnText}
              onChange={(e) => setPgnText(e.target.value)}
              rows={15}
              fontFamily="monospace"
              fontSize="sm"
            />
            <Text fontSize="xs" color={modalExampleColor}>
              Example format:
              [Event "Live Chess"]
              [Site "Chess.com"]
              [Date "2025.10.06"]
              [White "Player1"]
              [Black "Player2"]
              [Result "1-0"]
              
              1. e4 e5 2. Nf3 Nc6 3. Bb5 a6...
            </Text>
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>
            Cancel
          </Button>
          <Button colorScheme="blue" onClick={() => loadPGN(pgnText)}>
            Load Game
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
    </>
  );
};

export default AnalysisBoard;
