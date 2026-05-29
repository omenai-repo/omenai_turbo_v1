/**
 * Integration tests for POST /api/search
 *
 * Seeds Artworkuploads documents and verifies the route returns artworks
 * matching the searchTerm against title and artist fields. Redis is mocked
 * to return null (cold cache) in setup.ts so results fall back to MongoDB.
 */

import { describe, it, expect, afterEach } from "vitest";
import { Artworkuploads } from "@omenai/shared-models/models/artworks/UploadArtworkSchema";

import { POST } from "../../../app/api/search/route";

// ── Fixture factories ─────────────────────────────────────────────────────────

function makeArtwork(overrides: Record<string, any> = {}) {
  const uid = Math.random().toString(36).slice(2, 10);
  return {
    art_id: `art-${uid}`,
    title: `Sunset Horizon ${uid}`,
    artist: "Jane Doe",
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

function makeRequest(body: object): Request {
  return new Request("http://localhost/api/search", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

// ── Cleanup ───────────────────────────────────────────────────────────────────

afterEach(async () => {
  await Artworkuploads.deleteMany({});
});

// ── Validation ────────────────────────────────────────────────────────────────

describe("POST /api/search — validation", () => {
  it("returns 400 when searchTerm is missing from the request body", async () => {
    const res = await POST(makeRequest({}));
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.message).toMatch(/Validation Failed/i);
  });
});

// ── Success ───────────────────────────────────────────────────────────────────

describe("POST /api/search — success", () => {
  it("returns 200 with matching artworks when searching by title", async () => {
    await Artworkuploads.create([
      makeArtwork({ art_id: "art-001", title: "Sunset Horizon", artist: "Jane Doe" }),
      makeArtwork({ art_id: "art-002", title: "Ocean Breeze", artist: "John Smith" }),
    ]);

    const res = await POST(makeRequest({ searchTerm: "Sunset" }));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.message).toBe("Successful");
    expect(body.data.filter(Boolean)).toHaveLength(1);
  });

  it("returns matching artworks when searching by artist name", async () => {
    await Artworkuploads.create([
      makeArtwork({ art_id: "art-001", title: "Sunset Horizon", artist: "Jane Doe" }),
      makeArtwork({ art_id: "art-002", title: "Ocean Breeze", artist: "John Smith" }),
    ]);

    const res = await POST(makeRequest({ searchTerm: "Jane" }));
    const body = await res.json();

    expect(res.status).toBe(200);
    const results = body.data.filter(Boolean);
    expect(results).toHaveLength(1);
    expect(results[0].artist).toBe("Jane Doe");
  });

  it("returns empty data array when no artworks match the search term", async () => {
    await Artworkuploads.create([
      makeArtwork({ art_id: "art-001", title: "Sunset Horizon", artist: "Jane Doe" }),
    ]);

    const res = await POST(makeRequest({ searchTerm: "xyznonexistent999" }));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.data.filter(Boolean)).toHaveLength(0);
  });

  it("performs case-insensitive matching on title", async () => {
    await Artworkuploads.create([
      makeArtwork({ art_id: "art-001", title: "Sunset Horizon", artist: "Jane Doe" }),
    ]);

    const res = await POST(makeRequest({ searchTerm: "sunset" }));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.data.filter(Boolean)).toHaveLength(1);
  });

  it("returns empty data when DB is empty", async () => {
    const res = await POST(makeRequest({ searchTerm: "anything" }));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.data).toHaveLength(0);
  });
});
