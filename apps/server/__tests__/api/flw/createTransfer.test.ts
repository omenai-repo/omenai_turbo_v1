import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

vi.mock("@omenai/shared-lib/auth/middleware/combined_middleware", () => ({
  withRateLimitHighlightAndCsrf: () => (fn: any) => fn,
}));

vi.mock("@omenai/shared-lib/auth/configs/rate_limit_configs", () => ({
  strictRateLimit: {},
}));

vi.mock("@omenai/shared-lib/mongo_connect/mongoConnect", () => ({
  connectMongoDB: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@omenai/shared-lib/configcat/configCatFetch", () => ({
  fetchConfigCatValue: vi.fn().mockResolvedValue(true),
}));

vi.mock("bcrypt", () => ({
  default: { compareSync: vi.fn().mockReturnValue(true) },
}));

vi.mock("@omenai/shared-utils/src/generateToken", () => ({
  generateAlphaDigit: vi.fn().mockReturnValue("ABC123DEF456"),
}));

vi.mock("@omenai/shared-models/models/wallet/WalletSchema", () => ({
  Wallet: {
    findOne: vi.fn(),
    findOneAndUpdate: vi.fn(),
    updateOne: vi.fn(),
  },
}));

vi.mock("@omenai/shared-models/models/wallet/WalletTransactionSchema", () => ({
  WalletTransaction: { updateOne: vi.fn() },
}));

vi.mock("@omenai/url-config/src/config", () => ({
  getApiUrl: vi.fn().mockReturnValue("https://api.omenai.com"),
}));

vi.mock("../../../app/api/util", () => ({
  createErrorRollbarReport: vi.fn(),
}));

import { POST } from "../../../app/api/flw/createTransfer/route";
import { fetchConfigCatValue } from "@omenai/shared-lib/configcat/configCatFetch";
import { Wallet } from "@omenai/shared-models/models/wallet/WalletSchema";
import { WalletTransaction } from "@omenai/shared-models/models/wallet/WalletTransactionSchema";
import bcrypt from "bcrypt";

const mockWallet = {
  available_balance: 500,
  wallet_pin: "$2b$10$hashedpin",
  base_currency: "USD",
  primary_withdrawal_account: {
    type: "us",
    account_name: "John Doe",
    account_number: "123456789",
    routing_number: "021000021",
    bank_name: "Chase Bank",
  },
};

const mockReservedWallet = { ...mockWallet, available_balance: 400 };
const mockTransferResult = {
  status: "success",
  data: { id: "transfer-123" },
};

function makeRequest(body: object): Request {
  return new Request("http://localhost/api/flw/createTransfer", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/flw/createTransfer", () => {
  let fetchSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(fetchConfigCatValue).mockResolvedValue(true);
    vi.mocked(Wallet.findOne).mockResolvedValue(mockWallet as any);
    vi.mocked(Wallet.findOneAndUpdate).mockResolvedValue(mockReservedWallet as any);
    vi.mocked(Wallet.updateOne).mockResolvedValue({ acknowledged: true } as any);
    vi.mocked(WalletTransaction.updateOne).mockResolvedValue({ acknowledged: true } as any);
    vi.mocked(bcrypt.compareSync).mockReturnValue(true);
    fetchSpy = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue(mockTransferResult),
    });
    vi.stubGlobal("fetch", fetchSpy);
    process.env.FLW_SECRET_KEY = "test-flw-key";
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns 200 with transfer initiated message on success", async () => {
    const response = await POST(
      makeRequest({ amount: 100, wallet_id: "wallet-001", wallet_pin: "1234" }),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.message).toBe("Transfer initiated successfully");
  });

  it("returns 503 when wallet_withdrawal_enabled is disabled", async () => {
    vi.mocked(fetchConfigCatValue).mockResolvedValue(false);

    const response = await POST(
      makeRequest({ amount: 100, wallet_id: "wallet-001", wallet_pin: "1234" }),
    );
    const body = await response.json();

    expect(response.status).toBe(503);
  });

  it("returns 400 when required body params are missing", async () => {
    const response = await POST(makeRequest({ amount: 100 }));
    const body = await response.json();

    expect(response.status).toBe(400);
  });

  it("returns 404 when wallet is not found", async () => {
    vi.mocked(Wallet.findOne).mockResolvedValue(null);

    const response = await POST(
      makeRequest({ amount: 100, wallet_id: "wallet-001", wallet_pin: "1234" }),
    );
    const body = await response.json();

    expect(response.status).toBe(404);
  });

  it("returns 403 when wallet pin is incorrect", async () => {
    vi.mocked(bcrypt.compareSync).mockReturnValue(false);

    const response = await POST(
      makeRequest({ amount: 100, wallet_id: "wallet-001", wallet_pin: "wrong" }),
    );
    const body = await response.json();

    expect(response.status).toBe(403);
  });

  it("returns 403 when balance is insufficient for transfer", async () => {
    vi.mocked(Wallet.findOneAndUpdate).mockResolvedValue(null);
    vi.mocked(Wallet.findOne).mockResolvedValue({
      ...mockWallet,
      available_balance: 50,
    } as any);

    const response = await POST(
      makeRequest({ amount: 100, wallet_id: "wallet-001", wallet_pin: "1234" }),
    );
    const body = await response.json();

    expect(response.status).toBe(403);
  });

  it("returns 400 when FLW transfer API rejects the request", async () => {
    fetchSpy.mockResolvedValue({
      ok: false,
      json: vi.fn().mockResolvedValue({ status: "error", message: "Invalid account" }),
    });

    const response = await POST(
      makeRequest({ amount: 100, wallet_id: "wallet-001", wallet_pin: "1234" }),
    );
    const body = await response.json();

    expect(response.status).toBe(400);
  });

  it("logs the transaction in WalletTransaction on success", async () => {
    await POST(makeRequest({ amount: 100, wallet_id: "wallet-001", wallet_pin: "1234" }));

    expect(WalletTransaction.updateOne).toHaveBeenCalledWith(
      expect.objectContaining({ wallet_id: "wallet-001" }),
      expect.objectContaining({ $setOnInsert: expect.objectContaining({ trans_amount: 100 }) }),
      { upsert: true },
    );
  });
});
