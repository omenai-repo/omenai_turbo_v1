// import { handleErrorEdgeCases } from "./../../../../apps/server/custom/errors/handler/errorHandler";
// import { ForbiddenError } from "./../../../../apps/server/custom/errors/dictionary/errorDictionary";
// import { NextRequest, NextResponse } from "next/server";
// import { withAppRouterHighlight } from "../../highlight/app_router_highlight";
// import { withRateLimit } from "./rate_limit_middleware";
// import {
//   CombinedConfig,
//   SessionData,
//   AccountAdminSchemaTypes, // Added
//   AdminAccessRoleTypes, // Added
//   AccessRoleTypes, // Added
// } from "@omenai/shared-types";
// import { validateSession } from "../validateCsrf";

// /**
//  * Middleware: Rate Limiting + Highlight.io + Session/Role (for all protected routes) + CSRF (for mutative routes)
//  */
// export function withRateLimitHighlightAndCsrf(config: CombinedConfig) {
//   return function combinedWrapper(
//     handler: (
//       request: Request | NextRequest,
//       response?: Response | NextResponse,
//       sessionData?: SessionData & { csrfToken: string }
//     ) => Promise<Response | NextResponse>
//   ) {
//     const wrapped = async (req: Request | NextRequest) => {
//       const method = req.method.toUpperCase();
//       const userAgent = req.headers.get("User-Agent");
//       const authorization: string = req.headers.get("Authorization") ?? "";

//       if (userAgent === process.env.MOBILE_USER_AGENT) {
//         if (authorization === process.env.APP_AUTHORIZATION_SECRET) {
//           return handler(req);
//         } else {
//           throw new ForbiddenError("Unauthorized access detected");
//         }
//       }

//       // Define sessionData here to be available in the whole scope
//       let sessionData: (SessionData & { csrfToken: string }) | undefined =
//         undefined;

//       try {
//         const needsAuth = (config.allowedRoles?.length ?? 0) > 0;

//         // 1. ALWAYS VALIDATE SESSION if roles are required
//         if (needsAuth) {
//           const validation = await validateSession(req);

//           if (!validation.valid || !validation.sessionData) {
//             throw new ForbiddenError(
//               validation.message || "Session expired or invalid"
//             );
//           }

//           sessionData = validation.sessionData;

//           // 2. ALWAYS CHECK ROLE if roles are required
//           const userRole = sessionData?.userData.role as AccessRoleTypes;
//           if (!config.allowedRoles?.includes(userRole)) {
//             throw new ForbiddenError(
//               "Forbidden: Not authorized to access this resource"
//             );
//           }
//         }

//         // 3. ADD MUTATIVE CHECKS if the request is mutative
//         const isMutative = ["POST", "PUT", "PATCH", "DELETE"].includes(method);

//         if (isMutative) {
//           // Only run CSRF/Admin checks if a session was required and loaded
//           if (sessionData) {
//             // 4. Check CSRF token
//             const incomingToken = req.headers.get("X-Csrf-token");
//             if (!incomingToken || incomingToken !== sessionData.csrfToken) {
//               throw new ForbiddenError("Invalid session token, please login");
//             }

//             // 5. Check Admin-specific access roles (if configured)
//             if ((config.allowedAdminAccessRoles?.length ?? 0) > 0) {
//               const adminAccessRole = (
//                 sessionData.userData as unknown as AccountAdminSchemaTypes
//               ).access_role as AdminAccessRoleTypes;

//               if (
//                 !(
//                   config.allowedAdminAccessRoles as AdminAccessRoleTypes[]
//                 ).includes(adminAccessRole)
//               ) {
//                 throw new ForbiddenError(
//                   "Forbidden: Not authorized for this action"
//                 );
//               }
//             }
//           }
//           // Note: Public mutative routes (like login/signup) would have
//           // no 'allowedRoles', so 'sessionData' would be undefined,
//           // and these checks would be correctly skipped.
//         }

//         // 6. ALWAYS PASS sessionData (if it exists) to the handler
//         return handler(req, undefined, sessionData);
//       } catch (error) {
//         const error_response = handleErrorEdgeCases(error);

//         return NextResponse.json(
//           { message: error_response!.message },
//           { status: error_response!.status }
//         );
//       }
//     };

//     return withAppRouterHighlight(withRateLimit(config)(wrapped));
//   };
// }
