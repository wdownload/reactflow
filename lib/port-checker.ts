import { createServer } from 'net';

/**
 * Check if a port is available
 * @param port - The port number to check
 * @returns Promise<boolean> - true if port is available, false if occupied
 */
export async function isPortAvailable(port: number): Promise<boolean> {
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
 * @param preferredPort - The preferred port to start checking from
 * @param maxAttempts - Maximum number of ports to check (default: 10)
 * @returns Promise<number> - The first available port found
 */
export async function findAvailablePort(preferredPort: number, maxAttempts: number = 10): Promise<number> {
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
 * @param port - The port number to check
 */
export async function checkPortAndLog(port: number): Promise<void> {
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
      console.error(`❌ Could not find an available port: ${error}`);
    }
  }
}
