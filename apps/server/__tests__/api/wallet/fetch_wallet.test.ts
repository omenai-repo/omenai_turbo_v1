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
  },
}));

vi.mock("../../../app/api/util", async () => {
  const { buildValidateGetRouteParamsMock } = await import("../../helpers/util-mock");
  return buildValidateGetRouteParamsMock();
});

import { GET } from "../../../app/api/wallet/fetch_wallet/route";
import { Wallet } from "@omenai/shared-models/models/wallet/WalletSchema";

function makeRequest(ownerId?: string): Request {
  const url = ownerId
    ? `http://localhost/api/wallet/fetch_wallet?id=${ownerId}`
    : "http://localhost/api/wallet/fetch_wallet";
  return new Request(url, { method: "GET" });
}

const mockWallet = {
  wallet_id: "wallet-abc-123",
  owner_id: "artist-123",
  available_balance: 1000,
  pending_balance: 200,
};

describe("GET /api/wallet/fetch_wallet", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 200 with wallet data", async () => {
    vi.mocked(Wallet.findOne).mockResolvedValue(mockWallet);

    const response = await GET(makeRequest("artist-123"));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.message).toBe("Wallet validation fetched");
    expect(body.wallet).toEqual(mockWallet);
  });

  it("returns 404 when wallet does not exist for user", async () => {
    vi.mocked(Wallet.findOne).mockResolvedValue(null);

    const response = await GET(makeRequest("ghost-user"));
    const body = await response.json();

    expect(response.status).toBe(404);
    expect(body.message).toMatch(/Wallet doesn't exists/i);
  });

  it("returns 400 when id param is missing", async () => {
    const response = await GET(makeRequest());
    const body = await response.json();

    expect(response.status).toBe(400);
  });
});
