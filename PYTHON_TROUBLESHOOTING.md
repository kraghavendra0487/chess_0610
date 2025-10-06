# 🚨 PYTHON/STOCKFISH TROUBLESHOOTING GUIDE

## **Issue: Python process exited with code 1**

### **🔍 Quick Diagnosis Steps:**

#### **Step 1: Run the Debug Tool**
```bash
cd backend
node debug-python.js
```

This will:
- Test Python imports
- Check Stockfish executable path
- Test basic analysis
- Show detailed error messages

#### **Step 2: Check Python Installation**
```bash
python --version
python -c "import sys; print(sys.executable)"
```

#### **Step 3: Check Stockfish Path**
Verify the path in `python/engine.py`:
```python
STOCKFISH_PATH = "C:\\Users\\ragha\\Desktop\\Chess_0610\\stockfish\\stockfish.exe"
```

#### **Step 4: Test Stockfish Directly**
```bash
cd stockfish
./stockfish.exe
# Type: quit
```

#### **Step 5: Check Python Dependencies**
```bash
pip install stockfish chess
```

## **🛠️ Common Fixes:**

### **Fix 1: Python Not Found**
**Error**: `Failed to start Python process`
**Solution**:
```bash
# Try different Python commands
python --version
python3 --version
py --version

# Update the path in python-runner.js if needed
const pythonPath = "python3"; // or "py" on Windows
```

### **Fix 2: Stockfish Path Wrong**
**Error**: `Stockfish executable not found`
**Solution**:
1. Check if `stockfish.exe` exists at the path
2. Update `STOCKFISH_PATH` in `python/engine.py`
3. Use absolute path: `C:\\Users\\ragha\\Desktop\\Chess_0610\\stockfish\\stockfish.exe`

### **Fix 3: Missing Dependencies**
**Error**: `ModuleNotFoundError: No module named 'stockfish'`
**Solution**:
```bash
pip install stockfish chess
# or
pip3 install stockfish chess
```

### **Fix 4: Permission Issues**
**Error**: `Permission denied` or `Access denied`
**Solution**:
1. Run as administrator
2. Check file permissions on `stockfish.exe`
3. Try running from different directory

### **Fix 5: Stockfish Parameters**
**Error**: `Analysis failed` or `Invalid parameter`
**Solution**: Use the safe parameters in `engine.py`:
```python
parameters={
    "Threads": 1,
    "Hash": 128,
    "Skill Level": 20,
    "Minimum Thinking Time": 0,
    "Ponder": False,
    "MultiPV": 1
}
```

## **🔧 Advanced Debugging:**

### **Enable Verbose Logging**
Add this to `python/engine.py`:
```python
import logging
logging.basicConfig(level=logging.DEBUG)

def main():
    try:
        print("DEBUG: Starting analysis...", file=sys.stderr)
        raw_input = sys.stdin.read()
        print(f"DEBUG: Received input: {raw_input}", file=sys.stderr)
        # ... rest of code
```

### **Test Individual Components**
```python
# Test 1: Import test
python -c "from stockfish import Stockfish; print('Stockfish imported OK')"

# Test 2: Instance test
python -c "from stockfish import Stockfish; sf = Stockfish('path/to/stockfish.exe'); print('Instance created OK')"

# Test 3: Analysis test
python -c "from stockfish import Stockfish; sf = Stockfish('path/to/stockfish.exe'); sf.set_fen_position('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'); print(sf.get_best_move())"
```

## **📋 System Requirements:**

### **Windows:**
- Python 3.7+ installed
- Stockfish executable (stockfish.exe)
- Required Python packages: `stockfish`, `chess`

### **Path Requirements:**
- Python in system PATH
- Stockfish executable accessible
- Write permissions in project directory

## **🎯 Quick Test Commands:**

### **Test Python Script Directly:**
```bash
cd python
echo '{"fen": "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1", "depth": 5}' | python engine.py
```

### **Test with Node.js:**
```bash
cd backend
node debug-python.js
```

### **Test Integration:**
```bash
cd backend
node test-integration.js
```

## **🚀 Performance vs Stability:**

### **Stable Configuration (Current):**
- 1 thread per worker
- 128MB hash
- Conservative parameters
- **Use this if you're having issues**

### **Fast Configuration (After fixing issues):**
- 2 threads per worker
- 256MB hash
- Optimized parameters
- **Use this for better performance**

## **📞 Still Having Issues?**

1. **Run the diagnostic**: `node debug-python.js`
2. **Check the error output** - it will show exactly what's failing
3. **Verify all paths** - Python, Stockfish, project directory
4. **Test components individually** - Python, Stockfish, imports
5. **Check system requirements** - Windows version, permissions

## **🔍 Error Code Meanings:**

- **Code 0**: Success
- **Code 1**: General error (most common)
- **Code 2**: Python syntax error
- **Code 3**: Import error
- **Code 126**: Permission denied
- **Code 127**: Command not found

The debug tool will help identify which specific component is failing!
