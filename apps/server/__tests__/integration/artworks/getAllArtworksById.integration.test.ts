import { describe, it, expect, afterEach } from "vitest";
import { Artworkuploads } from "@omenai/shared-models/models/artworks/UploadArtworkSchema";
import { POST } from "../../../app/api/artworks/getAllArtworksbyId/route";

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
  return new Request("http://localhost/api/artworks/getAllArtworksbyId", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("POST /api/artworks/getAllArtworksbyId (integration)", () => {
  afterEach(async () => {
    await Artworkuploads.deleteMany({});
  });

  it("returns only artworks belonging to the requested author", async () => {
    await Artworkuploads.create([
      makeArtwork({ author_id: "author-A" }),
      makeArtwork({ author_id: "author-A" }),
      makeArtwork({ author_id: "author-B" }),
    ]);

    const response = await POST(makeRequest({ id: "author-A" }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data).toHaveLength(2);
    expect(body.data.every((a: any) => a.author_id === "author-A")).toBe(true);
  });

  it("returns an empty array with count 0 when the author has no artworks", async () => {
    const response = await POST(makeRequest({ id: "unknown-author" }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data).toEqual([]);
    expect(body.count).toBe(0);
  });

  it("includes a count field equal to the number of returned artworks", async () => {
    await Artworkuploads.create([
      makeArtwork({ author_id: "author-C" }),
      makeArtwork({ author_id: "author-C" }),
    ]);

    const response = await POST(makeRequest({ id: "author-C" }));
    const body = await response.json();

    expect(body.count).toBe(2);
    expect(body.data).toHaveLength(body.count);
  });

  it("returns 400 when id is missing from the request body", async () => {
    const response = await POST(makeRequest({}));

    expect(response.status).toBe(400);
  });

  it("returns 400 when id is an empty string", async () => {
    const response = await POST(makeRequest({ id: "" }));

    expect(response.status).toBe(400);
  });
});
