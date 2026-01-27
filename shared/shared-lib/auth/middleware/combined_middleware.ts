import { handleErrorEdgeCases } from "./../../../../apps/server/custom/errors/handler/errorHandler";
import { ForbiddenError } from "./../../../../apps/server/custom/errors/dictionary/errorDictionary";
import { NextRequest, NextResponse } from "next/server";
import { withRateLimit } from "./rate_limit_middleware";
import { validateCsrf } from "../validateCsrf";
import { CombinedConfig, SessionData } from "@omenai/shared-types";
import { rollbarServerInstance } from "@omenai/rollbar-config";

export function withRateLimitHighlightAndCsrf(config: CombinedConfig) {
  return function combinedWrapper(
    handler: (
      request: Request | NextRequest,
      response?: Response | NextResponse,
      sessionData?: SessionData & { csrfToken: string },
    ) => Promise<Response | NextResponse>,
  ) {
    let sessionDataId: string | undefined = undefined;
    const wrapped = async (req: Request | NextRequest) => {
      const url = new URL(req.url);

      const pathname = url.pathname;

      const method = req.method.toUpperCase();
      const userAgent = req.headers.get("User-Agent");
      const authorization: string = req.headers.get("Authorization") ?? "";

      if (userAgent === process.env.MOBILE_USER_AGENT) {
        if (authorization === process.env.APP_AUTHORIZATION_SECRET) {
          return handler(req);
        } else {
          throw new ForbiddenError("Unauthorized access detected");
        }
      }

      // Only validate CSRF + role for mutative methods
      const isMutative = ["POST", "PUT", "PATCH", "DELETE"].includes(method);

      try {
        if (isMutative && config.allowedRoles?.length) {
          const { valid, message, sessionData } = await validateCsrf({
            req,
            allowedRoles: config.allowedRoles,
            allowedAdminAccessRoles: config.allowedAdminAccessRoles,
          });

          if (pathname === "/api/support" && !valid) {
            return handler(req, undefined, undefined);
          }

          if (!valid) {
            throw new ForbiddenError(message);
          }

          sessionDataId = sessionData?.userData.id;

          return handler(req, undefined, sessionData);
        }
        return handler(req);
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

    return withRateLimit(config, sessionDataId)(wrapped);
  };
}
