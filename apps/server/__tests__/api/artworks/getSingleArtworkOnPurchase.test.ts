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
vi.mock("../../../app/api/artworks/utils", () => ({
  getCachedArtwork: vi.fn(),
}));
vi.mock("../../../app/api/util", async () => {
  const { buildValidateRequestBodyMock } = await import("../../helpers/util-mock");
  return buildValidateRequestBodyMock();
});

import { POST } from "../../../app/api/artworks/getSingleArtworkOnPurchase/route";
import { getCachedArtwork } from "../../../app/api/artworks/utils";

const mockArtwork = { art_id: "art-123", title: "Sunset", price: 500 };

function makeRequest(body: object): Request {
  return new Request("http://localhost/api/artworks/getSingleArtworkOnPurchase", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/artworks/getSingleArtworkOnPurchase", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 200 with artwork data", async () => {
    vi.mocked(getCachedArtwork).mockResolvedValue(mockArtwork);

    const response = await POST(makeRequest({ art_id: "art-123" }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.message).toBe("Successful");
    expect(body.data).toEqual(mockArtwork);
  });

  it("returns 404 when artwork is not found in cache or DB", async () => {
    const { NotFoundError } = await import(
      "../../../custom/errors/dictionary/errorDictionary"
    );
    vi.mocked(getCachedArtwork).mockRejectedValue(
      new NotFoundError("Artwork not found"),
    );

    const response = await POST(makeRequest({ art_id: "missing" }));
    const body = await response.json();

    expect(response.status).toBe(404);
  });

  it("returns 400 when art_id is missing", async () => {
    const response = await POST(makeRequest({}));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.message).toMatch(/Validation Failed/i);
  });
});
