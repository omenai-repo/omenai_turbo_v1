import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  // Handle other requests
  const response = NextResponse.next();
  const origin = request.headers.get("origin") ?? "";
  const allowedOrigin =
    process.env.NODE_ENV === "production" ? "https://*.omenai.app" : origin;

  // Handle preflight (OPTIONS) requests
  if (request.method === "OPTIONS") {
    const preflightResponse = NextResponse.json({}, { status: 200 });
    preflightResponse.headers.set("Access-Control-Allow-Origin", allowedOrigin);
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
    response.headers.set("Access-Control-Allow-Origin", allowedOrigin);
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

  return response;
}

export const config = {
  matcher: ["/api/:path*"], // Apply only to API routes
};
