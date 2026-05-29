/**
 * Integration tests for GET /api/requests/artist/fetchFeaturedArtistData
 *
 * Seeds AccountArtist and Artworkuploads documents and verifies the route
 * returns artist data along with their artworks from the real in-memory
 * MongoDB instance.
 */

import { describe, it, expect, afterEach } from "vitest";
import { AccountArtist } from "@omenai/shared-models/models/auth/ArtistSchema";
import { Artworkuploads } from "@omenai/shared-models/models/artworks/UploadArtworkSchema";

import { GET } from "../../../../app/api/requests/artist/fetchFeaturedArtistData/route";

// ── Fixture factories ─────────────────────────────────────────────────────────

let uid = 0;

function makeArtist(overrides: Record<string, any> = {}) {
  const id = ++uid;
  return {
    name: `Artist ${id}`,
    email: `artist-fad-${id}@test.com`,
    password: "hashed",
    artist_id: `artist-fad-${id}`,
    logo: "logo.jpg",
    bio: "test bio",
    address: { city: "NY", country: "US" },
    verified: false,
    artist_verified: false,
    role: "artist",
    art_style: [],
    documentation: {
      cv: "",
      socials: {
        instagram: "",
        twitter: "",
        facebook: "",
        linkedin: "",
      },
    },
    ...overrides,
  };
}

function makeArtwork(overrides: Record<string, any> = {}) {
  const uid = Math.random().toString(36).slice(2, 10);
  return {
    art_id: `art-${uid}`,
    title: `Test Artwork ${uid}`,
    artist: "Test Artist",
    author_id: "artist-fad-001",
    role_access: { role: "gallery" },
    like_IDs: [],
    url: `https://example.com/art-${uid}.jpg`,
    year: 2020,
    medium: "Oil on canvas",
    rarity: "unique",
    materials: "Canvas",
    dimensions: { height: "50", width: "40" },
    pricing: { price: 1000, usd_price: 1000, currency: "USD", shouldShowPrice: "yes" },
    artist_birthyear: "1990",
    artist_country_origin: "US",
    certificate_of_authenticity: "yes",
    signature: "yes",
    packaging_type: "rolled",
    ...overrides,
  };
}

function makeRequest(artistId?: string): Request {
  const url = new URL("http://localhost/api/requests/artist/fetchFeaturedArtistData");
  if (artistId) url.searchParams.set("id", artistId);
  return new Request(url.toString(), { method: "GET" });
}

// ── Cleanup ───────────────────────────────────────────────────────────────────

afterEach(async () => {
  await AccountArtist.deleteMany({});
  await Artworkuploads.deleteMany({});
});

// ── Validation ────────────────────────────────────────────────────────────────

describe("GET /api/requests/artist/fetchFeaturedArtistData — validation", () => {
  it("returns 400 when id query param is missing", async () => {
    const res = await GET(makeRequest());
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.message).toMatch(/Invalid URL parameters/i);
  });
});

// ── Not found ─────────────────────────────────────────────────────────────────

describe("GET /api/requests/artist/fetchFeaturedArtistData — not found", () => {
  it("returns 404 when artist does not exist", async () => {
    const res = await GET(makeRequest("artist-nonexistent"));
    const body = await res.json();

    expect(res.status).toBe(404);
    expect(body.message).toMatch(/Artist not found/i);
  });
});

// ── Success ───────────────────────────────────────────────────────────────────

describe("GET /api/requests/artist/fetchFeaturedArtistData — success", () => {
  it("returns 200 with artist data when artist exists", async () => {
    await AccountArtist.create(makeArtist({ artist_id: "artist-fad-data-001", name: "Featured Artist" }));

    const res = await GET(makeRequest("artist-fad-data-001"));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.message).toBe("Featured artist data fetched");
    expect(body.data).toBeDefined();
  });

  it("returns the artist artworks array in the response", async () => {
    await AccountArtist.create(makeArtist({ artist_id: "artist-fad-data-002" }));
    await Artworkuploads.create([
      makeArtwork({ art_id: "art-fad-001", author_id: "artist-fad-data-002" }),
      makeArtwork({ art_id: "art-fad-002", author_id: "artist-fad-data-002" }),
    ]);

    const res = await GET(makeRequest("artist-fad-data-002"));
    const body = await res.json();

    expect(body.artist_artworks).toHaveLength(2);
  });

  it("returns an empty artworks array when artist has no artworks", async () => {
    await AccountArtist.create(makeArtist({ artist_id: "artist-fad-data-003" }));

    const res = await GET(makeRequest("artist-fad-data-003"));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.artist_artworks).toEqual([]);
  });

  it("only returns artworks belonging to the queried artist", async () => {
    await AccountArtist.create(makeArtist({ artist_id: "artist-fad-data-004" }));
    await Artworkuploads.create([
      makeArtwork({ art_id: "art-fad-mine", author_id: "artist-fad-data-004" }),
      makeArtwork({ art_id: "art-fad-other", author_id: "artist-other-999" }),
    ]);

    const res = await GET(makeRequest("artist-fad-data-004"));
    const body = await res.json();

    expect(body.artist_artworks).toHaveLength(1);
    expect(body.artist_artworks[0].art_id).toBe("art-fad-mine");
  });
});
