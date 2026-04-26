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
  },
}));
vi.mock("@omenai/shared-models/models/auth/verification/codeTimeoutSchema", () => ({
  VerificationCodes: {
    findOne: vi.fn(),
    create: vi.fn().mockResolvedValue({}),
  },
}));
vi.mock("@omenai/shared-utils/src/generateToken", () => ({
  generateDigit: vi.fn().mockReturnValue("1111111"),
}));
vi.mock("@omenai/shared-emails/src/models/gallery/sendPasswordChangeConfirmationCode", () => ({
  sendPasswordConfirmationCodeMail: vi.fn().mockResolvedValue(undefined),
}));
vi.mock("../../../../app/api/util", async () => {
  const { buildValidateRequestBodyMock } = await import("../../../helpers/util-mock");
  return buildValidateRequestBodyMock();
});

import { POST } from "../../../../app/api/requests/gallery/requestPasswordConfirmationCode/route";
import { AccountGallery } from "@omenai/shared-models/models/auth/GallerySchema";
import { VerificationCodes } from "@omenai/shared-models/models/auth/verification/codeTimeoutSchema";

function makeRequest(body: object): Request {
  return new Request("http://localhost/api/requests/gallery/requestPasswordConfirmationCode", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

const mockAccount = {
  gallery_id: "gallery-123",
  admin: "Jane Smith",
  email: "gallery@example.com",
};

describe("POST /api/requests/gallery/requestPasswordConfirmationCode", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 200 and sends confirmation code", async () => {
    vi.mocked(AccountGallery.findOne).mockResolvedValue(mockAccount as any);
    vi.mocked(VerificationCodes.findOne).mockResolvedValue(null);

    const response = await POST(makeRequest({ id: "gallery-123" }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.message).toBe("Confirmation code sent to email address");
  });

  it("returns 404 when gallery is not found", async () => {
    vi.mocked(AccountGallery.findOne).mockResolvedValue(null);

    const response = await POST(makeRequest({ id: "nonexistent" }));
    const body = await response.json();

    expect(response.status).toBe(404);
    expect(body.message).toBe("Gallery not found for given ID");
  });

  it("returns 409 when a token is already active", async () => {
    vi.mocked(AccountGallery.findOne).mockResolvedValue(mockAccount as any);
    vi.mocked(VerificationCodes.findOne).mockResolvedValue({ code: "existing", author: "gallery-123" } as any);

    const response = await POST(makeRequest({ id: "gallery-123" }));
    const body = await response.json();

    expect(response.status).toBe(409);
    expect(body.message).toBe("Token active, check your email or try later");
  });

  it("returns 400 when id is missing", async () => {
    const response = await POST(makeRequest({}));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.message).toMatch(/Validation Failed/i);
  });
});
