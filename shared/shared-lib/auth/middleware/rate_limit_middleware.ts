// Purpose: Middleware wrapper for rate limiting
// ============================================================================

import { NextResponse } from "next/server";
import { getClientIP } from "../ip_extractor";
import { checkRateLimit } from "../rate_limiter";

interface RateLimitConfig {
  limit: number;
  window: number;
  keyPrefix?: string;
  keyGenerator?: (request: Request) => string;
}

/**
 * Rate limiting middleware wrapper
 * Apply this to your API handlers
 */
export function withRateLimit(config: RateLimitConfig) {
  return function rateLimitWrapper(
    handler: (request: Request) => Promise<Response>
  ) {
    return async function rateLimitedHandler(
      request: Request
    ): Promise<Response> {
      // Generate unique identifier for rate limiting
      const identifier = config.keyGenerator
        ? config.keyGenerator(request)
        : `${config.keyPrefix || "api"}:${getClientIP(request)}`;

      // Check rate limit
      const result = await checkRateLimit({
        identifier,
        limit: config.limit,
        window: config.window,
      });

      // If rate limited, return 429 error
      if (!result.success) {
        return NextResponse.json(
          {
            message: "Too many requests. Please try again later.",
            retryAfter: Math.ceil((result.resetTime - Date.now()) / 1000),
          },
          {
            status: 429,
            headers: {
              "X-RateLimit-Limit": config.limit.toString(),
              "X-RateLimit-Remaining": result.remaining.toString(),
              "X-RateLimit-Reset": result.resetTime.toString(),
              "Retry-After": Math.ceil(
                (result.resetTime - Date.now()) / 1000
              ).toString(),
            },
          }
        );
      }

      // Call original handler
      const response = await handler(request);

      // Add rate limit headers to response
      if (response instanceof NextResponse) {
        response.headers.set("X-RateLimit-Limit", config.limit.toString());
        response.headers.set(
          "X-RateLimit-Remaining",
          result.remaining.toString()
        );
        response.headers.set("X-RateLimit-Reset", result.resetTime.toString());
      }

      return response;
    };
  };
}
