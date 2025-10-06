#!/usr/bin/env node

/**
 * Simple test script to debug Python/Stockfish integration
 * Run this to identify the specific issue
 */

import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function testPythonScript() {
  return new Promise((resolve, reject) => {
    console.log("🧪 Testing Python script directly...");
    
    const pythonPath = "python";
    const scriptPath = path.join(__dirname, "..", "python", "engine_safe.py");
    
    console.log(`Running: ${pythonPath} ${scriptPath}`);
    
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
      console.log(`\n📊 Results:`);
      console.log(`Exit code: ${code}`);
      console.log(`Standard output: ${output}`);
      console.log(`Error output: ${error}`);
      
      if (code === 0) {
        try {
          const parsed = JSON.parse(output);
          console.log(`✅ JSON parsed successfully:`, parsed);
          resolve(true);
        } catch (e) {
          console.log(`❌ Failed to parse JSON: ${e.message}`);
          resolve(false);
        }
      } else {
        console.log(`❌ Python script failed with code ${code}`);
        resolve(false);
      }
    });
    
    py.on("error", (err) => {
      console.error(`❌ Failed to start Python: ${err.message}`);
      reject(err);
    });
    
    // Send test data
    const testData = JSON.stringify({
      fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
      depth: 5
    });
    
    console.log(`Sending test data: ${testData}`);
    py.stdin.write(testData);
    py.stdin.end();
  });
}

async function testDiagnostic() {
  return new Promise((resolve, reject) => {
    console.log("\n🔍 Running diagnostic script...");
    
    const pythonPath = "python";
    const scriptPath = path.join(__dirname, "..", "python", "diagnostic.py");
    
    const py = spawn(pythonPath, [scriptPath], {
      stdio: ['inherit', 'inherit', 'inherit']
    });
    
    py.on("close", (code) => {
      resolve(code === 0);
    });
    
    py.on("error", (err) => {
      reject(err);
    });
  });
}

async function main() {
  console.log("🚀 Python/Stockfish Debug Tool");
  console.log("=" * 40);
  
  try {
    // Test 1: Run diagnostic
    console.log("Step 1: Running diagnostic...");
    const diagnosticPassed = await testDiagnostic();
    
    if (!diagnosticPassed) {
      console.log("\n❌ Diagnostic failed. Please check:");
      console.log("   - Python is installed and in PATH");
      console.log("   - Stockfish path is correct");
      console.log("   - Required packages are installed (pip install stockfish chess)");
      return;
    }
    
    // Test 2: Test the actual script
    console.log("\nStep 2: Testing engine script...");
    const scriptPassed = await testPythonScript();
    
    if (scriptPassed) {
      console.log("\n🎉 Everything is working! The issue might be elsewhere.");
    } else {
      console.log("\n❌ Engine script failed. Check the error output above.");
    }
    
  } catch (error) {
    console.error("❌ Test failed:", error.message);
  }
}

main();
