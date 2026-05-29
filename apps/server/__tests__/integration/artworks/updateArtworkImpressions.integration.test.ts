import { describe, it, expect, afterEach } from "vitest";
import { Artworkuploads } from "@omenai/shared-models/models/artworks/UploadArtworkSchema";
import { POST } from "../../../app/api/artworks/updateArtworkImpressions/route";

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
    impressions: 5,
    like_IDs: [],
    availability: true,
    ...overrides,
  };
}

function makeRequest(body: object): Request {
  return new Request("http://localhost/api/artworks/updateArtworkImpressions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("POST /api/artworks/updateArtworkImpressions (integration)", () => {
  afterEach(async () => {
    await Artworkuploads.deleteMany({});
  });

  it("increments impressions and adds like_id when value is true", async () => {
    const created = await Artworkuploads.create(makeArtwork({ impressions: 5 }));

    const response = await POST(
      makeRequest({ id: created.art_id, value: true, like_id: "user-42" }),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.message).toBe("Successful");

    const updated = await Artworkuploads.findOne({ art_id: created.art_id }).lean();
    expect(updated!.impressions).toBe(6);
    expect(updated!.like_IDs).toContain("user-42");
  });

  it("decrements impressions and removes like_id when value is false", async () => {
    const created = await Artworkuploads.create(
      makeArtwork({ impressions: 5, like_IDs: ["user-42"] }),
    );

    const response = await POST(
      makeRequest({ id: created.art_id, value: false, like_id: "user-42" }),
    );

    expect(response.status).toBe(200);

    const updated = await Artworkuploads.findOne({ art_id: created.art_id }).lean();
    expect(updated!.impressions).toBe(4);
    expect(updated!.like_IDs).not.toContain("user-42");
  });

  it("returns 500 when the artwork does not exist", async () => {
    const response = await POST(
      makeRequest({ id: "ghost-art-id", value: true, like_id: "user-1" }),
    );

    expect(response.status).toBe(500);
  });

  it("returns 400 when id is missing", async () => {
    const response = await POST(
      makeRequest({ value: true, like_id: "user-1" }),
    );

    expect(response.status).toBe(400);
  });

  it("returns 400 when value is missing", async () => {
    const created = await Artworkuploads.create(makeArtwork());

    const response = await POST(
      makeRequest({ id: created.art_id, like_id: "user-1" }),
    );

    expect(response.status).toBe(400);
  });

  it("returns 400 when like_id is missing", async () => {
    const created = await Artworkuploads.create(makeArtwork());

    const response = await POST(
      makeRequest({ id: created.art_id, value: true }),
    );

    expect(response.status).toBe(400);
  });
});
