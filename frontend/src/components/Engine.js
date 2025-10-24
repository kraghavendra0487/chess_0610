/**
 * Engine helper class for Stockfish integration
 * This class handles communication with the Stockfish engine via the backend API
 */
class Engine {
  constructor() {
    this.isReady = false;
    this.callbacks = new Map();
    this.callbackId = 0;
  }

  /**
   * Initialize the engine
   */
  async init() {
    try {
      // Test connection to backend
      const response = await fetch('http://localhost:5000/');
      if (response.ok) {
        this.isReady = true;
        console.log('Engine initialized successfully');
      } else {
        throw new Error('Failed to connect to engine');
      }
    } catch (error) {
      console.error('Engine initialization failed:', error);
      this.isReady = false;
    }
  }

  /**
   * Evaluate a position and get the best move
   * @param {string} fen - FEN string of the position
   * @param {number} depth - Analysis depth (default: 15)
   */
  async evaluatePosition(fen, depth = 15) {
    if (!this.isReady) {
      console.warn('Engine not ready');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fen: fen,
          depth: depth
        })
      });

      if (response.ok) {
        const result = await response.json();
        this.handleEngineResponse(result);
      } else {
        throw new Error('Analysis request failed');
      }
    } catch (error) {
      console.error('Engine evaluation failed:', error);
    }
  }

  /**
   * Handle engine response and trigger callbacks
   * @param {Object} result - Engine analysis result
   */
  handleEngineResponse(result) {
    const { best_move, evaluation, depth } = result;
    
    // Parse evaluation - backend sends raw centipawn values
    let positionEvaluation = 0;
    let possibleMate = null;
    
    if (typeof evaluation === 'number') {
      // Backend sends raw centipawn as a number
      positionEvaluation = evaluation;
    } else if (evaluation && evaluation.type === 'cp') {
      // Backend sends {type: 'cp', value: centipawns}
      positionEvaluation = evaluation.value;
    } else if (evaluation && evaluation.type === 'mate') {
      // Mate evaluation
      possibleMate = evaluation.value;
    }

    // Trigger all registered callbacks
    this.callbacks.forEach(callback => {
      callback({
        positionEvaluation,
        possibleMate,
        pv: best_move,
        depth: depth
      });
    });
  }

  /**
   * Register a callback for engine messages
   * @param {Function} callback - Callback function to receive engine messages
   * @returns {number} - Callback ID for removal
   */
  onMessage(callback) {
    const id = ++this.callbackId;
    this.callbacks.set(id, callback);
    return id;
  }

  /**
   * Remove a callback
   * @param {number} id - Callback ID returned by onMessage
   */
  removeCallback(id) {
    this.callbacks.delete(id);
  }

  /**
   * Stop the engine (placeholder for compatibility)
   */
  stop() {
    // In our implementation, we don't need to stop anything
    // as each request is independent
  }

  /**
   * Check if engine is ready
   * @returns {boolean}
   */
  isEngineReady() {
    return this.isReady;
  }
}

export default Engine;
