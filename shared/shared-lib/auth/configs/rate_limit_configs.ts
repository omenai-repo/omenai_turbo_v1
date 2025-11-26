import { getClientIdentifier } from "../ip_extractor";

/**
 * Converts an endpoint path to a Redis-safe string
 */
const sanitizePath = (path: string) =>
  path.replace(/^\/|\/$/g, "").replace(/\//g, "-") || "root";

/**
 * Standard rate limiting for most APIs
 * 30 requests per minute
 */
export const standardRateLimit = {
  maxTokens: 20,
  refillRate: 1 / 2, // 0.5 tokens/sec
  keyGenerator: async (request: Request, userId?: string) => {
    const id = await getClientIdentifier(request, userId);
    const path = sanitizePath(new URL(request.url).pathname);
    return `standard-${path}:${id}`;
  },
};

/**
 * STRICT rate limiting — used for brute-force sensitive operations
 * login, password check, OTP verify, withdrawal confirmation, etc.
 *
 * Very strict: 5 attempts per minute
 */
export const strictRateLimit = {
  maxTokens: 5,
  refillRate: 5 / 600, // 5 tokens per 10 minutes (1 token every 120s)
  keyGenerator: async (request: Request, userId?: string) => {
    const id = await getClientIdentifier(request, userId);
    const path = sanitizePath(new URL(request.url).pathname);
    return `strict-${path}:${id}`;
  },
};

/**
 * Lenient rate limiting for lightweight operations
 * 60 requests per minute
 */
export const lenientRateLimit = {
  maxTokens: 60,
  refillRate: 1, // 1 token/sec
  keyGenerator: async (request: Request, userId?: string) => {
    const id = await getClientIdentifier(request, userId);
    const path = sanitizePath(new URL(request.url).pathname);
    return `lenient-${path}:${id}`;
  },
};

/**
 * Currency conversion specific rate limit (expensive)
 * 20 requests per minute
 */
export const currencyRateLimit = {
  maxTokens: 20,
  refillRate: 20 / 60, // ~0.33 tokens/sec
  keyGenerator: async (request: Request, userId?: string) => {
    const id = await getClientIdentifier(request, userId);
    const path = sanitizePath(new URL(request.url).pathname);
    return `currency-${path}:${id}`;
  },
};

/**
 * Upload endpoint rate limiting
 * 5 uploads per 5 minutes (heavy)
 */
export const uploadRateLimit = {
  maxTokens: 5,
  refillRate: 5 / 300, // ~0.0167 tokens/sec
  keyGenerator: async (request: Request, userId?: string) => {
    const id = await getClientIdentifier(request, userId);
    const path = sanitizePath(new URL(request.url).pathname);
    return `upload-${path}:${id}`;
  },
};
export const fortKnoxRateLimit = {
  maxTokens: 1,
  refillRate: 1 / 21600, // ~0.000046 tokens/sec
  keyGenerator: async (request: Request, userId?: string) => {
    const id = await getClientIdentifier(request, userId);
    const path = sanitizePath(new URL(request.url).pathname);
    return `fortknox-${path}:${id}`;
  },
};
