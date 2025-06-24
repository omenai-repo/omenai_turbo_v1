import { cookies } from "next/headers";
import { getApiUrl, base_url } from "@omenai/url-config/src/config";
import { ClientSessionData } from "@omenai/shared-types";
export async function getServerSession(): Promise<ClientSessionData | null> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.toString();

    const res = await fetch(`${getApiUrl()}/api/auth/session/user`, {
      headers: {
        "Content-Type": "application/json",
        Cookie: sessionCookie,
        Origin: base_url(),
      },
      cache: "no-store", // Always fetch fresh session data
    });

    if (!res.ok) {
      return { isLoggedIn: false, user: null, csrfToken: "" };
    }

    const { user, csrfToken } = await res.json();
    return { isLoggedIn: true, user: user.userData, csrfToken };
  } catch (error) {
    console.error("Failed to fetch server session:", error);
    return { isLoggedIn: false, user: null, csrfToken: "" };
  }
}
