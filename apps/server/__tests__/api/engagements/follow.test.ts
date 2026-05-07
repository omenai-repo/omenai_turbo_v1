import { describe, it, expect, vi, beforeEach } from "vitest";
import { buildValidateRequestBodyMock } from "../../helpers/util-mock";

vi.mock("@omenai/shared-lib/auth/middleware/combined_middleware", () => ({
  withRateLimitHighlightAndCsrf: () => (fn: any) => fn,
}));

vi.mock("@omenai/shared-lib/auth/configs/rate_limit_configs", () => ({
  standardRateLimit: {},
  strictRateLimit: {},
}));

vi.mock("@omenai/shared-lib/mongo_connect/mongoConnect", () => ({
  connectMongoDB: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@omenai/shared-models/models/follows/FollowSchema", () => ({
  Follow: { create: vi.fn() },
}));

vi.mock("@omenai/shared-models/models/auth/GallerySchema", () => ({
  AccountGallery: { updateOne: vi.fn() },
}));

vi.mock("@omenai/shared-models/models/auth/ArtistSchema", () => ({
  AccountArtist: { updateOne: vi.fn() },
}));

vi.mock("@omenai/shared-models/models/auth/IndividualSchema", () => ({
  AccountIndividual: { updateOne: vi.fn() },
}));

vi.mock("../../../app/api/util", () => buildValidateRequestBodyMock());

import { POST } from "../../../app/api/engagements/follow/route";
import { Follow } from "@omenai/shared-models/models/follows/FollowSchema";
import { AccountGallery } from "@omenai/shared-models/models/auth/GallerySchema";
import { AccountArtist } from "@omenai/shared-models/models/auth/ArtistSchema";
import { AccountIndividual } from "@omenai/shared-models/models/auth/IndividualSchema";

function makeRequest(body: Record<string, any> = {}): Request {
  return new Request("http://localhost/api/engagements/follow", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/engagements/follow", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(Follow.create).mockResolvedValue({ _id: "follow-1" } as any);
    vi.mocked(AccountGallery.updateOne).mockResolvedValue({} as any);
    vi.mocked(AccountArtist.updateOne).mockResolvedValue({} as any);
    vi.mocked(AccountIndividual.updateOne).mockResolvedValue({} as any);
  });

  it("returns 200 with success message on gallery follow", async () => {
    const response = await POST(
      makeRequest({ followerId: "user-1", followingId: "gallery-1", followingType: "gallery" }),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.message).toBe("Followed successfully");
  });

  it("returns 200 with success message on artist follow", async () => {
    const response = await POST(
      makeRequest({ followerId: "user-1", followingId: "artist-1", followingType: "artist" }),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
  });

  it("calls Follow.create with correct args", async () => {
    await POST(makeRequest({ followerId: "user-1", followingId: "gallery-1", followingType: "gallery" }));

    expect(Follow.create).toHaveBeenCalledWith({
      follower: "user-1",
      followingId: "gallery-1",
      followingType: "gallery",
    });
  });

  it("updates AccountGallery followerCount when followingType is gallery", async () => {
    await POST(makeRequest({ followerId: "user-1", followingId: "gallery-1", followingType: "gallery" }));

    expect(AccountGallery.updateOne).toHaveBeenCalledWith(
      { gallery_id: "gallery-1" },
      { $inc: { followerCount: 1 } },
    );
    expect(AccountArtist.updateOne).not.toHaveBeenCalled();
  });

  it("updates AccountArtist followerCount when followingType is artist", async () => {
    await POST(makeRequest({ followerId: "user-1", followingId: "artist-1", followingType: "artist" }));

    expect(AccountArtist.updateOne).toHaveBeenCalledWith(
      { artist_id: "artist-1" },
      { $inc: { followerCount: 1 } },
    );
    expect(AccountGallery.updateOne).not.toHaveBeenCalled();
  });

  it("always updates AccountIndividual followingCount", async () => {
    await POST(makeRequest({ followerId: "user-1", followingId: "gallery-1", followingType: "gallery" }));

    expect(AccountIndividual.updateOne).toHaveBeenCalledWith(
      { user_id: "user-1" },
      { $inc: { followingCount: 1 } },
    );
  });

  it("returns 400 when already following (error code 11000)", async () => {
    vi.mocked(Follow.create).mockRejectedValue(
      Object.assign(new Error("duplicate key"), { code: 11000 }),
    );

    const response = await POST(
      makeRequest({ followerId: "user-1", followingId: "gallery-1", followingType: "gallery" }),
    );
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toBe("Already following");
  });

  it("returns 500 when Follow.create throws a non-duplicate error", async () => {
    vi.mocked(Follow.create).mockRejectedValue(new Error("DB connection failed"));

    const response = await POST(
      makeRequest({ followerId: "user-1", followingId: "gallery-1", followingType: "gallery" }),
    );

    expect(response.status).toBe(500);
  });

  it("returns 500 when required fields are missing", async () => {
    const response = await POST(makeRequest({ followerId: "user-1" }));

    expect(response.status).toBe(500);
  });
});
