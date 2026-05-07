import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@omenai/shared-lib/auth/middleware/rate_limit_middleware", () => ({
  withRateLimit: () => (fn: any) => fn,
}));

vi.mock("@omenai/shared-lib/auth/configs/rate_limit_configs", () => ({
  standardRateLimit: {},
}));

vi.mock("@omenai/shared-lib/mongo_connect/mongoConnect", () => ({
  connectMongoDB: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@omenai/shared-models/models/follows/FollowSchema", () => ({
  Follow: { find: vi.fn() },
}));

vi.mock("../../../app/api/util", () => ({
  createErrorRollbarReport: vi.fn(),
}));

import { GET } from "../../../app/api/engagements/fetchFollows/route";
import { Follow } from "@omenai/shared-models/models/follows/FollowSchema";
import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";

const mockFollows = [{ followingId: "gallery-1" }, { followingId: "artist-2" }];

function makeRequest(params: Record<string, string> = {}): Request {
  const url = new URL("http://localhost/api/engagements/fetchFollows");
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }
  return new Request(url.toString(), { method: "GET" });
}

describe("GET /api/engagements/fetchFollows", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(Follow.find).mockReturnValue({
      select: vi.fn().mockReturnValue({
        lean: vi.fn().mockResolvedValue(mockFollows),
      }),
    } as any);
  });

  it("returns 200 with empty followedIds when no id param", async () => {
    const response = await GET(makeRequest());
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.followedIds).toEqual([]);
  });

  it("does not query DB when id param is missing", async () => {
    await GET(makeRequest());

    expect(Follow.find).not.toHaveBeenCalled();
    expect(connectMongoDB).not.toHaveBeenCalled();
  });

  it("returns 200 with followedIds on success", async () => {
    const response = await GET(makeRequest({ id: "user-1" }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.followedIds).toEqual(["gallery-1", "artist-2"]);
  });

  it("queries follows by follower user_id", async () => {
    await GET(makeRequest({ id: "user-1" }));

    expect(Follow.find).toHaveBeenCalledWith({ follower: "user-1" });
  });

  it("selects followingId field only", async () => {
    const selectMock = vi.fn().mockReturnValue({ lean: vi.fn().mockResolvedValue([]) });
    vi.mocked(Follow.find).mockReturnValue({ select: selectMock } as any);

    await GET(makeRequest({ id: "user-1" }));

    expect(selectMock).toHaveBeenCalledWith("followingId -_id");
  });

  it("returns 500 when Follow.find throws", async () => {
    vi.mocked(Follow.find).mockImplementation(() => {
      throw new Error("DB error");
    });

    const response = await GET(makeRequest({ id: "user-1" }));

    expect(response.status).toBe(500);
  });

  it("returns 500 when connectMongoDB throws", async () => {
    vi.mocked(connectMongoDB).mockRejectedValueOnce(new Error("Connection failed"));

    const response = await GET(makeRequest({ id: "user-1" }));

    expect(response.status).toBe(500);
  });
});
