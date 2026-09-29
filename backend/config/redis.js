import { createClient } from 'redis';

let redisClient = null;
const memoryStore = new Map();

// Helper for memory expiry
const setMemoryWithExpiry = (key, value, seconds) => {
  memoryStore.set(key, value);
  setTimeout(() => {
    memoryStore.delete(key);
  }, seconds * 1000);
};

// Create a unified interface client
const createFallbackClient = () => {
  console.log('Using in-memory store fallback for caching operations (Redis server offline or unconfigured).');
  return {
    connect: async () => {},
    get: async (key) => memoryStore.get(key) || null,
    set: async (key, val) => {
      memoryStore.set(key, val);
      return 'OK';
    },
    setEx: async (key, seconds, val) => {
      setMemoryWithExpiry(key, val, seconds);
      return 'OK';
    },
    del: async (key) => {
      const existed = memoryStore.has(key);
      memoryStore.delete(key);
      return existed ? 1 : 0;
    },
    incr: async (key) => {
      const val = parseInt(memoryStore.get(key) || '0', 10) + 1;
      memoryStore.set(key, val.toString());
      return val;
    },
    on: () => {}
  };
};

try {
  const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
  const client = createClient({ 
    url: redisUrl,
    socket: {
      connectTimeout: 2000,
      reconnectStrategy: false // disable reconnection attempts to prevent background retry loops
    }
  });
  
  client.on('error', (err) => {
    if (!redisClient || redisClient.isFallback) {
      // already fallback
    } else {
      console.warn('Redis client error encountered, switching to memory fallback:', err.message);
      redisClient = createFallbackClient();
      redisClient.isFallback = true;
    }
  });

  // Wrap connect with a manual timeout of 2 seconds
  const connectWithTimeout = (connClient, timeoutMs) => {
    return Promise.race([
      connClient.connect(),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Redis connection timed out')), timeoutMs))
    ]);
  };

  await connectWithTimeout(client, 2000);
  console.log('Connected to Redis server successfully.');
  redisClient = client;
} catch (err) {
  console.warn('Could not establish Redis server connection, using memory fallback:', err.message);
  redisClient = createFallbackClient();
  redisClient.isFallback = true;
}

export const redis = redisClient;
export default redis;
