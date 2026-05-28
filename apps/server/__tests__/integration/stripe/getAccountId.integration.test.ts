/**
 * Integration tests for POST /api/stripe/getAccountId
 *
 * Verifies that the route fetches the connected_account_id and gallery_verified
 * fields from the in-memory MongoDB AccountGallery collection, respecting the
 * cold-cache Redis path (setup.ts mocks redis.get → null).
 */

import { describe, it, expect, afterEach, vi } from "vitest";
import { AccountGallery } from "@omenai/shared-models/models/auth/GallerySchema";

import { POST } from "../../../app/api/stripe/getAccountId/route";

// ── Fixture factory ───────────────────────────────────────────────────────────

function makeGallery(overrides: Record<string, any> = {}) {
  const uid = Math.random().toString(36).slice(2, 10);
  return {
    name: `Gallery ${uid}`,
    address: { city: "NY", country: "US" },
    description: "A test gallery",
    admin: "Admin Name",
    email: `gallery-${uid}@test.com`,
    password: "hashed",
    verified: false,
    gallery_verified: false,
    logo: "logo.jpg",
    gallery_id: `gallery-${uid}`,
    connected_account_id: `acct-${uid}`,
    ...overrides,
  };
}

function makeRequest(body: object): Request {
  return new Request("http://localhost/api/stripe/getAccountId", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

// ── Teardown ──────────────────────────────────────────────────────────────────

afterEach(async () => {
  vi.clearAllMocks();
  await AccountGallery.deleteMany({});
});

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("POST /api/stripe/getAccountId (integration)", () => {
  it("returns 400 when gallery_id is missing", async () => {
    const res = await POST(makeRequest({}));
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.message).toMatch(/Validation Failed/i);
  });

  it("returns 404 when no gallery with the given gallery_id exists", async () => {
    const res = await POST(makeRequest({ gallery_id: "gallery-nonexistent" }));
    const body = await res.json();

    expect(res.status).toBe(404);
    expect(body.message).toMatch(/not found/i);
  });

  it("returns 200 with account info when gallery exists", async () => {
    const gallery = makeGallery({
      gallery_id: "gallery-known-001",
      connected_account_id: "acct_connected_001",
      gallery_verified: true,
    });
    await AccountGallery.create(gallery);

    const res = await POST(makeRequest({ gallery_id: "gallery-known-001" }));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.message).toBe("Successfully fetched account info");
    expect(body.data.connected_account_id).toBe("acct_connected_001");
    expect(body.data.gallery_verified).toBe(true);
  });

  it("returns only connected_account_id and gallery_verified fields", async () => {
    const gallery = makeGallery({
      gallery_id: "gallery-known-002",
      connected_account_id: "acct_connected_002",
    });
    await AccountGallery.create(gallery);

    const res = await POST(makeRequest({ gallery_id: "gallery-known-002" }));
    const body = await res.json();

    expect(res.status).toBe(200);
    // The route selects only these two fields
    expect(body.data).toHaveProperty("connected_account_id");
    expect(body.data).toHaveProperty("gallery_verified");
    // Sensitive fields should not be returned
    expect(body.data.password).toBeUndefined();
    expect(body.data.email).toBeUndefined();
  });
});
