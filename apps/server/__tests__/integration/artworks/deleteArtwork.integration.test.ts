import { describe, it, expect, afterEach, vi } from "vitest";
import { Artworkuploads } from "@omenai/shared-models/models/artworks/UploadArtworkSchema";
import { RecentView } from "@omenai/shared-models/models/artworks/RecentlyViewed";
import { POST } from "../../../app/api/artworks/deleteArtwork/route";

// Appwrite and workflow mocks are specific to this route.
vi.mock("@omenai/appwrite-config/serverAppwrite", () => ({
  serverStorage: {
    deleteFile: vi.fn().mockResolvedValue(undefined),
  },
}));

vi.mock("@omenai/shared-lib/workflow_runs/createFailedWorkflowJobs", () => ({
  saveFailedJob: vi.fn().mockResolvedValue(undefined),
}));

// ── Fixtures ─────────────────────────────────────────────────────────────────

function makeArtwork(overrides: Record<string, any> = {}) {
  const uid = crypto.randomUUID();
  return {
    artist: "Test Artist",
    year: 2024,
    title: `Artwork ${uid}`,
    medium: "Oil on canvas",
    rarity: "unique",
    materials: "Canvas",
    dimensions: { height: "100", width: "80" },
    pricing: { price: 1000, usd_price: 1000, currency: "USD", shouldShowPrice: "yes" },
    author_id: "author-1",
    url: `appwrite-file-id-${uid}`,
    artist_birthyear: "1990",
    artist_country_origin: "Nigeria",
    certificate_of_authenticity: "yes",
    signature: "yes",
    packaging_type: "rolled",
    role_access: { role: "artist" },
    availability: true,
    ...overrides,
  };
}

function makeRequest(body: object): Request {
  return new Request("http://localhost/api/artworks/deleteArtwork", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("POST /api/artworks/deleteArtwork (integration)", () => {
  afterEach(async () => {
    await Artworkuploads.deleteMany({});
    await RecentView.deleteMany({});
  });

  it("deletes an existing artwork and returns 200", async () => {
    const created = await Artworkuploads.create(makeArtwork());

    const response = await POST(makeRequest({ art_id: created.art_id }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.message).toBe("Artwork successfully deleted");

    const still_exists = await Artworkuploads.findOne({ art_id: created.art_id });
    expect(still_exists).toBeNull();
  });

  it("also removes associated RecentView records on deletion", async () => {
    const created = await Artworkuploads.create(makeArtwork());
    await RecentView.create({
      artwork: created.title,
      artist: created.artist,
      user: "user-1",
      art_id: created.art_id,
      url: created.url,
    });

    await POST(makeRequest({ art_id: created.art_id }));

    const recentView = await RecentView.findOne({ art_id: created.art_id });
    expect(recentView).toBeNull();
  });

  it("returns 404 when artwork does not exist", async () => {
    const response = await POST(makeRequest({ art_id: "ghost-art-id" }));

    expect(response.status).toBe(404);
  });

  it("returns 400 when art_id is missing", async () => {
    const response = await POST(makeRequest({}));

    expect(response.status).toBe(400);
  });

  it("returns 400 when art_id is an empty string", async () => {
    const response = await POST(makeRequest({ art_id: "" }));

    expect(response.status).toBe(400);
  });
});
