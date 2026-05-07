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
vi.mock("@omenai/shared-models/models/auth/ArtistSchema", () => ({
  AccountArtist: { findOne: vi.fn() },
}));
vi.mock("@omenai/shared-models/models/orders/CreateOrderSchema", () => ({
  CreateOrder: { findOne: vi.fn() },
}));
vi.mock("@omenai/shared-models/models/deletion/DeletionRequestSchema", () => ({
  DeletionRequestModel: { findOne: vi.fn() },
}));
vi.mock("@omenai/shared-lib/encryption/encrypt_email", () => ({
  hashEmail: vi.fn().mockReturnValue("hashed@example.com"),
}));
vi.mock("../../../../app/api/requests/utils", () => ({
  hasFinancialCommitments: vi.fn(),
  generateDeletionCommitments: vi.fn(),
  createDeletionRequestAndRespond: vi.fn(),
}));
vi.mock("../../../../app/api/util", async () => {
  const { buildValidateRequestBodyMock } = await import("../../../helpers/util-mock");
  return buildValidateRequestBodyMock();
});

import { DELETE } from "../../../../app/api/requests/artist/deleteAccount/route";
import { AccountArtist } from "@omenai/shared-models/models/auth/ArtistSchema";
import { CreateOrder } from "@omenai/shared-models/models/orders/CreateOrderSchema";
import { DeletionRequestModel } from "@omenai/shared-models/models/deletion/DeletionRequestSchema";
import {
  hasFinancialCommitments,
  generateDeletionCommitments,
  createDeletionRequestAndRespond,
} from "../../../../app/api/requests/utils";

function makeRequest(body: object) {
  return new Request("http://localhost/api/requests/artist/deleteAccount", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

const mockArtist = {
  artist_id: "artist-1",
  wallet_id: "wallet-1",
  email: "artist@example.com",
};

describe("DELETE /api/requests/artist/deleteAccount", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 202 when deletion can proceed with no commitments", async () => {
    vi.mocked(AccountArtist.findOne).mockResolvedValue(mockArtist as any);
    vi.mocked(DeletionRequestModel.findOne).mockResolvedValue(null);
    vi.mocked(CreateOrder.findOne).mockResolvedValue(null);
    vi.mocked(hasFinancialCommitments).mockResolvedValue({
      hasPendingTransactions: false,
      hasPositiveBalance: false,
    });
    vi.mocked(generateDeletionCommitments).mockReturnValue({
      can_delete: true,
      reasons: [],
    } as any);
    vi.mocked(createDeletionRequestAndRespond).mockResolvedValue(
      new Date("2025-06-01") as any,
    );

    const response = await DELETE(makeRequest({ id: "artist-1", reason: "Moving on" }));
    const body = await response.json();

    expect(response.status).toBe(202);
    expect(body.message).toBe("Account deletion initiated");
    expect(body.can_delete).toBe(true);
  });

  it("returns 409 when account has active commitments", async () => {
    vi.mocked(AccountArtist.findOne).mockResolvedValue(mockArtist as any);
    vi.mocked(DeletionRequestModel.findOne).mockResolvedValue(null);
    vi.mocked(CreateOrder.findOne).mockResolvedValue({ payment_information: {} } as any);
    vi.mocked(hasFinancialCommitments).mockResolvedValue({
      hasPendingTransactions: false,
      hasPositiveBalance: true,
    });
    vi.mocked(generateDeletionCommitments).mockReturnValue({
      can_delete: false,
      reasons: ["Unpaid wallet balance"],
    } as any);

    const response = await DELETE(makeRequest({ id: "artist-1", reason: "Moving on" }));
    const body = await response.json();

    expect(response.status).toBe(409);
    expect(body.can_delete).toBe(false);
    expect(body.message).toMatch(/blocked due to active commitments/i);
  });

  it("returns 404 when artist account is not found", async () => {
    vi.mocked(AccountArtist.findOne).mockResolvedValue(null);

    const response = await DELETE(makeRequest({ id: "nonexistent", reason: "Closing" }));
    const body = await response.json();

    expect(response.status).toBe(404);
    expect(body.message).toBe("Artist account not found");
  });

  it("returns 403 when an active deletion request already exists", async () => {
    vi.mocked(AccountArtist.findOne).mockResolvedValue(mockArtist as any);
    vi.mocked(DeletionRequestModel.findOne).mockResolvedValue({
      status: "requested",
    } as any);

    const response = await DELETE(makeRequest({ id: "artist-1", reason: "Moving on" }));
    const body = await response.json();

    expect(response.status).toBe(403);
    expect(body.message).toMatch(/active deletion request/i);
  });

  it("returns 400 when body fields are missing", async () => {
    const response = await DELETE(makeRequest({}));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.message).toMatch(/Validation Failed/i);
  });
});
