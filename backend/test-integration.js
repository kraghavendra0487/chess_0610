#!/usr/bin/env node

/**
 * Test script for the Node.js → Python → Stockfish integration
 * Run with: node test-integration.js
 */

import { analyzeWithStockfish, testIntegration } from './python-runner.js';

async function runTests() {
  console.log('🧪 Testing Node.js → Python → Stockfish Integration\n');
  
  // Test 1: Basic integration test
  console.log('Test 1: Basic Integration Test');
  console.log('================================');
  const integrationSuccess = await testIntegration();
  console.log(`Result: ${integrationSuccess ? '✅ PASS' : '❌ FAIL'}\n`);
  
  if (!integrationSuccess) {
    console.log('❌ Integration test failed. Please check:');
    console.log('   - Python is installed and in PATH');
    console.log('   - Stockfish path is correct in python/engine.py');
    console.log('   - Required Python packages are installed (pip install stockfish)');
    process.exit(1);
  }
  
  // Test 2: Multiple positions
  console.log('Test 2: Multiple Position Analysis');
  console.log('===================================');
  
  const testPositions = [
    {
      name: 'Starting Position',
      fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
      depth: 10
    },
    {
      name: 'Middle Game Position',
      fen: 'r1bqkbnr/pppppppp/n7/8/8/5N2/PPPPPPPP/RNBQKB1R w KQkq - 2 2',
      depth: 12
    },
    {
      name: 'Endgame Position',
      fen: '8/8/8/8/8/8/4K3/4k3 w - - 0 1',
      depth: 15
    }
  ];
  
  for (const position of testPositions) {
    try {
      console.log(`\nAnalyzing: ${position.name}`);
      console.log(`FEN: ${position.fen}`);
      
      const startTime = Date.now();
      const result = await analyzeWithStockfish(position.fen, position.depth);
      const endTime = Date.now();
      
      console.log(`✅ Best Move: ${result.best_move}`);
      console.log(`📊 Evaluation: ${JSON.stringify(result.evaluation)}`);
      console.log(`⏱️  Time: ${endTime - startTime}ms`);
      
    } catch (error) {
      console.log(`❌ Error: ${error.message}`);
    }
  }
  
  // Test 3: Deterministic behavior
  console.log('\n\nTest 3: Deterministic Behavior');
  console.log('=================================');
  
  const testFen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
  console.log(`Testing FEN: ${testFen}`);
  
  try {
    const results = [];
    for (let i = 0; i < 3; i++) {
      const result = await analyzeWithStockfish(testFen, 8);
      results.push(result);
      console.log(`Run ${i + 1}: ${result.best_move} (${JSON.stringify(result.evaluation)})`);
    }
    
    // Check if all results are identical
    const allSame = results.every(r => 
      r.best_move === results[0].best_move && 
      JSON.stringify(r.evaluation) === JSON.stringify(results[0].evaluation)
    );
    
    console.log(`\nDeterministic Test: ${allSame ? '✅ PASS' : '❌ FAIL'}`);
    
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
  }
  
  console.log('\n🎉 All tests completed!');
  console.log('\nTo start the server, run: npm start');
  console.log('Then visit: http://localhost:5000/test');
}

// Run tests
runTests().catch(error => {
  console.error('Test suite failed:', error);
  process.exit(1);
});
