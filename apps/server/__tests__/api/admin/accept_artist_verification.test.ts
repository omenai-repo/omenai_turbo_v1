import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@omenai/shared-lib/auth/middleware/combined_middleware", () => ({
  withRateLimitHighlightAndCsrf: () => (fn: any) => fn,
}));

vi.mock("@omenai/shared-lib/auth/configs/rate_limit_configs", () => ({
  strictRateLimit: {},
}));

vi.mock("@omenai/shared-lib/mongo_connect/mongoConnect", () => ({
  connectMongoDB: vi.fn(),
}));

vi.mock("@omenai/shared-models/models/auth/ArtistSchema", () => ({
  AccountArtist: {
    findOne: vi.fn(),
    updateOne: vi.fn(),
  },
}));

vi.mock(
  "@omenai/shared-models/models/artist/ArtistCategorizationSchema",
  () => ({
    ArtistCategorization: {
      findOne: vi.fn(),
      updateOne: vi.fn(),
    },
  }),
);

vi.mock("@omenai/shared-models/models/wallet/WalletSchema", () => ({
  Wallet: {
    create: vi.fn(),
  },
}));

vi.mock(
  "@omenai/shared-emails/src/models/artist/sendArtistAcceptedMail",
  () => ({
    sendArtistAcceptedMail: vi.fn().mockResolvedValue(undefined),
  }),
);

vi.mock("../../../app/api/util", async () => {
  const { buildValidateRequestBodyMock } = await import("../../helpers/util-mock");
  return buildValidateRequestBodyMock();
});

import { POST } from "../../../app/api/admin/accept_artist_verification/route";
import { AccountArtist } from "@omenai/shared-models/models/auth/ArtistSchema";
import { ArtistCategorization } from "@omenai/shared-models/models/artist/ArtistCategorizationSchema";
import { Wallet } from "@omenai/shared-models/models/wallet/WalletSchema";
import { sendArtistAcceptedMail } from "@omenai/shared-emails/src/models/artist/sendArtistAcceptedMail";
import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";

function makeRequest(body: object): Request {
  return new Request(
    "http://localhost/api/admin/accept_artist_verification",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    },
  );
}

const mockArtist = {
  name: "Test Artist",
  email: "artist@example.com",
  base_currency: "USD",
};

const mockCategorization = {
  id: "cat-123",
  history: [],
  request: {
    categorization: {
      artist_categorization: "emerging",
    },
  },
};

const mockWallet = {
  wallet_id: "wallet-abc-123",
};

describe("POST /api/admin/accept_artist_verification", () => {
  let mockSession: any;

  beforeEach(() => {
    vi.clearAllMocks();
    mockSession = {
      withTransaction: vi.fn().mockImplementation(async (fn: any) => await fn()),
      endSession: vi.fn(),
    };
    const mockClient = { startSession: vi.fn().mockResolvedValue(mockSession) };
    vi.mocked(connectMongoDB).mockResolvedValue(mockClient as any);
    vi.mocked(AccountArtist.findOne).mockResolvedValue(mockArtist);
    vi.mocked(ArtistCategorization.findOne).mockResolvedValue(
      mockCategorization,
    );
    vi.mocked(ArtistCategorization.updateOne).mockResolvedValue({
      acknowledged: true,
    } as any);
    vi.mocked(Wallet.create).mockResolvedValue([mockWallet] as any);
    vi.mocked(AccountArtist.updateOne).mockResolvedValue({
      acknowledged: true,
    } as any);
  });

  it("returns 200 when artist verification is accepted", async () => {
    const response = await POST(
      makeRequest({ artist_id: "artist-123", recommendation: "emerging" }),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.message).toBe("Artist verification accepted");
    expect(sendArtistAcceptedMail).toHaveBeenCalledWith({
      name: mockArtist.name,
      email: mockArtist.email,
    });
  });

  it("ends the session in finally block", async () => {
    await POST(
      makeRequest({ artist_id: "artist-123", recommendation: "emerging" }),
    );
    expect(mockSession.endSession).toHaveBeenCalledOnce();
  });

  it("returns 404 when artist is not found", async () => {
    vi.mocked(AccountArtist.findOne).mockResolvedValue(null);

    const response = await POST(
      makeRequest({ artist_id: "ghost-123", recommendation: "" }),
    );
    const body = await response.json();

    expect(response.status).toBe(404);
    expect(body.message).toMatch(/Artist not found/i);
  });

  it("returns 404 when categorization is not found", async () => {
    vi.mocked(ArtistCategorization.findOne).mockResolvedValue(null);

    const response = await POST(
      makeRequest({ artist_id: "artist-123", recommendation: "" }),
    );
    const body = await response.json();

    expect(response.status).toBe(404);
  });

  it("returns 500 when categorization update fails", async () => {
    vi.mocked(ArtistCategorization.updateOne).mockResolvedValue({
      acknowledged: false,
    } as any);

    const response = await POST(
      makeRequest({ artist_id: "artist-123", recommendation: "emerging" }),
    );
    const body = await response.json();

    expect(response.status).toBe(500);
  });

  it("returns 500 when artist account update fails", async () => {
    vi.mocked(AccountArtist.updateOne).mockResolvedValue({
      acknowledged: false,
    } as any);

    const response = await POST(
      makeRequest({ artist_id: "artist-123", recommendation: "emerging" }),
    );
    const body = await response.json();

    expect(response.status).toBe(500);
  });

  it("returns 400 when artist_id is missing", async () => {
    const response = await POST(makeRequest({ recommendation: "emerging" }));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.message).toMatch(/Validation Failed/i);
  });
});
