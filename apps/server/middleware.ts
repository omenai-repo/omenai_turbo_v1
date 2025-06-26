// Your API Next.js App's middleware file (running on http://localhost:8001)

import { NextRequest, NextResponse } from "next/server";

const allowed_origins = [
  "https://auth.omenai.app",
  "https://dashboard.omenai.app",
  "https://admin.omenai.app",
  "https://omenai.app",
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:4000",
  "http://localhost:5000",
  "https://api.omenai.app",
];

// ... (rest of your middleware code)

export default async function middleware(req: NextRequest) {
  const origin: string = req.headers.get("origin") ?? "";
  const userAgent: string = req.headers.get("User-Agent") ?? "";
  const authorization: string = req.headers.get("Authorization") ?? "";

  // Early return for webhooks - bypass all checks
  if (req.nextUrl.pathname.startsWith("/api/webhook")) {
    return NextResponse.next();
  }

  // Handle app-specific authorization
  if (userAgent === "__X-Omenai-App") {
    if (authorization === process.env.APP_AUTHORIZATION_SECRET) {
      return NextResponse.next();
    } else {
      return NextResponse.json({}, { status: 403 });
    }
  }

  // Check if origin is allowed
  if (!isOriginAllowed(origin)) {
    // Return a CORS error response for unallowed origins
    return new NextResponse(null, {
      status: 403, // Forbidden
      headers: {
        "Access-Control-Allow-Origin": "null", // Indicate no access
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  }

  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    const preflightResponse = NextResponse.json({}, { status: 200 });
    setCorsHeaders(preflightResponse, origin);
    return preflightResponse;
  }

  // Get the response
  let response: NextResponse;

  // For auth routes, let them pass through without additional processing
  // This means the /api/session route (if it's under /api/auth) will be handled by this middleware
  if (req.nextUrl.pathname.includes("/api/auth")) {
    response = NextResponse.next();
  } else {
    response = NextResponse.next();
  }

  // Set CORS headers for all allowed origins
  setCorsHeaders(response, origin);

  // Add additional headers for Clerk session sharing across subdomains
  // Note: This might be Clerk-specific, ensure it doesn't conflict with your iron-session setup
  response.headers.set("Access-Control-Allow-Credentials", "true");

  // Ensure cookies work across subdomains for session sharing
  // CRITICAL NOTE FOR LOCAL DEVELOPMENT: SameSite=None requires Secure.
  // If your localhost:8001 is HTTP, this will cause cookies to be ignored by browsers.
  // For local HTTP development, you often need to use SameSite=Lax.

  if (origin.includes("omenai.app") || origin.includes("localhost")) {
    response.headers.set("Access-Control-Allow-Credentials", "true");
    // Check if Set-Cookie header exists before trying to append
    const setCookieHeader = response.headers.get("Set-Cookie");

    if (setCookieHeader) {
      // Be careful modifying Set-Cookie. It might be better to let iron-session
      // handle its own cookie options directly.
      // If you're explicitly setting it here, ensure it's correct for your needs.
      response.headers.set(
        "Set-Cookie",
        setCookieHeader + "; SameSite=None; Secure" // Remove "Secure" if using HTTP on localhost
      );
    }
  }

  return response;
}

function isOriginAllowed(origin: string): boolean {
  return allowed_origins.some(
    (allowedOrigin) => origin.startsWith(allowedOrigin) // Using startsWith for broader matching like "http://localhost:3000"
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
    // *** THE CRITICAL FIX: ADD 'credentials' to this list! ***
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, Content-Length, x-highlight-request, traceparent, x-csrf-token, X-Csrf-Token, credentials"
  );
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/api/(.*)", // Simplified to match all /api routes
  ],
};
