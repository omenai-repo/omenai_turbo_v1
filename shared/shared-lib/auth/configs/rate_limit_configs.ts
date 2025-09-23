import { getClientIP } from "../ip_extractor";

// Standard rate limiting for most APIs
export const standardRateLimit = {
  limit: 60,
  window: 60, // 60 requests per minute
  keyPrefix: "standard",
};

// Strict rate limiting for expensive operations
export const strictRateLimit = {
  limit: 10,
  window: 60, // 10 requests per minute
  keyPrefix: "strict",
};

// Lenient rate limiting for lightweight operations
export const lenientRateLimit = {
  limit: 100,
  window: 60, // 100 requests per minute
  keyPrefix: "lenient",
};

// Currency conversion specific rate limiting
export const currencyRateLimit = {
  limit: 20,
  window: 60, // 20 requests per minute
  keyGenerator: (request: Request) => {
    const ip = getClientIP(request);
    return `currency-conversion:${ip}`;
  },
};

// Upload endpoint rate limiting
export const uploadRateLimit = {
  limit: 5,
  window: 300, // 5 uploads per 5 minutes
  keyGenerator: (request: Request) => {
    const ip = getClientIP(request);
    return `upload:${ip}`;
  },
};
