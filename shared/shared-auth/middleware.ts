// src/middleware.ts (or middleware.ts at the root of your UI/Pages app)

import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
// Assuming these are configured for the UI app (localhost:3000)
// For `auth_uri`, it should typically point to your Clerk sign-in route within THIS app.
import {
  base_url,
  auth_uri, // This should internally resolve to 'http://localhost:3000/sign-in' or similar
  dashboard_url,
} from "@omenai/url-config/src/config";
import { shouldSkipMiddleware } from "@omenai/shared-auth/middleware_skip";
// You likely have this type defined somewhere in your monorepo, e.g., in a shared types package

// Define matchers for your protected routes (relative to THIS UI app)

const userDashboardRegex = /\/user\/.*/;
const galleryDashboardRegex = /\/gallery\/.*/;
const artistDashboardRegex = /\/artist\/.*/;
const adminDashboardRegex = /\/admin\/.*/;
const purchasePageRegex = /\/purchase\/.*/;
const paymentPageRegex = /\/payment\/.*/;

// Helper for redirecting unauthenticated users to the Clerk sign-in page of THIS UI app
function redirectToClerkSignIn(req: NextRequest): NextResponse {
  // Use Clerk's default sign-in URL or a custom one defined in your Clerk environment variables
  // (e.g., NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in)
  const signInUrl = new URL("/login", auth_uri());
  signInUrl.searchParams.set("redirect_url", req.url); // Preserve intended destination
  return NextResponse.redirect(signInUrl);
}

export default clerkMiddleware(async (auth, req: NextRequest) => {
  const pathname = req.nextUrl.pathname; // Get the current path

  // Ensure these URLs correctly resolve to the UI app's domain (localhost:3000)
  // `base_url` should be 'http://localhost:3000'
  // `auth_uri` should point to where Clerk sign-in/up is mounted in this UI app, e.g., 'http://localhost:3000/sign-in'
  // `dashboard_url` should be a general dashboard base for this app, e.g., 'http://localhost:3000/dashboard'
  const app_base_url = base_url();
  const app_auth_uri = auth_uri(); // Assuming this is like 'http://localhost:3000/login' or similar for the UI app

  // --- 1. Define public routes that don't require authentication in THIS UI app ---
  // Use direct string paths for clarity and to avoid URL object complexities for simple routes.
  const publicRoutes = [
    "/", // Homepage
    // These should be the paths where Clerk sign-in/sign-up components are mounted in THIS app
    // e.g., if you have a page at /sign-in and /sign-up
    new URL("/login", app_auth_uri).pathname, // e.g., /login (if this path is handled by Clerk on 3000)
    new URL("/register", app_auth_uri).pathname, // e.g., /register (if this path is handled by Clerk on 3000)
    "/catalog",
    "/search",
    "/artwork",
    "/categories",
    "/collections",
    // Add any other public routes here (e.g., /about, /contact)
  ];

  const isPublicRoute = publicRoutes.some(
    (route) => pathname === route || pathname.startsWith(route + "/")
  );

  if (isPublicRoute) {
    return NextResponse.next();
  }

  if (shouldSkipMiddleware(pathname, req)) {
    return NextResponse.next();
  }
  // --- 2. If the user is not authenticated for a protected page, protect the route ---
  const { userId, sessionClaims } = await auth();
  console.log(userId, sessionClaims);

  if (!userId) {
    console.log(
      `[UI Middleware] Unauthenticated access to protected route: ${pathname}. Redirecting to sign-in.`
    );
    return redirectToClerkSignIn(req); // Redirect to the Clerk sign-in page of this UI app
  }

  // --- 3. Role-based Authorization Logic ---
  // Safely get the user's role from publicMetadata (Corrected access)
  const role = sessionClaims.role;

  // Console log for debugging roles and paths
  console.log(
    `[UI Middleware] User ${userId} with role '${role}' attempting to access: ${pathname}`
  );

  const isUserDashboard = userDashboardRegex.test(pathname);
  const isGalleryDashboard = galleryDashboardRegex.test(pathname);
  const isPurchasePage = purchasePageRegex.test(pathname);
  const isPaymentPage = paymentPageRegex.test(pathname);
  const isArtistDashboard = artistDashboardRegex.test(pathname);
  const isAdminDashboard = adminDashboardRegex.test(pathname);

  // User role restrictions
  if (
    role === "user" &&
    (isGalleryDashboard || isArtistDashboard || isAdminDashboard)
  ) {
    console.log(
      `[UI Middleware] User role '${role}' forbidden from ${pathname}. Redirecting to user's dashboard.`
    );
    return NextResponse.redirect(new URL("/login", auth_uri())); // Redirect to their actual user dashboard
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
      `[UI Middleware] Gallery role '${role}' forbidden from ${pathname}. Redirecting to gallery's dashboard.`
    );
    return NextResponse.redirect(new URL("/login", auth_uri())); // Redirect to their actual gallery dashboard
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
      `[UI Middleware] Artist role '${role}' forbidden from ${pathname}. Redirecting to artist's dashboard.`
    );
    return NextResponse.redirect(new URL("/login", auth_uri())); // Redirect to their actual artist dashboard
  }

  // Admin role restrictions (adjust if admins should have full access)
  if (
    role === "admin" &&
    (isUserDashboard ||
      isAdminDashboard ||
      isGalleryDashboard ||
      isArtistDashboard ||
      isPurchasePage ||
      isPaymentPage)
  ) {
    console.log(
      `[UI Middleware] Admin role '${role}' restricted from ${pathname}. Redirecting to admin dashboard.`
    );
    return NextResponse.redirect(new URL("/login", auth_uri())); // Redirect to their actual admin dashboard
  }

  // If no specific rule blocks access, allow the req to proceed
  return NextResponse.next();
});

// --- **THE CRUCIAL `config.matcher` for your UI/Pages App (localhost:3000)** ---
export const config = {
  matcher: [
    // Only run middleware on these specific paths
    "/admin/:path*",
    "/purchase/:path*",
    "/payment/:path*",
    "/user/:path*",
    "/gallery/:path*",
    "/artist/:path*",
    // Add other protected routes as needed
  ],
};
