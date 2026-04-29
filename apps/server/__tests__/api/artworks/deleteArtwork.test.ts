import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@omenai/shared-lib/auth/middleware/combined_middleware", () => ({
  withRateLimitHighlightAndCsrf: () => (fn: any) => fn,
}));
vi.mock("@omenai/shared-lib/auth/configs/rate_limit_configs", () => ({
  strictRateLimit: {},
}));
vi.mock("@omenai/shared-lib/mongo_connect/mongoConnect", () => ({
  connectMongoDB: vi.fn().mockResolvedValue(undefined),
}));
vi.mock("@omenai/shared-models/models/artworks/UploadArtworkSchema", () => ({
  Artworkuploads: { findOne: vi.fn(), deleteOne: vi.fn() },
}));
vi.mock("@omenai/shared-models/models/artworks/RecentlyViewed", () => ({
  RecentView: { deleteMany: vi.fn() },
}));
vi.mock("@omenai/appwrite-config/serverAppwrite", () => ({
  serverStorage: {
    deleteFile: vi.fn().mockResolvedValue(undefined),
  },
}));
vi.mock("@omenai/upstash-config", () => ({
  redis: { del: vi.fn().mockResolvedValue(undefined) },
}));
vi.mock("@omenai/shared-lib/workflow_runs/createFailedWorkflowJobs", () => ({
  saveFailedJob: vi.fn().mockResolvedValue(undefined),
}));
vi.mock("../../../app/api/util", async () => {
  const { buildValidateRequestBodyMock } = await import("../../helpers/util-mock");
  return buildValidateRequestBodyMock();
});

import { POST } from "../../../app/api/artworks/deleteArtwork/route";
import { Artworkuploads } from "@omenai/shared-models/models/artworks/UploadArtworkSchema";
import { RecentView } from "@omenai/shared-models/models/artworks/RecentlyViewed";
import { redis } from "@omenai/upstash-config";

const mockArtwork = { art_id: "art-123", url: "file-id-xyz" };

function makeRequest(body: object): Request {
  return new Request("http://localhost/api/artworks/deleteArtwork", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

function mockFindOne(value: any) {
  vi.mocked(Artworkuploads.findOne).mockReturnValue({
    exec: vi.fn().mockResolvedValue(value),
  } as any);
}

function mockDeleteOne(deletedCount: number) {
  vi.mocked(Artworkuploads.deleteOne).mockReturnValue({
    exec: vi.fn().mockResolvedValue({ deletedCount }),
  } as any);
}

function mockRecentViewDelete() {
  vi.mocked(RecentView.deleteMany).mockReturnValue({
    exec: vi.fn().mockResolvedValue(undefined),
  } as any);
}

describe("POST /api/artworks/deleteArtwork", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFindOne(mockArtwork);
    mockDeleteOne(1);
    mockRecentViewDelete();
  });

  it("returns 200 when artwork is successfully deleted", async () => {
    const response = await POST(makeRequest({ art_id: "art-123" }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.message).toBe("Artwork successfully deleted");
  });

  it("removes the artwork from the Redis cache", async () => {
    await POST(makeRequest({ art_id: "art-123" }));

    expect(redis.del).toHaveBeenCalledWith("artwork:art-123");
  });

  it("also deletes recent view records for the artwork", async () => {
    await POST(makeRequest({ art_id: "art-123" }));

    expect(RecentView.deleteMany).toHaveBeenCalledWith({ art_id: "art-123" });
  });

  it("returns 404 when artwork is not found", async () => {
    mockFindOne(null);

    const response = await POST(makeRequest({ art_id: "missing-art" }));
    const body = await response.json();

    expect(response.status).toBe(404);
    expect(body.message).toBe("Artwork not found");
  });

  it("returns 500 when deleteOne reports deletedCount of 0", async () => {
    mockDeleteOne(0);

    const response = await POST(makeRequest({ art_id: "art-123" }));
    const body = await response.json();

    expect(response.status).toBe(500);
  });

  it("returns 400 when art_id is missing", async () => {
    const response = await POST(makeRequest({}));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.message).toMatch(/Validation Failed/i);
  });
});
