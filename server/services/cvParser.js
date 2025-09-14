const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const { validateParsedData } = require('../utils/validation');

const PY = process.env.PYTHON_BIN || 'C:\\Users\\hp\\AppData\\Local\\Programs\\Python\\Python313\\python.exe';
const SCRIPT = path.join(__dirname, 'cv_parser.py');
const TIMEOUT_MS = Number(process.env.CV_PARSE_TIMEOUT_MS || 30000); // Increased to 30s
const MAX_RETRIES = 2;

// Cache for dependency check
let dependenciesChecked = false;
let dependenciesAvailable = false;

/**
 * Check if Python and required dependencies are available
 */
async function checkDependencies() {
  if (dependenciesChecked) {
    return dependenciesAvailable;
  }

  try {
    console.log('Checking Python dependencies...');
    
    // Check if Python is available
    const pythonCheck = await runPythonCommand(['-c', 'import sys; print(sys.version)']);
    console.log(`Python version: ${pythonCheck.stdout.trim()}`);
    
    // Check if required packages are available
    const packageCheck = await runPythonCommand(['-c', `
import sys
try:
    import fitz
    print("PyMuPDF: Available")
except ImportError:
    print("PyMuPDF: Missing - install with: pip install PyMuPDF")
    sys.exit(1)

try:
    import docx
    print("python-docx: Available")
except ImportError:
    print("python-docx: Missing - install with: pip install python-docx")
    sys.exit(1)

print("All dependencies available")
    `]);
    
    console.log('Dependency check results:', packageCheck.stdout);
    dependenciesAvailable = true;
    
  } catch (error) {
    console.error('Dependency check failed:', error.message);
    dependenciesAvailable = false;
  }
  
  dependenciesChecked = true;
  return dependenciesAvailable;
}

/**
 * Run a Python command and return the result
 */
function runPythonCommand(args, timeout = 10000) {
  return new Promise((resolve, reject) => {
    const proc = spawn(PY, args, { stdio: ['ignore', 'pipe', 'pipe'] });
    
    let stdout = '', stderr = '';
    const killTimer = setTimeout(() => {
      proc.kill('SIGKILL');
      reject(new Error('Python command timed out'));
    }, timeout);

    proc.stdout.on('data', d => (stdout += d.toString()));
    proc.stderr.on('data', d => (stderr += d.toString()));
    
    proc.on('close', code => {
      clearTimeout(killTimer);
      if (code === 0) {
        resolve({ stdout, stderr });
      } else {
        reject(new Error(stderr || `Python command exit code: ${code}`));
      }
    });
    
    proc.on('error', reject);
  });
}

/**
 * Enhanced resume parsing with retry logic and better error handling
 */
async function parseResume(filePath, retryCount = 0) {
  console.log(`Parsing resume attempt ${retryCount + 1}/${MAX_RETRIES + 1}: ${filePath}`);
  
  // Validate file exists and is readable
  if (!fs.existsSync(filePath)) {
    throw new Error(`Resume file not found: ${filePath}`);
  }
  
  const stats = fs.statSync(filePath);
  if (!stats.isFile()) {
    throw new Error(`Path is not a file: ${filePath}`);
  }
  
  if (stats.size === 0) {
    throw new Error('Resume file is empty');
  }
  
  if (stats.size > 50 * 1024 * 1024) { // 50MB limit
    throw new Error(`Resume file too large: ${(stats.size / 1024 / 1024).toFixed(2)}MB (max 50MB)`);
  }
  
  // Check dependencies before parsing
  const depsAvailable = await checkDependencies();
  if (!depsAvailable) {
    throw new Error('Required Python dependencies not available. Please install PyMuPDF and python-docx.');
  }
  
  return new Promise((resolve, reject) => {
    console.log(`Spawning Python parser: ${PY} ${SCRIPT} ${filePath}`);
    
    const proc = spawn(PY, [SCRIPT, filePath], { 
      stdio: ['ignore', 'pipe', 'pipe'],
      cwd: __dirname
    });

    let stdout = '', stderr = '';
    let isResolved = false;
    
    // Enhanced timeout handling
    const killTimer = setTimeout(() => {
      if (!isResolved) {
        console.error(`Parser timeout after ${TIMEOUT_MS}ms`);
        proc.kill('SIGTERM'); // Try graceful termination first
        
        setTimeout(() => {
          if (!isResolved) {
            proc.kill('SIGKILL'); // Force kill if still running
          }
        }, 5000);
        
        isResolved = true;
        reject(new Error(`Resume parsing timed out after ${TIMEOUT_MS}ms`));
      }
    }, TIMEOUT_MS);

    proc.stdout.on('data', chunk => {
      stdout += chunk.toString();
    });
    
    proc.stderr.on('data', chunk => {
      stderr += chunk.toString();
    });
    
    proc.on('close', async (code) => {
      clearTimeout(killTimer);
      
      if (isResolved) return; // Already handled by timeout
      isResolved = true;
      
      console.log(`Parser process closed with code: ${code}`);
      if (stderr) {
        console.log('Parser stderr:', stderr);
      }
      
      if (code === 0) {
        try {
          const rawResult = JSON.parse(stdout);
          console.log('Raw parser result keys:', Object.keys(rawResult));
          
          // Check if result contains an error
          if (rawResult.error) {
            console.error('Parser returned error:', rawResult.error);
            
            // Retry on certain errors
            if (retryCount < MAX_RETRIES && isRetryableError(rawResult.error)) {
              console.log(`Retrying due to error: ${rawResult.error}`);
              try {
                const retryResult = await parseResume(filePath, retryCount + 1);
                return resolve(retryResult);
              } catch (retryError) {
                return reject(new Error(`Parse failed after ${retryCount + 1} attempts: ${retryError.message}`));
              }
            }
            
            return reject(new Error(rawResult.error));
          }
          
          // Validate and sanitize the parsed data
          const validatedResult = validateParsedData(rawResult);
          console.log('Parsing successful, confidence:', validatedResult.confidence);
          
          resolve(validatedResult);
          
        } catch (parseError) {
          console.error('JSON parse error:', parseError.message);
          console.error('Raw stdout:', stdout.substring(0, 500));
          
          // Retry on JSON parse errors
          if (retryCount < MAX_RETRIES) {
            console.log('Retrying due to JSON parse error');
            try {
              const retryResult = await parseResume(filePath, retryCount + 1);
              return resolve(retryResult);
            } catch (retryError) {
              return reject(new Error(`JSON parse failed after ${retryCount + 1} attempts: ${parseError.message}`));
            }
          }
          
          reject(new Error(`Invalid JSON response from parser: ${parseError.message}`));
        }
      } else {
        const errorMsg = stderr || `Parser process exited with code ${code}`;
        console.error('Parser process error:', errorMsg);
        
        // Retry on process errors
        if (retryCount < MAX_RETRIES && isRetryableError(errorMsg)) {
          console.log(`Retrying due to process error: ${errorMsg}`);
          try {
            const retryResult = await parseResume(filePath, retryCount + 1);
            return resolve(retryResult);
          } catch (retryError) {
            return reject(new Error(`Process failed after ${retryCount + 1} attempts: ${errorMsg}`));
          }
        }
        
        reject(new Error(errorMsg));
      }
    });
    
    proc.on('error', (error) => {
      clearTimeout(killTimer);
      
      if (isResolved) return;
      isResolved = true;
      
      console.error('Parser process spawn error:', error.message);
      reject(new Error(`Failed to start parser process: ${error.message}`));
    });
  });
}

/**
 * Determine if an error is retryable
 */
function isRetryableError(errorMessage) {
  const retryableErrors = [
    'timeout',
    'connection',
    'temporary',
    'busy',
    'locked',
    'memory',
    'resource'
  ];
  
  const errorLower = errorMessage.toLowerCase();
  return retryableErrors.some(keyword => errorLower.includes(keyword));
}

module.exports = { 
  parseResume, 
  checkDependencies 
};
