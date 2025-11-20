import { NextResponse } from "next/server";
import { checkRateLimit } from "../rate_limiter";

interface RateLimitConfig {
  maxTokens: number;
  refillRate: number;
  keyGenerator: (request: Request, userId?: string) => Promise<string>;
  keyPrefix?: string;
}

export function withRateLimit(config: RateLimitConfig, userId?: string) {
  return function rateLimitWrapper(
    handler: (request: Request) => Promise<Response>
  ) {
    return async function rateLimitedHandler(
      request: Request
    ): Promise<Response> {
      const identifier = await config.keyGenerator(request, userId);

      const result = await checkRateLimit(
        identifier,
        config.maxTokens,
        config.refillRate
      );

      if (!result.success) {
        return NextResponse.json(
          {
            message: "Too many requests. Please try again later.",
            retryAfter: Math.ceil((result.resetTime - Date.now()) / 1000),
          },
          {
            status: 429,
            headers: {
              "X-RateLimit-Limit": config.maxTokens.toString(),
              "X-RateLimit-Remaining": result.remaining.toString(),
              "X-RateLimit-Reset": result.resetTime.toString(),
              "Retry-After": Math.ceil(
                (result.resetTime - Date.now()) / 1000
              ).toString(),
            },
          }
        );
      }

      const response = await handler(request);

      if (response instanceof NextResponse) {
        response.headers.set("X-RateLimit-Limit", config.maxTokens.toString());
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
