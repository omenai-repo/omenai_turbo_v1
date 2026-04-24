import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@omenai/shared-lib/auth/middleware/combined_middleware", () => ({
  withRateLimitHighlightAndCsrf: () => (fn: any) => fn,
}));

vi.mock("@omenai/shared-lib/auth/configs/rate_limit_configs", () => ({
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
  connectMongoDB: vi.fn().mockResolvedValue(undefined),
}));

vi.mock(
  "@omenai/shared-models/models/wallet/WalletTransactionSchema",
  () => ({
    WalletTransaction: {
      find: vi.fn(),
      countDocuments: vi.fn(),
    },
  }),
);

vi.mock("@omenai/rollbar-config", () => ({
  rollbarServerInstance: { error: vi.fn() },
}));

vi.mock("../../../app/api/util", () => {
  class BadRequestError extends Error {
    constructor(message: string) {
      super(message);
      this.name = "BadRequestError";
    }
  }

  return {
    validateGetRouteParams: vi
      .fn()
      .mockImplementation((schema: any, data: any) => {
        const result = schema.safeParse(data);
        if (!result.success)
          throw new BadRequestError("Invalid URL parameters");
        return data;
      }),
    createErrorRollbarReport: vi.fn(),
  };
});

import { GET } from "../../../app/api/wallet/fetch_wallet_transactions/route";
import { WalletTransaction } from "@omenai/shared-models/models/wallet/WalletTransactionSchema";

function makeRequest(params: Record<string, string> = {}): Request {
  const defaults = { id: "wallet-abc", year: "2024" };
  const merged = { ...defaults, ...params };
  const url = new URL("http://localhost/api/wallet/fetch_wallet_transactions");
  Object.entries(merged).forEach(([k, v]) => url.searchParams.set(k, v));
  return new Request(url.toString(), { method: "GET" });
}

const mockTransactions = [
  { trans_id: "tx-1", amount: 100, trans_status: "SUCCESSFUL" },
  { trans_id: "tx-2", amount: 50, trans_status: "PENDING" },
];

function mockQueryChain(result: any[]) {
  const chain = {
    skip: vi.fn().mockReturnThis(),
    sort: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    exec: vi.fn().mockResolvedValue(result),
  };
  vi.mocked(WalletTransaction.find).mockReturnValue(chain as any);
  return chain;
}

describe("GET /api/wallet/fetch_wallet_transactions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(WalletTransaction.countDocuments).mockResolvedValue(2);
  });

  it("returns 200 with transactions and page count", async () => {
    mockQueryChain(mockTransactions);

    const response = await GET(makeRequest());
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.message).toBe("Wallet transactions retrieved successfully");
    expect(body.data).toEqual(mockTransactions);
    expect(body.pageCount).toBe(1);
  });

  it("returns 200 when filtering by valid status", async () => {
    mockQueryChain([mockTransactions[0]]);
    vi.mocked(WalletTransaction.countDocuments).mockResolvedValue(1);

    const response = await GET(makeRequest({ status: "successful" }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data).toEqual([mockTransactions[0]]);
  });

  it("returns 400 when year param is not a number", async () => {
    mockQueryChain([]);

    const response = await GET(makeRequest({ year: "not-a-number" }));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.message).toMatch(/numerical/i);
  });

  it("returns 400 when status is an invalid value", async () => {
    mockQueryChain([]);

    const response = await GET(makeRequest({ status: "invalid_status" }));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.message).toMatch(/Invalid 'status' param/i);
  });

  it("returns 200 with all transactions when status is 'all'", async () => {
    mockQueryChain(mockTransactions);

    const response = await GET(makeRequest({ status: "all" }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data).toEqual(mockTransactions);
  });
});
