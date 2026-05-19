import { describe, it, expect, afterEach } from "vitest";
import { Artworkuploads } from "@omenai/shared-models/models/artworks/UploadArtworkSchema";
import { POST } from "../../../app/api/artworks/getPopularArtworks/route";

// ── Fixtures ─────────────────────────────────────────────────────────────────

// Builds a valid Artworkuploads document with unique title/url per call.
function makeArtwork(overrides: Record<string, any> = {}) {
  const uid = Math.random().toString(36).slice(2, 8);
  return {
    artist: "Test Artist",
    year: 2024,
    title: `Artwork ${uid}`,
    medium: "Oil on canvas",
    rarity: "unique",
    materials: "Canvas",
    dimensions: { height: "100", width: "80" },
    pricing: { price: 1000, usd_price: 1000, currency: "USD", shouldShowPrice: "yes" },
    author_id: "artist-1",
    url: `https://cdn.example.com/${uid}.jpg`,
    artist_birthyear: "1990",
    artist_country_origin: "Nigeria",
    certificate_of_authenticity: "yes",
    signature: "yes",
    packaging_type: "rolled",
    role_access: {},
    impressions: 5,
    availability: true,
    ...overrides,
  };
}

function makeRequest(body: object): Request {
  return new Request("http://localhost/api/artworks/getPopularArtworks", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("POST /api/artworks/getPopularArtworks (integration)", () => {
  afterEach(async () => {
    await Artworkuploads.deleteMany({});
  });

  it("returns only artworks belonging to the requested author", async () => {
    await Artworkuploads.create([
      makeArtwork({ author_id: "artist-1", impressions: 10 }),
      makeArtwork({ author_id: "artist-2", impressions: 10 }),
    ]);

    const response = await POST(makeRequest({ id: "artist-1" }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data).toHaveLength(1);
    expect(body.data[0].author_id).toBe("artist-1");
  });

  it("filters out artworks with zero impressions", async () => {
    await Artworkuploads.create([
      makeArtwork({ impressions: 8 }),
      makeArtwork({ impressions: 0 }),
    ]);

    const response = await POST(makeRequest({ id: "artist-1" }));
    const body = await response.json();

    expect(body.data).toHaveLength(1);
    expect(body.data[0].impressions).toBeGreaterThan(0);
  });

  it("returns artworks sorted by impressions descending", async () => {
    await Artworkuploads.create([
      makeArtwork({ impressions: 5 }),
      makeArtwork({ impressions: 20 }),
      makeArtwork({ impressions: 12 }),
    ]);

    const response = await POST(makeRequest({ id: "artist-1" }));
    const body = await response.json();

    expect(body.data[0].impressions).toBe(20);
    expect(body.data[1].impressions).toBe(12);
    expect(body.data[2].impressions).toBe(5);
  });

  it("caps the result at 3 artworks even when more exist", async () => {
    await Artworkuploads.create([
      makeArtwork({ impressions: 1 }),
      makeArtwork({ impressions: 2 }),
      makeArtwork({ impressions: 3 }),
      makeArtwork({ impressions: 4 }),
    ]);

    const response = await POST(makeRequest({ id: "artist-1" }));
    const body = await response.json();

    expect(body.data).toHaveLength(3);
  });

  it("returns an empty array when the author has no artworks", async () => {
    const response = await POST(makeRequest({ id: "unknown-artist" }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data).toEqual([]);
  });

  it("returns 400 when id is missing from the request body", async () => {
    const response = await POST(makeRequest({}));

    expect(response.status).toBe(400);
  });
});
