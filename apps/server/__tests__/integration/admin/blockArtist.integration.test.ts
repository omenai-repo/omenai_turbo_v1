/**
 * Integration tests for POST /api/admin/block_artist
 *
 * Seeds AccountArtist documents into the in-memory MongoDB instance and
 * verifies that the route correctly updates artist status. Email delivery is
 * mocked so no real emails are sent.
 */

import { describe, it, expect, afterEach, vi } from "vitest";
import { AccountArtist } from "@omenai/shared-models/models/auth/ArtistSchema";

// ── Module-level mocks ───────────────────────────────────────────────────────

vi.mock(
  "@omenai/shared-emails/src/models/artist/sendArtistBlockedMail",
  () => ({
    sendArtistBlockedMail: vi.fn().mockResolvedValue(undefined),
  }),
);

import { POST } from "../../../app/api/admin/block_artist/route";
import { sendArtistBlockedMail } from "@omenai/shared-emails/src/models/artist/sendArtistBlockedMail";

// ── Fixture factory ──────────────────────────────────────────────────────────

function makeArtist(overrides: Record<string, any> = {}) {
  return {
    name: "Test Artist",
    email: "artist@test.com",
    password: "x",
    artist_id: "artist-001",
    logo: "logo.jpg",
    verified: false,
    artist_verified: false,
    role: "artist",
    art_style: [],
    address: { city: "NY", country: "US" },
    bio: "bio",
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
  return new Request("http://localhost/api/admin/block_artist", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

// ── Cleanup ───────────────────────────────────────────────────────────────────

afterEach(async () => {
  await AccountArtist.deleteMany({});
  vi.clearAllMocks();
});

// ── Validation ────────────────────────────────────────────────────────────────

describe("POST /api/admin/block_artist — validation", () => {
  it("returns 400 when required fields are missing", async () => {
    const res = await POST(makeRequest({}));
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.message).toMatch(/Validation Failed/i);
  });
});

// ── Not found / server error ──────────────────────────────────────────────────

describe("POST /api/admin/block_artist — not found", () => {
  it("returns 500 when artist_id does not match any artist", async () => {
    // No artist seeded — modifiedCount will be 0 → ServerError
    const res = await POST(
      makeRequest({ artist_id: "nonexistent-artist", status: "blocked" }),
    );
    const body = await res.json();

    expect(res.status).toBe(500);
  });
});

// ── Happy path ────────────────────────────────────────────────────────────────

describe("POST /api/admin/block_artist — success", () => {
  it("returns 200 and updates artist status", async () => {
    await AccountArtist.create(makeArtist({ artist_id: "artist-001" }));

    const res = await POST(
      makeRequest({ artist_id: "artist-001", status: "blocked" }),
    );
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.message).toBe("Artist status updated");
  });

  it("persists the new status in the database", async () => {
    await AccountArtist.create(makeArtist({ artist_id: "artist-001" }));

    await POST(makeRequest({ artist_id: "artist-001", status: "blocked" }));

    const updated = await AccountArtist.findOne({ artist_id: "artist-001" });
    expect(updated!.status).toBe("blocked");
  });

  it("calls sendArtistBlockedMail with the artist email and name", async () => {
    await AccountArtist.create(makeArtist({ artist_id: "artist-001" }));

    await POST(makeRequest({ artist_id: "artist-001", status: "blocked" }));

    expect(sendArtistBlockedMail).toHaveBeenCalledWith(
      expect.objectContaining({
        email: "artist@test.com",
        name: "Test Artist",
      }),
    );
  });
});
