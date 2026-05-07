import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@omenai/shared-lib/auth/middleware/combined_middleware", () => ({
  withRateLimitHighlightAndCsrf: () => (fn: any) => fn,
}));
vi.mock("@omenai/shared-lib/auth/configs/rate_limit_configs", () => ({
  strictRateLimit: {},
}));
vi.mock("@omenai/shared-lib/mongo_connect/mongoConnect", () => ({
  connectMongoDB: vi.fn().mockResolvedValue(undefined),
}));
vi.mock("@omenai/shared-models/models/auth/ArtistSchema", () => ({
  AccountArtist: { updateOne: vi.fn() },
}));
vi.mock("../../../../app/api/util", async () => {
  const { buildValidateRequestBodyMock } = await import("../../../helpers/util-mock");
  return buildValidateRequestBodyMock();
});

import { POST } from "../../../../app/api/requests/artist/logo/route";
import { AccountArtist } from "@omenai/shared-models/models/auth/ArtistSchema";

function makeRequest(body: object) {
  return new Request("http://localhost/api/requests/artist/logo", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/requests/artist/logo", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 200 when logo is updated successfully", async () => {
    vi.mocked(AccountArtist.updateOne).mockResolvedValue({ modifiedCount: 1 } as any);

    const response = await POST(makeRequest({ id: "artist-1", url: "https://example.com/logo.jpg" }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.message).toBe("Logo updated");
  });

  it("passes the correct id and url to updateOne", async () => {
    vi.mocked(AccountArtist.updateOne).mockResolvedValue({ modifiedCount: 1 } as any);

    await POST(makeRequest({ id: "artist-1", url: "https://cdn.example.com/image.png" }));

    expect(AccountArtist.updateOne).toHaveBeenCalledWith(
      { artist_id: "artist-1" },
      { $set: { logo: "https://cdn.example.com/image.png" } },
    );
  });

  it("returns 500 when update has no effect", async () => {
    vi.mocked(AccountArtist.updateOne).mockResolvedValue({ modifiedCount: 0 } as any);

    const response = await POST(makeRequest({ id: "artist-1", url: "https://example.com/logo.jpg" }));
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.message).toMatch(/Error updating logo/i);
  });

  it("returns 400 when required fields are missing", async () => {
    const response = await POST(makeRequest({}));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.message).toMatch(/Validation Failed/i);
  });

  it("returns 400 when url is missing", async () => {
    const response = await POST(makeRequest({ id: "artist-1" }));
    const body = await response.json();

    expect(response.status).toBe(400);
  });
});
