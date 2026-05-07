import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@omenai/shared-lib/auth/middleware/combined_middleware", () => ({
  withRateLimitHighlightAndCsrf: () => (fn: any) => fn,
}));

vi.mock("@omenai/shared-lib/auth/configs/rate_limit_configs", () => ({
  strictRateLimit: {},
  standardRateLimit: {},
}));

vi.mock("@omenai/shared-lib/mongo_connect/mongoConnect", () => ({
  connectMongoDB: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@omenai/shared-models/models/auth/GallerySchema", () => ({
  AccountGallery: { findOneAndUpdate: vi.fn() },
}));

vi.mock("../../../../app/api/util", () => ({
  createErrorRollbarReport: vi.fn(),
}));

import { POST } from "../../../../app/api/update/gallery/profile/route";
import { AccountGallery } from "@omenai/shared-models/models/auth/GallerySchema";

const mockUpdatedGallery = { gallery_id: "gallery-1", name: "New Gallery Name" };

function makeRequest(body: object): Request {
  return new Request("http://localhost/api/update/gallery/profile", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/update/gallery/profile", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(AccountGallery.findOneAndUpdate).mockResolvedValue(mockUpdatedGallery as any);
  });

  it("returns 200 with updated data when profile update succeeds", async () => {
    const response = await POST(makeRequest({ id: "gallery-1", name: "New Gallery Name" }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.message).toBe("Profile data updated");
    expect(body.data).toEqual(mockUpdatedGallery);
    expect(AccountGallery.findOneAndUpdate).toHaveBeenCalledWith(
      { gallery_id: "gallery-1" },
      { $set: expect.objectContaining({ id: "gallery-1" }) },
    );
  });

  it("returns 500 when gallery not found", async () => {
    vi.mocked(AccountGallery.findOneAndUpdate).mockResolvedValue(null);

    const response = await POST(makeRequest({ id: "ghost-gallery", name: "Name" }));
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.message).toMatch(/unexpected error/i);
  });
});
