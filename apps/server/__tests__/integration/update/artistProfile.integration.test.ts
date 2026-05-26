/**
 * Integration tests for POST /api/update/artist/profile
 *
 * The route performs an `updateOne({ artist_id: data.id }, { $set: { ...data } })`.
 * Because `updateOne` always returns a truthy `UpdateResult` object, the route
 * always returns 200 — even when no document is matched.  Tests verify both
 * the happy-path DB mutation and this no-match behaviour.
 */

import { describe, it, expect, afterEach } from "vitest";
import { AccountArtist } from "@omenai/shared-models/models/auth/ArtistSchema";
import { POST } from "../../../app/api/update/artist/profile/route";

// ── Helpers ──────────────────────────────────────────────────────────────────

function makeRequest(body: object) {
  return new Request("http://localhost/api/update/artist/profile", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

function makeArtist(overrides: Record<string, any> = {}) {
  const uid = Math.random().toString(36).slice(2, 10);
  return {
    name: `Test Artist ${uid}`,
    profile_status: "ghost" as const,
    artist_id: `artist-${uid}`,
    documentation: { cv: "", socials: { instagram: "", twitter: "", facebook: "", linkedin: "" } },
    ...overrides,
  };
}

// ── Cleanup ──────────────────────────────────────────────────────────────────

afterEach(async () => {
  await AccountArtist.deleteMany({});
});

// ── No matching artist ────────────────────────────────────────────────────────

describe("POST /api/update/artist/profile — no matching artist", () => {
  it("returns 200 even when the artist_id does not exist in the DB", async () => {
    // Note: updateOne on a non-existent document does not throw — it returns
    // { matchedCount: 0, modifiedCount: 0 }.  The route interprets this as success
    // because `!updateResult` is always false for a MongoDB UpdateResult.
    const res = await POST(makeRequest({ id: "non-existent-artist", name: "Ghost Artist" }));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.message).toBe("Artist Profile data updated");
  });
});

// ── Successful update ────────────────────────────────────────────────────────

describe("POST /api/update/artist/profile — successful update", () => {
  it("updates the artist's name when a valid artist_id is provided", async () => {
    const artist = await AccountArtist.create(makeArtist({ name: "Original Name" }));

    const res = await POST(makeRequest({ id: artist.artist_id, name: "Updated Name" }));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.message).toBe("Artist Profile data updated");

    const updated = await AccountArtist.findOne({ artist_id: artist.artist_id });
    expect(updated!.name).toBe("Updated Name");
  });

  it("updates the bio field without affecting other fields", async () => {
    const artist = await AccountArtist.create(makeArtist({ name: "Kwame Asante", bio: "Original bio" }));

    await POST(makeRequest({ id: artist.artist_id, bio: "New compelling bio about my art journey" }));

    const updated = await AccountArtist.findOne({ artist_id: artist.artist_id });
    expect(updated!.bio).toBe("New compelling bio about my art journey");
    expect(updated!.name).toBe("Kwame Asante"); // unchanged
  });

  it("can update multiple fields in a single request", async () => {
    const artist = await AccountArtist.create(makeArtist({ name: "Fatima Al-Rashid" }));

    await POST(makeRequest({
      id: artist.artist_id,
      name: "Fatima Al-Rashid Updated",
      bio: "Multi-media artist",
      phone: "+2347012345678",
    }));

    const updated = await AccountArtist.findOne({ artist_id: artist.artist_id });
    expect(updated!.name).toBe("Fatima Al-Rashid Updated");
    expect(updated!.bio).toBe("Multi-media artist");
    expect(updated!.phone).toBe("+2347012345678");
  });

  it("sets isOnboardingCompleted to true when included in the payload", async () => {
    const artist = await AccountArtist.create(makeArtist({ isOnboardingCompleted: false }));

    await POST(makeRequest({ id: artist.artist_id, isOnboardingCompleted: true }));

    const updated = await AccountArtist.findOne({ artist_id: artist.artist_id });
    expect(updated!.isOnboardingCompleted).toBe(true);
  });

  it("does not modify other artists when targeting a specific artist_id", async () => {
    const artistA = await AccountArtist.create(makeArtist({ name: "Artist A" }));
    const artistB = await AccountArtist.create(makeArtist({ name: "Artist B" }));

    await POST(makeRequest({ id: artistA.artist_id, name: "Artist A — Updated" }));

    const b = await AccountArtist.findOne({ artist_id: artistB.artist_id });
    expect(b!.name).toBe("Artist B"); // should be untouched
  });

  it("returns a data field in the response body alongside the message", async () => {
    const artist = await AccountArtist.create(makeArtist());

    const res = await POST(makeRequest({ id: artist.artist_id, name: "Response Check" }));
    const body = await res.json();

    expect(body).toHaveProperty("data");
  });
});
