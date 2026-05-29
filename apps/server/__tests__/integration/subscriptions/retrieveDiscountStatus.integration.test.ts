/**
 * Integration tests for POST /api/subscriptions/retrieveDiscountStatus
 *
 * Seeds AccountGallery documents and verifies the route correctly reads the
 * discount status from the real in-memory MongoDB instance.
 */

import { describe, it, expect, afterEach, beforeEach } from "vitest";
import { AccountGallery } from "@omenai/shared-models/models/auth/GallerySchema";

import { POST } from "../../../app/api/subscriptions/retrieveDiscountStatus/route";

// ── Fixture factory ──────────────────────────────────────────────────────────

function makeGallery(overrides: Record<string, any> = {}) {
  const id = crypto.randomUUID();
  return {
    name: `Gallery ${id}`,
    address: { street: "1 Art Lane", city: "Lagos", country: "Nigeria" },
    description: "A contemporary art gallery",
    admin: "Admin User",
    email: `gallery-${id}@test.com`,
    password: "securePass123",
    logo: "https://cdn.test.com/logo.png",
    verified: true,
    gallery_verified: true,
    subscription_status: {
      type: null,
      active: false,
      discount: { active: true, plan: "gallery", isDiscountSub: false },
    },
    ...overrides,
  };
}

function makeRequest(body: object): Request {
  return new Request("http://localhost/api/subscriptions/retrieveDiscountStatus", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

// ── Cleanup ───────────────────────────────────────────────────────────────────

afterEach(async () => {
  await AccountGallery.deleteMany({});
});

// ── Discount active ───────────────────────────────────────────────────────────

describe("POST /api/subscriptions/retrieveDiscountStatus — discount active", () => {
  let galleryEmail: string;

  beforeEach(async () => {
    const gallery = await AccountGallery.create(
      makeGallery({
        subscription_status: {
          type: null,
          active: false,
          discount: { active: true, plan: "gallery", isDiscountSub: false },
        },
      }),
    );
    galleryEmail = gallery.email;
  });

  it("returns 200 with discount=true when discount is active", async () => {
    const res = await POST(makeRequest({ email: galleryEmail }));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.message).toBe("Discount Data retrieved");
    expect(body.discount).toBe(true);
  });

  it("queries the gallery by email", async () => {
    const res = await POST(makeRequest({ email: galleryEmail }));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.discount).toBe(true);
  });
});

// ── Discount inactive ─────────────────────────────────────────────────────────

describe("POST /api/subscriptions/retrieveDiscountStatus — discount inactive", () => {
  let galleryEmail: string;

  beforeEach(async () => {
    const gallery = await AccountGallery.create(
      makeGallery({
        subscription_status: {
          type: "Foundation",
          active: true,
          discount: { active: false, plan: "gallery", isDiscountSub: false },
        },
      }),
    );
    galleryEmail = gallery.email;
  });

  it("returns 200 with discount=false when discount is not active", async () => {
    const res = await POST(makeRequest({ email: galleryEmail }));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.discount).toBe(false);
  });
});

// ── Not found ─────────────────────────────────────────────────────────────────

describe("POST /api/subscriptions/retrieveDiscountStatus — not found", () => {
  it("returns 400 when no gallery account exists for the given email", async () => {
    const res = await POST(makeRequest({ email: "nobody@test.com" }));
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.message).toMatch(/No gallery account found/i);
  });
});

// ── Validation ────────────────────────────────────────────────────────────────

describe("POST /api/subscriptions/retrieveDiscountStatus — validation", () => {
  it("returns 400 when email is missing", async () => {
    const res = await POST(makeRequest({}));
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.message).toMatch(/Validation Failed/i);
  });

  it("returns 400 when email format is invalid", async () => {
    const res = await POST(makeRequest({ email: "not-a-valid-email" }));

    expect(res.status).toBe(400);
  });
});
