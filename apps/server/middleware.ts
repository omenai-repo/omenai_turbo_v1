import { NextRequest, NextResponse } from "next/server";
const allowed_origins = [
  "https://auth.omenai.app",
  "https://dashboard.omenai.app",
  "https://admin.omenai.app",
  "https://omenai.app",
  "http://localhost",
];
export async function middleware(request: NextRequest) {
  // Handle other requests
  const response = NextResponse.next();
  const origin = request.headers.get("origin") ?? "";
  const userAgent = request.headers.get("User-Agent") ?? "";
  const authorization = request.headers.get("Authorization") ?? "";

  if (request.nextUrl.pathname.startsWith("/api/webhook")) return response;

  if (userAgent === "__X-Omenai-App") {
    if (authorization === process.env.APP_AUTHORIZATION_SECRET) {
      return response;
    } else {
      return NextResponse.json({}, { status: 403 });
    }
  } else {
    if (isOriginAllowed(origin)) {
      // Handle preflight (OPTIONS) requests
      if (request.method === "OPTIONS") {
        const preflightResponse = NextResponse.json({}, { status: 200 });
        preflightResponse.headers.set("Access-Control-Allow-Origin", origin);
        preflightResponse.headers.set(
          "Access-Control-Allow-Credentials",
          "true"
        );
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

      return response;
    } else {
      return NextResponse.json({}, { status: 403 });
    }
  }
  function isOriginAllowed(origin: string): boolean {
    return allowed_origins.some((allowedOrigin) => {
      return origin.startsWith(allowedOrigin);
    });
  }
}

export const config = {
  matcher: ["/api/:path*"], // Apply only to API routes
};
