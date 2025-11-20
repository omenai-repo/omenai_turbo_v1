import { redis } from "@omenai/upstash-config";

export interface TokenBucketResult {
  success: boolean;
  remaining: number; // tokens left
  resetTime: number; // timestamp when bucket refills
}

/**
 * Lua script for Token Bucket:
 * KEYS[1] = bucket key
 * ARGV[1] = max tokens
 * ARGV[2] = refill rate (tokens per second)
 * ARGV[3] = now (milliseconds)
 */
const TOKEN_BUCKET_LUA = `
local key = KEYS[1]
local max_tokens = tonumber(ARGV[1])
local refill_rate = tonumber(ARGV[2])
local now = tonumber(ARGV[3])

local data = redis.call("HMGET", key, "tokens", "last")
local tokens = tonumber(data[1])
local last = tonumber(data[2])

if tokens == nil then
  tokens = max_tokens
  last = now
end

local delta = math.max(0, now - last)
local refill = delta / 1000 * refill_rate
tokens = math.min(max_tokens, tokens + refill)
last = now

local success = 0
if tokens >= 1 then
  tokens = tokens - 1
  success = 1
end

redis.call("HMSET", key, "tokens", tokens, "last", last)
redis.call("PEXPIRE", key, math.ceil(1000 * max_tokens / refill_rate))

return {success, tokens, last}
`;

export async function checkRateLimit(
  identifier: string,
  maxTokens: number,
  refillRate: number // tokens per second
): Promise<TokenBucketResult> {
  const now = Date.now();
  const key = `rate_limit:token_bucket:${identifier}`;

  const [success, remaining, last] = (await redis.eval(
    TOKEN_BUCKET_LUA,
    [key],
    [maxTokens.toString(), refillRate.toString(), now.toString()]
  )) as [number, number, number];

  return {
    success: success === 1,
    remaining: Math.floor(remaining),
    resetTime: last + (1000 * (maxTokens - remaining)) / refillRate,
  };
}
