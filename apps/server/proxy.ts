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
  "http://localhost:8001",
]);

export default async function proxy(req: NextRequest) {
  const origin = req.headers.get("origin") ?? "";
  const userAgent = req.headers.get("user-agent") ?? "";
  const referer = req.headers.get("referer");
  const mobileKey = req.headers.get("x-access-key") ?? "";

  if (req.nextUrl.pathname.startsWith("/api/webhook")) {
    return NextResponse.next();
  }

  if (userAgent === process.env.MOBILE_USER_AGENT) {
    if (mobileKey !== process.env.MOBILE_ACCESS_KEY) {
      return NextResponse.json({ message: "Invalid App Key" }, { status: 403 });
    }
  } else {
    const validOrigin = origin && ALLOWED_ORIGINS.has(origin);
    const validReferer =
      referer && Array.from(ALLOWED_ORIGINS).some((u) => referer.startsWith(u));

    if (!validOrigin && !validReferer) {
      return NextResponse.json(
        { message: "Access Denied: Bad Origin gotten" },
        { status: 403 },
      );
    }
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
