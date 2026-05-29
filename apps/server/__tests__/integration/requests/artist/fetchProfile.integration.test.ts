/**
 * Integration tests for GET /api/requests/artist/fetchProfile
 *
 * Seeds AccountArtist documents and verifies the route returns the artist
 * profile fields from the real in-memory MongoDB instance.
 */

import { describe, it, expect, afterEach } from "vitest";
import { AccountArtist } from "@omenai/shared-models/models/auth/ArtistSchema";

import { GET } from "../../../../app/api/requests/artist/fetchProfile/route";

// ── Fixture factories ─────────────────────────────────────────────────────────

let uid = 0;

function makeArtist(overrides: Record<string, any> = {}) {
  const id = ++uid;
  return {
    name: "Test Artist",
    email: `artist-${id}@test.com`,
    password: "hashed",
    artist_id: `artist-${id}`,
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

function makeRequest(artistId?: string): Request {
  const url = new URL("http://localhost/api/requests/artist/fetchProfile");
  if (artistId) url.searchParams.set("id", artistId);
  return new Request(url.toString(), { method: "GET" });
}

// ── Cleanup ───────────────────────────────────────────────────────────────────

afterEach(async () => {
  await AccountArtist.deleteMany({});
});

// ── Validation ────────────────────────────────────────────────────────────────

describe("GET /api/requests/artist/fetchProfile — validation", () => {
  it("returns 400 when id query param is missing", async () => {
    const res = await GET(makeRequest() as any);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.message).toMatch(/Invalid URL parameters/i);
  });
});

// ── Not found ─────────────────────────────────────────────────────────────────

describe("GET /api/requests/artist/fetchProfile — not found", () => {
  it("returns 404 when artist does not exist", async () => {
    const res = await GET(makeRequest("artist-nonexistent") as any);
    const body = await res.json();

    expect(res.status).toBe(404);
    expect(body.message).toMatch(/Artist not found/i);
  });
});

// ── Success ───────────────────────────────────────────────────────────────────

describe("GET /api/requests/artist/fetchProfile — success", () => {
  it("returns 200 with the artist profile when found", async () => {
    const artist = await AccountArtist.create(makeArtist({ artist_id: "artist-profile-001", name: "Gallery Artist" }));

    const res = await GET(makeRequest("artist-profile-001") as any);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.message).toBe("Profile retrieved successfully");
    expect(body.artist).toBeDefined();
  });

  it("returns the correct name in the artist profile", async () => {
    await AccountArtist.create(makeArtist({ artist_id: "artist-profile-002", name: "Unique Artist Name" }));

    const res = await GET(makeRequest("artist-profile-002") as any);
    const body = await res.json();

    expect(body.artist.name).toBe("Unique Artist Name");
  });

  it("returns name, logo, email, address and bio fields in the profile", async () => {
    await AccountArtist.create(
      makeArtist({
        artist_id: "artist-profile-003",
        name: "Full Profile Artist",
        bio: "My bio",
        logo: "logo.jpg",
      }),
    );

    const res = await GET(makeRequest("artist-profile-003") as any);
    const body = await res.json();

    expect(body.artist).toHaveProperty("name");
    expect(body.artist).toHaveProperty("logo");
    expect(body.artist).toHaveProperty("email");
    expect(body.artist).toHaveProperty("address");
    expect(body.artist).toHaveProperty("bio");
  });

  it("does not return another artist when a different id is queried", async () => {
    await AccountArtist.create([
      makeArtist({ artist_id: "artist-profile-004", name: "Artist A" }),
      makeArtist({ artist_id: "artist-profile-005", name: "Artist B" }),
    ]);

    const res = await GET(makeRequest("artist-profile-004") as any);
    const body = await res.json();

    expect(body.artist.name).toBe("Artist A");
  });
});
