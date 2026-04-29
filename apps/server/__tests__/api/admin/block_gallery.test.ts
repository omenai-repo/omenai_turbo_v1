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

vi.mock("@omenai/shared-models/models/auth/GallerySchema", () => ({
  AccountGallery: {
    findOne: vi.fn(),
    updateOne: vi.fn(),
  },
}));

vi.mock(
  "@omenai/shared-emails/src/models/gallery/sendGalleryBlockedEmail",
  () => ({
    sendGalleryBlockedEmail: vi.fn().mockResolvedValue(undefined),
  }),
);

vi.mock("../../../app/api/util", async () => {
  const { buildValidateRequestBodyMock } = await import("../../helpers/util-mock");
  return buildValidateRequestBodyMock();
});

import { POST } from "../../../app/api/admin/block_gallery/route";
import { AccountGallery } from "@omenai/shared-models/models/auth/GallerySchema";
import { sendGalleryBlockedEmail } from "@omenai/shared-emails/src/models/gallery/sendGalleryBlockedEmail";

function makeRequest(body: object): Request {
  return new Request("http://localhost/api/admin/block_gallery", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

const mockGallery = { name: "Test Gallery", email: "gallery@example.com" };

describe("POST /api/admin/block_gallery", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(AccountGallery.findOne).mockResolvedValue(mockGallery);
    vi.mocked(AccountGallery.updateOne).mockResolvedValue({
      modifiedCount: 1,
    } as any);
  });

  it("returns 200 when gallery status is updated", async () => {
    const response = await POST(
      makeRequest({ gallery_id: "gallery-123", status: "blocked" }),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.message).toBe("Gallery status updated");
    expect(sendGalleryBlockedEmail).toHaveBeenCalledWith({
      name: mockGallery.name,
      email: mockGallery.email,
    });
  });

  it("returns 500 when update modifiedCount is 0", async () => {
    vi.mocked(AccountGallery.updateOne).mockResolvedValue({
      modifiedCount: 0,
    } as any);

    const response = await POST(
      makeRequest({ gallery_id: "gallery-123", status: "blocked" }),
    );
    const body = await response.json();

    expect(response.status).toBe(500);
  });

  it("returns 400 when gallery_id is missing", async () => {
    const response = await POST(makeRequest({ status: "blocked" }));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.message).toMatch(/Validation Failed/i);
  });

  it("returns 400 when status is missing", async () => {
    const response = await POST(makeRequest({ gallery_id: "gallery-123" }));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.message).toMatch(/Validation Failed/i);
  });
});
