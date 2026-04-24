import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@omenai/shared-lib/auth/middleware/combined_middleware", () => ({
  withRateLimitHighlightAndCsrf: () => (fn: any) => fn,
}));

vi.mock("@omenai/shared-lib/auth/configs/rate_limit_configs", () => ({
  strictRateLimit: {},
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

vi.mock("@omenai/rollbar-config", () => ({
  rollbarServerInstance: { error: vi.fn() },
}));

vi.mock("@omenai/shared-models/models/auth/ArtistSchema", () => ({
  AccountArtist: { findOne: vi.fn(), updateOne: vi.fn() },
}));

vi.mock("@omenai/shared-models/models/wallet/WalletSchema", () => ({
  Wallet: { updateOne: vi.fn() },
}));

vi.mock("@omenai/url-config/src/config", () => ({
  getApiUrl: vi.fn().mockReturnValue("http://localhost"),
}));

vi.mock("../../../../app/api/util", () => {
  class BadRequestError extends Error {
    constructor(message: string) {
      super(message);
      this.name = "BadRequestError";
    }
  }
  return {
    validateRequestBody: vi.fn().mockImplementation(async (request: Request, schema: any) => {
      let body: unknown;
      try {
        body = await request.json();
      } catch {
        throw new BadRequestError("Invalid JSON syntax: Request body could not be parsed.");
      }
      const result = schema.safeParse(body);
      if (!result.success) {
        const msg = result.error.issues
          .map((e: any) => `${e.path.join(".")}: ${e.message}`)
          .join(", ");
        throw new BadRequestError(`Validation Failed: ${msg}`);
      }
      return result.data;
    }),
    validateDHLAddress: vi.fn().mockResolvedValue(undefined),
    createErrorRollbarReport: vi.fn(),
  };
});

import { POST } from "../../../../app/api/update/artist/address/route";
import { AccountArtist } from "@omenai/shared-models/models/auth/ArtistSchema";
import { Wallet } from "@omenai/shared-models/models/wallet/WalletSchema";
import { validateDHLAddress } from "../../../../app/api/util";

const ngAddress = {
  address_line: "1 Lagos St",
  city: "Lagos",
  country: "Nigeria",
  countryCode: "NG",
  state: "Lagos",
  stateCode: "LA",
  zip: "10001",
};

const gbAddress = {
  address_line: "1 London St",
  city: "London",
  country: "UK",
  countryCode: "GB",
  state: "England",
  stateCode: "EN",
  zip: "SW1A",
};

const mockArtist = { address: { countryCode: "NG" } };

function makeRequest(body: object): Request {
  return new Request("http://localhost/api/update/artist/address", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/update/artist/address", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(validateDHLAddress).mockResolvedValue(undefined);
    vi.mocked(AccountArtist.findOne).mockResolvedValue(mockArtist as any);
    vi.mocked(AccountArtist.updateOne).mockResolvedValue({ modifiedCount: 1 } as any);
    vi.mocked(Wallet.updateOne).mockResolvedValue({ modifiedCount: 1 } as any);
  });

  it("returns 200 when address updated (same country, no currency change)", async () => {
    const response = await POST(
      makeRequest({ artist_id: "artist-1", address: ngAddress, base_currency: "NGN" }),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.message).toBe("Address information updated successfully");
    expect(validateDHLAddress).toHaveBeenCalledWith(
      expect.objectContaining({ countryCode: "NG" }),
    );
  });

  it("updates base_currency when country changes", async () => {
    const response = await POST(
      makeRequest({ artist_id: "artist-1", address: gbAddress, base_currency: "GBP" }),
    );

    expect(response.status).toBe(200);
    expect(AccountArtist.updateOne).toHaveBeenCalledWith(
      { artist_id: "artist-1" },
      { $set: expect.objectContaining({ base_currency: "GBP" }) },
    );
  });

  it("returns 400 when artist is not found", async () => {
    vi.mocked(AccountArtist.findOne).mockResolvedValue(null);

    const response = await POST(
      makeRequest({ artist_id: "ghost", address: ngAddress, base_currency: "NGN" }),
    );
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.message).toMatch(/Artist not found/i);
  });

  it("returns 500 when DHL address validation fails", async () => {
    vi.mocked(validateDHLAddress).mockRejectedValue(new Error("Invalid address"));

    const response = await POST(
      makeRequest({ artist_id: "artist-1", address: ngAddress, base_currency: "NGN" }),
    );
    const body = await response.json();

    expect(response.status).toBe(500);
  });

  it("returns 400 when artist_id is missing", async () => {
    const response = await POST(
      makeRequest({ address: ngAddress, base_currency: "NGN" }),
    );
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.message).toMatch(/Validation Failed/i);
  });

  it("returns 400 when address is missing", async () => {
    const response = await POST(
      makeRequest({ artist_id: "artist-1", base_currency: "NGN" }),
    );
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.message).toMatch(/Validation Failed/i);
  });
});
