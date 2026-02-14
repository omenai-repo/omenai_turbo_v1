import {
  getSession,
  getSessionFromCookie,
} from "@omenai/shared-lib/auth/session";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createErrorRollbarReport } from "../../../util";
export async function GET(request: Request) {
  try {
    const cookieStore = await cookies();

    const cookieSession = await getSessionFromCookie(cookieStore);

    const sessionId = cookieSession.sessionId;

    if (!sessionId) {
      return NextResponse.json(
        { message: "Session not authenticated" },
        { status: 401 },
      );
    }

    const userSessionData = await getSession(sessionId, cookieStore);

    if (!userSessionData) {
      cookieSession.destroy();
      return NextResponse.json(
        { message: "Session expired or invalid" },
        { status: 401 },
      );
    }

    // **Security:** Destructure to separate user data from security tokens
    const { csrfToken, ...user } = userSessionData;

    // Send the user data and the CSRF token in the response body.
    // The frontend will use this token for subsequent mutation requests.
    return NextResponse.json({ user, csrfToken }, { status: 200 });
  } catch (error) {
    createErrorRollbarReport("auth: user session", error, 500);
    return NextResponse.json({ message: "An error occurred" }, { status: 500 });
  }
}
