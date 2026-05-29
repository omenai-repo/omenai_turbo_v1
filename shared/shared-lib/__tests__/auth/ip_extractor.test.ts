import { describe, it, expect } from "vitest";
import { getClientIdentifier } from "../../auth/ip_extractor";

const TEST_IP_PRIMARY = "1.2.3.4";
const TEST_IP_SECONDARY = "5.6.7.8";
const TEST_IP_TERTIARY = "9.10.11.12";
const TEST_IP_INTERNAL_A = "10.0.0.1";
const TEST_IP_INTERNAL_B = "10.0.0.2";
const TEST_IP_INTERNAL_C = "10.0.0.5";
const TEST_IP_PRIVATE = "192.168.1.100";
const TEST_IP_STABLE = "203.0.113.42";
const TEST_IP_ALT_A = "1.1.1.1";
const TEST_IP_ALT_B = "8.8.8.8";
const TEST_IP_INVALID = "999.0.0.1";

function makeRequest(headers: Record<string, string> = {}): Request {
  return new Request("https://example.com", { headers });
}

describe("getClientIdentifier", () => {
  describe("when userId is provided", () => {
    it("returns user:userId directly without hashing", async () => {
      const id = await getClientIdentifier(makeRequest(), "user-abc-123");
      expect(id).toBe("user:user-abc-123");
    });

    it("ignores IP headers when userId is provided", async () => {
      const id = await getClientIdentifier(
        makeRequest({ "cf-connecting-ip": TEST_IP_PRIMARY }),
        "user-999"
      );
      expect(id).toBe("user:user-999");
    });
  });

  describe("IP header priority", () => {
    it("prefers cf-connecting-ip over other headers", async () => {
      const req = makeRequest({
        "cf-connecting-ip": TEST_IP_PRIMARY,
        "x-forwarded-for": TEST_IP_SECONDARY,
        "x-real-ip": TEST_IP_TERTIARY,
      });
      const id = await getClientIdentifier(req);
      // All valid IPs go through the same hasher, but the CF one should be used.
      // We verify format and that it's consistent with using cf-connecting-ip.
      const ref = await getClientIdentifier(makeRequest({ "cf-connecting-ip": TEST_IP_PRIMARY }));
      expect(id).toBe(ref);
    });

    it("falls back to true-client-ip when cf-connecting-ip is absent", async () => {
      const req = makeRequest({ "true-client-ip": TEST_IP_PRIMARY });
      const ref = await getClientIdentifier(makeRequest({ "cf-connecting-ip": TEST_IP_PRIMARY }));
      const id = await getClientIdentifier(req);
      // Same IP, different header — hash should be the same
      expect(id).toBe(ref);
    });

    it("falls back to x-forwarded-for when CF headers absent", async () => {
      const req = makeRequest({ "x-forwarded-for": `${TEST_IP_INTERNAL_A}, ${TEST_IP_INTERNAL_B}` });
      const id = await getClientIdentifier(req);
      // x-forwarded-for takes the first IP (TEST_IP_INTERNAL_A)
      const ref = await getClientIdentifier(makeRequest({ "cf-connecting-ip": TEST_IP_INTERNAL_A }));
      expect(id).toBe(ref);
    });

    it("falls back to x-real-ip when all other headers absent", async () => {
      const req = makeRequest({ "x-real-ip": TEST_IP_INTERNAL_C });
      const id = await getClientIdentifier(req);
      const ref = await getClientIdentifier(makeRequest({ "cf-connecting-ip": TEST_IP_INTERNAL_C }));
      expect(id).toBe(ref);
    });
  });

  describe("return format", () => {
    it("returns ip:hash format for requests without userId", async () => {
      const id = await getClientIdentifier(makeRequest({ "cf-connecting-ip": TEST_IP_PRIMARY }));
      expect(id).toMatch(/^ip:[0-9a-f]{32}$/);
    });

    it("returns ip:hash for unknown IP when no headers are present", async () => {
      const id = await getClientIdentifier(makeRequest());
      expect(id).toMatch(/^ip:[0-9a-f]{32}$/);
    });

    it("hash is exactly 32 hex characters", async () => {
      const id = await getClientIdentifier(makeRequest({ "cf-connecting-ip": TEST_IP_PRIVATE }));
      const hash = id.replace("ip:", "");
      expect(hash).toHaveLength(32);
    });
  });

  describe("hash consistency", () => {
    it("same IP always produces the same hash", async () => {
      const id1 = await getClientIdentifier(makeRequest({ "cf-connecting-ip": TEST_IP_STABLE }));
      const id2 = await getClientIdentifier(makeRequest({ "cf-connecting-ip": TEST_IP_STABLE }));
      expect(id1).toBe(id2);
    });

    it("different IPs produce different hashes", async () => {
      const id1 = await getClientIdentifier(makeRequest({ "cf-connecting-ip": TEST_IP_ALT_A }));
      const id2 = await getClientIdentifier(makeRequest({ "cf-connecting-ip": TEST_IP_ALT_B }));
      expect(id1).not.toBe(id2);
    });
  });

  describe("invalid IP validation", () => {
    it("rejects IP with octet > 255 and falls back to unknown", async () => {
      // TEST_IP_INVALID is invalid IPv4 — should fall through to unknown bucket
      const invalid = await getClientIdentifier(makeRequest({ "cf-connecting-ip": TEST_IP_INVALID }));
      const unknown = await getClientIdentifier(makeRequest());
      expect(invalid).toBe(unknown);
    });
  });
});
