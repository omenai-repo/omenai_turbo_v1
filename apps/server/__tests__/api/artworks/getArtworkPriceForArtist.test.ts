import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@omenai/shared-lib/auth/middleware/combined_middleware", () => ({
  withRateLimitHighlightAndCsrf: () => (fn: any) => fn,
}));
vi.mock("@omenai/shared-lib/auth/configs/rate_limit_configs", () => ({
  lenientRateLimit: {},
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
vi.mock("@omenai/shared-models/models/auth/ArtistSchema", () => ({
  AccountArtist: { findOne: vi.fn() },
}));
vi.mock("@omenai/shared-lib/algorithms/priceGenerator", () => ({
  calculateArtworkPrice: vi.fn().mockReturnValue({
    recommendedPrice: 500,
    priceRange: [300, 350, 400, 500, 600, 700],
  }),
}));
vi.mock("@omenai/shared-lib/configcat/configCatFetch", () => ({
  fetchConfigCatValue: vi.fn().mockResolvedValue(true),
}));
vi.mock("@omenai/upstash-config", () => ({
  redis: { get: vi.fn(), set: vi.fn().mockResolvedValue(undefined) },
}));
vi.mock("@omenai/rollbar-config", () => ({
  rollbarServerInstance: { error: vi.fn() },
}));
vi.mock("../../../app/api/util", () => {
  class BadRequestError extends Error {
    constructor(message: string) {
      super(message);
      this.name = "BadRequestError";
    }
  }
  return {
    createErrorRollbarReport: vi.fn(),
    validateGetRouteParams: vi.fn().mockImplementation((schema: any, data: any) => {
      const result = schema.safeParse(data);
      if (!result.success) {
        const msg = result.error.issues.map((e: any) => `${e.path.join(".")}: ${e.message}`).join(", ");
        throw new BadRequestError(`Validation Failed: ${msg}`);
      }
      return result.data;
    }),
  };
});

import { GET } from "../../../app/api/artworks/getArtworkPriceForArtist/route";
import { AccountArtist } from "@omenai/shared-models/models/auth/ArtistSchema";
import { fetchConfigCatValue } from "@omenai/shared-lib/configcat/configCatFetch";
import { redis } from "@omenai/upstash-config";

const validParams = {
  medium: "Photography",
  height: "50",
  width: "40",
  category: "Emerging",
  currency: "USD",
  id: "artist-123",
};

const mockArtist = {
  pricing_allowances: {
    auto_approvals_used: 1,
    last_reset_date: new Date(),
  },
};

function makeRequest(params: Record<string, string>): Request {
  const url = new URL("http://localhost/api/artworks/getArtworkPriceForArtist");
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  return new Request(url, { method: "GET" });
}

function mockArtistFindOne(value: any) {
  vi.mocked(AccountArtist.findOne).mockReturnValue({
    select: vi.fn().mockReturnThis(),
    lean: vi.fn().mockResolvedValue(value),
  } as any);
}

describe("GET /api/artworks/getArtworkPriceForArtist", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(fetchConfigCatValue).mockResolvedValue(true);
    mockArtistFindOne(mockArtist);
    vi.mocked(redis.get).mockResolvedValue(JSON.stringify(1.0));
  });

  it("returns 200 with price data when all params are valid", async () => {
    const response = await GET(makeRequest(validParams));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.message).toBe("Proposed Price calculated");
    expect(body.data.usd_price).toBe(500);
    expect(body.data.currency).toBe("USD");
    expect(body.data).toHaveProperty("hasAutoApprovalsRemaining");
  });

  it("uses the cached exchange rate when available", async () => {
    vi.mocked(redis.get).mockResolvedValue(JSON.stringify(1.5));

    const response = await GET(makeRequest(validParams));
    const body = await response.json();

    expect(body.data.price).toBe(750); // 1.5 * 500
  });

  it("returns 403 when the feature flag is disabled", async () => {
    vi.mocked(fetchConfigCatValue).mockResolvedValue(false);

    const response = await GET(makeRequest(validParams));
    const body = await response.json();

    expect(response.status).toBe(403);
  });

  it("returns 400 when artist is not found", async () => {
    mockArtistFindOne(null);

    const response = await GET(makeRequest(validParams));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.message).toBe("Artist profile not found");
  });

  it("returns 400 when height is not a numeric string", async () => {
    const response = await GET(makeRequest({ ...validParams, height: "abc" }));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.message).toBe("Height or width must be a number");
  });

  it("hasAutoApprovalsRemaining is false when usage equals 3", async () => {
    mockArtistFindOne({
      pricing_allowances: { auto_approvals_used: 3, last_reset_date: new Date() },
    });

    const response = await GET(makeRequest(validParams));
    const body = await response.json();

    expect(body.data.hasAutoApprovalsRemaining).toBe(false);
  });

  it("hasAutoApprovalsRemaining resets to true after 30-day rollover", async () => {
    const oldDate = new Date();
    oldDate.setDate(oldDate.getDate() - 31);
    mockArtistFindOne({
      pricing_allowances: { auto_approvals_used: 3, last_reset_date: oldDate },
    });

    const response = await GET(makeRequest(validParams));
    const body = await response.json();

    expect(body.data.hasAutoApprovalsRemaining).toBe(true);
  });

  it("returns 400 when medium is not a valid enum value", async () => {
    const response = await GET(makeRequest({ ...validParams, medium: "Watercolor" }));
    const body = await response.json();

    expect(response.status).toBe(400);
  });
});
