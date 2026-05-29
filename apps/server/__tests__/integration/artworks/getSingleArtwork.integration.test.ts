import { describe, it, expect, afterEach } from "vitest";
import { Artworkuploads } from "@omenai/shared-models/models/artworks/UploadArtworkSchema";
import { POST as getSingleArtwork } from "../../../app/api/artworks/getSingleArtwork/route";
import { POST as getSingleArtworkOnPurchase } from "../../../app/api/artworks/getSingleArtworkOnPurchase/route";

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

function makeRequest(url: string, body: object): Request {
  return new Request(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("POST /api/artworks/getSingleArtwork (integration)", () => {
  afterEach(async () => {
    await Artworkuploads.deleteMany({});
  });

  it("returns the artwork for a valid art_id", async () => {
    const created = await Artworkuploads.create(makeArtwork({ title: "Unique Piece" }));

    const response = await getSingleArtwork(
      makeRequest("http://localhost/api/artworks/getSingleArtwork", { art_id: created.art_id }),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.message).toBe("Successful");
    expect(body.data.art_id).toBe(created.art_id);
    expect(body.data.title).toBe("Unique Piece");
  });

  it("returns 404 when artwork does not exist", async () => {
    const response = await getSingleArtwork(
      makeRequest("http://localhost/api/artworks/getSingleArtwork", { art_id: "non-existent-id" }),
    );

    expect(response.status).toBe(404);
  });

  it("returns 400 when art_id is missing", async () => {
    const response = await getSingleArtwork(
      makeRequest("http://localhost/api/artworks/getSingleArtwork", {}),
    );

    expect(response.status).toBe(400);
  });

  it("returns 400 when art_id is an empty string", async () => {
    const response = await getSingleArtwork(
      makeRequest("http://localhost/api/artworks/getSingleArtwork", { art_id: "" }),
    );

    expect(response.status).toBe(400);
  });
});

describe("POST /api/artworks/getSingleArtworkOnPurchase (integration)", () => {
  afterEach(async () => {
    await Artworkuploads.deleteMany({});
  });

  it("returns the artwork for a valid art_id", async () => {
    const created = await Artworkuploads.create(makeArtwork({ title: "Purchase Piece" }));

    const response = await getSingleArtworkOnPurchase(
      makeRequest("http://localhost/api/artworks/getSingleArtworkOnPurchase", { art_id: created.art_id }),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data.art_id).toBe(created.art_id);
  });

  it("returns 404 when artwork does not exist", async () => {
    const response = await getSingleArtworkOnPurchase(
      makeRequest("http://localhost/api/artworks/getSingleArtworkOnPurchase", { art_id: "ghost-id" }),
    );

    expect(response.status).toBe(404);
  });

  it("returns 400 when art_id is missing", async () => {
    const response = await getSingleArtworkOnPurchase(
      makeRequest("http://localhost/api/artworks/getSingleArtworkOnPurchase", {}),
    );

    expect(response.status).toBe(400);
  });
});
