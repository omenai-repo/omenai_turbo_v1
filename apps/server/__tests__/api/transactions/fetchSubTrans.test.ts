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
  "@omenai/shared-models/models/transactions/SubscriptionTransactionSchema",
  () => ({
    SubscriptionTransactions: {
      find: vi.fn(),
    },
  }),
);

vi.mock("../../../app/api/util", async () => {
  const { buildValidateRequestBodyMock } = await import("../../helpers/util-mock");
  return buildValidateRequestBodyMock();
});

import { POST } from "../../../app/api/transactions/fetchSubTrans/route";
import { SubscriptionTransactions } from "@omenai/shared-models/models/transactions/SubscriptionTransactionSchema";

const mockSubTransactions = [
  {
    trans_id: "SUB_OM_001",
    gallery_id: "gallery-001",
    amount: 49,
    status: "successful",
    payment_ref: "ref-abc-001",
  },
  {
    trans_id: "SUB_OM_002",
    gallery_id: "gallery-001",
    amount: 49,
    status: "successful",
    payment_ref: "ref-abc-002",
  },
];

function makeRequest(body: object): Request {
  return new Request("http://localhost/api/transactions/fetchSubTrans", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/transactions/fetchSubTrans", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(SubscriptionTransactions.find).mockReturnValue({
      lean: vi.fn().mockResolvedValue(mockSubTransactions),
    } as any);
  });

  it("returns 200 with subscription transaction data", async () => {
    const response = await POST(makeRequest({ gallery_id: "gallery-001" }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.message).toBe("Transaction fetched");
    expect(body.data).toEqual(mockSubTransactions);
  });

  it("queries by gallery_id", async () => {
    await POST(makeRequest({ gallery_id: "gallery-001" }));

    expect(SubscriptionTransactions.find).toHaveBeenCalledWith({
      gallery_id: "gallery-001",
    });
  });

  it("returns 200 with empty array when gallery has no subscription transactions", async () => {
    vi.mocked(SubscriptionTransactions.find).mockReturnValue({
      lean: vi.fn().mockResolvedValue([]),
    } as any);

    const response = await POST(makeRequest({ gallery_id: "new-gallery" }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data).toEqual([]);
  });

  it("returns 400 when gallery_id is missing", async () => {
    const response = await POST(makeRequest({}));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.message).toMatch(/Validation Failed/i);
  });

  it("returns 500 when database query throws", async () => {
    vi.mocked(SubscriptionTransactions.find).mockReturnValue({
      lean: vi.fn().mockRejectedValue(new Error("DB connection lost")),
    } as any);

    const response = await POST(makeRequest({ gallery_id: "gallery-001" }));
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.message).toBeDefined();
  });
});
