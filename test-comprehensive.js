#!/usr/bin/env node
/**
 * Comprehensive integration test for Chess AI system
 * Tests all components: Frontend, Backend, Python, Stockfish
 */

import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";
import fetch from "node-fetch";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Test configuration
const TEST_CONFIG = {
  backendUrl: "http://localhost:5000",
  testFen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
  testDepth: 5,
  timeout: 30000 // 30 seconds
};

class TestRunner {
  constructor() {
    this.results = [];
    this.startTime = Date.now();
  }

  log(message, type = "info") {
    const timestamp = new Date().toISOString();
    const prefix = type === "error" ? "❌" : type === "success" ? "✅" : "🔍";
    console.log(`${prefix} [${timestamp}] ${message}`);
  }

  async runTest(name, testFunction) {
    this.log(`Starting test: ${name}`);
    const testStart = Date.now();
    
    try {
      const result = await Promise.race([
        testFunction(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error("Test timeout")), TEST_CONFIG.timeout)
        )
      ]);
      
      const duration = Date.now() - testStart;
      this.results.push({ name, status: "passed", duration, result });
      this.log(`Test passed: ${name} (${duration}ms)`, "success");
      return result;
    } catch (error) {
      const duration = Date.now() - testStart;
      this.results.push({ name, status: "failed", duration, error: error.message });
      this.log(`Test failed: ${name} - ${error.message}`, "error");
      return null;
    }
  }

  async testPythonEnvironment() {
    return new Promise((resolve, reject) => {
      const pythonPath = "python";
      const scriptPath = path.join(__dirname, "..", "python", "setup_environment.py");
      
      const py = spawn(pythonPath, [scriptPath], {
        stdio: ['pipe', 'pipe', 'pipe']
      });
      
      let output = "";
      let error = "";
      
      py.stdout.on("data", (data) => {
        output += data.toString();
      });
      
      py.stderr.on("data", (data) => {
        error += data.toString();
      });
      
      py.on("close", (code) => {
        if (code === 0) {
          resolve({ output, error });
        } else {
          reject(new Error(`Python environment test failed (code ${code}): ${error}`));
        }
      });
      
      py.on("error", (err) => {
        reject(new Error(`Failed to start Python environment test: ${err.message}`));
      });
    });
  }

  async testStockfishDirect() {
    return new Promise((resolve, reject) => {
      const pythonPath = "python";
      const scriptPath = path.join(__dirname, "..", "python", "engine_safe.py");
      
      const py = spawn(pythonPath, [scriptPath], {
        stdio: ['pipe', 'pipe', 'pipe']
      });
      
      let output = "";
      let error = "";
      
      py.stdout.on("data", (data) => {
        output += data.toString();
      });
      
      py.stderr.on("data", (data) => {
        error += data.toString();
      });
      
      py.on("close", (code) => {
        if (code === 0) {
          try {
            const result = JSON.parse(output);
            if (result.success) {
              resolve(result);
            } else {
              reject(new Error(result.error || "Stockfish analysis failed"));
            }
          } catch (err) {
            reject(new Error(`Invalid JSON from Stockfish: ${err.message}`));
          }
        } else {
          reject(new Error(`Stockfish test failed (code ${code}): ${error}`));
        }
      });
      
      py.on("error", (err) => {
        reject(new Error(`Failed to start Stockfish test: ${err.message}`));
      });
      
      // Send test data
      const inputData = JSON.stringify({ 
        fen: TEST_CONFIG.testFen, 
        depth: TEST_CONFIG.testDepth 
      });
      py.stdin.write(inputData);
      py.stdin.end();
    });
  }

  async testBackendHealth() {
    const response = await fetch(`${TEST_CONFIG.backendUrl}/health`);
    if (!response.ok) {
      throw new Error(`Backend health check failed: ${response.status}`);
    }
    return await response.json();
  }

  async testBackendAnalysis() {
    const response = await fetch(`${TEST_CONFIG.backendUrl}/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fen: TEST_CONFIG.testFen,
        depth: TEST_CONFIG.testDepth
      })
    });
    
    if (!response.ok) {
      throw new Error(`Backend analysis failed: ${response.status}`);
    }
    
    const result = await response.json();
    if (!result.success) {
      throw new Error(result.error || "Backend analysis returned failure");
    }
    
    return result;
  }

  async testFrontendAPI() {
    const response = await fetch(`${TEST_CONFIG.backendUrl}/api/stockfish/analyze?fen=${encodeURIComponent(TEST_CONFIG.testFen)}&depth=${TEST_CONFIG.testDepth}`);
    
    if (!response.ok) {
      throw new Error(`Frontend API failed: ${response.status}`);
    }
    
    const result = await response.json();
    if (!result.success) {
      throw new Error(result.error || "Frontend API returned failure");
    }
    
    return result;
  }

  async testPGNAnalysis() {
    const testPGN = `[Event "Test Game"]
[Site "Test"]
[Date "2024.01.01"]
[Round "1"]
[White "Test White"]
[Black "Test Black"]
[Result "1-0"]

1. e4 e5 2. Nf3 Nc6 3. Bb5 a6 4. Ba4 Nf6 5. O-O Be7 6. Re1 b5 7. Bb3 d6 8. c3 O-O 9. h3 Nb8 10. d4 Nbd7 11. c4 c6 12. cxb5 axb5 13. Nc3 Bb7 14. Bg5 b4 15. Nb1 h6 16. Bh4 c5 17. dxe5 Nxe4 18. Bxe7 Qxe7 19. exd6 Qf6 20. Nbd2 Nxd6 21. Nc4 Nxc4 22. Bxc4 Nb6 23. Ne5 Rae8 24. Bxf7+ Rxf7 25. Nxf7 Rxe1+ 26. Qxe1 Kxf7 27. Qe3 Qg5 28. Qxg5 hxg5 29. b3 Ke6 30. a3 Kd6 31. axb4 cxb4 32. Ra5 Nd5 33. f3 Bc8 34. Kf2 Bf5 35. Ra7 g6 36. Ra6+ Kc5 37. Ke1 Nf4 38. g3 Nxh3 39. Kd2 Kb5 40. Rd6 Kc5 41. Ra6 Nf2 42. g4 Bd3 43. Re6 1-0`;

    const response = await fetch(`${TEST_CONFIG.backendUrl}/evaluate-game`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        moves: ["e4", "e5", "Nf3", "Nc6", "Bb5", "a6", "Ba4", "Nf6", "O-O", "Be7"],
        depth: 5,
        threads: 2,
        useMultiWorker: true
      })
    });
    
    if (!response.ok) {
      throw new Error(`PGN analysis failed: ${response.status}`);
    }
    
    const result = await response.json();
    return result;
  }

  async runAllTests() {
    this.log("🚀 Starting comprehensive Chess AI integration tests");
    this.log(`Backend URL: ${TEST_CONFIG.backendUrl}`);
    this.log(`Test FEN: ${TEST_CONFIG.testFen}`);
    this.log(`Test Depth: ${TEST_CONFIG.testDepth}`);
    this.log("=" * 60);

    // Test 1: Python Environment
    await this.runTest("Python Environment Setup", () => this.testPythonEnvironment());
    
    // Test 2: Direct Stockfish Analysis
    await this.runTest("Direct Stockfish Analysis", () => this.testStockfishDirect());
    
    // Test 3: Backend Health Check
    await this.runTest("Backend Health Check", () => this.testBackendHealth());
    
    // Test 4: Backend Analysis API
    await this.runTest("Backend Analysis API", () => this.testBackendAnalysis());
    
    // Test 5: Frontend API
    await this.runTest("Frontend API", () => this.testFrontendAPI());
    
    // Test 6: PGN Analysis
    await this.runTest("PGN Analysis", () => this.testPGNAnalysis());

    this.printSummary();
  }

  printSummary() {
    const totalTime = Date.now() - this.startTime;
    const passed = this.results.filter(r => r.status === "passed").length;
    const failed = this.results.filter(r => r.status === "failed").length;
    
    this.log("=" * 60);
    this.log("📊 TEST SUMMARY");
    this.log("=" * 60);
    this.log(`Total Tests: ${this.results.length}`);
    this.log(`Passed: ${passed}`, passed > 0 ? "success" : "info");
    this.log(`Failed: ${failed}`, failed > 0 ? "error" : "info");
    this.log(`Total Time: ${totalTime}ms`);
    
    if (failed > 0) {
      this.log("\n❌ FAILED TESTS:");
      this.results.filter(r => r.status === "failed").forEach(test => {
        this.log(`  - ${test.name}: ${test.error}`, "error");
      });
    }
    
    if (passed === this.results.length) {
      this.log("\n🎉 ALL TESTS PASSED! Chess AI system is working correctly!", "success");
    } else {
      this.log("\n⚠️  Some tests failed. Please check the errors above.", "error");
    }
  }
}

// Main execution
async function main() {
  const tester = new TestRunner();
  await tester.runAllTests();
}

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error.message);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Run tests
main().catch(error => {
  console.error('❌ Test runner failed:', error.message);
  process.exit(1);
});
