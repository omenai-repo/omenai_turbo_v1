import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@omenai/shared-lib/auth/middleware/combined_middleware", () => ({
  withRateLimitHighlightAndCsrf: () => (fn: any) => fn,
}));
vi.mock("@omenai/shared-lib/auth/configs/rate_limit_configs", () => ({
  strictRateLimit: {},
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
  Artworkuploads: { updateOne: vi.fn() },
}));
vi.mock("@omenai/upstash-config", () => ({
  redis: { del: vi.fn().mockResolvedValue(undefined) },
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

import { POST } from "../../../app/api/artworks/updateArtwork/route";
import { Artworkuploads } from "@omenai/shared-models/models/artworks/UploadArtworkSchema";
import { redis } from "@omenai/upstash-config";

function makeRequest(body: object): Request {
  return new Request("http://localhost/api/artworks/updateArtwork", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/artworks/updateArtwork", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 200 when artwork is successfully updated", async () => {
    vi.mocked(Artworkuploads.updateOne).mockResolvedValue({ modifiedCount: 1 } as any);

    const response = await POST(makeRequest({ art_id: "art-123", filter: { title: "New Title" } }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.message).toBe("Successfully updated artwork data");
  });

  it("invalidates the Redis cache for the updated artwork", async () => {
    vi.mocked(Artworkuploads.updateOne).mockResolvedValue({ modifiedCount: 1 } as any);

    await POST(makeRequest({ art_id: "art-123", filter: { title: "New Title" } }));

    expect(redis.del).toHaveBeenCalledWith("artwork:art-123");
  });

  it("returns 500 when no document was modified", async () => {
    vi.mocked(Artworkuploads.updateOne).mockResolvedValue({ modifiedCount: 0 } as any);

    const response = await POST(makeRequest({ art_id: "art-123", filter: {} }));
    const body = await response.json();

    expect(response.status).toBe(500);
  });

  it("returns 400 when art_id is missing", async () => {
    const response = await POST(makeRequest({ filter: { title: "New Title" } }));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.message).toMatch(/Validation Failed/i);
  });
});
