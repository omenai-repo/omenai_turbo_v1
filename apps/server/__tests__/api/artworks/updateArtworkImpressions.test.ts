import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@omenai/shared-lib/auth/middleware/combined_middleware", () => ({
  withRateLimitHighlightAndCsrf: () => (fn: any) => fn,
}));
vi.mock("@omenai/shared-lib/auth/configs/rate_limit_configs", () => ({
  lenientRateLimit: {},
}));
vi.mock("@omenai/shared-lib/mongo_connect/mongoConnect", () => ({
  connectMongoDB: vi.fn().mockResolvedValue(undefined),
}));
vi.mock("@omenai/shared-models/models/artworks/UploadArtworkSchema", () => ({
  Artworkuploads: { updateOne: vi.fn() },
}));
vi.mock("../../../app/api/util", async () => {
  const { buildValidateRequestBodyMock } = await import("../../helpers/util-mock");
  return buildValidateRequestBodyMock();
});

import { POST } from "../../../app/api/artworks/updateArtworkImpressions/route";
import { Artworkuploads } from "@omenai/shared-models/models/artworks/UploadArtworkSchema";

function makeRequest(body: object): Request {
  return new Request("http://localhost/api/artworks/updateArtworkImpressions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/artworks/updateArtworkImpressions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(Artworkuploads.updateOne).mockResolvedValue({ modifiedCount: 1 } as any);
  });

  it("returns 200 and increments impressions when value is true", async () => {
    const response = await POST(makeRequest({ id: "art-123", value: true, like_id: "user-1" }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.message).toBe("Successful");
    expect(Artworkuploads.updateOne).toHaveBeenCalledWith(
      { art_id: "art-123" },
      { $inc: { impressions: 1 } },
    );
  });

  it("decrements impressions when value is false", async () => {
    await POST(makeRequest({ id: "art-123", value: false, like_id: "user-1" }));

    expect(Artworkuploads.updateOne).toHaveBeenCalledWith(
      { art_id: "art-123" },
      { $inc: { impressions: -1 } },
    );
  });

  it("pushes like_id to like_IDs when value is true", async () => {
    await POST(makeRequest({ id: "art-123", value: true, like_id: "user-1" }));

    expect(Artworkuploads.updateOne).toHaveBeenCalledWith(
      { art_id: "art-123" },
      { $push: { like_IDs: "user-1" } },
    );
  });

  it("pulls like_id from like_IDs when value is false", async () => {
    await POST(makeRequest({ id: "art-123", value: false, like_id: "user-1" }));

    expect(Artworkuploads.updateOne).toHaveBeenCalledWith(
      { art_id: "art-123" },
      { $pull: { like_IDs: "user-1" } },
    );
  });

  it("returns 500 when impression update finds no matching document", async () => {
    vi.mocked(Artworkuploads.updateOne).mockResolvedValue({ modifiedCount: 0 } as any);

    const response = await POST(makeRequest({ id: "art-123", value: true, like_id: "user-1" }));
    const body = await response.json();

    expect(response.status).toBe(500);
  });

  it("returns 400 when id is missing", async () => {
    const response = await POST(makeRequest({ value: true, like_id: "user-1" }));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.message).toMatch(/Validation Failed/i);
  });
});
