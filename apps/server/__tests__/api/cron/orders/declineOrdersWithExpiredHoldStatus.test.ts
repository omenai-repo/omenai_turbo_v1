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

vi.mock("@omenai/shared-models/models/orders/CreateOrderSchema", () => ({
  CreateOrder: {
    find: vi.fn(),
    bulkWrite: vi.fn(),
  },
}));

vi.mock(
  "@omenai/shared-emails/src/models/orders/orderDeclinedMail",
  () => ({
    sendOrderDeclinedMail: vi.fn().mockResolvedValue(undefined),
  }),
);

vi.mock("@omenai/shared-utils/src/toUtcDate", () => ({
  toUTCDate: vi.fn((d) => d),
}));

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

import { GET } from "../../../../app/api/cron/orders/declineOrdersWithExpiredHoldStatus/route";
import { CreateOrder } from "@omenai/shared-models/models/orders/CreateOrderSchema";
import { sendOrderDeclinedMail } from "@omenai/shared-emails/src/models/orders/orderDeclinedMail";
import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { verifyAuthVercel } from "../../../../app/api/cron/utils";
import { handleErrorEdgeCases } from "../../../../custom/errors/handler/errorHandler";

function makeRequest(): Request {
  return new Request(
    "http://localhost/api/cron/orders/declineOrdersWithExpiredHoldStatus",
    { method: "GET", headers: { Authorization: "Bearer test-secret" } },
  );
}

const pastDate = new Date(Date.now() - 86400000 * 3); // 3 days ago

const mockOrder = {
  order_id: "order-001",
  hold_status: { hold_end_date: pastDate.toISOString() },
  order_accepted: { status: "" },
  buyer_details: { name: "Buyer A", email: "buyer@example.com" },
  artwork_data: { title: "Artwork 1", art_id: "art-001" },
};

const mockDeclinedOrder = {
  ...mockOrder,
  order_accepted: { status: "declined" },
};

describe("GET /api/cron/orders/declineOrdersWithExpiredHoldStatus", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(connectMongoDB).mockResolvedValue({} as any);
    vi.mocked(CreateOrder.find).mockResolvedValueOnce([mockOrder] as any);
    vi.mocked(CreateOrder.bulkWrite).mockResolvedValue({
      modifiedCount: 1,
    } as any);
    vi.mocked(CreateOrder.find).mockResolvedValueOnce([mockDeclinedOrder] as any);
  });

  it("returns 200 with updated count on success", async () => {
    const response = await GET(makeRequest());
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.message).toContain("1 updated");
  });

  it("calls verifyAuthVercel to check authorization", async () => {
    await GET(makeRequest());
    expect(verifyAuthVercel).toHaveBeenCalledOnce();
  });

  it("calls connectMongoDB before querying", async () => {
    await GET(makeRequest());
    expect(connectMongoDB).toHaveBeenCalledOnce();
  });

  it("returns 200 with no-op message when no orders on hold", async () => {
    vi.mocked(CreateOrder.find).mockReset();
    vi.mocked(CreateOrder.find).mockResolvedValueOnce([] as any);

    const response = await GET(makeRequest());
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.message).toBe("No held orders found.");
  });

  it("returns 200 with no-op message when no holds are expired", async () => {
    const futureOrder = {
      ...mockOrder,
      hold_status: {
        hold_end_date: new Date(Date.now() + 86400000).toISOString(),
      },
    };
    vi.mocked(CreateOrder.find).mockReset();
    vi.mocked(CreateOrder.find).mockResolvedValueOnce([futureOrder] as any);

    const response = await GET(makeRequest());
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.message).toBe("No expired holds to process.");
  });

  it("calls bulkWrite with decline update for each expired hold", async () => {
    await GET(makeRequest());

    expect(CreateOrder.bulkWrite).toHaveBeenCalledOnce();
    const ops = vi.mocked(CreateOrder.bulkWrite).mock.calls[0][0];
    expect(ops[0].updateOne.update.$set).toMatchObject({
      status: "completed",
      "order_accepted.status": "declined",
    });
  });

  it("sends decline email for each updated order", async () => {
    await GET(makeRequest());

    expect(sendOrderDeclinedMail).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "Buyer A",
        email: "buyer@example.com",
        reason: "The payment period for this artwork has expired.",
      }),
    );
  });

  it("still returns 200 when decline email sending fails", async () => {
    vi.mocked(sendOrderDeclinedMail).mockRejectedValueOnce(
      new Error("Email failure"),
    );

    const response = await GET(makeRequest());
    expect(response.status).toBe(200);
  });

  it("returns error status when verifyAuthVercel throws", async () => {
    vi.mocked(verifyAuthVercel).mockRejectedValueOnce(new Error("Forbidden"));
    vi.mocked(handleErrorEdgeCases).mockReturnValueOnce({
      status: 403,
      message: "Forbidden",
    });

    const response = await GET(makeRequest());
    expect(response.status).toBe(403);
  });

  it("returns 500 when connectMongoDB throws", async () => {
    vi.mocked(connectMongoDB).mockRejectedValueOnce(new Error("DB error"));

    const response = await GET(makeRequest());
    expect(response.status).toBe(500);
  });

  it("returns 500 when CreateOrder.find throws", async () => {
    vi.mocked(CreateOrder.find).mockReset();
    vi.mocked(CreateOrder.find).mockRejectedValueOnce(new Error("Query error"));

    const response = await GET(makeRequest());
    expect(response.status).toBe(500);
  });

  it("returns 500 when bulkWrite throws", async () => {
    vi.mocked(CreateOrder.bulkWrite).mockRejectedValueOnce(
      new Error("Write error"),
    );

    const response = await GET(makeRequest());
    expect(response.status).toBe(500);
  });
});
