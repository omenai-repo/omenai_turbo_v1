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

vi.mock("@omenai/shared-models/models/wallet/WalletSchema", () => ({
  Wallet: {
    findOne: vi.fn(),
    updateOne: vi.fn(),
  },
}));

vi.mock("../../../app/api/util", async () => {
  const { buildValidateRequestBodyMock } = await import("../../helpers/util-mock");
  return buildValidateRequestBodyMock();
});

import { POST } from "../../../app/api/wallet/unlock_funds/route";
import { Wallet } from "@omenai/shared-models/models/wallet/WalletSchema";

function makeRequest(body: object): Request {
  return new Request("http://localhost/api/wallet/unlock_funds", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

const mockWallet = { owner_id: "artist-123", pending_balance: 500 };

describe("POST /api/wallet/unlock_funds", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(Wallet.findOne).mockResolvedValue(mockWallet);
    vi.mocked(Wallet.updateOne).mockResolvedValue({ modifiedCount: 1 } as any);
  });

  it("returns 200 when funds are credited to available balance", async () => {
    const response = await POST(
      makeRequest({ owner_id: "artist-123", amount: 200 }),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.message).toBe("Funds credited to available balance");
    expect(Wallet.updateOne).toHaveBeenCalledWith(
      { owner_id: "artist-123", pending_balance: { $gte: 200 } },
      { $inc: { pending_balance: -200, available_balance: 200 } },
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
      makeRequest({ owner_id: "artist-123", amount: 200 }),
    );
    const body = await response.json();

    expect(response.status).toBe(500);
  });

  it("returns 400 when owner_id is missing", async () => {
    const response = await POST(makeRequest({ amount: 100 }));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.message).toMatch(/Validation Failed/i);
  });

  it("returns 400 when amount is missing", async () => {
    const response = await POST(makeRequest({ owner_id: "artist-123" }));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.message).toMatch(/Validation Failed/i);
  });
});
