import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@omenai/shared-lib/auth/middleware/combined_middleware", () => ({
  withRateLimitHighlightAndCsrf: () => (fn: any) => fn,
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
vi.mock("../../../app/api/services/uploadArtwork.service", () => ({
  uploadArtworkLogic: vi.fn(),
}));
vi.mock("@omenai/rollbar-config", () => ({
  rollbarServerInstance: { error: vi.fn() },
}));
vi.mock("../../../app/api/util", () => ({
  createErrorRollbarReport: vi.fn(),
  validateRequestBody: vi.fn(),
}));

import { POST } from "../../../app/api/artworks/upload/route";
import { uploadArtworkLogic } from "../../../app/api/services/uploadArtwork.service";

function makeRequest(body: object): Request {
  return new Request("http://localhost/api/artworks/upload", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

const validBody = { title: "Test Artwork", price: 500 };

describe("POST /api/artworks/upload", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 200 with the message from uploadArtworkLogic on success", async () => {
    vi.mocked(uploadArtworkLogic).mockResolvedValue({ message: "Artwork uploaded" } as any);

    const response = await POST(makeRequest(validBody));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.message).toBe("Artwork uploaded");
  });

  it("passes the request body directly to uploadArtworkLogic", async () => {
    vi.mocked(uploadArtworkLogic).mockResolvedValue({ message: "Artwork uploaded" } as any);

    await POST(makeRequest(validBody));

    expect(uploadArtworkLogic).toHaveBeenCalledWith(validBody);
  });

  it("returns an error response when uploadArtworkLogic throws", async () => {
    vi.mocked(uploadArtworkLogic).mockRejectedValue(new Error("Upload failed"));

    const response = await POST(makeRequest(validBody));

    expect(response.status).toBeGreaterThanOrEqual(400);
  });
});
