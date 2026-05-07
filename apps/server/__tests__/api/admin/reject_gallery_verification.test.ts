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
    deleteOne: vi.fn(),
  },
}));

vi.mock("@omenai/shared-models/models/auth/RejectedGalleryScema", () => ({
  RejectedGallery: {
    create: vi.fn(),
  },
}));

vi.mock(
  "@omenai/shared-emails/src/models/gallery/sendGalleryRejectionMail",
  () => ({
    sendGalleryRejectedMail: vi.fn().mockResolvedValue(undefined),
  }),
);

vi.mock("../../../app/api/util", async () => {
  const { buildValidateRequestBodyMock } = await import("../../helpers/util-mock");
  return buildValidateRequestBodyMock();
});

import { POST } from "../../../app/api/admin/reject_gallery_verification/route";
import { AccountGallery } from "@omenai/shared-models/models/auth/GallerySchema";
import { RejectedGallery } from "@omenai/shared-models/models/auth/RejectedGalleryScema";
import { sendGalleryRejectedMail } from "@omenai/shared-emails/src/models/gallery/sendGalleryRejectionMail";

function makeRequest(body: object): Request {
  return new Request(
    "http://localhost/api/admin/reject_gallery_verification",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    },
  );
}

const validBody = {
  gallery_id: "gallery-123",
  name: "Test Gallery",
  email: "gallery@example.com",
};

describe("POST /api/admin/reject_gallery_verification", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(RejectedGallery.create).mockResolvedValue({
      name: "Test Gallery",
      email: "gallery@example.com",
    } as any);
    vi.mocked(AccountGallery.deleteOne).mockResolvedValue({
      deletedCount: 1,
    } as any);
  });

  it("returns 200 when gallery verification is rejected", async () => {
    const response = await POST(makeRequest(validBody));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.message).toBe("Gallery verification rejected");
    expect(sendGalleryRejectedMail).toHaveBeenCalledWith({
      name: validBody.name,
      email: validBody.email,
    });
  });

  it("returns 500 when RejectedGallery.create returns falsy", async () => {
    vi.mocked(RejectedGallery.create).mockResolvedValue(null as any);

    const response = await POST(makeRequest(validBody));

    expect(response.status).toBe(500);
  });

  it("returns 400 when gallery_id is missing", async () => {
    const { gallery_id, ...rest } = validBody;
    const response = await POST(makeRequest(rest));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.message).toMatch(/Validation Failed/i);
  });

  it("returns 400 when email is invalid", async () => {
    const response = await POST(
      makeRequest({ ...validBody, email: "not-an-email" }),
    );
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.message).toMatch(/Validation Failed/i);
  });
});
