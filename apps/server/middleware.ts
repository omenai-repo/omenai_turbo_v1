import { getSession } from "@omenai/shared-auth/lib/auth/session";
import { NextRequest, NextResponse } from "next/server";
const allowedOrigins = [
  "http://omenai.local:3000",
  "http://localhost:3000",
  "https://admin.omenai.app",
];
const corsOptions = {
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function middleware(request: NextRequest) {
  // Check the origin from the request
  const origin = request.headers.get("origin") ?? "";
  const isAllowedOrigin = allowedOrigins.includes(origin);
  console.log(origin);

  // Handle preflighted requests
  const isPreflight = request.method === "OPTIONS";

  if (isPreflight) {
    const preflightHeaders = {
      ...(isAllowedOrigin && { "Access-Control-Allow-Origin": origin }),
      ...corsOptions,
    };
    return NextResponse.json({}, { headers: preflightHeaders });
  }

  // Handle simple requests
  const response = NextResponse.next();

  if (isAllowedOrigin) {
    response.headers.set("Access-Control-Allow-Origin", origin);
  }

  Object.entries(corsOptions).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  if (request.nextUrl.pathname.includes("/api/auth")) return response;
  // else {
  // }

  // if (request.nextUrl.pathname === "/auth/login")
  //   if (isMobileApp && isMobileApp === "Omenai-X-app/1.0.0") {
  //     if (mobileAuth === process.env.APP_AUTHORIZATION_SECRET) {
  //       return response;
  //     } else {
  //       return NextResponse.json(
  //         { message: "Invalid Authorization signatures" },
  //         { status: 403 }
  //       );
  //     }
  //   }

  const session = await getSession();
  console.log(session);
  // if (session === undefined)
  //   return NextResponse.json(
  //     { message: "Session expired, please login" },
  //     { status: 403 }
  //   );

  return response;
}

export const config = {
  matcher: ["/api/:path*"], // Apply only to API routes
};
