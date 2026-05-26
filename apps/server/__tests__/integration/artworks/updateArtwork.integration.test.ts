import { describe, it, expect, afterEach } from "vitest";
import { Artworkuploads } from "@omenai/shared-models/models/artworks/UploadArtworkSchema";
import { POST } from "../../../app/api/artworks/updateArtwork/route";

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
    role_access: { role: "gallery" },
    availability: true,
    ...overrides,
  };
}

function makeRequest(body: object): Request {
  return new Request("http://localhost/api/artworks/updateArtwork", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("POST /api/artworks/updateArtwork (integration)", () => {
  afterEach(async () => {
    await Artworkuploads.deleteMany({});
  });

  it("updates artwork fields and returns 200", async () => {
    const created = await Artworkuploads.create(makeArtwork({ rarity: "unique" }));

    const response = await POST(
      makeRequest({ art_id: created.art_id, filter: { rarity: "limited edition" } }),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.message).toBe("Successfully updated artwork data");

    const updated = await Artworkuploads.findOne({ art_id: created.art_id }).lean();
    expect(updated!.rarity).toBe("limited edition");
  });

  it("updates nested fields such as availability", async () => {
    const created = await Artworkuploads.create(makeArtwork({ availability: true }));

    await POST(
      makeRequest({ art_id: created.art_id, filter: { availability: false } }),
    );

    const updated = await Artworkuploads.findOne({ art_id: created.art_id }).lean();
    expect(updated!.availability).toBe(false);
  });

  it("returns 500 when no artwork matches the given art_id", async () => {
    const response = await POST(
      makeRequest({ art_id: "non-existent-id", filter: { rarity: "unique" } }),
    );

    expect(response.status).toBe(500);
  });

  it("returns 400 when art_id is missing", async () => {
    const response = await POST(
      makeRequest({ filter: { rarity: "unique" } }),
    );

    expect(response.status).toBe(400);
  });

  it("returns 400 when art_id is an empty string", async () => {
    const response = await POST(
      makeRequest({ art_id: "", filter: { rarity: "unique" } }),
    );

    expect(response.status).toBe(400);
  });
});
