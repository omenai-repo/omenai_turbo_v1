/**
 * Integration tests for POST /api/auth/waitlist/createWaitlistUser
 *
 * Seeds Waitlist, AccountArtist, and AccountGallery documents and verifies the
 * route correctly adds users to the waitlist against the real in-memory MongoDB
 * instance. The email utility is mocked so tests remain fast and deterministic.
 */

import { describe, it, expect, afterEach, vi } from "vitest";
import { Waitlist } from "@omenai/shared-models/models/auth/WaitlistSchema";
import { AccountArtist } from "@omenai/shared-models/models/auth/ArtistSchema";
import { AccountGallery } from "@omenai/shared-models/models/auth/GallerySchema";

// ── Module-level mocks ───────────────────────────────────────────────────────

vi.mock(
  "@omenai/shared-emails/src/models/waitlist/SendWaitlistRegistrationEmail",
  () => ({
    SendWaitlistRegistrationEmail: vi.fn().mockResolvedValue(undefined),
  }),
);

import { POST } from "../../../../app/api/auth/waitlist/createWaitlistUser/route";

// ── Fixture factory ───────────────────────────────────────────────────────────

function makeRequest(body: object): Request {
  return new Request(
    "http://localhost/api/auth/waitlist/createWaitlistUser",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    },
  );
}

// ── Cleanup ───────────────────────────────────────────────────────────────────

afterEach(async () => {
  await Waitlist.deleteMany({});
  await AccountArtist.deleteMany({});
  await AccountGallery.deleteMany({});
  vi.clearAllMocks();
});

// ── Validation ────────────────────────────────────────────────────────────────

describe("POST /api/auth/waitlist/createWaitlistUser — validation", () => {
  it("returns 400 when name is missing", async () => {
    const res = await POST(
      makeRequest({ email: "test@test.com", entity: "artist" }),
    );
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.message).toBeTruthy();
  });

  it("returns 400 when email is invalid", async () => {
    const res = await POST(
      makeRequest({ name: "Test", email: "not-an-email", entity: "artist" }),
    );
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.message).toBeTruthy();
  });

  it("returns 400 when entity is invalid", async () => {
    const res = await POST(
      makeRequest({ name: "Test", email: "test@test.com", entity: "admin" }),
    );
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.message).toBeTruthy();
  });
});

// ── Conflict ─────────────────────────────────────────────────────────────────

describe("POST /api/auth/waitlist/createWaitlistUser — conflict", () => {
  it("returns 403 when user is already an artist on the platform", async () => {
    await AccountArtist.create({
      name: "Existing Artist",
      email: "artist@test.com",
      password: "x",
      artist_id: "a-001",
      logo: "l.jpg",
      verified: false,
      artist_verified: false,
      role: "artist",
      art_style: [],
      address: { city: "NY", country: "US" },
      documentation: {
        cv: "",
        socials: { instagram: "", twitter: "", facebook: "", linkedin: "" },
      },
    });

    const res = await POST(
      makeRequest({ name: "Test", email: "artist@test.com", entity: "artist" }),
    );
    const body = await res.json();

    expect(res.status).toBe(403);
    expect(body.message).toBeTruthy();
  });

  it("returns 403 when user is already on the waitlist", async () => {
    await Waitlist.create({
      name: "Test",
      email: "existing@test.com",
      entity: "artist",
    });

    const res = await POST(
      makeRequest({
        name: "Test",
        email: "existing@test.com",
        entity: "artist",
      }),
    );
    const body = await res.json();

    expect(res.status).toBe(403);
    expect(body.message).toBeTruthy();
  });
});

// ── Successful registration ───────────────────────────────────────────────────

describe("POST /api/auth/waitlist/createWaitlistUser — successful registration", () => {
  it("returns 201 when user is successfully added to waitlist", async () => {
    const res = await POST(
      makeRequest({ name: "New User", email: "new@test.com", entity: "artist" }),
    );
    const body = await res.json();

    expect(res.status).toBe(201);
    expect(body.message).toBe("Successfully added to waitlist");
  });

  it("persists the waitlist entry in the database", async () => {
    await POST(
      makeRequest({ name: "New User", email: "new@test.com", entity: "artist" }),
    );

    const entry = await Waitlist.findOne({ email: "new@test.com" });
    expect(entry).not.toBeNull();
  });
});
