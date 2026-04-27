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
    findOne: vi.fn(),
  },
}));

vi.mock("../../../app/api/util", async () => {
  const { buildValidateGetRouteParamsMock } = await import("../../helpers/util-mock");
  return buildValidateGetRouteParamsMock();
});

import { GET } from "../../../app/api/subscriptions/retrieveSinglePlan/route";
import { SubscriptionPlan } from "@omenai/shared-models/models/subscriptions/PlanSchema";

const mockPlan = {
  plan_id: "plan-001",
  name: "Foundation",
  pricing: { monthly_price: 49, annual_price: 490 },
  currency: "USD",
};

function makeRequest(planId?: string): Request {
  const url = new URL("http://localhost/api/subscriptions/retrieveSinglePlan");
  if (planId) url.searchParams.set("plan_id", planId);
  return new Request(url.toString(), { method: "GET" });
}

describe("GET /api/subscriptions/retrieveSinglePlan", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(SubscriptionPlan.findOne).mockReturnValue({
      lean: vi.fn().mockResolvedValue(mockPlan),
    } as any);
  });

  it("returns 200 with plan data", async () => {
    const response = await GET(makeRequest("plan-001"));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.message).toBe("Successfull");
    expect(body.data).toEqual(mockPlan);
  });

  it("queries SubscriptionPlan by plan_id", async () => {
    await GET(makeRequest("plan-001"));

    expect(SubscriptionPlan.findOne).toHaveBeenCalledWith({ plan_id: "plan-001" });
  });

  it("returns 400 when plan_id param is missing", async () => {
    const response = await GET(makeRequest());
    const body = await response.json();

    expect(response.status).toBe(400);
  });

  it("returns 500 when plan is not found in DB", async () => {
    vi.mocked(SubscriptionPlan.findOne).mockReturnValue({
      lean: vi.fn().mockResolvedValue(null),
    } as any);

    const response = await GET(makeRequest("plan-999"));
    const body = await response.json();

    expect(response.status).toBe(500);
  });

  it("returns 500 when SubscriptionPlan.findOne throws", async () => {
    vi.mocked(SubscriptionPlan.findOne).mockReturnValue({
      lean: vi.fn().mockRejectedValue(new Error("DB error")),
    } as any);

    const response = await GET(makeRequest("plan-001"));
    const body = await response.json();

    expect(response.status).toBe(500);
  });
});
