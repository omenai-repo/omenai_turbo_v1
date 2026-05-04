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
    find: vi.fn(),
  },
}));

vi.mock("@omenai/upstash-config", () => ({
  redis: {
    get: vi.fn(),
    set: vi.fn().mockResolvedValue("OK"),
  },
}));

vi.mock("../../../app/api/util", () => ({
  createErrorRollbarReport: vi.fn(),
}));

import { GET } from "../../../app/api/subscriptions/retrievePlans/route";
import { SubscriptionPlan } from "@omenai/shared-models/models/subscriptions/PlanSchema";
import { redis } from "@omenai/upstash-config";

const mockPlans = [
  { plan_id: "plan-001", name: "Foundation", pricing: { monthly_price: 49 } },
  { plan_id: "plan-002", name: "Gallery", pricing: { monthly_price: 99 } },
];

function makeRequest(): Request {
  return new Request("http://localhost/api/subscriptions/retrievePlans", {
    method: "GET",
  });
}

describe("GET /api/subscriptions/retrievePlans", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(redis.get).mockResolvedValue(null);
    vi.mocked(redis.set).mockResolvedValue("OK");
    vi.mocked(SubscriptionPlan.find).mockReturnValue({
      lean: vi.fn().mockResolvedValue(mockPlans),
    } as any);
  });

  it("returns 200 with plans from DB when cache is empty", async () => {
    const response = await GET(makeRequest());
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.message).toBe("Plans retrieved successfully");
    expect(body.data).toEqual(mockPlans);
  });

  it("returns 200 with cached plans when redis has data", async () => {
    vi.mocked(redis.get).mockResolvedValueOnce(JSON.stringify(mockPlans) as any);

    const response = await GET(makeRequest());
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data).toEqual(mockPlans);
    expect(SubscriptionPlan.find).not.toHaveBeenCalled();
  });

  it("uses cached plans directly when redis returns an object (not string)", async () => {
    vi.mocked(redis.get).mockResolvedValueOnce(mockPlans as any);

    const response = await GET(makeRequest());
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data).toEqual(mockPlans);
  });

  it("caches plans in redis after fetching from DB", async () => {
    await GET(makeRequest());

    expect(redis.set).toHaveBeenCalledWith("plans", mockPlans, { ex: 86400 });
  });

  it("falls back to DB fetch when redis.get throws", async () => {
    vi.mocked(redis.get).mockRejectedValueOnce(new Error("Redis down"));

    const response = await GET(makeRequest());
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data).toEqual(mockPlans);
    expect(SubscriptionPlan.find).toHaveBeenCalled();
  });

  it("returns 500 when SubscriptionPlan.find throws", async () => {
    vi.mocked(redis.get).mockRejectedValueOnce(new Error("Redis down"));
    vi.mocked(SubscriptionPlan.find).mockReturnValue({
      lean: vi.fn().mockRejectedValue(new Error("DB error")),
    } as any);

    const response = await GET(makeRequest());

    expect(response.status).toBe(500);
  });
});
