import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@omenai/shared-lib/auth/middleware/combined_middleware", () => ({
  withRateLimitHighlightAndCsrf: () => (fn: any) => fn,
}));

vi.mock("@omenai/shared-lib/auth/configs/rate_limit_configs", () => ({
  lenientRateLimit: {},
}));

vi.mock("@omenai/shared-lib/mongo_connect/mongoConnect", () => ({
  connectMongoDB: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@omenai/shared-models/models/artworks/RecentlyViewed", () => ({
  RecentView: {
    findOne: vi.fn(),
    create: vi.fn(),
  },
}));

vi.mock("../../../app/api/util", async () => {
  const { buildValidateRequestBodyMock } = await import("../../helpers/util-mock");
  return buildValidateRequestBodyMock();
});

import { POST } from "../../../app/api/viewHistory/createViewHistory/route";
import { RecentView } from "@omenai/shared-models/models/artworks/RecentlyViewed";

const validBody = {
  artwork: "Sunrise Over Lagos",
  user_id: "user-123",
  art_id: "art-456",
  artist: "Amara Nwosu",
  url: "https://cdn.omenai.app/artworks/sunrise.jpg",
};

function makeRequest(body: object): Request {
  return new Request("http://localhost/api/viewHistory/createViewHistory", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/viewHistory/createViewHistory", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(RecentView.findOne).mockResolvedValue(null);
    vi.mocked(RecentView.create).mockResolvedValue({} as any);
  });

  it("returns 200 and creates a view entry when artwork has not been viewed", async () => {
    const response = await POST(makeRequest(validBody));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.status).toBe(200);
    expect(RecentView.create).toHaveBeenCalledWith({
      artwork: validBody.artwork,
      user: validBody.user_id,
      art_id: validBody.art_id,
      artist: validBody.artist,
      url: validBody.url,
    });
  });

  it("returns 200 and skips creation when artwork was already viewed", async () => {
    vi.mocked(RecentView.findOne).mockResolvedValue({ art_id: "art-456", user: "user-123" } as any);

    const response = await POST(makeRequest(validBody));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.status).toBe(200);
    expect(RecentView.create).not.toHaveBeenCalled();
  });

  it("queries findOne with art_id and user_id", async () => {
    await POST(makeRequest(validBody));

    expect(RecentView.findOne).toHaveBeenCalledWith({
      art_id: validBody.art_id,
      user: validBody.user_id,
    });
  });

  it("returns 400 when required fields are missing", async () => {
    const response = await POST(makeRequest({ user_id: "user-123" }));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.message).toMatch(/Validation Failed/i);
  });

  it("returns 400 when body is completely empty", async () => {
    const response = await POST(makeRequest({}));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.message).toMatch(/Validation Failed/i);
  });

  it("returns 500 when RecentView.create throws", async () => {
    vi.mocked(RecentView.create).mockRejectedValueOnce(new Error("DB write failed"));

    const response = await POST(makeRequest(validBody));
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.message).toBeDefined();
  });

  it("returns 500 when RecentView.findOne throws", async () => {
    vi.mocked(RecentView.findOne).mockRejectedValueOnce(new Error("DB read failed"));

    const response = await POST(makeRequest(validBody));

    expect(response.status).toBe(500);
  });
});
