import redis from "./redis";

interface RateLimitOptions {
  identifier: string;
  limit: number;
  window: number;
}

interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetTime: number;
}

export async function rateLimit({
  identifier,
  limit,
  window,
}: RateLimitOptions): Promise<RateLimitResult> {
  const key = `rate_limit:${identifier}`;
  const now = Date.now();
  const windowStart = Math.floor(now / (window * 1000)) * (window * 1000);

  const pipeline = redis.pipeline();
  pipeline.zremrangebyscore(key, 0, windowStart - 1);
  pipeline.zcard(key);
  pipeline.zadd(key, { score: now, member: `${now}-${Math.random()}` });
  pipeline.expire(key, window);

  const results = await pipeline.exec();
  const currentCount = results[1] as number;

  const success = currentCount < limit;
  const remaining = Math.max(0, limit - currentCount - (success ? 1 : 0));
  const resetTime = windowStart + window * 1000;

  if (!success) {
    await redis.zpopmax(key);
  }

  return { success, remaining, resetTime };
}
