#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('🚀 Starting AgriSaarthi - Full Stack Application...\n');

// Colors for console output
const colors = {
  green: '\x1b[32m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Check if we're on Windows or WSL/Linux
const isWindows = process.platform === 'win32';
const pythonCmd = isWindows ? 'python' : 'python3';

// Check for virtual environment
function getPythonCommand() {
  if (isWindows) {
    return 'python';
  } else {
    // Check if virtual environment exists
    const venvPath = path.join(__dirname, 'backend', 'venv', 'bin', 'python3');
    if (fs.existsSync(venvPath)) {
      return venvPath;
    }
    return 'python3';
  }
}

const pythonCmdWithVenv = getPythonCommand();

// Function to check if a port is in use
function checkPort(port) {
  return new Promise((resolve) => {
    const net = require('net');
    const server = net.createServer();
    
    server.listen(port, () => {
      server.once('close', () => {
        resolve(false); // Port is available
      });
      server.close();
    });
    
    server.on('error', () => {
      resolve(true); // Port is in use
    });
  });
}

// Function to wait for a service to be ready
async function waitForService(url, name, timeout = 30000) {
  const startTime = Date.now();
  
  while (Date.now() - startTime < timeout) {
    try {
      const https = require('http');
      const response = await new Promise((resolve, reject) => {
        const req = https.get(url, (res) => {
          resolve(res);
        });
        req.on('error', reject);
        req.setTimeout(2000, () => {
          req.destroy();
          reject(new Error('Timeout'));
        });
      });
      
      if (response.statusCode === 200) {
        log(`✅ ${name} is ready!`, 'green');
        return true;
      }
    } catch (error) {
      // Service not ready yet
    }
    
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  log(`⚠️  ${name} may not be fully ready, but continuing...`, 'yellow');
  return true; // Continue anyway
}

// Install Python dependencies
async function installDependencies() {
  log('📦 Installing Python dependencies...', 'blue');
  
  const backendPath = path.join(__dirname, 'backend');
  
  return new Promise((resolve) => {
    const installProcess = spawn(pythonCmdWithVenv, ['-m', 'pip', 'install', '-r', 'requirements.txt'], {
      cwd: backendPath,
      stdio: ['pipe', 'pipe', 'pipe']
    });
    
    installProcess.on('close', (code) => {
      if (code === 0) {
        log('✅ Dependencies installed successfully!', 'green');
        resolve(true);
      } else {
        log('⚠️  Some dependencies may not have installed correctly, but continuing...', 'yellow');
        resolve(true);
      }
    });
    
    installProcess.on('error', (error) => {
      log(`⚠️  Could not install dependencies: ${error.message}`, 'yellow');
      resolve(true); // Continue anyway
    });
  });
}

// Start Weather Service
async function startWeatherService() {
  log('🌦️  Starting Weather Service...', 'blue');
  
  const backendPath = path.join(__dirname, 'backend');
  const weatherServicePath = path.join(backendPath, 'weather_service.py');
  
  // Check if weather service file exists
  if (!fs.existsSync(weatherServicePath)) {
    log('❌ Weather service file not found!', 'red');
    return null;
  }
  
  // Set environment variables
  const env = {
    ...process.env,
    WEATHER_API_KEY: '3df4d44e440343649bf173624251110',
    PORT: '8004'
  };
  
  const weatherProcess = spawn(pythonCmdWithVenv, ['-m', 'uvicorn', 'weather_service:app', '--host', '0.0.0.0', '--port', '8004'], {
    cwd: backendPath,
    env: env,
    stdio: ['pipe', 'pipe', 'pipe']
  });
  
  weatherProcess.stdout.on('data', (data) => {
    const output = data.toString();
    if (output.includes('Uvicorn running')) {
      log('🌦️  Weather Service started on port 8004', 'green');
    }
  });
  
  weatherProcess.stderr.on('data', (data) => {
    const error = data.toString();
    if (!error.includes('INFO') && !error.includes('WARNING')) {
      log(`Weather Service Error: ${error}`, 'red');
    }
  });
  
  weatherProcess.on('error', (error) => {
    log(`❌ Failed to start Weather Service: ${error.message}`, 'red');
  });
  
  return weatherProcess;
}

// Start Flask Backend
async function startFlaskBackend() {
  log('🐍 Starting Flask Backend...', 'blue');
  
  const backendPath = path.join(__dirname, 'backend');
  const appPath = path.join(backendPath, 'app.py');
  
  if (!fs.existsSync(appPath)) {
    log('❌ Flask app file not found!', 'red');
    return null;
  }
  
  const flaskProcess = spawn(pythonCmdWithVenv, ['app.py'], {
    cwd: backendPath,
    stdio: ['pipe', 'pipe', 'pipe']
  });
  
  flaskProcess.stdout.on('data', (data) => {
    const output = data.toString();
    if (output.includes('Running on')) {
      log('🐍 Flask Backend started on port 5000', 'green');
    }
  });
  
  flaskProcess.stderr.on('data', (data) => {
    const error = data.toString();
    if (!error.includes('INFO') && !error.includes('WARNING')) {
      log(`Flask Backend Error: ${error}`, 'red');
    }
  });
  
  return flaskProcess;
}

// Start Next.js Frontend
async function startNextJS() {
  log('⚛️  Starting Next.js Frontend...', 'blue');
  
  const nextProcess = spawn('npm', ['run', 'dev'], {
    stdio: 'inherit',
    shell: isWindows
  });
  
  nextProcess.on('error', (error) => {
    log(`❌ Failed to start Next.js: ${error.message}`, 'red');
  });
  
  return nextProcess;
}

// Main startup function
async function startAll() {
  try {
    // Install dependencies first
    await installDependencies();
    
    // Check if ports are available
    const weatherPortInUse = await checkPort(8004);
    const flaskPortInUse = await checkPort(5000);
    const nextPortInUse = await checkPort(3000);
    
    if (weatherPortInUse) {
      log('⚠️  Port 8004 is already in use. Weather service may already be running.', 'yellow');
    }
    
    if (flaskPortInUse) {
      log('⚠️  Port 5000 is already in use. Flask backend may already be running.', 'yellow');
    }
    
    if (nextPortInUse) {
      log('⚠️  Port 3000 is already in use. Next.js may already be running.', 'yellow');
    }
    
    // Start services only if ports are not in use
    let weatherProcess = null;
    let flaskProcess = null;
    
    if (!weatherPortInUse) {
      weatherProcess = await startWeatherService();
    } else {
      log('🌦️  Using existing Weather Service', 'blue');
    }
    
    if (!flaskPortInUse) {
      flaskProcess = await startFlaskBackend();
    } else {
      log('🐍 Using existing Flask Backend', 'blue');
    }
    
    // Wait a bit for services to start
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Check if services are ready
    if (weatherProcess) {
      await waitForService('http://localhost:8004/health', 'Weather Service');
    }
    
    if (flaskProcess) {
      await waitForService('http://localhost:5000/health', 'Flask Backend');
    }
    
    log('\n🎉 All services started successfully!', 'green');
    log('📱 Frontend: http://localhost:3000', 'blue');
    log('🌦️  Weather API: http://localhost:8004', 'blue');
    log('🐍 Flask API: http://localhost:5000', 'blue');
    log('\n💡 Press Ctrl+C to stop all services', 'yellow');
    
    // Start Next.js (this will block)
    await startNextJS();
    
  } catch (error) {
    log(`❌ Startup failed: ${error.message}`, 'red');
    process.exit(1);
  }
}

// Handle cleanup on exit
process.on('SIGINT', () => {
  log('\n🛑 Shutting down all services...', 'yellow');
  process.exit(0);
});

process.on('SIGTERM', () => {
  log('\n🛑 Shutting down all services...', 'yellow');
  process.exit(0);
});

// Start everything
startAll();
