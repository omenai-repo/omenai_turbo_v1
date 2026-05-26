import { describe, it, expect, afterEach } from "vitest";
import { Artworkuploads } from "@omenai/shared-models/models/artworks/UploadArtworkSchema";
import { POST } from "../../../app/api/artworks/getTrendingArtworks/route";

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
    impressions: 5,
    availability: true,
    ...overrides,
  };
}

function makeRequest(body: object): Request {
  return new Request("http://localhost/api/artworks/getTrendingArtworks", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("POST /api/artworks/getTrendingArtworks (integration)", () => {
  afterEach(async () => {
    await Artworkuploads.deleteMany({});
  });

  it("returns artworks sorted by impressions descending", async () => {
    await Artworkuploads.create([
      makeArtwork({ impressions: 10, availability: true }),
      makeArtwork({ impressions: 50, availability: true }),
      makeArtwork({ impressions: 30, availability: true }),
    ]);

    const response = await POST(makeRequest({ page: 1, filters: {} }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data[0].impressions).toBe(50);
    expect(body.data[1].impressions).toBe(30);
    expect(body.data[2].impressions).toBe(10);
  });

  it("returns only available artworks (availability: true) in the dataset", async () => {
    await Artworkuploads.create([
      makeArtwork({ availability: true, impressions: 10 }),
      makeArtwork({ availability: false, impressions: 20 }),
    ]);

    const response = await POST(makeRequest({ page: 1, filters: {} }));
    const body = await response.json();

    expect(response.status).toBe(200);
    // The route filters by availability: true in its query
    expect(body.data.every((a: any) => a.availability === true)).toBe(true);
  });

  it("returns page metadata (page, pageCount, total)", async () => {
    await Artworkuploads.create([makeArtwork({ impressions: 5 })]);

    const response = await POST(makeRequest({ page: 1, filters: {} }));
    const body = await response.json();

    expect(body.page).toBe(1);
    expect(typeof body.pageCount).toBe("number");
    expect(typeof body.total).toBe("number");
  });

  it("returns empty data array when no artworks exist", async () => {
    const response = await POST(makeRequest({ page: 1, filters: {} }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data).toEqual([]);
    expect(body.total).toBe(0);
  });

  it("applies medium filter when provided", async () => {
    await Artworkuploads.create([
      makeArtwork({ medium: "Oil on canvas", impressions: 10 }),
      makeArtwork({ medium: "Watercolor", impressions: 10 }),
    ]);

    // buildMongoQuery expects filter values as arrays
    const response = await POST(
      makeRequest({ page: 1, filters: { medium: ["Oil on canvas"] } }),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data.every((a: any) => a.medium === "Oil on canvas")).toBe(true);
  });

  it("returns 200 when page is missing (schema defaults to 1)", async () => {
    const response = await POST(makeRequest({ filters: {} }));

    // page: z.number().default(1) — missing page is fine, not a validation error
    expect(response.status).toBe(200);
  });
});
