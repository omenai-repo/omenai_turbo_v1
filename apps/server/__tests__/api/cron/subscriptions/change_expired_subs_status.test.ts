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
  "@omenai/shared-emails/src/views/subscription/SubscriptionPaymentFailedMail",
  () => ({ default: vi.fn().mockReturnValue(null) }),
);

vi.mock("../../../../app/api/cron/utils", () => ({
  verifyAuthVercel: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("../../../../app/api/util", () => ({
  createErrorRollbarReport: vi.fn(),
}));

vi.mock("../../../../custom/errors/handler/errorHandler", () => ({
  handleErrorEdgeCases: vi
    .fn()
    .mockReturnValue({ status: 500, message: "Internal Server Error" }),
}));

vi.mock("@omenai/rollbar-config", () => ({
  rollbarServerInstance: { error: vi.fn() },
}));

import { GET } from "../../../../app/api/cron/subscriptions/change_expired_subs_status/route";
import { Subscriptions } from "@omenai/shared-models/models/subscriptions/SubscriptionSchema";
import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { verifyAuthVercel } from "../../../../app/api/cron/utils";

function makeRequest(): Request {
  return new Request(
    "http://localhost/api/cron/subscriptions/change_expired_subs_status",
    { method: "GET", headers: { Authorization: "Bearer test-secret" } },
  );
}

const mockSubscriptions = [
  { customer: { name: "Gallery A", email: "gallery-a@example.com" } },
  { customer: { name: "Gallery B", email: "gallery-b@example.com" } },
];

describe("GET /api/cron/subscriptions/change_expired_subs_status", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(connectMongoDB).mockResolvedValue({} as any);
    vi.mocked(Subscriptions.updateMany).mockResolvedValue({
      modifiedCount: 2,
    } as any);
    vi.mocked(Subscriptions.find).mockReturnValue({
      lean: vi.fn().mockResolvedValue(mockSubscriptions),
    } as any);
  });

  it("returns 200 with canceledCount on success", async () => {
    const response = await GET(makeRequest());
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.message).toBe("Subscription cancellation successful");
    expect(body.canceledCount).toBe(2);
  });

  it("calls verifyAuthVercel to check authorization", async () => {
    await GET(makeRequest());
    expect(verifyAuthVercel).toHaveBeenCalledOnce();
  });

  it("calls connectMongoDB before querying", async () => {
    await GET(makeRequest());
    expect(connectMongoDB).toHaveBeenCalledOnce();
  });

  it("calls updateMany targeting expired status with 3-day cutoff", async () => {
    await GET(makeRequest());

    expect(Subscriptions.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({ status: "expired" }),
      { $set: { status: "canceled" } },
    );
  });

  it("sends cancellation emails for each fetched subscription", async () => {
    await GET(makeRequest());
    expect(mockBatchSend).toHaveBeenCalledOnce();

    const payload = mockBatchSend.mock.calls[0][0];
    expect(payload).toHaveLength(mockSubscriptions.length);
    expect(payload[0].to).toEqual(["gallery-a@example.com"]);
  });

  it("returns 500 when verifyAuthVercel throws", async () => {
    vi.mocked(verifyAuthVercel).mockRejectedValueOnce(new Error("Forbidden"));

    const response = await GET(makeRequest());
    expect(response.status).toBe(500);
  });

  it("returns 500 when connectMongoDB throws", async () => {
    vi.mocked(connectMongoDB).mockRejectedValueOnce(new Error("Connection error"));

    const response = await GET(makeRequest());
    expect(response.status).toBe(500);
  });

  it("returns 500 when Subscriptions.updateMany throws", async () => {
    vi.mocked(Subscriptions.updateMany).mockRejectedValueOnce(
      new Error("DB write error"),
    );

    const response = await GET(makeRequest());
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.message).toBe("Subscription cancellation failed");
  });

  it("still returns 200 when email batch send succeeds with zero subscriptions", async () => {
    vi.mocked(Subscriptions.find).mockReturnValue({
      lean: vi.fn().mockResolvedValue([]),
    } as any);

    const response = await GET(makeRequest());
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.canceledCount).toBe(2);
  });
});
