import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@omenai/shared-lib/auth/middleware/combined_middleware", () => ({
  withRateLimitHighlightAndCsrf: () => (fn: any) => fn,
}));

vi.mock("@omenai/shared-lib/auth/configs/rate_limit_configs", () => ({
  fortKnoxRateLimit: {},
}));

vi.mock(
  "@omenai/shared-emails/src/models/verification/sendVerifyGalleryMail",
  () => ({
    sendVerifyGalleryMail: vi.fn().mockResolvedValue(undefined),
  }),
);

vi.mock("../../../app/api/util", async () => {
  const { buildValidateRequestBodyMock } = await import("../../helpers/util-mock");
  return buildValidateRequestBodyMock();
});

import { POST } from "../../../app/api/verification/verifyGallery/route";
import { sendVerifyGalleryMail } from "@omenai/shared-emails/src/models/verification/sendVerifyGalleryMail";

function makeRequest(body: object): Request {
  return new Request("http://localhost/api/verification/verifyGallery", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/verification/verifyGallery", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 200 when verification email is sent successfully", async () => {
    const response = await POST(makeRequest({ name: "Galerie Moderne" }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.message).toBe("Gallery verification request sent");
  });

  it("sends verification email to onboarding@omenai.app with gallery name", async () => {
    await POST(makeRequest({ name: "Galerie Moderne" }));

    expect(sendVerifyGalleryMail).toHaveBeenCalledWith({
      name: "Galerie Moderne",
      email: "onboarding@omenai.app",
    });
  });

  it("sends verification email with different gallery names", async () => {
    await POST(makeRequest({ name: "The Art House" }));

    expect(sendVerifyGalleryMail).toHaveBeenCalledWith({
      name: "The Art House",
      email: "onboarding@omenai.app",
    });
  });

  it("returns 400 when name is missing", async () => {
    const response = await POST(makeRequest({}));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.message).toMatch(/Validation Failed/i);
  });

  it("returns 500 when email service throws", async () => {
    vi.mocked(sendVerifyGalleryMail).mockRejectedValueOnce(
      new Error("Email service unavailable"),
    );

    const response = await POST(makeRequest({ name: "Galerie Moderne" }));
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.message).toBeDefined();
  });

  it("does not send email when validation fails", async () => {
    await POST(makeRequest({}));

    expect(sendVerifyGalleryMail).not.toHaveBeenCalled();
  });
});
