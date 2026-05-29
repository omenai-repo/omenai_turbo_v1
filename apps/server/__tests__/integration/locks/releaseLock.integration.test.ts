import { describe, it, expect, afterEach, vi } from "vitest";
import { LockMechanism } from "@omenai/shared-models/models/lock/LockSchema";
import { Artworkuploads } from "@omenai/shared-models/models/artworks/UploadArtworkSchema";
import { POST } from "../../../app/api/locks/releaseLock/route";

// ── Fixtures ─────────────────────────────────────────────────────────────────

function makeLock(overrides: Record<string, any> = {}) {
  return { user_id: "user-001", art_id: "art-001", ...overrides };
}

function makeRequest(body: object): Request {
  return new Request("http://localhost/api/locks/releaseLock", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("POST /api/locks/releaseLock (integration)", () => {
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

  it("returns 200 with message 'Lock released' and removes the lock from DB", async () => {
    await LockMechanism.create(makeLock());

    const response = await POST(makeRequest({ user_id: "user-001", art_id: "art-001" }));
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.message).toBe("Lock released");

    const remaining = await LockMechanism.findOne({ user_id: "user-001", art_id: "art-001" });
    expect(remaining).toBeNull();
  });

  it("returns 200 with message 'Lock released' even when no lock exists (deleteOne returns truthy object)", async () => {
    const response = await POST(makeRequest({ user_id: "user-001", art_id: "art-001" }));
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.message).toBe("Lock released");
  });
});
