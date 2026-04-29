import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@omenai/shared-lib/auth/middleware/rate_limit_middleware", () => ({
  withRateLimit: () => (fn: any) => fn,
}));

vi.mock("@omenai/shared-lib/auth/configs/rate_limit_configs", () => ({
  standardRateLimit: {},
}));

vi.mock("@omenai/upstash-config", () => ({
  redis: { get: vi.fn() },
}));

vi.mock("../../../app/api/util", () => ({
  createErrorRollbarReport: vi.fn(),
}));

import { GET } from "../../../app/api/curation/route";
import { redis } from "@omenai/upstash-config";

const mockFeed = [{ id: "item-1", title: "Curator Pick" }, { id: "item-2", title: "Featured" }];

function makeRequest(params: Record<string, string> = {}): Request {
  const url = new URL("http://localhost/api/curation");
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }
  return new Request(url.toString(), { method: "GET" });
}

describe("GET /api/curation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 200 with empty data when no type param", async () => {
    const response = await GET(makeRequest());
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data).toEqual([]);
  });

  it("does not call redis when type param is missing", async () => {
    await GET(makeRequest());

    expect(redis.get).not.toHaveBeenCalled();
  });

  it("returns 200 with parsed data when redis returns a JSON string", async () => {
    vi.mocked(redis.get).mockResolvedValue(JSON.stringify(mockFeed) as any);

    const response = await GET(makeRequest({ type: "curator_picks" }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data).toEqual(mockFeed);
  });

  it("returns 200 with data when redis returns an already-parsed object", async () => {
    vi.mocked(redis.get).mockResolvedValue(mockFeed as any);

    const response = await GET(makeRequest({ type: "featured_feed" }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data).toEqual(mockFeed);
  });

  it("returns 200 with empty data when redis returns null", async () => {
    vi.mocked(redis.get).mockResolvedValue(null);

    const response = await GET(makeRequest({ type: "curator_picks" }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data).toEqual([]);
  });

  it("returns 200 with empty data when redis throws (getCuratedFeed swallows the error)", async () => {
    vi.mocked(redis.get).mockRejectedValue(new Error("Redis connection error"));

    const response = await GET(makeRequest({ type: "curator_picks" }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data).toEqual([]);
  });

  it("calls redis.get with the correct key for curator_picks", async () => {
    vi.mocked(redis.get).mockResolvedValue(null);

    await GET(makeRequest({ type: "curator_picks" }));

    expect(redis.get).toHaveBeenCalledWith("homepage:curator_picks");
  });

  it("calls redis.get with the correct key for featured_feed", async () => {
    vi.mocked(redis.get).mockResolvedValue(null);

    await GET(makeRequest({ type: "featured_feed" }));

    expect(redis.get).toHaveBeenCalledWith("homepage:featured_feed");
  });
});
