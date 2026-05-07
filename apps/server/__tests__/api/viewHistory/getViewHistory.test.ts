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

vi.mock("@omenai/shared-models/models/artworks/RecentlyViewed", () => ({
  RecentView: {
    find: vi.fn(),
  },
}));

vi.mock("../../../app/api/util", async () => {
  const { buildValidateRequestBodyMock } = await import("../../helpers/util-mock");
  return buildValidateRequestBodyMock();
});

import { POST } from "../../../app/api/viewHistory/getViewHistory/route";
import { RecentView } from "@omenai/shared-models/models/artworks/RecentlyViewed";

const mockViewHistory = [
  { art_id: "art-1", artwork: "Painting A", artist: "Artist A", url: "https://cdn.omenai.app/a.jpg", user: "user-123" },
  { art_id: "art-2", artwork: "Painting B", artist: "Artist B", url: "https://cdn.omenai.app/b.jpg", user: "user-123" },
];

function makeRequest(body: object): Request {
  return new Request("http://localhost/api/viewHistory/getViewHistory", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

function makeChain(data: any[]) {
  return {
    sort: vi.fn().mockReturnValue({
      limit: vi.fn().mockReturnValue({
        exec: vi.fn().mockResolvedValue(data),
      }),
    }),
  };
}

describe("POST /api/viewHistory/getViewHistory", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(RecentView.find).mockReturnValue(makeChain(mockViewHistory) as any);
  });

  it("returns 200 with view history data", async () => {
    const response = await POST(makeRequest({ user_id: "user-123" }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.message).toBe("Successful");
    expect(body.data).toEqual(mockViewHistory);
  });

  it("queries RecentView by user_id and sorts by createdAt descending with limit 20", async () => {
    const execMock = vi.fn().mockResolvedValue(mockViewHistory);
    const limitMock = vi.fn().mockReturnValue({ exec: execMock });
    const sortMock = vi.fn().mockReturnValue({ limit: limitMock });
    vi.mocked(RecentView.find).mockReturnValue({ sort: sortMock } as any);

    await POST(makeRequest({ user_id: "user-123" }));

    expect(RecentView.find).toHaveBeenCalledWith({ user: "user-123" });
    expect(sortMock).toHaveBeenCalledWith({ createdAt: -1 });
    expect(limitMock).toHaveBeenCalledWith(20);
  });

  it("returns 200 with empty array when user has no view history", async () => {
    vi.mocked(RecentView.find).mockReturnValue(makeChain([]) as any);

    const response = await POST(makeRequest({ user_id: "user-no-history" }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data).toEqual([]);
  });

  it("returns 400 when user_id is missing", async () => {
    const response = await POST(makeRequest({}));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.message).toMatch(/Validation Failed/i);
  });

  it("returns 500 when database query throws", async () => {
    vi.mocked(RecentView.find).mockReturnValue({
      sort: vi.fn().mockReturnValue({
        limit: vi.fn().mockReturnValue({
          exec: vi.fn().mockRejectedValue(new Error("DB error")),
        }),
      }),
    } as any);

    const response = await POST(makeRequest({ user_id: "user-123" }));
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.message).toBeDefined();
  });
});
