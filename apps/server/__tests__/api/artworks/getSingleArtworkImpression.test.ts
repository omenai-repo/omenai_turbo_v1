import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@omenai/shared-lib/auth/middleware/rate_limit_middleware", () => ({
  withRateLimit: () => (fn: any) => fn,
}));
vi.mock("@omenai/shared-lib/auth/configs/rate_limit_configs", () => ({
  standardRateLimit: {},
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
  Artworkuploads: { findOne: vi.fn() },
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

import { POST } from "../../../app/api/artworks/getSingleArtworkImpression/route";
import { Artworkuploads } from "@omenai/shared-models/models/artworks/UploadArtworkSchema";

const mockImpression = { art_id: "art-123", like_IDs: ["user-1", "user-2"] };

function makeRequest(body: object): Request {
  return new Request("http://localhost/api/artworks/getSingleArtworkImpression", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

function mockFindOne(value: any) {
  vi.mocked(Artworkuploads.findOne).mockReturnValue({
    lean: vi.fn().mockResolvedValue(value),
  } as any);
}

describe("POST /api/artworks/getSingleArtworkImpression", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 200 with impression data for a valid artwork id", async () => {
    mockFindOne(mockImpression);

    const response = await POST(makeRequest({ id: "art-123" }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.message).toBe("arwork found");
    expect(body.data).toEqual(mockImpression);
  });

  it("returns 500 when the artwork is not found", async () => {
    mockFindOne(null);

    const response = await POST(makeRequest({ id: "art-123" }));
    const body = await response.json();

    expect(response.status).toBe(500);
  });

  it("returns 400 when id is missing", async () => {
    const response = await POST(makeRequest({}));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.message).toMatch(/Validation Failed/i);
  });
});
