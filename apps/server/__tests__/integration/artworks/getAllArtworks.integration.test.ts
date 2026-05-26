import { describe, it, expect, afterEach } from "vitest";
import { Artworkuploads } from "@omenai/shared-models/models/artworks/UploadArtworkSchema";
import { POST } from "../../../app/api/artworks/getAllArtworks/route";

// ── Fixtures ─────────────────────────────────────────────────────────────────

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
    author_id: "author-1",
    url: `https://cdn.example.com/${uid}.jpg`,
    artist_birthyear: "1990",
    artist_country_origin: "Nigeria",
    certificate_of_authenticity: "yes",
    signature: "yes",
    packaging_type: "rolled",
    role_access: { role: "artist" },
    availability: true,
    ...overrides,
  };
}

function makeRequest(body: object): Request {
  return new Request("http://localhost/api/artworks/getAllArtworks", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("POST /api/artworks/getAllArtworks (integration)", () => {
  afterEach(async () => {
    await Artworkuploads.deleteMany({});
  });

  it("returns 200 with artworks for page 1", async () => {
    await Artworkuploads.create([makeArtwork(), makeArtwork(), makeArtwork()]);

    const response = await POST(makeRequest({ page: 1 }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.message).toBe("Successful");
    expect(Array.isArray(body.data)).toBe(true);
    expect(body.data).toHaveLength(3);
  });

  it("returns an empty array when the database is empty", async () => {
    const response = await POST(makeRequest({ page: 1 }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data).toEqual([]);
  });

  it("respects the page limit of 16 artworks per page", async () => {
    const artworks = Array.from({ length: 20 }, () => makeArtwork());
    await Artworkuploads.create(artworks);

    const response = await POST(makeRequest({ page: 1 }));
    const body = await response.json();

    expect(body.data.length).toBeLessThanOrEqual(16);
  });

  it("returns 400 when page is missing from the request body", async () => {
    const response = await POST(makeRequest({}));

    expect(response.status).toBe(400);
  });

  it("returns 400 when page is not a number", async () => {
    const response = await POST(makeRequest({ page: "first" }));

    expect(response.status).toBe(400);
  });

  it("returns an empty array for a page beyond available data", async () => {
    await Artworkuploads.create([makeArtwork()]);

    const response = await POST(makeRequest({ page: 999 }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data).toEqual([]);
  });
});
