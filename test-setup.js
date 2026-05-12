// Test script to verify all dependencies are working
const { spawn } = require('child_process');
const path = require('path');

console.log('🔍 Testing HR Portal Dependencies...\n');

// Test 1: Node.js and npm versions
console.log('✅ Node.js version:', process.version);

// Test 2: Python availability
const testPython = () => {
  return new Promise((resolve) => {
    const python = spawn('python', ['--version'], { stdio: 'pipe' });
    python.on('close', (code) => {
      if (code === 0) {
        console.log('✅ Python is available');
        resolve(true);
      } else {
        console.log('❌ Python not found');
        resolve(false);
      }
    });
    python.on('error', () => {
      console.log('❌ Python not found');
      resolve(false);
    });
  });
};

// Test 3: Python dependencies
const testPythonDeps = () => {
  return new Promise((resolve) => {
    const python = spawn('python', ['-c', 'import fitz, docx; print("PyMuPDF and python-docx are installed")'], { stdio: 'pipe' });
    let output = '';
    python.stdout.on('data', (data) => {
      output += data.toString();
    });
    python.on('close', (code) => {
      if (code === 0) {
        console.log('✅ Python dependencies (PyMuPDF, python-docx) are installed');
        resolve(true);
      } else {
        console.log('❌ Python dependencies missing');
        resolve(false);
      }
    });
  });
};

// Test 4: CV Parser
const testCVParser = () => {
  return new Promise((resolve) => {
    const cvParser = path.join(__dirname, 'server', 'services', 'cv_parser.py');
    const python = spawn('python', [cvParser], { stdio: 'pipe' });
    let output = '';
    python.stdout.on('data', (data) => {
      output += data.toString();
    });
    python.on('close', (code) => {
      try {
        const result = JSON.parse(output);
        if (result.error === 'missing file path') {
          console.log('✅ CV Parser is working correctly');
          resolve(true);
        } else {
          console.log('❌ CV Parser unexpected response');
          resolve(false);
        }
      } catch (e) {
        console.log('❌ CV Parser failed to parse JSON');
        resolve(false);
      }
    });
  });
};

// Test 5: MongoDB connection (basic check)
const testMongoDB = () => {
  return new Promise((resolve) => {
    const mongo = spawn('mongod', ['--version'], { stdio: 'pipe' });
    mongo.on('close', (code) => {
      if (code === 0) {
        console.log('✅ MongoDB is available');
        resolve(true);
      } else {
        console.log('❌ MongoDB not found');
        resolve(false);
      }
    });
    mongo.on('error', () => {
      console.log('❌ MongoDB not found');
      resolve(false);
    });
  });
};

// Run all tests
async function runTests() {
  console.log('🧪 Running dependency tests...\n');
  
  await testPython();
  await testPythonDeps();
  await testCVParser();
  await testMongoDB();
  
  console.log('\n🎉 Dependency check complete!');
  console.log('\n📋 Next steps:');
  console.log('1. Start MongoDB: mongod');
  console.log('2. Start the backend: cd server && npm start');
  console.log('3. Start the frontend: cd client && npm start');
  console.log('4. Visit http://localhost:3000 to access the application');
}

runTests().catch(console.error);