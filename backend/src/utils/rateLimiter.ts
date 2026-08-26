import redisConnection from '../config/redis';

export function getHourKey(senderId: string, timestamp: Date = new Date()): string {
  const year = timestamp.getUTCFullYear();
  const month = String(timestamp.getUTCMonth() + 1).padStart(2, '0');
  const day = String(timestamp.getUTCDate()).padStart(2, '0');
  const hour = String(timestamp.getUTCHours()).padStart(2, '0');
  return `ratelimit:email:${senderId}:${year}-${month}-${day}-${hour}`;
}

export function getMsUntilNextHour(): number {
  const now = new Date();
  const nextHour = new Date(now);
  nextHour.setUTCHours(now.getUTCHours() + 1, 0, 0, 0);
  return Math.max(1000, nextHour.getTime() - now.getTime());
}

export async function checkAndIncrementRateLimit(
  senderId: string,
  maxPerHour: number
): Promise<{ allowed: boolean; delayMs: number; currentCount: number }> {
  const key = getHourKey(senderId);
  const count = await redisConnection.incr(key);

  if (count === 1) {
    // Set 1-hour TTL on the rate-limiting key
    await redisConnection.expire(key, 3600);
  }

  if (count > maxPerHour) {
    const delayMs = getMsUntilNextHour();
    return { allowed: false, delayMs, currentCount: count };
  }

  return { allowed: true, delayMs: 0, currentCount: count };
}
