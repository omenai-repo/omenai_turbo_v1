import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@omenai/shared-lib/auth/middleware/combined_middleware", () => ({
  withRateLimitHighlightAndCsrf: () => (fn: any) => fn,
}));

vi.mock("@omenai/shared-lib/auth/configs/rate_limit_configs", () => ({
  standardRateLimit: {},
}));

vi.mock("@omenai/shared-lib/mongo_connect/mongoConnect", () => ({
  connectMongoDB: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@omenai/shared-models/models/auth/GallerySchema", () => ({
  AccountGallery: {
    findOne: vi.fn(),
  },
}));

vi.mock("@omenai/upstash-config", () => ({
  redis: {
    get: vi.fn(),
    set: vi.fn().mockResolvedValue(undefined),
  },
}));

vi.mock("../../../app/api/util", async () => {
  const { buildValidateRequestBodyMock } = await import("../../helpers/util-mock");
  return buildValidateRequestBodyMock();
});

import { POST } from "../../../app/api/stripe/getAccountId/route";
import { AccountGallery } from "@omenai/shared-models/models/auth/GallerySchema";
import { redis } from "@omenai/upstash-config";

const mockAccountData = {
  connected_account_id: "acct_123",
  gallery_verified: true,
};

function makeRequest(body: object): Request {
  return new Request("http://localhost/api/stripe/getAccountId", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/stripe/getAccountId", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(redis.get).mockResolvedValue(JSON.stringify(mockAccountData) as any);
    vi.mocked(AccountGallery.findOne).mockReturnValue({
      lean: vi.fn().mockResolvedValue(mockAccountData),
    } as any);
  });

  it("returns 200 with cached account data on cache hit", async () => {
    const response = await POST(makeRequest({ gallery_id: "gallery-001" }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.message).toBe("Successfully fetched account info");
    expect(body.data.connected_account_id).toBe(mockAccountData.connected_account_id);
  });

  it("does not query DB when valid cache exists", async () => {
    await POST(makeRequest({ gallery_id: "gallery-001" }));

    expect(AccountGallery.findOne).not.toHaveBeenCalled();
  });

  it("fetches from DB and sets cache when Redis returns null", async () => {
    vi.mocked(redis.get).mockResolvedValueOnce(null);

    const response = await POST(makeRequest({ gallery_id: "gallery-001" }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(AccountGallery.findOne).toHaveBeenCalledWith(
      { gallery_id: "gallery-001" },
      "connected_account_id gallery_verified",
    );
    expect(redis.set).toHaveBeenCalledWith(
      "accountId:gallery-001",
      expect.any(String),
      { ex: 21600 },
    );
    expect(body.data.connected_account_id).toBe(mockAccountData.connected_account_id);
  });

  it("fetches from DB when cached connected_account_id is null", async () => {
    vi.mocked(redis.get).mockResolvedValueOnce(
      JSON.stringify({ connected_account_id: null }) as any,
    );

    const response = await POST(makeRequest({ gallery_id: "gallery-001" }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(AccountGallery.findOne).toHaveBeenCalled();
  });

  it("fetches from DB when Redis throws", async () => {
    vi.mocked(redis.get).mockRejectedValueOnce(new Error("Redis down"));

    const response = await POST(makeRequest({ gallery_id: "gallery-001" }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(AccountGallery.findOne).toHaveBeenCalled();
  });

  it("returns 404 when gallery is not found in DB", async () => {
    vi.mocked(redis.get).mockResolvedValueOnce(null);
    vi.mocked(AccountGallery.findOne).mockReturnValue({
      lean: vi.fn().mockResolvedValue(null),
    } as any);

    const response = await POST(makeRequest({ gallery_id: "unknown" }));
    const body = await response.json();

    expect(response.status).toBe(404);
  });

  it("returns 400 when gallery_id is missing", async () => {
    const response = await POST(makeRequest({}));
    const body = await response.json();

    expect(response.status).toBe(400);
  });

  it("still returns data when Redis write fails after DB fetch", async () => {
    vi.mocked(redis.get).mockResolvedValueOnce(null);
    vi.mocked(redis.set).mockRejectedValueOnce(new Error("Redis write error"));

    const response = await POST(makeRequest({ gallery_id: "gallery-001" }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data).toBeDefined();
  });
});
