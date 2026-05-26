import { describe, it, expect, afterEach, vi, beforeEach } from "vitest";
import { AccountArtist } from "@omenai/shared-models/models/auth/ArtistSchema";
import { GET } from "../../../app/api/artworks/getArtworkPriceForArtist/route";
import { redis } from "@omenai/upstash-config";

// configcat controls the feature flag that gates price calculation.
vi.mock("@omenai/shared-lib/configcat/configCatFetch", () => ({
  fetchConfigCatValue: vi.fn().mockResolvedValue(true),
}));

// ── Fixtures ─────────────────────────────────────────────────────────────────

function makeArtist(overrides: Record<string, any> = {}) {
  const uid = Math.random().toString(36).slice(2, 8);
  return {
    name: "Test Artist",
    profile_status: "ghost",
    artist_id: `artist-${uid}`,
    verified: false,
    artist_verified: false,
    categorization: "Emerging",
    documentation: {
      cv: "",
      socials: { instagram: "", twitter: "", facebook: "", linkedin: "" },
    },
    pricing_allowances: {
      auto_approvals_used: 0,
      last_reset_date: new Date(),
    },
    ...overrides,
  };
}

function makeRequest(params: {
  medium: string;
  height: string;
  width: string;
  category: string;
  currency: string;
  id: string;
}): Request {
  const url = new URL("http://localhost/api/artworks/getArtworkPriceForArtist");
  url.searchParams.set("medium", params.medium);
  url.searchParams.set("height", params.height);
  url.searchParams.set("width", params.width);
  url.searchParams.set("category", params.category);
  url.searchParams.set("currency", params.currency);
  url.searchParams.set("id", params.id);
  return new Request(url.toString(), { method: "GET" });
}

const VALID_PARAMS = {
  medium: "Photography",
  height: "100",
  width: "80",
  category: "Emerging",
  currency: "USD",
};

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("GET /api/artworks/getArtworkPriceForArtist (integration)", () => {
  beforeEach(() => {
    // Provide a pre-cached exchange rate so the route never hits the external API.
    vi.mocked(redis.get).mockResolvedValueOnce(JSON.stringify(1.0));
  });

  afterEach(async () => {
    await AccountArtist.deleteMany({});
    vi.mocked(redis.get).mockResolvedValue(null); // restore default
  });

  it("returns calculated price data for a valid artist", async () => {
    const artist = await AccountArtist.create(makeArtist());

    const response = await GET(
      makeRequest({ ...VALID_PARAMS, id: artist.artist_id }),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.message).toBe("Proposed Price calculated");
    expect(body.data).toHaveProperty("price");
    expect(body.data).toHaveProperty("usd_price");
    expect(body.data).toHaveProperty("currency", "USD");
    expect(body.data).toHaveProperty("hasAutoApprovalsRemaining");
  });

  it("returns hasAutoApprovalsRemaining as true when usage is below limit", async () => {
    const artist = await AccountArtist.create(
      makeArtist({ pricing_allowances: { auto_approvals_used: 1, last_reset_date: new Date() } }),
    );

    vi.mocked(redis.get).mockResolvedValueOnce(JSON.stringify(1.0));

    const response = await GET(
      makeRequest({ ...VALID_PARAMS, id: artist.artist_id }),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data.hasAutoApprovalsRemaining).toBe(true);
  });

  it("returns hasAutoApprovalsRemaining as false when usage equals the limit", async () => {
    const artist = await AccountArtist.create(
      makeArtist({ pricing_allowances: { auto_approvals_used: 3, last_reset_date: new Date() } }),
    );

    vi.mocked(redis.get).mockResolvedValueOnce(JSON.stringify(1.0));

    const response = await GET(
      makeRequest({ ...VALID_PARAMS, id: artist.artist_id }),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data.hasAutoApprovalsRemaining).toBe(false);
  });

  it("returns 400 when artist does not exist", async () => {
    vi.mocked(redis.get).mockResolvedValueOnce(JSON.stringify(1.0));

    const response = await GET(
      makeRequest({ ...VALID_PARAMS, id: "non-existent-artist" }),
    );

    expect(response.status).toBe(400);
  });

  it("returns 400 when height is not numeric", async () => {
    const artist = await AccountArtist.create(makeArtist());

    vi.mocked(redis.get).mockResolvedValueOnce(JSON.stringify(1.0));

    const response = await GET(
      makeRequest({ ...VALID_PARAMS, height: "not-a-number", id: artist.artist_id }),
    );

    expect(response.status).toBe(400);
  });

  it("returns 400 when medium is not a valid enum value", async () => {
    const artist = await AccountArtist.create(makeArtist());

    const response = await GET(
      makeRequest({ ...VALID_PARAMS, medium: "InvalidMedium", id: artist.artist_id }),
    );

    expect(response.status).toBe(400);
  });
});
