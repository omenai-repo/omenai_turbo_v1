import { describe, it, expect, afterEach } from "vitest";
import { Artworkuploads } from "@omenai/shared-models/models/artworks/UploadArtworkSchema";
import { POST } from "../../../app/api/artworks/getUserSavedArtworks/route";

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
    like_IDs: [],
    availability: true,
    ...overrides,
  };
}

function makeRequest(body: object): Request {
  return new Request("http://localhost/api/artworks/getUserSavedArtworks", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("POST /api/artworks/getUserSavedArtworks (integration)", () => {
  afterEach(async () => {
    await Artworkuploads.deleteMany({});
  });

  it("returns artworks liked by the specified user", async () => {
    await Artworkuploads.create([
      makeArtwork({ like_IDs: ["user-1", "user-2"] }),
      makeArtwork({ like_IDs: ["user-1"] }),
      makeArtwork({ like_IDs: ["user-3"] }),
    ]);

    const response = await POST(makeRequest({ id: "user-1", page: 1 }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.message).toBe("Successful");
    expect(body.data).toHaveLength(2);
    expect(body.data.every((a: any) => a.like_IDs.includes("user-1"))).toBe(true);
  });

  it("returns empty data when user has no liked artworks", async () => {
    await Artworkuploads.create([makeArtwork({ like_IDs: ["user-9"] })]);

    const response = await POST(makeRequest({ id: "user-nobody", page: 1 }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data).toEqual([]);
  });

  it("returns pageCount and total metadata", async () => {
    await Artworkuploads.create([makeArtwork({ like_IDs: ["user-1"] })]);

    const response = await POST(makeRequest({ id: "user-1", page: 1 }));
    const body = await response.json();

    expect(typeof body.pageCount).toBe("number");
    expect(typeof body.total).toBe("number");
  });

  it("returns 400 when id is missing", async () => {
    const response = await POST(makeRequest({ page: 1 }));

    expect(response.status).toBe(400);
  });

  it("returns 400 when page is missing", async () => {
    const response = await POST(makeRequest({ id: "user-1" }));

    expect(response.status).toBe(400);
  });

  it("returns 400 when id is an empty string", async () => {
    const response = await POST(makeRequest({ id: "", page: 1 }));

    expect(response.status).toBe(400);
  });
});
