const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Installing react-chessboard...');

try {
  // Install the package
  execSync('npm install react-chessboard', { 
    cwd: path.join(__dirname), 
    stdio: 'inherit' 
  });
  
  console.log('✅ react-chessboard installed successfully!');
  console.log('You can now run npm run dev to start the development server.');
  
} catch (error) {
  console.error('❌ Error installing react-chessboard:', error.message);
  process.exit(1);
}
