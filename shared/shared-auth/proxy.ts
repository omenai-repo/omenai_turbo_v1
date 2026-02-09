import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import {
  base_url,
  auth_uri,
  getApiUrl,
  dashboard_url,
  admin_url,
} from "@omenai/url-config/src/config";
import { shouldSkipMiddleware } from "./middleware_skip";
import { getIronSession } from "iron-session";
import { sessionOptions } from "@omenai/shared-lib/auth/configs/session-config";
import { destroySession } from "@omenai/shared-lib/auth/session";

// 1. Define Paths that REQUIRE Authentication (Your old matcher logic)
const PROTECTED_PATHS = [
  "/admin",
  "/purchase",
  "/payment",
  "/user",
  "/gallery",
  "/artist",
];

// 2. CSP Header Definition (Same as Backend)
// apps/web/middleware.ts

const CSP_HEADER = `
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
        https://flagcdn.com
        https://upload.wikimedia.org
        https://*.stripe.com 
        https://*.rollbar.com 
        https://*.openstreetmap.org 
        https://*.tile.openstreetmap.org;

    font-src 'self' data: 
        https://fonts.gstatic.com;

    connect-src 'self' 
        http://localhost:3000
        http://localhost:3001
        http://localhost:3002
        http://localhost:3003
        http://localhost:4000
        http://localhost:5000
        http://localhost:8001
        https://staging.auth.omenai.app
        https://staging.dashboard.omenai.app
        https://staging.admin.omenai.app
        https://staging.omenai.app
        https://staging.api.omenai.app
        https://staging.tracking.omenai.app
        https://auth.omenai.app
        https://dashboard.omenai.app
        https://admin.omenai.app
        https://omenai.app
        https://join.omenai.app
        https://api.omenai.app
        https://tracking.omenai.app
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
        https://vitals.vercel-insights.com

        ws: wss:;

    frame-src 'self' 
        https://js.stripe.com 
        https://hooks.stripe.com 
        https://checkout.flutterwave.com
        https://www.omenaiinsider.com
        https://omenai.substack.com;

    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    block-all-mixed-content;
    upgrade-insecure-requests;
`
  .replace(/\s{2,}/g, " ")
  .trim();

// Helper to attach CSP to any response
function addCspHeaders(response: NextResponse) {
  response.headers.set("Content-Security-Policy", CSP_HEADER);
  return response;
}

const userDashboardRegex = /\/user\/.*/;
const galleryDashboardRegex = /\/gallery\/.*/;
const artistDashboardRegex = /\/artist\/app\/.*/;
const adminDashboardRegex = /\/admin\/.*/;
const purchasePageRegex = /\/purchase\/.*/;
const paymentPageRegex = /\/payment\/.*/;
const artistOnboardingDashboardRegex = /\/artist\/onboarding\/.*/;

export default async function proxy(req: NextRequest) {
  const pathname = req.nextUrl.pathname;
  const host = req.headers.get("host");

  // === HOST REDIRECT (Preserve Params) ===
  if (host === "omenai.app" || host === "www.omenai.app") {
    const targetUrl = new URL("https://join.omenai.app");
    req.nextUrl.searchParams.forEach((value, key) => {
      targetUrl.searchParams.set(key, value);
    });
    return NextResponse.redirect(targetUrl);
  }

  const app_auth_uri = auth_uri();

  // === PUBLIC ROUTE CHECK ===
  const publicRoutes = [
    "/",
    // Note: base_url() usually returns a full URL (https://...), so simple equality might fail
    // if pathname is just '/'. Removing it from here if it duplicates '/'
    // or ensure base_url() returns just a path.
    new URL("/login", app_auth_uri).pathname,
    new URL("/register", app_auth_uri).pathname,
    "/catalog", // Changed /catalog/* to check startsWith logic if needed, or keep as string if exact match
  ];

  // Helper for simple glob matching if publicRoutes has wildcards
  const isPublic = publicRoutes.some(
    (p) => pathname === p || pathname.startsWith(p),
  );

  if (shouldSkipMiddleware(pathname, req) || isPublic) {
    return addCspHeaders(NextResponse.next());
  }

  // === AUTHENTICATION LOGIC ===
  // Only run this heavy logic if the user is trying to access a PROTECTED path.
  // This mimics your previous 'matcher' config.
  const isProtectedPath = PROTECTED_PATHS.some((path) =>
    pathname.startsWith(path),
  );

  if (!isProtectedPath) {
    // If it's not a protected path (e.g. /about, /terms), allow access + CSP
    return addCspHeaders(NextResponse.next());
  }

  // --- Start Iron Session & Redis Check ---
  const res = NextResponse.next();
  const session = await getIronSession<{ sessionId: string }>(
    req,
    res,
    sessionOptions,
  );

  const { sessionId } = session;

  if (!sessionId) {
    const redirectUrl = pathname.startsWith("/admin/")
      ? new URL("/auth/login", admin_url())
      : new URL("/login", auth_uri());
    return NextResponse.redirect(redirectUrl);
  }

  const cookieHeader = req.headers.get("cookie") as string;

  const response = await fetch(`${getApiUrl()}/api/auth/session/user`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Origin: base_url(),
      Cookie: cookieHeader,
      "X-From-Middleware": "true",
    },
    credentials: "include",
  });

  // Handle Invalid Session
  if (!response.ok || response.status === 401) {
    destroySession(sessionId, cookieHeader);
    const redirectUrl = pathname.startsWith("/admin/")
      ? new URL("/auth/login", admin_url())
      : new URL("/login", auth_uri());
    return NextResponse.redirect(redirectUrl);
  }

  const userSessionData = await response.json();
  const { userData } = userSessionData.user;
  const role = userData.role;

  // --- Role Based Access Control (RBAC) ---
  const isUserDashboard = userDashboardRegex.test(pathname);
  const isGalleryDashboard = galleryDashboardRegex.test(pathname);
  const isPurchasePage = purchasePageRegex.test(pathname);
  const isPaymentPage = paymentPageRegex.test(pathname);
  const isArtistDashboard = artistDashboardRegex.test(pathname);
  const isAdminDashboard = adminDashboardRegex.test(pathname);
  const isOnboarding = artistOnboardingDashboardRegex.test(pathname);

  // User Role
  if (
    role === "user" &&
    (isGalleryDashboard || isArtistDashboard || isAdminDashboard)
  ) {
    return NextResponse.redirect(new URL("/user/saves", dashboard_url()));
  }

  // Gallery Role
  if (
    role === "gallery" &&
    (isUserDashboard ||
      isAdminDashboard ||
      isArtistDashboard ||
      isPurchasePage ||
      isPaymentPage)
  ) {
    return NextResponse.redirect(new URL("/gallery/overview", dashboard_url()));
  }

  // Artist Role
  if (
    role === "artist" &&
    (isUserDashboard ||
      isAdminDashboard ||
      isGalleryDashboard ||
      isPurchasePage ||
      isPaymentPage)
  ) {
    return NextResponse.redirect(
      new URL("/artist/app/overview", dashboard_url()),
    );
  }

  // Admin Role
  if (
    role === "admin" &&
    (isUserDashboard ||
      isGalleryDashboard ||
      isArtistDashboard ||
      isPurchasePage ||
      isPaymentPage)
  ) {
    return NextResponse.redirect(
      new URL("/admin/requests/gallery", admin_url()),
    );
  }

  // Onboarding Check
  if (role === "artist" && isOnboarding && userData.isOnboardingCompleted) {
    return NextResponse.redirect(
      new URL("/artist/app/overview", dashboard_url()),
    );
  }

  // Allow Access + Add CSP
  return addCspHeaders(NextResponse.next());
}

export const config = {
  // NEW MATCHER: Apply to everything EXCEPT static files and internals.
  // This ensures CSP is applied to Login, Register, and Landing pages.
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
