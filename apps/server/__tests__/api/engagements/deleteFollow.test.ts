import { describe, it, expect, vi, beforeEach } from "vitest";
import { buildValidateRequestBodyMock } from "../../helpers/util-mock";

vi.mock("@omenai/shared-lib/auth/configs/rate_limit_configs", () => ({
  standardRateLimit: {},
}));

vi.mock("@omenai/shared-models/models/follows/FollowSchema", () => ({
  Follow: { deleteOne: vi.fn() },
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

import { DELETE } from "../../../app/api/engagements/deleteFollow/route";
import { Follow } from "@omenai/shared-models/models/follows/FollowSchema";
import { AccountGallery } from "@omenai/shared-models/models/auth/GallerySchema";
import { AccountArtist } from "@omenai/shared-models/models/auth/ArtistSchema";
import { AccountIndividual } from "@omenai/shared-models/models/auth/IndividualSchema";

function makeRequest(body: Record<string, any> = {}): Request {
  return new Request("http://localhost/api/engagements/deleteFollow", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

const galleryPayload = { followerId: "user-1", followingId: "gallery-1", followingType: "gallery" };
const artistPayload = { followerId: "user-1", followingId: "artist-1", followingType: "artist" };

describe("DELETE /api/engagements/deleteFollow", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(Follow.deleteOne).mockResolvedValue({ deletedCount: 1 } as any);
    vi.mocked(AccountGallery.updateOne).mockResolvedValue({} as any);
    vi.mocked(AccountArtist.updateOne).mockResolvedValue({} as any);
    vi.mocked(AccountIndividual.updateOne).mockResolvedValue({} as any);
  });

  it("returns 200 with success message on gallery unfollow", async () => {
    const response = await DELETE(makeRequest(galleryPayload) as any);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.message).toBe("Unfollowed successfully");
  });

  it("returns 200 with success message on artist unfollow", async () => {
    const response = await DELETE(makeRequest(artistPayload) as any);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
  });

  it("calls Follow.deleteOne with correct args", async () => {
    await DELETE(makeRequest(galleryPayload) as any);

    expect(Follow.deleteOne).toHaveBeenCalledWith({
      follower: "user-1",
      followingId: "gallery-1",
      followingType: "gallery",
    });
  });

  it("decrements AccountGallery followerCount when followingType is gallery", async () => {
    await DELETE(makeRequest(galleryPayload) as any);

    expect(AccountGallery.updateOne).toHaveBeenCalledWith(
      { gallery_id: "gallery-1" },
      { $inc: { followerCount: -1 } },
    );
    expect(AccountArtist.updateOne).not.toHaveBeenCalled();
  });

  it("decrements AccountArtist followerCount when followingType is artist", async () => {
    await DELETE(makeRequest(artistPayload) as any);

    expect(AccountArtist.updateOne).toHaveBeenCalledWith(
      { artist_id: "artist-1" },
      { $inc: { followerCount: -1 } },
    );
    expect(AccountGallery.updateOne).not.toHaveBeenCalled();
  });

  it("always decrements AccountIndividual followingCount", async () => {
    await DELETE(makeRequest(galleryPayload) as any);

    expect(AccountIndividual.updateOne).toHaveBeenCalledWith(
      { user_id: "user-1" },
      { $inc: { followingCount: -1 } },
    );
  });

  it("returns 404 when deleteOne returns null (not currently following)", async () => {
    vi.mocked(Follow.deleteOne).mockResolvedValue(null as any);

    const response = await DELETE(makeRequest(galleryPayload) as any);
    const body = await response.json();

    expect(response.status).toBe(404);
    expect(body.error).toBe("Not currently following");
  });

  it("returns 500 when Follow.deleteOne throws", async () => {
    vi.mocked(Follow.deleteOne).mockRejectedValue(new Error("DB error"));

    const response = await DELETE(makeRequest(galleryPayload) as any);

    expect(response.status).toBe(500);
  });

  it("returns 500 when required fields are missing", async () => {
    const response = await DELETE(makeRequest({ followerId: "user-1" }) as any);

    expect(response.status).toBe(500);
  });
});
