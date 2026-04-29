import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@omenai/shared-lib/auth/middleware/rate_limit_middleware", () => ({
  withRateLimit: () => (fn: any) => fn,
}));

vi.mock("@omenai/shared-lib/auth/configs/rate_limit_configs", () => ({
  standardRateLimit: {},
}));

vi.mock("@omenai/shared-lib/mongo_connect/mongoConnect", () => ({
  connectMongoDB: vi.fn(),
}));

vi.mock(
  "@omenai/shared-models/models/transactions/PaymentLedgerShema",
  () => ({
    PaymentLedger: {
      find: vi.fn(),
      updateOne: vi.fn(),
    },
  }),
);

vi.mock("@omenai/upstash-config", () => ({
  createWorkflow: vi.fn().mockResolvedValue("workflow-id-123"),
}));

vi.mock("@omenai/shared-utils/src/toUtcDate", () => ({
  toUTCDate: vi.fn((d) => d),
}));

vi.mock("@omenai/shared-utils/src/getCurrentDateTime", () => ({
  getFormattedDateTime: vi.fn().mockReturnValue("2026-04-23T00:00:00Z"),
}));

vi.mock("../../../../app/api/cron/utils", () => ({
  verifyAuthVercel: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("../../../../app/api/util", () => ({
  retry: vi.fn((fn: () => Promise<any>) => fn()),
  createErrorRollbarReport: vi.fn(),
}));

vi.mock("../../../../custom/errors/handler/errorHandler", () => ({
  handleErrorEdgeCases: vi
    .fn()
    .mockReturnValue({ status: 500, message: "Internal Server Error" }),
}));

import { GET } from "../../../../app/api/cron/payment/resolvePaymentFulfillments/route";
import { PaymentLedger } from "@omenai/shared-models/models/transactions/PaymentLedgerShema";
import { createWorkflow } from "@omenai/upstash-config";
import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { verifyAuthVercel } from "../../../../app/api/cron/utils";

function makeRequest(): Request {
  return new Request(
    "http://localhost/api/cron/payment/resolvePaymentFulfillments",
    { method: "GET", headers: { Authorization: "Bearer test-secret" } },
  );
}

const mockFlutterwavePayment = {
  provider: "flutterwave",
  provider_tx_id: "flw-tx-001",
  payment_fulfillment_checks_done: false,
  reconciliation_attempts: 0,
  payload: {
    meta: { order_id: "order-001" },
    paymentObj: { id: "flw-123" },
  },
};

const mockStripePayment = {
  provider: "stripe",
  provider_tx_id: "stripe-tx-001",
  payment_fulfillment_checks_done: false,
  reconciliation_attempts: 0,
  payload: {
    meta: { order_id: "order-002" },
    paymentObj: { id: "pi_stripe_123" },
  },
};

function makeLedgerFindChain(data: any[]) {
  return {
    limit: vi.fn().mockReturnValue({
      lean: vi.fn().mockResolvedValue(data),
    }),
  };
}

describe("GET /api/cron/payment/resolvePaymentFulfillments", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(connectMongoDB).mockResolvedValue({} as any);
    vi.mocked(PaymentLedger.find).mockReturnValue(
      makeLedgerFindChain([]) as any,
    );
    vi.mocked(PaymentLedger.updateOne).mockResolvedValue({
      modifiedCount: 1,
    } as any);
  });

  it("returns 200 with no-op message when no unresolved payments", async () => {
    const response = await GET(makeRequest());
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.message).toBe("No unresolved payments to handle");
  });

  it("calls verifyAuthVercel to check authorization", async () => {
    await GET(makeRequest());
    expect(verifyAuthVercel).toHaveBeenCalledOnce();
  });

  it("calls connectMongoDB before querying", async () => {
    await GET(makeRequest());
    expect(connectMongoDB).toHaveBeenCalledOnce();
  });

  it("queries payments with reconciliation_attempts < 5", async () => {
    await GET(makeRequest());

    expect(PaymentLedger.find).toHaveBeenCalledWith(
      expect.objectContaining({
        payment_fulfillment_checks_done: false,
        reconciliation_attempts: { $lt: 5 },
      }),
    );
  });

  it("returns 200 after processing payments", async () => {
    vi.mocked(PaymentLedger.find).mockReturnValue(
      makeLedgerFindChain([mockFlutterwavePayment]) as any,
    );

    const response = await GET(makeRequest());
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.message).toBe("Payment reconciliation attemped successfully");
  });

  it("increments reconciliation_attempts for each payment", async () => {
    vi.mocked(PaymentLedger.find).mockReturnValue(
      makeLedgerFindChain([mockFlutterwavePayment]) as any,
    );

    await GET(makeRequest());

    expect(PaymentLedger.updateOne).toHaveBeenCalledWith(
      expect.objectContaining({ provider_tx_id: "flw-tx-001" }),
      expect.objectContaining({ $inc: { reconciliation_attempts: 1 } }),
    );
  });

  it("creates flutterwave workflow for flutterwave payments", async () => {
    vi.mocked(PaymentLedger.find).mockReturnValue(
      makeLedgerFindChain([mockFlutterwavePayment]) as any,
    );

    await GET(makeRequest());

    expect(createWorkflow).toHaveBeenCalledWith(
      "/api/workflows/payment/handleArtworkPaymentUpdatesByFlw",
      expect.stringContaining("flw_payment_workflow_"),
      expect.any(String),
    );
  });

  it("creates stripe workflow for stripe payments", async () => {
    vi.mocked(PaymentLedger.find).mockReturnValue(
      makeLedgerFindChain([mockStripePayment]) as any,
    );

    await GET(makeRequest());

    expect(createWorkflow).toHaveBeenCalledWith(
      "/api/workflows/payment/handleArtworkPaymentUpdateByStripe",
      expect.stringContaining("stripe_payment_workflow_"),
      expect.any(String),
    );
  });

  it("skips workflow creation when updateOne modifiedCount is 0 (race condition)", async () => {
    vi.mocked(PaymentLedger.find).mockReturnValue(
      makeLedgerFindChain([mockFlutterwavePayment]) as any,
    );
    vi.mocked(PaymentLedger.updateOne).mockResolvedValue({
      modifiedCount: 0,
    } as any);

    await GET(makeRequest());

    expect(createWorkflow).not.toHaveBeenCalled();
  });

  it("sets needs_manual_review when attempts reach 5", async () => {
    const nearMaxPayment = { ...mockFlutterwavePayment, reconciliation_attempts: 4 };
    vi.mocked(PaymentLedger.find).mockReturnValue(
      makeLedgerFindChain([nearMaxPayment]) as any,
    );

    await GET(makeRequest());

    expect(PaymentLedger.updateOne).toHaveBeenCalledWith(
      expect.any(Object),
      expect.objectContaining({
        $set: expect.objectContaining({ needs_manual_review: true }),
      }),
    );
  });

  it("returns 500 when verifyAuthVercel throws", async () => {
    vi.mocked(verifyAuthVercel).mockRejectedValueOnce(new Error("Forbidden"));

    const response = await GET(makeRequest());
    expect(response.status).toBe(500);
  });

  it("returns 500 when connectMongoDB throws", async () => {
    vi.mocked(connectMongoDB).mockRejectedValueOnce(new Error("DB error"));

    const response = await GET(makeRequest());
    expect(response.status).toBe(500);
  });

  it("returns 500 when PaymentLedger.find throws", async () => {
    vi.mocked(PaymentLedger.find).mockReturnValue({
      limit: vi.fn().mockReturnValue({
        lean: vi.fn().mockRejectedValue(new Error("Query failed")),
      }),
    } as any);

    const response = await GET(makeRequest());
    expect(response.status).toBe(500);
  });

  it("continues processing when createWorkflow throws (non-fatal)", async () => {
    vi.mocked(PaymentLedger.find).mockReturnValue(
      makeLedgerFindChain([mockFlutterwavePayment]) as any,
    );
    vi.mocked(createWorkflow).mockRejectedValueOnce(new Error("Workflow error"));

    const response = await GET(makeRequest());
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.message).toBe("Payment reconciliation attemped successfully");
  });
});
