import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@omenai/shared-lib/mongo_connect/mongoConnect", () => ({
  connectMongoDB: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@omenai/shared-models/models/artworks/UploadArtworkSchema", () => ({
  Artworkuploads: {
    find: vi.fn(),
  },
}));

vi.mock("@omenai/shared-lib/auth/middleware/rate_limit_middleware", () => ({
  withRateLimit: () => (fn: any) => fn,
}));

vi.mock("@omenai/shared-lib/auth/configs/rate_limit_configs", () => ({
  lenientRateLimit: {},
}));

vi.mock("../../../app/api/util", () => ({
  createErrorRollbarReport: vi.fn(),
}));

import { GET } from "../../../app/api/seoFetch/fetchArtIds/route";
import { Artworkuploads } from "@omenai/shared-models/models/artworks/UploadArtworkSchema";

const mockArtIds = [
  { art_id: "art-001" },
  { art_id: "art-002" },
  { art_id: "art-003" },
];

describe("GET /api/seoFetch/fetchArtIds", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(Artworkuploads.find).mockReturnValue({
      select: vi.fn().mockReturnValue({
        lean: vi.fn().mockReturnValue({
          exec: vi.fn().mockResolvedValue(mockArtIds),
        }),
      }),
    } as any);
  });

  it("returns 200 with all artwork IDs on success", async () => {
    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.message).toBe("Successful");
    expect(body.data).toEqual(mockArtIds);
  });

  it("queries only the art_id field for performance", async () => {
    await GET();

    expect(Artworkuploads.find).toHaveBeenCalledWith();
    const selectMock = vi.mocked(Artworkuploads.find).mock.results[0].value.select;
    expect(selectMock).toHaveBeenCalledWith("art_id");
  });

  it("returns an empty array when no artworks exist", async () => {
    vi.mocked(Artworkuploads.find).mockReturnValue({
      select: vi.fn().mockReturnValue({
        lean: vi.fn().mockReturnValue({
          exec: vi.fn().mockResolvedValue([]),
        }),
      }),
    } as any);

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data).toEqual([]);
  });

  it("returns 500 when connectMongoDB throws", async () => {
    const { connectMongoDB } = await import(
      "@omenai/shared-lib/mongo_connect/mongoConnect"
    );
    vi.mocked(connectMongoDB).mockRejectedValueOnce(new Error("DB connection failed"));

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(500);
  });

  it("returns 500 when Artworkuploads.find throws", async () => {
    vi.mocked(Artworkuploads.find).mockReturnValue({
      select: vi.fn().mockReturnValue({
        lean: vi.fn().mockReturnValue({
          exec: vi.fn().mockRejectedValue(new Error("Query failed")),
        }),
      }),
    } as any);

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(500);
  });
});
