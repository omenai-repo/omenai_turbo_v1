import { NextRequest, NextResponse } from "next/server";

const allowed_origins = [
  "https://auth.omenai.app",
  "https://dashboard.omenai.app",
  "https://admin.omenai.app",
  "https://omenai.app",
  "http://localhost",
  "https://v1.omenai.app",
];

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const origin: string = request.headers.get("origin") ?? "";
  const userAgent: string = request.headers.get("User-Agent") ?? "";
  const authorization: string = request.headers.get("Authorization") ?? "";

  if (request.nextUrl.pathname.startsWith("/api/webhook")) return response;

  if (userAgent === "__X-Omenai-App") {
    if (authorization === process.env.APP_AUTHORIZATION_SECRET) {
      return response;
    } else {
      return NextResponse.json({}, { status: 403 });
    }
  }

  if (isOriginAllowed(origin)) {
    if (request.method === "OPTIONS") {
      const preflightResponse = NextResponse.json({}, { status: 200 });
      setCorsHeaders(preflightResponse, origin);
      return preflightResponse;
    }

    setCorsHeaders(response, origin);

    if (request.nextUrl.pathname.includes("/api/auth")) return response;

    return response;
  } else {
    return NextResponse.json({}, { status: 403 });
  }
}

function isOriginAllowed(origin: string): boolean {
  return allowed_origins.some((allowedOrigin) =>
    origin.startsWith(allowedOrigin)
  );
}

function setCorsHeaders(response: NextResponse, origin: string) {
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

export const config = {
  matcher: ["/api/:path*"], // Apply only to API routes
};
