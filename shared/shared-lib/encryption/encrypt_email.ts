import crypto from "node:crypto";

/**
 * Config:
 * - SIGNING_KEYS: map of kid > hex key (Note: load this from secrets manager as OMENAI scales)
 * - ACTIVE_KID: the current key id used for new hashes
 *
 * Keys must be raw bytes (32+ bytes recommended), encoded as hex in env/secrets.
 */

type KeyMap = Record<string, string>; // kid > hex key

const MIN_KEY_LENGTH_BYTES = 32; // Minimum recommended key length for HMAC-SHA256

function loadKeysFromEnv(): KeyMap {
  const raw = process.env.EMAIL_HASH_KEYS ?? "{}";
  try {
    const parsed = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null) {
      throw new Error("EMAIL_HASH_KEYS must be a valid JSON object");
    }

    // Validate that we have at least one key
    if (Object.keys(parsed).length === 0) {
      throw new Error("EMAIL_HASH_KEYS must contain at least one key");
    }

    // Validate each key
    for (const [kid, keyHex] of Object.entries(parsed)) {
      if (typeof keyHex !== "string") {
        throw new Error(`Key for kid="${kid}" must be a string`);
      }

      // Validate hex format
      if (!/^[0-9a-fA-F]+$/.test(keyHex)) {
        throw new Error(
          `Key for kid="${kid}" must be valid hexadecimal (found invalid characters)`,
        );
      }

      // Validate hex string is even length (each byte = 2 hex chars)
      if (keyHex.length % 2 !== 0) {
        throw new Error(
          `Key for kid="${kid}" has invalid hex length (must be even number of characters)`,
        );
      }

      // Calculate byte length and validate minimum
      const keyLengthBytes = keyHex.length / 2;
      if (keyLengthBytes < MIN_KEY_LENGTH_BYTES) {
        throw new Error(
          `Key for kid="${kid}" is too short: ${keyLengthBytes} bytes (minimum required: ${MIN_KEY_LENGTH_BYTES} bytes)`,
        );
      }
    }

    return parsed as KeyMap;
  } catch (err) {
    throw new Error("Failed to parse EMAIL_HASH_KEYS env var: " + String(err));
  }
}

const KEYS = loadKeysFromEnv();

const ACTIVE_KID = process.env.EMAIL_HASH_ACTIVE_KID ?? Object.keys(KEYS)[0];

if (!ACTIVE_KID) {
  throw new Error(
    "No active kid configured for email hashing (EMAIL_HASH_ACTIVE_KID or EMAIL_HASH_KEYS missing)",
  );
}
if (!KEYS[ACTIVE_KID]) {
  throw new Error(`Active key id ${ACTIVE_KID} not present in EMAIL_HASH_KEYS`);
}

//Normalize email by trimming whitespace and converting to lowercase
function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

// Core process: generate HMAC-SHA256
function hmacSHA256Hex(keyHex: string, data: string): string {
  const key = Buffer.from(keyHex, "hex");
  return crypto.createHmac("sha256", key).update(data).digest("hex");
}

/**
 * hashEmail
 * - deterministic hash protocol > same email always gives same hash👌
 * - returns string with format: "<kid>$<hex-hmac>"
 * - example: "v1$3f9e...a1b"
 */
export function hashEmail(email: string): string {
  const normalized = normalizeEmail(email);
  const kid = ACTIVE_KID;
  const keyHex = KEYS[kid];
  if (!keyHex) throw new Error(`Missing key for kid=${kid}`);

  const mac = hmacSHA256Hex(keyHex, normalized);
  return `${kid}$${mac}`;
}

/**
 * verifyEmailAgainstHash
 * - Accept a raw email and the stored hash (kid$hex).
 * - Returns true if matches, false otherwise.
 * - Uses constant-time comparison.
 */
export function verifyEmailAgainstHash(email: string, stored: string): boolean {
  if (!stored || typeof stored !== "string") return false;

  const parts = stored.split("$");

  if (parts.length !== 2) return false;

  const [kid, expectedHex] = parts;

  const keyHex = KEYS[kid];

  if (!keyHex) return false;

  const normalized = normalizeEmail(email);

  const computedHex = hmacSHA256Hex(keyHex, normalized);

  // constant-time compare
  try {
    const a = Buffer.from(computedHex, "hex");

    const b = Buffer.from(expectedHex, "hex");

    if (a.length !== b.length) return false;

    return crypto.timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

// - Utility fn to create a new secure key (hex encoded). Run this in a script when rotating keys.
export function generateNewKeyHex(lengthBytes = 32): string {
  return crypto.randomBytes(lengthBytes).toString("hex");
}

export function parseKidFromStoredHash(stored: string): string | null {
  if (!stored) return null;
  const parts = stored.split("$");
  if (parts.length !== 2) return null;
  return parts[0];
}

export function createSignature(data: object, key: string): string {
  crypto.createHmac("sha256", key).update(JSON.stringify(data)).digest("hex");
  return `signed_with_key_for_${(data as any).deletion_request_id}`;
}
