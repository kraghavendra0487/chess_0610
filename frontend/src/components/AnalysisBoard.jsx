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
  
  // Stockfish insights state
  const [insightsEnabled, setInsightsEnabled] = useState(false);
  const [currentInsights, setCurrentInsights] = useState({
    evaluation: 0,
    depth: 0,
    bestLine: '',
    mate: '',
    isAnalyzing: false
  });
  const [threads, setThreads] = useState(1);

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
      const moves = movesText.trim().split(/\s+/).filter(move => 
        move && !move.match(/^\d+\.$/) && move !== '1-0' && move !== '0-1' && move !== '1/2-1/2'
      );
      
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
    setIsAnalyzing(false);
    setBestLine('');
    setPossibleMate('');
    setPositionEvaluation(0);
    setDepth(10);
    
    onClose();
  }, [parsePGN, onClose]);

  // Move Navigation Functions
  const goToMove = useCallback((index) => {
    if (index < -1 || index >= allMoves.length) return;
    
    const newGame = new Chess();
    const movesToApply = allMoves.slice(0, index + 1);
    
    try {
      movesToApply.forEach(move => newGame.move(move));
      chessGameRef.current = newGame;
      setChessPosition(newGame.fen());
      setMoveHistory(movesToApply);
      setCurrentMoveIndex(index);
      setSelectedSquare(null);
      setHighlightedSquares([]);
      setIsAnalyzing(false);
      setBestLine('');
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
      findBestMove();
    }
  }, [chessPosition]);

  // Find the best move
  const findBestMove = async () => {
    if (!engine.isEngineReady()) return;
    
    setIsAnalyzing(true);
    setBestLine('');
    
    try {
      await engine.evaluatePosition(chessGame.fen(), 18);
      
      engine.onMessage(({ positionEvaluation, possibleMate, pv, depth }) => {
        if (depth && depth < 10) {
          return;
        }

        if (positionEvaluation !== undefined) {
          setPositionEvaluation((chessGame.turn() === 'w' ? 1 : -1) * Number(positionEvaluation) / 100);
        }

        if (possibleMate !== undefined) {
          setPossibleMate(possibleMate);
        }
        if (depth) {
          setDepth(depth);
        }
        if (pv) {
          setBestLine(pv);
        }
        
        setIsAnalyzing(false);
      });
    } catch (error) {
      console.error('Analysis failed:', error);
      setIsAnalyzing(false);
    }
  };

  // Analyze current position for insights
  const analyzeCurrentPosition = useCallback(async () => {
    if (!engine.isEngineReady() || !insightsEnabled) return;
    
    setCurrentInsights(prev => ({ ...prev, isAnalyzing: true }));
    
    try {
      await engine.evaluatePosition(chessGame.fen(), depth);
      
      engine.onMessage(({ positionEvaluation, possibleMate, pv, depth: currentDepth }) => {
        if (currentDepth && currentDepth < 5) {
          return;
        }

        const evaluation = positionEvaluation !== undefined ? 
          (chessGame.turn() === 'w' ? 1 : -1) * Number(positionEvaluation) / 100 : 0;
        
        setCurrentInsights({
          evaluation,
          depth: currentDepth || 0,
          bestLine: pv || '',
          mate: possibleMate || '',
          isAnalyzing: false
        });
      });
    } catch (error) {
      console.error('Insights analysis failed:', error);
      setCurrentInsights(prev => ({ ...prev, isAnalyzing: false }));
    }
  }, [engine, chessGame, depth, insightsEnabled]);

  // Analyze position for insights when position changes and insights are enabled
  useEffect(() => {
    if (insightsEnabled) {
      analyzeCurrentPosition();
    }
  }, [chessPosition, insightsEnabled, analyzeCurrentPosition]);

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
  }, [ chessGame, selectedSquare, highlightedSquares, selectedSquareColor, legalMoveDotColor, captureSquareColor, checkHighlightColor ]);

  // Get the best move for arrows
  const bestMove = bestLine?.split(' ')?.[0];
  const arrows = bestMove ? [{
    startSquare: bestMove.substring(0, 2),
    endSquare: bestMove.substring(2, 4),
    color: 'rgb(0, 128, 0)'
  }] : undefined;

  // Format evaluation display
  const formatEvaluation = () => {
    if (possibleMate !== '') {
      return `#${possibleMate}`;
    }
    return positionEvaluation.toFixed(2);
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
            <Text fontSize="lg" fontWeight="medium" color={useColorModeValue("gray.600", "gray.300")}>
              Position Analysis
            </Text>
          </Flex>
          <Button size="md" colorScheme="blue" variant="outline" onClick={onOpen}>
            Load PGN
          </Button>
        </Flex>
        
        {/* Game Info Display - Enhanced */}
        {Object.keys(gameInfo).length > 0 && (
          <Box 
            p={4} 
            bg={useColorModeValue("gray.50", "gray.700")} 
            borderRadius="lg"
            border="1px"
            borderColor={useColorModeValue("gray.200", "gray.600")}
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
        gap={{ base: 6, lg: 8 }}
        w="100%"
      >
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
              bg={useColorModeValue("gray.50", "gray.700")}
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
              animationDuration={150}
              arrows={arrows}
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
                            bg={useColorModeValue("gray.50", "gray.700")}
                            _hover={{ bg: useColorModeValue("gray.100", "gray.600") }}
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
                              bg={item.isWhiteCurrent ? useColorModeValue("blue.200", "blue.700") : "transparent"}
                              _hover={{ bg: item.isWhiteCurrent ? useColorModeValue("blue.300", "blue.600") : useColorModeValue("gray.200", "gray.600") }}
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
                              bg={item.isBlackCurrent ? useColorModeValue("blue.200", "blue.700") : "transparent"}
                              _hover={{ bg: item.isBlackCurrent ? useColorModeValue("blue.300", "blue.600") : useColorModeValue("gray.200", "gray.600") }}
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

            {/* Analysis Panel */}
            <Box
              bg={historyBg}
              borderRadius="lg"
              border="2px"
              borderColor={historyBorderColor}
              boxShadow="lg"
              h={`${Math.round(boardWidth * 1.08)}px`}
              w="194px"
              minW="194px"
              maxW="194px"
            >
              <Box p={4} borderBottom="1px" borderColor={historyBorderColor}>
                <Text fontSize="lg" fontWeight="bold" color={controlsTextColor}>
                  Possible Moves:
                </Text>
              </Box>
              <Box
                h={`calc(100% - 73px)`}
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
                {moveHistory.length > 0 ? (
                  <VStack spacing={1} align="stretch">
                    {(() => {
                      // Get the position before the last move
                      const tempGame = new Chess();
                      const movesToApply = moveHistory.slice(0, -1);
                      
                      try {
                        movesToApply.forEach(move => tempGame.move(move));
                        const possibleMoves = tempGame.moves();
                        const lastMove = moveHistory[moveHistory.length - 1];
                        
                        return possibleMoves.map((move, index) => (
                          <Button
                            key={index}
                            size="sm"
                            variant="ghost"
                            fontSize="xs"
                            fontWeight={move === lastMove ? 'bold' : 'normal'}
                            color={move === lastMove ? lastMoveColor : defaultMoveColor}
                            bg={move === lastMove ? useColorModeValue("blue.200", "blue.700") : useColorModeValue("gray.50", "gray.700")}
                            _hover={{ bg: move === lastMove ? useColorModeValue("blue.300", "blue.600") : useColorModeValue("gray.100", "gray.600") }}
                            borderRadius="md"
                            p={2}
                            h="auto"
                            minH="auto"
                            textAlign="left"
                            justifyContent="flex-start"
                            onClick={() => {
                              // Go back to the previous position and make this move instead
                              goToMove(moveHistory.length - 2);
                              setTimeout(() => {
                                try {
                                  const moveObj = chessGame.move(move);
                                  if (moveObj) {
                                    chessGameRef.current = chessGame;
                                    setChessPosition(chessGame.fen());
                                    setMoveHistory(prev => [...prev, moveObj.san]);
                                    setSelectedSquare(null);
                                    setHighlightedSquares([]);
                                    setIsAnalyzing(false);
                                    setBestLine('');
                                    setPossibleMate('');
                                  }
                                } catch (error) {
                                  console.error('Invalid move:', error);
                                }
                              }, 100);
                            }}
                          >
                            {move}
                          </Button>
                        ));
                      } catch (error) {
                        return <Text color={historyTextColor} fontStyle="italic">Error loading moves</Text>;
                      }
                    })()}
                  </VStack>
                ) : chessGame && !chessGame.isGameOver() && !chessGame.isDraw() ? (
                  <VStack spacing={1} align="stretch">
                    {chessGame.moves().map((move, index) => (
                      <Button
                        key={index}
                        size="sm"
                        variant="ghost"
                        fontSize="xs"
                        fontWeight="normal"
                        color={defaultMoveColor}
                        bg={useColorModeValue("gray.50", "gray.700")}
                        _hover={{ bg: useColorModeValue("gray.100", "gray.600") }}
                        borderRadius="md"
                        p={2}
                        h="auto"
                        minH="auto"
                        textAlign="left"
                        justifyContent="flex-start"
                        onClick={() => {
                          try {
                            const moveObj = chessGame.move(move);
                            if (moveObj) {
                              chessGameRef.current = chessGame;
                              setChessPosition(chessGame.fen());
                              setMoveHistory(prev => [...prev, moveObj.san]);
                              setSelectedSquare(null);
                              setHighlightedSquares([]);
                              setIsAnalyzing(false);
                              setBestLine('');
                              setPossibleMate('');
                            }
                          } catch (error) {
                            console.error('Invalid move:', error);
                          }
                        }}
                      >
                        {move}
                      </Button>
                    ))}
                  </VStack>
                ) : (
                  <Flex justify="center" align="center" h="100%">
                    <Text color={historyTextColor} fontStyle="italic" textAlign="center">
                      {chessGame?.isGameOver() ? 'Game Over' : chessGame?.isDraw() ? 'Draw' : 'No moves available'}
                    </Text>
                  </Flex>
                )}
              </Box>
            </Box>

            {/* Stockfish Insights Panel */}
            <Box
              bg={historyBg}
              borderRadius="lg"
              border="2px"
              borderColor={historyBorderColor}
              boxShadow="lg"
              h={`${Math.round(boardWidth * 1.08)}px`}
              w="194px"
              minW="194px"
              maxW="194px"
            >
              <Box p={4} borderBottom="1px" borderColor={historyBorderColor}>
                <VStack spacing={3} align="stretch">
                  <Flex justify="space-between" align="center">
                    <Text fontSize="lg" fontWeight="bold" color={controlsTextColor}>
                      Stockfish Insights
                    </Text>
                    <Switch
                      isChecked={insightsEnabled}
                      onChange={(e) => setInsightsEnabled(e.target.checked)}
                      colorScheme="blue"
                      size="sm"
                    />
                  </Flex>
                  
                  {insightsEnabled && (
                    <VStack spacing={2} align="stretch">
                      <Box>
                        <Text fontSize="xs" color={historyTextColor} mb={1}>
                          Depth: {depth}
                        </Text>
                        <Slider
                          value={depth}
                          onChange={(val) => setDepth(val)}
                          min={5}
                          max={20}
                          step={1}
                          size="sm"
                        >
                          <SliderTrack>
                            <SliderFilledTrack />
                          </SliderTrack>
                          <SliderThumb />
                        </Slider>
                      </Box>
                      
                      <Box>
                        <Text fontSize="xs" color={historyTextColor} mb={1}>
                          Threads: {threads}
                        </Text>
                        <NumberInput
                          value={threads}
                          onChange={(val) => setThreads(parseInt(val) || 1)}
                          min={1}
                          max={8}
                          size="sm"
                        >
                          <NumberInputField />
                          <NumberInputStepper>
                            <NumberIncrementStepper />
                            <NumberDecrementStepper />
                          </NumberInputStepper>
                        </NumberInput>
                      </Box>
                    </VStack>
                  )}
                </VStack>
              </Box>
              
              <Box
                h={`calc(100% - ${insightsEnabled ? '140px' : '73px'})`}
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
                {insightsEnabled ? (
                  currentInsights.isAnalyzing ? (
                    <Flex justify="center" align="center" h="100%">
                      <VStack spacing={2}>
                        <Spinner color="blue.500" size="sm" />
                        <Text fontSize="xs" color={historyTextColor}>Analyzing...</Text>
                      </VStack>
                    </Flex>
                  ) : (
                    <VStack spacing={2} align="stretch">
                      <Box>
                        <Text fontSize="xs" fontWeight="bold" color={controlsTextColor}>
                          Evaluation:
                        </Text>
                        <Text fontSize="sm" color={historyTextColor}>
                          {currentInsights.mate ? 
                            `#${currentInsights.mate}` : 
                            currentInsights.evaluation.toFixed(2)
                          }
                        </Text>
                      </Box>
                      
                      <Box>
                        <Text fontSize="xs" fontWeight="bold" color={controlsTextColor}>
                          Depth:
                        </Text>
                        <Text fontSize="sm" color={historyTextColor}>
                          {currentInsights.depth}
                        </Text>
                      </Box>
                      
                      {currentInsights.bestLine && (
                        <Box>
                          <Text fontSize="xs" fontWeight="bold" color={controlsTextColor}>
                            Best Line:
                          </Text>
                          <Text fontSize="xs" color={historyTextColor} wordBreak="break-all">
                            {currentInsights.bestLine}
                          </Text>
                        </Box>
                      )}
                    </VStack>
                  )
                ) : (
                  <Flex justify="center" align="center" h="100%">
                    <Text fontSize="xs" color={historyTextColor} fontStyle="italic" textAlign="center">
                      Enable analysis to see Stockfish insights
                    </Text>
                  </Flex>
                )}
              </Box>
            </Box>
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
                          bg={useColorModeValue("gray.50", "gray.700")}
                          _hover={{ bg: useColorModeValue("gray.100", "gray.600") }}
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
                            bg={item.isWhiteCurrent ? useColorModeValue("blue.200", "blue.700") : "transparent"}
                            _hover={{ bg: item.isWhiteCurrent ? useColorModeValue("blue.300", "blue.600") : useColorModeValue("gray.200", "gray.600") }}
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
                            bg={item.isBlackCurrent ? useColorModeValue("blue.200", "blue.700") : "transparent"}
                            _hover={{ bg: item.isBlackCurrent ? useColorModeValue("blue.300", "blue.600") : useColorModeValue("gray.200", "gray.600") }}
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
            <Text fontSize="sm" color={useColorModeValue("gray.600", "gray.300")}>
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
            <Text fontSize="xs" color={useColorModeValue("gray.500", "gray.400")}>
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
