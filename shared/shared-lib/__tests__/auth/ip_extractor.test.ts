import { describe, it, expect } from "vitest";
import { getClientIdentifier } from "../../auth/ip_extractor";

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
        makeRequest({ "cf-connecting-ip": "1.2.3.4" }),
        "user-999"
      );
      expect(id).toBe("user:user-999");
    });
  });

  describe("IP header priority", () => {
    it("prefers cf-connecting-ip over other headers", async () => {
      const req = makeRequest({
        "cf-connecting-ip": "1.2.3.4",
        "x-forwarded-for": "5.6.7.8",
        "x-real-ip": "9.10.11.12",
      });
      const id = await getClientIdentifier(req);
      // All valid IPs go through the same hasher, but the CF one should be used.
      // We verify format and that it's consistent with using cf-connecting-ip.
      const ref = await getClientIdentifier(makeRequest({ "cf-connecting-ip": "1.2.3.4" }));
      expect(id).toBe(ref);
    });

    it("falls back to true-client-ip when cf-connecting-ip is absent", async () => {
      const req = makeRequest({ "true-client-ip": "1.2.3.4" });
      const ref = await getClientIdentifier(makeRequest({ "cf-connecting-ip": "1.2.3.4" }));
      const id = await getClientIdentifier(req);
      // Same IP, different header — hash should be the same
      expect(id).toBe(ref);
    });

    it("falls back to x-forwarded-for when CF headers absent", async () => {
      const req = makeRequest({ "x-forwarded-for": "10.0.0.1, 10.0.0.2" });
      const id = await getClientIdentifier(req);
      // x-forwarded-for takes the first IP (10.0.0.1)
      const ref = await getClientIdentifier(makeRequest({ "cf-connecting-ip": "10.0.0.1" }));
      expect(id).toBe(ref);
    });

    it("falls back to x-real-ip when all other headers absent", async () => {
      const req = makeRequest({ "x-real-ip": "10.0.0.5" });
      const id = await getClientIdentifier(req);
      const ref = await getClientIdentifier(makeRequest({ "cf-connecting-ip": "10.0.0.5" }));
      expect(id).toBe(ref);
    });
  });

  describe("return format", () => {
    it("returns ip:hash format for requests without userId", async () => {
      const id = await getClientIdentifier(makeRequest({ "cf-connecting-ip": "1.2.3.4" }));
      expect(id).toMatch(/^ip:[0-9a-f]{32}$/);
    });

    it("returns ip:hash for unknown IP when no headers are present", async () => {
      const id = await getClientIdentifier(makeRequest());
      expect(id).toMatch(/^ip:[0-9a-f]{32}$/);
    });

    it("hash is exactly 32 hex characters", async () => {
      const id = await getClientIdentifier(makeRequest({ "cf-connecting-ip": "192.168.1.100" }));
      const hash = id.replace("ip:", "");
      expect(hash).toHaveLength(32);
    });
  });

  describe("hash consistency", () => {
    it("same IP always produces the same hash", async () => {
      const ip = "203.0.113.42";
      const id1 = await getClientIdentifier(makeRequest({ "cf-connecting-ip": ip }));
      const id2 = await getClientIdentifier(makeRequest({ "cf-connecting-ip": ip }));
      expect(id1).toBe(id2);
    });

    it("different IPs produce different hashes", async () => {
      const id1 = await getClientIdentifier(makeRequest({ "cf-connecting-ip": "1.1.1.1" }));
      const id2 = await getClientIdentifier(makeRequest({ "cf-connecting-ip": "8.8.8.8" }));
      expect(id1).not.toBe(id2);
    });
  });

  describe("invalid IP validation", () => {
    it("rejects IP with octet > 255 and falls back to unknown", async () => {
      // 999.0.0.1 is invalid IPv4 — should fall through to unknown bucket
      const invalid = await getClientIdentifier(makeRequest({ "cf-connecting-ip": "999.0.0.1" }));
      const unknown = await getClientIdentifier(makeRequest());
      expect(invalid).toBe(unknown);
    });
  });
});
