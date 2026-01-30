// combined_middleware.ts
import { handleErrorEdgeCases } from "./../../../../apps/server/custom/errors/handler/errorHandler";
import { ForbiddenError } from "./../../../../apps/server/custom/errors/dictionary/errorDictionary";
import { NextRequest, NextResponse } from "next/server";
import { validateCsrf, validateSession } from "../validateCsrf";
import { CombinedConfig, SessionData } from "@omenai/shared-types";
import { rollbarServerInstance } from "@omenai/rollbar-config";
import { withRateLimit } from "./rate_limit_middleware";
import { getSession } from "../session";

export function withRateLimitHighlightAndCsrf(config: CombinedConfig) {
  return function combinedWrapper(
    handler: (
      request: Request | NextRequest,
      response?: Response | NextResponse,
      sessionData?: SessionData & { csrfToken: string },
    ) => Promise<Response | NextResponse>,
  ) {
    return async (req: Request | NextRequest) => {
      const url = new URL(req.url);
      const pathname = url.pathname;
      const method = req.method.toUpperCase();
      const isMutative = ["POST", "PUT", "PATCH", "DELETE"].includes(method);

      let sessionData: (SessionData & { csrfToken: string }) | undefined;
      let userIdForLimit: string | undefined;

      try {
        // 1. AUTH FIRST
        if (isMutative && config.allowedRoles?.length) {
          const {
            valid,
            message,
            sessionData: sData,
          } = await validateCsrf({
            req,
            allowedRoles: config.allowedRoles,
            allowedAdminAccessRoles: config.allowedAdminAccessRoles,
          });

          if (pathname === "/api/support" && !valid) {
            return await withRateLimit(config, undefined, sessionData)(handler)(
              req,
            );
          }

          if (!valid) {
            throw new ForbiddenError(message);
          }

          sessionData = sData;
          userIdForLimit = sessionData?.userData.id;
        } else {
          const result = await validateSession(req);

          if (result.valid && result.sessionData) {
            sessionData = result.sessionData;
            userIdForLimit = sessionData?.userData.id;
          }
        }

        return await withRateLimit(
          config,
          userIdForLimit,
          sessionData,
        )(handler)(req);
      } catch (error) {
        const error_response = handleErrorEdgeCases(error);
        rollbarServerInstance.error(error_response.message, {
          context: "With RateLimitHighlightAndCsrf Middleware",
        });
        return NextResponse.json(
          { message: error_response!.message },
          { status: error_response!.status },
        );
      }
    };
  };
}
