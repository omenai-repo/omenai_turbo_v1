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

vi.mock(
  "@omenai/shared-models/models/transactions/PurchaseTransactionSchema",
  () => ({
    PurchaseTransactions: {
      create: vi.fn(),
    },
  }),
);

vi.mock("../../../app/api/util", () => ({
  validateRequestBody: vi.fn(),
  createErrorRollbarReport: vi.fn(),
}));

import { POST } from "../../../app/api/transactions/createTransaction/route";
import { PurchaseTransactions } from "@omenai/shared-models/models/transactions/PurchaseTransactionSchema";
import { validateRequestBody } from "../../../app/api/util";

const validTransactionData = {
  trans_id: "PAY_OM_ABC123",
  trans_initiator_id: "buyer-001",
  trans_recipient_id: "gallery-001",
  trans_pricing: {
    unit_price: 1000,
    commission: 50,
    shipping_cost: 30,
    amount_total: 1100,
    tax_fees: 20,
    currency: "USD",
  },
  trans_date: new Date("2026-04-27T00:00:00Z"),
  trans_recipient_role: "gallery",
  status: "successful",
  provider: "flutterwave",
  order_id: "order-xyz-123",
};

function makeRequest(body: object): Request {
  return new Request("http://localhost/api/transactions/createTransaction", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/transactions/createTransaction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(validateRequestBody).mockResolvedValue(validTransactionData as any);
    vi.mocked(PurchaseTransactions.create).mockResolvedValue({ _id: "doc-abc" } as any);
  });

  it("returns 200 when transaction is created successfully", async () => {
    const response = await POST(makeRequest(validTransactionData));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.message).toBe("Transaction created");
  });

  it("calls PurchaseTransactions.create with validated data", async () => {
    await POST(makeRequest(validTransactionData));

    expect(PurchaseTransactions.create).toHaveBeenCalledWith(validTransactionData);
  });

  it("returns 500 when PurchaseTransactions.create returns falsy", async () => {
    vi.mocked(PurchaseTransactions.create).mockResolvedValueOnce(null as any);

    const response = await POST(makeRequest(validTransactionData));
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.message).toBeDefined();
  });

  it("returns 400 when validation fails", async () => {
    const validationError = new Error("Validation Failed: trans_id: Required");
    validationError.name = "BadRequestError";
    vi.mocked(validateRequestBody).mockRejectedValueOnce(validationError);

    const response = await POST(makeRequest({}));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.message).toMatch(/Validation Failed/i);
  });

  it("returns 500 when PurchaseTransactions.create throws", async () => {
    vi.mocked(PurchaseTransactions.create).mockRejectedValueOnce(
      new Error("DB write failed"),
    );

    const response = await POST(makeRequest(validTransactionData));

    expect(response.status).toBe(500);
  });

  it("returns 500 when connectMongoDB throws", async () => {
    const { connectMongoDB } = await import("@omenai/shared-lib/mongo_connect/mongoConnect");
    vi.mocked(connectMongoDB).mockRejectedValueOnce(new Error("Connection refused"));

    const response = await POST(makeRequest(validTransactionData));

    expect(response.status).toBe(500);
  });
});
