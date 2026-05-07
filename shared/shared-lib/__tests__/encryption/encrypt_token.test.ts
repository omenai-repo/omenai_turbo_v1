import { describe, it, expect } from "vitest";
import { hashPayloadHMAC, hashPayloadToken } from "../../encryption/encrypt_token";

const TEST_SECRET = "test-secret-key-for-unit-tests";

describe("hashPayloadHMAC", () => {
  it("returns a non-empty string", () => {
    const result = hashPayloadHMAC({ id: 1 }, TEST_SECRET);
    expect(typeof result).toBe("string");
    expect(result.length).toBeGreaterThan(0);
  });

  it("is deterministic — same input produces same output", () => {
    const payload = { user: "alice", action: "login" };
    const hash1 = hashPayloadHMAC(payload, TEST_SECRET);
    const hash2 = hashPayloadHMAC(payload, TEST_SECRET);
    expect(hash1).toBe(hash2);
  });

  it("produces different hashes for different payloads", () => {
    const h1 = hashPayloadHMAC({ id: 1 }, TEST_SECRET);
    const h2 = hashPayloadHMAC({ id: 2 }, TEST_SECRET);
    expect(h1).not.toBe(h2);
  });

  it("produces different hashes for different secrets", () => {
    const payload = { id: 1 };
    const h1 = hashPayloadHMAC(payload, "secret-a");
    const h2 = hashPayloadHMAC(payload, "secret-b");
    expect(h1).not.toBe(h2);
  });

  it("output contains no URL-unsafe characters (/, +, =)", () => {
    for (let i = 0; i < 20; i++) {
      const result = hashPayloadHMAC({ seed: i }, TEST_SECRET);
      expect(result).not.toMatch(/[/+=]/);
    }
  });

  it("handles null payload", () => {
    const result = hashPayloadHMAC(null, TEST_SECRET);
    expect(typeof result).toBe("string");
  });

  it("handles array payload", () => {
    const result = hashPayloadHMAC([1, 2, 3], TEST_SECRET);
    expect(typeof result).toBe("string");
  });

  it("handles nested object payload", () => {
    const result = hashPayloadHMAC({ a: { b: { c: 1 } } }, TEST_SECRET);
    expect(typeof result).toBe("string");
  });
});

describe("hashPayloadToken", () => {
  it("works when secret is passed explicitly", () => {
    const result = hashPayloadToken({ id: 1 }, TEST_SECRET);
    expect(typeof result).toBe("string");
    expect(result.length).toBeGreaterThan(0);
  });

  it("returns the same result as hashPayloadHMAC when given the same secret", () => {
    const payload = { id: 42 };
    const direct = hashPayloadHMAC(payload, TEST_SECRET);
    const token = hashPayloadToken(payload, TEST_SECRET);
    expect(token).toBe(direct);
  });

  it("throws when no secret is provided and SECRET_SALT is not set", () => {
    const original = process.env.SECRET_SALT;
    delete process.env.SECRET_SALT;
    expect(() => hashPayloadToken({ id: 1 })).toThrow("Cannot perform operation");
    process.env.SECRET_SALT = original;
  });
});
