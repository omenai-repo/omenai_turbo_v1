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

vi.mock("@omenai/shared-lib/configcat/configCatFetch", () => ({
  fetchConfigCatValue: vi.fn(),
}));

vi.mock("../../../app/api/util", async () => {
  const { buildValidateRequestBodyMock } = await import("../../helpers/util-mock");
  return buildValidateRequestBodyMock();
});

import { POST } from "../../../app/api/wallet/add_primary_account/route";
import { Wallet } from "@omenai/shared-models/models/wallet/WalletSchema";
import { fetchConfigCatValue } from "@omenai/shared-lib/configcat/configCatFetch";

function makeRequest(body: object): Request {
  return new Request("http://localhost/api/wallet/add_primary_account", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

const ukAccountBody = {
  owner_id: "artist-123",
  base_currency: "GBP",
  account_details: {
    type: "uk",
    account_number: "12345678",
    sort_code: "20-30-40",
    account_name: "John Doe",
    bank_country: "GB",
  },
};

const africaAccountBody = {
  owner_id: "artist-123",
  base_currency: "NGN",
  account_details: {
    type: "africa",
    account_number: "0123456789",
    bank_name: "Zenith Bank",
    account_name: "John Doe",
    bank_code: "057",
    bank_country: "NG",
  },
};

describe("POST /api/wallet/add_primary_account", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(fetchConfigCatValue).mockResolvedValue(true as any);
    vi.mocked(Wallet.findOne).mockResolvedValue({
      owner_id: "artist-123",
      primary_withdrawal_account: null,
    });
    vi.mocked(Wallet.updateOne).mockResolvedValue({ modifiedCount: 1 } as any);
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({ data: { id: 12345 } }),
    } as any);
  });

  it("returns 200 when UK account is added (bypasses FLW API)", async () => {
    const response = await POST(makeRequest(ukAccountBody));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.message).toBe("Primary account added successfully");
    expect(Wallet.updateOne).toHaveBeenCalledOnce();
  });

  it("returns 200 when Africa account is added via FLW API", async () => {
    const response = await POST(makeRequest(africaAccountBody));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.message).toBe("Primary account added successfully");
    expect(global.fetch).toHaveBeenCalledWith(
      "https://api.flutterwave.com/v3/beneficiaries",
      expect.objectContaining({ method: "POST" }),
    );
  });

  it("returns 503 when wallet feature is disabled", async () => {
    vi.mocked(fetchConfigCatValue).mockResolvedValue(false as any);

    const response = await POST(makeRequest(ukAccountBody));
    const body = await response.json();

    expect(response.status).toBe(503);
  });

  it("returns 404 when wallet does not exist for user", async () => {
    vi.mocked(Wallet.findOne).mockResolvedValue(null);

    const response = await POST(makeRequest(ukAccountBody));
    const body = await response.json();

    expect(response.status).toBe(404);
    expect(body.message).toMatch(/Wallet doesn't exist/i);
  });

  it("returns 400 when same UK account already exists", async () => {
    vi.mocked(Wallet.findOne).mockResolvedValue({
      owner_id: "artist-123",
      primary_withdrawal_account: {
        type: "uk",
        account_number: "12345678",
        sort_code: "20-30-40",
      },
    });

    const response = await POST(makeRequest(ukAccountBody));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.message).toMatch(/already exists/i);
  });

  it("returns 400 when FLW API returns error for Africa account", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      json: vi.fn().mockResolvedValue({ message: "Invalid account details" }),
    } as any);

    const response = await POST(makeRequest(africaAccountBody));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.message).toBe("Invalid account details");
  });

  it("returns 500 when Wallet.updateOne modifiedCount is 0", async () => {
    vi.mocked(Wallet.updateOne).mockResolvedValue({ modifiedCount: 0 } as any);

    const response = await POST(makeRequest(ukAccountBody));
    const body = await response.json();

    expect(response.status).toBe(500);
  });

  it("returns 400 when account_details type is invalid", async () => {
    const response = await POST(
      makeRequest({
        ...ukAccountBody,
        account_details: { type: "crypto", address: "0x123" },
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.message).toMatch(/Validation Failed/i);
  });
});
