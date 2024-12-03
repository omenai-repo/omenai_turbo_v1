import { NextRequest, NextResponse } from "next/server";
import { UserType } from "@omenai/shared-types";
import {
  getSession,
  refreshSession,
} from "@omenai/shared-auth/lib/auth/session";
const adminRoute = /\/admin\/dashboard\/.*/;

export async function middleware(request: NextRequest) {
  const session: UserType = await getSession();

  const isAdminRoute = adminRoute.test(request.nextUrl.pathname);

  if (session === undefined || null) {
    if (isAdminRoute) {
      // Handle unauthenticated requests
      return NextResponse.redirect(
        new URL("/auth/login/secure/admin", request.url)
      ); // Redirect to login page
    }
  }

  if (isAdminRoute) {
    if (session && session.role !== "admin") {
      return NextResponse.redirect(
        new URL("/auth/login/secure/admin", request.url)
      );
    }
  }

  if (session && session.role === "admin") {
    // Refresh session expiry
    await refreshSession(session);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/:path*"], // Matches all routes under "/"
};
