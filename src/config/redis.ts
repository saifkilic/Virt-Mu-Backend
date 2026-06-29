import { createClient } from 'redis';

const redisUrl = process.env.REDIS_URI || 'redis://localhost:6379';

const redisClient = createClient({
  url: redisUrl,
});

redisClient.on('error', (err) => {
  console.error('Redis Client Connection Error:', err);
});

redisClient.on('connect', () => {
  console.log('Redis client initiating connection...');
});

redisClient.on('ready', () => {
  console.log('Redis client ready and connected');
});

export const connectRedis = async (): Promise<void> => {
  try {
    await redisClient.connect();
  } catch (error) {
    console.error('Failed to connect to Redis:', error);
    // Do not crash the server in dev mode if Redis is not running,
    // but log a warning. For production, you may want to exit.
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
  }
};

export { redisClient };
