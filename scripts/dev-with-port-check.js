#!/usr/bin/env node

const { spawn } = require('child_process');
const { createServer } = require('net');

const PREFERRED_PORT = 5000;

/**
 * Check if a port is available
 * @param {number} port - The port number to check
 * @returns {Promise<boolean>} - true if port is available, false if occupied
 */
function isPortAvailable(port) {
  return new Promise((resolve) => {
    const server = require('net').createServer();
    
    server.listen(port, () => {
      server.once('close', () => {
        resolve(true);
      });
      server.close();
    });
    
    server.on('error', () => {
      resolve(false);
    });
  });
}

/**
 * Find an available port starting from the preferred port
 * @param {number} preferredPort - The preferred port to start checking from
 * @param {number} maxAttempts - Maximum number of ports to check
 * @returns {Promise<number>} - The first available port found
 */
async function findAvailablePort(preferredPort, maxAttempts = 10) {
  for (let i = 0; i < maxAttempts; i++) {
    const port = preferredPort + i;
    const isAvailable = await isPortAvailable(port);
    
    if (isAvailable) {
      return port;
    }
  }
  
  throw new Error(`No available port found starting from ${preferredPort} after checking ${maxAttempts} ports`);
}

/**
 * Main function to start the dev server with port checking
 */
async function startDevServer() {
  console.log(`🔍 Checking if port ${PREFERRED_PORT} is available...`);
  
  const isPreferredPortAvailable = await isPortAvailable(PREFERRED_PORT);
  
  if (isPreferredPortAvailable) {
    console.log(`✅ Port ${PREFERRED_PORT} is available! Starting development server...`);
    startNextDev(PREFERRED_PORT);
  } else {
    console.log(`❌ Port ${PREFERRED_PORT} is occupied. Looking for an alternative...`);
    
    try {
      const availablePort = await findAvailablePort(PREFERRED_PORT);
      console.log(`✅ Found available port: ${availablePort}. Starting development server...`);
      startNextDev(availablePort);
    } catch (error) {
      console.error(`❌ Could not find an available port: ${error.message}`);
      console.log(`💡 Please free up some ports or try running: npm run dev -- -p <port>`);
      process.exit(1);
    }
  }
}

/**
 * Start the Next.js development server
 * @param {number} port - The port to start the server on
 */
function startNextDev(port) {
  const nextDev = spawn('npx', ['next', 'dev', '-p', port.toString()], {
    stdio: 'inherit',
    shell: true
  });
  
  nextDev.on('error', (error) => {
    console.error(`❌ Failed to start Next.js development server: ${error.message}`);
    process.exit(1);
  });
  
  nextDev.on('close', (code) => {
    console.log(`📝 Development server exited with code ${code}`);
    process.exit(code);
  });
  
  // Handle process termination
  process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down development server...');
    nextDev.kill('SIGINT');
  });
  
  process.on('SIGTERM', () => {
    console.log('\n🛑 Shutting down development server...');
    nextDev.kill('SIGTERM');
  });
}

// Start the development server
startDevServer().catch((error) => {
  console.error(`❌ Error starting development server: ${error.message}`);
  process.exit(1);
});
