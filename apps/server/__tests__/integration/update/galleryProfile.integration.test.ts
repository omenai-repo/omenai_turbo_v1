/**
 * Integration tests for POST /api/update/gallery/profile
 *
 * Unlike the artist route (updateOne), this route uses `findOneAndUpdate`,
 * which returns null when no document is matched — causing a ServerError (500).
 */

import { describe, it, expect, afterEach } from "vitest";
import { AccountGallery } from "@omenai/shared-models/models/auth/GallerySchema";
import { POST } from "../../../app/api/update/gallery/profile/route";

// ── Helpers ──────────────────────────────────────────────────────────────────

function makeRequest(body: object) {
  return new Request("http://localhost/api/update/gallery/profile", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

function makeGallery(overrides: Record<string, any> = {}) {
  const uid = Math.random().toString(36).slice(2, 10);
  return {
    name: `Gallery ${uid}`,
    email: `gallery-${uid}@test.com`,
    password: "hashedpassword123",
    admin: `Admin ${uid}`,
    description: "A test gallery for integration testing",
    logo: "https://cdn.example.com/gallery-logo.jpg",
    address: {
      address_line: "1 Art Lane",
      city: "Accra",
      country: "Ghana",
      countryCode: "GH",
      state: "Greater Accra",
      stateCode: "GA",
      zip: "00233",
    },
    gallery_id: `gallery-${uid}`,
    ...overrides,
  };
}

// ── Cleanup ──────────────────────────────────────────────────────────────────

afterEach(async () => {
  await AccountGallery.deleteMany({});
});

// ── Gallery not found (500) ──────────────────────────────────────────────────

describe("POST /api/update/gallery/profile — gallery not found", () => {
  it("returns 500 when no gallery matches the given id", async () => {
    // findOneAndUpdate returns null when no doc found → ServerError
    const res = await POST(makeRequest({ id: "non-existent-gallery", name: "Ghost Gallery" }));
    const body = await res.json();

    expect(res.status).toBe(500);
    expect(body.message).toMatch(/unexpected error/i);
  });
});

// ── Successful update ────────────────────────────────────────────────────────

describe("POST /api/update/gallery/profile — successful update", () => {
  it("returns 200 and updates the gallery name", async () => {
    const gallery = await AccountGallery.create(makeGallery({ name: "Original Gallery Name" }));

    const res = await POST(makeRequest({ id: gallery.gallery_id, name: "Renamed Gallery" }));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.message).toBe("Profile data updated");

    const updated = await AccountGallery.findOne({ gallery_id: gallery.gallery_id });
    expect(updated!.name).toBe("Renamed Gallery");
  });

  it("returns the pre-update document in the response data field", async () => {
    const gallery = await AccountGallery.create(makeGallery({ name: "Before Update" }));

    const res = await POST(makeRequest({ id: gallery.gallery_id, name: "After Update" }));
    const body = await res.json();

    // findOneAndUpdate without { new: true } returns the original doc
    expect(body.data).toBeDefined();
  });

  it("updates the description field correctly", async () => {
    const gallery = await AccountGallery.create(makeGallery({ description: "Old description" }));

    await POST(makeRequest({ id: gallery.gallery_id, description: "New vibrant gallery space in downtown Accra" }));

    const updated = await AccountGallery.findOne({ gallery_id: gallery.gallery_id });
    expect(updated!.description).toBe("New vibrant gallery space in downtown Accra");
  });

  it("updates the phone field without changing other fields", async () => {
    const gallery = await AccountGallery.create(makeGallery({ phone: "0200000000" }));
    const originalName = gallery.name;

    await POST(makeRequest({ id: gallery.gallery_id, phone: "+233207654321" }));

    const updated = await AccountGallery.findOne({ gallery_id: gallery.gallery_id });
    expect(updated!.phone).toBe("+233207654321");
    expect(updated!.name).toBe(originalName); // name must be unchanged
  });

  it("can update multiple fields in one request", async () => {
    const gallery = await AccountGallery.create(makeGallery());

    await POST(makeRequest({
      id: gallery.gallery_id,
      phone: "+23330000001",
      description: "Updated multi-field description",
    }));

    const updated = await AccountGallery.findOne({ gallery_id: gallery.gallery_id });
    expect(updated!.phone).toBe("+23330000001");
    expect(updated!.description).toBe("Updated multi-field description");
  });

  it("does not affect other gallery documents", async () => {
    const galleryA = await AccountGallery.create(makeGallery({ name: "Gallery Alpha" }));
    const galleryB = await AccountGallery.create(makeGallery({ name: "Gallery Beta" }));

    await POST(makeRequest({ id: galleryA.gallery_id, name: "Gallery Alpha — Updated" }));

    const b = await AccountGallery.findOne({ gallery_id: galleryB.gallery_id });
    expect(b!.name).toBe("Gallery Beta");
  });
});
