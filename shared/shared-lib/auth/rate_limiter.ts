import { redis } from "@omenai/upstash-config";
interface RateLimitOptions {
  identifier: string; // Unique key for rate limiting
  limit: number; // Max requests allowed
  window: number; // Time window in seconds
}

interface RateLimitResult {
  success: boolean; // Whether request is allowed
  remaining: number; // Requests left in window
  resetTime: number; // When window resets (timestamp)
}

/**
 * Check if request should be rate limited
 * Uses sliding window algorithm for accuracy
 */
export async function checkRateLimit({
  identifier,
  limit,
  window,
}: RateLimitOptions): Promise<RateLimitResult> {
  const key = `rate_limit:${identifier}`;
  const now = Date.now();
  const windowStart = Math.floor(now / (window * 1000)) * (window * 1000);

  // Use Redis pipeline for atomic operations
  const pipeline = redis.pipeline();

  // 1. Remove expired entries
  pipeline.zremrangebyscore(key, 0, windowStart - 1);

  // 2. Count current requests
  pipeline.zcard(key);

  // 3. Add current request
  pipeline.zadd(key, { score: now, member: `${now}-${Math.random()}` });

  // 4. Set expiration
  pipeline.expire(key, window);

  const results = await pipeline.exec();
  const currentCount = results[1] as number;

  const success = currentCount < limit;
  const remaining = Math.max(0, limit - currentCount - (success ? 1 : 0));
  const resetTime = windowStart + window * 1000;

  // If rate limited, remove the request we just added
  if (!success) {
    await redis.zpopmax(key);
  }

  return { success, remaining, resetTime };
}
