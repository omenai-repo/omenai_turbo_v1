import { NextRequest, NextResponse } from "next/server";
import { getSession, refreshSession } from "./lib/auth/session";
import { base_url, auth_uri } from "@omenai/url-config/src/config";

const allowed_origins = [
  "https://auth.omenai.app",
  "https://dashboard.omenai.app",
  "https://admin.omenai.app",
  "https://omenai.app",
  "http://localhost",
  "https://prodtest.omenai.app",
];

const userDashboardRegex = /\/user\/.*/;
const galleryDashboardRegex = /\/gallery\/.*/;
const purchasePageRegex = /\/purchase\/.*/;
const paymentPageRegex = /\/payment\/.*/;
function redirect(url: string) {
  return NextResponse.redirect(new URL(url));
}

export async function middleware(request: NextRequest) {
  //   const hostname = request.headers.get("host") || ""; // Get the host (e.g., "auth.omenai.app")

  // Exclude the "auth" subdomain
  //   if (hostname.startsWith("auth.")) {
  //     return NextResponse.next(); // Skip middleware for auth.omenai.app
  //   }
  const session = await getSession();
  const url = auth_uri();
  const base_path_url = base_url();

  if (!session && !request.url.startsWith(base_path_url)) {
    return redirect(url);
  }

  const isUserDashboard = userDashboardRegex.test(request.url);
  const isGalleryDashboard = galleryDashboardRegex.test(request.url);
  const isPurchasePage = purchasePageRegex.test(request.url);
  const isPaymentPage = paymentPageRegex.test(request.url);

  if (session) {
    switch (session.role) {
      case "user":
        if (isGalleryDashboard) {
          return redirect(`${url}`);
        }
        break;
      case "gallery":
        if (isUserDashboard || isPurchasePage || isPaymentPage) {
          return redirect(`${url}`);
        }
        break;
      case "admin":
        if (
          isGalleryDashboard ||
          isUserDashboard ||
          isPurchasePage ||
          isPaymentPage
        ) {
          return redirect(url);
        }
        break;
    }
  }

  if (session) {
    // Refresh session expiry

    await refreshSession(session);
  }
}

export const config = {
  matcher: ["/((?!_next|static|favicon.ico).*)"],
};
