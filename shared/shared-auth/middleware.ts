import { NextRequest, NextResponse } from "next/server";
import { getSession, refreshSession } from "./lib/auth/session";
import { base_url, auth_uri } from "@omenai/url-config/src/config";

const userDashboardRegex = /\/user\/.*/;
const galleryDashboardRegex = /\/gallery\/.*/;
const artistDashboardRegex = /\/artist\/.*/;
const purchasePageRegex = /\/purchase\/.*/;
const paymentPageRegex = /\/payment\/.*/;
function redirect(url: string) {
  return NextResponse.redirect(new URL(url));
}

export async function middleware(request: NextRequest) {
  const session = await getSession();
  const auth_url = auth_uri();
  const base_path_url = base_url();

  if (!session && !request.url.startsWith(base_path_url)) {
    return redirect(`${auth_url}/login`);
  }

  const isUserDashboard = userDashboardRegex.test(request.url);
  const isGalleryDashboard = galleryDashboardRegex.test(request.url);
  const isPurchasePage = purchasePageRegex.test(request.url);
  const isPaymentPage = paymentPageRegex.test(request.url);
  const isArtistDashboard = artistDashboardRegex.test(request.url);

  if (session) {
    switch (session.role) {
      case "user":
        if (isGalleryDashboard || isArtistDashboard) {
          return redirect(`${auth_url}/login`);
        }
        break;
      case "gallery":
        if (
          isUserDashboard ||
          isPurchasePage ||
          isPaymentPage ||
          isArtistDashboard
        ) {
          return redirect(`${auth_url}/login`);
        }
        break;
      case "admin":
        if (
          isGalleryDashboard ||
          isUserDashboard ||
          isPurchasePage ||
          isPaymentPage ||
          isArtistDashboard
        ) {
          return redirect(`${auth_url}/login`);
        }
        break;
      case "artist":
        if (
          isUserDashboard ||
          isGalleryDashboard ||
          isPurchasePage ||
          isPaymentPage
        ) {
          return redirect(`${auth_url}/login`);
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
