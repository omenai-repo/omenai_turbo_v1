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

vi.mock("@omenai/shared-models/models/auth/ArtistSchema", () => ({
  AccountArtist: {
    findOne: vi.fn(),
    updateOne: vi.fn(),
  },
}));

vi.mock(
  "@omenai/shared-emails/src/models/artist/sendArtistBlockedMail",
  () => ({
    sendArtistBlockedMail: vi.fn().mockResolvedValue(undefined),
  }),
);

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
    validateRequestBody: vi
      .fn()
      .mockImplementation(async (request: Request, schema: any) => {
        let body: unknown;
        try {
          body = await request.json();
        } catch {
          throw new BadRequestError(
            "Invalid JSON syntax: Request body could not be parsed.",
          );
        }
        const result = schema.safeParse(body);
        if (!result.success) {
          const msg = result.error.issues
            .map((e: any) => `${e.path.join(".")}: ${e.message}`)
            .join(", ");
          throw new BadRequestError(`Validation Failed: ${msg}`);
        }
        return result.data;
      }),
    createErrorRollbarReport: vi.fn(),
  };
});

import { POST } from "../../../app/api/admin/block_artist/route";
import { AccountArtist } from "@omenai/shared-models/models/auth/ArtistSchema";
import { sendArtistBlockedMail } from "@omenai/shared-emails/src/models/artist/sendArtistBlockedMail";

function makeRequest(body: object): Request {
  return new Request("http://localhost/api/admin/block_artist", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

const mockArtist = { name: "Test Artist", email: "artist@example.com" };

describe("POST /api/admin/block_artist", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(AccountArtist.findOne).mockResolvedValue(mockArtist);
    vi.mocked(AccountArtist.updateOne).mockResolvedValue({
      modifiedCount: 1,
    } as any);
  });

  it("returns 200 when artist status is updated", async () => {
    const response = await POST(
      makeRequest({ artist_id: "artist-123", status: "blocked" }),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.message).toBe("Artist status updated");
    expect(sendArtistBlockedMail).toHaveBeenCalledWith({
      email: mockArtist.email,
      name: mockArtist.name,
    });
  });

  it("returns 500 when update modifiedCount is 0", async () => {
    vi.mocked(AccountArtist.updateOne).mockResolvedValue({
      modifiedCount: 0,
    } as any);

    const response = await POST(
      makeRequest({ artist_id: "artist-123", status: "blocked" }),
    );
    const body = await response.json();

    expect(response.status).toBe(500);
  });

  it("returns 400 when artist_id is missing", async () => {
    const response = await POST(makeRequest({ status: "blocked" }));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.message).toMatch(/Validation Failed/i);
  });

  it("returns 400 when status is missing", async () => {
    const response = await POST(makeRequest({ artist_id: "artist-123" }));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.message).toMatch(/Validation Failed/i);
  });
});
