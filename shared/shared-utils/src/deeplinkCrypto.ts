import { DeepLinkPayload } from "@omenai/shared-types";
import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";

const SECRET_KEY = process.env.DEEP_LINK_SECRET || "";

/**
 * Encrypts the payload into a URL-safe string
 */
export function encryptLinkData(data: DeepLinkPayload): string {
  if (!SECRET_KEY || Buffer.from(SECRET_KEY, "hex").length !== 32) {
    throw new Error("Invalid DEEP_LINK_SECRET. Must be a 32-byte hex string.");
  }

  // Generate a random 12-byte Initialization Vector (standard for GCM)
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(
    ALGORITHM,
    Buffer.from(SECRET_KEY, "hex"),
    iv,
  );

  const jsonString = JSON.stringify(data);

  // base64url is crucial here so we don't get +, /, or = characters that break URLs
  let encrypted = cipher.update(jsonString, "utf8", "base64url");
  encrypted += cipher.final("base64url");

  // The auth tag verifies the data hasn't been maliciously altered
  const authTag = cipher.getAuthTag().toString("base64url");

  // Combine into a single string: iv.encrypted.authTag
  return `${iv.toString("base64url")}.${encrypted}.${authTag}`;
}

/**
 * Decrypts the URL-safe string back into the payload object
 */
export function decryptLinkData(
  encryptedToken: string,
): DeepLinkPayload | null {
  try {
    const [ivBase64, encryptedBase64, authTagBase64] =
      encryptedToken.split(".");

    if (!ivBase64 || !encryptedBase64 || !authTagBase64) return null;

    const iv = Buffer.from(ivBase64, "base64url");
    const authTag = Buffer.from(authTagBase64, "base64url");
    const decipher = crypto.createDecipheriv(
      ALGORITHM,
      Buffer.from(SECRET_KEY, "hex"),
      iv,
    );

    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encryptedBase64, "base64url", "utf8");
    decrypted += decipher.final("utf8");

    return JSON.parse(decrypted) as DeepLinkPayload;
  } catch (error) {
    // Fails silently on tampered or invalid strings to prevent server crashes
    console.error("Failed to decrypt link data:", error);
    return null;
  }
}
