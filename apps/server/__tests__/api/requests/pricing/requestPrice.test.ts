import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@omenai/shared-lib/auth/middleware/combined_middleware", () => ({
  withRateLimitHighlightAndCsrf: () => (fn: any) => fn,
}));
vi.mock("@omenai/shared-lib/auth/configs/rate_limit_configs", () => ({
  standardRateLimit: {},
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
vi.mock("@omenai/shared-models/models/auth/IndividualSchema", () => ({
  AccountIndividual: {
    findOne: vi.fn(),
  },
}));
vi.mock("@omenai/shared-models/models/artworks/UploadArtworkSchema", () => ({
  Artworkuploads: {
    findOne: vi.fn(),
  },
}));
vi.mock("@omenai/shared-models/models/artworks/ArtworkPriceRequestSchema", () => ({
  PriceRequest: {
    findOne: vi.fn(),
    create: vi.fn().mockResolvedValue({}),
  },
}));
vi.mock("@omenai/shared-emails/src/models/orders/requestPriceEmail", () => ({
  sendPriceEmail: vi.fn().mockResolvedValue(undefined),
}));
vi.mock("@omenai/shared-lib/analytics/trackPlatformEvents", () => ({
  trackPlatformEvent: vi.fn().mockResolvedValue(undefined),
}));
vi.mock("@omenai/shared-lib/algorithms/priceGenerator", () => ({}));
vi.mock("@omenai/rollbar-config", () => ({
  rollbarServerInstance: { error: vi.fn() },
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
    createErrorRollbarReport: vi.fn(),
  };
});

import { POST } from "../../../../app/api/requests/pricing/requestPrice/route";
import { AccountIndividual } from "@omenai/shared-models/models/auth/IndividualSchema";
import { Artworkuploads } from "@omenai/shared-models/models/artworks/UploadArtworkSchema";
import { PriceRequest } from "@omenai/shared-models/models/artworks/ArtworkPriceRequestSchema";

function makeRequest(body: object): Request {
  return new Request("http://localhost/api/requests/pricing/requestPrice", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

const mockSessionData = { csrfToken: "csrf-token-abc" };
const mockAccount = { name: "Test User", email: "user@example.com", user_id: "user-123" };
const mockArtwork = {
  title: "Blue Sunrise",
  artist: "Jane Doe",
  art_id: "art-456",
  url: "https://example.com/art.jpg",
  author_id: "gallery-789",
  medium: "oil",
  pricing: { usd_price: 1500 },
};

describe("POST /api/requests/pricing/requestPrice", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 200 when price request is created successfully", async () => {
    vi.mocked(AccountIndividual.findOne).mockReturnValue({ lean: vi.fn().mockResolvedValue(mockAccount) } as any);
    vi.mocked(Artworkuploads.findOne).mockReturnValue({ lean: vi.fn().mockResolvedValue(mockArtwork) } as any);
    vi.mocked(PriceRequest.findOne).mockReturnValue({ lean: vi.fn().mockResolvedValue(null) } as any);

    const response = await POST(
      makeRequest({ art_id: "art-456", user_id: "user-123" }),
      undefined,
      mockSessionData as any,
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.message).toBe("Successful");
  });

  it("creates a PriceRequest document with correct data", async () => {
    vi.mocked(AccountIndividual.findOne).mockReturnValue({ lean: vi.fn().mockResolvedValue(mockAccount) } as any);
    vi.mocked(Artworkuploads.findOne).mockReturnValue({ lean: vi.fn().mockResolvedValue(mockArtwork) } as any);
    vi.mocked(PriceRequest.findOne).mockReturnValue({ lean: vi.fn().mockResolvedValue(null) } as any);

    await POST(
      makeRequest({ art_id: "art-456", user_id: "user-123" }),
      undefined,
      mockSessionData as any,
    );

    expect(PriceRequest.create).toHaveBeenCalledWith(
      expect.objectContaining({
        art_id: "art-456",
        buyer_id: "user-123",
        seller_id: "gallery-789",
      }),
    );
  });

  it("returns 403 when sessionData is missing", async () => {
    const response = await POST(
      makeRequest({ art_id: "art-456", user_id: "user-123" }),
      undefined,
      null as any,
    );
    const body = await response.json();

    expect(response.status).toBe(403);
    expect(body.message).toBe("Access Denied");
  });

  it("returns 400 when a price request already exists for this buyer and artwork", async () => {
    vi.mocked(AccountIndividual.findOne).mockReturnValue({ lean: vi.fn().mockResolvedValue(mockAccount) } as any);
    vi.mocked(Artworkuploads.findOne).mockReturnValue({ lean: vi.fn().mockResolvedValue(mockArtwork) } as any);
    vi.mocked(PriceRequest.findOne).mockReturnValue({
      lean: vi.fn().mockResolvedValue({ buyer_id: "user-123", art_id: "art-456" }),
    } as any);

    const response = await POST(
      makeRequest({ art_id: "art-456", user_id: "user-123" }),
      undefined,
      mockSessionData as any,
    );
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.message).toMatch(/already requested/i);
  });

  it("returns 500 when account or artwork is not found", async () => {
    vi.mocked(AccountIndividual.findOne).mockReturnValue({ lean: vi.fn().mockResolvedValue(null) } as any);
    vi.mocked(Artworkuploads.findOne).mockReturnValue({ lean: vi.fn().mockResolvedValue(null) } as any);
    vi.mocked(PriceRequest.findOne).mockReturnValue({ lean: vi.fn().mockResolvedValue(null) } as any);

    const response = await POST(
      makeRequest({ art_id: "art-456", user_id: "user-123" }),
      undefined,
      mockSessionData as any,
    );
    const body = await response.json();

    expect(response.status).toBe(500);
  });

  it("returns 400 when required fields are missing", async () => {
    const response = await POST(
      makeRequest({ art_id: "art-456" }),
      undefined,
      mockSessionData as any,
    );
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.message).toMatch(/Validation Failed/i);
  });
});
