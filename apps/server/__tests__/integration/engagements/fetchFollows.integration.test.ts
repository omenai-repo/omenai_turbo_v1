/**
 * Integration tests for GET /api/engagements/fetchFollows
 *
 * Seeds Follow documents and verifies the route returns the correct set of
 * followedIds for a given user from the real in-memory MongoDB instance.
 */

import { describe, it, expect, afterEach } from "vitest";
import { Follow } from "@omenai/shared-models/models/follows/FollowSchema";

import { GET } from "../../../app/api/engagements/fetchFollows/route";

// ── Fixture helpers ───────────────────────────────────────────────────────────

function makeGetRequest(id?: string): Request {
  const url = id
    ? `http://localhost/api/engagements/fetchFollows?id=${id}`
    : "http://localhost/api/engagements/fetchFollows";
  return new Request(url, { method: "GET" });
}

// ── Cleanup ───────────────────────────────────────────────────────────────────

afterEach(async () => {
  await Follow.deleteMany({});
});

// ── No id provided ────────────────────────────────────────────────────────────

describe("GET /api/engagements/fetchFollows — no id provided", () => {
  it("returns 200 with empty followedIds when id is not provided", async () => {
    const res = await GET(makeGetRequest());
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.followedIds).toEqual([]);
  });
});

// ── User with no follows ──────────────────────────────────────────────────────

describe("GET /api/engagements/fetchFollows — user with no follows", () => {
  it("returns 200 with empty followedIds when user has no follows", async () => {
    const res = await GET(makeGetRequest("user-no-follows"));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.followedIds).toEqual([]);
  });
});

// ── User with follows ─────────────────────────────────────────────────────────

describe("GET /api/engagements/fetchFollows — user with follows", () => {
  it("returns 200 with followedIds array when user has follows", async () => {
    await Follow.create([
      { follower: "user-001", followingId: "gallery-A", followingType: "gallery" },
      { follower: "user-001", followingId: "artist-B", followingType: "artist" },
    ]);

    const res = await GET(makeGetRequest("user-001"));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.followedIds).toHaveLength(2);
    expect(body.followedIds).toContain("gallery-A");
    expect(body.followedIds).toContain("artist-B");
  });

  it("only returns follows for the requested user", async () => {
    await Follow.create([
      { follower: "user-001", followingId: "gallery-A", followingType: "gallery" },
      { follower: "user-001", followingId: "artist-B", followingType: "artist" },
      { follower: "user-002", followingId: "gallery-C", followingType: "gallery" },
    ]);

    const res = await GET(makeGetRequest("user-001"));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.followedIds).toHaveLength(2);
    expect(body.followedIds).toContain("gallery-A");
    expect(body.followedIds).toContain("artist-B");
    expect(body.followedIds).not.toContain("gallery-C");
  });
});
