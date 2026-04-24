import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@omenai/shared-lib/auth/middleware/rate_limit_middleware", () => ({
  withRateLimit: () => (fn: any) => fn,
}));

vi.mock("@omenai/shared-lib/auth/configs/rate_limit_configs", () => ({
  lenientRateLimit: {},
}));

vi.mock("next/server", () => ({
  NextResponse: {
    json: (body: unknown, init?: ResponseInit) =>
      new Response(JSON.stringify(body), {
        ...init,
        headers: { "Content-Type": "application/json" },
      }),
  },
}));

vi.mock("@omenai/shared-lib/mongo_connect/mongoConnect", () => ({
  connectMongoDB: vi.fn(),
}));

vi.mock("@omenai/shared-models/models/subscriptions/SubscriptionSchema", () => ({
  Subscriptions: {
    updateMany: vi.fn(),
    find: vi.fn(),
  },
}));

vi.mock("@omenai/shared-models/models/auth/GallerySchema", () => ({
  AccountGallery: {
    updateMany: vi.fn(),
  },
}));

vi.mock("@omenai/shared-lib/payments/stripe/stripe", () => ({
  stripe: {
    paymentIntents: {
      create: vi.fn(),
    },
  },
}));

vi.mock("p-limit", () => ({
  default: vi.fn(),
}));

vi.mock("../../../../app/api/cron/utils", () => ({
  verifyAuthVercel: vi.fn(),
}));

vi.mock("../../../../app/api/util", () => ({
  createErrorRollbarReport: vi.fn(),
}));

import { GET } from "../../../../app/api/cron/subscriptions/check_expired_subscriptions/route";
import { Subscriptions } from "@omenai/shared-models/models/subscriptions/SubscriptionSchema";
import { AccountGallery } from "@omenai/shared-models/models/auth/GallerySchema";
import { stripe } from "@omenai/shared-lib/payments/stripe/stripe";
import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { verifyAuthVercel } from "../../../../app/api/cron/utils";
import pLimit from "p-limit";

function makeRequest(): Request {
  return new Request(
    "http://localhost/api/cron/subscriptions/check_expired_subscriptions",
    { method: "GET", headers: { Authorization: "Bearer test-secret" } },
  );
}

const mockExpiredSub = {
  _id: "sub-001",
  expiry_date: new Date(Date.now() - 86400000),
  status: "expired",
  stripe_customer_id: "cus_test123",
  customer: {
    email: "gallery@example.com",
    name: "Gallery",
    gallery_id: "g1",
  },
  paymentMethod: { id: "pm_test123" },
  next_charge_params: {
    value: 99,
    currency: "usd",
    id: "plan_pro",
    interval: "month",
  },
};

function makeSubsFindChain(subs: any[]) {
  return {
    lean: vi.fn().mockReturnValue({
      skip: vi.fn().mockReturnValue({
        limit: vi.fn().mockReturnValue({
          exec: vi.fn().mockResolvedValue(subs),
        }),
      }),
    }),
  };
}

describe("GET /api/cron/subscriptions/check_expired_subscriptions", () => {
  beforeEach(() => {
    // resetAllMocks clears mock implementation queues (mockReturnValueOnce etc.)
    // preventing stale once-mocks from leaking between tests
    vi.resetAllMocks();
    vi.mocked(pLimit).mockImplementation(() => (fn: any) => fn());
    vi.mocked(connectMongoDB).mockResolvedValue({} as any);
    vi.mocked(verifyAuthVercel).mockResolvedValue(undefined);
    vi.mocked(Subscriptions.updateMany).mockResolvedValue({
      modifiedCount: 1,
    } as any);
    // Default: no expired subs — loop exits immediately
    vi.mocked(Subscriptions.find).mockReturnValue(
      makeSubsFindChain([]) as any,
    );
    vi.mocked(AccountGallery.updateMany).mockResolvedValue({
      modifiedCount: 1,
    } as any);
    vi.mocked(stripe.paymentIntents.create).mockResolvedValue({
      id: "pi_test_001",
    } as any);
  });

  it("returns 200 on successful renewal processing", async () => {
    const response = await GET(makeRequest());
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.message).toBe(
      "Expired subscriptions updated, renewal attempts made",
    );
  });

  it("calls verifyAuthVercel to check authorization", async () => {
    await GET(makeRequest());
    expect(verifyAuthVercel).toHaveBeenCalledOnce();
  });

  it("calls connectMongoDB before querying", async () => {
    await GET(makeRequest());
    expect(connectMongoDB).toHaveBeenCalledOnce();
  });

  it("marks overdue subscriptions as expired via updateMany", async () => {
    await GET(makeRequest());

    expect(Subscriptions.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({ status: { $ne: "canceled" } }),
      { $set: { status: "expired" } },
    );
  });

  it("marks gallery as inactive for each expired subscription", async () => {
    vi.mocked(Subscriptions.find).mockReturnValue(
      makeSubsFindChain([mockExpiredSub]) as any,
    );

    await GET(makeRequest());

    expect(AccountGallery.updateMany).toHaveBeenCalledWith(
      { email: { $in: ["gallery@example.com"] } },
      { $set: { "subscription_status.active": false } },
    );
  });

  it("creates a Stripe payment intent for renewal", async () => {
    vi.mocked(Subscriptions.find).mockReturnValue(
      makeSubsFindChain([mockExpiredSub]) as any,
    );

    await GET(makeRequest());

    expect(stripe.paymentIntents.create).toHaveBeenCalledWith(
      expect.objectContaining({
        amount: 9900,
        currency: "usd",
        customer: "cus_test123",
        payment_method: "pm_test123",
        off_session: true,
        confirm: true,
      }),
      expect.objectContaining({ idempotencyKey: expect.any(String) }),
    );
  });

  it("includes renewal result with ok:true when Stripe succeeds", async () => {
    vi.mocked(Subscriptions.find).mockReturnValue(
      makeSubsFindChain([mockExpiredSub]) as any,
    );

    const response = await GET(makeRequest());
    const body = await response.json();

    expect(body.attempts).toBe(1);
    expect(body.results[0]).toMatchObject({
      ok: true,
      paymentIntentId: "pi_test_001",
    });
  });

  it("records ok:false when sub is missing stripe_customer_id", async () => {
    const subWithoutCustomer = {
      ...mockExpiredSub,
      stripe_customer_id: undefined,
    };
    vi.mocked(Subscriptions.find).mockReturnValue(
      makeSubsFindChain([subWithoutCustomer]) as any,
    );

    const response = await GET(makeRequest());
    const body = await response.json();

    expect(body.results[0]).toMatchObject({
      ok: false,
      error: "Missing stripe_customer_id or amount",
    });
  });

  it("records ok:false when sub has no stored payment method", async () => {
    const subWithoutPM = { ...mockExpiredSub, paymentMethod: undefined };
    vi.mocked(Subscriptions.find).mockReturnValue(
      makeSubsFindChain([subWithoutPM]) as any,
    );

    const response = await GET(makeRequest());
    const body = await response.json();

    expect(body.results[0]).toMatchObject({
      ok: false,
      error: "No stored payment method",
    });
  });

  it("accepts a string payment method id", async () => {
    const subWithStringPM = {
      ...mockExpiredSub,
      paymentMethod: "pm_string_id",
    };
    vi.mocked(Subscriptions.find).mockReturnValue(
      makeSubsFindChain([subWithStringPM]) as any,
    );

    await GET(makeRequest());

    expect(stripe.paymentIntents.create).toHaveBeenCalledWith(
      expect.objectContaining({ payment_method: "pm_string_id" }),
      expect.any(Object),
    );
  });

  it("records ok:false and error message when Stripe throws", async () => {
    vi.mocked(Subscriptions.find).mockReturnValue(
      makeSubsFindChain([mockExpiredSub]) as any,
    );
    vi.mocked(stripe.paymentIntents.create).mockRejectedValue(
      Object.assign(new Error("card_declined"), { message: "card_declined" }),
    );

    const response = await GET(makeRequest());
    const body = await response.json();

    expect(body.results[0]).toMatchObject({ ok: false, error: "card_declined" });
  });

  it("returns 500 when verifyAuthVercel throws", async () => {
    vi.mocked(verifyAuthVercel).mockRejectedValue(new Error("Forbidden"));

    const response = await GET(makeRequest());
    expect(response.status).toBe(500);
  });

  it("returns 500 when connectMongoDB throws", async () => {
    vi.mocked(connectMongoDB).mockRejectedValue(new Error("DB error"));

    const response = await GET(makeRequest());
    expect(response.status).toBe(500);
  });
});
