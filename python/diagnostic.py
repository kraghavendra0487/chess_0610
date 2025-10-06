#!/usr/bin/env python3
"""
Diagnostic script to test Python/Stockfish integration
This will help identify what's causing the Python process to fail
"""

import sys
import json
import os

def test_imports():
    """Test if all required modules can be imported"""
    print("🔍 Testing Python imports...")
    
    try:
        import stockfish
        print("✅ stockfish module imported successfully")
    except ImportError as e:
        print(f"❌ Failed to import stockfish: {e}")
        return False
    
    try:
        import chess
        print("✅ chess module imported successfully")
    except ImportError as e:
        print(f"❌ Failed to import chess: {e}")
        return False
    
    return True

def test_stockfish_path():
    """Test if Stockfish executable exists and is accessible"""
    print("\n🔍 Testing Stockfish executable...")
    
    stockfish_path = "C:\\Users\\ragha\\Desktop\\Chess_0610\\stockfish\\stockfish.exe"
    
    if os.path.exists(stockfish_path):
        print(f"✅ Stockfish executable found at: {stockfish_path}")
        
        # Test if we can create a Stockfish instance
        try:
            from stockfish import Stockfish
            sf = Stockfish(stockfish_path)
            print("✅ Stockfish instance created successfully")
            return True
        except Exception as e:
            print(f"❌ Failed to create Stockfish instance: {e}")
            return False
    else:
        print(f"❌ Stockfish executable not found at: {stockfish_path}")
        return False

def test_basic_analysis():
    """Test basic Stockfish analysis"""
    print("\n🔍 Testing basic Stockfish analysis...")
    
    try:
        from stockfish import Stockfish
        
        stockfish_path = "C:\\Users\\ragha\\Desktop\\Chess_0610\\stockfish\\stockfish.exe"
        sf = Stockfish(stockfish_path, parameters={
            "Threads": 1,
            "Hash": 64,
            "Skill Level": 20,
            "Minimum Thinking Time": 0,
            "Ponder": False,
            "MultiPV": 1
        })
        
        # Test with starting position
        test_fen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
        sf.set_fen_position(test_fen)
        sf.set_depth(5)  # Use depth 5 for quick test
        
        best_move = sf.get_best_move()
        evaluation = sf.get_evaluation()
        
        print(f"✅ Analysis successful!")
        print(f"   Best move: {best_move}")
        print(f"   Evaluation: {evaluation}")
        return True
        
    except Exception as e:
        print(f"❌ Analysis failed: {e}")
        return False

def test_json_io():
    """Test JSON input/output like the main script"""
    print("\n🔍 Testing JSON input/output...")
    
    try:
        # Simulate the input that would come from Node.js
        test_input = {
            "fen": "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
            "depth": 5
        }
        
        # Test JSON serialization
        json_input = json.dumps(test_input)
        parsed_input = json.loads(json_input)
        
        print(f"✅ JSON serialization/parsing works")
        print(f"   Input: {json_input}")
        print(f"   Parsed: {parsed_input}")
        
        # Test output format
        test_output = {
            "fen": parsed_input["fen"],
            "best_move": "e2e4",
            "evaluation": {"type": "cp", "value": 20},
            "depth": parsed_input["depth"],
            "success": True
        }
        
        json_output = json.dumps(test_output)
        print(f"✅ JSON output format works")
        print(f"   Output: {json_output}")
        
        return True
        
    except Exception as e:
        print(f"❌ JSON I/O failed: {e}")
        return False

def main():
    """Run all diagnostic tests"""
    print("🚀 Python/Stockfish Diagnostic Tool")
    print("=" * 50)
    
    all_tests_passed = True
    
    # Test 1: Imports
    if not test_imports():
        all_tests_passed = False
    
    # Test 2: Stockfish path
    if not test_stockfish_path():
        all_tests_passed = False
    
    # Test 3: Basic analysis
    if not test_basic_analysis():
        all_tests_passed = False
    
    # Test 4: JSON I/O
    if not test_json_io():
        all_tests_passed = False
    
    print("\n" + "=" * 50)
    if all_tests_passed:
        print("🎉 All tests passed! Python/Stockfish integration should work.")
        sys.exit(0)
    else:
        print("❌ Some tests failed. Please fix the issues above.")
        sys.exit(1)

if __name__ == "__main__":
    main()
