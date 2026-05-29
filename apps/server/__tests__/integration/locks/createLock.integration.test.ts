import { describe, it, expect, afterEach, vi } from "vitest";
import { LockMechanism } from "@omenai/shared-models/models/lock/LockSchema";
import { Artworkuploads } from "@omenai/shared-models/models/artworks/UploadArtworkSchema";
import { POST } from "../../../app/api/locks/createLock/route";

// ── Fixtures ─────────────────────────────────────────────────────────────────

function makeLock(overrides: Record<string, any> = {}) {
  return { user_id: "user-001", art_id: "art-001", ...overrides };
}

function makeArtwork(overrides: Record<string, any> = {}) {
  const uid = crypto.randomUUID();
  return {
    art_id: `art-${uid}`,
    title: `Test Art ${uid}`,
    artist: "Test Artist",
    author_id: `artist-${uid}`,
    url: `https://img.test/${uid}.jpg`,
    medium: "oil",
    rarity: "unique",
    materials: "Canvas",
    availability: true,
    role_access: { role: "artist" },
    like_IDs: [],
    pricing: { price: 500, usd_price: 500, currency: "USD", shouldShowPrice: "yes" },
    dimensions: { width: "50", height: "70" },
    packaging_type: "rolled",
    year: 2024,
    artist_birthyear: "1980",
    artist_country_origin: "Nigeria",
    certificate_of_authenticity: "yes",
    signature: "yes",
    ...overrides,
  };
}

function makeRequest(body: object): Request {
  return new Request("http://localhost/api/locks/createLock", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("POST /api/locks/createLock (integration)", () => {
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

  it("returns 403 when the artwork is not available (already purchased)", async () => {
    const artwork = await Artworkuploads.create(makeArtwork({ availability: false }));

    const response = await POST(makeRequest({ user_id: "user-001", art_id: artwork.art_id }));
    const json = await response.json();

    expect(response.status).toBe(403);
    expect(json.message).toMatch(/purchased by another collector/i);
  });

  it("returns 200 with existing lock info when a lock is already active for the artwork", async () => {
    const artwork = await Artworkuploads.create(makeArtwork({ availability: true }));
    await LockMechanism.create(makeLock({ art_id: artwork.art_id, user_id: "other-user" }));

    const response = await POST(makeRequest({ user_id: "user-001", art_id: artwork.art_id }));
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.message).toMatch(/currently processing/i);
  });

  it("returns 200 with message 'Purchase Lock acquired' and creates a lock in DB", async () => {
    const artwork = await Artworkuploads.create(makeArtwork({ availability: true }));

    const response = await POST(makeRequest({ user_id: "user-001", art_id: artwork.art_id }));
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.message).toBe("Purchase Lock acquired");
    expect(json.data.lock_data).toBeTruthy();

    const lockInDb = await LockMechanism.findOne({ art_id: artwork.art_id });
    expect(lockInDb).not.toBeNull();
    expect(lockInDb!.user_id).toBe("user-001");
  });
});
