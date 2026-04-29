import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@omenai/shared-models/models/events/GalleryEventSchema", () => ({
  GalleryEvent: { aggregate: vi.fn() },
}));

import { getAllShowsService } from "../../../../app/api/services/events/getAllShows.service";
import { GalleryEvent } from "@omenai/shared-models/models/events/GalleryEventSchema";

const mockShows = [
  { event_id: "evt-1", title: "Show One", event_type: "exhibition", cover_image: "img.jpg" },
  { event_id: "evt-2", title: "Show Two", event_type: "exhibition", cover_image: "img2.jpg" },
];

describe("getAllShowsService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(GalleryEvent.aggregate).mockResolvedValue(mockShows);
  });

  it("returns isOk:true with shows on success", async () => {
    const result = await getAllShowsService();

    expect(result.isOk).toBe(true);
    expect(result.data).toEqual(mockShows);
  });

  it("runs aggregate with correct match for exhibitions", async () => {
    await getAllShowsService();

    expect(GalleryEvent.aggregate).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          $match: { is_published: true, is_archived: false, event_type: "exhibition" },
        }),
      ]),
    );
  });

  it("returns empty data array when no shows exist", async () => {
    vi.mocked(GalleryEvent.aggregate).mockResolvedValue([]);

    const result = await getAllShowsService();

    expect(result.isOk).toBe(true);
    expect(result.data).toEqual([]);
  });

  it("returns isOk:false when aggregate throws", async () => {
    vi.mocked(GalleryEvent.aggregate).mockRejectedValue(new Error("DB error"));

    const result = await getAllShowsService();

    expect(result.isOk).toBe(false);
    expect(result.data).toEqual([]);
    expect(result.message).toBe("Failed to fetch shows.");
  });
});
