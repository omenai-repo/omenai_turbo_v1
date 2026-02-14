import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "../rate_limiter";
import { SessionData } from "@omenai/shared-types";

interface RateLimitConfig {
  maxTokens: number;
  refillRate: number;
  keyGenerator: (request: Request, userId?: string) => Promise<string>;
  keyPrefix?: string;
}

export function withRateLimit(
  config: RateLimitConfig,
  currentUserId?: string | undefined,
  sessionData?: (SessionData & { csrfToken: string }) | undefined,
) {
  return function rateLimitWrapper(
    handler: (
      request: Request | NextRequest,
      response?: Response | NextResponse,
      sessionData?: SessionData & { csrfToken: string },
    ) => Promise<Response>,
  ) {
    return async function rateLimitedHandler(
      request: Request,
    ): Promise<Response> {
      try {
        const identifier = await config.keyGenerator(request, currentUserId);

        const result = await checkRateLimit(
          identifier,
          config.maxTokens,
          config.refillRate,
        );

        if (!result.success) {
          return NextResponse.json(
            {
              message:
                "You have made too many requests. Please wait a while before trying again.",
              retryAfter: Math.ceil((result.resetTime - Date.now()) / 1000),
            },
            {
              status: 429,
              headers: {
                "X-RateLimit-Limit": config.maxTokens.toString(),
                "X-RateLimit-Remaining": result.remaining.toString(),
                "X-RateLimit-Reset": result.resetTime.toString(),
                "Retry-After": Math.ceil(
                  (result.resetTime - Date.now()) / 1000,
                ).toString(),
              },
            },
          );
        }

        // Execute the actual route handler
        const response = await handler(request, undefined, sessionData);

        if (response instanceof NextResponse) {
          response.headers.set(
            "X-RateLimit-Limit",
            config.maxTokens.toString(),
          );
          response.headers.set(
            "X-RateLimit-Remaining",
            result.remaining.toString(),
          );
          response.headers.set(
            "X-RateLimit-Reset",
            result.resetTime.toString(),
          );
        }

        return response;
      } catch (error: any) {
        console.error("Rate Limit Middleware Error:", error);

        if (
          error.name === "ForbiddenError" ||
          error.message?.includes("processed")
        ) {
          return NextResponse.json(
            { message: error.message || "This action is forbidden." },
            { status: 403 },
          );
        }

        // Handle generic errors without crashing the process
        return NextResponse.json(
          { message: "Internal Server Error" },
          { status: 500 },
        );
      }
    };
  };
}
