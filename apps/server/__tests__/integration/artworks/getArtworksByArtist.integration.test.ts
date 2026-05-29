import { describe, it, expect, afterEach } from "vitest";
import { Artworkuploads } from "@omenai/shared-models/models/artworks/UploadArtworkSchema";
import { POST } from "../../../app/api/artworks/getArtworksByArtist/route";

// ── Fixtures ─────────────────────────────────────────────────────────────────

function makeArtwork(overrides: Record<string, any> = {}) {
  const uid = crypto.randomUUID();
  return {
    artist: "Picasso",
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
    artist_country_origin: "Spain",
    certificate_of_authenticity: "yes",
    signature: "yes",
    packaging_type: "rolled",
    // role_access.role must be "artist" since galleries = [] in test env
    role_access: { role: "artist" },
    availability: true,
    ...overrides,
  };
}

function makeRequest(body: object): Request {
  return new Request("http://localhost/api/artworks/getArtworksByArtist", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("POST /api/artworks/getArtworksByArtist (integration)", () => {
  afterEach(async () => {
    await Artworkuploads.deleteMany({});
  });

  it("returns only artworks by the specified artist", async () => {
    await Artworkuploads.create([
      makeArtwork({ artist: "Picasso" }),
      makeArtwork({ artist: "Picasso" }),
      makeArtwork({ artist: "Monet" }),
    ]);

    const response = await POST(makeRequest({ artist: "Picasso", page: 1 }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.message).toBe("Successful");
    expect(body.data).toHaveLength(2);
    expect(body.data.every((a: any) => a.artist === "Picasso")).toBe(true);
  });

  it("returns an empty array when no artworks match the artist", async () => {
    await Artworkuploads.create([makeArtwork({ artist: "Monet" })]);

    const response = await POST(makeRequest({ artist: "Van Gogh", page: 1 }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data).toEqual([]);
  });

  it("defaults to page 1 when page is omitted", async () => {
    await Artworkuploads.create([makeArtwork({ artist: "Picasso" })]);

    const response = await POST(makeRequest({ artist: "Picasso" }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data).toHaveLength(1);
  });

  it("returns 400 when artist is missing from the request body", async () => {
    const response = await POST(makeRequest({ page: 1 }));

    expect(response.status).toBe(400);
  });

  it("returns 400 when artist is an empty string", async () => {
    const response = await POST(makeRequest({ artist: "", page: 1 }));

    expect(response.status).toBe(400);
  });
});
