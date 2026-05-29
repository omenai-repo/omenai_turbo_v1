import { describe, it, expect, afterEach } from "vitest";
import { Artworkuploads } from "@omenai/shared-models/models/artworks/UploadArtworkSchema";
import { POST } from "../../../app/api/artworks/getUserCuratedArtworks/route";

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
    availability: true,
    ...overrides,
  };
}

function makeRequest(body: object): Request {
  return new Request("http://localhost/api/artworks/getUserCuratedArtworks", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("POST /api/artworks/getUserCuratedArtworks (integration)", () => {
  afterEach(async () => {
    await Artworkuploads.deleteMany({});
  });

  it("returns artworks matching the user's medium preferences", async () => {
    await Artworkuploads.create([
      makeArtwork({ medium: "Oil on canvas" }),
      makeArtwork({ medium: "Watercolor" }),
      makeArtwork({ medium: "Sculpture" }),
    ]);

    const response = await POST(
      makeRequest({ page: 1, preferences: ["Oil on canvas", "Watercolor"], filters: {} }),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.message).toBe("Successful");
    expect(body.data).toHaveLength(2);
    const mediums = body.data.map((a: any) => a.medium);
    expect(mediums).toContain("Oil on canvas");
    expect(mediums).toContain("Watercolor");
  });

  it("returns an empty array when no artworks match preferences", async () => {
    await Artworkuploads.create([makeArtwork({ medium: "Sculpture" })]);

    const response = await POST(
      makeRequest({ page: 1, preferences: ["Photography"], filters: {} }),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data).toEqual([]);
  });

  it("returns page metadata (page, pageCount, total)", async () => {
    await Artworkuploads.create([makeArtwork({ medium: "Oil on canvas" })]);

    const response = await POST(
      makeRequest({ page: 1, preferences: ["Oil on canvas"], filters: {} }),
    );
    const body = await response.json();

    expect(body.page).toBe(1);
    expect(typeof body.pageCount).toBe("number");
    expect(typeof body.total).toBe("number");
  });

  it("returns 400 when page is missing", async () => {
    const response = await POST(
      makeRequest({ preferences: ["Oil on canvas"], filters: {} }),
    );

    expect(response.status).toBe(400);
  });
});
