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
    findOne: vi.fn(),
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

import { POST } from "../../../app/api/subscriptions/updateSubscriptionPlan/route";
import { Subscriptions } from "@omenai/shared-models/models/subscriptions/SubscriptionSchema";
import { fetchConfigCatValue } from "@omenai/shared-lib/configcat/configCatFetch";

const mockCurrentPlan = { status: "active" };
const mockUpdateResult = { acknowledged: true, modifiedCount: 1 };

function makeRequest(body: object): Request {
  return new Request("http://localhost/api/subscriptions/updateSubscriptionPlan", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/subscriptions/updateSubscriptionPlan", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(fetchConfigCatValue).mockResolvedValue(true);
    vi.mocked(Subscriptions.findOne).mockResolvedValue(mockCurrentPlan as any);
    vi.mocked(Subscriptions.updateOne).mockResolvedValue(mockUpdateResult as any);
  });

  it("returns 200 when subscription plan is updated", async () => {
    const response = await POST(
      makeRequest({ gallery_id: "gallery-001", action: "upgrade", data: { plan: "Gallery" } }),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.message).toBe("Successful");
  });

  it("sets status to active on reactivation action", async () => {
    await POST(
      makeRequest({ gallery_id: "gallery-001", action: "reactivation", data: {} }),
    );

    expect(Subscriptions.updateOne).toHaveBeenCalledWith(
      { "customer.gallery_id": "gallery-001" },
      expect.objectContaining({
        $set: expect.objectContaining({ status: "active" }),
      }),
    );
  });

  it("preserves current status for non-reactivation actions", async () => {
    await POST(
      makeRequest({ gallery_id: "gallery-001", action: "upgrade", data: {} }),
    );

    expect(Subscriptions.updateOne).toHaveBeenCalledWith(
      { "customer.gallery_id": "gallery-001" },
      expect.objectContaining({
        $set: expect.objectContaining({ status: "active" }),
      }),
    );
  });

  it("returns 503 when subscriptions feature is disabled", async () => {
    vi.mocked(fetchConfigCatValue).mockResolvedValueOnce(false);

    const response = await POST(
      makeRequest({ gallery_id: "gallery-001", action: "upgrade", data: {} }),
    );
    const body = await response.json();

    expect(response.status).toBe(503);
    expect(body.message).toMatch(/disabled/i);
  });

  it("returns 400 when gallery_id is missing", async () => {
    const response = await POST(makeRequest({ action: "upgrade", data: {} }));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.message).toMatch(/Validation Failed/i);
  });

  it("returns 400 when action is missing", async () => {
    const response = await POST(makeRequest({ gallery_id: "gallery-001", data: {} }));

    expect(response.status).toBe(400);
  });

  it("returns 500 when Subscriptions.updateOne throws", async () => {
    vi.mocked(Subscriptions.updateOne).mockRejectedValueOnce(new Error("DB error"));

    const response = await POST(
      makeRequest({ gallery_id: "gallery-001", action: "upgrade", data: {} }),
    );

    expect(response.status).toBe(500);
  });
});
