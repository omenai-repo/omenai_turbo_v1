import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@omenai/shared-models/models/events/GalleryEventSchema", () => ({
  GalleryEvent: { aggregate: vi.fn() },
}));

vi.mock("@omenai/upstash-config", () => ({
  redis: { get: vi.fn() },
}));

import { getIndividualShowService } from "../../../../app/api/services/events/getIndividualShowDetails.service";
import { GalleryEvent } from "@omenai/shared-models/models/events/GalleryEventSchema";
import { redis } from "@omenai/upstash-config";

const mockShow = {
  event_id: "show-001",
  title: "Emergence",
  event_type: "exhibition",
  gallery_id: "gallery-1",
  featured_artworks: ["art-1", "art-2"],
  gallery_data: { name: "Omenai Gallery", logo: "logo.png" },
};

const mockArtwork = { art_id: "art-1", title: "Piece One" };

describe("getIndividualShowService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(GalleryEvent.aggregate).mockResolvedValue([mockShow]);
    vi.mocked(redis.get).mockResolvedValue(mockArtwork as any);
  });

  it("returns isOk:true with show data and artworks on success", async () => {
    const result = await getIndividualShowService("show-001");

    expect(result.isOk).toBe(true);
    expect(result.data?.artworks).toBeDefined();
  });

  it("fetches each featured artwork from Redis", async () => {
    await getIndividualShowService("show-001");

    expect(redis.get).toHaveBeenCalledWith("artwork:art-1");
    expect(redis.get).toHaveBeenCalledWith("artwork:art-2");
  });

  it("removes gallery_data and adds gallery object to payload", async () => {
    const result = await getIndividualShowService("show-001");

    expect(result.data?.gallery).toEqual({ name: "Omenai Gallery", logo: "logo.png" });
    expect(result.data?.gallery_data).toBeUndefined();
  });

  it("filters null artworks (Redis cache misses)", async () => {
    vi.mocked(redis.get)
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(mockArtwork as any);

    const result = await getIndividualShowService("show-001");

    expect(result.data?.artworks).toHaveLength(1);
  });

  it("parses string artworks stored in Redis", async () => {
    vi.mocked(redis.get).mockResolvedValue(JSON.stringify(mockArtwork) as any);

    const result = await getIndividualShowService("show-001");

    expect(result.data?.artworks[0]).toMatchObject(mockArtwork);
  });

  it("returns isOk:false when show is not found", async () => {
    vi.mocked(GalleryEvent.aggregate).mockResolvedValue([]);

    const result = await getIndividualShowService("unknown-id");

    expect(result.isOk).toBe(false);
    expect(result.message).toBe("Show not found.");
  });

  it("returns isOk:false when aggregate throws", async () => {
    vi.mocked(GalleryEvent.aggregate).mockRejectedValue(new Error("DB error"));

    const result = await getIndividualShowService("show-001");

    expect(result.isOk).toBe(false);
    expect(result.message).toBe("Internal server error.");
  });
});
