import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@omenai/shared-lib/auth/middleware/combined_middleware", () => ({
  withRateLimitHighlightAndCsrf: () => (fn: any) => fn,
}));

vi.mock("@omenai/shared-lib/auth/configs/rate_limit_configs", () => ({
  standardRateLimit: {},
}));

vi.mock("@omenai/shared-lib/mongo_connect/mongoConnect", () => ({
  connectMongoDB: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@omenai/shared-models/models/auth/GallerySchema", () => ({
  AccountGallery: {
    findOne: vi.fn(),
  },
}));

vi.mock("../../../app/api/util", async () => {
  const { buildValidateRequestBodyMock } = await import("../../helpers/util-mock");
  return buildValidateRequestBodyMock();
});

import { POST } from "../../../app/api/subscriptions/retrieveDiscountStatus/route";
import { AccountGallery } from "@omenai/shared-models/models/auth/GallerySchema";

const mockAccount = {
  email: "gallery@test.com",
  gallery_id: "gallery-001",
  subscription_status: {
    discount: { active: true },
  },
};

function makeFindOneChain(value: any) {
  return {
    lean: vi.fn().mockReturnValue({
      select: vi.fn().mockResolvedValue(value),
    }),
  };
}

function makeRequest(body: object): Request {
  return new Request("http://localhost/api/subscriptions/retrieveDiscountStatus", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/subscriptions/retrieveDiscountStatus", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(AccountGallery.findOne).mockReturnValue(makeFindOneChain(mockAccount) as any);
  });

  it("returns 200 with discount active status", async () => {
    const response = await POST(makeRequest({ email: "gallery@test.com" }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.message).toBe("Discount Data retrieved");
    expect(body.discount).toBe(true);
  });

  it("returns 200 with discount inactive when discount is not active", async () => {
    const inactiveAccount = {
      ...mockAccount,
      subscription_status: { discount: { active: false } },
    };
    vi.mocked(AccountGallery.findOne).mockReturnValue(
      makeFindOneChain(inactiveAccount) as any,
    );

    const response = await POST(makeRequest({ email: "gallery@test.com" }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.discount).toBe(false);
  });

  it("queries by email", async () => {
    await POST(makeRequest({ email: "gallery@test.com" }));

    expect(AccountGallery.findOne).toHaveBeenCalledWith(
      { email: "gallery@test.com" },
      "email gallery_id subscription_status",
    );
  });

  it("returns 400 when no gallery account found", async () => {
    vi.mocked(AccountGallery.findOne).mockReturnValue(
      makeFindOneChain(null) as any,
    );

    const response = await POST(makeRequest({ email: "unknown@test.com" }));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.message).toMatch(/No gallery account found/i);
  });

  it("returns 400 when email is missing", async () => {
    const response = await POST(makeRequest({}));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.message).toMatch(/Validation Failed/i);
  });

  it("returns 400 when email is invalid format", async () => {
    const response = await POST(makeRequest({ email: "not-an-email" }));
    const body = await response.json();

    expect(response.status).toBe(400);
  });

  it("returns 500 when AccountGallery.findOne throws", async () => {
    vi.mocked(AccountGallery.findOne).mockReturnValue({
      lean: vi.fn().mockReturnValue({
        select: vi.fn().mockRejectedValue(new Error("DB error")),
      }),
    } as any);

    const response = await POST(makeRequest({ email: "gallery@test.com" }));
    const body = await response.json();

    expect(response.status).toBe(500);
  });
});
