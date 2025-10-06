#!/usr/bin/env python3
"""
Python environment setup script for Chess AI
This script ensures all dependencies are properly installed and configured
"""

import subprocess
import sys
import os
import json

def run_command(command, description):
    """Run a command and handle errors"""
    print(f"🔧 {description}...")
    try:
        result = subprocess.run(command, shell=True, capture_output=True, text=True)
        if result.returncode == 0:
            print(f"✅ {description} completed successfully")
            return True
        else:
            print(f"❌ {description} failed: {result.stderr}")
            return False
    except Exception as e:
        print(f"❌ {description} failed with exception: {e}")
        return False

def check_python_version():
    """Check if Python version is compatible"""
    print("🔍 Checking Python version...")
    version = sys.version_info
    if version.major >= 3 and version.minor >= 8:
        print(f"✅ Python {version.major}.{version.minor}.{version.micro} is compatible")
        return True
    else:
        print(f"❌ Python {version.major}.{version.minor}.{version.micro} is not compatible. Need Python 3.8+")
        return False

def install_requirements():
    """Install Python requirements"""
    requirements_file = os.path.join(os.path.dirname(__file__), "requirements.txt")
    
    if not os.path.exists(requirements_file):
        print(f"❌ Requirements file not found: {requirements_file}")
        return False
    
    print(f"📦 Installing requirements from {requirements_file}")
    return run_command(f"pip install -r {requirements_file}", "Installing Python dependencies")

def test_stockfish_path():
    """Test if Stockfish executable exists"""
    print("🔍 Testing Stockfish executable...")
    
    stockfish_path = "C:\\Users\\ragha\\Desktop\\Chess_0610\\stockfish\\stockfish.exe"
    
    if os.path.exists(stockfish_path):
        print(f"✅ Stockfish executable found at: {stockfish_path}")
        return True
    else:
        print(f"❌ Stockfish executable not found at: {stockfish_path}")
        print("Please ensure Stockfish is properly installed")
        return False

def test_imports():
    """Test if all required modules can be imported"""
    print("🔍 Testing Python imports...")
    
    modules = [
        "stockfish",
        "chess", 
        "fastapi",
        "uvicorn",
        "pydantic"
    ]
    
    all_imports_ok = True
    
    for module in modules:
        try:
            __import__(module)
            print(f"✅ {module} imported successfully")
        except ImportError as e:
            print(f"❌ Failed to import {module}: {e}")
            all_imports_ok = False
    
    return all_imports_ok

def test_basic_stockfish():
    """Test basic Stockfish functionality"""
    print("🔍 Testing basic Stockfish functionality...")
    
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
        sf.set_depth(3)  # Use depth 3 for quick test
        
        best_move = sf.get_best_move()
        evaluation = sf.get_evaluation()
        
        print(f"✅ Stockfish test successful!")
        print(f"   Best move: {best_move}")
        print(f"   Evaluation: {evaluation}")
        return True
        
    except Exception as e:
        print(f"❌ Stockfish test failed: {e}")
        return False

def create_test_script():
    """Create a simple test script"""
    test_script = """#!/usr/bin/env python3
import sys
import json
from stockfish import Stockfish

def main():
    try:
        stockfish_path = "C:\\\\Users\\\\ragha\\\\Desktop\\\\Chess_0610\\\\stockfish\\\\stockfish.exe"
        sf = Stockfish(stockfish_path, parameters={
            "Threads": 1,
            "Hash": 64,
            "Skill Level": 20,
            "Minimum Thinking Time": 0,
            "Ponder": False,
            "MultiPV": 1
        })
        
        # Read input from stdin
        raw_input = sys.stdin.read()
        data = json.loads(raw_input)
        
        fen = data["fen"]
        depth = data.get("depth", 10)
        
        sf.set_fen_position(fen)
        sf.set_depth(depth)
        
        best_move = sf.get_best_move()
        evaluation = sf.get_evaluation()
        
        result = {
            "fen": fen,
            "best_move": best_move,
            "evaluation": evaluation,
            "depth": depth,
            "success": True
        }
        
        print(json.dumps(result))
        sys.stdout.flush()
        
    except Exception as e:
        error_result = {
            "error": str(e),
            "success": False
        }
        print(json.dumps(error_result))
        sys.stdout.flush()
        sys.exit(1)

if __name__ == "__main__":
    main()
"""
    
    test_file = os.path.join(os.path.dirname(__file__), "test_engine.py")
    try:
        with open(test_file, 'w') as f:
            f.write(test_script)
        print(f"✅ Test script created: {test_file}")
        return True
    except Exception as e:
        print(f"❌ Failed to create test script: {e}")
        return False

def main():
    """Main setup function"""
    print("🚀 Chess AI Python Environment Setup")
    print("=" * 50)
    
    all_tests_passed = True
    
    # Check Python version
    if not check_python_version():
        all_tests_passed = False
    
    # Install requirements
    if not install_requirements():
        all_tests_passed = False
    
    # Test Stockfish path
    if not test_stockfish_path():
        all_tests_passed = False
    
    # Test imports
    if not test_imports():
        all_tests_passed = False
    
    # Test basic Stockfish functionality
    if not test_basic_stockfish():
        all_tests_passed = False
    
    # Create test script
    if not create_test_script():
        all_tests_passed = False
    
    print("\n" + "=" * 50)
    if all_tests_passed:
        print("🎉 Environment setup completed successfully!")
        print("✅ All dependencies are properly installed and configured")
        print("✅ Stockfish is working correctly")
        print("✅ Ready for chess analysis!")
    else:
        print("❌ Environment setup failed. Please fix the issues above.")
        print("\nTroubleshooting tips:")
        print("1. Ensure Python 3.8+ is installed")
        print("2. Ensure pip is up to date: python -m pip install --upgrade pip")
        print("3. Ensure Stockfish executable exists at the specified path")
        print("4. Try running: pip install --upgrade stockfish chess fastapi uvicorn pydantic")
    
    return all_tests_passed

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
