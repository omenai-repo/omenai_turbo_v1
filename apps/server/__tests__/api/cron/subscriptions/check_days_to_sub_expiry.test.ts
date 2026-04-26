import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@omenai/shared-lib/auth/middleware/rate_limit_middleware", () => ({
  withRateLimit: () => (fn: any) => fn,
}));

vi.mock("@omenai/shared-lib/auth/configs/rate_limit_configs", () => ({
  lenientRateLimit: {},
  standardRateLimit: {},
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
    aggregate: vi.fn(),
  },
}));

const mockBatchSend = vi.hoisted(() =>
  vi.fn().mockResolvedValue({ data: null, error: null }),
);
const MockResend = vi.hoisted(() =>
  vi.fn().mockImplementation(() => ({ batch: { send: mockBatchSend } })),
);
vi.mock("resend", () => ({ Resend: MockResend }));

vi.mock("@react-email/render", () => ({
  render: vi.fn().mockResolvedValue("<html></html>"),
}));

vi.mock(
  "@omenai/shared-emails/src/views/subscription/SubscriptionExpireAlert",
  () => ({ SubscriptionExpireAlert: vi.fn().mockReturnValue(null) }),
);

vi.mock("../../../../app/api/cron/utils", () => ({
  verifyAuthVercel: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("../../../../app/api/util", () => ({
  createErrorRollbarReport: vi.fn(),
}));

import { GET } from "../../../../app/api/cron/subscriptions/check_days_to_sub_expiry/route";
import { Subscriptions } from "@omenai/shared-models/models/subscriptions/SubscriptionSchema";
import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { verifyAuthVercel } from "../../../../app/api/cron/utils";

function makeRequest(): Request {
  return new Request(
    "http://localhost/api/cron/subscriptions/check_days_to_sub_expiry",
    { method: "GET", headers: { Authorization: "Bearer test-secret" } },
  );
}

const mockExpiringSubscriptions = [
  {
    customer: { email: "gallery1@example.com", name: "Gallery 1", gallery_id: "g1" },
    expiry_date: new Date(),
    plan_details: { name: "Pro" },
    days_until_expiry: 3,
  },
  {
    customer: { email: "gallery2@example.com", name: "Gallery 2", gallery_id: "g2" },
    expiry_date: new Date(),
    plan_details: { name: "Basic" },
    days_until_expiry: 1,
  },
];

describe("GET /api/cron/subscriptions/check_days_to_sub_expiry", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(connectMongoDB).mockResolvedValue({} as any);
    vi.mocked(Subscriptions.aggregate).mockResolvedValue(
      mockExpiringSubscriptions as any,
    );
  });

  it("returns 200 with reminder count on success", async () => {
    const response = await GET(makeRequest());
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.message).toBe("Subscription reminders processed successfully");
    expect(body.remindersToSend).toBe(2);
  });

  it("calls verifyAuthVercel to check authorization", async () => {
    await GET(makeRequest());
    expect(verifyAuthVercel).toHaveBeenCalledOnce();
  });

  it("calls connectMongoDB before querying", async () => {
    await GET(makeRequest());
    expect(connectMongoDB).toHaveBeenCalledOnce();
  });

  it("aggregates only active subscriptions", async () => {
    await GET(makeRequest());

    const pipeline = vi.mocked(Subscriptions.aggregate).mock.calls[0][0];
    const matchStage = pipeline.find((s: any) => s.$match);
    expect(matchStage.$match.status).toBe("active");
  });

  it("returns subscription data in response body", async () => {
    const response = await GET(makeRequest());
    const body = await response.json();

    const expectedData = mockExpiringSubscriptions.map((s) => ({
      ...s,
      expiry_date: s.expiry_date.toISOString(),
    }));
    expect(body.data).toEqual(expectedData);
  });

  it("sends batch emails for each expiring subscription", async () => {
    await GET(makeRequest());
    expect(mockBatchSend).toHaveBeenCalledOnce();

    const payload = mockBatchSend.mock.calls[0][0];
    expect(payload).toHaveLength(2);
    expect(payload[0].to).toEqual(["gallery1@example.com"]);
  });

  it("uses 'tomorrow' in subject when days_until_expiry is 1", async () => {
    await GET(makeRequest());

    const payload = mockBatchSend.mock.calls[0][0];
    const oneDay = payload.find((p: any) =>
      p.to.includes("gallery2@example.com"),
    );
    expect(oneDay.subject).toContain("tomorrow");
  });

  it("uses day count in subject when days_until_expiry is > 1", async () => {
    await GET(makeRequest());

    const payload = mockBatchSend.mock.calls[0][0];
    const threeDays = payload.find((p: any) =>
      p.to.includes("gallery1@example.com"),
    );
    expect(threeDays.subject).toContain("3 days");
  });

  it("returns 200 with zero reminders when no subscriptions are expiring", async () => {
    vi.mocked(Subscriptions.aggregate).mockResolvedValueOnce([]);

    const response = await GET(makeRequest());
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.remindersToSend).toBe(0);
  });

  it("returns 500 when verifyAuthVercel throws", async () => {
    vi.mocked(verifyAuthVercel).mockRejectedValueOnce(new Error("Forbidden"));

    const response = await GET(makeRequest());
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.message).toBe("Subscription reminder processing failed");
  });

  it("returns 500 when connectMongoDB throws", async () => {
    vi.mocked(connectMongoDB).mockRejectedValueOnce(
      new Error("Connection refused"),
    );

    const response = await GET(makeRequest());
    expect(response.status).toBe(500);
  });

  it("returns 500 when aggregate throws", async () => {
    vi.mocked(Subscriptions.aggregate).mockRejectedValueOnce(
      new Error("Aggregation failed"),
    );

    const response = await GET(makeRequest());
    expect(response.status).toBe(500);
  });
});
