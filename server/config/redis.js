const IORedis = require('ioredis');

let isRedisConnected = false;

const redis = new IORedis({
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: parseInt(process.env.REDIS_PORT, 10) || 6379,
  maxRetriesPerRequest: null,
  enableOfflineQueue: false,
  retryStrategy(times) {
    if (times > 5) {
      // Stop retrying to prevent spamming logs when Redis is not installed locally
      return null;
    }
    return Math.min(times * 2000, 5000);
  },
});

redis.on('connect', () => {
  isRedisConnected = true;
  console.log('Redis connected');
});

redis.on('error', (err) => {
  isRedisConnected = false;
  // Silent or warn once
  if (err.code === 'ECONNREFUSED') {
    // Expected when running local XAMPP without a Redis service
  } else {
    console.warn('Redis notice:', err.message);
  }
});

module.exports = { redis, getIsRedisConnected: () => isRedisConnected };
