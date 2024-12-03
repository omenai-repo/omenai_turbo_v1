import { NextRequest, NextResponse } from "next/server";
import { getSession, refreshSession } from "./lib/auth/session";

const userDashboardRegex = /\/user\/.*/;
const galleryDashboardRegex = /\/gallery\/.*/;
const purchasePageRegex = /\/purchase\/.*/;
const paymentPageRegex = /\/payment\/.*/;
const loginRoute_prod = "https://auth.omenai.app/login";
const localhost_login_route = "http://localhost:4000/login";
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

  if (!session) {
    return redirect(localhost_login_route);
  }

  const isUserDashboard = userDashboardRegex.test(request.url);
  const isGalleryDashboard = galleryDashboardRegex.test(request.url);
  const isPurchasePage = purchasePageRegex.test(request.url);
  const isPaymentPage = paymentPageRegex.test(request.url);

  if (session) {
    switch (session.role) {
      case "user":
        if (isGalleryDashboard) {
          return redirect(`${localhost_login_route}/gallery`);
        }
        break;
      case "gallery":
        if (isUserDashboard || isPurchasePage || isPaymentPage) {
          return redirect(`${localhost_login_route}/user`);
        }
        break;
      case "admin":
        if (
          isGalleryDashboard ||
          isUserDashboard ||
          isPurchasePage ||
          isPaymentPage
        ) {
          return redirect(localhost_login_route);
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
