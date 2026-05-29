/**
 * Integration tests for POST /api/deeplink/verify
 *
 * Mocks the decryptLinkData utility to test all token-verification branches
 * without requiring real cryptographic infrastructure.
 */

import { describe, it, expect, beforeEach, vi } from "vitest";

// ── Module-level mocks ───────────────────────────────────────────────────────

const { mockDecryptLinkData } = vi.hoisted(() => ({
  mockDecryptLinkData: vi.fn(),
}));

vi.mock("@omenai/shared-utils/src/deeplinkCrypto", () => ({
  decryptLinkData: mockDecryptLinkData,
}));

import { POST } from "../../../app/api/deeplink/verify/route";

// ── Fixture helpers ───────────────────────────────────────────────────────────

function makeRequest(body: object): Request {
  return new Request("http://localhost/api/deeplink/verify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

// ── Cleanup ───────────────────────────────────────────────────────────────────

beforeEach(() => {
  vi.clearAllMocks();
});

// ── Missing token ─────────────────────────────────────────────────────────────

describe("POST /api/deeplink/verify — missing token", () => {
  it("returns 400 when token is missing", async () => {
    const res = await POST(makeRequest({}));
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.success).toBe(false);
    expect(body.error).toBe("INVALID_TOKEN");
  });
});

// ── Invalid token ─────────────────────────────────────────────────────────────

describe("POST /api/deeplink/verify — invalid token", () => {
  it("returns 403 when decryptLinkData returns null", async () => {
    mockDecryptLinkData.mockReturnValue(null);

    const res = await POST(makeRequest({ token: "invalid-token" }));
    const body = await res.json();

    expect(res.status).toBe(403);
    expect(body.success).toBe(false);
    expect(body.error).toBe("INVALID_TOKEN");
  });
});

// ── Valid token ───────────────────────────────────────────────────────────────

describe("POST /api/deeplink/verify — valid token", () => {
  it("returns 200 with decrypted data when token is valid", async () => {
    const decryptedPayload = { userId: "user-123", type: "artist", action: "login" };
    mockDecryptLinkData.mockReturnValue(decryptedPayload);

    const res = await POST(makeRequest({ token: "valid-token" }));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data.userId).toBe("user-123");
  });

  it("calls decryptLinkData with the provided token", async () => {
    mockDecryptLinkData.mockReturnValue({ userId: "user-456" });

    await POST(makeRequest({ token: "my-token" }));

    expect(mockDecryptLinkData).toHaveBeenCalledWith("my-token");
  });
});
