import { redis } from "@omenai/upstash-config";

export interface TokenBucketResult {
  success: boolean;
  remaining: number;
  resetTime: number;
}

const TOKEN_BUCKET_LUA = `
local key = KEYS[1]
local max_tokens = tonumber(ARGV[1])
local refill_rate = tonumber(ARGV[2])
local now = tonumber(ARGV[3])

-- 1. Fetch current state
local data = redis.call("HMGET", key, "tokens", "last")
local tokens = tonumber(data[1])
local last = tonumber(data[2])

-- 2. Initialize if first request
if tokens == nil then
  tokens = max_tokens
  last = now
end

-- 3. Refill tokens based on time passed
local delta = math.max(0, now - last)
local refill = delta / 1000 * refill_rate
tokens = math.min(max_tokens, tokens + refill)
last = now

-- 4. Check & Consume
local success = 0
if tokens >= 1 then
  tokens = tokens - 1
  success = 1
end

-- 5. Atomic Update
redis.call("HMSET", key, "tokens", tokens, "last", last)

-- 6. DYNAMIC TTL (Critical Fix)
-- Instead of a generic expire, expire when the bucket would be 100% full.
-- This keeps Redis clean of idle keys.
local ttl = math.ceil((max_tokens / refill_rate) * 1000)
redis.call("PEXPIRE", key, ttl)

return {success, tokens, last}
`;

export async function checkRateLimit(
  identifier: string,
  maxTokens: number,
  refillRate: number,
): Promise<TokenBucketResult> {
  const now = Date.now();
  const key = `rate_limit:token_bucket:${identifier}`;

  const [success, remaining] = (await redis.eval(
    TOKEN_BUCKET_LUA,
    [key],
    [maxTokens.toString(), refillRate.toString(), now.toString()],
  )) as [number, number];

  return {
    success: success === 1,
    remaining: Math.floor(remaining),
    resetTime: now + ((maxTokens - remaining) / refillRate) * 1000,
  };
}
