import { getClientIdentifier } from "../ip_extractor";

/**
 * Converts an endpoint path to a Redis-safe string
 */
const sanitizePath = (path: string) =>
  path.replace(/^\/|\/$/g, "").replace(/\//g, "-") || "root";

/**
 * Standard rate limiting for most APIs
 * 60 requests per minute
 */
export const standardRateLimit = {
  maxTokens: 60,
  refillRate: 60 / 60, // 1 token/sec
  keyGenerator: async (request: Request, userId?: string) => {
    const ip = await getClientIdentifier(request, userId);
    const path = sanitizePath(new URL(request.url).pathname);
    return `standard-${path}:${ip}`;
  },
};

/**
 * Strict rate limiting for expensive operations
 * 10 requests per minute
 */
export const strictRateLimit = {
  maxTokens: 10,
  refillRate: 10 / 60, // ~0.1667 tokens/sec
  keyGenerator: async (request: Request, userId?: string) => {
    const ip = await getClientIdentifier(request, userId);
    const path = sanitizePath(new URL(request.url).pathname);
    return `standard-${path}:${ip}`;
  },
};

/**
 * Lenient rate limiting for lightweight operations
 * 100 requests per minute
 */
export const lenientRateLimit = {
  maxTokens: 100,
  refillRate: 100 / 60, // ~1.6667 tokens/sec
  keyGenerator: async (request: Request, userId?: string) => {
    const ip = await getClientIdentifier(request, userId);
    const path = sanitizePath(new URL(request.url).pathname);
    return `standard-${path}:${ip}`;
  },
};

/**
 * Currency conversion specific rate limiting
 * 20 requests per minute
 */
export const currencyRateLimit = {
  maxTokens: 20,
  refillRate: 20 / 60, // ~0.3333 tokens/sec
  keyGenerator: async (request: Request, userId?: string) => {
    const ip = await getClientIdentifier(request, userId);
    const path = sanitizePath(new URL(request.url).pathname);
    return `standard-${path}:${ip}`;
  },
};

/**
 * Upload endpoint rate limiting
 * 5 uploads per 5 minutes
 */
export const uploadRateLimit = {
  maxTokens: 5,
  refillRate: 5 / 300, // ~0.0167 tokens/sec
  keyGenerator: async (request: Request, userId?: string) => {
    const ip = await getClientIdentifier(request, userId);
    const path = sanitizePath(new URL(request.url).pathname);
    return `standard-${path}:${ip}`;
  },
};
