import { NextRequest, NextResponse } from "next/server";
import { JWTPayload, jwtVerify, SignJWT } from "jose";
import { LRUCache } from "lru-cache";

const allowed_origins = [
  "https://auth.omenai.app",
  "https://dashboard.omenai.app",
  "https://admin.omenai.app",
  "https://omenai.app",
  "http://localhost",
];

// In-memory cache for session data
const sessionCache = new LRUCache({
  max: 500, // Max cache size (adjust as necessary)
  ttl: 30 * 60 * 1000, // Cache expiry TTL, adjust as necessary (30 minutes here)
});

const maxTTL = 60 * 60; // Maximum TTL for session in seconds (e.g., 60 minutes)
const refreshThreshold = 10; // Percentage threshold (10%) for refreshing the session

const jwtSecret = new TextEncoder().encode(process.env.JWT_SECRET); // Cache the encoded JWT secret

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const origin: string = request.headers.get("origin") ?? "";
  const userAgent: string = request.headers.get("User-Agent") ?? "";
  const authorization: string = request.headers.get("Authorization") ?? "";
  const cookie = request.cookies.get("session")?.value;

  // Skip if cookie is not available
  if (!cookie) {
    return NextResponse.redirect("https://auth.omenai.app/login"); // Redirect to auth subdomain
  }

  if (request.nextUrl.pathname.startsWith("/api/webhook")) return response;

  // Handling specific user agent request for app authorization
  if (userAgent === "__X-Omenai-App") {
    if (authorization === process.env.APP_AUTHORIZATION_SECRET) {
      return response;
    } else {
      return NextResponse.json({}, { status: 403 });
    }
  }

  // Handle CORS for allowed origins
  if (isOriginAllowed(origin)) {
    // Handle preflight (OPTIONS) requests
    if (request.method === "OPTIONS") {
      const preflightResponse = NextResponse.json({}, { status: 200 });
      setCorsHeaders(preflightResponse, origin);
      return preflightResponse;
    }

    setCorsHeaders(response, origin);

    if (request.nextUrl.pathname.includes("/api/auth")) return response;

    // Now handle session logic
    let sessionData = sessionCache.get(cookie);

    if (!sessionData) {
      // If session not found in cache, decrypt the cookie
      try {
        const { payload } = await jwtVerify(cookie, jwtSecret);
        sessionData = payload;

        // Cache the decrypted session data
        sessionCache.set(cookie, sessionData);

        // Calculate percentage left of TTL
        const currentTime = Math.floor(Date.now() / 1000);
        const remainingTTL = payload.exp! - currentTime;
        const percentageRemaining = (remainingTTL / maxTTL) * 100;

        // If the remaining TTL is below the threshold (10%), update the expiry
        if (percentageRemaining <= refreshThreshold) {
          await refreshSessionCookie(
            response,
            cookie,
            payload,
            sessionData,
            currentTime
          );
        }
      } catch (error) {
        return NextResponse.redirect("https://auth.omenai.app/login"); // Invalid session, redirect
      }
    } else {
      // Session found in cache, calculate remaining TTL and possibly refresh expiry
      const currentTime = Math.floor(Date.now() / 1000);
      const remainingTTL = (sessionData as JWTPayload).exp! - currentTime;
      const percentageRemaining = (remainingTTL / maxTTL) * 100;

      if (percentageRemaining <= refreshThreshold) {
        await refreshSessionCookie(
          response,
          cookie,
          sessionData,
          sessionData,
          currentTime
        );
      }
    }

    // Pass session data to the request for further use
    return response;
  } else {
    return NextResponse.json({}, { status: 403 });
  }
}

function isOriginAllowed(origin: string): boolean {
  return allowed_origins.some((allowedOrigin) =>
    origin.startsWith(allowedOrigin)
  );
}

function setCorsHeaders(response: NextResponse, origin: string) {
  response.headers.set("Access-Control-Allow-Credentials", "true");
  response.headers.set("Access-Control-Allow-Origin", origin);
  response.headers.set(
    "Access-Control-Allow-Methods",
    "GET, DELETE, PATCH, POST, PUT, OPTIONS"
  );
  response.headers.set(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, Content-Length"
  );
}

async function refreshSessionCookie(
  response: NextResponse,
  cookie: string,
  payload: JWTPayload,
  sessionData: JWTPayload,
  currentTime: number
) {
  const newExpiry = currentTime + maxTTL;
  const updatedSessionCookie = await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime(newExpiry)
    .sign(jwtSecret);

  // Update the session cookie in response header
  response.headers.set(
    "Set-Cookie",
    `session=${updatedSessionCookie}; HttpOnly; Secure; SameSite=Lax; Path=/; Domain=.omenai.app; Max-Age=${maxTTL}`
  );
  // Update cache with new expiry time
  sessionCache.set(cookie, { ...sessionData, exp: newExpiry });
}

export const config = {
  matcher: ["/api/:path*"], // Apply only to API routes
};
