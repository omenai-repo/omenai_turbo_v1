import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@omenai/shared-models/models/auth/GallerySchema", () => ({
  AccountGallery: { findOne: vi.fn() },
}));

vi.mock("../../../../../custom/errors/handler/errorHandler", () => ({
  handleErrorEdgeCases: vi.fn().mockReturnValue({ message: "Handled error" }),
}));

import { getGalleryProfile } from "../../../../../app/api/services/gallery/partners/getGalleryProfile.service";
import { AccountGallery } from "@omenai/shared-models/models/auth/GallerySchema";

const mockGallery = {
  gallery_id: "gallery-1",
  name: "Omenai Gallery",
  logo: "logo.png",
  address: { street: "1 Art Lane", city: "Lagos" },
  followerCount: 200,
};

describe("getGalleryProfile", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(AccountGallery.findOne).mockReturnValue({
      lean: vi.fn().mockResolvedValue(mockGallery),
    } as any);
  });

  it("returns isOk:true with gallery data on success", async () => {
    const result = await getGalleryProfile("gallery-1");

    expect(result.isOk).toBe(true);
    expect(result.data).toEqual(mockGallery);
  });

  it("queries gallery with only the required fields", async () => {
    await getGalleryProfile("gallery-1");

    expect(AccountGallery.findOne).toHaveBeenCalledWith(
      { gallery_id: "gallery-1" },
      "gallery_id name logo address followerCount",
    );
  });

  it("returns isOk:false when gallery is not found", async () => {
    vi.mocked(AccountGallery.findOne).mockReturnValue({
      lean: vi.fn().mockResolvedValue(null),
    } as any);

    const result = await getGalleryProfile("gallery-1");

    expect(result.isOk).toBe(false);
    expect(result.message).toBe("Gallery not found");
  });

  it("returns isOk:false when findOne throws", async () => {
    vi.mocked(AccountGallery.findOne).mockReturnValue({
      lean: vi.fn().mockRejectedValue(new Error("DB error")),
    } as any);

    const result = await getGalleryProfile("gallery-1");

    expect(result.isOk).toBe(false);
    expect(result.message).toBeDefined();
  });
});
