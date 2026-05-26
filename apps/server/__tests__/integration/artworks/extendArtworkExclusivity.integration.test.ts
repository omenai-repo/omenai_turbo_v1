import { describe, it, expect, afterEach } from "vitest";
import { Artworkuploads } from "@omenai/shared-models/models/artworks/UploadArtworkSchema";
import { CreateOrder } from "@omenai/shared-models/models/orders/CreateOrderSchema";
import { PUT } from "../../../app/api/artworks/extendArtworkExclusivity/route";

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
    exclusivity_status: {
      exclusivity_type: null,
      exclusivity_end_date: null,
    },
    ...overrides,
  };
}

function makeRequest(body: object): Request {
  return new Request("http://localhost/api/artworks/extendArtworkExclusivity", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("PUT /api/artworks/extendArtworkExclusivity (integration)", () => {
  afterEach(async () => {
    await Artworkuploads.deleteMany({});
    await CreateOrder.deleteMany({});
  });

  it("sets exclusivity_type to exclusive and sets a future end date", async () => {
    const created = await Artworkuploads.create(makeArtwork());

    const response = await PUT(makeRequest({ art_id: created.art_id }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.message).toBe("Exclusivity period extended for 90 days");

    const updated = await Artworkuploads.findOne({ art_id: created.art_id }).lean();
    expect(updated!.exclusivity_status.exclusivity_type).toBe("exclusive");
    expect(updated!.exclusivity_status.exclusivity_end_date).toBeTruthy();

    const endDate = new Date(updated!.exclusivity_status.exclusivity_end_date!);
    expect(endDate.getTime()).toBeGreaterThan(Date.now());
  });

  it("sets exclusivity end date approximately 90 days from now", async () => {
    const created = await Artworkuploads.create(makeArtwork());

    await PUT(makeRequest({ art_id: created.art_id }));

    const updated = await Artworkuploads.findOne({ art_id: created.art_id }).lean();
    const endDate = new Date(updated!.exclusivity_status.exclusivity_end_date!);
    const daysFromNow = (endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24);

    expect(daysFromNow).toBeGreaterThan(88);
    expect(daysFromNow).toBeLessThan(92);
  });

  it("returns 400 when artwork does not exist", async () => {
    const response = await PUT(makeRequest({ art_id: "non-existent-id" }));

    expect(response.status).toBe(400);
  });

  it("returns 400 when art_id is missing", async () => {
    const response = await PUT(makeRequest({}));

    expect(response.status).toBe(400);
  });

  it("returns 400 when art_id is an empty string", async () => {
    const response = await PUT(makeRequest({ art_id: "" }));

    expect(response.status).toBe(400);
  });
});
