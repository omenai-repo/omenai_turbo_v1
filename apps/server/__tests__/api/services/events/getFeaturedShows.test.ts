import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@omenai/shared-models/models/events/GalleryEventSchema", () => ({
  GalleryEvent: { aggregate: vi.fn() },
}));

import { getFeaturedShowsCarousel } from "../../../../app/api/services/events/getFeaturedShows.service";
import { GalleryEvent } from "@omenai/shared-models/models/events/GalleryEventSchema";

const mockShows = [
  { event_id: "evt-1", title: "Carousel Show", cover_image: "img.jpg", "gallery.name": "Omenai Gallery" },
];

describe("getFeaturedShowsCarousel", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(GalleryEvent.aggregate).mockResolvedValue(mockShows);
  });

  it("returns isOk:true with shows on success", async () => {
    const result = await getFeaturedShowsCarousel();

    expect(result.isOk).toBe(true);
    expect(result.data).toEqual(mockShows);
  });

  it("runs aggregate with $limit 10", async () => {
    await getFeaturedShowsCarousel();

    const pipeline = vi.mocked(GalleryEvent.aggregate).mock.calls[0][0];
    expect(pipeline).toContainEqual({ $limit: 10 });
  });

  it("filters only published, non-archived exhibitions", async () => {
    await getFeaturedShowsCarousel();

    const pipeline = vi.mocked(GalleryEvent.aggregate).mock.calls[0][0];
    expect(pipeline).toContainEqual({
      $match: { is_published: true, is_archived: false, event_type: "exhibition" },
    });
  });

  it("returns isOk:false with empty data when aggregate throws", async () => {
    vi.mocked(GalleryEvent.aggregate).mockRejectedValue(new Error("Agg error"));

    const result = await getFeaturedShowsCarousel();

    expect(result.isOk).toBe(false);
    expect(result.data).toEqual([]);
  });
});
