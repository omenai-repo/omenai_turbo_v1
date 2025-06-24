import { getIronSession } from "iron-session";
import redis from "./redis";
import { sessionOptions } from "./configs/session-config";
import { randomBytes } from "crypto";
import { SessionDataType } from "@omenai/shared-types";

const SESSION_TTL = 60 * 60; // 1 hour in seconds

interface SessionData {
  userId: string;
  userData: SessionDataType;
  userAgent?: string | null;
}

export async function createSession(data: SessionData) {
  const sessionId = randomBytes(32).toString("hex");
  const csrfToken = randomBytes(32).toString("hex");
  const sessionData = { ...data, csrfToken };

  await redis.set(`session:${sessionId}`, JSON.stringify(sessionData), {
    ex: SESSION_TTL,
  });
  return sessionId;
}

// Function to get and refresh session data from Redis
export async function getSession(
  sessionId: string,
  userAgent: string | null,
  is_middleware_agent: boolean
) {
  const sessionDataJSON = await redis.get(`session:${sessionId}`);
  const sessionData: SessionData & { csrfToken: string } =
    typeof sessionDataJSON === "string"
      ? JSON.parse(sessionDataJSON)
      : sessionDataJSON;

  // **Security:** Basic check to prevent session hijacking
  // if (!is_middleware_agent) {
  //   if (!userAgent || sessionData.userAgent !== userAgent) {
  //     await destroySession(sessionId); // Destroy suspicious session
  //     return null;
  //   }
  // }

  // Sliding session: reset the TTL on access
  await redis.expire(`session:${sessionId}`, SESSION_TTL);
  return sessionData;
}

// Function to destroy a session
export async function destroySession(sessionId: string) {
  await redis.del(`session:${sessionId}`);
}

// Function to create a new session

// Wrapper to manage the session cookie
export async function getSessionFromCookie(cookieStore: any) {
  const session = await getIronSession<{ sessionId: string }>(
    cookieStore,
    sessionOptions
  );
  return session;
}
