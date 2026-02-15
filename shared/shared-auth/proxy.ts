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

// 1. Define Paths that REQUIRE Authentication
const PROTECTED_PATHS = [
  "/admin",
  "/purchase",
  "/payment",
  "/user",
  "/gallery",
  "/artist",
];

export default async function proxy(req: NextRequest) {
  const pathname = req.nextUrl.pathname;
  const host = req.headers.get("host");

  const nonce = crypto.randomUUID();

  // 1. Define CSP with newlines for readability
  const cspHeader = `
  default-src 'self';

  script-src
    'self'
    'unsafe-eval'
    'nonce-${nonce}'
    https://js.stripe.com
    https://checkout.flutterwave.com
    https://*.rollbar.com
    https://*.highlight.io
    https://*.posthog.com
    https://us.i.posthog.com
    https://eu.i.posthog.com
    https://va.vercel-scripts.com
    https://vitals.vercel-insights.com;

  style-src
    'self'
    'unsafe-inline'
    https://fonts.googleapis.com;

  img-src
    'self'
    blob:
    data:
    https://sfo.cloud.appwrite.io
    https://fra.cloud.appwrite.io
    https://cloud.appwrite.io
    https://res.cloudinary.com
    https://flagcdn.com
    https://upload.wikimedia.org
    https://*.stripe.com
    https://*.rollbar.com
    https://*.openstreetmap.org
    https://*.tile.openstreetmap.org;

  font-src
    'self'
    data:
    https://fonts.gstatic.com;

  connect-src
'self'
    http://localhost:*
    https://staging.api.omenai.app
    https://admin.omenai.app
    https://api.omenai.app
    https://sfo.cloud.appwrite.io
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
    ws:
    wss:;

  frame-src
    'self'
    https://js.stripe.com
    https://hooks.stripe.com
    https://checkout.flutterwave.com
    https://www.omenaiinsider.com
    https://*.substack.com
    https://substack.com;

  object-src 'none';
  base-uri 'self';
  form-action 'self';
  frame-ancestors 'none';
  upgrade-insecure-requests;
`;

  // 2. 🛡️ CRITICAL FIX: Replace ALL whitespace/newlines with a single space
  const contentSecurityPolicy = cspHeader.replace(/\s+/g, " ").trim();

  // === HELPER: Finalize Response with Headers ===
  const finalizeResponse = (response: NextResponse) => {
    response.headers.set("Content-Security-Policy", contentSecurityPolicy);
    return response;
  };

  // === HELPER: Create Next() with Nonce ===
  // We must pass the nonce in request headers so the UI (app/layout) can read it
  const nextWithNonce = () => {
    const requestHeaders = new Headers(req.headers);
    requestHeaders.set("x-nonce", nonce);
    requestHeaders.set("Content-Security-Policy", contentSecurityPolicy);
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  };

  if (
    pathname.startsWith("/privacy") &&
    (host === "omenai.app" || host === "www.omenai.app")
  )
    return finalizeResponse(nextWithNonce());

  const app_auth_uri = auth_uri();

  // === PUBLIC ROUTE CHECK ===
  const publicRoutes = [
    "/",
    new URL("/login", app_auth_uri).pathname,
    new URL("/register", app_auth_uri).pathname,
    "/catalog",
  ];

  const isPublic = publicRoutes.some(
    (p) => pathname === p || pathname.startsWith(p),
  );

  if (shouldSkipMiddleware(pathname, req) || isPublic) {
    return finalizeResponse(nextWithNonce());
  }

  // === AUTH CHECK ===
  const isProtectedPath = PROTECTED_PATHS.some((path) =>
    pathname.startsWith(path),
  );

  if (!isProtectedPath) {
    return finalizeResponse(nextWithNonce());
  }

  // --- Start Iron Session ---
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

  // === RBAC LOGIC ===
  const userDashboardRegex = /\/user\/.*/;
  const galleryDashboardRegex = /\/gallery\/.*/;
  const artistDashboardRegex = /\/artist\/app\/.*/;
  const adminDashboardRegex = /\/admin\/.*/;
  const purchasePageRegex = /\/purchase\/.*/;
  const paymentPageRegex = /\/payment\/.*/;
  const artistOnboardingDashboardRegex = /\/artist\/onboarding\/.*/;

  const isUserDashboard = userDashboardRegex.test(pathname);
  const isGalleryDashboard = galleryDashboardRegex.test(pathname);
  const isPurchasePage = purchasePageRegex.test(pathname);
  const isPaymentPage = paymentPageRegex.test(pathname);
  const isArtistDashboard = artistDashboardRegex.test(pathname);
  const isAdminDashboard = adminDashboardRegex.test(pathname);
  const isOnboarding = artistOnboardingDashboardRegex.test(pathname);

  if (
    role === "user" &&
    (isGalleryDashboard || isArtistDashboard || isAdminDashboard)
  ) {
    return NextResponse.redirect(new URL("/user/saves", dashboard_url()));
  }

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

  if (role === "artist" && isOnboarding && userData.isOnboardingCompleted) {
    return NextResponse.redirect(
      new URL("/artist/app/overview", dashboard_url()),
    );
  }

  // === SUCCESS ===
  return finalizeResponse(nextWithNonce());
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|site.webmanifest|robots.txt).*)",
  ],
};
