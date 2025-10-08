const { createServer } = require('net');

/**
 * Check if a port is available
 * @param {number} port - The port number to check
 * @returns {Promise<boolean>} - true if port is available, false if occupied
 */
async function isPortAvailable(port) {
  return new Promise((resolve) => {
    const server = createServer();
    
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
 * @param {number} maxAttempts - Maximum number of ports to check (default: 10)
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
 * Check port availability and log the result
 * @param {number} port - The port number to check
 */
async function checkPortAndLog(port) {
  const isAvailable = await isPortAvailable(port);
  
  if (isAvailable) {
    console.log(`✅ Port ${port} is available`);
  } else {
    console.log(`❌ Port ${port} is occupied`);
    console.log(`💡 Trying to find an alternative port...`);
    
    try {
      const alternativePort = await findAvailablePort(port);
      console.log(`✅ Found available port: ${alternativePort}`);
    } catch (error) {
      console.error(`❌ Could not find an available port: ${error.message}`);
    }
  }
}

module.exports = {
  isPortAvailable,
  findAvailablePort,
  checkPortAndLog
};
