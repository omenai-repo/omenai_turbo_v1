import { describe, it, expect, afterEach } from "vitest";
import { Artworkuploads } from "@omenai/shared-models/models/artworks/UploadArtworkSchema";
import { POST } from "../../../app/api/artworks/getSingleArtworkImpression/route";

// ── Fixtures ─────────────────────────────────────────────────────────────────

function makeArtwork(overrides: Record<string, any> = {}) {
  const uid = crypto.randomUUID();
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
    impressions: 7,
    like_IDs: ["user-1", "user-2"],
    availability: true,
    ...overrides,
  };
}

function makeRequest(body: object): Request {
  return new Request("http://localhost/api/artworks/getSingleArtworkImpression", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("POST /api/artworks/getSingleArtworkImpression (integration)", () => {
  afterEach(async () => {
    await Artworkuploads.deleteMany({});
  });

  it("returns the like_IDs for an existing artwork", async () => {
    const created = await Artworkuploads.create(
      makeArtwork({ like_IDs: ["user-1", "user-2", "user-3"] }),
    );

    const response = await POST(makeRequest({ id: created.art_id }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data.like_IDs).toEqual(["user-1", "user-2", "user-3"]);
  });

  it("returns 500 when artwork does not exist", async () => {
    const response = await POST(makeRequest({ id: "non-existent-art-id" }));

    expect(response.status).toBe(500);
  });

  it("returns 400 when id is missing from the request body", async () => {
    const response = await POST(makeRequest({}));

    expect(response.status).toBe(400);
  });

  it("returns 400 when id is an empty string", async () => {
    const response = await POST(makeRequest({ id: "" }));

    expect(response.status).toBe(400);
  });

  it("returns an empty like_IDs array for an artwork with no likes", async () => {
    const created = await Artworkuploads.create(makeArtwork({ like_IDs: [] }));

    const response = await POST(makeRequest({ id: created.art_id }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data.like_IDs).toEqual([]);
  });
});
