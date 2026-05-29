import { describe, it, expect, afterEach } from "vitest";
import { Artworkuploads } from "@omenai/shared-models/models/artworks/UploadArtworkSchema";
import { POST } from "../../../app/api/artworks/updateArtworkPrice/route";

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
    role_access: { role: "gallery" },
    availability: true,
    ...overrides,
  };
}

function makeRequest(body: object): Request {
  return new Request("http://localhost/api/artworks/updateArtworkPrice", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("POST /api/artworks/updateArtworkPrice (integration)", () => {
  afterEach(async () => {
    await Artworkuploads.deleteMany({});
  });

  it("updates the artwork price and returns 200", async () => {
    const created = await Artworkuploads.create(
      makeArtwork({ pricing: { price: 1000, usd_price: 1000, currency: "USD", shouldShowPrice: "yes" } }),
    );

    const newPricing = { price: 2500, usd_price: 2500, currency: "USD", shouldShowPrice: "yes" };

    const response = await POST(
      makeRequest({ art_id: created.art_id, filter: { pricing: newPricing } }),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.message).toBe("Successful");

    const updated = await Artworkuploads.findOne({ art_id: created.art_id }).lean();
    expect(updated!.pricing.price).toBe(2500);
  });

  it("returns 500 when no artwork matches the given art_id", async () => {
    const response = await POST(
      makeRequest({
        art_id: "non-existent-id",
        filter: { pricing: { price: 500, usd_price: 500, currency: "USD", shouldShowPrice: "yes" } },
      }),
    );

    expect(response.status).toBe(500);
  });

  it("returns 400 when art_id is missing", async () => {
    const response = await POST(
      makeRequest({ filter: { pricing: { price: 500 } } }),
    );

    expect(response.status).toBe(400);
  });

  it("returns 400 when art_id is an empty string", async () => {
    const response = await POST(
      makeRequest({ art_id: "", filter: { pricing: { price: 500 } } }),
    );

    expect(response.status).toBe(400);
  });
});
