// middleware.ts
import { NextRequest, NextResponse } from "next/server";

// 1. Use a Set for O(1) lookups and exact matching (No startsWith!)
const ALLOWED_ORIGINS = new Set([
  "https://staging.auth.omenai.app",
  "https://staging.dashboard.omenai.app",
  "https://staging.admin.omenai.app",
  "https://staging.omenai.app",
  "https://staging.api.omenai.app",
  "https://staging.tracking.omenai.app",
  "https://auth.omenai.app",
  "https://dashboard.omenai.app",
  "https://admin.omenai.app",
  "https://omenai.app",
  "https://join.omenai.app",
  "https://api.omenai.app",
  "https://tracking.omenai.app",
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:4000",
  "http://localhost:5000",
  "http://localhost:3002",
  "http://localhost:3003",
]);

export default async function proxy(req: NextRequest) {
  const origin = req.headers.get("origin") ?? "";

  // 2. Early return for Webhooks (Pass-through but strictly scoped)
  if (req.nextUrl.pathname.startsWith("/api/webhook")) {
    return NextResponse.next();
  }

  // 3. Handle CORS Preflight (OPTIONS)
  if (req.method === "OPTIONS") {
    // Only allow if origin is explicitly in our whitelist
    if (ALLOWED_ORIGINS.has(origin)) {
      const resp = new NextResponse(null, { status: 200 });
      setCorsHeaders(resp, origin);
      return resp;
    }
    return new NextResponse(null, { status: 403 });
  }

  // 4. Validate Origin for standard requests
  // If browser request (has origin) AND origin is not allowed -> Block
  if (origin && !ALLOWED_ORIGINS.has(origin)) {
    return new NextResponse(null, { status: 403, statusText: "Access Denied" });
  }

  const response = NextResponse.next();

  // 5. Apply CORS headers to the response if origin was valid
  if (origin && ALLOWED_ORIGINS.has(origin)) {
    setCorsHeaders(response, origin);
  }

  // 6. Mobile "Session" Compatibility
  // If it's a mobile request with a Bearer token, we don't need to do anything here.
  // The Route Handler will validate the token against Redis.
  // We DO NOT check static secrets here.

  return response;
}

function setCorsHeaders(res: NextResponse, origin: string) {
  res.headers.set("Access-Control-Allow-Origin", origin);
  res.headers.set("Access-Control-Allow-Credentials", "true");
  res.headers.set(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS, PATCH",
  );
  res.headers.set(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, X-Csrf-Token, X-Requested-With, Sentry-Trace, Baggage",
  );
}

export const config = {
  matcher: ["/api/:path*"],
};
