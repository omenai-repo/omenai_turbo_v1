/**
 * Integration tests for POST /api/viewHistory/getViewHistory
 *
 * Key behaviours under test:
 * - Schema validation
 * - Returns at most 20 items
 * - Results are sorted newest-first
 * - Only returns records belonging to the queried user_id
 */

import { describe, it, expect, afterEach, beforeEach } from "vitest";
import { RecentView } from "@omenai/shared-models/models/artworks/RecentlyViewed";
import { POST } from "../../../app/api/viewHistory/getViewHistory/route";

// ── Helpers ──────────────────────────────────────────────────────────────────

function makeRequest(body: object) {
  return new Request("http://localhost/api/viewHistory/getViewHistory", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

function makeView(overrides: Record<string, any> = {}) {
  const uid = crypto.randomUUID();
  return {
    artwork: `Artwork ${uid}`,
    artist: `Artist ${uid}`,
    user: "user-history-001",
    art_id: `art-${uid}`,
    url: `https://cdn.example.com/${uid}.jpg`,
    ...overrides,
  };
}

// ── Cleanup ──────────────────────────────────────────────────────────────────

afterEach(async () => {
  await RecentView.deleteMany({});
});

// ── Validation ───────────────────────────────────────────────────────────────

describe("POST /api/viewHistory/getViewHistory — validation", () => {
  it("returns 400 when user_id is missing", async () => {
    const res = await POST(makeRequest({}));
    expect(res.status).toBe(400);
  });
});

// ── Empty history ────────────────────────────────────────────────────────────

describe("POST /api/viewHistory/getViewHistory — empty history", () => {
  it("returns 200 with an empty array when the user has no view history", async () => {
    const res = await POST(makeRequest({ user_id: "user-no-history" }));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.message).toBe("Successful");
    expect(body.data).toEqual([]);
  });
});

// ── Ordering ─────────────────────────────────────────────────────────────────

describe("POST /api/viewHistory/getViewHistory — ordering", () => {
  it("returns records sorted by createdAt descending (newest first)", async () => {
    const now = Date.now();
    await RecentView.create({ ...makeView({ user: "user-sort" }), createdAt: new Date(now - 3000) });
    await RecentView.create({ ...makeView({ user: "user-sort" }), createdAt: new Date(now - 1000) });
    await RecentView.create({ ...makeView({ user: "user-sort" }), createdAt: new Date(now - 2000) });

    const res = await POST(makeRequest({ user_id: "user-sort" }));
    const body = await res.json();

    const timestamps = body.data.map((v: any) => new Date(v.createdAt).getTime());
    expect(timestamps[0]).toBeGreaterThanOrEqual(timestamps[1]);
    expect(timestamps[1]).toBeGreaterThanOrEqual(timestamps[2]);
  });
});

// ── 20-item cap ──────────────────────────────────────────────────────────────

describe("POST /api/viewHistory/getViewHistory — 20-item cap", () => {
  it("returns at most 20 items even when more than 20 records exist", async () => {
    const views = Array.from({ length: 25 }, (_, i) =>
      makeView({ user: "user-cap", art_id: `art-cap-${i}` }),
    );
    await RecentView.insertMany(views);

    const res = await POST(makeRequest({ user_id: "user-cap" }));
    const body = await res.json();

    expect(body.data).toHaveLength(20);
  });
});

// ── Isolation ────────────────────────────────────────────────────────────────

describe("POST /api/viewHistory/getViewHistory — user isolation", () => {
  it("does not return records belonging to other users", async () => {
    await RecentView.create(makeView({ user: "user-alice", art_id: "art-alice-1" }));
    await RecentView.create(makeView({ user: "user-bob", art_id: "art-bob-1" }));
    await RecentView.create(makeView({ user: "user-alice", art_id: "art-alice-2" }));

    const res = await POST(makeRequest({ user_id: "user-alice" }));
    const body = await res.json();

    expect(body.data).toHaveLength(2);
    expect(body.data.every((v: any) => v.user === "user-alice")).toBe(true);
  });

  it("returns correct count when the user has exactly one view record", async () => {
    await RecentView.create(makeView({ user: "user-single" }));

    const res = await POST(makeRequest({ user_id: "user-single" }));
    const body = await res.json();

    expect(body.data).toHaveLength(1);
    expect(body.data[0].user).toBe("user-single");
  });
});
