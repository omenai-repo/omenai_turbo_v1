import { handleErrorEdgeCases } from "./../../../../apps/server/custom/errors/handler/errorHandler";
import { ForbiddenError } from "./../../../../apps/server/custom/errors/dictionary/errorDictionary";
import { NextRequest, NextResponse } from "next/server";
import { withAppRouterHighlight } from "../../highlight/app_router_highlight";
import { withRateLimit } from "./rate_limit_middleware";
import { validateCsrf } from "../validateCsrf";
import { CombinedConfig, SessionData } from "@omenai/shared-types";

/**
 * Middleware: Rate Limiting + Highlight.io + CSRF/Role (for mutative requests only)
 */
export function withRateLimitHighlightAndCsrf(config: CombinedConfig) {
  return function combinedWrapper(
    handler: (
      request: Request | NextRequest,
      response?: Response | NextResponse,
      sessionData?: SessionData & { csrfToken: string }
    ) => Promise<Response | NextResponse>
  ) {
    const wrapped = async (req: Request | NextRequest) => {
      const method = req.method.toUpperCase();

      // Only validate CSRF + role for mutative methods
      const isMutative = ["POST", "PUT", "PATCH", "DELETE"].includes(method);

      try {
        if (isMutative && config.allowedRoles?.length) {
          const { valid, message, sessionData } = await validateCsrf({
            req,
            allowedRoles: config.allowedRoles,
          });

          if (!valid) {
            throw new ForbiddenError(message);
          }

          return handler(req, undefined, sessionData);
        }

        // No CSRF/role check needed for GET/HEAD
        return handler(req);
      } catch (error) {
        const error_response = handleErrorEdgeCases(error);

        return NextResponse.json(
          { message: error_response!.message },
          { status: error_response!.status }
        );
      }
    };

    return withAppRouterHighlight(withRateLimit(config)(wrapped));
  };
}
