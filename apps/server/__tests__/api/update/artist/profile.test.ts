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

vi.mock("../../../../app/api/util", () => ({
  createErrorRollbarReport: vi.fn(),
}));

import { POST } from "../../../../app/api/update/artist/profile/route";
import { AccountArtist } from "@omenai/shared-models/models/auth/ArtistSchema";

function makeRequest(body: object): Request {
  return new Request("http://localhost/api/update/artist/profile", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/update/artist/profile", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(AccountArtist.updateOne).mockResolvedValue({ modifiedCount: 1 } as any);
  });

  it("returns 200 with updated data when profile update succeeds", async () => {
    const response = await POST(makeRequest({ id: "artist-1", name: "New Name", bio: "Updated bio" }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.message).toBe("Artist Profile data updated");
    expect(AccountArtist.updateOne).toHaveBeenCalledWith(
      { artist_id: "artist-1" },
      { $set: expect.objectContaining({ id: "artist-1", name: "New Name" }) },
    );
  });

  it("returns 200 when updating partial fields", async () => {
    const response = await POST(makeRequest({ id: "artist-2", phone: "+1234567890" }));

    expect(response.status).toBe(200);
  });
});
