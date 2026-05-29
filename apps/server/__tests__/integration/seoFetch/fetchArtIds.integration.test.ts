/**
 * Integration tests for GET /api/seoFetch/fetchArtIds
 *
 * Seeds Artworkuploads documents and verifies the route returns all artwork
 * ids from the real in-memory MongoDB instance.
 */

import { describe, it, expect, afterEach } from "vitest";
import { Artworkuploads } from "@omenai/shared-models/models/artworks/UploadArtworkSchema";

import { GET } from "../../../app/api/seoFetch/fetchArtIds/route";

// ── Fixture factories ─────────────────────────────────────────────────────────

function makeArtwork(overrides: Record<string, any> = {}) {
  const uid = crypto.randomUUID();
  return {
    art_id: `art-${uid}`,
    title: `Test Artwork ${uid}`,
    artist: "Test Artist",
    author_id: "artist-001",
    role_access: { role: "gallery" },
    like_IDs: [],
    url: `https://example.com/art-${uid}.jpg`,
    year: 2020,
    medium: "Oil on canvas",
    rarity: "unique",
    materials: "Canvas",
    dimensions: { height: "50", width: "40" },
    pricing: { price: 1000, usd_price: 1000, currency: "USD", shouldShowPrice: "yes" },
    artist_birthyear: "1990",
    artist_country_origin: "US",
    certificate_of_authenticity: "yes",
    signature: "yes",
    packaging_type: "rolled",
    ...overrides,
  };
}

function makeRequest(): Request {
  return new Request("http://localhost/api/seoFetch/fetchArtIds", {
    method: "GET",
  });
}

// ── Cleanup ───────────────────────────────────────────────────────────────────

afterEach(async () => {
  await Artworkuploads.deleteMany({});
});

// ── Empty DB ──────────────────────────────────────────────────────────────────

describe("GET /api/seoFetch/fetchArtIds — empty database", () => {
  it("returns 200 with an empty data array when no artworks exist", async () => {
    const res = await GET();
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.message).toBe("Successful");
    expect(body.data).toEqual([]);
  });
});

// ── Success ───────────────────────────────────────────────────────────────────

describe("GET /api/seoFetch/fetchArtIds — success", () => {
  it("returns all artwork art_ids from the database", async () => {
    await Artworkuploads.create([
      makeArtwork({ art_id: "art-001" }),
      makeArtwork({ art_id: "art-002" }),
      makeArtwork({ art_id: "art-003" }),
    ]);

    const res = await GET();
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.data).toHaveLength(3);
  });

  it("response data includes art_id field for each artwork", async () => {
    await Artworkuploads.create([
      makeArtwork({ art_id: "art-unique-001" }),
      makeArtwork({ art_id: "art-unique-002" }),
    ]);

    const res = await GET();
    const body = await res.json();

    const ids = body.data.map((a: any) => a.art_id);
    expect(ids).toContain("art-unique-001");
    expect(ids).toContain("art-unique-002");
  });

  it("returns correct count of artwork ids matching the DB", async () => {
    await Artworkuploads.create([
      makeArtwork({ art_id: "art-a" }),
      makeArtwork({ art_id: "art-b" }),
    ]);

    const res = await GET();
    const body = await res.json();

    expect(body.data).toHaveLength(2);
  });
});
