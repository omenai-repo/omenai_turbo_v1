import { NextResponse } from "next/server";
import {
  getSessionFromCookie,
  destroySession,
} from "@omenai/shared-lib/auth/session";
import { withRateLimitAndHighlight } from "@omenai/shared-lib/auth/middleware/combined_middleware";
import { lenientRateLimit } from "@omenai/shared-lib/auth/configs/rate_limit_configs";
import { cookies } from "next/headers";
export const POST = withRateLimitAndHighlight(lenientRateLimit)(
  async function POST() {
    const cookieStore = await cookies();
    try {
      const session = await getSessionFromCookie(cookieStore);

      if (session.sessionId) {
        // 1. Delete the session from Redis
        await destroySession(session.sessionId);
      }

      // 2. Destroy the cookie
      session.destroy();

      return NextResponse.json({ message: "User successfully logged out" });
    } catch (error) {
      return NextResponse.json(
        { message: "An error occurred. Please contact support" },
        { status: 500 }
      );
    }
  }
);
