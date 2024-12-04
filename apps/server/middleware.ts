import { getSession } from "@omenai/shared-auth/lib/auth/session";
import { NextRequest, NextResponse } from "next/server";

const allowedOrigins = [
  "http://omenai.local:3000",
  "http://localhost:3000",
  "https://admin.omenai.app",
];

const corsHeaders = {
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function middleware(request: NextRequest) {
  const origin = request.headers.get("origin") ?? "";

  // Check if the origin is allowed
  const isAllowedOrigin = allowedOrigins.includes(origin);

  // Handle preflight requests
  if (request.method === "OPTIONS") {
    return NextResponse.json(
      {},
      {
        headers: {
          ...(isAllowedOrigin && { "Access-Control-Allow-Origin": origin }),
          ...corsHeaders,
        },
      }
    );
  }

  // Handle other requests
  const response = NextResponse.next();

  if (isAllowedOrigin) {
    response.headers.set("Access-Control-Allow-Origin", origin);
  }

  Object.entries(corsHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  if (request.nextUrl.pathname.includes("/api/auth")) return response;

  const session = await getSession();
  console.log(session);

  return response;
}

export const config = {
  matcher: ["/api/:path*"], // Apply only to API routes
};
