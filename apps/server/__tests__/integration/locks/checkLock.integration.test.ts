import { describe, it, expect, afterEach, vi } from "vitest";
import { LockMechanism } from "@omenai/shared-models/models/lock/LockSchema";
import { Artworkuploads } from "@omenai/shared-models/models/artworks/UploadArtworkSchema";
import { POST } from "../../../app/api/locks/checkLock/route";

// ── Fixtures ─────────────────────────────────────────────────────────────────

function makeLock(overrides: Record<string, any> = {}) {
  return { user_id: "user-001", art_id: "art-001", ...overrides };
}

function makeRequest(body: object): Request {
  return new Request("http://localhost/api/locks/checkLock", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("POST /api/locks/checkLock (integration)", () => {
  afterEach(async () => {
    await LockMechanism.deleteMany({});
    await Artworkuploads.deleteMany({});
    vi.clearAllMocks();
  });

  it("returns 400 when user_id is missing", async () => {
    const response = await POST(makeRequest({ art_id: "art-001" }));

    expect(response.status).toBe(400);
  });

  it("returns 400 when art_id is missing", async () => {
    const response = await POST(makeRequest({ user_id: "user-001" }));

    expect(response.status).toBe(400);
  });

  it("returns 200 with locked: false and correct message when no lock exists for the art_id", async () => {
    const response = await POST(makeRequest({ user_id: "current-user", art_id: "art-001" }));
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.data.locked).toBe(false);
    expect(json.message).toBe("No lock is present");
  });

  it("returns 200 with locked: true when lock is held by a different user", async () => {
    await LockMechanism.create(makeLock({ user_id: "other-user", art_id: "art-001" }));

    const response = await POST(makeRequest({ user_id: "current-user", art_id: "art-001" }));
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.data.locked).toBe(true);
    expect(json.message).toMatch(/another user/i);
  });

  it("returns 200 with locked: false when lock is held by the requesting user", async () => {
    await LockMechanism.create(makeLock({ user_id: "current-user", art_id: "art-001" }));

    const response = await POST(makeRequest({ user_id: "current-user", art_id: "art-001" }));
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.data.locked).toBe(false);
    expect(json.message).toMatch(/current user/i);
  });
});
