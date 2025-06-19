import { NextRequest, NextResponse } from "next/server";
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const allowed_origins = [
  "https://auth.omenai.app",
  "https://dashboard.omenai.app",
  "https://admin.omenai.app",
  "https://omenai.app",
  "http://localhost",
  "https://api.omenai.app",
];

// Create route matcher for protected routes if needed
// const isProtectedRoute = createRouteMatcher(['/dashboard(.*)']);

export default clerkMiddleware(async (auth, req) => {
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
    return NextResponse.json({}, { status: 403 });
  }

  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    const preflightResponse = NextResponse.json({}, { status: 200 });
    setCorsHeaders(preflightResponse, origin);
    return preflightResponse;
  }

  // Get the response (either from Clerk or NextResponse.next())
  let response: NextResponse;

  // For auth routes, let them pass through without additional processing
  if (req.nextUrl.pathname.includes("/api/auth")) {
    response = NextResponse.next();
  }
  // For protected routes, you can add protection here
  // else if (isProtectedRoute(req)) {
  //   await auth.protect();
  //   response = NextResponse.next();
  // }
  else {
    response = NextResponse.next();
  }

  // Set CORS headers for all allowed origins
  setCorsHeaders(response, origin);

  // Add additional headers for Clerk session sharing across subdomains
  response.headers.set("Access-Control-Allow-Credentials", "true");

  // Ensure cookies work across subdomains for session sharing
  if (origin.includes("omenai.app") || origin.includes("localhost")) {
    response.headers.set("Access-Control-Allow-Credentials", "true");
    // Add SameSite configuration for cross-subdomain cookies
    response.headers.set(
      "Set-Cookie",
      response.headers.get("Set-Cookie") + "; SameSite=None; Secure"
    );
  }

  return response;
});

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
    "Content-Type, Authorization, Content-Length, x-highlight-request, traceparent, X-Clerk-Session-ID"
  );
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
