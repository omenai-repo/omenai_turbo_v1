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
vi.mock("../../../app/api/artworks/utils", () => ({
  getCachedArtwork: vi.fn(),
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

import { POST } from "../../../app/api/artworks/getSingleArtwork/route";
import { getCachedArtwork } from "../../../app/api/artworks/utils";

const mockArtwork = { art_id: "art-123", title: "Sunset", price: 500 };

function makeRequest(body: object): Request {
  return new Request("http://localhost/api/artworks/getSingleArtwork", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/artworks/getSingleArtwork", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 200 with artwork data", async () => {
    vi.mocked(getCachedArtwork).mockResolvedValue(mockArtwork);

    const response = await POST(makeRequest({ art_id: "art-123" }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.message).toBe("Successful");
    expect(body.data).toEqual(mockArtwork);
  });

  it("calls getCachedArtwork with the provided art_id", async () => {
    vi.mocked(getCachedArtwork).mockResolvedValue(mockArtwork);

    await POST(makeRequest({ art_id: "art-123" }));

    expect(getCachedArtwork).toHaveBeenCalledWith("art-123");
  });

  it("returns 404 when getCachedArtwork throws a NotFoundError", async () => {
    const { NotFoundError } = await import(
      "../../../custom/errors/dictionary/errorDictionary"
    );
    vi.mocked(getCachedArtwork).mockRejectedValue(
      new NotFoundError("Artwork not found"),
    );

    const response = await POST(makeRequest({ art_id: "missing-art" }));
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
