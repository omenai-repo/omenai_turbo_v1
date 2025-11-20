// Enhanced validateCsrf with proper cleanup
import { cookies } from "next/headers";
import { getSessionFromCookie, getSession } from "./session";
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
    const cookieStore = await cookies();
    const cookieSession = await getSessionFromCookie(cookieStore);
    const sessionId = cookieSession.sessionId;

    if (!sessionId) {
      return {
        valid: false,
        message: "Session ID expired or invalid. Please log back in",
      };
    }

    const userAgent = req.headers.get("user-agent") || "";

    // Pass cookieStore for automatic cleanup if session is invalid
    const sessionData = await getSession(
      sessionId,
      userAgent,
      false,
      cookieStore
    );

    if (!sessionData) {
      // Session was already cleaned up by getSession
      return {
        valid: false,
        message: "Session expired or invalid. Please log back in",
      };
    }

    const incomingToken = req.headers.get("X-Csrf-token");

    if (!incomingToken || incomingToken !== sessionData.csrfToken) {
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
      ).access_role as AdminAccessRoleTypes;

      if (
        !(allowedAdminAccessRoles as AdminAccessRoleTypes[]).includes(
          adminAccessRole
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

// Optional: Add a simpler auth check for non-CSRF routes
export async function validateSession(req: Request): Promise<{
  valid: boolean;
  message?: string;
  sessionData?: any;
}> {
  try {
    const cookieStore = await cookies();
    const cookieSession = await getSessionFromCookie(cookieStore);
    const sessionId = cookieSession?.sessionId;

    if (!sessionId) {
      return { valid: false, message: "Session ID missing or invalid" };
    }

    const userAgent = req.headers.get("user-agent") || "";
    const sessionData = await getSession(
      sessionId,
      userAgent,
      false,
      cookieStore
    );

    if (!sessionData) {
      return { valid: false, message: "Session expired or invalid" };
    }

    return { valid: true, sessionData };
  } catch (err) {
    console.error("Session validation error:", err);
    return { valid: false, message: "Internal server error" };
  }
}
