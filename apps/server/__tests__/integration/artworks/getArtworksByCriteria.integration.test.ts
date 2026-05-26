import { describe, it, expect, afterEach } from "vitest";
import { Artworkuploads } from "@omenai/shared-models/models/artworks/UploadArtworkSchema";
import { POST } from "../../../app/api/artworks/getArtworksByCriteria/route";

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
  return new Request("http://localhost/api/artworks/getArtworksByCriteria", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("POST /api/artworks/getArtworksByCriteria (integration)", () => {
  afterEach(async () => {
    await Artworkuploads.deleteMany({});
  });

  it("returns only artworks matching the specified medium", async () => {
    await Artworkuploads.create([
      makeArtwork({ medium: "Watercolor" }),
      makeArtwork({ medium: "Watercolor" }),
      makeArtwork({ medium: "Sculpture" }),
    ]);

    const response = await POST(
      makeRequest({ page: 1, medium: "Watercolor", filters: {} }),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.message).toBe("Successful");
    expect(body.data).toHaveLength(2);
    expect(body.data.every((a: any) => a.medium === "Watercolor")).toBe(true);
  });

  it("returns empty data when no artworks match the medium", async () => {
    await Artworkuploads.create([makeArtwork({ medium: "Oil on canvas" })]);

    const response = await POST(
      makeRequest({ page: 1, medium: "Photography", filters: {} }),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data).toEqual([]);
    expect(body.total).toBe(0);
  });

  it("combines medium with additional filters", async () => {
    await Artworkuploads.create([
      makeArtwork({ medium: "Watercolor", rarity: "unique" }),
      makeArtwork({ medium: "Watercolor", rarity: "limited edition" }),
    ]);

    // buildMongoQuery expects filter values as arrays
    const response = await POST(
      makeRequest({ page: 1, medium: "Watercolor", filters: { rarity: ["unique"] } }),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data).toHaveLength(1);
    expect(body.data[0].rarity).toBe("unique");
  });

  it("returns page metadata (page, pageCount, total)", async () => {
    await Artworkuploads.create([makeArtwork({ medium: "Watercolor" })]);

    const response = await POST(
      makeRequest({ page: 1, medium: "Watercolor", filters: {} }),
    );
    const body = await response.json();

    expect(body.page).toBe(1);
    expect(typeof body.pageCount).toBe("number");
    expect(typeof body.total).toBe("number");
  });

  it("returns 400 when medium is missing", async () => {
    const response = await POST(makeRequest({ page: 1, filters: {} }));

    expect(response.status).toBe(400);
  });

  it("returns 400 when page is missing", async () => {
    const response = await POST(makeRequest({ medium: "Watercolor", filters: {} }));

    expect(response.status).toBe(400);
  });
});
