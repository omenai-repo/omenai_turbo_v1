import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@omenai/shared-models/models/events/GalleryEventSchema", () => ({
  GalleryEvent: { findOneAndUpdate: vi.fn() },
}));

vi.mock("uuid", () => ({
  v4: vi.fn().mockReturnValue("mock-uuid-abc123"),
}));

import { manageVipToken } from "../../../../../app/api/services/gallery/events/manageVipToken.service";
import { GalleryEvent } from "@omenai/shared-models/models/events/GalleryEventSchema";

const mockEvent = { event_id: "evt-001", gallery_id: "gallery-1", vip_access_token: "mock-uuid-abc123" };

describe("manageVipToken", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(GalleryEvent.findOneAndUpdate).mockResolvedValue(mockEvent as any);
  });

  describe("generate action", () => {
    it("returns isOk:true with generated token", async () => {
      const result = await manageVipToken("evt-001", "gallery-1", "generate");

      expect(result.isOk).toBe(true);
      expect(result.token).toBe("mock-uuid-abc123");
      expect(result.message).toBe("VIP link generated.");
    });

    it("sets vip_access_token to a uuid", async () => {
      await manageVipToken("evt-001", "gallery-1", "generate");

      expect(GalleryEvent.findOneAndUpdate).toHaveBeenCalledWith(
        { event_id: "evt-001", gallery_id: "gallery-1" },
        { $set: { vip_access_token: "mock-uuid-abc123" } },
        { new: true },
      );
    });
  });

  describe("revoke action", () => {
    it("returns isOk:true with null token on revoke", async () => {
      const result = await manageVipToken("evt-001", "gallery-1", "revoke");

      expect(result.isOk).toBe(true);
      expect(result.token).toBeNull();
      expect(result.message).toBe("VIP link revoked.");
    });

    it("sets vip_access_token to null", async () => {
      await manageVipToken("evt-001", "gallery-1", "revoke");

      expect(GalleryEvent.findOneAndUpdate).toHaveBeenCalledWith(
        { event_id: "evt-001", gallery_id: "gallery-1" },
        { $set: { vip_access_token: null } },
        { new: true },
      );
    });
  });

  it("returns isOk:false when event is not found", async () => {
    vi.mocked(GalleryEvent.findOneAndUpdate).mockResolvedValue(null);

    const result = await manageVipToken("evt-001", "gallery-1", "generate");

    expect(result.isOk).toBe(false);
    expect(result.message).toBe("Event not found.");
  });

  it("returns isOk:false when findOneAndUpdate throws", async () => {
    vi.mocked(GalleryEvent.findOneAndUpdate).mockRejectedValue(new Error("DB error"));

    const result = await manageVipToken("evt-001", "gallery-1", "generate");

    expect(result.isOk).toBe(false);
    expect(result.message).toBe("Internal server error.");
  });
});
