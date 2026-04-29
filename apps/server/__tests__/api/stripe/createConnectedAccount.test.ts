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

vi.mock("@omenai/shared-lib/payments/stripe/stripe", () => ({
  stripe: {
    accounts: { create: vi.fn() },
  },
}));

vi.mock("@omenai/shared-models/models/auth/GallerySchema", () => ({
  AccountGallery: {
    updateOne: vi.fn(),
  },
}));

vi.mock("@omenai/upstash-config", () => ({
  redis: {
    del: vi.fn().mockResolvedValue(undefined),
    set: vi.fn().mockResolvedValue(undefined),
  },
}));

vi.mock("../../../app/api/util", async () => {
  const { buildValidateRequestBodyMock } = await import("../../helpers/util-mock");
  return buildValidateRequestBodyMock();
});

import { POST } from "../../../app/api/stripe/createConnectedAccount/route";
import { stripe } from "@omenai/shared-lib/payments/stripe/stripe";
import { AccountGallery } from "@omenai/shared-models/models/auth/GallerySchema";
import { redis } from "@omenai/upstash-config";

const validCustomer = {
  name: "Test Gallery",
  email: "gallery@test.com",
  customer_id: "gallery-001",
  country: "US",
};

const mockAccount = { id: "acct_new_123" };

function makeRequest(body: object): Request {
  return new Request("http://localhost/api/stripe/createConnectedAccount", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/stripe/createConnectedAccount", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(stripe.accounts.create).mockResolvedValue(mockAccount as any);
    vi.mocked(AccountGallery.updateOne).mockResolvedValue({ modifiedCount: 1 } as any);
    vi.mocked(redis.del).mockResolvedValue(undefined as any);
    vi.mocked(redis.set).mockResolvedValue(undefined as any);
  });

  it("returns 201 with account id on success", async () => {
    const response = await POST(makeRequest({ customer: validCustomer }));
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(body.message).toBe("Connected account created");
    expect(body.account_id).toBe(mockAccount.id);
  });

  it("creates stripe account with correct controller settings", async () => {
    await POST(makeRequest({ customer: validCustomer }));

    expect(stripe.accounts.create).toHaveBeenCalledWith(
      expect.objectContaining({
        email: validCustomer.email,
        country: validCustomer.country,
        metadata: validCustomer,
        controller: expect.objectContaining({
          stripe_dashboard: { type: "express" },
        }),
      }),
    );
  });

  it("updates gallery with connected_account_id in DB", async () => {
    await POST(makeRequest({ customer: validCustomer }));

    expect(AccountGallery.updateOne).toHaveBeenCalledWith(
      { email: validCustomer.email },
      { $set: { connected_account_id: mockAccount.id } },
    );
  });

  it("invalidates and refreshes Redis cache on success", async () => {
    await POST(makeRequest({ customer: validCustomer }));

    expect(redis.del).toHaveBeenCalledWith(`accountId:${validCustomer.customer_id}`);
    expect(redis.set).toHaveBeenCalledWith(
      `accountId:${validCustomer.customer_id}`,
      expect.stringContaining(mockAccount.id),
    );
  });

  it("returns 500 when gallery DB update fails (modifiedCount === 0)", async () => {
    vi.mocked(AccountGallery.updateOne).mockResolvedValueOnce({ modifiedCount: 0 } as any);

    const response = await POST(makeRequest({ customer: validCustomer }));
    const body = await response.json();

    expect(response.status).toBe(500);
  });

  it("returns 500 when stripe.accounts.create throws", async () => {
    vi.mocked(stripe.accounts.create).mockRejectedValueOnce(new Error("Stripe error"));

    const response = await POST(makeRequest({ customer: validCustomer }));
    const body = await response.json();

    expect(response.status).toBe(500);
  });

  it("still returns 201 when Redis cache update fails", async () => {
    vi.mocked(redis.del).mockRejectedValueOnce(new Error("Redis error"));

    const response = await POST(makeRequest({ customer: validCustomer }));
    const body = await response.json();

    expect(response.status).toBe(201);
  });

  it("returns 400 when customer fields are missing", async () => {
    const response = await POST(makeRequest({ customer: { name: "Only Name" } }));
    const body = await response.json();

    expect(response.status).toBe(400);
  });

  it("returns 400 when customer is missing entirely", async () => {
    const response = await POST(makeRequest({}));
    const body = await response.json();

    expect(response.status).toBe(400);
  });
});
