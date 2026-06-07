import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const redisUrl = process.env.UPSTASH_REDIS_URL;
const redisToken = process.env.UPSTASH_REDIS_TOKEN;

let redis;
let dailyLimitPro;
let dailyLimitFree;

if (redisUrl && redisToken) {
  redis = new Redis({ url: redisUrl, token: redisToken });

  dailyLimitFree = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, '1 d'),
    prefix: 'ratelimit:free',
    analytics: true,
  });

  dailyLimitPro = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(99999, '1 d'),
    prefix: 'ratelimit:pro',
    analytics: true,
  });
} else {
  console.warn('Upstash Redis not configured — rate limiting disabled');
}

export async function checkRateLimit(userId, tier) {
  if (!redis) return { success: true, remaining: 999 };

  const limiter = tier === 'free' ? dailyLimitFree : dailyLimitPro;
  return limiter.limit(userId);
}

export async function getUsage(userId, tier) {
  if (!redis) return { used: 0, remaining: 999, limit: 5 };

  const limiter = tier === 'free' ? dailyLimitFree : dailyLimitPro;
  const result = await limiter.limit(userId);
  return {
    used: result.limit - result.remaining,
    remaining: result.remaining,
    limit: result.limit,
  };
}
