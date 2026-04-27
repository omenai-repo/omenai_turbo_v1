import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@omenai/shared-lib/auth/middleware/rate_limit_middleware", () => ({
  withRateLimit: () => (fn: any) => fn,
}));

vi.mock("@omenai/shared-lib/auth/configs/rate_limit_configs", () => ({
  lenientRateLimit: {},
}));

vi.mock("@omenai/upstash-config", () => ({
  redis: {
    smembers: vi.fn(),
  },
}));

vi.mock("../../../app/api/util", async () => {
  const { buildValidateGetRouteParamsMock } = await import("../../helpers/util-mock");
  return buildValidateGetRouteParamsMock();
});

import { GET } from "../../../app/api/tour/route";
import { redis } from "@omenai/upstash-config";

function makeRequest(id?: string): Request {
  const url = new URL("http://localhost/api/tour");
  if (id) url.searchParams.set("id", id);
  return new Request(url.toString(), { method: "GET" });
}

describe("GET /api/tour", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(redis.smembers).mockResolvedValue(["tour-1", "tour-2"]);
  });

  it("returns 200 with completed tours list", async () => {
    const response = await GET(makeRequest("user-123"));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.message).toBe("Tours list fetched");
    expect(body.completedTours).toEqual(["tour-1", "tour-2"]);
  });

  it("queries redis with the correct key pattern", async () => {
    await GET(makeRequest("user-abc"));

    expect(redis.smembers).toHaveBeenCalledWith("tours:user-abc");
  });

  it("returns empty completedTours when redis returns empty array", async () => {
    vi.mocked(redis.smembers).mockResolvedValue([]);

    const response = await GET(makeRequest("user-123"));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.completedTours).toEqual([]);
  });

  it("parses JSON string result from redis into array", async () => {
    vi.mocked(redis.smembers).mockResolvedValue('["tour-x","tour-y"]' as any);

    const response = await GET(makeRequest("user-123"));
    const body = await response.json();

    expect(body.completedTours).toEqual(["tour-x", "tour-y"]);
  });

  it("returns 200 with empty tours when redis throws (swallows inner error)", async () => {
    vi.mocked(redis.smembers).mockRejectedValueOnce(new Error("Redis unavailable"));

    const response = await GET(makeRequest("user-123"));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.completedTours).toEqual([]);
  });

  it("returns 400 when id param is missing", async () => {
    const response = await GET(makeRequest());
    const body = await response.json();

    expect(response.status).toBe(400);
  });
});
