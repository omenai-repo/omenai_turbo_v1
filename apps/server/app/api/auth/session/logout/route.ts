import { NextResponse } from "next/server";
import {
  getSessionFromCookie,
  destroySession,
} from "@omenai/shared-lib/auth/session";
import { withRateLimitHighlightAndCsrf } from "@omenai/shared-lib/auth/middleware/combined_middleware";
import { lenientRateLimit } from "@omenai/shared-lib/auth/configs/rate_limit_configs";
import { cookies } from "next/headers";

// POST /api/auth/logout - ENHANCED VERSION
export const POST = withRateLimitHighlightAndCsrf(lenientRateLimit)(
  async function POST() {
    const cookieStore = await cookies();
    try {
      const session = await getSessionFromCookie(cookieStore);

      if (session.sessionId) {
        // Enhanced: Pass cookieStore for automatic cleanup
        await destroySession(session.sessionId, cookieStore);
      } else {
        // Clean up cookie even if no sessionId
        session.destroy();
      }

      return NextResponse.json({ message: "User successfully logged out" });
    } catch (error) {
      return NextResponse.json(
        { message: "An error occurred. Please contact support" },
        { status: 500 }
      );
    }
  }
);
