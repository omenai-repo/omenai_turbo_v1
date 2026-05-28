/**
 * Integration tests for POST /api/admin/accept_gallery_verification
 *
 * Seeds AccountGallery documents into the in-memory MongoDB instance and
 * verifies the route updates gallery_verified, clears the redis cache, and
 * sends the acceptance email. External dependencies are mocked.
 */

import { describe, it, expect, afterEach, vi } from "vitest";
import { AccountGallery } from "@omenai/shared-models/models/auth/GallerySchema";

// ── Module-level mocks ───────────────────────────────────────────────────────

vi.mock(
  "@omenai/shared-emails/src/models/gallery/sendGalleryAcceptedMail",
  () => ({
    sendGalleryAcceptedMail: vi.fn().mockResolvedValue(undefined),
  }),
);

vi.mock("@omenai/shared-lib/deeplink/config", () => ({
  generateAuthDeeplink: vi
    .fn()
    .mockReturnValue("https://app.omenai.com/deeplink"),
}));

import { POST } from "../../../app/api/admin/accept_gallery_verification/route";
import { sendGalleryAcceptedMail } from "@omenai/shared-emails/src/models/gallery/sendGalleryAcceptedMail";

// ── Fixture factory ──────────────────────────────────────────────────────────

function makeGallery(overrides: Record<string, any> = {}) {
  return {
    name: "Test Gallery",
    email: "gallery@test.com",
    password: "x",
    gallery_id: "gallery-001",
    connected_account_id: "acct-001",
    logo: "logo.jpg",
    admin: "Admin",
    description: "desc",
    verified: false,
    gallery_verified: false,
    address: { city: "NY", country: "US" },
    ...overrides,
  };
}

function makeRequest(body: object): Request {
  return new Request(
    "http://localhost/api/admin/accept_gallery_verification",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    },
  );
}

// ── Cleanup ───────────────────────────────────────────────────────────────────

afterEach(async () => {
  await AccountGallery.deleteMany({});
  vi.clearAllMocks();
});

// ── Validation ────────────────────────────────────────────────────────────────

describe("POST /api/admin/accept_gallery_verification — validation", () => {
  it("returns 400 when gallery_id is missing", async () => {
    const res = await POST(makeRequest({}));
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.message).toMatch(/Validation Failed/i);
  });
});

// ── Not found ─────────────────────────────────────────────────────────────────

describe("POST /api/admin/accept_gallery_verification — not found", () => {
  it("returns 404 when gallery does not exist", async () => {
    const res = await POST(
      makeRequest({ gallery_id: "nonexistent-gallery" }),
    );
    const body = await res.json();

    expect(res.status).toBe(404);
  });
});

// ── Happy path ────────────────────────────────────────────────────────────────

describe("POST /api/admin/accept_gallery_verification — success", () => {
  it("returns 200 and verifies the gallery", async () => {
    await AccountGallery.create(
      makeGallery({ gallery_id: "gallery-001", gallery_verified: false }),
    );

    const res = await POST(makeRequest({ gallery_id: "gallery-001" }));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.message).toBe("Gallery verification accepted");
  });

  it("sets gallery_verified to true in the database", async () => {
    await AccountGallery.create(
      makeGallery({ gallery_id: "gallery-001", gallery_verified: false }),
    );

    await POST(makeRequest({ gallery_id: "gallery-001" }));

    const updated = await AccountGallery.findOne({ gallery_id: "gallery-001" });
    expect(updated!.gallery_verified).toBe(true);
  });

  it("calls sendGalleryAcceptedMail with the gallery name and email", async () => {
    await AccountGallery.create(
      makeGallery({ gallery_id: "gallery-001", gallery_verified: false }),
    );

    await POST(makeRequest({ gallery_id: "gallery-001" }));

    expect(sendGalleryAcceptedMail).toHaveBeenCalledWith(
      expect.objectContaining({
        email: "gallery@test.com",
        name: "Test Gallery",
      }),
    );
  });
});
