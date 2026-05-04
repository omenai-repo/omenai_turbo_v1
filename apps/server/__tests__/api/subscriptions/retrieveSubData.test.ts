import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@omenai/shared-lib/auth/middleware/rate_limit_middleware", () => ({
  withRateLimit: () => (fn: any) => fn,
}));

vi.mock("@omenai/shared-lib/auth/configs/rate_limit_configs", () => ({
  standardRateLimit: {},
}));

vi.mock("@omenai/shared-lib/mongo_connect/mongoConnect", () => ({
  connectMongoDB: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@omenai/shared-models/models/subscriptions/SubscriptionSchema", () => ({
  Subscriptions: {
    findOne: vi.fn(),
  },
}));

vi.mock("@omenai/shared-models/models/subscriptions", () => ({
  SubscriptionPlan: {
    find: vi.fn(),
  },
}));

vi.mock("../../../app/api/util", async () => {
  const { buildValidateRequestBodyMock } = await import("../../helpers/util-mock");
  return buildValidateRequestBodyMock();
});

import { POST } from "../../../app/api/subscriptions/retrieveSubData/route";
import { Subscriptions } from "@omenai/shared-models/models/subscriptions/SubscriptionSchema";
import { SubscriptionPlan } from "@omenai/shared-models/models/subscriptions";

const mockSubscription = {
  subscription_id: "sub-001",
  status: "active",
  plan_details: { type: "Foundation" },
  customer: { gallery_id: "gallery-001" },
};

const mockPlans = [
  { name: "Foundation", plan_id: "plan-001", pricing: { monthly_price: 49 } },
  { name: "Gallery", plan_id: "plan-002", pricing: { monthly_price: 99 } },
];

function makeRequest(body: object): Request {
  return new Request("http://localhost/api/subscriptions/retrieveSubData", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/subscriptions/retrieveSubData", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(Subscriptions.findOne).mockReturnValue({
      lean: vi.fn().mockResolvedValue(mockSubscription),
    } as any);
    vi.mocked(SubscriptionPlan.find).mockReturnValue({
      lean: vi.fn().mockResolvedValue(mockPlans),
    } as any);
  });

  it("returns 200 with subscription data and matched plan", async () => {
    const response = await POST(makeRequest({ gallery_id: "gallery-001" }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.message).toBe("Successfully retrieved subscription data");
    expect(body.data).toEqual(mockSubscription);
    expect(body.plan).toEqual(mockPlans[0]); // Foundation plan matched
  });

  it("queries subscription by gallery_id", async () => {
    await POST(makeRequest({ gallery_id: "gallery-001" }));

    expect(Subscriptions.findOne).toHaveBeenCalledWith({
      "customer.gallery_id": "gallery-001",
    });
  });

  it("returns 200 with null data when no subscription found", async () => {
    vi.mocked(Subscriptions.findOne).mockReturnValue({
      lean: vi.fn().mockResolvedValue(null),
    } as any);

    const response = await POST(makeRequest({ gallery_id: "new-gallery" }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.message).toBe("No subscription data found");
    expect(body.data).toBeNull();
  });

  it("returns null plan when no matching plan name found in plans list", async () => {
    const subWithUnknownPlan = {
      ...mockSubscription,
      plan_details: { type: "UnknownPlan" },
    };
    vi.mocked(Subscriptions.findOne).mockReturnValue({
      lean: vi.fn().mockResolvedValue(subWithUnknownPlan),
    } as any);

    const response = await POST(makeRequest({ gallery_id: "gallery-001" }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.plan).toBeNull();
  });

  it("returns 400 when gallery_id is missing", async () => {
    const response = await POST(makeRequest({}));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.message).toMatch(/Validation Failed/i);
  });

  it("returns 500 when Subscriptions.findOne throws", async () => {
    vi.mocked(Subscriptions.findOne).mockReturnValue({
      lean: vi.fn().mockRejectedValue(new Error("DB error")),
    } as any);

    const response = await POST(makeRequest({ gallery_id: "gallery-001" }));

    expect(response.status).toBe(500);
  });
});
