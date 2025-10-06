/**
 * Integration test script for the multithreaded chess AI system
 * Tests both FastAPI and Node.js endpoints
 */

const fetch = require('node-fetch');

const TEST_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
const TEST_DEPTH = 10;

async function testFastAPI() {
  console.log("🧪 Testing FastAPI service...");
  try {
    const response = await fetch('http://localhost:8000/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fen: TEST_FEN, depth: TEST_DEPTH })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log("✅ FastAPI test passed!");
    console.log(`   Best move: ${data.best_move}`);
    console.log(`   Evaluation: ${JSON.stringify(data.evaluation)}`);
    console.log(`   Multithreaded: ${data.multithreaded}`);
    return true;
  } catch (error) {
    console.log("❌ FastAPI test failed:", error.message);
    return false;
  }
}

async function testNodeBackend() {
  console.log("🧪 Testing Node.js backend...");
  try {
    const response = await fetch(`http://localhost:5000/api/stockfish/analyze?fen=${encodeURIComponent(TEST_FEN)}&depth=${TEST_DEPTH}`);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log("✅ Node.js backend test passed!");
    console.log(`   Best move: ${data.bestmove}`);
    console.log(`   Evaluation: ${JSON.stringify(data.evaluation)}`);
    console.log(`   Multithreaded: ${data.multithreaded}`);
    return true;
  } catch (error) {
    console.log("❌ Node.js backend test failed:", error.message);
    return false;
  }
}

async function testHealthChecks() {
  console.log("🧪 Testing health checks...");
  
  try {
    const fastapiHealth = await fetch('http://localhost:8000/health');
    const nodeHealth = await fetch('http://localhost:5000/health');
    
    console.log(`✅ FastAPI health: ${fastapiHealth.ok ? 'OK' : 'FAILED'}`);
    console.log(`✅ Node.js health: ${nodeHealth.ok ? 'OK' : 'FAILED'}`);
    
    return fastapiHealth.ok && nodeHealth.ok;
  } catch (error) {
    console.log("❌ Health check failed:", error.message);
    return false;
  }
}

async function runAllTests() {
  console.log("🚀 Starting multithreaded AI integration tests...\n");
  
  const results = await Promise.all([
    testHealthChecks(),
    testFastAPI(),
    testNodeBackend()
  ]);
  
  const passed = results.filter(Boolean).length;
  const total = results.length;
  
  console.log(`\n📊 Test Results: ${passed}/${total} tests passed`);
  
  if (passed === total) {
    console.log("🎉 All tests passed! Multithreaded AI system is ready!");
  } else {
    console.log("⚠️  Some tests failed. Check the services are running:");
    console.log("   - FastAPI: http://localhost:8000");
    console.log("   - Node.js: http://localhost:5000");
  }
}

// Run tests if this script is executed directly
if (require.main === module) {
  runAllTests().catch(console.error);
}

module.exports = { testFastAPI, testNodeBackend, testHealthChecks, runAllTests };
