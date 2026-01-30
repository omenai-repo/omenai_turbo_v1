// Enhanced validateCsrf with proper cleanup
import { cookies } from "next/headers";
import {
  getSessionFromCookie,
  getSession,
  getSessionIdFromRequest,
} from "./session";
import {
  AccountAdminSchemaTypes,
  AdminAccessRoleTypes,
  SessionData,
} from "@omenai/shared-types";

type Role = "user" | "artist" | "gallery" | "admin";

interface ValidateCsrfOptions {
  allowedRoles: Role[];
  req: Request;
  allowedAdminAccessRoles?: AdminAccessRoleTypes[];
}

export async function validateCsrf({
  req,
  allowedRoles,
  allowedAdminAccessRoles,
}: ValidateCsrfOptions): Promise<{
  valid: boolean;
  message: string;
  sessionData?: SessionData & { csrfToken: string };
}> {
  try {
    const authorization = req.headers.get("Authorization") ?? "";
    const cookieStore = await cookies();
    const sessionId = await getSessionIdFromRequest(req, cookieStore);

    if (!sessionId) {
      return {
        valid: false,
        message: "Session ID expired or invalid. Please log back in",
      };
    }

    // Pass cookieStore for automatic cleanup if session is invalid or session refresh
    const sessionData = await getSession(sessionId, cookieStore);

    if (!sessionData) {
      return {
        valid: false,
        message: "Session expired or invalid. Please log back in",
      };
    }

    const incomingToken = req.headers.get("X-Csrf-token");

    if (
      !authorization &&
      (!incomingToken || incomingToken !== sessionData.csrfToken)
    ) {
      return { valid: false, message: "Invalid session token, please login" };
    }

    const userRole = sessionData.userData.role as Role;

    if (!allowedRoles.includes(userRole)) {
      return {
        valid: false,
        message: "Forbidden: Not authorized to access this resource",
      };
    }

    if ((allowedAdminAccessRoles?.length ?? 0) > 0) {
      const adminAccessRole = (
        sessionData.userData as unknown as AccountAdminSchemaTypes
      ).access_role;

      if (
        !(allowedAdminAccessRoles as AdminAccessRoleTypes[]).includes(
          adminAccessRole,
        )
      ) {
        return {
          valid: false,
          message: "Forbidden: Not authorized to access this resource",
        };
      }
    }

    return { valid: true, sessionData, message: "Session validated" };
  } catch (err) {
    console.error("CSRF validation error:", err);
    return { valid: false, message: "Internal server error" };
  }
}

export async function validateSession(req: Request): Promise<{
  valid: boolean;
  message?: string;
  sessionData?: any;
}> {
  try {
    const cookieStore = await cookies();
    const sessionId = await getSessionIdFromRequest(req, cookieStore);

    // 1. Guest User: No Session ID -> Allow Access (Valid)
    if (!sessionId) return { valid: true };

    // 2. Logged In User: Refresh Session
    // Since you removed userAgent/middleware args, we just pass the ID and Store
    const sessionData = await getSession(sessionId, cookieStore);

    // 3. Stale/Invalid Session -> Allow Access as Guest (Soft Fail)
    // getSession has already cleaned up the invalid Redis key/Cookie
    if (!sessionData) {
      return { valid: true, message: "Session expired or invalid" };
    }

    // 4. Active Session -> Return Data
    return { valid: true, sessionData };
  } catch (err) {
    console.error("Session validation error:", err);
    // On internal error, we default to blocking to prevent security bypass
    return { valid: false, message: "Internal server error" };
  }
}
