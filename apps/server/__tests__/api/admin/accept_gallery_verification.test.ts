import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@omenai/shared-models/models/auth/GallerySchema", () => ({
  AccountGallery: {
    findOne: vi.fn(),
    updateOne: vi.fn(),
  },
}));

vi.mock(
  "@omenai/shared-emails/src/models/gallery/sendGalleryAcceptedMail",
  () => ({
    sendGalleryAcceptedMail: vi.fn().mockResolvedValue(undefined),
  }),
);

vi.mock("@omenai/upstash-config", () => ({
  redis: { del: vi.fn().mockResolvedValue(1) },
}));

vi.mock("../../../app/api/util", async () => {
  const { buildValidateRequestBodyMock } = await import("../../helpers/util-mock");
  return buildValidateRequestBodyMock();
});

import { POST } from "../../../app/api/admin/accept_gallery_verification/route";
import { AccountGallery } from "@omenai/shared-models/models/auth/GallerySchema";
import { sendGalleryAcceptedMail } from "@omenai/shared-emails/src/models/gallery/sendGalleryAcceptedMail";
import { redis } from "@omenai/upstash-config";

function makeRequest(body: object): Request {
  return new Request(
    "http://localhost/api/admin/accept_gallery_verification",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    },
  );
}

const mockGallery = {
  name: "Test Gallery",
  email: "gallery@example.com",
};

describe("POST /api/admin/accept_gallery_verification", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(AccountGallery.findOne).mockResolvedValue(mockGallery);
    vi.mocked(AccountGallery.updateOne).mockResolvedValue({
      modifiedCount: 1,
    } as any);
  });

  it("returns 200 when gallery verification is accepted", async () => {
    const response = await POST(makeRequest({ gallery_id: "gallery-123" }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.message).toBe("Gallery verification accepted");
    expect(sendGalleryAcceptedMail).toHaveBeenCalledWith(
      expect.objectContaining({
        name: mockGallery.name,
        email: mockGallery.email,
      }),
    );
  });

  it("calls AccountGallery.updateOne with gallery_verified: true", async () => {
    await POST(makeRequest({ gallery_id: "gallery-123" }));

    expect(AccountGallery.updateOne).toHaveBeenCalledWith(
      { gallery_id: "gallery-123" },
      { $set: { gallery_verified: true } },
    );
  });

  it("invalidates the Redis cache for the gallery account", async () => {
    await POST(makeRequest({ gallery_id: "gallery-123" }));

    expect(redis.del).toHaveBeenCalledWith("account:gallery-123");
  });

  it("does not send acceptance email when gallery is not found", async () => {
    vi.mocked(AccountGallery.findOne).mockResolvedValue(null);

    await POST(makeRequest({ gallery_id: "ghost-gallery" }));

    expect(sendGalleryAcceptedMail).not.toHaveBeenCalled();
  });

  it("does not send acceptance email when update fails", async () => {
    vi.mocked(AccountGallery.updateOne).mockResolvedValue({
      modifiedCount: 0,
    } as any);

    await POST(makeRequest({ gallery_id: "gallery-123" }));

    expect(sendGalleryAcceptedMail).not.toHaveBeenCalled();
  });

  it("returns 404 when gallery is not found", async () => {
    vi.mocked(AccountGallery.findOne).mockResolvedValue(null);

    const response = await POST(makeRequest({ gallery_id: "ghost-gallery" }));
    const body = await response.json();

    expect(response.status).toBe(404);
    expect(body.message).toMatch(/Gallery not found/i);
  });

  it("returns 500 when update modifiedCount is 0", async () => {
    vi.mocked(AccountGallery.updateOne).mockResolvedValue({
      modifiedCount: 0,
    } as any);

    const response = await POST(makeRequest({ gallery_id: "gallery-123" }));

    expect(response.status).toBe(500);
  });

  it("returns 400 when gallery_id is missing", async () => {
    const response = await POST(makeRequest({}));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.message).toMatch(/Validation Failed/i);
  });

  it("returns 400 when gallery_id is empty string", async () => {
    const response = await POST(makeRequest({ gallery_id: "" }));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.message).toMatch(/Validation Failed/i);
  });
});
