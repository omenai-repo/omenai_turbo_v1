import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@omenai/shared-lib/auth/middleware/combined_middleware", () => ({
  withRateLimitHighlightAndCsrf: () => (fn: any) => fn,
}));
vi.mock("@omenai/shared-lib/auth/configs/rate_limit_configs", () => ({
  lenientRateLimit: {},
}));
vi.mock("next/server", () => ({
  NextResponse: {
    json: (body: unknown, init?: ResponseInit) =>
      new Response(JSON.stringify(body), {
        ...init,
        headers: { "Content-Type": "application/json" },
      }),
  },
}));
vi.mock("@omenai/shared-lib/mongo_connect/mongoConnect", () => ({
  connectMongoDB: vi.fn().mockResolvedValue(undefined),
}));
vi.mock("@omenai/shared-models/models/artworks/UploadArtworkSchema", () => ({
  Artworkuploads: { find: vi.fn(), countDocuments: vi.fn().mockResolvedValue(60) },
}));
vi.mock("../../../app/api/artworks/utils", () => ({
  fetchArtworksFromCache: vi.fn(),
  getCachedGalleryIds: vi.fn().mockResolvedValue(["gallery-1"]),
}));
vi.mock("@omenai/shared-utils/src/buildMongoFilterQuery", () => ({
  buildMongoQuery: vi.fn().mockReturnValue({}),
}));
vi.mock("@omenai/rollbar-config", () => ({
  rollbarServerInstance: { error: vi.fn() },
}));
vi.mock("../../../app/api/util", () => {
  class BadRequestError extends Error {
    constructor(message: string) {
      super(message);
      this.name = "BadRequestError";
    }
  }
  return {
    validateRequestBody: vi.fn().mockImplementation(async (req: Request, schema: any) => {
      const body = await req.json();
      const result = schema.safeParse(body);
      if (!result.success) {
        const msg = result.error.issues.map((e: any) => `${e.path.join(".")}: ${e.message}`).join(", ");
        throw new BadRequestError(`Validation Failed: ${msg}`);
      }
      return result.data;
    }),
    createErrorRollbarReport: vi.fn(),
  };
});

import { POST } from "../../../app/api/artworks/getArtworksByCriteria/route";
import { Artworkuploads } from "@omenai/shared-models/models/artworks/UploadArtworkSchema";
import { fetchArtworksFromCache } from "../../../app/api/artworks/utils";

const mockArtworks = [{ art_id: "art-1" }];

function makeRequest(body: object): Request {
  return new Request("http://localhost/api/artworks/getArtworksByCriteria", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

function mockFindChain(docs: any[]) {
  const chain = {
    sort: vi.fn().mockReturnThis(),
    skip: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    lean: vi.fn().mockReturnThis(),
    exec: vi.fn().mockResolvedValue(docs),
  };
  vi.mocked(Artworkuploads.find).mockReturnValue(chain as any);
}

describe("POST /api/artworks/getArtworksByCriteria", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFindChain([{ art_id: "art-1" }]);
    vi.mocked(fetchArtworksFromCache).mockResolvedValue(mockArtworks);
  });

  it("returns 200 with artworks, pagination, and total", async () => {
    const response = await POST(makeRequest({ page: 1, medium: "Photography", filters: {} }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.message).toBe("Successful");
    expect(body.data).toEqual(mockArtworks);
    expect(body.pageCount).toBe(2);
    expect(body.total).toBe(60);
  });

  it("returns 400 when medium is missing", async () => {
    const response = await POST(makeRequest({ page: 1, filters: {} }));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.message).toMatch(/Validation Failed/i);
  });

  it("returns 400 when page is missing", async () => {
    const response = await POST(makeRequest({ medium: "Photography", filters: {} }));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.message).toMatch(/Validation Failed/i);
  });
});
