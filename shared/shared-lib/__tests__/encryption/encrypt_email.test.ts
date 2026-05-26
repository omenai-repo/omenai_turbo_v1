import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// A 32-byte key encoded as 64 hex characters
const VALID_KEY_HEX = "a".repeat(64);
const VALID_KEYS_JSON = JSON.stringify({ v1: VALID_KEY_HEX });

// encrypt_email reads process.env at module load time, so every test that imports
// the module must do so dynamically after stubbing the env vars.
async function loadModule() {
  vi.resetModules();
  return import("../../encryption/encrypt_email");
}

describe("encrypt_email", () => {
  beforeEach(() => {
    vi.stubEnv("EMAIL_HASH_KEYS", VALID_KEYS_JSON);
    vi.stubEnv("EMAIL_HASH_ACTIVE_KID", "v1");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  describe("hashEmail", () => {
    it("returns a string in kid$hmac format", async () => {
      const { hashEmail } = await loadModule();
      const result = hashEmail("test@example.com");
      expect(result).toMatch(/^v1\$.+$/);
    });

    it("normalizes email — same hash for different case", async () => {
      const { hashEmail } = await loadModule();
      expect(hashEmail("User@Example.COM")).toBe(hashEmail("user@example.com"));
    });

    it("normalizes email — same hash with surrounding whitespace", async () => {
      const { hashEmail } = await loadModule();
      expect(hashEmail("  user@example.com  ")).toBe(hashEmail("user@example.com"));
    });

    it("is deterministic — same email always gives same hash", async () => {
      const { hashEmail } = await loadModule();
      const h1 = hashEmail("alice@example.com");
      const h2 = hashEmail("alice@example.com");
      expect(h1).toBe(h2);
    });

    it("produces different hashes for different emails", async () => {
      const { hashEmail } = await loadModule();
      expect(hashEmail("alice@example.com")).not.toBe(hashEmail("bob@example.com"));
    });
  });

  describe("verifyEmailAgainstHash", () => {
    it("returns true when email matches the stored hash", async () => {
      const { hashEmail, verifyEmailAgainstHash } = await loadModule();
      const stored = hashEmail("user@example.com");
      expect(verifyEmailAgainstHash("user@example.com", stored)).toBe(true);
    });

    it("returns true with case/whitespace normalization", async () => {
      const { hashEmail, verifyEmailAgainstHash } = await loadModule();
      const stored = hashEmail("user@example.com");
      expect(verifyEmailAgainstHash("USER@EXAMPLE.COM", stored)).toBe(true);
      expect(verifyEmailAgainstHash("  user@example.com  ", stored)).toBe(true);
    });

    it("returns false when email does not match the stored hash", async () => {
      const { hashEmail, verifyEmailAgainstHash } = await loadModule();
      const stored = hashEmail("user@example.com");
      expect(verifyEmailAgainstHash("other@example.com", stored)).toBe(false);
    });

    it("returns false for empty stored string", async () => {
      const { verifyEmailAgainstHash } = await loadModule();
      expect(verifyEmailAgainstHash("user@example.com", "")).toBe(false);
    });

    it("returns false for stored hash without $ separator", async () => {
      const { verifyEmailAgainstHash } = await loadModule();
      expect(verifyEmailAgainstHash("user@example.com", "invalidhash")).toBe(false);
    });

    it("returns false for stored hash with unknown kid", async () => {
      const { verifyEmailAgainstHash } = await loadModule();
      expect(verifyEmailAgainstHash("user@example.com", "unknownkid$abc123")).toBe(false);
    });
  });

  describe("parseKidFromStoredHash", () => {
    it("extracts the kid from a valid stored hash", async () => {
      const { hashEmail, parseKidFromStoredHash } = await loadModule();
      const stored = hashEmail("user@example.com");
      expect(parseKidFromStoredHash(stored)).toBe("v1");
    });

    it("returns null for empty string", async () => {
      const { parseKidFromStoredHash } = await loadModule();
      expect(parseKidFromStoredHash("")).toBeNull();
    });

    it("returns null for string without $ separator", async () => {
      const { parseKidFromStoredHash } = await loadModule();
      expect(parseKidFromStoredHash("noDollarSign")).toBeNull();
    });

    it("returns null for string with multiple $ separators", async () => {
      const { parseKidFromStoredHash } = await loadModule();
      expect(parseKidFromStoredHash("a$b$c")).toBeNull();
    });
  });

  describe("generateNewKeyHex", () => {
    it("returns a hex string of the correct length (32 bytes = 64 hex chars)", async () => {
      const { generateNewKeyHex } = await loadModule();
      const key = generateNewKeyHex(32);
      expect(key).toMatch(/^[0-9a-f]+$/i);
      expect(key.length).toBe(64);
    });

    it("generates unique keys on each call", async () => {
      const { generateNewKeyHex } = await loadModule();
      const k1 = generateNewKeyHex();
      const k2 = generateNewKeyHex();
      expect(k1).not.toBe(k2);
    });

    it("accepts custom byte length", async () => {
      const { generateNewKeyHex } = await loadModule();
      const key = generateNewKeyHex(64);
      expect(key.length).toBe(128);
    });
  });
});
