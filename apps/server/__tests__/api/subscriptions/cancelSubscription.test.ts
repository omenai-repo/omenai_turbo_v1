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

vi.mock("@omenai/shared-models/models/subscriptions/SubscriptionSchema", () => ({
  Subscriptions: {
    updateOne: vi.fn(),
  },
}));

vi.mock("@omenai/shared-lib/configcat/configCatFetch", () => ({
  fetchConfigCatValue: vi.fn().mockResolvedValue(true),
}));

vi.mock("../../../app/api/util", async () => {
  const { buildValidateRequestBodyMock } = await import("../../helpers/util-mock");
  return buildValidateRequestBodyMock();
});

import { POST } from "../../../app/api/subscriptions/cancelSubscription/route";
import { Subscriptions } from "@omenai/shared-models/models/subscriptions/SubscriptionSchema";
import { fetchConfigCatValue } from "@omenai/shared-lib/configcat/configCatFetch";

function makeRequest(body: object): Request {
  return new Request("http://localhost/api/subscriptions/cancelSubscription", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/subscriptions/cancelSubscription", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(fetchConfigCatValue).mockResolvedValue(true);
    vi.mocked(Subscriptions.updateOne).mockResolvedValue({ acknowledged: true } as any);
  });

  it("returns 200 when subscription is canceled", async () => {
    const response = await POST(makeRequest({ gallery_id: "gallery-001" }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.message).toBe("Subscription has been canceled");
  });

  it("sets subscription status to canceled", async () => {
    await POST(makeRequest({ gallery_id: "gallery-001" }));

    expect(Subscriptions.updateOne).toHaveBeenCalledWith(
      { "customer.gallery_id": "gallery-001" },
      { $set: { status: "canceled" } },
    );
  });

  it("returns 403 when subscriptions feature is disabled", async () => {
    vi.mocked(fetchConfigCatValue).mockResolvedValueOnce(false);

    const response = await POST(makeRequest({ gallery_id: "gallery-001" }));
    const body = await response.json();

    expect(response.status).toBe(403);
    expect(body.message).toMatch(/disabled/i);
  });

  it("returns 400 when gallery_id is missing", async () => {
    const response = await POST(makeRequest({}));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.message).toMatch(/Validation Failed/i);
  });

  it("returns 500 when Subscriptions.updateOne throws", async () => {
    vi.mocked(Subscriptions.updateOne).mockRejectedValueOnce(new Error("DB error"));

    const response = await POST(makeRequest({ gallery_id: "gallery-001" }));

    expect(response.status).toBe(500);
  });
});
