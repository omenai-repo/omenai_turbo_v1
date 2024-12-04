import { getSession } from "@omenai/shared-auth/lib/auth/session";
import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  // Handle other requests
  const response = NextResponse.next();
  const origin = request.headers.get("origin") ?? "";

  // Handle preflight (OPTIONS) requests
  if (request.method === "OPTIONS") {
    const preflightResponse = NextResponse.json({}, { status: 200 });
    preflightResponse.headers.set("Access-Control-Allow-Origin", origin);
    preflightResponse.headers.set("Access-Control-Allow-Credentials", "true");
    preflightResponse.headers.set(
      "Access-Control-Allow-Methods",
      "GET, DELETE, PATCH, POST, PUT, OPTIONS"
    );
    preflightResponse.headers.set(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization, Content-Length"
    );
    return preflightResponse;
  }

  if (origin) {
    response.headers.set("Access-Control-Allow-Credentials", "true");
    response.headers.set("Access-Control-Allow-Origin", origin);
    response.headers.set(
      "Access-Control-Allow-Methods",
      "GET, DELETE, PATCH, POST, PUT, OPTIONS"
    );
    response.headers.set(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization, Content-Length"
    );
  }
  if (request.nextUrl.pathname.includes("/api/auth")) return response;

  const session = await getSession();
  console.log(session);

  return response;
}

export const config = {
  matcher: ["/api/:path*"], // Apply only to API routes
};
