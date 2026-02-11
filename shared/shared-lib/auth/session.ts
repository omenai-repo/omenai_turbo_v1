// session.ts - Using Web Crypto API instead of Node.js crypto
import { getIronSession } from "iron-session";
import { redis } from "@omenai/upstash-config";
import { sessionOptions } from "./configs/session-config";
import { SessionDataType } from "@omenai/shared-types";
import { v4 as uuidv4 } from "uuid";

const id = uuidv4(); // e.g. "f47ac10b-58cc-4372-a567-0e02b2c3d479"
export const SESSION_TTL = 60 * 60; // 1 hour in seconds

interface SessionData {
  userId: string;
  userData: SessionDataType;
  userAgent?: string | null;
}

// Web Crypto API function to generate random bytes
function generateRandomId(): string {
  return uuidv4().replaceAll(/-/g, "");
}

// Alternative using crypto.randomUUID() for shorter IDs

export async function createSession(data: SessionData) {
  const sessionId = generateRandomId(); // 32 character hex string
  const csrfToken = generateRandomId(); // 32 character hex string
  const sessionData = { ...data, csrfToken };

  await redis.set(`session:${sessionId}`, JSON.stringify(sessionData), {
    ex: SESSION_TTL,
  });
  return sessionId;
}

// Enhanced session cleanup utility
export async function cleanupSession(sessionId: string, cookieStore?: any) {
  await redis.del(`session:${sessionId}`);

  if (cookieStore) {
    try {
      const session = await getIronSession<{ sessionId: string }>(
        cookieStore,
        sessionOptions,
      );
      session.destroy();
    } catch (e) {
      // Ignore cleanup errors
    }
  }
}

// Enhanced getSession with proper cleanup
export async function getSession(sessionId: string, cookieStore?: any) {
  const sessionDataJSON = await redis.get(`session:${sessionId}`);

  if (!sessionDataJSON) {
    // Only attempt cookie cleanup if cookieStore exists
    if (cookieStore) await cleanupSession(sessionId, cookieStore);
    return null;
  }

  let sessionData: SessionData & { csrfToken: string };

  try {
    sessionData =
      typeof sessionDataJSON === "string"
        ? JSON.parse(sessionDataJSON)
        : sessionDataJSON;
  } catch (error) {
    await cleanupSession(sessionId, cookieStore);
    return null;
  }

  // Sliding session: reset TTL
  await redis.expire(`session:${sessionId}`, SESSION_TTL);
  return sessionData;
}

// Function to destroy a session (enhanced)
export async function destroySession(sessionId: string, cookieStore?: any) {
  await cleanupSession(sessionId, cookieStore);
}

// Wrapper to manage the session cookie
export async function getSessionFromCookie(cookieStore: any) {
  const session = await getIronSession<{ sessionId: string }>(
    cookieStore,
    sessionOptions,
  );
  return session;
}

export async function getSessionIdFromRequest(
  req: Request,
  cookieStore: any,
): Promise<string | undefined> {
  // 1. Priority: Check Authorization Header (Mobile/API)
  const authHeader = req.headers.get("Authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];
    if (token) return token;
  }

  // 2. Fallback: Check Cookies (Web)
  try {
    const session = await getIronSession<{ sessionId: string }>(
      cookieStore,
      sessionOptions,
    );
    if (session.sessionId) return session.sessionId;
  } catch (e) {
    // Ignore cookie errors if we are just looking for an ID
  }

  return undefined;
}

// Utility: Check if session exists without extending TTL
export async function checkSessionExists(sessionId: string): Promise<boolean> {
  const exists = await redis.exists(`session:${sessionId}`);
  return exists === 1;
}

// Utility: Get session data without sliding (for middleware checks)
export async function getSessionWithoutSliding(
  sessionId: string,
  userAgent: string | null,
): Promise<(SessionData & { csrfToken: string }) | null> {
  const sessionDataJSON = await redis.get(`session:${sessionId}`);

  if (!sessionDataJSON) {
    return null;
  }

  try {
    const sessionData =
      typeof sessionDataJSON === "string"
        ? JSON.parse(sessionDataJSON)
        : sessionDataJSON;

    // Security check without sliding
    if (!userAgent || sessionData.userAgent !== userAgent) {
      return null;
    }

    return sessionData;
  } catch (error) {
    return null;
  }
}

// Utility: Refresh session with new data
export async function refreshSession(
  sessionId: string,
  newData?: Partial<SessionData>,
) {
  const currentSession = await redis.get(`session:${sessionId}`);
  if (!currentSession) return false;

  const sessionData =
    typeof currentSession === "string"
      ? JSON.parse(currentSession)
      : currentSession;
  const updatedData = { ...sessionData, ...newData };

  await redis.set(`session:${sessionId}`, JSON.stringify(updatedData), {
    ex: SESSION_TTL,
  });
  return true;
}
