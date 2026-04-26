import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@omenai/shared-lib/auth/middleware/combined_middleware", () => ({
  withRateLimitHighlightAndCsrf: () => (fn: any) => fn,
}));

vi.mock("@omenai/shared-lib/auth/configs/rate_limit_configs", () => ({
  standardRateLimit: {},
}));

vi.mock("@omenai/shared-lib/mongo_connect/mongoConnect", () => ({
  connectMongoDB: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@omenai/shared-models/models/wallet/WalletSchema", () => ({
  Wallet: {
    findOne: vi.fn(),
    updateOne: vi.fn(),
  },
}));

vi.mock("../../../app/api/util", () => ({
  createErrorRollbarReport: vi.fn(),
}));

import { POST } from "../../../app/api/wallet/fund_wallet/route";
import { Wallet } from "@omenai/shared-models/models/wallet/WalletSchema";

function makeRequest(body: object): Request {
  return new Request("http://localhost/api/wallet/fund_wallet", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

const mockWallet = { owner_id: "artist-123", pending_balance: 0 };

describe("POST /api/wallet/fund_wallet", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(Wallet.findOne).mockResolvedValue(mockWallet);
    vi.mocked(Wallet.updateOne).mockResolvedValue({ modifiedCount: 1 } as any);
  });

  it("returns 200 when wallet is funded successfully", async () => {
    const response = await POST(
      makeRequest({ owner_id: "artist-123", amount: 500 }),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.message).toBe("Wallet funded");
    expect(Wallet.updateOne).toHaveBeenCalledWith(
      { owner_id: "artist-123" },
      { $inc: { pending_balance: 500 } },
    );
  });

  it("returns 404 when wallet does not exist for user", async () => {
    vi.mocked(Wallet.findOne).mockResolvedValue(null);

    const response = await POST(
      makeRequest({ owner_id: "ghost-user", amount: 100 }),
    );
    const body = await response.json();

    expect(response.status).toBe(404);
    expect(body.message).toMatch(/Wallet doesn't exists/i);
  });

  it("returns 500 when update modifiedCount is 0", async () => {
    vi.mocked(Wallet.updateOne).mockResolvedValue({ modifiedCount: 0 } as any);

    const response = await POST(
      makeRequest({ owner_id: "artist-123", amount: 100 }),
    );
    const body = await response.json();

    expect(response.status).toBe(500);
  });
});
