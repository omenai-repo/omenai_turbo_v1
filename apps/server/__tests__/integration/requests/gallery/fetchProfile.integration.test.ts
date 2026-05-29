/**
 * Integration tests for GET /api/requests/gallery/fetchProfile
 *
 * Seeds AccountGallery documents and verifies the route returns the gallery
 * profile fields from the real in-memory MongoDB instance.
 */

import { describe, it, expect, afterEach } from "vitest";
import { AccountGallery } from "@omenai/shared-models/models/auth/GallerySchema";

import { GET } from "../../../../app/api/requests/gallery/fetchProfile/route";

// ── Fixture factories ─────────────────────────────────────────────────────────

let uid = 0;

function makeGallery(overrides: Record<string, any> = {}) {
  const id = ++uid;
  return {
    name: `Gallery ${id}`,
    address: { city: "NY", country: "US" },
    description: "A test gallery",
    admin: "Admin Name",
    email: `gallery-${id}@test.com`,
    password: "hashed",
    verified: false,
    gallery_verified: false,
    logo: "logo.jpg",
    gallery_id: `gallery-${id}`,
    ...overrides,
  };
}

function makeRequest(galleryId?: string): Request {
  const url = new URL("http://localhost/api/requests/gallery/fetchProfile");
  if (galleryId) url.searchParams.set("id", galleryId);
  return new Request(url.toString(), { method: "GET" });
}

// ── Cleanup ───────────────────────────────────────────────────────────────────

afterEach(async () => {
  await AccountGallery.deleteMany({});
});

// ── Validation ────────────────────────────────────────────────────────────────

describe("GET /api/requests/gallery/fetchProfile — validation", () => {
  it("returns 400 when id query param is missing", async () => {
    const res = await GET(makeRequest() as any);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.message).toMatch(/Invalid URL parameters/i);
  });
});

// ── Not found ─────────────────────────────────────────────────────────────────

describe("GET /api/requests/gallery/fetchProfile — not found", () => {
  it("returns 404 when gallery does not exist", async () => {
    const res = await GET(makeRequest("gallery-nonexistent") as any);
    const body = await res.json();

    expect(res.status).toBe(404);
    expect(body.message).toMatch(/Gallery data not found/i);
  });
});

// ── Success ───────────────────────────────────────────────────────────────────

describe("GET /api/requests/gallery/fetchProfile — success", () => {
  it("returns 200 with the gallery profile when found", async () => {
    await AccountGallery.create(makeGallery({ gallery_id: "gallery-profile-001", name: "Test Gallery" }));

    const res = await GET(makeRequest("gallery-profile-001") as any);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.message).toBe("Profile retrieved successfully");
    expect(body.gallery).toBeDefined();
  });

  it("returns the correct name in the gallery profile", async () => {
    await AccountGallery.create(makeGallery({ gallery_id: "gallery-profile-002", name: "Unique Gallery Name" }));

    const res = await GET(makeRequest("gallery-profile-002") as any);
    const body = await res.json();

    expect(body.gallery.name).toBe("Unique Gallery Name");
  });

  it("returns name, logo, email, address, description and admin fields", async () => {
    await AccountGallery.create(
      makeGallery({
        gallery_id: "gallery-profile-003",
        name: "Full Profile Gallery",
        description: "Full description",
        admin: "The Admin",
      }),
    );

    const res = await GET(makeRequest("gallery-profile-003") as any);
    const body = await res.json();

    expect(body.gallery).toHaveProperty("name");
    expect(body.gallery).toHaveProperty("logo");
    expect(body.gallery).toHaveProperty("email");
    expect(body.gallery).toHaveProperty("address");
    expect(body.gallery).toHaveProperty("description");
    expect(body.gallery).toHaveProperty("admin");
  });

  it("does not return another gallery when a different id is queried", async () => {
    await AccountGallery.create([
      makeGallery({ gallery_id: "gallery-profile-004", name: "Gallery A" }),
      makeGallery({ gallery_id: "gallery-profile-005", name: "Gallery B" }),
    ]);

    const res = await GET(makeRequest("gallery-profile-004") as any);
    const body = await res.json();

    expect(body.gallery.name).toBe("Gallery A");
  });
});
