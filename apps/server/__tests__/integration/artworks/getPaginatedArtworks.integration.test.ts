import { describe, it, expect, afterEach } from "vitest";
import { Artworkuploads } from "@omenai/shared-models/models/artworks/UploadArtworkSchema";
import { POST } from "../../../app/api/artworks/getPaginatedArtworks/route";

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
  return new Request("http://localhost/api/artworks/getPaginatedArtworks", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("POST /api/artworks/getPaginatedArtworks (integration)", () => {
  afterEach(async () => {
    await Artworkuploads.deleteMany({});
  });

  it("returns artworks for page 1 with no filters", async () => {
    await Artworkuploads.create([makeArtwork(), makeArtwork(), makeArtwork()]);

    const response = await POST(makeRequest({ page: 1, filters: {} }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.message).toBe("Successful");
    expect(body.data).toHaveLength(3);
  });

  it("respects the page limit of 30 artworks per page", async () => {
    const artworks = Array.from({ length: 35 }, () => makeArtwork());
    await Artworkuploads.create(artworks);

    const response = await POST(makeRequest({ page: 1, filters: {} }));
    const body = await response.json();

    expect(body.data.length).toBeLessThanOrEqual(30);
  });

  it("returns page 2 with remaining artworks", async () => {
    const artworks = Array.from({ length: 35 }, () => makeArtwork());
    await Artworkuploads.create(artworks);

    const response = await POST(makeRequest({ page: 2, filters: {} }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data.length).toBeGreaterThan(0);
    expect(body.page).toBe(2);
  });

  it("applies a medium filter correctly", async () => {
    await Artworkuploads.create([
      makeArtwork({ medium: "Oil on canvas" }),
      makeArtwork({ medium: "Watercolor" }),
      makeArtwork({ medium: "Oil on canvas" }),
    ]);

    // buildMongoQuery expects filter values as arrays
    const response = await POST(
      makeRequest({ page: 1, filters: { medium: ["Oil on canvas"] } }),
    );
    const body = await response.json();

    expect(body.data).toHaveLength(2);
    expect(body.data.every((a: any) => a.medium === "Oil on canvas")).toBe(true);
  });

  it("returns empty data and zero total for an empty database", async () => {
    const response = await POST(makeRequest({ page: 1, filters: {} }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data).toEqual([]);
    expect(body.total).toBe(0);
  });

  it("returns pageCount and total in the response", async () => {
    await Artworkuploads.create([makeArtwork()]);

    const response = await POST(makeRequest({ page: 1, filters: {} }));
    const body = await response.json();

    expect(typeof body.pageCount).toBe("number");
    expect(typeof body.total).toBe("number");
  });

  it("returns 400 when page is missing", async () => {
    const response = await POST(makeRequest({ filters: {} }));

    expect(response.status).toBe(400);
  });
});
