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

vi.mock("@omenai/shared-models/models/subscriptions/PlanSchema", () => ({
  SubscriptionPlan: {
    create: vi.fn(),
  },
}));

vi.mock("../../../app/api/util", () => ({
  createErrorRollbarReport: vi.fn(),
}));

import { POST } from "../../../app/api/subscriptions/createPlan/route";
import { SubscriptionPlan } from "@omenai/shared-models/models/subscriptions/PlanSchema";

const validPlanData = {
  name: "Foundation",
  plan_id: "plan-001",
  pricing: { monthly_price: 49, annual_price: 490 },
  currency: "USD",
};

function makeRequest(body: object): Request {
  return new Request("http://localhost/api/subscriptions/createPlan", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/subscriptions/createPlan", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(SubscriptionPlan.create).mockResolvedValue({ _id: "plan-doc-1" } as any);
  });

  it("returns 200 when plan is created", async () => {
    const response = await POST(makeRequest(validPlanData));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.message).toBe("Plan created successfully");
  });

  it("calls SubscriptionPlan.create with request body", async () => {
    await POST(makeRequest(validPlanData));

    expect(SubscriptionPlan.create).toHaveBeenCalledWith(
      expect.objectContaining(validPlanData),
    );
  });

  it("returns 500 when SubscriptionPlan.create returns falsy", async () => {
    vi.mocked(SubscriptionPlan.create).mockResolvedValueOnce(null as any);

    const response = await POST(makeRequest(validPlanData));

    expect(response.status).toBe(500);
  });

  it("returns 500 when SubscriptionPlan.create throws", async () => {
    vi.mocked(SubscriptionPlan.create).mockRejectedValueOnce(new Error("Duplicate key"));

    const response = await POST(makeRequest(validPlanData));

    expect(response.status).toBe(500);
  });
});
