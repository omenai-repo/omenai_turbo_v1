/**
 * Integration tests for POST /api/engagements/follow
 *
 * Seeds Follow, AccountGallery, AccountArtist, and AccountIndividual documents
 * and verifies the route creates follow relationships and increments follower
 * counts correctly in the real in-memory MongoDB instance.
 */

import { describe, it, expect, afterEach } from "vitest";
import { Follow } from "@omenai/shared-models/models/follows/FollowSchema";
import { AccountGallery } from "@omenai/shared-models/models/auth/GallerySchema";
import { AccountIndividual } from "@omenai/shared-models/models/auth/IndividualSchema";
import { AccountArtist } from "@omenai/shared-models/models/auth/ArtistSchema";

import { POST } from "../../../app/api/engagements/follow/route";

// ── Fixture factories ─────────────────────────────────────────────────────────

function makeGallery(overrides: Record<string, any> = {}) {
  return {
    name: "Test Gallery",
    email: "gallery@test.com",
    password: "hashed-password",
    gallery_id: "gallery-001",
    connected_account_id: "acct_test_001",
    logo: "https://example.com/logo.png",
    admin: false,
    description: "A test gallery",
    verified: false,
    gallery_verified: false,
    followerCount: 0,
    address: { city: "NY", country: "US" },
    ...overrides,
  };
}

function makeIndividual(overrides: Record<string, any> = {}) {
  return {
    name: "Test User",
    email: "user@test.com",
    password: "hashed-password",
    user_id: "user-001",
    verified: false,
    preferences: [],
    address: { city: "NY", country: "US" },
    ...overrides,
  };
}

function makeArtist(overrides: Record<string, any> = {}) {
  return {
    name: "Test Artist",
    email: "artist@test.com",
    password: "hashed-password",
    artist_id: "artist-001",
    logo: "https://example.com/artist-logo.png",
    verified: false,
    artist_verified: false,
    role: "artist",
    art_style: [],
    address: { city: "NY", country: "US" },
    bio: "test",
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

function makeRequest(body: object): Request {
  return new Request("http://localhost/api/engagements/follow", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

// ── Cleanup ───────────────────────────────────────────────────────────────────

afterEach(async () => {
  await Follow.deleteMany({});
  await AccountGallery.deleteMany({});
  await AccountArtist.deleteMany({});
  await AccountIndividual.deleteMany({});
});

// ── Validation ────────────────────────────────────────────────────────────────

describe("POST /api/engagements/follow — validation", () => {
  it("returns 400 when required fields are missing", async () => {
    const res = await POST(makeRequest({}));
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body).toBeDefined();
  });

  it("returns 400 when followingType is invalid", async () => {
    const res = await POST(
      makeRequest({
        followerId: "user-001",
        followingId: "target-001",
        followingType: "facebook",
      }),
    );
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body).toBeDefined();
  });
});

// ── Gallery follows ───────────────────────────────────────────────────────────

describe("POST /api/engagements/follow — following a gallery", () => {
  it("returns 200 and creates a Follow document when following a gallery", async () => {
    await AccountGallery.create(makeGallery({ gallery_id: "gallery-001" }));

    const res = await POST(
      makeRequest({
        followerId: "user-001",
        followingId: "gallery-001",
        followingType: "gallery",
      }),
    );
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);

    const follow = await Follow.findOne({
      follower: "user-001",
      followingId: "gallery-001",
    });
    expect(follow).not.toBeNull();
  });

  it("increments gallery followerCount when following a gallery", async () => {
    await AccountGallery.create(
      makeGallery({ gallery_id: "gallery-002", followerCount: 5 }),
    );

    await POST(
      makeRequest({
        followerId: "user-001",
        followingId: "gallery-002",
        followingType: "gallery",
      }),
    );

    const gallery = await AccountGallery.findOne({ gallery_id: "gallery-002" });
    expect(gallery!.followerCount).toBe(6);
  });
});

// ── Artist follows ────────────────────────────────────────────────────────────

describe("POST /api/engagements/follow — following an artist", () => {
  it("returns 200 and creates a Follow document when following an artist", async () => {
    await AccountArtist.create(makeArtist({ artist_id: "artist-001" }));

    const res = await POST(
      makeRequest({
        followerId: "user-002",
        followingId: "artist-001",
        followingType: "artist",
      }),
    );
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);

    const follow = await Follow.findOne({
      follower: "user-002",
      followingId: "artist-001",
    });
    expect(follow).not.toBeNull();
  });
});

// ── Duplicate key ─────────────────────────────────────────────────────────────

describe("POST /api/engagements/follow — duplicate follow", () => {
  it("returns 400 when user tries to follow the same target twice", async () => {
    await AccountGallery.create(makeGallery({ gallery_id: "gallery-003" }));

    const requestBody = {
      followerId: "user-003",
      followingId: "gallery-003",
      followingType: "gallery",
    };

    // First follow — should succeed
    const firstRes = await POST(makeRequest(requestBody));
    expect(firstRes.status).toBe(200);

    // Second follow — should fail with duplicate key
    const secondRes = await POST(makeRequest(requestBody));
    const body = await secondRes.json();

    expect(secondRes.status).toBe(400);
    expect(body.error).toBe("Already following");
  });
});
