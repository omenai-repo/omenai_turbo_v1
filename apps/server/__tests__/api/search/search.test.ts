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

vi.mock("@omenai/shared-models/models/artworks/UploadArtworkSchema", () => ({
  Artworkuploads: { find: vi.fn() },
}));

vi.mock("../../../app/api/artworks/utils", () => ({
  fetchArtworksFromCache: vi.fn(),
}));

vi.mock("../../../app/api/util", async () => {
  const { buildValidateRequestBodyMock } = await import("../../helpers/util-mock");
  return buildValidateRequestBodyMock();
});

import { POST } from "../../../app/api/search/route";
import { Artworkuploads } from "@omenai/shared-models/models/artworks/UploadArtworkSchema";
import { fetchArtworksFromCache } from "../../../app/api/artworks/utils";
import { validateRequestBody } from "../../../app/api/util";

const mockArtDocs = [{ art_id: "art-1" }, { art_id: "art-2" }];
const mockFullArtworks = [
  { art_id: "art-1", title: "Sunset Lagos" },
  { art_id: "art-2", title: "Sunrise Lagos" },
];

function makeRequest(body: object): Request {
  return new Request("http://localhost/api/search", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

function setupFindChain(docs: any[]) {
  vi.mocked(Artworkuploads.find).mockReturnValue({
    sort: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        lean: vi.fn().mockReturnValue({
          exec: vi.fn().mockResolvedValue(docs),
        }),
      }),
    }),
  } as any);
}

describe("POST /api/search", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupFindChain(mockArtDocs);
    vi.mocked(fetchArtworksFromCache).mockResolvedValue(mockFullArtworks);
    vi.mocked(validateRequestBody).mockImplementation(
      async (request: Request, schema: any) => {
        const body = await request.json();
        const result = schema.safeParse(body);
        if (!result.success) {
          const msg = result.error.issues
            .map((e: any) => `${e.path.join(".")}: ${e.message}`)
            .join(", ");
          throw Object.assign(new Error(`Validation Failed: ${msg}`), {
            name: "BadRequestError",
          });
        }
        return result.data;
      },
    );
  });

  it("returns 200 with matched artworks on success", async () => {
    const response = await POST(makeRequest({ searchTerm: "Lagos" }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.message).toBe("Successful");
    expect(body.data).toEqual(mockFullArtworks);
  });

  it("builds a case-insensitive regex from searchTerm", async () => {
    await POST(makeRequest({ searchTerm: "Lagos" }));

    const callArg = vi.mocked(Artworkuploads.find).mock.calls[0][0] as any;
    expect(callArg.$or).toHaveLength(2);
    expect(callArg.$or[0].title).toBeInstanceOf(RegExp);
    expect(callArg.$or[0].title.flags).toContain("i");
  });

  it("searches by both title and artist fields", async () => {
    await POST(makeRequest({ searchTerm: "Amara" }));

    const callArg = vi.mocked(Artworkuploads.find).mock.calls[0][0] as any;
    expect(callArg.$or[0]).toHaveProperty("title");
    expect(callArg.$or[1]).toHaveProperty("artist");
  });

  it("passes art_ids to fetchArtworksFromCache", async () => {
    await POST(makeRequest({ searchTerm: "Lagos" }));

    expect(fetchArtworksFromCache).toHaveBeenCalledWith(["art-1", "art-2"]);
  });

  it("returns empty data array when no artworks match", async () => {
    setupFindChain([]);
    vi.mocked(fetchArtworksFromCache).mockResolvedValue([]);

    const response = await POST(makeRequest({ searchTerm: "nonexistent" }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data).toEqual([]);
  });

  it("returns 500 when Artworkuploads.find throws", async () => {
    vi.mocked(Artworkuploads.find).mockReturnValue({
      sort: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          lean: vi.fn().mockReturnValue({
            exec: vi.fn().mockRejectedValue(new Error("DB error")),
          }),
        }),
      }),
    } as any);

    const response = await POST(makeRequest({ searchTerm: "Lagos" }));

    expect(response.status).toBe(500);
  });

  it("returns 500 when fetchArtworksFromCache throws", async () => {
    vi.mocked(fetchArtworksFromCache).mockRejectedValue(new Error("Redis error"));

    const response = await POST(makeRequest({ searchTerm: "Lagos" }));

    expect(response.status).toBe(500);
  });

  it("returns 500 when connectMongoDB throws", async () => {
    const { connectMongoDB } = await import(
      "@omenai/shared-lib/mongo_connect/mongoConnect"
    );
    vi.mocked(connectMongoDB).mockRejectedValueOnce(new Error("DB connection failed"));

    const response = await POST(makeRequest({ searchTerm: "Lagos" }));

    expect(response.status).toBe(500);
  });
});
