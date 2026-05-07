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
  Artworkuploads: { findOne: vi.fn(), findOneAndUpdate: vi.fn() },
}));
vi.mock("@omenai/shared-models/models/orders/CreateOrderSchema", () => ({
  CreateOrder: { updateMany: vi.fn().mockResolvedValue(undefined) },
}));
vi.mock("@omenai/shared-utils/src/addDaysToDate", () => ({
  addDaysToDate: vi.fn().mockReturnValue(new Date("2026-07-15")),
}));
vi.mock("@omenai/upstash-config", () => ({
  redis: { set: vi.fn().mockResolvedValue(undefined) },
}));
vi.mock("../../../app/api/util", async () => {
  const { buildValidateRequestBodyMock } = await import("../../helpers/util-mock");
  return buildValidateRequestBodyMock();
});

import { PUT } from "../../../app/api/artworks/extendArtworkExclusivity/route";
import { Artworkuploads } from "@omenai/shared-models/models/artworks/UploadArtworkSchema";

const mockArtwork = { art_id: "art-123", exclusivity_status: {} };
const mockUpdatedArtwork = { art_id: "art-123", exclusivity_status: { exclusivity_type: "exclusive" } };

function makeRequest(body: object): Request {
  return new Request("http://localhost/api/artworks/extendArtworkExclusivity", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

function mockFindOneLean(value: any) {
  vi.mocked(Artworkuploads.findOne).mockReturnValue({
    lean: vi.fn().mockResolvedValue(value),
  } as any);
}

describe("PUT /api/artworks/extendArtworkExclusivity", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFindOneLean(mockArtwork);
    vi.mocked(Artworkuploads.findOneAndUpdate).mockResolvedValue(mockUpdatedArtwork as any);
  });

  it("returns 200 when exclusivity is successfully extended", async () => {
    const response = await PUT(makeRequest({ art_id: "art-123" }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.message).toBe("Exclusivity period extended for 90 days");
  });

  it("sets exclusivity_type to exclusive and updates end date", async () => {
    await PUT(makeRequest({ art_id: "art-123" }));

    expect(Artworkuploads.findOneAndUpdate).toHaveBeenCalledWith(
      { art_id: "art-123" },
      expect.objectContaining({
        $set: expect.objectContaining({
          "exclusivity_status.exclusivity_type": "exclusive",
        }),
      }),
      { new: true },
    );
  });

  it("returns 400 when artwork is not found", async () => {
    mockFindOneLean(null);

    const response = await PUT(makeRequest({ art_id: "missing-art" }));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.message).toBe("Artwork not found");
  });

  it("returns 500 when findOneAndUpdate returns null", async () => {
    vi.mocked(Artworkuploads.findOneAndUpdate).mockResolvedValue(null as any);

    const response = await PUT(makeRequest({ art_id: "art-123" }));

    expect(response.status).toBe(500);
  });

  it("returns 400 when art_id is missing", async () => {
    const response = await PUT(makeRequest({}));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.message).toMatch(/Validation Failed/i);
  });
});
