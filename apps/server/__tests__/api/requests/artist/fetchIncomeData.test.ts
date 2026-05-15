import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@omenai/shared-models/models/transactions/PurchaseTransactionSchema", () => ({
  PurchaseTransactions: { aggregate: vi.fn() },
}));
vi.mock("../../../../app/api/util", async () => {
  const { buildValidateGetRouteParamsMock } = await import("../../../helpers/util-mock");
  return buildValidateGetRouteParamsMock();
});

import { GET } from "../../../../app/api/requests/artist/fetchIncomeData/route";
import { PurchaseTransactions } from "@omenai/shared-models/models/transactions/PurchaseTransactionSchema";

function makeRequest(id?: string) {
  const url = `http://localhost/api/requests/artist/fetchIncomeData${id ? `?id=${id}` : ""}`;
  return new Request(url, { method: "GET" });
}

describe("GET /api/requests/artist/fetchIncomeData", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 200 with income data when transactions exist", async () => {
    vi.mocked(PurchaseTransactions.aggregate).mockResolvedValue([
      { salesRevenue: 10000, netIncome: 8500 },
    ] as any);

    const response = await GET(makeRequest("artist-1"));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.message).toBe("Income data fetched successfully");
    expect(body.data).toEqual({ salesRevenue: 10000, netIncome: 8500 });
  });

  it("returns zero values when no transactions exist", async () => {
    vi.mocked(PurchaseTransactions.aggregate).mockResolvedValue([] as any);

    const response = await GET(makeRequest("artist-new"));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data).toEqual({ netIncome: 0, salesRevenue: 0 });
  });

  it("calls PurchaseTransactions.aggregate with a $match stage for the artist id", async () => {
    vi.mocked(PurchaseTransactions.aggregate).mockResolvedValue([
      { salesRevenue: 10000, netIncome: 8500 },
    ] as any);

    await GET(makeRequest("artist-1"));

    expect(PurchaseTransactions.aggregate).toHaveBeenCalledOnce();
    const pipeline = vi.mocked(PurchaseTransactions.aggregate).mock.calls[0][0];
    expect(pipeline[0].$match).toEqual(
      expect.objectContaining({ trans_recipient_id: "artist-1" }),
    );
  });

  it("returns 400 when id param is missing", async () => {
    const response = await GET(makeRequest());
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.message).toBe("Invalid URL parameters");
  });
});
