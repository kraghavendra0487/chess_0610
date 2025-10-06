#!/usr/bin/env node

/**
 * Test script to debug the ultra-fast PGN analyzer
 */

import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function testUltraFastAnalyzer() {
  return new Promise((resolve, reject) => {
    console.log("🧪 Testing Ultra-Fast PGN Analyzer...");
    
    const pythonPath = "python";
    const scriptPath = path.join(__dirname, "..", "python", "ultra_fast_pgn_analyzer.py");
    
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
        console.log(`❌ Ultra-Fast analyzer failed with code ${code}`);
        resolve(false);
      }
    });
    
    py.on("error", (err) => {
      console.error(`❌ Failed to start Python: ${err.message}`);
      reject(err);
    });
    
    // Send test data
    const testData = JSON.stringify({
      pgn: `[Event "Test Game"]
[Site "Test"]
[Date "2024.01.01"]
[Round "1"]
[White "Test White"]
[Black "Test Black"]
[Result "1-0"]

1. e4 e5 2. Nf3 Nc6 3. Bb5 a6 4. Ba4 Nf6 5. O-O Be7 6. Re1 b5 7. Bb3 d6 8. c3 O-O 9. h3 Nb8 10. d4 Nbd7 11. c4 c6 12. cxb5 axb5 13. Nc3 Bb7 14. Bg5 b4 15. Nb1 h6 16. Bh4 c5 17. dxe5 Nxe4 18. Bxe7 Qxe7 19. exd6 Qf6 20. Nbd2 Nxd6 21. Nc4 Nxc4 22. Bxc4 Nb6 23. Ne5 Rae8 24. Bxf7+ Rxf7 25. Nxf7 Rxe1+ 26. Qxe1 Kxf7 27. Qe3 Qg5 28. Qxg5 hxg5 29. b3 Ke6 30. a3 Kd6 31. axb4 cxb4 32. Ra5 Nd5 33. f3 Bc8 34. Kf2 Bf5 35. Ra7 g6 36. Ra6+ Kc5 37. Ke1 Nf4 38. g3 Nxh3 39. Kd2 Kb5 40. Rd6 Kc5 41. Ra6 Nf2 42. g4 Bd3 43. Re6 1-0`,
      depth: 5,
      max_workers: 2
    });
    
    console.log(`Sending test data...`);
    py.stdin.write(testData);
    py.stdin.end();
  });
}

async function main() {
  try {
    const success = await testUltraFastAnalyzer();
    if (success) {
      console.log("\n🎉 Ultra-Fast analyzer is working!");
    } else {
      console.log("\n❌ Ultra-Fast analyzer has issues. Check the error output above.");
    }
  } catch (error) {
    console.error("❌ Test failed:", error.message);
  }
}

main();
