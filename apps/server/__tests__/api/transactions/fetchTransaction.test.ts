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

vi.mock(
  "@omenai/shared-models/models/transactions/PurchaseTransactionSchema",
  () => ({
    PurchaseTransactions: {
      find: vi.fn(),
    },
  }),
);

vi.mock("../../../app/api/util", async () => {
  const { buildValidateRequestBodyMock } = await import("../../helpers/util-mock");
  return buildValidateRequestBodyMock();
});

import { POST } from "../../../app/api/transactions/fetchTransaction/route";
import { PurchaseTransactions } from "@omenai/shared-models/models/transactions/PurchaseTransactionSchema";

const mockTransactions = [
  {
    trans_id: "PAY_OM_001",
    trans_recipient_id: "gallery-001",
    status: "successful",
    provider: "flutterwave",
  },
  {
    trans_id: "PAY_OM_002",
    trans_recipient_id: "gallery-001",
    status: "successful",
    provider: "stripe",
  },
];

function makeRequest(body: object): Request {
  return new Request("http://localhost/api/transactions/fetchTransaction", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

function makeChain(data: any[]) {
  return {
    sort: vi.fn().mockReturnValue({
      lean: vi.fn().mockResolvedValue(data),
    }),
  };
}

describe("POST /api/transactions/fetchTransaction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(PurchaseTransactions.find).mockReturnValue(makeChain(mockTransactions) as any);
  });

  it("returns 200 with transaction data", async () => {
    const response = await POST(makeRequest({ trans_recipient_id: "gallery-001" }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.message).toBe("Transaction fetched");
    expect(body.data).toEqual(mockTransactions);
  });

  it("queries by trans_recipient_id", async () => {
    await POST(makeRequest({ trans_recipient_id: "gallery-001" }));

    expect(PurchaseTransactions.find).toHaveBeenCalledWith({
      trans_recipient_id: "gallery-001",
    });
  });

  it("sorts results by createdAt descending", async () => {
    const leanMock = vi.fn().mockResolvedValue(mockTransactions);
    const sortMock = vi.fn().mockReturnValue({ lean: leanMock });
    vi.mocked(PurchaseTransactions.find).mockReturnValue({ sort: sortMock } as any);

    await POST(makeRequest({ trans_recipient_id: "gallery-001" }));

    expect(sortMock).toHaveBeenCalledWith({ createdAt: -1 });
  });

  it("returns 200 with empty array when no transactions found", async () => {
    vi.mocked(PurchaseTransactions.find).mockReturnValue(makeChain([]) as any);

    const response = await POST(makeRequest({ trans_recipient_id: "new-gallery" }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data).toEqual([]);
  });

  it("returns 400 when trans_recipient_id is missing", async () => {
    const response = await POST(makeRequest({}));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.message).toMatch(/Validation Failed/i);
  });

  it("returns 500 when database query throws", async () => {
    vi.mocked(PurchaseTransactions.find).mockReturnValue({
      sort: vi.fn().mockReturnValue({
        lean: vi.fn().mockRejectedValue(new Error("DB error")),
      }),
    } as any);

    const response = await POST(makeRequest({ trans_recipient_id: "gallery-001" }));
    const body = await response.json();

    expect(response.status).toBe(500);
  });
});
