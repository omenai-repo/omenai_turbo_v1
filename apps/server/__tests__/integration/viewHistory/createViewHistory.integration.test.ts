/**
 * Integration tests for POST /api/viewHistory/createViewHistory
 *
 * Key behaviours under test:
 * - Schema validation (missing required fields)
 * - Deduplication: a second view of the same artwork by the same user is silently ignored
 * - Cross-user isolation: the same artwork viewed by two different users creates two records
 * - The created record stores all payload fields correctly
 */

import { describe, it, expect, afterEach } from "vitest";
import { RecentView } from "@omenai/shared-models/models/artworks/RecentlyViewed";
import { POST } from "../../../app/api/viewHistory/createViewHistory/route";

// ── Helpers ──────────────────────────────────────────────────────────────────

function makeRequest(body: object) {
  return new Request("http://localhost/api/viewHistory/createViewHistory", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

function makePayload(overrides: Record<string, any> = {}) {
  const uid = crypto.randomUUID();
  return {
    artwork: `Artwork Title ${uid}`,
    user_id: `user-${uid}`,
    art_id: `art-${uid}`,
    artist: `Artist Name ${uid}`,
    url: `https://cdn.example.com/${uid}.jpg`,
    ...overrides,
  };
}

// ── Cleanup ──────────────────────────────────────────────────────────────────

afterEach(async () => {
  await RecentView.deleteMany({});
});

// ── Validation ───────────────────────────────────────────────────────────────

describe("POST /api/viewHistory/createViewHistory — validation", () => {
  it("returns 400 when artwork field is missing", async () => {
    const { artwork, ...partial } = makePayload();
    const res = await POST(makeRequest(partial));
    expect(res.status).toBe(400);
    expect(await RecentView.countDocuments({})).toBe(0);
  });

  it("returns 400 when user_id field is missing", async () => {
    const { user_id, ...partial } = makePayload();
    const res = await POST(makeRequest(partial));
    expect(res.status).toBe(400);
  });

  it("returns 400 when art_id field is missing", async () => {
    const { art_id, ...partial } = makePayload();
    const res = await POST(makeRequest(partial));
    expect(res.status).toBe(400);
  });

  it("returns 400 when artist field is missing", async () => {
    const { artist, ...partial } = makePayload();
    const res = await POST(makeRequest(partial));
    expect(res.status).toBe(400);
  });

  it("returns 400 when url field is missing", async () => {
    const { url, ...partial } = makePayload();
    const res = await POST(makeRequest(partial));
    expect(res.status).toBe(400);
  });

  it("returns 400 for an entirely empty payload", async () => {
    const res = await POST(makeRequest({}));
    expect(res.status).toBe(400);
  });
});

// ── Successful creation ──────────────────────────────────────────────────────

describe("POST /api/viewHistory/createViewHistory — successful creation", () => {
  it("returns 200 and creates a RecentView record for a new artwork-user pair", async () => {
    const payload = makePayload();

    const res = await POST(makeRequest(payload));

    expect(res.status).toBe(200);

    const record = await RecentView.findOne({ art_id: payload.art_id, user: payload.user_id });
    expect(record).not.toBeNull();
    expect(record!.artwork).toBe(payload.artwork);
    expect(record!.artist).toBe(payload.artist);
    expect(record!.url).toBe(payload.url);
  });

  it("stores user_id as the 'user' field on the RecentView document", async () => {
    const payload = makePayload({ user_id: "collector-007" });
    await POST(makeRequest(payload));

    const record = await RecentView.findOne({ art_id: payload.art_id });
    expect(record!.user).toBe("collector-007");
  });
});

// ── Deduplication ────────────────────────────────────────────────────────────

describe("POST /api/viewHistory/createViewHistory — deduplication", () => {
  it("returns 200 but does NOT create a duplicate when the same user views the same artwork twice", async () => {
    const payload = makePayload({ user_id: "user-dedup", art_id: "art-dedup" });

    await POST(makeRequest(payload));
    const res2 = await POST(makeRequest(payload));

    expect(res2.status).toBe(200);

    const count = await RecentView.countDocuments({ art_id: "art-dedup", user: "user-dedup" });
    expect(count).toBe(1);
  });

  it("creates separate records when two different users view the same artwork", async () => {
    const artId = "art-shared-001";
    await POST(makeRequest(makePayload({ user_id: "user-alpha", art_id: artId })));
    await POST(makeRequest(makePayload({ user_id: "user-beta", art_id: artId })));

    const count = await RecentView.countDocuments({ art_id: artId });
    expect(count).toBe(2);
  });

  it("creates separate records when the same user views two different artworks", async () => {
    const userId = "user-explorer";
    await POST(makeRequest(makePayload({ user_id: userId, art_id: "art-X" })));
    await POST(makeRequest(makePayload({ user_id: userId, art_id: "art-Y" })));

    const count = await RecentView.countDocuments({ user: userId });
    expect(count).toBe(2);
  });
});
