import "server-only";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { UserType } from "@omenai/shared-types/index.js";
const secret_key = "secret";
const key = new TextEncoder().encode(secret_key);

const cookie = {
  name: "session",
  options: {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    domain: "omenai.local",
  },
};

export async function encrypt(payload: UserType) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("1hr")
    .sign(key);
}

export async function decrypt(jwt_token_string: string): Promise<any> {
  const { payload } = await jwtVerify(jwt_token_string, key);

  return payload;
}

export async function createSession(payload: UserType) {
  const expires = new Date(Date.now() + 3600 * 1000);
  const session = await encrypt({ ...payload, expires });

  (await cookies()).set(cookie.name, session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    domain: "omenai.local",
    expires,
  });
}

export async function verifySession() {
  const cookie_packet = (await cookies()).get(cookie.name)?.value;

  if (!cookie_packet || cookie_packet === undefined) return undefined;

  const session = await decrypt(cookie_packet);

  if (!session?.userId) {
    redirect("/login");
  }

  return { userId: session.userId };
}

export async function deleteSession() {
  (await cookies()).delete(cookie.name);
  // redirect("/login");
}

export async function getSession() {
  const cookie_packet = (await cookies()).get(cookie.name)?.value;

  if (!cookie_packet || cookie_packet === undefined) return undefined;

  const session = await decrypt(cookie_packet);

  return { ...session };
}

export async function refreshSession(payload: UserType) {
  await createSession(payload);
}
