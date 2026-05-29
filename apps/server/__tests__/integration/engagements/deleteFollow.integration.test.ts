/**
 * Integration tests for DELETE /api/engagements/deleteFollow
 *
 * Seeds Follow, AccountGallery, AccountArtist, and AccountIndividual documents
 * and verifies the route removes follow relationships and decrements follower
 * counts correctly in the real in-memory MongoDB instance.
 *
 * Note: The route uses Follow.deleteOne() which ALWAYS returns a result object
 * (never falsy), so the 404 branch is unreachable in practice — the route
 * always returns 200.
 */

import { describe, it, expect, afterEach } from "vitest";
import { Follow } from "@omenai/shared-models/models/follows/FollowSchema";
import { AccountGallery } from "@omenai/shared-models/models/auth/GallerySchema";
import { AccountArtist } from "@omenai/shared-models/models/auth/ArtistSchema";
import { AccountIndividual } from "@omenai/shared-models/models/auth/IndividualSchema";

import { DELETE } from "../../../app/api/engagements/deleteFollow/route";

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

function makeRequest(body: object): Request {
  return new Request("http://localhost/api/engagements/deleteFollow", {
    method: "DELETE",
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

// ── Success ───────────────────────────────────────────────────────────────────

describe("DELETE /api/engagements/deleteFollow — success", () => {
  it("returns 200 when unfollowing successfully", async () => {
    await Follow.create({
      follower: "user-001",
      followingId: "gallery-001",
      followingType: "gallery",
    });

    const res = await DELETE(
      makeRequest({
        followerId: "user-001",
        followingId: "gallery-001",
        followingType: "gallery",
      }) as any,
    );
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.message).toBe("Unfollowed successfully");
  });

  it("removes the Follow document from the database", async () => {
    await Follow.create({
      follower: "user-001",
      followingId: "gallery-001",
      followingType: "gallery",
    });

    await DELETE(
      makeRequest({
        followerId: "user-001",
        followingId: "gallery-001",
        followingType: "gallery",
      }) as any,
    );

    const follow = await Follow.findOne({
      follower: "user-001",
      followingId: "gallery-001",
    });
    expect(follow).toBeNull();
  });

  it("decrements gallery followerCount on unfollow", async () => {
    await AccountGallery.create(
      makeGallery({ gallery_id: "gallery-002", followerCount: 5 }),
    );
    await Follow.create({
      follower: "user-001",
      followingId: "gallery-002",
      followingType: "gallery",
    });

    await DELETE(
      makeRequest({
        followerId: "user-001",
        followingId: "gallery-002",
        followingType: "gallery",
      }) as any,
    );

    const gallery = await AccountGallery.findOne({ gallery_id: "gallery-002" });
    expect(gallery!.followerCount).toBe(4);
  });

  it("returns 200 even when the follow relationship does not exist", async () => {
    // deleteOne always returns a result object (never falsy), so 404 is unreachable
    const res = await DELETE(
      makeRequest({
        followerId: "user-nonexistent",
        followingId: "gallery-nonexistent",
        followingType: "gallery",
      }) as any,
    );

    expect(res.status).toBe(200);
  });
});
