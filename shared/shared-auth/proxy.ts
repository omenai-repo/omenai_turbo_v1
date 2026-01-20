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

const userDashboardRegex = /\/user\/.*/;
const galleryDashboardRegex = /\/gallery\/.*/;
const artistDashboardRegex = /\/artist\/app\/.*/;
const adminDashboardRegex = /\/admin\/.*/;
const purchasePageRegex = /\/purchase\/.*/;
const paymentPageRegex = /\/payment\/.*/;
const artistOnboardingDashboardRegex = /\/artist\/onboarding\/.*/;

export default async function proxy(req: NextRequest) {
  const pathname = req.nextUrl.pathname; // Get the current path

  const host = req.headers.get("host");

  // Check if we are on the root domain (not 'join')
  if (host === "omenai.app" || host === "www.omenai.app") {
    // 1. Create the destination URL
    const targetUrl = new URL("https://join.omenai.app");

    // 2. ⚡ CAPTURE: Copy all params from the current request to the target
    // req.nextUrl.searchParams contains everything the user typed (?a=b&c=d)
    req.nextUrl.searchParams.forEach((value, key) => {
      targetUrl.searchParams.set(key, value);
    });

    // 3. Redirect with the baggage included
    return NextResponse.redirect(targetUrl);
  }
  const app_auth_uri = auth_uri();

  const publicRoutes = [
    "/", // Homepage
    new URL("/login", app_auth_uri).pathname,
    new URL("/register", app_auth_uri).pathname,
    "/catalog/*",
    "/search/*",
    "/artwork/*",
    "/categories/*",
  ];
  if (shouldSkipMiddleware(pathname, req) || publicRoutes.includes(pathname)) {
    return NextResponse.next();
  }

  const res = NextResponse.next();

  // For middleware, getIronSession needs the request and response objects.
  const session = await getIronSession<{ sessionId: string }>(
    req,
    res,
    sessionOptions,
  );

  const { sessionId } = session;

  // Redirect to login if no session cookie is found

  if (!sessionId) {
    if (pathname.startsWith("/admin/")) {
      const redirect_url = new URL("/auth/login", admin_url());
      return NextResponse.redirect(redirect_url);
    } else {
      const loginUrl = new URL("/login", auth_uri());
      return NextResponse.redirect(loginUrl);
    }
  }

  const cookieHeader = req.headers.get("cookie") as string;

  // Verify the session ID is still valid in Redis by calling our own API.
  // This is the recommended pattern since middleware (especially on the edge)
  // cannot directly connect to a database like Redis.

  const response = await fetch(`${getApiUrl()}/api/auth/session/user`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Origin: base_url(),
      Cookie: cookieHeader, // Include the cookie for session verification
      "X-From-Middleware": "true",
    },
    credentials: "include", // Ensure cookies are sent with the request
  });

  const userSessionData = await response.json();

  // If the /api/user route returns an unauthorized status, the session is invalid.
  if (!response.ok || response.status === 401) {
    destroySession(sessionId, cookieHeader);
    if (pathname.startsWith("/admin/")) {
      const redirect_url = new URL("/auth/login", admin_url());
      return NextResponse.redirect(redirect_url);
    } else {
      const loginUrl = new URL("/login", auth_uri());
      return NextResponse.redirect(loginUrl);
    }
  }

  const { userData } = userSessionData.user;
  const role = userData.role;
  const isUserDashboard = userDashboardRegex.test(pathname);
  const isGalleryDashboard = galleryDashboardRegex.test(pathname);
  const isPurchasePage = purchasePageRegex.test(pathname);
  const isPaymentPage = paymentPageRegex.test(pathname);
  const isArtistDashboard = artistDashboardRegex.test(pathname);
  const isAdminDashboard = adminDashboardRegex.test(pathname);
  const isOnboarding = artistOnboardingDashboardRegex.test(pathname);

  // User role restrictions
  if (
    role === "user" &&
    (isGalleryDashboard || isArtistDashboard || isAdminDashboard)
  ) {
    return NextResponse.redirect(new URL("/user/saves", dashboard_url())); // Redirect to their actual user dashboard
  }

  // Gallery role restrictions
  if (
    role === "gallery" &&
    (isUserDashboard ||
      isAdminDashboard ||
      isArtistDashboard ||
      isPurchasePage ||
      isPaymentPage)
  ) {
    console.log(
      `[UI Middleware] Gallery role '${role}' forbidden from ${pathname}. Redirecting to gallery's dashboard.`,
    );
    return NextResponse.redirect(new URL("/gallery/overview", dashboard_url())); // Redirect to their actual gallery dashboard
  }

  // Artist role restrictions
  if (
    role === "artist" &&
    (isUserDashboard ||
      isAdminDashboard ||
      isGalleryDashboard ||
      isPurchasePage ||
      isPaymentPage)
  ) {
    console.log(
      `[UI Middleware] Artist role '${role}' forbidden from ${pathname}. Redirecting to artist's dashboard.`,
    );
    return NextResponse.redirect(
      new URL("/artist/app/overview", dashboard_url()),
    ); // Redirect to their actual artist dashboard
  }

  // Admin role restrictions (adjust if admins should have full access)
  if (
    role === "admin" &&
    (isUserDashboard ||
      isGalleryDashboard ||
      isArtistDashboard ||
      isPurchasePage ||
      isPaymentPage)
  ) {
    console.log(
      `[UI Middleware] Admin role '${role}' restricted from ${pathname}. Redirecting to login`,
    );
    return NextResponse.redirect(
      new URL("/admin/requests/gallery", admin_url()),
    ); // Redirect to their actual admin dashboard
  }

  // Other restriction
  if (role === "artist" && isOnboarding) {
    if (userData.isOnboardingCompleted)
      return NextResponse.redirect(
        new URL("/artist/app/overview", dashboard_url()),
      ); // Redirect to their actual artist dashboard
  }

  // If no specific rule blocks access, allow the req to proceed
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Only run middleware on these specific paths
    "/admin/:path*",
    "/purchase/:path*",
    "/payment/:path*",
    "/user/:path*",
    "/gallery/:path*",
    "/artist/:path*",
  ],
};
