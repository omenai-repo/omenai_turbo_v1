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

  const cspHeader = `
    default-src 'self';
    
    script-src 'self' 'unsafe-eval' 'unsafe-inline' 
        https://js.stripe.com 
        https://checkout.flutterwave.com 
        https://*.rollbar.com 
        https://*.highlight.io 
        https://*.posthog.com 
        https://us.i.posthog.com 
        https://eu.i.posthog.com
        https://va.vercel-scripts.com 
        https://vitals.vercel-insights.com;
        
    style-src 'self' 'unsafe-inline' 
        https://fonts.googleapis.com;
        
    img-src 'self' blob: data: 
        https://fra.cloud.appwrite.io 
        https://cloud.appwrite.io
        https://res.cloudinary.com 
        https://*.stripe.com 
        https://*.rollbar.com 
        https://*.openstreetmap.org 
        https://*.tile.openstreetmap.org;
        
    font-src 'self' data: 
        https://fonts.gstatic.com;
        
    connect-src 'self' 
        https://fra.cloud.appwrite.io 
        https://cloud.appwrite.io
        https://api.stripe.com 
        https://api.flutterwave.com 
        https://*.rollbar.com 
        https://*.highlight.io 
        https://*.posthog.com 
        https://us.i.posthog.com 
        https://eu.i.posthog.com
        https://cdn-global.configcat.com 
        https://api.positionstack.com 
        https://generativelanguage.googleapis.com 
        https://vitals.vercel-insights.com;
        
    frame-src 'self' 
        https://js.stripe.com 
        https://hooks.stripe.com 
        https://checkout.flutterwave.com;
        
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    block-all-mixed-content;
    upgrade-insecure-requests;
  `;

  // Minify the string (remove newlines/spaces)
  const contentSecurityPolicyHeaderValue = cspHeader
    .replace(/\s{2,}/g, " ")
    .trim();

  // Set the header
  response.headers.set(
    "Content-Security-Policy",
    contentSecurityPolicyHeaderValue,
  );

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
