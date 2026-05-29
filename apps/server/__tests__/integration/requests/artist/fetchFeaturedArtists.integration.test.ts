/**
 * Integration tests for GET /api/requests/artist/fetchFeaturedArtists
 *
 * Seeds AccountArtist documents and verifies the route returns up to 10
 * artists with logo, name, and artist_id fields from the real in-memory
 * MongoDB instance.
 */

import { describe, it, expect, afterEach } from "vitest";
import { AccountArtist } from "@omenai/shared-models/models/auth/ArtistSchema";

import { GET } from "../../../../app/api/requests/artist/fetchFeaturedArtists/route";

// ── Fixture factories ─────────────────────────────────────────────────────────

let uid = 0;

function makeArtist(overrides: Record<string, any> = {}) {
  const id = ++uid;
  return {
    name: `Artist ${id}`,
    email: `artist-featured-${id}@test.com`,
    password: "hashed",
    artist_id: `artist-featured-${id}`,
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

function makeRequest(): Request {
  return new Request("http://localhost/api/requests/artist/fetchFeaturedArtists", {
    method: "GET",
  });
}

// ── Cleanup ───────────────────────────────────────────────────────────────────

afterEach(async () => {
  await AccountArtist.deleteMany({});
});

// ── Empty DB ──────────────────────────────────────────────────────────────────

describe("GET /api/requests/artist/fetchFeaturedArtists — empty database", () => {
  it("returns 200 with an empty data array when no artists exist", async () => {
    const res = await GET(makeRequest());
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.message).toBe("Featured artists fetched");
    expect(body.data).toEqual([]);
  });
});

// ── Success ───────────────────────────────────────────────────────────────────

describe("GET /api/requests/artist/fetchFeaturedArtists — success", () => {
  it("returns seeded artists in the response", async () => {
    await AccountArtist.create([
      makeArtist(),
      makeArtist(),
      makeArtist(),
    ]);

    const res = await GET(makeRequest());
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.data).toHaveLength(3);
  });

  it("returns logo, name, and artist_id fields for each artist", async () => {
    await AccountArtist.create(makeArtist({ name: "Featured One", logo: "featured.jpg", artist_id: "artist-ff-001" }));

    const res = await GET(makeRequest());
    const body = await res.json();

    expect(body.data[0]).toHaveProperty("name");
    expect(body.data[0]).toHaveProperty("logo");
    expect(body.data[0]).toHaveProperty("artist_id");
  });

  it("caps the result at 10 artists even when more exist in the DB", async () => {
    const artists = Array.from({ length: 15 }, (_, i) =>
      makeArtist({ artist_id: `artist-cap-${i}`, email: `cap-${i}@test.com` }),
    );
    await AccountArtist.create(artists);

    const res = await GET(makeRequest());
    const body = await res.json();

    expect(body.data.length).toBeLessThanOrEqual(10);
  });
});
