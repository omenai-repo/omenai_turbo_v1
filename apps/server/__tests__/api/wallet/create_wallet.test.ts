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
    create: vi.fn(),
  },
}));

vi.mock("@omenai/shared-lib/configcat/configCatFetch", () => ({
  fetchConfigCatValue: vi.fn(),
}));

vi.mock("../../../app/api/util", async () => {
  const { buildValidateRequestBodyMock } = await import("../../helpers/util-mock");
  return buildValidateRequestBodyMock();
});

import { POST } from "../../../app/api/wallet/create_wallet/route";
import { Wallet } from "@omenai/shared-models/models/wallet/WalletSchema";
import { fetchConfigCatValue } from "@omenai/shared-lib/configcat/configCatFetch";

function makeRequest(body: object): Request {
  return new Request("http://localhost/api/wallet/create_wallet", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

const validBody = {
  owner_id: "artist-123",
  base_currency: "USD",
};

describe("POST /api/wallet/create_wallet", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(fetchConfigCatValue).mockResolvedValue(true as any);
    vi.mocked(Wallet.create).mockResolvedValue({ wallet_id: "wallet-new" } as any);
  });

  it("returns 200 when wallet is created successfully", async () => {
    const response = await POST(makeRequest(validBody));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.message).toBe("Wallet created");
    expect(Wallet.create).toHaveBeenCalledWith({
      owner_id: validBody.owner_id,
      base_currency: validBody.base_currency,
    });
  });

  it("returns 503 when wallet withdrawal feature is disabled", async () => {
    vi.mocked(fetchConfigCatValue).mockResolvedValue(false as any);

    const response = await POST(makeRequest(validBody));
    const body = await response.json();

    expect(response.status).toBe(503);
  });

  it("returns 500 when Wallet.create returns falsy", async () => {
    vi.mocked(Wallet.create).mockResolvedValue(null as any);

    const response = await POST(makeRequest(validBody));
    const body = await response.json();

    expect(response.status).toBe(500);
  });

  it("returns 400 when owner_id is missing", async () => {
    const response = await POST(makeRequest({ base_currency: "USD" }));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.message).toMatch(/Validation Failed/i);
  });
});
