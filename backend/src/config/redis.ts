import Redis from 'ioredis';

const redisUrl = process.env.REDIS_URL || process.env.REDISURL || process.env.REDIS_PRIVATE_URL;

export const redisConnection = redisUrl
  ? new Redis(redisUrl, {
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
      tls: redisUrl.startsWith('rediss://') ? { rejectUnauthorized: false } : undefined,
    })
  : new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379', 10),
      password: process.env.REDIS_PASSWORD || undefined,
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
    });

redisConnection.on('connect', () => {
  console.log('✅ Connected to Redis successfully');
});

redisConnection.on('error', (err) => {
  console.error('❌ Redis Connection Error:', err);
});

export default redisConnection;
