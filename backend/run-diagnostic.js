#!/usr/bin/env node

/**
 * Test script to run Python diagnostic and identify issues
 */

import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runDiagnostic() {
  return new Promise((resolve, reject) => {
    console.log("🔍 Running Python diagnostic...");
    
    const pythonPath = "python"; // or "python3" on some systems
    const scriptPath = path.join(__dirname, "..", "python", "diagnostic.py");
    
    console.log(`Running: ${pythonPath} ${scriptPath}`);
    
    const py = spawn(pythonPath, [scriptPath], {
      stdio: ['inherit', 'inherit', 'inherit']
    });
    
    py.on("close", (code) => {
      if (code === 0) {
        console.log("✅ Diagnostic completed successfully");
        resolve(true);
      } else {
        console.log(`❌ Diagnostic failed with code ${code}`);
        resolve(false);
      }
    });
    
    py.on("error", (err) => {
      console.error(`❌ Failed to start Python diagnostic: ${err.message}`);
      reject(err);
    });
  });
}

async function main() {
  try {
    const success = await runDiagnostic();
    if (success) {
      console.log("\n🎉 Python/Stockfish integration is working!");
    } else {
      console.log("\n❌ Python/Stockfish integration has issues. Check the diagnostic output above.");
    }
  } catch (error) {
    console.error("❌ Diagnostic failed:", error.message);
  }
}

main();
