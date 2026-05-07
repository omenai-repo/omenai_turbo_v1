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

vi.mock("bcrypt", () => ({
  default: { compareSync: vi.fn() },
}));

vi.mock("@omenai/shared-lib/hash/hashPassword", () => ({
  hashPassword: vi.fn().mockResolvedValue("$2b$10$hashedpin"),
}));

vi.mock("@omenai/shared-utils/src/checkIfPinRepeating", () => ({
  isRepeatingOrConsecutive: vi.fn(),
}));

vi.mock("../../../app/api/util", async () => {
  const { buildValidateRequestBodyMock } = await import("../../helpers/util-mock");
  return buildValidateRequestBodyMock();
});

import { POST } from "../../../app/api/wallet/update_wallet_pin/route";
import { Wallet } from "@omenai/shared-models/models/wallet/WalletSchema";
import bcrypt from "bcrypt";
import { isRepeatingOrConsecutive } from "@omenai/shared-utils/src/checkIfPinRepeating";

function makeRequest(body: object): Request {
  return new Request("http://localhost/api/wallet/update_wallet_pin", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

const mockWallet = {
  wallet_id: "wallet-abc",
  wallet_pin: "$2b$10$existinghashedpin",
};

describe("POST /api/wallet/update_wallet_pin", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(isRepeatingOrConsecutive).mockReturnValue(false);
    vi.mocked(Wallet.findOne).mockReturnValue({
      exec: vi.fn().mockResolvedValue(mockWallet),
    } as any);
    vi.mocked(bcrypt.compareSync).mockReturnValue(false as never);
    vi.mocked(Wallet.updateOne).mockResolvedValue({ modifiedCount: 1 } as any);
  });

  it("returns 201 when wallet pin is updated successfully", async () => {
    const response = await POST(
      makeRequest({ wallet_id: "wallet-abc", pin: "5678" }),
    );
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(body.message).toBe("Wallet pin updated successfully");
  });

  it("returns 403 when pin is repeating or consecutive", async () => {
    vi.mocked(isRepeatingOrConsecutive).mockReturnValue(true);

    const response = await POST(
      makeRequest({ wallet_id: "wallet-abc", pin: "1111" }),
    );
    const body = await response.json();

    expect(response.status).toBe(403);
    expect(body.message).toMatch(/repeating or consecutive/i);
  });

  it("returns 404 when wallet is not found", async () => {
    vi.mocked(Wallet.findOne).mockReturnValue({
      exec: vi.fn().mockResolvedValue(null),
    } as any);

    const response = await POST(
      makeRequest({ wallet_id: "ghost-wallet", pin: "5678" }),
    );
    const body = await response.json();

    expect(response.status).toBe(404);
    expect(body.message).toMatch(/Wallet not found/i);
  });

  it("returns 409 when new pin matches existing pin", async () => {
    vi.mocked(bcrypt.compareSync).mockReturnValue(true as never);

    const response = await POST(
      makeRequest({ wallet_id: "wallet-abc", pin: "5678" }),
    );
    const body = await response.json();

    expect(response.status).toBe(409);
    expect(body.message).toMatch(/identical to your previous/i);
  });

  it("returns 500 when updateOne modifiedCount is 0", async () => {
    vi.mocked(Wallet.updateOne).mockResolvedValue({ modifiedCount: 0 } as any);

    const response = await POST(
      makeRequest({ wallet_id: "wallet-abc", pin: "5678" }),
    );

    expect(response.status).toBe(500);
  });

  it("returns 400 when wallet_id is missing", async () => {
    const response = await POST(makeRequest({ pin: "5678" }));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.message).toMatch(/Validation Failed/i);
  });

  it("skips pin comparison when wallet has no existing pin", async () => {
    vi.mocked(Wallet.findOne).mockReturnValue({
      exec: vi.fn().mockResolvedValue({ wallet_id: "wallet-abc", wallet_pin: null }),
    } as any);

    const response = await POST(
      makeRequest({ wallet_id: "wallet-abc", pin: "5678" }),
    );

    expect(response.status).toBe(201);
    expect(bcrypt.compareSync).not.toHaveBeenCalled();
  });
});
